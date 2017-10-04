import $ from 'jquery';
import { registerPluginNamespace } from 'girder/pluginUtils';
import girderRouter from 'girder/router';

import App from './App.js';
import events from './events';

girderRouter.enabled(false);

girderRouter.route('', 'index', function () {
});

$(function () {
    events.trigger('g:appload.before');
    var app = new App({
        el: 'body',
        parentView: null,
        start: false
    });
    app.start().done(function () {
        events.trigger('g:appload.ready');
    });
    events.trigger('g:appload.after');
});

// registerPluginNamespace('vaui', index);
