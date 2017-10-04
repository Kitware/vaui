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

import cherrypy

from girder.api import access
from girder.api.describe import describeRoute, autoDescribeRoute, Description
from girder.api.rest import Resource, loadmodel, filtermodel, RestException
from girder.constants import AccessType, SortDir
from girder.models.model_base import ValidationException


class TrackResource(Resource):

    def __init__(self):
        super(TrackResource, self).__init__()

        self.resourceName = 'track'
        self.route('GET', ('item', ':id', 'video'), self.getTrack)

    @autoDescribeRoute(
        Description('Return video metadata if it exists.')
        .param('id', 'Id of the item.', paramType='path')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def getTrack(self, params):
        return {'abc': 123}
