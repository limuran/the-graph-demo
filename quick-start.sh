#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 函数定义
print_banner() {
    echo -e "${PURPLE}"
    echo "=============================================="
    echo "🚀 自建子图区块链数据平台 - 快速启动"
    echo "=============================================="
    echo -e "${NC}"
    echo -e "${GREEN}✨ 零成本替代付费The Graph方案${NC}"
    echo -e "${CYAN}📊 基于你的 usdt-data-tracker 子图${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}[步骤 $1/7]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查依赖
check_dependencies() {
    print_step 1 "检查系统依赖..."
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js 已安装: $NODE_VERSION"
    else
        print_error "Node.js 未安装，请先安装 Node.js 16+"
        exit 1
    fi
    
    # 检查 npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm 已安装: $NPM_VERSION"
    else
        print_error "npm 未安装"
        exit 1
    fi
    
    # 检查必要的系统命令
    if command -v curl &> /dev/null; then
        print_success "curl 已安装"
    else
        print_warning "curl 未安装，某些功能可能受限"
    fi
    
    # 检查 lsof
    if command -v lsof &> /dev/null; then
        print_success "lsof 已安装"
    else
        print_warning "lsof 未安装，端口检查功能受限"
    fi
    
    echo ""
}

# 设置环境变量
setup_environment() {
    print_step 2 "设置环境变量..."
    
    if [ ! -f .env ]; then
        echo "创建 .env 文件..."
        cat > .env << EOL
# ===== 自建子图配置 (免费) =====
# Graph Studio 子图 (推荐使用)
CUSTOM_SUBGRAPH_URL=https://api.studio.thegraph.com/query/119498/usdt-data-tracker/version/latest

# 本地开发环境 (如果你有本地Graph Node)
# CUSTOM_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/limuran/usdt-data-tracker

# ===== Etherscan API (免费额度) =====
ETHERSCAN_API_KEY=XVD4YY91ERSKK3NUYS6IZ9MJF2BHDKAQYK

# ===== 服务器配置 =====
PORT=3001
DEFAULT_NETWORK=sepolia

# ===== USDT测试合约信息 =====
USDT_CONTRACT_ADDRESS=0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0

# ===== 调试配置 =====
NODE_ENV=development
LOG_LEVEL=info
EOL
        print_success ".env 文件已创建 (默认使用Graph Studio子图)"
    else
        print_success ".env 文件已存在"
        
        # 检查是否需要更新子图URL
        if grep -q "YOUR_SUBGRAPH_ID" .env 2>/dev/null; then
            print_warning "检测到占位符配置，正在更新..."
            sed -i.bak 's|YOUR_SUBGRAPH_ID|119498|g' .env
            print_success "已更新为你的子图ID: 119498"
        fi
    fi
    
    # 显示当前配置
    echo ""
    echo -e "${CYAN}当前环境配置:${NC}"
    if grep -q "studio.thegraph.com" .env; then
        echo -e "   数据源: ${GREEN}Graph Studio 子图${NC}"
        echo -e "   子图ID: ${BLUE}119498${NC}"
    elif grep -q "localhost:8000" .env; then
        echo -e "   数据源: ${YELLOW}本地子图${NC}"
    fi
    echo ""
}

# 安装依赖
install_dependencies() {
    print_step 3 "检查并安装项目依赖..."
    
    if [ ! -f package.json ]; then
        print_error "未找到 package.json 文件，请确认在正确的目录中"
        exit 1
    fi
    
    # 检查 node_modules 是否存在
    if [ ! -d node_modules ]; then
        echo "首次运行，正在安装依赖..."
        npm install
        if [ $? -eq 0 ]; then
            print_success "依赖安装成功"
        else
            print_error "依赖安装失败，请检查网络连接"
            exit 1
        fi
    else
        # 检查是否需要更新依赖
        if [ package.json -nt node_modules ]; then
            echo "检测到 package.json 更新，正在更新依赖..."
            npm install
        else
            print_success "依赖已是最新"
        fi
    fi
    
    echo ""
}

# 测试子图连接
test_subgraph_connection() {
    print_step 4 "测试子图连接..."
    
    # 从 .env 文件读取子图URL
    if [ -f .env ]; then
        SUBGRAPH_URL=$(grep "CUSTOM_SUBGRAPH_URL=" .env | cut -d'=' -f2)
        echo "测试子图连接: $SUBGRAPH_URL"
        
        if [[ $SUBGRAPH_URL == *"studio.thegraph.com"* ]]; then
            # 测试 Graph Studio 子图
            echo "正在测试 Graph Studio 子图连接..."
            
            # 构造一个简单的GraphQL查询
            QUERY='{"query": "{ _meta { block { number } } }"}'
            
            if command -v curl &> /dev/null; then
                RESPONSE=$(curl -s -X POST \
                    -H "Content-Type: application/json" \
                    -d "$QUERY" \
                    "$SUBGRAPH_URL" 2>/dev/null)
                
                if echo "$RESPONSE" | grep -q "block" 2>/dev/null; then
                    print_success "Graph Studio 子图连接成功"
                    export SUBGRAPH_STATUS="studio"
                elif echo "$RESPONSE" | grep -q "error" 2>/dev/null; then
                    print_warning "子图连接有误，但服务可以启动"
                    print_warning "错误信息: $(echo "$RESPONSE" | head -1)"
                    export SUBGRAPH_STATUS="error"
                else
                    print_warning "子图响应异常，将使用备用数据源"
                    export SUBGRAPH_STATUS="backup"
                fi
            else
                print_warning "无法测试子图连接 (curl未安装)"
                export SUBGRAPH_STATUS="unknown"
            fi
            
        elif [[ $SUBGRAPH_URL == *"localhost"* ]]; then
            # 测试本地子图
            echo "正在测试本地子图连接..."
            
            if command -v curl &> /dev/null; then
                if curl -s "$SUBGRAPH_URL" > /dev/null 2>&1; then
                    print_success "本地子图连接成功"
                    export SUBGRAPH_STATUS="local"
                else
                    print_warning "本地子图未运行"
                    echo ""
                    echo -e "${CYAN}要启动本地子图，请按以下步骤：${NC}"
                    echo "1. cd ../usdt-data-tracker"
                    echo "2. npm install"
                    echo "3. npm run codegen && npm run build"
                    echo "4. npm run create-local && npm run deploy-local"
                    echo ""
                    export SUBGRAPH_STATUS="local_offline"
                fi
            else
                export SUBGRAPH_STATUS="unknown"
            fi
        else
            print_warning "未知的子图URL格式"
            export SUBGRAPH_STATUS="unknown"
        fi
    else
        print_error ".env 文件不存在"
        exit 1
    fi
    
    echo ""
}

# 清理端口
cleanup_ports() {
    print_step 5 "清理端口占用..."
    
    # 检查并清理端口 3001
    if command -v lsof &> /dev/null; then
        if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "端口 3001 被占用，正在清理..."
            lsof -ti:3001 | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
        
        if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
            print_warning "端口 3000 被占用，正在清理..."
            lsof -ti:3000 | xargs kill -9 2>/dev/null || true
            sleep 1
        fi
    else
        # 使用 pkill 作为备选方案
        print_warning "使用 pkill 清理进程..."
        pkill -f "node.*server" 2>/dev/null || true
        pkill -f "react-scripts" 2>/dev/null || true
        sleep 2
    fi
    
    print_success "端口清理完成"
    echo ""
}

# 启动服务
start_services() {
    print_step 6 "启动服务..."
    
    # 确保日志目录存在
    mkdir -p logs 2>/dev/null || true
    
    echo "启动后端服务 (端口 3001)..."
    
    # 使用 nohup 启动后端，并重定向输出
    nohup npm run server-hybrid > logs/server.log 2>&1 &
    SERVER_PID=$!
    
    # 等待服务器启动
    echo "等待后端服务启动..."
    sleep 5
    
    # 检查服务器状态
    MAX_RETRIES=10
    RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if command -v curl &> /dev/null; then
            if curl -s http://localhost:3001/health > /dev/null 2>&1; then
                print_success "后端服务启动成功 (PID: $SERVER_PID)"
                break
            fi
        else
            # 如果没有 curl，检查进程是否还在运行
            if kill -0 $SERVER_PID 2>/dev/null; then
                print_success "后端服务进程运行中 (PID: $SERVER_PID)"
                break
            fi
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "重试中... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done
    
    # 最终检查
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        print_error "后端服务启动失败"
        echo ""
        echo "错误日志:"
        if [ -f logs/server.log ]; then
            tail -20 logs/server.log
        else
            echo "日志文件不存在"
        fi
        echo ""
        echo "常见解决方案:"
        echo "1. 检查 .env 配置是否正确"
        echo "2. 确认子图URL可以访问"
        echo "3. 检查网络连接"
        echo "4. 运行: npm run server-hybrid 查看详细错误"
        exit 1
    fi
    
    echo ""
    echo "启动前端服务 (端口 3000)..."
    nohup npm run client > logs/client.log 2>&1 &
    CLIENT_PID=$!
    
    # 等待前端启动
    sleep 3
    
    # 保存 PID
    echo $SERVER_PID > .server.pid
    echo $CLIENT_PID > .client.pid
    
    print_success "前端服务启动成功 (PID: $CLIENT_PID)"
    echo ""
}

# 显示启动信息
show_startup_info() {
    print_step 7 "启动完成！"
    
    echo -e "${GREEN}🎉 自建子图区块链数据平台已启动成功！${NC}"
    echo ""
    echo -e "${CYAN}📱 访问地址:${NC}"
    echo -e "   前端界面: ${BLUE}http://localhost:3000${NC}"
    echo -e "   API服务: ${BLUE}http://localhost:3001${NC}"
    echo -e "   健康检查: ${BLUE}http://localhost:3001/health${NC}"
    echo ""
    
    echo -e "${CYAN}🔗 主要API端点:${NC}"
    echo -e "   GET  /api/usdt/transfers     - USDT转账记录"
    echo -e "   POST /api/usdt/user          - 用户活动查询"
    echo -e "   GET  /api/usdt/stats         - 代币统计"
    echo -e "   POST /api/contract/at-block  - 合约+块查询"
    echo ""
    
    echo -e "${CYAN}💰 成本优势:${NC}"
    echo -e "   传统方案 (付费The Graph): ${RED}\$100+/月${NC}"
    echo -e "   自建方案 (当前):         ${GREEN}\$0/月 🎉${NC}"
    echo ""
    
    # 显示数据源状态
    case "${SUBGRAPH_STATUS:-unknown}" in
        "studio")
            echo -e "${CYAN}📊 数据源状态:${NC}"
            echo -e "   自建子图: ${GREEN}✅ Graph Studio (ID: 119498)${NC}"
            echo -e "   Etherscan: ${GREEN}✅ 免费API${NC}"
            ;;
        "local")
            echo -e "${CYAN}📊 数据源状态:${NC}"
            echo -e "   自建子图: ${GREEN}✅ 本地运行中${NC}"
            echo -e "   Etherscan: ${GREEN}✅ 免费API${NC}"
            ;;
        "error"|"backup")
            echo -e "${CYAN}📊 数据源状态:${NC}"
            echo -e "   自建子图: ${YELLOW}⚠️  连接异常，使用备用源${NC}"
            echo -e "   Etherscan: ${GREEN}✅ 免费API (主要数据源)${NC}"
            ;;
        "local_offline")
            echo -e "${CYAN}📊 数据源状态:${NC}"
            echo -e "   自建子图: ${RED}❌ 本地子图未运行${NC}"
            echo -e "   Etherscan: ${GREEN}✅ 免费API (唯一数据源)${NC}"
            ;;
        *)
            echo -e "${CYAN}📊 数据源状态:${NC}"
            echo -e "   自建子图: ${YELLOW}⚠️  状态未知${NC}"
            echo -e "   Etherscan: ${GREEN}✅ 免费API${NC}"
            ;;
    esac
    echo ""
    
    echo -e "${CYAN}🛠️ 管理命令:${NC}"
    echo -e "   停止服务: ${YELLOW}./quick-start.sh stop${NC}"
    echo -e "   查看日志: ${YELLOW}tail -f logs/server.log${NC} 或 ${YELLOW}tail -f logs/client.log${NC}"
    echo -e "   重启服务: ${YELLOW}./quick-start.sh restart${NC}"
    echo -e "   服务状态: ${YELLOW}./quick-start.sh status${NC}"
    echo ""
    
    # 如果有子图问题，提供帮助信息
    if [[ "$SUBGRAPH_STATUS" == "error" || "$SUBGRAPH_STATUS" == "local_offline" ]]; then
        echo -e "${YELLOW}💡 子图使用提示:${NC}"
        echo -e "   当前主要使用 Etherscan API 提供数据"
        echo -e "   子图功能可能受限，但基本功能正常"
        echo -e "   如需完整功能，请确保子图正常运行"
        echo ""
    fi
    
    echo -e "${PURPLE}🚀 现在你可以享受零成本的区块链数据查询服务！${NC}"
    
    # 自动打开浏览器 (可选)
    if command -v python3 &> /dev/null; then
        echo ""
        read -p "是否自动打开浏览器? (y/N): " open_browser
        if [[ $open_browser =~ ^[Yy]$ ]]; then
            python3 -c "import webbrowser; webbrowser.open('http://localhost:3000')" 2>/dev/null &
        fi
    fi
}

