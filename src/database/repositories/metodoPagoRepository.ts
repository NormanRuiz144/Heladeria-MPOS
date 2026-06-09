import { db } from "../database";

export const MetodoPagoRepository = {
  async create(ventaId: number, metodoPago: string, monto: number) {
    return (await db).runAsync(
      "INSERT INTO metodo_pago (id_venta, metodo_pago, monto) VALUES (?, ?, ?)",
      [ventaId, metodoPago, monto]
    );
  },

  async getByVentaId(ventaId: number) {
    const database = await db;
    return database.getAllAsync(
      "SELECT * FROM metodo_pago WHERE id_venta = ?",
      [ventaId]
    );
  },

  async getByVentaIds(ventaIds: number[]) {
    if (ventaIds.length === 0) return [];
    const database = await db;
    const placeholders = ventaIds.map(() => "?").join(",");
    return database.getAllAsync(
      `SELECT * FROM metodo_pago WHERE id_venta IN (${placeholders})`,
      ventaIds
    );
  },
};
