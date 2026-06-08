import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseAsync("pos.db");

export const execute = async (query: string, params: any[] = []) => {
  try {
    const result = (await db).runAsync(query, params);
    return result;
  } catch (error) {
    console.log("SQL ERROR ", error);
  }
};
