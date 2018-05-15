import React, { PureComponent } from 'react';
import { connect } from 'react-redux'
import ReactBootstrapSlider from 'react-bootstrap-slider';
import bootbox from 'bootbox';
import mousetrap from 'mousetrap';
import _ from 'underscore';

import { ANNOTATION_CLICKED, EDIT_TRACK, CHANGE_DETECTION, DELETE_DETECTION, GOTO_FRAME, SELECT_TRACK, NEW_TRACK, CURRENT_FRAME_CHANGE, MAX_FRAME_CHANGE, CREATE_ACTIVITY_START, CREATE_ACTIVITY_STOP, INTERPOLATE_SHOW, INTERPOLATE_HIDE } from '../actions/types';
import ImageViewerWidgetWrapper from './ImageViewerWidgetWrapper';
import SpinBox from '../SpinBox';

import './style.styl';
import './slider.styl';

class Viewer extends PureComponent {
    constructor(props) {
        super(props);
        this.getAnnotation = this.getAnnotation.bind(this);
        this.getTrackTrails = this.getTrackTrails.bind(this);
        this.state = {
            playing: false,
            playbackRate: 1,
            videoPlaying: false,
            videoCurrentFrame: Math.max(this.props.frameLimit[0], this.props.requestFrame.frame),
            videoMaxFrame: 100,
            ready: false,
            editMode: 'draw',
            drawingToZoom: false,
            zoomRegion: null,
            showTrackTrail: true
        };
        this.draggingSlider = false;
        this.trackTrailMap = null;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.selectedFolder !== this.props.selectedFolder) {
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
        if (this.props.annotationDetectionContainer !== nextProps.annotationDetectionContainer) {
            this.trackTrailMap = null;
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.videoMaxFrame !== prevState.videoMaxFrame) {
            this.props.dispatch({
                type: MAX_FRAME_CHANGE,
                payload: this.state.videoMaxFrame
            })
        }
        if (this.state.videoCurrentFrame !== prevState.videoCurrentFrame) {
            this.dispatchCurrentFrameChange();
        }
    }

    dispatchCurrentFrameChange() {
        this.props.dispatch({
            type: CURRENT_FRAME_CHANGE,
            payload: this.state.videoCurrentFrame
        });
    }

