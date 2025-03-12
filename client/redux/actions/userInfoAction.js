import axios from "axios";
import { CREATE_DISCOVERY_API, GET_PROFILE_API } from "../../utils/ApiUtils";
import { getUserId, getUserToken } from "../../utils/StorageUtils";

export const setUserInfo = (userData) => {
  return {
    type: 'SET_USER_INFO',
    payload: userData,
  };
};


export const updateUserToken = (token) => {
  return {
    type: 'UPDATE_USER_TOKEN',
    payload: token,
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

export const updateDispcoveryInfo = async (vendor_id,brandName,shopNowLink,title,intro)=>{

  const url = CREATE_DISCOVERY_API+vendor_id;
  console.log('url-----'+url);
  const payload = {
    brand_name: brandName,
    shop_now_link: shopNowLink,
    title: title,
    intro: intro,
  };
  // console.log('payload----'+JSON.stringify(payload));
  const token = await getUserToken();
  const response = await axios.post(url, payload,{
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  return response;

}
