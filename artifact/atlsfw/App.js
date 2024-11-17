import {
  Text,
  SafeAreaView,
  TouchableOpacity,
  Button,
  View,
  StyleSheet,
} from 'react-native';
import React from 'react'


// You can import supported modules from npm
import { Card } from 'react-native-paper';

// or any files within the Snack
import AssetExample from './components/AssetExample';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Editor from './Editor';
import Preview from './Preview';

const Stack = createNativeStackNavigator();
export default function App() {
  return (
    <NavigationContainer initialRouteName = "Editor">
      <Stack.Navigator>
        <Stack.Screen name="Editor" component={Editor} />
        <Stack.Screen name="Preview" component={Preview} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  header: {
    //flex: 1,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    top: -330
  },
  preview: {
    //position:'absolute',
    flexDirection: "row",
    bottom: -350,
    alignItems:'center',
    justifyContent:'center'

  }
});