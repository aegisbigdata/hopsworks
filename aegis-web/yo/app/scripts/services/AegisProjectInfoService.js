'use strict';

angular.module('hopsWorksApp')
    .factory('AegisProjectInfoService', ['$http', '$q', '$cacheFactory', '$timeout', function ($http, $q, $cacheFactory, $timeout) {
        var myCache = $cacheFactory('AegisProjectInfoService');
        return {
            getDatasetsCount: function (projectId) {
                return $q(function (resolve, reject) {
                    var cacheKey = projectId + 'datasetscount';
                    var cached = myCache.get(cacheKey);
                    if (!cached) {
                        $http.get(`/api/project/${projectId}/dataset/getContent?count=true`).then(function (success) {
                            if (success.data && success.data.datasetCount) {
                                var value = success.data.datasetCount;
                                $timeout(function () {
                                    myCache.put(cacheKey, value);
                                }, 0);
                                resolve({
                                    datasets: value
                                });
                            } else {
                                reject("Server error: not expected response");
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
                            } else {
                                reject("Server error: not expected response");
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

