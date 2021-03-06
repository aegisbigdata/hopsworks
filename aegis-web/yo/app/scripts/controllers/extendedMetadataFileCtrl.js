/*
 * Changes to this file committed after and not including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
 * This file is part of Hopsworks
 * Copyright (C) 2018, Logical Clocks AB. All rights reserved
 *
 * Hopsworks is free software: you can redistribute it and/or modify it under the terms of
 * the GNU Affero General Public License as published by the Free Software Foundation,
 * either version 3 of the License, or (at your option) any later version.
 *
 * Hopsworks is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR
 * PURPOSE.  See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 *
 * Changes to this file committed before and including commit-id: ccc0d2c5f9a5ac661e60e6eaf138de7889928b8b
 * are released under the following license:
 *
 * Copyright (C) 2013 - 2018, Logical Clocks AB and RISE SICS AB. All rights reserved
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS  OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

const AEGIS_DISTRIBUTION_TEMPLATE_ID = 14;
const AEGIS_DISTRIBUTION_TEMPLATE_NAME = 'aegis-distribution';

angular.module('hopsWorksApp')
        .controller('ExtendedMetadataFileCtrl', ['$location', '$anchorScroll', '$cookies', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$filter', 'DataSetService', 'ModalService', 'growl', 'MetadataActionService',
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService', 'ExtendedMetadataAPIService', 'AEGIS_CONFIG',
          'LindaService',
          function ($location, $anchorScroll, $cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService, ExtendedMetadataAPIService, AEGIS_CONFIG, LindaService) {
            const PROJECT_ID = $routeParams.projectID;
            const DISTRIBUTION_ID = $routeParams.distributionID;
            const parameters = $location.search();
            const self = this;

            self.fileName = decodeURI(parameters.file);
            self.projectName = decodeURI(parameters.project);
            self.datasetName = decodeURI(parameters.dataset);
            self.metadataExists = false;
            self.filePreviewLoaded = false;
            self.filePreviewShowing = false;
            self.template = {
              "@context": {
                "geometry": {
                  "@id": "http://www.w3.org/ns/locn#geometry",
                  "@type": "https://www.iana.org/assignments/media-types/application/vnd.geo+json"
                },
                "homepage": {
                  "@id": "http://xmlns.com/foaf/0.1/homepage",
                  "@type": "@id"
                },
                "name": {
                  "@id": "http://xmlns.com/foaf/0.1/name"
                },
                "modified": {
                  "@id": "http://purl.org/dc/terms/modified",
                  "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                },
                "title": {
                  "@id": "http://purl.org/dc/terms/title"
                },
                "publisher": {
                  "@id": "http://purl.org/dc/terms/publisher",
                  "@type": "@id"
                },
                "type": {
                  "@id": "http://purl.org/dc/terms/type"
                },
                "license": {
                  "@id": "http://purl.org/dc/terms/license",
                  "@type": "@id"
                },
                "description": {
                  "@id": "http://purl.org/dc/terms/description"
                },
                "language": {
                  "@id": "http://purl.org/dc/terms/language",
                  "@type": "@id"
                },
                "spatial": {
                  "@id": "http://purl.org/dc/terms/spatial",
                  "@type": "@id"
                },
                "dct": {
                  "@id": "http://purl.org/dc/terms/",
                  "@type": "@id"
                },
                "schema": {
                  "@id": "http://schema.org/",
                  "@type": "@id"
                },
                "aegis": {
                  "@id": "http://www.aegis-bigdata.eu/md/voc/core/",
                  "@type": "@id"
                },
                "hops": {
                  "@id": "http://www.aegis-bigdata.eu/md/voc/hops/",
                  "@type": "@id"
                }
              },
              "@graph": [
                {
                  "@id": "https://example.de/dataset/distribution3",
                  "@type": [
                    "http://www.w3.org/ns/dcat#Distribution",
                    "aegis:TabularDistribution"
                  ],
                  "aegis:hasField": [],
                  "hops:fileId": "",
                  "http://www.w3.org/ns/dcat#accessURL": {
                    "@id": ""
                  }
                }
              ]
            }


            $scope.form = {};
            $scope.data = {
              fields: {
                accessUrl: {
                  model: 'Access URL'
                },
                title: {
                  label: 'Title',
                  description: 'Description for title field',
                  model: '',
                  required: true
                },
                description: {
                  label: 'Description',
                  description: 'Description for description field',
                  model: '',
                  required: true
                },
                format: {
                  label: 'Format',
                  description: 'File format',
                  model: '',
                  recommended: true,
                  options: ExtendedMetadataService.FILE_FORMATS
                },
                license: {
                  label: 'Licence',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  recommended: true,
                  options: ExtendedMetadataService.LICENCES
                },
                language: {
                  label: 'Language',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  optional: true,
                  type: 'select',
                  options: ExtendedMetadataService.LANGUAGES
                },
                typeannotation: {
                  label: 'Type of Data',
                  model: {
                    fields: [],
                    typeOfData: 'tabular'
                  },
                  recommended: true
                }
              }
            };

            var dataSetService = DataSetService(PROJECT_ID);

            $scope.getRDFLink = function() {
              var path = 'hdfs://' + decodeURI(parameters.path);
              return AEGIS_CONFIG.metadata.DISTRIBUTION_ENDPOINT + encodeURIComponent(encodeURIComponent(path)) + '?useIdentifier=true';
            };

            self.updateModelsFromData = function (jsonld) {
              var fields = $scope.data.fields;

              if(jsonld.hasOwnProperty('@graph')) {
                var graph = jsonld['@graph'];
              } else {
                var graph = [jsonld];
              }
              fields.typeannotation.model.fields = [];

              graph.forEach((entry, index) => {
                if (entry.hasOwnProperty('accessURL')) {
                let distro = graph[index];
                let title = graph[index]['title'];
                let description = graph[index]['description'] || graph[index]['http://purl.org/dc/terms/description'];
                fields.title.model = ExtendedMetadataService.setFieldFromStringOrArray(title);
                fields.description.model = ExtendedMetadataService.setFieldFromStringOrArray(description);
                fields.format.model = distro['format'] || '';

                if (distro.hasOwnProperty('accessURL')) fields.accessUrl.model = distro['accessURL'] || '';
                if (distro.hasOwnProperty('language')) {
                  var language_splitted = distro['language'].split('/');
                  fields.language.model = language_splitted[language_splitted.length - 1];
                }

                if (distro.hasOwnProperty('license')) {
                  fields.license.model = distro['license'];
                  self.resolveLicence(fields.license.model);
                }

              } else {
                var aegis_prexix = 'http://www.aegis-bigdata.eu/md/voc/core/';
                var type = null;

                if (entry.hasOwnProperty('type')) {
                  var type_splitted = entry['type'].split('/');
                  type = type_splitted[type_splitted.length - 1].toLowerCase();
                }

                var new_field = {
                  primary: entry[aegis_prexix + 'primary'] || false,
                  description: entry[aegis_prexix + 'description'] || entry['description'] || '',
                  name: entry['name'] || '',
                  number: parseInt(entry['number'], 10) || '',
                  type
                }

                fields.typeannotation.model.fields.push(new_field)
              }
            });
            };

            /**
             * Loads from data from JSON-LD format into page
             */
            
            self.loadExtendedDistroMetadata = function () {
              var parameters = $location.search();
              var path = 'hdfs://' + decodeURI(parameters.path);
              $scope.data.fields.accessUrl.model = path;

              ExtendedMetadataAPIService.getDistributionMetadata(path)
                .then(function(data) {
                  self.metadataExists = true;
                  self.updateModelsFromData(data.data);
                })
                .catch(function(error) {
                  console.error(error);
                  if (error.data && error.data === '404 - Not Found - null') console.log('No extended metadata found for distribution');
                });    
            };
            
            self.loadExtendedDistroMetadata();

            /**
             * Saves form data in JSON-LD format as metadata with hopsworks
             */
            self.saveExtendedDistroMetadata = function () {
              var metadataObject = JSON.parse(JSON.stringify(self.template));
              var graph = metadataObject['@graph'];
              var data = $scope.data;
              var fields = $scope.data.fields;
              var parameters = $location.search();
              var datasetName = decodeURI(parameters.dataset);
              var path = decodeURI(parameters.path);

              graph[0]['aegis:hasField'] = [];
              graph[0].description = fields.description.model;
              graph[0].title = fields.title.model;
              graph[0]['hops:fileId'] = DISTRIBUTION_ID;
              graph[0]['dct:identifier'] = 'hdfs://' + path;
              graph[0]['http://www.w3.org/ns/dcat#accessURL']['@id'] = 'hdfs://' + path;

              if (fields.format.model != '') graph[0]['dct:format'] = fields.format.model;
              if (fields.language.model != '') graph[0]['language'] = 'http://publications.europa.eu/resource/authority/language/' + fields.language.model;
              if (fields.license.model != '') graph[0].license = fields.license.model;

              if (fields.typeannotation.model.fields.length) {
                var tabularFields = fields.typeannotation.model.fields;
                tabularFields.forEach(function (field) {
                  var type = field.type ? "aegis:" + field.type : '';
                  graph[0]['aegis:hasField'].push({
                    "aegis:primary": field.primary || false,
                    "aegis:description": field.description,
                    "aegis:name": field.name,
                    "aegis:number": field.number.toString(),
                    "aegis:type": {
                      "@id": type
                    }
                  });
                });
              }

              // Clear fields if type of data is not tabular
              if (fields.typeannotation.model.typeOfData != 'tabular') {
                fields.typeannotation.model.fields = [];
                graph[0]['aegis:hasField'] = [];
              }

              // Send to API
              if(self.metadataExists) {
                ExtendedMetadataAPIService.updateDistributionMetadata($scope.data.fields.accessUrl.model, metadataObject)
                    .then(function(success) {
                      growl.success('Distribution metadata successfully saved.', {title: 'Success', ttl: 5000});
                    })
                    .catch(function(error) {
                      growl.error('Server error: ' + error.status, {title: 'Error while saving distribution metadata', ttl: 5000, referenceId: 0});
                    })
                    .finally(function() {
                      $scope.saveButtonIsDisabled = false;
                    });
              } else {
                ExtendedMetadataAPIService.createDistributionMetadata(parameters.datasetID, PROJECT_ID, metadataObject)
                    .then(function(success) {
                      growl.success('Distribution metadata successfully saved.', {title: 'Success', ttl: 5000});
                    })
                    .catch(function(error) {
                      growl.error('Server error: ' + error.status, {title: 'Error while saving distribution metadata', ttl: 5000, referenceId: 0});
                    })
                    .finally(function() {
                      $scope.saveButtonIsDisabled = false;
                    });
              }

              var hopsExtendedMetadata = {};
              if (fields.format.model) {
                hopsExtendedMetadata['filetype'] = fields.format.model;
              }

              if (fields.license.model) {
                LindaService.resolveLicenceURL(fields.license.model).then(function(response) {
                  hopsExtendedMetadata['license'] = LindaService.parseLicenceResolve(response, 'altLabel');
                  MetadataRestService.addExtendedMetadata(
                      PROJECT_ID,
                      self.projectName,
                      self.datasetName,
                      self.fileName,
                      hopsExtendedMetadata
                  );
                });

              } else {
                MetadataRestService.addExtendedMetadata(
                    PROJECT_ID,
                    self.projectName,
                    self.datasetName,
                    self.fileName,
                    hopsExtendedMetadata
                );
              }


            };

            /**
             * Helper function to filter fields by type
             */

            $scope.fieldFilter = function (filter) {
              return Object.keys($scope.data.fields).filter(element => $scope.data.fields[element][filter] === true);
            }

            
            /**
             * Scrolls page to anchor/hash
             */

            $scope.anchorScroll = function (hash) {
              var id = $location.hash();  // neccessary to avoid page / controller reload on hash change / anchor scroll
              $location.hash(hash);
              $anchorScroll();
              $location.hash(id);
            };


            self.onFieldFocus = function (field) {
              self.selectedField = field;
              $scope.selectedFieldDescription = null;

              if ($scope.data.fields.hasOwnProperty(field)) {
                $scope.selectedFieldDescription = $scope.data.fields[field].description;
              }
            };

            $scope.getLindaLicences = function(val) {
              return LindaService.autocompleteLicence(val).then(function(response) {
                    return LindaService.parseLicenceResponse(response);
                  }
              );
            };

            self.resolveLicence = function (url) {
              return LindaService.resolveLicenceURL(url).then(function(response) {
                    $scope.data.fields.license.extra = LindaService.parseLicenceResolve(response, 'prefLabel');
                  }
              );
            };

            self.filePreview = function () {
                var parameters = $location.search();
                var datasetName = decodeURI(parameters.dataset);
                var fileName = decodeURI(parameters.file);
                var path = datasetName + '/' + fileName;
                self.filePreviewShowing = true;
                
                if (!self.filePreviewLoaded) {
                  $scope.filePreviewContents = 'Loading file preview...';
                  dataSetService.filePreview(path, "head").then(
                    function (success) {
                      var truncation_length = 750;
                      var fileDetails = JSON.parse(success.data.data);
                      var content = fileDetails.filePreviewDTO[0].content;
                      var conv = new showdown.Converter({parseImgDimensions: true});
                      self.filePreviewLoaded = true;
                      $scope.filePreviewContents = conv.makeHtml(content);

                      if ($scope.filePreviewContents.length > truncation_length) {
                        $scope.filePreviewContents = $scope.filePreviewContents.substring(0, truncation_length) + '\n\n[...]';
                      }
                    }, function (error) {
                      //To hide README from UI
                      self.filePreviewLoaded = false;
                      if (typeof error.data.usrMsg !== 'undefined') {
                        growl.error(error.data.usrMsg, {title: error.data.errorMsg, ttl: 5000, referenceId: 4});
                      } else {
                        growl.error("", {title: error.data.errorMsg, ttl: 5000, referenceId: 4});
                      }
                      $scope.filePreviewContents = 'Could not load file preview.';
                  });
                }
            }
          }
        ]);
