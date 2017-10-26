import $ from 'jquery';
import React, { Component } from 'react';
import { logout, getCurrentUser } from 'girder/auth';
import events from 'girder/events';
import BrowserWidget from 'girder/views/widgets/BrowserWidget';

import './style.styl';

class HeaderBar extends Component {
    constructor(props) {
        super(props);
        this.state = { user: getCurrentUser() };
    }
    componentDidMount() {
        events.on('g:login', () => {
            this.setState({ user: getCurrentUser() });
        })
    }
    render() {
        let user = this.state.user;
        return <div className={['v-header-wrapper', this.props.className].join(' ')}>
            <div className='toolbutton'>
                <button className='btn btn-primary' onClick={(e) => this.openClicked(e)}>Load</button>
            </div>
            <div className='v-current-user-text'></div>
            <div className='v-current-user-wrapper toolbutton'>
                {user ?
                    <div className='v-user-link-wrapper'>
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
                    </div> :
                    <div className='v-login-link-wrapper'>
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
        </div>
    }

    openClicked(e) {
        var widget = new BrowserWidget({
            el: $('#g-dialog-container'),
            parentView: null,
            titleText: 'Select a project...',
            submitText: 'Open',
            showItems: true,
            selectItem: true,
            helpText: 'Click on a project collection to open.',
            rootSelectorSettings: {
                pageLimit: 50
            },
            validate: function (item) {
                if (!item.has('largeImage')) {
                    return $.Deferred().reject('Please select a video frame image.').promise();
                }
                return $.Deferred().resolve().promise();
            }
        })
            .on('g:saved', (itemModel) => {
                //TODO: this would be replaced with Redux
                events.trigger('v:item_selected', itemModel);
            })
            .render();
    }
}
export default HeaderBar;
