import { prisma } from "../lib/prisma.js";
import { fail } from "../utils/response.js";

const tableConfig = {
  products: {
    label: "商品",
    model: "product",
    orderBy: [{ sortOrder: "asc" }],
    include: { category: true },
    columns: [
      ["商品ID", (row) => row.code],
      ["中文名", (row) => row.nameZh],
      ["英文名", (row) => row.nameEn],
      ["分类", (row) => row.category?.nameZh || row.category?.code],
      ["价格", (row) => `$${Math.round(row.priceCents / 100)}`],
      ["库存", (row) => row.stock],
      ["状态", (row) => row.status]
    ],
    fields: [
      { name: "code", label: "商品ID", required: true, placeholder: "例如 daily-snack" },
      { name: "sku", label: "SKU", placeholder: "不填会自动生成" },
      { name: "categoryCode", label: "分类Key", required: true, placeholder: "Walk / Play / Rest / Groom / Feed / Wear" },
      { name: "nameZh", label: "中文名", required: true },
      { name: "nameEn", label: "英文名" },
      { name: "priceCents", label: "价格(分)", type: "number", required: true, placeholder: "3900" },
      { name: "stock", label: "库存", type: "number", placeholder: "20" },
      { name: "imageUrl", label: "图片地址", placeholder: "/products/walk.jpg" },
      { name: "detailZh", label: "中文描述", type: "textarea" },
      { name: "detailEn", label: "英文描述", type: "textarea" },
      { name: "tagZh", label: "中文标签" },
      { name: "tagEn", label: "英文标签" }
    ]
  },
  categories: {
    label: "分类",
    model: "category",
    orderBy: [{ sortOrder: "asc" }],
    columns: [
      ["分类Key", (row) => row.code],
      ["中文名", (row) => row.nameZh],
      ["英文名", (row) => row.nameEn],
      ["图标", (row) => row.icon || ""],
      ["排序", (row) => row.sortOrder]
    ],
    fields: [
      { name: "code", label: "分类Key", required: true, placeholder: "Health" },
      { name: "nameZh", label: "中文名", required: true, placeholder: "健康区" },
      { name: "nameEn", label: "英文名", placeholder: "Health" },
      { name: "icon", label: "图标名", placeholder: "heart" },
      { name: "sortOrder", label: "排序", type: "number", placeholder: "9" }
    ]
  },
  users: {
    label: "用户",
    model: "user",
    orderBy: [{ createdAt: "desc" }],
    columns: [
      ["会员号", (row) => row.memberNo],
      ["中文名", (row) => row.nameZh],
      ["手机", (row) => row.phone || ""],
      ["会员等级", (row) => row.tierZh],
      ["爪爪积分", (row) => row.points]
    ],
    fields: [
      { name: "nameZh", label: "中文名", required: true },
      { name: "nameEn", label: "英文名" },
      { name: "phone", label: "手机" },
      { name: "memberNo", label: "会员号", placeholder: "不填会自动生成" },
      { name: "points", label: "爪爪积分", type: "number", placeholder: "0" }
    ]
  },
  addresses: {
    label: "地址",
    model: "address",
    orderBy: [{ createdAt: "desc" }],
    include: { user: true },
    columns: [
      ["用户", (row) => row.user?.nameZh || row.userId],
      ["收件人", (row) => row.receiver || ""],
      ["手机", (row) => row.phone || ""],
      ["省市区", (row) => [row.province, row.city, row.district].filter(Boolean).join(" ")],
      ["详细地址", (row) => row.line1],
      ["默认", (row) => (row.isDefault ? "是" : "否")]
    ],
    fields: [
      { name: "memberNo", label: "会员号", placeholder: "默认 PB-0526" },
      { name: "receiver", label: "收件人", required: true },
      { name: "phone", label: "手机" },
      { name: "province", label: "省份", placeholder: "上海市" },
      { name: "city", label: "城市", placeholder: "上海市" },
      { name: "district", label: "区县", placeholder: "浦东新区" },
      { name: "line1", label: "详细地址", required: true },
      { name: "line2", label: "补充地址" }
    ]
  },
  carts: {
    label: "购物篮",
    model: "cart",
    orderBy: [{ updatedAt: "desc" }],
    include: { user: true, items: { include: { product: true } } },
    columns: [
      ["用户", (row) => row.user?.nameZh || row.userId],
      ["状态", (row) => row.status],
      ["商品数", (row) => row.items.reduce((sum, item) => sum + item.quantity, 0)],
      ["商品", (row) => row.items.map((item) => `${item.product.nameZh} x${item.quantity}`).join("，") || "空"]
    ]
  },
  orders: {
    label: "订单",
    model: "order",
    orderBy: [{ createdAt: "desc" }],
    include: { user: true, items: true },
    columns: [
      ["订单号", (row) => row.orderNumber],
      ["用户", (row) => row.user?.nameZh || row.userId],
      ["状态", (row) => row.status],
      ["支付", (row) => row.paymentStatus],
      ["金额", (row) => `$${Math.round(row.totalCents / 100)}`],
      ["商品数", (row) => row.items.reduce((sum, item) => sum + item.quantity, 0)]
    ]
  },
  bundles: {
    label: "特惠",
    model: "bundle",
    orderBy: [{ sortOrder: "asc" }],
    include: { items: { include: { product: true } } },
    columns: [
      ["特惠ID", (row) => row.code],
      ["标题", (row) => row.titleZh],
      ["价格", (row) => `$${Math.round(row.priceCents / 100)}`],
      ["启用", (row) => (row.isActive ? "是" : "否")],
      ["商品", (row) => row.items.map((item) => item.product.nameZh).join("，")]
    ]
  },
  purchases: {
    label: "购买动态",
    model: "recentPurchase",
    orderBy: [{ purchasedAt: "desc" }],
    columns: [
      ["买家", (row) => row.buyerZh],
      ["城市", (row) => row.cityZh],
      ["商品", (row) => row.productNameZh],
      ["数量", (row) => row.quantity],
      ["时间", (row) => row.purchasedAt.toLocaleString("zh-CN")]
    ],
    fields: [
      { name: "buyerZh", label: "买家", required: true, placeholder: "李女士" },
      { name: "buyerEn", label: "英文买家", placeholder: "Ms. Li" },
      { name: "cityZh", label: "城市", required: true, placeholder: "上海" },
      { name: "cityEn", label: "英文城市", placeholder: "Shanghai" },
      { name: "productNameZh", label: "商品", required: true },
      { name: "productNameEn", label: "英文商品" },
      { name: "quantity", label: "数量", type: "number", placeholder: "1" }
    ]
  },
  promotions: {
    label: "促销",
    model: "promotion",
    orderBy: [{ createdAt: "desc" }],
    columns: [
      ["促销码", (row) => row.code],
      ["标题", (row) => row.titleZh],
      ["类型", (row) => row.discountType],
      ["值", (row) => row.discountValue],
      ["状态", (row) => row.status]
    ],
    fields: [
      { name: "code", label: "促销码", required: true, placeholder: "NEW-DOG" },
      { name: "titleZh", label: "中文标题", required: true },
      { name: "titleEn", label: "英文标题" },
      { name: "descriptionZh", label: "中文说明", type: "textarea" },
      { name: "descriptionEn", label: "英文说明", type: "textarea" },
      { name: "discountType", label: "类型", placeholder: "GIFT / AMOUNT / PERCENT" },
      { name: "discountValue", label: "值", type: "number", placeholder: "1" }
    ]
  }
};

function serializeRows(config, rows) {
  return rows.map((row) => ({
    id: row.id,
    cells: config.columns.map(([label, getter]) => ({ label, value: getter(row) ?? "" }))
  }));
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function intValue(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function required(body, field, label = field) {
  const value = cleanString(body[field]);
  if (!value) {
    throw fail(400, "ADMIN_REQUIRED_FIELD", `${label}不能为空。`);
  }
  return value;
}

function getConfig(tableKey) {
  const config = tableConfig[tableKey];
  if (!config) throw fail(404, "ADMIN_TABLE_NOT_FOUND", "没有找到这张数据表。");
  return config;
}

async function createRow(tableKey, body) {
  if (tableKey === "products") {
    const categoryCode = required(body, "categoryCode", "分类Key");
    const category = await prisma.category.findUnique({ where: { code: categoryCode } });
    if (!category) throw fail(400, "ADMIN_CATEGORY_NOT_FOUND", "分类不存在，请先新增分类。");

    const code = required(body, "code", "商品ID");
    const nameZh = required(body, "nameZh", "中文名");
    const nameEn = cleanString(body.nameEn) || nameZh;
    const detailZh = cleanString(body.detailZh) || "后台新增商品，后续可补充更完整的商品说明。";
    const detailEn = cleanString(body.detailEn) || cleanString(body.detailZh) || "Admin added product.";

    return prisma.product.create({
      data: {
        code,
        sku: cleanString(body.sku) || `PB-${code.toUpperCase()}`,
        categoryId: category.id,
        nameZh,
        nameEn,
        detailZh,
        detailEn,
        altZh: cleanString(body.altZh) || nameZh,
        altEn: cleanString(body.altEn) || nameEn,
        tagZh: cleanString(body.tagZh) || null,
        tagEn: cleanString(body.tagEn) || null,
        imageUrl: cleanString(body.imageUrl) || "/products/walk.jpg",
        priceCents: intValue(body.priceCents, 0),
        stock: intValue(body.stock, 0),
        status: "ACTIVE",
        sortOrder: intValue(body.sortOrder, 99)
      }
    });
  }

  if (tableKey === "categories") {
    const code = required(body, "code", "分类Key");
    const nameZh = required(body, "nameZh", "中文名");
    return prisma.category.create({
      data: {
        code,
        nameZh,
        nameEn: cleanString(body.nameEn) || nameZh,
        icon: cleanString(body.icon) || null,
        sortOrder: intValue(body.sortOrder, 99)
      }
    });
  }

  if (tableKey === "users") {
    const nameZh = required(body, "nameZh", "中文名");
    return prisma.user.create({
      data: {
        nameZh,
        nameEn: cleanString(body.nameEn) || nameZh,
        phone: cleanString(body.phone) || null,
        memberNo: cleanString(body.memberNo) || `PB-${Date.now().toString().slice(-6)}`,
        points: intValue(body.points, 0)
      }
    });
  }

  if (tableKey === "addresses") {
    const memberNo = cleanString(body.memberNo) || "PB-0526";
    const user = await prisma.user.findUnique({ where: { memberNo } });
    if (!user) throw fail(400, "ADMIN_USER_NOT_FOUND", "没有找到这个会员号。");

    return prisma.address.create({
      data: {
        userId: user.id,
        receiver: required(body, "receiver", "收件人"),
        phone: cleanString(body.phone) || user.phone,
        province: cleanString(body.province) || "上海市",
        city: cleanString(body.city) || "上海市",
        district: cleanString(body.district) || "浦东新区",
        line1: required(body, "line1", "详细地址"),
        line2: cleanString(body.line2) || null,
        isDefault: false
      }
    });
  }

  if (tableKey === "purchases") {
    const buyerZh = required(body, "buyerZh", "买家");
    const cityZh = required(body, "cityZh", "城市");
    const productNameZh = required(body, "productNameZh", "商品");
    return prisma.recentPurchase.create({
      data: {
        buyerZh,
        buyerEn: cleanString(body.buyerEn) || buyerZh,
        cityZh,
        cityEn: cleanString(body.cityEn) || cityZh,
        productNameZh,
        productNameEn: cleanString(body.productNameEn) || productNameZh,
        quantity: intValue(body.quantity, 1),
        purchasedAt: new Date()
      }
    });
  }

  if (tableKey === "promotions") {
    const titleZh = required(body, "titleZh", "中文标题");
    return prisma.promotion.create({
      data: {
        code: required(body, "code", "促销码"),
        titleZh,
        titleEn: cleanString(body.titleEn) || titleZh,
        descriptionZh: cleanString(body.descriptionZh) || "后台新增促销。",
        descriptionEn: cleanString(body.descriptionEn) || "Admin added promotion.",
        discountType: cleanString(body.discountType) || "GIFT",
        discountValue: intValue(body.discountValue, 1),
        status: "ACTIVE"
      }
    });
  }

  throw fail(400, "ADMIN_TABLE_READONLY", "这个表暂时不支持直接新增，请通过前端业务流程生成。");
}

async function deleteRow(tableKey, id) {
  const config = getConfig(tableKey);

  if (tableKey === "products") {
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0) {
      throw fail(409, "ADMIN_PRODUCT_HAS_ORDERS", "这个商品已经出现在订单里，暂时不能删除。");
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.bundleItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } })
    ]);
    return;
  }

  if (tableKey === "categories") {
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      throw fail(409, "ADMIN_CATEGORY_HAS_PRODUCTS", "这个分类下还有商品，请先移动或删除商品。");
    }
    await prisma.category.delete({ where: { id } });
    return;
  }

  if (tableKey === "bundles") {
    await prisma.$transaction([
      prisma.bundleItem.deleteMany({ where: { bundleId: id } }),
      prisma.bundle.delete({ where: { id } })
    ]);
    return;
  }

  if (tableKey === "carts") {
    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { cartId: id } }),
      prisma.cart.delete({ where: { id } })
    ]);
    return;
  }

  await prisma[config.model].delete({ where: { id } });
}

export async function renderAdminPage(req, res) {
  res.type("html").send(adminHtml);
}

export async function getAdminSummary(req, res, next) {
  try {
    const counts = await Promise.all(
      Object.entries(tableConfig).map(async ([key, config]) => [key, await prisma[config.model].count()])
    );
    const countMap = Object.fromEntries(counts);

    res.json({
      ok: true,
      data: {
        tables: Object.entries(tableConfig).map(([key, config]) => ({
          key,
          label: config.label,
          count: countMap[key],
          creatable: Boolean(config.fields),
          deletable: true,
          columns: config.columns.map(([label]) => label),
          fields: config.fields || []
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminTable(req, res, next) {
  try {
    const config = getConfig(req.params.tableKey);
    const rows = await prisma[config.model].findMany({
      take: Math.min(Number(req.query.limit || 80), 200),
      orderBy: config.orderBy,
      include: config.include
    });

    res.json({
      ok: true,
      data: {
        key: req.params.tableKey,
        label: config.label,
        creatable: Boolean(config.fields),
        deletable: true,
        fields: config.fields || [],
        columns: config.columns.map(([label]) => label),
        rows: serializeRows(config, rows)
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createAdminRow(req, res, next) {
  try {
    const config = getConfig(req.params.tableKey);
    await createRow(req.params.tableKey, req.body || {});
    const count = await prisma[config.model].count();

    res.status(201).json({
      ok: true,
      data: {
        message: "新增成功",
        count
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAdminRow(req, res, next) {
  try {
    await deleteRow(req.params.tableKey, req.params.rowId);
    res.json({
      ok: true,
      data: {
        message: "删除成功"
      }
    });
  } catch (error) {
    next(error);
  }
}

const adminHtml = String.raw`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pawberry 本地数据后台</title>
    <style>
      :root {
        color-scheme: light;
        --canvas: oklch(0.985 0.012 70);
        --panel: oklch(0.965 0.014 70);
        --ink: oklch(0.255 0.035 42);
        --muted: oklch(0.47 0.032 48);
        --line: oklch(0.86 0.025 62);
        --berry: oklch(0.42 0.13 18);
        --berry-soft: oklch(0.94 0.032 18);
        --danger: oklch(0.54 0.17 28);
        --leaf: oklch(0.74 0.09 145);
        --sky: oklch(0.91 0.045 218);
        --gold: oklch(0.87 0.12 77);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", system-ui, sans-serif;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--ink);
        background:
          radial-gradient(circle at 12% 10%, oklch(0.93 0.06 77), transparent 25rem),
          radial-gradient(circle at 90% 12%, oklch(0.91 0.055 145), transparent 22rem),
          var(--canvas);
      }

      body.modal-open {
        overflow: hidden;
      }

      button, input, textarea {
        font: inherit;
      }

      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 280px minmax(0, 1fr);
      }

      .sidebar {
        padding: 24px;
        border-right: 1px solid var(--line);
        background: color-mix(in oklch, var(--panel), var(--canvas) 35%);
        position: sticky;
        top: 0;
        height: 100vh;
        overflow: auto;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 26px;
      }

      .mark {
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        border: 2px solid var(--berry);
        border-radius: 12px;
        background: var(--gold);
        box-shadow: 0 5px 0 color-mix(in oklch, var(--berry), black 18%);
        font-size: 23px;
      }

      .brand h1 {
        margin: 0;
        font-size: 18px;
        line-height: 1.2;
      }

      .brand p {
        margin: 4px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .nav {
        display: grid;
        gap: 8px;
      }

      .nav button, .refresh, .add-button, .submit, .modal-close, .delete-row {
        cursor: pointer;
        transition: background 180ms ease, border-color 180ms ease, transform 180ms ease;
      }

      .nav button {
        width: 100%;
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: oklch(0.99 0.006 70);
        color: var(--ink);
        padding: 10px 12px;
      }

      .nav button:hover, .refresh:hover, .add-button:hover, .modal-close:hover {
        transform: translateY(-1px);
        border-color: color-mix(in oklch, var(--berry), var(--line) 45%);
      }

      .nav button.active {
        background: var(--berry);
        color: oklch(0.985 0.012 70);
        border-color: var(--berry);
      }

      .count {
        font-size: 12px;
        border-radius: 999px;
        padding: 2px 8px;
        background: color-mix(in oklch, var(--gold), var(--canvas) 25%);
        color: var(--berry);
      }

      .nav button.active .count {
        background: oklch(0.985 0.012 70);
      }

      main {
        min-width: 0;
        padding: 28px;
      }

      .topbar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 18px;
        margin-bottom: 22px;
      }

      .topbar h2 {
        margin: 0;
        font-size: 28px;
        line-height: 1.15;
      }

      .topbar p {
        margin: 8px 0 0;
        color: var(--muted);
      }

      .status {
        color: var(--muted);
        font-size: 13px;
        white-space: nowrap;
      }

      .metrics {
        display: grid;
        grid-template-columns: repeat(4, minmax(140px, 1fr));
        gap: 12px;
        margin-bottom: 20px;
      }

      .metric {
        border: 1px solid var(--line);
        border-radius: 8px;
        background: color-mix(in oklch, var(--panel), oklch(0.99 0.006 70) 55%);
        padding: 14px;
      }

      .metric b {
        display: block;
        font-size: 24px;
        color: var(--berry);
      }

      .metric span {
        color: var(--muted);
        font-size: 13px;
      }

      .table-panel {
        border: 2px solid var(--berry);
        border-radius: 10px;
        background: oklch(0.99 0.006 70);
        overflow: hidden;
        box-shadow: 0 10px 0 color-mix(in oklch, var(--berry), transparent 86%);
      }

      .table-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--line);
        background: linear-gradient(90deg, var(--berry-soft), oklch(0.99 0.006 70));
      }

      .table-head strong {
        font-size: 18px;
      }

      .table-tools {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }

      .refresh, .add-button, .modal-close {
        border: 2px solid var(--berry);
        border-radius: 8px;
        color: var(--berry);
        background: oklch(0.99 0.006 70);
        min-height: 40px;
        padding: 0 14px;
        white-space: nowrap;
      }

      .add-button {
        background: var(--berry);
        color: oklch(0.985 0.012 70);
      }

      .add-button[disabled] {
        opacity: 0.48;
        cursor: not-allowed;
      }

      input, textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: var(--canvas);
        color: var(--ink);
        outline: none;
      }

      input {
        min-height: 40px;
        padding: 0 12px;
      }

      textarea {
        min-height: 78px;
        padding: 10px 12px;
        resize: vertical;
      }

      input:focus, textarea:focus {
        border-color: var(--berry);
        box-shadow: 0 0 0 3px color-mix(in oklch, var(--berry), transparent 82%);
      }

      .search {
        width: min(250px, 34vw);
      }

      .table-wrap {
        overflow: auto;
      }

      table {
        width: 100%;
        min-width: 860px;
        border-collapse: collapse;
      }

      th, td {
        padding: 13px 16px;
        text-align: left;
        border-bottom: 1px solid var(--line);
        vertical-align: top;
        font-size: 14px;
      }

      th {
        position: sticky;
        top: 0;
        background: oklch(0.97 0.012 70);
        color: var(--berry);
        font-weight: 750;
      }

      tr:hover td {
        background: color-mix(in oklch, var(--sky), transparent 70%);
      }

      .actions-cell {
        width: 92px;
        white-space: nowrap;
      }

      .delete-row {
        min-height: 32px;
        border: 1px solid color-mix(in oklch, var(--danger), var(--line) 35%);
        border-radius: 8px;
        background: color-mix(in oklch, var(--danger), transparent 92%);
        color: var(--danger);
        padding: 0 10px;
      }

      .delete-row:hover {
        background: color-mix(in oklch, var(--danger), transparent 84%);
      }

      .empty {
        padding: 42px 18px;
        text-align: center;
        color: var(--muted);
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 20;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 22px;
        background: color-mix(in oklch, var(--ink), transparent 58%);
      }

      .modal-backdrop.open {
        display: flex;
      }

      .modal {
        width: min(860px, 100%);
        max-height: min(86vh, 820px);
        display: grid;
        grid-template-rows: auto minmax(0, 1fr);
        border: 2px solid var(--berry);
        border-radius: 10px;
        background: oklch(0.99 0.006 70);
        box-shadow: 0 20px 70px color-mix(in oklch, var(--ink), transparent 70%);
        overflow: hidden;
      }

      .modal-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 16px 18px;
        border-bottom: 1px solid var(--line);
        background: linear-gradient(90deg, var(--berry-soft), oklch(0.99 0.006 70));
      }

      .modal-head strong {
        display: block;
        font-size: 18px;
      }

      .modal-head span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 13px;
      }

      .admin-form {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        padding: 18px;
        overflow: auto;
      }

      .field {
        display: grid;
        gap: 7px;
      }

      .field.wide {
        grid-column: span 3;
      }

      label {
        color: var(--berry);
        font-size: 13px;
        font-weight: 750;
      }

      .form-actions {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .hint {
        color: var(--muted);
        font-size: 13px;
      }

      .submit {
        border: 0;
        border-radius: 8px;
        min-height: 42px;
        padding: 0 18px;
        background: var(--berry);
        color: oklch(0.985 0.012 70);
        font-weight: 750;
      }

      .submit:hover {
        background: color-mix(in oklch, var(--berry), black 12%);
      }

      @media (max-width: 980px) {
        .admin-form {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .field.wide {
          grid-column: span 2;
        }
      }

      @media (max-width: 860px) {
        .shell {
          grid-template-columns: 1fr;
        }

        .sidebar {
          position: static;
          height: auto;
          padding: 16px;
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }

        .nav {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        main {
          padding: 18px 14px 28px;
        }

        .topbar, .table-head {
          display: grid;
        }

        .topbar h2 {
          font-size: 24px;
        }

        .metrics {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .table-tools {
          justify-content: stretch;
        }

        .search {
          width: 100%;
        }
      }

      @media (max-width: 560px) {
        .nav, .metrics, .admin-form, .table-tools {
          grid-template-columns: 1fr;
        }

        .table-tools {
          display: grid;
        }

        .field.wide {
          grid-column: span 1;
        }

        .refresh, .add-button, .submit, .modal-close {
          width: 100%;
        }

        .form-actions, .modal-head {
          align-items: stretch;
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="mark">🐾</div>
          <div>
            <h1>Pawberry 数据后台</h1>
            <p>本地开发查看和维护数据</p>
          </div>
        </div>
        <nav class="nav" id="tableNav"></nav>
      </aside>

      <main>
        <section class="topbar">
          <div>
            <h2 id="pageTitle">数据表</h2>
            <p>中文化查看本地 PostgreSQL 数据，适合开发阶段核对商品、订单和购物篮。</p>
          </div>
          <span class="status" id="statusText">正在连接数据库</span>
        </section>

        <section class="metrics" id="metrics"></section>

        <section class="table-panel">
          <div class="table-head">
            <strong id="tableTitle">请选择数据表</strong>
            <div class="table-tools">
              <input class="search" id="searchInput" placeholder="搜索当前表" />
              <button class="refresh" type="button" id="refreshButton">刷新</button>
              <button class="add-button" type="button" id="addButton">新增</button>
            </div>
          </div>
          <div class="table-wrap" id="tableWrap"></div>
        </section>
      </main>
    </div>

    <div class="modal-backdrop" id="modalBackdrop" aria-hidden="true">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
        <div class="modal-head">
          <div>
            <strong id="modalTitle">新增数据</strong>
            <span>订单和购物篮建议通过前台流程生成</span>
          </div>
          <button class="modal-close" type="button" id="modalClose">关闭</button>
        </div>
        <form class="admin-form" id="adminForm"></form>
      </section>
    </div>

    <script>
      const state = {
        tables: [],
        active: "products",
        currentTable: null
      };

      const tableNav = document.querySelector("#tableNav");
      const metrics = document.querySelector("#metrics");
      const tableWrap = document.querySelector("#tableWrap");
      const tableTitle = document.querySelector("#tableTitle");
      const pageTitle = document.querySelector("#pageTitle");
      const statusText = document.querySelector("#statusText");
      const searchInput = document.querySelector("#searchInput");
      const refreshButton = document.querySelector("#refreshButton");
      const addButton = document.querySelector("#addButton");
      const modalBackdrop = document.querySelector("#modalBackdrop");
      const modalClose = document.querySelector("#modalClose");
      const modalTitle = document.querySelector("#modalTitle");
      const adminForm = document.querySelector("#adminForm");

      async function request(path, options) {
        const response = await fetch(path, options);
        const payload = await response.json();
        if (!payload.ok) throw new Error(payload.error?.message || "请求失败");
        return payload.data;
      }

      function escapeHtml(value) {
        return String(value ?? "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;");
      }

      function setStatus(text) {
        statusText.textContent = text;
      }

      function activeTableMeta() {
        return state.tables.find((table) => table.key === state.active);
      }

      function renderNav() {
        tableNav.innerHTML = state.tables.map((table) =>
          '<button type="button" class="' + (table.key === state.active ? "active" : "") + '" data-table="' + table.key + '">' +
            '<span>' + escapeHtml(table.label) + '</span>' +
            '<span class="count">' + table.count + '</span>' +
          '</button>'
        ).join("");
      }

      function renderMetrics() {
        metrics.innerHTML = state.tables.slice(0, 8).map((table) =>
          '<article class="metric">' +
            '<b>' + table.count + '</b>' +
            '<span>' + escapeHtml(table.label) + '</span>' +
          '</article>'
        ).join("");
      }

      function renderForm() {
        const meta = activeTableMeta();
        const fields = state.currentTable?.fields || meta?.fields || [];
        modalTitle.textContent = "新增" + (meta?.label || "数据");

        adminForm.innerHTML = fields.map((field) => {
          const required = field.required ? " required" : "";
          const placeholder = field.placeholder ? ' placeholder="' + escapeHtml(field.placeholder) + '"' : "";
          const label = '<label for="field-' + field.name + '">' + escapeHtml(field.label) + (field.required ? " *" : "") + '</label>';

          if (field.type === "textarea") {
            return '<div class="field wide">' + label + '<textarea id="field-' + field.name + '" name="' + field.name + '"' + placeholder + required + '></textarea></div>';
          }

          return '<div class="field">' + label + '<input id="field-' + field.name + '" name="' + field.name + '" type="' + (field.type || "text") + '"' + placeholder + required + ' /></div>';
        }).join("") +
          '<div class="form-actions">' +
            '<span class="hint">带 * 的字段必填，新增后会自动刷新当前表。</span>' +
            '<button class="submit" type="submit">保存新增</button>' +
          '</div>';
      }

      function renderTable(data) {
        const keyword = searchInput.value.trim().toLowerCase();
        const rows = data.rows.filter((row) => row.cells.some((cell) => String(cell.value).toLowerCase().includes(keyword)));
        tableTitle.textContent = data.label + "数据";
        pageTitle.textContent = data.label;
        addButton.disabled = !data.creatable;
        addButton.textContent = data.creatable ? "新增" + data.label : "通过业务生成";

        if (!rows.length) {
          tableWrap.innerHTML = '<div class="empty">没有找到匹配数据</div>';
          return;
        }

        tableWrap.innerHTML =
          '<table>' +
            '<thead>' +
              '<tr>' +
                data.columns.map((column) => '<th>' + escapeHtml(column) + '</th>').join("") +
                '<th class="actions-cell">操作</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>' +
              rows.map((row) =>
                '<tr>' +
                  row.cells.map((cell) => '<td>' + escapeHtml(cell.value) + '</td>').join("") +
                  '<td class="actions-cell"><button class="delete-row" type="button" data-row-id="' + row.id + '">删除</button></td>' +
                '</tr>'
              ).join("") +
            '</tbody>' +
          '</table>';
      }

      function openModal() {
        const meta = activeTableMeta();
        if (!meta?.creatable) return;
        renderForm();
        modalBackdrop.classList.add("open");
        modalBackdrop.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        const firstInput = adminForm.querySelector("input, textarea");
        if (firstInput) firstInput.focus();
      }

      function closeModal() {
        modalBackdrop.classList.remove("open");
        modalBackdrop.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        adminForm.reset();
      }

      async function loadSummary() {
        const data = await request("/admin/api/summary");
        state.tables = data.tables;
        renderNav();
        renderMetrics();
      }

      async function loadTable(key = state.active) {
        state.active = key;
        setStatus("正在读取");
        renderNav();
        const data = await request("/admin/api/tables/" + key);
        state.currentTable = data;
        renderTable(data);
        setStatus("已连接");
      }

      tableNav.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-table]");
        if (!button) return;
        searchInput.value = "";
        closeModal();
        loadTable(button.dataset.table);
      });

      tableWrap.addEventListener("click", async (event) => {
        const button = event.target.closest("button[data-row-id]");
        if (!button) return;
        const meta = activeTableMeta();
        if (!window.confirm("确定删除这条" + (meta?.label || "数据") + "吗？")) return;

        try {
          setStatus("正在删除");
          await request("/admin/api/tables/" + state.active + "/" + button.dataset.rowId, { method: "DELETE" });
          await loadSummary();
          await loadTable(state.active);
          setStatus("删除成功");
        } catch (error) {
          setStatus(error.message);
        }
      });

      searchInput.addEventListener("input", () => {
        if (state.currentTable) renderTable(state.currentTable);
      });

      addButton.addEventListener("click", openModal);
      modalClose.addEventListener("click", closeModal);
      modalBackdrop.addEventListener("click", (event) => {
        if (event.target === modalBackdrop) closeModal();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeModal();
      });

      adminForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(adminForm);
        const body = Object.fromEntries(formData.entries());

        try {
          setStatus("正在保存");
          await request("/admin/api/tables/" + state.active, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          closeModal();
          await loadSummary();
          await loadTable(state.active);
          setStatus("新增成功");
        } catch (error) {
          setStatus(error.message);
        }
      });

      refreshButton.addEventListener("click", async () => {
        await loadSummary();
        await loadTable(state.active);
      });

      async function boot() {
        try {
          await loadSummary();
          await loadTable(state.active);
        } catch (error) {
          setStatus("连接失败");
          tableWrap.innerHTML = '<div class="empty">' + escapeHtml(error.message) + '</div>';
        }
      }

      boot();
    </script>
  </body>
</html>`;
