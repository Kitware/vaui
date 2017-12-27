import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import events from 'girder/events';
import { logout, getCurrentUser } from 'girder/auth';

import { LOGIN_STATE_CHANGE } from './actions';
import IndexView from './IndexView';
import HeaderBar from './HeaderBar';

class AppContainer extends PureComponent {
    componentDidMount() {
        events.on('g:login', () => {
            this.props.onLoginStateChange(getCurrentUser());
        });
    }
    render() {
        return [<HeaderBar className='v-header' key='header-bar' />, <IndexView key='index-view' />];
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onLoginStateChange: (user) => {
            dispatch({
                type: LOGIN_STATE_CHANGE,
                user
            })
        }
    }
}

export default connect(null, mapDispatchToProps)(AppContainer);
