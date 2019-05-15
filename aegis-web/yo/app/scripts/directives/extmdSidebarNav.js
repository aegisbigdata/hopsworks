 'use strict';

 angular.module('hopsWorksApp').directive('extmdSidebarNav', function() {
     return {
         restrict: 'E',
         replace: true,
         transclude: true,
         templateUrl: 'templates/extended-metadata-sidebar-nav.html',
         link: function($scope, $elm, $attrs) {},
     };
 });

