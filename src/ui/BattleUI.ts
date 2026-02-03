import Phaser from 'phaser';
import { HealthBar } from './HealthBar';

export type BattleAction = 'attack' | 'skill' | 'item' | 'escape';

export class BattleUI extends Phaser.GameObjects.Container {
  private monsterNameText!: Phaser.GameObjects.Text;
  private monsterHpBar!: HealthBar;
  private playerHpBar!: HealthBar;
  private playerMpBar!: HealthBar;
  private menuButtons: Phaser.GameObjects.Container[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private messageBox!: Phaser.GameObjects.Graphics;
  private selectedIndex: number = 0;

  private readonly SCREEN_WIDTH = 480;
  private readonly SCREEN_HEIGHT = 320;

  // 메뉴 아이템 정의
  private readonly menuItems: { label: string; action: BattleAction; enabled: boolean }[] = [
    { label: '공격', action: 'attack', enabled: true },
    { label: '스킬', action: 'skill', enabled: false },
    { label: '아이템', action: 'item', enabled: false },
    { label: '도망', action: 'escape', enabled: true },
  ];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createMonsterUI();
    this.createPlayerUI();
    this.createMenu();
    this.createMessageBox();

    scene.add.existing(this);
    this.setDepth(100);

    // 초기 메뉴 선택 표시
    this.updateMenuSelection();
  }

