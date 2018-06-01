import $ from 'jquery';
// import { registerPluginNamespace } from 'girder/pluginUtils';
import girderRouter from 'girder/router';
// import Raven from 'raven-js';

// Raven
//     .config('https://1b56183d068e4a389040754a3e56bf93@sentry.io/1215827')
//     .install();

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
