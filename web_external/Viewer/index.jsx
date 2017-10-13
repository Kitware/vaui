import React, { Component } from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
// import FileModel from 'girder/models/FileModel';
import events from 'girder/events';

import ImageViewerWidgetWrapper from './ImageViewerWidgetWrapper';

import './style.styl';

class Viewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            videoPlaying: false,
            videoCurrentFrame: 0,
            sliderMax: 100,
            itemModel: null
        };
        this.draggingSlider = false;
    }
    componentDidMount() {
        events.on('v:item_selected', (itemModel) => {
            this.setState({ ready: false, itemModel });
        })
    }
    componentDidUpdate(prevProps, prevState) {
    }
    render() {
        return <div className={['v-viewer', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-body'>
                    {this.state.itemModel &&
                        [<ImageViewerWidgetWrapper className='video'
                            itemModel={this.state.itemModel}
                            playing={this.state.videoPlaying}
                            currentFrame={this.state.videoCurrentFrame}
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
                                        sliderMax: numberOfFrames,
                                        videoCurrentFrame: currentFrame
                                    });
                                }
                            }}
                            onReady={() => {
                                this.setState({
                                    ready: true
                                });
                            }} key={this.state.itemModel.id} />,
                        <div className='control' key='control'>
                            <div className='buttons btn-group'>
                                <button className='fast-backword btn btn-default'>
                                    <i className='icon-fast-bw'></i>
                                </button>
                                <button className='reverse btn btn-default'>
                                    <i className='icon-play'></i>
                                </button>
                                <button className='previous-frame btn btn-default' disabled={!this.state.ready}
                                    onClick={() => {
                                        this.setState({
                                            playing: false,
                                            videoPlaying: false,
                                            videoCurrentFrame: this.state.videoCurrentFrame - 1
                                        });
                                    }}>
                                    <i className='icon-to-start'></i>
                                </button>
                                {!this.state.playing ?
                                    <button className='play btn btn-default'
                                        onClick={() => {
                                            this.setState({ playing: true, videoPlaying: true });
                                        }}
                                        disabled={!this.state.ready}>
                                        <i className='icon-play'></i>
                                    </button> :
                                    <button className='pause btn btn-default' onClick={() => {
                                        this.setState({ playing: false, videoPlaying: false });
                                    }}>
                                        <i className='icon-pause'></i>
                                    </button>}
                                <button className='next-frame btn btn-default'
                                    disabled={!this.state.ready}
                                    onClick={() => {
                                        this.setState({
                                            playing: false,
                                            videoPlaying: false,
                                            videoCurrentFrame: this.state.videoCurrentFrame + 1
                                        });
                                    }}>
                                    <i className='icon-to-end'></i>
                                </button>
                                <button className='fast-forward btn btn-default'>
                                    <i className='icon-fast-fw'></i>
                                </button>
                            </div>
                            <ReactBootstrapSlider
                                value={this.state.videoCurrentFrame}
                                max={this.state.sliderMax}
                                tooltip='hide'
                                disabled={this.state.ready ? 'enabled' : 'disabled'}
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
                        </div>]
                    }
                </div>
            </div>
        </div>
    }
}
export default Viewer;
