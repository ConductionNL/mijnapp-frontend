import {
  SET_JOURNEY,
  ADD_LINK_TO_QUESTION_NEXT,
  ADD_LINK_TO_QUESTION_SKIP,
  ADD_LINK_TO_QUESTION_OPTION,
  ADD_QUESTION,
  DELETE_QUESTION,
  DELETE_QUESTION_PREFLIGHT,
  SET_QUESTION_TYPE,
  SET_QUESTION_TITLE,
  SET_QUESTION_KEY,
  SET_QUESTION_SUBTITLE,
  SET_TITLE,
  ADD_QUESTION_OPTION,
  DELETE_QUESTION_OPTION,
  SET_QUESTION_OPTION_GOTO,
  SET_QUESTION_OPTION_TITLE,
  SET_QUESTION_OPTION_VALUE,
  REQUEST_CHECK_PRECONDITIONS_SUCCESS,
  REQUEST_CHECK_PRECONDITIONS_FAILURE
} from '../actions/journey';
import { isOptionsType, isDirectionalOptionsType } from '../../helpers/common';
import { REQUEST_JWT_LOGOUT_SUCCESS } from '../actions/jwt';

export const journey = (state = { title: '', questions: [] }, action) => {
  switch (action.type) {
    case SET_JOURNEY:
    {
      if (state.preconditionsFullFilled) {
          delete state.preconditionsFullFilled;
      }
      if (action.journey.preconditionsFullFilled) {
          delete action.journey.preconditionsFullFilled;
      }
      action.journey.preconditionsBeingChecked = true;
      return action.journey;
    }
    case ADD_QUESTION:
      return {
        ...state,
        questions: [...state.questions, action.question],
      };
    case SET_TITLE:
      return {
        ...state,
        title: action.title,
      };
    case REQUEST_CHECK_PRECONDITIONS_SUCCESS:
      return {
        ...state,
        preconditionsFullFilled: action.data !== undefined ? action.data.preconditionsFullFilled : false,
        preconditionsBeingChecked: false,
      };
    case REQUEST_CHECK_PRECONDITIONS_FAILURE:
      return {
         ...state,
         preconditionsFullFilled: false,
         preconditionsBeingChecked: false,
      };
    case ADD_LINK_TO_QUESTION_NEXT:
    case ADD_LINK_TO_QUESTION_SKIP:
    case ADD_LINK_TO_QUESTION_OPTION:
    case SET_QUESTION_TYPE:
    case SET_QUESTION_TITLE:
    case SET_QUESTION_KEY:
    case SET_QUESTION_SUBTITLE:
    case ADD_QUESTION_OPTION:
    case DELETE_QUESTION_OPTION:
    case SET_QUESTION_OPTION_GOTO:
    case SET_QUESTION_OPTION_TITLE:
    case SET_QUESTION_OPTION_VALUE: {
      if (action.id === 'START') {
        return {
          ...state,
          overview: overview(state.overview, action),
        };
      }
      return {
        ...state,
        questions: state.questions.map(
          (q) => (action.id === q.id ? question(q, action) : q)
        ),
      };
    }
    case DELETE_QUESTION:
      if (action.id !== 'START') {
        if (
          action.id &&
          state.questions.length > 0 &&
          state.questions[0].id &&
          state.questions[0].id === action.id
        ) {
          // If deleted item was first item move resolver to front
          return {
            ...state,
            questions: [
              ...state.questions
                .filter((q) => q.id === action.resolver)
                .map((q) => question(q, action)),
              ...state.questions
                .filter((q) => q.id !== action.id && q.id !== action.resolver)
                .map((q) => question(q, action)),
            ],
          };
        }
        return {
          ...state,
          questions: state.questions
            .filter((q) => q.id !== action.id)
            .map((q) => question(q, action)),
        };
      }
      return state;
    case REQUEST_JWT_LOGOUT_SUCCESS:
      return { title: '', questions: [] };
    case DELETE_QUESTION_PREFLIGHT:
    default:
      return {
        ...state,
        overview: overview(state.overview, action),
      };
  }
};

const overview = (
  state = { needed_documents: [], send_to: [], steps: [], subtitle: '' },
  action
) => {
  switch (action.type) {
    case SET_QUESTION_SUBTITLE:
      return {
        ...state,
        subtitle: action.subtitle,
      };
    default:
      return state;
  }
};

const question = (state, action) => {
  switch (action.type) {
    case ADD_LINK_TO_QUESTION_NEXT:
      return {
        ...state,
        next: action.link,
      };

    case ADD_LINK_TO_QUESTION_SKIP:
      return {
        ...state,
        optional: {
          ...(state.optional || {}),
          goto: action.link,
        },
      };

    case ADD_LINK_TO_QUESTION_OPTION:
      return {
        ...state,
        options: (state.options || []).map(
          (o, i) =>
            i === action.option ? { ...(o || {}), goto: action.link } : o
        ),
      };
    case DELETE_QUESTION: {
      let returnable = { ...state };
      // Resolve next
      if (state.next && action.id && state.next === action.id) {
        returnable.next = action.resolver || null;
        if (!returnable.next) {
          delete returnable.next;
        }
      }
      // Resolve skip
      if (
        state.optional &&
        state.optional.goto &&
        action.id &&
        state.optional.goto === action.id
      ) {
        returnable.optional.goto = action.resolver || null;
        if (!returnable.optional.goto) {
          delete returnable.optional;
        }
      }
      // Resolve options
      if (state.options && state.options.length > 0) {
        returnable.options = state.options.map((o) => {
          let option = { ...o };
          if (o.goto === action.id) {
            option.goto = action.resolver || null;
          }
          return option;
        });
      }
      return returnable;
    }
    case SET_QUESTION_TYPE: {
      let typeFields = {};
      return {
        ...state,
        type: action.questionType,
        options: isOptionsType(action.questionType)
          ? (state.options || []).map((o) => option(o, action))
          : null,
        ...typeFields,
      };
    }
    case SET_QUESTION_TITLE:
      return {
        ...state,
        title: action.title,
      };
    case SET_QUESTION_SUBTITLE:
      return {
        ...state,
        subtitle: action.subtitle,
      };
    case SET_QUESTION_KEY:
      return {
        ...state,
        key: action.key,
      };
    case ADD_QUESTION_OPTION:
      return {
        ...state,
        options: [...state.options, option()],
      };
    case DELETE_QUESTION_OPTION:
      return {
        ...state,
        options: state.options.filter((_, i) => i !== action.index),
      };
    case SET_QUESTION_OPTION_GOTO:
    case SET_QUESTION_OPTION_TITLE:
    case SET_QUESTION_OPTION_VALUE:
      return {
        ...state,
        options: state.options.map(
          (o, i) => (i === action.index ? option(o, action) : o)
        ),
      };
    default:
      return state;
  }
};

const option = (state = { goto: null, title: null, value: null }, action) => {
  switch (action ? action.type : '') {
    case SET_QUESTION_OPTION_GOTO:
      return { ...state, goto: action.gotoValue };
    case SET_QUESTION_OPTION_TITLE:
      return { ...state, title: action.title };
    case SET_QUESTION_OPTION_VALUE:
      return { ...state, value: action.value };
    case SET_QUESTION_TYPE:
      return {
        ...state,
        goto:
          isDirectionalOptionsType(action.questionType) && state.goto
            ? state.goto
            : null,
      };
    default:
      return state;
  }
};
