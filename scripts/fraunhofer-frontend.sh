#!/bin/bash
# Deploy the frontend to the glassfish home directory at fraunhofer test server
export SERVER=aegis-hopsworks.fokus.fraunhofer.de
echo USER=${whoami}
export WEBPORT = 8080
export DIR=/srv/hops/domains/domain1/docroot/${USER}

echo "automatic dev frontend deployment to ${SERVER}"
rsync -r ../hopsworks-web/yo/app/ ${USER}@aegis-hopsworks.fokus.fraunhofer.de:${DIR}

scp -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i $key -P ${PORT} ../hopsworks-web/yo/bower.json ${USER}@${SERVER}:${DIR}

ssh -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i $key -p $PORT ${USER}@${SERVER} "cd ${DIR} && bower install && perl -pi -e \"s/getLocationBase\(\)/'http:\/\/${SERVER}:${WEBPORT}\/hopsworks'/g\" scripts/services/RequestInterceptorService.js"


x-www-browser -new-tab http://${SERVER}:8080/${USER} &

watch -n 1 rsync -r ../hopsworks-web/yo/app/ ${USER}@aegis-hopsworks.fokus.fraunhofer.de:${DIR}

