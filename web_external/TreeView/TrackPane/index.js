import React from 'react';
import { connect } from 'react-redux';
import _ from 'underscore';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';

import BasePane from '../BasePane';
import { TOGGLE_TRACK, FOCUS_TRACK, GOTO_TRACK_START, GOTO_TRACK_END, SELECT_TRACK, EDITING_TRACK } from '../../actions/types';

import './style.styl';

class TrackPane extends BasePane {
    constructor(props) {
        super(props);
        this.state = {
            interactTrackId: null
        };
    }

    getContainer() {
        return this.props.annotationGeometryContainer;
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
        if (!this.props.annotationTypeContainer || !this.props.annotationGeometryContainer) {
            return null;
        }
        var typeContainer = this.props.annotationTypeContainer;
        var geometryContainer = this.props.annotationGeometryContainer;

        var sortedTrackIds = _.sortBy(geometryContainer.getAllItems());

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
                    if (type) {
                        var types = Object.keys(type.cset3);
                        var typeLabel = types.length <= 1 ? types[0] : 'Multiple';
                    }
                    var label = ((type && typeLabel) ? `${typeLabel}-${trackId}` : trackId);
                    return <li key={trackId}>
                        <ContextMenuTrigger id='track-menu'>
                            <div className={'checkbox ' + (trackId === this.props.selectedTrackId ? 'selected' : '')} onContextMenu={(e) => {
                                this.setState({
                                    interactTrackId: trackId
                                });
                            }}>
                                <label className={trackId === this.props.editingTrackId ? 'editing' : ''} onClick={(e) => { if (e.target.type !== 'checkbox') { e.preventDefault(); } }}>
                                    <input type='checkbox'
                                        checked={geometryContainer.getEnableState(trackId)}
                                        onChange={(e) => this.props.dispatch({
                                            type: TOGGLE_TRACK,
                                            payload: { track: trackId, enabled: e.target.checked }
                                        })}
                                    />
                                    <span onClick={(e) => {
                                        this.props.dispatch({
                                            type: SELECT_TRACK,
                                            payload: trackId === this.props.selectedTrackId ? null : trackId
                                        });
                                    }}>{label}</span>
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
                <MenuItem divider />
                <MenuItem onClick={(e) => this.props.dispatch({
                    type: EDITING_TRACK,
                    payload: this.state.interactTrackId
                })}>
                    Edit
                </MenuItem>
            </ContextMenu>
        </div>;
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        annotationGeometryContainer: state.annotationGeometryContainer,
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
