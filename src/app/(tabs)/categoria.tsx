import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { CategoriaRepository } from '../../database/repositories/categoriaRepository';
import { useFocusEffect } from 'expo-router';

export default function CategoriaScreen() {
  const [nombre, setNombre] = useState("");
  const [categorias, setCategorias] = useState<any[]>([]);

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
      await CategoriaRepository.create(nombre);
      Alert.alert("Éxito", "Categoría guardada");
      setNombre("");
      cargarCategorias();
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar, quizás ya existe.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionar Categorías</Text>
      
      <TextInput 
        style={styles.input}
        placeholder="Nombre de la nueva categoría" 
        value={nombre} 
        onChangeText={setNombre}
      />
      <Button title="Agregar Categoría" onPress={guardar} color="#0ab546" />

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{item.nombre}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f4f4f4' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  item: { padding: 15, backgroundColor: '#fff', marginBottom: 5, borderRadius: 5 }
});