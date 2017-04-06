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
            template: require('./user-profile.html'),
            link: function ($scope) {
                $scope.state = {
                    success: false,
                    processing: false,
                    changingPassword: false,
                    password: '' 
                };
                
//---------------------------------------------------------------//
                $scope.curstate = {
                    attend: false,
                    location: '',
                    email: '',
                    phone: '',
                    vehicle: ''
                };
//---------------------------------------------------------------//

                $scope.saveUser = function (user) {
                    $scope.state.success = false;
                    $scope.state.processing = true;

                    var userPayload = angular.copy(user);

                    // If we're not changing the password, drop that property from payload (just in case.)
                    if ($scope.state.changingPassword) {
                        userPayload.password = $scope.state.password;
                    }

                    var update = UserEndpoint.update({ id: 'me' }, userPayload);

                    update.$promise.then(function (user) {
                        Notify.notify('user_profile.update_success_ies');

                        $scope.state.success = true;
                        $scope.state.processing = false;

                        // Collapse password change form field.
                        $scope.state.changingPassword = false;
                        $scope.state.password = '';

                        $scope.user = user;

                        $scope.$emit('event:close');
                    }, function (errorResponse) { // error
                        Notify.apiErrors(errorResponse);
                        $scope.state.processing = false;
                    });
                };

                $scope.cancel = function () {
                    $scope.$emit('event:close');
                };

                $scope.user = UserEndpoint.getFresh({id: 'me'});

            }
        };
    }];
