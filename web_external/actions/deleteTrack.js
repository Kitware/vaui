import { restRequest } from 'girder/rest';
import eventStream from 'girder/utilities/EventStream';
import JobStatus from 'girder_plugins/jobs/JobStatus';
import events from 'girder/events';
import bootbox from 'bootbox';

import { DELETE_TRACK } from '../actions/types';
import { AnnotationActivityContainer } from '../util/annotationActivityParser';

export default (trackId) => {
    return (dispatch, getState) => {
        var { annotationActivityContainer } = getState();
        var activities = annotationActivityContainer.getActivitiesContainingTrack(trackId);
        var p = Promise.resolve();
        if (activities.length) {
            p = new Promise((resolve, reject) => {
                bootbox.confirm(`This track is referenced by ${activities.length} activities. Removing this track will cause those activities to be deleted. Do you want to continue?`, (result) => {
                    if (result) { resolve(); }
                });
            })
        }
        p.then(() => {
            dispatch({
                type: DELETE_TRACK,
                payload: trackId
            })
        });
    };
};
