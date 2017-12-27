import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import { logout } from 'girder/auth';
import events from 'girder/events';
import ItemModel from 'girder/models/ItemModel';

import { SELECTED_FOLDER_CHANGE } from '../actions';
import ClipExplorer from '../ClipExplorer';

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
            <div className='load-button-wrapper toolbutton'>
                <button className='btn btn-primary' onClick={(e) => this.setState({ showClipExplorer: true, modalKey: Math.random() })/* want to have new instance every time */}>Load</button>
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
        this.handleClipExplorerTryClose();
        events.trigger('v:item_selected', new ItemModel(item));
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.user,
        selectedFolder: state.selectedFolder
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderBar);
