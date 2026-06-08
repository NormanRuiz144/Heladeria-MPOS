import { db } from "../database";

export const SaleRepository = {
  async getAll() {
    const database = await db;
    return database.getAllAsync(
      "SELECT * FROM ventas GROUP BY fecha ORDER BY id DESC"
    );
  },
  async create(total: number, montoPagado: number, cambio: number) {
    return (await db).runAsync(
      "INSERT INTO ventas (total, monto_pagado, cambio) VALUES (?, ?, ?)",
      [total, montoPagado, cambio]
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
      `SELECT 
      v.id,
      v.total,
      v.fecha,
      v.monto_pagado,
      v.cambio,
      
      mp.metodo_pago as metodos_pago
      
   FROM ventas v
   INNER JOIN metodo_pago mp ON v.id = mp.id_venta
   WHERE v.fecha BETWEEN ? AND ?
   ORDER BY v.fecha DESC`,
      [start, end]
    );
  },
};
