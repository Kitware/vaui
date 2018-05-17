import _ from 'underscore';
import Backbone from 'backbone';
import geo from 'geojs';
import { getApiRoot, restRequest } from 'girder/rest';

class GeoJSViewer {
    constructor(settings) {
        _.extend(this, Backbone.Events);
        this._syncWithVideo = this._syncWithVideo.bind(this);

        this._destroyed = false;
        this.el = settings.el;
        this.folder = settings.folder;
        this.getAnnotation = settings.getAnnotation;
        this.getTrackTrails = settings.getTrackTrails;
        this.editMode = settings.editMode;
        this._showTrackTrail = settings.showTrackTrail;
        this._playbackRate = settings.playbackRate;
        this._frameLimit = settings.frameLimit;
        this._viewerClickHandle = null;
        this._video = null;
        this._viewer = null;
        this._frame = Math.max(0, this._frameLimit[0], settings.startFrame);
        this._maxFrame = 0;
        this._videoFPS = 0;
        this._playing = false;
        this._updating = false;
        this.pendingFrame = null;
        this.editEnabled = false;
        this.detectionFeature = null;
        this.trackTrailFeature = null;
        this.trackTrailTruthPointFeature = null;
    }

    initialize() {
        restRequest({
            type: 'GET',
            url: 'item/',
            data: {
                folderId: this.folder._id,
                name: 'video.mp4'
            }
        }).then(([videoItem]) => {

            this._videoFPS = this.folder.meta.vaui.frameRate;
            var params = geo.util.pixelCoordinateParams(
                this.el, this.folder.meta.vaui.width, this.folder.meta.vaui.height, this.folder.meta.vaui.width, this.folder.meta.vaui.height);

            var video = document.createElement('video');
            video.playbackRate = this._playbackRate;
            video.preload = 'auto';
            this._video = video;
            video.src = `${getApiRoot()}/item/${videoItem._id}/download?contentDisposition=inline`;

            video.onstalled = (e) => {
                console.log('stalled');
                this.stop();
            };

            video.onsuspend = (e) => {
                console.log('suspend');
            };

            return new Promise((resolve, reject) => {
                video.onloadeddata = () => {
                    video.onloadeddata = null;
                    if (this._destroyed) {
                        resolve();
                        return;
                    }
                    this._viewer = geo.map(params.map);

                    // change from our default of only allowing to zoom to 1 pixel is 1 pixel
                    // to allow 1 pixel to be 8x8.
                    this._viewer.zoomRange({ min: this._viewer.zoomRange().origMin, max: this._viewer.zoomRange().max + 3 });

                    this._quadFeatureLayer = this._viewer.createLayer('feature', {
                        features: ['quad.video']
                    });

                    this.featureLayer = this._viewer.createLayer('feature', {
                        features: ['point', 'line', 'polygon']
                    });
                    this.annotationLayer = this._viewer.createLayer('annotation', {
                        annotations: ['point', 'line', 'rectangle', 'polygon'],
                        showLabels: false
                    });

                    this.detectionFeature = this.featureLayer.createFeature('polygon', { selectionAPI: true }).geoOn(geo.event.feature.mouseclick, (e) => {
                        clearTimeout(this._viewerClickHandle);
                        if (e.mouse.buttonsDown.left) {
                            this.trigger('detectionLeftClick', e.data);
                        } else if (e.mouse.buttonsDown.right) {
                            this.trigger('detectionRightClick', e.data);
                        }
                    });
                    this.detectionFeature.geoOn(
                        geo.event.feature.mouseclick_order,
                        this.detectionFeature.mouseOverOrderClosestBorder
                    );
                    this.trackTrailFeature = this.featureLayer.createFeature('line', { selectionAPI: true }).geoOn(geo.event.feature.mouseclick, (e) => {
                        clearTimeout(this._viewerClickHandle);
                        if (e.mouse.buttonsDown.left) {
                            this.trigger('trackTrailClick', e.data.trackId);
                        }
                        if (e.mouse.buttonsDown.right) {
                            this.trigger('trackTrailRightClick', e.data.trackId);
                        }
                    });
                    this.trackTrailTruthPointFeature = this.featureLayer.createFeature('point', { selectionAPI: true }).geoOn(geo.event.feature.mouseclick, (e) => {
                        if (e.mouse.buttonsDown.left) {
                            this.trigger('trackTrailTruthPointClick', e.data.trackId, e.data.point[2]);
                        }
                    });

                    var interactorOpts = this._viewer.interactor().options();
                    interactorOpts.keyboard.focusHighlight = false;
                    interactorOpts.keyboard.actions = {};
                    interactorOpts.actions = [
                        interactorOpts.actions[0],
                        interactorOpts.actions[2],
                        interactorOpts.actions[6],
                        interactorOpts.actions[7],
                        interactorOpts.actions[8]
                    ];
                    this._viewer.interactor().options(interactorOpts);

                    this._viewer.geoOn(geo.event.mouseclick, (e) => {
                        this._viewerClickHandle = setTimeout(() => {
                            if (e.buttonsDown.left) {
                                this.trigger('viewerLeftClick');
                            }
                            if (e.buttonsDown.right) {
                                this.trigger('viewerRightClick');
                            }
                        }, 0);
                    });

                    var quads = this._quadFeatureLayer.createFeature('quad').data([{
                        ul: { x: 0, y: 0 },
                        lr: { x: this.folder.meta.vaui.width, y: this.folder.meta.vaui.height },
                        video: video
                    }]).draw();

                    this._updateFrame(this._frame);

                    this._maxFrame = Math.min(this._frameLimit[1], Math.round(this._videoFPS * video.duration));

                    this.trigger('ready');
                    this.trigger('progress', this._frame, this._maxFrame);
                    return resolve();
                };
            });
        });
    }

