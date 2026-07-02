import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { empresaRepository } from "../../database/repositories/empresaRepository";

export default function EmpresaScreen() {
  const [id, setId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [impuesto, setImpuesto] = useState("0");
  const [logo, setLogo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmpresa();
  }, []);

  const loadEmpresa = async () => {
    try {
      let empresa = await empresaRepository.getFirst();
      console.log(empresa);
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
      console.log("Error al cargar empresa:", error);
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
      Alert.alert(
        "Error",
        "El impuesto debe ser un número mayor o igual a cero."
      );
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
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los datos." + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Configuración de Empresa</Text>

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

        <TouchableOpacity
          style={[styles.btnGuardar, loading && styles.btnDisabled]}
          onPress={guardar}
          disabled={loading}
        >
          <FontAwesome5 name="save" size={16} color="white" />
          <Text style={styles.btnGuardarText}>
            {" "}
            {loading ? "Guardando..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  label: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#0ab546",
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    borderRadius: 6,
  },
  textArea: {
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
    marginTop: 24,
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