    componentDidMount() {
        mousetrap.bind('t', () => this.newTrack());
        mousetrap.bind('left', () => this._previousFrame());
        mousetrap.bind('right', () => this._nextFrame());
        mousetrap.bind('up', () => this._skipBackward());
        mousetrap.bind('down', () => this._skipForward());
        mousetrap.bind('shift', () => this.setState({ drawingToZoom: true }), 'keydown');
        mousetrap.bind('shift', () => this.setState({ drawingToZoom: false }), 'keyup');
    }
    componentWillUnmount() {
        mousetrap.unbind('t');
        mousetrap.unbind('left');
        mousetrap.unbind('right');
        mousetrap.unbind('up');
        mousetrap.unbind('down');
        mousetrap.unbind('shift', 'keydown');
        mousetrap.unbind('shift', 'keyup');
    }
    requestToFrame(frame) {
        this.setState({ playing: false, videoPlaying: false }, () => {
            this.setState({ videoCurrentFrame: Math.min(frame, this.state.videoMaxFrame) });
        });
    }
    render() {
        var playDisabled = !this.state.ready || this.props.loadingAnnotation;
        var message = this._getMessage();
        return <div className={['v-viewer', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-body'>
                    {this.props.selectedFolder &&
                        [
                            <div key='control-bar' className='control-bar'>
                                <div className='btn-group btn-group-xs'>
                                    <button type='button' className='btn dropdown-toggle' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                                        <span className='glyphicon glyphicon-menu-hamburger' aria-hidden='true'></span>
                                    </button>
                                    <ul className='dropdown-menu'>
                                        <li><a>
                                            <label className='checkbox-inline'>
                                                <input type='checkbox' checked={this.state.showTrackTrail} onChange={() => { this.setState({ showTrackTrail: !this.state.showTrackTrail }); }} />Track Trail</label>
                                        </a>
                                        </li>
                                    </ul>
                                </div>
                                <button className={'btn btn-xs' + (this.state.drawingToZoom ? ' active' : '')} disabled={playDisabled} onClick={(e) => {
                                    this.setState({ drawingToZoom: !this.state.drawingToZoom });
                                }} title='Zoom to region (Shift)'><span className='glyphicon glyphicon-zoom-in'></span></button>
                                <button className='btn btn-xs' disabled={playDisabled} onClick={(e) => this.newTrack()} title='Create new Track (T)'>New Track</button>
                                <button className={'btn btn-xs' + (this.props.creatingActivity ? ' active' : '')} disabled={playDisabled} onClick={(e) => {
                                    if (!this.props.creatingActivity) {
                                        this.props.dispatch({
                                            type: CREATE_ACTIVITY_START
                                        });
                                    } else {
                                        this.props.dispatch({
                                            type: CREATE_ACTIVITY_STOP
                                        });
                                    }
                                }}>New Activity</button>
                                <button className={'btn btn-xs' + (this.props.interpolationWidget ? ' active' : '')} disabled={playDisabled} onClick={(e) => {
                                    if (!this.props.interpolationWidget) {
                                        this.props.dispatch({
                                            type: INTERPOLATE_SHOW
                                        });
                                    } else {
                                        this.props.dispatch({
                                            type: INTERPOLATE_HIDE
                                        });
                                    }
                                }}>Interpolate</button>
                                {this.props.editingTrackId !== null && <button className='btn btn-xs' onClick={(e) => this.setState({ editMode: this.state.editMode === 'edit' ? 'draw' : 'edit' })}>{this.state.editMode === 'edit' ? 'Draw mode' : 'Edit mode'}</button>}
                            </div>,
                            <ImageViewerWidgetWrapper className='video'
                                folder={this.props.selectedFolder}
                                playing={this.state.videoPlaying}
                                playbackRate={this.state.playbackRate}
                                detectionContainer={this.props.annotationDetectionContainer}
                                annotationActivityContainer={this.props.annotationActivityContainer}
                                currentFrame={this.state.videoCurrentFrame}
                                frameLimit={this.props.frameLimit}
                                getAnnotation={this.getAnnotation}
                                getTrackTrails={this.getTrackTrails}
                                showTrackTrail={this.state.showTrackTrail}
                                editingTrackId={this.props.editingTrackId}
                                selectedTrackId={this.props.selectedTrackId}
                                selectedActivityId={this.props.selectedActivityId}
                                editMode={this.state.editMode}
                                drawingToZoom={this.state.drawingToZoom} zoomRegion={this.state.zoomRegion}
                                onPause={() => {
                                    if (!this.draggingSlider) {
                                        this.setState({
                                            playing: false,
                                            videoPlaying: false,
                                            playbackRate: 1
                                        });
                                    }
                                }}
                                onProgress={(currentFrame, numberOfFrames) => {
                                    if (!this.draggingSlider) {
                                        this.setState({
                                            videoMaxFrame: numberOfFrames,
                                            videoCurrentFrame: currentFrame
                                        });
                                    }
                                }}
                                onReady={() => {
                                    this.setState({
                                        ready: true
                                    });
                                }}
                                detectionLeftClick={(annotation) => this.props.dispatch({
                                    type: ANNOTATION_CLICKED,
                                    payload: annotation
                                })}
                                detectionRightClick={(annotation) => {
                                    this.setState({ drawingToZoom: false });
                                    this.props.dispatch({
                                        type: EDIT_TRACK,
                                        payload: annotation ? annotation.detection.id1 : null
                                    });
                                }}
                                trackTrailClick={(trackId) => {
                                    this.props.dispatch({
                                        type: SELECT_TRACK,
                                        payload: trackId
                                    });
                                }}
                                trackTrailRightClick={(trackId) => {
                                    this.setState({ drawingToZoom: false });
                                    this.props.dispatch({
                                        type: EDIT_TRACK,
                                        payload: trackId
                                    });
                                }}
                                trackTrailTruthPointClick={(trackId, frame) => {
                                    this.props.dispatch({
                                        type: GOTO_FRAME,
                                        payload: frame
                                    });
                                }}
                                rectangleDrawn={(g0) => {
                                    if (!this.drawingToZoom && this.props.editingTrackId !== null) {
                                        this.props.dispatch({
                                            type: CHANGE_DETECTION,
                                            payload: {
                                                frame: this.state.videoCurrentFrame,
                                                trackId: this.props.editingTrackId,
                                                g0
                                            }
                                        });
                                    } else if (this.state.drawingToZoom) {
                                        this.setState({
                                            drawingToZoom: false,
                                            zoomRegion: g0
                                        });
                                    }
                                }}
                                deleteAnnotation={() => this.props.dispatch({
                                    type: DELETE_DETECTION,
                                    payload: {
                                        frame: this.state.videoCurrentFrame,
                                        trackId: this.props.editingTrackId
                                    }
                                })}
                                key={this.props.selectedFolder._id} />,
                            message && <div className={message.classes} key='message'>
                                <span>{message.text}</span>
                            </div>,
                            <div className='control' key='control'>
                                <div className='buttons btn-group btn-group-sm'>
                                    {!this.state.playing
                                        ? <button className='play btn btn-default'
                                            onClick={() => {
                                                this.setState({ playing: true, videoPlaying: true });
                                            }}
                                            disabled={playDisabled}>
                                            <span className='glyphicon glyphicon-play'></span>
                                            <span> {this.state.playbackRate}x</span>
                                        </button>
                                        : <button className='pause btn btn-default' onClick={() => {
                                            this.setState({
                                                playing: false,
                                                videoPlaying: false,
                                                playbackRate: 1
                                            });
                                        }}>
                                            <span className='glyphicon glyphicon-pause'></span>
                                            <span> {this.state.playbackRate}x</span>
                                        </button>}
                                    <button
                                        className='forward btn btn-default'
                                        disabled={playDisabled}
                                        onClick={() => {
                                            var playbackRate = this.state.playbackRate < 0 ? 1 : this.state.playbackRate < 16 ? this.state.playbackRate * 2 : this.state.playbackRate;
                                            this.setState({
                                                playing: true,
                                                videoPlaying: true,
                                                playbackRate
                                            });
                                        }}>
                                        <span className='glyphicon glyphicon-forward'></span>
                                    </button>
                                    <button className='previous-frame btn btn-default'
                                        disabled={playDisabled || this.state.videoCurrentFrame <= 0}
                                        onClick={() => this._previousFrame()}>
                                        <span className='glyphicon glyphicon-step-backward'></span>
                                    </button>
                                    <button className='next-frame btn btn-default'
                                        disabled={playDisabled || this.state.videoCurrentFrame >= this.state.videoMaxFrame}
                                        onClick={() => this._nextFrame()}>
                                        <span className='glyphicon glyphicon-step-forward'></span>
                                    </button>
                                    <button className='fast-backward btn btn-default' disabled={playDisabled}
                                        onClick={() => this._skipBackward()}>
                                        <span className='glyphicon glyphicon-fast-backward'></span>
                                    </button>
                                    <button className='fast-forward btn btn-default' disabled={playDisabled}
                                        onClick={() => this._skipForward()}>
                                        <span className='glyphicon glyphicon-fast-forward'></span>
                                    </button>
                                </div>
                                <div className='time-control'>
                                    <ReactBootstrapSlider
                                        value={this.state.videoCurrentFrame}
                                        max={this.state.videoMaxFrame}
                                        min={Math.max(0, this.props.frameLimit[0])}
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
                                        min={Math.max(0, this.props.frameLimit[0])}
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
            if (this.props.importProgress !== null) {
                return { text: `Importing kpf ${this.props.importProgress}%`, classes: 'message info-message' };
            } else {
                return { text: 'Loading...', classes: 'message info-message' };
            }
        } else if (this.props.loadingAnnotationFailed) {
            return { text: 'Failed to load annotations', classes: 'message error-message' };
        }
        else if (!this.props.annotationDetectionContainer.length) {
            return { text: 'No annotation', classes: 'message error-message' };
        }
    }

    getAnnotation(frame) {
        if (!this.props.annotationDetectionContainer ||
            !this.props.annotationActivityContainer ||
            !this.props.annotationTypeContainer) {
            return;
        }
        var typeContainer = this.props.annotationTypeContainer;
        var detectionContainer = this.props.annotationDetectionContainer;
        var activityContainer = this.props.annotationActivityContainer;
        var detections = detectionContainer.getByFrame(frame);
        var data = detections.map((detection) => {
            var activities = activityContainer.getEnabledActivities(detection.id1, frame);
            return {
                activities,
                trackEnabled: detectionContainer.getEnableState(detection.id1),
                detection,
                type: typeContainer.getItem(detection.id1)
            };
        }).filter((data) => {
            return data.activities || data.trackEnabled;
        });
        var selectedTrackId = this.props.selectedTrackId;
        var selectedActivityId = this.props.selectedActivityId;
        var editingTrackId = this.props.editingTrackId;
        var style = {
            fill(d) {
                return d.detection.src !== 'truth';
            },
            fillColor(a, b, d) {
                if (d.detection.id1 === editingTrackId) {
                    return { r: 0.5, g: 1, b: 1 };
                }
                if (d.detection.id1 === selectedTrackId) {
                    return { r: 1, g: 0.08, b: 0.58 };
                }
                return { r: 1.0, g: 0.839, b: 0.439 };
            },
            fillOpacity: 0.2,
            stroke(d) {
                if (d.detection.src !== 'truth') {
                    return false;
                }
                if (d.detection.id1 === editingTrackId) {
                    return false;
                }
                return d.trackEnabled;
            },
            strokeColor(a, b, d) {
                if (d.detection.id1 === selectedTrackId) {
                    return { r: 1, g: 0.08, b: 0.58 };
                }
                return { r: 1, g: 0.87, b: 0.0 };
            },
            strokeWidth: 2,
            strokeOpacity: 0.8,
            uniformPolygon: true
        };
        return {
            data, style, editingTrackId, editingStyle: {
                fill: false,
                stroke: true,
                strokeColor: { r: 0.5, g: 1, b: 1 },
                strokeWidth: 2,
                strokeOpacity: 0.8
            }
        };
    }

    getTrackTrails(frame) {
        if (!this.props.annotationDetectionContainer) {
            return;
        }
        var annotationDetectionContainer = this.props.annotationDetectionContainer;
        if (!this.trackTrailMap) {
            this.trackTrailMap = annotationDetectionContainer.getAllItems()
                .reduce((map, trackId) => {
                    var detections = annotationDetectionContainer.getByTrackId(trackId);
                    var line = [];
                    var lastCenter = null;
                    for (let detection of detections) {
                        let center = [(detection.g0[0][0] + detection.g0[1][0]) / 2, (detection.g0[0][1] + detection.g0[1][1]) / 2, detection.ts0, detection.src === 'truth'];
                        line.push(center);
                        lastCenter = center;
                    }
                    map.set(trackId, line);
                    return map;
                }, new Map());
        }

        var selectedTrackId = this.props.selectedTrackId;
        var editingTrackId = this.props.editingTrackId;

        var allTracks = annotationDetectionContainer.getAllItems();
        var trackTrails = [];
        var trackTrailTruthPoints = [];
        for (let trackId of allTracks) {
            if (!annotationDetectionContainer.getEnableState(trackId)) {
                continue;
            }
            var frameRange = annotationDetectionContainer.getTrackFrameRange(trackId);
            if (frame < frameRange[0] || frame > frameRange[1]) {
                continue;
            }
            var lastCenter = null;
            var trackTrail = null;
            var trackTrailTruthPointsForCurrentTrack = [];
            for (let center of this.trackTrailMap.get(trackId)) {
                if (!lastCenter || lastCenter[2] !== center[2] - 1) {
                    trackTrail = {
                        trackId,
                        frameRange,
                        line: []
                    };
                    trackTrails.push(trackTrail);
                    if (lastCenter) {
                        trackTrails.push({
                            trackId,
                            frameRange,
                            gap: true,
                            line: [lastCenter, center]
                        })
                    }
                }
                lastCenter = center;
                trackTrail.line.push(center);

                if (center[3]) {
                    trackTrailTruthPointsForCurrentTrack.push({
                        trackId,
                        point: center
                    });
                }
            }
            trackTrailTruthPoints = [...trackTrailTruthPoints, ...trackTrailTruthPointsForCurrentTrack];

        }
        var trackTrailStyle = {
            stroke: true,
            strokeColor(a, b, d, e) {
                if (trackTrails[e].trackId === editingTrackId) {
                    return { r: 0.5, g: 1, b: 1 };
                }
                if (trackTrails[e].trackId === selectedTrackId) {
                    return { r: 1, g: 0.08, b: 0.58 };
                }
                return { r: 1, g: 0.87, b: 0.0 };
            },
            strokeWidth: 1.25,
            strokeOpacity(a, b, d, e) {
                if (trackTrails[e].gap) {
                    return 0.4;
                }
                var frameRange = trackTrails[e].frameRange;
                if (frame >= frameRange[0] && frame <= frameRange[1]) {
                    return 0.8;
                }
                return 0.6;
            },
            uniformPolygon: true
        };

        var trackTrailTruthPointStyle = {
            stroke: true,
            strokeColor(a, b, d, e) {
                if (a.trackId === editingTrackId) {
                    return { r: 0.5, g: 1, b: 1 };
                }
                if (a.trackId === selectedTrackId) {
                    return { r: 1, g: 0.08, b: 0.58 };
                }
                return { r: 1, g: 0.87, b: 0.0 };
            },
            strokeWidth: 2,
            radius: 2
        };

        return { trackTrails, trackTrailStyle, trackTrailTruthPoints, trackTrailTruthPointStyle };
    }

    newTrack() {
        bootbox.prompt({
            size: 'small',
            title: 'New track id?',
            inputType: 'number',
            value: this.props.annotationDetectionContainer.getNextTrackId(),
            callback: (trackId) => {
                if (!trackId) {
                    return;
                }
                trackId = parseInt(trackId);
                if (!this.props.annotationDetectionContainer.validateNewTrackId(trackId)) {
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
                        cset3: {}
                    }
                });
            }
        });
    }

    _previousFrame() {
        if (!this.state.ready || this.props.loadingAnnotation) {
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
        if (!this.state.ready || this.props.loadingAnnotation) {
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

    _skipForward() {
        if (!this.state.ready || this.props.loadingAnnotation) {
            return;
        }
        var newFrame = Math.min(this.state.videoMaxFrame, this.state.videoCurrentFrame + 15);
        if (newFrame !== this.state.videoCurrentFrame) {
            this.setState({
                playing: false,
                videoPlaying: false,
                videoCurrentFrame: newFrame
            });
        }
    }

    _skipBackward() {
        if (!this.state.ready || this.props.loadingAnnotation) {
            return;
        }
        var newFrame = Math.max(0, this.state.videoCurrentFrame - 15);
        if (newFrame !== this.state.videoCurrentFrame) {
            this.setState({
                playing: false,
                videoPlaying: false,
                videoCurrentFrame: newFrame
            });
        }
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        selectedFolder: state.selectedFolder,
        importProgress: state.importProgress,
        loadingAnnotation: state.loadingAnnotation,
        loadingAnnotationFailed: state.loadingAnnotationFailed,
        annotationDetectionContainer: state.annotationDetectionContainer,
        annotationActivityContainer: state.annotationActivityContainer,
        annotationTypeContainer: state.annotationTypeContainer,
        selectedTrackId: state.selectedTrackId,
        selectedActivityId: state.selectedActivityId,
        editingTrackId: state.editingTrackId,
        requestFrameRange: state.requestFrameRange,
        requestFrame: state.requestFrame,
        creatingActivity: state.creatingActivity,
        interpolationWidget: state.interpolationWidget,
        frameLimit: state.frameLimit
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        dispatch
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
