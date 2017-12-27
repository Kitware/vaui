import { LOGIN_STATE_CHANGE, SELECTED_FOLDER_CHANGE } from '../actions'
import { getCurrentUser } from 'girder/auth';

function app(state, action) {
    if (typeof state === 'undefined') {
        return {
            user: getCurrentUser()
        }
    }
    switch (action.type) {
        case LOGIN_STATE_CHANGE:
            return { ...state, ...{ user: action.user } };
        case SELECTED_FOLDER_CHANGE:
            return { ...state, ...{ selectedFolder: action.folder } };
        default:
            return state;
    }
}

export default app;
