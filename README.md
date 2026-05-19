# Pawberry Backend

Pawberry 狗狗超市后端项目，给当前 Vite React 前端预留真实接口和 PostgreSQL 数据库。

## 技术栈

- Node.js + Express
- Prisma ORM
- PostgreSQL
- REST API

狗狗互动小游戏模块暂时没有接入后端：本项目没有创建对应路由、控制器或数据表，后续确认玩法和积分规则后再独立补。

## 本地启动

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```

默认 API 地址：

```text
http://127.0.0.1:4000/api
```

前端开发服务默认允许：

```text
http://127.0.0.1:5173
```

## 过渡登录方式

当前没有接入短信、密码或 OAuth。前端可先调用：

```http
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
POST /api/auth/logout
```

返回 `clientAuth.value` 后，把它作为请求头传给个人中心、购物篮、订单接口：

```http
Use the HttpOnly cookie set by register/login. Frontend requests should include `credentials: "include"` and should not send `x-user-id`.
```

这能让前端先跑通真实购物篮、地址编辑、订单创建，后续再替换成 JWT 或 Session。

## 主要模块

- 店铺配置：`GET /api/storefront`
- 分类：`GET /api/categories`
- 商品列表、搜索、详情：`GET /api/products`
- 个人中心：`GET /api/me`、`PATCH /api/me`、`PATCH /api/me/address`
- 购物篮：`GET /api/cart`、`POST /api/cart/items`、`PATCH /api/cart/items/:productId`
- 特惠套装：`GET /api/bundles`、`POST /api/bundles/:bundleId/claim`
- 订单：`GET /api/orders`、`POST /api/orders`
- 促销：`GET /api/promotions`
- 真实感购买消息：`GET /api/purchases/recent`

完整字段见 [docs/api.md](./docs/api.md)。
