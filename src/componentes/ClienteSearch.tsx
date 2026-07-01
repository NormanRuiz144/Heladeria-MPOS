import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Cliente,
  clientesRepository,
} from "../database/repositories/clientesRepository";
import { useCartStore } from "../store/cartStore";

export default function ClienteSearch() {
  const clientId = useCartStore((state) => state.clientId);
  const setClientId = useCartStore((state) => state.setClientId);

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Cliente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null);

  useEffect(() => {
    if (clientId && !selectedClient) {
      clientesRepository.getById(clientId).then((results) => {
        if (results) setSelectedClient(results as Cliente);
      });
    }
    if (!clientId) {
      setSelectedClient(null);
    }
  }, [clientId]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.trim()) {
      const matches = (await clientesRepository.search(
        text.trim()
      )) as Cliente[];
      setResult(matches);
    } else {
      setResult([]);
    }
  };

  const handleSelectClient = (cliente: Cliente) => {
    setSelectedClient(cliente);
    setClientId(cliente.id);
    setQuery("");
    setResult([]);
  };

  const handleRemoveClient = () => {
    setSelectedClient(null);
    setClientId(null);
  };

  return (
    <View style={styles.container}>
      {selectedClient ? (
        <View style={styles.selectedContainer}>
          <View style={styles.selectedInfo}>
            <Ionicons name="person-circle" size={24} color="#0ab546" />
            <Text style={styles.selectedText}>{selectedClient.nombre}</Text>
            <Text style={styles.selectedSubtext}>
              RUC: {selectedClient.ruc}
            </Text>
          </View>
          <Pressable
            style={[styles.scanButton, { backgroundColor: "#d9534f" }]}
            onPress={handleRemoveClient}
          >
            <Ionicons name="close" size={20} color="white" />
            <Text style={styles.scanButtonText}>Quitar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Buscar Cliente por nombre"
            style={styles.input}
            onChangeText={handleSearch}
            value={query}
          />
          <View style={styles.buttonsContainer}>
            <Pressable
              style={styles.scanButton}
              onPress={() => router.navigate({ pathname: "/cliente/scanner", params: { modo: "scan" } })}
            >
              <Ionicons name="qr-code" size={24} color="white" />
              <Text style={styles.scanButtonText}>Buscar</Text>
            </Pressable>
            <Pressable
              style={styles.scanButton}
              onPress={() => router.navigate("/cliente/crear")}
            >
              <Ionicons name="person-add" size={24} color="white" />
              <Text style={styles.scanButtonText}>Agregar</Text>
            </Pressable>
          </View>
        </View>
      )}
      {result.length > 0 && !selectedClient && (
        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
          {result.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.item}
              onPress={() => handleSelectClient(item)}
            >
              <Text>{`${item.nombre} | ${item.ruc}`}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    flex: 1,
    marginRight: 10,
  },
  list: {
    maxHeight: 171,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  inputClient: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  addForm: {
    flexDirection: "column",
    gap: 6,
  },
  addFormRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  buttonsContainer: { flexDirection: "row", alignItems: "center" },
  scanButton: {
    backgroundColor: "#0ab546",
    padding: 7,
    marginRight: 4,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  selectedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e8f4e8",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0ab546",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    flexWrap: "wrap",
  },
  selectedText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  selectedSubtext: {
    fontSize: 12,
    color: "#666",
  },
  addFormButtons: {
    flexDirection: "row",
    gap: 4,
  },
});
