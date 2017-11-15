import React from 'react';
import _ from 'underscore';

import BasePane from '../BasePane';

import './style.styl';

class TrackPane extends BasePane {
    getContainer() {
        return this.props.annotationTrackContainer;
    }

    getItemId(item) {
        return item;
    }

    toggleItem(item, enabled) {
        return this.props.toggleTrack(item, enabled);
    }

    render() {
        if (!this.props.annotationTypeContainer || !this.props.annotationTrackContainer) {
            return null;
        }
        var typeContainer = this.props.annotationTypeContainer;
        var trackContainer = this.props.annotationTrackContainer;

        var sortedTrackIds = _.sortBy(
            this.props.annotationTrackContainer.getAllItems(),
            (trackId) => {
                var type = typeContainer.getItem(trackId);
                if (type) {
                    return type.obj_type + trackId;
                } else {
                    return trackId;
                }
            });

        return <div className={['v-track-pane', this.props.className].join(' ')}>
            <div className='checkbox'>
                <label>
                    <input type='checkbox' checked={this.allChecked()} onChange={(e) => this.allClick()} />
                    All
                </label>
            </div>
            <ul>
                {sortedTrackIds.map((trackId) => {
                    var type = typeContainer.getItem(trackId);
                    var label = type ? `${type.obj_type} ${trackId}` : trackId;
                    return <li key={trackId}>
                        <div className='checkbox'>
                            <label>
                                <input type='checkbox'
                                    checked={trackContainer.getEnableState(trackId)}
                                    onChange={(e) => this.props.toggleTrack(trackId, e.target.checked)}
                                />
                                {label}
                            </label>
                        </div>
                    </li>;
                })}
            </ul>
        </div>;
    }
}
export default TrackPane;
