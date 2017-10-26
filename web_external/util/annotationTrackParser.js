import YAML from 'yamljs';

class AnnotationTrackContainer {
    constructor() {
        this._mapper = new Map();
        this._enableState = new Map();
    }

    add(track) {
        var id = track.id1;
        this._mapper.set(id, track);
        this._enableState.set(id, true);
    }

    getAllItems() {
        return Array.from(this._mapper.values());
    }

    getItem(id1) {
        return this._mapper.get(id1);
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

class AnnotationTrack {
    constructor(line) {
        Object.assign(this, line);
    }
}

function annotationTrackParser(raw) {
    var lines = YAML.parse(raw);
    var container = new AnnotationTrackContainer();
    for (let line of lines) {
        if ('meta' in line) {
            continue;
        }
        var annotationTrack = new AnnotationTrack(line);
        container.add(annotationTrack);
    }
    return container;
}

export {
    AnnotationTrack,
    AnnotationTrackContainer
}
export default annotationTrackParser;