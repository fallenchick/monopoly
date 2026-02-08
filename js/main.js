// main.js - 入口，初始化游戏

let selectedCity = 'atlantic';

document.addEventListener('DOMContentLoaded', () => {
    // 初始化设置界面
    initSetupScreen();
});

/**
 * 初始化设置界面
 */
function initSetupScreen() {
    const ui = new UI();
    let playerCount = 3;

    // 默认显示3人配置
    ui.initPlayerSetup(playerCount);

    // 城市选择
    document.querySelectorAll('.city-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedCity = btn.dataset.city;
        });
    });

    // 玩家数量选择
    document.querySelectorAll('.count-buttons button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.count-buttons button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            playerCount = parseInt(btn.dataset.count);
            ui.initPlayerSetup(playerCount);
        });
    });

    // 棋子选择
    document.getElementById('player-setup').addEventListener('click', (e) => {
        const tokenChoice = e.target.closest('.token-choice');
        if (!tokenChoice || tokenChoice.classList.contains('disabled')) return;

        const tokenChoices = tokenChoice.closest('.token-choices');
        tokenChoices.querySelectorAll('.token-choice').forEach(tc => tc.classList.remove('selected'));
        tokenChoice.classList.add('selected');

        ui.updateTokenAvailability();
    });

    // 开始游戏
    document.getElementById('start-btn').addEventListener('click', () => {
        const playerData = ui.getPlayerSetupData();
        
        // 检查是否有重复棋子
        const tokens = playerData.map(p => p.token);
        const uniqueTokens = new Set(tokens);
        if (uniqueTokens.size !== tokens.length) {
            alert('请为每位玩家选择不同的棋子！');
            return;
        }

        // 读取可选规则
        const houseRules = {
            doubleGo: document.getElementById('rule-double-go').checked,
            chineseBuilding: document.getElementById('rule-chinese-building').checked,
            buyout: document.getElementById('rule-buyout').checked
        };

        // 设置当前城市
        currentCity = selectedCity;
        
        // 生成棋盘
        renderBoard(selectedCity);
        
        // 创建游戏实例并初始化
        game = new Game();
        game.init(playerData, selectedCity, houseRules);
    });
}

/**
 * 根据城市生成棋盘HTML
 */
function renderBoard(cityId) {
    const cityInfo = getCityInfo(cityId);
    const properties = getCityProperties(cityId);
    const currency = cityInfo.currency;
    const isShanghai = cityId === 'shanghai';
    const isWorld = cityId === 'world';
    const railIcon = isShanghai ? '🚄' : (isWorld ? '✈️' : '🚂');
    const airIcon = (isShanghai || isWorld) ? '✈️' : '🚂';
    
    // 创建地产位置到数据的映射
    const propMap = {};
    properties.forEach(p => propMap[p.position] = p);
    
    // 棋盘格子定义 (position: {type, name, ...})
    const tiles = {
        // 角落
        0: { type: 'GO', name: '起点', price: `领取 ${currency}200` },
        10: { type: 'JAIL', name: '监狱/探视' },
        20: { type: 'PARKING', name: '免费停车' },
        30: { type: 'GOTOJAIL', name: '前往监狱' },
        // 特殊
        2: { type: 'CHEST', name: '命运' },
        4: { type: 'TAX', name: '所得税', price: `交 ${currency}200` },
        7: { type: 'CHANCE', name: '机会' },
        17: { type: 'CHEST', name: '命运' },
        22: { type: 'CHANCE', name: '机会' },
        33: { type: 'CHEST', name: '命运' },
        36: { type: 'CHANCE', name: '机会' },
        38: { type: 'TAX', name: '奢侈税', price: `交 ${currency}100` },
    };
    
    const grid = document.getElementById('board-grid');
    let html = '';
    
    // 四个角落
    html += `<div class="tile corner corner-parking"><div class="special-icon">🅿️</div><div class="tile-name">免费<br>停车</div></div>`;
    html += `<div class="tile corner corner-gotojail"><div class="special-icon">👮</div><div class="tile-name">前往<br>监狱</div></div>`;
    html += `<div class="tile corner corner-jail"><div class="special-icon">🔒</div><div class="tile-name">监狱/<br>探视</div></div>`;
    html += `<div class="tile corner corner-go"><div class="arrow">← GO</div><div class="tile-name">起点</div><div class="tile-price">领取 ${currency}200</div></div>`;
    
    // 顶边 (位置 21-29，从左到右)
    const topPositions = [21, 22, 23, 24, 25, 26, 27, 28, 29];
    topPositions.forEach((pos, i) => {
        html += renderTile(pos, 'top', i + 2, propMap, tiles, currency, railIcon, airIcon);
    });
    
    // 右边 (位置 31-39，从上到下)
    const rightPositions = [31, 32, 33, 34, 35, 36, 37, 38, 39];
    rightPositions.forEach((pos, i) => {
        html += renderTile(pos, 'right', i + 2, propMap, tiles, currency, railIcon, airIcon);
    });
    
    // 底边 (位置 1-9，从右到左显示为grid的2-10列)
    const bottomPositions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    bottomPositions.forEach((pos, i) => {
        html += renderTile(pos, 'bottom', 10 - i, propMap, tiles, currency, railIcon, airIcon);
    });
    
    // 左边 (位置 11-19，从下到上显示为grid的10-2行)
    const leftPositions = [11, 12, 13, 14, 15, 16, 17, 18, 19];
    leftPositions.forEach((pos, i) => {
        html += renderTile(pos, 'left', 10 - i, propMap, tiles, currency, railIcon, airIcon);
    });
    
    // 中央
    html += `<div class="board-center">
        <div class="center-logo">MONOPOLY</div>
        <div class="center-subtitle">大富翁</div>
        <div class="center-city">${cityInfo.flag} ${cityInfo.name}</div>
    </div>`;
    
    grid.innerHTML = html;
}

