class AnnotationGeometryTrack {
    constructor() {
        this._stateMap = new Map();
        this.enableState = true;
        this.resetFrameRange();
    }

    resetFrameRange()
    {
        this._frameRange = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
    }

    expandFrameRange(frame) {
        this._frameRange[0] = Math.min(this._frameRange[0], frame);
        this._frameRange[1] = Math.max(this._frameRange[1], frame);
    }

    recomputeFrameRange() {
        this.resetFrameRange();
        for (let [ts0, geomId] of this._stateMap) {
            this.expandFrameRange(ts0);
        }
    }

    get frameRange() {
        return this._frameRange;
    }

    get states() {
        return this._stateMap;
    }
}

class AnnotationGeometryContainer {
    constructor() {
        this._itemId = null;
        this._id0 = 0;

        this._trackMap = new Map(); // track id -> AnnotationGeometryTrack
        this._frameMap = new Map(); // frame -> Map(track id -> geometries)

        this._addedGeom = new Map();
        this._editedGeom = new Map();
        this._removedGeom = new Map();
    }

    add(geometry) {
        this._itemId = geometry.itemId;
        this._id0 = Math.max(this._id0, geometry.id0);

        // Create frame if needed
        if (!this._frameMap.has(geometry.ts0)) {
            this._frameMap.set(geometry.ts0, new Map());
        }

        // Insert geometry into frame
        this._frameMap.get(geometry.ts0).set(geometry.id1, geometry);

        // Create track if needed
        if (!this._trackMap.has(geometry.id1)) {
            this._trackMap.set(geometry.id1, new AnnotationGeometryTrack());
        }

        // Insert geometry ID into track's state map
        let track = this._trackMap.get(geometry.id1);
        track.states.set(geometry.ts0, geometry.id0);

        // Update track time range
        track.expandFrameRange(geometry.ts0);
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
            let track = this._trackMap.get(trackId);
            this._trackMap.set(newTrackId, track);
            this._trackMap.delete(trackId);

            // Update all geometries
            for (let [ts0, geomSet] of this._frameMap) {
                let geom = geomSet.get(trackId);
                if (geom) {
                    geom.id1 = newTrackId;
                    geomSet.delete(trackId);
                    geomSet.set(newTrackId, geom);

                    if (!this._addedGeom.has(geom.id0)) {
                        this._editedGeom.set(geom.id0, geom);
                    }
                }
            };
        }
        return this.copy();
    }

    removeTrack(trackId) {
        let track = this._trackMap.get(trackId);
        if (track) {
            for (let [ts0, geomId] of track.states) {
                let frame = this._frameMap.get(ts0);
                this._remove(frame, trackId, geomId);
            }
            this._trackMap.delete(trackId);
        }
        return this.copy();
    }

    getFrame(frame) {
        return Array.from(this._frameMap.get(frame).values());
    }

    get length() {
        return this._frameMap.size;
    }

    _getState(frame, trackId) {
        let track = this._trackMap.get(trackId);
        if (track) {
            return track.states.get(frame);
        }
        return undefined;
    }

    change(frame, trackId, g0, itemId = null) {
        // Look up ID of possibly existing geometry
        let geomId = this._getState(frame, trackId);

        if (geomId) {
            // Geometry already exists for the specified state; look it up and
            // modify it in place
            let geomToChange = this._frameMap(frame).get(trackId);
            Object.assign(geomToChange, {g0});

            // Update modification records; if state was added, it is still
            // added; otherwise, it is edited
            if (!this._addedGeom.has(geomToChange.id0)) {
                this._editedGeom.set(geomToChange.id0, geomToChange);
            }
        }
        else {
            // Entirely new geometry; add it
            let newGeom = new AnnotationGeometry({
                id0: ++this._id0,
                id1: trackId,
                ts0: frame,
                g0,
                itemId: this._itemId,
                src: 'truth'
            });
            this.add(newGeom);

            // Update modification records; since there was no previous state,
            // this is an addition
            this._addedGeom.set(newGeom.id0, newGeom);
        }
        return this.copy();
    }

    _remove(geomSet, trackId, geomId) {
        // Update modification records; if state was added, just discard the
        // record; otherwise, add to removal records and ensure the state is
        // not in the edit records
        if (this._addedGeom.has(geomId)) {
            this._addedGeom.delete(geomId);
        }
        else {
            let geom = geomSet.get(trackId);

            this._editedGeom.delete(geomId);
            this._removedGeom.set(geomId, geom);
        }

        // Finally, remove the geometry from the frame
        geomSet.delete(trackId);
    }

    remove(frame, trackId) {
        // Look up ID of geometry
        let geomId = this._getState(frame, trackId);

        if (geomId) {
            let track = this._trackMap.get(trackId);
            track.states.delete(frame);
            track.recomputeFrameRange();

            this._remove(this._frameMap.get(frame), trackId, geomId);
        }
        return this.copy();
    }

    _flattenGeom(geom) {
        let newGeom = Object.assign({}, geom, geom.keyValues);
        delete newGeom.keyValues;
        return [newGeom, geom];

    }

    getAdded() {
        return [...this._addedGeom.values()].map(this._flattenGeom);
    }

    getEdited() {
        return [...this._editedGeom.values()].map(this._flattenGeom);
    }

    getRemoved() {
        return [...this._removedGeom.values()].map(this._flattenGeom);
    }

    reset() {
        this._addedGeom.clear();
        this._editedGeom.clear();
        this._removedGeom.clear();
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
