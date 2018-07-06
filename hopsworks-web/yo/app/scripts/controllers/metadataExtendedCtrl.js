'use strict';

angular.module('hopsWorksApp')
        .controller('MetadataExtendedCtrl', ['$http', '$uibModal', '$scope', '$rootScope', '$routeParams', 'ModalService', 'ExtendedMetadataService', 'growl',
          function ($http, $uibModal, $scope, $rootScope, $routeParams,
                  ModalService, ExtendedMetadataService, growl) {

            var self = this;

            self.initDistribution = function () {
              return {
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
            };

            self.initDataset = function () {
              return {
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
            };

            self.metaData = {};
            self.metadataExtendedDistribution = self.initDistribution();
            self.metadataExtendedDataset = self.initDataset();

            self.metadataAvailable = false;
            self.metadataDisplay = {};

            /**
             * Associates a template to a file. It is a template id to file (inodeid)
             * association
             * 
             * @param {type} file
             * @returns {undefined}
             */
            self.attachTemplate = function (file) {
              self.metadataExtendedDistribution = self.initDistribution();
              self.metadataExtendedDataset = self.initDataset();


              // Check if metadata for parent dataset exists
              if (!file.dir) {
                ExtendedMetadataService.getDataset($routeParams.datasetName)
                .then(function () {
                  // Parent dataset has metadata
                  // Now check if file has already metadata
                   ExtendedMetadataService.getDistribution($routeParams.datasetName, file.name)
                   .then(function (success) {
                    self.metadataExtendedDistribution = success.data;

                    console.log('existing metadata loaded from server and assigned', self.metadataExtendedDistribution);
                    ModalService.addExtendedMetadata('lg', file);
                  }, function (error) {
                    // File does not have metadata

                    ModalService.addExtendedMetadata('lg', file);
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
              self.metadataExtendedDistribution.id = $scope.$resolve.file.id.toString();
              self.metadataExtendedDistribution.title = $scope.$resolve.file.name;
              self.metadataExtendedDistribution.access_url = "hdfs://" + $scope.$resolve.file.path;

              //  converts { primary: true } to primary_keys: ["nameOfField"]
              self.metadataExtendedDistribution.primary_keys = [];
              for (var i = self.metadataExtendedDistribution.fields.length - 1; i >= 0; i--) {
                if (self.metadataExtendedDistribution.fields[i].primary) {
                  self.metadataExtendedDistribution.primary_keys.push(self.metadataExtendedDistribution.fields[i].name);
                  delete self.metadataExtendedDistribution.fields[i].primary;
                }
              }

              // check if metadata for parent dataset exists
              ExtendedMetadataService.getDataset($routeParams.datasetName)
              .then(function (result) {
                console.log("parent dataset exists, carry on saving fields", result);
                
                ExtendedMetadataService.addDistribution($routeParams.datasetName, self.metadataExtendedDistribution)
                .then(function (result) {
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
            };

            self.saveFieldsDataset = function () {
              self.metadataExtendedDataset.id = $scope.$resolve.file.id.toString();
              self.metadataExtendedDataset.keywords = self.metadataExtendedDataset.keywords.split(',');
              for (var i = self.metadataExtendedDataset.keywords.length - 1; i >= 0; i--) {
                self.metadataExtendedDataset.keywords[i] = self.metadataExtendedDataset.keywords[i].trim();
              }

              ExtendedMetadataService.addDataset(self.metadataExtendedDataset)
              .then(function (result) {
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
              /* $routeParams.projectID */

              if (file.dir) {
                ExtendedMetadataService.getDataset($routeParams.datasetName)
                .then(function (result) {
                  self.showMetadata(result.data);
                }, function (err) {
                  self.metadataDisplay = false;
                  self.metadataAvailable = false;
                  growl.error("No extended metadata available", {title: 'Error', ttl: 2000});
                });
              } else {
                ExtendedMetadataService.getDistribution($routeParams.datasetName, file.name)
                .then(function (result) {
                  self.showMetadata(result.data);
                }, function (err) {
                  self.metadataDisplay = false;
                  self.metadataAvailable = false;
                  growl.error("No extended metadata available", {title: 'Error', ttl: 2000});
                });
              }
            };

            self.showMetadata = function (data) {
              self.metadataAvailable = true;
              self.metadataDisplay = data;
            };
          }
        ]);
