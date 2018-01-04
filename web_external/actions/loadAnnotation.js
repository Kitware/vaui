
import { restRequest } from 'girder/rest';
import { LOAD_ANNOTATION, SET_GEOM_ITEM } from '../actions/types';


import annotationGeometryParser from '../util/annotationGeometryParser';
import annotationActivityParser from '../util/annotationActivityParser';
import annotationTypeParser, { AnnotationTypeContainer } from '../util/annotationTypeParser';

export default (item) => {
    return (dispatch, getState) => {
        dispatch({
            type: `${LOAD_ANNOTATION}_PENDING`
        });
        restRequest({
            url: `/folder/${item.folderId}`
        }).then((folder) => {
            return Promise.all([
                downloadItemByName(item.folderId, `${folder.name}.activities.yml`)
                    .then((raw) => {
                        var annotationActivityContainer = annotationActivityParser(raw);
                        return annotationActivityContainer;
                    })
                    .catch(() => { }),
                downloadItemByName(item.folderId, `${folder.name}.types.yml`)
                    .then((raw) => {
                        return annotationTypeParser(raw);
                    })
                    .catch(() => {
                        return new AnnotationTypeContainer();
                    }),
                restRequest({
                    url: '/item',
                    data: {
                        folderId: item.folderId,
                        name: `${folder.name}.geom.yml`
                    }
                })
                    .then((items) => {
                        dispatch({
                            type: SET_GEOM_ITEM,
                            payload: items[0]
                        });
                        return restRequest({
                            url: `/geom/${items[0]._id}`
                        })
                    })
                    .then((geoms) => {
                        var { annotationGeometryContainer, annotationTrackContainer } = annotationGeometryParser(geoms);
                        return { annotationGeometryContainer, annotationTrackContainer };
                    })
            ]).then(([annotationActivityContainer, annotationTypeContainer, { annotationGeometryContainer, annotationTrackContainer }]) => {
                dispatch({
                    type: LOAD_ANNOTATION + '_FULFILLED',
                    payload: { annotationActivityContainer, annotationTypeContainer, annotationGeometryContainer, annotationTrackContainer }
                });
            });
        });
    };
};

const downloadItemByName = (folderId, name) => {
    return restRequest({
        url: '/item',
        data: {
            folderId: folderId,
            name: name
        }
    }).then((items) => {
        return restRequest({
            url: `/item/${items[0]._id}/download`,
            dataType: 'text'
        });
    });
};
