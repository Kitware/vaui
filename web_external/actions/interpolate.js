import { restRequest } from 'girder/rest';
import eventStream from 'girder/utilities/EventStream';
import JobStatus from 'girder_plugins/jobs/JobStatus';
import events from 'girder/events';

import { INTERPOLATE } from '../actions/types';

export default (trackId, detections) => {
    return (dispatch, getState) => {
        dispatch({
            type: `${INTERPOLATE}_PENDING`
        });
        return restRequest({
            method: 'POST',
            url: `/interpolation/`,
            contentType: 'application/json',
            data: JSON.stringify(detections)
        }).then(() => {
            return new Promise((resolve, reject) => {
                var onJobStatusChange = (e) => {
                    var job = e.data;
                    if (job.status === JobStatus.SUCCESS) {
                        eventStream.off('g:event.job_status', onJobStatusChange);
                        resolve(job.meta.itemId);
                    }
                }
                eventStream.on('g:event.job_status', onJobStatusChange);
            });
        }).then((itemId) => {
            return restRequest({
                method: 'GET',
                url: `/item/${itemId}/download`,
                contentType: 'application/json'
            }).then((newDetections) => {
                newDetections = JSON.parse(newDetections);
                dispatch({
                    type: `${INTERPOLATE}_FULFILLED`,
                    payload: {
                        trackId: trackId,
                        newDetections
                    }
                });
            });
        });
    };
};
