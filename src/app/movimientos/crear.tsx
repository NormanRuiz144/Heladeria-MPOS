import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "../productos/InputField";
import { MovementRepository } from "../../database/repositories/movementRepository";
import { router } from "expo-router";
import { ProductRepository } from "../../database/repositories/productRepository";
// import ProductSuggestion from "../../componentes/ProductSuggestion";

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  codigo: string;
  imagen?: string;
  info_relevante: string;
}

export default function CrearMovimiento() {
  const [producto, setProducto] = useState("");
  const [productoId, setProductoId] = useState<number | null>();
  const [cantidad, setCantidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("entrada");
  const [productosSugeridos, setProductosSugeridos] = useState<Product[]>([]);
  const tipoMovimiento = [
    { key: "entrada", label: "Entrada" },
    { key: "salida", label: "Salida" },
  ];

  const validar = () => {
    if (!productoId || isNaN(Number(productoId))) {
      Alert.alert("Error", "El producto es obligatorio o no existe.");
      return false;
    }
    if (!cantidad.trim() || isNaN(Number(cantidad)) || Number(cantidad) < 0) {
      Alert.alert(
        "Error",
        "La cantidad debe ser un numero mayor o igual que cero."
      );
      return false;
    }
    return true;
  };

  const guardar = async () => {
    if (!validar()) return;

    await MovementRepository.create(
      Number(productoId),
      descripcion,
      tipo,
      Number(cantidad),
      null
    );

    let ajuste = tipo === "entrada" ? Number(cantidad) : -Number(cantidad);
    await ProductRepository.adjustStock(Number(productoId), ajuste);
    router.back();
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Crear Movimiento</Text>
      <InputField
        placeholder=" CODIGO O NOMBRE DEL PRODUCTO"
        value={producto}
        onChangeText={async (value) => {
          setProducto(value);
          setProductoId(null);

          if (!value.trim()) {
            setProductosSugeridos([]);
            return;
          }
          const matches = await ProductRepository.search(value.trim());
          setProductosSugeridos(matches as Product[]);
        }}
      />
      {/* Lista de productos sugeridos :p */}
      {productosSugeridos.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            style={styles.suggestionList}
            data={productosSugeridos}
            keyExtractor={(item: Product) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setProducto(`${item.codigo} - ${item.nombre}`);
                  setProductoId(item.id);
                  setProductosSugeridos([]);
                }}
              >
                <Text style={styles.suggestionItemTitle}>{item.nombre}</Text>
                <Text>
                  Codigo: {item.codigo} | (Stock: {item.stock} )
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      {/* XDDDDDDDD */}

      <Text style={styles.label}>Tipo de Movimientos:</Text>
      <View style={styles.tipoContainer} pointerEvents="box-none">
        {tipoMovimiento.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.tipoBoton,
              tipo === item.key && styles.tipoButtonActive,
            ]}
            onPress={() => setTipo(item.key)}
          >
            <Text
              style={
                tipo === item.key
                  ? styles.tipoButtonTextActive
                  : styles.tipoButtonText
              }
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <InputField
        placeholder="DESCRIPCION"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <InputField
        placeholder="CANTIDAD"
        value={cantidad}
        onChangeText={setCantidad}
      />
      <Button title="Guardar" onPress={() => guardar()} />
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
    marginBottom: 12,
  },
  label: {
    marginBottom: 16,
  },
  tipoContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  tipoBoton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  tipoButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  tipoButtonText: {
    color: "#333",
  },
  tipoButtonTextActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "20%",
    left: 15,
    right: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
    maxHeight: 225,
    zIndex: 10,
  },
  suggestionList: {
    // flexGrow: 0,
    // backgroundColor: "#fff",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  suggestionItemTitle: {
    fontWeight: "bold",
    marginBottom: 10,
  },
});
