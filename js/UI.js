// UI.js - UI交互控制

class UI {
    constructor() {
        this.setupScreen = document.getElementById('setup-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.playersBar = document.getElementById('players-bar');
        this.rentPreview = document.getElementById('rent-preview');
        this.currentTurn = document.getElementById('current-turn');
        this.message = document.getElementById('message');
        
        // 按钮
        this.btnRoll = document.getElementById('btn-roll');
        this.btnBuy = document.getElementById('btn-buy');
        this.btnBuild = document.getElementById('btn-build');
        this.btnTrade = document.getElementById('btn-trade');
        this.btnMortgage = document.getElementById('btn-mortgage');
        this.btnEndTurn = document.getElementById('btn-end-turn');
    }

    /**
     * 显示设置界面
     */
    showSetup() {
        this.setupScreen.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
    }

    /**
     * 显示游戏界面
     */
    showGame() {
        this.setupScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
    }

    /**
     * 初始化玩家设置界面
     * @param {number} count
     */
    initPlayerSetup(count) {
        const container = document.getElementById('player-setup');
        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const row = document.createElement('div');
            row.className = 'player-row';
            row.innerHTML = `
                <input type="text" value="玩家 ${i + 1}" data-player="${i}">
                <div class="token-choices" data-player="${i}">
                    ${TOKENS.map((t, idx) => `
                        <div class="token-choice ${i === idx ? 'selected' : ''}" data-token="${t.id}">
                            <img src="assets/tokens/${t.id}.png" alt="${t.name}">
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(row);
        }

        this.updateTokenAvailability();
    }

    /**
     * 更新棋子可选状态
     */
    updateTokenAvailability() {
        const selected = new Set();
        document.querySelectorAll('.token-choice.selected').forEach(el => {
            selected.add(el.dataset.token);
        });

        document.querySelectorAll('.token-choice').forEach(el => {
            const isSelected = el.classList.contains('selected');
            const tokenId = el.dataset.token;
            el.classList.toggle('disabled', !isSelected && selected.has(tokenId));
        });
    }

    /**
     * 获取玩家设置数据
     * @returns {Array<{name: string, token: string}>}
     */
    getPlayerSetupData() {
        const players = [];
        document.querySelectorAll('.player-row').forEach((row, index) => {
            const name = row.querySelector('input').value || `玩家 ${index + 1}`;
            const token = row.querySelector('.token-choice.selected')?.dataset.token || TOKENS[index].id;
            players.push({ name, token });
        });
        return players;
    }

