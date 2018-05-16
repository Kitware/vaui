import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { logout } from 'girder/auth';
import events from 'girder/events';
import { getApiRoot } from 'girder/rest';
import bootbox from 'bootbox';
import { withRouter, Link } from 'react-router-dom';
import qs from 'query-string';
import { restRequest } from 'girder/rest';

import { SELECTED_FOLDER_CHANGE, SELECTED_ITEM_CHANGE } from '../actions/types';
// import save from '../actions/save';
import submit from '../actions/submit';
import processActivityGroup from '../actions/processActivityGroup';

import './style.styl';

class HeaderBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            previewMode: false
        };
    }

    componentDidMount() {
        var queryParams = qs.parse(location.search);
        var { folderId, activityGroupItemId } = queryParams;
        restRequest({
            url: `/folder/${folderId}`
        }).then((folder) => {
            this.props.dispatch({
                type: SELECTED_FOLDER_CHANGE,
                folder
            });
        });
        this.props.dispatch(processActivityGroup(folderId, activityGroupItemId));
        this.setState({ previewMode: queryParams.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE' || !queryParams.assignmentId });
    }

    submitHandler() {
        bootbox.confirm("Do you want to sumbit your result? this cannot be undone.",
            (result) => {
                this.props.dispatch(submit(qs.parse(location.search))).then(() => {
                    this.props.history.push(`/submit`);
                });
            });
    }

    render() {
        let user = this.props.user;
        return <div className={['v-header-wrapper', this.props.className].join(' ')}>
            <div className='button-wrapper toolbutton'>
                <Link to="/instruction"><button className='btn btn-primary'>Instruction</button></Link>

                <button className='btn btn-primary' disabled={!this.props.pendingSave || this.props.saving || this.state.previewMode} onClick={(e) => this.submitHandler()}>{this.state.previewMode ? 'Preview mode' : (this.props.saving ? 'Saving' : 'Submit')}</button>
            </div>
        </div>;
    }
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
