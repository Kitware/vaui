import { getCurrentUser } from 'girder/auth';

import * as types from '../actions/types';

function app(state, action) {
    if (typeof state === 'undefined') {
        return {
            user: getCurrentUser(),
            selectedFolder: null,
            selectedItem: null,
            loadingAnnotation: false,
            annotationActivityContainer: null,
            annotationTypeContainer: null,
            annotationGeometryContainer: null,
            geomItem: null,
            selectedAnnotation: null,
            selectedTrackId: null,
            selectedActivityId: null,
            editingTrackId: null,
            saving: false,
            pendingSave: false,
            requestFrameRange: null
        };
    }
    switch (action.type) {
        case types.LOGIN_STATE_CHANGE:
            return { ...state, ...{ user: action.user } };
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
            return { ...state, ...{ selectedAnnotation: action.payload, selectedTrackId: action.payload ? action.payload.geometry.id1 : null } };
        case types.EDITING_TRACK:
            return { ...state, ...{ editingTrackId: action.payload } };
        case types.SET_GEOM_ITEM:
            return { ...state, ...{ geomItem: action.payload } };
        case types.CHANGE_GEOM:
            var annotationGeometryContainer = state.annotationGeometryContainer.change(action.payload.frame, action.payload.trackId, action.payload.g0);
            return { ...state, ...{ annotationGeometryContainer, pendingSave: true } };
        case types.SAVE + '_PENDING':
            return { ...state, ...{ saving: true } };
        case types.SAVE + '_FULFILLED':
            return { ...state, ...action.payload, pendingSave: false };
        case types.FOCUS_TRACK:
            var range = state.annotationGeometryContainer.getTrackFrameRange(action.payload);
            return { ...state, ...{ requestFrameRange: [range[0], range[1]], selectedTrackId: action.payload } };
        case types.GOTO_TRACK_START:
        case types.GOTO_TRACK_END:
            var range = state.annotationGeometryContainer.getTrackFrameRange(action.payload);
            return { ...state, ...{ requestFrame: { frame: action.type === types.GOTO_TRACK_START ? range[0] : range[1] }, selectedTrackId: action.payload } };
        case types.NEW_TRACK:
            var annotationGeometryContainer = state.annotationGeometryContainer.newTrack(action.payload.trackId);
            return { ...state, ...{ editingTrackId: action.payload.trackId, annotationGeometryContainer } }
        case types.SELECT_TRACK:
            return { ...state, ...{ selectedTrackId: action.payload, selectedActivityId: null } };
        case types.SELECT_ACTIVITY:
            return { ...state, ...{ selectedActivityId: action.payload, selectedTrackId: null } };
        default:
            return state;
    }
}

export default app;
