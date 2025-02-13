
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
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Community' }],
            });
          }}>
              <Icon name="home" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Community' }],
            });
          }}>              
              <Icon name="calendar" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Community' }],
            });
          }}>              
              <Icon name="search" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Search</Text>
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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Sign Up' }],
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
              <Icon name="home" size={20} color="white" alignItems="center"/>
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
