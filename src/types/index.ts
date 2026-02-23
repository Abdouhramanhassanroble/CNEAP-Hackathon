/**
 * Types partagés pour l'application de visualisation des établissements scolaires.
 */

/** Filière de formation (Général, Technologique, Professionnel, etc.) */
export type Filiere = "general" | "technologique" | "professionnel" | "agricole";

/** Indicateurs clés d'un établissement */
export interface Indicateurs {
  /** Taux d'insertion professionnelle (%) */
  tauxInsertion: number;
  /** Taux de recherche d'emploi (%) */
  tauxRechercheEmploi: number;
  /** Taux de poursuite d'études (%) */
  tauxPoursuiteEtudes: number;
  /** Taux de réussite au bac (%) */
  tauxReussiteBac: number;
}

/** Données démographiques par tranche d'âge */
export interface Demographie {
  tranche: string;
  effectif: number;
  pourcentage: number;
}

/** Établissement scolaire */
export interface Etablissement {
  id: string;
  nom: string;
  ville: string;
  /** Coordonnées [lat, lng] pour la carte */
  coordonnees: [number, number];
  /** Filières proposées */
  filieres: Filiere[];
  indicateurs: Indicateurs;
  /** Démographie locale (focus 14-23 ans) */
  demographie: Demographie[];
}

/** Données de population locale pour l'analyse (tranche 14-23 ans) */
export interface PopulationLocale {
  etablissementId: string;
  etablissementNom: string;
  /** Répartition par âge pour 14-23 ans */
  parAge: { age: number; effectif: number }[];
  /** Total 14-23 ans */
  total14_23: number;
}
