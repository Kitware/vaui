import $ from 'jquery';
import * as reconcile from 'reconcile.js';
import GirderView from 'girder/views/View';

const View = GirderView.extend({
    update(template) {
        var $new = $(template);
        var children = this.$el.children(0);
        if (!children.length) {
            this.$el.append($new);
            return false;
        } else {
            var changes = reconcile.diff($new[0], this.$el.children(0)[0]);
            reconcile.apply(changes, this.$el.children(0)[0]);
            return true;
        }
    }
});
export default View;
