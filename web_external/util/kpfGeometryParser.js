class AnnotationGeometryCotainer {
    constructor() {
        this.frameMap = new Map();
    }

    add(geometry) {
        var frameMap = this.frameMap;
        if (!frameMap.has(geometry.ts0)) {
            frameMap.set(geometry.ts0, []);
        }
        this.frameMap.get(geometry.ts0).push(geometry);
    }

    getFrame(frame) {
        return this.frameMap.get(frame);
    }

    get length() {
        return this.frameMap.size;
    }
}

class AnnotationGeometry {
    constructor() {
        this.id0 = 0;
        this.id1 = 0;
        this.ts0 = 0;
        this.ts1 = 0;
        this.g0 = null;
        this.keyValues = {

        };
    }
    set(key, values) {
        switch (key) {
            case 'id0':
                this.id0 = parseInt(values[0]);
                break;
            case 'id1':
                this.id1 = parseInt(values[0]);
                break;
            case 'ts0':
                this.ts0 = parseFloat(values[0]);
                break;
            case 'ts1':
                this.ts1 = parseFloat(values[0]);
                break;
            case 'g0':
                this.g0 = [
                    [parseInt(values[0]), parseInt(values[1])],
                    [parseInt(values[2]), parseInt(values[3])]
                ];
                break;
            case 'kv':
                this.keyValues[values[0]] = values[1];
                break;
        }
    }
}

function kpfGeometryParser(raw) {
    var lines = raw.split(/\r?\n/);
    var annotationGeometryCotainer = new AnnotationGeometryCotainer();
    for (let line of lines) {
        if (line.substring(0, 5) == 'meta:') {
            continue;
        }
        var valueKeys = line.split(':');
        if (valueKeys.length < 2) {
            continue;
        }
        var key, values;
        var annotationGeometry = new AnnotationGeometry();
        for (let i = 0; i < valueKeys.length; i++) {
            var splits = valueKeys[i].trim().split(' ');
            if (i === 0) {
                key = splits[0];
                continue;
            }
            if (i === valueKeys.length - 1) {
                annotationGeometry.set(key, splits);
                break;
            }
            values = splits.slice(0, -1)
            annotationGeometry.set(key, values);
            key = splits.slice(-1)[0];
        }
        annotationGeometryCotainer.add(annotationGeometry);
    }
    return annotationGeometryCotainer;
}



export {
    AnnotationGeometry,
    AnnotationGeometryCotainer
}
export default kpfGeometryParser;
