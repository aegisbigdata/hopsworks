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
        .controller('ExtendedMetadataFileCtrl', ['$location', '$cookies', '$uibModal', '$scope', '$rootScope', '$routeParams',
          '$filter', 'DataSetService', 'ModalService', 'growl', 'MetadataActionService',
          'MetadataRestService', 'MetadataHelperService', 'ProjectService', 'ExtendedMetadataService',
          function ($location, $cookies, $uibModal, $scope, $rootScope, $routeParams, $filter, DataSetService,
                  ModalService, growl, MetadataActionService, MetadataRestService,
                  MetadataHelperService, ProjectService, ExtendedMetadataService) {
            const PROJECT_ID = $routeParams.projectID;
            const DISTRIBUTION_ID = $routeParams.distributionID;
            const self = this;

            self.filePreviewLoaded = false;
            self.filePreviewShowing = false;
            self.rdf = {
              doc: {
                "http://purl.org/dc/terms/title": {'@id': ''},
                "http://purl.org/dc/terms/description": {'@id': ''},
                "http://purl.org/dc/terms/format": {'@id': ''},
                "http://xmlns.com/foaf/0.1/Agent": {'@id': ''},
                'http://purl.org/dc/terms/language': {'@id': ''},
                'http://purl.org/dc/terms/license': {'@id': ''},
                'http://purl.org/dc/terms/typeannotation': {'@id': ''}
              },
              context: {
                "dcat": "http://www.w3.org/ns/dcat#",
                "dcterms": "http://purl.org/dc/terms/",
                "foaf": "http://xmlns.com/foaf/0.1/",
                "title": {"@id" : "http://purl.org/dc/terms/title", "@type": "@id"},
                "description": {"@id" : "http://purl.org/dc/terms/description", "@type": "@id"},
                "format": {"@id" : "http://purl.org/dc/terms/format", "@type": "@id"},
                "language": {"@id": 'http://purl.org/dc/terms/language', "@type": "@id"},
                "license": {"@id": 'http://purl.org/dc/terms/license', "@type": "@id"}
              }
            };

            $scope.form = {};
            $scope.data = {
              fields: {
                title: {
                  label: 'Title',
                  description: 'Description for title field',
                  mapping: 'http://purl.org/dc/terms/title',
                  model: '',
                  required: true
                },
                description: {
                  label: 'Description',
                  description: 'Description for description field',
                  mapping: 'http://purl.org/dc/terms/description',
                  model: '',
                  required: true
                },
                format: {
                  label: 'Format',
                  description: 'File format',
                  mapping: 'http://purl.org/dc/terms/format',
                  model: '',
                  recommended: true,
                  options: ExtendedMetadataService.FILE_FORMATS
                },
                license: {
                  label: 'Licence',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: '',
                  mapping: 'http://purl.org/dc/terms/license',
                  recommended: true,
                  options: ExtendedMetadataService.LICENCES
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
                typeannotation: {
                  label: 'Type of Data',
                  description: 'Lorem ipsum dolor sit amet.',
                  model: {
                    fields: []
                  },
                  mapping: 'http://purl.org/dc/terms/typeannotation',
                  recommended: true
                }
              },
              bounds: null
            };

            var dataSetService = DataSetService(PROJECT_ID);

            /**
             * Loads from data from JSON-LD format into page
             */
            self.loadExtendedDistroMetadata = function () {
              MetadataRestService.getMetadata(DISTRIBUTION_ID).then(function (distributionMetadata) {
                if (!distributionMetadata.data[AEGIS_DISTRIBUTION_TEMPLATE_NAME] ||
                    !distributionMetadata.data[AEGIS_DISTRIBUTION_TEMPLATE_NAME].metadata.payload.length) {
                  return;
                }

                let data = distributionMetadata.data[AEGIS_DISTRIBUTION_TEMPLATE_NAME].metadata.payload[0];
                // what we get back isn't proper stringified JSON, so we need to unmangle it before parsing
                data = JSON.parse(data
                  .replace(/\\@/g, '"@')
                  .replace(/\\:\\/g, '":"')
                  .replace(/\\:/g, '":')
                  .replace(/\{\\/g, '\{"')
                  .replace(/\\\{/g, '\"}')
                  .replace(/\\\}/g, '"\}')
                  .replace(/,\\/g, ',"')
                  .replace(/\\,/g, '",')
                  .replace(/"\\\\/g, '\\"')
                  .replace(/\\\\"/g, '\\"'))['@graph'][0];

                for (var key in data) {
                  if (data.hasOwnProperty(key) && $scope.data.fields.hasOwnProperty(key)) {
                    if (data[key] === './') continue;
                    $scope.data.fields[key].model = data[key].substr(1);
                  }
                }
                if (data['dcterms:typeannotation']) {
                  $scope.data.fields.typeannotation.model = JSON.parse(data['dcterms:typeannotation']['@id']);
                }

              });
            };
            self.loadExtendedDistroMetadata();

            /**
             * Saves form data in JSON-LD format as metadata with hopsworks
             */
            self.saveExtendedDistroMetadata = function () {
              let data = $scope.data;
              data.fields.typeannotation.model = JSON.stringify(data.fields.typeannotation.model);

              dataSetService.getAllDatasets().then(function (allDatasets) {
                const tasks = allDatasets.data.map(function (dataset) {
                  return dataSetService.getContents(dataset.name);
                });
                Promise.all(tasks).then(function (contents) {
                  let distribution;

                  contents = contents.map(function (content) {
                    return content.data;
                  }).reduce(function (acc, val) {
                    // flatten result array
                    return acc.concat(val);
                  }, []);

                  // find metadata object for this distribution id
                  for (let i = 0; i < contents.length; i++) {
                    if (contents[i].id == DISTRIBUTION_ID) {
                      distribution = contents[i];
                      break;
                    }
                  }

                  let template = {
                    templateId: AEGIS_DISTRIBUTION_TEMPLATE_ID,
                    inodePath: distribution.path
                  };
                  dataSetService.detachTemplate(DISTRIBUTION_ID, AEGIS_DISTRIBUTION_TEMPLATE_ID).finally(function () {
                    dataSetService.attachTemplate(template).then(function () {
                      ExtendedMetadataService.saveExtendedMetadata(data, self.rdf.doc, self.rdf.context).then(function (jsonldData) {
                        const metaData = { 5: jsonldData };
                        MetadataRestService.addMetadataWithSchema(
                          parseInt(distribution.parentId), distribution.name, -1, metaData).then(function () {
                            growl.success(
                              'Done saving.',
                              {title: 'Success', ttl: 1000}
                            );
                          }, function (error) {
                            growl.error('Metadata could not be saved', {title: 'Error', ttl: 1000});
                          });
                      });
                    }).catch(function (error) {
                      growl.error(
                        'Could not save. Attach template failed.',
                        {title: 'Error', ttl: 5000}
                      );
                    });
                  });


                });
              });

            };

            /**
             * Helper function to filter fields by type
             */

            $scope.fieldFilter = function (filter) {
              return Object.keys($scope.data.fields).filter(element => $scope.data.fields[element][filter] === true);
            }

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
