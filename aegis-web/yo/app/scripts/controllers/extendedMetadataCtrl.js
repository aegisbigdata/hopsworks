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

angular.module('hopsWorksApp')
        .controller('ExtendedMetadataCtrl', ['$cookies', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$filter', 'DataSetService', 'ModalService', 'growl', 'MetadataActionService',
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService',
          function ($cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService) {
            const PROJECT_ID = $routeParams.projectID;

            var self = this;
            self.metaData = {};
            self.metaDataDetail = {};
            // self.ext = ExtendedMetadataService.getExtMetadataForProject(1234);

            self.rdf = {
              doc: {
                "http://purl.org/dc/terms/title": {'@id': ''},
                "http://purl.org/dc/terms/description": {'@id': ''},
                "http://xmlns.com/foaf/0.1/Agent": {'@id': ''},
                'http://xmlns.com/foaf/0.1/homepage': {'@id': ''},
                "http://purl.org/dc/terms/spatial": {'@id': ''},
                'http://purl.org/dc/terms/language': {'@id': ''},
                'http://purl.org/dc/terms/license': {'@id': ''},
                'http://purl.org/dc/terms/modified': '',
              },
              context: {
                "dcat": "http://www.w3.org/ns/dcat#",
                "dcterms": "http://purl.org/dc/terms/",
                "foaf": "http://xmlns.com/foaf/0.1/",
                "title": {"@id" : "http://purl.org/dc/terms/title"},
                "homepage": {"@id": "http://xmlns.com/foaf/0.1/homepage", "@type": "@id"},
                "description": {"@id" : "http://purl.org/dc/terms/description", "@type": "@id"},
                "publisher" : { "@id": "http://xmlns.com/foaf/0.1/Agent", "@type": "@id"},
                "spatial": {"@id" : "http://purl.org/dc/terms/spatial", "@type": "@id"},
                "language": {"@id": 'http://purl.org/dc/terms/language', "@type": "@id"},
                "license": {"@id": 'http://purl.org/dc/terms/license', "@type": "@id"},
                "modified" : {"@id" : "http://purl.org/dc/terms/modified", "@type" : "http://www.w3.org/2001/XMLSchema#dateTime"}
              },
              data: {
                description: {
                  type: 'rdfs:Literal',
                  uri: 'dct:description',
                  mapping: "http://purl.org/dc/terms/description",
                  value: null
                },
                title: {
                  type: 'rdfs:Literal',
                  uri: 'dct:title',
                  mapping: "http://purl.org/dc/terms/title",
                  value: null
                },
                publisher: {
                  type: 'foaf:Agent',
                  uri: 'dct:publisher',
                  mapping: "http://xmlns.com/foaf/0.1/Agent",
                  value: null
                },
                homepage: {
                  type: 'foaf:Document',
                  uri: 'foaf:homepage',
                  mapping: 'http://xmlns.com/foaf/0.1/homepage',
                  value: null
                },
                license: {
                  type: 'dct:LicenseDocument',
                  uri: 'dct:license',
                  mapping: 'http://purl.org/dc/terms/license',
                  value: null
                },
                spatial: {
                  type: 'dct:Location',
                  uri: 'dct:spatial',
                  mapping: "http://purl.org/dc/terms/spatial",
                  value: null
                },
                language: {
                  type: 'dct:LinguisticSystem',
                  uri: 'dct:language',
                  mapping: 'http://purl.org/dc/terms/language',
                  value: null
                }
              }
            };

            $scope.data = {
              fields: {
                title: {
                  label: 'Title',
                  placeholder: '',
                  model: '',
                  required: true
                },
                description: {
                  label: 'Description',
                  placeholder: '',
                  model: '',
                  required: true
                },
                publisher: {
                  label: 'Publisher',
                  placeholder: '',
                  model: '',
                  required: true
                },
                homepage: {
                  label: 'Homepage',
                  placeholder: '',
                  model: '',
                  required: true
                },
                license: {
                  label: 'License',
                  placeholder: '',
                  model: '',
                  required: true
                },
                spatial: {
                  label: 'Spatial',
                  placeholder: '',
                  model: '',
                  required: true
                },
                language: {
                  label: 'Language',
                  placeholder: '',
                  model: '',
                  required: true,
                  type: 'select',
                  options: [
                    {id: 'EN', name: 'English'},
                    {id: 'DE', name: 'German'}
                  ]
                }
              }
            };

            self.attachedDetailedTemplateList = [];

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


            /**
             *   Receives data from ExtendedMetadataService and sets models of each available field
             *   WIP until Service is working / API endpoints are defined
             */

            self.setExtendedMetadata = function (data) {
              console.log(data);

              for (var key in data) {
                if (data.hasOwnProperty(key) && $scope.data.fields.hasOwnProperty(key)) {
                  $scope.data.fields[key].model = data[key]; 
                }
              }
            };


            /**
             * Entry point for saving extended metadata from fields in project-view
             * Is triggered on clicking the "Save Metadata" button
             */

            self.saveExtendedMetadata = function () {
              var modifiedKey = 'http://purl.org/dc/terms/modified';
              var data = self.rdf.data; 
              var doc = self.rdf.doc;

              for (var key in data) {
                if (data.hasOwnProperty(key)) {
                  var mapping = data[key].mapping;
                  doc[mapping]['@id'] = $scope.data.fields[key].model;
                }
              }

              doc[modifiedKey] = (new Date()).toISOString();

              self.generateRDFString();
            };


            /**
             * Generates RDF compliant representation in json-ld format
             * WIP: for now the function simply logs the json-ld to the console until Service is working / API endpoints are defined
             */

            self.generateRDFString = function () {
              jsonld.flatten(self.rdf.doc, self.rdf.context, function(err, compacted) {
                console.log(JSON.stringify(compacted, null, 2));
              });
            }
          }
        ]);
