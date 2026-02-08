// 上海版地产数据
const SHANGHAI_PROPERTIES = [
    // 棕色组
    { position: 1, name: "宝山路", type: "STREET", color: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgageValue: 30 },
    { position: 3, name: "共和新路", type: "STREET", color: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgageValue: 30 },
    
    // 浅蓝组
    { position: 6, name: "四平路", type: "STREET", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
    { position: 8, name: "中山北路", type: "STREET", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
    { position: 9, name: "江浦路", type: "STREET", color: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgageValue: 60 },
    
    // 粉色组
    { position: 11, name: "漕宝路", type: "STREET", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
    { position: 13, name: "龙漕路", type: "STREET", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
    { position: 14, name: "漕溪北路", type: "STREET", color: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgageValue: 80 },
    
    // 橙色组
    { position: 16, name: "肇嘉浜路", type: "STREET", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
    { position: 18, name: "宛平南路", type: "STREET", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
    { position: 19, name: "凯旋路", type: "STREET", color: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgageValue: 100 },
    
    // 红色组
    { position: 21, name: "四川北路", type: "STREET", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
    { position: 23, name: "福州路", type: "STREET", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
    { position: 24, name: "广东路", type: "STREET", color: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgageValue: 120 },
    
    // 黄色组
    { position: 26, name: "华山路", type: "STREET", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
    { position: 27, name: "愚园路", type: "STREET", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
    { position: 29, name: "武康路", type: "STREET", color: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgageValue: 140 },
    
    // 绿色组
    { position: 31, name: "衡山路", type: "STREET", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
    { position: 32, name: "复兴西路", type: "STREET", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
    { position: 34, name: "淮海中路", type: "STREET", color: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgageValue: 160 },
    
    // 深蓝组
    { position: 37, name: "南京西路", type: "STREET", color: "blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgageValue: 175 },
    { position: 39, name: "陆家嘴", type: "STREET", color: "blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgageValue: 200 },
    
    // 铁路
    { position: 5, name: "上海站", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 15, name: "上海南站", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 25, name: "虹桥站", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 35, name: "浦东机场", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    
    // 公用事业
    { position: 12, name: "电力公司", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 },
    { position: 28, name: "自来水公司", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 }
];

// 颜色组定义
const SHANGHAI_COLOR_GROUPS = {
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
const SHANGHAI_INFO = {
    name: "上海",
    nameEn: "Shanghai",
    currency: "¥",
    description: "魔都 - 中国最大的经济中心"
};
