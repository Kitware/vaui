class AnnotationActivityContainer {
    constructor() {
        this._id2 = 0;
        this._itemId = null;

        this._activities = new Map(); // activity id -> activity
        this._enableState = new Map(); // activity id -> enabled
        this._trackActivityMap = new Map(); // track id -> Set(activity)

        this._added = new Set();
        this._edited = new Set();
        this._removed = new Set();
    }

    add(activity) {
        this._itemId = activity.itemId;
        this._id2 = Math.max(this._id2, activity.id2);

        for (let actor of activity.actors) {
            let id1 = actor.id1;
            if (!this._trackActivityMap.has(id1)) {
                this._trackActivityMap.set(id1, new Set());
            }
            this._trackActivityMap.get(id1).add(activity);
        }

        this._enableState.set(activity.id2, true);
        this._activities.set(activity.id2, activity);
    }

    getEnabledActivities(id1, frame) {
        if (!this._trackActivityMap.has(id1)) {
            return;
        }

        let activitiesInRange = new Set();
        for (let activity of this._trackActivityMap.get(id1)) {
            // Ignore activities that are not enabled
            if (!this._enableState.get(activity.id2)) {
                continue;
            }

            // Get this actor's frame range(s) within the activity
            let actors = activity.actors.filter((actor) => {
                return actor.id1 === id1;
            });
            for (let actor of actors) {
                let frameRange = actor.timespan[0].tsr0;
                if (frameRange[0] <= frame && frameRange[1] >= frame) {
                    // Actor's range includes requested frame; add match
                    activitiesInRange.add(activity);
                }
            }
        }

        // Return matching activities, if any
        if (activitiesInRange.size === 0) {
            return;
        }
        return [...activitiesInRange];
    }

    getItem(id2) {
        return this._activities.get(id2);
    }

    getAllItems() {
        return Array.from(this._activities.values());
    }

    getEnableState(id2) {
        return this._enableState.get(id2);
    }

    toggleState(id2, enabled) {
        this._enableState.set(id2, enabled);
        return this.copy();
    }

    new(activity) {
        activity.id2 = ++this._id2;
        activity.itemId = this._itemId;
        this.add(activity);
        this._added.add(activity);
        return this.copy();
    }

    change(activityId, newActivityAct2, newTimespan) {
        var activityToChange = this.getItem(activityId);
        if (activityToChange) {
            activityToChange.act2 = newActivityAct2;
            var oldTimespan = activityToChange.timespan[0].tsr0;
            activityToChange.timespan[0].tsr0 = newTimespan;
            // Adjust timespan of Tracks of the activity accordingly
            for (let actor of activityToChange.actors) {
                var tsr0 = actor.timespan[0].tsr0;
                if (tsr0[0] === oldTimespan[0] || tsr0[0] <= newTimespan[0]) {
                    tsr0[0] = newTimespan[0];
                }
                if (tsr0[1] === oldTimespan[1] || tsr0[1] >= newTimespan[1]) {
                    tsr0[1] = newTimespan[1];
                }
            }
            if (!this._added.has(activityToChange)) {
                this._edited.add(activityToChange);
            }
        }
        return this.copy();
    }

    changeTrack(trackId, newTrackId) {
        let activities = this._trackActivityMap.get(trackId);
        if (activities) {
            this._trackActivityMap.delete(trackId);
            // Update actor records in all activities using this track
            for (let activity of activities) {
                for (let actor of activity.actors) {
                    if (actor.id1 === trackId) {
                        actor.id1 = newTrackId;
                    }
                }
                if (!this._added.has(activity)) {
                    this._edited.add(activity);
                }
            }
            // Transfer records in track-to-activities map
            this._trackActivityMap.set(newTrackId, activities);
        }
        return this.copy();
    }

    changeTrackActivity(activityId, trackId, newTimespan) {
        var activity = this.getItem(activityId);
        var trackActivity = activity.actors.find((trackActivity) => trackActivity.id1 === trackId);
        trackActivity.timespan[0].tsr0 = newTimespan;
        // Adjust timespan of Activity accordingly
        var tsr0 = activity.timespan[0].tsr0;
        if (tsr0[0] >= newTimespan[0]) {
            tsr0[0] = newTimespan[0];
        }
        if (tsr0[1] <= newTimespan[1]) {
            tsr0[1] = newTimespan[1];
        }
        if (!this._added.has(activity)) {
            this._edited.add(activity);
        }
        return this.copy();
    }

    remove(activityId) {
        let activity = this._activities.get(activityId);
        if (activity) {
            // Remove activity from track maps
            for (let actor of activity.actors) {
                let map = this._trackActivityMap.get(actor.id1);
                map.delete(activity);
                if (map.size === 0) {
                    this._trackActivityMap.delete(actor.id1);
                }
            }

            // Update modification records; if activity was added, just discard the
            // record; otherwise, add to removal records and ensure the activity is
            // not in the edit records
            if (this._added.has(activity)) {
                this._added.delete(activity);
            }
            else {
                this._edited.delete(activity);
                this._removed.add(activity);
            }

            // Remove from primary maps
            this._activities.delete(activityId);
            this._enableState.delete(activityId);
        }
        return this.copy();
    }

    removeTrack(trackId) {
        let map = this._trackActivityMap.get(trackId);
        if (map) {
            let activitiesToDelete = new Set();

            // Remove track from all activities that use it
            for (let activity of map) {
                let actors = activity.actors.filter((actor) => {
                    return actor.id1 !== trackId;
                });
                activity.actors = actors;

                // Update modification records
                if (!this._added.has(activity)) {
                    this._edited.add(activity);
                }

                // Queue newly-emptied activities for deletion
                if (actors.length === 0) {
                    activitiesToDelete.add(activity.id2);
                }
            }

            // Purge newly-emptied activities
            for (let activityId of activitiesToDelete) {
                this.remove(activityId);
            }
        }

        return this.copy();
    }

    getActivityFrameRange(activityId) {
        var activity = this._activities.get(activityId);
        return activity.timespan[0].tsr0;
    }

    getRemoved() {
        return Array.from(this._removed);
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
        this._removed.clear();
        return this.copy();
    }

    copy() {
        return Object.assign(new AnnotationActivityContainer(), this);
    }
}

class AnnotationActivity {
    constructor(activity) {
        Object.assign(this, activity);
    }
}

function annotationActivityParser(activities) {
    var container = new AnnotationActivityContainer();
    for (let activity of activities) {
        var annotationActivity = new AnnotationActivity(activity);
        container.add(annotationActivity);
    }
    return container;
}

export {
    AnnotationActivity,
    AnnotationActivityContainer
};
export default annotationActivityParser;
