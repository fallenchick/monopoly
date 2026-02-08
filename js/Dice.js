// Dice.js - 骰子逻辑与动画

class Dice {
    constructor() {
        this.die1 = 0;
        this.die2 = 0;
        this.die1Element = document.getElementById('die1');
        this.die2Element = document.getElementById('die2');
        this.faces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    }

    /**
     * 掷骰子
     * @returns {Promise<{total: number, isDouble: boolean, die1: number, die2: number}>}
     */
    roll() {
        return new Promise((resolve) => {
            // 开始动画
            this.die1Element.classList.add('rolling');
            this.die2Element.classList.add('rolling');

            let rollCount = 0;
            const maxRolls = 15;

            const rollInterval = setInterval(() => {
                // 播放骰子音效
                if (rollCount % 3 === 0) {
                    audio.play('dice');
                }

                // 随机显示
                this.die1Element.textContent = this.faces[Math.floor(Math.random() * 6)];
                this.die2Element.textContent = this.faces[Math.floor(Math.random() * 6)];
                rollCount++;

                if (rollCount >= maxRolls) {
                    clearInterval(rollInterval);
                    this.finishRoll(resolve);
                }
            }, 80);
        });
    }

    finishRoll(resolve) {
        // 最终结果
        this.die1 = Math.floor(Math.random() * 6) + 1;
        this.die2 = Math.floor(Math.random() * 6) + 1;

        // 显示结果
        this.die1Element.textContent = this.faces[this.die1 - 1];
        this.die2Element.textContent = this.faces[this.die2 - 1];

        // 停止滚动动画
        this.die1Element.classList.remove('rolling');
        this.die2Element.classList.remove('rolling');

        // 添加弹跳效果
        this.die1Element.classList.add('bounce');
        this.die2Element.classList.add('bounce');

        // 播放结束音效
        audio.play('diceEnd');

        setTimeout(() => {
            this.die1Element.classList.remove('bounce');
            this.die2Element.classList.remove('bounce');

            resolve({
                die1: this.die1,
                die2: this.die2,
                total: this.die1 + this.die2,
                isDouble: this.die1 === this.die2
            });
        }, 300);
    }

    /**
     * 获取上次掷骰结果
     */
    getLastRoll() {
        return {
            die1: this.die1,
            die2: this.die2,
            total: this.die1 + this.die2,
            isDouble: this.die1 === this.die2
        };
    }

    /**
     * 重置显示
     */
    reset() {
        this.die1Element.textContent = '⚀';
        this.die2Element.textContent = '⚀';
    }
}
