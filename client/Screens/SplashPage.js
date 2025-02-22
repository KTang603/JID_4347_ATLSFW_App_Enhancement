import React, { useEffect } from 'react'
import {View,Text} from 'react-native'
import {getUserId} from '../utils/StorageUtils'
import { useNavigation } from "@react-navigation/native";

const SplashPage = () => {
   const navigation = useNavigation()


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

    useEffect(()=>{
      setTimeout(()=>{
        checkUserId();
      },3000)
    },[])


  return (
    <View style={{backgroundColor:'#ff0000',flex:1,alignItems:'center',justifyContent:'center'}} >
        <Text style={{fontSize:30,color:'#fff'}}>Splash Page</Text>
    </View>
  )
}

export default SplashPage