    _syncWithVideo() {
        if (this._playing) {
            var frame = Math.round(this._video.currentTime * this._videoFPS);
            if (frame > this._maxFrame) {
                this.stop();
                frame = this._maxFrame;
            }
            this._frame = frame;
            this.trigger('progress', this._frame, this._maxFrame);
            this._drawAnnotation(this._frame);
            this._viewer.scheduleAnimationFrame(this._syncWithVideo);
        }
    }

    _updateFrame(frame) {
        this._updating = true;
        return new Promise((resolve, reject) => {
            this._video.currentTime = this._frame / this._videoFPS;
            // console.time();
            this._video.onseeked = (e) => {
                // console.timeEnd();
                this._video.onseeked = undefined;
                this._quadFeatureLayer.renderer()._renderFrame();
                this._drawAnnotation(frame);
                resolve();
                this._updating = false;
            }
        });
    }

    play() {
        if (!this._playing) {
            this._playing = true;
            this._video.play();
            this._video.onpause = () => {
                this.stop();
            }
            this._syncWithVideo();
        }
    }

    stop() {
        if (!this._video.paused) {
            this._video.pause();
        }
        this._video.onpause = null;
        this._playing = false;
        this.trigger('pause');
    }

    setFrame(newFrame) {
        if (this._playing) {
            return;
        }
        if (newFrame >= 0 && newFrame <= this._maxFrame) {
            if (!this._updating) {
                this._frame = newFrame;
                this._video.currentTime = newFrame / this._videoFPS;
                this._updateFrame(this._frame)
                    .then(() => {
                        if (this.pendingFrame !== null) {
                            this.setFrame(this.pendingFrame);
                            this.pendingFrame = null;
                        } else {
                            this.trigger('progress', this._frame, this._maxFrame);
                        }
                        return undefined;
                    });
            } else {
                this.pendingFrame = newFrame;
            }
        }
    }

    _annotationChanged(annotation) {
        var coordinates = annotation.coordinates();
        var g0 = [[Math.round(coordinates[0]['x']), Math.round(coordinates[0]['y'])], [Math.round(coordinates[2]['x']), Math.round(coordinates[2]['y'])]];
        this.annotationLayer.removeAllAnnotations(true);
        this.trigger('rectangleDrawn', g0);
    }

