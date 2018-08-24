'use strict';

angular.module('hopsWorksApp')
  .controller('MetadataExtendedModalCtrl', ['$http', '$uibModalInstance', '$scope', '$rootScope', '$routeParams', 'ModalService', 'ExtendedMetadataService', 'ProjectService', 'growl', 'detailData', 'projectId',
    function ($http, $uibModalInstance, $scope, $rootScope, $routeParams,
      ModalService, ExtendedMetadataService, ProjectService, growl, detailData, projectId) {

      var self = this;

      self.errorMessage = "";

      self.metadataExtendedDistribution = detailData;
      self.metadataExtendedDataset = detailData;
      self.metadataExtendedCatalog = {}

      if (projectId != null) {
        ExtendedMetadataService.getCatalog(projectId).then(function (result) {
          self.metadataExtendedCatalog = result.data
        }, function (err) {
          ProjectService.get({}, {'id': projectId}).$promise.then(function (success) {
            self.metadataExtendedCatalog.title = success.projectName
          });
        })
      }

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

            // check if distribution already exists
            ExtendedMetadataService.getDistribution(file.parentId, file.id)
              .then(function (result) {
                // distribution exists, therefore update
                ExtendedMetadataService.updateDistribution(file.parentId, self.metadataExtendedDistribution)
                  .then(function (result) {
                    growl.success("Metadata has been updated successfully", { title: 'Success', ttl: 2000 });
                    $scope.$close();
                    $rootScope.$broadcast('file-selected', $scope.$resolve.file);
                  }, function (err) {
                    growl.error("Error while updating metadata", { title: 'Success', ttl: 2000 });
                  })
              }, function (err) {
                // distribution doesn't exist, add new
                ExtendedMetadataService.addDistribution(file.parentId, self.metadataExtendedDistribution)
                  .then(function (result) {
                    growl.success("Metadata has been added successfully", { title: 'Success', ttl: 2000 });
                    $scope.$close();
                    $rootScope.$broadcast('file-selected', $scope.$resolve.file);
                  }, function (err) {
                      growl.error("Error while adding metadata", { title: 'Success', ttl: 2000 });
                  })
              })
          }, function (err) {
            $scope.$close();
            growl.error("Metadata for distribution could not be added. Parent dataset has no metadata.", { title: 'Info', ttl: 5000 });
          });
      };

      self.saveFieldsDataset = function () {
        var file = $scope.$resolve.file;
        self.metadataExtendedDataset.id = file.id;

        ExtendedMetadataService.getDataset(file.id).then(function () {
          ExtendedMetadataService.updateDataset(self.metadataExtendedDataset).then(function (result) {
            growl.success("Metadata has been updated successfully", { title: 'Success', ttl: 2000 });
            $scope.$close();
            $rootScope.$broadcast('file-selected', $scope.$resolve.file);
          }, function (err) {
            growl.error("Error while updating metadata", { title: 'Success', ttl: 2000 });
          });
        }, function (err) {
          // dataset doesn't exist
          ExtendedMetadataService.addDataset(self.metadataExtendedDataset).then(function (result) {
              growl.success("Metadata has been added successfully", { title: 'Success', ttl: 2000 });
              $scope.$close();
              $rootScope.$broadcast('file-selected', $scope.$resolve.file);
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

      self.deleteMetadata = function () {
        var file = $scope.$resolve.file;
        if (file.dir || file.type == 'ds') {
          ExtendedMetadataService.deleteDataset(file.id).then(function (result) {
            growl.success("Metadata has been deleted successfully", { title: 'Success', ttl: 2000 });
            $scope.$close();
          }, function (err) {
            growl.error("Error while deleting metadata", { title: 'Success', ttl: 2000 });
          });
        } else {
          ExtendedMetadataService.deleteDistribution(file.parentId, file.id).then(function (result) {
            growl.success("Metadata has been deleted successfully", { title: 'Success', ttl: 2000 });
            $scope.$close();
          }, function (err) {
            growl.error("Error while deleting metadata", { title: 'Success', ttl: 2000 });
          });
        }
      }
    }
  ]);
