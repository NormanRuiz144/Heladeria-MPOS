import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ProductRepository } from "../database/repositories/productRepository";
import { Product } from "../app/movimientos/crear";
import { useCartStore } from "../store/cartStore";
import ProductDetailModal from "./ProductDetailModal";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
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

  const handleViewDetail = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Buscar Producto por codigo o nombre"
        style={styles.input}
        onChangeText={(text) => handleSearch(text)}
        value={query}
      />
      {result.length > 0 && (
        <FlatList
          style={styles.list}
          data={result}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <TouchableOpacity
                style={styles.itemText}
                onPress={() => handleAddToCart(item)}
              >
                <Text>{`${item.codigo} | ${item.nombre}`}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => handleViewDetail(item)}
              >
                <MaterialIcons name="visibility" size={22} color="#555" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      <ProductDetailModal
        visible={modalVisible}
        product={selectedProduct}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
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
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  itemText: {
    flex: 1,
    padding: 10,
  },
  eyeButton: {
    padding: 10,
  },
});
