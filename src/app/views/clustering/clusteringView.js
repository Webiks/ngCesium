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

    .controller('clusteringViewCtrl', ['$window', function ($window) {

    }]);