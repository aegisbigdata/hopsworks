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

'use strict';

angular.module('hopsWorksApp')
  .factory('ExtendedMetadataService', ['$http', function($http) {
    var service = {
      setFieldFromStringOrArray (input) {
        let string = '';

        console.log(input);
        if (typeof(input) === 'string') {
          string = input;
        } else if (Array.isArray(input) && input.length > 0) {
          try {
            var fallback = '';
            input.forEach(function (entry) {
              if(typeof(entry) === 'string') {
                fallback = entry;
              } else if(typeof(entry) === 'object') {
                if(entry['@language'].startsWith('en')) {
                  string = entry['@value']
                }
              }
            });
            if(!string.length > 0) {
              string = fallback;
            }
          } catch (e) {
            console.log(e);
            string = '';
          }
        } else if (typeof(input) === 'object') {
          try {
            string = input['@value'];
          } catch (e) {
            console.log(e);
            string = '';
          }
        }
        return string;
      },

      extractTranslations (input) {
        try {
          if (typeof(input) === 'string') {
            return {};
          } else if (Array.isArray(input) && input.length > 0) {
            var result = {};
            input.forEach(function (entry) {
              if(typeof(entry) === 'object') {
                result[entry['@language'].substring(0,2)] = entry['@value'];
              }
            });
            return result;
          }  else if (typeof(input) === 'object') {
            var result = {};
            result[input['@language'].substring(0,2)] = input['@value'];
            return result;
          } else {
            return {};
          }
        } catch (e) {
          console.log(e);
          return {};
        }
      },


      parseDatasetGraph (jsonld, fields) {
        if (!jsonld.hasOwnProperty('@graph')) return;
        var graph = jsonld['@graph'];
        var index_location, index_contactpoint, index_dataset, index_temporal, index_publisher;

        // Determine indexes
        graph.forEach(function(entry, index) {
          if (!entry.hasOwnProperty('@type')) return;
          if (typeof(entry['@type']) != 'string') return;
          let type = entry['@type'].split('/');
          type = type[type.length - 1].toUpperCase();

          if (type == 'LOCATION') index_location = index;
          if (type == 'NS#ORGANIZATION' || type == 'NS#INDIVIDUAL') index_contactpoint = index;
          if (type == 'DCAT#DATASET') index_dataset = index;
          if (type == 'PERIODOFTIME') index_temporal = index;
          if (type == 'ORGANIZATION' || type == 'INDIVIDUAL') index_publisher = index;
        })

        // Set publisher Info
        if (index_publisher) {
          try {
            var type_splitted = graph[index_publisher]['@type'].split('/');
            fields.publishertype.model = type_splitted[type_splitted.length - 1].toUpperCase();
          } catch (e) {}
            fields.publishername.model = graph[index_publisher]['name'];
            fields.homepage.model = graph[index_publisher]['homepage'];
        }

        // Set Language field
        if (graph[index_dataset].hasOwnProperty('language')) {
          var language_splitted = graph[index_dataset]['language'].split('/');
          fields.language.model = language_splitted[language_splitted.length - 1];
        }

        // Set License field
        if (graph[index_dataset].hasOwnProperty('license')) {
          var license_splitted = graph[index_dataset].license.split('/');
          fields.license.model = license_splitted[license_splitted.length - 1];
        }

        let title = graph[index_dataset]['title'];
        let description = graph[index_dataset]['description'];

        // Set other fields
        fields.accessRights.model = graph[index_dataset]['accessRights'] || '';
        fields.price.model = graph[index_dataset]['price'] || '';
        fields.sellable.model = (graph[index_dataset]['http://www.aegis-bigdata.eu/md/voc/core/sellable'] == true) || graph[index_dataset]['http://www.aegis-bigdata.eu/md/voc/core/sellable'];
        fields.title.i18n = this.extractTranslations(title);
        fields.title.model = this.setFieldFromStringOrArray(title);
        fields.description.i18n = this.extractTranslations(description);
        fields.description.model = this.setFieldFromStringOrArray(description);
        
        if (graph[index_dataset].hasOwnProperty('keyword')) {
          let tags = graph[index_dataset]['keyword'];
          fields.keywords.model = tags.join();
          fields.keywords.tags = tags.map(tag => {
            return {text: tag};
          });
        }

        if (graph[index_dataset].hasOwnProperty('theme')) {
          var theme_splitted = graph[index_dataset]['theme'].split('/');
          fields.theme.model = theme_splitted[theme_splitted.length - 1];
        }

        if (graph[index_dataset].hasOwnProperty('page')) {
          fields.documentation.model = graph[index_dataset]['page'] || '';
        }

        // Set temporal data fields
        if (index_temporal) {
          let temporalData = graph[index_temporal];
          if (temporalData.hasOwnProperty('startDate')) fields.temporalfrom.model = moment(temporalData['startDate']);
          if (temporalData.hasOwnProperty('endDate')) fields.temporalto.model = moment(temporalData['endDate']);
        }

        if (index_contactpoint) {
          var type_splitted = graph[index_contactpoint]['@type'].split('#');
          fields.contactpointtype.model = type_splitted[type_splitted.length - 1].toUpperCase() || '';
          fields.contactpointname.model = graph[index_contactpoint]['fn'] || '';

          if (graph[index_contactpoint].hasOwnProperty('hasEmail')) {
            fields.contactpointmail.model = graph[index_contactpoint]['hasEmail'];
            fields.contactpointmail.model = fields.contactpointmail.model.split(':');
            fields.contactpointmail.model = fields.contactpointmail.model[fields.contactpointmail.model.length - 1];
          }
        }

        if (typeof(index_location) == 'number' && graph[index_location].hasOwnProperty('geometry')) {
          var geoJSON = graph[index_location]['geometry'];
          try {
            geoJSON = JSON.parse(geoJSON);
            fields.spatial.model = geoJSON.coordinates;
            //$scope.geoJSON = geoJSON;
          } catch(e) {
            console.log(e);
          }                
        }

        return fields;
      },
      parseDistributionGraph (jsonld, fields) {
        if(jsonld.hasOwnProperty('@graph')) {
          var graph = jsonld['@graph'];
        } else {
          var graph = [jsonld];
        }

        fields.typeannotation.model.fields = [];

        graph.forEach((entry, index) => {
          if (entry.hasOwnProperty('accessURL')) {
            let distro = graph[index];
            let title = graph[index]['title'];
            let description = graph[index]['description'] || graph[index]['http://purl.org/dc/terms/description'];

            fields.title.i18n = this.extractTranslations(title);
            fields.title.model = this.setFieldFromStringOrArray(title);
            fields.description.i18n = this.extractTranslations(description);
            fields.description.model = this.setFieldFromStringOrArray(description);
            fields.format.model = distro['format'] || '';

            if (distro.hasOwnProperty('accessURL')) fields.accessUrl.model = distro['accessURL'] || '';
            if (distro.hasOwnProperty('language')) {
              var language_splitted = distro['language'].split('/');
              fields.language.model = language_splitted[language_splitted.length - 1];
            }

            if (distro.hasOwnProperty('license')) {
              fields.license.model = distro['license'];
            }

          } else {
            var aegis_prexix = 'http://www.aegis-bigdata.eu/md/voc/core/';
            var type = null;

            if (entry.hasOwnProperty('type')) {
                var type_splitted = entry['type'].split('/');
                type = type_splitted[type_splitted.length - 1].toLowerCase();
            }

            var new_field = {
              description: entry[aegis_prexix + 'description'] || entry['description'] || '',
              name: entry['name'] || '',
              number: parseInt(entry['number'], 10) || '',
              type
            }
            
            fields.typeannotation.model.fields.push(new_field)
          }
        });

        return fields;
      },
      setProperty (obj, path, value) {
          var schema = obj;  // a moving reference to internal objects within obj
          var pList = path.split('.');
          var len = pList.length;
          for(var i = 0; i < len-1; i++) {
              var elem = pList[i];
              if( !schema[elem] ) schema[elem] = {}
              schema = schema[elem];
          }
          schema[pList[len-1]] = value;
      },

      FILE_FORMATS: [
        { id: '', name: 'None' },
        { id: 'TAR', name: 'TAR' },
        { id: 'ZIP', name: 'ZIP' },
        { id: 'GIF', name: 'GIF' },
        { id: 'JPEG', name: 'JPEG' },
        { id: 'TIFF', name: 'TIFF' },
        { id: 'PNG', name: 'PNG' },
        { id: 'PDF', name: 'PDF' },
        { id: 'SGML', name: 'SGML' },
        { id: 'XML', name: 'XML' },
        { id: 'DOC', name: 'DOC' },
        { id: 'DOCX', name: 'DOCX' },
        { id: 'ODT', name: 'ODT' },
        { id: 'TXT', name: 'TXT' },
        { id: 'RTF', name: 'RTF' },
        { id: 'CSV', name: 'CSV' },
        { id: 'MDB', name: 'MDB' },
        { id: 'DBF', name: 'DBF' },
        { id: 'KML', name: 'KML' },
        { id: 'TSV', name: 'TSV' },
        { id: 'JSON', name: 'JSON' },
        { id: 'KMZ', name: 'KMZ' },
        { id: 'ODF', name: 'ODF' },
        { id: 'JSON_LD', name: 'JSON_LD' },
        { id: 'OCTET', name: 'OCTET' },
        { id: 'BIN', name: 'BIN' },
        { id: 'SQL', name: 'SQL' },
        { id: 'MPEG4', name: 'MPEG4' },
        { id: 'MPEG4_AVC', name: 'MPEG4_AVC' },
        { id: 'GEOJSON', name: 'GEOJSON' },
        { id: 'ISO', name: 'ISO' },
        { id: 'ISO_ZIP', name: 'ISO_ZIP' },
        { id: 'RAR', name: 'RAR' },
      ],

      LANGUAGES: [
        { id: '', name: 'None' },
        { id: 'BUL', name: 'Bulgarian' },
        { id: 'HRV', name: 'Croatian' },
        { id: 'CES', name: 'Czech' },
        { id: 'DAN', name: 'Danish' },
        { id: 'NLD', name: 'Dutch' },
        { id: 'ENG', name: 'English' },
        { id: 'EST', name: 'Estonian' },
        { id: 'FIN', name: 'Finnish' },
        { id: 'FRA', name: 'French' },
        { id: 'DEU', name: 'German' },
        { id: 'ELL', name: 'Greek' },
        { id: 'HUN', name: 'Hungarian' },
        { id: 'GLE', name: 'Irish' },
        { id: 'ITA', name: 'Italian' },
        { id: 'LAV', name: 'Latvian' },
        { id: 'LIT', name: 'Lithuanian' },
        { id: 'MLT', name: 'Maltese' },
        { id: 'POL', name: 'Polish' },
        { id: 'POR', name: 'Portuguese' },
        { id: 'RON', name: 'Romanian' },
        { id: 'SLK', name: 'Slovak' },
        { id: 'SLV', name: 'Slovenian' },
        { id: 'SPA', name: 'Spanish' },
        { id: 'SWE', name: 'Swedish' }
      ],

      LICENCES: [
        { id: '', name: 'None', default: true  },
        { id: 'CC0', name: 'CC0 - Creative Commons CC0 1.0 Universal' },
        { id: 'CC_BY', name: 'CC_BY - Creative Commons Attribution 4.0 International' },
        { id: 'CC_BYNC', name: 'CC_BYNC - Creative Commons Attribution–NonCommercial 4.0 International' },
        { id: 'CC_BYNCND', name: 'CC_BYNCND - Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International' },
        { id: 'CC_BYNCND_1_0', name: 'CC_BYNCND_1_0 - Creative Commons Attribution–NoDerivs–NonCommercial 1.0 Generic' },
        { id: 'CC_BYNCND_2_0', name: 'CC_BYNCND_2_0 - Creative Commons Attribution–NonCommercial–NoDerivs 2.0 Generic' },
        { id: 'CC_BYNCND_2_5', name: 'CC_BYNCND_2_5 - Creative Commons Attribution–NonCommercial–NoDerivs 2.5 Generic' },
        { id: 'CC_BYNCND_3_0', name: 'CC_BYNCND_3_0 - Creative Commons Attribution–NonCommercial–NoDerivs 3.0 Unported' },
        { id: 'CC_BYNCND_4_0', name: 'CC_BYNCND_4_0 - Creative Commons Attribution–NonCommercial–NoDerivatives 4.0 International' },
        { id: 'CC_BYNCSA', name: 'CC_BYNCSA - Creative Commons Attribution–NonCommercial–ShareAlike 4.0 International' },
        { id: 'CC_BYNCSA_1_0', name: 'CC_BYNCSA_1_0 - Creative Commons Attribution–NonCommercial–ShareAlike 1.0 Generic' },
        { id: 'CC_BYNCSA_2_0', name: 'CC_BYNCSA_2_0 - Creative Commons Attribution–NonCommercial–ShareAlike 2.0 Generic' },
        { id: 'CC_BYNCSA_2_5', name: 'CC_BYNCSA_2_5 - Creative Commons Attribution–NonCommercial–ShareAlike 2.5 Generic' },
        { id: 'CC_BYNCSA_3_0', name: 'CC_BYNCSA_3_0 - Creative Commons Attribution–NonCommercial–ShareAlike 3.0 Unported' },
        { id: 'CC_BYNCSA_4_0', name: 'CC_BYNCSA_4_0 - Creative Commons Attribution–NonCommercial–ShareAlike 4.0 International' },
        { id: 'CC_BYNC_1_0', name: 'CC_BYNC_1_0 - Creative Commons Attribution–NonCommercial 1.0 Generic' },
        { id: 'CC_BYNC_2_0', name: 'CC_BYNC_2_0 - Creative Commons Attribution–NonCommercial 2.0 Generic' },
        { id: 'CC_BYNC_2_5', name: 'CC_BYNC_2_5 - Creative Commons Attribution–NonCommercial 2.5 Generic' },
        { id: 'CC_BYNC_3_0', name: 'CC_BYNC_3_0 - Creative Commons Attribution–NonCommercial 3.0 Unported' },
        { id: 'CC_BYNC_4_0', name: 'CC_BYNC_4_0 - Creative Commons Attribution–NonCommercial 4.0 International' },
        { id: 'CC_BYND', name: 'CC_BYND - Creative Commons Attribution–NoDerivatives 4.0 International' },
        { id: 'CC_BYND_1_0', name: 'CC_BYND_1_0 - Creative Commons Attribution–NoDerivs 1.0 Generic' },
        { id: 'CC_BYND_2_0', name: 'CC_BYND_2_0 - Creative Commons Attribution–NoDerivs 2.0 Generic' },
        { id: 'CC_BYND_2_5', name: 'CC_BYND_2_5 - Creative Commons Attribution–NoDerivs 2.5 Generic' },
        { id: 'CC_BYND_3_0', name: 'CC_BYND_3_0 - Creative Commons Attribution–NoDerivs 3.0 Unported' },
        { id: 'CC_BYND_4_0', name: 'CC_BYND_4_0 - Creative Commons Attribution–NoDerivatives 4.0 International' },
        { id: 'CC_BYSA', name: 'CC_BYSA - Creative Commons Attribution–ShareAlike 4.0 International' },
        { id: 'CC_BYSA_1_0', name: 'CC_BYSA_1_0 - Creative Commons Attribution–ShareAlike 1.0 Generic' },
        { id: 'CC_BYSA_2_0', name: 'CC_BYSA_2_0 - Creative Commons Attribution–ShareAlike 2.0 Generic' },
        { id: 'CC_BYSA_2_5', name: 'CC_BYSA_2_5 - Creative Commons Attribution–ShareAlike 2.5 Generic' },
        { id: 'CC_BYSA_3_0', name: 'CC_BYSA_3_0 - Creative Commons Attribution–ShareAlike 3.0 Unported' },
        { id: 'CC_BYSA_4_0', name: 'CC_BYSA_4_0 - Creative Commons Attribution–ShareAlike 4.0 International' },
        { id: 'CC_BY_1_0', name: 'CC_BY_1_0 - Creative Commons Attribution 1.0 Generic' },
        { id: 'CC_BY_2_0', name: 'CC_BY_2_0 - Creative Commons Attribution 2.0 Generic' },
        { id: 'CC_BY_2_5', name: 'CC_BY_2_5 - Creative Commons Attribution 2.5 Generic' },
        { id: 'CC_BY_3_0', name: 'CC_BY_3_0 - Creative Commons Attribution 3.0 Unported' },
        { id: 'CC_BY_4_0', name: 'CC_BY_4_0 - Creative Commons Attribution 4.0 International' },
        { id: 'COM_REUSE', name: 'COM_REUSE - European Commission reuse notice' },
        { id: 'EUPL_1_0', name: 'EUPL_1_0 - European Union Public Licence v.1.0' },
        { id: 'EUPL_1_1', name: 'EUPL_1_1 - European Union Public Licence v. 1.1' },
        { id: 'EUPL_1_2', name: 'EUPL_1_2 - European Union Public Licence v. 1.2' },
        { id: 'GNU_FDL', name: 'GNU_FDL - GNU Free Documentation License' },
        { id: 'ISA_OML', name: 'ISA_OML - ISA Open Metadata Licence 1.1' },
        { id: 'ODC_BL', name: 'ODC_BL - Open Data Commons Open Database License v1.0' },
        { id: 'ODC_BY', name: 'ODC_BY - Open Data Commons Attribution License v1.0' },
        { id: 'ODC_PDDL', name: 'ODC_PDDL - Open Data Commons Public Domain Dedication and License 1.0' },
        { id: 'OP_DATPRO', name: 'OP_DATPRO - Provisional data' }
      ],
  };

  return service;
}]);
