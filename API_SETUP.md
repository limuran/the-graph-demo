# 🔧 API 设置指南

现在项目已经解决了CORS问题，并使用了本地代理服务器。为了查询真实的区块链数据，你需要配置API密钥。

## 📋 当前状态

✅ **已完成**:
- CORS问题已解决
- Express代理服务器运行正常
- React应用可以访问本地API
- 前端和后端同时启动

⚠️ **需要配置**:
- Etherscan API密钥（免费）

## 🚀 快速开始

### 1. 获取Etherscan API密钥（免费）

1. 访问 [https://etherscan.io/apis](https://etherscan.io/apis)
2. 注册免费账户
3. 创建API密钥
4. 复制你的API密钥

### 2. 配置API密钥

在 `server.js` 文件中，找到第13行：

```javascript
ETHERSCAN_API_KEY: '', // 在这里填入你的API密钥
```

替换为：

```javascript
ETHERSCAN_API_KEY: 'YOUR_API_KEY_HERE', // 替换为你的实际API密钥
```

### 3. 重启服务器

```bash
npm start
```

## 🧪 测试功能

配置完成后，你可以测试以下功能：

### 区块查询
- 输入块号如：`18000000`, `19000000`
- 查看区块详情：时间戳、交易数量、Gas使用等

### 钱包地址查询  
- 输入以太坊地址如：`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`
- 查看：账户余额、交易历史

## 📊 数据来源

- **区块数据**: Etherscan API
- **交易数据**: Etherscan API  
- **余额数据**: Etherscan API

## 🔄 替代方案

如果不想注册API密钥，可以考虑：

1. **演示模式**: 使用预设的模拟数据
2. **其他服务**: 如Alchemy、Infura（都需要注册）
3. **The Graph Studio**: 使用付费的Graph Network端点

## 🎯 学习目标

这个项目帮助你了解：
- 如何解决Web3应用中的CORS问题
- 如何设置代理服务器
- 如何查询区块链数据
- The Graph协议的工作原理

## 🐛 常见问题

**Q: 为什么不能直接使用The Graph的免费端点？**
A: The Graph Hosted Service已于2024年弃用，新的Graph Network需要付费或API密钥。

**Q: 有没有完全免费的方案？**  
A: Etherscan提供免费API，每秒5个请求限制，足够学习使用。

**Q: 数据更新频率如何？**
A: Etherscan数据通常有几秒到几分钟的延迟。

---

需要帮助？检查控制台日志或查看 `CORS-SOLUTIONS.md`。