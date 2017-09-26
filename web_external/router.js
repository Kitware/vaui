import Backbone from 'backbone';
import girderRouter from 'girder/router';
import events from 'girder/events';
import IndexView from './views/body/IndexView';

girderRouter.enabled(false);

var router = new Backbone.Router();

export default router;

router.route('', 'index', function () {
    events.trigger('g:navigateTo', IndexView, null, { renderNow: true });
});

events.on('g:login', function () {
    events.trigger('g:navigateTo', IndexView);
});