# 停止服务
stop_services() {
    echo -e "${YELLOW}停止服务中...${NC}"
    
    if [ -f .server.pid ]; then
        SERVER_PID=$(cat .server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            print_success "后端服务已停止 (PID: $SERVER_PID)"
        fi
        rm .server.pid
    fi
    
    if [ -f .client.pid ]; then
        CLIENT_PID=$(cat .client.pid)
        if kill -0 $CLIENT_PID 2>/dev/null; then
            kill $CLIENT_PID
            print_success "前端服务已停止 (PID: $CLIENT_PID)"
        fi
        rm .client.pid
    fi
    
    # 确保端口被释放
    pkill -f "node.*server" 2>/dev/null || true
    pkill -f "react-scripts" 2>/dev/null || true
    
    echo -e "${GREEN}所有服务已停止${NC}"
}

# 重启服务
restart_services() {
    echo -e "${YELLOW}重启服务中...${NC}"
    stop_services
    sleep 3
    main start
}

# 显示服务状态
show_status() {
    echo -e "${BLUE}服务状态检查:${NC}"
    echo ""
    
    # 检查PID文件
    if [ -f .server.pid ] && [ -f .client.pid ]; then
        SERVER_PID=$(cat .server.pid)
        CLIENT_PID=$(cat .client.pid)
        
        # 检查进程是否运行
        SERVER_RUNNING=false
        CLIENT_RUNNING=false
        
        if kill -0 $SERVER_PID 2>/dev/null; then
            SERVER_RUNNING=true
        fi
        
        if kill -0 $CLIENT_PID 2>/dev/null; then
            CLIENT_RUNNING=true
        fi
        
        echo -e "后端服务: $([ "$SERVER_RUNNING" = true ] && echo -e "${GREEN}✅ 运行中${NC} (PID: $SERVER_PID)" || echo -e "${RED}❌ 已停止${NC}")"
        echo -e "前端服务: $([ "$CLIENT_RUNNING" = true ] && echo -e "${GREEN}✅ 运行中${NC} (PID: $CLIENT_PID)" || echo -e "${RED}❌ 已停止${NC}")"
        
        # 检查端口
        if command -v curl &> /dev/null; then
            echo ""
            echo "端口检查:"
            if curl -s http://localhost:3001/health > /dev/null 2>&1; then
                echo -e "  API服务 (3001): ${GREEN}✅ 可访问${NC}"
            else
                echo -e "  API服务 (3001): ${RED}❌ 不可访问${NC}"
            fi
            
            if curl -s http://localhost:3000 > /dev/null 2>&1; then
                echo -e "  前端服务 (3000): ${GREEN}✅ 可访问${NC}"
            else
                echo -e "  前端服务 (3000): ${RED}❌ 不可访问${NC}"
            fi
        fi
        
        # 如果都在运行，显示访问链接
        if [ "$SERVER_RUNNING" = true ] && [ "$CLIENT_RUNNING" = true ]; then
            echo ""
            echo -e "${CYAN}访问链接:${NC}"
            echo -e "  前端: ${BLUE}http://localhost:3000${NC}"
            echo -e "  API: ${BLUE}http://localhost:3001${NC}"
        fi
        
    else
        echo -e "${YELLOW}⚠️  服务未启动或PID文件不存在${NC}"
        echo "请运行: ./quick-start.sh start"
    fi
}

# 显示日志
show_logs() {
    case "$1" in
        "server")
            if [ -f logs/server.log ]; then
                tail -f logs/server.log
            else
                echo "后端日志文件不存在"
            fi
            ;;
        "client")
            if [ -f logs/client.log ]; then
                tail -f logs/client.log
            else
                echo "前端日志文件不存在"
            fi
            ;;
        *)
            echo "显示最近的日志:"
            echo ""
            if [ -f logs/server.log ]; then
                echo -e "${CYAN}后端日志 (最近10行):${NC}"
                tail -10 logs/server.log
                echo ""
            fi
            if [ -f logs/client.log ]; then
                echo -e "${CYAN}前端日志 (最近10行):${NC}"
                tail -10 logs/client.log
            fi
            ;;
    esac
}

# 主函数
main() {
    case "${1:-start}" in
        "start")
            print_banner
            check_dependencies
            setup_environment
            install_dependencies
            test_subgraph_connection
            cleanup_ports
            start_services
            show_startup_info
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            restart_services
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        *)
            echo "用法: $0 {start|stop|restart|status|logs}"
            echo ""
            echo "命令说明:"
            echo "  start           - 启动服务 (默认)"
            echo "  stop            - 停止服务"
            echo "  restart         - 重启服务"
            echo "  status          - 检查服务状态"
            echo "  logs [server|client] - 查看日志"
            echo ""
            echo "示例:"
            echo "  ./quick-start.sh start"
            echo "  ./quick-start.sh logs server"
            echo "  ./quick-start.sh logs client"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"