/**
 * Type Guards Unit Tests
 */
import { describe, it, expect } from 'vitest';
import {
  isPlayer,
  isMonster,
  isNPC,
  isItem,
  isConsumable,
  isEquipment,
  isWalkable,
  isValidPosition,
  type Entity,
  type Player,
  type Monster,
  type Item,
  type Tile,
  type TilePosition,
} from './index';

// ============ Test Fixtures ============

const createBaseStats = () => ({
  hp: 100,
  maxHp: 100,
  attackMin: 3,
  attackMax: 5,
  defense: 2,
  speed: 5,
});

const createPlayerEntity = (): Player => ({
  id: 'player-1',
  type: 'player',
  position: { col: 0, row: 0 },
  stats: createBaseStats(),
  playerClass: 'warrior',
  level: 1,
  experience: 0,
  gold: 0,
  inventory: [],
});

const createMonsterEntity = (): Monster => ({
  id: 'monster-1',
  type: 'monster',
  position: { col: 1, row: 1 },
  stats: createBaseStats(),
  name: 'Slime',
  behavior: 'aggressive',
  lootTable: [],
});

const createNPCEntity = (): Entity => ({
  id: 'npc-1',
  type: 'npc',
  position: { col: 2, row: 2 },
  stats: createBaseStats(),
});

const createItemEntity = (): Entity => ({
  id: 'item-1',
  type: 'item',
  position: { col: 3, row: 3 },
  stats: createBaseStats(),
});

const createItem = (overrides: Partial<Item> = {}): Item => ({
  id: 'potion-1',
  name: 'Health Potion',
  description: 'Restores 50 HP',
  category: 'consumable',
  rarity: 'common',
  stackable: true,
  quantity: 1,
  ...overrides,
});

const createTile = (overrides: Partial<Tile> = {}): Tile => ({
  type: 'floor',
  walkable: true,
  visible: true,
  explored: true,
  ...overrides,
});

// ============ Tests ============

describe('Entity Type Guards', () => {
  describe('isPlayer', () => {
    it('should return true for player entity', () => {
      const player = createPlayerEntity();
      expect(isPlayer(player)).toBe(true);
    });

    it('should return false for monster entity', () => {
      const monster = createMonsterEntity();
      expect(isPlayer(monster)).toBe(false);
    });

    it('should return false for NPC entity', () => {
      const npc = createNPCEntity();
      expect(isPlayer(npc)).toBe(false);
    });
  });

  describe('isMonster', () => {
    it('should return true for monster entity', () => {
      const monster = createMonsterEntity();
      expect(isMonster(monster)).toBe(true);
    });

    it('should return false for player entity', () => {
      const player = createPlayerEntity();
      expect(isMonster(player)).toBe(false);
    });

    it('should return false for NPC entity', () => {
      const npc = createNPCEntity();
      expect(isMonster(npc)).toBe(false);
    });
  });

  describe('isNPC', () => {
    it('should return true for NPC entity', () => {
      const npc = createNPCEntity();
      expect(isNPC(npc)).toBe(true);
    });

    it('should return false for player entity', () => {
      const player = createPlayerEntity();
      expect(isNPC(player)).toBe(false);
    });

    it('should return false for monster entity', () => {
      const monster = createMonsterEntity();
      expect(isNPC(monster)).toBe(false);
    });
  });

  describe('isItem', () => {
    it('should return true for item entity', () => {
      const item = createItemEntity();
      expect(isItem(item)).toBe(true);
    });

    it('should return false for player entity', () => {
      const player = createPlayerEntity();
      expect(isItem(player)).toBe(false);
    });
  });
});

describe('Item Type Guards', () => {
  describe('isConsumable', () => {
    it('should return true for consumable item', () => {
      const potion = createItem({ category: 'consumable' });
      expect(isConsumable(potion)).toBe(true);
    });

    it('should return false for weapon', () => {
      const sword = createItem({ category: 'weapon' });
      expect(isConsumable(sword)).toBe(false);
    });

    it('should return false for armor', () => {
      const armor = createItem({ category: 'armor' });
      expect(isConsumable(armor)).toBe(false);
    });
  });

  describe('isEquipment', () => {
    it('should return true for weapon', () => {
      const sword = createItem({ category: 'weapon' });
      expect(isEquipment(sword)).toBe(true);
    });

    it('should return true for armor', () => {
      const armor = createItem({ category: 'armor' });
      expect(isEquipment(armor)).toBe(true);
    });

    it('should return false for consumable', () => {
      const potion = createItem({ category: 'consumable' });
      expect(isEquipment(potion)).toBe(false);
    });

    it('should return false for material', () => {
      const material = createItem({ category: 'material' });
      expect(isEquipment(material)).toBe(false);
    });

    it('should return false for key', () => {
      const key = createItem({ category: 'key' });
      expect(isEquipment(key)).toBe(false);
    });
  });
});

describe('Tile Type Guards', () => {
  describe('isWalkable', () => {
    it('should return true for floor tile', () => {
      const floor = createTile({ type: 'floor', walkable: true });
      expect(isWalkable(floor)).toBe(true);
    });

    it('should return false for wall tile', () => {
      const wall = createTile({ type: 'wall', walkable: false });
      expect(isWalkable(wall)).toBe(false);
    });

    it('should return true for door tile that is walkable', () => {
      const door = createTile({ type: 'door', walkable: true });
      expect(isWalkable(door)).toBe(true);
    });

    it('should return false for tile marked as walkable but is wall type', () => {
      // Edge case: walkable flag is true but type is wall
      const badTile = createTile({ type: 'wall', walkable: true });
      expect(isWalkable(badTile)).toBe(false);
    });
  });
});

describe('Position Validation', () => {
  describe('isValidPosition', () => {
    const dungeonWidth = 10;
    const dungeonHeight = 10;

    it('should return true for position within bounds', () => {
      const pos: TilePosition = { col: 5, row: 5 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(true);
    });

    it('should return true for origin position (0,0)', () => {
      const pos: TilePosition = { col: 0, row: 0 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(true);
    });

    it('should return true for max valid position', () => {
      const pos: TilePosition = { col: 9, row: 9 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(true);
    });

    it('should return false for negative col', () => {
      const pos: TilePosition = { col: -1, row: 5 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(false);
    });

    it('should return false for negative row', () => {
      const pos: TilePosition = { col: 5, row: -1 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(false);
    });

    it('should return false for col >= width', () => {
      const pos: TilePosition = { col: 10, row: 5 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(false);
    });

    it('should return false for row >= height', () => {
      const pos: TilePosition = { col: 5, row: 10 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(false);
    });

    it('should return false for both out of bounds', () => {
      const pos: TilePosition = { col: -5, row: 100 };
      expect(isValidPosition(pos, dungeonWidth, dungeonHeight)).toBe(false);
    });
  });
});
