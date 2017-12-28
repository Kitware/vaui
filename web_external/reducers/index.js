import {
    LOGIN_STATE_CHANGE,
    SELECTED_FOLDER_CHANGE,
    SELECTED_ITEM_CHANGE,
    ANNOTATIONS_LOADED,
    TOGGLE_ACTIVITY,
    TOGGLE_TRACK,
    ANNOTATIONS_CLICKED
} from '../actions/types'
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
            annotationTrackContainer: null
        }
    }
    switch (action.type) {
        case LOGIN_STATE_CHANGE:
            return { ...state, ...{ user: action.user } };
        case SELECTED_FOLDER_CHANGE:
            return { ...state, ...{ selectedFolder: action.folder } };
        case SELECTED_ITEM_CHANGE:
            return { ...state, ...{ selectedItem: action.payload } };
        case ANNOTATIONS_LOADED + '_PENDING':
            return { ...state, ...{ loadingAnnotation: true } };
        case ANNOTATIONS_LOADED + '_FULFILLED':
            return { ...state, ...action.payload, ...{ loadingAnnotation: false } };
        case ANNOTATIONS_LOADED + '_REJECTED':
            return { ...state, ...{ loadingAnnotation: false } };
        case TOGGLE_ACTIVITY:
            var annotationActivityContainer = state.annotationActivityContainer.toggleState(action.payload.activity.id2, action.payload.enabled);
            return { ...state, ...{ annotationActivityContainer } };
        case TOGGLE_TRACK:
            var annotationTrackContainer = state.annotationTrackContainer.toggleState(action.payload.track, action.payload.enabled);
            return { ...state, ...{ annotationTrackContainer } };
        case ANNOTATIONS_CLICKED:
            return { ...state, ...{ selectedAnnotations: action.payload } };
        default:
            return state;
    }
}

export default app;
