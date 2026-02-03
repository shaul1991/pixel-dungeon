import Phaser from 'phaser';
import { UI_HEIGHT } from '../config';
import { HealthBar } from './HealthBar';

export type BattleAction = 'attack' | 'skill' | 'item' | 'escape';

export class BattleUI extends Phaser.GameObjects.Container {
  private monsterNameText!: Phaser.GameObjects.Text;
  private monsterLevelText!: Phaser.GameObjects.Text;
  private monsterHpBar!: HealthBar;
  private monsterInfoBox!: Phaser.GameObjects.Graphics;

  private playerNameText!: Phaser.GameObjects.Text;
  private playerLevelText!: Phaser.GameObjects.Text;
  private playerHpBar!: HealthBar;
  private playerHpText!: Phaser.GameObjects.Text;
  private playerMpBar!: HealthBar;
  private playerInfoBox!: Phaser.GameObjects.Graphics;

  private menuButtons: Phaser.GameObjects.Container[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private messageBox!: Phaser.GameObjects.Graphics;
  private selectedIndex: number = 0;

  private readonly SCREEN_HEIGHT = 320 + UI_HEIGHT; // 352
  private readonly HALF_HEIGHT = (320 + UI_HEIGHT) / 2; // 176

  // 메뉴 아이템 정의 (포켓몬 스타일 색상)
  private readonly menuItems: { label: string; action: BattleAction; enabled: boolean; color: number }[] = [
    { label: '공격', action: 'attack', enabled: true, color: 0xf08080 },   // 빨강
    { label: '스킬', action: 'skill', enabled: false, color: 0xf0c060 },   // 주황
    { label: '아이템', action: 'item', enabled: false, color: 0x78c078 },  // 초록
    { label: '도망', action: 'escape', enabled: true, color: 0x60a0c0 },   // 파랑
  ];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.createMonsterUI();
    this.createPlayerUI();
    this.createMessageBox();
    this.createMenu();

    scene.add.existing(this);
    this.setDepth(100);

    // 초기 메뉴 선택 표시
    this.updateMenuSelection();
  }

