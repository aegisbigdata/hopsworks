'use strict';

angular.module('hopsWorksApp')
        .controller('MetadataExtendedCtrl', ['$http', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$timeout', 'ModalService', 'growl',
          function ($http, $uibModal, $scope, $rootScope, $routeParams, $timeout,
                  ModalService, growl) {

            var self = this;
            self.metaData = {};
            self.metadataExtendedDistribution = {
              id: "",
              access_url: "",
              title: "",
              description: "",
              format: "",
              license: "",
              pricing_scheme: "",
              fields: [
                {
                  name: "",
                  number: 0,
                  description: "",
                  type: "",
                  primary: true
                }
              ],
              primary_keys: []
            };

            self.metadataExtendedDataset = {
              id: "",
              title: "",
              contact_point: {
                name: "",
                email: ""
              },
              keywords: [""],
              publisher: {
                homepage: "",
                name: ""
              },
              themes: [""],
              catalog: null
            };

            self.metadataAvailable = false;
            self.showMetadata = {};

            /**
             * Associates a template to a file. It is a template id to file (inodeid)
             * association
             * 
             * @param {type} file
             * @returns {undefined}
             */
            self.attachTemplate = function (file) {
              // this.metadataExtendedDistribution.title = "blabla12345";
              console.log('attachTemplate function called', file);

              // Check if metadata for parent dataset exists
              if (!file.dir) {
                $http({
                  url: 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets/test_amidb', // + $routeParams.datasetName,
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                  }
                }).then(function (result) {
                  // Parent dataset has metadata
                  // Now check if file has already metadata
                  var url = 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets/Testdataset' /* + $routeParams.datasetName */ + '/distributions/' + 'Testfile'

                  $http({
                    url: url,
                    method: 'GET',
                    headers: {
                      'Content-Type': 'application/json;charset=utf-8'
                    }
                  }).then(function (success) {
                    self.metadataExtendedDistribution = success.data;

                    console.log('metadata loaded from server and assigned', self.metadataExtendedDistribution);
                    ModalService.addExtendedMetadata('lg', file);
                  }, function (error) {
                    console.log('errrororr', error);
                  })
                 
                }, function (err) {
                  // Parent dataset has no metadata
                  growl.error("Metadata for distribution can not be added. Parent dataset has no metadata.", {title: 'Info', ttl: 5000});
                });
              } else {
                ModalService.addExtendedMetadata('lg', file);
              }
            };

            self.saveFieldsDistribution = function () {
              this.metadataExtendedDistribution.id = $scope.$resolve.file.id.toString();
              this.metadataExtendedDistribution.access_url = "hdfs://" + $scope.$resolve.file.path;

              //  converts { primary: true } to primary_keys: ["nameOfField"]
              this.metadataExtendedDistribution.primary_keys = [];
              for (var i = this.metadataExtendedDistribution.fields.length - 1; i >= 0; i--) {
                if (this.metadataExtendedDistribution.fields[i].primary) {
                  this.metadataExtendedDistribution.primary_keys.push(this.metadataExtendedDistribution.fields[i].name);
                  delete this.metadataExtendedDistribution.fields[i].primary;
                }
              }

              // check if metadata for parent dataset exists
              $http({
                url: 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets/' + $routeParams.datasetName,
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json;charset=utf-8'
                }
              }).then(function (result) {
                console.log("parent dataset exists, carry on saving fields", result);
                
                $http({
                  url: 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets/' + $routeParams.datasetName + '/distributions',
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                  },
                  data: this.metadataExtendedDistribution
                }).then(function (result) {
                  console.log("successfully saved", result);
                  $scope.$close();
                }, function (err) {
                  console.log("error while saving", err);
                })
              }, function (err) {
                console.log("error while saving", err);
                $scope.$close();
                growl.error("Metadata for distribution could not be added. Parent dataset has no metadata.", {title: 'Info', ttl: 5000});
              });


              console.log('this.metadataExtendedDistribution', this.metadataExtendedDistribution);
            };

            self.saveFieldsDataset = function () {
              this.metadataExtendedDataset.id = $scope.$resolve.file.id.toString();
              this.metadataExtendedDataset.keywords = this.metadataExtendedDataset.keywords.split(',');
              for (var i = this.metadataExtendedDataset.keywords.length - 1; i >= 0; i--) {
                this.metadataExtendedDataset.keywords[i] = this.metadataExtendedDataset.keywords[i].trim();
              }

              console.log('this.metadataExtendedDataset', this.metadataExtendedDataset);

              $http({
                url: 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json;charset=utf-8'
                },
                data: this.metadataExtendedDataset
              }).then(function (result) {
                console.log("successfully saved", result);
                growl.success("Metadata has been saved successfully", {title: 'Success', ttl: 2000});
                $scope.$close();
              }, function (err) {
                console.log("error while saving", err);
              });
            };

            self.close = function () {
              $scope.$dismiss('cancelled');
            };

            var fileSelectedListener = $rootScope.$on('file-selected', function(event, args) {
              self.getMetadata(args);
            });

            $scope.$on('$destroy', function() {
              fileSelectedListener();
            });

            self.getMetadata = function (file) {
              console.log('file', file);
              console.log('projectID', $routeParams.projectID);

              var fileId = 'testtest';

              var url = '';

              if (file.dir) {
                url = 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets/test_amidb'
              } else {
                url = 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets/test_amidb/distributions/' + file.name
              }

              $http({
                url: url,
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json;charset=utf-8'
                }
              }).then(function (result) {
                self.metadataAvailable = true;
                console.log("successfully got metadata", result);
                self.showMetadata = result.data;
              }, function (err) {
                self.showMetadata = false;
                self.metadataAvailable = false;
                growl.error("No metadata available", {title: 'Error', ttl: 2000});
                console.log("error while retrieving metadata", err);
              });
            };
          }
        ]);
