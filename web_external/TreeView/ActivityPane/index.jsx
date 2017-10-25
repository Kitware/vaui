import React, { Component } from 'react';
import _ from 'underscore';

import BasePane from '../BasePane';

import './style.styl';

class ActivityPanel extends BasePane {
    constructor(props) {
        super(props);
        this.state = {
            groupedActivities: null
        }
    }
    getContainer() {
        return this.props.annotationActivityContainer;
    }

    getItemId(item) {
        return item.id2;
    }

    toggleItem(item, enabled) {
        return this.props.toggleActivity(item, enabled);
    }

    toggleGroup(groupName, checked) {
        var activities = this.state.groupedActivities[groupName];
        activities.forEach((activity) => this.props.toggleActivity(activity, checked));
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.annotationActivityContainer !== nextProps.annotationActivityContainer) {
            var activities = nextProps.annotationActivityContainer.getAllItems();
            var groupedActivities = _.groupBy(activities, (activity) => activity.act2);
            this.setState({ groupedActivities })
        }
    }

    render() {
        if (!this.props.annotationActivityContainer || !this.props.annotationTrackContainer) {
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
                                    <div className='checkbox'>
                                        <label>
                                            <input type='checkbox'
                                                checked={container.getEnableState(activity.id2)}
                                                onChange={(e) => this.props.toggleActivity(activity, e.target.checked)}
                                            />
                                            {activity.actors.map((actor) => {
                                                var track = this.props.annotationTrackContainer.getItem(actor.id1);
                                                return `${track.obj_type} ${track.id1}`;
                                            }).join(', ')}
                                        </label>
                                    </div>
                                </li>
                            })}
                        </ul>
                    </li>
                })}
            </ul>
        </div>
    }
}
export default ActivityPanel;
