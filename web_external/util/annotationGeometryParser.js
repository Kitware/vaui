class AnnotationGeometryContainer {
    constructor() {
        this._frameMap = new Map();
        this._changedGeom = new Set();
    }

    add(geometry) {
        var frameMap = this._frameMap;
        if (!frameMap.has(geometry.ts0)) {
            frameMap.set(geometry.ts0, []);
        }
        frameMap.get(geometry.ts0).push(geometry);
    }

    getFrame(frame) {
        return this._frameMap.get(frame);
    }

    get length() {
        return this._frameMap.size;
    }

    change(frame, trackId, g0) {
        var geomSet = this.getFrame(frame);
        var geomToChange = Array.from(geomSet).find((geom) => {
            return geom.id1 === trackId && geom.ts0 == frame;
        });
        if (geomToChange) {
            Object.assign(geomToChange, {
                g0
            });
            this._changedGeom.add(geomToChange);
        }
        return this.copy();
    }

    getChanges() {
        return {
            changed: Array.from(this._changedGeom).map((geom) => {
                var newGeom = Object.assign({}, geom, geom.keyValues);
                delete newGeom.keyValues;
                return newGeom;
            })
        };
    }

    reset() {
        this._changedGeom.clear();
        return this.copy();
    }

    copy() {
        return Object.assign(new this.constructor(), this);
    }
}

class AnnotationTrackContainer {
    constructor() {
        this._trackIds = new Set();
        this._trackRanges = new Map();
        this._enableState = new Map();
    }

    add(geometry) {
        if (!this._trackIds.has(geometry.id1)) {
            this._trackIds.add(geometry.id1);
            this._enableState.set(geometry.id1, true);
        }
        if (!this._trackRanges.has(geometry.id1)) {
            this._trackRanges.set(geometry.id1, new Array(Number.MAX_VALUE, Number.MIN_VALUE));
        }
        var trackRange = this._trackRanges.get(geometry.id1);
        trackRange[0] = Math.min(trackRange[0], geometry.ts0);
        trackRange[1] = Math.max(trackRange[1], geometry.ts0);
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

    copy() {
        return Object.assign(new this.constructor(), this);
    }
}

class AnnotationGeometry {
    constructor() {
        this.id0 = 0;
        this.id1 = 0;
        this.ts0 = 0;
        this.ts1 = 0;
        this.g0 = null;
        this.keyValues = {};
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
    var annotationTrackContainer = new AnnotationTrackContainer();
    for (let geom of geoms) {
        var annotationGeometry = new AnnotationGeometry();
        for (let key in geom) {
            annotationGeometry.set(key, geom[key]);
        }
        annotationGeometryContainer.add(annotationGeometry);
        annotationTrackContainer.add(annotationGeometry);
    }
    return { annotationGeometryContainer, annotationTrackContainer };
}

export {
    AnnotationGeometry,
    AnnotationGeometryContainer
};
export default annotationGeometryParser;
