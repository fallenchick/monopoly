// Game.js - 游戏主控制器（状态机）

class Game {
    constructor() {
        // 状态
        this.state = 'SETUP';  // 'SETUP' | 'ROLLING' | 'MOVING' | 'ACTION' | 'END'
        this.players = [];
        this.currentPlayerIndex = 0;
        this.board = null;
        this.dice = null;
        this.ui = null;
        this.chanceDeck = null;
        this.chestDeck = null;
        this.cardExecutor = null;

        // 回合状态
        this.hasRolled = false;
        this.canRollAgain = false;
        this.pendingAction = null;
    }

    /**
     * 初始化游戏
     * @param {Array<{name: string, token: string}>} playerData
     * @param {string} cityId - 城市ID
     * @param {object} houseRules - 可选规则
     */
    init(playerData, cityId = 'atlantic', houseRules = {}) {
        // 保存城市信息
        this.cityId = cityId;
        this.cityInfo = getCityInfo(cityId);
        
        // 保存可选规则
        this.houseRules = {
            doubleGo: houseRules.doubleGo || false,
            chineseBuilding: houseRules.chineseBuilding || false,
            buyout: houseRules.buyout || false
        };
        
        // 创建玩家
        this.players = playerData.map((data, index) => 
            new Player(index, data.name, data.token)
        );

        // 初始化组件（传入城市ID给Board）
        this.board = new Board(cityId);
        this.dice = new Dice();
        this.ui = new UI();
        this.chanceDeck = new CardDeck(CHANCE_CARDS, 'CHANCE');
        this.chestDeck = new CardDeck(CHEST_CARDS, 'CHEST');
        this.cardExecutor = new CardExecutor(this);
        
        // 设置卡组的游戏引用（用于动态地名）
        this.chanceDeck.setGame(this);
        this.chestDeck.setGame(this);
        
        // 特殊状态：双倍铁路租金（机会卡效果）
        this.doubleRailroadRent = false;
        // 特殊状态：公用事业10倍（机会卡效果）
        this.utilityMultiplier = 0;

        // 加载音效
        audio.load();

        // 显示游戏界面
        this.ui.showGame();

        // 初始渲染
        this.render();

        // 绑定事件
        this.bindEvents();

        // 开始游戏
        this.state = 'ROLLING';
        this.startTurn();
    }

    /**
     * 绑定UI事件
     */
    bindEvents() {
        this.ui.btnRoll.onclick = () => this.handleRoll();
        this.ui.btnBuy.onclick = () => this.handleBuy();
        this.ui.btnBuild.onclick = () => this.handleBuild();
        this.ui.btnTrade.onclick = () => this.handleTrade();
        this.ui.btnMortgage.onclick = () => this.handleMortgage();
        this.ui.btnEndTurn.onclick = () => this.endTurn();

        document.getElementById('restart-btn').onclick = () => location.reload();
    }

    /**
     * 获取当前玩家
     * @returns {Player}
     */
    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    /**
     * 获取所有活跃玩家
     * @returns {Player[]}
     */
    getActivePlayers() {
        return this.players.filter(p => !p.bankrupt);
    }

    /**
     * 开始回合
     */
    startTurn() {
        const player = this.getCurrentPlayer();
        
        if (player.bankrupt) {
            this.nextPlayer();
            return;
        }

        this.hasRolled = false;
        this.canRollAgain = false;
        this.pendingAction = null;
        
        // 中式盖房规则：本回合状态
        this.hasBuiltThisTurn = false;        // 本回合是否已建房
        this.hasMovedThisTurn = false;        // 本回合是否已移动（只有移动后才能建房）
        this.boughtThisTurnPositions = [];    // 本回合购买的地产位置

        this.ui.updateCurrentTurn(player);
        this.ui.showMessage('请掷骰子');
        this.updateButtons();
    }

    /**
     * 处理掷骰子
     */
    async handleRoll() {
        const player = this.getCurrentPlayer();

        // 监狱处理
        if (player.inJail) {
            await this.handleJailTurn();
            return;
        }

        if (this.hasRolled && !this.canRollAgain) return;

        this.state = 'ROLLING';
        this.updateButtons();

        const result = await this.dice.roll();
        this.ui.showMessage(`掷出了 ${result.die1} + ${result.die2} = ${result.total}${result.isDouble ? ' (双数！)' : ''}`);

        // 连续双数检查
        if (result.isDouble) {
            player.doublesCount++;
            if (player.doublesCount >= 3) {
                this.ui.showMessage('连续三次双数，入狱！');
                player.goToJail();
                this.hasRolled = true;
                this.canRollAgain = false;
                this.render();
                this.updateButtons();
                return;
            }
            this.canRollAgain = true;
        } else {
            player.doublesCount = 0;
            this.canRollAgain = false;
        }

        this.hasRolled = true;
        
        // 移动前清除待购买状态（离开当前格子就不能再买了）
        this.pendingAction = null;
        
        await this.movePlayer(result.total);
    }

