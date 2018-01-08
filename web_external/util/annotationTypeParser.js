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
    constructor(types) {
        Object.assign(this, types);
    }
}

function annotationTypeParser(typesList) {
    var container = new AnnotationTypeContainer();
    for (let types of typesList) {
        var annotationType = new AnnotationType(types);
        container.add(annotationType);
    }
    return container;
}

export {
    AnnotationType,
    AnnotationTypeContainer
};
export default annotationTypeParser;
