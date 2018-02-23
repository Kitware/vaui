class AnnotationDetectionTrack {
    constructor() {
        this._stateMap = new Map();
        this.enableState = true;
        this.resetFrameRange();
    }

    resetFrameRange()
    {
        this._frameRange = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
    }

    expandFrameRange(frame) {
        this._frameRange[0] = Math.min(this._frameRange[0], frame);
        this._frameRange[1] = Math.max(this._frameRange[1], frame);
    }

    recomputeFrameRange() {
        this.resetFrameRange();
        for (let [ts0, detectionId] of this._stateMap) {
            this.expandFrameRange(ts0);
        }
    }

    get frameRange() {
        return this._frameRange;
    }

    get states() {
        return this._stateMap;
    }
}

class AnnotationDetectionContainer {
    constructor() {
        this._itemId = null;
        this._id0 = 0;

        this._trackMap = new Map(); // track id -> AnnotationDetectionTrack
        this._frameMap = new Map(); // frame -> Map(track id -> detections)

        this._addedDetection = new Map();
        this._editedDetection = new Map();
        this._removedDetection = new Map();
    }

    add(detection) {
        this._itemId = detection.itemId;
        this._id0 = Math.max(this._id0, detection.id0);

        // Create frame if needed
        if (!this._frameMap.has(detection.ts0)) {
            this._frameMap.set(detection.ts0, new Map());
        }

        // Insert detection into frame
        this._frameMap.get(detection.ts0).set(detection.id1, detection);

        // Create track if needed
        if (!this._trackMap.has(detection.id1)) {
            this._trackMap.set(detection.id1, new AnnotationDetectionTrack());
        }

        // Insert detection ID into track's state map
        let track = this._trackMap.get(detection.id1);
        track.states.set(detection.ts0, detection.id0);

        // Update track time range
        track.expandFrameRange(detection.ts0);
    }

    getAllItems() {
        return Array.from(this._trackMap.keys());
    }

    getEnableState(id1) {
        return this._trackMap.get(id1).enableState;
    }

    toggleState(id1, enabled) {
        this._trackMap.get(id1).enableState = enabled;
        return this.copy();
    }

    getTrackFrameRange(id1) {
        return this._trackMap.get(id1).frameRange;
    }

    getNextTrackId() {
        return Math.max(...this._trackMap.keys()) + 1;
    }

    validateNewTrackId(trackId) {
        return !this._trackMap.has(trackId);
    }

    newTrack(trackId) {
        this._trackMap.set(trackId, new AnnotationDetectionTrack());
        return this.copy();
    }

    changeTrack(trackId, newTrackId) {
        if (trackId !== newTrackId) {
            // Reassign track in track map
            let track = this._trackMap.get(trackId);
            this._trackMap.set(newTrackId, track);
            this._trackMap.delete(trackId);

            // Update all detections
            for (let [ts0, detectionSet] of this._frameMap) {
                let detection = detectionSet.get(trackId);
                if (detection) {
                    detection.id1 = newTrackId;
                    detectionSet.delete(trackId);
                    detectionSet.set(newTrackId, detection);

                    if (!this._addedDetection.has(detection.id0)) {
                        this._editedDetection.set(detection.id0, detection);
                    }
                }
            };
        }
        return this.copy();
    }

    removeTrack(trackId) {
        let track = this._trackMap.get(trackId);
        if (track) {
            for (let [ts0, detectionId] of track.states) {
                let frame = this._frameMap.get(ts0);
                this._remove(frame, trackId, detectionId);
            }
            this._trackMap.delete(trackId);
        }
        return this.copy();
    }

    getFrame(frame) {
        return Array.from(this._frameMap.get(frame).values());
    }

    isTrackEmpty(trackId){
        return !this._trackMap.get(trackId).states.size;
    }

    get length() {
        return this._frameMap.size;
    }

    _getState(frame, trackId) {
        let track = this._trackMap.get(trackId);
        if (track) {
            return track.states.get(frame);
        }
        return undefined;
    }

    change(frame, trackId, g0, itemId = null) {
        // Look up ID of possibly existing detection
        let detectionId = this._getState(frame, trackId);

        if (detectionId !== undefined) {
            // Detection already exists for the specified state; look it up and
            // modify it in place
            let detectionToChange = this._frameMap.get(frame).get(trackId);
            Object.assign(detectionToChange, {g0});

            // Update modification records; if state was added, it is still
            // added; otherwise, it is edited
            if (!this._addedDetection.has(detectionToChange.id0)) {
                this._editedDetection.set(detectionToChange.id0, detectionToChange);
            }
        }
        else {
            // Entirely new detection; add it
            let newDetection = new AnnotationDetection({
                id0: ++this._id0,
                id1: trackId,
                ts0: frame,
                g0,
                itemId: this._itemId,
                src: 'truth'
            });
            this.add(newDetection);

            // Update modification records; since there was no previous state,
            // this is an addition
            this._addedDetection.set(newDetection.id0, newDetection);
        }
        return this.copy();
    }

    _remove(detectionSet, trackId, detectionId) {
        // Update modification records; if state was added, just discard the
        // record; otherwise, add to removal records and ensure the state is
        // not in the edit records
        if (this._addedDetection.has(detectionId)) {
            this._addedDetection.delete(detectionId);
        }
        else {
            let detection = detectionSet.get(trackId);

            this._editedDetection.delete(detectionId);
            this._removedDetection.set(detectionId, detection);
        }

        // Finally, remove the detection from the frame
        detectionSet.delete(trackId);
    }

    remove(frame, trackId) {
        // Look up ID of detection
        let detectionId = this._getState(frame, trackId);

        if (detectionId !== undefined) {
            let track = this._trackMap.get(trackId);
            track.states.delete(frame);
            track.recomputeFrameRange();

            this._remove(this._frameMap.get(frame), trackId, detectionId);
        }
        return this.copy();
    }

    _flattenDetection(detection) {
        let newDetection = Object.assign({}, detection, detection.keyValues);
        delete newDetection.keyValues;
        return [newDetection, detection];
    }

    getAdded() {
        return [...this._addedDetection.values()].map(this._flattenDetection);
    }

    getEdited() {
        return [...this._editedDetection.values()].map(this._flattenDetection);
    }

    getRemoved() {
        return [...this._removedDetection.values()].map(this._flattenDetection);
    }

    reset() {
        this._addedDetection.clear();
        this._editedDetection.clear();
        this._removedDetection.clear();
        return this.copy();
    }

    copy() {
        return Object.assign(new this.constructor(), this);
    }
}

class AnnotationDetection {
    constructor(detection) {
        this.id0 = 0;
        this.id1 = 0;
        this.ts0 = 0;
        this.ts1 = 0;
        this.g0 = null;
        this.src = 'truth';
        this.keyValues = {};
        for (let key in detection) {
            this.set(key, detection[key]);
        }
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
            case 'src':
                this[key] = value;
                break;
            default:
                this.keyValues[key] = value;
                break;
        }
    }
}

function annotationDetectionParser(detections) {
    var annotationDetectionContainer = new AnnotationDetectionContainer();
    for (let detection of detections) {
        var annotationDetection = new AnnotationDetection(detection);
        annotationDetectionContainer.add(annotationDetection);
    }
    return annotationDetectionContainer;
}

export {
    AnnotationDetection,
    AnnotationDetectionContainer
};
export default annotationDetectionParser;
