import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import bootbox from 'bootbox';

import { CHANGE_ACTIVITY } from '../actions/types';
import activityTypes from '../activityTypes';
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
            type: activity.act2 || '',
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

        return <div className='activity-info'>
            <form className='form-horizontal'>
                <fieldset>
                    <legend>Activity</legend>
                    <div className='form-group form-group-xs'>
                        <label className='col-sm-2 control-label'>Type:</label>
                        <div className='col-sm-9'>
                            <select className='form-control' value={this.state.type} onChange={(e) => {
                                this.setState({
                                    type: e.target.value,
                                    changed: true
                                });
                            }} >
                                <option value=''></option>
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
                                min={0}
                                max={Math.min(this.state.toFrame, this.props.maxFrame)}
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
                                min={Math.max(0, this.state.fromFrame)}
                                max={this.props.maxFrame}
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
                                        newActivityType: this.state.type,
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
        annotationActivityContainer: state.annotationActivityContainer,
        annotationTypeContainer: state.annotationTypeContainer,
        annotationGeometryContainer: state.annotationGeometryContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityInfo);
