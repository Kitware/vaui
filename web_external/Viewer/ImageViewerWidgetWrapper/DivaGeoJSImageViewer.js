
import GeoJSImageViewerWidget from 'girder_plugins/large_image/views/imageViewerWidget/geojs';
import ItemCollection from 'girder/collections/ItemCollection';

var DivaGeoJSImageViewer = GeoJSImageViewerWidget.extend({
    render() {
        GeoJSImageViewerWidget.prototype.render.call(this);
        var ids = [this.itemId];
        var siblings = new ItemCollection();
        siblings.pageLimit = 0;
        siblings.fetch({ folderId: this.model.get('folderId') })
            .done(() => {
                siblings.each((model) => {
                    ids.push(model.id);
                });
                console.log('Got ' + ids.length + ' frame ids');

                var map = this.viewer;

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
                            // use this to set the default quary parameters or pull them from a
                            // global for testing.
                            var opts = window.divaopts || '';
                            if (opts) {
                                url += '?' + opts;
                            }
                            l1.url(url);
                            // encoding could also be PNG
                            map.onIdle(() => {
                                // onIdle is called when all of our tiles are loaded.  Move the
                                // back layer to the top and swap our layer references
                                l1.moveToTop();
                                var ltemp = l1; l1 = l2; l2 = ltemp;

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
                        updateFrame();
                        this.trigger('progress', frame, ids.length);
                    }

                }

                this.trigger('ready');
                this.trigger('progress', frame, ids.length);
            });

    }
});
export default DivaGeoJSImageViewer;