    /**
     * 处理监狱回合
     */
    async handleJailTurn() {
        const player = this.getCurrentPlayer();
        const choice = await this.ui.showJailModal(player);

        if (choice === 'pay') {
            if (player.canAfford(50)) {
                player.deductMoney(50);
                player.leaveJail();
                this.ui.showMessage('支付 $50 出狱，请掷骰子');
                this.render();
                this.updateButtons();
                // 让玩家手动点击掷骰子
            } else {
                this.ui.showMessage('资金不足！');
            }
            return;
        }

        if (choice === 'card') {
            if (player.useGetOutOfJailCard()) {
                // 归还出狱卡到牌堆
                this.chanceDeck.returnJailFreeCard();
                this.chestDeck.returnJailFreeCard();
                this.ui.showMessage('使用出狱卡！请掷骰子');
                this.render();
                this.updateButtons();
                // 让玩家手动点击掷骰子
            }
            return;
        }

        // 掷骰子尝试
        const result = await this.dice.roll();
        this.ui.showMessage(`掷出了 ${result.die1} + ${result.die2}${result.isDouble ? ' - 双数！出狱！' : ''}`);

        if (result.isDouble) {
            player.leaveJail();
            this.hasRolled = true;
            this.canRollAgain = false;
            await this.movePlayer(result.total);
        } else {
            player.jailTurns++;
            if (player.jailTurns >= 3) {
                this.ui.showMessage('三次机会用完，强制支付 $50 出狱');
                player.deductMoney(50);
                player.leaveJail();
                this.hasRolled = true;
                await this.movePlayer(result.total);
            } else {
                this.hasRolled = true;
                this.canRollAgain = false;
                this.updateButtons();
            }
        }
        this.render();
    }

    /**
     * 移动玩家
     * @param {number} steps
     */
    async movePlayer(steps) {
        const player = this.getCurrentPlayer();
        const oldPosition = player.position;
        const newPosition = (oldPosition + steps) % 40;

        // 检查是否经过起点
        if (newPosition < oldPosition && newPosition !== 0) {
            player.addMoney(200);
            audio.play('passGo');
            this.ui.showMessage('经过起点，收取 $200！');
        }

        this.state = 'MOVING';
        
        // 移动动画
        await this.board.animateMove(player, oldPosition, newPosition);
        player.position = newPosition;
        
        // 标记本回合已移动（中式盖房规则用）
        this.hasMovedThisTurn = true;

        // 如果正好落在起点
        if (newPosition === 0 && oldPosition !== 0) {
            const goBonus = this.houseRules.doubleGo ? 400 : 200;
            player.addMoney(goBonus);
            audio.play('passGo');
            if (this.houseRules.doubleGo) {
                this.ui.showMessage('正好落在起点！双倍奖励 $400！');
            }
        }

        this.render();
        await this.handleLanding();
    }

    /**
     * 处理落点
     */
    async handleLanding() {
        const player = this.getCurrentPlayer();
        const tileInfo = this.board.getTileInfo(player.position);

        this.state = 'ACTION';

        switch (tileInfo.type) {
            case 'PROPERTY':
                await this.handlePropertyLanding(tileInfo.property);
                break;
            case 'CHANCE':
                await this.handleCardLanding('CHANCE');
                break;
            case 'CHEST':
                await this.handleCardLanding('CHEST');
                break;
            case 'TAX':
                player.deductMoney(tileInfo.amount);
                this.ui.showMessage(`支付${tileInfo.name} $${tileInfo.amount}`);
                break;
            case 'GO_TO_JAIL':
                player.goToJail();
                this.ui.showMessage('入狱！');
                this.canRollAgain = false;
                break;
            case 'GO':
            case 'JAIL':
            case 'FREE_PARKING':
                // 无特殊效果
                break;
        }

        this.render();
        this.checkBankruptcy();
        this.updateButtons();
    }

