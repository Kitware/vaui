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
from girder.models.folder import Folder
from ..models.activities import Activities


class ActivitiesResource(Resource):

    def __init__(self):
        super(ActivitiesResource, self).__init__()

        self.resourceName = 'activities'
        # self.route('GET', (':folderId',), self.getActivitiesOfFolder)
        # self.route('POST', (':folderId',), self.addActivitiesToFolder)
        # self.route('PUT', (':activityId',), self.updateActivity)
        # self.route('DELETE', (':activityId',), self.deleteActivity)
        # self.route('GET', ('export', ':folderId',), self.exportKPF)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.READ)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def getActivitiesOfFolder(self, folder, params):
        cursor = Activities().findByFolder(folder)
        return list(cursor)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.WRITE)
        .jsonParam('data', 'The activity content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def addActivitiesToFolder(self, folder, data, params):
        data['folderId'] = folder['_id']
        return Activities().save(data)

    @autoDescribeRoute(
        Description('')
        .modelParam('activityId', model=Activities)
        .jsonParam('data', 'The activity content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def updateActivity(self, activities, data, params):
        data.pop('_id', None)
        data.pop('folderId', None)
        activities.update(data)
        return Activities().save(activities)

    @autoDescribeRoute(
        Description('')
        .modelParam('activityId', model=Activities)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def deleteActivity(self, activities, params):
        Activities().remove(activities)
        return ''

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.READ)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    @access.cookie
    @rawResponse
    def exportKPF(self, folder, params):
        setResponseHeader('Content-Type', 'text/plain')
        setResponseHeader('Content-Disposition', 'attachment; filename=activities.kpf')
        return self.generateKPFContent(folder)

    @staticmethod
    def generateKPFContent(assignmentId):
        cursor = Activities().findByAssignmentId(assignmentId)
        output = []
        for activity in cursor:
            del activity['_id']
            del activity['assignmentId']
            activity = yaml.safe_dump(activity, default_flow_style=True,
                                      width=1000).rstrip()
            output.append('- {{ act: {0} }}'.format(activity))

        def gen():
            yield '\n'.join(output)
        return gen
