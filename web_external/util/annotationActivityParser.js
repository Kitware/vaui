class AnnotationActivityContainer {
    constructor() {
        this._id2 = 0;
        this._itemId = null;
        this._trackToActivityMapper = new Map();
        this._mapper = new Map();
        this._enableState = new Map();
        this._edited = new Set();
        this._added = new Set();
    }

    add(activity) {
        this._itemId = activity.itemId;
        this._id2 = Math.max(this._id2, activity.id2);
        var trackToActivityMapper = this._trackToActivityMapper;
        var mapper = this._mapper;
        activity.actors.forEach((actor) => {
            var id1 = actor.id1;
            if (!trackToActivityMapper.has(id1)) {
                trackToActivityMapper.set(id1, []);
            }
            trackToActivityMapper.get(id1).push(activity);
        });
        this._enableState.set(activity.id2, true);
        this._mapper.set(activity.id2, activity);
    }

    getEnabledActivities(id1, frame) {
        if (!this._trackToActivityMapper.has(id1)) {
            return;
        }
        var activities = this._trackToActivityMapper.get(id1);
        var inRangeActivity = activities.filter((activity) => {
            var actor = activity.actors.filter((actor) => {
                return actor.id1 === id1;
            })[0];
            var frameRange = actor.timespan[0].tsr0;
            return this._enableState.get(activity.id2) && frameRange[0] <= frame && frameRange[1] >= frame;
        });
        if (inRangeActivity.length === 0) {
            return;
        }
        return inRangeActivity;
    }

    getItem(id2) {
        return this._mapper.get(id2);
    }

    getAllItems() {
        return Array.from(this._mapper.values());
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

    getEdited() {
        return Array.from(this._edited);
    }

    getAdded() {
        return Array.from(this._added);
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
