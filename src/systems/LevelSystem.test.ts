import { describe, it, expect, beforeEach } from 'vitest';
import { LevelSystem, MAX_LEVEL } from './LevelSystem';
import type { PlayerStats } from './LevelSystem';

describe('LevelSystem', () => {
  describe('getExpForNextLevel', () => {
    it('should return correct exp for level 1', () => {
      expect(LevelSystem.getExpForNextLevel(1)).toBe(100);
    });

    it('should return correct exp for level 5', () => {
      expect(LevelSystem.getExpForNextLevel(5)).toBe(800);
    });

    it('should return -1 for max level (level 10)', () => {
      // Level 10 is max, so no "next level" exists
      expect(LevelSystem.getExpForNextLevel(10)).toBe(-1);
    });

    it('should return -1 for levels above max', () => {
      expect(LevelSystem.getExpForNextLevel(11)).toBe(-1);
      expect(LevelSystem.getExpForNextLevel(99)).toBe(-1);
    });

    it('should return -1 for invalid levels', () => {
      expect(LevelSystem.getExpForNextLevel(0)).toBe(-1);
      expect(LevelSystem.getExpForNextLevel(-1)).toBe(-1);
    });
  });

  describe('canLevelUp', () => {
    it('should return true when exp meets requirement', () => {
      expect(LevelSystem.canLevelUp(1, 100)).toBe(true);
    });

    it('should return true when exp exceeds requirement', () => {
      expect(LevelSystem.canLevelUp(1, 150)).toBe(true);
    });

    it('should return false when exp is below requirement', () => {
      expect(LevelSystem.canLevelUp(1, 99)).toBe(false);
      expect(LevelSystem.canLevelUp(1, 0)).toBe(false);
    });

    it('should return false at max level', () => {
      expect(LevelSystem.canLevelUp(MAX_LEVEL, 99999)).toBe(false);
    });

    it('should check correctly for different levels', () => {
      expect(LevelSystem.canLevelUp(5, 800)).toBe(true);
      expect(LevelSystem.canLevelUp(5, 799)).toBe(false);
    });
  });

  describe('processLevelUp', () => {
    it('should return null when cannot level up', () => {
      expect(LevelSystem.processLevelUp(1, 50)).toBeNull();
    });

    it('should return null at max level', () => {
      expect(LevelSystem.processLevelUp(MAX_LEVEL, 99999)).toBeNull();
    });

    it('should return correct stat increases', () => {
      const result = LevelSystem.processLevelUp(1, 120);

      expect(result).not.toBeNull();
      expect(result!.newLevel).toBe(2);
      expect(result!.hpIncrease).toBe(10);
      expect(result!.mpIncrease).toBe(5);
      expect(result!.attackIncrease).toBe(2);
      expect(result!.defenseIncrease).toBe(1);
    });

    it('should return correct new level for level 9', () => {
      // Level 9 -> 10 requires 2600 exp
      const result = LevelSystem.processLevelUp(9, 2600);

      expect(result).not.toBeNull();
      expect(result!.newLevel).toBe(10);
    });
  });

  describe('addExperience', () => {
    let initialStats: PlayerStats;

    beforeEach(() => {
      initialStats = LevelSystem.createInitialStats();
    });

    it('should add exp without level up', () => {
      const result = LevelSystem.addExperience(initialStats, 50);

      expect(result.updatedStats.exp).toBe(50);
      expect(result.updatedStats.level).toBe(1);
      expect(result.levelUps).toBe(0);
    });

    it('should process single level up', () => {
      const result = LevelSystem.addExperience(initialStats, 100);

      expect(result.updatedStats.level).toBe(2);
      expect(result.updatedStats.exp).toBe(0);
      expect(result.levelUps).toBe(1);
      expect(result.updatedStats.maxHp).toBe(initialStats.maxHp + 10);
      expect(result.updatedStats.maxMp).toBe(initialStats.maxMp + 5);
      expect(result.updatedStats.attack).toBe(initialStats.attack + 2);
      expect(result.updatedStats.defense).toBe(initialStats.defense + 1);
    });

    it('should fully heal HP and MP on level up', () => {
      // Damage the player first
      const damagedStats: PlayerStats = {
        ...initialStats,
        hp: 50,
        mp: 20,
      };

      const result = LevelSystem.addExperience(damagedStats, 100);

      // Should be fully healed to new max values
      expect(result.updatedStats.hp).toBe(result.updatedStats.maxHp);
      expect(result.updatedStats.mp).toBe(result.updatedStats.maxMp);
    });

    it('should process multiple level ups at once', () => {
      // Level 1 requires 100 exp, Level 2 requires 200 exp
      // Total 300 exp should result in level 3
      const result = LevelSystem.addExperience(initialStats, 300);

      expect(result.updatedStats.level).toBe(3);
      expect(result.updatedStats.exp).toBe(0);
      expect(result.levelUps).toBe(2);
      expect(result.updatedStats.maxHp).toBe(initialStats.maxHp + 20); // 10 * 2
      expect(result.updatedStats.maxMp).toBe(initialStats.maxMp + 10); // 5 * 2
      expect(result.updatedStats.attack).toBe(initialStats.attack + 4); // 2 * 2
      expect(result.updatedStats.defense).toBe(initialStats.defense + 2); // 1 * 2
    });

    it('should handle exp overflow after level up', () => {
      const result = LevelSystem.addExperience(initialStats, 150);

      expect(result.updatedStats.level).toBe(2);
      expect(result.updatedStats.exp).toBe(50); // 150 - 100
      expect(result.levelUps).toBe(1);
    });

    it('should stop at max level', () => {
      // Create a level 9 character
      const highLevelStats: PlayerStats = {
        level: 9,
        exp: 0,
        hp: 190,
        maxHp: 190,
        mp: 95,
        maxMp: 95,
        attack: 26,
        defense: 13,
      };

      // Give enough exp for multiple levels but should stop at 10
      const result = LevelSystem.addExperience(highLevelStats, 10000);

      expect(result.updatedStats.level).toBe(MAX_LEVEL);
      expect(result.levelUps).toBe(1);
      // Remaining exp should be preserved
      expect(result.updatedStats.exp).toBe(10000 - 2600); // Level 9 requires 2600
    });

    it('should not modify original stats object', () => {
      const originalLevel = initialStats.level;
      const originalExp = initialStats.exp;

      LevelSystem.addExperience(initialStats, 100);

      expect(initialStats.level).toBe(originalLevel);
      expect(initialStats.exp).toBe(originalExp);
    });
  });

  describe('getExpProgress', () => {
    it('should return 0 for 0 exp', () => {
      expect(LevelSystem.getExpProgress(1, 0)).toBe(0);
    });

    it('should return correct percentage', () => {
      expect(LevelSystem.getExpProgress(1, 50)).toBe(0.5);
      expect(LevelSystem.getExpProgress(1, 25)).toBe(0.25);
    });

    it('should return 1 when exp equals requirement', () => {
      expect(LevelSystem.getExpProgress(1, 100)).toBe(1);
    });

    it('should clamp at 1 when exp exceeds requirement', () => {
      expect(LevelSystem.getExpProgress(1, 150)).toBe(1);
    });

    it('should return 1 at max level', () => {
      expect(LevelSystem.getExpProgress(MAX_LEVEL, 0)).toBe(1);
      expect(LevelSystem.getExpProgress(MAX_LEVEL, 5000)).toBe(1);
    });

    it('should work for different levels', () => {
      // Level 5 requires 800 exp
      expect(LevelSystem.getExpProgress(5, 400)).toBe(0.5);
      expect(LevelSystem.getExpProgress(5, 200)).toBe(0.25);
    });
  });

  describe('createInitialStats', () => {
    it('should return correct initial stats', () => {
      const stats = LevelSystem.createInitialStats();

      expect(stats.level).toBe(1);
      expect(stats.exp).toBe(0);
      expect(stats.hp).toBe(100);
      expect(stats.maxHp).toBe(100);
      expect(stats.mp).toBe(50);
      expect(stats.maxMp).toBe(50);
      expect(stats.attack).toBe(10);
      expect(stats.defense).toBe(5);
    });

    it('should return a new object each time', () => {
      const stats1 = LevelSystem.createInitialStats();
      const stats2 = LevelSystem.createInitialStats();

      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });

  describe('MAX_LEVEL constant', () => {
    it('should be 10', () => {
      expect(MAX_LEVEL).toBe(10);
    });
  });
});
