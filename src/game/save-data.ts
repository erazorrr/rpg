export type PositionSave = {x: number; y: number};

export type ItemSave = {
  kind: string;
  modifiers: string[];
};

export type StateSave = {
  kind: string;
  turns: number;
  stats: Record<string, number | boolean | undefined>;
};

export type CharacterSave = {
  position: PositionSave;
  hp: number;
  mp: number;
  strength: number;
  dexterity: number;
  endurance: number;
  wisdom: number;
  equipment: Record<string, ItemSave | undefined>;
  states: StateSave[];
};

export type TileSave = {
  kind: string;
  explored: boolean;
  bloody: boolean;
  inscriptionId?: string;
};

export type MapSave = {
  width: number;
  height: number;
  initialPosition: PositionSave;
  tiles: TileSave[][];
};

export type NpcSave = CharacterSave & {
  kind: string;
  previousAction: number;
  modifiers: string[];
  treasure?: {cost: number; timer: number; started: boolean};
};

export type PlayerSave = CharacterSave & {
  level: number;
  xp: number;
  inventory: ItemSave[];
  equipmentIndexes: Record<string, number | undefined>;
  knownSpells: string[];
};

export type LevelSave = {
  levelNo: number;
  map: MapSave;
  npcs: NpcSave[];
  items: Array<{position: PositionSave; item: ItemSave}>;
};

export interface SaveFileV1 {
  format: "rpg-save";
  version: 1;
  currentLevelIndex: number;
  player: PlayerSave;
  levels: LevelSave[];
}

export interface Saveable<T> {
  toSaveData(): T;
}
