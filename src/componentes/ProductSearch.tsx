import { useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
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
import { router, useFocusEffect } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import ProductDetailModal from "./ProductDetailModal";
import { CategoriaRepository } from "../database/repositories/categoriaRepository";
import { Categoria } from "../app/(tabs)/inventario";

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  const loadData = async () => {
    const categorias = (await CategoriaRepository.getAll()) as Categoria[];
    setCategorias(categorias);
  };

  useEffect(() => {
    loadData();
  }, []);
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
        text.trim(),
        categoriaFiltro!
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
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
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
          onPress={() => router.navigate("/pos/scanner?modo=scan")}
        >
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </Pressable>
      </View>
      <View style={styles.filtroContainer}>
        <Text style={{ fontWeight: "bold", paddingBottom: 3 }}>
          Seleccione una categoria para filtrar:
        </Text>
        <FlatList
          horizontal
          data={categorias}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.chip,
                categoriaFiltro === null && styles.chipActive,
              ]}
              onPress={() => setCategoriaFiltro(null)}
            >
              <Text
                style={
                  categoriaFiltro === null
                    ? { color: "white" }
                    : { color: "#333" }
                }
              >
                Todas
              </Text>
            </TouchableOpacity>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                categoriaFiltro === item.id && styles.chipActive,
              ]}
              onPress={() => {
                setCategoriaFiltro(item.id);
                console.log(categoriaFiltro);
              }}
            >
              <Text
                style={
                  categoriaFiltro === item.id
                    ? { color: "white" }
                    : { color: "#333" }
                }
              >
                {item.nombre}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
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
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    flex: 1,
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
  itemText: {
    flex: 1,
    padding: 10,
  },
  eyeButton: {
    padding: 10,
  },
  filtroContainer: {
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#fff",
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0ab546",
  },
  chipActive: { backgroundColor: "#0ab546" },
});
