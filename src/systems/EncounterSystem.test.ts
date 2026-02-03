import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EncounterSystem } from './EncounterSystem';
import type { MonsterConfig } from '../entities/Monster';

describe('EncounterSystem', () => {
  const mockMonstersData: Record<string, MonsterConfig> = {
    slime: {
      id: 'slime',
      name: 'Slime',
      hp: 30,
      attack: 8,
      defense: 2,
      exp: 10,
      gold: 5,
    },
    goblin: {
      id: 'goblin',
      name: 'Goblin',
      hp: 50,
      attack: 12,
      defense: 4,
      exp: 20,
      gold: 15,
    },
  };

  beforeEach(() => {
    vi.spyOn(Math, 'random');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkEncounter', () => {
    it('should trigger encounter when random < encounterRate', () => {
      vi.mocked(Math.random)
        .mockReturnValueOnce(0.05)  // 인카운터 확률 체크 (< 0.1)
        .mockReturnValueOnce(0);     // 몬스터 선택

      const result = EncounterSystem.checkEncounter(mockMonstersData);

      expect(result.triggered).toBe(true);
      expect(result.monster).not.toBeNull();
    });

    it('should not trigger encounter when random >= encounterRate', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);  // >= 0.1

      const result = EncounterSystem.checkEncounter(mockMonstersData);

      expect(result.triggered).toBe(false);
      expect(result.monster).toBeNull();
    });

    it('should respect custom encounterRate', () => {
      vi.mocked(Math.random)
        .mockReturnValueOnce(0.25)  // < 0.3
        .mockReturnValueOnce(0);

      const result = EncounterSystem.checkEncounter(mockMonstersData, {
        encounterRate: 0.3,
      });

      expect(result.triggered).toBe(true);
    });

    it('should use custom possibleMonsters', () => {
      vi.mocked(Math.random)
        .mockReturnValueOnce(0.05)  // 인카운터 발생
        .mockReturnValueOnce(0);     // 첫 번째 몬스터 선택

      const result = EncounterSystem.checkEncounter(mockMonstersData, {
        possibleMonsters: ['goblin'],
      });

      expect(result.triggered).toBe(true);
      expect(result.monster?.id).toBe('goblin');
    });

    it('should return null monster for empty possibleMonsters', () => {
      vi.mocked(Math.random).mockReturnValue(0.05);

      const result = EncounterSystem.checkEncounter(mockMonstersData, {
        possibleMonsters: [],
      });

      expect(result.triggered).toBe(true);
      expect(result.monster).toBeNull();
    });
  });

  describe('selectRandomMonster', () => {
    it('should return correct monster based on random index', () => {
      vi.mocked(Math.random).mockReturnValue(0);  // index 0

      const monster = EncounterSystem.selectRandomMonster(
        ['slime', 'goblin'],
        mockMonstersData
      );

      expect(monster?.id).toBe('slime');
    });

    it('should return second monster when random is high', () => {
      vi.mocked(Math.random).mockReturnValue(0.5);  // index 1

      const monster = EncounterSystem.selectRandomMonster(
        ['slime', 'goblin'],
        mockMonstersData
      );

      expect(monster?.id).toBe('goblin');
    });

    it('should return null for empty array', () => {
      const monster = EncounterSystem.selectRandomMonster([], mockMonstersData);
      expect(monster).toBeNull();
    });

    it('should return null for non-existent monster id', () => {
      vi.mocked(Math.random).mockReturnValue(0);

      const monster = EncounterSystem.selectRandomMonster(
        ['unknown_monster'],
        mockMonstersData
      );

      expect(monster).toBeNull();
    });
  });

  describe('calculateEncounterRate', () => {
    it('should add modifiers to base rate', () => {
      const rate = EncounterSystem.calculateEncounterRate(0.1, 0.05);
      expect(rate).toBeCloseTo(0.15);
    });

    it('should clamp rate to max 1', () => {
      const rate = EncounterSystem.calculateEncounterRate(0.9, 0.2);
      expect(rate).toBe(1);
    });

    it('should clamp rate to min 0', () => {
      const rate = EncounterSystem.calculateEncounterRate(0.1, -0.2);
      expect(rate).toBe(0);
    });

    it('should handle negative modifiers', () => {
      const rate = EncounterSystem.calculateEncounterRate(0.5, -0.3);
      expect(rate).toBeCloseTo(0.2);
    });
  });

  describe('constants', () => {
    it('should have correct default encounter rate', () => {
      expect(EncounterSystem.DEFAULT_ENCOUNTER_RATE).toBe(0.1);
    });

    it('should have slime as default monster', () => {
      expect(EncounterSystem.DEFAULT_MONSTERS).toContain('slime');
    });
  });
});
