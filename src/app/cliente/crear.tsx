import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import InputField from "../productos/InputField";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { clientesRepository } from "../../database/repositories/clientesRepository";
import { Cliente } from "../../database/repositories/clientesRepository";
import { useCartStore } from "../../store/cartStore";

export default function CrearProductos() {
  const [nombre, setNombre] = useState("");
  const [ruc, setRuc] = useState("");
  const [telefono, setTelefono] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
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
    router.navigate({ pathname: "/cliente/scanner", params: { modo: "asignar" } });
  };

  const validar = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.");
      return false;
    }
    if (!telefono.trim()) {
      Alert.alert("Error", "El telefono es obligatorio.");
      return false;
    }
    if (!ruc.trim()) {
      Alert.alert("Error", "El RUC es obligatorio.");
      return false;
    }
    return true;
  };

  const guardar = async () => {
    if (!validar()) return;
    try {
      const existente = await clientesRepository.getByRuc(ruc);
      if (existente) {
        Alert.alert("Error", "El RUC ya existe.");
        return;
      }
      const result = await clientesRepository.create(nombre, ruc, telefono);
      setClientId(result.lastInsertRowId);
    } catch (error) {
      Alert.alert("Error", "No se pudo registrar el cliente");
    }
    router.back();
  };

  const actualizar = async () => {
    if (!validar() || editingId === null) return;
    try {
      const existente = (await clientesRepository.getByRuc(ruc)) as Cliente;
      if (existente && existente.id !== editingId) {
        Alert.alert("Error", "El RUC ya esta en uso por otro cliente.");
        return;
      }
      await clientesRepository.update(editingId, nombre, ruc, telefono);
      setClientId(editingId);
      Alert.alert("Exito", "Cliente actualizado correctamente.");
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el cliente");
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
      {editingId ? (
        <View style={styles.buttonRow}>
          <View style={{ flex: 1, marginRight: 5 }}>
            <Button title="Actualizar" onPress={actualizar} />
          </View>
          <View style={{ flex: 1, marginLeft: 5 }}>
            <Button
              title="Cancelar"
              onPress={() => {
                setEditingId(null);
                setNombre("");
                setRuc("");
                setTelefono("");
              }}
            />
          </View>
        </View>
      ) : (
        <Button title="Guardar" onPress={guardar} />
      )}
      <Text style={styles.subtitle}>Lista de clientes:</Text>
      <FlatList
        data={clienteList}
        keyExtractor={(item) => item.ruc}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              setNombre(item.nombre);
              setRuc(item.ruc);
              setTelefono(item.telefono || "");
              setEditingId(item.id);
            }}
          >
            <View style={styles.cardBody}>
              <Text style={styles.cardName}>{item.nombre}</Text>
              <Text style={styles.cardDetail}>RUC: {item.ruc}</Text>
              {item.telefono ? (
                <Text style={styles.cardDetail}>Tel: {item.telefono}</Text>
              ) : null}
            </View>
            <MaterialIcons name="edit" size={20} color="#999" />
          </Pressable>
        )}
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
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardBody: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
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
  buttonRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
});
