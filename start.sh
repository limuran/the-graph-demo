#!/bin/bash

echo "🚀 启动 The Graph + Etherscan 混合架构服务器"
echo "================================================"

# 检查环境变量配置
if [ -f .env ]; then
    echo "✅ 找到 .env 配置文件"
    source .env
else
    echo "⚠️  未找到 .env 文件，使用默认配置"
    echo "💡 建议: 复制 .env.example 为 .env 并配置 API 密钥"
fi

# 检查依赖
if [ ! -d node_modules ]; then
    echo "📦 安装依赖包..."
    npm install
else
    echo "✅ 依赖包已安装"
fi

# 显示配置状态
echo ""
echo "📊 配置检查:"
if [ -n "$GRAPH_API_KEY" ]; then
    echo "   The Graph: ✅ 已配置"
else
    echo "   The Graph: ❌ 未配置 (DeFi 功能将不可用)"
fi

if [ -n "$ETHERSCAN_API_KEY" ]; then
    echo "   Etherscan: ✅ 已配置"  
else
    echo "   Etherscan: ⚠️  使用默认密钥 (可能有限制)"
fi

echo ""
echo "🌟 使用的官方子图:"
echo "   • Uniswap V3: 5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV"
echo "   • Uniswap V2: DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G" 
echo "   • Compound:  A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum"

echo ""
echo "🎯 启动选项:"
echo "1. 混合架构服务器 (推荐)"
echo "2. 原始服务器"
echo "3. 仅前端应用"

read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo "🚀 启动混合架构服务器..."
        node server-hybrid.js
        ;;
    2)
        echo "🚀 启动原始服务器..."
        node server.js
        ;;
    3)
        echo "🚀 启动前端应用..."
        npm run client
        ;;
    *)
        echo "🚀 默认启动混合架构..."
        node server-hybrid.js
        ;;
esac
