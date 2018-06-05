import _ from 'underscore';
import { restRequest } from 'girder/rest';

import { IMPORT_PROGRESS_CHANGE, LOAD_ANNOTATION, GOTO_FRAME, LIMIT_FRAME, SELECTED_FOLDER_CHANGE } from '../actions/types';
import annotationDetectionParser, { AnnotationDetectionContainer } from '../util/annotationDetectionParser';
import annotationActivityParser, { AnnotationActivityContainer } from '../util/annotationActivityParser';
import annotationTypeParser, { AnnotationTypeContainer } from '../util/annotationTypeParser';

export default (assignmentId) => {
    return (dispatch, getState) => {
        dispatch({
            type: `${LOAD_ANNOTATION}_PENDING`
        });
        return restRequest({
            method: 'GET',
            url: `/submit/${assignmentId}`,
            contentType: 'application/json'
        }).then((submitItem) => {
            var { folderId, activityGroupItemId } = submitItem.meta;
            restRequest({
                url: `/folder/${folderId}`
            }).then((folder) => {
                dispatch({
                    type: SELECTED_FOLDER_CHANGE,
                    folder
                });
            });
            var annotationActivityContainer;
            var annotationTypeContainer;
            var annotationDetectionContainer;
            return Promise.all([
                restRequest({
                    method: 'GET',
                    url: `/detection/${assignmentId}`
                }).then(detections => {
                    var activityTimespan = [_(detections.map((detection) => detection.ts0)).min(), _(detections.map((detection) => detection.ts0)).max()];
                    dispatch({
                        type: GOTO_FRAME,
                        payload: activityTimespan[0]
                    });
                    dispatch({
                        type: LIMIT_FRAME,
                        payload: activityTimespan
                    });
                    return annotationDetectionParser(folderId, detections);
                }),
                restRequest({
                    method: 'GET',
                    url: `/types/${assignmentId}`
                }).then(types => {
                    return annotationTypeParser(folderId, types);
                }),
                restRequest({
                    method: 'GET',
                    url: `/activities/${assignmentId}`
                }).then(activities => {
                    return annotationActivityParser(folderId, activities);
                })
            ]).then(([annotationDetectionContainer, annotationTypeContainer, annotationActivityContainer]) => {
                dispatch({
                    type: LOAD_ANNOTATION + '_FULFILLED',
                    payload: { annotationActivityContainer, annotationTypeContainer, annotationDetectionContainer }
                });
            });;
            // var types = [];
            // var detections = [];
            // var activity = null;
            // var actors = [];
            // for (let track of activityGroup.tracks) {
            //     var type = {
            //         id1: types.length + 1,
            //         cset3: { [track.type]: 1 }
            //     };
            //     types.push(type);
            //     for (let detection of track.detections) {
            //         var splits = detection.g0.split(' ');
            //         detections.push({
            //             id0: detections.length + 1,
            //             id1: type.id1,
            //             src: detection.src,
            //             g0: [[parseInt(splits[0]), parseInt(splits[1])], [parseInt(splits[2]), parseInt(splits[3])]],
            //             ts0: detection.ts0,
            //             ts1: 0
            //         })
            //     }
            //     let trackFrames = track.detections.map((detection) => detection.ts0);
            //     actors.push({
            //         id1: type.id1,
            //         timespan: [{ tsr0: [_.min(trackFrames), _.max(trackFrames)] }]
            //     })
            // }
            // let activityFrames = activityGroup.detections.map((detection) => detection.ts0);
            // let activityTimespan = [_.min(activityFrames), _.max(activityFrames)];
            // activity = {
            //     id2: 1,
            //     act2: { [activityGroup.type]: 1.0 },
            //     src: 'ground-truth',
            //     timespan: [{ tsr0: activityTimespan }],
            //     actors
            // };
            // var annotationActivityContainer = annotationActivityParser(folderId, [activity]);
            // var annotationTypeContainer = annotationTypeParser(folderId, types);
            // var annotationDetectionContainer = annotationDetectionParser(folderId, []);
            // // Linear interpolate
            // detections.forEach((detection) => {
            //     annotationDetectionContainer.change(detection.ts0, detection.id1, detection);
            // });
            // dispatch({
            //     type: LOAD_ANNOTATION + '_FULFILLED',
            //     payload: { annotationActivityContainer, annotationTypeContainer, annotationDetectionContainer }
            // });
            // dispatch({
            //     type: GOTO_FRAME,
            //     payload: activityTimespan[0]
            // });
            // dispatch({
            //     type: LIMIT_FRAME,
            //     payload: [activityTimespan[0], activityTimespan[1]]
            // });
        })
    };
};