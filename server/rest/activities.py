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
from girder.api import access
from girder.api.describe import autoDescribeRoute, Description
from girder.constants import AccessType
from girder.api.rest import Resource, setResponseHeader, rawResponse
from girder.models.item import Item
from girder.plugins.vaui.models.activities import Activities


class ActivitiesResource(Resource):

    def __init__(self):
        super(ActivitiesResource, self).__init__()

        self.resourceName = 'activities'
        self.route('GET', (':itemId',), self.getActivitiesOfItem)
        self.route('POST', (':itemId',), self.addActivitiesToItem)
        self.route('PUT', (':activityId',), self.updateActivity)
        self.route('DELETE', (':activityId',), self.deleteActivity)
        self.route('GET', ('export', ':itemId',), self.exportKPF)

    @autoDescribeRoute(
        Description('')
        .modelParam('itemId', model=Item, level=AccessType.READ)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def getActivitiesOfItem(self, item, params):
        cursor = Activities().findByItem(item)
        return list(cursor)

    @autoDescribeRoute(
        Description('')
        .modelParam('itemId', model=Item, level=AccessType.WRITE)
        .jsonParam('data', 'The activity content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def addActivitiesToItem(self, item, data, params):
        data['itemId'] = item['_id']
        return Activities().save(data)

    @autoDescribeRoute(
        Description('')
        .modelParam('activityId', model=Activities)
        .jsonParam('data', 'The activity content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def updateActivity(self, activity, data, params):
        data.pop('_id', None)
        data.pop('itemId', None)
        activity.update(data)
        return Activities().save(activity)

    @autoDescribeRoute(
        Description('')
        .modelParam('activityId', model=Activities)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def deleteActivity(self, activity, params):
        Activities().remove(activity)
        return ''

    @autoDescribeRoute(
        Description('')
        .modelParam('itemId', model=Item, level=AccessType.READ)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    @access.cookie
    @rawResponse
    def exportKPF(self, item, params):
        setResponseHeader('Content-Type', 'text/plain')
        setResponseHeader('Content-Disposition', 'attachment; filename=types.kpf')
        raise Exception('Not implemented')
