#!/bin/bash

# CMS前端简易部署脚本
# 使用方法: ./deploy.sh [环境]
# 环境选项: stage(默认), stage, prod

set -e  # 遇到错误立即退出

# ==================== 配置区域 ====================
# 获取环境参数，默认为test
ENV=${1:-stage}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 文件命名配置
PROJECT_NAME="points-front"
VERSION=$(grep '"version"' package.json 2>/dev/null | sed 's/.*"version": *"\([^"]*\)".*/\1/' || echo "1.0.0")

# 生成文件名（可以根据需要修改命名规则）
ARCHIVE_NAME="${PROJECT_NAME}.tar.gz"

# 服务器配置
SERVER_PORT="2618"  # SSH连接端口

case $ENV in
    "stage")
        SERVER_HOST="140.210.90.103"
        SERVER_USER="root"
        SERVER_PATH="/root/nginx/html"
        BUILD_CMD="pnpm build:stage"
        REMOTE_FILENAME="points-front.tar.gz"
        ;;
    "test")
        SERVER_HOST="140.210.90.103"
        SERVER_USER="root"
        SERVER_PATH="/root/nginx/html"
        BUILD_CMD="pnpm build:test"
        REMOTE_FILENAME="points-front.tar.gz"
        ;;
    "prod")
        SERVER_HOST="140.210.90.103"
        SERVER_USER="root"
        SERVER_PATH="/root/nginx/html"
        BUILD_CMD="pnpm build:prod"
        REMOTE_FILENAME="points-front.tar.gz"
        ;;
    *)
        echo "❌ 不支持的环境: $ENV"
        echo "支持的环境: dev, test, prod"
        exit 1
        ;;
esac

# ==================== 工具函数 ====================
log_info() {
    echo "🔵 $(date '+%H:%M:%S') - $1"
}

log_success() {
    echo "✅ $(date '+%H:%M:%S') - $1"
}

log_error() {
    echo "❌ $(date '+%H:%M:%S') - $1" >&2
}

# 检查命令是否存在
check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "命令 '$1' 未找到，请先安装"
        exit 1
    fi
}

# ==================== 主要流程 ====================
log_info "开始部署 ruoyi 前端项目"
log_info "目标环境: $ENV"
log_info "项目版本: $VERSION"
log_info "目标服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
log_info "部署路径: $SERVER_PATH"
log_info "本地压缩包: $ARCHIVE_NAME"
log_info "远程文件名: $REMOTE_FILENAME"

# # 生产环境确认
# if [[ "$ENV" == "prod" ]]; then
#     echo ""
#     echo "⚠️  即将部署到生产环境！"
#     read -p "请输入 'YES' 确认继续: " confirm
#     if [[ "$confirm" != "YES" ]]; then
#         log_info "部署已取消"
#         exit 0
#     fi
# fi

# 1. 检查依赖
log_info "检查系统依赖..."
check_command "npm"
check_command "tar"
check_command "scp"
check_command "ssh"

# 2. 检查项目文件
if [[ ! -f "package.json" ]]; then
    log_error "package.json 文件不存在，请在项目根目录下执行脚本"
    exit 1
fi

# 3. 检查是否存在已构建的points-front目录
if [[ -d "points-front" ]]; then
    log_info "发现已存在的构建目录 'points-front'，将重新构建以确保使用最新代码"
else
    log_info "未发现构建目录 'points-front'，将执行完整构建流程"
fi

# # 4. 安装依赖
# log_info "安装项目依赖..."
# yarn install || {
#     log_error "依赖安装失败"
#     exit 1
# }

# 5. 构建项目
log_info "构建项目 ($BUILD_CMD)..."
$BUILD_CMD || {
    log_error "项目构建失败"
    exit 1
}

# 6. 最终检查构建结果
if [[ ! -d "points-front" ]]; then
    log_error "构建输出目录 'points-front' 不存在"
    exit 1
fi

# 7. 创建压缩包
log_info "创建部署压缩包..."
tar -zcf "$ARCHIVE_NAME" points-front/ || {
    log_error "创建压缩包失败"
    exit 1
}

# 显示压缩包信息
ARCHIVE_SIZE=$(du -h "$ARCHIVE_NAME" | cut -f1)
log_success "压缩包创建完成: $ARCHIVE_NAME ($ARCHIVE_SIZE)"

# 8. 上传到服务器
log_info "上传文件到服务器..."
log_info "本地文件: $ARCHIVE_NAME"
log_info "远程文件: $REMOTE_FILENAME"
scp -P "$SERVER_PORT" "$ARCHIVE_NAME" "$SERVER_USER@$SERVER_HOST:$SERVER_PATH/$REMOTE_FILENAME" || {
    log_error "文件上传失败"
    rm -f "$ARCHIVE_NAME"
    exit 1
}

# 9. 远程部署（已移除备份命令）
log_info "执行远程部署..."
ssh -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "
    cd $SERVER_PATH && \
    echo '解压新版本...' && \
    tar -zxf $REMOTE_FILENAME && \
    echo '清理压缩包...' && \
    rm -f $REMOTE_FILENAME && \
    echo '部署完成！'
" || {
    log_error "远程部署失败"
    rm -f "$ARCHIVE_NAME"
    exit 1
}

# 10. 清理本地文件
log_info "清理本地临时文件..."
rm -f "$ARCHIVE_NAME"

# 删除本地构建目录
if [[ -d "points-front" ]]; then
    log_info "删除本地构建目录 'points-front'..."
    rm -rf "points-front"
    log_success "本地构建目录已删除"
fi

# 11. 完成
log_success "🎉 部署完成！"
log_info "环境: $ENV"
log_info "版本: $VERSION"
log_info "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
log_info "部署路径: $SERVER_PATH"
log_info "本地文件: $ARCHIVE_NAME"
log_info "远程文件: $REMOTE_FILENAME"
log_info "部署时间: $(date '+%Y-%m-%d %H:%M:%S')"

# 显示访问提示
case $ENV in
    "dev")
        log_info "开发环境访问: http://$SERVER_HOST"
        ;;
    "test")
        log_info "测试环境访问: http://$SERVER_HOST"
        ;;
    "prod")
        echo ""
        echo "⚠️  生产环境部署完成，请及时验证功能是否正常！"
        ;;
esac
