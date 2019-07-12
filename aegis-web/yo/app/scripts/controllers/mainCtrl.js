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
        .controller('MainCtrl', ['$interval', '$cookies', '$location', '$scope', '$rootScope',
          '$http', 'AuthService', 'UtilsService', 'ElasticService', 'DelaProjectService',
          'DelaService', 'md5', 'ModalService', 'ProjectService', 'growl',
          'MessageService', '$routeParams', '$window', 'HopssiteService', 'BannerService',
          'AirflowService',
          function ($interval, $cookies, $location, $scope, $rootScope, $http, AuthService, UtilsService,
                  ElasticService, DelaProjectService, DelaService, md5, ModalService, 
                  ProjectService, growl,
                  MessageService, $routeParams, $window, HopssiteService, BannerService,
                  AirflowService) {
            const MIN_SEARCH_TERM_LEN = 2;
            var self = this;

            self.ui = "/hopsworks-api/airflow/login?q=username=";

            self.email = $cookies.get('email');
            self.emailHash = md5.createHash(self.email || '');
            var elasticService = ElasticService();
            self.searchResult = [];
            self.totalresults = 0;
            self.totalResults = 0;


            if (!angular.isUndefined($routeParams.datasetName)) {
              self.searchType = "datasetCentric";
            } else if (!angular.isUndefined($routeParams.projectID)) {
              self.searchType = "projectCentric";
            } else {
              self.searchType = "global";
            }

            var checkeIsAdmin = function () {
              var isAdmin = sessionStorage.getItem("isAdmin");
              if (isAdmin != 'true' && isAdmin != 'false') {
                AuthService.isAdmin().then(
                  function (success) {
                    sessionStorage.setItem("isAdmin", success.data.data.value);
                  }, function (error) {
                    sessionStorage.setItem("isAdmin", null);
                });
              }
            };
            checkeIsAdmin();
            self.isAdmin = function () {
              return sessionStorage.getItem("isAdmin");
            };

            self.goToAdminPage = function () {
              $window.location.href = '/hopsworks-admin/security/protected/admin/adminIndex.xhtml';
            };

            self.getEmailHash = function (email) {
              return md5.createHash(email || '');
            };

            self.logout = function () {
              AirflowService.logout();

              AuthService.logout(self.user).then(
                      function (success) {
                        AuthService.cleanSession();
                        AuthService.removeToken();
                        $location.url('/login');
                      }, function (error) {
                self.errorMessage = error.data.msg;
              });
            };

            var checkDelaEnabled = function () {
              
              HopssiteService.getServiceInfo("dela").then(function (success) {
                console.log("isDelaEnabled", success);
                self.delaServiceInfo = success.data;
                if (self.delaServiceInfo.status === 1) {
                  $rootScope['isDelaEnabled'] = true;
                } else {
                  $rootScope['isDelaEnabled'] = false;
                }
              }, function (error) {
                $rootScope['isDelaEnabled'] = false;
                console.log("isDelaEnabled", error);
              });
            };
            //checkDelaEnabled(); // check 
            self.userNotification = '';
            var getUserNotification = function () {
              self.userNotification = '';
              BannerService.findUserBanner().then(
                      function (success) {
                        console.log(success);
                        if (success.data.successMessage) {
                          self.userNotification = success.data.successMessage;
                        }
                      }, function (error) {
                console.log(error);
                self.userNotification = '';
              });
            };
            getUserNotification();

            self.profileModal = function () {
              ModalService.profile('md');
            };

            self.sshKeysModal = function () {
              ModalService.sshKeys('lg');
            };

            self.getHostname = function () {
              return $location.host();
            };

            self.getUser = function () {
              return self.email.substring(0, self.email.indexOf("@"));
            };

            var getUnreadCount = function () {
              MessageService.getUnreadCount().then(
                      function (success) {
                        self.unreadMessages = success.data.data.value;
                      }, function (error) {
              });
            };

            var getMessages = function () {
              MessageService.getMessages().then(
                      function (success) {
                        self.messages = success.data;
                      }, function (error) {
              });
            };

            getUnreadCount();
            getMessages();

            var getUnreadCountInterval = $interval(function () {
              getUnreadCount();
            }, 10000);

            self.getMessages = function () {
              getMessages();
            };

            self.openMessageModal = function (selected) {
              if (selected !== undefined) {
                MessageService.markAsRead(selected.id);
              }
              ;
              ModalService.messages('lg', selected)
                      .then(function (success) {
                        growl.success(success.data.successMessage,
                                {title: 'Success', ttl: 1000});
                      }, function (error) {
                      });
            };

            self.searching = false;
            self.pageSize = 15;
            self.itemSearched = "";

            // self.viewType = function (listView) {
            //   if (listView) {
            //     self.pageSize = 4;
            //   } else {
            //     self.pageSize = 6;
            //   }
            // };

            $scope.$on("$destroy", function () {
              $interval.cancel(getUnreadCountInterval);
              //$interval.cancel(getPopularPublicDatasetsInterval);
            });

            self.downloadPublicDataset = function (result) {
              ModalService.selectProject('md', true, "/[^]*/", "Select a Project as download destination.").then(function (success) {
                var destProj = success.projectId;
                ModalService.setupDownload('md', destProj, result).then(function (success) {
                }, function (error) {
                  if (error.data && error.data.details) {
                    growl.error(error.data.details, {title: 'Error', ttl: 1000});
                  }
                  self.delaHopsService = new DelaProjectService(destProj);
                  self.delaHopsService.unshareFromHops(result.publicId, true).then(function (success) {
                    growl.info("Download cancelled.", {title: 'Info', ttl: 1000});
                  }, function (error) {
                    growl.warning(error, {title: 'Warning', ttl: 1000});
                  });
                });
              }, function (error) {
              });
            };

            // self.viewType = function (listView) {
            //   if (listView) {
            //     self.pageSize = 4;
            //   } else {
            //     self.pageSize = 9;
            //   }
            // };

            self.viewDetail = function (result) {
              if (result.localDataset) {
                if (result.type === 'proj') {
                  ProjectService.getProjectInfo({projectName: result.name}).$promise.then(
                          function (response) {
                            ModalService.viewSearchResult('lg', response, result);
                          }, function (error) {
                    growl.error(error.data.errorMsg, {title: 'Error', ttl: 5000});
                  });
                } else if (result.type === 'ds') {
                  ProjectService.getDatasetInfo({inodeId: result.id}).$promise.then(
                          function (response) {
                            var projects;
                            ProjectService.query().$promise.then(
                                    function (success) {
                                      projects = success;
                                      ModalService.viewSearchResult('lg', response, result, projects);
                                    }, function (error) {
                              growl.error(error.data.errorMsg, {title: 'Error', ttl: 5000});
                            });
                          });
                } else if (result.type === 'inode') {
                  ProjectService.getInodeInfo({id: $routeParams.projectID, inodeId: result.id}).$promise.then(
                          function (response) {
                            var projects;
                            ProjectService.query().$promise.then(
                                    function (success) {
                                      projects = success;
                                      ModalService.viewSearchResult('lg', response, result, projects);
                                    }, function (error) {
                              growl.error(error.data.errorMsg, {title: 'Error', ttl: 5000});
                            });
                          });
                }
              } else {
                ModalService.viewSearchResult('lg', result, result, null);
              }
            };

            self.goToSearchHome = function (serviceName, parameters) {
              parameters = parameters || {};
              $scope.activeService = serviceName;
              $location.path('/' + serviceName).search(parameters).hash('');
            };
            self.goToSearchProject = function (serviceName, parameters) {
              parameters = parameters || {};
              $scope.activeService = serviceName;
              $location.path('project/' + $routeParams.projectID + '/' + serviceName).search(parameters).hash('');
            }

            

            /*
            * ***************** 
            * MANAGE FILTERS
            * *****************
            */

            self.types = [
              {name: 'Project', value: 'proj', selected: false},
              {name: 'Dataset', value: 'ds', selected: false},
              {name: 'Files', value: 'inode', selected: false},
            ];
            self.options_sortby = [
              {name: 'Relevance ascending', value: 'RASC'},
              {name: 'Relevance decreasing', value: 'RDESC'},
              {name: 'Latest ascending', value: 'LASC'},
              {name: 'Latest descending', value: 'LDESC'},
              {name: 'Title ascending', value: 'TASC'},
              {name: 'Title descending', value: 'TDESC'},
            ];
            
            self.initFilterType = function () {
              var paramsType = $location.search().type;
              if(paramsType !== '' && typeof paramsType !== 'undefined') {
                if(angular.isArray(paramsType)){
                  angular.forEach(self.types, function(type,key){
                    var _type = type;
                    angular.forEach(paramsType, function(pType,key){
                      if(_type.value == pType) _type.selected = true;
                    })
                  })
                } else {
                  angular.forEach(self.types, function(type,key){
                    if(type.value == paramsType) type.selected = true;
                  })
                }
              }
            }
            self.initFilterPage = function () {
              var paramsPage = $location.search().page;
              if(paramsPage !== '' && typeof paramsPage !== 'undefined') {
                self.filterPage = paramsPage;
              } else {
                self.filterPage = '1';
              }
            }
            self.initFilterSortby = function () {
              var paramsSortby = $location.search().sort;
              var paramsOrderby = $location.search().order;
              if(paramsSortby !== '' && typeof paramsSortby !== 'undefined') {
                // TODO controllare parametri
                self.filterSortby = paramsSortby;
              } else {
                self.filterSortby = '1';
              }
            }
            self.updateFilterType = function () {
              var typeSelected = [];
              let params = $location.search();
              angular.forEach(self.types, function(type,key){
                if(type.selected) typeSelected.push(type.value);
              })
              params.type = typeSelected;
              params.page = 1;
              if(self.searchType === "global") {
                self.goToSearchHome('search', params);
              } else {
                self.goToSearchProject('search', params);
              }
            }
            self.updateFilterPage = function(newPageNumber){
              let params = $location.search();
              params.page = newPageNumber;
              params.limit = self.pageSize;
              self.filterPage = newPageNumber;
              if(self.searchType === "global") {
                self.goToSearchHome('search', params);
              } else {
                self.goToSearchProject('search', params);
              }
            }
            self.resetAllFilters = function () {
              let params = {q:$location.search().q}
              if(self.searchType === "global") { 
                self.goToSearchHome('search', params);
              } else {
                self.goToSearchProject('search', params);
              }
            }
            self.updateFilterSortby = function() {
              let params = $location.search();
              switch(self.selectedSortby.value){
                case 'RASC':
                  params.sort = 'relevance';
                  params.order = 'asc';
                break;
                case 'RDESC':
                  params.sort = 'relevance';
                  params.order = 'desc';
                break;
                case 'LASC':
                  params.sort = 'date';
                  params.order = 'asc';
                break;
                case 'LDESC':
                  params.sort = 'date';
                  params.order = 'desc';
                break;
                case 'TASC':
                  params.sort = 'title';
                  params.order = 'asc';
                break;
                case 'TDESC':
                  params.sort = 'title';
                  params.order = 'desc';
                break;
              }
              params.page = 1
              if(self.searchType === "global") {
                self.goToSearchHome('search', params);
              } else {
                self.goToSearchProject('search', params);
              }
            }
            
            self.initFilterType();
            self.initFilterPage();
            self.initFilterSortby();

            self.selectedSortby = {name: 'Relevance ascending', value: 'RASC'};

            self.activeFilter = function(filter) {
              switch(filter){
                  case 'type':
                  self.updateFilterType()
                  break;
                  case 'sortby':
                  self.updateFilterSortby()
                  break;
              }
            };



          }]);