/**
 * 渲染单个格子
 */
function renderTile(position, side, gridPos, propMap, tiles, currency, railIcon, airIcon) {
    const prop = propMap[position];
    const special = tiles[position];
    
    let classes = `tile ${side}`;
    let style = side === 'top' || side === 'bottom' ? `grid-column:${gridPos}` : `grid-row:${gridPos}`;
    let content = '';
    
    if (special) {
        // 特殊格子
        if (special.type === 'CHANCE') {
            classes += ' chance';
            content = `<div class="special-icon">❓</div><div class="tile-name">机会</div>`;
        } else if (special.type === 'CHEST') {
            classes += ' chest';
            content = `<div class="special-icon">📦</div><div class="tile-name">命运</div>`;
        } else if (special.type === 'TAX') {
            classes += ' tax';
            const icon = position === 4 ? '💰' : '💎';
            content = `<div class="special-icon">${icon}</div><div class="tile-name">${special.name}</div><div class="tile-price">${special.price}</div>`;
        }
    } else if (prop) {
        // 地产格子
        if (prop.type === 'RAILROAD') {
            classes += ' railroad';
            const icon = prop.name.includes('机场') ? airIcon : railIcon;
            const name = formatName(prop.name);
            content = `<div class="special-icon">${icon}</div><div class="tile-name">${name}</div><div class="tile-price">${currency}${prop.price}</div>`;
        } else if (prop.type === 'UTILITY') {
            classes += ' utility';
            // 根据名称选择图标
            let icon = '💡';
            if (prop.name.includes('电力')) icon = '💡';
            else if (prop.name.includes('水') || prop.name.includes('自来水')) icon = '💧';
            else if (prop.name.includes('世界银行')) icon = '🏦';
            else if (prop.name.includes('联合国')) icon = '🌐';
            const name = formatName(prop.name);
            content = `<div class="special-icon">${icon}</div><div class="tile-name">${name}</div><div class="tile-price">${currency}${prop.price}</div>`;
        } else {
            // 街道
            const name = formatName(prop.name);
            if (side === 'bottom') {
                content = `<div class="tile-name">${name}</div><div class="tile-price">${currency}${prop.price}</div><div class="color-bar ${prop.color}"></div>`;
            } else {
                content = `<div class="color-bar ${prop.color}"></div><div class="tile-name">${name}</div><div class="tile-price">${currency}${prop.price}</div>`;
            }
        }
    }
    
    return `<div class="${classes}" style="${style}">${content}</div>`;
}

/**
 * 格式化地名（长名称换行）
 */
function formatName(name) {
    if (name.length <= 4) return name;
    // 尝试在中间换行
    const mid = Math.ceil(name.length / 2);
    return name.slice(0, mid) + '<br>' + name.slice(mid);
}
