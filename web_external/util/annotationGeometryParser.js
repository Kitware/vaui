class AnnotationGeometryTrack {
    constructor() {
        this._frameRange = [0, 0];
        this.enableState = true;
    }

    expandFrameRange(frame) {
        this._frameRange[0] = Math.min(this._frameRange[0], frame);
        this._frameRange[1] = Math.max(this._frameRange[1], frame);
    }

    get frameRange() {
        return this._frameRange;
    }
}

class AnnotationGeometryContainer {
    constructor() {
        this._itemId = null;
        this._id0 = 0;

        this._trackMap = new Map(); // track id -> AnnotationGeometryTrack
        this._frameMap = new Map();

        this._addedGeom = new Set();
        this._editedGeom = new Set();
    }

    add(geometry) {
        this._itemId = geometry.itemId;
        this._id0 = Math.max(this._id0, geometry.id0);

        // Create frame if needed
        if (!this._frameMap.has(geometry.ts0)) {
            this._frameMap.set(geometry.ts0, []);
        }

        // Insert geometry into frame
        this._frameMap.get(geometry.ts0).push(geometry);

        // Create track if needed
        if (!this._trackMap.has(geometry.id1)) {
            this._trackMap.set(geometry.id1, new AnnotationGeometryTrack());
        }

        // Update track time range
        this._updateTrackRange(geometry.id1, geometry.ts0);
    }

    _updateTrackRange(trackId, frame) {
        this._trackMap.get(trackId).expandFrameRange(frame);
    }

    getAllItems() {
        return Array.from(this._trackMap.keys());
    }

    getEnableState(id1) {
        return this._trackMap.get(id1).enableState;
    }

    toggleState(id1, enabled) {
        this._trackMap.get(id1).enableState = enabled;
        return this.copy();
    }

    getTrackFrameRange(id1) {
        return this._trackMap.get(id1).frameRange;
    }

    getNextTrackId() {
        return Math.max(...this._trackMap.keys()) + 1;
    }

    validateNewTrackId(trackId) {
        return !this._trackMap.has(trackId);
    }

    newTrack(trackId) {
        this._trackMap.set(trackId, new AnnotationGeometryTrack());
        return this.copy();
    }

    changeTrack(trackId, newTrackId) {
        if (trackId !== newTrackId) {
            // Reassign track in track map
            var track = this._trackMap.get(trackId);
            this._trackMap.set(newTrackId, track);
            this._trackMap.delete(trackId);

            // Update all geometries
            _.flatten(Array.from(this._frameMap.values())).forEach((geom) => {
                if (geom.id1 !== trackId) {
                    return;
                }
                geom.id1 = newTrackId;
                if (!this._addedGeom.has(geom)) {
                    this._editedGeom.add(geom);
                }
            });
        }
        return this.copy();
    }

    getFrame(frame) {
        return this._frameMap.get(frame);
    }

    get length() {
        return this._frameMap.size;
    }

    change(frame, trackId, g0, itemId = null) {
        var geomSet = this.getFrame(frame);
        var geomToChange = Array.from(geomSet).find((geom) => {
            return geom.id1 === trackId && geom.ts0 === frame;
        });
        if (geomToChange) {
            Object.assign(geomToChange, {
                g0
            });
            if (!this._addedGeom.has(geomToChange)) {
                this._editedGeom.add(geomToChange);
            }
        }
        else {
            var newGeom = new AnnotationGeometry({
                id0: ++this._id0,
                id1: trackId,
                ts0: frame,
                g0,
                itemId: this._itemId,
                src: 'truth'
            });
            this._addedGeom.add(newGeom);
            this._frameMap.get(frame).push(newGeom);
            this._updateTrackRange(trackId, frame);
        }
        return this.copy();
    }

    _flattenGeom(geom) {
        var newGeom = Object.assign({}, geom, geom.keyValues);
        delete newGeom.keyValues;
        return [newGeom, geom];

    }

    getEdited() {
        return Array.from(this._editedGeom).map(this._flattenGeom);
    }

    getAdded() {
        return Array.from(this._addedGeom).map(this._flattenGeom);
    }

    reset() {
        this._editedGeom.clear();
        this._addedGeom.clear();
        return this.copy();
    }

    copy() {
        return Object.assign(new this.constructor(), this);
    }
}

class AnnotationGeometry {
    constructor(geom) {
        this.id0 = 0;
        this.id1 = 0;
        this.ts0 = 0;
        this.ts1 = 0;
        this.g0 = null;
        this.src = 'truth';
        this.keyValues = {};
        for (let key in geom) {
            this.set(key, geom[key]);
        }
    }
    set(key, value) {
        switch (key) {
            case '_id':
            case 'itemId':
            case 'g0':
            case 'id0':
            case 'id1':
            case 'ts0':
            case 'ts1':
            case 'src':
                this[key] = value;
                break;
            default:
                this.keyValues[key] = value;
                break;
        }
    }
}

function annotationGeometryParser(geoms) {
    var annotationGeometryContainer = new AnnotationGeometryContainer();
    for (let geom of geoms) {
        var annotationGeometry = new AnnotationGeometry(geom);
        annotationGeometryContainer.add(annotationGeometry);
    }
    return annotationGeometryContainer;
}

export {
    AnnotationGeometry,
    AnnotationGeometryContainer
};
export default annotationGeometryParser;
