module.exports = Login;

Login.$inject = [];
function Login() {
    return {
        restrict: 'E',
        scope: {},
        controller: LoginController,
        template: require('./login.html')
    };
}
LoginController.$inject = [
    '$scope',
    'Authentication',
    'PasswordReset',
    '$location',
    'ConfigEndpoint', 
    'ModalService', // add service "ModalService"
    '$rootScope' // add $rootScope
];
function LoginController(
    $scope,
    Authentication,
    PasswordReset,
    $location,
    ConfigEndpoint,
    ModalService, 
    $rootScope
) {
    $scope.email = '';
    $scope.password = '';
    $scope.failed = false;
    $scope.processing = false;
    $scope.loginSubmit = loginSubmit;
    $scope.cancel = cancel;
    $scope.forgotPassword = forgotPassword;
    $scope.showCancel = false;

//--------------------------------------------//
    $rootScope.userEmail = '';
    $rootScope.userPassword = '';
//--------------------------------------------//

    activate();

    function activate() {
        // If we're already logged in
        if (Authentication.getLoginStatus()) {
            $scope.$parent.closeModal();
        }

        ConfigEndpoint.get({id: 'site'}, function (site) {
            $scope.showCancel = !site.private;
        });
    }

    function clearLoginForm() {
        $scope.failed = true;
        $scope.processing = false;
        $scope.email = '';
        $scope.password = '';
    }

    function cancel() {
        clearLoginForm();
        $scope.$parent.closeModal();
    }

    function finishedLogin() {
        $scope.failed = false;
        $scope.processing = false;

//---------------------------------------------------------//
        //save "email" and "password"
        $rootScope.userEmail = $scope.email; 
        $rootScope.userPassword = $scope.password; 
//---------------------------------------------------------//

        $scope.$parent.closeModal();
    }
    
    // open user profile
    function openProfile() {
        if ($scope.failed == false) {
            ModalService.openTemplate('<account-settings></account-settings>', '', false, false, true, true);
        }
    }

    function loginSubmit(email, password) {
        $scope.processing = true;

        Authentication
            .login(email, password)
            .then(finishedLogin, clearLoginForm)
//--------------------Open User Profile--------------------//
            .then(openProfile);
//---------------------------------------------------------//
    }

    function forgotPassword() {
        PasswordReset.openReset();
    }

}
