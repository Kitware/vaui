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
from girder.plugins.vaui.models.types import Types


class TypesResource(Resource):

    def __init__(self):
        super(TypesResource, self).__init__()

        self.resourceName = 'types'
        self.route('GET', (':itemId',), self.getTypesOfItem)
        self.route('POST', (':itemId',), self.addTypesToItem)
        self.route('PUT', (':typesId',), self.updateTypes)
        self.route('DELETE', (':typesId',), self.deleteTypes)
        self.route('GET', ('export', ':itemId',), self.exportKPF)

    @autoDescribeRoute(
        Description('')
        .modelParam('itemId', model=Item, level=AccessType.READ)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def getTypesOfItem(self, item, params):
        cursor = Types().findByItem(item)
        return list(cursor)

    @autoDescribeRoute(
        Description('')
        .modelParam('itemId', model=Item, level=AccessType.WRITE)
        .jsonParam('data', 'The types content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def addTypesToItem(self, item, data, params):
        data['itemId'] = item['_id']
        return Types().save(data)

    @autoDescribeRoute(
        Description('')
        .modelParam('typesId', model=Types)
        .jsonParam('data', 'The types content', requireObject=True, paramType='body')
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def updateTypes(self, types, data, params):
        data.pop('_id', None)
        data.pop('itemId', None)
        types.update(data)
        return Types().save(types)

    @autoDescribeRoute(
        Description('')
        .modelParam('typesId', model=Types)
        .errorResponse()
        .errorResponse('Read access was denied on the item.', 403)
    )
    @access.user
    def deleteTypes(self, types, params):
        Types().remove(types)
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
