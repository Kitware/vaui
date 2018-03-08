import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import activityTypes from '../activityTypes.json';
import { ADD_ACTIVITY, EDIT_ACTIVITY_START, EDIT_ACTIVITY_STOP, CHANGE_ACTIVITY2, CREATE_ACTIVITY_STOP } from '../actions/types';
import { AnnotationActivity } from '../util/annotationActivityParser';

import './style.styl';

class ActivityWidget extends PureComponent {
    constructor(props) {
        super(props);
        this.state = this._getInitialState(props);
    }

    _getInitialState(props) {
        if (props.creatingActivity) {
            return {
                id2: null,
                act2: {},
                start: 0,
                end: 0,
                trackIds: [],
                trackFrameRangeMap: new Map(),
                editing: true,
                changed: false
            }
        } else {
            let activity = props.annotationActivityContainer.getItem(props.editingActivityId || props.selectedActivityId);
            let trackIds = activity.actors.map((actor) => actor.id1);
            let trackFrameRangeMap = new Map();
            for (let trackId of trackIds) {
                let trackRange = props.annotationDetectionContainer.getTrackFrameRange(trackId);
                trackFrameRangeMap.set(trackId, trackRange);
            }
            var activityRange = activity.timespan[0].tsr0;
            return {
                id2: activity.id2,
                act2: activity.act2,
                start: activityRange[0],
                end: activityRange[1],
                trackIds,
                trackFrameRangeMap,
                editing: !!props.editingActivityId,
                changed: false
            }
        }

    }

    componentWillReceiveProps(nextProps) {
        if (this.props.editingActivityId !== nextProps.editingActivityId ||
            this.props.creatingActivity !== nextProps.creatingActivity ||
            (!nextProps.editingActivityId && !this.props.creatingActivity && (this.props.selectedActivityId !== nextProps.selectedActivityId))) {
            this.setState(this._getInitialState(nextProps));
        }
        if (this.state.editing && nextProps.selectedTrackId !== null && nextProps.selectedTrackId !== this.props.selectedTrackId) {
            var trackId = nextProps.selectedTrackId;
            this.setState({
                trackIds: _.union(this.state.trackIds, [trackId]),
                trackFrameRangeMap: new Map(this.state.trackFrameRangeMap.set(trackId, [this.state.start, this.state.end])),
                changed: true
            }, () => this._updateTrackFrameRangeMap(this.state.start, this.state.end));
        }
    }

    _updateTrackFrameRangeMap(start, end) {
        for (let [trackId, range] of this.state.trackFrameRangeMap) {
            var trackRange = this.props.annotationDetectionContainer.getTrackFrameRange(trackId);
            range[0] = Math.max(trackRange[0], start);
            range[1] = Math.max(trackRange[0], Math.min(trackRange[1], end));
        }
        this.setState({ trackFrameRangeMap: new Map(this.state.trackFrameRangeMap) });
    }

    _dispatchAcitivty() {
        var activity = new AnnotationActivity({
            act2: this.state.act2,
            src: 'truth',
            timespan: [{ tsr0: [this.state.start, this.state.end] }],
            actors: [...this.state.trackFrameRangeMap.entries()].map(([trackId, range]) => {
                return {
                    id1: trackId,
                    timespan: [
                        { tsr0: range }
                    ]
                }
            })
        });
        if (this.props.creatingActivity) {
            this.props.dispatch({
                type: ADD_ACTIVITY,
                payload: activity
            });
            this.props.dispatch({
                type: CREATE_ACTIVITY_STOP
            });
        } else {
            activity.id2 = this.state.id2;
            this.setState({ changed: false });
            this.props.dispatch({
                type: CHANGE_ACTIVITY2,
                payload: activity
            });
            this.props.dispatch({
                type: EDIT_ACTIVITY_STOP,
                payload: this.state.id2
            });
        }
    }

    render() {
        var canCommit = this.state.changed && this.state.act2 && this.state.trackIds.length && this.state.start !== this.state.end;
        var types = Object.keys(this.state.act2);
        var type = types.length === 0 ? '' : (types.length === 1 ? types[0] : 'multiple');
        return <div className={['v-activity-creator', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>{this.props.creatingActivity ? 'Create Activity' : 'Edit Activity'}</div>
                <div className='panel-body'>
                    <form className='form-horizontal'>
                        <label>Activity</label>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>Type:</label>
                            <div className='col-sm-9'>
                                <select className='form-control'
                                    value={type}
                                    disabled={!this.state.editing}
                                    onChange={(e) => {
                                        this.setState({
                                            act2: e.target.value ? { [e.target.value]: 1.0 } : null,
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
                            <div className='col-sm-5'>
                                <p className='form-control-static'>{this.state.start} (frame)</p>
                            </div>
                            <div className='col-sm-4 frame-button-container'>
                                {this.state.editing &&
                                    <button type='button' className='btn btn-default btn-xs' onClick={(e) => {
                                        var start = this.props.currentFrame;
                                        var end = Math.max(this.props.currentFrame, this.state.end);
                                        this.setState({
                                            start, end, changed: true
                                        });
                                        this._updateTrackFrameRangeMap(start, end);
                                    }}>Start here</button>}
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>End:</label>
                            <div className='col-sm-5'>
                                <p className='form-control-static'>{this.state.end} (frame)</p>
                            </div>
                            <div className='col-sm-4 frame-button-container'>
                                {this.state.editing &&
                                    <button type='button' className='btn btn-default btn-xs' onClick={(e) => {
                                        var start = Math.min(this.props.currentFrame, this.state.start);
                                        var end = this.props.currentFrame;
                                        this.setState({
                                            start, end, changed: true
                                        });
                                        this._updateTrackFrameRangeMap(start, end);
                                    }}>End here</button>}
                            </div>
                        </div>
                        <label>Tracks</label>
                        {this.state.trackIds.length !== 0 &&
                            <div className='row tracks-header'>
                                <div className='col-xs-1'></div>
                                <div className='col-xs-5'>Track</div>
                                <div className='col-xs-2 no-padding'>Start</div>
                                <div className='col-xs-2 no-padding'>End</div>
                            </div>}
                        <ul className='tracks'>
                            {this.state.trackIds.map((trackId) => {
                                var range = this.state.trackFrameRangeMap.get(trackId);
                                return <li key={trackId}>
                                    <div className='row'>
                                        <div className='col-xs-1'>
                                            {this.state.editing &&
                                                <button type='button' className='btn btn-link btn-xs' onClick={(e) => {
                                                    var trackIds = this.state.trackIds;
                                                    trackIds.splice(trackIds.indexOf(trackId), 1);
                                                    var trackFrameRangeMap = this.state.trackFrameRangeMap;
                                                    trackFrameRangeMap.delete(trackId);
                                                    this.setState({
                                                        trackIds: trackIds.slice(),
                                                        trackFrameRangeMap: new Map(trackFrameRangeMap),
                                                        changed: true
                                                    });
                                                }}><span className='glyphicon glyphicon-remove text-danger'></span></button>}
                                        </div>
                                        <div className='col-xs-5'>
                                            {this.props.annotationTypeContainer.getTrackDisplayLabel(trackId)}
                                        </div>
                                        <div className='col-xs-2 no-padding'>{range[0]}</div>
                                        <div className='col-xs-2 no-padding'>{range[1]}</div>

                                    </div>
                                </li>
                            })}
                        </ul>
                        <div className='bottom-row'>
                            <div className='row'>
                                <div className='col-xs-11'>
                                    {!this.state.editing &&
                                        <button type='button' className='btn btn-default btn-sm' onClick={(e) => {
                                            this.props.dispatch({
                                                type: EDIT_ACTIVITY_START,
                                                payload: this.state.id2
                                            });
                                        }}><span className='glyphicon glyphicon-wrench'></span></button>}
                                    {this.state.editing &&
                                        <div className='btn-group btn-group-sm' role='group'>
                                            <button type='button' className='btn btn-default' onClick={(e) => {
                                                if (this.props.creatingActivity) {
                                                    this.props.dispatch({
                                                        type: CREATE_ACTIVITY_STOP
                                                    })
                                                } else {
                                                    this.props.dispatch({
                                                        type: EDIT_ACTIVITY_STOP,
                                                        payload: this.state.id2
                                                    });
                                                }
                                            }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                                            <button type='button' className='btn btn-default' disabled={!canCommit} onClick={(e) => {
                                                this._dispatchAcitivty()
                                            }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div >;
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        creatingActivity: state.creatingActivity,
        selectedActivityId: state.selectedActivityId,
        editingActivityId: state.editingActivityId,
        currentFrame: state.currentFrame,
        selectedTrackId: state.selectedTrackId,
        annotationDetectionContainer: state.annotationDetectionContainer,
        annotationTypeContainer: state.annotationTypeContainer,
        annotationActivityContainer: state.annotationActivityContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityWidget);
