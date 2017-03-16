module.exports = [
    '$rootScope',
    'UserEndpoint',
    'ModalService',
function (
    $rootScope,
    UserEndpoint,
    ModalService
) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
        },
        template: require('./account_settings.html'),
        link: function (scope) {
            scope.user = UserEndpoint.getFresh({id: 'me'});

            scope.general = true;
            scope.notifications = false;
            scope.vmsprofile = false;

            scope.showGeneral = function () {
                scope.general = true;
                scope.notifications = false;
                scope.vmsprofile = false;
            };

            scope.showNotifications = function () {
                scope.general = false;
                scope.notifications = true;
                scope.vmsprofile = false;
            };

            scope.showVMSProfile = function () {
                scope.general = false;
                scope.notifications = false;
                scope.vmsprofile = true;
            };

            scope.$on('event:close', function () {
                ModalService.close();
            });
        }
    };
}];
