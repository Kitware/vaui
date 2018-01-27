import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import bootbox from 'bootbox';

import { CHANGE_TRACK_ACTIVITY } from '../actions/types';
import FrameNumberInput from '../widget/FrameNumberInput';

import './style.styl';

class ActivityTrackInfo extends PureComponent {
    constructor(props) {
        super(props);
        this.state = this._getInitialState(props);
    }

    _getInitialState(props) {
        var activity = props.annotationActivityContainer.getItem(props.selectedActivityId);
        var trackActivity = activity.actors.find((trackActivity) => trackActivity.id1 === props.selectedTrackId);
        return {
            trackActivity,
            fromFrame: trackActivity.timespan[0].tsr0[0],
            toFrame: trackActivity.timespan[0].tsr0[1],
            changed: false
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this._getInitialState(nextProps));
    }

    render() {
        var trackRange = this.props.annotationGeometryContainer.getTrackFrameRange(this.state.trackActivity.id1);
        console.log(trackRange);
        return <div className='activity-track-info'>
            <form className='form-horizontal'>
                <fieldset>
                    <legend>Track Activity</legend>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Start:</label>
                        <div className='col-sm-9'>
                            <FrameNumberInput className='form-control'
                                value={this.state.fromFrame}
                                min={Math.max(0, trackRange[0])}
                                max={Math.min(this.state.toFrame, this.props.maxFrame, trackRange[1])}
                                onChange={(e) => {
                                    this.setState({
                                        fromFrame: e,
                                        changed: true
                                    });
                                }} />
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>End:</label>
                        <div className='col-sm-9'>
                            <FrameNumberInput className='form-control'
                                value={this.state.toFrame}
                                min={Math.max(0, this.state.fromFrame, trackRange[0])}
                                max={Math.min(this.props.maxFrame, trackRange[1])}
                                onChange={(e) => {
                                    this.setState({
                                        toFrame: e,
                                        changed: true
                                    });
                                }} />
                        </div>
                    </div>
                </fieldset>
            </form>
            {this.state.changed &&
                <div className='row'>
                    <div className='col-sm-offset-7 col-sm-4'>
                        <div className='btn-group btn-group-sm' role='group' aria-label='...'>
                            <button type='button' className='btn btn-default' onClick={(e) => {
                                this.setState(this._getInitialState(this.props));
                            }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                            <button type='button' className='btn btn-default' onClick={(e) => {
                                this.props.dispatch({
                                    type: CHANGE_TRACK_ACTIVITY,
                                    payload: {
                                        activityId: this.props.selectedActivityId,
                                        trackId: this.props.selectedTrackId,
                                        newTimespan: [this.state.fromFrame, this.state.toFrame]
                                    }
                                });
                            }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                        </div>
                    </div>
                </div>}
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        maxFrame: state.maxFrame,
        selectedActivityId: state.selectedActivityId,
        selectedTrackId: state.selectedTrackId,
        annotationActivityContainer: state.annotationActivityContainer,
        annotationGeometryContainer: state.annotationGeometryContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityTrackInfo);
