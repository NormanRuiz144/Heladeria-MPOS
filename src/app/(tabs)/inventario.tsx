import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useState } from "react";
import { ProductRepository } from "../../database/repositories/productRepository";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "../../componentes/ProductCard";
import { push } from "expo-router/build/global-state/routing";
import { router, useFocusEffect } from "expo-router";
import { CategoriaRepository } from "../../database/repositories/categoriaRepository";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  codigo: string;
  codigo_barras: string;
  categoria_id: number;
  categoria_nombre?: string;
}

interface Categoria {
  id: number;
  nombre: string;
}

const inventario = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaFiltro, setCategoriaFiltro] = useState<number | null>(null);

  const loadData = async () => {
    const [data, cats] = await Promise.all([
      ProductRepository.getAll() as Promise<Producto[]>,
      CategoriaRepository.getAll() as Promise<Categoria[]>,
    ]);
    console.log(data);
    setProductos(data);
    setCategorias(cats);
  };

  const productosFiltrados = categoriaFiltro
    ? productos.filter((p) => p.categoria_id === categoriaFiltro)
    : productos;

  const deleteProduct = async (id: number) => {
    Alert.alert(
      "Eliminando producto",
      "Estas seguro de eliminar el producto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            ProductRepository.delete(id);
            loadData();
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Inventario</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Nuevo producto"
          onPress={() => {
            push("/productos/crear");
          }}
        />
      </View>

      <View style={styles.filtroContainer}>
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
              onPress={() => setCategoriaFiltro(item.id)}
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

      <FlatList
        data={productosFiltrados}
        keyExtractor={(item: Producto) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            producto={item}
            onDelete={deleteProduct}
            onEdit={(id) => router.push(`/productos/edit?id=${id}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay productos registrados</Text>
        }
      />
    </SafeAreaView>
  );
};

export default inventario;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f4f4f4",
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    marginBottom: 10,
  },
  filtroContainer: {
    marginBottom: 10,
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
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});
