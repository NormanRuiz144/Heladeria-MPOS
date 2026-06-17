import { db } from "../database";

export const CategoriaRepository = {
  /**
   * Obtiene todas las categorías disponibles.
   * Útil para llenar Selectores (Pickers) o listas en formularios.
   */
  async getAll() {
    const database = await db;
    return database.getAllAsync("SELECT * FROM categorias");
  },

  /**
   * Crea una nueva categoría.
   */
  async create(nombre: string) {
    const database = await db;
    return database.runAsync("INSERT INTO categorias (nombre) VALUES (?)", [nombre]);
  },

  /**
   * Elimina una categoría por su ID.
   */
  async delete(id: number) {
    const database = await db;
    return database.runAsync("DELETE FROM categorias WHERE id = ?", [id]);
  }
};