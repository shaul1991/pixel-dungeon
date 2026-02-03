/**
 * SaveSystem 단위 테스트
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveSystem } from './SaveSystem';
import type { SaveData, SavePlayerStats } from './SaveSystem';

// localStorage 모킹
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

// 테스트용 플레이어 데이터 생성
function createPlayerData(overrides: Partial<SavePlayerStats> = {}): SavePlayerStats {
  return {
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    attack: 10,
    defense: 5,
    level: 1,
    exp: 0,
    gold: 0,
    ...overrides,
  };
}

// 테스트용 저장 데이터 생성
function createSaveData(overrides: Partial<SaveData> = {}): SaveData {
  return {
    version: '1.1.0',
    timestamp: Date.now(),
    player: {
      tileX: 5,
      tileY: 5,
      stats: createPlayerData(),
    },
    ...overrides,
  };
}

describe('SaveSystem', () => {
  beforeEach(() => {
    // localStorage 모킹 설정
    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('save', () => {
    it('should save player data to localStorage', () => {
      const stats = createPlayerData();
      const result = SaveSystem.save(5, 7, stats);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1]
      ) as SaveData;
      expect(savedData.player.tileX).toBe(5);
      expect(savedData.player.tileY).toBe(7);
      expect(savedData.player.stats.hp).toBe(100);
      expect(savedData.version).toBe('1.1.0');
    });

    it('should include timestamp in save data', () => {
      const stats = createPlayerData();
      const beforeSave = Date.now();

      SaveSystem.save(0, 0, stats);

      const savedData = JSON.parse(
        localStorageMock.setItem.mock.calls[0][1]
      ) as SaveData;
      expect(savedData.timestamp).toBeGreaterThanOrEqual(beforeSave);
      expect(savedData.timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should return false on save error', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage full');
      });

      const stats = createPlayerData();
      const result = SaveSystem.save(0, 0, stats);

      expect(result).toBe(false);
    });
  });

  describe('load', () => {
    it('should load saved data from localStorage', () => {
      const saveData = createSaveData({
        player: {
          tileX: 3,
          tileY: 4,
          stats: createPlayerData({ hp: 75 }),
        },
      });
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saveData));

      const result = SaveSystem.load();

      expect(result).not.toBeNull();
      expect(result?.player.tileX).toBe(3);
      expect(result?.player.tileY).toBe(4);
      expect(result?.player.stats.hp).toBe(75);
    });

    it('should return null when no save data exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = SaveSystem.load();

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');

      const result = SaveSystem.load();

      expect(result).toBeNull();
    });

    it('should return null for incompatible version', () => {
      const saveData = createSaveData({ version: '2.0.0' });
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saveData));

      const result = SaveSystem.load();

      expect(result).toBeNull();
    });
  });

  describe('hasSaveData', () => {
    it('should return true when valid save exists', () => {
      const saveData = createSaveData();
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(saveData));

      const result = SaveSystem.hasSaveData();

      expect(result).toBe(true);
    });

    it('should return false when no save exists', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);

      const result = SaveSystem.hasSaveData();

      expect(result).toBe(false);
    });

    it('should return false for invalid save data', () => {
      localStorageMock.getItem.mockReturnValueOnce('{}');

      const result = SaveSystem.hasSaveData();

      expect(result).toBe(false);
    });
  });

  describe('deleteSave', () => {
    it('should remove save data from localStorage', () => {
      const result = SaveSystem.deleteSave();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(
        'pixel-dungeon-save'
      );
    });

    it('should return false on delete error', () => {
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Delete failed');
      });

      const result = SaveSystem.deleteSave();

      expect(result).toBe(false);
    });
  });

  describe('isValidSaveData', () => {
    it('should return true for valid save data', () => {
      const saveData = createSaveData();

      const result = SaveSystem.isValidSaveData(saveData);

      expect(result).toBe(true);
    });

    it('should return false for null', () => {
      expect(SaveSystem.isValidSaveData(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(SaveSystem.isValidSaveData(undefined)).toBe(false);
    });

    it('should return false for missing version', () => {
      const saveData = createSaveData();
      // @ts-expect-error testing invalid data
      delete saveData.version;

      expect(SaveSystem.isValidSaveData(saveData)).toBe(false);
    });

    it('should return false for missing timestamp', () => {
      const saveData = createSaveData();
      // @ts-expect-error testing invalid data
      delete saveData.timestamp;

      expect(SaveSystem.isValidSaveData(saveData)).toBe(false);
    });

    it('should return false for missing player data', () => {
      const saveData = createSaveData();
      // @ts-expect-error testing invalid data
      delete saveData.player;

      expect(SaveSystem.isValidSaveData(saveData)).toBe(false);
    });

    it('should return false for missing player stats', () => {
      const saveData = createSaveData();
      // @ts-expect-error testing invalid data
      delete saveData.player.stats;

      expect(SaveSystem.isValidSaveData(saveData)).toBe(false);
    });

    it('should return false for missing hp in stats', () => {
      const saveData = createSaveData();
      // @ts-expect-error testing invalid data
      delete saveData.player.stats.hp;

      expect(SaveSystem.isValidSaveData(saveData)).toBe(false);
    });

    it('should return false for incompatible major version', () => {
      const saveData = createSaveData({ version: '2.0.0' });

      expect(SaveSystem.isValidSaveData(saveData)).toBe(false);
    });

    it('should return true for compatible minor version', () => {
      const saveData = createSaveData({ version: '1.1.0' });

      expect(SaveSystem.isValidSaveData(saveData)).toBe(true);
    });
  });

  describe('formatSaveTime', () => {
    it('should format timestamp correctly', () => {
      // 2026-02-03 14:30
      const timestamp = new Date(2026, 1, 3, 14, 30).getTime();

      const result = SaveSystem.formatSaveTime(timestamp);

      expect(result).toBe('2026/02/03 14:30');
    });

    it('should pad single digit values', () => {
      // 2026-01-05 09:05
      const timestamp = new Date(2026, 0, 5, 9, 5).getTime();

      const result = SaveSystem.formatSaveTime(timestamp);

      expect(result).toBe('2026/01/05 09:05');
    });
  });
});
