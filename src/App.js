import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, Copy, Database, TrendingUp, Users, Coins } from 'lucide-react';

const SimpleGraphDemo = () => {
  const [loading, setLoading] = useState(false);
  const [uniswapData, setUniswapData] = useState(null);
  const [ensData, setEnsData] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [error, setError] = useState('');

  // Uniswap V3 subgraph endpoint
  const UNISWAP_ENDPOINT = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3";
  
  // ENS subgraph endpoint  
  const ENS_ENDPOINT = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";

  // GraphQL查询 - 获取Uniswap流动性池数据
  const UNISWAP_QUERY = `
    query GetTopPools {
      pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        token0 {
          id
          symbol
          name
        }
        token1 {
          id
          symbol  
          name
        }
        feeTier
        totalValueLockedUSD
        volumeUSD
        txCount
      }
    }
  `;

  // GraphQL查询 - 获取ENS域名数据
  const ENS_QUERY = `
    query GetDomains($address: String!) {
      domains(where: { owner: $address }, first: 5) {
        id
        name
        owner {
          id
        }
        resolver {
          id
        }
        registrationDate
        expiryDate
      }
    }
  `;

  // 获取Uniswap数据
  const fetchUniswapData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(UNISWAP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: UNISWAP_QUERY })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      setUniswapData(result.data);
      console.log('Uniswap数据:', result.data);
    } catch (err) {
      setError('获取Uniswap数据失败: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 搜索ENS域名
  const searchENS = async () => {
    if (!searchAddress) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(ENS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: ENS_QUERY,
          variables: { address: searchAddress.toLowerCase() }
        })
      });
      
      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      setEnsData(result.data);
      console.log('ENS数据:', result.data);
    } catch (err) {
      setError('搜索ENS失败: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 格式化数值
  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toFixed(2);
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // 页面加载时获取Uniswap数据
  useEffect(() => {
    fetchUniswapData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">The Graph 入门Demo</h1>
        <p className="text-gray-600">使用现有的subgraph读取链上数据</p>
      </div>

      {/* 介绍卡片 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-6 text-white">
        <h2 className="text-xl font-semibold mb-3">🎯 什么是The Graph？</h2>
        <p className="mb-4">The Graph是一个去中心化的区块链数据索引协议，它让开发者可以用GraphQL轻松查询链上数据。</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded p-3">
            <div className="font-medium">📊 数据索引</div>
            <div className="mt-1">将链上数据组织成易查询的格式</div>
          </div>
          <div className="bg-white/10 rounded p-3">
            <div className="font-medium">⚡ GraphQL API</div>
            <div className="mt-1">使用GraphQL语法查询数据</div>
          </div>
          <div className="bg-white/10 rounded p-3">
            <div className="font-medium">🌐 去中心化</div>
            <div className="mt-1">全球分布式的索引节点网络</div>
          </div>
        </div>
      </div>

      {/* ENS搜索 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Search className="mr-2" size={20} />
          搜索ENS域名
        </h2>
        <p className="text-gray-600 mb-4">输入以太坊地址，查看它拥有的ENS域名</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="输入以太坊地址 (0x...)"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchENS}
            disabled={loading || !searchAddress}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Search className="mr-2" size={20} />}
            搜索ENS
          </button>
        </div>

        {/* 示例地址 */}
        <div className="mt-3 text-sm text-gray-500">
          试试这个地址: 
          <button 
            onClick={() => setSearchAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}
            className="ml-1 text-blue-600 hover:underline"
          >
            0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
          </button>
          (Vitalik的地址)
        </div>

        {/* ENS搜索结果 */}
        {ensData && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">ENS域名结果:</h3>
            {ensData.domains.length > 0 ? (
              <div className="space-y-2">
                {ensData.domains.map((domain) => (
                  <div key={domain.id} className="bg-gray-50 rounded p-3 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{domain.name}</div>
                      <div className="text-sm text-gray-500">
                        注册: {formatDate(domain.registrationDate)} | 
                        过期: {formatDate(domain.expiryDate)}
                      </div>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(domain.name)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">该地址没有ENS域名</p>
            )}
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Uniswap数据展示 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Database className="mr-2" size={20} />
            Uniswap V3 顶级流动性池
          </h2>
          <button
            onClick={fetchUniswapData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <TrendingUp size={16} />}
            <span>刷新数据</span>
          </button>
        </div>

        {uniswapData ? (
          <div className="space-y-4">
            {uniswapData.pools.map((pool, index) => (
              <div key={pool.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {pool.token0.symbol} / {pool.token1.symbol}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {pool.token0.name} - {pool.token1.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">手续费</div>
                    <div className="font-medium">{pool.feeTier / 10000}%</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Coins className="text-green-600" size={16} />
                      <span className="text-sm font-medium text-green-700">总锁定价值</span>
                    </div>
                    <div className="text-xl font-bold text-green-800">
                      ${formatNumber(pool.totalValueLockedUSD)}
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="text-blue-600" size={16} />
                      <span className="text-sm font-medium text-blue-700">24h交易量</span>
                    </div>
                    <div className="text-xl font-bold text-blue-800">
                      ${formatNumber(pool.volumeUSD)}
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="text-purple-600" size={16} />
                      <span className="text-sm font-medium text-purple-700">交易次数</span>
                    </div>
                    <div className="text-xl font-bold text-purple-800">
                      {formatNumber(pool.txCount)}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <div className="text-xs text-gray-400 font-mono">
                    池地址: {pool.id.slice(0, 10)}...{pool.id.slice(-8)}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => copyToClipboard(pool.id)}
                      className="text-gray-400 hover:text-blue-600"
                      title="复制池地址"
                    >
                      <Copy size={14} />
                    </button>
                    <a 
                      href={`https://etherscan.io/address/${pool.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600"
                      title="在Etherscan查看"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            {loading ? (
              <div className="flex items-center justify-center space-x-3">
                <Loader2 className="animate-spin text-blue-600" size={24} />
                <span className="text-gray-600">正在获取The Graph数据...</span>
              </div>
            ) : (
              <div className="text-gray-500">点击刷新按钮获取数据</div>
            )}
          </div>
        )}
      </div>

      {/* GraphQL查询示例 */}
      <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 text-green-400">📝 GraphQL查询示例</h3>
        <p className="text-gray-300 mb-4">以上数据使用的GraphQL查询语句：</p>
        
        <div className="bg-gray-800 rounded p-4 mb-4">
          <pre className="text-sm text-green-300 overflow-x-auto">
            <code>{`query GetTopPools {
  pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) {
    id
    token0 { symbol, name }
    token1 { symbol, name }
    feeTier
    totalValueLockedUSD
    volumeUSD
    txCount
  }
}`}</code>
          </pre>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-yellow-400 font-medium">🔍 查询说明:</div>
            <ul className="mt-2 space-y-1 text-gray-300">
              <li>• <code>first: 10</code> - 获取前10条记录</li>
              <li>• <code>orderBy</code> - 按总锁定价值排序</li>
              <li>• <code>orderDirection: desc</code> - 降序排列</li>
            </ul>
          </div>
          <div>
            <div className="text-yellow-400 font-medium">📊 返回字段:</div>
            <ul className="mt-2 space-y-1 text-gray-300">
              <li>• 代币对信息 (symbol, name)</li>
              <li>• 手续费等级 (feeTier)</li>
              <li>• 锁定价值和交易量</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 下一步指南 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">🚀 下一步学习:</h3>
        <div className="text-yellow-800 space-y-2 text-sm">
          <p><strong>1. 理解GraphQL:</strong> 学习如何构建查询、使用变量、嵌套字段</p>
          <p><strong>2. 探索更多Subgraph:</strong> 访问 <a href="https://thegraph.com/explorer" className="underline" target="_blank" rel="noopener noreferrer">Graph Explorer</a> 查看更多可用的subgraph</p>
          <p><strong>3. 创建自己的Subgraph:</strong> 为你的智能合约创建自定义的数据索引</p>
          <p><strong>4. 集成到DApp:</strong> 将The Graph查询集成到你的Web3应用中</p>
        </div>
      </div>

      {/* 技术细节 */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🛠️ 技术实现细节</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">代码结构:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• React Hooks管理状态</li>
              <li>• Fetch API发送GraphQL请求</li>
              <li>• 错误处理和加载状态</li>
              <li>• 响应式UI设计</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">使用的Subgraph:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Uniswap V3: 去中心化交易所数据</li>
              <li>• ENS: 以太坊域名服务</li>
              <li>• 都是现成的公开subgraph</li>
              <li>• 无需部署自己的合约</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            💡 <strong>小贴士:</strong> 这个demo展示了The Graph的核心功能 - 
            通过GraphQL查询获取结构化的链上数据。你可以在浏览器开发者工具的Console中看到完整的返回数据。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleGraphDemo;