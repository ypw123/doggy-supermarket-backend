# Pawberry API 接入文档

统一返回结构：

```json
{
  "ok": true,
  "data": {}
}
```

错误返回：

```json
{
  "ok": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found."
  }
}
```

## 健康检查

```http
GET /api/health
```

## 店铺配置

```http
GET /api/storefront
```

返回品牌基础文案、分类 key、狗狗店长图片、功能开关。

```json
{
  "ok": true,
  "data": {
    "categories": ["All", "Walk", "Play", "Rest", "Groom", "Feed", "Wear"],
    "assets": {
      "managerDog": "/brand/pawberry-manager-dog.png"
    },
    "featureFlags": {
      "checkout": false,
      "dogInteractionApi": false
    }
  }
}
```

## 商品

```http
GET /api/products
GET /api/products?category=Walk
GET /api/products?q=雨天
GET /api/products/walk-set
```

商品 ID 沿用前端当前 mock ID，例如 `walk-set`、`cloud-bed`、`snuffle-mat`。

返回单个商品结构：

```json
{
  "id": "walk-set",
  "sku": "PB-WALK-001",
  "category": "Walk",
  "name": {
    "en": "Daisy Walk Set",
    "zh": "雏菊遛狗套装"
  },
  "price": "$38",
  "priceCents": 3800,
  "currency": "USD",
  "image": "/products/walk.jpg",
  "detail": {
    "en": "Soft-grip leash and adjustable collar for daily neighborhood loops.",
    "zh": "柔软握感牵引绳和可调节项圈，适合每天在社区散步。"
  },
  "stock": 48
}
```

## 登录和个人中心

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "莓莓铲屎官",
  "phone": "13800006628"
}
```

后续请求带：

```http
Use the HttpOnly cookie set by register/login. Do not send `x-user-id`.
```

读取个人中心：

```http
GET /api/me
```

编辑姓名：

```http
PATCH /api/me
Content-Type: application/json

{
  "name": "小白家长"
}
```

编辑地址：

```http
PATCH /api/me/address
Content-Type: application/json

{
  "receiver": "小白家长",
  "phone": "13800006628",
  "province": "上海市",
  "city": "上海市",
  "district": "浦东新区",
  "line1": "阳光小区 8 号楼"
}
```

## 购物篮

读取购物篮：

```http
GET /api/cart
```

加入商品。同一个商品重复加入会累加数量：

```http
POST /api/cart/items
Content-Type: application/json

{
  "productId": "walk-set",
  "quantity": 1
}
```

修改数量。传 `0` 会移除：

```http
PATCH /api/cart/items/walk-set
Content-Type: application/json

{
  "quantity": 2
}
```

删除商品：

```http
DELETE /api/cart/items/walk-set
```

## 特惠

读取特惠：

```http
GET /api/bundles
```

领取特惠并批量加入购物篮：

```http
POST /api/bundles/manager-walk-bundle/claim
```

## 订单

从当前购物篮创建订单：

```http
POST /api/orders
Content-Type: application/json

{
  "shippingName": "小白家长",
  "shippingPhone": "13800006628",
  "shippingAddress": "上海市 浦东新区 阳光小区 8 号楼"
}
```

当前支付未上线，订单会进入：

```json
{
  "status": "PENDING_PAYMENT",
  "paymentStatus": "PENDING"
}
```

订单列表和详情：

```http
GET /api/orders
GET /api/orders/:orderId
```

## 促销和购买消息

```http
GET /api/promotions
GET /api/purchases/recent?limit=6
```

`/api/purchases/recent` 用来替代前端头部的真实感购买滚动数据，不是强打扰弹幕。

## 前端替换建议

优先替换 `src/api/mockStoreApi.js`：

```js
const API_BASE = "http://127.0.0.1:4000/api";

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error?.message || "Request failed");
  return payload.data;
}
```

映射关系：

| 前端函数 | 后端接口 |
|---|---|
| `fetchStorefrontConfig()` | `GET /api/storefront` |
| `fetchProducts()` | `GET /api/products` |
| `fetchRecentPurchases()` | `GET /api/purchases/recent` |
| `simulateCustomerLogin()` | `POST /api/auth/login` or `POST /api/auth/register` |
| `fetchPreviewCustomerSession()` | `GET /api/me` |
| `savePreviewCustomerName()` | `PATCH /api/me` |
| `savePreviewCustomerAddress()` | `PATCH /api/me/address` |
| `addPreviewCartItem()` | `POST /api/cart/items` |
| `removePreviewCartItem()` | `PATCH /api/cart/items/:productId` |
| `claimPreviewBundle()` | `POST /api/bundles/:bundleId/claim` |

## 暂不接入

- 狗狗店长互动小游戏后端接口
- 支付网关回调
- 真实登录鉴权
- 管理后台 CRUD

这些可以作为第二阶段继续拆模块开发。
