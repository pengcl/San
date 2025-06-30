#!/bin/sh
set -e

# 容器启动脚本
echo "🚀 Starting Three Kingdoms Game Web Client..."

# 环境变量处理
echo "📋 Processing environment variables..."

# 如果有环境变量，替换index.html中的占位符
if [ ! -z "$API_BASE_URL" ]; then
    echo "🔧 Setting API_BASE_URL to: $API_BASE_URL"
    # 创建配置文件
    cat > /usr/share/nginx/html/config.js << EOF
window.__APP_CONFIG__ = {
    API_BASE_URL: '$API_BASE_URL',
    WS_BASE_URL: '$WS_BASE_URL',
    APP_VERSION: '$APP_VERSION',
    ENVIRONMENT: '$ENVIRONMENT'
};
EOF
fi

# 设置默认环境变量
export API_BASE_URL=${API_BASE_URL:-"http://localhost:8080/api"}
export WS_BASE_URL=${WS_BASE_URL:-"ws://localhost:8080/ws"}
export APP_VERSION=${APP_VERSION:-"1.0.0"}
export ENVIRONMENT=${ENVIRONMENT:-"production"}

echo "🌐 API_BASE_URL: $API_BASE_URL"
echo "🔌 WS_BASE_URL: $WS_BASE_URL"
echo "📦 APP_VERSION: $APP_VERSION"
echo "🏷️  ENVIRONMENT: $ENVIRONMENT"

# 健康检查文件
echo "✅ Creating health check endpoint..."
cat > /usr/share/nginx/html/health.json << EOF
{
    "status": "healthy",
    "version": "$APP_VERSION",
    "environment": "$ENVIRONMENT",
    "timestamp": "$(date -Iseconds)"
}
EOF

# 创建robots.txt
echo "🤖 Creating robots.txt..."
cat > /usr/share/nginx/html/robots.txt << EOF
User-agent: *
Disallow: /api/
Disallow: /admin/
Allow: /

Sitemap: https://your-domain.com/sitemap.xml
EOF

# 创建sitemap.xml（基础版本）
echo "🗺️  Creating sitemap.xml..."
cat > /usr/share/nginx/html/sitemap.xml << EOF
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.com/</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://your-domain.com/heroes</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://your-domain.com/formation</loc>
    <lastmod>$(date +%Y-%m-%d)</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
EOF

# 设置正确的文件权限
echo "🔐 Setting file permissions..."
chown -R appuser:appgroup /usr/share/nginx/html

# 验证nginx配置
echo "✅ Validating nginx configuration..."
nginx -t

# 启动nginx
echo "🌟 Starting nginx..."
exec "$@"