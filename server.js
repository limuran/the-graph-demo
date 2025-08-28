const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 3001

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

// 多网络API端点配置
const NETWORK_CONFIG = {
  mainnet: {
    name: '以太坊主网',
    chainId: 1,
    etherscanApi: 'https://api.etherscan.io/api',
    apiKey: 'XVD4YY91ERSKK3NUYS6IZ9MJF2BHDKAQYK',
    explorer: 'https://etherscan.io'
  },
  sepolia: {
    name: 'Sepolia 测试网',
    chainId: 11155111,
    etherscanApi: 'https://api-sepolia.etherscan.io/api',
    apiKey: 'XVD4YY91ERSKK3NUYS6IZ9MJF2BHDKAQYK',
    explorer: 'https://sepolia.etherscan.io'
  },
  goerli: {
    name: 'Goerli 测试网',
    chainId: 5,
    etherscanApi: 'https://api-goerli.etherscan.io/api',
    apiKey: 'XVD4YY91ERSKK3NUYS6IZ9MJF2BHDKAQYK',
    explorer: 'https://goerli.etherscan.io'
  }
}

// 当前默认网络
let currentNetwork = 'mainnet'

// 十六进制转换工具函数
// 字符串转16进制
function str2hex(str) {
  if (str === '') {
    return ''
  }
  var arr = []
  arr.push('0x')
  for (var i = 0; i < str.length; i++) {
    arr.push(str.charCodeAt(i).toString(16))
  }
  return arr.join('')
}

// 16进制转字符串
function hex2str(hex) {
  var trimedStr = hex.trim()
  var rawStr =
    trimedStr.substr(0, 2).toLowerCase() === '0x'
      ? trimedStr.substr(2)
      : trimedStr
  var len = rawStr.length
  if (len % 2 !== 0) {
    console.warn('Illegal Format ASCII Code!')
    return ''
  }
  var curCharCode
  var resultStr = []
  for (var i = 0; i < len; i = i + 2) {
    curCharCode = parseInt(rawStr.substr(i, 2), 16)
    // 只添加可打印字符
    if (curCharCode >= 32 && curCharCode <= 126) {
      resultStr.push(String.fromCharCode(curCharCode))
    }
  }
  return resultStr.join('')
}

// 分析Input Data的函数
function analyzeInputData(inputData) {
  if (!inputData || inputData === '0x') {
    return {
      raw: inputData,
      type: 'empty',
      description: '简单转账 (无数据)',
      parsedData: null
    }
  }

  // 移除0x前缀
  const cleanHex = inputData.startsWith('0x') ? inputData.slice(2) : inputData

  // 尝试解析为函数调用
  if (cleanHex.length >= 8) {
    const functionSelector = cleanHex.slice(0, 8)
    const parameters = cleanHex.slice(8)
    
    // 尝试转换为可读字符串
    const stringAttempt = hex2str(inputData)
    const isReadableString = stringAttempt.length > 0 && 
      /^[a-zA-Z0-9\s.,;:!?\-_(){}[\]]+$/.test(stringAttempt)

    return {
      raw: inputData,
      type: 'contract_call',
      functionSelector: '0x' + functionSelector,
      parameters: parameters ? '0x' + parameters : '',
      description: `合约函数调用 (${functionSelector})`,
      parsedData: {
        possibleString: stringAttempt,
        isReadableString: isReadableString,
        dataLength: cleanHex.length / 2,
        parameterCount: parameters ? Math.floor(parameters.length / 64) : 0
      }
    }
  }

  return {
    raw: inputData,
    type: 'unknown',
    description: '未知数据格式',
    parsedData: {
      possibleString: hex2str(inputData),
      dataLength: cleanHex.length / 2
    }
  }
}

// 查询以太坊区块信息
async function queryBlockData(blockNumber, network = currentNetwork) {
  try {
    const networkConfig = NETWORK_CONFIG[network]
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`)
    }

    console.log(`🔍 Querying block ${blockNumber} on ${networkConfig.name}...`)

    // 直接使用Etherscan API获取区块详细信息
    const hexBlockNumber = '0x' + parseInt(blockNumber).toString(16)
    const detailUrl = `${networkConfig.etherscanApi}?module=proxy&action=eth_getBlockByNumber&tag=${hexBlockNumber}&boolean=true&apikey=${networkConfig.apiKey}`

    console.log(
      '📡 API URL:',
      detailUrl.replace(networkConfig.apiKey, 'API_KEY_HIDDEN')
    )

    const detailResponse = await fetch(detailUrl)
    const detailData = await detailResponse.json()

    console.log('📥 API Response:', detailData)
    if (detailData.result) {
      const block = detailData.result
      return {
        network: network,
        networkName: networkConfig.name,
        number: blockNumber,
        hash: block.hash || 'N/A',
        parentHash: block.parentHash || 'N/A',
        timestamp: block.timestamp
          ? parseInt(block.timestamp, 16)
          : Math.floor(Date.now() / 1000),
        gasUsed: block.gasUsed ? parseInt(block.gasUsed, 16) : 0,
        gasLimit: block.gasLimit ? parseInt(block.gasLimit, 16) : 0,
        author: block.miner || 'N/A',
        transactionCount: block.transactions?.length || 0,
        size: block.size ? parseInt(block.size, 16) : 0,
        difficulty: block.difficulty || '0',
        explorerUrl: `${networkConfig.explorer}/block/${blockNumber}`
      }
    }

    console.log('❌ No block data found')
    return null
  } catch (error) {
    console.error('❌ Block query error:', error)
    return null
  }
}

// 查询钱包ENS信息
async function queryENSData(address, network = currentNetwork) {
  try {
    const networkConfig = NETWORK_CONFIG[network]
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`)
    }

    // 获取账户余额
    const response = await fetch(
      `${networkConfig.etherscanApi}?module=account&action=balance&address=${address}&tag=latest&apikey=${networkConfig.apiKey}`
    )
    const data = await response.json()

    return {
      address: address,
      balance: data.result || '0',
      network: network,
      networkName: networkConfig.name,
      domains: [], // ENS主要在主网，测试网较少使用
      explorerUrl: `${networkConfig.explorer}/address/${address}`
    }
  } catch (error) {
    console.error('ENS query error:', error)
    return { address, balance: '0', domains: [], network, networkName: NETWORK_CONFIG[network]?.name }
  }
}

