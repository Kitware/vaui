class AnnotationTypeContainer {
    constructor(folderId) {
        this._folderId = folderId;
        this._mapper = new Map();

        this._added = new Set();
        this._edited = new Set();
        this._removed = new Set();
    }

    add(types) {
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
        let typeToChange = this._mapper.get(trackId);
        if (typeToChange) {
            Object.assign(typeToChange, {
                id1: newTrackId,
                cset3: newCset3
            });
            if (!this._added.has(typeToChange)) {
                this._edited.add(typeToChange);
            }
            if (newTrackId != trackId) {
                this._mapper.set(newTrackId, typeToChange);
                this._mapper.delete(trackId);
            }
        }
        return this.copy();
    }

    remove(trackId) {
        let typeToRemove = this._mapper.get(trackId);
        if (typeToRemove) {
            // Update modification records; if type was added, just discard the
            // record; otherwise, add to removal records and ensure the type is
            // not in the edit records
            if (this._added.has(typeToRemove)) {
                this._added.delete(typeToRemove);
            }
            else {
                this._edited.delete(typeToRemove);
                this._removed.add(typeToRemove);
            }
        }
        return this.copy();
    }

    newType(trackId, cset3) {
        var type = new AnnotationType({
            id1: trackId,
            cset3,
            // folderId: this._folderId
        });
        this._added.add(type);
        this._mapper.set(trackId, type);
        return this.copy();
    }

    getAdded() {
        return Array.from(this._added);
    }

    getEdited() {
        return Array.from(this._edited);
    }

    getRemoved() {
        return Array.from(this._removed);
    }

    reset() {
        this._edited.clear();
        this._added.clear();
        this._removed.clear();
        return this.copy();
    }

    copy() {
        return Object.assign(new this.constructor(this._folderId), this);
    }
}

class AnnotationType {
    constructor(types) {
        this._id = types._id;
        this.folderId = types.folderId;
        this.id1 = types.id1;
        this.cset3 = types.cset3;
    }
}

function annotationTypeParser(folderId, typesList) {
    var container = new AnnotationTypeContainer(folderId);
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
