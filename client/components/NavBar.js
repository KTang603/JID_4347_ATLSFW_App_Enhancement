
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { Button, View, StyleSheet, Text, Image, Pressable, TouchableOpacity, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useSelector, useDispatch } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';

const NavBar = ({ currentScreen = 'Home' }) => {
  const navigation = useNavigation();
  
  // Animation values for each tab
  const homeAnimation = useRef(new Animated.Value(currentScreen === 'Home' ? 1 : 0)).current;
  const eventsAnimation = useRef(new Animated.Value(currentScreen === 'Events' ? 1 : 0)).current;
  const newsFeedAnimation = useRef(new Animated.Value(currentScreen === 'News Feed' ? 1 : 0)).current;
  const savedAnimation = useRef(new Animated.Value(currentScreen === 'Saved Articles' ? 1 : 0)).current;
  const shopAnimation = useRef(new Animated.Value(0)).current; // Shop is not implemented yet
  const profileAnimation = useRef(new Animated.Value(currentScreen === 'Profile' ? 1 : 0)).current;

  // Update animations when screen changes
  useEffect(() => {
    console.log("Current screen changed to:", currentScreen);
    
    // Reset all animations first
    homeAnimation.setValue(0);
    eventsAnimation.setValue(0);
    newsFeedAnimation.setValue(0);
    savedAnimation.setValue(0);
    shopAnimation.setValue(0);
    profileAnimation.setValue(0);
    
    // Then animate the current tab
    let activeAnimation;
    switch (currentScreen) {
      case 'Home':
        activeAnimation = homeAnimation;
        break;
      case 'Events':
        activeAnimation = eventsAnimation;
        break;
      case 'News Feed':
        activeAnimation = newsFeedAnimation;
        break;
      case 'Saved Articles':
        activeAnimation = savedAnimation;
        break;
      case 'Profile':
        activeAnimation = profileAnimation;
        break;
      default:
        return;
    }
    
    // Animate the active tab
    Animated.timing(activeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
      easing: Easing.out(Easing.elastic(1.2))
    }).start();
  }, [currentScreen, homeAnimation, eventsAnimation, newsFeedAnimation, savedAnimation, shopAnimation, profileAnimation]);

  // Animation styles
  const getAnimatedStyle = (animation) => {
    return {
      transform: [
        { scale: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1]
          })
        },
        { translateY: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -5]
          })
        }
      ],
      opacity: animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 1]
      })
    };
  };

  // Get text style based on active state
  const getTextStyle = (isActive) => {
    return {
      color: 'white',
      fontWeight: isActive ? 'bold' : 'normal',
      marginTop: isActive ? 0 : 5
    };
  };

  return (
    <View>
      {/* Nav Bar */}
      <View style={styles.navBar}>
        {/* Home Button */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          }}
        >
          <Animated.View style={getAnimatedStyle(homeAnimation)}>
            <Icon name="home" size={24} color="white" />
          </Animated.View>
          <Text style={getTextStyle(currentScreen === 'Home')}>Home</Text>
        </TouchableOpacity>

        {/* Events Button */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ 
                name: 'Events',
                params: { showAll: true }
              }],
            });
          }}
        >
          <Animated.View style={getAnimatedStyle(eventsAnimation)}>
            <Icon name="calendar" size={24} color="white" />
          </Animated.View>
          <Text style={getTextStyle(currentScreen === 'Events')}>Events</Text>
        </TouchableOpacity>

        {/* News Feed Button */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'News Feed' }],
            });
          }}
        >
          <Animated.View style={getAnimatedStyle(newsFeedAnimation)}>
            <Icon name="newspaper-o" size={24} color="white" />
          </Animated.View>
          <Text style={getTextStyle(currentScreen === 'News Feed')}>News Feed</Text>
        </TouchableOpacity>

        {/* Saved Articles Button */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Saved Articles' }],
            });
          }}
        >
          <Animated.View style={getAnimatedStyle(savedAnimation)}>
            <Icon name="bookmark" size={24} color="white" />
          </Animated.View>
          <Text style={getTextStyle(currentScreen === 'Saved Articles')}>Saved</Text>
        </TouchableOpacity>

        {/* Shop Button */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => {
            // Shop functionality not implemented yet
          }}
        >
          <Animated.View style={getAnimatedStyle(shopAnimation)}>
            <Icon name="shopping-cart" size={24} color="white" />
          </Animated.View>
          <Text style={styles.whiteText}>Shop</Text>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Profile' }],
            });
          }}
        >
          <Animated.View style={getAnimatedStyle(profileAnimation)}>
            <Icon name="user" size={24} color="white" />
          </Animated.View>
          <Text style={getTextStyle(currentScreen === 'Profile')}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#02833D',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)'
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    position: 'relative',
    minWidth: 60
  },
  whiteText: {
    color: 'white',
    marginTop: 5
  }
});

export default NavBar;
