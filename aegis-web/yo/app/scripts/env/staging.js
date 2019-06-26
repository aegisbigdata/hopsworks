angular.module('hopsWorksApp')
  .constant('AEGIS_CONFIG', {
    metadata: {
      API_KEY: '',
      CATALOGUE_ENDPOINT: '/hopsworks-api/aegis-metadata/catalogues/',
      DATASET_ENDPOINT: '/hopsworks-api/aegis-metadata/datasets/',
      DISTRIBUTION_ENDPOINT: '/hopsworks-api/aegis-metadata/distributions/'
    }
  });