    /**
     * 处理地产落点
     * @param {Property} property
     */
    async handlePropertyLanding(property) {
        const player = this.getCurrentPlayer();

        if (!property.owner) {
            // 无人拥有
            if (player.canAfford(property.price)) {
                this.pendingAction = { type: 'BUY', property };
                this.ui.showMessage(`${property.name}，价格 $${property.price}`);
            } else {
                this.ui.showMessage(`${property.name}，资金不足`);
            }
        } else if (property.owner !== player) {
            // 他人拥有
            if (!property.isMortgaged) {
                const rent = this.calculateRent(property);
                // 显示双倍租金提示
                let rentMsg = `支付租金 $${rent} 给 ${property.owner.name}`;
                if (this.doubleRailroadRent && property.type === 'RAILROAD') {
                    rentMsg = `支付双倍租金 $${rent} 给 ${property.owner.name}`;
                }
                if (this.utilityMultiplier && property.type === 'UTILITY') {
                    rentMsg = `支付 ${this.utilityMultiplier}倍骰子点数 = $${rent} 给 ${property.owner.name}`;
                }
                this.ui.showMessage(rentMsg);
                player.deductMoney(rent);
                property.owner.addMoney(rent);
                
                // 收购规则：交完租金后可选择收购（酒店除外）
                if (this.houseRules.buyout && !property.hasHotel) {
                    await this.offerBuyout(property, player);
                }
            } else {
                this.ui.showMessage(`${property.name} 已抵押，无需付租`);
            }
        } else {
            this.ui.showMessage(`回到自己的地产 ${property.name}`);
        }
    }

    /**
     * 计算收购价格
     * @param {Property} property
     * @returns {number}
     */
    calculateBuyoutPrice(property) {
        let value = property.price;
        
        // 加上房屋价值
        if (property.type === 'STREET' && property.houses > 0) {
            value += property.houses * property.houseCost;
        }
        
        // 双倍价格
        return value * 2;
    }

    /**
     * 提供收购选项
     * @param {Property} property
     * @param {Player} buyer
     */
    async offerBuyout(property, buyer) {
        const price = this.calculateBuyoutPrice(property);
        
        // 检查是否买得起
        if (buyer.money < price) {
            return;  // 买不起就不显示选项
        }
        
        const confirm = await this.ui.showBuyoutModal(property, price, buyer, property.owner);
        
        if (confirm) {
            const originalOwner = property.owner;
            
            // 转移现金
            buyer.deductMoney(price);
            originalOwner.addMoney(price);
            
            // 转移地产
            const idx = originalOwner.properties.indexOf(property);
            if (idx > -1) originalOwner.properties.splice(idx, 1);
            property.owner = buyer;
            buyer.properties.push(property);
            
            audio.play('confirm');
            this.ui.showMessage(`${buyer.name} 强制收购了 ${property.name}！`);
            this.render();
        }
    }

    /**
     * 计算租金
     * @param {Property} property
     * @returns {number}
     */
    calculateRent(property) {
        const owner = property.owner;
        const diceTotal = this.dice.getLastRoll().total;
        const ownedRailroads = owner.getOwnedRailroads();
        const ownedUtilities = owner.getOwnedUtilities();
        const ownsGroup = owner.ownsColorGroup(property.color);

        let rent = property.calculateRent(diceTotal, ownedRailroads, ownedUtilities, ownsGroup);
        
        // 机会卡效果：铁路双倍租金
        if (this.doubleRailroadRent && property.type === 'RAILROAD') {
            rent *= 2;
        }
        
        // 机会卡效果：公用事业10倍骰子
        if (this.utilityMultiplier && property.type === 'UTILITY') {
            rent = diceTotal * this.utilityMultiplier;
        }
        
        return rent;
    }

    /**
     * 处理卡片落点
     * @param {string} type
     */
    async handleCardLanding(type) {
        const deck = type === 'CHANCE' ? this.chanceDeck : this.chestDeck;
        const card = deck.draw();

        await this.ui.showCardModal(type, card);

        const player = this.getCurrentPlayer();
        const result = await this.cardExecutor.execute(card, player);

        if (result.takeJailFree) {
            deck.takeJailFreeCard();
        }

        if (result.message) {
            this.ui.showMessage(result.message);
        }

        // 设置特殊租金标志（机会卡效果）
        if (result.doubleRailroadRent) {
            this.doubleRailroadRent = true;
        }
        if (result.utilityMultiplier) {
            this.utilityMultiplier = result.utilityMultiplier;
        }

        // 如果需要处理新落点
        if (result.needsAction) {
            this.render();
            await this.handleLanding();
        }
        
        // 重置特殊租金标志
        this.doubleRailroadRent = false;
        this.utilityMultiplier = 0;
    }

