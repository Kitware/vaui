import React, { Component } from 'react';
import ItemModel from 'girder/models/ItemModel';

import VauiGeoJSImageViewer from './VauiGeoJSImageViewer';

class ImageViewerWidgetWrapper extends Component {
    shouldComponentUpdate() { // eslint-disable-line
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
        if (this.props.geometryCotnainer !== nextProps.geometryCotnainer ||
            this.props.annotationActivityContainer !== nextProps.annotationActivityContainer ||
            this.props.annotationTrackContainer !== nextProps.annotationTrackContainer
        ) {
            this.geojsViewer.redrawAnnotation();
        }
    }

    componentDidMount() {
        this.geojsViewer = new VauiGeoJSImageViewer({
            parentView: null,
            el: this.container,
            itemId: this.props.item._id,
            model: new ItemModel(this.props.item),
            getAnnotation: this.props.getAnnotation
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
        }).on('annotationsClick', (annotations) => {
            if (this.props.annotationsClick) {
                this.props.annotationsClick(annotations);
            }
        });
    }

    componentWillUnmount() {
        this.geojsViewer.destroy();
    }

    render() {
        return <div ref={(container) => { this.container = container; }} className={['v-viewer-wrapper', this.props.className].join(' ')}></div>;
    }
}
export default ImageViewerWidgetWrapper;
