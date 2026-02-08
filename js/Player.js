// Player.js - 玩家类

class Player {
    constructor(id, name, token) {
        this.id = id;
        this.name = name;
        this.token = token;              // 棋子类型 ID
        this.position = 0;               // 当前位置 (0-39)
        this.money = 1500;               // 初始现金
        this.properties = [];            // 拥有的地产 Property[]
        this.inJail = false;
        this.jailTurns = 0;              // 在监狱的回合数
        this.getOutOfJailCards = 0;      // 出狱卡数量
        this.bankrupt = false;
        this.doublesCount = 0;           // 连续双数次数
    }

    /**
     * 增加金钱
     * @param {number} amount
     */
    addMoney(amount) {
        this.money += amount;
        audio.play('cashGain');
    }

    /**
     * 扣除金钱
     * @param {number} amount
     * @returns {boolean} 是否足够支付
     */
    deductMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            audio.play('cashLose');
            return true;
        }
        // 钱不够，但先扣为负数，后续处理破产
        this.money -= amount;
        audio.play('cashLose');
        return false;
    }

    /**
     * 检查是否能负担
     * @param {number} amount
     */
    canAfford(amount) {
        return this.money >= amount;
    }

    /**
     * 计算总资产
     * 现金 + 地产价值（抵押地产价值减半）+ 房屋价值
     * @returns {number}
     */
    calculateNetWorth() {
        let worth = this.money;
        
        for (const property of this.properties) {
            if (property.isMortgaged) {
                // 抵押地产价值减半
                worth += Math.floor(property.price / 2);
            } else {
                // 非抵押地产全价
                worth += property.price;
            }
            // 房屋/酒店价值（可卖回一半）
            if (property.type === 'STREET') {
                const buildings = property.getBuildingCount();
                worth += buildings.houses * Math.floor(property.houseCost / 2);
                worth += buildings.hotels * Math.floor(property.houseCost * 5 / 2);  // 酒店 = 5栋房子
            }
        }
        
        return worth;
    }

    /**
     * 获取地产总价值（用于显示）
     * @returns {number}
     */
    getPropertyValue() {
        let value = 0;
        
        for (const property of this.properties) {
            if (property.isMortgaged) {
                value += Math.floor(property.price / 2);
            } else {
                value += property.price;
            }
            if (property.type === 'STREET') {
                const buildings = property.getBuildingCount();
                value += buildings.houses * Math.floor(property.houseCost / 2);
                value += buildings.hotels * Math.floor(property.houseCost * 5 / 2);
            }
        }
        
        return value;
    }

    /**
     * 获得地产
     * @param {Property} property
     */
    acquireProperty(property) {
        property.owner = this;
        this.properties.push(property);
    }

    /**
     * 失去地产（破产时）
     * @param {Property} property
     */
    loseProperty(property) {
        property.reset();
        const index = this.properties.indexOf(property);
        if (index > -1) {
            this.properties.splice(index, 1);
        }
    }

    /**
     * 检查是否拥有某颜色组的所有地产
     * @param {string} color
     * @returns {boolean}
     */
    ownsColorGroup(color) {
        const groupPositions = COLOR_GROUPS[color];
        if (!groupPositions) return false;
        
        return groupPositions.every(pos => 
            this.properties.some(p => p.position === pos)
        );
    }

    /**
     * 获取拥有的铁路数量
     */
    getOwnedRailroads() {
        return this.properties.filter(p => p.type === 'RAILROAD').length;
    }

    /**
     * 获取拥有的公用事业数量
     */
    getOwnedUtilities() {
        return this.properties.filter(p => p.type === 'UTILITY').length;
    }

    /**
     * 获取可建造的地产列表（美式规则）
     * @returns {Property[]}
     */
    getBuildableProperties() {
        const buildable = [];
        
        // 按颜色组检查
        const colorGroups = {};
        for (const property of this.properties) {
            if (property.type !== 'STREET') continue;
            if (!colorGroups[property.color]) {
                colorGroups[property.color] = [];
            }
            colorGroups[property.color].push(property);
        }

        for (const [color, props] of Object.entries(colorGroups)) {
            // 检查是否拥有整组
            if (!this.ownsColorGroup(color)) continue;
            
            // 找出最少房屋数
            const minHouses = Math.min(...props.map(p => 
                p.hasHotel ? 5 : p.houses
            ));

            // 只有房屋数等于最小值且未到酒店的才能建造
            for (const prop of props) {
                if (prop.isMortgaged) continue;
                if (prop.hasHotel) continue;
                const currentLevel = prop.houses;
                if (currentLevel <= minHouses && this.canAfford(prop.houseCost)) {
                    buildable.push(prop);
                }
            }
        }

        return buildable;
    }

    /**
     * 获取可建造的地产列表（中式规则）
     * 只能在当前所在的自己的街道地产上建房
     * @param {number} currentPosition - 当前位置
     * @returns {Property[]}
     */
    getBuildablePropertiesChinese(currentPosition) {
        const buildable = [];
        
        for (const property of this.properties) {
            if (property.type !== 'STREET') continue;
            if (property.position !== currentPosition) continue;
            if (property.isMortgaged) continue;
            if (property.hasHotel) continue;
            if (!this.canAfford(property.houseCost)) continue;
            
            buildable.push(property);
        }
        
        return buildable;
    }

    /**
     * 获取可抵押的地产
     * @returns {Property[]}
     */
    getMortgageableProperties() {
        return this.properties.filter(p => 
            !p.isMortgaged && p.houses === 0 && !p.hasHotel
        );
    }

    /**
     * 获取可赎回的地产
     * @returns {Property[]}
     */
    getUnmortgageableProperties() {
        return this.properties.filter(p => 
            p.isMortgaged && this.canAfford(p.getUnmortgageCost())
        );
    }

    /**
     * 进监狱
     */
    goToJail() {
        this.position = 10;
        this.inJail = true;
        this.jailTurns = 0;
        this.doublesCount = 0;
        audio.play('jail');
    }

    /**
     * 出狱
     */
    leaveJail() {
        this.inJail = false;
        this.jailTurns = 0;
        audio.play('jailLeave');
    }

    /**
     * 使用出狱卡
     * @returns {boolean}
     */
    useGetOutOfJailCard() {
        if (this.getOutOfJailCards > 0) {
            this.getOutOfJailCards--;
            this.leaveJail();
            return true;
        }
        return false;
    }

    /**
     * 宣布破产
     */
    declareBankruptcy() {
        this.bankrupt = true;
        // 释放所有地产
        for (const property of this.properties) {
            property.reset();
        }
        this.properties = [];
    }

    /**
     * 获取棋子图片路径
     */
    getTokenImagePath() {
        return `assets/tokens/${this.token}.png`;
    }
}
