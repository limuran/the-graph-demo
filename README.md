# 🚀 The Graph Demo - 自建子图区块链数据平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

> 🎯 **零成本替代付费The Graph方案** - 基于自建子图的区块链数据查询平台

## 📖 项目简介

这是一个**完全免费**的区块链数据查询平台，通过自建子图替代昂贵的The Graph付费服务，实现零运营成本的数据查询解决方案。

### 💰 成本对比

| 方案 | 月费用 | 查询限制 | 数据控制 | 扩展性 |
|------|--------|----------|----------|--------|
| 付费The Graph | **$100+** | ❌ 有限制 | ❌ 受限 | ⚠️ 依赖官方子图 |
| **自建方案** | **$0** | ✅ 无限制 | ✅ 完全控制 | ✅ 完全可定制 |

### 🎯 核心优势

- 🆓 **零成本运营** - 无需支付任何API费用
- ⚡ **无查询限制** - 想查多少次就查多少次
- 🎛️ **完全可控** - 自定义数据结构和查询逻辑
- 📊 **实时数据** - 直接从区块链同步最新数据
- 🔧 **易于扩展** - 轻松添加新合约和数据源
- 🌐 **多网络支持** - 支持主网、测试网等多个网络

## 🏗️ 项目架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React 前端     │────│   Node.js API    │────│   数据源组合      │
│   (localhost:3000)│    │  (localhost:3001) │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                        ┌───────────────┼───────────────┐
                                        │               │               │
                                ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
                                │  自建子图     │ │ Etherscan API │ │   直接链查询   │
                                │   (免费)     │ │   (免费)      │ │   (免费)      │
                                └──────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 快速开始

### 方式一：一键启动（推荐）

```bash
# 克隆项目
git clone https://github.com/limuran/the-graph-demo.git
cd the-graph-demo

# 一键启动
chmod +x quick-start.sh
./quick-start.sh start
```

### 方式二：手动启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 3. 启动服务
npm run dev

# 或分别启动前后端
npm run server-hybrid  # 后端 (端口 3001)
npm run client          # 前端 (端口 3000)
```

## 📋 环境要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Docker** (可选，用于本地Graph Node)

## ⚙️ 配置说明

### .env 配置文件

```bash
# ===== 自建子图配置 (免费) =====
# 本地开发环境
CUSTOM_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/limuran/usdt-data-tracker

# Graph Studio 部署版本
# CUSTOM_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/usdt-data-tracker/version/latest

# ===== Etherscan API (免费额度) =====
ETHERSCAN_API_KEY=your_etherscan_api_key

# ===== 服务器配置 =====
PORT=3001
DEFAULT_NETWORK=sepolia

# ===== USDT测试合约 =====
USDT_CONTRACT_ADDRESS=0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0
```

### 网络配置

项目支持多个网络，默认使用 Sepolia 测试网：

| 网络 | Chain ID | 说明 |
|------|----------|------|
| mainnet | 1 | 以太坊主网 |
| sepolia | 11155111 | Sepolia 测试网 (推荐) |

## 🔗 API 端点

### 自建子图 API (免费)

| 端点 | 方法 | 描述 | 示例 |
|------|------|------|------|
| `/api/usdt/transfers` | GET | 获取USDT转账记录 | `?first=20&skip=0` |
| `/api/usdt/user` | POST | 查询用户USDT活动 | `{"address": "0x..."}` |
| `/api/usdt/stats` | GET | 获取代币统计信息 | - |
| `/api/usdt/daily-stats` | GET | 获取每日统计数据 | `?days=7` |

### 链上查询 API (免费)

| 端点 | 方法 | 描述 | 示例 |
|------|------|------|------|
| `/api/contract/at-block` | POST | 合约+块ID查询 | `{"contractAddress": "0x...", "blockId": "5000000"}` |
| `/api/block` | POST | 区块信息查询 | `{"input": "5000000"}` |
| `/api/hybrid/transaction-analysis` | POST | 混合交易分析 | `{"txHash": "0x..."}` |

### 系统 API

| 端点 | 方法 | 描述 |
|------|------|------|
| `/health` | GET | 系统健康检查 |
| `/api/config` | GET | 配置状态查询 |
| `/api/network/switch` | POST | 网络切换 |

## 📊 数据源说明

### 1. 自建子图 (主要数据源)

基于你的 [usdt-data-tracker](https://github.com/limuran/usdt-data-tracker) 子图：

- **合约地址**: `0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0`
- **网络**: Sepolia 测试网
- **数据类型**: USDT转账、用户统计、代币信息、每日统计
- **成本**: 完全免费
- **更新频率**: 实时同步

### 2. Etherscan API (备用数据源)

- **用途**: 区块查询、交易查询、合约状态查询
- **限额**: 免费 10万次/天
- **网络**: 支持主网、测试网
- **响应速度**: 快速

### 3. 直接链查询

- **用途**: 实时区块链状态查询
- **特点**: 最新数据，无延迟
- **成本**: 免费（使用公共RPC）

## 🎨 功能特性

### 📈 数据展示

- **转账记录**: 实时USDT转账数据，支持分页查询
- **用户分析**: 用户USDT活动统计，包括发送/接收记录
- **代币统计**: 代币基本信息、交易量、持有人数等
- **每日统计**: 按日统计交易量、活跃用户数等
- **合约查询**: 通过合约地址+块ID查询历史状态

### 🔍 查询功能

- **地址查询**: 输入钱包地址查询相关活动
- **交易分析**: 混合数据源分析单笔交易
- **实时监控**: 实时显示最新转账记录
- **历史数据**: 查询任意时间点的合约状态

### 🎛️ 管理功能

- **网络切换**: 支持主网/测试网切换
- **健康监控**: 实时监控各数据源状态
- **配置管理**: 灵活的环境配置
- **日志记录**: 完整的操作日志

## 🔧 部署指南

### 本地开发部署

1. **启动 Graph Node** (可选)

```bash
# 如需本地子图开发
git clone https://github.com/graphprotocol/graph-node.git
cd graph-node/docker
docker-compose up
```

2. **部署子图**

```bash
cd ../usdt-data-tracker
npm install
npm run codegen && npm run build
npm run create-local && npm run deploy-local
```

3. **启动应用**

```bash
cd ../the-graph-demo
./quick-start.sh start
```

### 生产环境部署

1. **部署子图到 Graph Studio**

```bash
# 安装 Graph CLI
npm install -g @graphprotocol/graph-cli

