import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import BasePane from '../BasePane';
import {
    TOGGLE_ACTIVITY,
    SELECT_ACTIVITY,
    SELECT_TRACK_ACTIVITY,
    TOGGLE_TRACK,
    GOTO_ACTIVITY_START,
    GOTO_ACTIVITY_END,
    DELETE_ACTIVITY
} from '../../actions/types';

import './style.styl';

class ActivityPanel extends BasePane {
    constructor(props) {
        super(props);
        this.state = {
            interactActivityId: null
        };
    }
    getContainer() {
        return this.props.annotationActivityContainer;
    }

    getItemId(item) {
        return item.id2;
    }

    toggleItem(item, enabled) {
        this.props.dispatch({
            type: TOGGLE_ACTIVITY,
            payload: { activity: item, enabled }
        });
    }

    render() {
        if (!this.props.annotationActivityContainer || !this.props.annotationTypeContainer) {
            return null;
        }
        var activityContainer = this.props.annotationActivityContainer;
        var activities = _.sortBy(activityContainer.getAllItems(), (activity) => activity.id2);
        var geometryContainer = this.props.annotationGeometryContainer;
        var typeContainer = this.props.annotationTypeContainer;

        return <div className={['v-activity-pane', this.props.className].join(' ')}>
            <div className='checkbox'>
                <label>
                    <input type='checkbox' checked={this.allChecked()} onChange={(e) => this.allClick()} />
                    All
                </label>
            </div>
            <ul>
                {activities.map((activity) => {
                    var types = Object.keys(activity.act2);
                    var typeLabel = types.length <= 1 ? types[0] : 'Multiple';
                    return <li key={activity.id2}>
                        <ContextMenuTrigger id='activity-menu'>
                            <div className={'checkbox ' + (activity.id2 === this.props.selectedActivityId ? 'selected' : '')} onContextMenu={(e) => {
                                this.setState({
                                    interactActivityId: activity.id2
                                });
                            }}>
                                <label onClick={(e) => { if (e.target.type !== 'checkbox') { e.preventDefault(); } }}>
                                    <input type='checkbox'
                                        checked={activityContainer.getEnableState(activity.id2)}
                                        onChange={(e) => this.props.dispatch({
                                            type: TOGGLE_ACTIVITY,
                                            payload: { activity, enabled: e.target.checked }
                                        })}
                                    />
                                    <span onClick={(e) => {
                                        this.props.dispatch({
                                            type: SELECT_ACTIVITY,
                                            payload: (this.props.selectedActivityId === activity.id2 && !this.props.selectedTrackId) ? null : activity.id2
                                        });
                                    }}>{typeLabel}-{activity.id2}</span>
                                </label>
                            </div>
                            <ul>
                                {activity.actors.map((actor) => {
                                    var type = typeContainer.getItem(actor.id1);
                                    if (type) {
                                        var types = Object.keys(type.cset3);
                                        var typeLabel = types.length <= 1 ? types[0] : 'Multiple';
                                    }
                                    var label = (type && typeLabel) ? `${typeLabel}-${actor.id1}` : actor.id1;
                                    return <li key={actor.id1}>
                                        <div className={'checkbox ' + ((actor.id1 === this.props.selectedTrackId) ? 'selected' : '')}>
                                            <label onClick={(e) => { if (e.target.type !== 'checkbox') { e.preventDefault(); } }}>
                                                <input type='checkbox'
                                                    checked={geometryContainer.getEnableState(actor.id1)}
                                                    onChange={(e) => this.props.dispatch({
                                                        type: TOGGLE_TRACK,
                                                        payload: { track: actor.id1, enabled: e.target.checked }
                                                    })}
                                                />
                                                <span onClick={(e) => {
                                                    this.props.dispatch({
                                                        type: SELECT_TRACK_ACTIVITY,
                                                        payload: {
                                                            trackId: actor.id1,
                                                            activityId: activity.id2
                                                        }
                                                    });
                                                }}>{label}</span>
                                            </label>
                                        </div>
                                    </li>
                                })}
                            </ul>
                        </ContextMenuTrigger>
                    </li>;
                })}
            </ul>
            <ContextMenu id="activity-menu">
                <MenuItem onClick={(e) => this.props.dispatch({
                    type: GOTO_ACTIVITY_START,
                    payload: this.state.interactActivityId
                })}>
                    Go to start
                </MenuItem>
                <MenuItem onClick={(e) => this.props.dispatch({
                    type: GOTO_ACTIVITY_END,
                    payload: this.state.interactActivityId
                })}>
                    Go to end
                </MenuItem>
                <MenuItem divider />
                <MenuItem onClick={(e) => this.props.dispatch({
                    type: DELETE_ACTIVITY,
                    payload: this.state.interactActivityId
                })}>
                    Delete
                </MenuItem>
            </ContextMenu>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        annotationGeometryContainer: state.annotationGeometryContainer,
        annotationActivityContainer: state.annotationActivityContainer,
        annotationTypeContainer: state.annotationTypeContainer,
        selectedActivityId: state.selectedActivityId,
        selectedTrackId: state.selectedTrackId
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityPanel);
