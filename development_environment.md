# Setup Development Environment  

## Server  
  
The following instruction is base on a clean Ubuntu 16.04.3.  
  
install mongodb https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04  
install node v8 with npm v5  
  
Open a termimal  
`git clone -b 2.x-maintenance https://github.com/girder/girder.git`  
`git clone https://github.com/girder/large_image.git`  
`git clone https://github.com/Kitware/vaui.git`  
(Switch to master branch for latest development)  
  
create a python virtual environment  
`cd girder`  
`pip install -r requirements-dev.txt`  
`pip install -e .`  
`pip install --user numpy==1.10.2`  
`girder-install plugin -s ../large_image/`  
`girder-install plugin -s ../vaui/`  
`girder-install web --dev --plugins vaui`  
`girder-server`  
(the server will start running)  
  
navigate to http://localhost:8080  
register a user  
navigate to http://localhost:8080/#assetstores  
Create a file Assetstore  
navigate to http://localhost:8080/#plugins  
Enable Vaui  
stop the running server in the termial with CTRL+C  
`girder-server`  
(girder-server -H 0.0.0.0 to listen to all ports)  
navigate to http://localhost:8080, and the VAUI interface should be shown  
(with VAUI enabled, the girder interface is available at http://localhost:8080/girder)  
At this moment, you will need clip frames and KPFs to see annotations  

## Interpolation Worker  
Open a termimal  
install [Erlang](https://packages.erlang-solutions.com/erlang/) and [RabbitMQ](https://www.rabbitmq.com/install-debian.html#bintray-apt-repo)  
create a different python virtual environment  
`git clone https://github.com/girder/girder_worker.git`  
`pip install -e ~/girder_worker/`  
`pip install girder-worker-utils`  
`pip install -e ../vaui/`  
`girder-worker -l info`

## LibYAML, Optional for performance  
Within the server virtual environment  
`curl -O http://pyyaml.org/download/libyaml/yaml-0.1.7.tar.gz`  
`tar -xvzf yaml-0.1.7.tar.gz`  
`cd yaml-0.1.7`  
`./configure`  
`make`  
`sudo make install`  
`cd ..`  
`curl -O http://pyyaml.org/download/pyyaml/PyYAML-3.12.tar.gz`  
`tar -xvzf PyYAML-3.12.tar.gz`  
`cd PyYAML-3.12`  
`sudo python setup.py --with-libyaml install`  
Restart server  
