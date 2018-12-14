/* @flow */

import api from 'core/api';

export const UPDATE_COMMENTS: 'review/UPDATE_COMMENTS' = 'review/UPDATE_COMMENTS';
export const UPDATE_SUGGESTIONS: 'review/UPDATE_SUGGESTIONS' = 'review/UPDATE_SUGGESTIONS';
export const UPDATE_TRANSLATION: 'review/UPDATE_TRANSLATION' = 'review/UPDATE_TRANSLATION';
export const RESET: 'review/RESET' = 'review/RESET';


export type UpdateTranslationAction = {
    +type: typeof UPDATE_TRANSLATION,
    +data: Array,
};
export function updateTranslation(data: Object): UpdateTranslationAction {
    return {
        type: UPDATE_TRANSLATION,
        data,
    };
}

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


export type ResetAction = {|
    +type: typeof RESET,
|};
export function reset(): ResetAction {
    return {
        type: RESET,
    };
}


export function get(locale: string, project: string): Function {
    return async dispatch => {
        const content = await api.translation.getUnreviewed(locale, project);
        dispatch(updateSuggestions(content.data.unreviewedTranslations));
    }
}


export function addComment(entity: string, translation: string, comment: string): Function {
    return async dispatch => {
        await api.comment.add(entity, translation, comment);
        dispatch(getComments(translation));
    };
}


export function getTranslation(translation: string): Function {
    return async dispatch => {
        const content = await api.translation.get(translation);
        dispatch(updateTranslation(content.data.translation));
        dispatch(updateComments(content.data.translation.comments));
    }
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
    getTranslation,
    updateComments,
    updateSuggestions,
    updateTranslation,
    reset,
};
