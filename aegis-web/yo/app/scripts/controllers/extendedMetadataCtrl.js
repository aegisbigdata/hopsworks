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
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService', 'ExtendedMetadataAPIService', '$http',
          function ($location, $anchorScroll, $cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService, ExtendedMetadataAPIService, $http) {
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

            $scope.form = {};
            $scope.deleteButtonIsDisabled = false;
            $scope.saveButtonIsDisabled = false;
            $scope.data = {
              areaSelect: null,
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
              var index_location, index_organization, index_catalog;

              // Determine indexes
              graph.forEach(function(entry, index) {
                if (!entry.hasOwnProperty('@type')) return;
                let type = entry['@type'].split('/');
                type = type[type.length - 1].toUpperCase();
                if (type == 'LOCATION') index_location = index;
                if (type == 'ORGANIZATION' || type == 'INDIVIDUAL') index_organization = index;
                if (type == 'DCAT#CATALOG') index_catalog = index;
              })

              // Set publisher Info
              var type_splitted = graph[index_organization]['@type'].split('/');
              fields.publishertype.model = type_splitted[type_splitted.length - 1].toUpperCase();
              fields.publishername.model = graph[index_organization].name;
              fields.homepage.model = graph[index_organization].homepage;

              // Set Language field
              if (graph[index_catalog].hasOwnProperty('language')) {
                var language_splitted = graph[index_catalog].language.split('/');
                fields.language.model = language_splitted[language_splitted.length - 1];
              }

              // Set License field
              if (graph[index_catalog].hasOwnProperty('license')) {
                var license_splitted = graph[index_catalog].license.split('/');
                fields.license.model = license_splitted[license_splitted.length - 1];
              }

              if (typeof(index_location) == 'number' && graph[index_location].hasOwnProperty('geometry')) {
                var geoJSON = graph[index_location].geometry;
                try {
                  geoJSON = JSON.parse(geoJSON);
                  $scope.geoJSON = geoJSON;
                } catch(e) {
                  console.log(e);
                }                
              }

              // Set other fields
              fields.title.model = graph[index_catalog].title;
              fields.description.model = graph[index_catalog].description;
            };


            /**
             * Loads from data from JSON-LD format into page
             */
            
            self.loadExtendedProjectMetadata = function () {
              ExtendedMetadataAPIService.getProjectMetadata(PROJECT_ID)
                .then(function(data) {
                  self.updateModelsFromData(data.data);
                })
                .catch(function(error) {
                  console.error(error);
                  if (error.data && error.data === '404 - Not Found - null') console.log('No extended metadata found for project', PROJECT_ID);
                });              
            };

            self.loadExtendedProjectMetadata();


            /**
             * Saves form data in JSON-LD format as metadata with hopsworks
             */
            
            self.saveExtendedProjectMetadata = function () {
              var metadataObject = JSON.parse(JSON.stringify(self.template))
              var graph = metadataObject['@graph'][0];
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

              if ($scope.data.fields.license.model  != '') graph.license = 'http://publications.europa.eu/resource/authority/licence/' + $scope.data.fields.license.model;
              if ($scope.data.fields.language.model  != '') graph.language = 'http://publications.europa.eu/resource/authority/language/' + $scope.data.fields.language.model;
              graph.publisher['@type'] = 'http://xmlns.com/foaf/0.1/' + $scope.data.fields.publishertype.model;

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
                graph['spatial'] = generateSpatialData(latlngs, true);
              } else if ($scope.geoJSON) {
                var latlngs = $scope.geoJSON.coordinates[0];
                graph['spatial'] = generateSpatialData(latlngs);
              } else {
                graph['spatial'] = null;
              }

              console.log(metadataObject['@graph'][0]);
              $scope.saveButtonIsDisabled = true;
              
              // Send to API
              ExtendedMetadataAPIService.createOrUpdateProjectMetadata(PROJECT_ID, metadataObject)
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


            /**
             * [deleteExtendedMetadataForProject description]
             * @return {[type]} [description]
             */
            
            self.deleteExtendedMetadata = function () {
              $scope.deleteButtonIsDisabled = true;

              ExtendedMetadataAPIService.deleteProjectMetadata(PROJECT_ID)
                .then(function(success) {
                  // Clear form fields if delete is successful
                  for (var key in $scope.data.fields) {
                    var field = $scope.data.fields[key];                
                    field.model = '';
                  }
                  growl.success('Project metadata successfully deleted.', {title: 'Success', ttl: 1000});
                })
                .catch(function(error) {
                  let message = 'Server error: ' + error.status;
                  if (error.data && error.data.cause) message = 'Cause: ' + error.data.cause;
                  growl.error(message, {title: 'Error while deleting project metadata', ttl: 5000, referenceId: 0});
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

            $scope.selected = undefined;
            $scope.getLocation = function(val) {
              return ["hallo"];
            };

            $scope.getLindaLicences = function(val) {
              return ["hallo"];
              var url = "https://bbc6.sics.se:8181/hopsworks-api/linda/licence_index/_search?pretty";

              var query = {
                "query": {
                  "bool": {
                    "should": [
                      {
                        "nested": {
                          "path": "altLabel",
                          "query": {
                            "match": {
                              "altLabel.#text": {
                                "query": val,
                                "operator": "and"
                              }
                            }
                          }
                        }
                      },
                      {
                        "nested": {
                          "path": "prefLabel",
                          "query": {
                            "match": {
                              "prefLabel.#text": {
                                "query": val,
                                "operator": "and"
                              }
                            }
                          }
                        }
                      }
                    ]
                  }
                }
              };
               var options = {
                 headers: {
                   'Content-Type': 'application/json',
                 }
               };

              return $http.post(url, query, options).then(function(response){
                return ["hallo"];
                var selection = [];
                var results = response.data.hits.hits;
                results.forEach(function (val) {
                  val._source.prefLabel.map(function (item) {
                    if(item['@lang'] === 'en') {
                      selection.push(item['#text']);
                    }
                  });
                });

                console.info(selection);
                return selection;
                // return response.data.hits.hits.map(function(item){
                //   return item._source.altLabel['#text'];
                // });
              });
            };

            $scope.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

          }
        ]);
