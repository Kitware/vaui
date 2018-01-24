import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import TrackInfo from '../TrackInfo';
import ActivityInfo from '../ActivityInfo';
import ActivityTrackInfo from '../ActivityTrackInfo';

import './style.styl';

class ObjectInfo extends PureComponent {
    render() {
        return <div className='objectinfo'>
            <div className='panel panel-default'>
                <div className='panel-heading'>Object Info</div>
                <div className='panel-body'>
                    {this.props.treePanel === 'track' &&
                        this.props.selectedTrackId !== null &&
                        <TrackInfo />}
                    {this.props.treePanel === 'activity' &&
                        this.props.selectedActivityId !== null &&
                        this.props.selectedTrackId === null &&
                        <ActivityInfo />
                    }
                    {this.props.treePanel === 'activity' &&
                        this.props.selectedActivityId !== null &&
                        this.props.selectedTrackId !== null &&
                        <ActivityTrackInfo />
                    }
                </div>
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        treePanel: state.treePanel,
        selectedTrackId: state.selectedTrackId,
        selectedActivityId: state.selectedActivityId
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ObjectInfo);
