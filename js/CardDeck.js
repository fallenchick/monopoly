// CardDeck.js - 机会/命运卡牌组

class CardDeck {
    constructor(cards, type, game = null) {
        this.originalCards = [...cards];
        this.cards = [];
        this.type = type;  // 'CHANCE' | 'CHEST'
        this.jailFreeCardOut = false;  // 出狱卡是否被持有
        this.game = game;  // 用于获取城市地产名称
        
        this.shuffle();
    }

    /**
     * 设置游戏引用（用于动态卡片文本）
     */
    setGame(game) {
        this.game = game;
    }

    /**
     * 获取卡片显示文本（替换动态地名）
     */
    getCardText(card) {
        if (!card.dynamicText || !this.game || !this.game.board) {
            return card.text;
        }
        
        let text = card.text;
        // 替换 {positionXX} 为对应地产名称
        const match = text.match(/\{position(\d+)\}/);
        if (match) {
            const position = parseInt(match[1]);
            const property = this.game.board.getProperty(position);
            const name = property ? property.name : `位置${position}`;
            text = text.replace(match[0], name);
        }
        return text;
    }

    /**
     * 洗牌
     */
    shuffle() {
        this.cards = [...this.originalCards];
        
        // Fisher-Yates 洗牌算法
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * 抽一张卡
     * @returns {object}
     */
    draw() {
        if (this.cards.length === 0) {
            this.shuffle();
        }

        const card = this.cards.shift();
        
        // 出狱卡特殊处理：如果被持有则跳过
        if (card.action === 'JAIL_FREE' && this.jailFreeCardOut) {
            // 放回牌底，抽下一张
            this.cards.push(card);
            return this.draw();
        }

        // 返回带有显示文本的卡片副本
        return {
            ...card,
            displayText: this.getCardText(card)
        };
    }

    /**
     * 标记出狱卡被取走
     */
    takeJailFreeCard() {
        this.jailFreeCardOut = true;
    }

    /**
     * 归还出狱卡
     */
    returnJailFreeCard() {
        this.jailFreeCardOut = false;
    }

    /**
     * 获取卡牌类型的中文名
     */
    getTypeName() {
        return this.type === 'CHANCE' ? '机会' : '命运';
    }

    /**
     * 获取卡牌类型的图标
     */
    getTypeIcon() {
        return this.type === 'CHANCE' ? '❓' : '💰';
    }
}

/**
 * 卡牌效果执行器
 */
class CardExecutor {
    constructor(game) {
        this.game = game;
    }

    /**
     * 执行卡牌效果
     * @param {object} card
     * @param {Player} player
     * @returns {Promise}
     */
    async execute(card, player) {
        switch (card.action) {
            case 'RECEIVE':
                player.addMoney(card.amount);
                return { message: `收取 $${card.amount}` };

            case 'PAY':
                player.deductMoney(card.amount);
                return { message: `支付 $${card.amount}` };

            case 'GOTO':
                return await this.handleGoto(card, player);

            case 'JAIL':
                player.goToJail();
                return { message: '入狱！' };

            case 'JAIL_FREE':
                player.getOutOfJailCards++;
                return { message: '获得出狱免费卡！', takeJailFree: true };

            case 'BACK':
                const newPos = (player.position - card.steps + 40) % 40;
                player.position = newPos;
                return { message: `后退 ${card.steps} 步`, needsAction: true };

            case 'PAY_EACH':
                return this.handlePayEach(card, player);

            case 'RECEIVE_EACH':
                return this.handleReceiveEach(card, player);

            case 'REPAIR':
                return this.handleRepair(card, player);

            case 'NEAREST_RAILROAD':
                return this.handleNearestRailroad(player);

            case 'NEAREST_UTILITY':
                return this.handleNearestUtility(player);

            default:
                return { message: '未知卡牌效果' };
        }
    }

    async handleGoto(card, player) {
        const oldPos = player.position;
        const newPos = card.position;
        
        // 检查是否经过起点
        let passedGo = false;
        if (newPos !== 10 && newPos < oldPos) {  // 10是监狱，不算经过起点
            passedGo = true;
            player.addMoney(200);
            audio.play('passGo');
        }

        player.position = newPos;
        
        return { 
            message: passedGo ? '经过起点，收取 $200' : '',
            needsAction: newPos !== 10  // 监狱不需要处理落点
        };
    }

    handlePayEach(card, player) {
        const activePlayers = this.game.getActivePlayers().filter(p => p !== player);
        const total = card.amount * activePlayers.length;
        
        player.deductMoney(total);
        activePlayers.forEach(p => p.addMoney(card.amount));
        
        return { message: `支付每位玩家 $${card.amount}，共 $${total}` };
    }

    handleReceiveEach(card, player) {
        const activePlayers = this.game.getActivePlayers().filter(p => p !== player);
        
        activePlayers.forEach(p => {
            p.deductMoney(card.amount);
            player.addMoney(card.amount);
        });
        
        return { message: `每位玩家给你 $${card.amount}` };
    }

    handleRepair(card, player) {
        let totalCost = 0;
        
        for (const property of player.properties) {
            const buildings = property.getBuildingCount();
            totalCost += buildings.houses * card.houseCost;
            totalCost += buildings.hotels * card.hotelCost;
        }

        if (totalCost > 0) {
            player.deductMoney(totalCost);
        }
        
        return { message: `维修费用：$${totalCost}` };
    }

    handleNearestRailroad(player) {
        const railroads = [5, 15, 25, 35];
        let nearest = railroads.find(r => r > player.position);
        if (!nearest) nearest = railroads[0];
        
        const passedGo = nearest < player.position;
        if (passedGo) {
            player.addMoney(200);
            audio.play('passGo');
        }
        
        player.position = nearest;
        return { 
            message: passedGo ? '经过起点，收取 $200' : '',
            needsAction: true,
            doubleRailroadRent: true
        };
    }

    handleNearestUtility(player) {
        const utilities = [12, 28];
        let nearest = utilities.find(u => u > player.position);
        if (!nearest) nearest = utilities[0];
        
        const passedGo = nearest < player.position;
        if (passedGo) {
            player.addMoney(200);
            audio.play('passGo');
        }
        
        player.position = nearest;
        return { 
            message: passedGo ? '经过起点，收取 $200' : '',
            needsAction: true,
            utilityMultiplier: 10
        };
    }
}
