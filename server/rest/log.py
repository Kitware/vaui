#!/usr/bin/env python
# -*- coding: utf-8 -*-

##############################################################################
#  Copyright Kitware Inc.
#
#  Licensed under the Apache License, Version 2.0 ( the "License" );
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
##############################################################################
import yaml
import uuid
import time
import cherrypy

from girder.api import access
from girder.api.describe import autoDescribeRoute, Description
from girder.constants import AccessType
from girder.api.rest import Resource, setResponseHeader, rawResponse
from girder.models.user import User
from girder.models.folder import Folder
from girder.models.collection import Collection
from girder.models.item import Item
from girder.plugins.vaui.models.detection import Detection
from girder.plugins.vaui.models.types import Types
from girder.plugins.vaui.models.activities import Activities


class LogResource(Resource):

    def __init__(self):
        super(LogResource, self).__init__()

        self.resourceName = 'log'
        self.route('POST', (':hitId', ':type',), self.log)

    @autoDescribeRoute(
        Description('')
        .param('hitId', '')
        .param('type', '')
        .jsonParam('data', '', paramType='body')
        .errorResponse()
        .errorResponse('', 403)
    )
    @access.public
    def log(self, type, hitId, data, params):
        adminUser = User().getAdmins().next()
        collection = Collection().createCollection('Refiner', creator=adminUser,
                                                   description='', public=True, reuseExisting=True)
        logFolder = Folder().createFolder(
            collection, 'log', parentType='collection', public=False,
            creator=adminUser, reuseExisting=True)

        logItemName = str(int(time.time())) + '_' + hitId + '_' + \
            (data['workerId'] + '_' if 'workerId' in data else '') + type + '_'  + \
            str(uuid.uuid4().get_hex().upper()[0:4])

        item = Item().createItem(logItemName, adminUser, logFolder, reuseExisting=True)
        data['type'] = type
        data['ip'] = cherrypy.request.remote.ip
        data['userAgent'] = cherrypy.request.headers.get("User-Agent")
        Item().setMetadata(item, data)
