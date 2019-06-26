angular.module('hopsWorksApp')
  .constant('AEGIS_CONFIG', {
    metadata: {
      API_KEY: '',
      CATALOGUE_ENDPOINT: 'https://bbc6.sics.se:8181/hopsworks-api/aegis-metadata/catalogues/',
      DATASET_ENDPOINT: 'https://bbc6.sics.se:8181/hopsworks-api/aegis-metadata/datasets/',
      DISTRIBUTION_ENDPOINT: 'https://bbc6.sics.se:8181/hopsworks-api/aegis-metadata/distributions/'
    }
  });
