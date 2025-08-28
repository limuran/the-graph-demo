import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, Copy, Database, Hash, Wallet, AlertCircle } from 'lucide-react';

const GraphDemo = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [queryType, setQueryType] = useState('wallet');
  const [inputValue, setInputValue] = useState('');
  const [networks, setNetworks] = useState([]);
  const [currentNetwork, setCurrentNetwork] = useState('mainnet');

  // 本地API端点 (使用Etherscan等免费API)
  const LOCAL_API_BASE = 'http://localhost:3001/api';

  // 网络管理函数
  const fetchNetworks = async () => {
    try {
      const response = await fetch(`${LOCAL_API_BASE}/networks`);
      const result = await response.json();
      setNetworks(result.networks);
      setCurrentNetwork(result.currentNetwork);
    } catch (err) {
      console.error('获取网络列表失败:', err);
    }
  };

  const switchNetwork = async (networkId) => {
    try {
      const response = await fetch(`${LOCAL_API_BASE}/network/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ network: networkId })
      });
      
      const result = await response.json();
      if (response.ok) {
        setCurrentNetwork(networkId);
        setResults(null); // 清空之前的结果
        console.log('网络切换成功:', result.message);
      } else {
        throw new Error(result.error || '网络切换失败');
      }
    } catch (err) {
      setError('网络切换失败: ' + err.message);
    }
  };

  // API查询函数 (增强版，支持网络参数)
  const queryBlockData = async (blockNumber) => {
    const response = await fetch(`${LOCAL_API_BASE}/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        input: blockNumber,
        network: currentNetwork 
      })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'API请求失败');
    }
    
    return result.data;
  };

  const queryWalletData = async (address) => {
    const response = await fetch(`${LOCAL_API_BASE}/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        input: address,
        network: currentNetwork 
      })
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'API请求失败');
    }
    
    return result.data;
  };

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    
    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      let result;
      
      switch (queryType) {
        case 'block':
          result = await queryBlockData(inputValue);
          if (!result) {
            throw new Error(`未找到块号 ${inputValue} 的数据`);
          }
          break;
        case 'transaction':
          throw new Error('交易哈希查询暂未实现，请使用块号或钱包地址查询');
        case 'wallet':
          result = await queryWalletData(inputValue);
          break;
        default:
          throw new Error('未知的查询类型');
      }
      
      setResults({ type: queryType, data: result });
    } catch (err) {
      setError(err.message);
      console.error('查询错误:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    const number = parseFloat(num);
    if (number >= 1e18) return (number / 1e18).toFixed(4) + ' ETH';
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toFixed(2);
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString('zh-CN');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // 页面加载时获取网络信息
  useEffect(() => {
    fetchNetworks();
  }, []);

  const renderBlockResults = (block) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Hash className="mr-2" size={20} />
        区块信息
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">区块号</label>
            <div className="text-lg font-mono">{block.number}</div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">时间戳</label>
            <div className="text-sm">{formatDate(block.timestamp)}</div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">交易数量</label>
            <div className="text-lg font-semibold">{block.transactionCount || 'N/A'}</div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Gas使用量</label>
            <div className="text-sm">{formatNumber(block.gasUsed)}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">区块哈希</label>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded flex justify-between">
              <span>{shortenAddress(block.hash)}</span>
              <button onClick={() => copyToClipboard(block.hash)}>
                <Copy size={14} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">父区块哈希</label>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded flex justify-between">
              <span>{shortenAddress(block.parentHash)}</span>
              <button onClick={() => copyToClipboard(block.parentHash)}>
                <Copy size={14} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">矿工</label>
            <div className="text-xs font-mono bg-gray-100 p-2 rounded flex justify-between">
              <span>{shortenAddress(block.author)}</span>
              <button onClick={() => copyToClipboard(block.author)}>
                <Copy size={14} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">区块大小</label>
            <div className="text-sm">{block.size ? formatNumber(block.size) + ' bytes' : 'N/A'}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <a 
          href={`https://etherscan.io/block/${block.number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          在 Etherscan 查看 <ExternalLink size={16} className="ml-1" />
        </a>
      </div>
    </div>
  );

  const renderWalletResults = (walletData) => (
    <div className="space-y-6">
      {/* 钱包信息 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Wallet className="mr-2" size={20} />
          钱包地址分析
        </h3>
        
        <div className="bg-gray-50 p-4 rounded">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm">{walletData.address}</span>
            <button onClick={() => copyToClipboard(walletData.address)}>
              <Copy size={16} />
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <a 
            href={`https://etherscan.io/address/${walletData.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            在 Etherscan 查看 <ExternalLink size={16} className="ml-1" />
          </a>
        </div>
      </div>

      {/* 余额信息 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">账户余额</h3>
        <div className="bg-green-50 rounded p-4">
          <div className="text-2xl font-bold text-green-800">
            {(parseInt(walletData.balance) / 1e18).toFixed(4)} ETH
          </div>
          <div className="text-sm text-green-600 mt-1">
            {formatNumber(walletData.balance)} Wei
          </div>
        </div>
      </div>

      {/* 交易记录 */}
      {walletData.transactions && walletData.transactions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">最近交易记录</h3>
          <div className="space-y-3">
            {walletData.transactions.map((tx, index) => (
              <div key={tx.hash || index} className="border rounded p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium">
                      {tx.from.toLowerCase() === walletData.address.toLowerCase() ? '发送' : '接收'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(tx.timestamp)}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">
                      {(parseInt(tx.value) / 1e18).toFixed(6)} ETH
                    </div>
                    <div className="text-gray-500">
                      块号: {tx.blockNumber}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 space-y-1">
                  <div>从: {shortenAddress(tx.from)}</div>
                  <div>到: {shortenAddress(tx.to)}</div>
                  <div>哈希: {shortenAddress(tx.hash)}</div>
                  <div>Gas: {formatNumber(tx.gasUsed)}</div>
                  
                  {/* Input Data 解析 */}
                  {tx.inputAnalysis && (
                    <div className="mt-2 p-2 bg-gray-50 rounded border-l-2 border-blue-400">
                      <div className="font-semibold text-gray-700 mb-1">
                        📝 Input Data: {tx.inputAnalysis.description}
                      </div>
                      
                      {tx.inputAnalysis.type === 'contract_call' && (
                        <div className="space-y-1">
                          <div>函数选择器: <span className="font-mono text-blue-600">{tx.inputAnalysis.functionSelector}</span></div>
                          {tx.inputAnalysis.parsedData?.parameterCount > 0 && (
                            <div>参数数量: {tx.inputAnalysis.parsedData.parameterCount}</div>
                          )}
                          {tx.inputAnalysis.parsedData?.isReadableString && (
                            <div>可读内容: <span className="italic">"{tx.inputAnalysis.parsedData.possibleString}"</span></div>
                          )}
                          <div>数据长度: {tx.inputAnalysis.parsedData?.dataLength} bytes</div>
                        </div>
                      )}
                      
                      {tx.inputAnalysis.type === 'empty' && (
                        <div className="text-green-600">✅ 简单ETH转账</div>
                      )}
                      
                      {tx.inputAnalysis.type === 'unknown' && tx.inputAnalysis.parsedData?.possibleString && (
                        <div>可能内容: <span className="italic">"{tx.inputAnalysis.parsedData.possibleString}"</span></div>
                      )}
                      
                      {tx.input && tx.input !== '0x' && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                            查看原始数据
                          </summary>
                          <div className="mt-1 p-1 bg-gray-100 rounded font-mono text-xs break-all">
                            {tx.input}
                          </div>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 如果没有找到数据 */}
      {(!walletData.transactions || walletData.transactions.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="text-yellow-600 mr-2" size={20} />
            <div className="text-yellow-800">
              未找到该地址的交易记录，可能是新地址或没有交易活动。
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">The Graph 链上数据查询</h1>
        <p className="text-gray-600">通过块号、交易哈希或钱包地址查询真实的区块链数据</p>
      </div>

      {/* 查询界面 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Database className="mr-2" size={20} />
          区块链数据查询
        </h2>

        {/* 网络选择器 */}
        {networks.length > 0 && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-700">网络选择:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => switchNetwork(network.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    currentNetwork === network.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {network.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* 查询类型选择 */}
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="block"
              checked={queryType === 'block'}
              onChange={(e) => setQueryType(e.target.value)}
              className="mr-2"
            />
            块号查询
          </label>
          <label className="flex items-center opacity-50">
            <input
              type="radio"
              value="transaction"
              checked={queryType === 'transaction'}
              onChange={(e) => setQueryType(e.target.value)}
              className="mr-2"
              disabled
            />
            交易哈希查询 (暂不支持)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="wallet"
              checked={queryType === 'wallet'}
              onChange={(e) => setQueryType(e.target.value)}
              className="mr-2"
            />
            钱包地址查询
          </label>
        </div>

        {/* 输入框 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder={
              queryType === 'block' ? '输入块号 (如: 18000000)' :
              queryType === 'transaction' ? '输入交易哈希 (0x...)' :
              '输入钱包地址 (0x...)'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !inputValue}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Search className="mr-2" size={20} />}
            查询
          </button>
        </div>

        {/* 示例 */}
        <div className="mt-3 text-sm text-gray-500">
          {queryType === 'block' && (
            <div>
              示例块号: 
              <button 
                onClick={() => setInputValue('18000000')}
                className="ml-1 text-blue-600 hover:underline"
              >
                18000000
              </button>
            </div>
          )}
          {queryType === 'wallet' && (
            <div>
              示例地址: 
              <button 
                onClick={() => setInputValue('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')}
                className="ml-1 text-blue-600 hover:underline"
              >
                0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
              </button>
              (Vitalik)
            </div>
          )}
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        </div>
      )}

      {/* 查询结果 */}
      {results && (
        <div className="mb-6">
          {results.type === 'block' && renderBlockResults(results.data)}
          {results.type === 'wallet' && renderWalletResults(results.data)}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">📖 使用说明</h3>
        <div className="text-blue-800 space-y-2 text-sm">
          <p><strong>网络切换:</strong> 支持以太坊主网、Sepolia和Goerli测试网，一键切换。</p>
          <p><strong>块号查询:</strong> 查看具体区块的详细信息，包括交易数量、Gas使用量等。</p>
          <p><strong>钱包地址查询:</strong> 查看钱包余额和完整交易历史，包含Input Data解析。</p>
          <p><strong>Input Data解析:</strong> 自动识别简单转账、合约调用、函数选择器等。</p>
          <p><strong>数据来源:</strong> 所有数据来自Etherscan API，支持多网络查询。</p>
          <p><strong>实时性:</strong> 数据通常有几秒到几分钟的延迟，这是正常现象。</p>
        </div>
      </div>

      {/* 技术说明 */}
      <div className="mt-6 bg-gray-900 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-4 text-green-400">🛠️ 技术实现</h3>
        <div className="space-y-3 text-sm">
          <div>
            <span className="text-yellow-400">数据源:</span>
            <span className="ml-2 text-gray-300">Etherscan API (主网+测试网)</span>
          </div>
          <div>
            <span className="text-yellow-400">网络支持:</span>
            <span className="ml-2 text-gray-300">Mainnet, Sepolia, Goerli</span>
          </div>
          <div>
            <span className="text-yellow-400">Input解析:</span>
            <span className="ml-2 text-gray-300">十六进制转换 + 函数识别</span>
          </div>
          <div>
            <span className="text-yellow-400">架构:</span>
            <span className="ml-2 text-gray-300">React + Express (CORS代理)</span>
          </div>
          <div>
            <span className="text-yellow-400">功能:</span>
            <span className="ml-2 text-gray-300">实时区块查询 + 交易解析</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphDemo;