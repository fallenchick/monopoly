// chest.js - 命运卡（公益金）数据

const CHEST_CARDS = [
    {
        text: "银行错误对你有利，收取 $200",
        action: "RECEIVE",
        amount: 200
    },
    {
        text: "医生费用，支付 $50",
        action: "PAY",
        amount: 50
    },
    {
        text: "股票出售，收取 $50",
        action: "RECEIVE",
        amount: 50
    },
    {
        text: "出狱免费卡。可保留至需要时使用或出售",
        action: "JAIL_FREE"
    },
    {
        text: "入狱。直接去监狱",
        action: "JAIL"
    },
    {
        text: "节日基金到期，收取 $100",
        action: "RECEIVE",
        amount: 100
    },
    {
        text: "所得税退款，收取 $20",
        action: "RECEIVE",
        amount: 20
    },
    {
        text: "人寿保险到期，收取 $100",
        action: "RECEIVE",
        amount: 100
    },
    {
        text: "医院费用，支付 $100",
        action: "PAY",
        amount: 100
    },
    {
        text: "学费，支付 $50",
        action: "PAY",
        amount: 50
    },
    {
        text: "咨询费，收取 $25",
        action: "RECEIVE",
        amount: 25
    },
    {
        text: "街道维修：每栋房子支付$40，每家酒店支付$115",
        action: "REPAIR",
        houseCost: 40,
        hotelCost: 115
    },
    {
        text: "选美比赛二等奖，收取 $10",
        action: "RECEIVE",
        amount: 10
    },
    {
        text: "你继承了 $100",
        action: "RECEIVE",
        amount: 100
    },
    {
        text: "前进到起点（收取$200）",
        action: "GOTO",
        position: 0
    },
    {
        text: "今天是你的生日！每位玩家给你 $10",
        action: "RECEIVE_EACH",
        amount: 10
    }
];
