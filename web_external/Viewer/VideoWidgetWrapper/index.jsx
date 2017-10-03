import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import NativeVideoWidget from '../../views/widget/NativeVideoWidget';

class VideoWidgetWrapper extends Component {
    constructor(props) {
        super(props);
        this.nativeVideoWidget = false;
    }
    shouldComponentUpdate() {
        return false;
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.playing !== nextProps.playing) {
            if (nextProps.playing) {
                this.nativeVideoWidget.play();
            } else {
                this.nativeVideoWidget.pause();
            }
        }
        if (this.props.currentTime !== nextProps.currentTime) {
            this.nativeVideoWidget.setTime(nextProps.currentTime);
        }
    }
    componentDidMount() {
        this.nativeVideoWidget = new NativeVideoWidget({
            parentView: null,
            el: ReactDOM.findDOMNode(this),
            model: this.props.fileModel,
            onPause: () => {
                if (this.props.onPause) {
                    this.props.onPause();
                }
            },
            onProgress: (currentTime, duration) => {
                if (this.props.onProgress) {
                    this.props.onProgress(currentTime, duration);
                }
            }
        })
            .render();
    }
    render() {
        return <div className={this.props.className}></div>;
    }
}

export default VideoWidgetWrapper;
