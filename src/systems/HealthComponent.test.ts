/**
 * HealthComponent Unit Tests
 */
import { describe, it, expect } from 'vitest';
import { HealthComponent } from './HealthComponent';

describe('HealthComponent', () => {
  describe('constructor', () => {
    it('should initialize with max health as current', () => {
      const health = new HealthComponent(100);
      expect(health.current).toBe(100);
      expect(health.max).toBe(100);
    });

    it('should initialize with custom initial health', () => {
      const health = new HealthComponent(100, 50);
      expect(health.current).toBe(50);
      expect(health.max).toBe(100);
    });

    it('should clamp initial health to max', () => {
      const health = new HealthComponent(100, 150);
      expect(health.current).toBe(100);
    });

    it('should clamp initial health to 0', () => {
      const health = new HealthComponent(100, -50);
      expect(health.current).toBe(0);
    });

    it('should throw for non-positive max health', () => {
      expect(() => new HealthComponent(0)).toThrow('Max health must be positive');
      expect(() => new HealthComponent(-10)).toThrow('Max health must be positive');
    });
  });

  describe('percent', () => {
    it('should return 1.0 at full health', () => {
      const health = new HealthComponent(100);
      expect(health.percent).toBe(1.0);
    });

    it('should return 0.5 at half health', () => {
      const health = new HealthComponent(100, 50);
      expect(health.percent).toBe(0.5);
    });

    it('should return 0 at zero health', () => {
      const health = new HealthComponent(100, 0);
      expect(health.percent).toBe(0);
    });
  });

  describe('isDead', () => {
    it('should return false when health > 0', () => {
      const health = new HealthComponent(100, 1);
      expect(health.isDead).toBe(false);
    });

    it('should return true when health = 0', () => {
      const health = new HealthComponent(100, 0);
      expect(health.isDead).toBe(true);
    });
  });

  describe('isFull', () => {
    it('should return true at max health', () => {
      const health = new HealthComponent(100);
      expect(health.isFull).toBe(true);
    });

    it('should return false below max health', () => {
      const health = new HealthComponent(100, 99);
      expect(health.isFull).toBe(false);
    });
  });

  describe('takeDamage', () => {
    it('should reduce health by damage amount', () => {
      const health = new HealthComponent(100);
      const result = health.takeDamage(30);

      expect(result.damage).toBe(30);
      expect(result.newHealth).toBe(70);
      expect(result.isDead).toBe(false);
      expect(result.overkill).toBe(0);
      expect(health.current).toBe(70);
    });

    it('should not go below 0', () => {
      const health = new HealthComponent(100, 50);
      const result = health.takeDamage(100);

      expect(result.damage).toBe(50); // Actual damage dealt
      expect(result.newHealth).toBe(0);
      expect(result.isDead).toBe(true);
      expect(result.overkill).toBe(50);
    });

    it('should return isDead true when killing', () => {
      const health = new HealthComponent(100);
      const result = health.takeDamage(100);

      expect(result.isDead).toBe(true);
    });

    it('should handle 0 damage', () => {
      const health = new HealthComponent(100);
      const result = health.takeDamage(0);

      expect(result.damage).toBe(0);
      expect(result.newHealth).toBe(100);
      expect(health.current).toBe(100);
    });

    it('should throw for negative damage', () => {
      const health = new HealthComponent(100);
      expect(() => health.takeDamage(-10)).toThrow('Damage amount must be non-negative');
    });

    it('should handle taking damage when already dead', () => {
      const health = new HealthComponent(100, 0);
      const result = health.takeDamage(50);

      expect(result.damage).toBe(0);
      expect(result.newHealth).toBe(0);
      expect(result.overkill).toBe(50);
    });
  });

  describe('heal', () => {
    it('should increase health', () => {
      const health = new HealthComponent(100, 50);
      const result = health.heal(30);

      expect(result.healed).toBe(30);
      expect(result.newHealth).toBe(80);
      expect(result.overheal).toBe(0);
      expect(health.current).toBe(80);
    });

    it('should not exceed max health', () => {
      const health = new HealthComponent(100, 80);
      const result = health.heal(50);

      expect(result.healed).toBe(20);
      expect(result.newHealth).toBe(100);
      expect(result.overheal).toBe(30);
    });

    it('should handle 0 heal', () => {
      const health = new HealthComponent(100, 50);
      const result = health.heal(0);

      expect(result.healed).toBe(0);
      expect(result.newHealth).toBe(50);
    });

    it('should throw for negative heal', () => {
      const health = new HealthComponent(100);
      expect(() => health.heal(-10)).toThrow('Heal amount must be non-negative');
    });

    it('should heal from 0', () => {
      const health = new HealthComponent(100, 0);
      const result = health.heal(50);

      expect(result.healed).toBe(50);
      expect(result.newHealth).toBe(50);
      expect(health.isDead).toBe(false);
    });
  });

  describe('setHealth', () => {
    it('should set health directly', () => {
      const health = new HealthComponent(100, 50);
      health.setHealth(75);
      expect(health.current).toBe(75);
    });

    it('should clamp to max', () => {
      const health = new HealthComponent(100);
      health.setHealth(200);
      expect(health.current).toBe(100);
    });

    it('should clamp to 0', () => {
      const health = new HealthComponent(100);
      health.setHealth(-50);
      expect(health.current).toBe(0);
    });
  });

  describe('setMaxHealth', () => {
    it('should set new max health', () => {
      const health = new HealthComponent(100);
      health.setMaxHealth(150);
      expect(health.max).toBe(150);
      expect(health.current).toBe(100); // Unchanged
    });

    it('should clamp current if exceeds new max', () => {
      const health = new HealthComponent(100);
      health.setMaxHealth(50);
      expect(health.max).toBe(50);
      expect(health.current).toBe(50);
    });

    it('should adjust current proportionally when requested', () => {
      const health = new HealthComponent(100, 50); // 50%
      health.setMaxHealth(200, true);
      expect(health.max).toBe(200);
      expect(health.current).toBe(100); // 50% of 200
    });

    it('should throw for non-positive max', () => {
      const health = new HealthComponent(100);
      expect(() => health.setMaxHealth(0)).toThrow('Max health must be positive');
    });
  });

  describe('reset', () => {
    it('should restore to full health', () => {
      const health = new HealthComponent(100, 30);
      health.reset();
      expect(health.current).toBe(100);
      expect(health.isFull).toBe(true);
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const health = new HealthComponent(100, 75);
      const state = health.getState();

      expect(state.current).toBe(75);
      expect(state.max).toBe(100);
      expect(state.isDead).toBe(false);
    });
  });

  describe('fromState', () => {
    it('should create component from state', () => {
      const state = { current: 50, max: 100, isDead: false };
      const health = HealthComponent.fromState(state);

      expect(health.current).toBe(50);
      expect(health.max).toBe(100);
    });
  });

  describe('edge cases', () => {
    it('should handle sequential damage and heal', () => {
      const health = new HealthComponent(100);

      health.takeDamage(40); // 60
      health.heal(20); // 80
      health.takeDamage(90); // 0 (dead)

      expect(health.current).toBe(0);
      expect(health.isDead).toBe(true);
    });

    it('should handle small health values', () => {
      const health = new HealthComponent(1);
      expect(health.current).toBe(1);

      const result = health.takeDamage(1);
      expect(result.isDead).toBe(true);
    });

    it('should handle large health values', () => {
      const health = new HealthComponent(999999);
      expect(health.current).toBe(999999);

      health.takeDamage(999998);
      expect(health.current).toBe(1);
      expect(health.isDead).toBe(false);
    });
  });
});
