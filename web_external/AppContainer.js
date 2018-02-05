import React, { PureComponent } from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import events from 'girder/events';
import { getCurrentUser } from 'girder/auth';

import { LOGIN_STATE_CHANGE } from './actions/types';
import IndexView from './IndexView';
import HeaderBar from './HeaderBar';

import './contextmenu-ext/contextMenu.css';

class AppContainer extends PureComponent {
    componentDidMount() {
        events.on('g:login', () => {
            this.props.onLoginStateChange(getCurrentUser());
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.saving !== nextProps.saving) {
            if (nextProps.saving) {
                $(window).on('beforeunload', this.unloadConfirmation);
            } else {
                $(window).off('beforeunload');
            }
        }
    }

    unloadConfirmation(e) {
        var dialogText = 'Data is being saved, reload the page may cause data corruption. Do you want to continue?';
        e.returnValue = dialogText;
        return dialogText;
    }

    render() {
        return [
            <HeaderBar className='v-header' key='header-bar' />,
            <IndexView key='index-view' />
        ];
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        saving: state.saving
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onLoginStateChange: (user) => {
            dispatch({
                type: LOGIN_STATE_CHANGE,
                user
            });
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
