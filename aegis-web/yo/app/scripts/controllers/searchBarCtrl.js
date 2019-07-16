'use strict';

angular.module('hopsWorksApp')
  .controller('SearchBarCtrl', ['$scope', '$rootScope', '$location', 'ElasticService', 'DelaService', 'growl', '$routeParams', 
    function ($scope, $rootScope, $location, ElasticService, DelaService, growl, $routeParams) {
      const MIN_SEARCH_TERM_LEN = 2;
      var self = this;
      var mainParent = $scope.mainCtrl;
      var elasticService = ElasticService();

      if (!angular.isUndefined($routeParams.datasetName)) {
        self.searchType = "datasetCentric";
      } else if (!angular.isUndefined($routeParams.projectID)) {
        self.searchType = "projectCentric";
      } else {
        self.searchType = "global";
      }

      self.resultPages = 0;
      self.resultItems = 0;
      // self.searchDisabled =  true;
      if($location.search().q !== '' && typeof $location.search().q !== 'undefined') {
        self.searchTerm = $location.search().q;
        mainParent.itemSearched = self.searchTerm;
        // self.searchDisabled =  false;
      } else {
        self.searchTerm = '';
        // self.searchDisabled =  true;
      }
      self.hitEnter = function (event) {
        var code = event.which || event.keyCode || event.charCode;
        if (angular.equals(code, 13) && !mainParent.searching) {
          if(self.searchType === "global") {
            $scope.mainCtrl.goToSearchHome('search', {q:self.searchTerm});
          } else {
            $scope.projectCtrl.goToUrl('search',{q:self.searchTerm});
          }
        } else if (angular.equals(code, 27)) {
          if(self.searchType === "global") {
            $scope.mainCtrl.goToSearchHome('search');
          } else {
            $scope.projectCtrl.goToUrl('search');
          }
        }
      };
      self.onClickSearch = function() {
        if ( self.searchTerm.length >= MIN_SEARCH_TERM_LEN ) {
          if(self.searchType === "global") {
            $scope.mainCtrl.goToSearchHome('search', {q:self.searchTerm});
          } else {
            $scope.projectCtrl.goToUrl('search',{q:self.searchTerm});
          }
        } else {
          mainParent.searchResult = [];
          if(self.searchTerm == '*') {
            if(self.searchType === "global") {
              $scope.mainCtrl.goToSearchHome('search', {q:self.searchTerm});
            } else {
              $scope.projectCtrl.goToUrl('search',{q:self.searchTerm});
            }
          } else {
            if(self.searchType === "global") {
              $scope.mainCtrl.goToSearchHome('search');
            } else {
              $scope.projectCtrl.goToUrl('search');
            }
          }
        }
      }
      self.search = function () {
        // mainParent.showSearchPage = true;
        self.currentPage = 1;
        self.pageSize = 15;
        mainParent.searchResult = [];

        // if (self.searchTerm === undefined || self.searchTerm === "" || self.searchTerm === null) {
        //   return;
        // }
        mainParent.searching = true;

        if (self.searchType === "global" && $rootScope.isDelaEnabled) {
          var global_data;
          var searchHits;
          //triggering a global search
          mainParent.searchResult = [];
          let queryParams = ''
          if (self.searchTerm === undefined || self.searchTerm === "" || self.searchTerm === null) {
            queryParams = {q:'*'};
          } else {
            queryParams = $location.search();
          }
          //  Call API Search
          elasticService.globalSearch(queryParams).then(function (response) {
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
                  mainParent.searching = false;
                } else {
                  mainParent.searching = false;
                }
                self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
                self.resultItems = mainParent.searchResult.length;
              });
            }, function (error) {
              mainParent.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
          });
          //  Call API Aggregation

          elasticService.globalAggregationSearch(queryParams).then(function (response) {
              mainParent.totalResults = response.data[0].value;
            }, function (error) {
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
          });
        } else if (self.searchType === "global" && !$rootScope.isDelaEnabled) {
          var searchHits;
          //triggering a global search
          mainParent.searchResult = [];
          let queryParams = {};
          if (self.searchTerm === undefined || self.searchTerm === "" || self.searchTerm === null) {
            if(angular.equals($location.search(), {})) {
              queryParams.q = '*';
            } else {
              queryParams.q = '*';
              for(var k in $location.search()) queryParams[k]=$location.search()[k];
            }
          } else {
            queryParams = $location.search();
          }
        //  Call API Search
          elasticService.globalSearch(queryParams)
            .then(function (response) {
              searchHits = response.data;
              if (searchHits.length > 0) {
                mainParent.searchResult = searchHits;
              } else {
                mainParent.searchResult = [];
              }
              mainParent.searching = false;
              self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
              // self.resultItems = mainParent.searchResult.length;
            }, function (error) {
              mainParent.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
          });
            
          //  Call API Aggregation
          elasticService.globalAggregationSearch(queryParams)
            .then(function (response) {
              mainParent.aggregationResult = self.processAggregation(response.data);
              mainParent.totalResults = response.data[0].value;
            }, function (error) {
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
          });
        } else if (self.searchType === "projectCentric") {
          // TODO: manage with new API
          if (self.searchTerm === undefined || self.searchTerm === "" || self.searchTerm === null) {
            mainParent.searching = false;
            return;
          }
          elasticService.projectSearch($routeParams.projectID, self.searchTerm)
            .then(function (response) {
              mainParent.searching = false;
              var searchHits = response.data;
              if (searchHits.length > 0) {
                mainParent.searchResult = searchHits;
              } else {
                mainParent.searchResult = [];
              }
              self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
              self.resultItems = mainParent.searchResult.length;
            }, function (error) {
              mainParent.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
            });
        } else if (self.searchType === "datasetCentric") {
          if (self.searchTerm === undefined || self.searchTerm === "" || self.searchTerm === null) {
            mainParent.searching = false;
            return;
          }
          elasticService.datasetSearch($routeParams.projectID, $routeParams.datasetName, self.searchTerm)
            .then(function (response) {
              mainParent.searching = false;
              var searchHits = response.data;
              if (searchHits.length > 0) {
                mainParent.searchResult = searchHits;
              } else {
                mainParent.searchResult = [];
              }
              self.resultPages = Math.ceil(mainParent.searchResult.length / self.pageSize);
              self.resultItems = mainParent.searchResult.length;
            }, function (error) {
              mainParent.searching = false;
              growl.error(error.data.errorMsg, {
                title: 'Error',
                ttl: 5000
              });
            });
        }
        datePicker(); // this will load the function so that the date picker can call it.
      };


      self.processAggregation = function (data) {
        var result = {};
        var paramsLicense = $location.search().license;
        var paramsFileType = $location.search().fileType;
        var paramOwner = $location.search().owner;
        var minPrice = $location.search().minPrice;
        var maxPrice = $location.search().maxPrice;

        result['owner'] = [];

        data.forEach(function (item) {
          if(item['name'] === 'Licenses' && item['map']['entry'].length > 0) {
            result['licenses'] = item['map']['entry'];
            result['licenses'].forEach(function (licItem) {
              licItem['selected'] = false;
              if(paramsLicense !== '' && typeof paramsLicense !== 'undefined') {
                if(angular.isArray(paramsLicense)){
                  angular.forEach(paramsLicense, function(pLicence,key){
                    if(licItem['key'] === pLicence)  licItem['selected'] = true;
                  })
                } else {
                    if(licItem['key'] === paramsLicense)  licItem['selected'] = true;
                }
              }

            })
          }

          if(item['name'] === 'File Types' && item['map']['entry'].length > 0) {
            result['fileTypes'] = item['map']['entry'];
            result['fileTypes'].forEach(function (fileItem) {
              fileItem['selected'] = false;
              if(paramsFileType !== '' && typeof paramsFileType !== 'undefined') {
                if(angular.isArray(paramsFileType)){
                  angular.forEach(paramsFileType, function(pFileType,key){
                    if(fileItem['key'] === pFileType)  fileItem['selected'] = true;
                  })
                } else {
                  if(fileItem['key'] === paramsFileType)  fileItem['selected'] = true;
                }
              }

            })
          }

          if(item['name'] === 'OTHER' && item['value'] > 0) {
            if(paramOwner !== '' && typeof paramOwner !== 'undefined' && paramOwner[0] === 'other') {
              result['owner'].push({key: 'other', value: item['value'], selected: true});
            } else {
              result['owner'].push({key: 'other', value: item['value'], selected: false});
            }

          }

          if(item['name'] === 'MY' && item['value'] > 0) {
            if(paramOwner !== '' && typeof paramOwner !== 'undefined' && paramOwner[0] === 'my') {
              result['owner'].push({key: 'my', value: item['value'], selected: true});
            } else {
              result['owner'].push({key: 'my', value: item['value'], selected: false});
            }
          }

        });

        result['price'] = {};
        if(minPrice !== '' && typeof minPrice !== 'undefined') {
          result['price']['min'] = minPrice;
        } else {
          result['price']['min'] = 0;
        }

        if(maxPrice !== '' && typeof maxPrice !== 'undefined') {
          result['price']['max'] = maxPrice;
        } else {
          result['price']['max'] = 2000;
        }
        return result;
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

      self.search();

    }
  ]);