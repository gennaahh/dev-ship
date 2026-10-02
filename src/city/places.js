import Mine from './buildings/Mine.vue'
import Dungeon from './buildings/Dungeon.vue'
import Office from './buildings/Office.vue'
import Museum from './buildings/Museum.vue'
import FishingSpot from './buildings/FishingSpot.vue'
import MineInterior from './interiors/MineInterior.vue'
import DungeonInterior from './interiors/DungeonInterior.vue'
import OfficeInterior from './interiors/OfficeInterior.vue'
import MuseumInterior from './interiors/MuseumInterior.vue'
import FishingInterior from './interiors/FishingInterior.vue'

// I luoghi visitabili della città. box è il riquadro dell'edificio sul palco della città
// (1600 × 1000), door il punto su cui zooma la camera quando ci si entra.
export const PLACES = [
  {
    id: 'miniera',
    name: 'Miniera',
    tagline: 'Si scava nel codice legacy in cerca di gemme',
    box: { x: 10, y: 250, w: 400, h: 300 },
    door: { x: 225, y: 470 },
    building: Mine,
    interior: MineInterior,
  },
  {
    id: 'dungeon',
    name: 'Dungeon',
    tagline: 'Qui sotto vivono i bug più cattivi',
    box: { x: 1215, y: 200, w: 370, h: 350 },
    door: { x: 1400, y: 500 },
    building: Dungeon,
    interior: DungeonInterior,
  },
  {
    id: 'ufficio',
    name: 'Ufficio',
    tagline: 'Task, riunioni e caffè della macchinetta',
    box: { x: 80, y: 560, w: 340, h: 330 },
    door: { x: 250, y: 840 },
    building: Office,
    interior: OfficeInterior,
  },
  {
    id: 'museo',
    name: 'Museo',
    tagline: 'La hall of fame dei rilasci leggendari',
    box: { x: 1170, y: 590, w: 370, h: 290 },
    door: { x: 1355, y: 830 },
    building: Museum,
    interior: MuseumInterior,
  },
  {
    id: 'pesca',
    name: 'Zona di pesca',
    tagline: 'Si stacca la testa e si aspetta che abbocchi',
    box: { x: 500, y: 790, w: 600, h: 210 },
    door: { x: 800, y: 900 },
    building: FishingSpot,
    interior: FishingInterior,
  },
]
