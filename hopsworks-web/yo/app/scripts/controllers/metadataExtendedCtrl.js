'use strict';

angular.module('hopsWorksApp')
        .controller('MetadataExtendedCtrl', ['$http', '$uibModal', '$scope', '$rootScope', '$routeParams', 'ModalService', 'ExtendedMetadataService', 'growl',
          function ($http, $uibModal, $scope, $rootScope, $routeParams,
                  ModalService, ExtendedMetadataService, growl) {

            var self = this;

            console.log('metadataExtendedCtrl called', self.metadataExtendedDataset);

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
            // self.metadataExtendedDistribution = self.initDistribution();
            // self.metadataExtendedDataset = self.initDataset();

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
              

              console.log('called attachTemplate', file, $routeParams);


              // Check if metadata for parent dataset exists
              if (!file.dir) {
                console.log('file is not directory');
                ExtendedMetadataService.getDataset(file.parentId)
                .then(function () {
                  // Parent dataset has metadata
                  // Now check if file has already metadata
                  ExtendedMetadataService.getDistribution(file.parentId, file.id)
                  .then(function (success) {
                    self.metadataExtendedDistribution = success.data;

                    console.log('existing metadata loaded from server and assigned', self.metadataExtendedDistribution);
                    ModalService.addExtendedMetadata('lg', file, success.data);
                  }, function (error) {
                    // File does not have metadata
                    console.log('file does not have metadata');
                    ModalService.addExtendedMetadata('lg', file, self.metadataExtendedDistribution);
                  })
                 
                }, function (err) {
                  // Parent dataset has no metadata
                  console.log('Metadata for distribution can not be added');
                  growl.error("Metadata for distribution can not be added. Parent dataset has no metadata.", {title: 'Info', ttl: 5000});
                });
              } else {
                ExtendedMetadataService.getDataset(file.id)
                .then(function (success) {
                  ModalService.addExtendedMetadata('lg', file, success.data);
                  self.metadataExtendedDataset = success.data;
                  console.log('existing metadata loaded from server and assigned', self.metadataExtendedDataset);         
                }, function (error) {
                  // Dataset does not have metadata
                  console.log('dataset does not have metadata');
                  ModalService.addExtendedMetadata('lg', file, self.metadataExtendedDataset);
                })
              }
            };

            var attachTemplateListener = $rootScope.$on('metadataExtendedCtrl-attachTemplate', function(event, args) {
              self.attachTemplate(args);
            });

            $scope.$on('$destroy', function() {
              attachTemplateListener();
            });

            var fileSelectedListener = $rootScope.$on('file-selected', function(event, args) {
              self.getMetadata(args);
            });

            $scope.$on('$destroy', function() {
              fileSelectedListener();
            });

            self.getMetadata = function (file) {
              console.log('hmmmmn called getMetadata', file);
              /* $routeParams.projectID */

              if (file.type == "ds" || file.dir) {
                ExtendedMetadataService.getDataset(file.id)
                .then(function (result) {
                  console.log('showing metadata', result.data);
                  self.showMetadata(result.data);
                }, function (err) {
                  self.metadataDisplay = false;
                  self.metadataAvailable = false;
                  growl.error("No extended metadata available", {title: 'Error', ttl: 2000});
                });
              } else {
                ExtendedMetadataService.getDistribution(file.parentId, file.id)
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
