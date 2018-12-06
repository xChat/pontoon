/* @flow */

import api from 'core/api';

export const UPDATE_COMMENTS: 'review/UPDATE_COMMENTS' = 'review/UPDATE_COMMENTS';
export const UPDATE_SUGGESTIONS: 'review/UPDATE_SUGGESTIONS' = 'review/UPDATE_SUGGESTIONS';


export type UpdateSuggestionsAction = {
    +type: typeof UPDATE_SUGGESTIONS,
    +data: Array,
};
export function updateSuggestions(data: Object): UpdateSuggestionsAction {
    return {
        type: UPDATE_SUGGESTIONS,
        data,
    };
}


export type UpdateCommentsAction = {
    +type: typeof UPDATE_COMMENTS,
    +data: Array,
};
export function updateComments(data: Object): UpdateCommentsAction {
    return {
        type: UPDATE_COMMENTS,
        data,
    };
}


export function get(locale: string, project: string): Function {
    return async dispatch => {
        const content = await api.translation.getUnreviewed(locale, project);
        dispatch(updateSuggestions(content.data.unreviewedTranslations));
    }
}


export function addComment(translation: string, comment: string): Function {
    return async dispatch => {
        await api.comment.add(translation, comment);
        dispatch(getComments(translation));
    };
}


export function getComments(translation: string): Function {
    return async dispatch => {
        const content = await api.comment.getAll(translation);
        dispatch(updateComments(content.data.translation.comments));
    }
}


export default {
    addComment,
    get,
    getComments,
    updateComments,
    updateSuggestions,
};
