import React, { useEffect } from 'react'
import {View, Text, ActivityIndicator} from 'react-native'
import {getUserId, getUserToken} from '../utils/StorageUtils'
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from 'react-redux';
import {fetchTags} from '../redux/actions/NewsAction'
import { getProfileData } from '../redux/actions/userInfoAction';
import { setToken } from '../redux/actions/tokenAction';
import { login } from '../redux/actions/loginAction';

const SplashPage = () => {
   const navigation = useNavigation()
   const dispatch = useDispatch();

   const checkUserId = async () => {
     const userId = await getUserId();
     if(userId == null){
       navigation.replace('Log In')
     } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'News Feed' }],
      });
     }
   }

   const networkCall = async () => {
      const token = await getUserToken();
      if(token) {
        // Set token in Redux state
        dispatch(setToken(token));
        dispatch(login());
        
        // Set axios default headers (optional, but recommended for consistency)
        // This would require importing axios here
        // axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch initial data
        dispatch(fetchTags(token)) 
        dispatch(getProfileData())       
      }
   }

    useEffect(() => {
      networkCall();
      setTimeout(() => {
        checkUserId();
      }, 3000)
    }, [])

  return (
    <View style={{backgroundColor:'#02833D',flex:1,alignItems:'center',justifyContent:'center'}} >
        <Text style={{fontSize:30,color:'#fff'}}>Splash Page</Text>
        <ActivityIndicator size="large" color="#ffffff" style={{marginTop: 20}} />
    </View>
  )
}

export default SplashPage