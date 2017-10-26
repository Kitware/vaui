import YAML from 'yamljs';

class AnnotationActivityContainer {
    constructor() {
        this._mapper = new Map();
        this._enableState = new Map();
        this._activities = [];
    }

    add(activity) {
        var mapper = this._mapper;
        activity.actors.forEach((actor) => {
            var id = actor.id1;
            if (!mapper.has(id)) {
                mapper.set(id, []);
            }
            mapper.get(id).push(activity);
        });
        this._enableState.set(activity.id2, true);
        this._activities.push(activity);
    }

    getEnabledActivities(id1, frame) {
        if (!this._mapper.has(id1)) {
            return;
        }
        var activities = this._mapper.get(id1);
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

    getAllItems() {
        return this._activities;
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
    constructor(line) {
        Object.assign(this, line);
    }
}

function annotationGeometryParser(raw) {
    var lines = YAML.parse(raw);
    var container = new AnnotationActivityContainer();
    for (let line of lines) {
        if ('meta' in line) {
            continue;
        }
        var annotationActivity = new AnnotationActivity(line);
        container.add(annotationActivity);
    }
    return container;
}

export {
    AnnotationActivity,
    AnnotationActivityContainer
}
export default annotationGeometryParser;