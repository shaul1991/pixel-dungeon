/**
 * Pixel Dungeon - Game Type Definitions
 */

// ============ Core Types ============

/** 2D Position */
export interface Position {
  x: number;
  y: number;
}

/** Grid-based tile position */
export interface TilePosition {
  col: number;
  row: number;
}

/** Direction constants for movement */
export const Direction = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export type Direction = (typeof Direction)[keyof typeof Direction];

// ============ Entity Types ============

/** Base entity stats */
export interface Stats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
}

/** Entity type identifiers */
export type EntityType = 'player' | 'monster' | 'npc' | 'item';

/** Base entity interface */
export interface Entity {
  id: string;
  type: EntityType;
  position: TilePosition;
  stats: Stats;
  sprite?: Phaser.GameObjects.Sprite;
}

// ============ Player Types ============

/** Player class types */
export type PlayerClass = 'warrior' | 'mage' | 'rogue' | 'ranger';

/** Player-specific data */
export interface Player extends Entity {
  type: 'player';
  playerClass: PlayerClass;
  level: number;
  experience: number;
  gold: number;
  inventory: Item[];
}

// ============ Monster Types ============

/** Monster behavior types */
export type MonsterBehavior = 'passive' | 'aggressive' | 'defensive' | 'patrol';

/** Monster data */
export interface Monster extends Entity {
  type: 'monster';
  name: string;
  behavior: MonsterBehavior;
  lootTable: LootEntry[];
}

/** Loot table entry */
export interface LootEntry {
  itemId: string;
  dropChance: number; // 0-1
  minQuantity: number;
  maxQuantity: number;
}

// ============ Item Types ============

/** Item categories */
export type ItemCategory = 'weapon' | 'armor' | 'consumable' | 'material' | 'key';

/** Item rarity */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/** Item data */
export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  stackable: boolean;
  quantity: number;
  stats?: Partial<Stats>;
}

// ============ Dungeon Types ============

/** Tile types for dungeon generation */
export type TileType = 'floor' | 'wall' | 'door' | 'stairs_up' | 'stairs_down' | 'trap' | 'chest';

/** Single tile data */
export interface Tile {
  type: TileType;
  walkable: boolean;
  visible: boolean;
  explored: boolean;
  entity?: Entity;
}

/** Room data for dungeon generation */
export interface Room {
  x: number;
  y: number;
  width: number;
  height: number;
  connected: boolean;
}

/** Dungeon floor data */
export interface DungeonFloor {
  level: number;
  width: number;
  height: number;
  tiles: Tile[][];
  rooms: Room[];
  startPosition: TilePosition;
  exitPosition: TilePosition;
}

// ============ Game State Types ============

/** Game state */
export interface GameState {
  currentFloor: number;
  player: Player;
  dungeon: DungeonFloor;
  turn: number;
  gameOver: boolean;
  paused: boolean;
}

/** Scene keys */
export type SceneKey = 'BootScene' | 'PreloadScene' | 'MainMenuScene' | 'GameScene' | 'UIScene';

// ============ Event Types ============

/** Game events */
export type GameEvent =
  | { type: 'MOVE'; direction: Direction }
  | { type: 'ATTACK'; targetId: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'PICKUP_ITEM'; itemId: string }
  | { type: 'OPEN_DOOR'; position: TilePosition }
  | { type: 'DESCEND' }
  | { type: 'ASCEND' };
