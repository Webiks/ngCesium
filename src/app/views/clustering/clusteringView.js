'use strict';

angular.module('myApp.clusteringView', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('index.clusteringView', {
            url: '/clustering',
            data: {
                title: 'Clustering'
            },
            views: {
                "": {
                    templateUrl: 'app/views/clustering/view.html',
                    controller: 'clusteringViewCtrl as viewCtrl'
                },
                "dataView@index.clusteringView": {
                    templateUrl: 'app/views/clustering/dataView.html'
                    // inherits the controller from the parent view... hence, using the same cesium instance
                }
            }
        });
    }])

    .controller('clusteringViewCtrl', [function () {
        function randomGeo(center, radius) {
            var y0 = center.latitude;
            var x0 = center.longitude;
            var rd = radius / 111300;

            var u = Math.random();
            var v = Math.random();

            var w = rd * Math.sqrt(u);
            var t = 2 * Math.PI * v;
            var x = w * Math.cos(t);
            var y = w * Math.sin(t);

            var xp = x / Math.cos(y0);

            return {
                'latitude': y + y0,
                'longitude': xp + x0
            };
        }

        var vm = this;

        var demoCenter = {
            longitude: -98.35,
            latitude: 39.5
        };

        var demoRadius = 500000;
        var assetsPath = $('script[src*=clusteringView]').attr('src').replace(/clusteringView\.js.*$/, 'assets');

        // model
        vm.nGroups = 3;
        vm.nEntitiesPerGroup = 300;
        vm.clusteringRadius = 100;
        vm.submit = function submit() {
            var nGroups = vm.nGroups;
            var nEntitiesPerGroup = vm.nEntitiesPerGroup;
            vm.cesiumConfig.cesiumInstance._viewer.entities.removeAll();
            var groups = [];

            for (var i = 0; i < nGroups; i++) {
                groups.push({});
                groups[i].name = 'Group ' + i;
                groups[i].property = {
                    name: 'description',
                    value: groups[i].name
                };
                for (var j = 0; j < nEntitiesPerGroup; j++) {
                    // create an entity for the group
                    var coordinates = randomGeo(demoCenter, demoRadius);
                    vm.cesiumConfig.cesiumInstance._viewer.entities.add({
                        position: Cesium.Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude),
                        description: groups[i].name,
                        billboard: {
                            image: assetsPath + '/location.svg',
                            height: 24,
                            width: 24
                        }
                    })
                }
            }

            var config = {
                defaultRadius: vm.clusteringRadius,
                groups: groups
            }


            vm.cesiumConfig.cesiumInstance.cesiumClustering.refreshConfig(config);
        }
    }]);