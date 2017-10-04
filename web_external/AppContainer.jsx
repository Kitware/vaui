import React, { Component } from 'react';

import IndexView from './IndexView';
import HeaderBar from './HeaderBar';

class AppContainer extends Component {
    render() {
        return [<HeaderBar className='v-header' key='header-bar'/>, <IndexView key='index-view' />];
    }
}

export default AppContainer;