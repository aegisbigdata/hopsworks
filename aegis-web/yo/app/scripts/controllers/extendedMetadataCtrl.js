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

            $scope.form = {};
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


            /**
             * Loads from data from JSON-LD format into page
             */
            self.loadExtendedDistroMetadata = function () {
              // MetadataRestService.getMetadata(4500621).then(function (datasetMetadata) {

              //   console.log(datasetMetadata);
              //   if (!datasetMetadata.data[AEGIS_PROJECT_TEMPLATE_NAME] ||
              //       !datasetMetadata.data[AEGIS_PROJECT_TEMPLATE_NAME].metadata.payload.length) {
              //     console.log('No metadata available.');
              //     return;
              //   }

              //   let data = datasetMetadata.data[AEGIS_PROJECT_TEMPLATE_NAME].metadata.payload[0];
              //   data = JSON.parse(data.replace(/\\/g, '"'))['@graph'][0];

              //   for (var key in data) {
              //     if (data.hasOwnProperty(key) && $scope.data.fields.hasOwnProperty(key)) {
              //       if (data[key] === './') continue;
                    
              //       if (typeof(data[key]) === 'string') {
              //         // Standard string field
              //         $scope.data.fields[key].model = data[key].substr(1);
              //       } else if (typeof(data[key]) === 'object' && data[key].hasOwnProperty('@id')) {
              //         // Nested object with @id property
              //         $scope.data.fields[key].model = data[key]['@id'].substr(1);
              //       }
              //     }
              //   }
              // });
            };

            // self.loadExtendedDistroMetadata();


            /**
             * Saves form data in JSON-LD format as metadata with hopsworks
             */
            
            self.saveExtendedProjectMetadata = function () {
              var graph = self.template['@graph'][0];
              graph['@id'] = 'https://aegis.eu/id/project/' + PROJECT_ID;

              for (var key in $scope.data.fields) {
                var field = $scope.data.fields[key];
                
                if (field.hasOwnProperty('mapping')) {
                  var mapping = field.mapping;
                  

                  if (field.hasOwnProperty('model')) {
                    ExtendedMetadataService.setProperty(graph, mapping, field.model);
                  } 
                }
              }

              console.log(self.template);

              // ProjectService.get({}, {'id': PROJECT_ID}).$promise.then(
              //   function (project) {
              //     console.log(project);

              //     let template = {
              //       templateId: AEGIS_PROJECT_TEMPLATE_ID,
              //       inodePath: '/Projects/' + project.projectName
              //     };

              //     dataSetService.detachTemplate(project.inodeid, AEGIS_PROJECT_TEMPLATE_ID).finally(function () {
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
              //             parseInt(project.inodeid), project.projectName, -1, metaData).then(function () {
              //               console.log('done?')
              //             }, function (error) {
              //               growl.error('Metadata could not be saved', {title: 'Info', ttl: 1000});
              //             });
              //         });
              //       });
              //     });
              //   },
              //   function(error) {
              //     console.log(error);
              //   });
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
