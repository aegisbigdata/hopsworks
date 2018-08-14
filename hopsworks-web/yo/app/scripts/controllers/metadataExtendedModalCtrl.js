'use strict';

angular.module('hopsWorksApp')
  .controller('MetadataExtendedModalCtrl', ['$http', '$uibModalInstance', '$scope', '$rootScope', '$routeParams', 'ModalService', 'ExtendedMetadataService', 'growl', 'detailData', 'projectId',
    function ($http, $uibModalInstance, $scope, $rootScope, $routeParams,
      ModalService, ExtendedMetadataService, growl, detailData, projectId) {

      var self = this;

      console.log('metadataExtendedModalCtrl called with detailData2', detailData);
      self.metadataExtendedDistribution = detailData;
      self.metadataExtendedDataset = detailData;

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
          title: "15",
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
                  console.log('file does not have metadata');
                  ModalService.addExtendedMetadata('lg', file);
                })

            }, function (err) {
              // Parent dataset has no metadata
              console.log('Metadata for distribution can not be added');
              growl.error("Metadata for distribution can not be added. Parent dataset has no metadata.", { title: 'Info', ttl: 5000 });
            });
        } else {
          ExtendedMetadataService.getDataset(file.id)
            .then(function (success) {
              ModalService.addExtendedMetadata('lg', file, success.data);
              self.metadataExtendedDataset = success.data;
              self.metadataExtendedDataset.title = "Dummy title...";
              console.log('existing metadata loaded from server and assigned', self.metadataExtendedDataset);
            }, function (error) {
              // Dataset does not have metadata
              console.log('dataset does not have metadata');
              ModalService.addExtendedMetadata('lg', file);
            })
        }
      };

      self.saveFieldsDistribution = function () {
        var file = $scope.$resolve.file;
        self.metadataExtendedDistribution.id = file.id;
        self.metadataExtendedDistribution.title = file.name;
        self.metadataExtendedDistribution.access_url = "hdfs://" + file.path;

        //  converts { primary: true } to primary_keys: ["nameOfField"]
        self.metadataExtendedDistribution.primary_keys = [];
        for (var i = self.metadataExtendedDistribution.fields.length - 1; i >= 0; i--) {
          if (self.metadataExtendedDistribution.fields[i].primary) {
            self.metadataExtendedDistribution.primary_keys.push(self.metadataExtendedDistribution.fields[i].name);
            delete self.metadataExtendedDistribution.fields[i].primary;
          }
        }

        // check if metadata for parent dataset exists
        ExtendedMetadataService.getDataset(file.parentId)
          .then(function (result) {
            console.log("parent dataset exists, carry on saving fields", result);

            ExtendedMetadataService.addDistribution(file.parentId, self.metadataExtendedDistribution)
              .then(function (result) {
                console.log("successfully saved", result);
                $scope.$close();
              }, function (err) {
                console.log("error while saving", err);
              })
          }, function (err) {
            console.log("error while saving", err);
            $scope.$close();
            growl.error("Metadata for distribution could not be added. Parent dataset has no metadata.", { title: 'Info', ttl: 5000 });
          });
      };

      self.saveFieldsDataset = function () {
        var file = $scope.$resolve.file;
        console.log('savingFieldsDataset hmmmm', self.metadataExtendedDataset)
        self.metadataExtendedDataset.id = file.id;
        self.metadataExtendedDataset.keywords = self.metadataExtendedDataset.keywords.split(',');
        for (var i = self.metadataExtendedDataset.keywords.length - 1; i >= 0; i--) {
          self.metadataExtendedDataset.keywords[i] = self.metadataExtendedDataset.keywords[i].trim();
        }

        ExtendedMetadataService.getDataset(file.id).then(function () {
          ExtendedMetadataService.updateDataset(self.metadataExtendedDataset).then(function (result) {
            growl.success("Metadata has been updated successfully", { title: 'Success', ttl: 2000 });
            $scope.$close();
          }, function (err) {
            console.log("error while updated", err);
          });
        }, function (err) {
          // dataset doesn't exist
          ExtendedMetadataService.addDataset(self.metadataExtendedDataset).then(function (result) {
              growl.success("Metadata has been added successfully", { title: 'Success', ttl: 2000 });
              $scope.$close();
            }, function (err) {
              rowl.error("Error while adding metadata", { title: 'Success', ttl: 2000 });
            });
        })
      };

      self.saveFieldsCatalog = function () {
        ExtendedMetadataService.getCatalog(projectId).then(function () {
          ExtendedMetadataService.updateCatalog(self.metadataExtendedCatalog).then(function (result) {
            growl.success("Metadata has been updated successfully", { title: 'Success', ttl: 2000 });
            $scope.$close();
          }, function (err) {
            self.errorMessage = err.data.message;
            growl.error("Error while updating metadata", { title: 'Success', ttl: 2000 });
          });
        }, function (err) {
          // Catalog doesn't exist
          self.metadataExtendedCatalog.id = projectId;
          ExtendedMetadataService.addCatalog(self.metadataExtendedCatalog).then(function (result) {
              growl.success("Metadata has been added successfully", { title: 'Success', ttl: 2000 });
              $scope.$close();
            }, function (err) {
              self.errorMessage = err.data.message;
              growl.error("Error while adding metadata", { title: 'Success', ttl: 2000 });
            });
        })
      };

      self.close = function () {
        $scope.$dismiss('cancelled');
      };

      self.getMetadata = function (file) {
        console.log('hmmmmn called getMetadata', file);
        /* $routeParams.projectID */

        if (file.dir) {
          ExtendedMetadataService.getDataset(file.id)
            .then(function (result) {
              console.log('showing metadata', result.data);
              self.showMetadata(result.data);
            }, function (err) {
              self.metadataDisplay = false;
              self.metadataAvailable = false;
              growl.error("No extended metadata available", { title: 'Error', ttl: 2000 });
            });
        } else {
          ExtendedMetadataService.getDistribution(file.parentId, file.id)
            .then(function (result) {
              self.showMetadata(result.data);
            }, function (err) {
              self.metadataDisplay = false;
              self.metadataAvailable = false;
              growl.error("No extended metadata available", { title: 'Error', ttl: 2000 });
            });
        }
      };

      self.showMetadata = function (data) {
        self.metadataAvailable = true;
        self.metadataDisplay = data;
      };
    }
  ]);
