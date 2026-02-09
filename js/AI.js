// AI.js - AI 玩家逻辑

class AIPlayer extends Player {
    constructor(id, name, token) {
        super(id, name, token);
        this.isAI = true;
        this.turnsSinceLastTrade = 0;  // 距上次交易的回合数
        this.tradeInterval = 3;        // 每3-4回合尝试交易
    }

    /**
     * ========== 1. 购买决策 ==========
     * 规则：如果 AI现金 > 地产价格 > 所有对手现金，则不买进拍卖
     * 否则直接购买
     */
    decidePurchase(property, allPlayers) {
        const price = property.price;
        
        // 买不起
        if (this.money < price) {
            return { action: 'CANNOT_AFFORD' };
        }
        
        // 获取所有对手的现金
        const opponents = allPlayers.filter(p => p !== this && !p.bankrupt);
        const maxOpponentCash = Math.max(...opponents.map(p => p.money), 0);
        
        // 如果 AI现金 > 价格 > 所有对手现金 → 不买，进拍卖捡漏
        if (this.money > price && price > maxOpponentCash) {
            console.log(`[AI] ${this.name}: 选择拍卖 ${property.name}（对手最多 $${maxOpponentCash}，可能低价拿下）`);
            return { action: 'AUCTION' };
        }
        
        // 否则直接购买
        console.log(`[AI] ${this.name}: 购买 ${property.name} ($${price})`);
        return { action: 'BUY' };
    }

    /**
     * ========== 2. 拍卖出价 ==========
     * 规则：每次 +$10，上限 = min(地产价值+10, 我的现金)
     */
    decideAuctionBid(property, currentBid) {
        const maxBid = Math.min(property.price + 10, this.money);
        const myBid = currentBid + 10;
        
        if (myBid <= maxBid) {
            console.log(`[AI] ${this.name}: 拍卖出价 $${myBid}（上限 $${maxBid}）`);
            return myBid;
        }
        
        console.log(`[AI] ${this.name}: 放弃竞拍（当前 $${currentBid}，超过上限 $${maxBid}）`);
        return 0;  // 放弃
    }

    /**
     * ========== 3. 交易决策 ==========
     */
    
    /**
     * 检查是否应该发起交易（每3-4回合）
     */
    shouldInitiateTrade() {
        this.turnsSinceLastTrade++;
        if (this.turnsSinceLastTrade >= this.tradeInterval) {
            // 随机3-4回合
            this.tradeInterval = 3 + Math.floor(Math.random() * 2);
            return true;
        }
        return false;
    }

    /**
     * 检查地产是否属于已凑齐的套组（不可出售）
     */
    isPropertyInCompletedSet(property) {
        // 铁路：检查是否拥有所有4条
        if (property.type === 'RAILROAD') {
            return this.getOwnedRailroads() === 4;
        }
        
        // 街道：检查是否拥有整个颜色组
        if (property.type === 'STREET') {
            return this.ownsColorGroup(property.color);
        }
        
        return false;
    }

    /**
     * 检查地产是否能帮对手凑齐套组
     */
    wouldCompleteOpponentSet(property, opponent) {
        if (property.type === 'STREET') {
            const groupPositions = COLOR_GROUPS[property.color];
            if (!groupPositions) return false;
            
            // 对手拥有的同色地产数量
            const opponentOwned = opponent.properties.filter(p => 
                p.color === property.color
            ).length;
            
            // 如果对手已有 (总数-1) 块，这块会帮他凑齐
            return opponentOwned === groupPositions.length - 1;
        }
        
        if (property.type === 'RAILROAD') {
            // 对手拥有的铁路数量
            const opponentRailroads = opponent.getOwnedRailroads();
            // 如果对手已有3条，这条会帮他凑齐
            return opponentRailroads === 3;
        }
        
        return false;
    }

