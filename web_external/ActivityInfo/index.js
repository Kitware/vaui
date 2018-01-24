import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import bootbox from 'bootbox';

import { CHANGE_ACTIVITY } from '../actions/types';
import activityTypes from '../activityTypes.json';
import FrameNumberInput from '../widget/FrameNumberInput';

import './style.styl';

class ActivityInfo extends PureComponent {
    constructor(props) {
        super(props);
        this.state = this._getInitialState(props);
    }

    _getInitialState(props) {
        var activity = props.annotationActivityContainer.getItem(props.selectedActivityId);
        return {
            act2: activity.act2,
            fromFrame: this.getFromFrame(),
            toFrame: this.getToFrame(),
            changed: false
        };
    }

    getFromFrame() {
        var activity = this.props.annotationActivityContainer.getItem(this.props.selectedActivityId);
        return activity.timespan[0].tsr0[0];
    }

    getToFrame() {
        var activity = this.props.annotationActivityContainer.getItem(this.props.selectedActivityId);
        return activity.timespan[0].tsr0[1];
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this._getInitialState(nextProps));
    }

    render() {
        var activity = this.props.annotationActivityContainer.getItem(this.props.selectedActivityId);
        var trackRanges = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
        for (var actor of activity.actors) {
            let trackRange = this.props.annotationGeometryContainer.getTrackFrameRange(actor.id1);
            trackRanges = [Math.min(trackRanges[0], trackRange[0]), Math.max(trackRanges[1], trackRange[1])];
        }
        var types = Object.keys(this.state.act2);
        var type = types.length === 1 ? types[0] : 'multiple';
        return <div className='activity-info'>
            <form className='form-horizontal'>
                <fieldset>
                    <legend>Activity</legend>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Type:</label>
                        <div className='col-sm-9'>
                            <select className='form-control' value={type} onChange={(e) => {
                                this.setState({
                                    act2: { [e.target.value]: 1.0 },
                                    changed: true
                                });
                            }} >
                                <option value='' disabled></option>
                                <option value='multiple' disabled>Multiple</option>
                                {_.sortBy(activityTypes.map(activityTypes => activityTypes.type)).map((type) => {
                                    return <option key={type} value={type}>{type}</option>
                                })}
                            </select>
                        </div>
                    </div>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Start:</label>
                        <div className='col-sm-9'>
                            <FrameNumberInput className='form-control'
                                value={this.state.fromFrame}
                                min={Math.max(0, trackRanges[0])}
                                max={Math.min(this.state.toFrame, this.props.maxFrame, trackRanges[1])}
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
                                min={Math.max(0, this.state.fromFrame, trackRanges[0])}
                                max={Math.min(this.props.maxFrame, trackRanges[1])}
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
            {
                this.state.changed &&
                <div className='row'>
                    <div className='col-sm-offset-8 col-sm-4'>
                        <div className='btn-group btn-group-sm' role='group' aria-label='...'>
                            <button type='button' className='btn btn-default' onClick={(e) => {
                                this.setState(this._getInitialState(this.props));
                            }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                            <button type='button' className='btn btn-default' onClick={(e) => {
                                this.props.dispatch({
                                    type: CHANGE_ACTIVITY,
                                    payload: {
                                        activityId: this.props.selectedActivityId,
                                        newActivityAct2: this.state.act2,
                                        newTimespan: [this.state.fromFrame, this.state.toFrame]
                                    }
                                });
                            }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                        </div>
                    </div>
                </div>
            }
        </div >;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        maxFrame: state.maxFrame,
        selectedActivityId: state.selectedActivityId,
        annotationActivityContainer: state.annotationActivityContainer,
        annotationGeometryContainer: state.annotationGeometryContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityInfo);
