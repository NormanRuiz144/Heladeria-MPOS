import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useCartStore } from "../store/cartStore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Cart() {
  //   const { items, total } = useCartStore();
  // forma para subcribirse a un estado
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const subtotal = useCartStore((state) => state.subtotal);
  const impuestoAmount = useCartStore((state) => state.impuestoAmount);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.name}>{item.product.nombre}</Text>
            </View>
            <View style={styles.itemDetails}>
              <Text>{` C$${item.product.precio} x ${item.quantity} = C$${(item.product.precio * item.quantity).toFixed(2)} `}</Text>
              <View style={styles.controls}>
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.product.id, item.quantity - 1)
                  }
                >
                  <AntDesign name="minus" size={20} color="red" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity
                  onPress={() =>
                    updateQuantity(item.product.id, item.quantity + 1)
                  }
                >
                  <AntDesign name="plus" size={20} color="green" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(item.product.id)}>
                  <AntDesign name="delete" size={20} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLine}>Subtotal: C${subtotal.toFixed(2)}</Text>
        {impuestoAmount > 0 && (
          <Text style={styles.totalLine}>Impuesto: C${impuestoAmount.toFixed(2)}</Text>
        )}
        <Text style={styles.total}>Total: C${total.toFixed(2)}</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  item: {
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 5,
    borderRadius: 8,
  },
  itemDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontWeight: "bold",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  totalContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  totalLine: {
    fontSize: 16,
    textAlign: "right",
    color: "#555",
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "right",
  },
});
