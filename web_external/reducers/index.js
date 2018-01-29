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
            annotationActivityContainer: null,
            annotationTypeContainer: null,
            annotationGeometryContainer: null,
            currentFrame: 0,
            maxFrame: null,
            geomItem: null,
            selectedAnnotation: null,
            selectedTrackId: null,
            selectedActivityId: null,
            editingTrackId: null,
            saving: false,
            pendingSave: false,
            requestFrameRange: null,
            creatingActivity: false
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
            return { ...state, ...{ loadingAnnotation: true, geomItem: null, selectedAnnotation: null, selectedTrackId: null, editingTrackId: null, annotationTypeContainer: null, annotationGeometryContainer: null, annotationActivityContainer: null } };
        case types.LOAD_ANNOTATION + '_FULFILLED':
            return { ...state, ...action.payload, ...{ loadingAnnotation: false } };
        case types.LOAD_ANNOTATION + '_REJECTED':
            return { ...state, ...{ loadingAnnotation: false } };
        case types.TOGGLE_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.toggleState(action.payload.activity.id2, action.payload.enabled);
            return { ...state, ...{ annotationActivityContainer } };
        case types.TOGGLE_TRACK:
            var annotationGeometryContainer = state.annotationGeometryContainer.toggleState(action.payload.track, action.payload.enabled);
            return { ...state, ...{ annotationGeometryContainer } };
        case types.ANNOTATION_CLICKED:
            return { ...state, ...{ selectedAnnotation: action.payload, selectedTrackId: action.payload ? action.payload.geometry.id1 : null, editingTrackId: null, selectedActivityId: null } };
        case types.EDITING_TRACK:
            return { ...state, ...{ editingTrackId: action.payload } };
        case types.SET_GEOM_ITEM:
            return { ...state, ...{ geomItem: action.payload } };
        case types.CHANGE_GEOM:
            var annotationGeometryContainer = state.annotationGeometryContainer.change(action.payload.frame, action.payload.trackId, action.payload.g0);
            return { ...state, ...{ annotationGeometryContainer, pendingSave: true } };
        case types.DELETE_GEOM:
            var annotationGeometryContainer = state.annotationGeometryContainer.remove(action.payload.frame, action.payload.trackId);
            return { ...state, ...{ annotationGeometryContainer, pendingSave: true } };
        case types.SAVE + '_PENDING':
            return { ...state, ...{ saving: true } };
        case types.SAVE + '_FULFILLED':
            return { ...state, ...action.payload, pendingSave: false, saving: false };
        case types.FOCUS_TRACK:
            var range = state.annotationGeometryContainer.getTrackFrameRange(action.payload);
            return { ...state, ...{ requestFrameRange: [range[0], range[1]], selectedTrackId: action.payload, selectedActivityId: null, editingTrackId: null } };
        case types.GOTO_TRACK_START:
        case types.GOTO_TRACK_END:
            var range = state.annotationGeometryContainer.getTrackFrameRange(action.payload);
            return { ...state, ...{ requestFrame: { frame: action.type === types.GOTO_TRACK_START ? range[0] : range[1] }, selectedTrackId: action.payload, selectedActivityId: null, editingTrackId: null } };
        case types.NEW_TRACK:
            var annotationGeometryContainer = state.annotationGeometryContainer.newTrack(action.payload.trackId);
            var annotationTypeContainer = state.annotationTypeContainer.newType(action.payload.trackId, action.payload.cset3);
            return { ...state, ...{ editingTrackId: action.payload.trackId, annotationGeometryContainer, annotationTypeContainer } };
        case types.CHANGE_TRACK:
            var annotationGeometryContainer = state.annotationGeometryContainer.changeTrack(action.payload.trackId, action.payload.newTrackId);
            var annotationTypeContainer = state.annotationTypeContainer.change(action.payload.trackId, action.payload.newTrackId, action.payload.newCset3);
            // to do change track id inside activity
            return { ...state, ...{ annotationGeometryContainer, annotationTypeContainer, pendingSave: true, selectedTrackId: action.payload.newTrackId } };
        case types.SELECT_TRACK:
            return { ...state, ...{ selectedTrackId: action.payload, selectedActivityId: null, editingTrackId: null } };
        case types.GOTO_ACTIVITY_START:
        case types.GOTO_ACTIVITY_END:
            var range = state.annotationActivityContainer.getActivityFrameRange(action.payload);
            return { ...state, ...{ requestFrame: { frame: action.type === types.GOTO_ACTIVITY_START ? range[0] : range[1] }, selectedActivityId: action.payload, selectedTrackId: null, editingTrackId: null } };
        case types.SELECT_ACTIVITY:
            return { ...state, ...{ selectedActivityId: action.payload, selectedTrackId: null, editingTrackId: null } };
        case types.CHANGE_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.change(action.payload.activityId, action.payload.newActivityAct2, action.payload.newTimespan);
            return { ...state, ...{ annotationActivityContainer, pendingSave: true } };
        case types.NEW_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.new(action.payload);
            return { ...state, ...{ annotationActivityContainer, pendingSave: true } };
        case types.CHANGE_TRACK_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.changeTrackActivity(action.payload.activityId, action.payload.trackId, action.payload.newTimespan);
            return { ...state, ...{ annotationActivityContainer, pendingSave: true } };
        case types.SELECT_TRACK_ACTIVITY:
            return { ...state, ...{ selectedActivityId: action.payload.activityId, selectedTrackId: action.payload.trackId, editingTrackId: null } };
        case types.CURRENT_FRAME_CHANGE:
            return { ...state, ...{ currentFrame: action.payload } };
        case types.MAX_FRAME_CHANGE:
            return { ...state, ...{ maxFrame: action.payload } };
        case types.CREATE_ACTIVITY_START:
            return { ...state, ...{ creatingActivity: true } };
        case types.CREATE_ACTIVITY_END:
            return { ...state, ...{ creatingActivity: false } };
        default:
            return state;
    }
}

export default app;
