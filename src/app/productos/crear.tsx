import { Alert, Button, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import InputField from "./InputField";
import { useState } from "react";
import { ProductRepository } from "../../database/repositories/productRepository";
import { router } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
export default function CrearProductos() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [codigo, setCodigo] = useState("");
  const [imagen, setImagen] = useState("");
  const [info_relevante, setInfo_relevante] = useState("");
  const [showPicker, setShowPicker] = useState(false);


  
  const validar = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio.");
      return false;
    }
    if (!info_relevante.trim()) {
      Alert.alert("Error", "Escriba la informacion del producto.");
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

// Imagenes
  const procesarImagenSeleccionada = async (uriOriginal: string) => {
    const nombreArchivo = `producto_${Date.now()}.jpg`;
    if (!FileSystem.documentDirectory) {
      Alert.alert("Error", "No se pudo acceder al directorio de documentos");
      return;
    }
    const rutaPermanente = `${FileSystem.documentDirectory}${nombreArchivo}`;
    await FileSystem.copyAsync({ from: uriOriginal, to: rutaPermanente });
    setImagen(rutaPermanente);
  };

  const manejarSeleccionImagen = () => {
    setShowPicker(true);
  };

  const seleccionarGaleria = async () => {
    setShowPicker(false);
    const permisos = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permisos.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tus fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled) return;
    await procesarImagenSeleccionada(result.assets[0].uri);
  };

  const tomarFoto = async () => {
    setShowPicker(false);
    const permisos = await ImagePicker.requestCameraPermissionsAsync();
    if (!permisos.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a la cámara.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (result.canceled) return;
    await procesarImagenSeleccionada(result.assets[0].uri);
  }




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
      await ProductRepository.create(
        nombre,
        Number(precio),
        Number(stock),
        codigo,
        imagen,
        info_relevante
      );
      Alert.alert("Exito", "Producto creado exitosamente.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el producto");
    }
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
        placeholder="Información"
        value={info_relevante}
        onChangeText={setInfo_relevante}
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
     
     <TouchableOpacity style={styles.buttonImaje} onPress={manejarSeleccionImagen}>
     <Text style={styles.buttonText}>Agregar Imagen</Text>
     </TouchableOpacity>
      {imagen ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: imagen }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.imageDismissButton}
            onPress={() => setImagen("")}
          >
            <Text style={styles.imageDismissText}>X</Text>
          </TouchableOpacity>
        </View>
      ) : null}

     <TouchableOpacity style={styles.buttonImaje} onPress={guardar}>
     <Text style={styles.buttonText}>Guardar</Text>
     </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade" onRequestClose={() => setShowPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowPicker(false)}>
          <Pressable style={styles.pickerContainer} onPress={() => {}}>
            <Text style={styles.pickerTitle}>¿De dónde obtener la imagen?</Text>
            <View style={styles.pickerRow}>
              <TouchableOpacity style={styles.pickerBtnLeft} onPress={tomarFoto}>
                <MaterialIcons name="camera-alt" size={20} color="#fff" />
                <Text style={styles.pickerBtnText}> Tomar foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerBtnRight} onPress={seleccionarGaleria}>
                <MaterialIcons name="photo-library" size={20} color="#fff" />
                <Text style={styles.pickerBtnText}> Galería</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.pickerCancel} onPress={() => setShowPicker(false)}>
              <Text style={styles.pickerCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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

  buttonImaje:{
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color:"green",
    backgroundColor:"blue",
    borderRadius:8,
    alignItems:"center"
  },
  buttonText:{
    color:"white"
  },

  imagePreviewContainer: {
    position: "relative",
    alignSelf: "center",
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  imageDismissButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  imageDismissText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  pickerBtnLeft: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBtnRight: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#0ab546",
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  pickerCancel: {
    alignSelf: "flex-end",
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  pickerCancelText: {
    color: "#e53935",
    fontWeight: "600",
    fontSize: 14,
  },
});
