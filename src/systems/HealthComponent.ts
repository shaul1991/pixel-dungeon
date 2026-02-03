/**
 * HealthComponent - Manages entity health state (Phaser-independent)
 *
 * This component handles health-related logic and can be tested
 * independently without Phaser dependencies.
 */

export interface HealthState {
  current: number;
  max: number;
  isDead: boolean;
}

export interface DamageResult {
  damage: number;
  newHealth: number;
  isDead: boolean;
  overkill: number;
}

export interface HealResult {
  healed: number;
  newHealth: number;
  overheal: number;
}

export class HealthComponent {
  private _current: number;
  private _max: number;

  constructor(maxHealth: number, initialHealth?: number) {
    if (maxHealth <= 0) {
      throw new Error('Max health must be positive');
    }
    this._max = maxHealth;
    this._current = initialHealth ?? maxHealth;

    // Clamp initial health
    if (this._current < 0) {
      this._current = 0;
    } else if (this._current > this._max) {
      this._current = this._max;
    }
  }

  /** Current health value */
  get current(): number {
    return this._current;
  }

  /** Maximum health value */
  get max(): number {
    return this._max;
  }

  /** Health percentage (0-1) */
  get percent(): number {
    return this._current / this._max;
  }

  /** Check if dead (health <= 0) */
  get isDead(): boolean {
    return this._current <= 0;
  }

  /** Check if at full health */
  get isFull(): boolean {
    return this._current >= this._max;
  }

  /**
   * Take damage
   * @param amount - Damage amount (must be positive)
   * @returns Damage result with actual damage dealt
   */
  takeDamage(amount: number): DamageResult {
    if (amount < 0) {
      throw new Error('Damage amount must be non-negative');
    }

    const previousHealth = this._current;
    const actualDamage = Math.min(amount, this._current);
    this._current = Math.max(0, this._current - amount);

    return {
      damage: actualDamage,
      newHealth: this._current,
      isDead: this._current <= 0,
      overkill: Math.max(0, amount - previousHealth),
    };
  }

  /**
   * Heal health
   * @param amount - Heal amount (must be positive)
   * @returns Heal result with actual amount healed
   */
  heal(amount: number): HealResult {
    if (amount < 0) {
      throw new Error('Heal amount must be non-negative');
    }

    const previousHealth = this._current;
    this._current = Math.min(this._max, this._current + amount);
    const actualHealed = this._current - previousHealth;

    return {
      healed: actualHealed,
      newHealth: this._current,
      overheal: Math.max(0, amount - actualHealed),
    };
  }

  /**
   * Set health to specific value
   * @param value - New health value
   */
  setHealth(value: number): void {
    this._current = Math.max(0, Math.min(this._max, value));
  }

  /**
   * Set max health (adjusts current proportionally if needed)
   * @param newMax - New maximum health
   * @param adjustCurrent - If true, adjust current health proportionally
   */
  setMaxHealth(newMax: number, adjustCurrent: boolean = false): void {
    if (newMax <= 0) {
      throw new Error('Max health must be positive');
    }

    if (adjustCurrent) {
      const ratio = this._current / this._max;
      this._max = newMax;
      this._current = Math.round(ratio * newMax);
    } else {
      this._max = newMax;
    }

    // Clamp current to max
    if (this._current > this._max) {
      this._current = this._max;
    }
  }

  /**
   * Reset to full health
   */
  reset(): void {
    this._current = this._max;
  }

  /**
   * Get current state snapshot
   */
  getState(): HealthState {
    return {
      current: this._current,
      max: this._max,
      isDead: this.isDead,
    };
  }

  /**
   * Create component from state
   */
  static fromState(state: HealthState): HealthComponent {
    return new HealthComponent(state.max, state.current);
  }
}
