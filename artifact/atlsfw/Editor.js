import { Text, TextInput, SafeAreaView, TouchableOpacity, Button, View, StyleSheet } from 'react-native';
import React from 'react'
import {SelectList} from 'react-native-dropdown-select-list'
// You can import supported modules from npm
import { Card } from 'react-native-paper';

// or any files within the Snack
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';


export default function Editor({navigation}) {
  const [name, onChangeText] = React.useState('');
  const [address, onChangeAdd] = React.useState('');
  const theme = [
    {key:'1', value:'Red'},
    {key:'2', value:'Yellow'},
    {key:'3', value:'Brown'},
    {key:'4', value:'White'},
  ]
  return (
    
    <SafeAreaView style={styles.container}>
    <View>
    <Text style = {styles.header}> 
      Your Page
    </Text>
    </View>

    <View>
    <Text> Your Brand's Name
    </Text>
    <TextInput style = {styles.input}
      onChangeText={onChangeText}
      value = {name}
      placeholder = "Enter Title"
    />
    <Text> Your Address
    </Text>
    <TextInput style = {styles.input}
      onChangeText={onChangeAdd}
      value = {address}
      placeholder = "Enter Address"
    />

    <SelectList
      setSelected={(val)=>setSelected(val)}
      data={theme}
      save="value"
    />
    </View>

    <View style = {styles.preview}>
    <Button 
    title = "Preview"
    onPress ={() => navigation.navigate("Preview")}
    />
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
  header: {
    //flex: 1,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    flexDirection: "row",
    alignItems:'center',
  },
  preview: {
    //position:'absolute',
    flexDirection: "row",
    bottom: 0,
    alignItems:'center',
    justifyContent:'center'

  },
  input: {
    flexDirection: "row",
    height: 40,
    margin: 10,
    borderwidth: 1,
    padding: 10
  }
});