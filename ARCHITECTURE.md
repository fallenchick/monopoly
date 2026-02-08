# 大富翁游戏 - 技术架构文档

## 1. 项目概述

基于 MONOPOLY 2012 Edition 素材制作的网页版大富翁游戏，支持2-4人本地热座模式。

## 2. 目录结构

```
monopoly/
├── index.html          # 入口页面
├── css/
│   ├── main.css        # 主样式
│   ├── board.css       # 棋盘样式
│   ├── cards.css       # 卡片样式
│   └── animations.css  # 动画效果
├── js/
│   ├── main.js         # 入口，初始化游戏
│   ├── Game.js         # 游戏主控制器（状态机）
│   ├── Board.js        # 棋盘逻辑与渲染
│   ├── Player.js       # 玩家类
│   ├── Property.js     # 地产类
│   ├── Dice.js         # 骰子逻辑与动画
│   ├── CardDeck.js     # 机会/命运卡牌组
│   ├── UI.js           # UI交互控制
│   ├── Audio.js        # 音效管理
│   └── data/
│       ├── properties.js   # 地产数据
│       ├── chance.js       # 机会卡数据
│       └── chest.js        # 命运卡数据
├── assets/
│   ├── board/          # 棋盘图片
│   ├── tokens/         # 棋子图标
│   ├── cards/          # 卡片图片
│   ├── properties/     # 地产卡图片
│   └── audio/          # 音效文件
└── ARCHITECTURE.md     # 本文档
```

## 3. 核心类设计

### 3.1 Game（游戏主控制器）

```javascript
class Game {
  // 状态
  state: 'SETUP' | 'ROLLING' | 'MOVING' | 'ACTION' | 'TRADE' | 'END'
  players: Player[]
  currentPlayerIndex: number
  board: Board
  chanceDeck: CardDeck
  chestDeck: CardDeck
  
  // 方法
  init(playerCount, tokenChoices)
  nextTurn()
  rollDice()
  movePlayer(steps)
  handleTileAction(tile)
  checkBankruptcy(player)
  endGame(winner)
}
```

### 3.2 Player（玩家）

```javascript
class Player {
  id: number
  name: string
  token: string           // 棋子类型
  position: number        // 当前位置 (0-39)
  money: number           // 现金
  properties: Property[]  // 拥有的地产
  inJail: boolean
  jailTurns: number
  getOutOfJailCards: number
  
  // 方法
  addMoney(amount)
  deductMoney(amount)     // 返回是否足够
  calculateNetWorth()
  canAfford(amount)
  mortgage(property)
  unmortgage(property)
}
```

### 3.3 Property（地产）

```javascript
class Property {
  id: number
  name: string
  type: 'STREET' | 'RAILROAD' | 'UTILITY'
  color: string           // 颜色组
  price: number
  rent: number[]          // [基础, 1房, 2房, 3房, 4房, 酒店]
  houseCost: number
  hotelCost: number
  mortgageValue: number
  owner: Player | null
  houses: number          // 0-4
  hasHotel: boolean
  isMortgaged: boolean
  
  // 方法
  calculateRent()
  buildHouse()
  buildHotel()
  demolish()
}
```

### 3.4 Board（棋盘）

```javascript
class Board {
  tiles: Tile[]           // 40个格子
  
  // 格子类型
  // 0: GO | 10: JAIL | 20: FREE_PARKING | 30: GO_TO_JAIL
  // 2,17,33: CHEST | 7,22,36: CHANCE
  // 4,38: TAX | 其余: PROPERTY
  
  // 方法
  getTile(position)
  getPropertiesByColor(color)
  render()
}
```

### 3.5 Dice（骰子）

```javascript
class Dice {
  die1: number
  die2: number
  
  // 方法
  roll()                  // 返回 {total, isDouble}
  animate()               // 骰子动画
}
```

## 4. 游戏流程状态机

```
SETUP → ROLLING → MOVING → ACTION → (TRADE) → ROLLING...
                              ↓
                            END
```

### 4.1 回合流程

