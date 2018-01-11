import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';

import BasePane from '../BasePane';
import { TOGGLE_ACTIVITY, SELECT_ACTIVITY } from '../../actions/types';

import './style.styl';

class ActivityPanel extends BasePane {
    constructor(props) {
        super(props);
        this.state = {
            groupedActivities: null
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

    toggleGroup(groupName, checked) {
        var activities = this.state.groupedActivities[groupName];
        activities.forEach((activity) => this.props.dispatch({
            type: TOGGLE_ACTIVITY,
            payload: { activity, enabled: checked }
        }));
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.annotationActivityContainer !== nextProps.annotationActivityContainer) {
            if (nextProps.annotationActivityContainer) {
                var activities = nextProps.annotationActivityContainer.getAllItems();
                var groupedActivities = _.groupBy(activities, 'act2');
                this.setState({ groupedActivities });
            }
        }
    }

    render() {
        if (!this.props.annotationActivityContainer || !this.props.annotationTypeContainer) {
            return null;
        }
        var container = this.props.annotationActivityContainer;

        return <div className={['v-activity-pane', this.props.className].join(' ')}>
            <div className='checkbox'>
                <label>
                    <input type='checkbox' checked={this.allChecked()} onChange={(e) => this.allClick()} />
                    All
                </label>
            </div>
            <ul>
                {_.sortBy(Object.keys(this.state.groupedActivities), (groupName) => groupName.toLowerCase()).map((groupName) => {
                    return <li key={groupName}>
                        <div className='checkbox'>
                            <label>
                                <input type='checkbox'
                                    checked={
                                        this.state.groupedActivities[groupName].filter((activity) => !container.getEnableState(activity.id2)).length === 0}
                                    onChange={(e) => this.toggleGroup(groupName, e.target.checked)}
                                />
                                {groupName}
                            </label>
                        </div>
                        <ul>
                            {this.state.groupedActivities[groupName].map((activity) => {
                                return <li key={activity.id2}>
                                    <div className={'checkbox ' + (activity.id2 === this.props.selectedActivityId ? 'selected' : '')}>
                                        <label onClick={(e) => { if (e.target.type !== 'checkbox') { e.preventDefault(); } }}>
                                            <input type='checkbox'
                                                checked={container.getEnableState(activity.id2)}
                                                onChange={(e) => this.props.dispatch({
                                                    type: TOGGLE_ACTIVITY,
                                                    payload: { activity, enabled: e.target.checked }
                                                })}
                                            />
                                            <span onClick={(e) => {
                                                this.props.dispatch({
                                                    type: SELECT_ACTIVITY,
                                                    payload: this.props.selectedActivityId === activity.id2 ? null : activity.id2
                                                });
                                            }}>
                                                {activity.id2}{' '}
                                                {activity.actors.map((actor) => {
                                                    var type = this.props.annotationTypeContainer.getItem(actor.id1);
                                                    return type ? `(${type.obj_type} ${actor.id1})` : `(${actor.id1})`;
                                                }).join(', ')}
                                            </span>
                                        </label>
                                    </div>
                                </li>;
                            })}
                        </ul>
                    </li>;
                })}
            </ul>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        annotationActivityContainer: state.annotationActivityContainer,
        annotationTypeContainer: state.annotationTypeContainer,
        selectedActivityId: state.selectedActivityId
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActivityPanel);
