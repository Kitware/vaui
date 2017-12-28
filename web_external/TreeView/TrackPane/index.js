import React from 'react';
import { connect } from 'react-redux'
import _ from 'underscore';

import BasePane from '../BasePane';
import { TOGGLE_TRACK } from '../../actions/types';

import './style.styl';

class TrackPane extends BasePane {
    getContainer() {
        return this.props.annotationTrackContainer;
    }

    getItemId(item) {
        return item;
    }

    toggleItem(item, enabled) {
        this.props.dispatch({
            type: TOGGLE_TRACK,
            payload: { track: item, enabled }
        });
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
                                    onChange={(e) => this.props.dispatch({
                                        type: TOGGLE_TRACK,
                                        payload: { track: trackId, enabled: e.target.checked }
                                    })}
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

const mapStateToProps = (state, ownProps) => {
    return {
        annotationTrackContainer: state.annotationTrackContainer,
        annotationTypeContainer: state.annotationTypeContainer
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackPane);
