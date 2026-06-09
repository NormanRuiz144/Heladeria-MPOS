import { Stack } from "expo-router";
import { useEffect } from "react";
import { runMigrations } from "../database/migrations";
import { empresaRepository } from "../database/repositories/empresaRepository";

export default function RootLayout() {
  useEffect(() => {
    runMigrations();
    // empresaRepository.create(0.15);
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}
