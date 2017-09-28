import View from '../View';
import template from '../../templates/body/treeView.pug';

import '../../stylesheets/body/treeView.styl';

const TreeView = View.extend({
    events: {
    },
    initialize() {
    },
    render() {
        this.$el.html(template(this));
        return this;
    }
});
export default TreeView;
