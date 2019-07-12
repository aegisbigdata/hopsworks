 'use strict';

 angular.module('hopsWorksApp').directive('extmdHeader', function() {
     return {
         restrict: 'E',
         replace: true,
         transclude: true,
         templateUrl: 'templates/extended-metadata-header.html',
         link: function($scope, $elm, $attrs) {
           $scope.rdf =  $attrs.rdfLink;
           $scope.name = $attrs.name;
           $scope.type = $attrs.type;
           $scope.path = $attrs.name ? ': ' + $scope.name : '';
         },
     };
 });

