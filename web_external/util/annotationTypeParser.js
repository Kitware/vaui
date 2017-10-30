import YAML from 'yamljs';

class AnnotationTypeContainer {
    constructor() {
        this._mapper = new Map();
    }

    add(track) {
        var id = track.id1;
        this._mapper.set(id, track);
    }

    getAllItems() {
        return Array.from(this._mapper.values());
    }

    getItem(id1) {
        return this._mapper.get(id1);
    }
}

class AnnotationType {
    constructor(line) {
        Object.assign(this, line);
    }
}

function annotationTypeParser(raw) {
    var lines = YAML.parse(raw);
    var container = new AnnotationTypeContainer();
    for (let line of lines) {
        if ('meta' in line) {
            continue;
        }
        var annotationType = new AnnotationType(line);
        container.add(annotationType);
    }
    return container;
}

export {
    AnnotationType,
    AnnotationTypeContainer
}
export default annotationTypeParser;
