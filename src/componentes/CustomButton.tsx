import { ComponentProps } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
type CustomButtonProps = {
  title: string;
  iconName?: string;
  isSelected?: boolean;
  disable?: boolean;
} & ComponentProps<typeof Pressable>;

export default function CustomButton({
  title,
  iconName,
  isSelected = false,
  disable = false,
  ...PressableProps
}: CustomButtonProps) {
  return (
    <Pressable
      {...PressableProps}
      disabled={disable}
      style={[
        styles.button,
        isSelected && styles.selected,
        disable && styles.disabled,
      ]}
    >
      {iconName && <FontAwesome5 name={iconName} size={24} color="#fff" />}
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#0ab546",
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  selected: {
    backgroundColor: "orange",
  },
  disabled: {
    backgroundColor: "gray",
  },
});
