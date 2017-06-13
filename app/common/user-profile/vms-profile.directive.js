module.exports = [
    'UserEndpoint',
    'Notify',
    '_',
    '$translate',
    '$rootScope', // add $rootScope
    '$http', // add $http
    function (
        UserEndpoint,
        Notify,
        _,
        $translate, 
        $rootScope, 
        $http
    ) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: require('./vms-profile.html'),
            link: function ($scope) {
                $scope.state = {
                    success: false,
                    processing: false,
                    changingPassword: false,
                    password: ''
                };

//----------------------------------------------------------------------------------------------------------------------//
                // Load VMS Profile

                var credential = {
                    "email": $rootScope.userEmail.toString(), 
                    "password": $rootScope.userPassword.toString()
                };

                var VMSProfileReq = {
                    method: 'POST', 
                    url: 'https://vms-dev.herokuapp.com/api/auth', 
                    headers: {
                        'Content-Type': 'application/json', 
                        'X-VMS-API-Key': '581dba93a4dbafa42a682d36b015d8484622f8e3543623bec5a291f67f5ddff1'
                    }, 
                    data: JSON.stringify(credential)
                };

                $http(VMSProfileReq).then(
                    function(result){
                        $scope.vmsuser = angular.copy(result.data);
                    }, 
                    function(response){
                        console.log('!!! Fail to Call API "/auth" (in VMS Profile) !!!');
                    }
                );
//----------------------------------------------------------------------------------------------------------------------//
            }
        };
    }];
