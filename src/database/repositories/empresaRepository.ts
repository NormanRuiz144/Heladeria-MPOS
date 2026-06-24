import { db } from "../database";

interface EmpresaData {
  id: number;
  impuesto: number;
  logo: string | null;
  nombre: string | null;
  direccion: string | null;
}

export const empresaRepository = {
  async create(impuesto: number, nombre?: string, direccion?: string, logo?: string) {
    return (await db).runAsync(
      "INSERT INTO empresa (impuesto, nombre, direccion, logo) VALUES (?, ?, ?, ?)",
      [impuesto, nombre || null, direccion || null, logo || null]
    );
  },

  async getById(empresaId: number): Promise<EmpresaData | null> {
    const database = await db;
    return database.getFirstAsync(
      "SELECT id, impuesto, logo, nombre, direccion FROM empresa WHERE id = ?",
      [empresaId]
    ) as Promise<EmpresaData | null>;
  },

  async getFirst(): Promise<EmpresaData | null> {
    const database = await db;
    return database.getFirstAsync(
      "SELECT id, impuesto, logo, nombre, direccion FROM empresa LIMIT 1"
    ) as Promise<EmpresaData | null>;
  },

  async update(id: number, data: Partial<Omit<EmpresaData, "id">>) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.impuesto !== undefined) {
      fields.push("impuesto = ?");
      values.push(data.impuesto);
    }
    if (data.nombre !== undefined) {
      fields.push("nombre = ?");
      values.push(data.nombre);
    }
    if (data.direccion !== undefined) {
      fields.push("direccion = ?");
      values.push(data.direccion);
    }
    if (data.logo !== undefined) {
      fields.push("logo = ?");
      values.push(data.logo);
    }

    if (fields.length === 0) return;

    values.push(id);
    const database = await db;
    await database.runAsync(
      `UPDATE empresa SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
  },

  async initialize() {
    const existing = await this.getFirst();
    if (!existing) {
      await this.create(0);
    }
  },
};
