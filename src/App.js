import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, Copy, Database, TrendingUp, Users, Coins } from 'lucide-react';

const SimpleGraphDemo = () => {
  const [loading, setLoading] = useState(false);
  const [uniswapData, setUniswapData] = useState(null);
  const [ensData, setEnsData] = useState(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [error, setError] = useState('');

  // 获取Uniswap数据 - 使用模拟数据避免CORS问题
  const fetchUniswapData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 模拟真实的Uniswap V3数据结构
      const mockUniswapData = {
        pools: [
          {
            id: "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
            token0: { symbol: "USDC", name: "USD Coin", id: "0xa0b86a33e6bb0b01fb84e..." },
            token1: { symbol: "WETH", name: "Wrapped Ether", id: "0xc02aaa39b223fe8d0a0e..." },
            feeTier: "500",
            totalValueLockedUSD: "285420000.123456789",
            volumeUSD: "45720000.987654321",
            txCount: "1284567"
          },
          {
            id: "0x4e68ccd3e89f51c3074ca5072bbac773960dfa36",
            token0: { symbol: "WETH", name: "Wrapped Ether", id: "0xc02aaa39b223fe8d0a0e..." },
            token1: { symbol: "USDT", name: "Tether USD", id: "0xdac17f958d2ee523a220..." },
            feeTier: "500",
            totalValueLockedUSD: "156780000.456789123",
            volumeUSD: "28930000.123456789",
            txCount: "892341"
          },
          {
            id: "0x60594a405d53811d3bc4766596efd80fd545a270",
            token0: { symbol: "WETH", name: "Wrapped Ether", id: "0xc02aaa39b223fe8d0a0e..." },
            token1: { symbol: "DAI", name: "Dai Stablecoin", id: "0x6b175474e89094c44da9..." },
            feeTier: "3000",
            totalValueLockedUSD: "98450000.789123456",
            volumeUSD: "15670000.456789123",
            txCount: "567234"
          },
          {
            id: "0x3416cf6c708da44db2624d63ea0aaef7113527c6",
            token0: { symbol: "USDC", name: "USD Coin", id: "0xa0b86a33e6bb0b01fb84e..." },
            token1: { symbol: "USDT", name: "Tether USD", id: "0xdac17f958d2ee523a220..." },
            feeTier: "100",
            totalValueLockedUSD: "87230000.234567891",
            volumeUSD: "23450000.789123456",
            txCount: "1123789"
          },
          {
            id: "0xa3f558aebaecaf0e11ca4b2199cc5ed341edfd74",
            token0: { symbol: "LDO", name: "Lido DAO Token", id: "0x5a98fcc4e6b9e0e1b2e..." },
            token1: { symbol: "WETH", name: "Wrapped Ether", id: "0xc02aaa39b223fe8d0a0e..." },
            feeTier: "3000",
            totalValueLockedUSD: "65890000.567891234",
            volumeUSD: "12340000.234567891",
            txCount: "456123"
          }
        ]
      };
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUniswapData(mockUniswapData);
      console.log('📊 Uniswap数据 (演示):', mockUniswapData);
      console.log('💡 这是模拟数据，展示The Graph的真实数据结构');
    } catch (err) {
      setError('获取数据失败: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 搜索ENS域名 - 使用模拟数据
  const searchENS = async () => {
    if (!searchAddress) return;
    
    setLoading(true);
    setError('');
    
    try {
      // 模拟ENS查询结果
      let mockEnsData = { domains: [] };
      
      // 为一些知名地址提供模拟ENS数据
      if (searchAddress.toLowerCase() === '0xd8da6bf26964af9d7eed9e03e53415d37aa96045') {
        // Vitalik的地址
        mockEnsData = {
          domains: [
            {
              id: "vitalik.eth",
              name: "vitalik.eth",
              owner: { id: searchAddress.toLowerCase() },
              resolver: { id: "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41" },
              registrationDate: "1580515200", // 2020年2月
              expiryDate: "1893456000" // 2030年
            }
          ]
        };
      } else if (searchAddress.toLowerCase() === '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643') {
        // 另一个示例地址
        mockEnsData = {
          domains: [
            {
              id: "example.eth", 
              name: "example.eth",
              owner: { id: searchAddress.toLowerCase() },
              resolver: { id: "0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41" },
              registrationDate: "1577836800",
              expiryDate: "1890864000"
            }
          ]
        };
      }
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setEnsData(mockEnsData);
      console.log('🔍 ENS数据 (演示):', mockEnsData);
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
        <p className="text-gray-600">学习GraphQL查询区块链数据的基本概念</p>
      </div>

      {/* CORS说明 */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="text-orange-600 mt-1">⚠️</div>
          <div className="text-orange-800">
            <h3 className="font-medium mb-1">关于CORS限制</h3>
            <p className="text-sm">
              由于浏览器安全策略，直接调用The Graph API会遇到跨域问题。
              这个demo使用模拟数据来展示功能，但GraphQL查询语法和数据结构都是真实的。
            </p>
            <p className="text-sm mt-2">
              💡 查看 <code>CORS-SOLUTIONS.md</code> 了解生产环境解决方案
            </p>
          </div>
        </div>
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
          搜索ENS域名 (演示)
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
            Uniswap V3 顶级流动性池 (演示数据)
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
        <h3 className="text-lg font-semibold mb-4 text-green-400">📝 真实的GraphQL查询</h3>
        <p className="text-gray-300 mb-4">这些是实际使用的GraphQL查询语句（可以在Postman中测试）：</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-yellow-400 mb-2">Uniswap V3 查询:</h4>
            <div className="bg-gray-800 rounded p-4">
              <pre className="text-sm text-green-300 overflow-x-auto">
                <code>{`POST https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3

{
  "query": "query { pools(first: 10, orderBy: totalValueLockedUSD, orderDirection: desc) { id token0 { symbol name } token1 { symbol name } feeTier totalValueLockedUSD volumeUSD txCount } }"
}`}</code>
              </pre>
            </div>
          </div>
          
          <div>
            <h4 className="text-yellow-400 mb-2">ENS 查询:</h4>
            <div className="bg-gray-800 rounded p-4">
              <pre className="text-sm text-green-300 overflow-x-auto">
                <code>{`POST https://api.thegraph.com/subgraphs/name/ensdomains/ens

{
  "query": "query GetDomains($address: String!) { domains(where: { owner: $address }, first: 5) { id name registrationDate expiryDate } }",
  "variables": { "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" }
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* CORS解决方案 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">🔧 生产环境解决方案:</h3>
        <div className="text-blue-800 space-y-3 text-sm">
          <div>
            <strong>1. 后端API代理</strong> (推荐)
            <div className="mt-1 text-xs bg-blue-100 p-2 rounded font-mono">
              Express.js + CORS → The Graph API
            </div>
          </div>
          
          <div>
            <strong>2. Next.js API路由</strong>
            <div className="mt-1 text-xs bg-blue-100 p-2 rounded font-mono">
              /api/graph/[...subgraph].js
            </div>
          </div>
          
          <div>
            <strong>3. 官方Graph Client</strong>
            <div className="mt-1 text-xs bg-blue-100 p-2 rounded font-mono">
              @graphprotocol/graph-client
            </div>
          </div>
        </div>
      </div>

      {/* 下一步指南 */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="font-semibold text-yellow-900 mb-3">🚀 下一步学习:</h3>
        <div className="text-yellow-800 space-y-2 text-sm">
          <p><strong>1. 测试真实查询:</strong> 在Postman中测试上面的GraphQL查询</p>
          <p><strong>2. 设置后端代理:</strong> 参考CORS-SOLUTIONS.md创建后端服务</p>
          <p><strong>3. 探索更多Subgraph:</strong> 访问 <a href="https://thegraph.com/explorer" className="underline" target="_blank" rel="noopener noreferrer">Graph Explorer</a></p>
          <p><strong>4. 创建自定义Subgraph:</strong> 为你的智能合约创建数据索引</p>
        </div>
      </div>

      {/* 技术细节 */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">🛠️ 学习要点</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">GraphQL基础:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 查询语法和字段选择</li>
              <li>• 变量使用和条件过滤</li>
              <li>• 分页和排序参数</li>
              <li>• 嵌套查询和关联数据</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">The Graph概念:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Subgraph: 智能合约的数据API</li>
              <li>• 实体和关系定义</li>
              <li>• 事件监听和数据映射</li>
              <li>• 去中心化的数据索引</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            💡 <strong>重要:</strong> 虽然使用了模拟数据，但这个demo完美展示了The Graph的工作流程。
            GraphQL查询语法、数据结构、UI交互都是真实的生产环境模式。
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleGraphDemo;