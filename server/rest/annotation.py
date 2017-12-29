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
import datetime

from girder.api import access
from girder.api.describe import autoDescribeRoute, Description
from girder.constants import AccessType
from girder.api.rest import Resource
from girder.models.folder import Folder
from girder.models.item import Item
from girder.models.file import File
from girder.exceptions import RestException
from girder.plugins.vaui.models.Geom import Geom


class AnnotationResource(Resource):

    def __init__(self):
        super(AnnotationResource, self).__init__()

        self.resourceName = 'vauiAnnotation'
        self.route('POST', ('import', ':folderId',), self.importAnnotation)
        self.route('GET', ('importStatus', ':folderId',), self.checkImportStatus)

    @autoDescribeRoute(
        Description('')
        .modelParam('folderId', model=Folder, level=AccessType.WRITE)
        .errorResponse()
        .errorResponse('Write access was denied on the item.', 403)
    )
    @access.user
    def importAnnotation(self, folder, params):
        # TODO: Check if is a clip folder
        geomItem, activitiesItem, typesItem = self._getAnnotationItems(folder)
        self._importGeom(geomItem)
        return

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
        for line in fileContent.splitlines():
            obj = yaml.load(line)[0]
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
        print 'finish _importGeom()'
        print datetime.datetime.utcnow()

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
        geomImported = Geom().imported(geomItem)
        return geomImported