    /**
     * 处理购买
     */
    async handleBuy() {
        if (!this.pendingAction || this.pendingAction.type !== 'BUY') return;

        const property = this.pendingAction.property;
        const player = this.getCurrentPlayer();
        const confirm = await this.ui.showBuyModal(property);

        if (confirm && player.canAfford(property.price)) {
            player.deductMoney(property.price);
            player.acquireProperty(property);
            audio.play('confirm');
            this.ui.showMessage(`购买了 ${property.name}`);
            
            // 记录本回合购买的地产位置（中式盖房规则用）
            this.boughtThisTurnPositions.push(property.position);
        } else if (!confirm) {
            // 玩家选择不买，触发拍卖
            await this.handleAuction(property);
        }

        this.pendingAction = null;
        this.render();
        this.updateButtons();
    }

    /**
     * 处理拍卖
     * @param {Property} property - 要拍卖的地产
     */
    async handleAuction(property) {
        const startingBid = Math.floor(property.price / 2);
        const result = await this.ui.showAuctionModal(property, this.players, startingBid);
        
        if (result && result.winner && result.bid > 0) {
            const winner = result.winner;
            winner.deductMoney(result.bid);
            winner.acquireProperty(property);
            audio.play('confirm');
            this.ui.showMessage(`${winner.name} 以 $${result.bid} 拍得 ${property.name}`);
            
            // 记录本回合购买的地产位置
            if (winner === this.getCurrentPlayer()) {
                this.boughtThisTurnPositions.push(property.position);
            }
        } else {
            this.ui.showMessage(`${property.name} 无人竞拍，归还银行`);
        }
    }

    /**
     * 获取当前可建房的地产（考虑规则限制）
     */
    getBuildableForCurrentPlayer() {
        const player = this.getCurrentPlayer();
        
        if (this.houseRules.chineseBuilding) {
            // 中式规则：本回合未移动则不能建房
            if (!this.hasMovedThisTurn) return [];
            
            // 中式规则：本回合已建房则不能再建
            if (this.hasBuiltThisTurn) return [];
            
            // 获取当前位置可建的地产
            let buildable = player.getBuildablePropertiesChinese(player.position);
            
            // 排除本回合刚买的地产
            buildable = buildable.filter(p => !this.boughtThisTurnPositions.includes(p.position));
            
            return buildable;
        } else {
            return player.getBuildableProperties();
        }
    }

    /**
     * 处理建房
     */
    async handleBuild() {
        const player = this.getCurrentPlayer();
        
        // 根据规则获取可建造的地产
        const buildable = this.getBuildableForCurrentPlayer();

        const property = await this.ui.showBuildModal(buildable, player.money);
        if (property && player.canAfford(property.houseCost)) {
            player.deductMoney(property.houseCost);
            property.buildHouse();
            audio.play('confirm');
            const level = property.hasHotel ? '酒店' : `${property.houses} 栋房屋`;
            this.ui.showMessage(`在 ${property.name} 建造了${level}`);
            
            // 中式盖房规则：本回合已建房
            if (this.houseRules.chineseBuilding) {
                this.hasBuiltThisTurn = true;
            }
        }

        this.render();
        this.updateButtons();
    }

    /**
     * 处理交易
     */
    async handleTrade() {
        const currentPlayer = this.getCurrentPlayer();
        const result = await this.ui.showTradeModal(currentPlayer, this.players);
        
        if (result && result.accepted) {
            // 执行交易
            const { from, to, fromProps, toProps, fromMoney, toMoney } = result;
            
            // 转移现金
            if (fromMoney > 0) {
                from.deductMoney(fromMoney);
                to.addMoney(fromMoney);
            }
            if (toMoney > 0) {
                to.deductMoney(toMoney);
                from.addMoney(toMoney);
            }
            
            // 转移地产
            fromProps.forEach(prop => {
                const idx = from.properties.indexOf(prop);
                if (idx > -1) from.properties.splice(idx, 1);
                prop.owner = to;
                to.properties.push(prop);
            });
            
            toProps.forEach(prop => {
                const idx = to.properties.indexOf(prop);
                if (idx > -1) to.properties.splice(idx, 1);
                prop.owner = from;
                from.properties.push(prop);
            });
            
            audio.play('confirm');
            this.ui.showMessage('交易完成！');
            this.render();
        } else if (result && !result.accepted) {
            this.ui.showMessage('交易被拒绝');
        }
        
        this.updateButtons();
    }

