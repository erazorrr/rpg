export type PositionSave = {x: number; y: number};

export type ItemSave = {
  kind: string;
  modifiers: string[];
};

export type StateSave = {
  kind: string;
  turns: number;
  stats: Record<string, number | boolean | string | undefined>;
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
  statueVariantId?: string;
  bumpDescriptionId?: string;
  stepDescriptionId?: string;
  stepMessagesShown?: boolean;
  lootChest?: {
    rarity: 'sturdy' | 'reinforced' | 'gilded';
    items: ItemSave[];
  };
  pressureValveSpent?: boolean;
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
  lastSeenPlayerPosition?: PositionSave;
  healer?: {charges: number};
  warlock?: {id: string; summonsRemaining: number};
  familiar?: {ownerId: string};
  mechanism?: {cycle: number};
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
  atmosphereTurn: number;
  map: MapSave;
  npcs: NpcSave[];
  items: Array<{position: PositionSave; item: ItemSave}>;
  atmosphere: Array<{
    position: PositionSave;
    kind: 'smoke' | 'steam' | 'fog';
    turnsLeft: number;
    density: 1 | 2 | 3;
    drift: 'up' | 'down' | 'left' | 'right';
    driftIn: number;
    fresh?: boolean;
  }>;
};

export interface SaveFileV2 {
  format: "rpg-save";
  version: 2;
  currentLevelIndex: number;
  generatedUniqueBookIds: string[];
  player: PlayerSave;
  levels: LevelSave[];
}

export interface Saveable<T> {
  toSaveData(): T;
}
