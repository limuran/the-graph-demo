require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GraphQLClient, gql } = require('graphql-request');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ===== The Graph 配置 (使用正确的官方子图ID) =====
const GRAPH_CONFIG = {
  apiKey: process.env.GRAPH_API_KEY || '',
  baseUrl: 'https://gateway-arbitrum.network.thegraph.com/api',
  subgraphs: {
    // 官方 Uniswap 子图
    uniswapV3: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    uniswapV2: 'DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G',
    
    // 其他热门子图
    compound: 'A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum',
    aave: 'FUbEPQw1oMghy39fwWBFY5fE6MXPXZQtjncQy2cXdrNS',
    ens: 'ELUcwgpm14LKPLrBRuVvPvNKHQ9HvwmtKgKSH6123cr7',
    
    // Messari 标准化子图 (更稳定)
    ethereum_messari: 'EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFG'
  }
};

// ===== Etherscan 配置 =====
const ETHERSCAN_CONFIG = {
  mainnet: {
    name: '以太坊主网',
    chainId: 1,
    etherscanApi: 'https://api.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY || 'XVD4YY91ERSKK3NUYS6IZ9MJF2BHDKAQYK',
    explorer: 'https://etherscan.io'
  },
  sepolia: {
    name: 'Sepolia 测试网',
    chainId: 11155111,
    etherscanApi: 'https://api-sepolia.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY || 'XVD4YY91ERSKK3NUYS6IZ9MJF2BHDKAQYK',
    explorer: 'https://sepolia.etherscan.io'
  }
};

let currentNetwork = 'mainnet';

// ===== The Graph 客户端类 (使用真实子图) =====
class TheGraphClient {
  constructor() {
    this.apiKey = GRAPH_CONFIG.apiKey;
    this.baseUrl = GRAPH_CONFIG.baseUrl;
    
    if (this.apiKey) {
      this.clients = {
        uniswapV3: new GraphQLClient(`${this.baseUrl}/${this.apiKey}/subgraphs/id/${GRAPH_CONFIG.subgraphs.uniswapV3}`),
        uniswapV2: new GraphQLClient(`${this.baseUrl}/${this.apiKey}/subgraphs/id/${GRAPH_CONFIG.subgraphs.uniswapV2}`),
        compound: new GraphQLClient(`${this.baseUrl}/${this.apiKey}/subgraphs/id/${GRAPH_CONFIG.subgraphs.compound}`),
        ethereum: new GraphQLClient(`${this.baseUrl}/${this.apiKey}/subgraphs/id/${GRAPH_CONFIG.subgraphs.ethereum_messari}`)
      };
    }
  }

  // 使用 Uniswap V3 子图查询代币信息
  async queryTokenInfo(tokenAddress) {
    if (!this.clients) throw new Error('The Graph API 密钥未配置');

    const query = gql`
      query GetTokenInfo($tokenId: ID!) {
        token(id: $tokenId) {
          id
          symbol
          name
          decimals
          totalSupply
          volume
          volumeUSD
          txCount
          totalValueLocked
          totalValueLockedUSD
          derivedETH
          tokenDayData(first: 7, orderBy: date, orderDirection: desc) {
            date
            priceUSD
            volume
            volumeUSD
            totalValueLockedUSD
            open
            high
            low
            close
          }
          whitelistPools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
            id
            feeTier
            liquidity
            totalValueLockedUSD
            volumeUSD
            token0 { 
              symbol 
              name
            }
            token1 { 
              symbol 
              name
            }
          }
        }
      }
    `;

    try {
      console.log(`🔍 使用 Uniswap V3 子图查询代币: ${tokenAddress}`);
      const data = await this.clients.uniswapV3.request(query, { 
        tokenId: tokenAddress.toLowerCase() 
      });
      
      if (!data.token) {
        throw new Error(`代币 ${tokenAddress} 在 Uniswap V3 中未找到`);
      }

      return {
        address: tokenAddress,
        symbol: data.token.symbol,
        name: data.token.name,
        decimals: parseInt(data.token.decimals),
        totalSupply: data.token.totalSupply,
        volumeUSD: parseFloat(data.token.volumeUSD || 0),
        tvlUSD: parseFloat(data.token.totalValueLockedUSD || 0),
        txCount: parseInt(data.token.txCount || 0),
        priceHistory: data.token.tokenDayData,
        pools: data.token.whitelistPools,
        source: 'thegraph-uniswap-v3'
      };
    } catch (error) {
      throw new Error(`Uniswap V3 子图查询失败: ${error.message}`);
    }
  }

