export const alertes = [
  { id: 1, severity: 'red' as const, level: 'CRITIQUE', title: 'BTS ACSE : passage sous seuil de viabilité en 2028', etablissement: 'Établières', categorie: 'Formation', date: '15/01/2025', description: "L'effectif projeté passe de 28 à 17 élèves (-39%). Le seuil minimum est de 15. Sans action, fermeture en 2029.", recommandation: "Rapprochement avec Heermont ou mutualisation des moyens." },
  { id: 2, severity: 'red' as const, level: 'CRITIQUE', title: 'CAPA Jardinier Paysagiste : non viable à horizon 2029', etablissement: 'Heermont', categorie: 'Formation', date: '15/01/2025', description: "Effectif projeté : 10 élèves (seuil : 12). Baisse continue depuis 2021.", recommandation: "Transformation en Bac Pro Aménagements Paysagers." },
  { id: 3, severity: 'red' as const, level: 'CRITIQUE', title: 'Score de viabilité réseau sous 70/100', etablissement: 'Réseau', categorie: 'Général', date: '10/01/2025', description: "Le score global est passé sous le seuil d'alerte. Plusieurs filières contribuent à cette dégradation.", recommandation: "Revue stratégique globale avec le conseil d'administration." },
  { id: 4, severity: 'orange' as const, level: 'IMPORTANT', title: 'Concurrence territoriale sur CGEA', etablissement: 'Réseau', categorie: 'Territoire', date: '12/01/2025', description: "Les 2 établissements proposent CGEA avec un bassin partagé à 62%. Risque de cannibalisation.", recommandation: "Spécialiser : polyculture-élevage à Établières, grandes cultures à Heermont." },
  { id: 5, severity: 'orange' as const, level: 'IMPORTANT', title: '3 départs retraite simultanés en 2027', etablissement: 'Établières', categorie: 'RH', date: '08/01/2025', description: "1 enseignant CGEA, 1 enseignant CAPA, 1 administratif. Risque de désorganisation.", recommandation: "Anticiper recrutements dès 2026, envisager non-remplacement du poste CAPA." },
  { id: 6, severity: 'orange' as const, level: 'IMPORTANT', title: 'Extension internat : ROI négatif en scénario médian', etablissement: 'Établières', categorie: 'Investissement', date: '05/01/2025', description: "Le projet 400K€ ne génère un ROI positif que dans le scénario optimiste. Report recommandé.", recommandation: "Reporter et réévaluer après projections 2026." },
  { id: 7, severity: 'orange' as const, level: 'IMPORTANT', title: 'CGEA Bac Pro sous seuil en 2029', etablissement: 'Heermont', categorie: 'Formation', date: '03/01/2025', description: "Effectif projeté à 24 élèves en 2029, se rapprochant du seuil de 25.", recommandation: "Renforcer la communication et étudier la mutualisation." },
  { id: 8, severity: 'yellow' as const, level: 'MODÉRÉ', title: 'Baisse tendancielle des effectifs CAPA', etablissement: 'Réseau', categorie: 'Formation', date: '20/12/2024', description: "Les effectifs CAPA baissent de 44% sur la période, tendance nationale confirmée.", recommandation: "Orienter les élèves vers les Bac Pro correspondants." },
  { id: 9, severity: 'yellow' as const, level: 'MODÉRÉ', title: "Attractivité en recul — Château-Gontier", etablissement: 'Heermont', categorie: 'Territoire', date: '15/12/2024', description: "Premiers vœux en baisse de 15% sur 3 ans.", recommandation: "Renforcer communication locale et journées portes ouvertes." },
  { id: 10, severity: 'green' as const, level: 'OPPORTUNITÉ', title: 'Demande non couverte en agriculture biologique', etablissement: 'Réseau', categorie: 'Formation', date: '10/12/2024', description: "Aucune formation AB dans un rayon de 50km. 23% des exploitations en conversion.", recommandation: "Étudier l'ouverture d'une spécialisation AB en Bac Pro CGEA." },
  { id: 11, severity: 'green' as const, level: 'OPPORTUNITÉ', title: 'Agroéquipement : filière résiliente', etablissement: 'Établières', categorie: 'Formation', date: '08/12/2024', description: "Recul modéré (-11%), demande forte en agriculture de précision.", recommandation: "Renforcer le positionnement agri-tech." },
];

