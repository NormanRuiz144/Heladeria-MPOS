import { Alert, Button, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "./InputField";
import { useEffect, useState } from "react";
import { ProductRepository } from "../../database/repositories/productRepository";
import { router, useLocalSearchParams } from "expo-router";
import BarcodeGenerator from "../../componentes/showBarCode";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Product } from "../movimientos/crear";

export default function CrearProductos() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("0");
  const params = useLocalSearchParams();

  // 2. Escuchamos cuándo cambian los parámetros de la ruta (cuando el escáner regresa)
  useEffect(() => {
    if (params?.data) {
      setCodigoBarras(params.data as string);
    }
  }, [params?.data]);

  const generarCodigoBarras = (modo: string = "auto") => {
    // Genera un código de barras único basado en el timestamp y un número aleatorio
    if (modo == "auto") {
      setCodigoBarras((Math.random() * 1000000000).toFixed());
      return;
    } else {
      router.navigate("/pos/scanner?modo=asig");
    }
  };

  // useEffect(() => {
  //   generarCodigoBarras();
  // }, []);

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

  const guardar = async () => {
    if (!validar()) {
      return;
    }
    try {
      const isUnique = await ProductRepository.isCodigoUnique(codigo);
      if (!isUnique) {
        Alert.alert("Error", "El codigo ya existe.");
        return;
      }
      const isUniqueBarCode = (await ProductRepository.searchByCodigoBarras(
        codigoBarras
      )) as Product;
      if (isUniqueBarCode) {
        Alert.alert(
          "Error",
          "El codigo de barras ya esta asociado con un producto."
        );
        return;
      }
      await ProductRepository.create(
        nombre,
        Number(precio),
        Number(stock),
        codigo,
        codigoBarras
      );
      Alert.alert("Exito", "Producto creado exitosamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el producto");
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
          Código de Barras generado para el producto:
        </Text>
        <View style={styles.barcodeButtons}>
          <Pressable
            style={styles.scanButton}
            onPress={() => generarCodigoBarras("scan")}
          >
            <Ionicons name="scan" size={24} color="white" />
            <Text style={styles.scanButtonText}>Scan</Text>
          </Pressable>
          <Pressable
            style={styles.scanButton}
            onPress={() => generarCodigoBarras()}
          >
            <FontAwesome name="gear" size={24} color="white" />
            <Text style={styles.scanButtonText}>Auto</Text>
          </Pressable>
        </View>
        {codigoBarras != "0" && (
          <BarcodeGenerator value={codigoBarras} showText={true} />
        )}
      </View>
      <Button title="Guardar" onPress={guardar} />
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
  barcodeButtons: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    paddingBottom: 10,
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
