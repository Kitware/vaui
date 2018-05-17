#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from girder.utility.webroot import Webroot
from rest import detection
from rest import annotation, types, activities, interpolation, submit


def load(info):
    # Load the mako template for Vaui and serve it as the root document.
    mako = os.path.join(os.path.dirname(__file__), "index.mako")
    webroot = Webroot(mako)
    webroot.updateHtmlVars(info['serverRoot'].vars)
    html_vars = {'title': 'Refiner', 'externalJsUrls': []}
    webroot.updateHtmlVars(html_vars)

    # Move girder app to /girder, serve app from /
    info['serverRoot'], info['serverRoot'].girder = (webroot,
                                                     info['serverRoot'])
    info['serverRoot'].api = info['serverRoot'].girder.api

    info['apiRoot'].detection = detection.DetectionResource()
    info['apiRoot'].vaui_annotation = annotation.AnnotationResource()
    info['apiRoot'].activities = activities.ActivitiesResource()
    info['apiRoot'].types = types.TypesResource()
    info['apiRoot'].interpolation = interpolation.Interpolation()
    info['apiRoot'].submit = submit.SubmitResource()
