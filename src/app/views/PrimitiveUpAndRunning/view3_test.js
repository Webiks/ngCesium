'use strict';

describe('myApp.view3 module', function() {

  beforeEach(module('myApp.view3'));

  describe('view3 controller', function(){
    var $controller, $scope, viewCtrl;

    beforeEach(inject(function(_$controller_, _$rootScope_){
      $controller = _$controller_;
      $scope = _$rootScope_;
      viewCtrl = $controller('view3MapCtrl', {$scope: $scope});
    }));

    it('should be defined', function() {
      //spec body
      expect(viewCtrl).toBeDefined();
    });

    describe('addMapDataTests', function(){

      // runs before every "it"
      beforeEach(function(){
        //mock data before each "it"
        viewCtrl.cesiumConfig = {
          cesiumInstance: {
            _viewer: {
              scene: {

              }
            }
          }
        };

        // mock cesium functions we need in the function, but we don't want to test them!
        window.Cesium = {
          BillboardCollection: function(){

          },
          LabelCollection: function(){

          },
          ScreenSpaceEventHandler: function(){
            function screenSpaceEventHandler() {
            }
            screenSpaceEventHandler.setInputAction = function(){

            };

            return screenSpaceEventHandler;
          },
          ScreenSpaceEventType: {
            LEFT_CLICK: 1
          }
        };

        // now spy and mock the methods we don't want to test, but we want to track
        spyOn(viewCtrl, 'addPrimitives').and.callFake(function(){
          return {};
        });

        spyOn(viewCtrl, 'addBillboards').and.callFake(function(){
          return {};
        });

        spyOn(viewCtrl, 'addLabels').and.callFake(function(){
          return {};
        });
      });

      it('should call addPrimitives() n times', function(){
        // set a "n" - number of times addMapData should run
        var n = Math.ceil(Math.random()*100);

        // call addMapDaa
        viewCtrl.addMapData(n);

        // do the actual expectation
        expect(viewCtrl.addPrimitives.calls.count()).toEqual(n);

      });

      it('should call addBillboards() n times', function(){
        // set a "n" - number of times addMapData should run
        var n = Math.ceil(Math.random()*100);

        // call addMapDaa
        viewCtrl.addMapData(n);

        // do the actual expectation
        expect(viewCtrl.addBillboards.calls.count()).toEqual(n);

      });

      it('should call addLabels() n times', function(){
        // set a "n" - number of times addMapData should run
        var n = Math.ceil(Math.random()*100);

        // call addMapDaa
        viewCtrl.addMapData(n);

        // do the actual expectation
        expect(viewCtrl.addLabels.calls.count()).toEqual(n);

      });
    })

  });
});