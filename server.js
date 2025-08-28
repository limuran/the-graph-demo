// server.js - The Graph API 代理服务器
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// 启用CORS和JSON解析
app.use(cors());
app.use(express.json());

// The Graph Subgraph URLs
const SUBGRAPH_URLS = {
  'uniswap-v3': 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  'uniswap-v2': 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
  'ens': 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  'compound-v2': 'https://api.thegraph.com/subgraphs/name/messari/compound-v2-ethereum',
  'aave-v3': 'https://api.thegraph.com/subgraphs/name/messari/aave-v3-ethereum',
  'ethereum-blocks': 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  'sushiswap': 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
  'curve': 'https://api.thegraph.com/subgraphs/name/messari/curve-finance-ethereum',
  'balancer-v2': 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
  'lido': 'https://api.thegraph.com/subgraphs/name/lidofinance/lido',
};

// GraphQL查询代理
app.post('/api/graph/:subgraph', async (req, res) => {
  const { subgraph } = req.params;
  const { query, variables } = req.body;

  const url = SUBGRAPH_URLS[subgraph];
  
  if (!url) {
    return res.status(400).json({ error: `Unknown subgraph: ${subgraph}` });
  }

  try {
    console.log(`📡 Querying ${subgraph}:`, query.substring(0, 100) + '...');
    
    const response = await axios.post(url, {
      query,
      variables
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log(`✅ Success for ${subgraph}`);
    res.json(response.data);
  } catch (error) {
    console.error(`❌ Error querying ${subgraph}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to query The Graph', 
      details: error.response?.data || error.message 
    });
  }
});

// 预定义的查询端点

// 1. 根据钱包地址获取交易历史
app.get('/api/wallet/:address/transactions', async (req, res) => {
  const { address } = req.params;
  const { limit = 10 } = req.query;

  const query = `
    query GetWalletTransactions($address: String!, $limit: Int!) {
      swaps(
        first: $limit
        where: { 
          or: [
            { sender: $address }
            { recipient: $address }
          ]
        }
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        transaction {
          id
          blockNumber
          timestamp
        }
        sender
        recipient
        amount0
        amount1
        token0 {
          symbol
          name
          decimals
        }
        token1 {
          symbol
          name
          decimals
        }
        amountUSD
      }
    }
  `;

  try {
    const response = await axios.post(SUBGRAPH_URLS['uniswap-v3'], {
      query,
      variables: { 
        address: address.toLowerCase(),
        limit: parseInt(limit)
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// 2. 根据交易哈希获取详情
app.get('/api/transaction/:txHash', async (req, res) => {
  const { txHash } = req.params;

  const query = `
    query GetTransaction($txHash: String!) {
      transaction(id: $txHash) {
        id
        blockNumber
        timestamp
        gasUsed
        gasPrice
        swaps {
          id
          sender
          recipient
          amount0
          amount1
          amountUSD
          token0 {
            symbol
            name
          }
          token1 {
            symbol
            name
          }
        }
        mints {
          id
          sender
          amount0
          amount1
          amountUSD
        }
        burns {
          id
          owner
          amount0
          amount1
          amountUSD
        }
      }
    }
  `;

  try {
    const response = await axios.post(SUBGRAPH_URLS['uniswap-v3'], {
      query,
      variables: { txHash: txHash.toLowerCase() }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// 3. 根据区块编号获取信息
app.get('/api/block/:blockNumber', async (req, res) => {
  const { blockNumber } = req.params;

  const query = `
    query GetBlock($blockNumber: Int!) {
      blocks(where: { number: $blockNumber }) {
        id
        number
        timestamp
        gasUsed
        gasLimit
        baseFeePerGas
        difficulty
        totalDifficulty
        size
        author
      }
    }
  `;

  try {
    const response = await axios.post(SUBGRAPH_URLS['ethereum-blocks'], {
      query,
      variables: { blockNumber: parseInt(blockNumber) }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch block data' });
  }
});

// 4. 获取代币价格和流动性信息
app.get('/api/token/:tokenAddress', async (req, res) => {
  const { tokenAddress } = req.params;

  const query = `
    query GetTokenInfo($tokenAddress: String!) {
      token(id: $tokenAddress) {
        id
        symbol
        name
        decimals
        derivedETH
        totalSupply
        tradeVolume
        totalLiquidity
        txCount
        poolCount
        whitelistPools {
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          totalValueLockedUSD
        }
      }
    }
  `;

  try {
    const response = await axios.post(SUBGRAPH_URLS['uniswap-v3'], {
      query,
      variables: { tokenAddress: tokenAddress.toLowerCase() }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token info' });
  }
});

// 5. 获取ENS域名信息
app.get('/api/ens/:name', async (req, res) => {
  const { name } = req.params;

  const query = `
    query GetENSDomain($name: String!) {
      domains(where: { name: $name }) {
        id
        name
        labelName
        labelhash
        parent {
          name
        }
        owner {
          id
        }
        resolver {
          id
          address
        }
        ttl
        registrationDate
        expiryDate
      }
    }
  `;

  try {
    const response = await axios.post(SUBGRAPH_URLS['ens'], {
      query,
      variables: { name }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ENS domain' });
  }
});

// 6. 获取流动性池信息
app.get('/api/pool/:poolAddress', async (req, res) => {
  const { poolAddress } = req.params;

  const query = `
    query GetPool($poolAddress: String!) {
      pool(id: $poolAddress) {
        id
        token0 {
          id
          symbol
          name
          decimals
        }
        token1 {
          id
          symbol
          name
          decimals
        }
        feeTier
        liquidity
        sqrtPrice
        token0Price
        token1Price
        volumeUSD
        volumeToken0
        volumeToken1
        txCount
        totalValueLockedToken0
        totalValueLockedToken1
        totalValueLockedUSD
      }
    }
  `;

  try {
    const response = await axios.post(SUBGRAPH_URLS['uniswap-v3'], {
      query,
      variables: { poolAddress: poolAddress.toLowerCase() }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pool info' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    availableSubgraphs: Object.keys(SUBGRAPH_URLS),
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 The Graph proxy server running on http://localhost:${PORT}`);
  console.log('📊 Available subgraphs:', Object.keys(SUBGRAPH_URLS).join(', '));
  console.log('\n💡 使用说明:');
  console.log('1. 确保安装了所有依赖: npm install');
  console.log('2. 启动前端应用: npm start (在另一个终端)');
  console.log('3. 现在可以查询真实的区块链数据了！\n');
});
