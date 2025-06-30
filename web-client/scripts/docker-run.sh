#!/bin/bash

# Docker运行脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
IMAGE_NAME="three-kingdoms-web-client"
CONTAINER_NAME="three-kingdoms-web"
HOST_PORT=${HOST_PORT:-8080}
CONTAINER_PORT=${CONTAINER_PORT:-8080}
ENVIRONMENT=${ENVIRONMENT:-production}

# 函数定义
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 停止并删除现有容器
stop_existing_container() {
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Stopping existing container: $CONTAINER_NAME"
        docker stop $CONTAINER_NAME >/dev/null 2>&1 || true
        docker rm $CONTAINER_NAME >/dev/null 2>&1 || true
        log_success "Existing container removed"
    fi
}

# 运行容器
run_container() {
    local tag=${1:-latest}
    local mode=${2:-detached}
    
    local docker_cmd="docker run"
    local volume_mounts=""
    local env_vars=""
    
    # 基本配置
    if [ "$mode" = "detached" ]; then
        docker_cmd="$docker_cmd -d"
    else
        docker_cmd="$docker_cmd -it"
    fi
    
    docker_cmd="$docker_cmd --name $CONTAINER_NAME"
    docker_cmd="$docker_cmd -p $HOST_PORT:$CONTAINER_PORT"
    
    # 环境变量
    env_vars="$env_vars -e ENVIRONMENT=$ENVIRONMENT"
    
    if [ ! -z "$API_BASE_URL" ]; then
        env_vars="$env_vars -e API_BASE_URL=$API_BASE_URL"
    fi
    
    if [ ! -z "$WS_BASE_URL" ]; then
        env_vars="$env_vars -e WS_BASE_URL=$WS_BASE_URL"
    fi
    
    if [ ! -z "$APP_VERSION" ]; then
        env_vars="$env_vars -e APP_VERSION=$APP_VERSION"
    fi
    
    # 开发模式特殊配置
    if [ "$ENVIRONMENT" = "development" ]; then
        volume_mounts="$volume_mounts -v $(pwd):/app"
        volume_mounts="$volume_mounts -v /app/node_modules"
        docker_cmd="$docker_cmd -p 24678:24678" # Vite HMR port
    fi
    
    # 健康检查
    docker_cmd="$docker_cmd --health-cmd='curl -f http://localhost:$CONTAINER_PORT/health || exit 1'"
    docker_cmd="$docker_cmd --health-interval=30s"
    docker_cmd="$docker_cmd --health-timeout=10s"
    docker_cmd="$docker_cmd --health-retries=3"
    
    # 重启策略
    docker_cmd="$docker_cmd --restart=unless-stopped"
    
    # 完整命令
    local full_command="$docker_cmd $env_vars $volume_mounts $IMAGE_NAME:$tag"
    
    log_info "Running container with command:"
    echo "$full_command"
    echo ""
    
    eval $full_command
    
    if [ "$mode" = "detached" ]; then
        log_success "Container started successfully: $CONTAINER_NAME"
        log_info "Container is running on http://localhost:$HOST_PORT"
        
        # 等待容器启动
        log_info "Waiting for container to be healthy..."
        timeout=60
        counter=0
        while [ $counter -lt $timeout ]; do
            if docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null | grep -q "healthy"; then
                log_success "Container is healthy and ready!"
                break
            fi
            sleep 2
            counter=$((counter + 2))
            echo -n "."
        done
        
        if [ $counter -ge $timeout ]; then
            log_warning "Container health check timeout. Check container logs."
        fi
    fi
}

# 显示容器日志
show_logs() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Showing logs for container: $CONTAINER_NAME"
        docker logs -f $CONTAINER_NAME
    else
        log_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

# 进入容器shell
enter_container() {
    if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        log_info "Entering container: $CONTAINER_NAME"
        docker exec -it $CONTAINER_NAME /bin/sh
    else
        log_error "Container $CONTAINER_NAME is not running"
        exit 1
    fi
}

# 显示容器状态
show_status() {
    echo "Container Status:"
    echo "=================="
    
    if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        docker ps -a --filter "name=${CONTAINER_NAME}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}\t{{.Image}}"
        
        echo ""
        echo "Health Status:"
        docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "No health check"
        
        echo ""
        echo "Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $CONTAINER_NAME 2>/dev/null || echo "Container not running"
    else
        echo "Container $CONTAINER_NAME does not exist"
    fi
}

# 显示帮助信息
show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  run [TAG]     Run the container (default: detached mode)"
    echo "  dev [TAG]     Run in development mode (interactive)"
    echo "  stop          Stop the container"
    echo "  restart       Restart the container"
    echo "  logs          Show container logs"
    echo "  shell         Enter container shell"
    echo "  status        Show container status"
    echo "  clean         Stop and remove container"
    echo ""
    echo "Options:"
    echo "  -p, --port PORT       Host port (default: 8080)"
    echo "  -e, --env KEY=VALUE   Set environment variable"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  HOST_PORT             Host port to bind (default: 8080)"
    echo "  API_BASE_URL          API base URL"
    echo "  WS_BASE_URL           WebSocket base URL"
    echo "  APP_VERSION           Application version"
    echo "  ENVIRONMENT           Environment (production/development)"
    echo ""
    echo "Examples:"
    echo "  $0 run                    # Run latest image"
    echo "  $0 run v1.0.0             # Run specific version"
    echo "  $0 dev                    # Run in development mode"
    echo "  $0 logs                   # Show container logs"
    echo "  $0 shell                  # Enter container"
}

# 主函数
main() {
    local command=${1:-run}
    local tag=${2:-latest}
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--port)
                HOST_PORT="$2"
                shift 2
                ;;
            -e|--env)
                export "$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            run|dev|stop|restart|logs|shell|status|clean)
                command="$1"
                shift
                if [[ $# -gt 0 && ! $1 =~ ^- ]]; then
                    tag="$1"
                    shift
                fi
                ;;
            *)
                if [[ $1 =~ ^- ]]; then
                    log_error "Unknown option: $1"
                    show_help
                    exit 1
                else
                    tag="$1"
                    shift
                fi
                ;;
        esac
    done
    
    # 执行命令
    case $command in
        run)
            stop_existing_container
            run_container $tag detached
            ;;
        dev)
            ENVIRONMENT=development
            CONTAINER_NAME="${CONTAINER_NAME}-dev"
            IMAGE_NAME="${IMAGE_NAME}:dev"
            stop_existing_container
            run_container dev interactive
            ;;
        stop)
            log_info "Stopping container: $CONTAINER_NAME"
            docker stop $CONTAINER_NAME
            log_success "Container stopped"
            ;;
        restart)
            log_info "Restarting container: $CONTAINER_NAME"
            docker restart $CONTAINER_NAME
            log_success "Container restarted"
            ;;
        logs)
            show_logs
            ;;
        shell)
            enter_container
            ;;
        status)
            show_status
            ;;
        clean)
            stop_existing_container
            log_success "Container cleaned up"
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"