1. **ROLLING**: 当前玩家掷骰子
2. **MOVING**: 棋子移动动画
3. **ACTION**: 根据落点执行操作
   - 地产格：可购买/付租金
   - 机会/命运：抽卡执行
   - 税格：扣款
   - 入狱：移动到监狱
   - GO：领取$200
4. **回合结束前**：可选择建房/抵押/交易
5. 如掷出双数且<3次，再掷一次；连续3次双数入狱

### 4.2 监狱规则

- 入狱方式：踩到"入狱"格、抽到入狱卡、连续3次双数
- 出狱方式：支付$50、使用出狱卡、掷出双数（3次机会）

## 5. 数据结构

### 5.1 地产数据 (properties.js)

```javascript
export const PROPERTIES = [
  {
    position: 1,
    name: "地中海大道",
    type: "STREET",
    color: "brown",
    price: 60,
    rent: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
    mortgageValue: 30
  },
  // ... 共28个地产
];
```

### 5.2 棋盘格子 (40格)

| 位置 | 类型 | 名称 |
|-----|------|------|
| 0 | GO | 起点 |
| 1 | STREET | 地中海大道 |
| 2 | CHEST | 命运 |
| ... | ... | ... |
| 39 | STREET | 木板路 |

## 6. UI布局

```
┌─────────────────────────────────────┐
│            棋盘区域                  │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │        中央信息区            │   │
│  │    (当前玩家/骰子/消息)      │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  玩家1信息 │ 玩家2信息 │ 玩家3... │
│  $1500    │  $1200   │          │
│  地产列表  │ 地产列表  │          │
├─────────────────────────────────────┤
│  [掷骰子] [买地产] [建房] [交易]    │
└─────────────────────────────────────┘
```

## 7. 素材映射

从 `E:\小游戏\MONOPOLY2012Edition` 复制：

| 源路径 | 目标路径 | 用途 |
|-------|---------|------|
| `rules_classic/textures/boards/zhCN/board.png` | `assets/board/board.png` | 棋盘背景 |
| `tokens/token_classic_*/images/icon.png` | `assets/tokens/*.png` | 棋子图标 |
| `rules_classic/textures/boards/zhCN/*_front.png` | `assets/properties/*.png` | 地产卡 |
| `rules_classic/textures/cards/*.png` | `assets/cards/*.png` | 机会/命运卡 |
| `audio/*.wav` | `assets/audio/*.wav` | 音效 |

## 8. 技术要点

### 8.1 棋盘渲染

- 使用 CSS Grid 布局 40 个格子
- 棋盘为正方形，每边 11 格（含4角）
- 格子位置通过 CSS 定位映射

### 8.2 动画

- 骰子：CSS 3D 旋转 + requestAnimationFrame
- 移动：棋子沿路径逐格跳跃
- 卡片：翻转显示效果

### 8.3 响应式

- 桌面优先，最小宽度 1024px
- 棋盘等比缩放 (vmin 单位)

## 9. 开发步骤

1. **Phase 1 - 基础框架** ✅
   - [x] 目录结构
   - [x] HTML 骨架
   - [x] 棋盘 CSS 布局
   - [x] 素材复制

2. **Phase 2 - 核心逻辑** ✅
   - [x] 玩家/地产类 (Player.js, Property.js)
   - [x] 骰子逻辑 (Dice.js)
   - [x] 回合系统 (Game.js)
   - [x] 移动与落点处理

3. **Phase 3 - 交互** ✅
   - [x] 购买地产
   - [x] 建房/酒店
   - [x] 抵押/赎回
   - [x] 卡牌效果 (CardDeck.js)

4. **Phase 4 - 完善** ✅
   - [x] 音效 (Audio.js)
   - [x] 动画 (animations.css)
   - [x] 胜负判定
   - [ ] 交易系统（可选）

## 10. 测试用例

- 起点领钱 $200
- 购买空地产
- 落到他人地产付租
- 凑齐同色建房
- 入狱/出狱流程
- 抵押/赎回
- 破产判定
