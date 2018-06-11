import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Panel } from 'react-bootstrap';
import TrackPane from '../TreeView/TrackPane';
import Viewer from '../Viewer';

import './style.styl';

class IndexView extends PureComponent {
    render() {
        return <div className='v-index clearbox'>
            {this.props.annotationTypeContainer
                && this.props.annotationTypeContainer.getAllItems().length > 1
                && <div className='left-sidebar'>
                    <div className='treeview-container'>
                        <Panel className='simple-panel'>
                            <Panel.Heading>Tracks</Panel.Heading>
                            <Panel.Body>
                                <TrackPane />
                            </Panel.Body>
                        </Panel>
                    </div>
                </div>}
            <Viewer className='main' />
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        treePanel: state.treePanel,
        creatingActivity: state.creatingActivity,
        editingActivityId: state.editingActivityId,
        selectedTrackId: state.selectedTrackId,
        selectedActivityId: state.selectedActivityId,
        selectedDetectionId: state.selectedDetectionId,
        interpolationWidget: state.interpolationWidget,
        annotationTypeContainer: state.annotationTypeContainer

    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexView);
