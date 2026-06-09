import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "./InputField";
import { useEffect, useState } from "react";
import { ProductRepository } from "../../database/repositories/productRepository";
import { router, useLocalSearchParams } from "expo-router";
import BarcodeGenerator from "../../componentes/showBarCode";

interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  codigo: string;
  codigo_barras: string;
}

export default function editarProducto() {
  const { id } = useLocalSearchParams();
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");

  const validar = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.");
      return false;
    }
    if (!codigo.trim()) {
      Alert.alert("Error", "El codigo es obligatorio.");
      return false;
    }
    if (!precio.trim() || isNaN(Number(precio)) || Number(precio) < 0) {
      Alert.alert(
        "Error",
        "El precio debe ser un numero mayor o igual que cero."
      );
      return false;
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert(
        "Error",
        "El stock debe ser un numero mayor o igual que cero."
      );
      return false;
    }
    return true;
  };

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const product = (await ProductRepository.getById(
          Number(id)
        )) as Producto;
        if (product) {
          setNombre(product.nombre);
          setPrecio(product.precio.toString());
          setStock(product.stock.toString());
          setCodigo(product.codigo || "");
          setCodigoBarras(product.codigo_barras || "");
        }
      }
    };
    loadProduct();
  }, []);

  const editar = async () => {
    if (!validar()) {
      return;
    }

    try {
      const isUnique = await ProductRepository.isCodigoUnique(
        codigo,
        Number(id)
      );

      if (!isUnique) {
        Alert.alert("Error", "El codigo ya existe.");
        return;
      }
      await ProductRepository.update(
        Number(id),
        nombre,
        Number(precio),
        Number(stock),
        codigo
      );
      Alert.alert("Exito", "Producto actualizado exitosamente.");
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "No se pudo actualizar el producto");
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Nuevo Producto</Text>
      <InputField
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <InputField
        placeholder="Codigo"
        value={codigo}
        onChangeText={setCodigo}
      />
      <InputField
        placeholder="Precio"
        value={precio}
        onChangeText={setPrecio}
      />
      <InputField placeholder="Stock" value={stock} onChangeText={setStock} />
      <View style={styles.barcodeContanier}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>
          Código de Barras asignado para el producto:
        </Text>
        <BarcodeGenerator value={codigoBarras} showText={true} />
      </View>
      <Button title="Editar" onPress={editar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  barcodeContanier: {
    alignItems: "center",
    borderRadius: 8,
    paddingBottom: 10,
  },
});
