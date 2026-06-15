import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import InputField from "../productos/InputField";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { clientesRepository } from "../../database/repositories/clientesRepository";
import { Cliente } from "../../database/repositories/clientesRepository";
import { useCartStore } from "../../store/cartStore";

export default function CrearProductos() {
  const [nombre, setNombre] = useState("");
  const [ruc, setRuc] = useState("");
  const [telefono, setTelefono] = useState("");
  const [clienteList, setClienteList] = useState<Cliente[]>([]);
  const setClientId = useCartStore((state) => state.setClientId);
  const params = useLocalSearchParams();

  useEffect(() => {
    cargarClientes();
  }, []);

  useEffect(() => {
    if (params?.data) {
      setRuc(params.data as string);
    }
  }, [params?.data]);

  const cargarClientes = async () => {
    let list = (await clientesRepository.getAll()) as Cliente[];
    setClienteList(list);
  };
  const asignarRuc = () => {
    router.navigate("/cliente/scanner?modo=asignar");
  };

  const validar = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.");
      return false;
    }
    if (!telefono.trim()) {
      Alert.alert("Error", "El RUC es obligatorio.");
      return false;
    }
    if (!ruc.trim()) {
      Alert.alert("Error", "El RUC es obligatorio.");
      return false;
    }
    return true;
  };

  const guardar = async () => {
    if (!validar()) {
      return;
    }
    try {
      const isUnique = await clientesRepository.getByRuc(ruc);
      if (isUnique) {
        Alert.alert("Error", "El codigo ya existe.");
        return;
      }
      const result = await clientesRepository.create(nombre, ruc, telefono);
      setClientId(result.lastInsertRowId);
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el cliente");
    }
    router.back();
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Apartado de clientes</Text>
      <InputField
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />

      <InputField
        placeholder="Telefono"
        value={telefono}
        onChangeText={setTelefono}
      />
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>
        Asignar Numero Ruc:
      </Text>
      <View style={styles.rucZone}>
        <View style={{ flex: 1, paddingRight: 15 }}>
          <InputField placeholder="RUC" value={ruc} onChangeText={setRuc} />
        </View>

        <Pressable style={styles.scanButton} onPress={() => asignarRuc()}>
          <Ionicons name="scan" size={24} color="white" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </Pressable>
      </View>
      <Button title="Guardar" onPress={guardar} />
      {/* Mostar clientes */}
      <Text>Lista de clientes:</Text>
      <FlatList
        data={clienteList}
        keyExtractor={(item) => item.ruc}
        renderItem={({ item }) => <Text>{item.nombre}</Text>}
      />
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
  rucZone: {
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 8,
    paddingBottom: 10,
    justifyContent: "space-between",
  },
  scanButton: {
    backgroundColor: "#0ab546",
    padding: 15,
    marginRight: 20,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
