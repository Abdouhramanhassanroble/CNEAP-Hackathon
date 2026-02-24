#!/usr/bin/env node
/**
 * Convertit le GeoJSON départements (EPSG:2154) en WGS84,
 * ajoute le nombre de lycées par département et le nom de la région.
 * Produit : frontend/public/data/departements_lycees.geojson (toute la France)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import proj4 from 'proj4';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const GEOJSON_IN = join(ROOT, 'departement_projet_hackathon.geojson');
const LYCEES_LIST = join(ROOT, 'frontend', 'public', 'data', 'lycees_list.json');
const GEOJSON_OUT = join(ROOT, 'frontend', 'public', 'data', 'departements_lycees.geojson');

const REGION_NOM = {
  '11': 'Île-de-France', '24': 'Centre-Val de Loire', '27': 'Bourgogne-Franche-Comté',
  '28': 'Normandie', '32': 'Hauts-de-France', '44': 'Grand Est',
  '52': 'Pays de la Loire', '53': 'Bretagne', '75': 'Nouvelle-Aquitaine',
  '76': 'Occitanie', '84': 'Auvergne-Rhône-Alpes', '93': "Provence-Alpes-Côte d'Azur",
  '94': 'Corse',
};

// EPSG:2154 (Lambert 93) → WGS84
proj4.defs('EPSG:2154', '+proj=lcc +lat_0=46.5 +lon_0=3 +lat_1=49 +lat_2=44 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs');

function convertCoords(coords) {
  if (typeof coords[0] === 'number') {
    const [x, y] = proj4('EPSG:2154', 'EPSG:4326', coords);
    return [x, y];
  }
  return coords.map(convertCoords);
}

function convertGeometry(geom) {
  if (!geom || !geom.coordinates) return geom;
  return { ...geom, coordinates: convertCoords(geom.coordinates) };
}

const lyceesList = JSON.parse(readFileSync(LYCEES_LIST, 'utf-8'));
const countByDep = {};
for (const l of lyceesList) {
  const code = l.departement_code;
  countByDep[code] = (countByDep[code] || 0) + 1;
}

const geojson = JSON.parse(readFileSync(GEOJSON_IN, 'utf-8'));
const features = geojson.features.map(f => {
  const reg = f.properties.INSEE_REG;
  return {
    type: 'Feature',
    properties: {
      ...f.properties,
      lycees_count: countByDep[f.properties.INSEE_DEP] || 0,
      nom: f.properties.NOM,
      code: f.properties.INSEE_DEP,
      region_nom: REGION_NOM[reg] || reg,
      region_code: reg,
    },
    geometry: convertGeometry(f.geometry),
  };
});

const out = {
  type: 'FeatureCollection',
  name: 'departements_lycees',
  features,
};

writeFileSync(GEOJSON_OUT, JSON.stringify(out), 'utf-8');
console.log(`✓ ${features.length} départements exportés vers ${GEOJSON_OUT}`);
const pdl = features.filter(f => f.properties.region_code === '52');
console.log(`  Pays de la Loire: ${pdl.length} départements, ${pdl.reduce((s, f) => s + (f.properties.lycees_count || 0), 0)} lycées`);
