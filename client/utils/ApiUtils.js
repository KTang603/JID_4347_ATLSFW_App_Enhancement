import MY_IP_ADDRESS from '../environment_variables.mjs';
const BASE_URL = MY_IP_ADDRESS;
const PORT_NUMBER = 5050;

//API LIST
export const LOGIN_API = `http://${BASE_URL}:${PORT_NUMBER}/login`;
export const GET_PROFILE_API = `http://${BASE_URL}:${PORT_NUMBER}/user/get_profile`;
export const CREATE_ARTICLE_API = `http://${BASE_URL}:${PORT_NUMBER}/posts/create`;
export const CREATE_DISCOVERY_API = `http://${BASE_URL}:${PORT_NUMBER}/vendor/discover/create/`;
export const SIGNUP_API = `http://${BASE_URL}:${PORT_NUMBER}/signup`;
export const ADD_PARTICIPANT = `http://${BASE_URL}:${PORT_NUMBER}/events/add_participant`;
export const PARTICIPANT_LISTS = `http://${BASE_URL}:${PORT_NUMBER}/events/participantlist`;
export const EVENT_LIST_API = `http://${BASE_URL}:${PORT_NUMBER}/events`;
export const ARTICLE_LIKE_API = `http://${BASE_URL}:${PORT_NUMBER}/posts/top_liked`;
export const ARTICLE_SAVE_API = `http://${BASE_URL}:${PORT_NUMBER}/posts/top_saved`;
export const ARTICLE_SAVED_API = `http://${BASE_URL}:${PORT_NUMBER}/posts/saved_articles`;
export const SHOP_ALL_API = `http://${BASE_URL}:${PORT_NUMBER}/vendor/shop/all`;

export default {
  ARTICLE_SAVED_API,
  ARTICLE_LIKE_API,
  ARTICLE_SAVE_API,
  PARTICIPANT_LISTS,
  EVENT_LIST_API,
  LOGIN_API,
  GET_PROFILE_API,
  CREATE_ARTICLE_API,
  CREATE_DISCOVERY_API,
  SIGNUP_API,
  ADD_PARTICIPANT,
  SHOP_ALL_API
};
