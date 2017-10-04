import React, { Component } from 'react';
import ReactBootstrapSlider from 'react-bootstrap-slider';
import 'bootstrap-slider/dist/css/bootstrap-slider.min.css';
import { restRequest } from 'girder/rest';
import FileModel from 'girder/models/FileModel';
import events from 'girder/events';

import VideoWidgetWrapper from './VideoWidgetWrapper';

import './style.styl';

class Viewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playing: false,
            videoPlaying: false,
            videoCurrentTime: 0,
            sliderMax: 10,
            sliderCurrentValue: 5,
            fileModel: null
        };
        this.draggingSlider = false;

    }
    componentDidMount() {
        events.on('v:item_selected', (itemModel) => {
            restRequest({
                method: 'GET',
                url: `/item/${itemModel.id}/files`
            }).done((files) => {
                this.setState({ fileModel: new FileModel(files[0]) });
            });
        })
    }
    componentDidUpdate(prevProps, prevState) {
    }
    render() {
        return <div className={['v-viewer', this.props.className].join(' ')}>
            <div className='panel panel-default'>
                <div className='panel-heading'><br /></div>
                <div className='panel-body'>
                    {this.state.fileModel &&
                        [<VideoWidgetWrapper className='video'
                            fileModel={this.state.fileModel}
                            playing={this.state.videoPlaying}
                            currentTime={this.state.videoCurrentTime}
                            onPause={() => {
                                if (!this.draggingSlider) {
                                    this.setState({
                                        playing: false,
                                        videoPlaying: false
                                    });
                                }
                            }}
                            onProgress={(currentTime, duration) => {
                                if (!this.draggingSlider) {
                                    this.setState({
                                        sliderMax: parseInt(duration * 100),
                                        sliderCurrentValue: parseInt(currentTime * 100)
                                    });
                                }
                            }} key='video-widget-wrapper' />,
                        <div className='control' key='control'>
                            <div className='buttons'>
                                <button className='fast-backword'>
                                    <i className='icon-fast-bw'></i>
                                </button>
                                <button className='reverse'>
                                    <i className='icon-play'></i>
                                </button>
                                <button className='previous-frame'>
                                    <i className='icon-to-start'></i>
                                </button>
                                {!this.state.playing ?
                                    <button className='play' onClick={() => {
                                        this.setState({ playing: true, videoPlaying: true });
                                    }}>
                                        <i className='icon-play'></i>
                                    </button> :
                                    <button className='pause' onClick={() => {
                                        this.setState({ playing: false, videoPlaying: false });
                                    }}>
                                        <i className='icon-pause'></i>
                                    </button>}
                                <button className='next-frame'>
                                    <i className='icon-to-end'></i>
                                </button>
                                <button className='fast-forward'>
                                    <i className='icon-fast-fw'></i>
                                </button>
                            </div>
                            <ReactBootstrapSlider
                                value={this.state.sliderCurrentValue}
                                max={this.state.sliderMax}
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
                                        videoCurrentTime: e.target.value / 100,
                                        sliderCurrentValue: e.target.value
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
