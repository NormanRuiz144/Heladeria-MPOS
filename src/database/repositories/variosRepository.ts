import { db } from "../database";

export const VariosRepository = {
    // ESTE ES EL MÉTODO QUE NECESITAS PARA EL REPORTE
 async getReportByDateRange(startDate: string, endDate: string) {
    const database = await db;
    return database.getAllAsync(
      "SELECT * FROM ventas_varias WHERE date(fecha) BETWEEN ? AND ? ORDER BY fecha DESC",
      [startDate, endDate]
    );
  },
  // Obtener todas las ventas varias
  async getAll() {
    const database = await db;
    return database.getAllAsync("SELECT * FROM ventas_varias ORDER BY fecha DESC");
  },

  // Obtener una venta varia por ID
  async getById(id: number) {
    const database = await db;
    return database.getFirstAsync("SELECT * FROM ventas_varias WHERE id = ?", [id]);
  },

  // Crear un nuevo registro de venta varia
  async create(descripcion: string, motivo: string, monto: number) {
    const database = await db;
    return database.runAsync(
      "INSERT INTO ventas_varias (descripcion, motivo, monto) VALUES (?, ?, ?)",
      [descripcion, motivo, monto]
    );
  },

  // Actualizar un registro de venta varia
  async update(id: number, descripcion: string, motivo: string, monto: number) {
    const database = await db;
    return database.runAsync(
      "UPDATE ventas_varias SET descripcion = ?, motivo = ?, monto = ? WHERE id = ?",
      [descripcion, motivo, monto, id]
    );
  },

  // Eliminar un registro
  async delete(id: number) {
    const database = await db;
    return database.runAsync("DELETE FROM ventas_varias WHERE id = ?", [id]);
  },

  // Opcional: Sumar todos los montos de ventas varias (útil para reportes)
  async getTotalVentasVarias() {
    const database = await db;
    const result = await database.getFirstAsync("SELECT SUM(monto) as total FROM ventas_varias");
    return (result as any)?.total || 0;
  }
};