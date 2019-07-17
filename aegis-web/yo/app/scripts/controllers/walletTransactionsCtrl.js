'use strict';

angular.module('hopsWorksApp').controller('WalletTransactionsCtrl', [
    '$location',
    '$anchorScroll',
    '$scope',
    '$rootScope',
    'md5',
    'ModalService',
    'HopssiteService',
    'DelaService',
    'ProjectService',
    'growl',
    '$http',
    'UserService',
    'WalletService',
    function(
        $location,
        $anchorScroll,
        $scope,
        $rootScope,
        md5,
        ModalService,
        HopssiteService,
        DelaService,
        ProjectService,
        growl,
        $http,
        UserService,
        WalletService
    ) {
        var self = this;
        self.currentTabIndex = 0;

        self.transactionCategories = [
            {
                key: 'all',
                name: 'All Transactions'
            },
            {
                key: 'recent',
                name: 'Recent Transactions'
            }
        ];
        self.selectedTransaction = self.transactionCategories[0];
        self.assetsSold = [];
        self.assetsBought = [];

        UserService.profile().then(function(success) {
            if (success.data.username === 'spiros00') {
                self.assetsSold = [
                    {
                        id: 'cf3e5f8b-bd7b-4ca6-9f24-0a29d5841beb',
                        name: 'FloodDamageData.csv',
                        coins: 250,
                        date: 'Wednesday, 3 July 2019, 15:28:04',
                        buyer: 'skous@live.com',
                        seller: 'spiros@suite5.eu'
                    }
                ];
            } else if (success.data.username === 'skous000') {
                self.assetsBought = [
                    {
                        id: 'cf3e5f8b-bd7b-4ca6-9f24-0a29d5841beb',
                        name: 'FloodDamageData.csv',
                        coins: 250,
                        date: 'Wednesday, 3 July 2019, 15:28:04',
                        buyer: 'skous@live.com',
                        seller: 'spiros@suite5.eu'
                    }
                ];
            }
            //     // Get bought contracts
            //     WalletService.getBuyContracts(success.data.email).then(
            //       function (res) {
            //         res.data.forEach(function (contract) {
            //           getAssetName(contract, self.assetsBought);
            //         });
            //       },
            //       function (err) {
            //         // TODO: Handle error
            //       }
            //     );
            //     WalletService.getSellContracts(success.data.email).then(
            //       function (res) {
            //         res.data.forEach(function (contract) {
            //           getAssetName(contract, self.assetsSold);
            //         });
            //       },
            //       function (err) {
            //         // TODO: Handle error
            //       }
            //     )
            //   },
            //   function (error) {
            //     // TODO: Handle error
        });

        function getAssetName(contract, assets) {
            var asset_id = contract.relatedAsset.split('#')[1];
            var res = asset_id.split('-');
            var projectID = res[0];
            var inodeID = res[1];

            ProjectService.getInodeInfo({ id: projectID, inodeId: inodeID }).$promise.then(function(response) {
                assets.push({
                    id: contract.tid,
                    name: response.name,
                    coins: contract.amountPaid,
                    date: contract.text,
                    buyer: contract.buyer.split('#')[1],
                    seller: contract.seller.split('#')[1]
                });
            });
        }

        /*            this.assetsSold = [
                {
                    id: 0,
                    dataset: 'dataset 0',
                    coins: '1000',
                    date: '10/1/2019',
                },
                {
                    id: 1,
                    dataset: 'dataset 1',
                    coins: '231',
                    date: '13/1/2019',
                },
                {
                    id: 2,
                    dataset: 'dataset 2',
                    coins: '234',
                    date: '14/1/2019',
                },
                {
                    id: 3,
                    dataset: 'dataset 3',
                    coins: '34534',
                    date: '15/1/2019',
                },
                {
                    id: 4,
                    dataset: 'dataset 4',
                    coins: '745',
                    date: '17/1/2019',
                },
                {
                    id: 5,
                    dataset: 'dataset 5',
                    coins: '123',
                    date: '18/1/2019',
                },
                {
                    id: 6,
                    dataset: 'dataset 6',
                    coins: '564',
                    date: '20/1/2019',
                },
            ];  */

        self.selectTransaction = function(transaction) {
            console.log('selectDisplayTransaction', transaction);

            self.selectedTransaction = transaction;
        };

        self.displayTransaction = function(asset) {
            ModalService.transaction('md', asset);
        };

        var init = function() {
            $('.keep-open').on('shown.bs.dropdown', '.dropdown', function() {
                $(self).attr('closable', false);
            });

            $('.keep-open').on('click', '.dropdown', function() {
                console.log('.keep-open: click');
            });

            $('.keep-open').on('hide.bs.dropdown', '.dropdown', function() {
                return $(self).attr('closable') === 'true';
            });

            $('.keep-open').on('click', '#dLabel', function() {
                $(self)
                    .parent()
                    .attr('closable', true);
            });

            $(window).scroll(function() {
                if ($(self).scrollLeft() > 0) {
                    $('#publicdataset').css({ left: 45 - $(self).scrollLeft() });
                }
            });
            $(window).resize(function() {
                var w = window.outerWidth;
                if (w > 1280) {
                    $('#publicdataset').css({ left: 'auto' });
                }
            });
        };

        var overflowY = function(val) {
            $('#hwWrapper').css({ 'overflow-y': val });
        };

        self.setupStyle = function() {
            init();
            overflowY('hidden');
            $('#publicdatasetWrapper').css({ width: '1200px' });
        };

        self.overflowYAuto = function() {
            overflowY('auto');
            $('#publicdatasetWrapper').css({ width: '1500px' });
        };

        $scope.$on('$destroy', function() {
            overflowY('auto');
        });
    }
]);
