class AnnotationGeometryContainer {
    constructor() {
        this._itemId = null;
        this._id0 = 0;
        this._frameMap = new Map();
        this._editedGeom = new Set();
        this._addedGeom = new Set();
        this._trackIds = new Set();
        this._trackRanges = new Map();
        this._enableState = new Map();
    }

    add(geometry) {
        this._itemId = geometry.itemId;
        this._id0 = Math.max(this._id0, geometry.id0);
        var frameMap = this._frameMap;
        if (!frameMap.has(geometry.ts0)) {
            frameMap.set(geometry.ts0, []);
        }
        frameMap.get(geometry.ts0).push(geometry);
        if (!this._trackIds.has(geometry.id1)) {
            this._trackIds.add(geometry.id1);
            this._enableState.set(geometry.id1, true);
        }
        if (!this._trackRanges.has(geometry.id1)) {
            this._trackRanges.set(geometry.id1, [0, 0]);
        }
        this._updateTrackRange(geometry.id1, geometry.ts0);
    }

    _updateTrackRange(trackId, frame) {
        var trackRange = this._trackRanges.get(trackId);
        trackRange[0] = Math.min(trackRange[0], frame);
        trackRange[1] = Math.max(trackRange[1], frame);
    }

    getAllItems() {
        return Array.from(this._trackIds);
    }

    getEnableState(id1) {
        return this._enableState.get(id1);
    }

    toggleState(id1, enabled) {
        this._enableState.set(id1, enabled);
        return this.copy();
    }

    getTrackFrameRange(id1) {
        return this._trackRanges.get(id1);
    }

    getNextTrackId() {
        return Math.max(...Array.from(this._trackIds)) + 1;
    }

    validateNewTrackId(trackId) {
        return !this._trackIds.has(trackId);
    }

    newTrack(trackId) {
        this._trackIds.add(trackId);
        this._trackRanges.set(trackId, [0, 0]);
        this._enableState.set(trackId, true);
        return this.copy();
    }

    changeTrack(trackId, newTrackId) {
        if (trackId !== newTrackId) {
            this._trackIds.delete(trackId);
            this._trackIds.add(newTrackId);
            this._trackRanges.set(newTrackId, this._trackRanges.get(trackId));
            this._enableState.set(newTrackId, this._enableState.get(trackId));
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
                id0: this._id0++,
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
