import View from '../View';
import template from '../../templates/body/treeView.pug';

import '../../stylesheets/body/treeView.styl';

const TreeView = View.extend({
    events: {
    },
    initialize() {
        var tracks = [];
        var objects = ['Vehicle', 'Person'];
        for (var i = 0; i < 100; i++) {
            tracks.push(objects[Math.round(Math.random())] + '-' + (Math.floor(Math.random() * 400) + 100));
        }
        this.tracks = tracks;
    },
    render() {
        this.$el.html(template(this));
        return this;
    }
});
export default TreeView;
