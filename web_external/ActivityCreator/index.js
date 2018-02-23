import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import activityTypes from '../activityTypes.json';
import { NEW_ACTIVITY, CREATE_ACTIVITY_HIDE } from '../actions/types';
import { AnnotationActivity } from '../util/annotationActivityParser';

import './style.styl';

class ActivityCreator extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: '',
            start: 0,
            end: 0,
            trackIds: [],
            trackFrameRangeMap: new Map()
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedTrackId !== this.props.selectedTrackId) {
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
    }

    _updateTrackFrameRangeMap(start, end) {
        for (let [trackId, range] of this.state.trackFrameRangeMap) {
            var trackRange = this.props.annotationDetectionContainer.getTrackFrameRange(trackId);
            range[0] = Math.max(trackRange[0], start);
            range[1] = Math.max(trackRange[0], Math.min(trackRange[1], end));
        }
        this.setState({ trackFrameRangeMap: new Map(this.state.trackFrameRangeMap) });
    }

    _dispatchNewAcitivty() {
        this.props.dispatch({
            type: NEW_ACTIVITY,
            payload: new AnnotationActivity({
                act2: { [this.state.type]: 1.0 },
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
            })
        });
        this.props.dispatch({
            type: CREATE_ACTIVITY_HIDE
        });
    }

    render() {
        var canCommit = this.state.type && this.state.trackIds.length && this.state.start !== this.state.end;
        return <div className={['v-activity-creator', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'>Create Activity</div>
                <div className='panel-body'>
                    <form className='form-horizontal'>
                        <label>Activity</label>
                        <div className='form-group form-group-xs'>
                            <label className='col-sm-2 control-label'>Type:</label>
                            <div className='col-sm-9'>
                                <select className='form-control' value={this.state.type} onChange={(e) => {
                                    this.setState({
                                        type: e.target.value
                                    });
                                }} >
                                    <option value='' disabled></option>
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
                        <div className='bottom-row'>
                            <div className='row'>
                                <div className='col-xs-11'>
                                    <div className='btn-group btn-group-sm' role='group'>
                                        <button type='button' className='btn btn-default' disabled={!canCommit} onClick={(e) => {
                                            this._dispatchNewAcitivty()
                                        }}><span className='glyphicon glyphicon-ok text-success'></span></button>
                                        <button type='button' className='btn btn-default' onClick={(e) => this.props.dispatch({
                                            type: CREATE_ACTIVITY_HIDE
                                        })}><span className='glyphicon glyphicon-remove text-danger'></span></button>
                                    </div>
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
        currentFrame: state.currentFrame,
        selectedTrackId: state.selectedTrackId,
        annotationDetectionContainer: state.annotationDetectionContainer,
        annotationTypeContainer: state.annotationTypeContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityCreator);
