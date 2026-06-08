import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ProductSearch from "../../componentes/ProductSearch";
import { SafeAreaView } from "react-native-safe-area-context";
import Cart from "../../componentes/Cart";
import ProcessSale from "../../componentes/ProcessSale";
import { useCartStore } from "../../store/cartStore";
import SalesHistory from "../../componentes/SalesHistory";

export default function pos() {
  const items = useCartStore((state) => state.items);
  return (
    <SafeAreaView style={styles.container}>
      <ProductSearch />
      {items.length === 0 ? <SalesHistory /> : <Cart />}

      <ProcessSale />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
  },
});
