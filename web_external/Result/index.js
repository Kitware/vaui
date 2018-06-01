import React, { PureComponent, Fragment } from 'react';
import $ from 'jquery';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';

import loadAssignmentResult from '../actions/loadAssignmentResult';

class Result extends PureComponent {
    componentDidMount() {
        this.props.dispatch(loadAssignmentResult(this.props.match.params.assignmentId));
    }

    render() {
        return null;
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
        dispatch
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Result));
