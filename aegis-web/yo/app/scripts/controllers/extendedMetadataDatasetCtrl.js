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
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService', 'ExtendedMetadataAPIService',
          function ($location, $anchorScroll, $cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService, ExtendedMetadataAPIService) {
            const PROJECT_ID = $routeParams.projectID;
            const DATASET_ID = $routeParams.dataSetID;
            var self = this;

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
                  "dct:accessRights": ":public",
                  "description": "",
                  "title": ""
                }
              ]
            };

            $scope.form = {};
            $scope.path = $location.path();
            $scope.data = {
              fields: {
                title: {
                  label: 'Title',
                  description: 'Description for title field',
                  model: '',
                  mapping: 'http://purl.org/dc/terms/title',
                  required: true
                },
                description: {
                  label: 'Description',
                  description: 'Description for description field',
                  model: '',
                  mapping: 'http://purl.org/dc/terms/description',
                  required: true
                },
                contactpointtype: {
                  label: 'Contact Point Type',
                  description: 'Description for Contact Point field',
                  model: '',
                  mapping: 'http://xmlns.com/foaf/0.1/Agent',
                  recommended: true,
                },
                contactpointname: {
                  label: 'Contact Point Name',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  mapping: 'http://xmlns.com/foaf/0.1/Agent',
                  recommended: true,
                },
                contactpointmail: {
                  label: 'Contact Point Mail',
                  description: 'Lorem ipsum dolor sit amet.',
                  mapping: 'http://purl.org/dc/terms/email',
                  model: '',
                  recommended: true
                },
                keywords: {
                  label: 'Keywords',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  tags: [],
                  mapping: 'http://xmlns.com/foaf/0.1/keywords',
                  recommended: true
                },
                contactpointtype: {
                  label: 'Publisher Type',
                  description: 'Description for publisher field',
                  model: '',
                  mapping: 'http://xmlns.com/foaf/0.1/Agent',
                  recommended: true,
                },
                publishername: {
                  label: 'Publisher Name',
                  description: 'Description for publisher field',
                  model: '',
                  mapping: 'http://xmlns.com/foaf/0.1/Agent',
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
                  mapping: 'http://purl.org/dc/terms/theme',
                  recommended: true
                },
                price: {
                  label: 'Price',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  mapping: 'http://xmlns.com/foaf/0.1/currency',
                  recommended: true
                },
                sellable: {
                  label: 'Sellable',
                  description: 'Lorem ipsum dolor sit amet.',
                  mapping: 'http://xmlns.com/foaf/0.1/sellable',
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
                  mapping: 'http://purl.org/dc/terms/language',
                  optional: true,
                  type: 'select',
                  options: ExtendedMetadataService.LANGUAGES
                },
                spatial: {
                  label: 'Spatial',
                  model: '',
                  mapping: 'http://purl.org/dc/terms/spatial',
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


            /**
             * Loads from data from JSON-LD format into page
             */

            self.loadDatasetMetadata = function () {
              ExtendedMetadataAPIService.getDatasetMetadata(DATASET_ID, PROJECT_ID)
                .then(function(data) {
                  console.log(data.data);
                  //self.updateModelsFromData(data.data);
                })
                .catch(function(error) {
                  console.error(error);
                  if (error.data && error.data === '404 - Not Found - null') console.log('No extended metadata found for dataset', DATASET_ID);
                });              
            };

            self.loadDatasetMetadata();            

            // self.loadExtendedDistroMetadata = function () {
            //   MetadataRestService.getMetadata(DATASET_ID).then(function (datasetMetadata) {
            //     if (!datasetMetadata.data[AEGIS_DATASET_TEMPLATE_NAME] ||
            //         !datasetMetadata.data[AEGIS_DATASET_TEMPLATE_NAME].metadata.payload) {
            //       return;
            //     }

            //     let data = datasetMetadata.data[AEGIS_DATASET_TEMPLATE_NAME].metadata.payload[0];
            //     data = JSON.parse(data.replace(/\\/g, '"'))['@graph'][0];

            //     for (var key in data) {
            //       if (data.hasOwnProperty(key) && $scope.data.fields.hasOwnProperty(key)) {
            //         if (data[key] === './') continue;
                    
            //         if (key == 'spatial') {
            //           var cleaned_spatial = data[key].substr(1);
            //           var args = cleaned_spatial.split(',');
            //           args = args.map(e => parseFloat(e));
            //           $scope.data.areaSelect = { _width: args[0], _height: args[1], center: { lat: args[2], lng: args[3] }, raw: cleaned_spatial };
            //           $scope.data.mapCenter = { lat: args[2], lng: args[3], zoom: args[4] };
            //         } else if (key == 'keywords') {
            //           // Keywords field
            //           var cleaned_keywords = data[key].substr(1);
            //           var taglist = cleaned_keywords.split(',');
            //           $scope.data.fields[key].model = cleaned_keywords;                                         
            //           $scope.data.fields[key].tags = taglist.map(tag => {
            //             return {text: tag};
            //           });
            //         } else if (typeof(data[key]) === 'string') {
            //           // Standard string field
            //           $scope.data.fields[key].model = data[key].substr(1);
            //         } else if (typeof(data[key]) === 'object' && data[key].hasOwnProperty('@id')) {
            //           // Nested object with @id property
            //           $scope.data.fields[key].model = data[key]['@id'].substr(1);
            //         }
            //       }
            //     }
            //   });
            // };

            // self.loadExtendedDistroMetadata();

            /**
             * Saves form data in JSON-LD format as metadata with hopsworks
             */

            self.saveExtendedDatasetMetadata = function () {
              var metadataObject = JSON.parse(JSON.stringify(self.template));
              var graph = metadataObject['@graph'];
              var fields = $scope.data.fields;
              var i = 0;

              graph[0]['@id'] = 'https://europeandataportal.eu/set/data/' + DATASET_ID;
              graph[0]['modified'] = (new Date()).toISOString();
              graph[0]['title'] = $scope.data.fields.title.model;
              graph[0]['description'] = $scope.data.fields.description.model;

              if (fields.language.model) graph[0]['language'] = 'http://publications.europa.eu/resource/authority/language/' + fields.language.model;
              if (fields.keywords.tags.length) graph[0]['http://www.w3.org/ns/dcat#keyword'] = fields.keywords.model.split(',');
              if (fields.price.model) graph[0]['http://www.aegis-bigdata.eu/md/voc/core/price'] = fields.price.model;
              if (fields.sellable.model) graph[0]['http://www.aegis-bigdata.eu/md/voc/core/sellable'] = fields.sellable.model;
              if (fields.accessRights.model) graph[0]['dct:accessRights'] = ':' + fields.accessRights.model;
              if (fields.documentation.model) graph[0]['http://xmlns.com/foaf/0.1/page'] = {
                '@id': fields.documentation.model
              }

              if (fields.theme.model) {
                graph[0]['http://www.w3.org/ns/dcat#theme'] = {
                  '@id': 'http://publications.europa.eu/resource/authority/data-theme/' + fields.theme.model
                }
              }

              // Add spatial object
              if (!fields.spatial.model) {
                graph[0]['spatial'] = '_:b' + i;
                graph.push({
                  '@id': '_:b' + i,
                  '@type': 'dct:Location',
                  'http://www.w3.org/ns/locn#geometry': "{\"type\": \"polygon\", \"coordinates\": [[[10.326304, 53.394985], [10.326304, 53.964153], [8.420551, 53.964153], [8.420551, 53.394985], [10.326304, 53.394985]]]}"
                });
                i++;
              }

              // Add temporal object (from / to date)
              
              console.log(fields); 
              
              if (fields.temporalfrom.model || fields.temporalto.model) {
                var temporalData = {
                  '@id': '_:b' + i,
                  '@type': 'dct:PeriodOfTime',
                  'schema:startDate': {
                    '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                    '@value': moment(fields.temporalfrom.model).format() || ''
                  },
                  'schema:endDate': {
                    '@type': 'http://www.w3.org/2001/XMLSchema#dateTime',
                    '@value': moment(fields.temporalto.model).format() || ''
                  }
                };

                graph[0]['dct:temporal'] = {'@id': '_:b' + i};
                graph.push(temporalData);
                i++;
              }

              if (fields.contactpointtype.model || fields.contactpointname.model || fields.contactpointmail.model) {
                var contactPoint = {
                  '@id': '_:b' + i,
                  '@type': 'http://www.w3.org/2006/vcard/ns#' + fields.contactpointtype.model || 'Organization',
                  'http://www.w3.org/2006/vcard/ns#fn': fields.contactpointname.model || '',
                  'http://www.w3.org/2006/vcard/ns#hasEmail': {
                    '@id': fields.contactpointmail.model || ''
                  }
                };
                
                graph[0]['http://www.w3.org/ns/dcat#contactPoint'] = {'@id': '_:b' + i};
                graph.push(contactPoint);
                i++;
              }

              console.log(graph);
              $scope.saveButtonIsDisabled = true;
              
              // Send to API
              ExtendedMetadataAPIService.createOrUpdateDatasetMetadata(DATASET_ID, PROJECT_ID, metadataObject)
                .then(function(success) {
                  growl.success('Project metadata successfully saved.', {title: 'Success', ttl: 5000});
                })
                .catch(function(error) {
                  growl.error('Server error: ' + error.status, {title: 'Error while saving project metadata', ttl: 5000, referenceId: 0});
                })
                .finally(function() {
                  $scope.saveButtonIsDisabled = false;
                });
            };
            
            // self.saveExtendedDatasetMetadata = function () {
            //   dataSetService.getAllDatasets().then(function (allDatasets) {
            //     let dataset = allDatasets.data.filter(ds => ds.id == DATASET_ID)[0];
            //     if (!dataset) return;

            //     let template = {
            //       templateId: AEGIS_DATASET_TEMPLATE_ID,
            //       inodePath: dataset.path
            //     };
            //     dataSetService.detachTemplate(DATASET_ID, AEGIS_DATASET_TEMPLATE_ID).finally(function () {
            //       dataSetService.attachTemplate(template).then(function (success) {
            //         growl.success(success.data.successMessage, {title: 'Success', ttl: 1000});
            //       }, function (error) {
            //         growl.info(
            //           'Could not attach template.',
            //           {title: 'Info', ttl: 5000}
            //         );
            //       }).then(function () {
            //         ExtendedMetadataService.saveExtendedMetadata($scope.data, self.rdf.doc, self.rdf.context).then(function (jsonldData) {
            //           const metaData = { 5: jsonldData };
            //           MetadataRestService.addMetadataWithSchema(
            //             parseInt(dataset.parentId), dataset.name, -1, metaData).then(function () {
            //               console.log('done?')
            //             }, function (error) {
            //               growl.error('Metadata could not be saved', {title: 'Info', ttl: 1000});
            //             });
            //         });
            //       });
            //     });
            //   });
            // };

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
