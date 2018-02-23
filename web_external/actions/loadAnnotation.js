
import { restRequest } from 'girder/rest';
import { getCurrentToken } from 'girder/auth';


import { IMPORT_PROGRESS_CHANGE, LOAD_ANNOTATION, SET_DETECTION_ITEM } from '../actions/types';
import annotationDetectionParser from '../util/annotationDetectionParser';
import annotationActivityParser from '../util/annotationActivityParser';
import annotationTypeParser, { AnnotationTypeContainer } from '../util/annotationTypeParser';

export default (item, reImport) => {
    return (dispatch, getState) => {
        dispatch({
            type: `${LOAD_ANNOTATION}_PENDING`
        });
        return restRequest({
            url: `/vaui-annotation/status/${item.folderId}`
        }).then((result) => {
            if (!result || reImport) {
                return new Promise((resolve, reject) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', `/api/v1/vaui-annotation/import/${item.folderId}`, true);
                    xhr.setRequestHeader('Girder-Token', getCurrentToken());
                    xhr.onprogress = (e) => {
                        dispatch({
                            type: IMPORT_PROGRESS_CHANGE,
                            payload: Math.round(e.loaded * 100 / e.total)
                        });
                    };
                    xhr.onload = () => {
                        dispatch({
                            type: IMPORT_PROGRESS_CHANGE,
                            payload: null
                        });
                        resolve();
                    };
                    xhr.send();
                });
            }
        }).then(() => {
            return restRequest({
                url: `/folder/${item.folderId}`
            });
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
                        type: SET_DETECTION_ITEM,
                        payload: items[0]
                    });
                    return restRequest({
                        url: `/detection/${items[0]._id}`
                    });
                }).then((detections) => {
                    return annotationDetectionParser(detections);
                })
            ]).then(([annotationActivityContainer, annotationTypeContainer, annotationDetectionContainer]) => {
                dispatch({
                    type: LOAD_ANNOTATION + '_FULFILLED',
                    payload: { annotationActivityContainer, annotationTypeContainer, annotationDetectionContainer }
                });
            });
        }).catch(() => {
            dispatch({
                type: LOAD_ANNOTATION + '_REJECTED'
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
        });
    });
};
