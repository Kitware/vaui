
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
            url: `/vaui-annotation/status/${item.folderId}`
        }).then((result) => {
            if (result) {
                return;
            } else {
                return restRequest({
                    method: 'POST',
                    url: `/vaui-annotation/import/${item.folderId}`
                })
            }
        }).then(() => {
            return restRequest({
                url: `/folder/${item.folderId}`
            })
        }).then((folder) => {
            return Promise.all([
                loadAnnotation(item.folderId, folder.name, 'activities')
                    .then((activities) => {
                        var annotationActivityContainer = annotationActivityParser(activities);
                        return annotationActivityContainer;
                    })
                    .catch(() => { }),
                loadAnnotation(item.folderId, folder.name, 'types')
                    .then((types) => {
                        return annotationTypeParser(types);
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
                }).then((items) => {
                    dispatch({
                        type: SET_GEOM_ITEM,
                        payload: items[0]
                    });
                    return restRequest({
                        url: `/geom/${items[0]._id}`
                    })
                }).then((geoms) => {
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

const loadAnnotation = (folderId, folderName, type) => {
    return restRequest({
        url: '/item',
        data: {
            folderId,
            name: `${folderName}.${type}.yml`
        }
    }).then((items) => {
        return restRequest({
            url: `/${type}/${items[0]._id}`
        })
    })
};
