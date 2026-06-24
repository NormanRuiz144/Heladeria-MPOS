import { db } from "../database";

export const SaleRepository = {
  async getAll() {
    const database = await db;
    return database.getAllAsync("SELECT * FROM ventas ORDER BY fecha DESC");
  },
  async create(total: number, montoPagado: number, cambio: number, subtotal?: number, impuestoAmount?: number) {
    return (await db).runAsync(
      "INSERT INTO ventas (total, monto_pagado, cambio, subtotal, impuesto_amount) VALUES (?, ?, ?, ?, ?)",
      [total, montoPagado, cambio, subtotal ?? 0, impuestoAmount ?? 0]
    );
  },

  async updateState(id: number) {
    (await db).runAsync("UPDATE ventas SET estado = ? WHERE id = ?", [
      true,
      id,
    ]);
  },

  async getReportByDateRange(startDate: string, endDate: string) {
    const database = await db;
    const start = `${startDate} 00:00:00`;
    const end = `${endDate} 23:59:59`;

    return database.getAllAsync(
      "SELECT * FROM ventas WHERE fecha BETWEEN ? AND ? ORDER BY fecha DESC",
      [start, end]
    );
  },
};