  // 查询最近的 Uniswap 交换记录
  async queryRecentSwaps(count = 10) {
    if (!this.clients) throw new Error('The Graph API 密钥未配置');

    const query = gql`
      query GetRecentSwaps($first: Int!) {
        swaps(first: $first, orderBy: timestamp, orderDirection: desc) {
          id
          timestamp
          sender
          recipient
          amount0
          amount1
          amountUSD
          sqrtPriceX96
          tick
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
          pool {
            id
            feeTier
          }
          transaction {
            id
            blockNumber
            gasUsed
            gasPrice
          }
        }
      }
    `;

    try {
      console.log(`🔍 查询最近 ${count} 笔 Uniswap 交换记录`);
      const data = await this.clients.uniswapV3.request(query, { first: count });
      
      return data.swaps.map(swap => ({
        id: swap.id,
        timestamp: parseInt(swap.timestamp),
        sender: swap.sender,
        recipient: swap.recipient,
        amountUSD: parseFloat(swap.amountUSD || 0),
        token0: {
          symbol: swap.token0.symbol,
          amount: parseFloat(swap.amount0) / Math.pow(10, swap.token0.decimals)
        },
        token1: {
          symbol: swap.token1.symbol,
          amount: parseFloat(swap.amount1) / Math.pow(10, swap.token1.decimals)
        },
        pool: {
          id: swap.pool.id,
          feeTier: parseInt(swap.pool.feeTier) / 10000
        },
        transaction: {
          hash: swap.transaction.id,
          blockNumber: parseInt(swap.transaction.blockNumber),
          gasUsed: parseInt(swap.transaction.gasUsed),
          gasPrice: swap.transaction.gasPrice
        },
        source: 'thegraph-uniswap-v3'
      }));
    } catch (error) {
      throw new Error(`Uniswap V3 交换查询失败: ${error.message}`);
    }
  }

