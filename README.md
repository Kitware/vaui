# VAUI

Vision Annotation UI is designed to provide a web-enabled interface to annotate video and satellite imagery, thus creating labeled data for machine learning algorithms. 
 
# Contact

Contact kitware@kitware.com for questions regarding using VAUI and deploying it in a cloud environment.

# License

Copyright 2017 Kitware Inc.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

# Setup
Have the latest [girder](http://girder.readthedocs.io/en/latest/installation.html#install-from-git-repository) up and running  
Clone this repo to e.g. ~/vaui  
Execute `girder-install plugin -s ~/vaui` within the girder virtualenv  
Execute `girder-install web --dev --plugins vaui`  
Run `girder-server`  
Navigate to `localhost:8080` and create a user and a file assetstore and enable this Vaui plugin  
Stop and restart the server  
Navigate to `localhost:8080`  
