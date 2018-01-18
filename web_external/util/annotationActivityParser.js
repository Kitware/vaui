class AnnotationActivityContainer {
    constructor() {
        this._trackToActivityMapper = new Map();
        this._mapper = new Map();
        this._enableState = new Map();
    }

    add(activity) {
        var trackToActivityMapper = this._trackToActivityMapper;
        var mapper = this._mapper;
        activity.actors.forEach((actor) => {
            var id = actor.id1;
            if (!trackToActivityMapper.has(id)) {
                trackToActivityMapper.set(id, []);
            }
            trackToActivityMapper.get(id).push(activity);
        });
        this._enableState.set(activity.id2, true);
        this._mapper.set(activity.id2,activity);
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

    getItem(id1) {
        return this._mapper.get(id1);
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
