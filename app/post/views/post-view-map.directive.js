module.exports = [
function (
) {
    var controller = [
        '$scope',
        'PostEndpoint',
        'Maps',
        '_',
        'PostFilters',
        'PostViewService',
    function (
        $scope,
        PostEndpoint,
        Maps,
        _,
        PostFilters,
        PostViewService
    ) {
        $scope.mapReady = false;

        // Set initial map params
        angular.extend($scope, Maps.getInitialScope());
        // Load map params, including config from server (async)
        Maps.getAngularScopeParams().then(function (params) {
            angular.extend($scope, params);
            $scope.mapReady = true;
        });

        // load geojson posts into the map obeying the global filter settings
        var map = Maps.getMap('map');
        var reloadMapPosts = function (query) {
            query = query || PostFilters.getQueryParams($scope.filters);

            $scope.isLoading = true;
            return PostEndpoint.geojson(query).$promise.then(function (posts) {
                map.reloadPosts(posts);
                $scope.isLoading = false;
            });
        };

        // whenever filters change, reload the posts on the map
        $scope.$watch(function () {
            return $scope.filters;
        }, function (newValue, oldValue) {
            if (newValue !== oldValue) {
                reloadMapPosts();
            }
        }, true);

        // Initial load
        reloadMapPosts();

        $scope.$on('$destroy', function () {
            Maps.destroyMap('map');
        });

        // Connect to SocketIO to realtime upate post
        // Ushahidi platform IP and SockIO port 192.168.33.110:2020
        var socket;
        if (!socket) {
            socket = io('http://192.168.33.110:2020');
        }
        socket.on('update post', function(data) {
            // console.log(data);
            if (data.post_id) {
                console.log('Update post id: ' + data.post_id);
                reloadMapPosts();
            }
        });
        socket.on('delete post', function(data) {
            if (data) {
                console.log('Delete post id: ' + data);
                reloadMapPosts();
            }
        });
        
    }];

    return {
        restrict: 'E',
        replace: true,
        scope: {
            filters: '=',
            isLoading: '='
        },
        controller: controller,
        templateUrl: 'templates/posts/views/post-view-map.html'
    };
}];
