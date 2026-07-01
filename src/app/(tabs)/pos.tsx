import React, { useCallback, useEffect, useState } from "react";
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
import ExtrasList from "../../componentes/ExtraList";
import { useCartStore } from "../../store/cartStore";
import { VariosRepository } from "../../database/repositories/variosRepository";

export default function pos() {
  const items = useCartStore((state) => state.items);
  const [modalVisible, setModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      useCartStore.getState().calcularTotal();
    }, [])
  );
  const [desc, setDesc] = useState("");
  const [motivo, setMotivo] = useState("");
  const [monto, setMonto] = useState("");
  const [vista, setVista] = useState<"historial" | "ingresos">("historial");

  const registrarIngreso = async () => {
    if (!desc || !monto) {
      Alert.alert("Error", "La descripción y el monto son obligatorios");
      return;
    }
    await VariosRepository.create(
      desc,
      motivo || "Ingreso desde POS",
      parseFloat(monto)
    );
    Alert.alert("Éxito", "Ingreso registrado");
    setModalVisible(false);
    setDesc("");
    setMotivo("");
    setMonto("");
  };

  // const cargarIngresos = async () => {
  //     const hoy = new Date().toISOString().split('T')[0];
  //     const data = await VariosRepository.getReportByDateRange(hoy, hoy);
  //     setExtras(data || []);
  //   };

  //   useEffect(()=> {

  //   },[vista])

  return (
    <SafeAreaView style={styles.container}>
      <ProductSearch />

      {/* CABECERA CON BOTÓN INTEGRADO */}
      <View style={styles.header}>
        <View style={styles.toggleGroup}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              vista === "historial" && styles.toggleBtnActive,
            ]}
            onPress={() => setVista("historial")}
          >
            <Text
              style={[
                styles.toggleBtnText,
                vista === "historial" && styles.toggleBtnTextActive,
              ]}
            >
              Ventas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              vista === "ingresos" && styles.toggleBtnActive,
            ]}
            onPress={() => setVista("ingresos")}
          >
            <Text
              style={[
                styles.toggleBtnText,
                vista === "ingresos" && styles.toggleBtnTextActive,
              ]}
            >
              Ingresos
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.btnInline}
          onPress={() => setModalVisible(true)}
        >
          <FontAwesome5 name="plus" size={14} color="white" />
          <Text style={styles.btnTextInline}> Ingreso</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO PRINCIPAL */}
      {items.length === 0 ? (
        <View style={{ flex: 1 }}>
          {vista === "historial" ? <SalesHistory /> : <ExtrasList />}
        </View>
      ) : (
        <Cart />
      )}

      <ProcessSale />

      {/* MODAL DE REGISTRO */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Ingreso Vario</Text>
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
              onPress={registrarIngreso}
            >
              <Text style={styles.btnText}>Guardar Ingreso</Text>
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
  toggleGroup: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#0ab546",
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  toggleBtnActive: { backgroundColor: "#0ab546" },
  toggleBtnText: { fontSize: 14, fontWeight: "600", color: "#0ab546" },
  toggleBtnTextActive: { color: "#fff" },
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
