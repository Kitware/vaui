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
from ..models.geom import Geom
from ..models.activities import Activities
from ..models.types import Types
from .geom import GeomResource
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
        geomItem, activitiesItem, typesItem = self._getAnnotationItems(folder)

        setResponseHeader('Content-Length', 1000000)

        def gen():
            self._importActivities(activitiesItem)
            self._importTypes(typesItem)
            lastProgress = 0
            import math
            for percentage in self._importGeom(geomItem):
                progress = int(math.floor(percentage * 100))
                if lastProgress != progress:
                    yield '1' * (progress - lastProgress) * 10000
                    lastProgress = progress
            yield '1' * (100 - lastProgress) * 10000
        return gen

    def _getAnnotationItems(self, folder):
        geomItem = Item().findOne(query={
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
        return geomItem, activitiesItem, typesItem

    @staticmethod
    def _readKPF(item):
        geomFile = Item().childFiles(item)[0]
        result = File().download(geomFile, headers=False)
        fileContent = ''.join(list(result()))
        return fileContent.splitlines()

    def _importGeom(self, item):
        print 'start import geom'
        print datetime.datetime.utcnow()

        Geom().removeWithQuery(query={'itemId': item['_id']})
        print 'removed existing records'
        print datetime.datetime.utcnow()

        geomFile = Item().childFiles(item)[0]
        result = File().download(geomFile, headers=False)
        fileContent = ''.join(list(result()))

        print 'fileContent'
        print datetime.datetime.utcnow()
        lines = fileContent.splitlines()
        lineCount = float(len(lines))
        for i, line in enumerate(lines):
            obj = load(line, Loader=Loader)[0]
            if 'geom' not in obj:
                continue
            geom = obj['geom']
            geom['itemId'] = item['_id']
            values = geom['g0'].split()
            geom['g0'] = [
                [int(values[0]), int(values[1])],
                [int(values[2]), int(values[3])]
            ]
            Geom().save(geom)
            yield i / lineCount
        print 'finish _importGeom()'
        print datetime.datetime.utcnow()

    def _importActivities(self, item):
        Activities().removeWithQuery(query={'itemId': item['_id']})

        for line in AnnotationResource._readKPF(item):
            obj = load(line, Loader=Loader)[0]
            if 'act' not in obj:
                continue
            activity = obj['act']
            activity['itemId'] = item['_id']
            Activities().save(activity)

    def _importTypes(self, item):
        Types().removeWithQuery(query={'itemId': item['_id']})

        for line in AnnotationResource._readKPF(item):
            obj = load(line, Loader=Loader)[0]
            if 'types' not in obj:
                continue
            types = obj['types']
            types['itemId'] = item['_id']
            Types().save(types)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.WRITE)
        .errorResponse()
        .errorResponse('Write access was denied on the item.', 403)
    )
    @access.user
    def checkImportStatus(self, folder, params):
        geomItem, activitiesItem, typesItem = self._getAnnotationItems(folder)
        if not geomItem:
            raise RestException('missing geom annotation file', code=404)
        if not activitiesItem:
            raise RestException('missing activities annotation file', code=404)
        if not typesItem:
            raise RestException('missing types annotation file', code=404)
        imported = Geom().imported(geomItem) and Activities().imported(
            activitiesItem) and Types().imported(typesItem)
        return imported

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
            geomItem, activitiesItem, typesItem = self._getAnnotationItems(folder)

            for data in zip.addFile(GeomResource.generateKPFContent(geomItem), geomItem['name']):
                yield data
            for data in zip.addFile(TypesResource.generateKPFContent(typesItem), typesItem['name']):
                yield data
            for data in zip.addFile(ActivitiesResource.generateKPFContent(activitiesItem), activitiesItem['name']):
                yield data
            yield zip.footer()
        return stream
