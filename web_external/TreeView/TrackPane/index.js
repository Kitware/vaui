import React from 'react';
import { connect } from 'react-redux'
import _ from 'underscore';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import BasePane from '../BasePane';
import { TOGGLE_TRACK, FOCUS_TRACK, GOTO_TRACK_START, GOTO_TRACK_END } from '../../actions/types';

import './style.styl';

class TrackPane extends BasePane {
    constructor(props) {
        super(props);
        this.state = {
            interactTrackId: null
        }
    }

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

    setInteractTarget(trackId) {
        this.setState({
            interactTrackId: trackId
        })
    }

    render() {
        if (!this.props.annotationTypeContainer || !this.props.annotationTrackContainer) {
            return null;
        }
        var typeContainer = this.props.annotationTypeContainer;
        var trackContainer = this.props.annotationTrackContainer;

        var sortedTrackIds = _.sortBy(this.props.annotationTrackContainer.getAllItems());

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
                    var label = (type ? `${type.obj_type} ${trackId}` : trackId);
                    return <li key={trackId}>
                        <ContextMenuTrigger id='track-menu'>
                            <div className={'checkbox ' + (trackId === this.props.selectedTrackId ? 'selected' : '')} onContextMenu={(e) => this.setInteractTarget(trackId)}>
                                <label className={trackId === this.props.editingTrackId ? 'editing' : ''}>
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
                        </ContextMenuTrigger>
                    </li>;
                })}
            </ul>
            <ContextMenu id="track-menu">
                <MenuItem onClick={(e) => this.props.dispatch({
                    type: FOCUS_TRACK,
                    payload: this.state.interactTrackId
                })}>
                    Focus
                </MenuItem>
                <MenuItem divider />
                <MenuItem onClick={(e) => this.props.dispatch({
                    type: GOTO_TRACK_START,
                    payload: this.state.interactTrackId
                })}>
                    Go to start
                </MenuItem>
                <MenuItem onClick={(e) => this.props.dispatch({
                    type: GOTO_TRACK_END,
                    payload: this.state.interactTrackId
                })}>
                    Go to end
                </MenuItem>
            </ContextMenu>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        annotationTrackContainer: state.annotationTrackContainer,
        annotationTypeContainer: state.annotationTypeContainer,
        selectedTrackId: state.selectedTrackId,
        editingTrackId: state.editingTrackId
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackPane);
