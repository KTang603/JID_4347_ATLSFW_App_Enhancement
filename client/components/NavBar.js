
import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { Button, View, StyleSheet, Text, Image, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';

const NavBar = () => {
  const navigation = useNavigation();
  const isLogged = useSelector((store) => store.isLogged.isLogged);
    const handleProfileClick = () => {
      if (isLogged) {
        // navigation.navigate('Profile'); // Navigate to Profile if logged in
        navigation.reset({ index: 0, routes: [{ name: 'Profile' }], });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'Log In' }], });
      }
    }

  return (
        <View>
        {/* Nav Bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#02833D', padding: 10 }}>
          {/* Navigation Buttons */}
          <TouchableOpacity style={{ alignItems: 'center' }}>
              <Icon name="home" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Events' }],
            });
          }}>             
              <Icon name="calendar" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'News Feed' }],
            });
          }}>
              <Icon name="newspaper-o" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>News Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Saved Articles' }],
            });
          }}>
              <Icon name="bookmark" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.navigate('Shop Now Webview', {
              link: 'https://expo.dev',  // for test
            });
          }}>              
              <Icon name="shopping-cart" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Shop</Text>

          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            if (isLogged) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Profile' }],
              });
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Log In' }],
              });
            }
          }}>
              <Icon name="user" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Profile</Text>
          </TouchableOpacity>
        </View>

      {/* LOGO */}
      <View style={{ alignItems: "center", paddingBottom: 20 }}>
        <Image
          source={require("./ATLSFWlogo.jpg")}
          style={{ width: 150, height: 50, resizeMode: "contain" }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  whiteText: {
    color: 'white',
  },
});

export default NavBar;
