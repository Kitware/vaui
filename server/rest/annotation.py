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

from yaml import load
try:
    from yaml import CLoader as Loader
except ImportError:
    import sys
    sys.stderr.write('Failed to import LibYAML, using PyYAML instead, which will be slower\n')
    from yaml import Loader
import datetime

from girder.api import access
from girder.api.describe import autoDescribeRoute, Description
from girder.constants import AccessType
from girder.utility import ziputil
from girder.api.rest import Resource, setResponseHeader, setContentDisposition, rawResponse
from girder.models.folder import Folder
from girder.models.item import Item
from girder.models.file import File
from girder.exceptions import RestException
from ..models.detection import Detection
from ..models.activities import Activities
from ..models.types import Types
from .detection import DetectionResource
from .activities import ActivitiesResource
from .types import TypesResource


class AnnotationResource(Resource):

    def __init__(self):
        super(AnnotationResource, self).__init__()

        self.resourceName = 'vaui_annotation'
        self.route('POST', ('import', ':folderId',), self.importAnnotation)
        self.route('GET', ('status', ':folderId',), self.checkImportStatus)
        self.route('GET', ('export', ':folderId',), self.export)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.WRITE)
        .errorResponse()
        .errorResponse('Write access was denied on the item.', 403)
    )
    @rawResponse
    @access.user
    def importAnnotation(self, folder, params):
        # TODO: Check if is a clip folder
        detectionItem, activitiesItem, typesItem = self._getAnnotationItems(folder)

        setResponseHeader('Content-Length', 1000000)

        def gen():
            self._importActivities(folder['_id'], activitiesItem)
            self._importTypes(folder['_id'], typesItem)
            lastProgress = 0
            import math
            for percentage in self._importDetection(folder['_id'], detectionItem):
                progress = int(math.floor(percentage * 100))
                if lastProgress != progress:
                    yield '1' * (progress - lastProgress) * 10000
                    lastProgress = progress
            yield '1' * (100 - lastProgress) * 10000
        return gen

    def _getAnnotationItems(self, folder):
        detectionItem = Item().findOne(query={
            'folderId': folder['_id'],
            'name': '{0}.geom.yml'.format(folder['name'])
        })
        activitiesItem = Item().findOne(query={
            'folderId': folder['_id'],
            'name': '{0}.activities.yml'.format(folder['name'])
        })
        typesItem = Item().findOne(query={
            'folderId': folder['_id'],
            'name': '{0}.types.yml'.format(folder['name'])
        })
        return detectionItem, activitiesItem, typesItem

    @staticmethod
    def _readKPF(item):
        detectionFile = Item().childFiles(item)[0]
        result = File().download(detectionFile, headers=False)
        fileContent = ''.join(list(result()))
        return fileContent.splitlines()

    def _importDetection(self, folderId, item):
        print 'start import detection'
        print datetime.datetime.utcnow()
        Detection().removeWithQuery(query={'folderId': folderId})
        print 'removed existing records'
        print datetime.datetime.utcnow()

        detectionFile = Item().childFiles(item)[0]
        result = File().download(detectionFile, headers=False)
        fileContent = ''.join(list(result()))

        print 'read detection file'
        print datetime.datetime.utcnow()
        lines = fileContent.splitlines()
        lineCount = float(len(lines))
        for i, line in enumerate(lines):
            obj = load(line, Loader=Loader)[0]
            if 'geom' not in obj:
                continue
            detection = obj['geom']
            detection['folderId'] = folderId
            values = detection['g0'].split()
            detection['g0'] = [
                [int(values[0]), int(values[1])],
                [int(values[2]), int(values[3])]
            ]
            Detection().save(detection)
            yield i / lineCount
        print 'finish import Detections'
        print datetime.datetime.utcnow()

    def _importActivities(self, folderId, item):
        Activities().removeWithQuery(query={'folderId': folderId})

        for line in AnnotationResource._readKPF(item):
            obj = load(line, Loader=Loader)[0]
            if 'act' not in obj:
                continue
            activity = obj['act']
            activity['folderId'] = folderId
            Activities().save(activity)

    def _importTypes(self, folderId, item):
        Types().removeWithQuery(query={'folderId': folderId})

        for line in AnnotationResource._readKPF(item):
            obj = load(line, Loader=Loader)[0]
            if 'types' not in obj:
                continue
            types = obj['types']
            types['folderId'] = folderId
            Types().save(types)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.WRITE)
        .errorResponse()
        .errorResponse('Write access was denied on the item.', 403)
    )
    @access.user
    def checkImportStatus(self, folder, params):
        detectionItem, activitiesItem, typesItem = self._getAnnotationItems(folder)
        return {
            'kpf': {
                'detection': detectionItem is not None,
                'activities': activitiesItem is not None,
                'types': typesItem is not None
            },
            'records': {
                'detection': Detection().recordCount(folder),
                'activities': Activities().recordCount(folder),
                'types': Types().recordCount(folder)
            }
        }

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.READ)
        .produces('application/zip')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    @access.cookie
    @rawResponse
    def export(self, folder, params):
        setResponseHeader('Content-Type', 'application/zip')
        setContentDisposition(folder['name'] + '.zip')

        def stream():
            zip = ziputil.ZipGenerator(folder['name'])

            for data in zip.addFile(DetectionResource.generateKPFContent(folder), folder['name'] + '.geom.kpf'):
                yield data
            for data in zip.addFile(TypesResource.generateKPFContent(folder), folder['name'] + '.types.kpf'):
                yield data
            for data in zip.addFile(ActivitiesResource.generateKPFContent(folder), folder['name'] + '.activities.kpf'):
                yield data
            yield zip.footer()
        return stream
