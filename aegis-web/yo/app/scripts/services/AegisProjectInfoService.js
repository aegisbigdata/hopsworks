'use strict';

angular.module('hopsWorksApp')
    .factory('AegisProjectInfoService', ['$http', '$q', '$cacheFactory', '$timeout', function ($http, $q, $cacheFactory, $timeout) {
        var myCache = $cacheFactory('AegisProjectInfoService');
        return {
            getDatasets: function (projectId) {
                return $q(function (resolve, reject) {
                    var cacheKey = projectId + 'datasets';
                    var cached = myCache.get(cacheKey);
                    if (!cached) {
                        $http.get(`/api/project/${projectId}/dataset/getContent`).then(function (success) {
                            if (success.data && success.data.length) {
                                var value = success.data.length;
                                $timeout(function () {
                                    myCache.put(cacheKey, value);
                                }, 0);
                                resolve({
                                    datasets: value
                                });
                            }
                        }, reject);
                    } else {
                        resolve({
                            datasets: cached
                        });
                    }
                });
            },
            getFiles: function (projectId) {
                return $q(function (resolve, reject) {
                    var cacheKey = projectId + 'files';
                    var cached = myCache.get(cacheKey);
                    if (!cached) {
                        $http.get(`/api/project/${projectId}/quotas`).then(function (success) {
                            if (success.data && success.data.hdfsNsCount && parseInt(success.data.hdfsNsCount)) {
                                var value = parseInt(success.data.hdfsNsCount);
                                $timeout(function () {
                                    myCache.put(cacheKey, value);
                                }, 0);
                                resolve({
                                    files: value
                                });
                            }
                        }, reject);
                    } else {
                        resolve({
                            files: cached
                        });
                    }
                });
            }
        };
    }]);

