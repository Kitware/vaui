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
import Feedback from '../Feedback';
import logger from '../util/logger';

import './style.styl';

class HeaderBar extends PureComponent {
    constructor(props) {
        super(props);
        var queryParams = qs.parse(location.search);
        this.queryParams = queryParams;
        var devMode = !queryParams.hitId || queryParams.hitId === 'null';
        this.state = {
            previewMode: queryParams.assignmentId === 'ASSIGNMENT_ID_NOT_AVAILABLE' || !queryParams.assignmentId || queryParams.assignmentId === 'null',
            devMode,
            showInstruction: !devMode,
            showSubmitConfirm: false,
            showReportProblem: false
        };
    }

    componentDidMount() {
        var { folderId, activityGroupItemId } = this.queryParams;
        restRequest({
            url: `/folder/${folderId}`
        }).then((folder) => {
            this.props.dispatch({
                type: SELECTED_FOLDER_CHANGE,
                folder
            });
        });
        logger.setContexts(this.queryParams);
        if (this.state.devMode) {
            logger.disable(true);
        }
        logger.log(this.state.previewMode ? 'preview' : 'accept');
        this.props.dispatch(processActivityGroup(folderId, activityGroupItemId));
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
                }}>Instructions</button>

                <button className='btn btn-primary btn-sm' disabled={!this.props.pendingSave || this.props.saving || this.state.previewMode} onClick={(e) => {
                    this.setState({ showSubmitConfirm: true });
                    logger.log('before-submit');
                }}>{this.state.previewMode ? 'Preview mode' : (this.props.saving ? 'Saving' : 'Submit')}</button>
                <button className='btn btn-link btn-sm problem' onClick={(e) => {
                    logger.log('report-problem-clicked');
                    this.setState({ showReportProblem: true });
                }}>Complete this HIT by give us a feedback instead</button>
            </div>
            <Modal show={this.state.showInstruction} onHide={() => { this.hideInstruction(); logger.log('hide-instruction'); }} bsSize="large" keyboard={false} backdrop={true}>
                <Modal.Header closeButton>
                </Modal.Header>
                <Modal.Body>
                    <Instruction />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => { this.hideInstruction() }}>Close</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={this.state.showSubmitConfirm} keyboard={false} backdrop={'static'}>
                <Modal.Header>
                    <Modal.Title>Confirm</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>Do you want to sumbit your result? This cannot be undone.</div>
                    <br />
                    <Feedback ref={(feedback) => { this.feedback = feedback; }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => { this.setState({ showSubmitConfirm: false }); }}>Cancel</Button>
                    <Button bsStyle="primary" onClick={() => {
                        var ps = [];
                        var queryParams = qs.parse(location.search);
                        ps.push(this.props.dispatch(submit(queryParams)));
                        ps.push(this.feedback.submit());
                        Promise.all(ps).then(() => {
                            logger.log('submit');
                            if (this.dev) {
                                this.setState({ showSubmitConfirm: false });
                                bootbox.alert('Submitted successfully');
                                return;
                            }
                            this.props.history.push(`/submit`);
                        });
                    }}>Submit</Button>
                </Modal.Footer>
            </Modal>
            <Modal show={this.state.showReportProblem} keyboard={false} backdrop={'static'}>
                <Modal.Header>
                    <Modal.Title>Provide feedback</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Feedback problem={true} ref={(problem) => { this.problem = problem; }} />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => { this.setState({ showReportProblem: false }); }}>Cancel</Button>
                    <Button bsStyle="primary"
                        onClick={() => {
                            this.problem.submit()
                                .then(() => {
                                    this.props.history.push(`/problem`);
                                }).catch(() => { });
                        }}>Submit</Button>
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
