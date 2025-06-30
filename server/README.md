# 三国群英传：卡牌争霸 服务端

基于 Strapi v5.16.1 框架开发的游戏服务端。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置数据库
确保 MySQL 服务已启动，然后创建数据库：
```bash
npm run db:create
npm run db:init
```

### 3. 启动开发服务器
```bash
npm run develop
```

服务器将在 http://localhost:1337 启动

### 4. 配置管理员账户
首次启动后，访问 http://localhost:1337/admin 创建管理员账户。

### 5. 设置API权限
在管理面板中：
1. 进入 Settings > Users & Permissions plugin > Roles
2. 点击 "Public" 角色
3. 在 "Application" 部分找到 "Hero"
4. 勾选所需的权限（find, findOne 等）
5. 保存设置

### 6. 添加武将数据
```bash
mysql -u root -p < ../database/strapi_heroes.sql
```

## 📋 API 文档

### 武将系统

#### 获取所有武将
```http
GET /api/heroes
```

#### 根据品质筛选武将
```http
GET /api/heroes/quality/:quality
```
- quality: N, R, SR, SSR, UR

#### 根据势力筛选武将
```http
GET /api/heroes/faction/:faction  
```
- faction: wei, shu, wu, qun, han

#### 获取推荐阵容
```http
GET /api/heroes/recommended-team?faction=shu
```

#### 计算武将属性
```http
GET /api/heroes/calculate-stats?hero_id=1001&level=50&breakthrough=2
```

## 🏗️ 项目结构

```
server/
├── config/          # 配置文件
│   ├── database.js  # 数据库配置
│   ├── server.js    # 服务器配置
│   └── middlewares.js
├── src/
│   └── api/         # API 定义
│       └── hero/    # 武将相关 API
│           ├── content-types/
│           ├── controllers/
│           ├── routes/
│           └── services/
├── database/        # 数据库脚本
│   ├── schema.sql   # 表结构
│   ├── init_data.sql # 初始数据
│   └── strapi_heroes.sql # Strapi武将数据
└── package.json
```

## 🔧 开发指南

### 添加新的API

1. 使用 Strapi CLI 生成 API：
```bash
npm run strapi generate api [api-name]
```

2. 或手动在 `src/api/` 下创建：
   - `content-types/` - 数据模型定义
   - `controllers/` - 控制器逻辑
   - `routes/` - 路由配置
   - `services/` - 业务逻辑

### 数据库修改

1. 修改 schema.json 文件
2. 重启服务器让 Strapi 自动迁移
3. 或手动执行 SQL 脚本

### 自定义路由

在 `routes/` 目录下的文件中添加自定义路由：

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/heroes/custom-endpoint',
      handler: 'hero.customMethod'
    }
  ]
};
```

## 🐛 常见问题

### API 返回 404
- 检查是否在管理面板设置了公开访问权限
- 确认路由配置正确
- 检查数据表是否存在数据

### 数据库连接失败
- 确认 MySQL 服务已启动
- 检查 `.env` 文件中的数据库配置
- 验证数据库用户权限

### 启动时报错
- 检查 Node.js 版本（需要 18.0.0-22.x.x）
- 清除 `node_modules` 重新安装
- 检查端口 1337 是否被占用

## 🔒 生产环境部署

### 环境变量
在生产环境中设置以下环境变量：

```bash
NODE_ENV=production
DATABASE_HOST=your-db-host
DATABASE_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
```

### 构建项目
```bash
npm run build
npm start
```

## 📚 相关文档

- [Strapi v5 文档](https://docs.strapi.io/dev-docs/intro)
- [Strapi REST API](https://docs.strapi.io/dev-docs/api/rest)
- [MySQL 配置](https://docs.strapi.io/dev-docs/configurations/database#mysql-configuration)