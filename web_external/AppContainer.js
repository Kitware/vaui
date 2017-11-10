import React, { PureComponent } from 'react';

import IndexView from './IndexView';
import HeaderBar from './HeaderBar';

class AppContainer extends PureComponent {
    render() {
        return [<HeaderBar className='v-header' key='header-bar'/>, <IndexView key='index-view' />];
    }
}

export default AppContainer;