# 认证
graph auth --studio YOUR_DEPLOY_KEY

# 部署
cd usdt-data-tracker
graph deploy --studio usdt-data-tracker
```

2. **更新配置**

```bash
# 在 .env 中更新子图URL
CUSTOM_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/usdt-data-tracker/version/latest
```

3. **启动服务**

```bash
npm run build
npm start
```

## 🧪 使用示例

### JavaScript/Node.js

```javascript
// 获取USDT转账记录
const response = await fetch('http://localhost:3001/api/usdt/transfers?first=10');
const transfers = await response.json();

// 查询用户活动
const userResponse = await fetch('http://localhost:3001/api/usdt/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: '0x742d35Cc6Bf8fC5d7c3c0c08dc36E78967F27C5C' })
});
const userActivity = await userResponse.json();

// 合约+块查询
const blockResponse = await fetch('http://localhost:3001/api/contract/at-block', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contractAddress: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0',
    blockId: '5000000'
  })
});
const contractState = await blockResponse.json();
```

### Python

```python
import requests

# 获取转账记录
response = requests.get('http://localhost:3001/api/usdt/transfers', 
                       params={'first': 10})
transfers = response.json()

# 查询用户活动
user_response = requests.post('http://localhost:3001/api/usdt/user',
                             json={'address': '0x742d35Cc6Bf8fC5d7c3c0c08dc36E78967F27C5C'})
user_activity = user_response.json()
```

### cURL

```bash
# 获取转账记录
curl "http://localhost:3001/api/usdt/transfers?first=10"

# 查询用户活动
curl -X POST "http://localhost:3001/api/usdt/user" \
  -H "Content-Type: application/json" \
  -d '{"address": "0x742d35Cc6Bf8fC5d7c3c0c08dc36E78967F27C5C"}'

# 合约查询
curl -X POST "http://localhost:3001/api/contract/at-block" \
  -H "Content-Type: application/json" \
  -d '{"contractAddress": "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0", "blockId": "5000000"}'
```

## 📁 项目结构

```
the-graph-demo/
├── 📁 public/                  # 静态资源
├── 📁 src/                     # React 前端源码
│   ├── 📁 components/          # React 组件
│   ├── 📁 utils/              # 工具函数
│   ├── App.js                 # 主应用组件
│   └── index.js               # 入口文件
├── server-hybrid.js           # Node.js API 服务器
├── package.json               # 项目依赖配置
├── .env.example               # 环境变量示例
├── quick-start.sh            # 一键启动脚本
├── README.md                 # 项目文档
└── 📄 其他配置文件...
```

## 🛠️ 管理命令

```bash
# 启动服务
./quick-start.sh start          # 一键启动所有服务
npm run dev                     # 开发模式启动
npm run client                  # 仅启动前端
npm run server-hybrid          # 仅启动后端

# 管理服务
./quick-start.sh stop           # 停止所有服务
./quick-start.sh restart        # 重启所有服务
./quick-start.sh status         # 检查服务状态

# 查看日志
tail -f server.log              # 后端日志
tail -f client.log              # 前端日志

# 健康检查
curl http://localhost:3001/health
```

## 🔍 故障排除

### 常见问题

1. **子图连接失败**

   ```bash
   # 检查子图状态
   curl http://localhost:8000/subgraphs/name/limuran/usdt-data-tracker
   
   # 重新部署子图
   cd ../usdt-data-tracker
   npm run deploy-local
   ```

2. **端口被占用**

   ```bash
   # 查看端口使用情况
   lsof -i :3000
   lsof -i :3001
   
   # 停止服务
   ./quick-start.sh stop
   ```

3. **API调用失败**

   ```bash
   # 检查API服务状态
   curl http://localhost:3001/health
   
   # 查看后端日志
   tail -f server.log
   ```

### 调试模式

```bash
# 启用详细日志
LOG_LEVEL=debug npm run server-hybrid

# 检查环境配置
npm run config-check

# 测试数据源连接
curl http://localhost:3001/api/config
```

## 🔐 安全考虑

- ✅ 使用环境变量管理敏感配置
- ✅ API 密钥不包含在代码中
- ✅ CORS 配置防止跨域攻击
- ✅ 输入验证防止注入攻击
- ✅ 错误信息不泄露敏感信息

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交修改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交 Pull Request

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Prettier 代码格式化规范
- 编写必要的注释和文档
- 添加相应的测试用例

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。

## 🙏 致谢

- [The Graph](https://thegraph.com/) - 提供了子图技术的灵感
- [Etherscan](https://etherscan.io/) - 提供免费的区块链数据API
- [React](https://reactjs.org/) - 优秀的前端框架
- [Node.js](https://nodejs.org/) - 强大的后端运行时

## 📞 联系方式

- **作者**: limuran
- **仓库**: <https://github.com/limuran/the-graph-demo>
- **相关项目**: [USDT数据追踪子图](https://github.com/limuran/usdt-data-tracker)

---

<div align="center">

**🎉 享受零成本的区块链数据查询服务！**

</div>
