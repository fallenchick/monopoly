// chance.js - 机会卡数据
// 注意：带 position 的卡片会在显示时动态获取当前城市的地名

const CHANCE_CARDS = [
    {
        text: "银行付给你股息 $50",
        action: "RECEIVE",
        amount: 50
    },
    {
        text: "前进到起点（收取$200）",
        action: "GOTO",
        position: 0
    },
    {
        text: "前进到{position24}。如果经过起点，收取$200",
        action: "GOTO",
        position: 24,
        dynamicText: true
    },
    {
        text: "前进到{position11}。如果经过起点，收取$200",
        action: "GOTO",
        position: 11,
        dynamicText: true
    },
    {
        text: "前进到最近的火车站，向拥有者支付双倍租金",
        action: "NEAREST_RAILROAD"
    },
    {
        text: "前进到最近的火车站，向拥有者支付双倍租金",
        action: "NEAREST_RAILROAD"
    },
    {
        text: "前进到最近的公用事业公司。如果无人拥有可购买；如果已有人拥有，掷骰子并支付结果的10倍",
        action: "NEAREST_UTILITY"
    },
    {
        text: "你被选为董事会主席。支付每位玩家 $50",
        action: "PAY_EACH",
        amount: 50
    },
    {
        text: "后退三步",
        action: "BACK",
        steps: 3
    },
    {
        text: "入狱。直接去监狱，不经过起点，不收取$200",
        action: "JAIL"
    },
    {
        text: "出狱免费卡。可保留至需要时使用或出售",
        action: "JAIL_FREE"
    },
    {
        text: "房屋维修：每栋房子支付$25，每家酒店支付$100",
        action: "REPAIR",
        houseCost: 25,
        hotelCost: 100
    },
    {
        text: "超速罚款 $15",
        action: "PAY",
        amount: 15
    },
    {
        text: "乘坐{position5}。如果经过起点，收取$200",
        action: "GOTO",
        position: 5,
        dynamicText: true
    },
    {
        text: "前进到{position39}",
        action: "GOTO",
        position: 39,
        dynamicText: true
    },
    {
        text: "建筑贷款到期，收取 $150",
        action: "RECEIVE",
        amount: 150
    }
];
