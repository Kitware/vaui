import View from '../View';

const TreeView = View.extend({
    events: {
    },
    initialize() {
    },
    render() {
        this.$el.html("hello vaui");
        return this;
    }
});
export default TreeView;
