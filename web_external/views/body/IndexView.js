import View from '../View';

const IndexView = View.extend({
    events: {
    },
    initialize() {
    },
    render() {
        this.$el.html("hello vaui");
        return this;
    }
});
export default IndexView;
