import { db } from "../database";

export const empresaRepository = {
  async create(impuesto: number) {
    return (await db).runAsync("INSERT INTO empresa (impuesto) VALUES (?)", [
      impuesto,
    ]);
  },

  async getById(empresaId: number) {
    const database = await db;
    return database.getFirstAsync("SELECT impuesto FROM empresa WHERE id = ?", [
      empresaId,
    ]);
  },
};
