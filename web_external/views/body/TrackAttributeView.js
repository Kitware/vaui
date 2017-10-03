import View from '../View';
import template from '../../templates/body/trackAttributeView.pug';
import trackAttributes from './track-attributes';

import '../../stylesheets/body/trackAttributeView.styl';

const TrackAttributeView = View.extend({
    events: {
    },
    initialize() {
        this.trackAttributes = trackAttributes;
    },
    render() {
        this.$el.html(template(this));
        return this;
    }
});
export default TrackAttributeView;
