# CORS解决方案

## 问题说明
在浏览器中直接调用The Graph API会遇到CORS（跨域资源共享）错误。这是浏览器的安全机制。

## 解决方案

### 方案1: Express.js后端代理 (推荐)

创建一个简单的后端服务来代理The Graph请求：

```javascript
// server/app.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 代理The Graph请求
app.post('/api/graph/:subgraph', async (req, res) => {
  try {
    const { subgraph } = req.params;
    const graphUrl = `https://api.thegraph.com/subgraphs/name/${subgraph}`;
    
    const response = await fetch(graphUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
});
```

```json
// server/package.json
{
  "name": "graph-proxy-server",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "node-fetch": "^2.6.7"
  },
  "scripts": {
    "start": "node app.js"
  }
}
```

### 方案2: Next.js API路由

```javascript
// pages/api/graph/[...subgraph].js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { subgraph } = req.query;
      const subgraphPath = Array.isArray(subgraph) ? subgraph.join('/') : subgraph;
      const graphUrl = `https://api.thegraph.com/subgraphs/name/${subgraphPath}`;
      
      const response = await fetch(graphUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

### 方案3: 修改前端代码使用代理

```javascript
// 修改API端点，使用本地代理
const UNISWAP_ENDPOINT = "http://localhost:3001/api/graph/uniswap/uniswap-v3";
const ENS_ENDPOINT = "http://localhost:3001/api/graph/ensdomains/ens";

// 其余代码保持不变
const fetchUniswapData = async () => {
  const response = await fetch(UNISWAP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: UNISWAP_QUERY })
  });
  // ...
};
```

### 方案4: 使用The Graph Client (推荐生产环境)

```bash
npm install @graphprotocol/graph-client
```

```javascript
import { GraphQLClient } from '@graphprotocol/graph-client';

const client = new GraphQLClient({
  endpoint: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
});

const fetchData = async () => {
  const result = await client.request(UNISWAP_QUERY);
  return result;
};
```

## 当前Demo状态

为了让你能立即看到效果，当前的demo使用了模拟数据。这样你可以：
1. 理解The Graph的数据结构
2. 学习GraphQL查询语法
3. 看到完整的UI交互流程

## 生产环境建议

1. **后端API**: 最安全的方式，通过后端调用The Graph
2. **Serverless函数**: 使用Vercel、Netlify等平台的API函数
3. **专业客户端**: 使用官方的Graph Client库

这样既能学习The Graph的概念，又避免了CORS的技术障碍！