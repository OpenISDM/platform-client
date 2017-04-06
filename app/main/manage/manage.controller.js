module.exports = IntroController;

IntroController.$inject = ['$scope', '$translate', 'moment', 'Features','$rootScope','$location', '$http'];

function IntroController($scope, $translate, moment, Features, $rootScope, $location, $http) {

	// Redirect to home if not authorized
	if ($rootScope.hasManageSettingsPermission() === false) {
		return $location.path('/');
	}

	activate();

	function activate() {

		// Change mode
		$scope.$emit('event:mode:change', 'manage');
		// Set the page title
		$translate('views.manage').then(function (title) {
			$scope.$emit('setPageTitle', title);
		});

		loadMemberProfile();

	}

	function loadMemberProfile() {

		var credential = {
			"email": $rootScope.userEmail.toString(), 
			"password": $rootScope.userPassword.toString()
		};

		var Req = {
			method: 'POST', 
			url: 'https://vms-dev.herokuapp.com/api/auth', 
			headers: {
				'Content-Type': 'application/json', 
				'X-VMS-API-Key': '581dba93a4dbafa42a682d36b015d8484622f8e3543623bec5a291f67f5ddff1'
			}, 
			data: JSON.stringify(credential)
		};

		var vmshead = null;
		$scope.vmsmembers = [];

		$http(Req).then(
			function(response){
				vmshead = response.headers();

				Req = {
					method: 'GET', 
					url: 'https://vms-dev.herokuapp.com/api/projects/72/members', 
					headers: {
						'Content-Type': 'application/json', 
						'X-VMS-API-Key': '581dba93a4dbafa42a682d36b015d8484622f8e3543623bec5a291f67f5ddff1',
						'Authorization': vmshead.authorization
					}
				};

				$http(Req).then(
					function(response){
						var temp = response.data;
						for (var i = temp.data.length - 1; i >= 0; i--) {
							$scope.vmsmembers[i] = {
								name: '',
								email: ''
							};
							$scope.vmsmembers[i].name = temp.data[i].attributes.first_name + temp.data[i].attributes.last_name;
							$scope.vmsmembers[i].email = temp.data[i].attributes.email;
						}
						console.log($scope.vmsmembers);
					}, 
					function(response){
						console.log('!!! Fail to Call API "/{id}/members" !!!');
					}
				);
			}, 
			function(response){
				console.log('!!! Fail to Call API "/auth" !!!');
			}
		);
	}
	
}