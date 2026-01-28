export class Cartridge {
  /** リセット処理 */
  static onReset({ pads, speakers, screens }) {
    this.pads = pads;
    this.speakers = speakers;
    this.screens = screens;

    this.difficulty = 1;

    this.screens[0].setViewBox(0, 0, 20, 15);

    this.fighter = this.screens[0].addSprite([
      [0, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
    ], { colorIds: [null, 1] });

    this.invader = this.screens[0].addSprite([
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1],
    ], { colorIds: [null, 2] });

    this.restart();
  }

  /** リスタート */
  static restart() {
    this.isGameover = false;
    this.score = 0;

    this.fighter.x = 0;
    this.fighter.y = 12;

    this.invader.x = 0;
    this.invader.y = 0;

    this.beam?.remove();
    delete this.beam;

    this.result?.remove();
  }

  /** ゲームオーバー */
  static gameover() {
    this.isGameover = true;
    this.sfx?.stop();
    this.sfx = this.speakers[0].play([
      [
        { noteNumber: 12, duration: 8 },
        { noteNumber: 10, duration: 8 },
        { noteNumber: 7, duration: 8 },
        { noteNumber: 4, duration: 8 },
        { noteNumber: 0, duration: 8 },
      ],
    ]);
    this.result = this.screens[0].addText(this.score, {
      y: 3,
      x: 10 - this.score.toString().length * 2,
    });
  }

  /** フレーム処理 */
  static onFrame() {
    if (!this.isGameover) {
      /*! ファイターの移動 */
      if (this.pads[0].buttons.right.justPressed && this.fighter.x < 16) {
        this.fighter.x += 4;
      }
      if (this.pads[0].buttons.left.justPressed && this.fighter.x > 0) {
        this.fighter.x -= 4;
      }

      /*! ビームを発射済みならビームを移動 */
      if (this.beam) {
        this.beam.y--;
        if (this.beam.y <= -2) {
          this.beam.remove();
          delete this.beam;
        }
      }

      /*! ビームが発射済みではなく、発射ボタンが押されたら */
      if (this.pads[0].buttons.b0.justPressed && !this.beam) {
        this.beam = this.screens[0].addSprite([
          [0, 1, 0],
          [0, 1, 0],
          [0, 0, 0],
        ], { x: this.fighter.x, y: this.fighter.y - 1, colorIds: [null, 3] });
        this.sfx?.stop();
        this.sfx = this.speakers[0].play([
          [
            { noteNumber: 0, duration: 4 },
            { noteNumber: 4, duration: 4 },
            { noteNumber: 7, duration: 4 },
            { noteNumber: 10, duration: 4 },
            { noteNumber: 12, duration: 4 },
          ],
        ]);
      }

      /*! もし命中したらインベーダーを再生成 */
      if (
        this.beam && this.beam.x === this.invader.x &&
        this.beam.y <= this.invader.y + 1
      ) {
        this.score++;
        this.sfx?.stop();
        this.sfx = this.speakers[0].play([
          [
            { noteNumber: 12, duration: 2 },
            { noteNumber: 10, duration: 2 },
            { noteNumber: 7, duration: 2 },
            { noteNumber: 4, duration: 2 },
            { noteNumber: 0, duration: 2 },
          ],
        ]);
        this.beam.remove();
        delete this.beam;
        this.invader.x = Math.floor(Math.random() * 5) * 4;
        this.invader.y = 0;
        return;
      }

      /*! インベーダーを移動 */
      if (Math.random() * 100 < (this.score + this.difficulty)) {
        this.invader.y++;
      }

      /*! もしインベーダーが地上に到達したら */
      if (this.invader.y >= 12) {
        this.gameover();
      }
    } else {
      if (this.pads[0].buttons.b1.justPressed && this.sfx.ended) {
        this.restart();
      }
    }
  }
}
