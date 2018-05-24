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
import json
from bson import ObjectId

from girder.api import access
from girder.api.describe import autoDescribeRoute, Description
from girder.constants import AccessType
from girder.api.rest import Resource, setResponseHeader, rawResponse
from girder.models.folder import Folder
from girder.plugins.vaui.models.detection import Detection


class DetectionResource(Resource):

    def __init__(self):
        super(DetectionResource, self).__init__()

        self.resourceName = 'detection'
        # self.route('GET', (':folderId',), self.getDetectionsOfFolder)
        # self.route('POST', (':folderId',), self.addDetectionToFolder)
        # self.route('PUT', (':detectionId',), self.updateDetection)
        # self.route('DELETE', (':detectionId',), self.deleteDetection)
        # self.route('GET', ('export', ':assignmentId',), self.exportKPF)

    # The girder default serialization takes twice the time
    # as this custom serializer. Since detection could be relatively big,
    # it is worthwhile to use this custom serializer.
    class JSONEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, ObjectId):
                return str(obj)
            return json.JSONEncoder.default(self, obj)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.READ)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    @rawResponse
    def getDetectionsOfFolder(self, folder, params):
        setResponseHeader('Content-Type', 'application/json')
        cursor = Detection().findByFolder(folder)
        jsonString = self.JSONEncoder().encode(list(cursor))
        return jsonString

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.WRITE)
        .jsonParam('data', 'The detection content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def addDetectionToFolder(self, folder, data, params):
        data['folderId'] = folder['_id']
        return Detection().save(data)

    @autoDescribeRoute(
        Description('')
        .modelParam('detectionId', model=Detection, destName='detection')
        .jsonParam('data', 'The detection content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def updateDetection(self, detection, data, params):
        data.pop('_id', None)
        data.pop('folderId', None)
        detection.update(data)
        return Detection().save(detection)

    @autoDescribeRoute(
        Description('')
        .modelParam('detectionId', model=Detection, destName='detection')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def deleteDetection(self, detection, params):
        Detection().remove(detection)
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
        setResponseHeader('Content-Disposition', 'attachment; filename=detection.kpf')
        return self.generateKPFContent(folder)

    @staticmethod
    def generateKPFContent(assignmentId):
        # The pyyaml without c yaml is not fast, so for detection, considering the
        # size, we build the yaml by hand
        cursor = Detection().findByAssignmentId(assignmentId)
        output = []
        for detection in cursor:
            keyValues = []
            for key in detection:
                if key == 'assignmentId' or key == '_id':
                    continue
                if key == 'g0':
                    value = str(detection['g0'][0][0]) + ' ' + str(detection['g0'][0][1]) + \
                        ' ' + str(detection['g0'][1][0]) + ' ' + str(detection['g0'][1][1])
                else:
                    value = detection[key]
                keyValues.append('{0}: {1}'.format(key, value))
            content = '- { detection: { ' + ', '.join(keyValues) + ' } }'
            output.append(content)

        def gen():
            yield '\n'.join(output)
        return gen
