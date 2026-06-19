import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import {
  Cliente,
  clientesRepository,
} from "../../database/repositories/clientesRepository";
import { useCartStore } from "../../store/cartStore";

const { width } = Dimensions.get("window");

const ScannerClient = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const setClientId = useCartStore((state) => state.setClientId);
  const params = useLocalSearchParams();
  const modo = params?.modo || "scan";

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
    if (modo === "scan") {
      try {
        let ruc = data.split("<");

        const cliente = (await clientesRepository.getByRuc(ruc[1])) as Cliente;
        if (cliente) {
          setClientId(cliente.id);
          router.back();
        } else {
          Alert.alert("Error", `No se encontró un cliente con RUC: ${data}`);
        }
      } catch (error) {
        console.error("Error al buscar cliente por QR:", error);
        Alert.alert("Error", "Error al buscar el cliente.");
      } finally {
        setTimeout(() => {
          setIsProcessing(false);
        }, 1500);
      }
    } else if (modo == "asignar") {
      let ruc = data.split("<");
      const clienteEncontrado = (await clientesRepository.getByRuc(
        ruc[0]
      )) as Cliente;
      if (!clienteEncontrado) {
        Alert.alert(
          "El codigo de Ruc del cliente a insertar es:",
          `Código: ${ruc[1]}`
        );
        router.dismissTo({
          pathname: "/cliente/crear",
          params: { data: ruc[1] },
        });
      } else {
        Alert.alert(
          "ya exites un cliente con:",
          `Nombre: ${clienteEncontrado.nombre} Nuemero de cedula: ${clienteEncontrado.ruc}`
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Cedula</Text>
        <Text style={styles.link} onPress={() => router.back()}>
          Volver
        </Text>
      </View>

      <CameraView
        style={styles.camera}
        facing="back"
        // Limitamos los tipos para mejorar el rendimiento de la CPU
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
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
              {isProcessing ? "Procesando..." : "Coloque el código de qr aquí"}
            </Text>
          </View>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

export default ScannerClient;

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
    height: 250,
  },
  unfocusedContainerSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  targetScanner: {
    width: width * 0.6,
    height: 250,
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
