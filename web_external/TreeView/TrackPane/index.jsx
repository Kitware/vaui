import React, { Component } from 'react';
import _ from 'underscore';

import BasePane from '../BasePane';

import './style.styl';

class TrackPane extends BasePane {
    constructor(props) {
        super(props);
    }

    getContainer() {
        return this.props.annotationTrackContainer;
    }

    getItemId(item) {
        return item.id1;
    }

    toggleItem(item, enabled) {
        return this.props.toggleTrack(item, enabled);
    }

    render() {
        if (!this.props.annotationTrackContainer) {
            return null;
        }
        var container = this.props.annotationTrackContainer;
        var tracks = _.sortBy(_.sortBy(container.getAllItems(), (track) => track.id1), (track) => track.obj_type.toLowerCase());

        return <div className={['v-track-pane', this.props.className].join(' ')}>
            <div className='checkbox'>
                <label>
                    <input type='checkbox' checked={this.allChecked()} onChange={(e) => this.allClick()} />
                    All
                </label>
            </div>
            <ul>
                {tracks.map((track) => {
                    return <li key={track.id1}>
                        <div className='checkbox'>
                            <label>
                                <input type='checkbox'
                                    checked={container.getEnableState(track.id1)}
                                    onChange={(e) => this.props.toggleTrack(track, e.target.checked)}
                                />
                                {`${track.obj_type} ${track.id1}`}
                            </label>
                        </div>
                    </li>
                })}
            </ul>
        </div>
    }
}
export default TrackPane;
