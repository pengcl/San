#!/bin/bash

# Docker构建脚本
set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
IMAGE_NAME="three-kingdoms-web-client"
REGISTRY=${DOCKER_REGISTRY:-""}
TAG=${DOCKER_TAG:-"latest"}
BUILD_TARGET=${BUILD_TARGET:-"production"}
PLATFORM=${PLATFORM:-"linux/amd64,linux/arm64"}

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

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker not found. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    log_success "Docker is available and running"
}

# 检查buildx插件
check_buildx() {
    if ! docker buildx version &> /dev/null; then
        log_warning "Docker buildx not found. Multi-platform builds will not be available."
        return 1
    fi
    
    log_success "Docker buildx is available"
    return 0
}

# 构建镜像
build_image() {
    local dockerfile=${1:-"Dockerfile"}
    local build_args=""
    local full_image_name="${IMAGE_NAME}:${TAG}"
    
    if [ ! -z "$REGISTRY" ]; then
        full_image_name="${REGISTRY}/${full_image_name}"
    fi
    
    log_info "Building image: $full_image_name"
    log_info "Using Dockerfile: $dockerfile"
    log_info "Build target: $BUILD_TARGET"
    
    # 构建参数
    if [ ! -z "$APP_VERSION" ]; then
        build_args="$build_args --build-arg APP_VERSION=$APP_VERSION"
    fi
    
    if [ ! -z "$BUILD_DATE" ]; then
        build_args="$build_args --build-arg BUILD_DATE=$BUILD_DATE"
    else
        build_args="$build_args --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    fi
    
    # 多平台构建
    if check_buildx && [ "$MULTI_PLATFORM" = "true" ]; then
        log_info "Building for multiple platforms: $PLATFORM"
        docker buildx create --name multiarch-builder --use 2>/dev/null || true
        docker buildx build \
            --platform $PLATFORM \
            --target $BUILD_TARGET \
            $build_args \
            -t $full_image_name \
            -f $dockerfile \
            --push \
            .
    else
        # 单平台构建
        docker build \
            --target $BUILD_TARGET \
            $build_args \
            -t $full_image_name \
            -f $dockerfile \
            .
    fi
    
    log_success "Image built successfully: $full_image_name"
}

# 运行安全扫描
security_scan() {
    local image_name="$1"
    
    if command -v trivy &> /dev/null; then
        log_info "Running security scan with Trivy..."
        trivy image --exit-code 1 --severity HIGH,CRITICAL $image_name
        log_success "Security scan completed"
    else
        log_warning "Trivy not found. Skipping security scan."
        log_info "Install Trivy with: brew install aquasecurity/trivy/trivy"
    fi
}

# 推送镜像
push_image() {
    local image_name="$1"
    
    if [ -z "$REGISTRY" ]; then
        log_warning "No registry specified. Skipping push."
        return
    fi
    
    if [ "$MULTI_PLATFORM" = "true" ]; then
        log_info "Multi-platform build already pushed"
        return
    fi
    
    log_info "Pushing image: $image_name"
    docker push $image_name
    log_success "Image pushed successfully"
}

# 清理旧镜像
cleanup_images() {
    log_info "Cleaning up old images..."
    
    # 删除悬挂镜像
    docker image prune -f
    
    # 删除旧版本镜像（保留最新5个）
    docker images $IMAGE_NAME --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | \
        tail -n +2 | sort -k2 -r | tail -n +6 | awk '{print $1}' | \
        xargs -r docker rmi -f
    
    log_success "Cleanup completed"
}

# 显示帮助信息
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -t, --tag TAG           Image tag (default: latest)"
    echo "  -r, --registry URL      Docker registry URL"
    echo "  -f, --dockerfile FILE   Dockerfile path (default: Dockerfile)"
    echo "  -T, --target TARGET     Build target (default: production)"
    echo "  -p, --push              Push image after building"
    echo "  -s, --scan              Run security scan"
    echo "  -c, --cleanup           Cleanup old images"
    echo "  -m, --multi-platform    Build for multiple platforms"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  DOCKER_REGISTRY         Docker registry URL"
    echo "  DOCKER_TAG              Image tag"
    echo "  BUILD_TARGET            Build target"
    echo "  APP_VERSION             Application version"
    echo "  PLATFORM                Target platforms (default: linux/amd64,linux/arm64)"
    echo ""
    echo "Examples:"
    echo "  $0                                          # Build with default settings"
    echo "  $0 -t v1.0.0 -p                           # Build and push with tag v1.0.0"
    echo "  $0 -f Dockerfile.dev -T development       # Build development target"
    echo "  $0 -m -p -r myregistry.com               # Multi-platform build and push"
}

# 主函数
main() {
    local dockerfile="Dockerfile"
    local push_flag=false
    local scan_flag=false
    local cleanup_flag=false
    
    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--tag)
                TAG="$2"
                shift 2
                ;;
            -r|--registry)
                REGISTRY="$2"
                shift 2
                ;;
            -f|--dockerfile)
                dockerfile="$2"
                shift 2
                ;;
            -T|--target)
                BUILD_TARGET="$2"
                shift 2
                ;;
            -p|--push)
                push_flag=true
                shift
                ;;
            -s|--scan)
                scan_flag=true
                shift
                ;;
            -c|--cleanup)
                cleanup_flag=true
                shift
                ;;
            -m|--multi-platform)
                MULTI_PLATFORM=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # 构建过程
    log_info "Starting Docker build process..."
    log_info "Image: $IMAGE_NAME:$TAG"
    
    check_docker
    
    # 构建镜像
    build_image $dockerfile
    
    local full_image_name="${IMAGE_NAME}:${TAG}"
    if [ ! -z "$REGISTRY" ]; then
        full_image_name="${REGISTRY}/${full_image_name}"
    fi
    
    # 安全扫描
    if [ "$scan_flag" = true ]; then
        security_scan $full_image_name
    fi
    
    # 推送镜像
    if [ "$push_flag" = true ]; then
        push_image $full_image_name
    fi
    
    # 清理
    if [ "$cleanup_flag" = true ]; then
        cleanup_images
    fi
    
    log_success "Build process completed successfully!"
    
    # 显示镜像信息
    echo ""
    log_info "Image information:"
    docker images $IMAGE_NAME:$TAG --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
}

# 执行主函数
main "$@"