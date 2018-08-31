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
                ExtendedMetadataService.getDataset(file.parentId)
                .then(function () {
                  // Parent dataset has metadata
                  // Now check if file has already metadata
                  ExtendedMetadataService.getDistribution(file.parentId, file.id)
                  .then(function (success) {
                    self.metadataExtendedDistribution = success.data;

                    // set primary fields
                    for (var i = 0; i < self.metadataExtendedDistribution.fields.length; i++) {
                      if (self.metadataExtendedDistribution.primary_keys.includes(self.metadataExtendedDistribution.fields[i].name)) {
                        self.metadataExtendedDistribution.fields[i].primary = true;
                      }
                    }

                    ModalService.addExtendedMetadata('lg', file, success.data);

                  }, function (error) {
                    // File does not have metadata
                    ModalService.addExtendedMetadata('lg', file, self.metadataExtendedDistribution);
                  })
                 
                }, function (err) {
                  // Parent dataset has no metadata
                  growl.error("Metadata for distribution can not be added. Parent dataset has no metadata.", {title: 'Info', ttl: 5000});
                });
              } else {
                ExtendedMetadataService.getDataset(file.id)
                .then(function (success) {
                  ModalService.addExtendedMetadata('lg', file, success.data);
                  self.metadataExtendedDataset = success.data;

                  for (var i = 0; i < self.metadataExtendedDataset.themes.length; i++) {
                    self.metadataExtendedDataset.themes[i] = self.metadataExtendedDataset.themes[i].replace('http://publications.europa.eu/resource/authority/data-theme/', '');
                  }
                }, function (error) {
                  // Dataset does not have metadata
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
              if (file.type == "ds" || file.dir) {
                ExtendedMetadataService.getDataset(file.id)
                .then(function (result) {
                  self.showMetadata(result.data);
                }, function (err) {
                  self.metadataDisplay = false;
                  self.metadataAvailable = false;
                });
              } else {
                ExtendedMetadataService.getDistribution(file.parentId, file.id)
                .then(function (result) {
                  var distribution = result.data;
                  distribution.rdf = distribution.uri.replace('http://www.aegis-bigdata.eu/md/dataset/', 'http://aegis-metadata.fokus.fraunhofer.de/api/datasets/') + '.rdf';
                  distribution.rdf = distribution.rdf.replace('distribution', 'distributions');
                  self.showMetadata(distribution);
                }, function (err) {
                  self.metadataDisplay = false;
                  self.metadataAvailable = false;
                });
              }
            };

            self.showMetadata = function (data) {
              self.metadataAvailable = true;
              self.metadataDisplay = flattenObject(data);
              delete self.metadataDisplay['fields'];
            };

            var flattenObject = function(ob) {
              var toReturn = {};
              
              for (var i in ob) {
                if (!ob.hasOwnProperty(i)) continue;
                
                if ((typeof ob[i]) == 'object' && !Array.isArray(ob[i])) {
                  var flatObject = flattenObject(ob[i]);
                  for (var x in flatObject) {
                    if (!flatObject.hasOwnProperty(x)) continue;
                    
                    toReturn[i + ' ' + x] = flatObject[x];
                  }
                } else {
                  toReturn[i] = ob[i];
                }
              }
              return toReturn;
            };
          }
        ]);
