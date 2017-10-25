import React, { Component } from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import events from 'girder/events';
import { restRequest } from 'girder/rest';
import ImageViewerWidgetWrapper from './ImageViewerWidgetWrapper';
import SpinBox from '../SpinBox';

import './style.styl';
import './slider.styl';

class Viewer extends Component {
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
        return <div className={['v-viewer', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-body'>
                    {this.props.itemModel &&
                        [<ImageViewerWidgetWrapper className='video'
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
                            key={this.props.itemModel.id} />,
                        <div className='no-annotation-message' key='no-annotation-message'>{this.props.itemModel && !this.props.annotationGeometryContainer && <span>No annotation</span>}
                        </div>,
                        <div className='control' key='control'>
                            <div className='buttons btn-group'>
                                <button className='fast-backword btn btn-default' disabled={true}>
                                    <i className='icon-fast-bw'></i>
                                </button>
                                <button className='reverse btn btn-default' disabled={true}>
                                    <i className='icon-play'></i>
                                </button>
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
                                {!this.state.playing ?
                                    <button className='play btn btn-default'
                                        onClick={() => {
                                            this.setState({ playing: true, videoPlaying: true });
                                        }}
                                        disabled={playDisabled}>
                                        <i className='icon-play'></i>
                                    </button> :
                                    <button className='pause btn btn-default' onClick={() => {
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
                                <button className='fast-forward btn btn-default' disabled={true}>
                                    <i className='icon-fast-fw'></i>
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
                                            this.setState({ videoPlaying: true })
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
                        </div>]
                    }
                </div>
            </div>
        </div>
    }

    getAnnotationForAFrame(frame) {
        if (!this.props.annotationGeometryContainer ||
            !this.props.annotationActivityContainer ||
            !this.props.annotationTrackContainer) {
            return;
        }
        var annotationGeometries = this.props.annotationGeometryContainer.getFrame(frame);
        if (!annotationGeometries) {
            return;
        }
        var data = annotationGeometries.filter((geometry) => {
            return this.props.annotationTrackContainer.getEnableState(geometry.id1);
        }).map((geometry) => {
            var activities = this.props.annotationActivityContainer.getEnabledActivities(geometry.id1, frame);
            var type = activities ? 'activity' : 'track';
            return {
                g0: geometry.g0,
                type
            }
        });
        var style = {
            fill: true,
            fillColor(d) {
                return { r: 1.0, g: 0.839, b: 0.439 };
            },
            fillOpacity(a, b, d) {
                return d.type === 'activity' ? 0.4 : 0;
            },
            radius: 5.0,
            stroke: true,
            strokeColor: { r: 0.851, g: 0.604, b: 0.0 },
            strokeWidth: 1.25,
            strokeOpacity: 0.8,
            uniform: true
        }
        return [data, style];
    }
}
export default Viewer;