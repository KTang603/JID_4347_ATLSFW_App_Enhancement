import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import { useDispatch, useSelector } from "react-redux";
import AppPrimaryButton from '../components/AppPrimaryButton';
import { setUserInfo, updateDispcoveryInfo } from '../redux/actions/userInfoAction';

const DiscoveryPageCreation = () => {
  const userInfo = useSelector((store) => store.userInfo.userInfo);
  const dispatch = useDispatch();
  
  // Get values from shop_info if it exists
  let brandNameValue = userInfo.shop_info?.brand_name ?? '';
  let shopNowLinkValue = userInfo.shop_info?.shop_now_link ?? '';
  let titleValue = userInfo.shop_info?.url ?? ''; // title is stored as url
  let introValue = userInfo.shop_info?.social_link ?? ''; // intro is stored as social_link

  // Use useEffect to update state when userInfo changes
  React.useEffect(() => {
    setBrandName(userInfo.shop_info?.brand_name ?? '');
    setShopNowLink(userInfo.shop_info?.shop_now_link ?? '');
    setTitle(userInfo.shop_info?.url ?? '');
    setIntro(userInfo.shop_info?.social_link ?? '');
  }, [userInfo]);

  const [brandName, setBrandName] = useState(brandNameValue);
  const [shopNowLink, setShopNowLink] = useState(shopNowLinkValue);
  const [title, setTitle] = useState(titleValue);
  const [intro, setIntro] = useState(introValue);

  const handleSubmit = async () => {
    try {
      if (brandName.trim().length == 0) {
        Alert.alert("Error", "Brand Name cannot be empty");
      } else if (shopNowLink.trim().length == 0) {
        Alert.alert("Error", "Shop Now Link cannot be empty");
      } else if (title.trim().length == 0) {
        Alert.alert("Error", "Vendor Role Title cannot be empty");
      } else if (intro.trim().length == 0) {
        Alert.alert("Error", "Organization Bio cannot be empty");
      } else {   
        const response = await updateDispcoveryInfo(userInfo["_id"], brandName, shopNowLink, title, intro)
        if (response.status == 200) {
          Alert.alert(response.data.message);
          dispatch(setUserInfo(response.data.user));
        } else {
          Alert.alert('Error', response.data.message);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while creating the discovery page');
    }
  }
  
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Brand Name" onChangeText={setBrandName} value={brandName}/>
        <TextInput style={styles.input} placeholder="Shop Now Link" onChangeText={setShopNowLink} value={shopNowLink}/>
        <TextInput style={styles.input} placeholder="Image URL" onChangeText={setTitle} value={title}/>
        <TextInput style={styles.input} placeholder="Social Media Link" onChangeText={setIntro} value={intro}/>
        <AppPrimaryButton title="Submit Information" handleSubmit={handleSubmit}/>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
});

export default DiscoveryPageCreation;
