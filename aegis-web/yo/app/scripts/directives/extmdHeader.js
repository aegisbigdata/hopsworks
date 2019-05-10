 'use strict';

 angular.module('hopsWorksApp').directive('extmdHeader', function() {
     return {
         restrict: 'E',
         replace: true,
         transclude: true,
         templateUrl: 'templates/extended-metadata-header.html',
         link: function($scope, $elm, $attrs) {
           $scope.type = $attrs.type;
         },
     };
 });

