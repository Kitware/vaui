import App from 'girder/views/App';
import ReactDOM from 'react-dom';
import React from 'react';

import AppContainer from './AppContainer';

import template from './templates/layout.pug';
import './stylesheets/layout.styl';

const VauiApp = App.extend({

    render() {
        this.$el.html(template());

        ReactDOM.render(
            <AppContainer />,
            document.getElementById('g-app-body-container')
        );

        return this;
    }

});
export default VauiApp;
