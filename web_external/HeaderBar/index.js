import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { logout } from 'girder/auth';
import events from 'girder/events';
import { getApiRoot } from 'girder/rest';
import bootbox from 'bootbox';
import { Modal, Button } from 'react-bootstrap';
import { withRouter, Link } from 'react-router-dom';
import qs from 'query-string';
import { restRequest } from 'girder/rest';

import { SELECTED_FOLDER_CHANGE, SELECTED_ITEM_CHANGE } from '../actions/types';
// import save from '../actions/save';
import submit from '../actions/submit';
import processActivityGroup from '../actions/processActivityGroup';
import Instruction from '../Instruction';

import './style.styl';

class HeaderBar extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            previewMode: false,
            showInstruction: false
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
                if (result) {
                    this.props.dispatch(submit(qs.parse(location.search))).then(() => {
                        this.props.history.push(`/submit`);
                    });
                }
            });
    }

    hideInstruction() {
        this.setState({ showInstruction: false });
    }

    render() {
        let user = this.props.user;
        return <div className={['v-header-wrapper', this.props.className].join(' ')}>
            <div className='button-wrapper toolbutton'>
                <button className='btn btn-primary btn-sm' onClick={() => {
                    this.setState({ showInstruction: true });
                }}>Instruction</button>

                <button className='btn btn-primary btn-sm' disabled={!this.props.pendingSave || this.props.saving || this.state.previewMode} onClick={(e) => this.submitHandler()}>{this.state.previewMode ? 'Preview mode' : (this.props.saving ? 'Saving' : 'Submit')}</button>
            </div>
            <Modal show={this.state.showInstruction} onHide={() => { this.hideInstruction() }} bsSize="large" keyboard={false} backdrop={'static'}>
                <Modal.Header closeButton>
                    <Modal.Title>Instruction</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Instruction />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => { this.hideInstruction() }}>Close</Button>
                </Modal.Footer>
            </Modal>
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
