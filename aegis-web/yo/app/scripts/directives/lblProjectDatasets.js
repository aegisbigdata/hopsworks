'use strict';

angular.module('hopsWorksApp').directive('lblProjectDatasets', [function () {
    return {
        restrict: 'E',
        template: '{{label}}',
        scope: {
            projectId: '@',
            files: '@',
        },
        controller: ['$scope', '$http', 'AegisProjectInfoService', function ($scope, $http, AegisProjectInfoService) {
            $scope.label = "";
            var projectId = NaN;
            var files = NaN;
            if ($scope.projectId !== undefined) {
                projectId = parseInt($scope.projectId);
            }
            if ($scope.files !== undefined) {
                files = parseInt($scope.files);
            }
            if (!isNaN(projectId)) {
                AegisProjectInfoService.getDatasets(projectId).then(function (data) {
                    if (data && data.datasets) {
                        $scope.label = data.datasets + " dataset";
                        if (data.datasets > 1) {
                            $scope.label += "s";
                        }
                    }
                });
                return;
            }
            if (!isNaN(files)) {
                AegisProjectInfoService.getFiles(files).then(function (data) {
                    if (data && data.files) {
                        $scope.label = data.files + " file";
                        if (data.files > 1) {
                            $scope.label += "s";
                        }
                    }
                });
            }
        }]
    };
}]);