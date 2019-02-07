#!/bin/bash
# Deploy the frontend to the glassfish home directory and run bower

PORT=35573
WEBPORT=44591
USR=stamatis
SERVER=bbc6.sics.se

TSERVER=localhost
BASEDIR=/srv/hops/domains/domain1
KEY=insecure_private_key

scp ${USR}@${SERVER}:/home/${USR}/.vagrant.d/${KEY} .

ssh -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -q -i $KEY -p $PORT vagrant@${TSERVER} "cd ${BASEDIR} && sudo chown -R vagrant:vagrant docroot && sudo chmod -R 775 * &&  sudo chown -R vagrant:vagrant ~/.local || echo 'no .local'"

rsync -avzhe "ssh -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -q -i $KEY -p ${PORT}" -r ../hopsworks-web/yo/app/ vagrant@${TSERVER}:${BASEDIR}/docroot/app

scp -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -q -i $KEY -P ${PORT} ../hopsworks-web/yo/bower.json vagrant@${TSERVER}:${BASEDIR}/docroot/app

ssh -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -q -i $KEY -p $PORT vagrant@${TSERVER} "cd ${BASEDIR}/docroot/app && bower install"

# firefox -new-tab http://${TSERVER}:$WEBPORT/app
# google-chrome -new-tab http://${SERVER}:$WEBPORT/app