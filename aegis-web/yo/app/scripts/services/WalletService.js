'use strict';
/*
 * Service allowing fetching topic history objects by type.
 */
angular.module('hopsWorksApp').factory('WalletService', [
    '$http',
    function($http) {
        var service = {
            /**
             * Share dataset
             * @param {type} dataset
             * @returns {undefined}
             */
            share: function(dataset) {
                var req = {
                    method: 'POST',
                    url: '/api/wallet/share',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: dataset
                };
                return $http(req);
            },
            createUser: function(user) {
                var req = {
                    method: 'POST',
                    url: '/api/wallet/user',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: user
                };
                return $http(req);
            },
            getUsers: function() {
                var req = {
                    method: 'GET',
                    url: '/api/wallet/user',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                return $http(req);
            },
            getUser: function(uid) {
                var req = {
                    method: 'GET',
                    url: '/api/wallet/user/' + uid,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                return $http(req);
            },
            createAsset: function(asset) {
                var req = {
                    method: 'POST',
                    url: '/api/wallet/asset',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: asset
                };
                return $http(req);
            },
            getAssets: function() {
                var req = {
                    method: 'GET',
                    url: '/api/wallet/asset',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                return $http(req);
            },
            getAsset: function(aid) {
                var req = {
                    method: 'GET',
                    url: '/api/wallet/asset/' + aid,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                return $http(req);
            },
            createContract: function(contract) {
                var req = {
                    method: 'POST',
                    url: '/api/wallet/contract',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: contract
                };
                return $http(req);
            },
            getContracts: function() {
                var req = {
                    method: 'GET',
                    url: '/api/wallet/contract',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                return $http(req);
            },
            getBuyContracts: function(uid) {
                var req = {
                    method: 'GET',
                    url: '/api/wallet/contract/buy/' + uid,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                return $http(req);
            },
            getSellContracts: function(uid) {
                var req = {
                    method: 'GET',
                    url: '/api/wallet/contract/sell/' + uid,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                return $http(req);
            },
            validateContract: function(validation) {
                var req = {
                    method: 'POST',
                    url: '/api/wallet/contract/validate',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: validation
                };
                return $http(req);
            }
        };
        return service;
    }
]);
