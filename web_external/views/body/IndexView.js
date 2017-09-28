import View from '../View';
import template from '../../templates/body/indexView.pug';

import TreeView from './TreeView';
import ViewerView from './ViewerView';
import TrackAttributeView from './TrackAttributeView';

import '../../stylesheets/body/indexView.styl';

const IndexView = View.extend({
    events: {
    },
    initialize() {
        this.treeView = new TreeView({
            parentView: this
        });
        this.viewerView = new ViewerView({
            parentView: this
        });
        this.trackAttributeView = new TrackAttributeView({
            parentView: this
        });
    },
    render() {
        this.$el.html(template(this));
        this.treeView.setElement(this.$('.left-sidebar')).render();
        this.viewerView.setElement(this.$('.main')).render();
        this.trackAttributeView.setElement(this.$('.right-sidebar')).render();
        return this;
    }
});
export default IndexView;
