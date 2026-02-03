/**
 * InventoryUI - 인벤토리 화면 컴포넌트
 *
 * 아이템 그리드 표시, 선택, 사용 인터페이스를 제공합니다.
 */
import Phaser from 'phaser';
import {
  PixelColors,
  PixelColorStrings,
  createPixelTextStyle,
} from './PixelTheme';
import type { InventoryItem } from '../types';

export class InventoryUI extends Phaser.GameObjects.Container {
  private background!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private itemSlots: Phaser.GameObjects.Container[] = [];
  private selectedIndex: number = 0;
  private detailPanel!: Phaser.GameObjects.Container;
  private detailNameText!: Phaser.GameObjects.Text;
  private detailDescText!: Phaser.GameObjects.Text;
  private detailQuantityText!: Phaser.GameObjects.Text;
  private actionButtons: Phaser.GameObjects.Container[] = [];
  private selectedActionIndex: number = 0;
  private isActionMode: boolean = false;

  private items: InventoryItem[] = [];

  private readonly COLS = 5;
  private readonly ROWS = 4;
  private readonly SLOT_SIZE = 36;
  private readonly SLOT_GAP = 4;
  private readonly PANEL_WIDTH = 240;
  private readonly PANEL_HEIGHT = 280;
  private readonly PANEL_X: number;
  private readonly PANEL_Y: number;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    // 화면 중앙 계산
    this.PANEL_X = (480 - this.PANEL_WIDTH) / 2;
    this.PANEL_Y = (320 - this.PANEL_HEIGHT) / 2;

    this.createBackground();
    this.createTitle();
    this.createItemGrid();
    this.createDetailPanel();
    this.createActionButtons();