  /**
   * 몬스터 UI 생성 (상단)
   */
  private createMonsterUI(): void {
    // 몬스터 이름
    this.monsterNameText = this.scene.add.text(this.SCREEN_WIDTH / 2, 20, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.monsterNameText.setOrigin(0.5, 0);
    this.add(this.monsterNameText);

    // 몬스터 HP 바
    this.monsterHpBar = new HealthBar(this.scene, {
      x: this.SCREEN_WIDTH / 2 - 60,
      y: 40,
      width: 120,
      height: 12,
      fillColor: 0xff0000,
      showText: true,
    });
    this.add(this.monsterHpBar);
  }

  /**
   * 플레이어 UI 생성 (하단)
   */
  private createPlayerUI(): void {
    const baseY = this.SCREEN_HEIGHT - 100;

    // HP 라벨
    const hpLabel = this.scene.add.text(20, baseY, 'HP', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.add(hpLabel);

    // 플레이어 HP 바
    this.playerHpBar = new HealthBar(this.scene, {
      x: 50,
      y: baseY - 2,
      width: 100,
      height: 14,
      fillColor: 0x00ff00,
      showText: true,
    });
    this.add(this.playerHpBar);

    // MP 라벨
    const mpLabel = this.scene.add.text(170, baseY, 'MP', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    this.add(mpLabel);

    // 플레이어 MP 바
    this.playerMpBar = new HealthBar(this.scene, {
      x: 200,
      y: baseY - 2,
      width: 60,
      height: 14,
      fillColor: 0x0066ff,
      showText: true,
    });
    this.add(this.playerMpBar);
  }

  /**
   * 메뉴 버튼 생성
   */
  private createMenu(): void {
    const startX = 320;
    const startY = this.SCREEN_HEIGHT - 95;
    const buttonWidth = 70;
    const buttonHeight = 25;
    const padding = 5;

    this.menuItems.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (buttonWidth + padding);
      const y = startY + row * (buttonHeight + padding);

      // 버튼 컨테이너
      const buttonContainer = this.scene.add.container(x, y);

      // 버튼 배경
      const bg = this.scene.add.graphics();
      bg.fillStyle(item.enabled ? 0x333333 : 0x1a1a1a, 1);
      bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 4);
      bg.lineStyle(2, 0x666666, 1);
      bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 4);
      buttonContainer.add(bg);

      // 버튼 텍스트
      const text = this.scene.add.text(buttonWidth / 2, buttonHeight / 2, item.label, {
        fontSize: '11px',
        color: item.enabled ? '#ffffff' : '#666666',
        fontFamily: 'monospace',
      });
      text.setOrigin(0.5, 0.5);
      buttonContainer.add(text);

      // 선택 표시자 (숨김 상태로 시작)
      const selector = this.scene.add.text(-8, buttonHeight / 2, '>', {
        fontSize: '12px',
        color: '#ffff00',
        fontFamily: 'monospace',
      });
      selector.setOrigin(0.5, 0.5);
      selector.setVisible(false);
      buttonContainer.add(selector);

      // 데이터 저장
      buttonContainer.setData('bg', bg);
      buttonContainer.setData('selector', selector);
      buttonContainer.setData('enabled', item.enabled);

      this.menuButtons.push(buttonContainer);
      this.add(buttonContainer);
    });
  }

  /**
   * 메시지 박스 생성
   */
  private createMessageBox(): void {
    const boxY = this.SCREEN_HEIGHT - 50;
    const boxHeight = 45;

    // 메시지 배경
    this.messageBox = this.scene.add.graphics();
    this.messageBox.fillStyle(0x000000, 0.8);
    this.messageBox.fillRoundedRect(10, boxY, this.SCREEN_WIDTH - 20, boxHeight, 6);
    this.messageBox.lineStyle(2, 0x444444, 1);
    this.messageBox.strokeRoundedRect(10, boxY, this.SCREEN_WIDTH - 20, boxHeight, 6);
    this.add(this.messageBox);

    // 메시지 텍스트
    this.messageText = this.scene.add.text(20, boxY + 12, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      wordWrap: { width: this.SCREEN_WIDTH - 40 },
    });
    this.add(this.messageText);

    // 초기에는 숨김
    this.hideMessage();
  }

  /**
   * 몬스터 HP 업데이트
   */
  public updateMonsterHp(current: number, max: number): void {
    this.monsterHpBar.setValue(current, max);
  }

  /**
   * 몬스터 이름 설정
   */
  public setMonsterName(name: string): void {
    this.monsterNameText.setText(`[${name}]`);
  }

  /**
   * 플레이어 HP 업데이트
   */
  public updatePlayerHp(current: number, max: number): void {
    this.playerHpBar.setValue(current, max);
    this.playerHpBar.autoColor();
  }

  /**
   * 플레이어 MP 업데이트
   */
  public updatePlayerMp(current: number, max: number): void {
    this.playerMpBar.setValue(current, max);
  }

  /**
   * 메시지 표시 (Promise 반환)
   */
  public showMessage(text: string, duration: number = 1500): Promise<void> {
    return new Promise((resolve) => {
      this.messageText.setText(text);
      this.messageBox.setVisible(true);
      this.messageText.setVisible(true);

      this.scene.time.delayedCall(duration, () => {
        resolve();
      });
    });
  }

  /**
   * 메시지 숨기기
   */
  public hideMessage(): void {
    this.messageBox.setVisible(false);
    this.messageText.setVisible(false);
  }

  /**
   * 메뉴 표시
   */
  public showMenu(): void {
    this.menuButtons.forEach((btn) => btn.setVisible(true));
    this.updateMenuSelection();
  }

  /**
   * 메뉴 숨기기
   */
  public hideMenu(): void {
    this.menuButtons.forEach((btn) => btn.setVisible(false));
  }

  /**
   * 메뉴 위로 이동
   */
  public navigateUp(): void {
    if (this.selectedIndex >= 2) {
      this.selectedIndex -= 2;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 아래로 이동
   */
  public navigateDown(): void {
    if (this.selectedIndex < 2) {
      this.selectedIndex += 2;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 왼쪽으로 이동
   */
  public navigateLeft(): void {
    if (this.selectedIndex % 2 === 1) {
      this.selectedIndex -= 1;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 오른쪽으로 이동
   */
  public navigateRight(): void {
    if (this.selectedIndex % 2 === 0) {
      this.selectedIndex += 1;
      this.updateMenuSelection();
    }
  }

  /**
   * 메뉴 선택 표시 업데이트
   */
  private updateMenuSelection(): void {
    this.menuButtons.forEach((btn, index) => {
      const selector = btn.getData('selector') as Phaser.GameObjects.Text;
      const bg = btn.getData('bg') as Phaser.GameObjects.Graphics;
      const isSelected = index === this.selectedIndex;

      selector.setVisible(isSelected);

      // 선택된 버튼 하이라이트
      bg.clear();
      if (isSelected) {
        bg.fillStyle(0x444444, 1);
        bg.lineStyle(2, 0xffff00, 1);
      } else {
        const enabled = btn.getData('enabled') as boolean;
        bg.fillStyle(enabled ? 0x333333 : 0x1a1a1a, 1);
        bg.lineStyle(2, 0x666666, 1);
      }
      bg.fillRoundedRect(0, 0, 70, 25, 4);
      bg.strokeRoundedRect(0, 0, 70, 25, 4);
    });
  }

  /**
   * 현재 선택된 액션 반환
   */
  public getSelectedAction(): BattleAction {
    return this.menuItems[this.selectedIndex].action;
  }

  /**
   * 현재 선택된 메뉴가 활성화되어 있는지 확인
   */
  public isSelectedEnabled(): boolean {
    return this.menuItems[this.selectedIndex].enabled;
  }

  /**
   * 메뉴 선택 초기화
   */
  public resetSelection(): void {
    this.selectedIndex = 0;
    this.updateMenuSelection();
  }
}
