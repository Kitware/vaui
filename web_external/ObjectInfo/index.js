import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import TrackInfo from '../TrackInfo';

import './style.styl';

class ObjectInfo extends PureComponent {
    render() {
        return <div className='objectinfo'>
            <div className='panel panel-default'>
                <div className='panel-heading'>Object Info</div>
                <div className='panel-body'>
                    {this.props.selectedTrackId !== null && <TrackInfo />}
                </div>
            </div>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedTrackId: state.selectedTrackId
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ObjectInfo);
