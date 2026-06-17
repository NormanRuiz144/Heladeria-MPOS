import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ProductRepository } from "../../database/repositories/productRepository";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "../../componentes/ProductCard";
import { push } from "expo-router/build/global-state/routing";
import { router, useFocusEffect } from "expo-router";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  codigo: string;
}

const inventario = () => {
  const [productos, setProductos] = useState<Producto[]>([]);

  const loadProductos = async () => {
    const data = (await ProductRepository.getAll()) as Producto[];
    setProductos(data);
  };
  const crearProducto = () => {
    ProductRepository.create("Pepsi", 25, 10, "15151515");
    console.log("Producto creado.");
  };

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
            const product = (await ProductRepository.getById(id)) as any;
            await ProductRepository.delete(id, product?.imagen);
            loadProductos();
          },
        },
      ]
    );
  };

  // se ejecuta cuando recibe el foco en este caso al volver a cargar la pantalla del inventarios
  useFocusEffect(
    // la funcion la ubica en memoria
    useCallback(() => {
      loadProductos();
    }, [])
  );
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Inventario</Text>
      <Button
        title="Nuevo producto"
        onPress={() => {
          push("/productos/crear");
        }}
      />
      <FlatList
        data={productos}
        keyExtractor={(item: Producto) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            producto={item}
            onDelete={deleteProduct}
            onEdit={(id) => router.push(`/productos/edit?id=${id}`)}
          />
        )}
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
});
