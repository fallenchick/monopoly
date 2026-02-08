// Board.js - 棋盘逻辑与渲染

class Board {
    constructor(cityId = 'atlantic') {
        this.cityId = cityId;
        this.properties = new Map();  // position -> Property
        this.tokensLayer = document.getElementById('tokens-layer');
        this.housesLayer = document.getElementById('houses-layer');
        
        this.initProperties();
    }

    /**
     * 初始化所有地产
     */
    initProperties() {
        // 使用城市对应的地产数据
        const cityProperties = getCityProperties(this.cityId);
        for (const data of cityProperties) {
            const property = new Property(data);
            this.properties.set(data.position, property);
        }
    }

    /**
     * 获取指定位置的地产（如果是地产格）
     * @param {number} position
     * @returns {Property|null}
     */
    getProperty(position) {
        return this.properties.get(position) || null;
    }

    /**
     * 获取指定位置的格子类型
     * @param {number} position
     * @returns {object}
     */
    getTileInfo(position) {
        // 检查是否是特殊格子
        if (SPECIAL_TILES[position]) {
            return SPECIAL_TILES[position];
        }
        
        // 检查是否是地产
        const property = this.getProperty(position);
        if (property) {
            return { type: 'PROPERTY', property };
        }

        return { type: 'UNKNOWN' };
    }

    /**
     * 获取某颜色组的所有地产
     * @param {string} color
     * @returns {Property[]}
     */
    getPropertiesByColor(color) {
        const positions = COLOR_GROUPS[color] || [];
        return positions.map(pos => this.getProperty(pos)).filter(p => p);
    }

    /**
     * 渲染玩家棋子
     * @param {Player[]} players
     */
    renderTokens(players) {
        this.tokensLayer.innerHTML = '';

        // 统计每个位置的玩家
        const positionPlayers = {};
        players.forEach((player, index) => {
            if (player.bankrupt) return;
            if (!positionPlayers[player.position]) {
                positionPlayers[player.position] = [];
            }
            positionPlayers[player.position].push({ player, index });
        });

        // 渲染每个玩家
        for (const [position, playersAtPos] of Object.entries(positionPlayers)) {
            const pos = TILE_POSITIONS[position];
            if (!pos) continue;

            playersAtPos.forEach(({ player, index }, offsetIndex) => {
                const token = document.createElement('div');
                token.className = 'token';
                token.id = `token-${player.id}`;

                // 多个玩家在同一位置时偏移
                const offsetX = (offsetIndex % 2) * 25 - 12;
                const offsetY = Math.floor(offsetIndex / 2) * 25 - 12;

                token.style.left = `calc(${pos.x}% + ${offsetX}px)`;
                token.style.top = `calc(${pos.y}% + ${offsetY}px)`;
                token.innerHTML = `<img src="${player.getTokenImagePath()}" alt="${player.name}">`;

                this.tokensLayer.appendChild(token);
            });
        }
    }

    /**
     * 渲染房屋和所有权标记
     * @param {Player[]} players
     */
    renderOwnership(players) {
        this.housesLayer.innerHTML = '';

        for (const [position, property] of this.properties) {
            if (!property.owner) continue;
            if (property.owner.bankrupt) continue;

            const pos = TILE_POSITIONS[position];
            if (!pos) continue;

            const playerIndex = players.indexOf(property.owner);
            const playerColor = `var(--player-${playerIndex})`;

            // 所有权标记
            const marker = document.createElement('div');
            marker.className = 'ownership-marker';
            marker.style.left = `calc(${pos.x}% - 15px)`;
            marker.style.top = `calc(${pos.y}% - 15px)`;
            marker.style.backgroundColor = playerColor;
            this.housesLayer.appendChild(marker);

            // 房屋/酒店标记
            if (property.type === 'STREET') {
                if (property.hasHotel) {
                    const hotel = document.createElement('div');
                    hotel.className = 'house-marker';
                    hotel.style.left = `calc(${pos.x}% + 10px)`;
                    hotel.style.top = `calc(${pos.y}% - 18px)`;
                    hotel.textContent = '🏨';
                    this.housesLayer.appendChild(hotel);
                } else if (property.houses > 0) {
                    const houses = document.createElement('div');
                    houses.className = 'house-marker';
                    houses.style.left = `calc(${pos.x}% + 10px)`;
                    houses.style.top = `calc(${pos.y}% - 18px)`;
                    houses.textContent = '🏠'.repeat(property.houses);
                    this.housesLayer.appendChild(houses);
                }
            }

            // 抵押标记
            if (property.isMortgaged) {
                const mortgaged = document.createElement('div');
                mortgaged.className = 'mortgage-marker';
                mortgaged.style.left = `calc(${pos.x}% + 5px)`;
                mortgaged.style.top = `calc(${pos.y}% + 10px)`;
                mortgaged.textContent = '💰';
                this.housesLayer.appendChild(mortgaged);
            }
        }
    }

    /**
     * 移动棋子动画
     * @param {Player} player
     * @param {number} from
     * @param {number} to
     * @returns {Promise}
     */
    async animateMove(player, from, to) {
        const token = document.getElementById(`token-${player.id}`);
        if (!token) return;

        // 计算经过的格子
        const steps = [];
        let current = from;
        while (current !== to) {
            current = (current + 1) % 40;
            steps.push(current);
        }

        // 逐格移动
        for (const step of steps) {
            const pos = TILE_POSITIONS[step];
            if (!pos) continue;

            token.style.left = `${pos.x}%`;
            token.style.top = `${pos.y}%`;
            token.classList.add('moving');

            await this.sleep(120);
            token.classList.remove('moving');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取所有地产
     * @returns {Property[]}
     */
    getAllProperties() {
        return Array.from(this.properties.values());
    }

    /**
     * 重置棋盘
     */
    reset() {
        for (const property of this.properties.values()) {
            property.reset();
        }
        this.tokensLayer.innerHTML = '';
        this.housesLayer.innerHTML = '';
    }
}
