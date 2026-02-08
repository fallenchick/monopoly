// Audio.js - 音效管理

class Audio {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.loaded = false;
    }

    load() {
        const soundFiles = {
            dice1: 'snd_sys_dice_1.wav',
            dice2: 'snd_sys_dice_2.wav',
            dice3: 'snd_sys_dice_3.wav',
            dice4: 'snd_sys_dice_4.wav',
            dice5: 'snd_sys_dice_5.wav',
            diceEnd1: 'snd_sys_dice_end_1.wav',
            diceEnd2: 'snd_sys_dice_end_2.wav',
            confirm: 'snd_sys_confirm.wav',
            cashGain: 'snd_sys_cash_gain_big.wav',
            cashLose: 'snd_sys_cash_loose_big.wav',
            jail: 'snd_sys_jail.wav',
            jailLeave: 'snd_sys_jail_leave.wav',
            passGo: 'snd_sys_passgo.wav',
            card: 'snd_sys_card_chest.wav'
        };

        for (const [key, file] of Object.entries(soundFiles)) {
            this.sounds[key] = new window.Audio(`assets/audio/${file}`);
            this.sounds[key].preload = 'auto';
        }

        this.loaded = true;
    }

    play(name) {
        if (!this.enabled || !this.loaded) return;

        try {
            // 骰子滚动随机选一个
            if (name === 'dice') {
                const diceNum = Math.floor(Math.random() * 5) + 1;
                const sound = this.sounds[`dice${diceNum}`];
                if (sound) {
                    sound.currentTime = 0;
                    sound.play().catch(() => {});
                }
                return;
            }

            // 骰子结束随机选一个
            if (name === 'diceEnd') {
                const endNum = Math.floor(Math.random() * 2) + 1;
                const sound = this.sounds[`diceEnd${endNum}`];
                if (sound) {
                    sound.currentTime = 0;
                    sound.play().catch(() => {});
                }
                return;
            }

            // 其他音效
            const sound = this.sounds[name];
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(() => {});
            }
        } catch (e) {
            console.warn('Audio play error:', e);
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// 全局音效管理器
const audio = new Audio();
