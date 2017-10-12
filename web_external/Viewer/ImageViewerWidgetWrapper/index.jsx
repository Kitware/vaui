import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import VauiGeoJSImageViewer from './VauiGeoJSImageViewer';

class ImageViewerWidgetWrapper extends Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.playing !== nextProps.playing) {
            if (nextProps.playing) {
                this.geojsViewer.play();
            } else {
                this.geojsViewer.stop();
            }
        }
        if (this.props.currentFrame !== nextProps.currentFrame) {
            this.geojsViewer.setFrame(nextProps.currentFrame);
        }
        if (this.props.annotationFrames !== nextProps.annotationFrames) {
            this.geojsViewer.setAnnotationFrames(nextProps.annotationFrames)
        }
    }

    componentDidMount() {
        this.geojsViewer = new VauiGeoJSImageViewer({
            parentView: null,
            el: ReactDOM.findDOMNode(this),
            itemId: this.props.itemModel.id,
            model: this.props.itemModel
        }).on('progress', (currentFrame, numberOfFrames) => {
            if (this.props.onProgress) {
                this.props.onProgress(currentFrame, numberOfFrames);
            }
        }).on('pause', () => {
            if (this.props.onPause) {
                this.props.onPause();
            }
        }).on('ready', () => {
            if (this.props.onReady) {
                this.props.onReady();
            }
        });
    }

    componentWillUnmount() {
        this.geojsViewer.destroy();
    }

    render() {
        return <div className={this.props.className}></div>;
    }
}
export default ImageViewerWidgetWrapper;
