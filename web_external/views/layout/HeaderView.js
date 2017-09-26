import { staticRoot } from 'girder/rest';
import { logout, getCurrentUser } from 'girder/auth';
import events from 'girder/events';

import View from '../View';
import router from '../../router';
// import LayoutHeaderUserView from './HeaderUserView';
import template from '../../templates/layout/headerView.pug';
import logoImage from '../../assets/Minerva_Logo.png';

const HeaderView = View.extend({
    events: {
        'click a.g-login': function () {
            console.log(getCurrentUser());
            events.trigger('g:loginUi');
        },

        'click a.g-register': function () {
            events.trigger('g:registerUi');
        },

        'click a.g-logout': function () {
            logout();
            // restRequest({
            //     path: 'user/authentication',
            //     type: 'DELETE'
            // }).done(_.bind(function () {
            //     setCurrentUser(null);
            //     events.trigger('g:login');
            // }, this));
        },

        'click a.g-my-settings': function () {
            router.navigate('useraccount/' + getCurrentUser().get('_id') +
                '/info', { trigger: true });
        }
    },
    initialize() {
        events.on('g:login', this.render, this);
    },
    render() {
        this.$el.html(template(Object.assign({}, {
            staticRoot, logoImage, user: getCurrentUser()
        }, this)));
        // new LayoutHeaderUserView({
        //     el: this.$('.m-current-user-wrapper'),
        //     parentView: this
        // }).render();
        return this;
    }
});
export default HeaderView;