export const filieresDetaillees = [
  { filiere: 'CGEA', niveau: 'Bac Pro', effectif2025: 45, proj2028: 38, proj2030: 31, delta: -31, seuilMin: 25, etablissement: 'etablieres' },
  { filiere: 'ACSE', niveau: 'BTS', effectif2025: 28, proj2028: 22, proj2030: 17, delta: -39, seuilMin: 15, etablissement: 'etablieres' },
  { filiere: 'Jardinier Paysagiste', niveau: 'CAPA', effectif2025: 18, proj2028: 14, proj2030: 10, delta: -44, seuilMin: 12, etablissement: 'etablieres' },
  { filiere: 'Agroéquipement', niveau: 'Bac Pro', effectif2025: 52, proj2028: 49, proj2030: 46, delta: -11, seuilMin: 20, etablissement: 'etablieres' },
  { filiere: 'Services aux Personnes', niveau: 'Bac Pro', effectif2025: 35, proj2028: 33, proj2030: 30, delta: -14, seuilMin: 15, etablissement: 'etablieres' },
  { filiere: 'Animalerie', niveau: 'Bac Pro', effectif2025: 42, proj2028: 38, proj2030: 34, delta: -19, seuilMin: 20, etablissement: 'etablieres' },
  { filiere: 'Forêt', niveau: 'Bac Pro', effectif2025: 38, proj2028: 35, proj2030: 32, delta: -16, seuilMin: 15, etablissement: 'etablieres' },
  { filiere: 'Aménagement Paysager', niveau: 'BTS', effectif2025: 35, proj2028: 32, proj2030: 28, delta: -20, seuilMin: 15, etablissement: 'etablieres' },
  { filiere: 'Lab. Contrôle Qualité', niveau: 'BTS', effectif2025: 22, proj2028: 20, proj2030: 18, delta: -18, seuilMin: 12, etablissement: 'etablieres' },
  { filiere: 'CGEA', niveau: 'Bac Pro', effectif2025: 38, proj2028: 32, proj2030: 27, delta: -29, seuilMin: 25, etablissement: 'heermont' },
  { filiere: 'ACSE', niveau: 'BTS', effectif2025: 24, proj2028: 19, proj2030: 15, delta: -37, seuilMin: 15, etablissement: 'heermont' },
  { filiere: 'Agroéquipement', niveau: 'Bac Pro', effectif2025: 30, proj2028: 28, proj2030: 26, delta: -13, seuilMin: 20, etablissement: 'heermont' },
  { filiere: 'Viticulture', niveau: 'Bac Pro', effectif2025: 45, proj2028: 40, proj2030: 36, delta: -20, seuilMin: 20, etablissement: 'heermont' },
  { filiere: 'Aménagement Paysager', niveau: 'Bac Pro', effectif2025: 28, proj2028: 25, proj2030: 22, delta: -21, seuilMin: 15, etablissement: 'heermont' },
  { filiere: 'Hippologie', niveau: 'Bac Pro', effectif2025: 32, proj2028: 28, proj2030: 24, delta: -25, seuilMin: 15, etablissement: 'heermont' },
  { filiere: 'Services aux Personnes', niveau: 'Bac Pro', effectif2025: 25, proj2028: 23, proj2030: 20, delta: -20, seuilMin: 15, etablissement: 'heermont' },
  { filiere: 'Jardinier Paysagiste', niveau: 'CAPA', effectif2025: 15, proj2028: 12, proj2030: 9, delta: -40, seuilMin: 12, etablissement: 'heermont' },
];

export const personnelRH = [
  { poste: 'Enseignant CGEA', etablissement: 'Établières', depart: 'Sept 2027', remplacement: false, recommandation: 'Redéploiement BTS' },
  { poste: 'Enseignant CAPA', etablissement: 'Établières', depart: 'Juin 2027', remplacement: false, recommandation: 'Filière en fermeture' },
  { poste: 'Admin finances', etablissement: 'Établières', depart: 'Déc 2028', remplacement: true, recommandation: 'Poste structurant' },
  { poste: 'Enseignant Agroéquip.', etablissement: 'Heermont', depart: 'Sept 2029', remplacement: true, recommandation: 'Filière dynamique' },
  { poste: 'Enseignant Viticulture', etablissement: 'Heermont', depart: 'Sept 2030', remplacement: true, recommandation: 'À évaluer' },
  { poste: 'Dir. adjoint', etablissement: 'Établières', depart: 'Déc 2030', remplacement: true, recommandation: 'Succession à préparer' },
];

export const featureImportance = [
  { factor: 'Démographie locale', pct: 45 },
  { factor: 'Historique effectifs', pct: 25 },
  { factor: 'Attractivité filière', pct: 15 },
  { factor: 'Indicateurs agricoles', pct: 10 },
  { factor: 'Autres', pct: 5 },
];

export const riskMatrixData = [
  { name: 'Fermeture BTS ACSE', probabilite: 75, impact: 90, eleves: 28, categorie: 'Formation' },
  { name: 'Fermeture CAPA JP', probabilite: 85, impact: 60, eleves: 33, categorie: 'Formation' },
  { name: 'Cannibalisation CGEA', probabilite: 60, impact: 70, eleves: 83, categorie: 'Territoire' },
  { name: 'ROI négatif internat', probabilite: 65, impact: 50, eleves: 0, categorie: 'Investissement' },
  { name: 'Désorganisation RH 2027', probabilite: 55, impact: 65, eleves: 0, categorie: 'RH' },
  { name: 'Baisse attractivité Heermont', probabilite: 50, impact: 55, eleves: 379, categorie: 'Territoire' },
  { name: 'Sous-effectif Viticulture', probabilite: 40, impact: 40, eleves: 45, categorie: 'Formation' },
  { name: 'Inadéquation compétences', probabilite: 35, impact: 30, eleves: 0, categorie: 'RH' },
];
