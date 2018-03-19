import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import TreeView from '../TreeView';
import Viewer from '../Viewer';
import InfoView from '../InfoView';
import TrackWidget from '../TrackWidget';
import ActivityWidget from '../ActivityWidget';
import InterpolationWidget from '../InterpolationWidget';

import './style.styl';

class IndexView extends PureComponent {
    render() {
        return <div className='v-index clearbox'>
            <div className='left-sidebar'>
                <div className='treeview-container'>
                    <TreeView />
                </div>
            </div>
            <Viewer className='main' />
            <div className='right-sidebar'>
                {this.props.treePanel === 'track' && this.props.selectedTrackId !== null && !this.props.creatingActivity && this.props.editingActivityId === null &&
                    <TrackWidget />}
                {(this.props.creatingActivity || this.props.editingActivityId !== null || (this.props.treePanel === 'activity' && this.props.selectedActivityId !== null)) &&
                    <ActivityWidget />}
                {this.props.interpolationWidget &&
                    <InterpolationWidget />}
                <InfoView />
            </div>
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
        interpolationWidget: state.interpolationWidget
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(IndexView);
