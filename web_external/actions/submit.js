import qs from 'query-string';
import { restRequest } from 'girder/rest';

import { SAVE } from './types';

export default (queryParams) => {
    return (dispatch, getState) => {
        var { annotationDetectionContainer, annotationTypeContainer, annotationActivityContainer } = getState();
        dispatch({
            type: `${SAVE}_PENDING`
        });
        var detections = Array.from(annotationDetectionContainer._frameMap.values()).reduce((arr, map) => [...arr, ...Array.from(map.values())], []);
        var types = Array.from(annotationTypeContainer._mapper.values());
        var activities = Array.from(annotationActivityContainer._activities.values());

        return restRequest({
            method: 'POST',
            url: `/submit?${qs.stringify(queryParams)}`,
            contentType: 'application/json',
            data: JSON.stringify({ detections, types, activities })
        }).then(() => {
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
