import { Text, SafeAreaView,TouchableOpacity, Button, View, StyleSheet } from 'react-native';
import React from 'react';
import {useRoute} from "@react-navigation/native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
export default function Preview({route}) {
    const { name } = route.params;
    const { color } = route.params;
    const { add } = route.params;
    return (
    
    <SafeAreaView style={styles.container}>
    styles.container.backgroundColor = "red"
    <View>
      <Text style = {styles.header}> {name} </Text>

      <Text style = {styles.subheader}> @{add} </Text>
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
    borderColor: 'red'
  },
   header: {
    //flex: 1,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    flexDirection: "row",
    alignItems:'center',
    top:-300,
  },
  subheader: {
    fontSize: 18,
    
    textAlign: 'center',
    padding: 10,
    flexDirection: "row",
    alignItems:'center',
    top:-290,
  }
  
});