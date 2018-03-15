import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import TrackWidget from '../TrackWidget';

import './style.styl';

class ObjectInfo extends PureComponent {
    render() {
        return <div className='objectinfo'>
            <div className='panel panel-default'>
                <div className='panel-heading'>Object Info</div>
                <div className='panel-body'>
                    {this.props.treePanel === 'track' &&
                        this.props.selectedTrackId !== null &&
                        <TrackWidget />}
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
