import YAML from 'yamljs';

class AnnotationGeometryCotainer {
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
    var annotationGeometryCotainer = new AnnotationGeometryCotainer();
    for (let line of lines) {
        if ('meta' in line) {
            continue;
        }
        var annotationGeometry = new AnnotationGeometry();
        for (let key in line) {
            annotationGeometry.set(key, line[key]);
        }
        annotationGeometryCotainer.add(annotationGeometry);
    }
    return annotationGeometryCotainer;
}



export {
    AnnotationGeometry,
    AnnotationGeometryCotainer
}
export default annotationGeometryParser;
