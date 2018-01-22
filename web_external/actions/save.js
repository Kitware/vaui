import { restRequest } from 'girder/rest';

import { SAVE } from './types';

export default (save) => {
    return (dispatch, getState) => {
        var { annotationGeometryContainer, annotationTypeContainer, annotationActivityContainer } = getState();
        dispatch({
            type: `${SAVE}_PENDING`
        });
        return Promise.all(
            annotationGeometryContainer.getEdited().map(([flattenGeom]) => {
                return restRequest({
                    method: 'PUT',
                    url: `/geom/${flattenGeom._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(flattenGeom)
                });
            }),
            annotationGeometryContainer.getAdded().map(([flattenGeom, geom]) => {
                return restRequest({
                    method: 'POST',
                    url: `/geom/${flattenGeom.itemId}`,
                    contentType: 'application/json',
                    data: JSON.stringify(flattenGeom)
                }).then((savedGeom) => {
                    geom._id = savedGeom._id;
                });
            }),
            annotationTypeContainer.getEdited().map((type) => {
                return restRequest({
                    method: 'PUT',
                    url: `/types/${type._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(type)
                });
            }),
            annotationTypeContainer.getAdded().map((type) => {
                return restRequest({
                    method: 'POST',
                    url: `/types/${type.itemId}`,
                    contentType: 'application/json',
                    data: JSON.stringify(type)
                }).then((savedType) => {
                    type._id = savedType._id;
                });
            }),
            annotationActivityContainer.getEdited().map((activity) => {
                return restRequest({
                    method: 'PUT',
                    url: `/activities/${activity._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(activity)
                });
            }),
            annotationActivityContainer.getAdded().map((activity) => {
                return restRequest({
                    method: 'POST',
                    url: `/activities/${activity.itemId}`,
                    contentType: 'application/json',
                    data: JSON.stringify(activity)
                }).then((savedActivity) => {
                    activity._id = savedActivity._id;
                });
            })
        ).then(() => {
            annotationGeometryContainer = annotationGeometryContainer.reset();
            annotationTypeContainer = annotationTypeContainer.reset();
            dispatch({
                type: `${SAVE}_FULFILLED`,
                payload: {
                    annotationGeometryContainer,
                    annotationTypeContainer
                }
            });
        });
    };
};
