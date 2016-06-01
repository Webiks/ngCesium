'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    // views
    'ui.router',
    'myApp.view1',
    'myApp.view2',
    'myApp.filterByPolygon',
    'myApp.clusteringView',
    'myApp.view3',

    // modules
    'ngCesium',
    'ngCesiumPolygonDrawer',
    'ngCesiumClustering',
    'ngMaterial'
]).
    config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/home');

        $stateProvider.state('index', {
            url: "/home",
            templateUrl: 'app/views/main.html',
            controller: 'mainCtrl as mainCtrl',
            data: {
                title: 'Home'
            }
        });

    }])

    .controller('mainCtrl', ['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        var vm = this;
        vm.viewName = $state.current.data.title;
        vm.menuItems = $state.get();

        $rootScope.$on('$stateChangeSuccess',
            function (event, toState, toParams, fromState, fromParams) {
                vm.viewName = toState.data.title;
            }
        )


    }])
    .run(function($rootScope, $window) {
        Cesium.BingMapsApi.defaultKey = 'AroazdWsTmTcIx4ZE3SIicDXX00yEp9vuRZyn6pagjyjgS-VdRBfBNAVkvrucbqr';
        $rootScope.$on('$stateChangeStart',
            function (event, toState, toParams, fromState, fromParams) {
                if (toState.external) {
                    event.preventDefault();
                    $window.open(toState.url, '_self');
                }
            });
    });