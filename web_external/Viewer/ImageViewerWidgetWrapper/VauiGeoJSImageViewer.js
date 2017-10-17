import GeojsImageViewerWidget from 'girder_plugins/large_image/views/imageViewerWidget/geojs';
import ItemCollection from 'girder/collections/ItemCollection';

var VauiGeoJSImageViewer = GeojsImageViewerWidget.extend({

    render() {
        GeojsImageViewerWidget.prototype.render.call(this);
        var map = this.viewer;
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
                            var url = 'api/v1/item/' + ids[frame] + '/tiles/zxy/{z}/{x}/{y}?encoding=JPEG&jpegQuality=50';
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
                }

                var next = () => {
                    if (this.pendingFrame) {
                        frame = this.pendingFrame;
                        this.pendingFrame = null;
                    }
                    // wait until we are done loading.  Unless there is manual
                    // intervention, this should get called immediately
                    if (++frame >= ids.length - 1) {
                        frame = 0;
                        this.trigger('pause');
                    }
                    else {
                        pendingNext = true;
                        updateFrame(frame)
                            .then(() => {
                                pendingNext = false;
                                if (!this.pendingFrame) {
                                    this.trigger('progress', frame, ids.length);
                                }
                                // if we haven't asked to stop, go to the next frame as soon as
                                // possible.
                                if (playing) {
                                    next();
                                }
                            });
                    }
                }


                this.stop = () => {
                    playing = false;
                }

                this.play = () => {
                    if (!playing) {
                        playing = true;
                        if (!pendingNext) {
                            next();
                        }
                    }
                }

                this.setFrame = (newFrame) => {
                    if (playing) {
                        return;
                    }
                    if (newFrame >= 0
                        && newFrame <= ids.length - 1) {
                        if (!this._updating) {
                            frame = newFrame;
                            updateFrame(frame)
                                .then(() => {
                                    if (this.pendingFrame) {
                                        this.setFrame(this.pendingFrame);
                                        this.pendingFrame = null;
                                    }
                                    else {
                                        this.trigger('progress', frame, ids.length);
                                    }
                                });
                        }
                        else {
                            this.pendingFrame = newFrame;
                        }
                    }
                }

                this._drawAnnotation = (frame) => {
                    if (!this.annotationFrames) {
                        return;
                    }
                    if (this.lastFeatureFrame) {
                        this.featureLayer.deleteFeature(this.lastFeatureFrame);
                    }
                    var annotationFrame = this.annotationFrames[frame];
                    // Only needed if the frames of image and annotation has difference
                    if (!annotationFrame) {
                        return;
                    }
                    var feature = this.featureLayer.createFeature('polygon');
                    feature.data(annotationFrame.features);
                    feature.polygon((d) => {
                        var coord = d.geometry.coordinates[0];
                        return {
                            outer: [{ x: coord[0][0], y: coord[0][1] },
                            { x: coord[1][0], y: coord[1][1] },
                            { x: coord[2][0], y: coord[2][1] },
                            { x: coord[3][0], y: coord[3][1] }]
                        }
                    });
                    feature.style({
                        fill: true,
                        fillColor: { r: 1.0, g: 0.839, b: 0.439 },
                        fillOpacity: 0.4,
                        radius: 5.0,
                        stroke: true,
                        strokeColor: { r: 0.851, g: 0.604, b: 0.0 },
                        strokeWidth: 1.25,
                        strokeOpacity: 0.8
                    });
                    this.lastFeatureFrame = feature;
                    this.viewer.draw();
                }

                this.setAnnotationFrames = (annotationFrames) => {
                    this.annotationFrames = annotationFrames;
                    this._drawAnnotation(frame);
                }

                updateFrame(frame);

                this.trigger('ready');
                this.trigger('progress', frame, ids.length);
            });

    }
});
export default VauiGeoJSImageViewer;
