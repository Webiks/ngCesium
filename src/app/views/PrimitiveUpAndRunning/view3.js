'use strict';

angular.module('myApp.view3', ['ui.router'])

    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('index.PrimitiveUpAndRunning', {
            url: '/Primitive-up-and-running',
            data: {
                title: 'Primitive up and running'
            },
            views: {
                "": {
                    templateUrl: 'app/views/PrimitiveUpAndRunning/view3.html'
                },
                "mapView@index.PrimitiveUpAndRunning": {
                    templateUrl: 'app/views/PrimitiveUpAndRunning/view3.mapView.html',
                    controller: 'view3MapCtrl as mapViewCtrl'
                },
                "dataView@index.PrimitiveUpAndRunning": {
                    template: 'Test'
                }
            }
        })
    }])

    .controller('view3MapCtrl', ['$scope', 'shapesService', function ($scope, shapesService) {
    var vm = this;
    var viewer;
    var scene;
    var billboardCollection;
    var labelCollection;
    var handler;
    var count = 0;
    var billboardCount =0;
    var LabelsCount =0;
    var listPrimitives = [];
    var listBillboards = [];
    var listLabels = [];
    var n = 500;
    this.cesiumConfig = {};
    var watchForCesiumInst = $scope.$watch('mapViewCtrl.cesiumConfig.cesiumInstance', function (instance) {

        if (angular.isUndefined(instance)) {
            return;
        }

        vm.addMapData(n);

        watchForCesiumInst();

    });

    function getRandomShape(primitivesParams) {
        return shapesService.getRandomShape(primitivesParams);
    }

    this.addPrimitives = function addPrimitive() {


        var primitivesParams = {
            id: count++,
            //modelMatrix: getRandomModelMatrix(),
            attributes: {
                color: getRandomColor()
            }
        };
        var shape = getRandomShape(primitivesParams);

        var instance = new Cesium.GeometryInstance(primitivesParams);

        listPrimitives.push(scene.primitives.add(new Cesium.Primitive({
            geometryInstances: instance,
            appearance: new Cesium.PerInstanceColorAppearance({

                flat: true,

                renderState: {

                    lineWidth: Math.min(2.0, scene.maximumAliasedLineWidth)

                }

            })
        })));

    }

        this.addBillboards = function addBillboards() {
        listBillboards.push(
            billboardCollection.add({
                id:billboardCount++,
                image: getRandomBillboard(),
                position: Cesium.Cartesian3.fromDegrees(Math.random()*-75.59777,Math.random()*40.03883)
            }));
        scene.primitives.add(billboardCollection)
    };

    this.addLabels = function addLabels(){
        labelCollection.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(Math.random() *-750.59777, Math.random() *400.03883));
        listLabels.push(labelCollection.add({
            id: LabelsCount++,
            position : new Cesium.Cartesian3(Math.random()*-75.59777, Math.random() *10000.0,Math.random()*640.03883),
            text     : getRandomText()
        }));

        scene.primitives.add(labelCollection);
    }

    function getRandomText(){
        var text =["aaaaa", 'bbbbb', 'ccccc', 'ddddd', 'eeeee'];
        var newText =text[Math.floor(Math.random()* text.length)]
        return newText;
    }

    function getRandomBillboard() {
        var image = ["../app/image/world91.png", '../app/image/pin56.png', '../app/image/home4.png', '../app/image/wifi74.png', '../app/image/heart13.png'];
        var newImage = image[Math.floor(Math.random() * image.length)]
        return newImage;
    }

    function getRandomModelMatrix() {
        var x =
            Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
                Cesium.Cartesian3.fromDegrees(Math.random() * -75.59777, Math.random() * 40.03883)),
                new Cesium.Cartesian3(Math.random() * 0.0, Math.random() * 0.0, Math.random() * 1000000.0), new Cesium.Matrix4())
        return x;
    }

    function getRandomColor() {
        var color = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromRandom({alpha: 1.0}));
        return color;
    }

    this.addMapData = function (n) {
        viewer = vm.cesiumConfig.cesiumInstance._viewer;
        scene = viewer.scene;
        billboardCollection = new Cesium.BillboardCollection();
        labelCollection = new Cesium.LabelCollection();

        // var shapes = shapesService;

        for (var i = 0; i < n; i++) {
            this.addPrimitives();
            this.addBillboards();
            this.addLabels();
        }

        var change = 0;
        handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
        handler.setInputAction(function (click) {
            var pickedObject = scene.pick(click.position);
            if (Cesium.defined(pickedObject)) {
                var z = listPrimitives[pickedObject.id].getGeometryInstanceAttributes(pickedObject.id);
                z.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.YELLOW);
                listBillboards[pickedObject.id].scale =4.0;
                listLabels[pickedObject.id].fillColor =Cesium.Color.YELLOW;
                if (pickedObject.id != change) {
                    var z = listPrimitives[change].getGeometryInstanceAttributes(change);
                    z.color = Cesium.ColorGeometryInstanceAttribute.toValue(Cesium.Color.fromRandom({alpha: 1.0}));
                    listBillboards[change].scale =1.0;
                    listLabels[change].fillColor =Cesium.Color.WHITE;
                    change = pickedObject.id;
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    }


}]).factory('shapesService', function () {

    var positions = {

        polygonOutline: function polygonOutline() {

            var polygon = Cesium.Cartesian3.fromDegreesArray([

                Math.random() * -95, 37.0,

                Math.random() * -95, 32.0,

                Math.random() * -90, 33.0,

                Math.random() * -87, 31.0,

                Math.random() * -87, 35.0

            ]);

            return polygon;

        },

        polygonHierarchy: function polygonHierarchy() {

            var hierarchy = {

                positions: Cesium.Cartesian3.fromDegreesArray([

                    Math.random() * -108.0, 30.0,

                    Math.random() * -98.0, 30.0,

                    Math.random() * -98.0, 40.0,

                    Math.random() * -108.0, 40.0

                ]),

                holes: [{

                    positions: Cesium.Cartesian3.fromDegreesArray([

                        Math.random() * -106.0, 31.0,

                        Math.random() * -106.0, 39.0,

                        Math.random() * -100.0, 39.0,

                        Math.random() * -100.0, 31.0

                    ])

                }]

            };

            return hierarchy;

        },

        polygonHeights: function polygonHeights() {

            var positions = Cesium.Cartesian3.fromDegreesArrayHeights([

                -95, 44.0, Math.random() * 400000,

                -95, 39.0, Math.random() * 100000,

                Math.random() * -87, 42.0, Math.random() * 100000

            ]);

            return positions;

        }

    };

    var geometries = [
        {
        geometry: function geometry() {
            var box = Cesium.BoxGeometry.fromDimensions({
                vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
                dimensions: new Cesium.Cartesian3(1000000.0, 1000000.0, 500000.0)
            });
            return box;
        }
    }, {
        geometry: function geometry() {
            // create the shape’s params and return them
            var Ellipsoid = new Cesium.EllipsoidGeometry({
                radii: new Cesium.Cartesian3(500000.0, 500000.0, 1000000.0),
                vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
            });
            return Ellipsoid;
        }
    },{
        geometry: function geometry() {

            var polygonOutline = Cesium.PolygonOutlineGeometry.fromPositions({

                positions: positions.polygonOutline()

            });

            return polygonOutline;

        }

    }, {

        geometry: function geometry() {

            var hierarchy = new Cesium.PolygonOutlineGeometry({

                polygonHierarchy: positions.polygonHierarchy(),

                extrudedHeight: 500000.0

            });

            return hierarchy;

        }

    }, {

        geometry: function geometry() {

            var height = Cesium.PolygonOutlineGeometry.fromPositions({

                positions: positions.polygonHeights(),

                perPositionHeight: true

            });

            return height;

        }
    }];


    function randomShape(primitivesParams) {
        var obj = Object.keys(geometries);
        var newShapes = obj[Math.floor(Math.random() * obj.length)];
        primitivesParams['geometry'] = geometries[newShapes].geometry();
        return primitivesParams['geometry'];
    }

    var shapesService = {
        getRandomShape: function getRandomShape(primitivesParams) {
            return randomShape(primitivesParams);
        }
    };

    return shapesService;

});
