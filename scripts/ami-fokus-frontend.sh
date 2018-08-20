export SERVER=bbc6.sics.se
echo USER=michael
export USER=michael
export WEBPORT=8080
export SUBPATH=fokus
export DIR=/srv/hops/domains/domain1/applications/${SUBPATH}
echo "automatic dev frontend deployment to ${SERVER}"
rsync -r ../hopsworks-web/yo/app/ ${USER}@${SERVER}:${DIR}
scp -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i $key -P ${PORT} ../hopsworks-web/yo/bower.json ${USER}@${SERVER}:${DIR}
ssh -o PasswordAuthentication=no -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -o IdentitiesOnly=yes -i $key -p $PORT ${USER}@${SERVER} "cd ${DIR} && bower install && perl -pi -e \"s/getLocationBase()/'http:\/\/${SERVER}:${WEBPORT}\/hopsworks'/g\" scripts/services/RequestInterceptorService.js"
firefox -new-tab http://${SERVER}:8080/${SUBPATH} &
watch -n 1 rsync -r ../hopsworks-web/yo/app/ ${USER}@${SERVER}:${DIR}
