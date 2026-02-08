// properties.js - 地产数据

const PROPERTIES = [
    // 棕色组
    {
        position: 1,
        name: "地中海大道",
        type: "STREET",
        color: "brown",
        price: 60,
        rent: [2, 10, 30, 90, 160, 250],
        houseCost: 50,
        mortgageValue: 30,
        image: "01_medave_front.png"
    },
    {
        position: 3,
        name: "波罗的海大道",
        type: "STREET",
        color: "brown",
        price: 60,
        rent: [4, 20, 60, 180, 320, 450],
        houseCost: 50,
        mortgageValue: 30,
        image: "02_balticave_front.png"
    },
    
    // 浅蓝组
    {
        position: 6,
        name: "东方大道",
        type: "STREET",
        color: "lightblue",
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        houseCost: 50,
        mortgageValue: 50,
        image: "04_orientalave_front.png"
    },
    {
        position: 8,
        name: "佛蒙特大道",
        type: "STREET",
        color: "lightblue",
        price: 100,
        rent: [6, 30, 90, 270, 400, 550],
        houseCost: 50,
        mortgageValue: 50,
        image: "05_vermontave_front.png"
    },
    {
        position: 9,
        name: "康涅狄格大道",
        type: "STREET",
        color: "lightblue",
        price: 120,
        rent: [8, 40, 100, 300, 450, 600],
        houseCost: 50,
        mortgageValue: 60,
        image: "06_ctave_front.png"
    },
    
    // 粉色组
    {
        position: 11,
        name: "圣查尔斯广场",
        type: "STREET",
        color: "pink",
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        houseCost: 100,
        mortgageValue: 70,
        image: "07_stcharles_front.png"
    },
    {
        position: 13,
        name: "州立大道",
        type: "STREET",
        color: "pink",
        price: 140,
        rent: [10, 50, 150, 450, 625, 750],
        houseCost: 100,
        mortgageValue: 70,
        image: "08_statesave_front.png"
    },
    {
        position: 14,
        name: "弗吉尼亚大道",
        type: "STREET",
        color: "pink",
        price: 160,
        rent: [12, 60, 180, 500, 700, 900],
        houseCost: 100,
        mortgageValue: 80,
        image: "09_virginiaave_front.png"
    },
    
    // 橙色组
    {
        position: 16,
        name: "圣詹姆斯广场",
        type: "STREET",
        color: "orange",
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        houseCost: 100,
        mortgageValue: 90,
        image: "11_stjames_front.png"
    },
    {
        position: 18,
        name: "田纳西大道",
        type: "STREET",
        color: "orange",
        price: 180,
        rent: [14, 70, 200, 550, 750, 950],
        houseCost: 100,
        mortgageValue: 90,
        image: "11_tennave_front.png"
    },
    {
        position: 19,
        name: "纽约大道",
        type: "STREET",
        color: "orange",
        price: 200,
        rent: [16, 80, 220, 600, 800, 1000],
        houseCost: 100,
        mortgageValue: 100,
        image: "12_nyave_front.png"
    },
    
    // 红色组
    {
        position: 21,
        name: "肯塔基大道",
        type: "STREET",
        color: "red",
        price: 220,
        rent: [18, 90, 250, 700, 875, 1050],
        houseCost: 150,
        mortgageValue: 110,
        image: "13_kyave_front.png"
    },
    {
        position: 23,
        name: "印第安纳大道",
        type: "STREET",
        color: "red",
        price: 220,
        rent: [18, 90, 250, 700, 875, 1050],
        houseCost: 150,
        mortgageValue: 110,
        image: "14_indianaave_front.png"
    },
    {
        position: 24,
        name: "伊利诺伊大道",
        type: "STREET",
        color: "red",
        price: 240,
        rent: [20, 100, 300, 750, 925, 1100],
        houseCost: 150,
        mortgageValue: 120,
        image: "15_illinoisave_front.png"
    },
    
    // 黄色组
    {
        position: 26,
        name: "大西洋大道",
        type: "STREET",
        color: "yellow",
        price: 260,
        rent: [22, 110, 330, 800, 975, 1150],
        houseCost: 150,
        mortgageValue: 130,
        image: "17_atlanticave_front.png"
    },
    {
        position: 27,
        name: "文特诺大道",
        type: "STREET",
        color: "yellow",
        price: 260,
        rent: [22, 110, 330, 800, 975, 1150],
        houseCost: 150,
        mortgageValue: 130,
        image: "18_ventnorave_front.png"
    },
    {
        position: 29,
        name: "马文花园",
        type: "STREET",
        color: "yellow",
        price: 280,
        rent: [24, 120, 360, 850, 1025, 1200],
        houseCost: 150,
        mortgageValue: 140,
        image: "19_marvingard_front.png"
    },
    
    // 绿色组
    {
        position: 31,
        name: "太平洋大道",
        type: "STREET",
        color: "green",
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1275],
        houseCost: 200,
        mortgageValue: 150,
        image: "20_pacificave_front.png"
    },
    {
        position: 32,
        name: "北卡罗来纳大道",
        type: "STREET",
        color: "green",
        price: 300,
        rent: [26, 130, 390, 900, 1100, 1275],
        houseCost: 200,
        mortgageValue: 150,
        image: "21_ncarolinaave_front.png"
    },
    {
        position: 34,
        name: "宾夕法尼亚大道",
        type: "STREET",
        color: "green",
        price: 320,
        rent: [28, 150, 450, 1000, 1200, 1400],
        houseCost: 200,
        mortgageValue: 160,
        image: "22_pennave_front.png"
    },
    
    // 深蓝组
    {
        position: 37,
        name: "公园广场",
        type: "STREET",
        color: "blue",
        price: 350,
        rent: [35, 175, 500, 1100, 1300, 1500],
        houseCost: 200,
        mortgageValue: 175,
        image: "24_parkplace_front.png"
    },
    {
        position: 39,
        name: "海滨大道",
        type: "STREET",
        color: "blue",
        price: 400,
        rent: [50, 200, 600, 1400, 1700, 2000],
        houseCost: 200,
        mortgageValue: 200,
        image: "25_boardwalk_front.png"
    },
    
    // 铁路
    {
        position: 5,
        name: "里丁铁路",
        type: "RAILROAD",
        color: "railroad",
        price: 200,
        rent: [25, 50, 100, 200],
        mortgageValue: 100,
        image: "03_readingrr_front.png"
    },
    {
        position: 15,
        name: "宾夕法尼亚铁路",
        type: "RAILROAD",
        color: "railroad",
        price: 200,
        rent: [25, 50, 100, 200],
        mortgageValue: 100,
        image: "10_pennrr_front.png"
    },
    {
        position: 25,
        name: "B&O铁路",
        type: "RAILROAD",
        color: "railroad",
        price: 200,
        rent: [25, 50, 100, 200],
        mortgageValue: 100,
        image: "16_borr_front.png"
    },
    {
        position: 35,
        name: "短线铁路",
        type: "RAILROAD",
        color: "railroad",
        price: 200,
        rent: [25, 50, 100, 200],
        mortgageValue: 100,
        image: "23_shortlinerr_front.png"
    },
    
    // 公用事业
    {
        position: 12,
        name: "电力公司",
        type: "UTILITY",
        color: "utility",
        price: 150,
        mortgageValue: 75,
        image: "08_electricco_front.png"
    },
    {
        position: 28,
        name: "自来水公司",
        type: "UTILITY",
        color: "utility",
        price: 150,
        mortgageValue: 75,
        image: "18_water_front.png"
    }
];

// 颜色组映射
const COLOR_GROUPS = {
    brown: [1, 3],
    lightblue: [6, 8, 9],
    pink: [11, 13, 14],
    orange: [16, 18, 19],
    red: [21, 23, 24],
    yellow: [26, 27, 29],
    green: [31, 32, 34],
    blue: [37, 39]
};

// 铁路位置
const RAILROADS = [5, 15, 25, 35];

// 公用事业位置
const UTILITIES = [12, 28];

// 棋子数据
const TOKENS = [
    { id: 'car', name: '汽车' },
    { id: 'dog', name: '小狗' },
    { id: 'hat', name: '礼帽' },
    { id: 'iron', name: '熨斗' },
    { id: 'ship', name: '战舰' },
    { id: 'shoe', name: '皮鞋' },
    { id: 'thimble', name: '顶针' },
    { id: 'wheelbarrow', name: '手推车' }
];

// 棋盘格子位置（百分比坐标）- 匹配自绘棋盘
// 角落 12%，普通格子 8.44%
const TILE_POSITIONS = [
    // 底边 (0-10): 右下角到左下角
    { x: 94, y: 94 },   // 0: GO (角落)
    { x: 84, y: 94 },   // 1: 地中海
    { x: 75, y: 94 },   // 2: 命运
    { x: 67, y: 94 },   // 3: 波罗的海
    { x: 58, y: 94 },   // 4: 所得税
    { x: 50, y: 94 },   // 5: 雷丁铁路
    { x: 42, y: 94 },   // 6: 东方
    { x: 33, y: 94 },   // 7: 机会
    { x: 25, y: 94 },   // 8: 佛蒙特
    { x: 16, y: 94 },   // 9: 康州
    { x: 6, y: 94 },    // 10: 监狱 (角落)
    
    // 左边 (11-19): 左下到左上
    { x: 6, y: 84 },    // 11: 圣查尔斯
    { x: 6, y: 75 },    // 12: 电力公司
    { x: 6, y: 67 },    // 13: 州立
    { x: 6, y: 58 },    // 14: 弗吉尼亚
    { x: 6, y: 50 },    // 15: 宾州铁路
    { x: 6, y: 42 },    // 16: 圣詹姆斯
    { x: 6, y: 33 },    // 17: 命运
    { x: 6, y: 25 },    // 18: 田纳西
    { x: 6, y: 16 },    // 19: 纽约
    
    // 顶边 (20-30): 左上到右上
    { x: 6, y: 6 },     // 20: 免费停车 (角落)
    { x: 16, y: 6 },    // 21: 肯塔基
    { x: 25, y: 6 },    // 22: 机会
    { x: 33, y: 6 },    // 23: 印第安纳
    { x: 42, y: 6 },    // 24: 伊利诺伊
    { x: 50, y: 6 },    // 25: B&O铁路
    { x: 58, y: 6 },    // 26: 大西洋
    { x: 67, y: 6 },    // 27: 文特诺
    { x: 75, y: 6 },    // 28: 自来水
    { x: 84, y: 6 },    // 29: 马文
    { x: 94, y: 6 },    // 30: 入狱 (角落)
    
    // 右边 (31-39): 右上到右下
    { x: 94, y: 16 },   // 31: 太平洋
    { x: 94, y: 25 },   // 32: 北卡
    { x: 94, y: 33 },   // 33: 命运
    { x: 94, y: 42 },   // 34: 宾州大道
    { x: 94, y: 50 },   // 35: 短线铁路
    { x: 94, y: 58 },   // 36: 机会
    { x: 94, y: 67 },   // 37: 公园广场
    { x: 94, y: 75 },   // 38: 奢侈税
    { x: 94, y: 84 },   // 39: 木板路
];

// 特殊格子
const SPECIAL_TILES = {
    0: { type: 'GO', name: '起点' },
    2: { type: 'CHEST', name: '命运' },
    4: { type: 'TAX', name: '所得税', amount: 200 },
    7: { type: 'CHANCE', name: '机会' },
    10: { type: 'JAIL', name: '监狱' },
    17: { type: 'CHEST', name: '命运' },
    20: { type: 'FREE_PARKING', name: '免费停车' },
    22: { type: 'CHANCE', name: '机会' },
    30: { type: 'GO_TO_JAIL', name: '入狱' },
    33: { type: 'CHEST', name: '命运' },
    36: { type: 'CHANCE', name: '机会' },
    38: { type: 'TAX', name: '奢侈税', amount: 100 }
};
