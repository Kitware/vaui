import { restRequest } from 'girder/rest';

import { SAVE } from './types';

export default (save) => {
    return (dispatch, getState) => {
        var { annotationGeometryContainer } = getState();
        dispatch({
            type: `${SAVE}_PENDING`
        });
        return Promise.all(
            annotationGeometryContainer.getEdited().map((geom) => {
                return restRequest({
                    method: 'PUT',
                    url: `/geom/${geom._id}`,
                    contentType: 'application/json',
                    data: JSON.stringify(geom)
                });
            }),
            annotationGeometryContainer.getAdded().map((geom) => {
                return restRequest({
                    method: 'POST',
                    url: `/geom/${geom.itemId}`,
                    contentType: 'application/json',
                    data: JSON.stringify(geom)
                });
            })
        ).then(() => {
            annotationGeometryContainer = annotationGeometryContainer.reset();
            dispatch({
                type: `${SAVE}_FULFILLED`,
                payload: {
                    annotationGeometryContainer
                }
            });
        });
    };
};
