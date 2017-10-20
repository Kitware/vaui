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
            itemModel: null,
            annotationFrames: null,
            ready: false
        };
        this.draggingSlider = false;
    }
    componentDidMount() {
        events.on('v:item_selected', (itemModel) => {
            this.setState({ ready: true, itemModel });
            // This is a workaround for react bootstrap slider disabled at init but
            setTimeout(() => this.setState({ ready: false }), 0);
            restRequest({
                url: '/item',
                data: {
                    folderId: itemModel.get('folderId'),
                    name: 'annotation.json'
                }
            }).then((items) => {
                return restRequest({
                    contentType: "application/json",
                    url: `/item/${items[0]._id}/download`,
                    dataType: 'json'
                });
            })
                .then((annotationFrames) => {
                    this.setState({ annotationFrames });
                }).catch(() => {
                    events.trigger('g:alert', {
                        icon: 'ok',
                        text: 'Didn\'t find annotation.json file',
                        type: 'danger',
                        timeout: 4000
                    });
                    this.setState({ annotationFrames: [] })
                });
        });

    }
    render() {
        var playDisabled = !this.state.ready;
        return <div className={['v-viewer', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-body'>
                    {this.state.itemModel &&
                        [<ImageViewerWidgetWrapper className='video'
                            itemModel={this.state.itemModel}
                            playing={this.state.videoPlaying}
                            annotationFrames={this.state.annotationFrames}
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
                            key={this.state.itemModel.id} />,
                        <div className='no-annotation-message' key='no-annotation-message'>{this.state.annotationFrames && this.state.annotationFrames.length === 0 && <span>No annotation</span>}
                        </div>,
                        <div className='control' key='control'>
                            <div className='buttons btn-group'>
                                <button className='fast-backword btn btn-default'>
                                    <i className='icon-fast-bw'></i>
                                </button>
                                <button className='reverse btn btn-default'>
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
                                <button className='fast-forward btn btn-default'>
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
        if (!this.state.annotationFrames) {
            return;
        }
        var featureCollection = this.state.annotationFrames[frame];
        if (!featureCollection) {
            return;
        }
        var data = featureCollection.features.map((feature) => {
            var coord = feature.geometry.coordinates[0];
            var type = Math.random() < 0.5 ? 'a' : 'b';
            return {
                coord,
                type
            }
        });
        var style = {
            fill: true,
            fillColor(d) {
                return { r: 1.0, g: 0.839, b: 0.439 };
            },
            fillOpacity(a, b, d) {
                return d.type === 'a' ? 0 : 0.4;
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