  // 健康检查
  async healthCheck() {
    if (!this.clients) return { status: 'not_configured' };

    try {
      const query = gql`query { _meta { block { number timestamp } } }`;
      const data = await this.clients.uniswapV3.request(query);
      
      return {
        status: 'connected',
        latestBlock: parseInt(data._meta.block.number),
        lastUpdated: parseInt(data._meta.block.timestamp)
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }
}

// ===== Etherscan 客户端类 =====
class EtherscanClient {
  constructor() {
    this.config = ETHERSCAN_CONFIG[currentNetwork];
  }

  updateNetwork(network) {
    this.config = ETHERSCAN_CONFIG[network];
  }

  async queryBlockByNumber(blockNumber) {
    try {
      const hexBlockNumber = '0x' + parseInt(blockNumber).toString(16);
      const url = `${this.config.etherscanApi}?module=proxy&action=eth_getBlockByNumber&tag=${hexBlockNumber}&boolean=true&apikey=${this.config.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.result) {
        const block = data.result;
        return {
          number: parseInt(block.number, 16),
          hash: block.hash,
          parentHash: block.parentHash,
          timestamp: parseInt(block.timestamp, 16),
          gasUsed: parseInt(block.gasUsed, 16),
          gasLimit: parseInt(block.gasLimit, 16),
          author: block.miner,
          transactionCount: block.transactions?.length || 0,
          size: parseInt(block.size, 16),
          source: 'etherscan',
          explorerUrl: `${this.config.explorer}/block/${blockNumber}`
        };
      }
      
      throw new Error('Block not found');
    } catch (error) {
      throw new Error(`Etherscan 查询失败: ${error.message}`);
    }
  }

  async queryWalletInfo(address) {
    try {
      const balanceUrl = `${this.config.etherscanApi}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.config.apiKey}`;
      const txUrl = `${this.config.etherscanApi}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${this.config.apiKey}`;

      const [balanceResponse, txResponse] = await Promise.all([
        fetch(balanceUrl),
        fetch(txUrl)
      ]);

      const [balanceData, txData] = await Promise.all([
        balanceResponse.json(),
        txResponse.json()
      ]);

      return {
        address: address,
        balance: balanceData.result || '0',
        transactions: txData.status === '1' ? txData.result.map(tx => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: tx.timeStamp,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          input: tx.input
        })) : [],
        source: 'etherscan',
        explorerUrl: `${this.config.explorer}/address/${address}`
      };
    } catch (error) {
      throw new Error(`Etherscan 钱包查询失败: ${error.message}`);
    }
  }
}

// ===== 客户端实例 =====
const graphClient = new TheGraphClient();
const etherscanClient = new EtherscanClient();

// ===== API 路由 =====

// 区块查询 (使用 Etherscan，更稳定)
app.post('/api/block', async (req, res) => {
  const { input } = req.body;
  
  try {
    const result = await etherscanClient.queryBlockByNumber(input);
    console.log(`✅ 区块查询成功: ${input}`);
    res.json({ 
      data: result,
      note: '区块数据来自 Etherscan (更稳定可靠)'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DeFi 代币信息 (使用 The Graph Uniswap V3 官方子图)
app.post('/api/defi/token', async (req, res) => {
  const { address } = req.body;
  
  if (!GRAPH_CONFIG.apiKey) {
    return res.status(400).json({
      error: '需要配置 GRAPH_API_KEY 环境变量',
      setup: '请访问 https://thegraph.com/studio/ 获取 API 密钥'
    });
  }
  
  try {
    const result = await graphClient.queryTokenInfo(address);
    res.json({ 
      data: result,
      subgraph: 'uniswap-v3-official',
      subgraph_id: GRAPH_CONFIG.subgraphs.uniswapV3
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      suggestion: '请确认代币地址正确且在 Uniswap V3 上有交易记录'
    });
  }
});

// 最近交换记录 (使用 The Graph)
app.get('/api/defi/swaps', async (req, res) => {
  const count = parseInt(req.query.count) || 10;
  
  if (!GRAPH_CONFIG.apiKey) {
    return res.status(400).json({
      error: '需要配置 GRAPH_API_KEY 环境变量'
    });
  }
  
  try {
    const result = await graphClient.queryRecentSwaps(count);
    res.json({ 
      data: result,
      subgraph: 'uniswap-v3-official'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 钱包查询 (混合数据：Etherscan + The Graph)
app.post('/api/wallet', async (req, res) => {
  const { input } = req.body;
  
  try {
    // 1. 使用 Etherscan 获取基础钱包信息
    const etherscanData = await etherscanClient.queryWalletInfo(input);
    
    // 2. 如果配置了 The Graph，获取 DeFi 活动
    let defiActivity = null;
    if (GRAPH_CONFIG.apiKey) {
      try {
        const swaps = await graphClient.queryUserSwaps(input, 10);
        defiActivity = {
          recentSwaps: swaps,
          swapCount: swaps.length,
          totalVolumeUSD: swaps.reduce((sum, swap) => sum + swap.amountUSD, 0)
        };
      } catch (error) {
        console.log('DeFi 活动查询失败:', error.message);
      }
    }
    
    const result = {
      ...etherscanData,
      defiActivity: defiActivity,
      dataSources: ['etherscan', ...(defiActivity ? ['thegraph-uniswap-v3'] : [])]
    };
    
    console.log(`✅ 钱包查询成功: ${input}`);
    res.json({ data: result });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 配置状态检查
app.get('/api/config', (req, res) => {
  res.json({
    thegraph: {
      configured: !!GRAPH_CONFIG.apiKey,
      available_subgraphs: Object.keys(GRAPH_CONFIG.subgraphs),
      subgraph_ids: GRAPH_CONFIG.subgraphs
    },
    etherscan: {
      configured: !!ETHERSCAN_CONFIG[currentNetwork].apiKey,
      networks: Object.keys(ETHERSCAN_CONFIG),
      currentNetwork: currentNetwork
    },
    features: {
      basic_queries: true,
      defi_data: !!GRAPH_CONFIG.apiKey,
      real_time_swaps: !!GRAPH_CONFIG.apiKey
    }
  });
});

// 健康检查
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    architecture: 'hybrid',
    services: {}
  };

  // 测试 Etherscan
  try {
    const testUrl = `${ETHERSCAN_CONFIG[currentNetwork].etherscanApi}?module=proxy&action=eth_blockNumber&apikey=${ETHERSCAN_CONFIG[currentNetwork].apiKey}`;
    const response = await fetch(testUrl);
    const data = await response.json();
    
    health.services.etherscan = data.result ? 'connected' : 'error';
    if (data.result) {
      health.etherscan_latest_block = parseInt(data.result, 16);
    }
  } catch (error) {
    health.services.etherscan = 'error';
    health.etherscan_error = error.message;
  }

  // 测试 The Graph
  if (GRAPH_CONFIG.apiKey) {
    try {
      const graphHealth = await graphClient.healthCheck();
      health.services.thegraph = graphHealth.status;
      if (graphHealth.latestBlock) {
        health.graph_latest_block = graphHealth.latestBlock;
      }
      if (graphHealth.error) {
        health.graph_error = graphHealth.error;
      }
    } catch (error) {
      health.services.thegraph = 'error';
      health.graph_error = error.message;
    }
  } else {
    health.services.thegraph = 'not_configured';
  }

  res.json(health);
});

// 网络切换
app.post('/api/network/switch', (req, res) => {
  const { network } = req.body;
  
  if (!ETHERSCAN_CONFIG[network]) {
    return res.status(400).json({
      error: '无效的网络',
      availableNetworks: Object.keys(ETHERSCAN_CONFIG)
    });
  }

  const oldNetwork = currentNetwork;
  currentNetwork = network;
  etherscanClient.updateNetwork(network);
  
  res.json({
    success: true,
    oldNetwork: oldNetwork,
    newNetwork: network,
    networkName: ETHERSCAN_CONFIG[network].name
  });
});

// 启动服务器
app.listen(PORT, async () => {
  console.log(`🚀 混合架构区块链数据服务器启动成功!`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🏗️ 架构: The Graph (官方子图) + Etherscan`);
  
  console.log(`\n📊 数据源状态:`);
  console.log(`   The Graph: ${GRAPH_CONFIG.apiKey ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   Etherscan: ${ETHERSCAN_CONFIG[currentNetwork].apiKey ? '✅ 已配置' : '❌ 未配置'}`);
  
  console.log(`\n📖 使用的官方子图:`);
  if (GRAPH_CONFIG.apiKey) {
    console.log(`   Uniswap V3: ${GRAPH_CONFIG.subgraphs.uniswapV3}`);
    console.log(`   Uniswap V2: ${GRAPH_CONFIG.subgraphs.uniswapV2}`);
  }
  
  console.log(`\n🔗 API 端点:`);
  console.log(`   POST /api/block - 区块查询 (Etherscan)`);
  console.log(`   POST /api/wallet - 钱包查询 (混合数据)`);
  console.log(`   POST /api/defi/token - DeFi 代币信息 (The Graph)`);
  console.log(`   GET /api/defi/swaps - 最近交换记录 (The Graph)`);
  console.log(`   GET /health - 健康检查`);
  
  if (!GRAPH_CONFIG.apiKey) {
    console.log(`\n💡 启用 The Graph 功能:`);
    console.log(`   1. 访问 https://thegraph.com/studio/`);
    console.log(`   2. 创建 API 密钥并充值少量 ETH`);
    console.log(`   3. 在 .env 文件中设置 GRAPH_API_KEY`);
    console.log(`   4. 重启服务器即可享受 DeFi 数据查询!`);
  }
});
