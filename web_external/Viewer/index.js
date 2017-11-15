import React, { PureComponent } from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';

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
            ready: false
        };
        this.draggingSlider = false;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.itemModel !== this.props.itemModel) {
            this.setState({ ready: false });
        }
    }
    render() {
        var playDisabled = !this.state.ready;
        var message = this._getMessage();
        return <div className={['v-viewer', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-body'>
                    {this.props.itemModel &&
                        [
                            <ImageViewerWidgetWrapper className='video'
                                itemModel={this.props.itemModel}
                                playing={this.state.videoPlaying}
                                geometryCotnainer={this.props.annotationGeometryContainer}
                                annotationActivityContainer={this.props.annotationActivityContainer}
                                annotationTrackContainer={this.props.annotationTrackContainer}
                                currentFrame={this.state.videoCurrentFrame}
                                getAnnotation={this.getAnnotationForAFrame}
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
                                annotationsSelect={this.props.annotationsSelect}
                                key={this.props.itemModel.id} />,
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
                                        onClick={() => {
                                            if (this.state.videoCurrentFrame > 0) {
                                                this.setState({
                                                    playing: false,
                                                    videoPlaying: false,
                                                    videoCurrentFrame: this.state.videoCurrentFrame - 1
                                                });
                                            }
                                        }}>
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
                                        onClick={() => {
                                            if (this.state.videoCurrentFrame < this.state.videoMaxFrame) {
                                                this.setState({
                                                    playing: false,
                                                    videoPlaying: false,
                                                    videoCurrentFrame: this.state.videoCurrentFrame + 1
                                                });
                                            }
                                        }}>
                                        <i className='icon-to-end'></i>
                                    </button>
                                    {/* <button className='fast-forward btn btn-default' disabled={true}>
                                    <i className='icon-fast-fw'></i>
                                </button> */}
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
        if (this.props.isLoadingAnnotation || !this.state.ready) {
            return { text: 'Loading...', classes: 'message info-message' };
        }
        if (!this.props.isLoadingAnnotation && !this.props.annotationGeometryContainer) {
            return { text: 'No annotation', classes: 'message error-message' };
        }
    }

    getAnnotationForAFrame(frame) {
        if (!this.props.annotationGeometryContainer ||
            !this.props.annotationActivityContainer ||
            !this.props.annotationTrackContainer ||
            !this.props.annotationTypeContainer) {
            return;
        }
        var typeContainer = this.props.annotationTypeContainer;
        var trackContainer = this.props.annotationTrackContainer;
        var activityContainer = this.props.annotationActivityContainer;
        var annotationGeometries = this.props.annotationGeometryContainer.getFrame(frame);
        if (!annotationGeometries) {
            return;
        }
        var data = annotationGeometries.map((geometry) => {
            var activities = activityContainer.getEnabledActivities(geometry.id1, frame);
            return {
                g0: geometry.g0,
                activities,
                trackEnabled: trackContainer.getEnableState(geometry.id1),
                geometry,
                type: typeContainer.getItem(geometry.id1)
            };
        }).filter((data) => {
            return data.activities || data.trackEnabled;
        });
        var style = {
            fill: true,
            fillColor: { r: 1.0, g: 0.839, b: 0.439 },
            fillOpacity(a, b, d) {
                return d.activities ? 0.3 : 0;
            },
            stroke(d) {
                return d.trackEnabled;
            },
            strokeColor(a, b, d) {
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
                return { r: 0.851, g: 0.604, b: 0.0 };
            },
            strokeWidth: 1.25,
            strokeOpacity: 0.8,
            uniformPolygon: true
        };
        return [data, style];
    }
}
export default Viewer;
