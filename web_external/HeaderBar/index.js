import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { logout } from 'girder/auth';
import events from 'girder/events';
import { getApiRoot } from 'girder/rest';
import bootbox from 'bootbox';
import { withRouter } from 'react-router-dom';
import { restRequest } from 'girder/rest';

import { SELECTED_FOLDER_CHANGE, SELECTED_ITEM_CHANGE } from '../actions/types';
import save from '../actions/save';
import loadClip from '../actions/loadClip';
import processActivityGroup from '../actions/processActivityGroup';

import './style.styl';

class HeaderBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            showClipExplorer: false
        };
    }

    componentDidMount() {
        var { folderId, activityGroupItemId } = this.props.match.params;
        // this.props.dispatch(loadClip(folderId, activityGroupItemId));
        restRequest({
            url: `/folder/${folderId}`
        }).then((folder) => {
            this.props.dispatch({
                type: SELECTED_FOLDER_CHANGE,
                folder
            });
        });
        this.props.dispatch(processActivityGroup(folderId, activityGroupItemId));
    }

    render() {
        let user = this.props.user;
        return <div className={['v-header-wrapper', this.props.className].join(' ')}>
            <div className='button-wrapper toolbutton'>
                <button className='btn btn-primary' disabled={!this.props.pendingSave || this.props.saving} onClick={(e) => this.props.dispatch(save())}>{this.props.saving ? 'Saving' : 'Save'}</button>
            </div>
            <div className='clip-name'>{this.props.selectedFolder ? this.props.selectedFolder.name : null}</div>
        </div>;
    }

    // folderSelected(folder, reImport) {
    //     this.props.dispatch({
    //         type: SELECTED_FOLDER_CHANGE,
    //         folder
    //     });
    //     this.props.dispatch(loadAnnotation(folder, reImport));
    // }
}

const mapStateToProps = (state, ownProps) => {
    return {
        user: state.user,
        selectedFolder: state.selectedFolder,
        pendingSave: state.pendingSave,
        saving: state.saving,
        loadingAnnotation: state.loadingAnnotation
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderBar));
