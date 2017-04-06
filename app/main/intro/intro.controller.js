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
        $scope.guestcolor = {"color":"blue"};
        $scope.vmsshow = false;
        $scope.vmscolor = {"color":"blue"};
    }

    $scope.expandguest = function() {
        $scope.guestshow = !$scope.guestshow;
        if ($scope.guestshow) {
            $scope.guestcolor = {"color":"black"};
        } else {
            $scope.guestcolor = {"color":"blue"};
        }
    }
    
    $scope.expandvms = function() {
        $scope.vmsshow = !$scope.vmsshow;
        if ($scope.vmsshow) {
            $scope.vmscolor = {"color":"black"};
        } else {
            $scope.vmscolor = {"color":"blue"};
        }
    }
}