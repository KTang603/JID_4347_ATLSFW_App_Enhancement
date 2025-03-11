import axios from "axios";
import { SIGNUP_API } from "../../utils/ApiUtils";

export const login = () => {
    return {
      type: 'LOGIN',
    };
  };
   

export const makeSignup = async (userData) => {
  const response = await axios.post(
    SIGNUP_API,
    userData
  );
  return response.data;
  };

