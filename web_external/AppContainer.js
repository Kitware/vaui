import React, { PureComponent, Fragment } from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import events from 'girder/events';
import { getCurrentUser } from 'girder/auth';
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import qs from 'query-string';

import { LOGIN_STATE_CHANGE } from './actions/types';
import IndexView from './IndexView';
import HeaderBar from './HeaderBar';
import Result from './Result';
import FormSubmitter from './FormSubmitter';

import './contextmenu-ext/contextMenu.css';

class AppContainer extends PureComponent {
    componentDidMount() {
        events.on('g:login', () => {
            this.props.onLoginStateChange(getCurrentUser());
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.saving !== nextProps.saving || this.props.loadingAnnotation != nextProps.loadingAnnotation) {
            if (nextProps.saving || nextProps.loadingAnnotation) {
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
        return <Router>
            <Fragment>
                <Route exact path='/' render={(props) => {
                    var queryParams = qs.parse(location.search);
                    if (!('folderId' in queryParams &&
                        'activityGroupItemId' in queryParams &&
                        'assignmentId' in queryParams &&
                        'hitId' in queryParams)) {
                        return <div>Missing folderId, activityGroupItemId, assignmentId, or hitId in query parameter</div>
                    } else {
                        return <Fragment>
                            <HeaderBar className='v-header' key='header-bar' />
                            {this.props.selectedFolder && this.props.frameLimit && <IndexView />}
                        </Fragment>
                    }
                }} />
                <Route exact path="/submit" component={FormSubmitter} />
                <Route exact path="/problem" component={FormSubmitter} />
                <Route exact path="/result/:assignmentId" render={(props) => {
                    return <Fragment>
                        <Result />
                        {this.props.selectedFolder && this.props.frameLimit && <IndexView />}
                    </Fragment>
                }} />
            </Fragment>
        </Router>
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        saving: state.saving,
        loadingAnnotation: state.loadingAnnotation,
        selectedFolder: state.selectedFolder,
        frameLimit: state.frameLimit
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