    edit(enabled) {
        if (this.editEnabled === enabled) {
            return;
        }
        var layer = this.annotationLayer;
        if (enabled) {
            if (this.editMode === 'edit') {
                layer.options('clickToEdit', true);
                // If there is an detection for current frame, change it to edit mode directly
                if (layer.annotations().length === 1) {
                    layer.mode('edit', layer.annotations()[0]);
                }
                layer.geoOn(geo.event.annotation.state, (e) => {
                    if (e.annotation.state() === 'done') {
                        this._annotationChanged(e.annotation);
                    }
                });
            } else if (this.editMode === 'draw') {
                layer.mode('rectangle');
                layer.annotations().slice(-1)[0].mouseClick = function () { };
                layer.geoOn(geo.event.annotation.state, (e) => {
                    this._annotationChanged(e.annotation);
                });
                layer.geoOn(geo.event.annotation.mode, (e) => {
                    if (e.mode === null && e.oldMode === 'rectangle') {
                        layer.mode('rectangle');
                        layer.annotations().slice(-1)[0].mouseClick = function () { };
                    }
                });
            }
        } else {
            layer.options('clickToEdit', false);
            layer.geoOff(geo.event.annotation.state);
            layer.geoOff(geo.event.annotation.mode);
            layer.mode(null);
        }
        this.annotationLayer.draw();
        this.editEnabled = enabled;
    }

    setEditMode(mode) {
        this.editMode = mode;
        if (!this.editEnabled) {
            return;
        } else {
            this.edit(false);
            this.edit(true);
        }
    }

    showTrackTrail(showTrackTrail) {
        this._showTrackTrail = showTrackTrail;
        if (!this._playing) {
            this._drawAnnotation(this._frame);
        }
    }

    _drawAnnotation(frame) {
        this.annotationLayer.removeAllAnnotations(true);
        this.annotationLayer.mode(null);
        var result = this.getAnnotation(frame);
        if (!result) {
            return;
        }
        var { data, style, editingTrackId, editingStyle } = result;

        this.detectionFeature.data(data)
            .polygon((d) => {
                var g0 = d.detection.g0;
                return {
                    outer: [{ x: g0[0][0], y: g0[0][1] },
                    { x: g0[1][0], y: g0[0][1] },
                    { x: g0[1][0], y: g0[1][1] },
                    { x: g0[0][0], y: g0[1][1] }]
                };
            })
            .style(style)
            .draw();

        var record = data.find((record) => { return record.detection.id1 === editingTrackId });
        if (record) {
            var g0 = record.detection.g0;
            editingStyle.strokeWidth = record.detection.src !== 'truth' ? 1 : 2.5;
            editingStyle.strokeOpacity = record.detection.src !== 'truth' ? 0.7 : 0.9;
            var rect = geo.annotation.rectangleAnnotation({
                corners: [{ x: g0[0][0], y: g0[0][1] }, { x: g0[1][0], y: g0[0][1] }, { x: g0[1][0], y: g0[1][1] }, { x: g0[0][0], y: g0[1][1] }],
                style: editingStyle,
                editHandleStyle: {
                    rotateHandleOffset: 99999
                }
            });
            this.annotationLayer.addAnnotation(rect);
            this.annotationLayer.draw();
        }
        if (this._showTrackTrail) {
            result = this.getTrackTrails(frame);
            var { trackTrails, trackTrailStyle, trackTrailTruthPoints, trackTrailTruthPointStyle } = result;
            this.trackTrailFeature.data(trackTrails)
                .line((d) => d.line)
                .style(trackTrailStyle)
                .position(function (d, index, d2, index2) {
                    return { x: d[0], y: d[1] };
                })
                .rdpSimplifyData(undefined, 1.5)
                .draw();

            this.trackTrailTruthPointFeature.data(trackTrailTruthPoints)
                .style(trackTrailTruthPointStyle)
                .position(function (d, index, d2, index2) {
                    return { x: d.point[0], y: d.point[1] };
                })
                .draw();
        } else {
            this.trackTrailFeature.data([]).draw();
            this.trackTrailTruthPointFeature.data([]).draw();
        }
    }

    setPlaybackRate(playbackRate) {
        this._playbackRate = playbackRate;
        this._video.playbackRate = playbackRate;
    }

    zoomTo(g0) {
        var { center, zoom } = this._viewer.zoomAndCenterFromBounds({
            left: g0[0][0],
            right: g0[1][0],
            top: g0[1][1],
            bottom: g0[0][1]
        });
        this._viewer.zoom(zoom);
        this._viewer.center(center);
    }

    redrawAnnotation() {
        if (this._viewer) {
            this._drawAnnotation(this._frame);
        } else {
            clearTimeout(this.redrawHandle);
            this.redrawHandle = setTimeout(() => {
                this.redrawAnnotation();
            }, 100);
        }
    }

    destroy() {
        this._destroyed = true;
        if (this._viewer) {
            this._viewer.exit();
        }
    }
}

export default GeoJSViewer;
