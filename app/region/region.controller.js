module.exports = [
    '$scope',
    'leafletData',
    'Maps',
    function (
        $scope,
        leafletData,
        Maps
    ) {
        angular.extend($scope, Maps.getInitialScope());
        Maps.getAngularScopeParams().then(function (params) {
            angular.extend($scope, params);
            $scope.mapReady = true;
        });
        angular.extend($scope, {
            controls: {
                scale: true,
                draw: {}
            }
        });

        angular.extend($scope.layers, {
            overlays: {
                draw: {
                    name: 'draw',
                    type: 'group',
                    visible: true,
                    layerParams: {
                        showOnSelector: false
                    }
                }
            }
        });

        console.log($scope);

        leafletData.getMap().then(function (map) {
            // console.log("getmap");
            leafletData.getLayers().then(function (baselayers) {
                var drawnItems = baselayers.overlays.draw;
                // console.log("getlayer");
                map.on('draw:created', function (e) {

                    var layer = e.layer;
                    drawnItems.addLayer(layer);
                    console.log(JSON.stringify(layer.toGeoJSON()));
                });
            });
        });

    }
];
