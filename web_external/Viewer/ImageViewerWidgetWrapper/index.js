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
        if (this.props.editingTrackId !== nextProps.editingTrackId) {
            this.geojsViewer.drawingMode(nextProps.editingTrackId !== null);
        }
        if (this.props.geometryCotnainer !== nextProps.geometryCotnainer ||
            this.props.annotationActivityContainer !== nextProps.annotationActivityContainer ||
            this.props.annotationTrackContainer !== nextProps.annotationTrackContainer ||
            this.props.selectedAnnotation !== nextProps.selectedAnnotation ||
            this.props.editingTrackId !== nextProps.editingTrackId
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
        }).on('annotationLeftClick', (annotation) => {
            this.props.annotationLeftClick(annotation);
        }).on('annotationRightClick', (annotation) => {
            this.props.annotationRightClick(annotation);
        }).on('annotationDrawn', (g0) => {
            this.props.annotationDrawn(g0);
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
