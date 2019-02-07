# Hopsworks

[![Join the chat at https://gitter.im/hopshadoop/hopsworks](https://badges.gitter.im/hopshadoop/services.png)](https://gitter.im/hopshadoop/hopsworks)
[![Google Group](https://img.shields.io/badge/google-group-blue.svg)](https://groups.google.com/forum/#!forum/hopshadoop)


<a href=""><img src="https://www.hops.io/wp-content/uploads/2018/07/Plants-Hops-icon-50x50-e1532970413999.png" align="left" hspace="10" vspace="6"></a>
**Hopsworks** is the UI for Hops, a new distribution of Apache Hadoop with scalable, highly available, customizable 
metadata. Hopsworks lowers the barrier to entry for users getting started with Hadoop by providing graphical access to services such as Spark, Flink, Kafka, HDFS, and YARN. HopsWorks provides self-service Hadoop by introducing two new abstractions: projects and datasets. Users manage membership of projects, which scope access to datasets. Datasets are again managed by users who can safely share them between projects or keep them private within a project. Hopsworks takes the administrator out of the loop for managing data and access to data.

## Information

<ul>
<li><a href="https://twitter.com/hopshadoop">Follow our Twitter account.</a></li>
<li><a href="https://groups.google.com/forum/#!forum/hopshadoop">Join our developer mailing list.</a></li>
<li><a href="https://bbc1.sics.se/jenkins/job/Hopsworks-build/">Checkout the current build status.</a></li>
</ul>

## Installing Hopsworks

Hopsworks is part of the Hops Hadoop platform which you can install by following instructions available in 
Hops [documentation](http://hops.readthedocs.io) under *Installation Guide*.

For a local single-node installation, to access Hopsworks just point your browser at:
```
  http://localhost:8080/hopsworks
  usename: admin@kth.se
  password: admin
```

## Build instructions
Hopsworks consists of the backend module which is packaged in two files, `hopsworks.ear`  and `hopsworks-ca.war`,
and the front-end module which is packaged in a single `.war` file. 


### Build Requirements (for Ubuntu)
NodeJS server and bower, both required for building the front-end.

```sh
sudo apt install nodejs-legacy
sudo apt-get install npm
sudo npm cache clean
# You must have a version of bower > 1.54
sudo npm install bower -g
sudo npm install grunt -g
```

### Build with Maven
```sh
mvn install 
```
Maven uses yeoman-maven-plugin to build both the front-end and the backend.
Maven first executes the Gruntfile in the yo directory, then builds the back-end in Java.
The yeoman-maven-plugin copies the dist folder produced by grunt from the yo directory to the target folder of the backend.

You can also build Hopsworks without the frontend (for Java EE development and testing):
```sh
mvn install -P-web
```

## Front-end Development 

The javascript produced by building maven is obsfuscated. For debugging javascript, we recommend that you use the following script
to deploy changes to HTML or javascript to your vagrant machine:

```sh
cd scripts
./js.sh
```

You should also add the chef recipe to the end of your Vagrantfile (or Karamel cluster definition):
```
 hopsworks::dev
```


#### For development

You can build Hopsworks without running grunt/bower using:

```
mvn install -P-dist
```

Then run your script to upload your javascript to snurran.sics.se:

```
cd scripts
./deploy.sh [yourName]
```


## Testing Guide
The following steps must be taken to run Hopsworks integration tests:


```diff
-Warning: This test will clean hdfs and drop Hopsworks database. So it should only be used on a test machine.
```

First create a .env file by copying the .env.example file. Then edit the .env file by providing your specific configuration. 
```sh
   cd hopsworks/hopsworks-ear/test
   cp .env.example .env
```


Then change the properties in Hopsworks parent pom.xml to match the server you are deploying to:
```xml
  <properties>
    ...
    <glassfish.hostname>{hostname}</glassfish.hostname>
    <glassfish.admin>{username}</glassfish.admin>
    <glassfish.passwd>{password}</glassfish.passwd>
    <glassfish.port>{http-port}</glassfish.port>
    <glassfish.admin_port>{admin-ui-port}</glassfish.admin_port>
    <glassfish.domain>{domain}</glassfish.domain>
  </properties>
```

To compile, deploy and run the integration test:
```sh
   cd hopsworks/
   mvn clean install -Pjruby-tests
```

If you have already deployed hopsworks-ear and just want to run the integration test:

```sh
   cd hopsworks/hopsworks-ear/test
   bundle install
   rspec --format html --out ../target/test-report.html
```
To run a single test 
```sh
   cd hopsworks/hopsworks-ear/test
   rspec ./spec/session_spec.rb:60
```
When the test is done if `LAUNCH_BROWSER` is set to true in `.env`, it will open the test report in a browser.

## Port forwarding
If you are trying to access a port that is not open on a machine, but you have access through ssh, you can do port forwarding:
```
ssh -L {REMOTE_PORT}:{TARGET_SERVER}:{LOCAL_PORT} {USR}@{BRIDGE_SERVER}
```
In most cases the TARGET_SERVER will be the same as BRIDGE_SERVER (if the service you want to access is on the same machine as the one you have ssh access to).

Remember to keep these connections open for the durations of your work.

If before you were accessing the remote service on:
{TARGET_SERVER}:{REMOTE_PORT}
you can now access them on
localhost:{LOCAL_PORT}

## Relevant vm ports
In many cases you will want to access some of the deployed service, or you might want to forward ports to some of the vm services. Since you can run many vms on the same machine, the services will be running on different ports than the default. If the default WEBPORT is 8080(within the vm) the service might be provided on the 8080 but forwarded to the host machine on port 45678 and thus you will access the http service on 45678 for this particular vm.
Relevant port for access/debugging can be found in the Vagrantfile of your vm:
1. ssh port - 22
2. hopsworks http port - 8080
3. karamel http port - 9090 - in case your vm deployment fails, you can run karamel in headless mode and retry by accessing the web-ui of karamel.
4. glassfish debug port - 9009 - used for hopsworks back-end remote debugging.
5. glassfish admin UI - 4848 - used for deploying the services on the glassfish server

Note: Remember that you will find these services on the Vagrantfile forwarded ports and not on the default ports. Furthermore, the host-machine forwarded port might itself not be accessible to the outside, so you will need to do port forwarding (above section) through a ssh connection.

## Deploying services on your vm's glassfish server

You can access the glassfish server on your vm on the 4848 port and it will have the default user/password. Go to the Applications section and you will see 3 packages deployed:
1. hopsworks-ca - part of the security services
2. hopsworks-web - the web-ui - html/javascript
3. hopsworks-ear - the back-end with the rest endpoints

If you modified the web-ui or the backend you can generate the above packages with mvn:
```
mvn clean install -DskipTests
```
and then you will find the packages:
1. hopsworks-ca - hopsworks/hopsworks-ca/target/hopsworks-ca.war
2. hopworks-web - hopsworks-web/target/hopsworks-web.war - when redeploying you actually have to rename this war to hopsworks.war
3. hopsworks-ear - hopsworks-ear/target/hopsworks-ear.ear

Having your new packages, you can undeploy the old version from the glassfish version and deploy your new version. The ear package is a bit bigger so it might take a few minutes to deploy.

## Setting up the development environment
1. we are running hospworks as a vm on a remote machine. we assume we can ssh into the remote machine.
2. developing environment - ubuntu 16.04.3
3. java 8 required
```
sudo apt-get install default-jdk
```
4. maven, git required. maven requires a bit of memory to compile and package everything
```
export MAVEN_OPTS="-Xmx1G"
```
5. compiling the front end requires npm, node, grunt, bower.
```
sudo apt-get install nodejs-legacy npm
sudo npm cache clean
sudo npm install bower -g
sudo npm install grunt -g
```
6. the vm might be running on a machine that does not have all ports accessible(bbc6). you will need to port-forward hopsworks http port(check port-forwarding section above).
When replaced with correct values, these command would look similar to:
```
ssh -L 55170:bbc6.sics.se:55170 aaor@bbc6.sics.se
```
and you can access your service on
```
localhost:55170
```
## Fast deployment of frontend
Fast deployment of html/javascript files to the vm:
```
cd scripts
./scp-web.sh
```
Note: before running the script, update the PORT, WEBPORT, USR in the scp-web.sh script.
```
PORT - ssh port
WEBPORT - hopsworks http port
USR - user used to ssh into the remote machine(NOT the user within the vm, which is vagrant for a typical vm installation)
SERVER - change if necessary to the remote machine
```
Note: fast deployment of html/javascript files does NOT require compiling it. Just run the scp-web script from the scripts folder. This is only for development - after you are satisfied with your changes, deploy the frontend as described in the deploy services section.

Note: youtube help [video](https://youtu.be/GdFrOLsZHq4).

## Hopsworks backend remote debugging with Netbeans
The first thing to do is to enable remote debugging on your glassfish server. Access the glassfish admin-ui (on port 4848 - forwarded) and go to:
Configurations -> server-config -> JVM settings -> General and enable Debug (by default the box is unchecked). 
You save and next we need to restart glassfish so that the new settings get loaded. Go to your vm and inside the vm run:
```
sudo systemctl restart glassfish-domain1
```
These steps for enabling debug on glassfish are a one time per vm setup.

Next we add a new glassfish server remote connection to Netbeans: [video](https://youtu.be/GdFrOLsZHq4)

At times remote debugging might fail while deploying. This might take down the glassfish server, so you need to restart it before attempting again. Within your vm run:
```
sudo systemctl restart glassfish-domain1
```
In order to debug: [video](https://youtu.be/UsWMjFSVVrA)
The first time you debug, the deployment might take a couple of minutes. Further debug session will have far less to deploy since they will only synchronize the modified java files.

# Swagger
In order to have a swagger serving point on your vm, build your packages with swagger and deploy them on glassfish.
```
mvn clean install -DskipTests -Pswagger-ui
```
You can now access swagger on your vm on "hopsworks/swagger-ui". Assuming you access your vm with port forwarding on port 43210, you can access swagger at: http://localhost:43210/hopsworks/swagger-ui

# Resize disk of active vm without destroying
Steps 1-8 from https://gist.github.com/christopher-hopper/9755310

Resizing guest file system from https://www.laurentiupancescu.com/blog/591c105a/

Video of the process: https://youtu.be/vtDHK79yHqI

Other sources:
https://medium.com/@phirschybar/resize-your-vagrant-virtualbox-disk-3c0fbc607817
https://github.com/sprotheroe/vagrant-disksize

# Simple starting code for Zeppelin on Hops
Reading a csv file from hdfs:
```
val datasetDF = spark.read.format("csv").option("inferSchema", "true").load("hdfs:///filePath")
datasetDF.show()
```
Writting a file for hdfs:
```
val data = Array(1, 2, 3, 4, 5)
val distData = sc.parallelize(data).coalesce(1)
distData.saveAsTextFile("hdfs:///dirPath")
```
In order for Zeppelin to be able to write file on your behalf, you should make the dataset group writtable. This can be achieved from the dataset view - right click menu.
