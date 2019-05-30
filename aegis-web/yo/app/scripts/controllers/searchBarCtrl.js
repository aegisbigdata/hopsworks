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
  .controller('SearchBarCtrl', ['$scope', '$rootScope', '$location', 'ElasticService', 'DelaService', 'growl', '$routeParams', 
    function ($scope, $rootScope, $location, ElasticService, DelaService, growl, $routeParams) {
      const MIN_SEARCH_TERM_LEN = 2;
      var self = this;
      var mainParent = $scope.mainCtrl;
      console.log('Parent ', mainParent);

      var elasticService = ElasticService();

      if (!angular.isUndefined($routeParams.datasetName)) {
        self.searchType = "datasetCentric";
      } else if (!angular.isUndefined($routeParams.projectID)) {
        self.searchType = "projectCentric";
      } else {
        self.searchType = "global";
      }
      console.log('search Type: ', self.searchType);

      self.searching = false;
      self.globalClusterBoundary = false;
      self.resultPages = 0;
      self.resultPagesPublicSearch = 0;
      self.resultItems = 0;
      self.resultItemsPublicSearch = 0;
      self.currentPage = 1;
      self.pageSize = 9;
      
      if($location.search().q !== '' || $location.search().q !== undefined) {
        self.searchTerm = $location.search().q;
        mainParent.itemSearched = self.searchTerm;
      } else {
        self.searchTerm = '';
      }

      self.hitEnter = function (event) {
        var code = event.which || event.keyCode || event.charCode;
        console.log("hitEnter------", code);
        if (angular.equals(code, 13) && !self.searching) {
          mainParent.searchResult = [];
          mainParent.itemSearched = self.searchTerm;
          self.search();
        } else if (angular.equals(code, 27)) {
          mainParent.showSearchPage = false;
          self.clearSearch();
        }
      };

      self.keyTyped = function (evt) {
        if (self.searchTerm.length >= MIN_SEARCH_TERM_LEN || (mainParent.searchResult.length > 0 && self.searchTerm.length > 0)) {
          mainParent.itemSearched = self.searchTerm;
        } else {
          mainParent.showSearchPage = false;
          mainParent.searchResult = [];
        }
      };

      self.onClickSearch = function() {
        if (self.searchTerm.length >= MIN_SEARCH_TERM_LEN || (mainParent.searchResult.length > 0 && self.searchTerm.length > 0)) {
          mainParent.searchResult = [];
          $scope.projectCtrl.goToUrl('search',{q:self.searchTerm});
        } else {
          mainParent.showSearchPage = false;
          mainParent.searchResult = [];
        }
      }



      self.clearSearch = function () {
        mainParent.showSearchPage = false;
        mainParent.searchResult = [];
        mainParent.itemSearched = "";
        self.searchTerm = "";
      };

      self.search = function () {
        mainParent.showSearchPage = true;
        self.currentPage = 1;
        self.pageSize = 9;
        mainParent.searchResult = [];

        if (self.searchTerm === undefined || self.searchTerm === "" || self.searchTerm === null) {
          return;
        }
        self.searching = true;

        if (self.searchType === "global" && $rootScope.isDelaEnabled) {
          var global_data;
          var searchHits;
          //triggering a global search
          mainParent.searchResult = [];
          elasticService.globalSearch(self.searchTerm)
            .then(function (response) {
              searchHits = response.data;
              if (searchHits.length > 0) {
                mainParent.searchResult = searchHits;
              } else {
                mainParent.searchResult = [];
              }
              self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
              self.resultItems = mainParent.searchResult.length;
              DelaService.search(self.searchTerm).then(function (response2) {
                global_data = response2.data;
                if (global_data.length > 0) {
                  mainParent.searchResult = concatUnique(searchHits, global_data);
                  self.searching = false;
                } else {
                  self.searching = false;
                }
                self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
                self.resultItems = mainParent.searchResult.length;
              });
            }, function (error) {
              self.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
            });
        } else if (self.searchType === "global" && !$rootScope.isDelaEnabled) {
          var searchHits;
          //triggering a global search
          mainParent.searchResult = [];
          elasticService.globalSearch(self.searchTerm)
            .then(function (response) {
              searchHits = response.data;
              if (searchHits.length > 0) {
                mainParent.searchResult = searchHits;
              } else {
                mainParent.searchResult = [];
              }
              self.searching = false;
              self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
              self.resultItems = mainParent.searchResult.length;
            }, function (error) {
              self.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
            });
        } else if (self.searchType === "projectCentric") {
          elasticService.projectSearch($routeParams.projectID, self.searchTerm)
            .then(function (response) {
              self.searching = false;
              var searchHits = response.data;
              console.log('Response earch ', searchHits);
              if (searchHits.length > 0) {
                mainParent.searchResult = searchHits;
              } else {
                mainParent.searchResult = [];
              }
              self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
              self.resultItems = mainParent.searchResult.length;
            }, function (error) {
              self.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
            });
        } else if (self.searchType === "datasetCentric") {
          elasticService.datasetSearch($routeParams.projectID, $routeParams.datasetName, self.searchTerm)
            .then(function (response) {
              self.searching = false;
              var searchHits = response.data;
              if (searchHits.length > 0) {
                mainParent.searchResult = searchHits;
              } else {
                mainParent.searchResult = [];
              }
              self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
              self.resultItems = mainParent.searchResult.length;
            }, function (error) {
              self.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
            });
        }
        datePicker(); // this will load the function so that the date picker can call it.
      };

      var concatUnique = function (a, array2) {
        a = a.concat(array2);
        for (var i = 0; i < a.length; ++i) {
          for (var j = i + 1; j < a.length; ++j) {
            if (!(a[i].publicId === undefined || a[i].publicId === null) &&
              a[i].publicId === a[j].publicId)
              a.splice(j--, 1);
          }
        }
        return a;
      };

      var datePicker = function () {
        $(function () {
          $('[type="datepicker"]').datetimepicker({
            format: 'DD/MM/YYYY'
          });
          $("#datepicker1").on("dp.change", function (e) {
            $('#datepicker2').data("DateTimePicker").minDate(e.date);
          });
          $("#datepicker2").on("dp.change", function (e) {
            $('#datepicker1').data("DateTimePicker").maxDate(e.date);
          });
          $("#datepicker3").on("dp.change", function (e) {
            $('#datepicker4').data("DateTimePicker").minDate(e.date);
          });
          $("#datepicker4").on("dp.change", function (e) {
            $('#datepicker3').data("DateTimePicker").maxDate(e.date);
          });
        });
      };

      $scope.$on("$destroy", function () {
      });

      self.incrementPage = function () {
        self.pageSize = self.pageSize + 1;
      };

      self.decrementPage = function () {
        if (self.pageSize < 2) {
          return;
        }
        self.pageSize = self.pageSize - 1;
      };


      self.search();


    }
  ]);