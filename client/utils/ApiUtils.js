import MY_IP_ADDRESS from '../environment_variables.mjs';
const BASE_URL = MY_IP_ADDRESS;
const PORT_NUMBER = 5050;

//API LIST
export const LOGIN_API = `http://${BASE_URL}:${PORT_NUMBER}/login`;
export default {LOGIN_API};
