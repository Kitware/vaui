import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import ReactBootstrapSlider from 'react-bootstrap-slider';
import bootbox from 'bootbox';
import mousetrap from 'mousetrap';

import { ANNOTATION_CLICKED, EDITING_TRACK, CHANGE_GEOM, DELETE_GEOM, NEW_TRACK, MAX_FRAME_CHANGE } from '../actions/types';
import ImageViewerWidgetWrapper from './ImageViewerWidgetWrapper';
import SpinBox from '../SpinBox';

import './style.styl';
import './slider.styl';

class Viewer extends PureComponent {
    constructor(props) {
        super(props);
        this.getAnnotationForAFrame = this.getAnnotationForAFrame.bind(this);
        this.state = {
            playing: false,
            videoPlaying: false,
            videoCurrentFrame: 0,
            videoMaxFrame: 100,
            ready: false,
            editMode: 'draw'
        };
        this.draggingSlider = false;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedItem !== this.props.selectedItem) {
            this.setState({ ready: false });
        }
        if (this.props.requestFrameRange !== nextProps.requestFrameRange) {
            if (this.state.videoCurrentFrame < nextProps.requestFrameRange[0] ||
                this.state.videoCurrentFrame > nextProps.requestFrameRange[1]) {
                this.requestToFrame(nextProps.requestFrameRange[0]);
            }
        }
        if (this.props.requestFrame !== nextProps.requestFrame) {
            this.requestToFrame(nextProps.requestFrame.frame);
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.videoMaxFrame !== prevState.videoMaxFrame) {
            this.props.dispatch({
                type: MAX_FRAME_CHANGE,
                payload: this.state.videoMaxFrame
            })
        }
    }

    componentDidMount() {
        mousetrap.bind('shift+t', () => this.newTrack());
        mousetrap.bind('left', () => this._previousFrame());
        mousetrap.bind('right', () => this._nextFrame());
    }
    componentWillUnmount() {
        mousetrap.unbind('shift+t');
        mousetrap.unbind('left');
        mousetrap.unbind('right');
    }
    requestToFrame(frame) {
        // This works now but can be improved, the player and this controller still has some data racing issue
        this.setState({ playing: false, videoPlaying: false }, () => {
            setTimeout(() => {
                this.setState({ videoCurrentFrame: Math.min(frame, this.state.videoMaxFrame) });
            }, 100);
        });
    }
    render() {
        var playDisabled = !this.state.ready || this.props.loadingAnnotation;
        var message = this._getMessage();
        return <div className={['v-viewer', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-body'>
                    {this.props.selectedItem &&
                        [
                            <div key='control-bar' className='control-bar'>
                                <button className='btn btn-deault btn-xs' disabled={playDisabled} onClick={(e) => this.newTrack()}>New Track</button>
                                {this.props.editingTrackId !== null && <button className='btn btn-deault btn-xs' onClick={(e) => this.setState({ editMode: this.state.editMode === 'edit' ? 'draw' : 'edit' })}>{this.state.editMode === 'edit' ? 'Draw mode' : 'Edit mode'}</button>}
                            </div>,
                            <ImageViewerWidgetWrapper className='video'
                                item={this.props.selectedItem}
                                playing={this.state.videoPlaying}
                                geometryCotnainer={this.props.annotationGeometryContainer}
                                annotationActivityContainer={this.props.annotationActivityContainer}
                                currentFrame={this.state.videoCurrentFrame}
                                getAnnotation={this.getAnnotationForAFrame}
                                editingTrackId={this.props.editingTrackId}
                                selectedTrackId={this.props.selectedTrackId}
                                editMode={this.state.editMode}
                                onPause={() => {
                                    if (!this.draggingSlider) {
                                        this.setState({
                                            playing: false,
                                            videoPlaying: false
                                        });
                                    }
                                }}
                                onProgress={(currentFrame, numberOfFrames) => {
                                    if (!this.draggingSlider) {
                                        this.setState({
                                            videoMaxFrame: numberOfFrames - 1,
                                            videoCurrentFrame: currentFrame
                                        });
                                    }
                                }}
                                onReady={() => {
                                    this.setState({
                                        ready: true
                                    });
                                }}
                                annotationLeftClick={(annotation) => this.props.dispatch({
                                    type: ANNOTATION_CLICKED,
                                    payload: annotation
                                })}
                                annotationRightClick={(annotation) => this.props.dispatch({
                                    type: EDITING_TRACK,
                                    payload: annotation ? annotation.geometry.id1 : null
                                })}
                                annotationDrawn={(g0) => this.props.dispatch({
                                    type: CHANGE_GEOM,
                                    payload: {
                                        frame: this.state.videoCurrentFrame,
                                        trackId: this.props.editingTrackId,
                                        g0
                                    }
                                })}
                                annotationDeleted={() => this.props.dispatch({
                                    type: DELETE_GEOM,
                                    payload: {
                                        frame: this.state.videoCurrentFrame,
                                        trackId: this.props.editingTrackId
                                    }
                                })}
                                key={this.props.selectedItem._id} />,
                            message && <div className={message.classes} key='message'>
                                <span>{message.text}</span>
                            </div>,
                            <div className='control' key='control'>
                                <div className='buttons btn-group'>
                                    {/* <button className='fast-backword btn btn-default' disabled={true}>
                                    <i className='icon-fast-bw'></i>
                                </button>
                                <button className='reverse btn btn-default' disabled={true}>
                                    <i className='icon-play'></i>
                                </button> */}
                                    <button className='previous-frame btn btn-default'
                                        disabled={playDisabled || this.state.videoCurrentFrame <= 0}
                                        onClick={() => this._previousFrame()}>
                                        <i className='icon-to-start'></i>
                                    </button>
                                    {!this.state.playing
                                        ? <button className='play btn btn-default'
                                            onClick={() => {
                                                this.setState({ playing: true, videoPlaying: true });
                                            }}
                                            disabled={playDisabled}>
                                            <i className='icon-play'></i>
                                        </button>
                                        : <button className='pause btn btn-default' onClick={() => {
                                            this.setState({ playing: false, videoPlaying: false });
                                        }}>
                                            <i className='icon-pause'></i>
                                        </button>}
                                    <button className='next-frame btn btn-default'
                                        disabled={playDisabled || this.state.videoCurrentFrame >= this.state.videoMaxFrame}
                                        onClick={() => this._nextFrame()}>
                                        <i className='icon-to-end'></i>
                                    </button>
                                </div>
                                <div className='time-control'>
                                    <ReactBootstrapSlider
                                        value={this.state.videoCurrentFrame}
                                        max={this.state.videoMaxFrame}
                                        tooltip='hide'
                                        disabled={playDisabled ? 'disabled' : 'enabled'}
                                        slideStop={(e) => {
                                            this.draggingSlider = false;
                                            if (this.state.playing) {
                                                this.setState({ videoPlaying: true });
                                            }
                                        }}
                                        change={(e) => {
                                            this.draggingSlider = true;
                                            if (this.state.playing) {
                                                this.setState({ videoPlaying: false });
                                            }
                                            this.setState({
                                                videoCurrentFrame: e.target.value
                                            });
                                        }} />
                                    <SpinBox
                                        suffix={' / ' + this.state.videoMaxFrame}
                                        min={0}
                                        max={this.state.videoMaxFrame}
                                        value={this.state.videoCurrentFrame}
                                        disabled={playDisabled}
                                        change={(e) => {
                                            this.setState({
                                                videoCurrentFrame: parseInt(e.target.value)
                                            });
                                        }} />
                                </div>
                            </div>
                        ]
                    }
                </div>
            </div>
        </div>;
    }

    _getMessage() {
        if (this.props.loadingAnnotation || !this.state.ready) {
            return { text: 'Loading...', classes: 'message info-message' };
        }
        if (!this.props.loadingAnnotation && !this.props.annotationGeometryContainer) {
            return { text: 'No annotation', classes: 'message error-message' };
        }
    }

    getAnnotationForAFrame(frame) {
        if (!this.props.annotationGeometryContainer ||
            !this.props.annotationActivityContainer ||
            !this.props.annotationTypeContainer) {
            return;
        }
        var typeContainer = this.props.annotationTypeContainer;
        var geometryContainer = this.props.annotationGeometryContainer;
        var activityContainer = this.props.annotationActivityContainer;
        var annotationGeometries = geometryContainer.getFrame(frame);
        if (!annotationGeometries) {
            return;
        }
        var data = annotationGeometries.map((geometry) => {
            var activities = activityContainer.getEnabledActivities(geometry.id1, frame);
            return {
                activities,
                trackEnabled: geometryContainer.getEnableState(geometry.id1),
                geometry,
                type: typeContainer.getItem(geometry.id1)
            };
        }).filter((data) => {
            return data.activities || data.trackEnabled;
        });
        var selectedTrackId = this.props.selectedTrackId;
        var editingTrackId = this.props.editingTrackId;
        var style = {
            fill: true,
            fillColor: { r: 1.0, g: 0.839, b: 0.439 },
            fillOpacity(a, b, d) {
                return d.activities ? 0.3 : 0;
            },
            stroke(d) {
                if (d.geometry.id1 === editingTrackId) {
                    return false;
                }
                return d.trackEnabled;
            },
            strokeColor(a, b, d) {
                if (d.geometry.id1 === selectedTrackId) {
                    return { r: 1, g: 0.08, b: 0.58 };
                }
                var attributes = d.geometry.keyValues;
                if (attributes.src === 'truth') {
                    if (attributes.eval0 === 'tp') {
                        return { r: 0, g: 1, b: 0.0 };
                    } else if (attributes.eval0 === 'fn') {
                        return { r: 1, g: 1, b: 0.0 };
                    }
                } else if (attributes.src === 'computed') {
                    if (attributes.eval0 === 'tp') {
                        return { r: 0, g: 0, b: 1 };
                    } else if (attributes.eval0 === 'fp') {
                        return { r: 1, g: 0, b: 0.0 };
                    }
                }
                return { r: 1, g: 0.87, b: 0.0 };
            },
            strokeWidth: 1.25,
            strokeOpacity: 0.8,
            uniformPolygon: true
        };
        return {
            data, style, editingTrackId, editingStyle: {
                fill: false,
                stroke: true,
                strokeColor: { r: 0.5, g: 1, b: 1 },
                strokeWidth: 1.25,
                strokeOpacity: 0.8
            }
        };
    }

    newTrack() {
        bootbox.prompt({
            size: 'small',
            title: 'New track id?',
            inputType: 'number',
            value: this.props.annotationGeometryContainer.getNextTrackId(),
            callback: (trackId) => {
                if (!trackId) {
                    return;
                }
                trackId = parseInt(trackId);
                if (!this.props.annotationGeometryContainer.validateNewTrackId(trackId)) {
                    bootbox.alert({
                        size: 'small',
                        message: 'A track with this id already exists',
                        callback: () => this.newTrack()
                    });
                    return;
                }
                this.props.dispatch({
                    type: NEW_TRACK,
                    payload: {
                        trackId,
                        itemId: this.props.selectedItem._id,
                        cset3: {}
                    }
                });
            }
        });
    }

    _previousFrame() {
        var playDisabled = !this.state.ready || this.props.loadingAnnotation;
        if (playDisabled) {
            return;
        }
        if (this.state.videoCurrentFrame > 0) {
            this.setState({
                playing: false,
                videoPlaying: false,
                videoCurrentFrame: this.state.videoCurrentFrame - 1
            });
        }
    }

    _nextFrame() {
        var playDisabled = !this.state.ready || this.props.loadingAnnotation;
        if (playDisabled) {
            return;
        }
        if (this.state.videoCurrentFrame < this.state.videoMaxFrame) {
            this.setState({
                playing: false,
                videoPlaying: false,
                videoCurrentFrame: this.state.videoCurrentFrame + 1
            });
        }
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        selectedItem: state.selectedItem,
        loadingAnnotation: state.loadingAnnotation,
        annotationGeometryContainer: state.annotationGeometryContainer,
        annotationActivityContainer: state.annotationActivityContainer,
        annotationTypeContainer: state.annotationTypeContainer,
        selectedTrackId: state.selectedTrackId,
        editingTrackId: state.editingTrackId,
        requestFrameRange: state.requestFrameRange,
        requestFrame: state.requestFrame
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
