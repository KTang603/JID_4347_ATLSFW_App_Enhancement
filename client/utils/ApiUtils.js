import MY_IP_ADDRESS from '../environment_variables.mjs';
const BASE_URL = MY_IP_ADDRESS;
const PORT_NUMBER = 5050;

//API LIST
export const LOGIN_API = `http://${BASE_URL}:${PORT_NUMBER}/login`;
export const GET_PROFILE_API = `http://${BASE_URL}:${PORT_NUMBER}/user/get_profile`;
export const CREATE_ARTICLE_API =`http://${MY_IP_ADDRESS}:5050/posts/create`;
export const CREATE_DISCOVERY_API =`http://${MY_IP_ADDRESS}:5050/vendor/discover/create/`;
export const SIGNUP_API =`http://${MY_IP_ADDRESS}:5050/signup`
export default {LOGIN_API, GET_PROFILE_API,CREATE_ARTICLE_API,CREATE_DISCOVERY_API,SIGNUP_API};