    scene.add.existing(this);
    this.setDepth(200);
    this.setVisible(false);
  }

  /**
   * 배경 패널 생성
   */
  private createBackground(): void {
    this.background = this.scene.add.graphics();

    // 반투명 오버레이
    this.background.fillStyle(0x000000, 0.7);
    this.background.fillRect(0, 0, 480, 320);

    // 메인 패널
    this.background.fillStyle(PixelColors.bgDark, 1);
    this.background.fillRect(this.PANEL_X, this.PANEL_Y, this.PANEL_WIDTH, this.PANEL_HEIGHT);

    // 테두리
    this.background.lineStyle(2, PixelColors.frameLight, 1);
    this.background.strokeRect(this.PANEL_X, this.PANEL_Y, this.PANEL_WIDTH, this.PANEL_HEIGHT);

    // 3D 효과
    this.background.fillStyle(0xffffff, 0.1);
    this.background.fillRect(this.PANEL_X, this.PANEL_Y, this.PANEL_WIDTH, 2);
    this.background.fillRect(this.PANEL_X, this.PANEL_Y, 2, this.PANEL_HEIGHT);

    this.add(this.background);
  }

  /**
   * 타이틀 생성
   */
  private createTitle(): void {
    this.titleText = this.scene.add.text(
      this.PANEL_X + this.PANEL_WIDTH / 2,
      this.PANEL_Y + 12,
      '인벤토리',
      {
        ...createPixelTextStyle('large', PixelColorStrings.textWhite),
        fontStyle: 'bold',
      }
    );
    this.titleText.setOrigin(0.5, 0);
    this.add(this.titleText);
  }

  /**
   * 아이템 그리드 생성
   */
  private createItemGrid(): void {
    const gridStartX = this.PANEL_X + 15;
    const gridStartY = this.PANEL_Y + 35;

    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const index = row * this.COLS + col;
        const x = gridStartX + col * (this.SLOT_SIZE + this.SLOT_GAP);
        const y = gridStartY + row * (this.SLOT_SIZE + this.SLOT_GAP);

        const slot = this.createSlot(x, y, index);
        this.itemSlots.push(slot);
        this.add(slot);
      }
    }
  }

  /**
   * 개별 슬롯 생성
   */
  private createSlot(x: number, y: number, index: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // 슬롯 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(PixelColors.bgMedium, 1);
    bg.fillRect(0, 0, this.SLOT_SIZE, this.SLOT_SIZE);
    bg.lineStyle(1, PixelColors.frameDark, 1);
    bg.strokeRect(0, 0, this.SLOT_SIZE, this.SLOT_SIZE);
    container.add(bg);

    // 선택 하이라이트 (숨김 상태로 시작)
    const highlight = this.scene.add.graphics();
    highlight.lineStyle(2, PixelColors.frameLight, 1);
    highlight.strokeRect(-1, -1, this.SLOT_SIZE + 2, this.SLOT_SIZE + 2);
    highlight.setVisible(false);
    highlight.setName('highlight');
    container.add(highlight);

    // 아이템 이름 (짧게)
    const nameText = this.scene.add.text(
      this.SLOT_SIZE / 2,
      this.SLOT_SIZE / 2 - 6,
      '',
      createPixelTextStyle('tiny', PixelColorStrings.textWhite)
    );
    nameText.setOrigin(0.5, 0.5);
    nameText.setName('name');
    container.add(nameText);

    // 수량 표시
    const quantityText = this.scene.add.text(
      this.SLOT_SIZE - 4,
      this.SLOT_SIZE - 4,
      '',
      createPixelTextStyle('tiny', PixelColorStrings.textYellow)
    );
    quantityText.setOrigin(1, 1);
    quantityText.setName('quantity');
    container.add(quantityText);

    container.setData('index', index);
    return container;
  }

  /**
   * 상세 정보 패널 생성
   */
  private createDetailPanel(): void {
    const panelY = this.PANEL_Y + 195;
    const panelX = this.PANEL_X + 10;
    const panelWidth = this.PANEL_WIDTH - 20;
    const panelHeight = 50;

    this.detailPanel = this.scene.add.container(panelX, panelY);

    // 패널 배경
    const bg = this.scene.add.graphics();
    bg.fillStyle(PixelColors.bgMedium, 1);
    bg.fillRect(0, 0, panelWidth, panelHeight);
    bg.lineStyle(1, PixelColors.frameDark, 1);
    bg.strokeRect(0, 0, panelWidth, panelHeight);
    this.detailPanel.add(bg);

    // 아이템 이름
    this.detailNameText = this.scene.add.text(
      8,
      6,
      '',
      {
        ...createPixelTextStyle('small', PixelColorStrings.textWhite),
        fontStyle: 'bold',
      }
    );
    this.detailPanel.add(this.detailNameText);

    // 수량
    this.detailQuantityText = this.scene.add.text(
      panelWidth - 8,
      6,
      '',
      createPixelTextStyle('small', PixelColorStrings.textYellow)
    );
    this.detailQuantityText.setOrigin(1, 0);
    this.detailPanel.add(this.detailQuantityText);

    // 설명
    this.detailDescText = this.scene.add.text(
      8,
      26,
      '',
      createPixelTextStyle('tiny', PixelColorStrings.textGray)
    );
    this.detailPanel.add(this.detailDescText);

    this.add(this.detailPanel);
  }

  /**
   * 액션 버튼 생성 (사용, 버리기, 닫기)
   */
  private createActionButtons(): void {
    const buttonY = this.PANEL_Y + 252;
    const buttonWidth = 60;
    const buttonHeight = 20;
    const buttonGap = 10;
    const totalWidth = buttonWidth * 3 + buttonGap * 2;
    const startX = this.PANEL_X + (this.PANEL_WIDTH - totalWidth) / 2;

    const actions = [
      { label: '사용', action: 'use' },
      { label: '버리기', action: 'drop' },
      { label: '닫기', action: 'close' },
    ];

    actions.forEach((item, index) => {
      const x = startX + index * (buttonWidth + buttonGap);
      const button = this.createButton(x, buttonY, buttonWidth, buttonHeight, item.label);
      button.setData('action', item.action);
      this.actionButtons.push(button);
      this.add(button);
    });
  }

  /**
   * 버튼 생성 헬퍼
   */
  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    const bg = this.scene.add.graphics();
    bg.fillStyle(PixelColors.bgLight, 1);
    bg.fillRect(0, 0, width, height);
    bg.lineStyle(1, PixelColors.frameMedium, 1);
    bg.strokeRect(0, 0, width, height);
    bg.setName('bg');
    container.add(bg);

    const highlight = this.scene.add.graphics();
    highlight.lineStyle(2, PixelColors.frameLight, 1);
    highlight.strokeRect(-1, -1, width + 2, height + 2);
    highlight.setVisible(false);
    highlight.setName('highlight');
    container.add(highlight);

    const text = this.scene.add.text(
      width / 2,
      height / 2,
      label,
      createPixelTextStyle('small', PixelColorStrings.textWhite)
    );
    text.setOrigin(0.5, 0.5);
    container.add(text);

    return container;
  }

  /**
   * 인벤토리 데이터 업데이트
   */
  public setItems(items: InventoryItem[]): void {
    this.items = items;
    this.updateDisplay();
  }

  /**
   * 화면 표시 업데이트
   */
  private updateDisplay(): void {
    // 모든 슬롯 초기화
    this.itemSlots.forEach((slot, index) => {
      const nameText = slot.getByName('name') as Phaser.GameObjects.Text;
      const quantityText = slot.getByName('quantity') as Phaser.GameObjects.Text;
      const highlight = slot.getByName('highlight') as Phaser.GameObjects.Graphics;

      const item = this.items[index];
      if (item) {
        // 아이템 이름 (최대 3글자)
        const shortName = item.name.substring(0, 3);
        nameText.setText(shortName);
        quantityText.setText(item.quantity > 1 ? `x${item.quantity}` : '');
      } else {
        nameText.setText('');
        quantityText.setText('');
      }

      highlight.setVisible(index === this.selectedIndex && !this.isActionMode);
    });

    // 상세 정보 업데이트
    this.updateDetailPanel();

    // 액션 버튼 하이라이트
    this.updateActionButtons();
  }

  /**
   * 상세 정보 패널 업데이트
   */
  private updateDetailPanel(): void {
    const item = this.items[this.selectedIndex];
    if (item) {
      this.detailNameText.setText(item.name);
      this.detailQuantityText.setText(`x${item.quantity}`);
      this.detailDescText.setText(item.description);
    } else {
      this.detailNameText.setText('');
      this.detailQuantityText.setText('');
      this.detailDescText.setText('아이템을 선택하세요');
    }
  }

  /**
   * 액션 버튼 상태 업데이트
   */
  private updateActionButtons(): void {
    this.actionButtons.forEach((button, index) => {
      const highlight = button.getByName('highlight') as Phaser.GameObjects.Graphics;
      highlight.setVisible(this.isActionMode && index === this.selectedActionIndex);
    });
  }

  /**
   * 커서 이동
   */
  public moveSelection(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.isActionMode) {
      // 액션 모드: 좌우 이동
      if (direction === 'left') {
        this.selectedActionIndex = Math.max(0, this.selectedActionIndex - 1);
      } else if (direction === 'right') {
        this.selectedActionIndex = Math.min(this.actionButtons.length - 1, this.selectedActionIndex + 1);
      } else if (direction === 'up') {
        // 액션 모드 해제, 아이템 그리드로 복귀
        this.isActionMode = false;
      }
    } else {
      // 아이템 그리드 모드
      const col = this.selectedIndex % this.COLS;
      const row = Math.floor(this.selectedIndex / this.COLS);
      let newCol = col;
      let newRow = row;

      switch (direction) {
        case 'up':
          newRow = Math.max(0, row - 1);
          break;
        case 'down':
          if (row === this.ROWS - 1) {
            // 마지막 행에서 아래로 가면 액션 모드
            this.isActionMode = true;
          } else {
            newRow = Math.min(this.ROWS - 1, row + 1);
          }
          break;
        case 'left':
          newCol = Math.max(0, col - 1);
          break;
        case 'right':
          newCol = Math.min(this.COLS - 1, col + 1);
          break;
      }

      if (!this.isActionMode) {
        const newIndex = newRow * this.COLS + newCol;
        this.selectedIndex = Math.min(newIndex, this.items.length > 0 ? this.items.length - 1 : 0);
      }
    }

    this.updateDisplay();
  }

  /**
   * 현재 선택된 액션 실행
   * @returns 액션 결과 (use, drop, close, null)
   */
  public confirm(): { action: string; item?: InventoryItem } | null {
    if (this.isActionMode) {
      const action = this.actionButtons[this.selectedActionIndex].getData('action') as string;
      const selectedItem = this.items[this.selectedIndex];

      switch (action) {
        case 'use':
          if (selectedItem && selectedItem.category === 'consumable') {
            return { action: 'use', item: selectedItem };
          }
          return null;
        case 'drop':
          if (selectedItem) {
            return { action: 'drop', item: selectedItem };
          }
          return null;
        case 'close':
          return { action: 'close' };
      }
    } else {
      // 아이템 선택 시 액션 모드로
      if (this.items[this.selectedIndex]) {
        this.isActionMode = true;
        this.selectedActionIndex = 0;
        this.updateDisplay();
      }
    }
    return null;
  }

  /**
   * 취소 (액션 모드 해제 또는 닫기)
   * @returns true면 UI 닫기
   */
  public cancel(): boolean {
    if (this.isActionMode) {
      this.isActionMode = false;
      this.updateDisplay();
      return false;
    }
    return true;
  }

  /**
   * UI 열기
   */
  public open(items: InventoryItem[]): void {
    this.items = items;
    this.selectedIndex = 0;
    this.selectedActionIndex = 0;
    this.isActionMode = false;
    this.updateDisplay();
    this.setVisible(true);
  }

  /**
   * UI 닫기
   */
  public close(): void {
    this.setVisible(false);
  }

  /**
   * 현재 선택된 아이템 반환
   */
  public getSelectedItem(): InventoryItem | undefined {
    return this.items[this.selectedIndex];
  }
}