// 查询钱包交易记录
async function queryWalletTransactions(address, network = currentNetwork) {
  try {
    const networkConfig = NETWORK_CONFIG[network]
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`)
    }

    const response = await fetch(
      `${networkConfig.etherscanApi}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${networkConfig.apiKey}`
    )
    const data = await response.json()

    if (data.status === '1') {
      return data.result.map((tx) => {
        // 分析Input Data
        const inputAnalysis = analyzeInputData(tx.input)
        
        return {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: tx.timeStamp,
          blockNumber: tx.blockNumber,
          gasUsed: tx.gasUsed,
          gasPrice: tx.gasPrice,
          input: tx.input,
          inputAnalysis: inputAnalysis,
          explorerUrl: `${networkConfig.explorer}/tx/${tx.hash}`
        }
      })
    }
    return []
  } catch (error) {
    console.error('Transaction query error:', error)
    return []
  }
}

// 通用API端点
app.post('/api/:type', async (req, res) => {
  const { type } = req.params
  const { input, network } = req.body

  try {
    let result
    const targetNetwork = network || currentNetwork

    switch (type) {
      case 'block':
        result = await queryBlockData(input, targetNetwork)
        if (!result) {
          return res.status(404).json({ 
            error: `未找到块号 ${input} 的数据`,
            network: targetNetwork,
            networkName: NETWORK_CONFIG[targetNetwork]?.name
          })
        }
        break

      case 'wallet':
        const ensData = await queryENSData(input, targetNetwork)
        const transactions = await queryWalletTransactions(input, targetNetwork)
        result = {
          ...ensData,
          transactions,
          swaps: [] // Uniswap数据需要专门的Graph API
        }
        break

      default:
        return res.status(400).json({ error: '不支持的查询类型' })
    }

    console.log(`✅ ${type} query successful for ${input} on ${NETWORK_CONFIG[targetNetwork]?.name}`)
    res.json({ data: result })
  } catch (error) {
    console.error('❌ API Error:', error)
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    })
  }
})

// 网络管理端点
app.get('/api/networks', (req, res) => {
  res.json({
    networks: Object.keys(NETWORK_CONFIG).map(key => ({
      id: key,
      name: NETWORK_CONFIG[key].name,
      chainId: NETWORK_CONFIG[key].chainId,
      explorer: NETWORK_CONFIG[key].explorer
    })),
    currentNetwork: currentNetwork,
    currentNetworkName: NETWORK_CONFIG[currentNetwork]?.name
  })
})

app.post('/api/network/switch', (req, res) => {
  const { network } = req.body
  
  if (!network || !NETWORK_CONFIG[network]) {
    return res.status(400).json({
      error: '无效的网络',
      availableNetworks: Object.keys(NETWORK_CONFIG)
    })
  }

  const oldNetwork = currentNetwork
  currentNetwork = network
  
  console.log(`🔄 Network switched from ${NETWORK_CONFIG[oldNetwork]?.name} to ${NETWORK_CONFIG[network]?.name}`)
  
  res.json({
    success: true,
    oldNetwork: oldNetwork,
    newNetwork: network,
    networkName: NETWORK_CONFIG[network].name,
    message: `已切换到 ${NETWORK_CONFIG[network].name}`
  })
})

// GraphQL proxy endpoint (保持兼容性)
app.post('/graphql/:subgraph', async (req, res) => {
  // 由于很多Graph端点已经迁移，这里返回说明信息
  res.status(410).json({
    error: 'The Graph Hosted Service endpoints have been deprecated.',
    message: 'Please use the new /api/* endpoints instead.',
    migration: 'Use /api/block for block data, /api/wallet for wallet data'
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    currentNetwork: currentNetwork,
    currentNetworkName: NETWORK_CONFIG[currentNetwork]?.name,
    endpoints: [
      'POST /api/block - 查询区块信息 (支持Input Data解析)',
      'POST /api/wallet - 查询钱包信息 (支持Input Data解析)',
      'GET /api/networks - 获取可用网络列表',
      'POST /api/network/switch - 切换网络'
    ],
    features: [
      'Input Data 十六进制解析',
      '智能合约函数识别',
      '多网络支持 (主网/测试网)',
      '一键网络切换'
    ]
  })
})

// Start server
app.listen(PORT, () => {
  console.log(
    `🚀 Blockchain Data API Server running on http://localhost:${PORT}`
  )
  console.log(`📖 Available endpoints:`)
  console.log(`   POST /api/block - 查询区块信息`)
  console.log(`   POST /api/wallet - 查询钱包信息`)
  console.log(`💚 Health check: GET /health`)
  console.log(`⚠️  注意: 使用免费API，请合理使用避免超限`)
})
