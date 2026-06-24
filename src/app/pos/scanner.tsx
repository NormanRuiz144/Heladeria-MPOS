import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { RelativePathString, router, useLocalSearchParams } from "expo-router";
import { ProductRepository } from "../../database/repositories/productRepository";
import { Product } from "../movimientos/crear";
import { useCartStore } from "../../store/cartStore";

const { width } = Dimensions.get("window");

const Scanner = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const params = useLocalSearchParams();
  const modo = params?.modo || "scan";
  // necesario para volver al apartado anterior
  console.log("Apartado anterior:", params?.apartado);
  const path = "/productos/" + params?.apartado;

  // Solicitar permisos al montar el componente
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Si los permisos se están cargando
  if (!permission) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text>Cargando cámara...</Text>
      </SafeAreaView>
    );
  }

  // Si los permisos fueron denegados
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text style={styles.textError}>
          Se necesitan permisos de cámara para escanear.
        </Text>
        <Text style={styles.link} onPress={requestPermission}>
          Conceder Permiso
        </Text>
        <Text style={styles.link} onPress={() => router.back()}>
          Volver
        </Text>
      </SafeAreaView>
    );
  }

  // Manejador del escaneo de códigos de barra
  const handleBarcodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (isProcessing) return;

    setIsProcessing(true);

    console.log(`Código detectado - Tipo: ${type} | Datos: ${data}`);
    if (modo == "scan") {
      try {
        const productoEncontrado =
          (await ProductRepository.searchByCodigoBarras(data)) as Product;

        if (productoEncontrado) {
          console.log(`Descripcion del producto: ${productoEncontrado.nombre}`);
          addItem(productoEncontrado);
          Alert.alert("Producto Agregado", `Código: ${data}`);
        } else {
          Alert.alert(
            "Error",
            `El producto con código ${data} no está registrado.`
          );
        }
      } catch (error) {
        console.error("Error al buscar en SQLite:", error);
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
        }, 1500);
      }
    } else {
      const productoEncontrado = (await ProductRepository.searchByCodigoBarras(
        data
      )) as Product;
      if (!productoEncontrado) {
        Alert.alert(
          "El codigo de barras del Producto a insertar es:",
          `Código: ${data}`
        );
        router.dismissTo({
          pathname: path as RelativePathString,
          params: { data: data },
        });
      } else {
        Alert.alert(
          "El codigo de barras ya esta asociado a un Producto es:",
          `Nombre: ${productoEncontrado.nombre} Codigo: ${productoEncontrado.codigo}`
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Producto</Text>
        <Text style={styles.link} onPress={() => router.back()}>
          Volver
        </Text>
      </View>

      <CameraView
        style={styles.camera}
        facing="back"
        // Limitamos los tipos para mejorar el rendimiento de la CPU
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "code128", "upc_a"],
        }}
        onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
      >
        {/* Máscara visual para ayudar al usuario a centrar el código */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
            <View style={styles.unfocusedContainerSide}></View>
            <View
              style={[
                styles.targetScanner,
                isProcessing && styles.targetProcessing,
              ]}
            />
            <View style={styles.unfocusedContainerSide}></View>
          </View>
          <View style={styles.unfocusedContainer}>
            <Text style={styles.scanText}>
              {isProcessing
                ? "Procesando..."
                : "Coloque el código de barras aquí"}
            </Text>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

export default Scanner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    color: "#007AFF",
    fontSize: 16,
    marginTop: 10,
  },
  textError: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  focusedContainer: {
    flexDirection: "row",
    height: 200,
  },
  unfocusedContainerSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  targetScanner: {
    width: width * 0.8,
    height: 200,
    borderWidth: 2,
    borderColor: "#00FF00",
    backgroundColor: "transparent",
    borderRadius: 8,
  },
  targetProcessing: {
    borderColor: "#FFCC00",
  },
  scanText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
