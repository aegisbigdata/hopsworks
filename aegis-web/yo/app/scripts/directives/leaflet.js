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

 /*
  * Copyright (c) https://github.com/angular-ui/ui-leaflet
  * Original Copyright (c) https://github.com/tombatossals/angular-leaflet-directive
  */

'use strict';

angular.module('hopsWorksApp').directive('leaflet', function() {
    return {
        restrict: 'EA',
        link: function($scope, $elm, $attrs) {
          // Set width and height utility functions
          function updateWidth() {
            if (isNaN($attrs.width)) {
              $elm.css('width', $attrs.width);
            } else {
              $elm.css('width', $attrs.width + 'px');
            }
          }

          function updateHeight() {
            if (isNaN($attrs.height)) {
              $elm.css('height', $attrs.height);
            } else {
              $elm.css('height', $attrs.height + 'px');
            }
          }

          let mapcenter = [52.520008, 13.404954];
          let areaSelectOptions = { width: 100, height: 100 };

          if ($scope.$parent.data.areaSelect) {
            let a = $scope.$parent.data.areaSelect;
            mapcenter = [a.center.lat, a.center.lng];
            areaSelectOptions = { width: a._width, height: a._height };
          }

          // Create the Leaflet Map Object with the options
          const map = L.map($elm[0], {
            center: mapcenter,
            zoom: 10,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          
          var areaSelect = L.areaSelect(areaSelectOptions);
          areaSelect.addTo(map);

          $attrs.$observe('area', function(area) {
            let settings;

            if (area != '') {
              try {
                settings = JSON.parse(area);
              } catch (e) {
                console.log(e);
              }

              if (settings && settings._width != 100 && settings._height != 100) {
                console.log(settings);
                areaSelect.setDimensions({ width: settings._width, height: settings._height })
              }
            }
          })

          $attrs.$observe('center', function(center) {
            let settings;

            if (center != '') {
              try {
                settings = JSON.parse(center);
                console.log(settings);
              } catch (e) {
                console.log(e);
              }

              if (settings) map.setView(new L.LatLng(settings.lat, settings.lng), settings.zoom);
            }
          })
          
          areaSelect.on('change', function() {
            $scope.$parent.data.areaSelect = { _width: areaSelect._width, _height: areaSelect._height, center: map.getCenter(), zoom: map.getZoom() };
          });

          // If the width attribute defined update css
          // Then watch if bound property changes and update css

          if (angular.isDefined($attrs.width) && $attrs.width !== null) {
            updateWidth();

            $scope.$watch(
              function () {
                return $elm[0].getAttribute('width');
              },
              function () {
                updateWidth();
                map.invalidateSize();
              });
          }

          // If the height attribute defined update css
          // Then watch if bound property changes and update css
          if (angular.isDefined($attrs.height) && $attrs.height !== null) {
            updateHeight();

            $scope.$watch(function () {
                return $elm[0].getAttribute('height');
            }, function () {
              updateHeight();
              map.invalidateSize();
            });
          }
        },
    };
});

