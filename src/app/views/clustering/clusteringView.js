'use strict';

angular.module('myApp.clusteringView', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('index.clusteringView', {
            url: 'http://localhost:3000',
            external: true,
            data: {
                title: 'Clustering'
            },
            views: {
                "": {
                    templateUrl: 'app/views/clustering/view.html',
                    controller: 'clusteringViewCtrl as viewCtrl'
                }
            }
        });
    }])

    .controller('clusteringViewCtrl', ['$window', function ($window) {
        $window.open('http://localhost:3000', '_self');
    }]);