# Setup Development Environment  
  
The following instruction is base on a clean Ubuntu 16.04.3.  
  
install mongodb https://www.digitalocean.com/community/tutorials/how-to-install-mongodb-on-ubuntu-16-04  
install node v8 with npm v5  
  
Open a termimal  
git clone -b 2.x-maintenance https://github.com/girder/girder.git  
git clone https://github.com/girder/large_image.git  
git clone -b v0.1 https://github.com/Kitware/vaui.git  
(Switch to master branch for latest development)  
  
(create a python virtual environment if you want to)  
cd girder  
pip install -r requirements-dev.txt  
pip install -e .  
pip install --user numpy==1.10.2  
girder-install plugin -s ../large_image/  
girder-install plugin -s ../vaui/  
girder-install web --dev --plugins vaui  
girder-server  
(the server will start running)  
  
navigate to http://localhost:8080  
register a user  
navigate to http://localhost:8080/#assetstores  
Create a file Assetstore  
navigate to http://localhost:8080/#plugins  
Enable Vaui  
stop the running server in the termial with CTRL+C  
girder-server  
navigate to http://localhost:8080, and the VAUI interface should be shown  
At this moment, you will need clip frames and KPFs to see annotations  
