import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import bootbox from 'bootbox';

import activityTypes from '../activityTypes.json';
import { ADD_ACTIVITY, EDIT_ACTIVITY_START, EDIT_ACTIVITY_STOP, CHANGE_ACTIVITY2, CREATE_ACTIVITY_STOP } from '../actions/types';
import { AnnotationActivity } from '../util/annotationActivityParser';
import FrameNumberInput from '../widget/FrameNumberInput';

import './style.styl';

class ActivityWidget extends PureComponent {
    constructor(props) {
        super(props);
        this.id2 = null;
        this.state = this._getInitialState(props);
    }

    _getInitialState(props) {
        if (props.creatingActivity) {
            return {
                id2: null,
                act2: {},
                start: 0,
                end: 0,
                // use this array to preserve the order
                trackIds: [],
                activityTrackFrameRangeMap: new Map(),
                editing: true,
                changed: false
            }
        } else {
            let activity = props.annotationActivityContainer.getItem(props.editingActivityId || props.selectedActivityId);
            let trackIds = activity.actors.map((actor) => actor.id1);
            let activityTrackFrameRangeMap = activity.actors.reduce((map, activity) =>
                map.set(activity.id1, activity.timespan[0].tsr0.slice())
                , new Map());
            var activityRange = activity.timespan[0].tsr0.slice();
            this.id2 = activity.id2;
            return {
                id2: activity.id2,
                act2: activity.act2,
                start: activityRange[0],
                end: activityRange[1],
                trackIds,
                activityTrackFrameRangeMap,
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
            this._addNewTrack(nextProps.selectedTrackId);
        }
    }

    _updateActivityTrackFrameRangeMap(startOrEnd) {
        var start = this.state.start;
        var end = this.state.end;
        for (let [trackId, activityTrackFrameRange] of this.state.activityTrackFrameRangeMap) {
            var trackRange = this.props.annotationDetectionContainer.getTrackFrameRange(trackId);
            if (startOrEnd) {
                activityTrackFrameRange[0] = Math.max(trackRange[0], start);
                if (activityTrackFrameRange[1] < activityTrackFrameRange[0]) {
                    activityTrackFrameRange[1] = activityTrackFrameRange[0];
                }
            } else {
                activityTrackFrameRange[1] = Math.min(trackRange[1], end);
                if (activityTrackFrameRange[0] > activityTrackFrameRange[1]) {
                    activityTrackFrameRange[0] = activityTrackFrameRange[1];
                }
            }
        }
        this.setState({ activityTrackFrameRangeMap: new Map(this.state.activityTrackFrameRangeMap) });
    }

    _addNewTrack(trackId) {
        var trackRange = this.props.annotationDetectionContainer.getTrackFrameRange(trackId);
        var start = this.state.start;
        var end = this.state.end;
        // Expand activity range if needed
        if (start < trackRange[0] && end < trackRange[0]) {
            end = trackRange[0];
        }
        if (start > trackRange[1] && end > trackRange[1]) {
            start = trackRange[1];
        }

        // Set the activity track range for the new track
        var activityTrackRange = [Math.max(start, trackRange[0]), Math.min(end, trackRange[1])];
        this.setState({
            start,
            end,
            trackIds: _.union(this.state.trackIds, [trackId]),
            activityTrackFrameRangeMap: new Map(this.state.activityTrackFrameRangeMap.set(trackId, activityTrackRange)),
            changed: true
        }, () => {
            this._limitActivityRange();
        });
    }

    _limitActivityRange() {
        var start = this.state.start;
        var end = this.state.end;
        var { maxActivityRange } = this._getActivityRangeLimits();
        if (maxActivityRange) {
            [start, end] = [Math.max(maxActivityRange[0], start), Math.min(maxActivityRange[1], end)];
        }
        this.setState({ start, end });
    }

    _getActivityRangeLimits() {
        if (this.state.trackIds.length === 0) {
            return {
                maxActivityRange: [0, 0],
                minActivityRange: [0, 0]
            };
        }
        var maxActivityRange = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
        var minActivityRange = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
        for (var trackId of this.state.trackIds) {
            let trackRange = this.props.annotationDetectionContainer.getTrackFrameRange(trackId);
            maxActivityRange = [Math.min(maxActivityRange[0], trackRange[0]), Math.max(maxActivityRange[1], trackRange[1])];
            minActivityRange = [Math.min(minActivityRange[0], trackRange[1]), Math.max(minActivityRange[1], trackRange[0])];
        }
        return { maxActivityRange, minActivityRange };
    }

    _dispatchAcitivty() {
        var activity = new AnnotationActivity({
            act2: this.state.act2,
            src: 'truth',
            timespan: [{ tsr0: [this.state.start, this.state.end] }],
            actors: [...this.state.activityTrackFrameRangeMap.entries()].map(([trackId, range]) => {
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
                payload: {
                    id2: this.id2,
                    activity
                }
            });
            this.props.dispatch({
                type: EDIT_ACTIVITY_STOP,
                payload: this.state.id2
            });
        }
    }

    render() {
        var canCommit = this.state.changed && !_.isEmpty(this.state.act2) && this.state.trackIds.length && this.state.start !== this.state.end;
        var types = Object.keys(this.state.act2);
        var type = types.length === 0 ? '' : (types.length === 1 ? types[0] : 'multiple');
        var { maxActivityRange, minActivityRange } = this._getActivityRangeLimits();
        var startMin = Math.max(0, maxActivityRange[0]);
        var startMax = Math.min(maxActivityRange[1], minActivityRange[0]);
        var endMin = Math.max(maxActivityRange[0], minActivityRange[1]);
        var endMax = Math.min(maxActivityRange[1]);
        var annotationDetectionContainer = this.props.annotationDetectionContainer;
        var setActivityRangeStart = (start) => {
            if (start > this.state.end) {
                if ((start < endMin || start > endMax)) {
                    return;
                } else {
                    this.setState({ end: start });
                }
            }
            this.setState({
                start,
                changed: true
            }, () => {
                this._updateActivityTrackFrameRangeMap(true);
            });
        };
        var setActivityRangeEnd = (end) => {
            if (end < this.state.start) {
                if ((end < startMin || end > startMax)) {
                    return;
                } else {
                    this.setState({ start: end });
                }
            }
            this.setState({
                end,
                changed: true
            }, () => {
                this._updateActivityTrackFrameRangeMap(false);
            });
        };
        return <div className={['v-activity-creator', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>{this.props.creatingActivity ? 'Create Activity' : 'Edit Activity'}</div>
                <div className='panel-body'>
                    <form className='form-horizontal'>
                        <label>Activity</label>
                        <div className='form-group form-group-xs'>
                            {!this.props.creatingActivity &&
                                <Fragment>
                                    <label className='col-sm-2 control-label'>Id:</label>
                                    <div className='col-sm-3'>
                                        {!this.state.editing && <p className='form-control-static'>{this.state.id2}</p>}
                                        {this.state.editing && <FrameNumberInput className='form-control' min={1} value={this.state.id2}
                                            onChange={(id2) => {
                                                if (!this.props.annotationActivityContainer.validateNewActivityId(id2)) {
                                                    bootbox.alert({
                                                        size: 'small',
                                                        message: 'An activity with this id already exists'
                                                    });
                                                } else {
                                                    this.setState({ id2, changed: true });
                                                }
                                            }} />}
                                    </div>
                                </Fragment>}
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>Type:</label>
                            <div className='col-sm-9'>
                                {!this.state.editing && <p className='form-control-static'>{type}</p>}
                                {this.state.editing && <select className='form-control'
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
                                </select>}
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>Start:</label>
                            <div className='col-sm-5'>
                                {!this.state.editing &&
                                    < p className='form-control-static'>{this.state.start}</p>}
                                {this.state.editing &&
                                    <FrameNumberInput className='form-control'
                                        value={this.state.start}
                                        min={startMin}
                                        max={startMax}
                                        onChange={setActivityRangeStart} />}
                            </div>
                            <div className='col-sm-4 frame-button-container'>
                                {this.state.editing &&
                                    <button type='button' className='btn btn-default btn-xs' title='Set to current frame number' onClick={(e) => {
                                        var start = this.props.currentFrame;
                                        if (start > startMax) {
                                            start = startMax;
                                        }
                                        if (start < startMin) {
                                            start = startMin;
                                        }
                                        setActivityRangeStart(start);
                                    }}>Start here</button>}
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>End:</label>
                            <div className='col-sm-5'>
                                {!this.state.editing &&
                                    < p className='form-control-static'>{this.state.end}</p>}
                                {this.state.editing &&
                                    <FrameNumberInput className='form-control'
                                        value={this.state.end}
                                        min={endMin}
                                        max={endMax}
                                        onChange={setActivityRangeEnd} />}
                            </div>
                            <div className='col-sm-4 frame-button-container'>
                                {this.state.editing &&
                                    <button type='button' className='btn btn-default btn-xs' title='Set to current frame number' onClick={(e) => {
                                        var end = this.props.currentFrame;
                                        if (end > endMax) {
                                            end = endMax;
                                        }
                                        if (end < endMin) {
                                            end = endMin;
                                        }
                                        setActivityRangeEnd(end);
                                    }}>End here</button>}
                            </div>
                        </div>
                        <label>Tracks</label>
                        {this.state.trackIds.length !== 0 &&
                            <div className='clearfix tracks-header track-item'>
                                <div className='col-xs-5 no-padding'>Track</div>
                                <div className='col-xs-3 no-padding'>Start</div>
                                <div className='col-xs-3 no-padding'>End</div>
                            </div>}
                        <ul className='tracks'>
                            {this.state.trackIds.map((trackId) => {
                                var activityTrackRange = this.state.activityTrackFrameRangeMap.get(trackId);
                                var trackRange = annotationDetectionContainer.getTrackFrameRange(trackId);
                                var setActivityTrackRangeStart = (start) => {
                                    activityTrackRange[0] = start;
                                    if (start > activityTrackRange[1]) {
                                        activityTrackRange[1] = start;
                                    }
                                    if (start < this.state.start) {
                                        this.setState({ start });
                                    }
                                    if (start > this.state.end) {
                                        this.setState({ end: start });
                                    }
                                    this.setState({
                                        activityTrackFrameRangeMap: new Map(this.state.activityTrackFrameRangeMap),
                                        changed: true
                                    });
                                };
                                var setActivityTrackRangeEnd = (end) => {
                                    activityTrackRange[1] = end;
                                    if (end < activityTrackRange[0]) {
                                        activityTrackRange[0] = end;
                                    }
                                    if (end < this.state.start) {
                                        this.setState({ start: end });
                                    }
                                    if (end > this.state.end) {
                                        this.setState({ end });
                                    }
                                    this.setState({
                                        activityTrackFrameRangeMap: new Map(this.state.activityTrackFrameRangeMap),
                                        changed: true
                                    });
                                };
                                return <li key={trackId}>
                                    <div className='form-group form-group-xs track-item'>
                                        <div className='col-xs-5 no-padding' title={`Range ${trackRange[0]}-${trackRange[1]}`}>
                                            {this.props.annotationTypeContainer.getTrackDisplayLabel(trackId)}
                                        </div>
                                        <div className='col-xs-3 range'>
                                            {!this.state.editing && <p className='form-control-static'>{activityTrackRange[0]}</p>}
                                            {this.state.editing &&
                                                <FrameNumberInput className='form-control'
                                                    value={activityTrackRange[0]}
                                                    min={trackRange[0]}
                                                    max={trackRange[1]}
                                                    onChange={setActivityTrackRangeStart} />}
                                            {this.state.editing && <button type='button' className='btn btn-default btn-xs' title='Set to current frame number' onClick={(e) => {
                                                var start = this.props.currentFrame;
                                                if (start > trackRange[1]) {
                                                    start = trackRange[1];
                                                }
                                                if (start < trackRange[0]) {
                                                    start = trackRange[0];
                                                }
                                                setActivityTrackRangeStart(start);
                                            }}>Start here</button>}
                                        </div>
                                        <div className='col-xs-3 range'>
                                            {!this.state.editing && <p className='form-control-static'>{activityTrackRange[1]}</p>}
                                            {this.state.editing &&
                                                <FrameNumberInput className='form-control'
                                                    value={activityTrackRange[1]}
                                                    min={trackRange[0]}
                                                    max={trackRange[1]}
                                                    onChange={setActivityTrackRangeEnd} />}
                                            {this.state.editing && <button type='button' className='btn btn-default btn-xs' title='Set to current frame number' onClick={(e) => {
                                                var end = this.props.currentFrame;
                                                if (end > trackRange[1]) {
                                                    end = trackRange[1];
                                                }
                                                if (end < trackRange[0]) {
                                                    end = trackRange[0];
                                                }
                                                setActivityTrackRangeEnd(end);
                                            }}>End here</button>}
                                        </div>
                                        <div className='col-xs-1 no-padding'>
                                            {this.state.editing &&
                                                <button type='button' className='btn btn-link btn-xs' onClick={(e) => {
                                                    var trackIds = this.state.trackIds;
                                                    trackIds.splice(trackIds.indexOf(trackId), 1);
                                                    var activityTrackFrameRangeMap = this.state.activityTrackFrameRangeMap;
                                                    activityTrackFrameRangeMap.delete(trackId);
                                                    this.setState({
                                                        trackIds: trackIds.slice(),
                                                        activityTrackFrameRangeMap: new Map(activityTrackFrameRangeMap),
                                                        changed: true
                                                    }, () => { this._limitActivityRange(); });
                                                }}><span className='glyphicon glyphicon-remove text-danger'></span></button>}
                                        </div>
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
