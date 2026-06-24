import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoriaRepository } from "../../database/repositories/categoriaRepository";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CategoriaScreen() {
  const [nombre, setNombre] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);
  const [editando, setEditando] = useState<{
    id: number;
    nombre: string;
  } | null>(null);

  const cargarCategorias = async () => {
    const data = await CategoriaRepository.getAll();
    setCategorias(data);
  };

  useFocusEffect(
    React.useCallback(() => {
      cargarCategorias();
    }, [])
  );

  const guardar = async () => {
    if (!nombre.trim()) return Alert.alert("Error", "El nombre es obligatorio");
    try {
      await CategoriaRepository.create(nombre.trim());
      Alert.alert("Éxito", "Categoría guardada");
      setNombre("");
      cargarCategorias();
    } catch {
      Alert.alert("Error", "No se pudo guardar, quizás ya existe.");
    }
  };

  const iniciarEdicion = (item: any) => {
    setEditando({ id: item.id, nombre: item.nombre });
  };

  const cancelarEdicion = () => {
    setEditando(null);
  };

  const guardarEdicion = async () => {
    if (!editando || !editando.nombre.trim()) {
      return Alert.alert("Error", "El nombre es obligatorio");
    }
    try {
      await CategoriaRepository.update(editando.id, editando.nombre.trim());
      Alert.alert("Éxito", "Categoría actualizada");
      setEditando(null);
      cargarCategorias();
    } catch {
      Alert.alert("Error", "No se pudo actualizar, quizás ya existe.");
    }
  };

  const eliminar = (item: any) => {
    Alert.alert(
      "Eliminar categoría",
      `¿Estás seguro de eliminar "${item.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await CategoriaRepository.delete(item.id);
              cargarCategorias();
            } catch {
              Alert.alert("Error", "No se pudo eliminar la categoría.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    const esEditando = editando?.id === item.id;

    if (esEditando) {
      return (
        <View style={styles.item}>
          <TextInput
            style={styles.editInput}
            value={editando!.nombre}
            onChangeText={(t) => setEditando({ ...editando!, nombre: t })}
            autoFocus
          />
          <View style={styles.acciones}>
            <TouchableOpacity
              onPress={guardarEdicion}
              style={styles.botonAccion}
            >
              <Ionicons name="checkmark-circle" size={24} color="#0ab546" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelarEdicion}
              style={styles.botonAccion}
            >
              <Ionicons name="close-circle" size={24} color="#999" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.item}>
        <Text style={styles.itemText}>{item.nombre}</Text>
        <View style={styles.acciones}>
          <TouchableOpacity
            onPress={() => iniciarEdicion(item)}
            style={styles.botonAccion}
          >
            <Ionicons name="pencil" size={20} color="#0ab546" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => eliminar(item)}
            style={styles.botonAccion}
          >
            <Ionicons name="trash" size={20} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionar Categorías</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la nueva categoría"
          value={nombre}
          onChangeText={setNombre}
        />
        <TouchableOpacity style={styles.botonAgregar} onPress={guardar}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        style={styles.lista}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  inputRow: { flexDirection: "row", marginBottom: 20, gap: 10 },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  botonAgregar: {
    backgroundColor: "#0ab546",
    width: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  lista: { flex: 1 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  itemText: { fontSize: 16, flex: 1 },
  editInput: {
    flex: 1,
    fontSize: 16,
    padding: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#0ab546",
  },
  acciones: { flexDirection: "row", gap: 12 },
  botonAccion: { padding: 4 },
});
