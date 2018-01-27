class AnnotationTypeContainer {
    constructor() {
        this._itemId = null;
        this._mapper = new Map();
        this._edited = new Set();
        this._added = new Set();
    }

    add(types) {
        this._itemId = types.itemId;
        this._mapper.set(types.id1, types);
    }

    getAllItems() {
        return Array.from(this._mapper.values());
    }

    getItem(id1) {
        var type = this._mapper.get(id1);
        if (type) {
            return type;
        }
        // Type could be non exists sometime
        this.newType(id1, {});
        return this._mapper.get(id1);
    }

    // Other code that calculate the label should use this function instead
    getTrackDisplayLabel(id1) {
        var type = this.getItem(id1);
        if (type) {
            var types = Object.keys(type.cset3);
            var typeLabel = types.length <= 1 ? types[0] : 'Multiple';
        }
        var label = ((type && typeLabel) ? `${typeLabel}-${id1}` : id1);
        return label;
    }

    change(trackId, newTrackId, newCset3) {
        var typeToChange = this.getAllItems().find((type) => {
            return type.id1 === trackId
        });
        Object.assign(typeToChange, {
            id1: newTrackId,
            cset3: newCset3
        });
        if (!this._added.has(typeToChange)) {
            this._edited.add(typeToChange);
        }
        this._mapper.set(newTrackId, this._mapper.get(trackId));
        return this.copy();
    }

    newType(trackId, cset3) {
        var type = new AnnotationType({
            id1: trackId,
            cset3,
            itemId: this._itemId
        });
        this._added.add(type);
        this._mapper.set(trackId, type);
        return this.copy();
    }

    getEdited() {
        return Array.from(this._edited);
    }

    getAdded() {
        return Array.from(this._added);
    }

    reset() {
        this._edited.clear();
        this._added.clear();
        return this.copy();
    }

    copy() {
        return Object.assign(new this.constructor(), this);
    }
}

class AnnotationType {
    constructor(types) {
        this._id = types._id;
        this.itemId = types.itemId;
        this.id1 = types.id1;
        this.cset3 = types.cset3;
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
