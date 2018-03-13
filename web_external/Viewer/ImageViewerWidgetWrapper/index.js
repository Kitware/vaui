import React, { Component } from 'react';
import ItemModel from 'girder/models/ItemModel';
import mousetrap from 'mousetrap';

import VauiGeoJSImageViewer from './VauiGeoJSImageViewer';

class ImageViewerWidgetWrapper extends Component {
    mode = 'add'

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
        if (this.props.editMode !== nextProps.editMode) {
            this.geojsViewer.setEditMode(nextProps.editMode);
        }
        // redraw redrawAnnotation() to happen before call edit() because the latter uses the result of the former some time
        if (this.props.detectionContainer !== nextProps.detectionContainer ||
            this.props.annotationActivityContainer !== nextProps.annotationActivityContainer ||
            this.props.selectedTrackId !== nextProps.selectedTrackId ||
            this.props.selectedActivityId !== nextProps.selectedActivityId ||
            this.props.editingTrackId !== nextProps.editingTrackId) {
            this.geojsViewer.redrawAnnotation();
        }
        if (this.props.editingTrackId !== nextProps.editingTrackId) {
            this.geojsViewer.edit(nextProps.editingTrackId !== null);
        }
    }

    componentDidMount() {
        this.geojsViewer = new VauiGeoJSImageViewer({
            parentView: null,
            el: this.container,
            itemId: this.props.item._id,
            model: new ItemModel(this.props.item),
            getAnnotation: this.props.getAnnotation,
            editMode: this.props.editMode
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
        }).on('rectangleDrawn', (g0) => {
            this.props.rectangleDrawn(g0);
        });
        mousetrap.bind(['del', 'backspace', 'alt+d', 'command+d'], () => {
            if (this.props.editingTrackId !== null) {
                this.props.deleteAnnotation();
            }
        });
    }

    componentWillUnmount() {
        this.geojsViewer.destroy();
        mousetrap.unbind(['del', 'backspace', 'alt+d', 'command+d']);
    }

    render() {
        return <div ref={(container) => { this.container = container; }} className={['v-viewer-wrapper', this.props.className].join(' ')}></div>;
    }
}
export default ImageViewerWidgetWrapper;