    /**
     * 渲染玩家信息栏
     * @param {Player[]} players
     * @param {number} currentIndex
     */
    renderPlayersBar(players, currentIndex) {
        this.playersBar.innerHTML = '';

        players.forEach((player, index) => {
            const div = document.createElement('div');
            div.className = `player-info ${index === currentIndex ? 'current' : ''} ${player.bankrupt ? 'bankrupt' : ''}`;
            
            // 地产颜色点（按颜色价值从低到高排序）
            const colorOrder = ['brown', 'lightblue', 'pink', 'orange', 'red', 'yellow', 'green', 'blue', 'railroad', 'utility'];
            const sortedProperties = [...player.properties].sort((a, b) => {
                return colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color);
            });
            const propertyDots = sortedProperties.map(p => 
                `<div class="property-dot color-${p.color}"></div>`
            ).join('');

            const netWorth = player.calculateNetWorth();
            const propertyValue = player.getPropertyValue();
            
            div.innerHTML = `
                <div class="header">
                    <div class="token-icon">
                        <img src="${player.getTokenImagePath()}" alt="">
                    </div>
                    <span class="name">${player.name}</span>
                    ${player.inJail ? '<span class="jail-badge">🔒 监狱</span>' : ''}
                    ${player.getOutOfJailCards > 0 ? '<span class="jail-free-badge">🎫</span>' : ''}
                </div>
                <div class="money">💵 $${player.money}</div>
                <div class="net-worth">📊 总资产: $${netWorth}${propertyValue > 0 ? ` <span class="property-value">(地产 $${propertyValue})</span>` : ''}</div>
                <div class="properties-list">${propertyDots}</div>
            `;

            this.playersBar.appendChild(div);
        });
    }

    /**
     * 渲染租金预览面板
     * 显示当前玩家骰子2-12可能到达的格子及租金
     */
    renderRentPreview(currentPlayer, board, players) {
        if (!this.rentPreview) return;
        
        if (!currentPlayer || currentPlayer.bankrupt) {
            this.rentPreview.innerHTML = '<div class="rent-no-player">无当前玩家</div>';
            return;
        }
        
        if (currentPlayer.inJail) {
            this.rentPreview.innerHTML = '<div class="rent-no-player">🔒 玩家在监狱中</div>';
            return;
        }
        
        let html = '';
        
        for (let dice = 2; dice <= 12; dice++) {
            const targetPos = (currentPlayer.position + dice) % 40;
            const tileInfo = board.getTileInfo(targetPos);
            
            let tileName = '';
            let tileType = '';
            let colorClass = '';
            let rentText = '';
            let rentClass = 'free';
            
            if (tileInfo.type === 'PROPERTY') {
                const prop = tileInfo.property;
                tileName = prop.name;
                colorClass = prop.color ? `color-${prop.color}` : '';
                
                if (prop.type === 'RAILROAD') {
                    tileType = prop.name.includes('机场') ? '✈️ 机场' : '🚂 火车站';
                } else if (prop.type === 'UTILITY') {
                    if (prop.name.includes('世界银行')) tileType = '🏦 国际机构';
                    else if (prop.name.includes('联合国')) tileType = '🌐 国际机构';
                    else tileType = '💡 公用事业';
                } else {
                    tileType = '🏠 街道';
                }
                
                if (!prop.owner) {
                    rentText = '可购买';
                    rentClass = 'safe';
                } else if (prop.owner === currentPlayer) {
                    rentText = '自己的';
                    rentClass = 'safe';
                } else if (prop.isMortgaged) {
                    rentText = '已抵押';
                    rentClass = 'free';
                } else if (prop.owner.bankrupt) {
                    rentText = '无主';
                    rentClass = 'free';
                } else {
                    // 计算租金
                    const owner = prop.owner;
                    const ownedRailroads = owner.getOwnedRailroads();
                    const ownedUtilities = owner.getOwnedUtilities();
                    const ownsGroup = owner.ownsColorGroup(prop.color);
                    const rent = prop.calculateRent(dice, ownedRailroads, ownedUtilities, ownsGroup);
                    
                    if (prop.type === 'UTILITY') {
                        rentText = `$${rent}`;
                    } else {
                        rentText = `$${rent}`;
                    }
                    
                    // 根据租金占现金比例染色
                    const ratio = rent / currentPlayer.money;
                    if (ratio >= 0.5) {
                        rentClass = 'danger';
                    } else if (ratio >= 0.2) {
                        rentClass = 'warning';
                    } else {
                        rentClass = 'safe';
                    }
                }
            } else {
                // 特殊格子
                switch (tileInfo.type) {
                    case 'GO':
                        tileName = '起点';
                        tileType = '💵 收取$200';
                        rentText = '+$200';
                        rentClass = 'safe';
                        break;
                    case 'JAIL':
                        tileName = '监狱';
                        tileType = '👀 只是路过';
                        rentText = '安全';
                        rentClass = 'free';
                        break;
                    case 'FREE_PARKING':
                        tileName = '免费停车';
                        tileType = '🅿️ 休息一下';
                        rentText = '安全';
                        rentClass = 'free';
                        break;
                    case 'GO_TO_JAIL':
                        tileName = '入狱';
                        tileType = '🚔 直接进监狱';
                        rentText = '危险!';
                        rentClass = 'danger';
                        break;
                    case 'CHANCE':
                        tileName = '机会';
                        tileType = '❓ 抽卡';
                        rentText = '?';
                        rentClass = 'warning';
                        break;
                    case 'CHEST':
                        tileName = '命运';
                        tileType = '💰 抽卡';
                        rentText = '?';
                        rentClass = 'warning';
                        break;
                    case 'TAX':
                        tileName = tileInfo.name;
                        tileType = '💸 税';
                        rentText = `-$${tileInfo.amount}`;
                        rentClass = 'danger';
                        break;
                    default:
                        tileName = `位置${targetPos}`;
                        tileType = '';
                        rentText = '-';
                }
            }
            
            html += `
                <div class="rent-row">
                    <span class="dice-num">${dice}</span>
                    <div class="tile-info">
                        <span class="tile-name">
                            ${colorClass ? `<span class="tile-color ${colorClass}"></span>` : ''}
                            ${tileName}
                        </span>
                        <span class="tile-type">${tileType}</span>
                    </div>
                    <span class="rent-amount ${rentClass}">${rentText}</span>
                </div>
            `;
        }
        
        this.rentPreview.innerHTML = html;
    }

    /**
     * 更新当前回合显示
     * @param {Player} player
     */
    updateCurrentTurn(player) {
        this.currentTurn.textContent = `${player.name} 的回合`;
    }

    /**
     * 显示消息
     * @param {string} text
     */
    showMessage(text) {
        this.message.textContent = text;
    }

    /**
     * 更新操作按钮状态
     * @param {object} state
     */
    updateActionButtons(state) {
        this.btnRoll.classList.toggle('hidden', !state.canRoll);
        this.btnBuy.classList.toggle('hidden', !state.canBuy);
        this.btnBuild.classList.toggle('hidden', !state.canBuild);
        this.btnMortgage.classList.toggle('hidden', !state.canMortgage);
        this.btnEndTurn.classList.toggle('hidden', !state.canEndTurn);

        this.btnRoll.disabled = !state.canRoll;
    }

    /**
     * 生成地契卡片HTML
     * @param {Property} property
     * @returns {string}
     */
    generateDeedCard(property) {
        if (property.type === 'RAILROAD') {
            // 判断是机场还是火车站
            const isAirport = property.name.includes('机场');
            const icon = isAirport ? '✈️' : '🚂';
            const title = isAirport ? '机场' : '铁路';
            const unit = isAirport ? '机场' : '铁路';
            return `
                <div class="deed-card railroad">
                    <div class="deed-header" style="background:#333">
                        <div class="deed-title">${title}</div>
                        <div class="deed-name">${property.name}</div>
                    </div>
                    <div class="deed-body">
                        <div class="deed-icon">${icon}</div>
                        <div class="deed-divider"></div>
                        <div class="deed-row"><span>租金</span><span>$${property.rent[0]}</span></div>
                        <div class="deed-row"><span>拥有2个${unit}</span><span>$${property.rent[1]}</span></div>
                        <div class="deed-row"><span>拥有3个${unit}</span><span>$${property.rent[2]}</span></div>
                        <div class="deed-row"><span>拥有4个${unit}</span><span>$${property.rent[3]}</span></div>
                        <div class="deed-divider"></div>
                        <div class="deed-row"><span>抵押价值</span><span>$${property.mortgageValue}</span></div>
                    </div>
                    <div class="deed-footer">价格 $${property.price}</div>
                </div>
            `;
        }
        
        if (property.type === 'UTILITY') {
            // 根据名称选择图标和标题
            let icon = '💡';
            let title = '公用事业';
            let desc = '公用事业';
            if (property.name.includes('电力')) { icon = '💡'; }
            else if (property.name.includes('水') || property.name.includes('自来水')) { icon = '💧'; }
            else if (property.name.includes('世界银行')) { icon = '🏦'; title = '国际机构'; desc = '机构'; }
            else if (property.name.includes('联合国')) { icon = '🌐'; title = '国际机构'; desc = '机构'; }
            return `
                <div class="deed-card utility">
                    <div class="deed-header" style="background:#555">
                        <div class="deed-title">${title}</div>
                        <div class="deed-name">${property.name}</div>
                    </div>
                    <div class="deed-body">
                        <div class="deed-icon">${icon}</div>
                        <div class="deed-divider"></div>
                        <div style="text-align:center;font-size:10px;line-height:1.5">
                            拥有1个${desc}：<br>租金为骰子点数×4<br><br>
                            拥有2个${desc}：<br>租金为骰子点数×10
                        </div>
                        <div class="deed-divider"></div>
                        <div class="deed-row"><span>抵押价值</span><span>$${property.mortgageValue}</span></div>
                    </div>
                    <div class="deed-footer">价格 $${property.price}</div>
                </div>
            `;
        }
        
        // 街道地产
        return `
            <div class="deed-card street">
                <div class="deed-header ${property.color}">
                    <div class="deed-title">地契</div>
                    <div class="deed-name">${property.name}</div>
                </div>
                <div class="deed-body">
                    <div class="deed-row"><span>租金</span><span>$${property.rent[0]}</span></div>
                    <div class="deed-row"><span>1栋房屋</span><span>$${property.rent[1]}</span></div>
                    <div class="deed-row"><span>2栋房屋</span><span>$${property.rent[2]}</span></div>
                    <div class="deed-row"><span>3栋房屋</span><span>$${property.rent[3]}</span></div>
                    <div class="deed-row"><span>4栋房屋</span><span>$${property.rent[4]}</span></div>
                    <div class="deed-row"><span>酒店</span><span>$${property.rent[5]}</span></div>
                    <div class="deed-divider"></div>
                    <div class="deed-row"><span>建房费用</span><span>$${property.houseCost}</span></div>
                    <div class="deed-row"><span>抵押价值</span><span>$${property.mortgageValue}</span></div>
                    <div class="deed-divider"></div>
                    <div class="deed-section-title">拥有全部同色地产，租金翻倍</div>
                </div>
                <div class="deed-footer">价格 $${property.price}</div>
            </div>
        `;
    }

    /**
     * 显示购买弹窗
     * @param {Property} property
     * @returns {Promise<boolean>}
     */
    showBuyModal(property) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-buy');
            
            // 隐藏标题和价格（卡片自带）
            document.getElementById('buy-title').style.display = 'none';
            document.getElementById('buy-price').style.display = 'none';
            
            // 用自绘地契卡片替换图片
            const cardContainer = document.getElementById('buy-card-container');
            cardContainer.innerHTML = this.generateDeedCard(property);

            modal.classList.remove('hidden');

            const confirmBtn = document.getElementById('buy-confirm');
            const cancelBtn = document.getElementById('buy-cancel');

            const cleanup = () => {
                modal.classList.add('hidden');
                confirmBtn.onclick = null;
                cancelBtn.onclick = null;
            };

            confirmBtn.onclick = () => { cleanup(); resolve(true); };
            cancelBtn.onclick = () => { cleanup(); resolve(false); };
        });
    }

    /**
     * 显示卡片弹窗
     * @param {string} type - 'CHANCE' | 'CHEST'
     * @param {object} card
     * @returns {Promise}
     */
    showCardModal(type, card) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-card');
            document.getElementById('card-icon').textContent = type === 'CHANCE' ? '❓' : '💰';
            document.getElementById('card-type').textContent = type === 'CHANCE' ? '机会' : '命运';
            document.getElementById('card-text').textContent = card.displayText || card.text;

            modal.classList.remove('hidden');
            
            audio.play('card');

            document.getElementById('card-ok').onclick = () => {
                modal.classList.add('hidden');
                resolve();
            };
        });
    }

    /**
     * 显示建房弹窗
     * @param {Property[]} properties
     * @param {number} playerMoney
     * @returns {Promise<Property|null>}
     */
    showBuildModal(properties, playerMoney) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-build');
            const container = document.getElementById('build-options');
            container.innerHTML = '';

            if (properties.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:#888;">没有可建造的地产</p>';
            } else {
                properties.forEach(prop => {
                    const div = document.createElement('div');
                    div.className = 'build-option';
                    const level = prop.hasHotel ? '酒店' : `${prop.houses} 房`;
                    const nextLevel = prop.houses === 4 ? '酒店' : `${prop.houses + 1} 房`;
                    
                    div.innerHTML = `
                        <div class="color-bar color-${prop.color}"></div>
                        <div class="name">${prop.name}</div>
                        <div class="info">${level} → ${nextLevel}</div>
                        <div class="info">费用: $${prop.houseCost}</div>
                    `;
                    
                    div.onclick = () => {
                        modal.classList.add('hidden');
                        resolve(prop);
                    };
                    
                    container.appendChild(div);
                });
            }

            modal.classList.remove('hidden');

            document.getElementById('build-close').onclick = () => {
                modal.classList.add('hidden');
                resolve(null);
            };
        });
    }

    /**
     * 显示抵押/赎回弹窗
     * @param {Property[]} mortgageable - 可抵押的地产
     * @param {Property[]} unmortgageable - 可赎回的地产
     * @returns {Promise<{action: string, property: Property}|null>}
     */
    showMortgageModal(mortgageable, unmortgageable) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-mortgage');
            const title = document.getElementById('mortgage-title');
            const container = document.getElementById('mortgage-options');
            
            title.textContent = '抵押 / 赎回地产';
            container.innerHTML = '';

            // 显示可抵押的地产
            if (mortgageable.length > 0) {
                const section1 = document.createElement('div');
                section1.innerHTML = '<h4 style="color:#22c55e;margin:10px 0 8px;font-size:13px;">💰 可抵押（获得现金）</h4>';
                container.appendChild(section1);
                
                mortgageable.forEach(prop => {
                    const div = document.createElement('div');
                    div.className = 'mortgage-option';
                    
                    div.innerHTML = `
                        <div class="color-bar color-${prop.color}"></div>
                        <div class="name">${prop.name}</div>
                        <div class="info" style="color:#22c55e;">+$${prop.mortgageValue}</div>
                    `;
                    
                    div.onclick = () => {
                        modal.classList.add('hidden');
                        resolve({ action: 'mortgage', property: prop });
                    };
                    
                    container.appendChild(div);
                });
            }
            
            // 显示可赎回的地产
            if (unmortgageable.length > 0) {
                const section2 = document.createElement('div');
                section2.innerHTML = '<h4 style="color:#f59e0b;margin:15px 0 8px;font-size:13px;">🔓 可赎回（支付现金）</h4>';
                container.appendChild(section2);
                
                unmortgageable.forEach(prop => {
                    const div = document.createElement('div');
                    div.className = 'mortgage-option';
                    
                    div.innerHTML = `
                        <div class="color-bar color-${prop.color}"></div>
                        <div class="name">${prop.name}</div>
                        <div class="info" style="color:#f59e0b;">-$${prop.getUnmortgageCost()}</div>
                    `;
                    
                    div.onclick = () => {
                        modal.classList.add('hidden');
                        resolve({ action: 'unmortgage', property: prop });
                    };
                    
                    container.appendChild(div);
                });
            }
            
            // 没有任何可操作的地产
            if (mortgageable.length === 0 && unmortgageable.length === 0) {
                container.innerHTML = '<p style="text-align:center;color:#888;">没有可抵押或赎回的地产</p>';
            }

            modal.classList.remove('hidden');

            document.getElementById('mortgage-close').onclick = () => {
                modal.classList.add('hidden');
                resolve(null);
            };
        });
    }

    /**
     * 显示监狱选项弹窗
     * @param {Player} player
     * @returns {Promise<'roll'|'pay'|'card'>}
     */
    showJailModal(player) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-jail');
            document.getElementById('jail-info').textContent = 
                `已在监狱 ${player.jailTurns} 回合。你可以尝试掷双数出狱，或支付 $50。`;

            const cardBtn = document.getElementById('jail-card');
            cardBtn.classList.toggle('hidden', player.getOutOfJailCards === 0);

            modal.classList.remove('hidden');

            document.getElementById('jail-roll').onclick = () => {
                modal.classList.add('hidden');
                resolve('roll');
            };
            document.getElementById('jail-pay').onclick = () => {
                modal.classList.add('hidden');
                resolve('pay');
            };
            cardBtn.onclick = () => {
                modal.classList.add('hidden');
                resolve('card');
            };
        });
    }

    /**
     * 显示收购弹窗
     * @param {Property} property - 要收购的地产
     * @param {number} price - 收购价格
     * @param {Player} buyer - 买家
     * @param {Player} owner - 原主
     * @returns {Promise<boolean>}
     */
    showBuyoutModal(property, price, buyer, owner) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-buyout');
            
            document.getElementById('buyout-property').textContent = property.name;
            document.getElementById('buyout-price').textContent = `收购价格: $${price}`;
            document.getElementById('buyout-info').textContent = 
                `${buyer.name}，你可以支付 $${price} 强制收购 ${owner.name} 的 ${property.name}`;
            document.getElementById('buyout-houses').textContent = 
                property.houses > 0 ? `（含 ${property.houses} 栋房屋）` : '';
            
            modal.classList.remove('hidden');
            
            document.getElementById('buyout-confirm').onclick = () => {
                modal.classList.add('hidden');
                resolve(true);
            };
            
            document.getElementById('buyout-cancel').onclick = () => {
                modal.classList.add('hidden');
                resolve(false);
            };
        });
    }

    /**
     * 显示交易弹窗
     * @param {Player} currentPlayer - 发起交易的玩家
     * @param {Player[]} players - 所有玩家
     * @returns {Promise<{accepted: boolean, offer: object}|null>}
     */
    showTradeModal(currentPlayer, players) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-trade');
            const otherPlayers = players.filter(p => p !== currentPlayer && !p.bankrupt);
            
            if (otherPlayers.length === 0) {
                resolve(null);
                return;
            }
            
            let targetPlayer = null;
            let mySelectedProps = new Set();
            let theirSelectedProps = new Set();
            
            const stepSelectPlayer = document.getElementById('trade-select-player');
            const stepSetup = document.getElementById('trade-setup');
            const stepConfirm = document.getElementById('trade-confirm');
            
            // 重置步骤
            stepSelectPlayer.classList.remove('hidden');
            stepSetup.classList.add('hidden');
            stepConfirm.classList.add('hidden');
            
            // 显示可选玩家
            const playersDiv = document.getElementById('trade-players');
            playersDiv.innerHTML = otherPlayers.map((p, i) => `
                <button class="trade-player-btn" data-index="${i}">
                    <img src="${p.getTokenImagePath()}" alt="">
                    <span>${p.name}</span>
                    <span class="money">$${p.money}</span>
                </button>
            `).join('');
            
            // 玩家选择事件
            playersDiv.onclick = (e) => {
                const btn = e.target.closest('.trade-player-btn');
                if (!btn) return;
                
                targetPlayer = otherPlayers[parseInt(btn.dataset.index)];
                mySelectedProps.clear();
                theirSelectedProps.clear();
                
                stepSelectPlayer.classList.add('hidden');
                stepSetup.classList.remove('hidden');
                
                // 显示交易设置
                document.getElementById('trade-my-name').textContent = currentPlayer.name;
                document.getElementById('trade-their-name').textContent = targetPlayer.name;
                document.getElementById('trade-my-money').value = 0;
                document.getElementById('trade-my-money').max = currentPlayer.money;
                document.getElementById('trade-their-money').value = 0;
                document.getElementById('trade-their-money').max = targetPlayer.money;
                
                // 显示我的地产
                const myPropsDiv = document.getElementById('trade-my-props');
                const tradableMyProps = currentPlayer.properties.filter(p => !p.isMortgaged && p.houses === 0 && !p.hasHotel);
                myPropsDiv.innerHTML = tradableMyProps.length > 0 ? tradableMyProps.map((p, i) => `
                    <div class="trade-prop" data-index="${i}">
                        <span class="color-dot color-${p.color}"></span>
                        <span>${p.name}</span>
                    </div>
                `).join('') : '<p style="color:#888;font-size:12px;">无可交易地产</p>';
                
                myPropsDiv.onclick = (e) => {
                    const prop = e.target.closest('.trade-prop');
                    if (!prop) return;
                    const idx = parseInt(prop.dataset.index);
                    if (mySelectedProps.has(idx)) {
                        mySelectedProps.delete(idx);
                        prop.classList.remove('selected');
                    } else {
                        mySelectedProps.add(idx);
                        prop.classList.add('selected');
                    }
                };
                
                // 显示对方地产
                const theirPropsDiv = document.getElementById('trade-their-props');
                const tradableTheirProps = targetPlayer.properties.filter(p => !p.isMortgaged && p.houses === 0 && !p.hasHotel);
                theirPropsDiv.innerHTML = tradableTheirProps.length > 0 ? tradableTheirProps.map((p, i) => `
                    <div class="trade-prop" data-index="${i}">
                        <span class="color-dot color-${p.color}"></span>
                        <span>${p.name}</span>
                    </div>
                `).join('') : '<p style="color:#888;font-size:12px;">无可交易地产</p>';
                
                theirPropsDiv.onclick = (e) => {
                    const prop = e.target.closest('.trade-prop');
                    if (!prop) return;
                    const idx = parseInt(prop.dataset.index);
                    if (theirSelectedProps.has(idx)) {
                        theirSelectedProps.delete(idx);
                        prop.classList.remove('selected');
                    } else {
                        theirSelectedProps.add(idx);
                        prop.classList.add('selected');
                    }
                };
            };
            
            // 返回按钮
            document.getElementById('trade-back-btn').onclick = () => {
                stepSetup.classList.add('hidden');
                stepSelectPlayer.classList.remove('hidden');
            };
            
            // 提出交易
            document.getElementById('trade-propose-btn').onclick = () => {
                const myMoney = parseInt(document.getElementById('trade-my-money').value) || 0;
                const theirMoney = parseInt(document.getElementById('trade-their-money').value) || 0;
                const tradableMyProps = currentPlayer.properties.filter(p => !p.isMortgaged && p.houses === 0 && !p.hasHotel);
                const tradableTheirProps = targetPlayer.properties.filter(p => !p.isMortgaged && p.houses === 0 && !p.hasHotel);
                
                const myProps = Array.from(mySelectedProps).map(i => tradableMyProps[i]);
                const theirProps = Array.from(theirSelectedProps).map(i => tradableTheirProps[i]);
                
                // 验证交易
                if (myMoney > currentPlayer.money) {
                    alert('你没有足够的现金！');
                    return;
                }
                if (theirMoney > targetPlayer.money) {
                    alert('对方没有足够的现金！');
                    return;
                }
                if (myProps.length === 0 && theirProps.length === 0 && myMoney === 0 && theirMoney === 0) {
                    alert('请选择交易内容！');
                    return;
                }
                
                // 显示确认页面
                stepSetup.classList.add('hidden');
                stepConfirm.classList.remove('hidden');
                
                const summaryDiv = document.getElementById('trade-summary');
                summaryDiv.innerHTML = `
                    <p><strong>${targetPlayer.name}</strong>，${currentPlayer.name} 向你发起交易：</p>
                    <div class="trade-summary-content">
                        <div class="trade-summary-side">
                            <strong>${currentPlayer.name} 给出：</strong>
                            ${myProps.map(p => `<div>• ${p.name}</div>`).join('') || ''}
                            ${myMoney > 0 ? `<div>• $${myMoney}</div>` : ''}
                            ${myProps.length === 0 && myMoney === 0 ? '<div style="color:#888">（无）</div>' : ''}
                        </div>
                        <div class="trade-summary-side">
                            <strong>${targetPlayer.name} 给出：</strong>
                            ${theirProps.map(p => `<div>• ${p.name}</div>`).join('') || ''}
                            ${theirMoney > 0 ? `<div>• $${theirMoney}</div>` : ''}
                            ${theirProps.length === 0 && theirMoney === 0 ? '<div style="color:#888">（无）</div>' : ''}
                        </div>
                    </div>
                `;
                
                // 同意
                document.getElementById('trade-accept-btn').onclick = () => {
                    modal.classList.add('hidden');
                    resolve({
                        accepted: true,
                        from: currentPlayer,
                        to: targetPlayer,
                        fromProps: myProps,
                        toProps: theirProps,
                        fromMoney: myMoney,
                        toMoney: theirMoney
                    });
                };
                
                // 拒绝
                document.getElementById('trade-reject-btn').onclick = () => {
                    modal.classList.add('hidden');
                    resolve({ accepted: false });
                };
            };
            
            // 取消
            document.getElementById('trade-close-btn').onclick = () => {
                modal.classList.add('hidden');
                resolve(null);
            };
            
            modal.classList.remove('hidden');
        });
    }

    /**
     * 显示拍卖弹窗
     * @param {Property} property - 要拍卖的地产
     * @param {Player[]} players - 所有玩家
     * @param {number} startingBid - 起拍价
     * @returns {Promise<{winner: Player, bid: number}|null>}
     */
    showAuctionModal(property, players, startingBid) {
        return new Promise(resolve => {
            const modal = document.getElementById('modal-auction');
            const activePlayers = players.filter(p => !p.bankrupt);
            
            // 初始化拍卖状态
            let currentBid = 0;  // 当前最高出价（0表示还没人出价）
            let currentWinner = null;
            let inAuction = activePlayers.map(p => ({ player: p, active: true }));
            let currentBidderIndex = 0;
            
            const updateAuctionUI = () => {
                const activeCount = inAuction.filter(p => p.active).length;
                const currentBidder = inAuction[currentBidderIndex];
                
                document.getElementById('auction-property').textContent = property.name;
                document.getElementById('auction-price').textContent = `原价: $${property.price}`;
                document.getElementById('auction-starting').textContent = `起拍价: $${startingBid}`;
                document.getElementById('auction-current-bid').textContent = 
                    currentBid > 0 ? `当前最高: $${currentBid} (${currentWinner.name})` : '暂无出价';
                document.getElementById('auction-bidder').textContent = 
                    `轮到: ${currentBidder.player.name} (现金: $${currentBidder.player.money})`;
                
                // 计算最低出价
                const minBid = currentBid > 0 ? currentBid + 10 : startingBid;
                document.getElementById('auction-min-bid').textContent = `最低出价: $${minBid}`;
                
                // 出价输入框
                const bidInput = document.getElementById('auction-bid-input');
                bidInput.value = minBid;
                bidInput.min = minBid;
                bidInput.max = currentBidder.player.money;
                bidInput.step = 10;
                
                // 检查是否能出价
                const canBid = currentBidder.player.money >= minBid;
                document.getElementById('auction-bid-btn').disabled = !canBid;
                
                // 显示玩家状态
                const statusDiv = document.getElementById('auction-players-status');
                statusDiv.innerHTML = inAuction.map(p => {
                    const status = p.active ? '🟢 竞拍中' : '🔴 退出';
                    const isCurrent = p === currentBidder ? '👉 ' : '';
                    return `<div>${isCurrent}${p.player.name}: ${status}</div>`;
                }).join('');
            };
            
            const nextBidder = () => {
                // 找下一个还在竞拍的玩家
                let tries = 0;
                do {
                    currentBidderIndex = (currentBidderIndex + 1) % inAuction.length;
                    tries++;
                } while (!inAuction[currentBidderIndex].active && tries < inAuction.length);
                
                // 检查是否只剩一人或无人
                const activeCount = inAuction.filter(p => p.active).length;
                if (activeCount <= 1) {
                    modal.classList.add('hidden');
                    if (activeCount === 1 && currentBid > 0) {
                        resolve({ winner: currentWinner, bid: currentBid });
                    } else {
                        resolve(null);  // 无人竞拍
                    }
                    return;
                }
                
                // 如果当前竞拍者就是最高出价者，拍卖结束
                if (inAuction[currentBidderIndex].player === currentWinner) {
                    modal.classList.add('hidden');
                    resolve({ winner: currentWinner, bid: currentBid });
                    return;
                }
                
                updateAuctionUI();
            };
            
            // 出价按钮
            document.getElementById('auction-bid-btn').onclick = () => {
                const bidInput = document.getElementById('auction-bid-input');
                const bid = parseInt(bidInput.value);
                const minBid = currentBid > 0 ? currentBid + 10 : startingBid;
                const currentBidder = inAuction[currentBidderIndex];
                
                if (bid >= minBid && bid <= currentBidder.player.money) {
                    currentBid = bid;
                    currentWinner = currentBidder.player;
                    audio.play('confirm');
                    nextBidder();
                }
            };
            
            // 退出按钮
            document.getElementById('auction-pass-btn').onclick = () => {
                inAuction[currentBidderIndex].active = false;
                nextBidder();
            };
            
            modal.classList.remove('hidden');
            updateAuctionUI();
        });
    }

    /**
     * 显示游戏结束弹窗
     * @param {Player} winner
     */
    showGameOverModal(winner) {
        const modal = document.getElementById('modal-gameover');
        document.getElementById('winner-info').innerHTML = `
            <p><strong>${winner.name}</strong> 获胜！</p>
            <p>最终资产: $${winner.calculateNetWorth()}</p>
        `;
        modal.classList.remove('hidden');
    }

    /**
     * 隐藏所有弹窗
     */
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }
}
