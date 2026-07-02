import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  StyleSheet,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import ProductSearch from "../../componentes/ProductSearch";
import Cart from "../../componentes/Cart";
import ProcessSale from "../../componentes/ProcessSale";
import SalesHistory from "../../componentes/SalesHistory";
import { useCartStore } from "../../store/cartStore";

export default function pos() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      useCartStore.getState().calcularTotal();
    }, [])
  );
  const [desc, setDesc] = useState("");
  const [motivo, setMotivo] = useState("");
  const [monto, setMonto] = useState("");

  const agregarExtraAlCarrito = () => {
    if (!desc || !monto) {
      Alert.alert("Error", "La descripción y el monto son obligatorios");
      return;
    }
    const montoNum = parseFloat(monto);
    const extraProduct = {
      id: -Date.now(),
      nombre: desc + (motivo ? " (" + motivo + ")" : ""),
      precio: montoNum,
      stock: 1,
      codigo: "EXTRA",
      info_relevante: motivo || "",
    };
    addItem(extraProduct as any);
    Alert.alert("Éxito", "Ingreso agregado al carrito");
    setModalVisible(false);
    setDesc("");
    setMotivo("");
    setMonto("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ProductSearch />

      <View style={styles.header}>
        <Text style={styles.title}>Punto de Venta</Text>
        <TouchableOpacity
          style={styles.btnInline}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome5 name="plus" size={14} color="white" />
          <Text style={styles.btnTextInline}> Agregar Extra</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={{ flex: 1 }}>
          <SalesHistory />
        </View>
      ) : (
        <Cart />
      )}

      <ProcessSale />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Ingreso Extra al Carrito</Text>
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={desc}
              onChangeText={setDesc}
            />
            <TextInput
              style={styles.input}
              placeholder="Motivo"
              value={motivo}
              onChangeText={setMotivo}
            />
            <TextInput
              style={styles.input}
              placeholder="Monto (C$)"
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
            />

            <TouchableOpacity
              style={styles.btnGuardar}
              onPress={agregarExtraAlCarrito}
            >
              <Text style={styles.btnText}>Agregar al Carrito</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{ color: "#666", marginTop: 10, textAlign: "center" }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#333" },
  btnInline: {
    flexDirection: "row",
    backgroundColor: "#0ab546",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  btnTextInline: { color: "white", fontWeight: "bold", marginLeft: 5 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: { backgroundColor: "white", padding: 20, borderRadius: 12 },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  btnGuardar: {
    backgroundColor: "#0ab546",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  btnCancelar: { alignItems: "center" },
});
