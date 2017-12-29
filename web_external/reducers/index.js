import * as types from '../actions/types';
import { getCurrentUser } from 'girder/auth';

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
            annotationTrackContainer: null,
            selectedAnnotation: null,
            editingTrackId: null,
            saving: false
        }
    }
    switch (action.type) {
        case types.LOGIN_STATE_CHANGE:
            return { ...state, ...{ user: action.user } };
        case types.SELECTED_FOLDER_CHANGE:
            return { ...state, ...{ selectedFolder: action.folder } };
        case types.SELECTED_ITEM_CHANGE:
            return { ...state, ...{ selectedItem: action.payload } };
        case types.ANNOTATIONS_LOADED + '_PENDING':
            return { ...state, ...{ loadingAnnotation: true } };
        case types.ANNOTATIONS_LOADED + '_FULFILLED':
            return { ...state, ...action.payload, ...{ loadingAnnotation: false } };
        case types.ANNOTATIONS_LOADED + '_REJECTED':
            return { ...state, ...{ loadingAnnotation: false } };
        case types.TOGGLE_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.toggleState(action.payload.activity.id2, action.payload.enabled);
            return { ...state, ...{ annotationActivityContainer } };
        case types.TOGGLE_TRACK:
            var annotationTrackContainer = state.annotationTrackContainer.toggleState(action.payload.track, action.payload.enabled);
            return { ...state, ...{ annotationTrackContainer } };
        case types.ANNOTATION_CLICKED:
            return { ...state, ...{ selectedAnnotation: action.payload } };
        case types.EDITING_TRACK:
            return { ...state, ...{ editingTrackId: action.payload } };
        case types.CHANGE_GEOM:
            var annotationGeometryContainer = state.annotationGeometryContainer.change(action.payload.frame, action.payload.trackId, action.payload.g0);
            return { ...state, ...{ annotationGeometryContainer } };
        case types.SAVE + '_PENDING':
            return { ...state, ...{ saving: true } };
        case types.SAVE + '_FULFILLED':
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

export default app;
