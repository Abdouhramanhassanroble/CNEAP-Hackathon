export interface Formation {
  nom: string;
  type: 'initiale' | 'apprentissage' | 'continue' | 'superieur';
}

export interface Etablissement {
  id: string;
  nom: string;
  ville: string;
  adresse: string;
  departement: string;
  departement_code: string;
  specialites: string[];
  formations: Formation[];
  color: string;
}

const COLORS: Record<string, string> = {
  '49': '#7C3AED',
  '44': '#2563EB',
  '72': '#059669',
  '53': '#D4A373',
  '85': '#2D6A4F',
};

export const etablissements: Etablissement[] = [
  // MAINE-ET-LOIRE (49)
  {
    id: 'angers_les_buissonnets',
    nom: 'Les Buissonnets',
    ville: 'Avrillé',
    adresse: '41 avenue Maurice Mailfert, 49240 AVRILLE',
    departement: 'Maine-et-Loire',
    departement_code: '49',
    specialites: ['Services aux personnes', 'Vente en espace rural'],
    formations: [
      { nom: '4ème et 3ème à projets professionnels', type: 'initiale' },
      { nom: 'CAP SAPVER', type: 'initiale' },
      { nom: 'Bac Pro SAPAT', type: 'initiale' },
      { nom: 'Bac Pro TCV (Technicien Conseil Vente)', type: 'initiale' },
      { nom: 'CAP SAPVER', type: 'apprentissage' },
      { nom: 'Bac Pro SAPAT', type: 'apprentissage' },
      { nom: 'Formations services aux personnes', type: 'continue' },
    ],
    color: COLORS['49'],
  },
  {
    id: 'les_ponts_de_ce',
    nom: 'Campus Pouillé',
    ville: 'Les Ponts-de-Cé',
    adresse: '29 route de Pouillé, 49130 Les Ponts de Cé',
    departement: 'Maine-et-Loire',
    departement_code: '49',
    specialites: ['Productions agricoles', 'Agroéquipement', 'Filière générale STAV'],
    formations: [
      { nom: 'Seconde générale et technologique', type: 'initiale' },
      { nom: 'Bac STAV', type: 'initiale' },
      { nom: 'Bac Pro Agricole', type: 'initiale' },
      { nom: 'BTSA Productions animales', type: 'initiale' },
      { nom: 'Formations en agroéquipement', type: 'initiale' },
      { nom: 'Apprentissage secteur agricole', type: 'apprentissage' },
      { nom: 'Formation continue agricole', type: 'continue' },
    ],
    color: COLORS['49'],
  },
  {
    id: 'angers_agritec',
    nom: 'Groupe ESA',
    ville: 'Angers',
    adresse: '55 rue Rabelais, 49007 ANGERS CEDEX 01',
    departement: 'Maine-et-Loire',
    departement_code: '49',
    specialites: ['Agroécologie', 'Systèmes alimentaires', 'Ingénieur agronome'],
    formations: [
      { nom: 'Bachelor Agroécologie et Systèmes alimentaires', type: 'superieur' },
      { nom: 'Ingénieur agronome', type: 'superieur' },
      { nom: 'Licence pro agriculture durable', type: 'superieur' },
      { nom: 'Master gestion agricole', type: 'superieur' },
      { nom: 'Formations continues spécialisées', type: 'continue' },
    ],
    color: COLORS['49'],
  },
  {
    id: 'chemille',
    nom: 'Robert d\'Arbrissel',
    ville: 'Chemillé',
    adresse: '8 place Urbain II, 49120 CHEMILLE',
    departement: 'Maine-et-Loire',
    departement_code: '49',
    specialites: ['Services aux personnes'],
    formations: [
      { nom: 'CAP SAPVER', type: 'initiale' },
      { nom: 'Bac Pro SAPAT', type: 'initiale' },
      { nom: 'Bac Pro SAPAT', type: 'apprentissage' },
      { nom: 'Formations adultes services aux personnes', type: 'continue' },
    ],
    color: COLORS['49'],
  },
  {
    id: 'cholet',
    nom: 'Jeanne Delanoue',
    ville: 'Cholet',
    adresse: '11 boulevard Jeanne d\'Arc, 49304 CHOLET',
    departement: 'Maine-et-Loire',
    departement_code: '49',
    specialites: ['Services aux personnes', 'Certifications professionnelles'],
    formations: [
      { nom: 'DEAP (Diplôme d\'État Auxiliaire Puériculture)', type: 'initiale' },
      { nom: 'DEAES (Accompagnant Éducatif et Social)', type: 'initiale' },
      { nom: 'Certifications professionnelles', type: 'continue' },
      { nom: 'Formations continues', type: 'continue' },
    ],
    color: COLORS['49'],
  },

  // LOIRE-ATLANTIQUE (44)
  {
    id: 'ancenis',
    nom: 'Jean-Baptiste Ériau',
    ville: 'Ancenis',
    adresse: '5 place de Béthune, 44150 ANCENIS',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Services aux personnes', 'Secteur agricole'],
    formations: [
      { nom: 'CAP SAPVER', type: 'initiale' },
      { nom: 'Bac Pro SAPAT', type: 'initiale' },
      { nom: 'Formations secteur agricole', type: 'apprentissage' },
      { nom: 'Formations pour adultes', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'le_landreau',
    nom: 'Briacé',
    ville: 'Le Landreau',
    adresse: 'Route de Caen, 44430 LE LANDREAU',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Paysage et aménagement', 'Productions agricoles'],
    formations: [
      { nom: 'CAPa Jardinier Paysagiste', type: 'initiale' },
      { nom: 'BP Aménagements Paysagers', type: 'initiale' },
      { nom: 'Bac Pro Aménagements Paysagers', type: 'initiale' },
      { nom: 'Bac Pro CGEA', type: 'initiale' },
      { nom: 'BTSA Aménagements Paysagers', type: 'initiale' },
      { nom: 'Apprentissage paysage', type: 'apprentissage' },
      { nom: 'Formation continue', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'derval___blain',
    nom: 'Saint-Clair',
    ville: 'Derval',
    adresse: '29 rue de Rennes, 44590 DERVAL',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Paysage et aménagement', 'Production végétale'],
    formations: [
      { nom: 'CAPa Jardinier Paysagiste', type: 'initiale' },
      { nom: 'Bac Pro Aménagements Paysagers', type: 'initiale' },
      { nom: 'BTSA Aménagements Paysagers', type: 'initiale' },
      { nom: 'Formations continues paysage', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'gorges',
    nom: 'Charles Péguy',
    ville: 'Gorges',
    adresse: '3 rue de la Sèvre, 44190 GORGES',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Vente et conseil', 'Fleuristerie'],
    formations: [
      { nom: 'CAP Fleuriste', type: 'initiale' },
      { nom: 'BP Fleuriste', type: 'initiale' },
      { nom: 'Formations continues fleuristerie', type: 'continue' },
      { nom: 'Certifications commerciales', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'le_pellerin',
    nom: 'Saint Gabriel Nantes-Océan',
    ville: 'Le Pellerin',
    adresse: 'Allée du Bois Tillac, 44640 LE PELLERIN',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Services aux personnes', 'Secteur médico-social'],
    formations: [
      { nom: 'DEAP (Auxiliaire Puériculture)', type: 'initiale' },
      { nom: 'DEES (Éducateur Spécialisé)', type: 'initiale' },
      { nom: 'Formations continues médico-social', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'chateaubriant',
    nom: 'Saint-Joseph',
    ville: 'Châteaubriant',
    adresse: '13 A rue de la Libération, 44141 CHATEAUBRIANT',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Services aux personnes'],
    formations: [
      { nom: 'CAP SAPVER', type: 'initiale' },
      { nom: 'Bac Pro SAPAT', type: 'initiale' },
      { nom: 'Formations services aux personnes', type: 'apprentissage' },
      { nom: 'Formations pour adultes', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'machecoul',
    nom: 'Saint-Martin',
    ville: 'Machecoul',
    adresse: '4 Ter Avenue des Mésanges, 44270 MACHECOUL',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Productions agricoles'],
    formations: [
      { nom: 'Bac Pro CGEA', type: 'initiale' },
      { nom: 'BPREA (Responsable Entreprise Agricole)', type: 'initiale' },
      { nom: 'Apprentissage agricole', type: 'apprentissage' },
      { nom: 'Formation continue agricole', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'nort_sur_erdre',
    nom: 'Lycée de l\'Erdre',
    ville: 'Nort-sur-Erdre',
    adresse: '13 rue du Général Leclerc, 44390 NORT SUR ERDRE',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Productions végétales', 'Agroéquipement'],
    formations: [
      { nom: 'Bac Pro CGEA', type: 'initiale' },
      { nom: 'Bac Pro Agroéquipement', type: 'initiale' },
      { nom: 'BTSA', type: 'initiale' },
      { nom: 'Apprentissage secteur agricole', type: 'apprentissage' },
      { nom: 'Formation continue', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'saint_molf',
    nom: 'Kerguénec',
    ville: 'Saint-Molf',
    adresse: 'Kerguénec, 44350 SAINT MOLF',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Élevage canin/félin', 'Services aux animaux'],
    formations: [
      { nom: 'Toiletteur canin, félin et NAC', type: 'initiale' },
      { nom: 'BP Éducateur canin', type: 'initiale' },
      { nom: 'Bac Pro CGESCF (Entreprise Canin/Félin)', type: 'initiale' },
      { nom: 'Formations continues animalerie', type: 'continue' },
      { nom: 'Certifications soins animaliers', type: 'continue' },
    ],
    color: COLORS['44'],
  },
  {
    id: 'saint_gildas_des_bois',
    nom: 'Gabriel Deshayes',
    ville: 'Saint-Gildas-des-Bois',
    adresse: '4 route de Redon, 44530 SAINT GILDAS DES BOIS',
    departement: 'Loire-Atlantique',
    departement_code: '44',
    specialites: ['Vigne et vin', 'Productions agricoles'],
    formations: [
      { nom: 'CAPa spécialisation vigne', type: 'initiale' },
      { nom: 'BPREA Vigne et Vin', type: 'initiale' },
      { nom: 'Bac Pro CGEVV (Entreprise vitivinicole)', type: 'initiale' },
      { nom: 'BTSA Viticulture-Œnologie', type: 'initiale' },
      { nom: 'CS Commercialisation des vins', type: 'initiale' },
      { nom: 'Apprentissage viticole', type: 'apprentissage' },
      { nom: 'Formation continue', type: 'continue' },
    ],
    color: COLORS['44'],
  },

  // SARTHE (72)
  {
    id: 'la_ferte_bernard',
    nom: 'Le Tertre Notre Dame',
    ville: 'La Ferté-Bernard',
    adresse: '10 rue du Tertre, 72400 La Ferté-Bernard',
    departement: 'Sarthe',
    departement_code: '72',
    specialites: ['Services aux personnes', 'Formations continues'],
    formations: [
      { nom: 'DEAES (Accompagnant Éducatif et Social)', type: 'initiale' },
      { nom: 'DEAP (Auxiliaire Puériculture)', type: 'initiale' },
      { nom: 'Certifications professionnelles', type: 'continue' },
      { nom: 'Formation continue secteur social', type: 'continue' },
    ],
    color: COLORS['72'],
  },
  {
    id: 'ruille_sur_loir',
    nom: 'Lycée Nazareth',
    ville: 'Ruillé-sur-Loir',
    adresse: 'Rue de l\'Abbé Dujarié, 72340 RUILLÉ-SUR-LOIR',
    departement: 'Sarthe',
    departement_code: '72',
    specialites: ['Agroalimentaire', 'Bio-industries'],
    formations: [
      { nom: 'Formations agroalimentaires', type: 'initiale' },
      { nom: 'Bio-industries', type: 'initiale' },
    ],
    color: COLORS['72'],
  },
  {
    id: 'sable_sur_sarthe',
    nom: 'Sablé-sur-Sarthe',
    ville: 'Sablé-sur-Sarthe',
    adresse: 'Sablé-sur-Sarthe, 72300',
    departement: 'Sarthe',
    departement_code: '72',
    specialites: ['Agriculture'],
    formations: [
      { nom: 'Formations agricoles', type: 'initiale' },
      { nom: 'Apprentissage', type: 'apprentissage' },
    ],
    color: COLORS['72'],
  },

  // MAYENNE (53)
  {
    id: 'evron',
    nom: 'Evron',
    ville: 'Evron',
    adresse: 'Evron, 53600',
    departement: 'Mayenne',
    departement_code: '53',
    specialites: ['Agriculture', 'Internat (120 places, ratio 48%)'],
    formations: [
      { nom: 'Formations agricoles', type: 'initiale' },
      { nom: 'Apprentissage', type: 'apprentissage' },
    ],
    color: COLORS['53'],
  },
  {
    id: 'bazouges_chateau_gontier',
    nom: 'Bazouges-Château-Gontier',
    ville: 'Château-Gontier',
    adresse: 'Château-Gontier, 53200',
    departement: 'Mayenne',
    departement_code: '53',
    specialites: ['Agriculture'],
    formations: [
      { nom: 'Formations agricoles', type: 'initiale' },
      { nom: 'Apprentissage', type: 'apprentissage' },
    ],
    color: COLORS['53'],
  },
  {
    id: 'mayenne',
    nom: 'Mayenne',
    ville: 'Mayenne',
    adresse: 'Mayenne, 53100',
    departement: 'Mayenne',
    departement_code: '53',
    specialites: ['Agriculture'],
    formations: [
      { nom: 'Formations agricoles', type: 'initiale' },
      { nom: 'Apprentissage', type: 'apprentissage' },
    ],
    color: COLORS['53'],
  },

  // VENDÉE (85)
  {
    id: 'la_roche_sur_yon',
    nom: 'La Roche-sur-Yon',
    ville: 'La Roche-sur-Yon',
    adresse: 'La Roche-sur-Yon, 85000',
    departement: 'Vendée',
    departement_code: '85',
    specialites: ['Agriculture'],
    formations: [
      { nom: 'Formations agricoles', type: 'initiale' },
      { nom: 'Apprentissage', type: 'apprentissage' },
    ],
    color: COLORS['85'],
  },
];

export const TYPE_LABELS: Record<Formation['type'], string> = {
  initiale: 'Formation initiale',
  apprentissage: 'Apprentissage',
  continue: 'Formation continue',
  superieur: 'Enseignement supérieur',
};

export const TYPE_COLORS: Record<Formation['type'], string> = {
  initiale: '#2D6A4F',
  apprentissage: '#2563EB',
  continue: '#D4A373',
  superieur: '#7C3AED',
};
