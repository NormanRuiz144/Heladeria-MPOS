import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ProductRepository } from "../database/repositories/productRepository";
import { Product } from "../app/movimientos/crear";
import { useCartStore } from "../store/cartStore";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Product[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  // para agregar al estado gobal
  const handleAddToCart = (product: Product) => {
    addItem(product);
    setQuery("");
    setResult([]);
  };
  // los resultados de la busqueda
  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim()) {
      const matches = (await ProductRepository.search(
        text.trim()
      )) as Product[];
      setResult(matches);
    } else {
      setResult([]);
    }
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextInput
          placeholder="Buscar Producto por codigo o nombre"
          style={styles.input}
          onChangeText={(text) => handleSearch(text)}
          value={query}
        />
        <Pressable
          style={styles.scanButton}
          onPress={() => router.navigate("/pos/scanner")}
        >
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </Pressable>
      </View>
      {result.length > 0 && (
        <FlatList
          style={styles.list}
          data={result}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleAddToCart(item)}
            >
              <Text>{`${item.codigo} | ${item.nombre}`}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  list: {
    maxHeight: 171,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  scanButton: {
    backgroundColor: "#0ab546",
    padding: 10,
    marginRight: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
