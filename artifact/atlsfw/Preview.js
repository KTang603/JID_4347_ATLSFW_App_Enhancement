import { Text, SafeAreaView,TouchableOpacity, Button, View, StyleSheet } from 'react-native';
import React from 'react'

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
export default function Preview({navigation}) {
    return (
    <SafeAreaView style={styles.container}>
    <View>
      <Text> Hello </Text>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  
});