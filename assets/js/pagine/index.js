// Il registro delle pagine: nome → disegno.
import { VARIE } from './varie.js';
import { PERFETTO } from './perfetto.js';
import { MASSA } from './massa.js';
import { SMONTARE } from './smontare.js';
import { CARTE } from './carte.js';
import { PRESTAMPA } from './prestampa.js';
import { STAMPA3D } from './stampa3d.js';
import { RAW } from './raw.js';

export const REG = { ...VARIE, ...PERFETTO, ...MASSA, ...SMONTARE, ...CARTE, ...PRESTAMPA, ...STAMPA3D, ...RAW };
