import axios from "axios";
import { GET_PROFILE_API } from "../../utils/ApiUtils";
import { getUserId, getUserToken } from "../../utils/StorageUtils";

export const setUserInfo = (userData) => {
  return {
    type: 'SET_USER_INFO',
    payload: userData,
  };
};


export const getProfileData =  () => async (dispatch,getState) => {
  try {
    const token = await getUserToken();
    const userId = await getUserId();
    const response = await axios(
       {
        method:'GET',
        url: GET_PROFILE_API,
        params: {
          userId:userId
        },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.data) {
      dispatch(setUserInfo(response.data))
    }
  } catch (error) {
    console.error("Error fetching profile:", error.message);
  }
};