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


class SubmitResource(Resource):

    def __init__(self):
        super(SubmitResource, self).__init__()

        self.resourceName = 'submit'
        self.route('POST', (), self.submit)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.READ, paramType='query')
        .modelParam('activityGroupItemId', model=Item, level=AccessType.READ, paramType='query')
        .param('assignmentId', '')
        .param('hitId', '')
        .param('workerId', '')
        .param('turkSubmitTo', '')
        .jsonParam('data', '', paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.public
    def submit(self, folder, item, data, params):
        assignmentId = params['assignmentId']
        hitId = params['hitId']
        workerId = params['workerId']
        turkSubmitTo = params['turkSubmitTo']

        for detection in data['detections']:
            detection['assignmentId'] = assignmentId
            Detection().save(detection)

        for type in data['types']:
            type['assignmentId'] = assignmentId
            Types().save(type)

        for activity in data['activities']:
            activity['assignmentId'] = assignmentId
            Activities().save(activity)

        adminUser = User().getAdmins().next()
        collection = Collection().createCollection('TURK', creator=adminUser,
                                                   description='', public=True, reuseExisting=True)
        folder = Folder().createFolder(
            collection, 'results', parentType='collection', public=False,
            creator=adminUser, reuseExisting=True)
        item = Item().createItem(assignmentId, adminUser, folder, reuseExisting=True)
        Item().setMetadata(item, {
            'folderId': str(folder['_id']),
            'activityGroupItemId': str(item['_id']),
            'assignmentId': assignmentId,
            'hitId': hitId,
            'workerId': workerId,
            'turkSubmitTo': turkSubmitTo
        })
