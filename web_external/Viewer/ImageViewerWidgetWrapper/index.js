import React, { Component } from 'react';
import mousetrap from 'mousetrap';

import GeoJSViewer from './GeoJSViewer';
import logger from '../../util/logger';

class ImageViewerWidgetWrapper extends Component {
    mode = 'add'

    shouldComponentUpdate() { // eslint-disable-line
        return false;
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.playbackRate !== nextProps.playbackRate) {
            this.geojsViewer.setPlaybackRate(nextProps.playbackRate);
        }
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
        if (this.props.drawingToZoom !== nextProps.drawingToZoom) {
            if (this.props.drawingToZoom) {
                this.geojsViewer.setEditMode('draw');
            }
            this.geojsViewer.edit(nextProps.drawingToZoom);
        }
        if (this.props.zoomRegion !== nextProps.zoomRegion) {
            this.geojsViewer.zoomTo(nextProps.zoomRegion);
        }
        if (this.props.showTrackTrail !== nextProps.showTrackTrail) {
            this.geojsViewer.showTrackTrail(nextProps.showTrackTrail);
        }
    }

    componentDidMount() {
        this.geojsViewer = new GeoJSViewer({
            parentView: null,
            el: this.container,
            folder: this.props.folder,
            getAnnotation: this.props.getAnnotation,
            frameLimit: this.props.frameLimit,
            playbackRate: this.props.playbackRate,
            startFrame: this.props.currentFrame,
            editMode: this.props.editMode,
            getTrackTrails: this.props.getTrackTrails,
            showTrackTrail: this.props.showTrackTrail
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
        }).on('viewerLeftClick', (annotation) => {
            this.props.detectionLeftClick(null);
        }).on('viewerRightClick', (annotation) => {
            this.props.detectionRightClick(null);
        }).on('detectionLeftClick', (annotation) => {
            this.props.detectionLeftClick(annotation);
        }).on('detectionRightClick', (annotation) => {
            this.props.detectionRightClick(annotation);
        }).on('trackTrailClick', (trackId) => {
            this.props.trackTrailClick(trackId);
        }).on('trackTrailRightClick', (trackId) => {
            this.props.trackTrailRightClick(trackId);
        }).on('trackTrailTruthPointClick', (trackId, frame) => {
            this.props.trackTrailTruthPointClick(trackId, frame);
        }).on('rectangleDrawn', (g0) => {
            this.props.rectangleDrawn(g0);
        });
        this.geojsViewer.initialize().then(() => {
            logger.log('video-initializing');
        });
        mousetrap.bind(['del', 'backspace', 'd'], () => {
            if (this.props.editingTrackId !== null) {
                this.props.deleteAnnotation();
            }
        });
    }

    componentWillUnmount() {
        this.geojsViewer.destroy();
        mousetrap.unbind(['del', 'backspace', 'd']);
    }

    render() {
        return <div ref={(container) => { this.container = container; }} className={['v-viewer-wrapper', this.props.className].join(' ')}></div>;
    }
}
export default ImageViewerWidgetWrapper;
