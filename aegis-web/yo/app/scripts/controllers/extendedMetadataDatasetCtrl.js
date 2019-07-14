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
 * software and associated documentation files (the 'Software'), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software, and to permit
 * persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or
 * substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS  OR IMPLIED, INCLUDING
 * BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

'use strict';

const AEGIS_DATASET_TEMPLATE_ID = 14;
const AEGIS_DATASET_TEMPLATE_NAME = 'aegis-distribution';

angular.module('hopsWorksApp')
        .controller('ExtendedMetadataDatasetCtrl', ['$location', '$anchorScroll', '$cookies', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$filter', 'DataSetService', 'ModalService', 'growl', 'MetadataActionService',
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService', 'ExtendedMetadataAPIService', 'AEGIS_CONFIG',
          function ($location, $anchorScroll, $cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService, ExtendedMetadataAPIService, AEGIS_CONFIG) {
            const parameters = $location.search();
            var self = this;

            self.datasetName = decodeURI(parameters.datasetName);
            self.projectName = decodeURI(parameters.projectName);
            self.PROJECT_ID = $routeParams.projectID;
            self.DATASET_ID = $routeParams.dataSetID;

            self.selectedField = null;
            self.metaData = {};
            self.metaDataDetail = {};

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
                }
              },
              "@graph": [
                {
                  "@id": "",
                  "@type": "http://www.w3.org/ns/dcat#Dataset",
                  "dct:accessRights": "",
                  "description": "",
                  "title": ""
                }
              ]
            };

            $scope.form = {};
            $scope.path = $location.path();
            $scope.deleteButtonIsDisabled = false;
            $scope.saveButtonIsDisabled = false;
            $scope.data = {
              fields: {
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
                contactpointtype: {
                  label: 'Contact Point Type',
                  description: 'Description for Contact Point field',
                  model: '',
                  recommended: true,
                },
                contactpointname: {
                  label: 'Contact Point Name',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  recommended: true,
                },
                contactpointmail: {
                  label: 'Contact Point Mail',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  recommended: true
                },
                keywords: {
                  label: 'Keywords',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  tags: [],
                  recommended: true
                },
                publishertype: {
                  label: 'Publisher Type',
                  description: 'Description for publisher field',
                  model: '',
                  recommended: true,
                },
                publishername: {
                  label: 'Publisher Name',
                  description: 'Description for publisher field',
                  mapping: 'http://xmlns.com/foaf/0.1/name',
                  model: '',
                  recommended: true,
                },
                homepage: {
                  label: 'Publisher Homepage',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  mapping: 'http://xmlns.com/foaf/0.1/homepage',
                  recommended: true
                },
                theme: {
                  label: 'Theme',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  recommended: true
                },
                price: {
                  label: 'Price',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  recommended: true
                },
                sellable: {
                  label: 'Sellable',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  recommended: true
                },
                accessRights: {
                  label: 'Access Rights',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  optional: true
                },
                documentation: {
                  label: 'Documentation',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  optional: true
                },
                language: {
                  label: 'Language',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  optional: true,
                  type: 'select',
                  options: ExtendedMetadataService.LANGUAGES
                },
                spatial: {
                  label: 'Spatial',
                  model: '',
                  optional: true
                },
                temporalfrom: {
                  label: 'Temporal',
                  model: '',
                  optional: true
                },
                temporalto: {
                  label: 'Temporal',
                  model: '',
                },
              },
              bounds: null,
              areaSelect: null
            };

            self.attachedDetailedTemplateList = [];

            var dataSetService = DataSetService($routeParams.projectID);

            $scope.getRDFLink = function() {
              return AEGIS_CONFIG.metadata.DATASET_ENDPOINT + self.DATASET_ID + '?catalogue=' + self.PROJECT_ID;
            };

            //update the current template whenever other users make changes
            var listener = $rootScope.$on('template.change', function (event, response) {
              try {
                var incomingTemplateId = JSON.parse(response.board).templateId;

                if (self.currentTemplateID === incomingTemplateId) {
                  self.currentBoard = JSON.parse(response.board);
                }
              } catch (error) {
                //console.log(error);
              }
            });


            /*
             * Rootscope events are not deregistered when the controller dies.
             * So on the controller destroy event deregister the rootscope listener manually.
             * @returns {undefined}
             */
            
            $scope.$on('$destroy', function () {
              listener();
            });
            
            self.onFieldFocus = function (field) {
              self.selectedField = field;
              $scope.selectedFieldDescription = null;

              if ($scope.data.fields.hasOwnProperty(field)) {
                $scope.selectedFieldDescription = $scope.data.fields[field].description;
              }
            };


            /**
             * Helper function to filter fields by type
             */
            
            $scope.fieldFilter = function (filter) {
              return Object.keys($scope.data.fields).filter(element => $scope.data.fields[element][filter] === true);
            };


            /**
             * Scrolls page to anchor/hash
             */

            $scope.anchorScroll = function (hash) {
              var id = $location.hash();  // neccessary to avoid page / controller reload on hash change / anchor scroll
              $location.hash(hash);
              $anchorScroll();
              $location.hash(id);
            };


            /**
             * Generate list of comma-separated tags from tag-input field and set keywords model
             */

            $scope.updateTags = function (tag) {
              var tags = $scope.data.fields.keywords.tags;
              $scope.data.fields.keywords.model = tags.map(function(tag){
                return tag.text;
              }).join(',');
            };

            self.updateModelsFromData = function (jsonld) {
              if (!jsonld.hasOwnProperty('@graph')) return;
              var graph = jsonld['@graph'];
              var fields = $scope.data.fields;
              var index_location, index_contactpoint, index_dataset, index_temporal, index_publisher;

              // Determine indexes
              graph.forEach(function(entry, index) {
                if (!entry.hasOwnProperty('@type')) {
                  if (entry.hasOwnProperty(fields.publishername.mapping)) index_publisher = index;
                } else if (typeof(entry['@type']) === 'string') {
                  let type = entry['@type'].split('/');
                  type = type[type.length - 1].toUpperCase();

                  if (type == 'LOCATION') index_location = index;
                  if (type == 'NS#ORGANIZATION' || type == 'NS#INDIVIDUAL') index_contactpoint = index;
                  if (type == 'DCAT#DATASET') index_dataset = index;
                  if (type == 'PERIODOFTIME') index_temporal = index;
                  if (type == 'ORGANIZATION' || type == 'INDIVIDUAL') index_publisher = index;
                }
              });

              // Set publisher Info
              if (index_publisher) {
                try {
                  var type_splitted = graph[index_publisher]['@type'].split('/');
                  fields.publishertype.model = type_splitted[type_splitted.length - 1].toUpperCase();
                } catch (e) {}
                  fields.publishername.model = graph[index_publisher]['name'];
                  fields.homepage.model = graph[index_publisher]['homepage'];

              }

              // Set Language field
              if (graph[index_dataset].hasOwnProperty('language')) {
                var language_splitted = graph[index_dataset]['language'].split('/');
                fields.language.model = language_splitted[language_splitted.length - 1];
              }

              // Set License field
              if (graph[index_dataset].hasOwnProperty('license')) {
                var license_splitted = graph[index_dataset].license.split('/');
                fields.license.model = license_splitted[license_splitted.length - 1];
              }

              let title = graph[index_dataset]['title'];
              let description = graph[index_dataset]['description'];
              fields.title.model = ExtendedMetadataService.setFieldFromStringOrArray(title);
              fields.description.model = ExtendedMetadataService.setFieldFromStringOrArray(description);

              // Set other fields
              fields.accessRights.model = graph[index_dataset]['accessRights'] || '';
              fields.price.model = graph[index_dataset]['price'] || '';
              fields.sellable.model = (graph[index_dataset]['http://www.aegis-bigdata.eu/md/voc/core/sellable'] == true) || graph[index_dataset]['sellable'];


              
              if (graph[index_dataset].hasOwnProperty('keyword')) {
                let tags = graph[index_dataset]['keyword'];
                fields.keywords.model = tags.join();
                fields.keywords.tags = tags.map(tag => {
                  return {text: tag};
                });
              }

              if (graph[index_dataset].hasOwnProperty('theme')) {
                var theme_splitted = graph[index_dataset]['theme'].split('/');
                fields.theme.model = theme_splitted[theme_splitted.length - 1];
              }

              if (graph[index_dataset].hasOwnProperty('page')) {
                fields.documentation.model = graph[index_dataset]['page'] || '';
              }

              // Set temporal data fields
              if (index_temporal) {
                let temporalData = graph[index_temporal];
                if (temporalData.hasOwnProperty('startDate')) fields.temporalfrom.model = moment(temporalData['startDate']);
                if (temporalData.hasOwnProperty('endDate')) fields.temporalto.model = moment(temporalData['endDate']);
              }

              if (index_contactpoint) {
                var type_splitted = graph[index_contactpoint]['@type'].split('#');
                fields.contactpointtype.model = type_splitted[type_splitted.length - 1].toUpperCase() || '';
                fields.contactpointname.model = graph[index_contactpoint]['fn'] || '';

                if (graph[index_contactpoint].hasOwnProperty('hasEmail')) {
                  fields.contactpointmail.model = graph[index_contactpoint]['hasEmail'];
                  fields.contactpointmail.model = fields.contactpointmail.model.split(':');
                  fields.contactpointmail.model = fields.contactpointmail.model[fields.contactpointmail.model.length - 1];
                }
              }

              if (typeof(index_location) == 'number' && graph[index_location].hasOwnProperty('geometry')) {
                var geoJSON = graph[index_location]['geometry'];
                try {
                  geoJSON = JSON.parse(geoJSON);
                  $scope.geoJSON = geoJSON;
                } catch(e) {
                  console.log(e);
                }                
              }
            };


            /**
             * Loads from data from JSON-LD format into page
             */

            self.loadDatasetMetadata = function () {
              ExtendedMetadataAPIService.getDatasetMetadata(self.DATASET_ID, self.PROJECT_ID)
                .then(function(data) {
                  self.updateModelsFromData(data.data);
                })
                .catch(function(error) {
                  console.error(error);
                  if (error.data && error.data === '404 - Not Found - null') console.log('No extended metadata found for dataset', self.DATASET_ID);
                });              
            };

            self.loadDatasetMetadata();            

            /**
             * Saves form data in JSON-LD format as metadata with hopsworks
             */

            self.saveExtendedDatasetMetadata = function () {
              var metadataObject = JSON.parse(JSON.stringify(self.template));
              var graph = metadataObject['@graph'];
              var fields = $scope.data.fields;
              var i = 0;

              graph[0]['@id'] = 'https://europeandataportal.eu/set/data/' + self.DATASET_ID;
              graph[0]['title'] = $scope.data.fields.title.model;
              graph[0]['description'] = $scope.data.fields.description.model;

              if (fields.language.model != '') graph[0]['language'] = 'http://publications.europa.eu/resource/authority/language/' + fields.language.model;
              if (fields.keywords.tags.length) graph[0]['http://www.w3.org/ns/dcat#keyword'] = fields.keywords.model.split(',');
              if (fields.price.model) graph[0]['http://www.aegis-bigdata.eu/md/voc/core/price'] = fields.price.model;
              if (fields.sellable.model) graph[0]['http://www.aegis-bigdata.eu/md/voc/core/sellable'] = fields.sellable.model;
              if (fields.accessRights.model) graph[0]['dct:accessRights'] = fields.accessRights.model;
              if (fields.documentation.model) {
                graph[0]['http://xmlns.com/foaf/0.1/page'] = {
                  '@id': fields.documentation.model
                }
              }

              if (fields.theme.model) {
                graph[0]['http://www.w3.org/ns/dcat#theme'] = {
                  '@id': 'http://publications.europa.eu/resource/authority/data-theme/' + fields.theme.model
                }
              }

              function generateSpatialData (latlngs, coordsNeedMapping) {
                var spatialData = null;
                var coordinates = latlngs;

                if (coordsNeedMapping) {
                  coordinates = latlngs.map(function(coordpair) {
                    return [coordpair.lat, coordpair.lng]
                  });
                }

                return spatialData = {
                  '@type': 'http://purl.org/dc/terms/Location',
                  geometry: JSON.stringify({
                    type: 'polygon',
                    coordinates: [
                      coordinates
                    ]
                  })
                }
              }

              if ($scope.data.areaSelect) {
                var latlngs = $scope.data.areaSelect[0];
                var spatial =  generateSpatialData(latlngs, true);
                spatial['@id'] = '_:b' + i;
                graph[0]['spatial'] = '_:b' + i;
                graph.push(spatial);
                i++;
              } else if ($scope.geoJSON) {
                var latlngs = $scope.geoJSON.coordinates[0];
                var spatial =  generateSpatialData(latlngs);
                spatial['@id'] = '_:b' + i;
                graph[0]['spatial'] = '_:b' + i;
                graph.push(spatial);
                i++;
              } else {
                graph[0]['spatial'] = null;
              }

              // Add temporal object (from / to date)            
              if (fields.temporalfrom.model) {
                var temporalData = {
                  '@id': '_:b' + i,
                  '@type': 'dct:PeriodOfTime',
                  'schema:startDate': {
                    '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                    '@value': moment(fields.temporalfrom.model).format()
                  }
                };

                if (fields.temporalto.model) {
                  temporalData['schema:endDate'] = {
                    '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                    '@value': moment(fields.temporalto.model).format()
                  }
                }

                graph[0]['dct:temporal'] = {'@id': '_:b' + i};
                graph.push(temporalData);
                i++;
              }

              if (fields.contactpointtype.model || fields.contactpointname.model || fields.contactpointmail.model) {
                let mail = fields.contactpointmail.model;
                if (mail != '' && !mail.startsWith('mailto:')) mail = 'mailto:' + mail;

                var contactPoint = {
                  '@id': '_:b' + i,
                  '@type': 'http://www.w3.org/2006/vcard/ns#' + fields.contactpointtype.model || 'Organization',
                  'http://www.w3.org/2006/vcard/ns#fn': fields.contactpointname.model || '',
                  'http://www.w3.org/2006/vcard/ns#hasEmail': {
                    '@id': mail
                  }
                };
                
                graph[0]['http://www.w3.org/ns/dcat#contactPoint'] = {'@id': '_:b' + i};
                graph.push(contactPoint);
                i++;
              }

              if (fields.publishertype.model || fields.publishername.model || fields.homepage.model) {
                let type = fields.publishertype.model != '' ? fields.publishertype.model : null;
                graph[0].publisher = {
                  "homepage": fields.homepage.model || '',
                  "name": fields.publishername.model || ''
                };
                if (type) graph[0].publisher['@type'] = "http://xmlns.com/foaf/0.1/" + type;
              }


              $scope.saveButtonIsDisabled = true;
              
              // Send to API
              ExtendedMetadataAPIService.createOrUpdateDatasetMetadata(self.DATASET_ID, self.PROJECT_ID, metadataObject)
                .then(function(success) {
                  growl.success('Dataset metadata successfully saved.', {title: 'Success', ttl: 5000});
                })
                .catch(function(error) {
                  growl.error('Server error: ' + error.status, {title: 'Error while saving dataset metadata', ttl: 5000, referenceId: 0});
                })
                .finally(function() {
                  $scope.saveButtonIsDisabled = false;
                });


              var hopsExtendedMetadata = {};
              if (fields.price.model) {
                hopsExtendedMetadata['price'] = fields.price.model;
              }

              MetadataRestService.addExtendedMetadata(
                    self.PROJECT_ID,
                    self.projectName,
                    self.datasetName,
                    null,
                    hopsExtendedMetadata
                );
            };

            /**
             * [deleteExtendedMetadataForProject description]
             * @return {[type]} [description]
             */
            
            self.deleteExtendedMetadata = function () {
              $scope.deleteButtonIsDisabled = true;

              ExtendedMetadataAPIService.deleteDatasetMetadata(self.DATASET_ID, self.PROJECT_ID)
                .then(function(success) {
                  // Clear form fields if delete is successful
                  for (var key in $scope.data.fields) {
                    var field = $scope.data.fields[key];                
                    field.model = '';
                  }
                  growl.success('Dataset metadata successfully deleted.', {title: 'Success', ttl: 1000});
                })
                .catch(function(error) {
                  let message = 'Server error: ' + error.status;
                  if (error.data && error.data.cause) message = 'Cause: ' + error.data.cause;
                  growl.error(message, {title: 'Error while deleting dataset metadata', ttl: 5000, referenceId: 0});
                })
                .finally(function() {
                  $scope.deleteButtonIsDisabled = false;
                });
            };

            /**
             * Entry point for saving extended metadata from fields in project-view
             * Is triggered on clicking the 'Save Metadata' button
             */

            self.saveExtendedMetadata = function () {
              if (!$scope.form.extendedMetadata.$valid) {
                console.warn('Can"t submit form - missing or invalid fields!');
                return;
              }
              self.saveExtendedDatasetMetadata();
            };
          }
        ]);
