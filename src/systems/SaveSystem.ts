/**
 * SaveSystem - LocalStorage 기반 게임 저장/로드 시스템
 *
 * 플레이어 진행 상황을 브라우저 LocalStorage에 저장합니다.
 */

import type { PlayerData } from '../scenes/BattleScene';

/** 저장 데이터 버전 (호환성 관리용) */
const SAVE_VERSION = '1.0.0';

/** LocalStorage 키 */
const SAVE_KEY = 'pixel-dungeon-save';

/**
 * 저장 데이터 구조
 */
export interface SaveData {
  /** 저장 데이터 버전 */
  version: string;
  /** 저장 시간 (Unix timestamp) */
  timestamp: number;
  /** 플레이어 데이터 */
  player: {
    /** 타일 X 좌표 */
    tileX: number;
    /** 타일 Y 좌표 */
    tileY: number;
    /** 플레이어 스탯 */
    stats: PlayerData;
  };
}

/**
 * SaveSystem - 정적 메서드로 저장/로드 기능 제공
 */
export class SaveSystem {
  /**
   * 게임 저장
   * @param tileX 플레이어 타일 X 좌표
   * @param tileY 플레이어 타일 Y 좌표
   * @param stats 플레이어 스탯
   * @returns 저장 성공 여부
   */
  static save(tileX: number, tileY: number, stats: PlayerData): boolean {
    try {
      const saveData: SaveData = {
        version: SAVE_VERSION,
        timestamp: Date.now(),
        player: {
          tileX,
          tileY,
          stats: { ...stats },
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      console.log('SaveSystem: Game saved successfully');
      return true;
    } catch (error) {
      console.error('SaveSystem: Failed to save game', error);
      return false;
    }
  }

  /**
   * 저장 데이터 로드
   * @returns 저장 데이터 또는 null (저장 없음/오류)
   */
  static load(): SaveData | null {
    try {
      const json = localStorage.getItem(SAVE_KEY);

      if (!json) {
        console.log('SaveSystem: No save data found');
        return null;
      }

      const saveData = JSON.parse(json) as SaveData;

      // 버전 확인
      if (!SaveSystem.isValidSaveData(saveData)) {
        console.warn('SaveSystem: Invalid or outdated save data');
        return null;
      }

      console.log('SaveSystem: Game loaded successfully');
      return saveData;
    } catch (error) {
      console.error('SaveSystem: Failed to load game', error);
      return null;
    }
  }

  /**
   * 저장 데이터 존재 여부 확인
   * @returns 유효한 저장 데이터 존재 여부
   */
  static hasSaveData(): boolean {
    try {
      const json = localStorage.getItem(SAVE_KEY);
      if (!json) return false;

      const saveData = JSON.parse(json) as SaveData;
      return SaveSystem.isValidSaveData(saveData);
    } catch {
      return false;
    }
  }

  /**
   * 저장 데이터 삭제
   * @returns 삭제 성공 여부
   */
  static deleteSave(): boolean {
    try {
      localStorage.removeItem(SAVE_KEY);
      console.log('SaveSystem: Save data deleted');
      return true;
    } catch (error) {
      console.error('SaveSystem: Failed to delete save', error);
      return false;
    }
  }

  /**
   * 저장 데이터 유효성 검증
   * @param data 검증할 데이터
   * @returns 유효성 여부
   */
  static isValidSaveData(data: unknown): data is SaveData {
    if (!data || typeof data !== 'object') return false;

    const save = data as SaveData;

    // 필수 필드 확인
    if (typeof save.version !== 'string') return false;
    if (typeof save.timestamp !== 'number') return false;
    if (!save.player || typeof save.player !== 'object') return false;
    if (typeof save.player.tileX !== 'number') return false;
    if (typeof save.player.tileY !== 'number') return false;
    if (!save.player.stats || typeof save.player.stats !== 'object') return false;

    // 스탯 필드 확인
    const stats = save.player.stats;
    if (typeof stats.hp !== 'number') return false;
    if (typeof stats.maxHp !== 'number') return false;
    if (typeof stats.mp !== 'number') return false;
    if (typeof stats.maxMp !== 'number') return false;
    if (typeof stats.attack !== 'number') return false;
    if (typeof stats.defense !== 'number') return false;

    // 버전 호환성 확인 (메이저 버전 일치)
    const savedMajor = save.version.split('.')[0];
    const currentMajor = SAVE_VERSION.split('.')[0];
    if (savedMajor !== currentMajor) {
      console.warn(`SaveSystem: Version mismatch (saved: ${save.version}, current: ${SAVE_VERSION})`);
      return false;
    }

    return true;
  }

  /**
   * 저장 시간 포맷
   * @param timestamp Unix timestamp
   * @returns 포맷된 시간 문자열
   */
  static formatSaveTime(timestamp: number): string {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }
}
