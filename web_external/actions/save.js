import { restRequest } from 'girder/rest';

import { SAVE } from './types';

export default () => {
    return (dispatch, getState) => {
        var { annotationDetectionContainer, annotationTypeContainer, annotationActivityContainer } = getState();
        dispatch({
            type: `${SAVE}_PENDING`
        });
        return Promise.all([
            ...annotationDetectionContainer.getRemoved().map(([flattenDetection]) => {
                return restRequest({
                    method: 'DELETE',
                    url: `/detection/${flattenDetection._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(flattenDetection)
                });
            }),
            ...annotationDetectionContainer.getEdited().map(([flattenDetection]) => {
                return restRequest({
                    method: 'PUT',
                    url: `/detection/${flattenDetection._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(flattenDetection)
                });
            }),
            ...annotationDetectionContainer.getAdded().map(([flattenDetection, detection]) => {
                return restRequest({
                    method: 'POST',
                    url: `/detection/${flattenDetection.folderId}`,
                    contentType: 'application/json',
                    data: JSON.stringify(flattenDetection)
                }).then((savedDetection) => {
                    detection._id = savedDetection._id;
                });
            }),
            ...annotationTypeContainer.getRemoved().map((type) => {
                return restRequest({
                    method: 'DELETE',
                    url: `/types/${type._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(type)
                });
            }),
            ...annotationTypeContainer.getEdited().map((type) => {
                return restRequest({
                    method: 'PUT',
                    url: `/types/${type._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(type)
                });
            }),
            ...annotationTypeContainer.getAdded().map((type) => {
                return restRequest({
                    method: 'POST',
                    url: `/types/${type.folderId}`,
                    contentType: 'application/json',
                    data: JSON.stringify(type)
                }).then((savedType) => {
                    type._id = savedType._id;
                });
            }),
            ...annotationActivityContainer.getRemoved().map((activity) => {
                return restRequest({
                    method: 'DELETE',
                    url: `/activities/${activity._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(activity)
                });
            }),
            ...annotationActivityContainer.getEdited().map((activity) => {
                return restRequest({
                    method: 'PUT',
                    url: `/activities/${activity._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(activity)
                });
            }),
            ...annotationActivityContainer.getAdded().map((activity) => {
                return restRequest({
                    method: 'POST',
                    url: `/activities/${activity.folderId}`,
                    contentType: 'application/json',
                    data: JSON.stringify(activity)
                }).then((savedActivity) => {
                    activity._id = savedActivity._id;
                });
            })
        ]).then(() => {
            annotationDetectionContainer = annotationDetectionContainer.reset();
            annotationTypeContainer = annotationTypeContainer.reset();
            annotationActivityContainer = annotationActivityContainer.reset();
            dispatch({
                type: `${SAVE}_FULFILLED`,
                payload: {
                    annotationDetectionContainer,
                    annotationTypeContainer,
                    annotationActivityContainer
                }
            });
        });
    };
};
