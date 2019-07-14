'use strict';

angular.module('hopsWorksApp')
    .factory('LindaService', ['AEGIS_CONFIG', '$http', function (AEGIS_CONFIG, $http) {
        var service = {

            autocompleteLicence: function(input) {
                var query = {
                    "query": {
                        "bool": {
                            "should": [
                                {
                                    "nested": {
                                        "path": "altLabel",
                                        "query": {
                                            "match": {
                                                "altLabel.#text": {
                                                    "query": input,
                                                    "operator": "and"
                                                }
                                            }
                                        }
                                    }
                                },
                                {
                                    "nested": {
                                        "path": "prefLabel",
                                        "query": {
                                            "match": {
                                                "prefLabel.#text": {
                                                    "query": input,
                                                    "operator": "and"
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };

                var req = {
                    method: 'POST',
                    url: AEGIS_CONFIG.linda.LICENCE_INDEX,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: query
                };
                return $http(req);
            },

            resolveLicenceURL: function(url) {
                var query = {
                    "query": {
                        "match": {
                            "about": url
                        }
                    }
                };

                var req = {
                    method: 'POST',
                    url: AEGIS_CONFIG.linda.LICENCE_INDEX,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: query
                };
                return $http(req);
            },

            parseLicenceResolve: function(response, label) {
                var results = response.data.hits.hits;
                var returnValue = '';
                if(results.length > 0) {
                    var result = results[0];
                    var labels = result._source[label];
                    if(!Array.isArray(labels)) {
                        return labels['#text'];
                    } else {
                        labels.map(function (item) {
                            if(item['@lang'] === 'en') {
                                returnValue = item['#text'];
                            }
                        });
                    }
                    return returnValue;
                } else {
                    return '';
                }
            },

            parseLicenceResponse: function (response) {
                var selection = [];
                var results = response.data.hits.hits;
                results.forEach(function (val) {
                    try {
                        var selectionHit = { 'about': val._source['about']};
                        if(!Array.isArray(val._source.prefLabel)) {
                            selectionHit['label'] = val._source.prefLabel['#text'];
                        } else {
                            val._source.prefLabel.map(function (item) {
                                if(item['@lang'] === 'en') {
                                    selectionHit['label'] = item['#text'];
                                }
                            });
                        }
                        selection.push(selectionHit);
                    } catch (e) {
                        console.log(e);
                    }

                });
                return selection;
            }
        };

        return service;
    }]);