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
    echo -e "${BLUE}[步骤 $1/6]${NC} $2"
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
    
    # 检查 Docker (可选)
    if command -v docker &> /dev/null; then
        print_success "Docker 已安装 (可用于本地 Graph Node)"
    else
        print_warning "Docker 未安装 (如需本地开发可安装)"
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
# 本地开发环境
CUSTOM_SUBGRAPH_URL=http://localhost:8000/subgraphs/name/limuran/usdt-data-tracker

# 如果已部署到Graph Studio，取消注释并填入你的子图ID：
# CUSTOM_SUBGRAPH_URL=https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/usdt-data-tracker/version/latest

# ===== Etherscan API (免费额度) =====
ETHERSCAN_API_KEY=XVD4YY91ERSKK3NUYS6IZ9MJF2BHDKAQYK

# ===== 服务器配置 =====
PORT=3001
DEFAULT_NETWORK=sepolia

# ===== USDT测试合约信息 =====
USDT_CONTRACT_ADDRESS=0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0
EOL
        print_success ".env 文件已创建"
    else
        print_success ".env 文件已存在"
    fi
    
    echo ""
}

# 安装依赖
install_dependencies() {
    print_step 3 "安装项目依赖..."
    
    if [ -f package.json ]; then
        echo "正在安装 npm 依赖..."
        npm install
        if [ $? -eq 0 ]; then
            print_success "依赖安装成功"
        else
            print_error "依赖安装失败"
            exit 1
        fi
    else
        print_error "未找到 package.json 文件"
        exit 1
    fi
    
    echo ""
}

# 检查子图状态
check_subgraph_status() {
    print_step 4 "检查子图状态..."
    
    # 检查本地子图
    echo "检查本地子图连接..."
    if curl -s "http://localhost:8000/subgraphs/name/limuran/usdt-data-tracker" > /dev/null 2>&1; then
        print_success "本地子图运行中"
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
        
        # 询问是否使用 Graph Studio
        read -p "是否已将子图部署到 Graph Studio? (y/N): " use_studio
        if [[ $use_studio =~ ^[Yy]$ ]]; then
            read -p "请输入你的子图ID: " subgraph_id
            if [ ! -z "$subgraph_id" ]; then
                # 更新 .env 文件
                sed -i.bak "s|CUSTOM_SUBGRAPH_URL=.*|CUSTOM_SUBGRAPH_URL=https://api.studio.thegraph.com/query/$subgraph_id/usdt-data-tracker/version/latest|" .env
                print_success "已更新为使用 Graph Studio 子图"
                export SUBGRAPH_STATUS="studio"
            fi
        else
            print_warning "将使用模拟数据模式"
            export SUBGRAPH_STATUS="mock"
        fi
    fi
    
    echo ""
}

# 启动服务
start_services() {
    print_step 5 "启动服务..."
    
    # 检查端口是否被占用
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口 3001 已被占用，尝试停止现有进程..."
        pkill -f "node.*server" 2>/dev/null || true
    fi
    
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口 3000 已被占用，尝试停止现有进程..."
        pkill -f "react-scripts" 2>/dev/null || true
    fi
    
    echo "启动后端服务 (端口 3001)..."
    nohup npm run server-hybrid > server.log 2>&1 &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 3
    
    # 检查服务器状态
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "后端服务启动成功 (PID: $SERVER_PID)"
    else
        print_error "后端服务启动失败"
        echo "查看日志："
        tail -10 server.log
        exit 1
    fi
    
    echo "启动前端服务 (端口 3000)..."
    nohup npm run client > client.log 2>&1 &
    CLIENT_PID=$!
    
    # 保存 PID
    echo $SERVER_PID > .server.pid
    echo $CLIENT_PID > .client.pid
    
    print_success "前端服务启动成功 (PID: $CLIENT_PID)"
    echo ""
}

# 显示启动信息
show_startup_info() {
    print_step 6 "启动完成！"
    
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
    
    if [ "$SUBGRAPH_STATUS" = "local" ]; then
        echo -e "${CYAN}📊 数据源状态:${NC}"
        echo -e "   自建子图: ${GREEN}✅ 本地运行中${NC}"
        echo -e "   Etherscan: ${GREEN}✅ 免费API${NC}"
    elif [ "$SUBGRAPH_STATUS" = "studio" ]; then
        echo -e "${CYAN}📊 数据源状态:${NC}"
        echo -e "   自建子图: ${GREEN}✅ Graph Studio${NC}"
        echo -e "   Etherscan: ${GREEN}✅ 免费API${NC}"
    else
        echo -e "${CYAN}📊 数据源状态:${NC}"
        echo -e "   自建子图: ${YELLOW}⚠️  需要部署${NC}"
        echo -e "   Etherscan: ${GREEN}✅ 免费API${NC}"
    fi
    echo ""
    
    echo -e "${CYAN}🛠️ 管理命令:${NC}"
    echo -e "   停止服务: ${YELLOW}./quick-start.sh stop${NC}"
    echo -e "   查看日志: ${YELLOW}tail -f server.log${NC} 或 ${YELLOW}tail -f client.log${NC}"
    echo -e "   重启服务: ${YELLOW}./quick-start.sh restart${NC}"
    echo ""
    
    echo -e "${PURPLE}🚀 现在你可以享受零成本的区块链数据查询服务！${NC}"
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
    sleep 2
    start_services
    show_startup_info
}

# 主函数
main() {
    case "${1:-start}" in
        "start")
            print_banner
            check_dependencies
            setup_environment
            install_dependencies
            check_subgraph_status
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
            if [ -f .server.pid ] && [ -f .client.pid ]; then
                SERVER_PID=$(cat .server.pid)
                CLIENT_PID=$(cat .client.pid)
                if kill -0 $SERVER_PID 2>/dev/null && kill -0 $CLIENT_PID 2>/dev/null; then
                    print_success "服务运行中 - 前端: http://localhost:3000, API: http://localhost:3001"
                else
                    print_warning "服务未运行"
                fi
            else
                print_warning "服务未启动"
            fi
            ;;
        *)
            echo "用法: $0 {start|stop|restart|status}"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动服务 (默认)"
            echo "  stop    - 停止服务"
            echo "  restart - 重启服务"
            echo "  status  - 检查服务状态"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"