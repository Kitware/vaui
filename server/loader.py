#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from girder.utility.webroot import Webroot
from rest import track


def load(info):
    # Load the mako template for Vaui and serve it as the root document.
    mako = os.path.join(os.path.dirname(__file__), "index.mako")
    webroot = Webroot(mako)
    webroot.updateHtmlVars(info['serverRoot'].vars)
    html_vars = {'title': 'Vaui', 'externalJsUrls': []}
    webroot.updateHtmlVars(html_vars)

    # Move girder app to /girder, serve app from /
    info['serverRoot'], info['serverRoot'].girder = (webroot,
                                                     info['serverRoot'])
    info['serverRoot'].api = info['serverRoot'].girder.api

    info['apiRoot'].video = track.TrackResource()
