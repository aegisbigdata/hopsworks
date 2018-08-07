/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('hopsWorksApp')
        .factory('ExtendedMetadataService', ['$http', 'TransformRequest', function ($http, TransformRequest) {
            const metadataBackend = 'http://aegis-metadata.fokus.fraunhofer.de';
            var service = {
                
              getCatalog: function (catalogId) {
                return $http.get(metadataBackend + '/api/catalogs/byid/' + catalogId);
              },
              getDataset: function (datasetId) {
                return $http.get(metadataBackend + '/api/datasets/byid/' + datasetId);
              },
              getDistribution: function (datasetId, distributionId) {
                return $http.get(metadataBackend + '/api/datasets/byid/' + datasetId + '/distributions/byId/' + distributionId);
              },
              getCatalogByName: function (catalogName) {
                return $http.get(metadataBackend + '/api/catalogs/' + catalogName);
              },
              getDatasetByName: function (datasetName) {
                return $http.get(metadataBackend + '/api/datasets/' + datasetName);
              },
              getDistributionByName: function (datasetName, distributionName) {
                return $http.get(metadataBackend + '/api/datasets/' + datasetName + '/distributions/' + distributionName);
              },
              addCatalog: function (catalog) {
                var regReq = {
                  method: 'POST',
                  url: metadataBackend + '/api/catalogs',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: catalog
                };

                return $http(regReq);
              },
              addDataset: function (dataset) {
                var regReq = {
                  method: 'POST',
                  url: metadataBackend + '/api/datasets',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: dataset
                };

                return $http(regReq);
              },
              addDistribution: function (datasetId, distribution) {
                var regReq = {
                  method: 'POST',
                  url: metadataBackend + '/api/datasets/' + datasetId + '/distributions',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  data: distribution
                };

                return $http(regReq);
              }
            };
            return service;
          }]);
