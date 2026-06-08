import { Stack } from "expo-router";
import { useEffect } from "react";
import { runMigrations } from "../database/migrations";

export default function RootLayout() {
  useEffect(() => {
    runMigrations();
  }, []);
  return <Stack screenOptions={{ headerShown: false }} />;
}
