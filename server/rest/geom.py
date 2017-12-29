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
from girder.api.rest import Resource
from girder.models.item import Item
from girder.plugins.vaui.models.Geom import Geom


class GeomResource(Resource):

    def __init__(self):
        super(GeomResource, self).__init__()

        self.resourceName = 'geom'
        self.route('GET', (':itemId',), self.getGeomsOfItem)
        self.route('POST', (':itemId',), self.addGeomToItem)
        self.route('PUT', (':geomId',), self.updateGeom)
        self.route('DELETE', (':geomId',), self.deleteGeom)

    @autoDescribeRoute(
        Description('')
        .modelParam('itemId', model=Item, level=AccessType.READ)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def getGeomsOfItem(self, item, params):
        cursor = Geom().findByItem(item)
        return list(cursor)

    @autoDescribeRoute(
        Description('')
        .modelParam('itemId', model=Item, level=AccessType.WRITE)
        .jsonParam('data', 'The geom content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def addGeomToItem(self, item, data, params):
        data['itemId'] = item['_id']
        return Geom().save(data)

    @autoDescribeRoute(
        Description('')
        .modelParam('geomId', model=Geom)
        .jsonParam('data', 'The geom content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def updateGeom(self, geom, data, params):
        data.pop('_id', None)
        data.pop('itemId', None)
        geom.update(data)
        return Geom().save(geom)

    @autoDescribeRoute(
        Description('')
        .modelParam('geomId', model=Geom)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def deleteGeom(self, geom,  params):
        Geom().remove(geom)
        return ''
