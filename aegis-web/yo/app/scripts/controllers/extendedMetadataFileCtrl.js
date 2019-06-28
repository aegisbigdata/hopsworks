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
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService', 'ExtendedMetadataAPIService', 
          function ($location, $anchorScroll, $cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService, ExtendedMetadataAPIService) {
            const PROJECT_ID = $routeParams.projectID;
            const DISTRIBUTION_ID = $routeParams.distributionID;
            const self = this;

            self.filePreviewLoaded = false;
            self.filePreviewShowing = false;

            self.mock = {
              "@graph": [
                {
                  "@id": "https://europeandataportal.eu/set/distribution/1234",
                  "@type": [
                    "http://www.aegis-bigdata.eu/md/voc/core/TabularDistribution",
                    "http://www.w3.org/ns/dcat#Distribution"
                  ],
                  "http://purl.org/dc/terms/identifier": "1234",
                  "http://purl.org/dc/terms/description": "This is an example distribution",
                  "http://purl.org/dc/terms/language": {
                    "@id": "http://publications.europa.eu/resource/authority/language/ENG"
                  },
                  "http://purl.org/dc/terms/title": "Example Distribution",
                  "http://purl.org/dc/terms/license": {
                    "@id": "https://creativecommons.org/licenses/by/4.0/"
                  },
                  "http://purl.org/dc/terms/format": "CSV",
                  "http://www.w3.org/ns/dcat#accessURL": {
                    "@id": "hdfs:///Projects/AutomotiveDemonstrator/Demo2_SafeDrivingIndicator/Events/Driver1_Vehicle6_20170224_Trip_011__withoutnan.csv"
                  },
                  "http://www.aegis-bigdata.eu/md/voc/hops/fileId": "3804679",
                  "http://www.aegis-bigdata.eu/md/voc/core/hasField": [
                    {
                      "@id": "_:vb10164"
                    },
                    {
                      "@id": "_:vb10165"
                    },
                    {
                      "@id": "_:vb10166"
                    },
                    {
                      "@id": "_:vb10162"
                    }
                  ]
                },
                {
                  "@id": "_:vb10162",
                  "http://www.aegis-bigdata.eu/md/voc/core/description": "A description of the entry",
                  "http://www.aegis-bigdata.eu/md/voc/core/name": "text",
                  "http://www.aegis-bigdata.eu/md/voc/core/number": "3",
                  "http://www.aegis-bigdata.eu/md/voc/core/type": {
                    "@id": "http://www.aegis-bigdata.eu/md/voc/core/String"
                  }
                },
                {
                  "@id": "_:vb10164",
                  "http://www.aegis-bigdata.eu/md/voc/core/description": "The longitude of the entry",
                  "http://www.aegis-bigdata.eu/md/voc/core/name": "longitude",
                  "http://www.aegis-bigdata.eu/md/voc/core/number": "2",
                  "http://www.aegis-bigdata.eu/md/voc/core/type": {
                    "@id": "http://www.aegis-bigdata.eu/md/voc/core/Longitude"
                  }
                },
                {
                  "@id": "_:vb10165",
                  "http://www.aegis-bigdata.eu/md/voc/core/description": "The color of the marker",
                  "http://www.aegis-bigdata.eu/md/voc/core/name": "color",
                  "http://www.aegis-bigdata.eu/md/voc/core/number": "4",
                  "http://www.aegis-bigdata.eu/md/voc/core/type": {
                    "@id": "http://www.aegis-bigdata.eu/md/voc/core/Color"
                  }
                },
                {
                  "@id": "_:vb10166",
                  "http://www.aegis-bigdata.eu/md/voc/core/description": "The latitude of the entry",
                  "http://www.aegis-bigdata.eu/md/voc/core/name": "latitude",
                  "http://www.aegis-bigdata.eu/md/voc/core/number": "1",
                  "http://www.aegis-bigdata.eu/md/voc/core/type": {
                    "@id": "http://www.aegis-bigdata.eu/md/voc/core/Latitude"
                  }
                }
              ]
            };

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

            self.updateModelsFromData = function (jsonld) {
              var fields = $scope.data.fields;
              var graph = jsonld['@graph'];
              fields.typeannotation.model.fields = [];

              graph.forEach((entry, index) => {
                if (entry.hasOwnProperty('http://www.w3.org/ns/dcat#accessURL')) {
                  var distro = graph[index];
                  fields.title.model = distro['http://purl.org/dc/terms/title'] || '';
                  fields.description.model = distro['http://purl.org/dc/terms/description'] || '';
                  fields.format.model = distro['http://purl.org/dc/terms/format'] || '';

                  if (distro.hasOwnProperty('http://www.w3.org/ns/dcat#accessURL')) fields.accessUrl.model = distro['http://www.w3.org/ns/dcat#accessURL']['@id'] || '';
                  if (distro.hasOwnProperty('http://purl.org/dc/terms/language')) {
                    var language_splitted = distro['http://purl.org/dc/terms/language']['@id'].split('/');
                    fields.language.model = language_splitted[language_splitted.length - 1];
                  }

                  if (distro.hasOwnProperty('http://purl.org/dc/terms/license')) {
                    var license_splitted = distro['http://purl.org/dc/terms/license']['@id'].split('/');
                    fields.license.model = license_splitted[license_splitted.length - 1];
                  }

                } else {
                  var aegis_prexix = 'http://www.aegis-bigdata.eu/md/voc/core/';
                  var type = null;

                  if (entry.hasOwnProperty(aegis_prexix + 'type')) {
                    if (entry[aegis_prexix + 'type']['@id'] != '') {
                      var type_splitted = entry[aegis_prexix + 'type']['@id'].split('/');
                      type = type_splitted[type_splitted.length - 1].toLowerCase();
                    }
                  }

                  var new_field = {
                    description: entry[aegis_prexix + 'description'] || '',
                    name: entry[aegis_prexix + 'name'] || '',
                    number: parseInt(entry[aegis_prexix + 'number'], 10) || '',
                    type
                  }
                  
                  fields.typeannotation.model.fields.push(new_field)
                }
              });
            };

            self.updateModelsFromData(self.mock);

            /**
             * Loads from data from JSON-LD format into page
             */
            
            self.loadExtendedDistroMetadata = function () {
              var parameters = $location.search();
              var path = 'hdfs://' + decodeURI(parameters.path);

              ExtendedMetadataAPIService.getDistributionMetadata(path)
                .then(function(data) {
                  console.log(data.data);
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
              if (fields.language.model) graph[0]['language'] = 'http://publications.europa.eu/resource/authority/language/' + fields.language.model;
              if (fields.license.model) graph[0].license = 'https://creativecommons.org/licenses/by/4.0/' + fields.license.model;

              if (fields.typeannotation.model.fields.length) {
                var tabularFields = fields.typeannotation.model.fields;
                tabularFields.forEach(function (field) {
                  var type = field.type ? "aegis:" + field.type : '';
                  graph[0]['aegis:hasField'].push({
                    "aegis:description": field.description,
                    "aegis:name": field.name,
                    "aegis:number": field.number.toString(),
                    "aegis:type": {
                      "@id": type
                    }
                  });
                });
              }

              // Send to API
              ExtendedMetadataAPIService.createOrUpdateDistributionMetadata(parameters.datasetID, PROJECT_ID, metadataObject)
                .then(function(success) {
                  growl.success('Distribution metadata successfully saved.', {title: 'Success', ttl: 5000});
                })
                .catch(function(error) {
                  growl.error('Server error: ' + error.status, {title: 'Error while saving distribution metadata', ttl: 5000, referenceId: 0});
                })
                .finally(function() {
                  $scope.saveButtonIsDisabled = false;
                });
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
                      var fileDetails = JSON.parse(success.data.data);
                      var content = fileDetails.filePreviewDTO[0].content;
                      var conv = new showdown.Converter({parseImgDimensions: true});
                      self.filePreviewLoaded = true;
                      $scope.filePreviewContents = conv.makeHtml(content);

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
