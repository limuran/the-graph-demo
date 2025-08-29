# 🌟 The Graph Demo - 混合架构版

> **使用真实的 The Graph 官方子图 + Etherscan API 的混合数据查询平台**

## 📋 你的疑问解答

### ❓ "为什么不能使用现有的子图？"

**答案：完全可以使用！** 现有子图不仅可用，而且非常活跃：

- ✅ **The Graph Network 在 2025 年 Q2 处理了 64.9 亿次查询**
- ✅ **超过 14,000 个活跃子图正在运行**  
- ✅ **官方 Uniswap、Compound、Aave 等子图都在正常工作**

### ❓ "这个子图是做什么的？"

我们使用的都是**官方认证的子图**：

| 子图名称 | 子图ID | 用途 |
|---------|--------|------|
| **Uniswap V3** | `5zvR82Q...` | DEX 交换数据、流动性池、代币价格 |
| **Uniswap V2** | `DiYPVdy...` | 传统 AMM 数据 |
| **Compound** | `A3Np3RQ...` | 借贷协议数据 |
| **AAVE** | `FUbEPQw...` | 借贷和流动性挖矿数据 |

### 🔍 项目之前的问题

原项目代码中有几个问题：
1. **错误的子图ID** - 区块和 Uniswap 使用了相同ID
2. **过时的端点** - 使用了已废弃的 Hosted Service
3. **缺少错误处理** - 没有备用方案

## 🚀 现在的混合架构解决方案

### 🏗️ 架构设计
```
用户请求
    ↓
混合路由器 (server-hybrid.js)
    ↓
┌─────────────────┬─────────────────┐
│   The Graph     │   Etherscan     │
│   (DeFi 数据)    │   (基础数据)     │
└─────────────────┴─────────────────┘
```

### 📊 数据源分工
- **Etherscan**: 区块信息、钱包余额、基础交易记录
- **The Graph**: DeFi 代币信息、交换记录、流动性数据

## ⚡ 快速开始

### 1. 克隆和安装
```bash
git clone https://github.com/limuran/the-graph-demo.git
cd the-graph-demo
npm install
```

### 2. 配置 API 密钥