    /**
     * 计算地产价值（用于交易估值）
     */
    evaluatePropertyValue(property, forOpponent = null) {
        let value = property.price;
        
        // 加上房屋价值（卖出价 = 建造费 / 2）
        if (property.type === 'STREET' && property.houses > 0) {
            value += property.houses * Math.floor(property.houseCost / 2);
        }
        if (property.hasHotel) {
            value += Math.floor(property.houseCost * 5 / 2);
        }
        
        // 如果能帮对手凑齐套组，价值 ×1.5（中式盖房规则下不适用）
        if (forOpponent && !this.isChineseBuilding && this.wouldCompleteOpponentSet(property, forOpponent)) {
            value = Math.floor(value * 1.5);
        }
        
        return value;
    }

    /**
     * 获取可交易的地产（排除已凑齐套组）
     */
    getTradableProperties() {
        return this.properties.filter(p => !this.isPropertyInCompletedSet(p));
    }

    /**
     * 尝试发起交易
     * 返回交易提案或 null
     */
    proposeTrade(allPlayers) {
        if (!this.shouldInitiateTrade()) {
            return null;
        }
        
        this.turnsSinceLastTrade = 0;
        
        const myTradable = this.getTradableProperties();
        if (myTradable.length === 0) return null;
        
        const opponents = allPlayers.filter(p => p !== this && !p.bankrupt);
        
        for (const opponent of opponents) {
            const theirTradable = opponent.properties.filter(p => {
                // 对手也不会卖掉自己凑齐的套组
                if (p.type === 'RAILROAD' && opponent.getOwnedRailroads() === 4) return false;
                if (p.type === 'STREET' && opponent.ownsColorGroup(p.color)) return false;
                return true;
            });
            
            if (theirTradable.length === 0) continue;
            
            // 寻找等价交换
            for (const myProp of myTradable) {
                const myValue = this.evaluatePropertyValue(myProp, opponent);
                
                for (const theirProp of theirTradable) {
                    const theirValue = this.evaluatePropertyValue(theirProp, this);
                    const diff = Math.abs(myValue - theirValue);
                    
                    // 等价交换（差距 ≤ $10）
                    if (diff <= 10) {
                        console.log(`[AI] ${this.name}: 提议用 ${myProp.name}($${myValue}) 换 ${opponent.name} 的 ${theirProp.name}($${theirValue})`);
                        return {
                            from: this,
                            to: opponent,
                            fromProps: [myProp],
                            toProps: [theirProp],
                            fromMoney: myValue < theirValue ? theirValue - myValue : 0,
                            toMoney: theirValue < myValue ? myValue - theirValue : 0
                        };
                    }
                    
                    // 地产+钱 换 地产（差距 ≤ $200 且 AI 有足够现金）
                    if (theirValue > myValue && theirValue - myValue <= 200) {
                        const cashNeeded = theirValue - myValue;
                        if (this.money >= cashNeeded + 100) {  // 保留$100
                            console.log(`[AI] ${this.name}: 提议用 ${myProp.name} + $${cashNeeded} 换 ${theirProp.name}`);
                            return {
                                from: this,
                                to: opponent,
                                fromProps: [myProp],
                                toProps: [theirProp],
                                fromMoney: cashNeeded,
                                toMoney: 0
                            };
                        }
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * 评估并决定是否接受交易提案
     */
    evaluateTradeOffer(offer) {
        // 计算我方获得的价值
        let gainValue = offer.toMoney || 0;
        for (const prop of (offer.toProps || [])) {
            gainValue += this.evaluatePropertyValue(prop, this);
        }
        
        // 计算我方付出的价值
        let loseValue = offer.fromMoney || 0;
        for (const prop of (offer.fromProps || [])) {
            // 检查是否会破坏已凑齐的套组
            if (this.isPropertyInCompletedSet(prop)) {
                console.log(`[AI] ${this.name}: 拒绝交易（会破坏已凑齐的 ${prop.color || '铁路'} 套组）`);
                return false;
            }
            loseValue += this.evaluatePropertyValue(prop, offer.to);
        }
        
        // 允许小亏（≤ 10%）
        if (gainValue >= loseValue * 0.9) {
            console.log(`[AI] ${this.name}: 接受交易（获得 $${gainValue} vs 付出 $${loseValue}）`);
            return true;
        }
        
        console.log(`[AI] ${this.name}: 拒绝交易（获得 $${gainValue} < 付出 $${loseValue}）`);
        return false;
    }

    /**
     * ========== 4. 收购决策 ==========
     * 规则：现金 > $1000 时收购
     */
    decideBuyout(property, buyoutPrice) {
        if (this.money > 1000 && this.money >= buyoutPrice) {
            console.log(`[AI] ${this.name}: 收购 ${property.name}（$${buyoutPrice}）`);
            return true;
        }
        console.log(`[AI] ${this.name}: 不收购 ${property.name}（现金 $${this.money} 不足）`);
        return false;
    }

    /**
     * ========== 5. 建房决策 ==========
     * 美式规则：(现金-100) >= 整套建房费才建，优先便宜的
     * 中式规则：能建就建
     */
    decideBuild(buildableProperties, isChineseRules = false) {
        if (buildableProperties.length === 0) return null;
        
        if (isChineseRules) {
            // 中式规则：只要可能就建
            // 选择最便宜的
            const sorted = [...buildableProperties].sort((a, b) => a.houseCost - b.houseCost);
            const target = sorted[0];
            
            if (this.money >= target.houseCost) {
                console.log(`[AI] ${this.name}: 中式建房 ${target.name}（$${target.houseCost}）`);
                return target;
            }
            return null;
        }
        
        // 美式规则：需要能给整套都加盖房屋
        // 按颜色组检查
        const colorGroups = {};
        for (const prop of buildableProperties) {
            if (!colorGroups[prop.color]) {
                colorGroups[prop.color] = [];
            }
            colorGroups[prop.color].push(prop);
        }
        
        // 找到可以整套建房的组
        for (const [color, props] of Object.entries(colorGroups)) {
            // 获取整组的地产
            const groupPositions = COLOR_GROUPS[color];
            if (!groupPositions) continue;
            
            // 计算给整组每块地加盖1栋房的总费用
            const houseCost = props[0].houseCost;
            const totalCost = groupPositions.length * houseCost;
            
            // 美式规则：(现金-100) >= 整套建房费
            if (this.money - 100 >= totalCost) {
                // 选择该组中房屋数最少的（均衡发展）
                const sorted = [...props].sort((a, b) => 
                    (a.hasHotel ? 5 : a.houses) - (b.hasHotel ? 5 : b.houses)
                );
                const target = sorted[0];
                console.log(`[AI] ${this.name}: 美式建房 ${target.name}（现金 $${this.money}，整套费用 $${totalCost}）`);
                return target;
            }
        }
        
        console.log(`[AI] ${this.name}: 暂不建房（现金不足或无法整套建）`);
        return null;
    }

    /**
     * ========== 6. 监狱决策 ==========
     * 规则：优先用出狱卡 → 保释金，最快脱离
     */
    decideJailAction() {
        // 优先使用出狱卡
        if (this.getOutOfJailCards > 0) {
            console.log(`[AI] ${this.name}: 使用出狱卡`);
            return 'card';
        }
        
        // 其次支付保释金
        if (this.money >= 50) {
            console.log(`[AI] ${this.name}: 支付 $50 保释`);
            return 'pay';
        }
        
        // 没钱只能掷骰子
        console.log(`[AI] ${this.name}: 掷骰子尝试出狱`);
        return 'roll';
    }

    /**
     * 执行完整的 AI 回合
     * 这个方法被 Game.js 调用来自动执行 AI 的所有决策
     */
    async executeTurn(game) {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        
        // 保存游戏规则供估值使用
        this.isChineseBuilding = game.houseRules.chineseBuilding;
        
        // 短暂延迟，让玩家能看到 AI 在"思考"
        await delay(500);
        
        // 监狱处理
        if (this.inJail) {
            const jailAction = this.decideJailAction();
            if (jailAction === 'card') {
                this.useGetOutOfJailCard();
                game.chanceDeck.returnJailFreeCard();
                game.chestDeck.returnJailFreeCard();
                game.ui.showMessage(`${this.name} 使用出狱卡！`);
                game.render();
                await delay(800);
            } else if (jailAction === 'pay') {
                this.deductMoney(50);
                this.leaveJail();
                game.ui.showMessage(`${this.name} 支付 $50 出狱`);
                game.render();
                await delay(800);
            }
            // 如果选择 roll，会在后面的掷骰子逻辑中处理
        }
        
        // 如果还在监狱（选择了 roll 或者没钱），需要掷骰子
        if (this.inJail) {
            const result = await game.dice.roll();
            game.ui.showMessage(`${this.name} 掷出 ${result.die1} + ${result.die2}${result.isDouble ? ' - 双数出狱！' : ''}`);
            await delay(800);
            
            if (result.isDouble) {
                this.leaveJail();
                game.hasRolled = true;
                game.canRollAgain = false;
                await game.movePlayer(result.total);
            } else {
                this.jailTurns++;
                if (this.jailTurns >= 3) {
                    game.ui.showMessage(`${this.name} 三次机会用完，强制支付 $50 出狱`);
                    this.deductMoney(50);
                    this.leaveJail();
                    game.hasRolled = true;
                    await game.movePlayer(result.total);
                } else {
                    game.hasRolled = true;
                    game.canRollAgain = false;
                }
            }
            game.render();
            return;
        }
        
        // 正常掷骰子
        let keepRolling = true;
        while (keepRolling) {
            const result = await game.dice.roll();
            game.ui.showMessage(`${this.name} 掷出 ${result.die1} + ${result.die2} = ${result.total}${result.isDouble ? ' (双数！)' : ''}`);
            await delay(600);
            
            // 连续双数检查
            if (result.isDouble) {
                this.doublesCount++;
                if (this.doublesCount >= 3) {
                    game.ui.showMessage(`${this.name} 连续三次双数，入狱！`);
                    this.goToJail();
                    game.render();
                    return;
                }
            } else {
                this.doublesCount = 0;
                keepRolling = false;
            }
            
            game.hasRolled = true;
            game.hasMovedThisTurn = true;
            
            // 移动前清除待购买状态
            game.pendingAction = null;
            
            await game.movePlayer(result.total);
            await delay(400);
            
            // 处理落点后的购买决策
            if (game.pendingAction?.type === 'BUY') {
                const property = game.pendingAction.property;
                const decision = this.decidePurchase(property, game.players);
                
                if (decision.action === 'BUY') {
                    this.deductMoney(property.price);
                    this.acquireProperty(property);
                    audio.play('confirm');
                    game.ui.showMessage(`${this.name} 购买了 ${property.name}`);
                    game.boughtThisTurnPositions.push(property.position);
                } else if (decision.action === 'AUCTION') {
                    game.ui.showMessage(`${this.name} 选择拍卖 ${property.name}`);
                    await delay(500);
                    await this.handleAIAuction(game, property);
                }
                
                game.pendingAction = null;
                game.render();
                await delay(400);
            }
            
            // 建房决策
            await this.handleAIBuild(game);
            
            // 交易决策
            const tradeOffer = this.proposeTrade(game.players);
            if (tradeOffer) {
                await this.handleAITrade(game, tradeOffer);
            }
            
            // 检查是否可以继续掷（双数）
            if (!result.isDouble) {
                keepRolling = false;
            } else {
                await delay(500);
            }
        }
        
        game.render();
    }

    /**
     * AI 处理拍卖
     */
    async handleAIAuction(game, property) {
        // 简化版拍卖：所有玩家轮流出价
        let currentBid = Math.floor(property.price / 2);
        let highestBidder = null;
        let activeBidders = game.players.filter(p => !p.bankrupt);
        let passCount = 0;
        
        while (passCount < activeBidders.length) {
            for (const player of activeBidders) {
                if (player.isAI) {
                    const bid = player.decideAuctionBid(property, currentBid);
                    if (bid > currentBid) {
                        currentBid = bid;
                        highestBidder = player;
                        passCount = 0;
                        game.ui.showMessage(`${player.name} 出价 $${bid}`);
                        await new Promise(r => setTimeout(r, 300));
                    } else {
                        passCount++;
                    }
                } else {
                    // 人类玩家需要通过 UI 出价
                    // 这里简化处理：显示拍卖模态框
                    const result = await game.ui.showAuctionModal(property, game.players, currentBid);
                    if (result && result.winner && result.bid > currentBid) {
                        currentBid = result.bid;
                        highestBidder = result.winner;
                    }
                    return;  // UI 处理完直接返回
                }
            }
        }
        
        // 拍卖结束
        if (highestBidder) {
            highestBidder.deductMoney(currentBid);
            highestBidder.acquireProperty(property);
            audio.play('confirm');
            game.ui.showMessage(`${highestBidder.name} 以 $${currentBid} 拍得 ${property.name}`);
        } else {
            game.ui.showMessage(`${property.name} 无人竞拍`);
        }
    }

    /**
     * AI 处理建房
     */
    async handleAIBuild(game) {
        const isChineseRules = game.houseRules.chineseBuilding;
        
        // 中式规则：本回合已建房则不能再建
        if (isChineseRules && game.hasBuiltThisTurn) return;
        
        let buildable = game.getBuildableForCurrentPlayer();
        
        while (buildable.length > 0) {
            const target = this.decideBuild(buildable, isChineseRules);
            if (!target) break;
            
            this.deductMoney(target.houseCost);
            target.buildHouse();
            audio.play('confirm');
            const level = target.hasHotel ? '酒店' : `${target.houses} 栋房屋`;
            game.ui.showMessage(`${this.name} 在 ${target.name} 建造了${level}`);
            
            if (isChineseRules) {
                game.hasBuiltThisTurn = true;
                break;  // 中式规则每回合只能建一次
            }
            
            game.render();
            await new Promise(r => setTimeout(r, 400));
            
            // 重新获取可建造列表
            buildable = game.getBuildableForCurrentPlayer();
        }
    }

    /**
     * AI 处理交易
     */
    async handleAITrade(game, offer) {
        const opponent = offer.to;
        
        // 如果对手是 AI，自动评估
        if (opponent.isAI) {
            const accepted = opponent.evaluateTradeOffer({
                fromProps: offer.toProps,
                toProps: offer.fromProps,
                fromMoney: offer.toMoney,
                toMoney: offer.fromMoney,
                to: this
            });
            
            if (accepted) {
                // 执行交易
                this.executeTradeOffer(offer);
                game.ui.showMessage(`${this.name} 与 ${opponent.name} 完成交易！`);
            } else {
                game.ui.showMessage(`${opponent.name} 拒绝了 ${this.name} 的交易提议`);
            }
        } else {
            // 对手是人类，显示交易界面
            const result = await game.ui.showTradeOfferModal(offer);
            if (result?.accepted) {
                this.executeTradeOffer(offer);
                game.ui.showMessage('交易完成！');
            } else {
                game.ui.showMessage(`${opponent.name} 拒绝了交易`);
            }
        }
        
        game.render();
    }

    /**
     * 执行交易
     */
    executeTradeOffer(offer) {
        const { from, to, fromProps, toProps, fromMoney, toMoney } = offer;
        
        // 转移现金
        if (fromMoney > 0) {
            from.money -= fromMoney;
            to.money += fromMoney;
        }
        if (toMoney > 0) {
            to.money -= toMoney;
            from.money += toMoney;
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
    }
}

// COLOR_GROUPS 在 properties.js 中定义（小写颜色名）
