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

/*jshint undef: false, unused: false, indent: 2*/
/*global angular: false */

'use strict';

angular.module('hopsWorksApp')
        .factory('ElasticService', ['$http', function ($http) {
            return function () {
              var services = {
                /**
                 * Do a global search hitting two indices: 'project' and 'datasets'
                 * 
                 * @param {type} searchTerm
                 * @returns {unresolved}
                 */
                globalSearch: function (searchTerm) {
                  // return $http.get('/api/elastic/globalsearch/' + searchTerm);
                  var baseUrl = '/api/elastic/search?q=' + searchTerm.q;

                  baseUrl = this.prepareParameters(searchTerm, baseUrl);

                  if(searchTerm.projId) {
                    baseUrl +=  '&projId='+ searchTerm.projId;
                  }
                  if(searchTerm.page) {
                    baseUrl +=  '&page='+ searchTerm.page;
                  }
                  if(searchTerm.limit) {
                    baseUrl +=  '&limit='+ searchTerm.limit;
                  }
                  if(searchTerm.sort) {
                    baseUrl +=  '&sort='+ searchTerm.sort;
                  }
                  if(searchTerm.order) {
                    baseUrl +=  '&order='+ searchTerm.order;
                  }

                  return $http.get(baseUrl);
                },

                globalAggregationSearch: function (searchTerm) {
                  var aggUrl = '/api/elastic/aggregation?q=' + searchTerm.q;
                  aggUrl = this.prepareParameters(searchTerm, aggUrl);
                  return $http.get(aggUrl);
                },

                prepareParameters: function (searchTerm, url) {
                  if(Array.isArray(searchTerm.type)) {
                    var types = searchTerm.type;
                    angular.forEach(types, function(type,key){
                      url +=  '&type='+ type;
                    });
                  }
                  if(Array.isArray(searchTerm.license)) {
                    var types = searchTerm.license;
                    angular.forEach(types, function(license,key){
                      url +=  '&license='+ license;
                    });
                  }
                  if(Array.isArray(searchTerm.fileType)) {
                    var types = searchTerm.fileType;
                    angular.forEach(types, function(fileType,key){
                      url +=  '&fileType='+ fileType;
                    });
                  }

                  if(Array.isArray(searchTerm.owner)) {
                    var types = searchTerm.owner;
                    angular.forEach(types, function(fileType,key){
                      url +=  '&owner='+ fileType;
                    });
                  }

                  if(searchTerm.projId) {
                    url +=  '&projId='+ searchTerm.projId;
                  }
                  if(searchTerm.hasOwnProperty('minPrice') &&  searchTerm.minPrice > 0) {
                    url +=  '&minPrice='+ searchTerm.minPrice;
                  }

                  if(searchTerm.hasOwnProperty('maxPrice')) {
                    url +=  '&maxPrice='+ searchTerm.maxPrice;
                  }

                  if(searchTerm.minDate) {
                    url +=  '&minDate='+ searchTerm.minDate;
                  }
                  if(searchTerm.maxDate) {
                    url +=  '&maxDate='+ searchTerm.maxDate;
                  }

                  return url;
                },

                /**
                 * Search under a project hitting hitting 'project' index
                 * 
                 * @param {type} projectName
                 * @param {type} searchTerm
                 * @returns {unresolved}
                 */
                projectSearch: function (projectName, searchTerm) {
                  return $http.get('/api/elastic/projectsearch/' + projectName + '/' + searchTerm);
                },
                /**
                 * Search under a dataset hitting hitting 'dataset' index
                 * 
                 * @param {type} projectId
                 * @param {type} datasetName
                 * @param {type} searchTerm
                 * @returns {unresolved}
                 */
                datasetSearch: function (projectId, datasetName, searchTerm) {
                  return $http.get('/api/elastic/datasetsearch/' + projectId + '/' + datasetName + '/' + searchTerm);
                }
              };
              return services;
            };
          }]);

