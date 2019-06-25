const host = window.location.hostname == 'localhost' ? 'https://bbc6.sics.se:8181' : '';

angular.module('hopsWorksApp')
  .constant('AEGIS_CONFIG', {
    metadata: {
      API_KEY: '',
      CATALOGUE_ENDPOINT: host + '/hopsworks-api/aegis-metadata/catalogues/',
      DATASET_ENDPOINT: host + '/hopsworks-api/aegis-metadata/datasets/',
      DISTRIBUTION_ENDPOINT: host + '/hopsworks-api/aegis-metadata/distributions/'
    }
  });
