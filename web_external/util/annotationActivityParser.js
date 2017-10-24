import YAML from 'yamljs';

class AnnotationActivityContainer {
    constructor() {
        this._mapper = new Map();
    }

    add(activity) {
        var mapper = this._mapper;
        var id = activity.actors[0].id1;
        if (!mapper.has(id)) {
            mapper.set(id, []);
        }
        mapper.get(id).push(activity);
    }

    getActivities(id1, frame) {
        if (!this._mapper.has(id1)) {
            return;
        }
        var activities = this._mapper.get(id1);
        var inRangeActivity = activities.filter((activity) => {
            var frameRange = activity.actors[1].timespan[0].tsr0;
            return frameRange[0] < frame && frameRange[1] > frame;
        });
        if (inRangeActivity.length === 0) {
            return;
        }
        return inRangeActivity;
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