#### 2.1 获取 The Graph API 密钥 (可选但推荐)
1. 访问 [The Graph Studio](https://thegraph.com/studio/)
2. 连接钱包 (MetaMask 等)
3. 创建 API 密钥
4. 设置查询预算 ($10-50 足够学习使用)

#### 2.2 获取 Etherscan API 密钥 (免费)
1. 访问 [Etherscan API](https://etherscan.io/apis)
2. 注册免费账户
3. 创建 API 密钥

#### 2.3 配置环境变量
```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件
nano .env
```

```env
# 在 .env 文件中填入你的密钥
GRAPH_API_KEY=你的_Graph_API_密钥
ETHERSCAN_API_KEY=你的_Etherscan_密钥
```

### 3. 启动项目
```bash
# 启动混合架构版本
node server-hybrid.js

# 或者同时启动前后端
npm start
```

## 🎯 功能演示

### 基础功能 (仅需 Etherscan)
```bash
# 查询区块信息
curl -X POST http://localhost:3001/api/block \
  -H "Content-Type: application/json" \
  -d '{"input": "18000000"}'

# 查询钱包信息
curl -X POST http://localhost:3001/api/wallet \
  -H "Content-Type: application/json" \
  -d '{"input": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"}'
```

### DeFi 功能 (需要 The Graph API)
```bash
# 查询代币信息 (USDC)
curl -X POST http://localhost:3001/api/defi/token \
  -H "Content-Type: application/json" \
  -d '{"address": "0xA0b86a33E6441C0C45D3c6DbdCb77A9d7a2e4b6D"}'

# 查询最近交换记录
curl http://localhost:3001/api/defi/swaps?count=5

# 检查服务状态
curl http://localhost:3001/health
```

## 📈 GraphQL 查询示例

### 直接查询 Uniswap V3 子图
```javascript
import { request, gql } from 'graphql-request';

// 使用官方 Uniswap V3 子图
const endpoint = 'https://gateway-arbitrum.network.thegraph.com/api/[YOUR-API-KEY]/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV';

// 查询热门代币
const query = gql`
  query {
    tokens(first: 10, orderBy: volumeUSD, orderDirection: desc) {
      symbol
      name
      volumeUSD
      totalValueLockedUSD
      derivedETH
    }
  }
`;

const data = await request(endpoint, query);
console.log('热门代币:', data.tokens);
```

### 复杂查询示例
```javascript
// 查询特定代币的完整信息
const tokenQuery = gql`
  query GetTokenDetails($tokenAddress: ID!) {
    token(id: $tokenAddress) {
      symbol
      name
      decimals
      # 价格历史
      tokenDayData(first: 30, orderBy: date, orderDirection: desc) {
        date
        priceUSD
        volumeUSD
        totalValueLockedUSD
      }
      # 流动性池
      whitelistPools(first: 5, orderBy: volumeUSD, orderDirection: desc) {
        id
        feeTier
        token0 { symbol }
        token1 { symbol }
        volumeUSD
        totalValueLockedUSD
      }
    }
  }
`;

// 查询示例 - WETH 代币信息
const wethData = await request(endpoint, tokenQuery, {
  tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
});
```

## 🛠️ 技术细节

### The Graph 子图详解

#### 1. **Uniswap V3 子图** 
- **子图ID**: `5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`
- **维护者**: Uniswap Labs (官方)
- **数据类型**: 交换、流动性、代币价格
- **更新频率**: 实时 (几秒延迟)
- **查询成本**: 约 $0.0001 - $0.001 每次查询

#### 2. **为什么这些子图可用？**
- 都是**官方维护**的子图，持续更新
- 有足够的**策展信号** (Curation Signal) 
- **索引器激励**充足，保证数据质量
- 查询量大，经济上可持续

### 数据对比

| 数据类型 | The Graph | Etherscan | 推荐使用 |
|---------|-----------|-----------|----------|
| 区块信息 | ❌ 无专用子图 | ✅ 完整支持 | Etherscan |
| 基础交易 | ❌ 数据有限 | ✅ 完整历史 | Etherscan |
| DeFi 交换 | ✅ 实时详细 | ❌ 不支持 | The Graph |
| 代币价格 | ✅ 历史趋势 | ❌ 不支持 | The Graph |
| 流动性池 | ✅ 完整数据 | ❌ 不支持 | The Graph |
| 钱包余额 | ❌ 不支持 | ✅ 实时准确 | Etherscan |

## 📚 实际使用教程

### 场景 1: 分析 DeFi 代币表现
```javascript
// 使用项目 API
const analyzeToken = async (tokenAddress) => {
  // 1. 获取代币基础信息
  const response = await fetch('http://localhost:3001/api/defi/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: tokenAddress })
  });
  
  const { data } = await response.json();
  
  console.log(`代币: ${data.symbol} (${data.name})`);
  console.log(`总交易量: $${data.volumeUSD.toLocaleString()}`);
  console.log(`流动性: $${data.tvlUSD.toLocaleString()}`);
  console.log(`活跃池数: ${data.pools.length}`);
  
  return data;
};

// 分析 USDC
await analyzeToken('0xA0b86a33E6441C0C45D3c6DbdCb77A9d7a2e4b6D');
```

### 场景 2: 监控大额交易
```javascript
// 实时监控交换记录
const monitorSwaps = async () => {
  const response = await fetch('http://localhost:3001/api/defi/swaps?count=20');
  const { data } = await response.json();
  
  // 筛选大额交易 (>$10,000)
  const largeSwaps = data.filter(swap => swap.amountUSD > 10000);
  
  largeSwaps.forEach(swap => {
    console.log(`🔥 大额交易: ${swap.token0.symbol}→${swap.token1.symbol}`);
    console.log(`   金额: $${swap.amountUSD.toLocaleString()}`);
    console.log(`   时间: ${new Date(swap.timestamp * 1000).toLocaleString()}`);
  });
  
  return largeSwaps;
};

// 每30秒检查一次
setInterval(monitorSwaps, 30000);
```

### 场景 3: 用户行为分析
```javascript
// 分析用户的 DeFi 活动
const analyzeUser = async (userAddress) => {
  // 1. 获取基础钱包信息
  const walletResponse = await fetch('http://localhost:3001/api/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: userAddress })
  });
  
  const walletData = await walletResponse.json();
  
  console.log(`钱包: ${userAddress}`);
  console.log(`ETH 余额: ${(parseInt(walletData.data.balance) / 1e18).toFixed(4)} ETH`);
  
  if (walletData.data.defiActivity) {
    const defi = walletData.data.defiActivity;
    console.log(`DeFi 交易: ${defi.swapCount} 笔`);
    console.log(`总交易额: $${defi.totalVolumeUSD.toLocaleString()}`);
  }
  
  return walletData.data;
};
```

## 🔍 子图生态系统

### 可用的热门子图

#### DeFi 协议
- **Uniswap V3**: 最大的 DEX，交换和流动性数据
- **Compound**: 借贷协议，利率和抵押数据  
- **Aave**: 多链借贷，闪电贷数据
- **Curve**: 稳定币交换，收益农场数据

#### 基础设施
- **ENS**: 域名解析和注册数据
- **Ethereum**: 基础区块和验证者数据
- **Snapshot**: 治理投票数据

#### NFT 和游戏
- **OpenSea**: NFT 交易市场数据
- **Foundation**: 艺术品 NFT 平台
- **Decentraland**: 虚拟世界和土地交易

### 查找更多子图
1. 访问 [The Graph Explorer](https://thegraph.com/explorer)
2. 按网络、类别筛选
3. 查看子图的查询量和信号
4. 复制子图ID到项目中使用

## 🎓 学习路径

### 初级 (1-2周): 使用现有子图
1. ✅ **运行当前混合项目**
2. ✅ **配置 API 密钥**
3. ✅ **测试基础查询**
4. ✅ **理解 GraphQL 语法**

### 中级 (3-4周): 深度使用
1. 🔍 **探索不同协议的子图**
2. 📊 **编写复杂 GraphQL 查询**
3. ⚡ **优化查询性能和成本**
4. 🔄 **集成多个子图数据**

### 高级 (1-2月): 创建子图
1. 🛠️ **学习 subgraph.yaml 配置**
2. 📝 **编写 schema.graphql**
3. ⚙️ **开发 mapping.ts 处理逻辑**
4. 🚀 **部署和发布自定义子图**

## 💰 成本和收益

### The Graph Network 费用
- **查询费用**: $0.0001 - $0.001 每次查询
- **月度预算**: $10-50 足够中小项目使用
- **企业级**: $100-1000 支持大规模应用

### 免费替代方案
- **Etherscan API**: 5 QPS 免费额度
- **Alchemy Subgraphs**: 提供托管子图服务
- **自建索引**: 运行本地 Graph Node

## 🚨 常见问题

### Q: 为什么有些子图显示 "Deprecated"？
**A**: 这些是 Hosted Service 时代的子图，已迁移到 Network。使用新的子图ID即可。

### Q: 查询成本如何控制？
**A**: 
- 使用查询缓存
- 批量查询相关数据
- 设置查询预算限制
- 监控实际使用量

### Q: 数据更新频率如何？
**A**:
- **The Graph**: 通常 10-30 秒延迟
- **Etherscan**: 几秒到几分钟延迟
- 具体取决于网络拥堵情况

### Q: 如何找到合适的子图？
**A**:
1. 访问 [Graph Explorer](https://thegraph.com/explorer)
2. 按协议名称搜索
3. 查看子图的信号量和查询量
4. 测试 playground 中的查询

## 🔗 有用链接

- [The Graph Studio](https://thegraph.com/studio/) - 创建 API 密钥
- [Graph Explorer](https://thegraph.com/explorer) - 浏览所有子图
- [Uniswap 官方文档](https://docs.uniswap.org/api/subgraph/overview) - 子图使用说明
- [GraphQL 学习](https://graphql.org/learn/) - 查询语言教程

## 📞 技术支持

如果遇到问题：
1. 检查 `/health` 端点状态
2. 查看控制台日志输出
3. 确认 API 密钥配置正确
4. 参考 `API_SETUP.md` 文档

---

**🎉 现在你可以使用真正的 The Graph 子图了！** 

这个混合架构既保证了稳定性（Etherscan），又提供了 DeFi 生态的丰富数据（The Graph）。开始探索区块链数据的无限可能吧！
