import React from 'react'
import {TouchableOpacity,StyleSheet,Text} from 'react-native'

const AppPrimaryButton = (props) => {

 const {containerStyle = styles.buttonWrapper, title,handleSubmit,disabled=false} =props;

  return <TouchableOpacity
    style={containerStyle}
    disabled={disabled}
    onPress={(view) => {
      handleSubmit();
    }}
  >
    <Text style={styles.buttonTextWrapper}>{title}</Text>
  </TouchableOpacity>
}

const styles = StyleSheet.create({
    buttonWrapper: {
        backgroundColor: "lightgray",
        borderRadius: 3,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginTop: 15,
        paddingVertical: 12,
      },
      buttonTextWrapper: {
        fontSize: 18,
        fontWeight: "500",
        color: "black",
        textAlign: "center",
      },
})




export default AppPrimaryButton
