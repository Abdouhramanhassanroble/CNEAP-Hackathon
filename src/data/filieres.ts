import type { Filiere } from "@/types";

/**
 * Libellés des filières pour l'affichage (menu filtre, etc.)
 */
export const FILIERES: { value: Filiere; label: string }[] = [
  { value: "general", label: "Général" },
  { value: "technologique", label: "Technologique" },
  { value: "professionnel", label: "Professionnel" },
  { value: "agricole", label: "Agricole" },
];
