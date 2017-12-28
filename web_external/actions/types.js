/*
 * action types
 */

export const LOGIN_STATE_CHANGE = 'LOGIN_STATE_CHANGE';
export const SELECTED_FOLDER_CHANGE = 'SELECTED_FOLDER_CHANGE';
export const SELECTED_ITEM_CHANGE = 'SELECTED_ITEM_CHANGE';
export const ANNOTATIONS_LOADED = 'ANNOTATIONS_LOADED';
export const TOGGLE_TRACK = 'TOGGLE_TRACK';
export const TOGGLE_ACTIVITY = 'TOGGLE_ACTIVITY';
export const ANNOTATIONS_CLICKED = 'ANNOTATIONS_CLICKED';
// export const TOGGLE_TODO = 'TOGGLE_TODO'
// export const SET_VISIBILITY_FILTER = 'SET_VISIBILITY_FILTER'

/*
 * action creators
 */

export function userLogon(user) {
  return { type: LOGIN_STATE_CHANGE, user }
}

// export function toggleTodo(index) {
//   return { type: TOGGLE_TODO, index }
// }

// export function setVisibilityFilter(filter) {
//   return { type: SET_VISIBILITY_FILTER, filter }
// }
