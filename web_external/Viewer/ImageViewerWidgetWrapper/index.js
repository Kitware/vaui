import React, { Component } from 'react';
import ItemModel from 'girder/models/ItemModel';
import mousetrap from 'mousetrap';

import VauiGeoJSImageViewer from './VauiGeoJSImageViewer';

class ImageViewerWidgetWrapper extends Component {
    trapCatch = null

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
            this.props.selectedTrackId !== nextProps.selectedTrackId ||
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
        this.trapCatch = mousetrap(this.container).bind('del', () => console.error('DELETE Not implemented'));
    }

    componentWillUnmount() {
        this.geojsViewer.destroy();
        this.trapCatch.unbind('del');
    }

    render() {
        return <div ref={(container) => { this.container = container; }} className={['v-viewer-wrapper', this.props.className].join(' ')}></div>;
    }
}
export default ImageViewerWidgetWrapper;
