import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import './style.styl';
import trackTypes from '../trackTypes';

class TrackInfo extends PureComponent {
    render() {
        var range = this.props.annotationGeometryContainer.getTrackFrameRange(this.props.selectedTrackId);
        var type = this.props.annotationTypeContainer.getItem(this.props.selectedTrackId).obj_type;

        return <div className='trackinfo-widget'>
            <form className='form-horizontal'>
                <fieldset disabled>
                    <legend>Track</legend>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label' htmlFor='trackId'>Id:</label>
                        <div className='col-sm-8'>
                            <input type='number' className='form-control' id='trackId' value={this.props.selectedTrackId} onChange={() => { }} />
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Type:</label>
                        <div className='col-sm-8'>
                            <select className='form-control' value={type} onChange={() => { }} >
                                {trackTypes.map((type) => {
                                    return <option key={type} value={type}>{type}</option>
                                })}
                            </select>
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Start:</label>
                        <div className='col-sm-8'>
                            <p className="form-control-static">{range[0]} (frame)</p>
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>End:</label>
                        <div className='col-sm-8'>
                            <p className="form-control-static">{range[1]} (frame)</p>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedTrackId: state.selectedTrackId,
        annotationTypeContainer: state.annotationTypeContainer,
        annotationGeometryContainer: state.annotationGeometryContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackInfo);
