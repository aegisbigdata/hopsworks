/*
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
 *
 */

/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

/**
 * Created by ermiasg on 2015-05-17.
 */
'use strict';


angular.module('hopsWorksApp')
        .controller('DataSetCreatorCtrl', ['$cookies', '$uibModalInstance', 'DataSetService', 'MetadataActionService', '$routeParams', 'growl', 'path',
          function ($cookies, $uibModalInstance, DataSetService, MetadataActionService, $routeParams, growl, path) {

            var self = this;
            self.path = path;
            self.working = false;
            self.datasets = [];
            self.selectedTemplate = {};
            self.temps = [{'temp': "temp"}];
            self.dataSet = {'name': "", 'description': "", 'template': "", 'searchable': true, 'generateReadme': true};
            var pId = $routeParams.projectID;
            var dataSetService = DataSetService(pId);

            self.templates = [];

            self.regex = /^(?!.*?__|.*?&|.*? |.*?\/|.*\\|.*?\?|.*?\*|.*?:|.*?\||.*?'|.*?\"|.*?<|.*?>|.*?%|.*?\(|.*?\)|.*?\;|.*?#).*$/;

            MetadataActionService.fetchTemplates($cookies.get('email'))
                    .then(function (response) {
                      if (response.board != undefined && response.board !== null && response.status !== "ERROR") {
                        var temps = JSON.parse(response.board);
                        angular.forEach(temps.templates, function (value, key) {
                          self.templates.push(value);
                        });
                      }
                    }, function (error) {
                      console.log("ERROR " + JSON.stringify(error));
                    });

            var createDataSetDir = function (dataSet) {
              self.working = true;
              dataSetService.createDataSetDir(dataSet)
                      .then(function (success) {
                        self.working = false;
                        $uibModalInstance.close(success);
                      },
                              function (error) {
                                self.working = false;
                                growl.error(error.data.errorMsg, {title: 'Error', ttl: 10000});
                              });
            };

            var createTopLevelDataSet = function (dataSet) {
              self.working = true;
              dataSetService.createTopLevelDataSet(dataSet)
                      .then(function (success) {
                        self.working = false;
                        $uibModalInstance.close(success);
                      },
                              function (error) {
                                self.working = false;
                                growl.error(error.data.errorMsg, {title: 'Error', ttl: 10000});
                              });
            };

            self.close = function () {
              $uibModalInstance.dismiss('cancel');
            };

            self.saveDataSetDir = function () {
              self.dataSet.template = self.selectedTemplate.id;
              if (path) {
                //Assign it to new var to avoid showing the 
                var newDS = self.dataSet;
                newDS.name = path + '/' + newDS.name;
                createDataSetDir(newDS);
              } else {
                createTopLevelDataSet(self.dataSet);
              }
            };
          }]);

