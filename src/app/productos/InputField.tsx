import { StyleSheet, TextInput, View } from "react-native";
import React from "react";

interface InputFieldProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder: string;
}

export default function InputField({
  value,
  onChangeText,
  placeholder,
}: InputFieldProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
  },
});
