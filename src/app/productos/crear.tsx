import {
  Alert,
  Button,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InputField from "./InputField";
import { useEffect, useState } from "react";
import { ProductRepository } from "../../database/repositories/productRepository";
import { router, useLocalSearchParams } from "expo-router";
import BarcodeGenerator from "../../componentes/showBarCode";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Product } from "../movimientos/crear";
import { CategoriaRepository } from "../../database/repositories/categoriaRepository";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

export default function CrearProductos() {
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [codigo, setCodigo] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("0");
  const params = useLocalSearchParams();
  const [categorias, setCategorias] = useState<any[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<
    number | null
  >(null);
  const [imagen, setImagen] = useState("");
  const [info_relevante, setInfo_relevante] = useState("");

  useEffect(() => {
    const loadCategorias = async () => {
      const data = await CategoriaRepository.getAll();
      setCategorias(data);
    };
    loadCategorias();
  }, []);

  useEffect(() => {
    if (params?.data) {
      setCodigoBarras(params.data as string);
    }
  }, [params?.data]);

  const generarCodigoBarras = (modo: string = "auto") => {
    if (modo == "auto") {
      setCodigoBarras((Math.random() * 1000000000).toFixed());
      return;
    } else {
      router.navigate("/pos/scanner?modo=asig");
    }
  };

  const manejarSeleccionImagen = async () => {
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
    const nombreArchivo = `producto_${Date.now()}.jpg`;
    if (!FileSystem.documentDirectory) {
      Alert.alert("Error", "No se pudo acceder al directorio de documentos");
      return;
    }
    const rutaPermanente = `${FileSystem.documentDirectory}${nombreArchivo}`;
    await FileSystem.copyAsync({ from: uriOriginal, to: rutaPermanente });
    setImagen(rutaPermanente);
  };

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

  const guardar = async () => {
    if (!nombre || !precio || !codigo || !categoriaSeleccionada) {
      Alert.alert("Error", "Todos los campos y la categoría son obligatorios.");
      return;
    }
    try {
      const isUnique = await ProductRepository.isCodigoUnique(codigo);
      if (!isUnique) {
        Alert.alert("Error", "El codigo ya existe.");
        return;
      }
      const isUniqueBarCode = (await ProductRepository.searchByCodigoBarras(
        codigoBarras
      )) as Product;
      if (isUniqueBarCode) {
        Alert.alert(
          "Error",
          "El codigo de barras ya esta asociado con un producto."
        );
        return;
      }
      await ProductRepository.create(
        nombre,
        Number(precio),
        Number(stock),
        codigo,
        codigoBarras,
        categoriaSeleccionada,
        imagen,
        info_relevante
      );
      Alert.alert("Exito", "Producto creado exitosamente.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "No se pudo crear el producto");
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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

        <TouchableOpacity
          style={styles.buttonImaje}
          onPress={manejarSeleccionImagen}
        >
          <Text style={styles.buttonText}>Seleccionar Imagen</Text>
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

        <View style={styles.barcodeContanier}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            Código de Barras generado para el producto:
          </Text>
          <View style={styles.barcodeButtons}>
            <Pressable
              style={styles.scanButton}
              onPress={() => generarCodigoBarras("scan")}
            >
              <Ionicons name="scan" size={24} color="white" />
              <Text style={styles.scanButtonText}>Scan</Text>
            </Pressable>
            <Pressable
              style={styles.scanButton}
              onPress={() => generarCodigoBarras()}
            >
              <FontAwesome name="gear" size={24} color="white" />
              <Text style={styles.scanButtonText}>Auto</Text>
            </Pressable>
          </View>
          {codigoBarras != "0" && (
            <BarcodeGenerator value={codigoBarras} showText={true} />
          )}

          <Text style={styles.subtitle}>Categoría:</Text>
          <FlatList
            horizontal
            data={categorias}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setCategoriaSeleccionada(item.id)}
                style={[
                  styles.chip,
                  categoriaSeleccionada === item.id && styles.chipActive,
                ]}
              >
                <Text
                  style={
                    categoriaSeleccionada === item.id ? { color: "white" } : {}
                  }
                >
                  {item.nombre}
                </Text>
              </TouchableOpacity>
            )}
            style={{ marginBottom: 20 }}
          />
        </View>

        <TouchableOpacity style={styles.buttonImaje} onPress={guardar}>
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
      </ScrollView>
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
  barcodeContanier: {
    alignItems: "center",
    borderRadius: 8,
    paddingBottom: 10,
  },
  barcodeButtons: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
    paddingBottom: 10,
  },
  scanButton: {
    backgroundColor: "#0ab546",
    padding: 10,
    marginRight: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  scanButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: { fontSize: 16, fontWeight: "bold", marginVertical: 10 },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#eee",
    marginRight: 10,
    borderRadius: 20,
  },
  chipActive: { backgroundColor: "#0ab546" },
  buttonImaje: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "green",
    backgroundColor: "blue",
    borderRadius: 8,
    alignItems: "center",
    padding: 15,
  },
  buttonText: {
    color: "white",
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
});
