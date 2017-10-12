
import GeojsImageViewerWidget from 'girder_plugins/large_image/views/imageViewerWidget/geojs';
import ItemCollection from 'girder/collections/ItemCollection';

var VauiGeoJSImageViewer = GeojsImageViewerWidget.extend({

    render() {
        GeojsImageViewerWidget.prototype.render.call(this);
        var map = this.viewer;
        var ids = [this.itemId];
        var siblings = new ItemCollection();
        siblings.pageLimit = 0;
        siblings.fetch({ folderId: this.model.get('folderId') })
            .done(() => {
                siblings.each((model) => {
                    ids.push(model.id);
                });
                console.log('Got ' + ids.length + ' frame ids');

                // change from our default of only allowing to zoom to 1 pixel is 1 pixel
                // to allow 1 pixel to be 8x8.
                map.zoomRange({ min: map.zoomRange().origMin, max: map.zoomRange().max + 3 });
                // we start with one osm (tile) layer.  Get a reference to it.
                var l1 = map.layers()[0];
                // create a second osm layer.  We use these as A-B buffers.  We start with
                // them being identical
                var l2 = map.createLayer('osm', l1._options);
                var frame = 0;
                var stopflag = 1;

                var updateFrame = () => {
                    return new Promise((resolve, reject) => {
                        map.onIdle(() => {

                            // set our bottom tile layer to the new url.  We can control the
                            // format and size by adding query parameters.  For example,
                            //  'encoding=PNG'
                            //  'encoding=JPEG&jpegQuality=70&jpegSubsampling=2'
                            var url = 'api/v1/item/' + ids[frame] + '/tiles/zxy/{z}/{x}/{y}';
                            l1.url(url);
                            // encoding could also be PNG
                            map.onIdle(() => {
                                // onIdle is called when all of our tiles are loaded.  Move the
                                // back layer to the top and swap our layer references
                                var l1zIndex = l1.zIndex();
                                l1.zIndex(l2.zIndex());
                                l2.zIndex(l1zIndex);
                                var ltemp = l1; l1 = l2; l2 = ltemp;

                                this._drawAnnotation(frame);

                                resolve();

                                // log what frame we just showed and when we did it
                                // console.log(frame, (new Date()).valueOf() - start);
                            });
                        });
                    });
                }

                var next = () => {
                    // wait until we are done loading.  Unless there is manual
                    // intervention, this should get called immediately
                    if (++frame >= ids.length) {
                        frame = 0;
                        this.trigger('pause');
                    }
                    else {
                        updateFrame()
                            .then(() => {
                                this.trigger('progress', frame, ids.length);
                                // if we haven't asked to stop, go to the next frame as soon as
                                // possible.
                                if (!stopflag) {
                                    next();
                                }
                            });
                    }
                }


                this.stop = () => {
                    stopflag = 1;
                }

                this.play = () => {
                    if (stopflag) {
                        stopflag = 0;
                        next();
                    }
                }

                this.setFrame = (newFrame) => {
                    if (newFrame >= 0
                        && newFrame <= ids.length - 1) {
                        frame = newFrame;
                        updateFrame()
                            .then(() => {
                                this.trigger('progress', frame, ids.length);
                            });
                    }
                }

                this.trigger('ready');
                this.trigger('progress', frame, ids.length);
            });

        // var layer = map.createLayer('annotation', {
        //     // renderer: query.renderer ? (query.renderer === 'html' ? null : query.renderer) : undefined,
        //     annotations: ['point', 'line', 'rectangle', 'polygon'],
        //     showLabels: false
        // });

        this.setAnnotationFrames = (annotationFrames) => {
            var featureFrames = [];
            this.featureFrames = featureFrames;
            console.log('start reading');
            annotationFrames.forEach((annotationFrame) => {
                window.geo.createFileReader('jsonReader', { layer: this.featureLayer })
                    .read(annotationFrame, (features) => {
                        _.each(features || [], (feature) => {
                            featureFrames.push(feature);
                            feature.visible(false);
                        });
                    });
            });
            console.log('finished reading');
            this.viewer.draw();
        }

        this._drawAnnotation = (frame) => {
            if (this.lastFeatureFrame) {
                this.lastFeatureFrame.visible(false);
            }
            this.lastFeatureFrame = this.featureFrames[frame].visible(true);
            this.viewer.draw();
        }
    }
});
export default VauiGeoJSImageViewer;
