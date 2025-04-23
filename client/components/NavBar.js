import { NavigationContainer, useNavigation, useRoute } from '@react-navigation/native';
import { Button, View, StyleSheet, Text, Image, Pressable, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';

const NavBar = () => {
  const navigation = useNavigation();

  return (
        <View>
        {/* Nav Bar */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: '#02833D', padding: 10 }}>
          {/* Navigation Buttons */}
          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}>
              <Icon name="home" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            // Navigate to Events screen and clear selected date to show all events
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'Events',
                params: { showAll: true } // Pass parameter to show all events
              }],
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
            navigation.reset({
              index: 0,
              routes: [{ name: 'Shop' }],
            });
          }}>              
              <Icon name="shopping-cart" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Shop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center' }} onPress={() => {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Profile' }],
              })
          }}>
              <Icon name="user" size={20} color="white" alignItems="center"/>
              <Text style={styles.whiteText}>Profile</Text>
          </TouchableOpacity>
          
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
