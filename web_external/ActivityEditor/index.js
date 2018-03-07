import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import activityTypes from '../activityTypes.json';
import { NEW_ACTIVITY, CHANGE_ACTIVITY2, CREATE_ACTIVITY_HIDE } from '../actions/types';
import { AnnotationActivity } from '../util/annotationActivityParser';

import './style.styl';

class ActivityEditor extends PureComponent {
    constructor(props) {
        super(props);
        if (this.props.creatingActivity) {
            this.state = {
                id2: null,
                act2: {},
                start: 0,
                end: 0,
                trackIds: [],
                trackFrameRangeMap: new Map(),
                changed: false
            }
        }
        else {
            this.state = this._getInitialState();
        }
    }

    _getInitialState() {
        let activity = this.props.annotationActivityContainer.getItem(this.props.selectedActivityId);
        let trackIds = activity.actors.map((actor) => actor.id1);
        let trackFrameRangeMap = new Map();
        for (let trackId of trackIds) {
            let trackRange = this.props.annotationDetectionContainer.getTrackFrameRange(trackId);
            trackFrameRangeMap.set(trackId, trackRange);
        }
        var activityRange = activity.timespan[0].tsr0;
        return {
            id2: this.props.selectedActivityId,
            act2: activity.act2,
            start: activityRange[0],
            end: activityRange[1],
            trackIds,
            trackFrameRangeMap,
            changed: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedTrackId && nextProps.selectedTrackId !== this.props.selectedTrackId) {
            var trackId = nextProps.selectedTrackId;
            this.setState({
                trackIds: _.union(this.state.trackIds, [trackId]),
                trackFrameRangeMap: new Map(this.state.trackFrameRangeMap.set(trackId, [this.state.start, this.state.end]))
            }, () => this._updateTrackFrameRangeMap(this.state.start, this.state.end));
        }
    }

    componentWillUpdate(nextProps, nextState) {
        if (nextState.start !== this.state.start || nextState.end !== this.state.end) {
            this._updateTrackFrameRangeMap(nextState.start, nextState.end);
        }
        if (this.state.changed === nextState.changed && this._stateChanged(this.state, nextState, ['act2', 'start', 'end', 'trackIds'])) {
            this.setState({ changed: true });
        }
    }

    _stateChanged(stateA, stateB, fields = []) {
        return _.some(fields, (field) => stateA[field] !== stateB[field]);
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
                type: NEW_ACTIVITY,
                payload: activity
            });
            this.props.dispatch({
                type: CREATE_ACTIVITY_HIDE
            });
        } else {
            activity.id2 = this.state.id2;
            this.setState({ changed: false });
            this.props.dispatch({
                type: CHANGE_ACTIVITY2,
                payload: activity
            });
        }
    }

    render() {
        var canCommit = this.state.act2 && this.state.trackIds.length && this.state.start !== this.state.end;
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
                                <select className='form-control' value={type} onChange={(e) => {
                                    this.setState({
                                        act2: e.target.value ? { [e.target.value]: 1.0 } : null,
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
                                <button type='button' className='btn btn-default btn-xs' onClick={(e) => {
                                    this.setState({
                                        start: this.props.currentFrame,
                                        end: Math.max(this.props.currentFrame, this.state.end)
                                    });
                                }}>Start here</button>
                            </div>
                        </div>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>End:</label>
                            <div className='col-sm-5'>
                                <p className='form-control-static'>{this.state.end} (frame)</p>
                            </div>
                            <div className='col-sm-4 frame-button-container'>
                                <button type='button' className='btn btn-default btn-xs' onClick={(e) => {
                                    this.setState({
                                        start: Math.min(this.props.currentFrame, this.state.start),
                                        end: this.props.currentFrame
                                    });
                                }}>End here</button>
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
                                            <button type='button' className='btn btn-link btn-xs' onClick={(e) => {
                                                var trackIds = this.state.trackIds;
                                                trackIds.splice(trackIds.indexOf(trackId), 1);
                                                var trackFrameRangeMap = this.state.trackFrameRangeMap;
                                                trackFrameRangeMap.delete(trackId);
                                                this.setState({
                                                    trackIds: trackIds.slice(),
                                                    trackFrameRangeMap: new Map(trackFrameRangeMap)
                                                });
                                            }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
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
                        {this.state.changed && <div className='bottom-row'>
                            <div className='row'>
                                <div className='col-xs-11'>
                                    <div className='btn-group btn-group-sm' role='group'>
                                        <button type='button' className='btn btn-default' onClick={(e) => {
                                            if (this.props.creatingActivity) {
                                                this.props.dispatch({
                                                    type: CREATE_ACTIVITY_HIDE
                                                })
                                            } else {
                                                this.setState({ ...this._getInitialState(), ...{ changed: false } });
                                            }
                                        }}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                                        <button type='button' className='btn btn-default' disabled={!canCommit} onClick={(e) => {
                                            this._dispatchAcitivty()
                                        }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                                    </div>
                                </div>
                            </div>
                        </div>}
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

export default connect(mapStateToProps, mapDispatchToProps)(ActivityEditor);
