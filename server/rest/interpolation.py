#!/usr/bin/env python
# -*- coding: utf-8 -*-

import yaml
import calendar
import time

from girder.api import access
from girder.api.describe import autoDescribeRoute, Description
from girder.constants import AccessType
from girder.api.rest import Resource

from girder.models.folder import Folder
from girder.models.item import Item

from tasks.interpolation import interpolate
from tasks.transform import PrepareInterpolate, SaveResultToItem


class Interpolation(Resource):

    def __init__(self):
        super(Interpolation, self).__init__()

        self.resourceName = 'interpolation'
        self.route('POST', (), self.interpolate)

    @autoDescribeRoute(
        Description('')
        .jsonParam('detections',
                   'JSON describing the output dataset name and Gaia process',
                   paramType='body')
        .errorResponse()
    )
    @access.user
    def interpolate(self, detections, params):
        user, token = self.getCurrentUser(returnToken=True)
        kwargs = {
            'params': params,
            'user': user,
            'token': token
        }

        folder = Folder().createFolder(user, 'tasks_result',
                                       parentType='user', reuseExisting=True)
        calendar.timegm(time.gmtime())
        item = Item().createItem('interpolation_' + str(calendar.timegm(time.gmtime())), user, folder, reuseExisting=True)

        result = interpolate.delay(PrepareInterpolate(detections),
                                   girder_job_title='Interpolation',
                                   girder_result_hooks=[SaveResultToItem(item['_id'])],
                                   girder_job_other_fields={'meta': {'itemId': str(item['_id'])}})
        job = result.job

        return job
