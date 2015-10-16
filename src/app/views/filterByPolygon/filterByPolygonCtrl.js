'use strict';

angular.module('myApp.filterByPolygon', ['ui.router', 'ngCesiumFilter'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('index.filterByPolygon', {
            url: '/filterByPolygon',
            data: {
                title: 'Filter by polygon'
            },
            views: {
                "": {
                    templateUrl: 'app/views/filterByPolygon/filterByPolygon.html',
                    controller: 'filterByPolygonCtrl as viewCtrl'
                },
                "dataView@index.filterByPolygon": {
                    templateUrl: 'app/views/filterByPolygon/dataView.html'
                    // inherits the controller from the parent view... hence, using the same cesium instance
                }
            }

        });
    }])

    .controller('filterByPolygonCtrl', [function () {

        function filterByPolygon(polygon) {
            function hideIfNotInPolygon(entity, state) {
                entity.show = state;
            }

            vm.cesiumConfig.cesiumInstance.areInsidePolygon('', polygon, hideIfNotInPolygon)
        }

        function resolve(polygon) {
            // stop drawing
            vm.drawing = false;

            //

        }

        function notify(polygon) {
            // get the polygon and
            filterByPolygon(polygon);
        }

        var vm = this;

        vm.cesiumConfig = {
            config: {
                baseLayerPicker: false,
                fullscreenButton: false,
                homeButton: false,
                sceneModePicker: false,
                selectionIndicator: false,
                timeline: false,
                animation: false,
                geocoder: false
            }
        };

        vm.stopDrawing = function () {
            vm.cesiumConfig.cesiumInstance.cesiumPolygonDrawer.stopDrawing();
        };

        vm.draw = function () {
            vm.drawing = true;

            var promise = vm.cesiumConfig.cesiumInstance.cesiumPolygonDrawer.startDrawing();
            promise.then(resolve, null, notify);
        };

        vm.createData = function (n) {
            if (angular.isUndefined(n)) {
                n = 1000;
            }

            var entity;
            for (var i = 0; i < n; i++) {
                var position = [
                    (Math.random() * 9) + 10,
                    (Math.random() * 9) - 1];
                entity = vm.cesiumConfig.cesiumInstance.addEntity({
                    id: _.uniqueId(i.toString() + '_'),
                    position: Cesium.Cartesian3.fromDegrees(position[0], position[1]),
                    billboard: {
                        image: vm.cesiumConfig.cesiumInstance.createPin()
                    }
                });

                entity.originalPosition = position;
            }
        }
    }]);