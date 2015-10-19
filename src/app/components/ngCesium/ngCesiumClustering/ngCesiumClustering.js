// define the ngCesiumFilter module (dependant on ngCesium)
angular.module('ngCesiumClustering', ['ngCesium'])
/**
 * @name cesiumClustering
 * @attrs cesiumClustering -> holds the groups definitions:
 * {
     *      defaultRadius: {float}, //radius in either pixels or km -> default is 100
     *      defaultRadiusType: {str}, //'pixels' or 'km' -> default is pixels
     *      dataSource: {*}, // can be either {int} (index of ds) or {string} (name of ds). if empty, uses the viewer's entities
     *      groups: [
     *          {
     *             radius: {float}, // clustering radius of the group, in pixels (TODO::allow for meters)
     *             radiusType: {string}, //'pixels' or 'km' -> default is defaultRadiusType
     *             name: {string}, // group name
     *             color: {string},// group color (if none given, would be taken from cesiumClusteringConstants.colors)
     *             property: {*} // an entity's property to group by TODO::enable as a function for flexibility
     *          }
     *      ]
     * }
 */
    .directive('cesiumClustering', ['cesiumClusteringFactory', function (cesiumClusteringFactory) {
        return {
            restrict: 'A',
            require: 'cesium',
            link: function (scope, element, attrs, ctrl) {

                var options = scope.$eval(attrs.cesiumClustering);

                ctrl.cesiumClusteringInstance = new cesiumClusteringFactory(ctrl.cesiumDirective.cesiumInstance, options);
            }
        };
    }])
    .factory('cesiumClusteringFactory', ['$rootScope', 'cesiumClusteringConstants', 'cesiumClusteringGroup', 'cesiumService',
        function ($rootScope, cesiumClusteringConstants, cesiumClusteringGroup, cesiumService) {
            // constructor
            function cesiumClusteringFactory(ngCesiumInstance, config) {
                var that = this;
                that.groups = [];
                that.ngCesiumInstance = ngCesiumInstance;
                ngCesiumInstance.cesiumClustering = that;
                that.refreshConfig(config);

                // set event listener
                var camera = that.ngCesiumInstance._viewer.camera;

                function cameraListener(){
                    that.cluster();
                }

                //add EventListener to the zoomIn and zommOut events: clear and cluster the entities
                that.cameraEndListener = camera.moveEnd.addEventListener(cameraListener);
            }

            cesiumClusteringFactory.prototype = {
                /**
                 * @name cluster
                 * @description iterates over the groups and runs the cluster function for each group
                 */
                removeAllEntities: function removeAllEntities(group){
                    group.dataSource.entities.removeAll();
                },
                resetVisibility: function resetVisibility(group){
                    for (var j = 0; j < group.members.length; j++){
                        group.members[j].show = true;
                    }
                },
                cluster: function cluster() {
                    var that = this;
                    var j;
                    for (var i = 0; i < that.groups.length; i++) {
                        // clear group dataSource
                        that.removeAllEntities(that.groups[i]);

                        that.resetVisibility(that.groups[i]);

                        // now cluster the group anew
                        that.clusterGroup(that.groups[i]);
                    }
                },
                /**
                 * @name clusterGroup
                 * @param groupData
                 * @description cluster the entities in each group
                 */
                clusterGroup: function clusterGroup(groupData) {
                    var that = this;

                    var entities = groupData.members; // get the entities of the group

                    for (var i = 0; i < entities.length; i++) {
                        // for every entity, try to add into a cluster.
                        if (!that.addToCluster(entities[i], groupData)) {
                            //If does not belong to any cluster, create a new one from the entity
                            that.createCluster(entities[i], groupData);
                        }
                    }
                },
                /**
                 * @name addToCluster
                 * @param entity
                 * @param groupData
                 * @description gets an entity and checks if it fits into the cluster. If not, it returns false. If true, it adds it to the cluster by adding it to the polygon and to the list of entities in the cluster
                 */
                addToCluster: function addToCluster(entity, groupData) {
                    var that = this;
                    var clusters = groupData.clusters;
                    // for each cluster
                    for (var i = 0; i < clusters.length; i++) {
                        // check if the entity is in the radius of the cluster
                        // TODO::add a time constraint - add to cluster only if it is shown/fits the time filter
                        // TODO::add the cluster's entity
                        if (that.isInRadius(that.getRadius(groupData), clusters[i].centerEntity, entity)) {
                            // add it to the polygon array
                            that.addPointToPolygoneArr(clusters[i].clusterArr, entity);
                            // add to the cluster's entities' list
                            clusters[i].entities.push(entity);

                            // set the entities to show false
                            clusters[i].centerEntity.show = false;
                            entity.show = false;

                            return true;
                        }
                    }
                    return false;
                },
                /**
                 * @name createCluster
                 * @param entity
                 * @param groupData
                 * @description gets an entity and groupsData and pushes a new cluster with the entity as its center
                 */
                createCluster: function createCluster(entity, groupData) {
                    // clusterArr, centerEntity (should be show = true when created), entities
                    var clusterIndex = groupData.clusters.push({
                        color: groupData.color,
                        clusterArr: [],
                        centerEntity: entity,
                        entities: [entity]
                    }) - 1;

                    groupData.clusters[clusterIndex].clusterEntity = groupData.dataSource.entities.add(this.clusterEntity(groupData.clusters[clusterIndex]));

                    this.addPointToPolygoneArr(groupData.clusters[groupData.clusters.length - 1].clusterArr, entity);
                },
                addPointToPolygoneArr: function addPointToPolygoneArr(arr, point) {
                    var cartographicPosition = this.ngCesiumInstance._viewer.scene.globe.ellipsoid.cartesianToCartographic(point.position.getValue(Cesium.JulianDate.now()));
                    var longitude = Cesium.Math.toDegrees(cartographicPosition.longitude);
                    var latitude = Cesium.Math.toDegrees(cartographicPosition.latitude);

                    var point = {};
                    point.x = longitude;
                    point.y = latitude;

                    arr.push(point);
                    return arr;
                },
                /**
                 * @name clusterEntity
                 * @param cluster
                 * @description gets a cluster, and creates an entity for it. Entity should have a billboard, a polygon and a polyline
                 */
                clusterEntity: function clusterEntity(cluster){
                    function getEntityCenterPosition(cluster){
                        if (angular.isUndefined(cluster.clusterEntity.polyline)){
                            return cluster.centerEntity.position.getValue(Cesium.JulianDate.now());
                        }

                        var center = Cesium.BoundingSphere.fromPoints(cluster.clusterEntity.polyline.positions).center;
                        Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(center, center);

                        return center;
                    }

                    function setClusterBillboardImage(cluster){
                        return cesiumService.svgToImage(cesiumService.replaceTextInSVG(cesiumService.getSVG(svgPath + '/group.svg'),['***', 'red'], [cluster.entities.length, cluster.color]))
                    }

                    var that = this;
                    var svgPath = $('script[src*=ngCesiumClustering]').attr('src').replace(/ngCesiumClustering\.js.*$/, 'assets');;
                    var callbackPropertySetter = that.ngCesiumInstance.setCallbackProperty;
                    return {
                        id: 'cluster_' + cluster.centerEntity.id,
                        position: callbackPropertySetter(getEntityCenterPosition, cluster),
                        billboard: {
                            image: callbackPropertySetter(setClusterBillboardImage, cluster),
                            height: 30,
                            width: 30
                        }
                    }
                },
                /**
                 * @name isInRadius
                 * @param radius
                 * @param entity
                 * @param centerEntity
                 * @description gets a radius, an entity and a center and checks if the entity is within the circle's boundaris
                 * @returns {boolean}
                 */
                isInRadius: function isInRadius(radius, entity, centerEntity) {
                    // get the distance between the entity and the center entity
                    if (angular.isUndefined(entity.position)) {
                        return false;
                    }
                    var distance = Cesium.Cartesian3.distance(entity.position.getValue(Cesium.JulianDate.now()), centerEntity.position.getValue(Cesium.JulianDate.now()));
                    // see if it is less than the radius
                    return (distance < radius );
                },

                // TODO::test and comments
                getRadius: function getRadius(groupData) {
                    if (groupData.radiusType === 'km') {
                        return groupData.radius;
                    }

                    // get width and height of the canvas
                    var width = this.ngCesiumInstance._viewer.canvas.width;
                    var height = this.ngCesiumInstance._viewer.canvas.height;

                    // get a good portion of the center of the canvas (20%)
                    var point1 = this.ngCesiumInstance._viewer.camera.pickEllipsoid(new Cesium.Cartesian2(width * 40 / 100, height / 2));
                    var point2 = this.ngCesiumInstance._viewer.camera.pickEllipsoid(new Cesium.Cartesian2(width * 60 / 100, height / 2));

                    // get the distance between the two points (40% to 60%)
                    var distanceInKilometers = Cesium.Cartesian3.distance(point1, point2);
                    // get km/pixel ratio
                    var distancePerPixel = distanceInKilometers / (width * 20 / 100);
                    // get the radius distance in km
                    var distanceInPixels = distancePerPixel * groupData.radius;
                    return distanceInPixels;
                },

                /**
                 * @name setGroups
                 * @description Creates the groups according to config.
                 * @returns {*} false for error, the groups array for success
                 */
                setGroups: function setGroups() {
                    var that = this;
                    if (angular.isUndefined(that.config)) {
                        return false;
                    }

                    // clear the groups
                    that.groups.length = 0;

                    // create the groups anew from config
                    // if config.groups does not exist, the viewer's entities are one group
                    // TODO::unit test this!
                    if (angular.isUndefined(that.config.groups)) {
                        var newGroup = {
                            radius: that.config.defaultRadius,
                            radiusType: that.config.defaultRadiusType,
                            name: 'Viewer Group', // group name
                            color: cesiumClusteringConstants.groupsColors.pickColor(),
                            property: {
                                name: 'id',
                                value: function(entity){
                                    return entity.id;
                                }
                            }
                        };
                        that.createGroup(newGroup);
                    }
                    else {
                        for (var i = 0; i < that.config.groups.length; i++) {
                            that.createGroup(that.config.groups[i]);
                        }
                    }

                    return that.groups;
                },
                /**
                 * @name createGroup
                 * @param group
                 * @description gets a group config and adds it to the list of groups in the instance
                 */
                createGroup: function createGroup(group) {
                    var that = this;

                    that.groups.push(new cesiumClusteringGroup(group, that.config, that.ngCesiumInstance._viewer.dataSources));
                },
                /**
                 * @name divideIntoGroups
                 * @description Divides the entities in the viewer to the groups
                 */
                divideIntoGroups: function divideIntoGroups() {
                    // now for every entity, set it in a group
                    var that = this;
                    // TODO::allow support for some dataSource sent in config
                    var entities = that.ngCesiumInstance._viewer.entities.values;
                    for (var i = 0; i < entities.length; i++) {
                        that.setInGroup(entities[i]);
                    }
                },
                /**
                 * @name setInGroup
                 * @param entity
                 * @description checks the entity vs. the groups and adds the entity to the group it belongs to (the first found).
                 * if it is indeed in a group, it "show" would be set to false.
                 */
                setInGroup: function setInGroup(entity) {
                    var that = this;
                    var propertyName, propertyValue, currVal;
                    for (var i = 0; i < that.groups.length; i++) {
                        // TODO::complete the "setInGroup" logic
                        propertyName = angular.isFunction(that.groups[i].property.name) ? that.groups[i].property.name(entity) : that.groups[i].property.name;
                        propertyValue = angular.isFunction(that.groups[i].property.value) ? that.groups[i].property.value(entity) : that.groups[i].property.value;

                        // get the property
                        currVal = $rootScope.$eval(propertyName, entity);

                        // make sure we have the property's value
                        if (angular.isDefined(currVal.getValue)){
                            currVal = currVal.getValue();
                        }

                        if (currVal === propertyValue) {
                            that.groups[i].members.push(entity);
                            entity.show = false;
                            return i;
                        }
                    }
                    return -1;
                },
                /**
                 * @name setConfig
                 * @param config
                 * @description sets the config to a new config. Doesn't update the view immediately. In order to do that use "refreshConfig"
                 */
                setConfig: function setConfig(config) {
                    // TODO::config validations
                    var that = this;

                    if (angular.isUndefined(config)){
                        config = {
                            defaultRadius: 100
                        }
                    }

                    // validate default values TODO::unit test this!
                    if (angular.isUndefined(config.defaultRadius) || !Number(config.defaultRadius)){
                        config.defaultRadius = 100;
                    }

                    if (angular.isUndefined(config.defaultRadiusType) || ( config.defaultRadiusType != 'pixels' && config.defaultRadiusType != 'km')){
                        config.defaultRadiusType = 'pixels';
                    }

                    that.config = config;
                },
                /**
                 * @name refreshConfig
                 * @param config
                 * @description gets a config object, sets it, parses it (divides into groups etc.) and then reruns the clustering
                 */
                refreshConfig: function refreshConfig(config) {
                    var that = this;
                    that.setConfig(config);

                    // recreate the groups
                    that.setGroups();

                    // divide into the groups
                    that.divideIntoGroups();

                    // cluster anew
                    that.cluster();
                }
            };

            return cesiumClusteringFactory;
        }])

    .constant('cesiumClusteringConstants', {
        /**
         * holds 8 colors for 8 groups. If there are more than 8 groups without colors, colors will be repeated.
         * current holds the current color that is supposed to be chosen for the group
         */
        groupsColors: {
            colorsList: ['#C259C2', '#62B050', '#530C40', '#9E8C48', '#1B4D11', '#563D37', '#84959B', '#C74645', '#2F72BF', '#F6A050'],
            current: 0,
            /**
             *
             * @returns {*}
             */
            pickColor: function () {
                var that = this;

                if (that.current >= that.colorsList.length) {
                    that.current = 0;
                }

                return that.colorsList[that.current++];
            }
        }
    })

    .factory('cesiumClusteringGroup', ['cesiumClusteringConstants',
        function (cesiumClusteringConstants) {
            // constructor
            function cesiumClusteringGroup(group, config, dsCollection) {
                // TODO::validate group config
                var that = this;
                that.color = group.color ? group.color : cesiumClusteringConstants.groupsColors.pickColor(); // group color
                that.name = group.name; // group name
                that.id = Math.random().toString(36).substring(7); //unique id...
                that.dataSource = dsCollection.add(new Cesium.CustomDataSource(that.id));
                that.dataSource.then(function(ds){
                    that.dataSource = ds;
                });
                 // group dataSource
                that.members = []; // entities array
                that.clusters = []; // clusters array
                that.radius = group.radius ? group.radius : config.defaultRadius; // radius
                that.radiusType = group.radiusType ? group.radiusType : config.defaultRadiusType; // radius type (km or pixels)
                that.property = group.property; // property to group by

                return that;
            }


            return cesiumClusteringGroup;
        }]);