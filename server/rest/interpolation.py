#!/usr/bin/env python
# -*- coding: utf-8 -*-

import yaml

from girder.api import access
from girder.api.describe import autoDescribeRoute,Description
from girder.constants import AccessType
from girder.api.rest import Resource

from tasks.interpolation import interpolate


class Interpolation(Resource):

    def __init__(self):
        super(Interpolation, self).__init__()

        self.resourceName = 'interpolation'
        self.route('POST', (), self.interpolate)

    @autoDescribeRoute(
        Description('')
        .errorResponse()
    )
    @access.user
    def interpolate(self, params):
        user, token = self.getCurrentUser(returnToken=True)
        kwargs = {
            'params': params,
            'user': user,
            'token': token
        }
        result = interpolate.delay(kwargs, girder_job_title='Interpolation')
        job = result.job

        return job
