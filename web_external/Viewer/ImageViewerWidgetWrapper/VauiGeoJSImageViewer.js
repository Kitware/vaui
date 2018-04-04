import GeojsImageViewerWidget from 'girder_plugins/large_image/views/imageViewerWidget/geojs';
import ItemCollection from 'girder/collections/ItemCollection';

var VauiGeoJSImageViewer = GeojsImageViewerWidget.extend({
    initialize(settings) {
        GeojsImageViewerWidget.prototype.initialize.apply(this, arguments);
        this.getAnnotation = settings.getAnnotation;
        this.getAvailableTrackTrails = settings.getAvailableTrackTrails;
        this._annotationLeftClick = null;
        this._annotationRightClick = null;
        this.pendingFrame = null;
        this.editEnabled = false;
        this.editMode = settings.editMode;
    },

    render() {
        GeojsImageViewerWidget.prototype.render.call(this);
        var map = this.viewer;
        var interactorOpts = map.interactor().options();
        interactorOpts.keyboard.focusHighlight = false;
        interactorOpts.keyboard.actions = {};
        interactorOpts.actions = [
            interactorOpts.actions[0],
            interactorOpts.actions[2],
            interactorOpts.actions[6],
            interactorOpts.actions[7],
            interactorOpts.actions[8]
        ];
        map.interactor().options(interactorOpts);
        var ids = null;
        var siblings = new ItemCollection();
        siblings.pageLimit = 0;
        siblings.fetch({ folderId: this.model.get('folderId') })
            .done(() => {
                ids = siblings
                    .toArray()
                    .filter((itemModel) => itemModel.get('largeImage'))
                    .map((model) => model.id);

                // change from our default of only allowing to zoom to 1 pixel is 1 pixel
                // to allow 1 pixel to be 8x8.
                map.zoomRange({ min: map.zoomRange().origMin, max: map.zoomRange().max + 3 });
                // we start with one osm (tile) layer.  Get a reference to it.
                var l1 = map.layers()[0];
                // create a second osm layer.  We use these as A-B buffers.  We start with
                // them being identical
                var l2 = map.createLayer('osm', l1._options);
                l1.zIndex(9);
                l1.moveToBottom();
                var frame = 0;
                var playing = false;
                var pendingNext = false;

                var updateFrame = (frame) => {
                    this._updating = true;
                    return new Promise((resolve, reject) => {
                        map.onIdle(() => {
                            // set our bottom tile layer to the new url.  We can control the
                            // format and size by adding query parameters.  For example,
                            //  'encoding=PNG'
                            //  'encoding=JPEG&jpegQuality=70&jpegSubsampling=2'
                            var url = 'api/v1/item/' + ids[frame] + '/tiles/zxy/{z}/{x}/{y}?encoding=PNG&redirect=encoding';
                            l1.url(url);
                            // encoding could also be PNG
                            map.onIdle(() => {
                                // onIdle is called when all of our tiles are loaded.  Move the
                                // back layer to the top and swap our layer references
                                this._drawAnnotation(frame);
                                var l1zIndex = l1.zIndex();
                                l1.zIndex(l2.zIndex(), true);
                                l2.zIndex(l1zIndex);
                                var ltemp = l1; l1 = l2; l2 = ltemp;

                                resolve();
                                this._updating = false;
                            });
                        });
                    });
                };

                var next = () => {
                    if (this.pendingFrame !== null) {
                        frame = this.pendingFrame;
                        this.pendingFrame = null;
                    }
                    // wait until we are done loading.  Unless there is manual
                    // intervention, this should get called immediately
                    if (++frame >= ids.length - 1) {
                        frame = 0;
                        this.trigger('pause');
                    } else {
                        pendingNext = true;
                        updateFrame(frame)
                            .then(() => {
                                pendingNext = false;
                                if (this.pendingFrame === null) {
                                    this.trigger('progress', frame, ids.length);
                                }
                                // if we haven't asked to stop, go to the next frame as soon as
                                // possible.
                                if (playing || this.pendingFrame) {
                                    next();
                                }
                                return undefined;
                            });
                    }
                };

                this.stop = () => {
                    playing = false;
                };

                this.play = () => {
                    if (!playing) {
                        playing = true;
                        if (!pendingNext) {
                            next();
                        }
                    }
                };

                this.setFrame = (newFrame) => {
                    if (playing) {
                        return;
                    }
                    if (newFrame >= 0 && newFrame <= ids.length - 1) {
                        if (!this._updating) {
                            frame = newFrame;
                            updateFrame(frame)
                                .then(() => {
                                    if (this.pendingFrame !== null) {
                                        this.setFrame(this.pendingFrame);
                                        this.pendingFrame = null;
                                    } else {
                                        this.trigger('progress', frame, ids.length);
                                    }
                                    return undefined;
                                });
                        } else {
                            this.pendingFrame = newFrame;
                        }
                    }
                };

                var annotationChanged = (annotation) => {
                    var coordinates = annotation.coordinates();
                    var g0 = [[Math.round(coordinates[0]['x']), Math.round(coordinates[0]['y'])], [Math.round(coordinates[2]['x']), Math.round(coordinates[2]['y'])]];
                    this.annotationLayer.removeAllAnnotations(true);
                    this.trigger('rectangleDrawn', g0);
                };

                this.edit = (enabled) => {
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
                                    annotationChanged(e.annotation);
                                }
                            });
                        } else if (this.editMode === 'draw') {
                            layer.mode('rectangle');
                            layer.annotations().slice(-1)[0].mouseClick = function () { };
                            layer.geoOn(geo.event.annotation.state, (e) => {
                                annotationChanged(e.annotation);
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
                };

                this.setEditMode = (mode) => {
                    this.editMode = mode;
                    if (!this.editEnabled) {
                        return;
                    } else {
                        this.edit(false);
                        this.edit(true);
                    }
                }

                this._drawAnnotation = (frame) => {
                    if (this.lastFeature) {
                        this.featureLayer.deleteFeature(this.lastFeature);
                        this.featureLayer.deleteFeature(this.lastLineFeature);
                    }
                    this.annotationLayer.removeAllAnnotations(true);
                    this.annotationLayer.mode(null);
                    var result = this.getAnnotation(frame);
                    if (!result) {
                        return;
                    }
                    var { data, style, editingTrackId, editingStyle } = result;
                    var feature = this.featureLayer.createFeature('polygon', { selectionAPI: true })
                        .data(data)
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
                        .geoOn(geo.event.feature.mouseclick, (e) => {
                            if (e.mouse.buttonsDown.left) {
                                this._triggerAnnotationLeftClickEvent(e.data);
                            } else if (e.mouse.buttonsDown.right) {
                                this._triggerAnnotationRightClickEvent(e.data);
                            }
                        });
                    this.lastFeature = feature;
                    var record = data.find((record) => { return record.detection.id1 === editingTrackId });
                    if (record) {
                        var g0 = record.detection.g0;
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

                    var { trackTrails, style } = this.getAvailableTrackTrails(frame);
                    var lineFeature = this.featureLayer.createFeature('line')
                        .data(trackTrails)
                        .line((d) => d.line)
                        .style(style)
                        .position(function (d, index, d2, index2) {
                            return { x: d[0], y: d[1] };
                        });

                    this.lastLineFeature = lineFeature;

                    this.viewer.draw();
                };

                map.geoOn(geo.event.mouseclick, (e) => {
                    if (e.buttonsDown.left) {
                        this._triggerAnnotationLeftClickEvent();
                    }
                    if (e.buttonsDown.right) {
                        this._triggerAnnotationRightClickEvent();
                    }
                });

                this._triggerAnnotationLeftClickEvent = (annotation) => {
                    this._annotationLeftClick = annotation ? annotation : null;
                    clearTimeout(this._annotationEventHandle);
                    this._annotationEventHandle = setTimeout(() => {
                        this.trigger('annotationLeftClick', this._annotationLeftClick);
                    }, 0);
                };

                this._triggerAnnotationRightClickEvent = (annotation) => {
                    this._annotationRightClick = annotation || null;
                    clearTimeout(this._annotationRightClickHandle);
                    this._annotationRightClickHandle = setTimeout(() => {
                        this.trigger('annotationRightClick', this._annotationRightClick);
                    }, 0);
                };

                this._redrawAnnotation = () => {
                    this._drawAnnotation(frame);
                };

                this.zoomTo = (g0) => {
                    var { center, zoom } = this.viewer.zoomAndCenterFromBounds({
                        left: g0[0][0],
                        right: g0[1][0],
                        top: g0[1][1],
                        bottom: g0[0][1]
                    });
                    this.viewer.zoom(zoom);
                    this.viewer.center(center);
                };

                updateFrame(frame);

                this.trigger('ready');
                this.trigger('progress', frame, ids.length);
            });
    },

    redrawAnnotation() {
        if (this._redrawAnnotation) {
            this._redrawAnnotation();
        }
    }
});
export default VauiGeoJSImageViewer;