  /**
   * 몬스터 정보 박스 생성 (왼쪽 상단) - 포켓몬 스타일
   */
  private createMonsterUI(): void {
    const boxX = 10;
    const boxY = 15;
    const boxWidth = 180;
    const boxHeight = 50;

    // 정보 박스 배경 (그라데이션 느낌의 회색 박스)
    this.monsterInfoBox = this.scene.add.graphics();
    this.monsterInfoBox.fillStyle(0xd8d8d0, 1);
    this.monsterInfoBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 4);
    // 하단 테두리 (입체감)
    this.monsterInfoBox.fillStyle(0x808080, 1);
    this.monsterInfoBox.fillTriangle(
      boxX, boxY + boxHeight,
      boxX + boxWidth, boxY + boxHeight,
      boxX + boxWidth + 15, boxY + boxHeight - 10
    );
    this.monsterInfoBox.fillRect(boxX, boxY + boxHeight - 4, boxWidth, 4);
    // 테두리
    this.monsterInfoBox.lineStyle(2, 0x404040, 1);
    this.monsterInfoBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 4);
    this.add(this.monsterInfoBox);

    // 몬스터 이름
    this.monsterNameText = this.scene.add.text(boxX + 10, boxY + 8, '', {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.add(this.monsterNameText);

    // 몬스터 레벨
    this.monsterLevelText = this.scene.add.text(boxX + boxWidth - 50, boxY + 8, 'Lv.1', {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'monospace',
    });
    this.add(this.monsterLevelText);

    // HP 라벨
    const hpLabel = this.scene.add.text(boxX + 10, boxY + 30, 'HP', {
      fontSize: '10px',
      color: '#f0a000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.add(hpLabel);

    // 몬스터 HP 바
    this.monsterHpBar = new HealthBar(this.scene, {
      x: boxX + 35,
      y: boxY + 28,
      width: 130,
      height: 10,
      fillColor: 0x00c000,
      showText: false,
    });
    this.add(this.monsterHpBar);
  }

  /**
   * 플레이어 정보 박스 생성 (오른쪽 중앙) - 포켓몬 스타일
   */
  private createPlayerUI(): void {
    const boxX = 260;
    const boxY = this.HALF_HEIGHT + 20;
    const boxWidth = 200;
    const boxHeight = 65;

    // 정보 박스 배경
    this.playerInfoBox = this.scene.add.graphics();
    this.playerInfoBox.fillStyle(0xd8d8d0, 1);
    this.playerInfoBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 4);
    // 왼쪽 상단 테두리 (입체감)
    this.playerInfoBox.fillStyle(0x808080, 1);
    this.playerInfoBox.fillTriangle(
      boxX, boxY,
      boxX - 15, boxY + 10,
      boxX, boxY + 10
    );
    // 테두리
    this.playerInfoBox.lineStyle(2, 0x404040, 1);
    this.playerInfoBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 4);
    this.add(this.playerInfoBox);

    // 플레이어 이름
    this.playerNameText = this.scene.add.text(boxX + 10, boxY + 6, 'Player', {
      fontSize: '14px',
      color: '#000000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.add(this.playerNameText);

    // 플레이어 레벨
    this.playerLevelText = this.scene.add.text(boxX + boxWidth - 50, boxY + 6, 'Lv.1', {
      fontSize: '12px',
      color: '#000000',
      fontFamily: 'monospace',
    });
    this.add(this.playerLevelText);

    // HP 라벨
    const hpLabel = this.scene.add.text(boxX + 10, boxY + 26, 'HP', {
      fontSize: '10px',
      color: '#f0a000',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.add(hpLabel);

    // 플레이어 HP 바
    this.playerHpBar = new HealthBar(this.scene, {
      x: boxX + 35,
      y: boxY + 24,
      width: 140,
      height: 10,
      fillColor: 0x00c000,
      showText: false,
    });
    this.add(this.playerHpBar);

    // HP 수치 텍스트
    this.playerHpText = this.scene.add.text(boxX + boxWidth - 70, boxY + 36, '100/100', {
      fontSize: '11px',
      color: '#000000',
      fontFamily: 'monospace',
    });
    this.add(this.playerHpText);

    // MP 라벨 (EXP 바 위치에 MP 표시)
    const mpLabel = this.scene.add.text(boxX + 10, boxY + 48, 'MP', {
      fontSize: '10px',
      color: '#0080f0',
      fontFamily: 'monospace',
      fontStyle: 'bold',
    });
    this.add(mpLabel);

    // 플레이어 MP 바
    this.playerMpBar = new HealthBar(this.scene, {
      x: boxX + 35,
      y: boxY + 46,
      width: 140,
      height: 8,
      fillColor: 0x0080f0,
      showText: false,
    });
    this.add(this.playerMpBar);
  }

  /**
   * 메시지 박스 생성 (왼쪽 하단)
   */
  private createMessageBox(): void {
    const boxX = 10;
    const boxY = this.SCREEN_HEIGHT - 85;
    const boxWidth = 230;
    const boxHeight = 75;

    // 메시지 배경 (테두리 있는 흰색 박스)
    this.messageBox = this.scene.add.graphics();
    this.messageBox.fillStyle(0xf8f8f0, 1);
    this.messageBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 8);
    this.messageBox.lineStyle(3, 0x404040, 1);
    this.messageBox.strokeRoundedRect(boxX, boxY, boxWidth, boxHeight, 8);
    // 내부 테두리
    this.messageBox.lineStyle(2, 0xc0a000, 1);
    this.messageBox.strokeRoundedRect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8, 6);
    this.add(this.messageBox);

    // 메시지 텍스트
    this.messageText = this.scene.add.text(boxX + 15, boxY + 15, '', {
      fontSize: '13px',
      color: '#000000',
      fontFamily: 'monospace',
      wordWrap: { width: boxWidth - 30 },
      lineSpacing: 4,
    });
    this.add(this.messageText);

    // 초기에는 숨김
    this.hideMessage();
  }

  /**
   * 메뉴 버튼 생성 (오른쪽 하단) - 포켓몬 스타일 2x2
   */
  private createMenu(): void {
    const startX = 250;
    const startY = this.SCREEN_HEIGHT - 85;
    const buttonWidth = 105;
    const buttonHeight = 32;
    const gapX = 8;
    const gapY = 8;

    this.menuItems.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (buttonWidth + gapX);
      const y = startY + row * (buttonHeight + gapY);

      // 버튼 컨테이너
      const buttonContainer = this.scene.add.container(x, y);

      // 버튼 배경 (둥근 모서리, 색상)
      const bg = this.scene.add.graphics();
      const bgColor = item.enabled ? item.color : 0x808080;
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 16);
      // 하이라이트 (위쪽 밝게)
      bg.fillStyle(0xffffff, 0.3);
      bg.fillRoundedRect(4, 2, buttonWidth - 8, buttonHeight / 2 - 2, { tl: 14, tr: 14, bl: 0, br: 0 });
      // 테두리
      bg.lineStyle(2, 0x404040, 1);
      bg.strokeRoundedRect(0, 0, buttonWidth, buttonHeight, 16);
      buttonContainer.add(bg);

      // 버튼 텍스트
      const text = this.scene.add.text(buttonWidth / 2, buttonHeight / 2, item.label, {
        fontSize: '13px',
        color: item.enabled ? '#ffffff' : '#a0a0a0',
        fontFamily: 'monospace',
        fontStyle: 'bold',
      });
      text.setOrigin(0.5, 0.5);
      // 텍스트 그림자 효과
      text.setShadow(1, 1, '#000000', 0);
      buttonContainer.add(text);

      // 선택 표시자 (테두리로 표현)
      const selector = this.scene.add.graphics();
      selector.lineStyle(3, 0xffff00, 1);
      selector.strokeRoundedRect(-2, -2, buttonWidth + 4, buttonHeight + 4, 18);
      selector.setVisible(false);
      buttonContainer.add(selector);

      // 데이터 저장
      buttonContainer.setData('bg', bg);
      buttonContainer.setData('selector', selector);
      buttonContainer.setData('enabled', item.enabled);
      buttonContainer.setData('color', item.color);

      this.menuButtons.push(buttonContainer);
      this.add(buttonContainer);
    });
  }

  /**
   * 몬스터 HP 업데이트
   */
  public updateMonsterHp(current: number, max: number): void {
    this.monsterHpBar.setValue(current, max);
    this.monsterHpBar.autoColor();
  }

  /**
   * 몬스터 이름 설정
   */
  public setMonsterName(name: string): void {
    this.monsterNameText.setText(name);
  }

  /**
   * 몬스터 레벨 설정
   */
  public setMonsterLevel(level: number): void {
    this.monsterLevelText.setText(`Lv.${level}`);
  }

  /**
   * 플레이어 HP 업데이트
   */
  public updatePlayerHp(current: number, max: number): void {
    this.playerHpBar.setValue(current, max);
    this.playerHpBar.autoColor();
    this.playerHpText.setText(`${current}/${max}`);
  }

  /**
   * 플레이어 MP 업데이트
   */
  public updatePlayerMp(current: number, max: number): void {
    this.playerMpBar.setValue(current, max);
  }

  /**
   * 플레이어 레벨 설정
   */
  public setPlayerLevel(level: number): void {
    this.playerLevelText.setText(`Lv.${level}`);
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
      const selector = btn.getData('selector') as Phaser.GameObjects.Graphics;
      const isSelected = index === this.selectedIndex;
      selector.setVisible(isSelected);
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
