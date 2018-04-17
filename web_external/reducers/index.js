import { getCurrentUser } from 'girder/auth';

import * as types from '../actions/types';

function app(state, action) {
    if (typeof state === 'undefined') {
        return {
            user: getCurrentUser(),
            treePanel: 'track',
            selectedFolder: null,
            selectedItem: null,
            loadingAnnotation: false,
            loadingAnnotationFailed: false,
            importProgress: null,
            annotationActivityContainer: null,
            annotationTypeContainer: null,
            annotationDetectionContainer: null,
            currentFrame: 0,
            maxFrame: null,
            selectedAnnotation: null,
            selectedDetectionId: null,
            selectedTrackId: null,
            editingTrackId: null,
            selectedActivityId: null,
            editingActivityId: null,
            saving: false,
            pendingSave: false,
            requestFrame: null,
            requestFrameRange: null,
            creatingActivity: false,
            interpolationWidget: false
        };
    }
    switch (action.type) {
        case types.LOGIN_STATE_CHANGE:
            return { ...state, ...{ user: action.user } };
        case types.TREE_PANEL_SELECT:
            return { ...state, ...{ treePanel: action.payload } };
        case types.SELECTED_FOLDER_CHANGE:
            return { ...state, ...{ selectedFolder: action.folder } };
        case types.SELECTED_ITEM_CHANGE:
            return { ...state, ...{ selectedItem: action.payload } };
        case types.LOAD_ANNOTATION + '_PENDING':
            return { ...state, ...{ loadingAnnotation: true, selectedAnnotation: null, selectedDetectionId: null, selectedTrackId: null, editingTrackId: null, selectedActivityId: null, editingActivityId: null, annotationTypeContainer: null, annotationDetectionContainer: null, annotationActivityContainer: null, interpolationWidget: false, pendingSave: false } };
        case types.LOAD_ANNOTATION + '_FULFILLED':
            return { ...state, ...action.payload, ...{ loadingAnnotation: false } };
        case types.LOAD_ANNOTATION + '_REJECTED':
            return { ...state, ...{ loadingAnnotation: false, loadingAnnotationFailed: true } };
        case types.TOGGLE_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.toggleState(action.payload.activity.id2, action.payload.enabled);
            return { ...state, ...{ annotationActivityContainer } };
        case types.TOGGLE_TRACK:
            var annotationDetectionContainer = state.annotationDetectionContainer.toggleState(action.payload.track, action.payload.enabled);
            return { ...state, ...{ annotationDetectionContainer } };
        case types.ANNOTATION_CLICKED:
            return { ...state, ...{ selectedAnnotation: action.payload, selectedTrackId: action.payload ? action.payload.detection.id1 : null, selectedDetectionId: action.payload ? action.payload.detection.id0 : null } };
        case types.EDIT_TRACK:
            return { ...state, ...{ editingTrackId: action.payload } };
        case types.CHANGE_DETECTION:
            var annotationDetectionContainer = state.annotationDetectionContainer.change(action.payload.frame, action.payload.trackId, action.payload.g0);
            return { ...state, ...{ annotationDetectionContainer, pendingSave: true } };
        case types.CHANGE_DETECTION_ATTRIBUTES:
            var annotationDetectionContainer = state.annotationDetectionContainer.changeAttributes(action.payload.id0, action.payload.attributes);
            return { ...state, ...{ annotationDetectionContainer, pendingSave: true } };
        case types.DELETE_DETECTION:
            var annotationDetectionContainer = state.annotationDetectionContainer.remove(action.payload.frame, action.payload.trackId);
            return { ...state, ...{ annotationDetectionContainer, pendingSave: true } };
        case types.SAVE + '_PENDING':
            return { ...state, ...{ saving: true } };
        case types.SAVE + '_FULFILLED':
            return { ...state, ...action.payload, pendingSave: false, saving: false };
        case types.FOCUS_TRACK:
            var range = state.annotationDetectionContainer.getTrackFrameRange(action.payload);
            return { ...state, ...{ requestFrameRange: [range[0], range[1]], selectedTrackId: action.payload } };
        case types.GOTO_TRACK_START:
        case types.GOTO_TRACK_END:
            var range = state.annotationDetectionContainer.getTrackFrameRange(action.payload);
            return { ...state, ...{ requestFrame: { frame: action.type === types.GOTO_TRACK_START ? range[0] : range[1] }, selectedTrackId: action.payload } };
        case types.NEW_TRACK:
            var annotationDetectionContainer = state.annotationDetectionContainer.newTrack(action.payload.trackId);
            var annotationTypeContainer = state.annotationTypeContainer.newType(action.payload.trackId, action.payload.cset3);
            return { ...state, ...{ editingTrackId: action.payload.trackId, annotationDetectionContainer, annotationTypeContainer } };
        case types.CHANGE_TRACK:
            var annotationDetectionContainer = state.annotationDetectionContainer.changeTrack(action.payload.trackId, action.payload.newTrackId);
            var annotationTypeContainer = state.annotationTypeContainer.change(action.payload.trackId, action.payload.newTrackId, action.payload.newCset3);
            var annotationActivityContainer = state.annotationActivityContainer.changeTrack(action.payload.trackId, action.payload.newTrackId);
            return { ...state, ...{ annotationDetectionContainer, annotationTypeContainer, annotationActivityContainer, pendingSave: true, selectedTrackId: action.payload.newTrackId } };
        case types.DELETE_TRACK:
            var annotationDetectionContainer = state.annotationDetectionContainer.removeTrack(action.payload);
            var annotationTypeContainer = state.annotationTypeContainer.remove(action.payload);
            var annotationActivityContainer = state.annotationActivityContainer.removeTrack(action.payload);
            return { ...state, ...{ annotationDetectionContainer, annotationTypeContainer, pendingSave: true, selectedTrackId: null, editingTrackId: null, selectedActivityId: null, editingActivityId: null } };
        case types.SELECT_TRACK:
            return { ...state, ...{ selectedTrackId: action.payload } };
        case types.GOTO_ACTIVITY_START:
        case types.GOTO_ACTIVITY_END:
            var range = state.annotationActivityContainer.getActivityFrameRange(action.payload);
            return { ...state, ...{ requestFrame: { frame: action.type === types.GOTO_ACTIVITY_START ? range[0] : range[1] }, selectedActivityId: action.payload } };
        case types.SELECT_ACTIVITY:
            return { ...state, ...{ selectedActivityId: action.payload } };
        case types.EDIT_ACTIVITY_START:
            return { ...state, ...{ editingActivityId: action.payload } };
        case types.EDIT_ACTIVITY_STOP:
            return { ...state, ...{ editingActivityId: null, selectedActivityId: action.payload } };
        case types.CHANGE_ACTIVITY2:
            var activity = action.payload.activity;
            var annotationActivityContainer = state.annotationActivityContainer.change(action.payload.id2, activity);
            return { ...state, ...{ annotationActivityContainer, pendingSave: true, selectedActivityId: activity.id2 } };
        case types.DELETE_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.remove(action.payload);
            return { ...state, ...{ annotationActivityContainer, pendingSave: true, selectedActivityId: null } };
        case types.ADD_ACTIVITY:
            var activity = action.payload;
            var annotationActivityContainer = state.annotationActivityContainer.new(activity);
            return { ...state, ...{ annotationActivityContainer, pendingSave: true, selectedActivityId: activity.id2 } };
        case types.SELECT_TRACK_ACTIVITY:
            return { ...state, ...{ selectedActivityId: action.payload.activityId, selectedTrackId: action.payload.trackId, editingTrackId: null } };
        case types.GOTO_FRAME:
            return { ...state, ...{ requestFrame: { frame: action.payload } } };
        case types.CURRENT_FRAME_CHANGE:
            return { ...state, ...{ currentFrame: action.payload } };
        case types.MAX_FRAME_CHANGE:
            return { ...state, ...{ maxFrame: action.payload } };
        case types.CREATE_ACTIVITY_START:
            return { ...state, ...{ creatingActivity: true, interpolationWidget: false } };
        case types.CREATE_ACTIVITY_STOP:
            return { ...state, ...{ creatingActivity: false } };
        case types.IMPORT_PROGRESS_CHANGE:
            return { ...state, ...{ importProgress: action.payload } };
        case types.INTERPOLATE_SHOW:
            return { ...state, ...{ interpolationWidget: true } };
        case types.INTERPOLATE_HIDE:
            return { ...state, ...{ interpolationWidget: false } };
        case types.INTERPOLATE + '_FULFILLED':
            var annotationDetectionContainer = state.annotationDetectionContainer;
            for (let detection of action.payload.newDetections) {
                annotationDetectionContainer = annotationDetectionContainer.change(detection.ts0, action.payload.trackId, detection.g0, { src: detection.src });
            }
            return { ...state, ...{ annotationDetectionContainer, pendingSave: true } };
        default:
            return state;
    }
}

export default app;
