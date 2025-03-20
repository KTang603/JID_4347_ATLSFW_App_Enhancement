import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";

const BaseIndicator = () => {
  return (
    <ActivityIndicator
      style={style.loadingOverlay}
      color={"#02833D"}
      size={"large"}
    />
  );
};
const style = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BaseIndicator;
