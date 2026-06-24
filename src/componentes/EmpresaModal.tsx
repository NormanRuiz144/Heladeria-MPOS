import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { empresaRepository } from "../database/repositories/empresaRepository";

interface EmpresaModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function EmpresaModal({ visible, onClose }: EmpresaModalProps) {
  const [id, setId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [impuesto, setImpuesto] = useState("0");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadEmpresa();
    }
  }, [visible]);

  const loadEmpresa = async () => {
    try {
      let empresa = await empresaRepository.getFirst();
      if (!empresa) {
        await empresaRepository.initialize();
        empresa = await empresaRepository.getFirst();
      }
      if (empresa) {
        setId(empresa.id);
        setNombre(empresa.nombre || "");
        setDireccion(empresa.direccion || "");
        setImpuesto(empresa.impuesto.toString());
        setLogo(empresa.logo || "");
      }
    } catch (error) {
      console.log("Error loading empresa:", error);
    }
  };

  const seleccionarLogo = async () => {
    const permisos = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permisos.granted) {
      Alert.alert("Permiso requerido", "Necesitamos acceso a tus fotos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (result.canceled) return;

    const uriOriginal = result.assets[0].uri;
    const nombreArchivo = `logo_${Date.now()}.jpg`;
    if (!FileSystem.documentDirectory) {
      Alert.alert("Error", "No se pudo acceder al directorio de documentos");
      return;
    }
    const rutaPermanente = `${FileSystem.documentDirectory}${nombreArchivo}`;
    await FileSystem.copyAsync({ from: uriOriginal, to: rutaPermanente });
    setLogo(rutaPermanente);
  };

  const validar = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "El nombre de la empresa es obligatorio.");
      return false;
    }
    if (!direccion.trim()) {
      Alert.alert("Error", "La dirección es obligatoria.");
      return false;
    }
    if (!impuesto.trim() || isNaN(Number(impuesto)) || Number(impuesto) < 0) {
      Alert.alert("Error", "El impuesto debe ser un número mayor o igual a cero.");
      return false;
    }
    if (!logo) {
      Alert.alert("Error", "El logo de la empresa es obligatorio.");
      return false;
    }
    return true;
  };

  const guardar = async () => {
    if (!validar()) return;
    if (!id) return;
    setLoading(true);
    try {
      await empresaRepository.update(id, {
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        impuesto: Number(impuesto) || 0,
        logo: logo || null,
      });
      Alert.alert("Éxito", "Datos de la empresa guardados correctamente.");
      onClose();
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los datos." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Configuración de Empresa</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <FontAwesome5 name="times" size={24} color="black" />
            </Pressable>
          </View>

          <ScrollView style={styles.form}>
            <Text style={styles.label}>Nombre de la empresa</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre de la empresa"
            />

            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={direccion}
              onChangeText={setDireccion}
              placeholder="Dirección"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Impuesto (%)</Text>
            <TextInput
              style={styles.input}
              value={impuesto}
              onChangeText={setImpuesto}
              placeholder="0"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Logo</Text>
            <TouchableOpacity style={styles.btnImagen} onPress={seleccionarLogo}>
              <FontAwesome5 name="image" size={16} color="white" />
              <Text style={styles.btnImagenText}> Seleccionar Logo</Text>
            </TouchableOpacity>

            {logo ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: logo }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.imageDismissButton}
                  onPress={() => setLogo("")}
                >
                  <Text style={styles.imageDismissText}>X</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </ScrollView>

          <TouchableOpacity
            style={[styles.btnGuardar, loading && styles.btnDisabled]}
            onPress={guardar}
            disabled={loading}
          >
            <FontAwesome5 name="save" size={16} color="white" />
            <Text style={styles.btnGuardarText}>
              {" "}{loading ? "Guardando..." : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    width: "85%",
    maxHeight: "90%",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  form: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#0ab546",
    paddingVertical: 8,
    fontSize: 16,
  },
  textArea: {
    borderBottomWidth: 1,
    borderColor: "#0ab546",
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: "top",
  },
  btnImagen: {
    backgroundColor: "#1a1a1a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    gap: 6,
  },
  btnImagenText: {
    color: "white",
    fontWeight: "bold",
  },
  imagePreviewContainer: {
    position: "relative",
    alignSelf: "center",
    marginTop: 10,
  },
  imagePreview: {
    width: 120,
    height: 120,
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
  btnGuardar: {
    backgroundColor: "#0ab546",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 8,
    gap: 6,
  },
  btnDisabled: {
    backgroundColor: "#ccc",
  },
  btnGuardarText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
