class AnnotationTypeContainer {
    constructor() {
        this._itemId = null;
        this._mapper = new Map();
        this._edited = new Set();
        this._added = new Set();
    }

    add(types) {
        this._itemId = types.itemId;
        var id = types.id1;
        this._mapper.set(id, types);
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
        this.change(id1, null);
        return this._mapper.get(id1);;
    }

    change(trackId, obj_type) {
        var typeToChange = this.getAllItems().find((type) => {
            return type.id1 === trackId
        });
        if (typeToChange) {
            Object.assign(typeToChange, {
                obj_type
            });
            this._edited.add(typeToChange);
        }
        else {
            var newType = new AnnotationType({
                id1: trackId,
                obj_type,
                itemId: this._itemId
            });
            this._added.add(newType);
            this._mapper.set(trackId, newType);
        }
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
        this.obj_type = types.obj_type;
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
