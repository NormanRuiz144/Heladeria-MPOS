import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string; // El código de barras (ej: "PROD-10023")
  format?: "CODE128" | "EAN13" | "UPC"; // Formato del código
  width?: number; // Ancho de cada línea individual (por defecto 2)
  height?: number; // Altura de las líneas en píxeles
  showText?: boolean; // Mostrar el texto legible debajo de las barras
}

const BarcodeGenerator = ({
  value,
  format = "CODE128",
  width = 2,
  height = 80,
  showText = true,
}: BarcodeProps) => {
  // useMemo evita recalcular el SVG innecesariamente si el valor no cambia
  const barcodeSvgData = useMemo(() => {
    if (!value) return null;

    try {
      const encoder: any = {};
      // JsBarcode guarda el resultado de la codificación en nuestro objeto 'encoder'
      JsBarcode(encoder, value, {
        format,
        width,
        height,
        displayValue: false, // Lo manejamos nativamente con un <Text> para mejor control
      });

      // El encoder nos devuelve una estructura con las propiedades del formato generado
      const encodings = encoder.encodings;
      return encodings[0].data; // Devuelve una cadena de unos y ceros (ej: "101011100...")
    } catch (error) {
      console.error("Error generando código de barras:", error);
      return null;
    }
  }, [value, format, width, height]);

  if (!barcodeSvgData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Código inválido para formato {format}
        </Text>
      </View>
    );
  }

  // Convertimos la cadena de bits ("10110") en un path SVG dibujable
  let currentX = 0;
  let pathD = "";

  for (let i = 0; i < barcodeSvgData.length; i++) {
    if (barcodeSvgData[i] === "1") {
      // Si es un 1, dibujamos una barra vertical de ancho 'width' y alto 'height'
      pathD += `M${currentX},0 L${currentX},${height} L${currentX + width},${height} L${currentX + width},0 Z `;
    }
    currentX += width;
  }

  return (
    <View style={styles.container}>
      {/* Calculamos el ancho total dinámicamente según la cantidad de caracteres */}
      <Svg width={currentX} height={height}>
        <Path d={pathD} fill="black" />
      </Svg>

      {showText && <Text style={styles.barcodeText}>{value}</Text>}
    </View>
  );
};

export default BarcodeGenerator;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 4,
  },
  barcodeText: {
    marginTop: 8,
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "600",
    color: "#000",
  },
  errorContainer: {
    padding: 10,
    backgroundColor: "#FFEBEB",
    borderRadius: 4,
  },
  errorText: {
    color: "#D12727",
    fontSize: 12,
  },
});
