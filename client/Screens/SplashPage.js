import React, { useEffect } from 'react'
import {View,Text,Image} from 'react-native'
import {getUserId, getUserToken} from '../utils/StorageUtils'
import { useNavigation } from "@react-navigation/native";
import { useDispatch } from 'react-redux';
import {fetchData, fetchTags} from '../redux/actions/NewsAction'
import { getProfileData, updateUserToken } from '../redux/actions/userInfoAction';
import {SPLASH_LOGO} from '../assets/index'

const SplashPage = () => {
   const navigation = useNavigation()
   const dispatch = useDispatch();


   const checkUserId =  async ()=>{
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

   const networkCall = async ()=>{
      const token = await getUserToken();
      if(token){
        dispatch(updateUserToken(token)) 
        dispatch(fetchTags(token)) 
        dispatch(getProfileData()) 
        dispatch(fetchData(1, true, [],token));
      
      }
   }

    useEffect(()=>{
      networkCall();
      setTimeout(()=>{
        checkUserId();
      },3000)
    },[])


  return (
    <View style={{backgroundColor:'#02833D',flex:1,alignItems:'center',justifyContent:'center'}} >
        <Image resizeMode='contain' style={{width:200,height:200}} source={SPLASH_LOGO} />
    </View>
  )
}

export default SplashPage
