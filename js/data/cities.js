// cities.js - 城市配置

const CITIES = {
    atlantic: {
        id: 'atlantic',
        name: '大西洋城',
        nameEn: 'Atlantic City',
        flag: '🇺🇸',
        currency: '$',
        description: '经典美国版'
    },
    shanghai: {
        id: 'shanghai',
        name: '上海',
        nameEn: 'Shanghai', 
        flag: '🇨🇳',
        currency: '¥',
        description: '魔都版'
    },
    world: {
        id: 'world',
        name: '世界城市',
        nameEn: 'World Cities',
        flag: '🌍',
        currency: '$',
        description: '环游世界版'
    }
};

// 当前选择的城市
let currentCity = 'atlantic';

// 大西洋城地产数据（原版）
const ATLANTIC_PROPERTIES = [
    // 棕色组
    { position: 1, name: "地中海大道", type: "STREET", color: "brown", price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50, mortgageValue: 30 },
    { position: 3, name: "波罗的海大道", type: "STREET", color: "brown", price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50, mortgageValue: 30 },
    
    // 浅蓝组
    { position: 6, name: "东方大道", type: "STREET", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
    { position: 8, name: "佛蒙特大道", type: "STREET", color: "lightblue", price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50, mortgageValue: 50 },
    { position: 9, name: "康涅狄格大道", type: "STREET", color: "lightblue", price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50, mortgageValue: 60 },
    
    // 粉色组
    { position: 11, name: "圣查尔斯广场", type: "STREET", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
    { position: 13, name: "州立大道", type: "STREET", color: "pink", price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100, mortgageValue: 70 },
    { position: 14, name: "弗吉尼亚大道", type: "STREET", color: "pink", price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100, mortgageValue: 80 },
    
    // 橙色组
    { position: 16, name: "圣詹姆斯广场", type: "STREET", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
    { position: 18, name: "田纳西大道", type: "STREET", color: "orange", price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100, mortgageValue: 90 },
    { position: 19, name: "纽约大道", type: "STREET", color: "orange", price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100, mortgageValue: 100 },
    
    // 红色组
    { position: 21, name: "肯塔基大道", type: "STREET", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
    { position: 23, name: "印第安纳大道", type: "STREET", color: "red", price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150, mortgageValue: 110 },
    { position: 24, name: "伊利诺伊大道", type: "STREET", color: "red", price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150, mortgageValue: 120 },
    
    // 黄色组
    { position: 26, name: "大西洋大道", type: "STREET", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
    { position: 27, name: "文特诺大道", type: "STREET", color: "yellow", price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150, mortgageValue: 130 },
    { position: 29, name: "马文花园", type: "STREET", color: "yellow", price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150, mortgageValue: 140 },
    
    // 绿色组
    { position: 31, name: "太平洋大道", type: "STREET", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
    { position: 32, name: "北卡罗来纳大道", type: "STREET", color: "green", price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200, mortgageValue: 150 },
    { position: 34, name: "宾夕法尼亚大道", type: "STREET", color: "green", price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200, mortgageValue: 160 },
    
    // 深蓝组
    { position: 37, name: "公园广场", type: "STREET", color: "blue", price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200, mortgageValue: 175 },
    { position: 39, name: "木板路", type: "STREET", color: "blue", price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200, mortgageValue: 200 },
    
    // 铁路
    { position: 5, name: "雷丁铁路", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 15, name: "宾夕法尼亚铁路", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 25, name: "B&O铁路", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 35, name: "短线铁路", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    
    // 公用事业
    { position: 12, name: "电力公司", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 },
    { position: 28, name: "自来水公司", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 }
];

// 上海地产数据
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
    
    // 铁路/交通
    { position: 5, name: "上海站", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 15, name: "上海南站", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 25, name: "虹桥站", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    { position: 35, name: "浦东机场", type: "RAILROAD", color: "railroad", price: 200, rent: [25, 50, 100, 200], mortgageValue: 100 },
    
    // 公用事业
    { position: 12, name: "电力公司", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 },
    { position: 28, name: "自来水公司", type: "UTILITY", color: "utility", price: 150, mortgageValue: 75 }
];

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

// 棋盘格子数据（按城市）
const BOARD_TILES = {
    atlantic: {
        corners: ['免费停车', '前往监狱', '监狱/探视', '起点'],
        top: ['肯塔基大道', '机会', '印第安纳大道', '伊利诺伊大道', 'B&O铁路', '大西洋大道', '文特诺大道', '自来水公司', '马文花园'],
        right: ['太平洋大道', '北卡罗来纳', '命运', '宾州大道', '短线铁路', '机会', '公园广场', '奢侈税', '木板路'],
        bottom: ['地中海大道', '命运', '波罗的海大道', '所得税', '雷丁铁路', '东方大道', '机会', '佛蒙特大道', '康涅狄格大道'],
        left: ['圣查尔斯广场', '电力公司', '州立大道', '弗吉尼亚大道', '宾州铁路', '圣詹姆斯广场', '命运', '田纳西大道', '纽约大道'],
        railroadIcon: '🚂',
        airportIcon: '🚂'
    },
    shanghai: {
        corners: ['免费停车', '前往监狱', '监狱/探视', '起点'],
        top: ['四川北路', '机会', '福州路', '广东路', '虹桥站', '华山路', '愚园路', '自来水公司', '武康路'],
        right: ['衡山路', '复兴西路', '命运', '淮海中路', '浦东机场', '机会', '南京西路', '奢侈税', '陆家嘴'],
        bottom: ['宝山路', '命运', '共和新路', '所得税', '上海站', '四平路', '机会', '中山北路', '江浦路'],
        left: ['漕宝路', '电力公司', '龙漕路', '漕溪北路', '上海南站', '肇嘉浜路', '命运', '宛平南路', '凯旋路'],
        railroadIcon: '🚄',
        airportIcon: '✈️'
    },
    world: {
        corners: ['免费停车', '前往监狱', '监狱/探视', '起点'],
        top: ['悉尼', '机会', '新加坡', '香港', '广州机场', '首尔', '上海', '联合国', '东京'],
        right: ['苏黎世', '巴黎', '命运', '伦敦', '亚特兰大机场', '机会', '多伦多', '奢侈税', '纽约'],
        bottom: ['拉各斯', '命运', '开罗', '所得税', '多哈机场', '拉合尔', '机会', '新德里', '孟买'],
        left: ['波哥大', '世界银行', '墨西哥城', '圣保罗', '法兰克福机场', '华沙', '命运', '柏林', '罗马'],
        railroadIcon: '✈️',
        airportIcon: '✈️'
    }
};

// 获取当前城市的地产数据
function getCityProperties(cityId) {
    switch(cityId) {
        case 'shanghai': return SHANGHAI_PROPERTIES;
        case 'world': return WORLD_PROPERTIES;
        case 'atlantic': 
        default: return ATLANTIC_PROPERTIES;
    }
}

// 获取当前城市信息
function getCityInfo(cityId) {
    return CITIES[cityId] || CITIES.atlantic;
}

// 获取棋盘格子数据
function getBoardTiles(cityId) {
    return BOARD_TILES[cityId] || BOARD_TILES.atlantic;
}
