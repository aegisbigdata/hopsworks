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



angular.module('hopsWorksApp')
        .controller('ExtendedMetadataDatasetCtrl', ['$cookies', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$filter', 'DataSetService', 'ModalService', 'growl', 'MetadataActionService',
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService', 'ExtendedMetadataAPIService',
          function ($cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService, ExtendedMetadataAPIService) {
            const PROJECT_ID = $routeParams.projectID;
            var self = this;

            self.selectedField = null;
            self.metaData = {};
            self.metaDataDetail = {};
            // self.ext = ExtendedMetadataService.getExtMetadataForProject(1234);

            self.rdf = {
              doc: {
                'http://purl.org/dc/terms/title': {'@id': ''},
                'http://purl.org/dc/terms/description': {'@id': ''},
                'http://xmlns.com/foaf/0.1/Agent': {'@id': ''},
                'http://xmlns.com/foaf/0.1/homepage': {'@id': ''},
                'http://purl.org/dc/terms/spatial': {'@id': ''},
                'http://purl.org/dc/terms/language': {'@id': ''},
                'http://purl.org/dc/terms/license': {'@id': ''},
                'http://xmlns.com/foaf/0.1/currency:': {'@id': ''},
                'http://xmlns.com/foaf/0.1/keywords': {'@id': ''},
                'http://purl.org/dc/terms/email': {'@id': ''},
                'http://purl.org/dc/terms/theme': {'@id': ''},
                'http://purl.org/dc/terms/modified': '',
              },
              context: {
                'dcat': 'http://www.w3.org/ns/dcat#',
                'dcterms': 'http://purl.org/dc/terms/',
                'foaf': 'http://xmlns.com/foaf/0.1/',
                'title': {'@id' : 'http://purl.org/dc/terms/title'},
                'homepage': {'@id': 'http://xmlns.com/foaf/0.1/homepage', '@type': '@id'},
                'description': {'@id' : 'http://purl.org/dc/terms/description', '@type': '@id'},
                'publisher' : { '@id': 'http://xmlns.com/foaf/0.1/Agent', '@type': '@id'},
                'spatial': {'@id' : 'http://purl.org/dc/terms/spatial', '@type': '@id'},
                'language': {'@id': 'http://purl.org/dc/terms/language', '@type': '@id'},
                'license': {'@id': 'http://purl.org/dc/terms/license', '@type': '@id'},
                'keywords': {'@id': 'http://xmlns.com/foaf/0.1/keywords', '@type': '@id'},
                'contactpointmail': {'@id': 'http://purl.org/dc/terms/email', '@type': '@id'},
                'price': {'@id': 'http://xmlns.com/foaf/0.1/currency', '@type': '@id'},
                'theme': {'@id': 'http://purl.org/dc/terms/theme', '@type': '@id'},
                'sellable': {'@id': 'http://purl.org/dc/terms/sellable', '@type': '@id'},
                'modified' : {'@id' : 'http://purl.org/dc/terms/modified', '@type' : 'http://www.w3.org/2001/XMLSchema#dateTime'}
              }
            };

            $scope.form = {};
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
                  mapping: 'http://xmlns.com/foaf/0.1/keywords',
                  recommended: true
                },
                publishertype: {
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
                temporal: {
                  label: 'Temporal',
                  model: '',
                  optional: true
                },
              },
              bounds: null
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


            /**
             *  Initially get existing extended metadata for project with PROJECT_ID from Service
             *  WIP until Service is working / API endpoints are defined
             */

            // ExtendedMetadataService.getExtMetadataForProject(PROJECT_ID)
            //   .then(function (response) {
            //      self.setExtendedMetadata(response.data);
            //   })
            //   .catch(function (error) {
            //     console.log(error);
            //   });
            
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
             * Entry point for saving extended metadata from fields in project-view
             * Is triggered on clicking the 'Save Metadata' button
             */

            self.saveExtendedMetadata = function () {
              if (!$scope.form.extendedMetadata.$valid) {
                console.warn('Can"t submit form - missing or invalid fields!');
                return;
              }

              ExtendedMetadataService.saveExtendedMetadata($scope.data, self.rdf.doc, self.rdf.context)
                .then((result) => {
                  console.log(JSON.stringify(JSON.parse(result), null, 2));
                })
            };
          }
        ]);
