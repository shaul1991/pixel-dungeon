import Phaser from 'phaser';
import type { Direction } from '../entities/Player';

export interface InputState {
  direction: Direction | null;
  action: boolean;
  cancel: boolean;
}

export class InputController {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private actionKey!: Phaser.Input.Keyboard.Key; // Space 또는 Z
  private actionKeyZ!: Phaser.Input.Keyboard.Key;
  private cancelKeyX!: Phaser.Input.Keyboard.Key; // X 키 (취소)

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupInput();
  }

  private setupInput(): void {
    const keyboard = this.scene.input.keyboard;

    if (!keyboard) {
      console.error('InputController: Keyboard input not available');
      return;
    }

    // 방향키 설정
    this.cursors = keyboard.createCursorKeys();

    // WASD 키 설정
    this.wasd = {
      W: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // 액션 키 설정 (Space, Z)
    this.actionKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.actionKeyZ = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);

    // 취소 키 설정 (X)
    this.cancelKeyX = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  /**
   * 현재 입력 상태 확인
   * @returns 방향과 액션 입력 상태
   */
  public update(): InputState {
    const result: InputState = {
      direction: null,
      action: false,
      cancel: false,
    };

    // 방향 입력 확인 (우선순위: 위, 아래, 왼쪽, 오른쪽)
    if (this.isUpPressed()) {
      result.direction = 'up';
    } else if (this.isDownPressed()) {
      result.direction = 'down';
    } else if (this.isLeftPressed()) {
      result.direction = 'left';
    } else if (this.isRightPressed()) {
      result.direction = 'right';
    }

    // 액션 키 확인 (justDown으로 한 번만 인식)
    result.action = this.isActionPressed();

    // 취소 키 확인
    result.cancel = this.isCancelPressed();

    return result;
  }

  private isUpPressed(): boolean {
    return this.cursors?.up?.isDown || this.wasd?.W?.isDown || false;
  }

  private isDownPressed(): boolean {
    return this.cursors?.down?.isDown || this.wasd?.S?.isDown || false;
  }

  private isLeftPressed(): boolean {
    return this.cursors?.left?.isDown || this.wasd?.A?.isDown || false;
  }

  private isRightPressed(): boolean {
    return this.cursors?.right?.isDown || this.wasd?.D?.isDown || false;
  }

  private isActionPressed(): boolean {
    return (
      Phaser.Input.Keyboard.JustDown(this.actionKey) ||
      Phaser.Input.Keyboard.JustDown(this.actionKeyZ)
    );
  }

  private isCancelPressed(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.cancelKeyX);
  }

  /**
   * 방향키가 눌려 있는지 확인
   */
  public isAnyDirectionPressed(): boolean {
    return (
      this.isUpPressed() ||
      this.isDownPressed() ||
      this.isLeftPressed() ||
      this.isRightPressed()
    );
  }

  /**
   * 입력 시스템 정리
   */
  public destroy(): void {
    // 키 제거는 씬이 종료될 때 자동으로 처리됨
  }
}
