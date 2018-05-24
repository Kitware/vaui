import _ from 'underscore';

class AnnotationActivityContainer {
    constructor(folderId) {
        this._id2 = 0;
        this._folderId = folderId;

        this._activities = new Map(); // activity id -> activity
        this._enableState = new Map(); // activity id -> enabled
        this._trackActivityMap = new Map(); // track id -> Set(activity)

        this._added = new Set();
        this._edited = new Set();
        this._removed = new Set();
    }

    add(activity) {
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

        let activitiesInRange = [];
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
                    activitiesInRange.push(activity);
                }
            }
        }

        // Return matching activities, if any
        if (activitiesInRange.length === 0) {
            return;
        }
        return activitiesInRange;
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
        this.add(activity);
        this._added.add(activity);
        return this.copy();
    }

    change(id2, activity) {
        var activityToChange = this.getItem(id2);
        // update for removed and added tracks
        var existingTrackIds = activityToChange.actors.map((actor) => actor.id1);
        var addTrackIds = activity.actors.map((actor) => actor.id1);
        var removedTracksId = _(existingTrackIds).difference(addTrackIds);
        removedTracksId.forEach((trackId) => {
            var activitySet = this._trackActivityMap.get(trackId);
            if (activitySet.size === 1) {
                this._trackActivityMap.delete(trackId);
            } else {
                activitySet.delete(activityToChange);
            }
        });
        var addTracksId = _(addTrackIds).difference(existingTrackIds);
        addTracksId.forEach((trackId) => {
            if (!this._trackActivityMap.has(trackId)) {
                this._trackActivityMap.set(trackId, new Set());
            }
            this._trackActivityMap.get(trackId).add(activityToChange);
        });

        Object.assign(activityToChange, activity);
        if (!this._added.has(activityToChange)) {
            this._edited.add(activityToChange);
        }
        if (id2 !== activity.id2) {
            this._enableState.set(activity.id2, this._enableState.get(id2));
            this._enableState.delete(id2);
            this._activities.set(activity.id2, activityToChange);
            this._activities.delete(id2);
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
        let activities = this.getActivitiesContainingTrack(trackId);
        activities.forEach((activity) => {
            this.remove(activity.id2);
        });
        return this.copy();
    }

    getActivitiesContainingTrack(trackId) {
        var activitiesSet = this._trackActivityMap.get(trackId);
        return activitiesSet ? Array.from(activitiesSet) : [];
    }

    getActivityFrameRange(activityId) {
        var activity = this._activities.get(activityId);
        return activity.timespan[0].tsr0;
    }

    validateNewActivityId(activityId) {
        return !this._activities.has(activityId);
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
        return Object.assign(new AnnotationActivityContainer(this._folderId), this);
    }
}

class AnnotationActivity {
    constructor(activity) {
        Object.assign(this, activity);
    }
}

function annotationActivityParser(forderId, activities) {
    var container = new AnnotationActivityContainer(forderId);
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