    /**
     * 处理抵押
     */
    async handleMortgage() {
        const player = this.getCurrentPlayer();
        const mortgageable = player.getMortgageableProperties();
        const unmortgageable = player.getUnmortgageableProperties();

        // 同时显示可抵押和可赎回的地产
        const result = await this.ui.showMortgageModal(mortgageable, unmortgageable);
        
        if (result) {
            if (result.action === 'mortgage') {
                const value = result.property.mortgage();
                player.addMoney(value);
                this.ui.showMessage(`抵押 ${result.property.name}，获得 $${value}`);
            } else if (result.action === 'unmortgage') {
                const cost = result.property.getUnmortgageCost();
                player.deductMoney(cost);
                result.property.unmortgage();
                this.ui.showMessage(`赎回 ${result.property.name}，支付 $${cost}`);
            }
        }

        this.render();
        this.updateButtons();
    }

    /**
     * 检查破产
     */
    checkBankruptcy() {
        const player = this.getCurrentPlayer();

        if (player.money < 0) {
            // 第一步：先卖掉所有房子和酒店
            while (player.money < 0) {
                // 找有房子/酒店的地产
                const withBuildings = player.properties.filter(p => 
                    p.type === 'STREET' && (p.houses > 0 || p.hasHotel)
                );
                if (withBuildings.length === 0) break;

                // 卖掉一栋房子
                const prop = withBuildings[0];
                const refund = prop.sellHouse();
                if (refund > 0) {
                    player.money += refund;  // 直接加钱，不触发音效
                    this.ui.showMessage(`${player.name} 卖掉 ${prop.name} 的一栋房屋，获得 $${refund}`);
                }
            }

            // 第二步：抵押地皮
            while (player.money < 0) {
                const mortgageable = player.getMortgageableProperties();
                if (mortgageable.length === 0) break;

                const prop = mortgageable[0];
                const value = prop.mortgage();
                player.money += value;  // 直接加钱，不触发音效
                this.ui.showMessage(`${player.name} 抵押 ${prop.name}，获得 $${value}`);
            }

            // 第三步：仍然还不起，破产
            if (player.money < 0) {
                player.declareBankruptcy();
                this.ui.showMessage(`${player.name} 破产了！`);
                this.checkGameEnd();
            }
        }
    }

    /**
     * 检查游戏结束
     */
    checkGameEnd() {
        const active = this.getActivePlayers();
        if (active.length === 1) {
            this.state = 'END';
            this.ui.showGameOverModal(active[0]);
        }
    }

    /**
     * 结束回合
     */
    endTurn() {
        if (this.canRollAgain) {
            // 还有双数可以再掷
            this.hasRolled = false;
            this.ui.showMessage('双数！可以再掷一次');
            this.updateButtons();
            return;
        }

        this.pendingAction = null;
        this.nextPlayer();
    }

    /**
     * 下一个玩家
     */
    nextPlayer() {
        const active = this.getActivePlayers();
        if (active.length <= 1) {
            this.checkGameEnd();
            return;
        }

        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.getCurrentPlayer().bankrupt);

        this.startTurn();
        this.render();
    }

    /**
     * 更新按钮状态
     */
    updateButtons() {
        const player = this.getCurrentPlayer();
        const canRoll = !this.hasRolled || this.canRollAgain;
        const canBuy = this.pendingAction?.type === 'BUY';
        
        // 根据规则判断是否可以建房
        const canBuild = this.getBuildableForCurrentPlayer().length > 0;
            
        const canMortgage = player.getMortgageableProperties().length > 0 || 
                           player.getUnmortgageableProperties().length > 0;
        const canEndTurn = this.hasRolled && !canRoll;

        this.ui.updateActionButtons({
            canRoll: canRoll && !player.inJail,
            canBuy,
            canBuild,
            canMortgage,
            canEndTurn: canEndTurn || player.inJail
        });

        // 监狱状态特殊处理
        if (player.inJail && !this.hasRolled) {
            this.ui.btnRoll.classList.remove('hidden');
            this.ui.btnRoll.disabled = false;
            this.ui.btnRoll.textContent = '🎲 监狱选项';
        } else {
            this.ui.btnRoll.textContent = '🎲 掷骰子';
        }
    }

    /**
     * 渲染游戏状态
     */
    render() {
        this.board.renderTokens(this.players);
        this.board.renderOwnership(this.players);
        this.ui.renderPlayersBar(this.players, this.currentPlayerIndex);
        this.ui.renderRentPreview(this.getCurrentPlayer(), this.board, this.players);
    }
}

// 全局游戏实例
let game = null;
