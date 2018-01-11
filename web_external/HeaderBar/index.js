import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { logout } from 'girder/auth';
import events from 'girder/events';
import { getApiRoot } from 'girder/rest';

import { SELECTED_FOLDER_CHANGE, SELECTED_ITEM_CHANGE } from '../actions/types';
import ClipExplorer from '../ClipExplorer';
import loadAnnotation from '../actions/loadAnnotation';
import save from '../actions/save';

import './style.styl';

class HeaderBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showClipExplorer: false
        };
    }

    render() {
        let user = this.props.user;
        return <div className={['v-header-wrapper', this.props.className].join(' ')}>
            <div className='button-wrapper toolbutton'>
                <button className='btn btn-primary' disabled={this.props.loadingAnnotation} onClick={(e) => this.setState({ showClipExplorer: true, modalKey: Math.random() })/* want to have new instance every time */}>Load</button>
                <button className='btn btn-primary' disabled={!this.props.pendingSave} onClick={(e) => this.props.dispatch(save())}>Save</button>
                <button className='btn btn-link' disabled={!this.props.selectedFolder} onClick={(e) => { window.location = getApiRoot() + `/vaui-annotation/export/${this.props.selectedFolder._id}`; }}>Export</button>
            </div>
            <div className='clip-name'>{this.props.selectedFolder ? this.props.selectedFolder.name : null}</div>
            <div className='v-current-user-wrapper toolbutton'>
                {user
                    ? <div className='v-user-link-wrapper'>
                        <a className='v-user-link' data-toggle='dropdown' data-target='#g-user-action-menu'>
                            {user.get('firstName')} {user.get('lastName')}
                            <i className='icon-down-open'></i>
                        </a>
                        <div id='g-user-action-menu' className='dropdown'>
                            <ul className='dropdown-menu' role='menu'>
                                <li role='presentation'>
                                    <a className='g-logout' onClick={() => logout()}>
                                        <i className='icon-logout'></i>
                                        Log out
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    : <div className='v-login-link-wrapper'>
                        <a className='g-register' onClick={(e) =>
                            events.trigger('g:registerUi')}>Register</a>
                        or
                        <a className='g-login' onClick={(e) => events.trigger('g:loginUi')}>
                            Log In
                            <i className='icon-login'></i>
                        </a>
                    </div>
                }
            </div>
            <ClipExplorer show={this.state.showClipExplorer} key={this.state.modalKey} onTryClose={() => this.handleClipExplorerTryClose()} onItemSelected={(folder, item) => this.itemSelected(folder, item)} />
        </div>;
    }

    handleClipExplorerTryClose() {
        this.setState({ showClipExplorer: false });
    }

    itemSelected(folder, item) {
        // this.setState({ selectedFolder: folder });
        this.props.dispatch({
            type: SELECTED_FOLDER_CHANGE,
            folder
        });
        this.props.dispatch({
            type: SELECTED_ITEM_CHANGE,
            payload: item
        });
        this.props.dispatch(loadAnnotation(item));
        this.handleClipExplorerTryClose();
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.user,
        selectedFolder: state.selectedFolder,
        pendingSave: state.pendingSave,
        loadingAnnotation: state.loadingAnnotation
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderBar);
