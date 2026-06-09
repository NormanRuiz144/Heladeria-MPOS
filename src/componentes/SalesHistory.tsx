import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SaleRepository } from "../database/repositories/saleRepository";
import { MetodoPagoRepository } from "../database/repositories/metodoPagoRepository";
import { FontAwesome5 } from "@expo/vector-icons";
import SalesCard from "./SalesCard";
import { MovementRepository } from "../database/repositories/movementRepository";
import { SaleDetailRepository } from "../database/repositories/saleDetailRepository";
import { ProductRepository } from "../database/repositories/productRepository";
import { CartItem, PaymentMethod, PaymentType } from "../store/cartStore";
import { Product } from "../app/movimientos/crear";
import { PrintTicket, PrintInvoice } from "../print_service/Print";
import PrintOptionsModal from "./PrintOptionsModal";

export interface MetodoPagoItem {
  id: number;
  id_venta: number;
  metodo_pago: string;
  monto: number;
}

export interface IVenta {
  id: number;
  total: number;
  fecha: string;
  monto_pagado: number;
  cambio: number;
  estado: boolean;
  metodos_pago: MetodoPagoItem[];
}

interface ISaleDetail {
  id: number;
  ventas_id: number;
  product_id: number;
  cantidad: number;
  precio: number;
}
export default function SalesHistory() {
  const [sales, setSales] = useState<IVenta[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedPrintData, setSelectedPrintData] = useState<any>(null);

  const cargarSales = async () => {
    const data = await SaleRepository.getAll();
    const ventas = data as IVenta[];
    for (const venta of ventas) {
      const metodos = await MetodoPagoRepository.getByVentaId(venta.id);
      venta.metodos_pago = metodos as MetodoPagoItem[];
    }
    setSales(ventas);
  };
  const cargarDetalles = async (id: number) => {
    const data = await SaleDetailRepository.getDetails(id);
    return data as ISaleDetail[];
  };

  const anularVenta = (id: number) => {
    Alert.alert(
      "Confirmar Anulación",
      "¿Estás seguro de que deseas anular esta venta? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Anular",
          onPress: async () => {
            try {
              const listaDetails = await cargarDetalles(id);
              for (const detail of listaDetails) {
                await ProductRepository.adjustStock(
                  detail.product_id,
                  detail.cantidad
                );
              }
              await MovementRepository.updateState(id, true);
              await SaleRepository.updateState(id);
              cargarSales();
            } catch (error) {
              console.error("Error al anular la venta:", error);
            }
          },
        },
      ]
    );
  };

  const printVoucher = async (
    id: number,
    metodos_pago: MetodoPagoItem[],
    total: number
  ) => {
    const listaDetails = await cargarDetalles(id);
    let listaProductsSaled: Array<CartItem> = [];
    for (const detalle of listaDetails) {
      let product = (await ProductRepository.getById(
        detalle.product_id
      )) as Product;
      listaProductsSaled.push({
        product: {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          stock: product.stock,
          codigo: product.codigo,
        },
        quantity: detalle.cantidad,
      });
    }
    const payments: PaymentMethod[] = metodos_pago.map((mp) => ({
      type: mp.metodo_pago as PaymentType,
      amount: mp.monto,
    }));
    setSelectedPrintData({
      items: listaProductsSaled,
      payments,
      total,
      numSale: id,
    });
    setShowPrintModal(true);
  };

  const handlePrintSelect = async (option: "ticket" | "invoice") => {
    setShowPrintModal(false);
    if (selectedPrintData) {
      if (option === "ticket") {
        await PrintTicket(
          selectedPrintData.items,
          selectedPrintData.payments,
          selectedPrintData.total,
          selectedPrintData.numSale
        );
      } else {
        await PrintInvoice(
          selectedPrintData.items,
          selectedPrintData.payments,
          selectedPrintData.total,
          selectedPrintData.numSale
        );
      }
      setSelectedPrintData(null);
    }
  };

  useEffect(() => {
    cargarSales();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Historial de Ventas Recientes: （￣︶￣）
      </Text>
      <FlatList
        style={styles.listSales}
        data={sales}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SalesCard
            item={item}
            anularVenta={anularVenta}
            printVoucher={printVoucher}
          />
        )}
      />
      <PrintOptionsModal
        visible={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onSelectOption={handlePrintSelect}
        saleData={selectedPrintData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  listSales: {
    maxHeight: 600,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
});
