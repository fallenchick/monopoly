// Property.js - 地产类

class Property {
    constructor(data) {
        this.position = data.position;
        this.name = data.name;
        this.type = data.type;           // 'STREET' | 'RAILROAD' | 'UTILITY'
        this.color = data.color;
        this.price = data.price;
        this.rent = data.rent || [];     // [基础, 1房, 2房, 3房, 4房, 酒店]
        this.houseCost = data.houseCost || 0;
        this.mortgageValue = data.mortgageValue;
        this.image = data.image;
        
        this.owner = null;               // Player 实例
        this.houses = 0;                 // 0-4 房屋
        this.hasHotel = false;           // 是否有酒店
        this.isMortgaged = false;        // 是否抵押
    }

    /**
     * 计算当前租金
     * @param {number} diceTotal - 骰子总数（公用事业用）
     * @param {number} ownedRailroads - 拥有的铁路数量
     * @param {number} ownedUtilities - 拥有的公用事业数量
     * @param {boolean} ownsColorGroup - 是否拥有整个颜色组
     * @returns {number}
     */
    calculateRent(diceTotal = 0, ownedRailroads = 0, ownedUtilities = 0, ownsColorGroup = false) {
        if (this.isMortgaged) return 0;
        if (!this.owner) return 0;

        // 铁路
        if (this.type === 'RAILROAD') {
            return this.rent[ownedRailroads - 1] || 0;
        }

        // 公用事业
        if (this.type === 'UTILITY') {
            if (ownedUtilities === 1) {
                return diceTotal * 4;
            } else if (ownedUtilities >= 2) {
                return diceTotal * 10;
            }
            return 0;
        }

        // 街道
        if (this.hasHotel) {
            return this.rent[5];
        }
        if (this.houses > 0) {
            return this.rent[this.houses];
        }
        // 无房屋，但拥有整组则租金翻倍
        let baseRent = this.rent[0];
        if (ownsColorGroup) {
            baseRent *= 2;
        }
        return baseRent;
    }

    /**
     * 建造房屋
     * @returns {boolean} 是否成功
     */
    buildHouse() {
        if (this.type !== 'STREET') return false;
        if (this.isMortgaged) return false;
        if (this.hasHotel) return false;
        if (this.houses >= 4) {
            // 升级到酒店
            this.houses = 0;
            this.hasHotel = true;
            return true;
        }
        this.houses++;
        return true;
    }

    /**
     * 出售房屋
     * @returns {number} 返还金额
     */
    sellHouse() {
        if (this.type !== 'STREET') return 0;
        
        const refund = Math.floor(this.houseCost / 2);
        
        if (this.hasHotel) {
            this.hasHotel = false;
            this.houses = 4;
            return refund;
        }
        if (this.houses > 0) {
            this.houses--;
            return refund;
        }
        return 0;
    }

    /**
     * 抵押地产
     * @returns {number} 获得金额
     */
    mortgage() {
        if (this.isMortgaged) return 0;
        if (this.houses > 0 || this.hasHotel) return 0;  // 有房屋不能抵押
        
        this.isMortgaged = true;
        return this.mortgageValue;
    }

    /**
     * 赎回地产
     * @returns {number} 需要支付金额
     */
    getUnmortgageCost() {
        return Math.floor(this.mortgageValue * 1.1);
    }

    unmortgage() {
        if (!this.isMortgaged) return false;
        this.isMortgaged = false;
        return true;
    }

    /**
     * 获取建筑数量（用于维修费计算）
     * @returns {{houses: number, hotels: number}}
     */
    getBuildingCount() {
        return {
            houses: this.hasHotel ? 0 : this.houses,
            hotels: this.hasHotel ? 1 : 0
        };
    }

    /**
     * 重置所有权
     */
    reset() {
        this.owner = null;
        this.houses = 0;
        this.hasHotel = false;
        this.isMortgaged = false;
    }

    /**
     * 获取颜色的CSS类名
     */
    getColorClass() {
        return `color-${this.color}`;
    }

    /**
     * 获取地产卡图片路径
     */
    getImagePath() {
        return `assets/properties/${this.image}`;
    }
}
