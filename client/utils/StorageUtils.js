
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeUserId = async (value) => {
    try {
      await AsyncStorage.setItem('userId', value);
    } catch (e) {
      // saving error
    }
  };

  export const getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem('userId');
      return value;

    } catch (e) {
      return null
      // error reading value
    }
  };

  export const storeAccountType = async (value) => {
    try {
      await AsyncStorage.setItem('accountType', value);
    } catch (e) {
      // saving error
    }
  };

  export const getAccountType = async () => {
    try {
      const value = await AsyncStorage.getItem('accountType');
      return value;

    } catch (e) {
      return null
      // error reading value
    }
  };

  export default {storeUserId,getUserId}