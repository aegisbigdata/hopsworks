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
      parseDatasetGraph (jsonld, fields) {
        if (!jsonld.hasOwnProperty('@graph')) return;
        var graph = jsonld['@graph'];
        var index_location, index_contactpoint, index_dataset, index_temporal;

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
        })

        // Set publisher Info
        // var type_splitted = graph[index_organization]['@type'].split('/');
        // fields.publishertype.model = type_splitted[type_splitted.length - 1].toUpperCase();
        // fields.publishername.model = graph[index_organization].name;
        // fields.homepage.model = graph[index_organization].homepage;

        // Set Language field
        if (graph[index_dataset].hasOwnProperty('http://purl.org/dc/terms/language')) {
          var language_splitted = graph[index_dataset]['http://purl.org/dc/terms/language']['@id'].split('/');
          fields.language.model = language_splitted[language_splitted.length - 1];
        }

        // Set License field
        if (graph[index_dataset].hasOwnProperty('license')) {
          var license_splitted = graph[index_dataset].license.split('/');
          fields.license.model = license_splitted[license_splitted.length - 1];
        }

        // Set other fields
        fields.title.model = graph[index_dataset]['http://purl.org/dc/terms/title'] || '';
        fields.description.model = graph[index_dataset]['http://purl.org/dc/terms/description'] || '';
        fields.accessRights.model = graph[index_dataset]['http://purl.org/dc/terms/accessRights'] || '';
        fields.price.model = graph[index_dataset]['http://www.aegis-bigdata.eu/md/voc/core/price'] || '';
        fields.sellable.model = (graph[index_dataset]['http://www.aegis-bigdata.eu/md/voc/core/sellable'] == 'true') || graph[index_dataset]['http://www.aegis-bigdata.eu/md/voc/core/sellable'];


        
        if (graph[index_dataset].hasOwnProperty('http://www.w3.org/ns/dcat#keyword')) {
          let tags = graph[index_dataset]['http://www.w3.org/ns/dcat#keyword'];
          fields.keywords.model = tags.join();
          fields.keywords.tags = tags.map(tag => {
            return {text: tag};
          });
        }

        if (graph[index_dataset].hasOwnProperty('http://www.w3.org/ns/dcat#theme')) {
          var theme_splitted = graph[index_dataset]['http://www.w3.org/ns/dcat#theme']['@id'].split('/');
          fields.theme.model = theme_splitted[theme_splitted.length - 1];
        }

        if (graph[index_dataset].hasOwnProperty('http://xmlns.com/foaf/0.1/page')) {
          fields.documentation.model = graph[index_dataset]['http://xmlns.com/foaf/0.1/page']['@id'] || '';
        }

        // Set temporal data fields
        if (index_temporal) {
          let temporalData = graph[index_temporal];
          if (temporalData.hasOwnProperty('http://schema.org/startDate')) fields.temporalfrom.model = moment(temporalData['http://schema.org/startDate']);
          if (temporalData.hasOwnProperty('http://schema.org/endDate')) fields.temporalto.model = moment(temporalData['http://schema.org/endDate']);
        }

        if (index_contactpoint) {
          var type_splitted = graph[index_contactpoint]['@type'].split('#');
          fields.contactpointtype.model = type_splitted[type_splitted.length - 1].toUpperCase() || '';
          fields.contactpointname.model = graph[index_contactpoint]['http://www.w3.org/2006/vcard/ns#fn'] || '';

          if (graph[index_contactpoint].hasOwnProperty('http://www.w3.org/2006/vcard/ns#hasEmail')) {
            fields.contactpointmail.model = graph[index_contactpoint]['http://www.w3.org/2006/vcard/ns#hasEmail']['@id'];
            fields.contactpointmail.model = fields.contactpointmail.model.split(':');
            fields.contactpointmail.model = fields.contactpointmail.model[fields.contactpointmail.model.length - 1];
          }
        }

        if (typeof(index_location) == 'number' && graph[index_location].hasOwnProperty('http://www.w3.org/ns/locn#geometry')) {
          var geoJSON = graph[index_location]['http://www.w3.org/ns/locn#geometry'];
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
        var graph = jsonld['@graph'];
        fields.typeannotation.model.fields = [];

        graph.forEach((entry, index) => {
          if (entry.hasOwnProperty('http://www.w3.org/ns/dcat#accessURL')) {
            var distro = graph[index];
            fields.title.model = distro['http://purl.org/dc/terms/title'] || '';
            fields.description.model = distro['http://purl.org/dc/terms/description'] || '';
            fields.format.model = distro['http://purl.org/dc/terms/format'] || '';

            if (distro.hasOwnProperty('http://www.w3.org/ns/dcat#accessURL')) fields.accessUrl.model = distro['http://www.w3.org/ns/dcat#accessURL']['@id'] || '';
            if (distro.hasOwnProperty('http://purl.org/dc/terms/language')) {
              var language_splitted = distro['http://purl.org/dc/terms/language']['@id'].split('/');
              fields.language.model = language_splitted[language_splitted.length - 1];
            }

            if (distro.hasOwnProperty('http://purl.org/dc/terms/license')) {
              var license_splitted = distro['http://purl.org/dc/terms/license']['@id'].split('/');
              fields.license.model = license_splitted[license_splitted.length - 1];
            }

          } else {
            var aegis_prexix = 'http://www.aegis-bigdata.eu/md/voc/core/';
            var type = null;

            if (entry.hasOwnProperty(aegis_prexix + 'type')) {
              if (entry[aegis_prexix + 'type']['@id'] != '') {
                var type_splitted = entry[aegis_prexix + 'type']['@id'].split('/');
                type = type_splitted[type_splitted.length - 1].toLowerCase();
              }
            }

            var new_field = {
              description: entry[aegis_prexix + 'description'] || '',
              name: entry[aegis_prexix + 'name'] || '',
              number: parseInt(entry[aegis_prexix + 'number'], 10) || '',
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
        { id: 'CC0', name: 'CC0 - Creative Commons CC0 1.0 Universal', default: true },
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
