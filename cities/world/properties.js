// 世界城市版地产数据
const WORLD_PROPERTIES = [
    // 棕色组 - 非洲
    { position: 1, name: "拉各斯", type: "STREET", color: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgageValue: 30 },
    { position: 3, name: "开罗", type: "STREET", color: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgageValue: 30 },
    
    // 浅蓝组 - 南亚
    { position: 6, name: "拉合尔", type: "STREET", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
    { position: 8, name: "新德里", type: "STREET", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
    { position: 9, name: "孟买", type: "STREET", color: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgageValue: 60 },
    
    // 粉色组 - 拉丁美洲
    { position: 11, name: "波哥大", type: "STREET", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
    { position: 13, name: "墨西哥城", type: "STREET", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
    { position: 14, name: "圣保罗", type: "STREET", color: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgageValue: 80 },
    
    // 橙色组 - 欧洲（东/中）
    { position: 16, name: "华沙", type: "STREET", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
    { position: 18, name: "柏林", type: "STREET", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
    { position: 19, name: "罗马", type: "STREET", color: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgageValue: 100 },
    
    // 红色组 - 亚太
    { position: 21, name: "悉尼", type: "STREET", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
    { position: 23, name: "新加坡", type: "STREET", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
    { position: 24, name: "香港", type: "STREET", color: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgageValue: 120 },
    
    // 黄色组 - 东亚
    { position: 26, name: "首尔", type: "STREET", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
    { position: 27, name: "上海", type: "STREET", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
    { position: 29, name: "东京", type: "STREET", color: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgageValue: 140 },
    
    // 绿色组 - 欧洲（西）
    { position: 31, name: "苏黎世", type: "STREET", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
    { position: 32, name: "巴黎", type: "STREET", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
    { position: 34, name: "伦敦", type: "STREET", color: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgageValue: 160 },
    
    // 深蓝组 - 北美
    { position: 37, name: "多伦多", type: "STREET", color: "blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgageValue: 175 },
    { position: 39, name: "纽约", type: "STREET", color: "blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgageValue: 200 },
    
    // 铁路 - 国际机场
    { position: 5, name: "多哈机场", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 15, name: "法兰克福机场", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 25, name: "广州机场", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 35, name: "亚特兰大机场", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    
    // 公用事业 - 国际组织
    { position: 12, name: "世界银行", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 },
    { position: 28, name: "联合国", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 }
];

// 颜色组定义
const WORLD_COLOR_GROUPS = {
    brown: [1, 3],
    lightblue: [6, 8, 9],
    pink: [11, 13, 14],
    orange: [16, 18, 19],
    red: [21, 23, 24],
    yellow: [26, 27, 29],
    green: [31, 32, 34],
    blue: [37, 39]
};

// 城市信息
const WORLD_INFO = {
    name: "世界城市版",
    nameEn: "World Cities",
    currency: "$",
    description: "环游世界 - 从拉各斯到纽约的全球之旅"
};
