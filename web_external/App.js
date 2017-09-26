import App from 'girder/views/App';

import HeaderView from './views/layout/HeaderView';
import template from './templates/layout.pug';
import './stylesheets/layout.styl';

const VauiApp = App.extend({

    render() {
        this.$el.html(template());
        new HeaderView({
            el: this.$('#v-app-header-container'),
            parentView: this
        }).render();
        return this;
    }

});
export default VauiApp;
