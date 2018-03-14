
import { restRequest } from 'girder/rest';
import { getCurrentToken } from 'girder/auth';

import { IMPORT_PROGRESS_CHANGE, LOAD_ANNOTATION, SET_DETECTION_ITEM } from '../actions/types';
import annotationDetectionParser, { AnnotationDetectionContainer } from '../util/annotationDetectionParser';
import annotationActivityParser, { AnnotationActivityContainer } from '../util/annotationActivityParser';
import annotationTypeParser, { AnnotationTypeContainer } from '../util/annotationTypeParser';

export default (item, reImport) => {
    return (dispatch, getState) => {
        dispatch({
            type: `${LOAD_ANNOTATION}_PENDING`
        });
        return restRequest({
            url: `/vaui-annotation/status/${item.folderId}`
        }).then((result) => {
            var existKPF = Object.values(result.kpf).reduce((exist, value) => exist & value, true);
            var records = !!Object.values(result.records).reduce((total, value) => total + value, 0);
            if (existKPF && (!records || reImport)) {
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
                restRequest({
                    url: `/activities/${item.folderId}`
                }).then((activities) => {
                    var annotationActivityContainer = annotationActivityParser(item.folderId, activities);
                    return annotationActivityContainer;
                }),
                restRequest({
                    url: `/types/${item.folderId}`
                }).then((types) => {
                    return annotationTypeParser(item.folderId, types);
                }),
                restRequest({
                    url: `/detection/${item.folderId}`
                }).then((detections) => {
                    return annotationDetectionParser(item.folderId, detections);
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
