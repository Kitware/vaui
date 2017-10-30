import YAML from 'yamljs';

class AnnotationGeometryContainer {
    constructor() {
        this._frameMap = new Map();
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
}

class AnnotationTrackContainer {
    constructor() {
        this._trackIds = new Set();
        this._enableState = new Map();
    }

    add(geometry) {
        if (!this._trackIds.has(geometry.id1)) {
            this._trackIds.add(geometry.id1);
            this._enableState.set(geometry.id1, true);
        }
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
            case 'g0':
                let values = value.split(' ');
                this.g0 = [
                    [parseInt(values[0]), parseInt(values[1])],
                    [parseInt(values[2]), parseInt(values[3])]
                ];
                break;
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

function annotationGeometryParser(raw) {
    var lines = YAML.parse(raw);
    var annotationGeometryContainer = new AnnotationGeometryContainer();
    var annotationTrackContainer = new AnnotationTrackContainer();
    for (let line of lines) {
        if ('meta' in line) {
            continue;
        }
        var annotationGeometry = new AnnotationGeometry();
        for (let key in line) {
            annotationGeometry.set(key, line[key]);
        }
        annotationGeometryContainer.add(annotationGeometry);
        annotationTrackContainer.add(annotationGeometry);
    }
    return { annotationGeometryContainer, annotationTrackContainer };
}



export {
    AnnotationGeometry,
    AnnotationGeometryContainer
}
export default annotationGeometryParser;
