module.exports = IntroController;

IntroController.$inject = ['$scope', '$translate', 'moment', 'Features'];

function IntroController($scope, $translate, moment, Features) {

    activate();

    function activate() {
        // Change mode
        $scope.$emit('event:mode:change', 'intro');
        // Set the page title
        $translate('views.intro').then(function (title) {
            $scope.$emit('setPageTitle', title);
        });

        $scope.guestshow = false;
        $scope.vmsshow = false;
    }
    
}