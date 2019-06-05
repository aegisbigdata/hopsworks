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

const AEGIS_PROJECT_TEMPLATE_ID = 14;
const AEGIS_PROJECT_TEMPLATE_NAME = 'aegis-distribution';

angular.module('hopsWorksApp')
        .controller('ExtendedMetadataCtrl', ['$location', '$anchorScroll', '$cookies', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$filter', 'DataSetService', 'ModalService', 'growl', 'MetadataActionService',
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService', 'ExtendedMetadataAPIService',
          function ($location, $anchorScroll, $cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService, ExtendedMetadataAPIService) {
            const PROJECT_ID = $routeParams.projectID;
            var self = this;

            self.selectedField = null;
            self.metaData = {};
            self.metaDataDetail = {};

            self.template = {
              "@graph": [
                {
                  "@id": "https://aegis.eu/id/project/",
                  "@type": "http://www.w3.org/ns/dcat#Catalog",
                  "description": "",
                  "language": "",
                  "license": "",
                  "modified": "",
                  "publisher": {
                    "@type": "http://xmlns.com/foaf/0.1/Organization",
                    "homepage": "",
                    "name": ""
                  },
                  "spatial": {
                    "@type": "http://purl.org/dc/terms/Location",
                    "geometry": ""
                  },
                  "title": "",
                  "type": "dcat-ap"
                }
              ],
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
                }
              }
            };

            self.mockResponse = {
              "@graph": [
                {
                  "@id": "_:b0",
                  "@type": "http://xmlns.com/foaf/0.1/Organization",
                  "homepage": "http://www.fokus.fraunhofer.de",
                  "name": "Fraunhofer FOKUS"
                },
                {
                  "@id": "_:b1",
                  "@type": "http://purl.org/dc/terms/Location",
                  "geometry": "{\"type\": \"polygon\", \"coordinates\": [[[10.326304, 53.394985], [10.326304, 53.964153], [8.420551, 53.964153], [8.420551, 53.394985], [10.326304, 53.394985]]]}"
                },
                {
                  "@id": "https://europeandataportal.eu/id/catalogue/1049",
                  "@type": "http://www.w3.org/ns/dcat#Catalog",
                  "description": "This is an example Project",
                  "language": "http://publications.europa.eu/resource/authority/language/ENG",
                  "license": "http://publications.europa.eu/resource/authority/licence/CC_BYNCND_4_0",
                  "modified": "2019-05-16T14:02:00Z",
                  "publisher": "_:b0",
                  "spatial": "_:b1",
                  "title": "Example Project",
                  "type": "dcat-ap"
                }
              ],
              "@context": {
                "homepage": {
                  "@id": "http://xmlns.com/foaf/0.1/homepage",
                  "@type": "@id"
                },
                "name": {
                  "@id": "http://xmlns.com/foaf/0.1/name"
                },
                "description": {
                  "@id": "http://purl.org/dc/terms/description"
                },
                "license": {
                  "@id": "http://purl.org/dc/terms/license",
                  "@type": "@id"
                },
                "language": {
                  "@id": "http://purl.org/dc/terms/language",
                  "@type": "@id"
                },
                "publisher": {
                  "@id": "http://purl.org/dc/terms/publisher",
                  "@type": "@id"
                },
                "spatial": {
                  "@id": "http://purl.org/dc/terms/spatial",
                  "@type": "@id"
                },
                "type": {
                  "@id": "http://purl.org/dc/terms/type"
                },
                "title": {
                  "@id": "http://purl.org/dc/terms/title"
                },
                "modified": {
                  "@id": "http://purl.org/dc/terms/modified",
                  "@type": "http://www.w3.org/2001/XMLSchema#dateTime"
                },
                "geometry": {
                  "@id": "http://www.w3.org/ns/locn#geometry",
                  "@type": "https://www.iana.org/assignments/media-types/application/vnd.geo+json"
                }
              }
            };

            $scope.form = {};
            $scope.deleteButtonIsDisabled = false;
            $scope.data = {
              fields: {
                title: {
                  label: 'Title',
                  description: 'Description for title field',
                  mapping: 'title',
                  model: '',
                  required: true
                },
                description: {
                  label: 'Description',
                  description: '',
                  mapping: 'description',
                  model: '',
                  required: true
                },
                publishertype: {
                  label: 'Publisher Type',
                  description: 'Description for publisher field',
                  mapping: 'publisher.@type',
                  model: '',
                  required: true,
                },
                publishername: {
                  label: 'Publisher Name',
                  description: 'Description for publisher field',
                  mapping: 'publisher.name',
                  model: '',
                  required: true,
                },
                homepage: {
                  label: 'Publisher Homepage',
                  description: 'Lorem ipsum dolor sit amet.',
                  mapping: 'publisher.homepage',
                  model: '',
                  required: true
                },
                license: {
                  label: 'Licence',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  mapping: 'license',
                  recommended: true,
                  options: ExtendedMetadataService.LICENCES
                },
                language: {
                  label: 'Language',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  mapping: 'language',
                  recommended: true,
                  type: 'select',
                  options: ExtendedMetadataService.LANGUAGES
                },
                spatial: {
                  label: 'Spatial',
                  model: '',
                  mapping: 'spatial.geometry',
                  optional: true
                }
              },
              bounds: null
            };

            var dataSetService = DataSetService($routeParams.projectID);

            //update the current template whenever other users make changes
            var listener = $rootScope.$on("template.change", function (event, response) {
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
            $scope.$on("$destroy", function () {
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
             * @param  {[type]} filter [description]
             * @return {[type]}        [description]
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


            /**
             *   Receives data from ExtendedMetadataService and sets models of each available field
             *   WIP until Service is working / API endpoints are defined
             */

            self.setExtendedMetadata = function (data) {
              for (var key in data) {
                if (data.hasOwnProperty(key) && $scope.data.fields.hasOwnProperty(key)) {
                  $scope.data.fields[key].model = data[key]; 
                }
              }
            };


            self.updateModelsFromData = function (jsonld) {
              if (!jsonld.hasOwnProperty('@graph')) return;
              var graph = jsonld['@graph'];
              var fields = $scope.data.fields;

              // Set publisher Info
              var type_splitted = graph[0]['@type'].split('/');
              fields.publishertype.model = type_splitted[type_splitted.length - 1].toUpperCase();
              fields.publishername.model = graph[0].name;
              fields.homepage.model = graph[0].homepage;

              // Set Language field
              var language_splitted = graph[2].language.split('/');
              fields.language.model = language_splitted[language_splitted.length - 1];

              // Set License field
              var license_splitted = graph[2].license.split('/');
              fields.license.model = license_splitted[license_splitted.length - 1];

              // Set other fields
              fields.title.model = graph[2].title;
              fields.description.model = graph[2].description;

            };

            /**
             * Loads from data from JSON-LD format into page
             */
            
            self.loadExtendedProjectMetadata = function () {
              ExtendedMetadataAPIService.getExtMetadataForProject(PROJECT_ID)
                .then(function(data) {
                  console.log(data);
                })
                .catch(function(error) {
                  console.error(error);
                });

              // Until CORS is enabled, update models with mock data...
              self.updateModelsFromData(self.mockResponse);
            };

            self.loadExtendedProjectMetadata();


            /**
             * Saves form data in JSON-LD format as metadata with hopsworks
             */
            
            self.saveExtendedProjectMetadata = function () {
              var graph = self.template['@graph'][0];
              graph['@id'] = 'https://aegis.eu/id/project/' + PROJECT_ID;
              graph.modified = (new Date()).toISOString();

              // Populate template fields
              for (var key in $scope.data.fields) {
                var field = $scope.data.fields[key];                
                if (field.hasOwnProperty('mapping')) {
                  var mapping = field.mapping;
                  if (field.hasOwnProperty('model')) {
                    ExtendedMetadataService.setProperty(graph, mapping, field.model);
                  } 
                }
              }

              console.log(self.template['@graph'][0]);

              // Send to API (WIP)
              // ExtendedMetadataAPIService.storeExtendedMetadataForProject(PROJECT_ID, self.template); 
            };


            /**
             * [deleteExtendedMetadataForProject description]
             * @return {[type]} [description]
             */
            
            self.deleteExtendedMetadata = function () {
              $scope.deleteButtonIsDisabled = true;

              ExtendedMetadataAPIService.deleteExtendedMetadataForProject(PROJECT_ID)
                .then(function(success) {
                  // Clear form fields if delete is successful
                  for (var key in $scope.data.fields) {
                    var field = $scope.data.fields[key];                
                    field.model = '';
                  }
                  growl.success('Project metadata successfully deleted.', {title: 'Success', ttl: 1000});
                })
                .catch(function(error) {
                  growl.error('Server error: ' + error.status, {title: 'Error while deleting project metadata', ttl: 5000, referenceId: 0});
                })
                .finally(function() {
                  $scope.deleteButtonIsDisabled = false;
                });
            };


            /**
             * Entry point for saving extended metadata from fields in project-view
             * Is triggered on clicking the "Save Metadata" button
             */

            self.saveExtendedMetadata = function () {
              if (!$scope.form.extendedMetadata.$valid) {
                console.warn("Can't submit form - missing or invalid fields!");
                return;
              }

              self.saveExtendedProjectMetadata();
            };
          }
        ]);
