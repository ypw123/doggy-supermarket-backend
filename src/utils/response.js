export function ok(res, data, status = 200) {
  return res.status(status).json({ ok: true, data });
}

export function fail(status, code, message, details) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}

export function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

export function localized(entity, fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, [enField, zhField]]) => [
      key,
      {
        en: entity[enField],
        zh: entity[zhField]
      }
    ])
  );
}

export function productPayload(product) {
  return {
    id: product.code,
    sku: product.sku,
    category: product.category?.code,
    name: { en: product.nameEn, zh: product.nameZh },
    price: `$${Math.round(product.priceCents / 100)}`,
    priceCents: product.priceCents,
    currency: product.currency,
    image: product.imageUrl,
    alt: { en: product.altEn, zh: product.altZh },
    detail: { en: product.detailEn, zh: product.detailZh },
    tag: product.tagEn || product.tagZh ? { en: product.tagEn, zh: product.tagZh } : null,
    stock: product.stock,
    status: product.status
  };
}

export function cartPayload(cart) {
  const items = cart.items.map((item) => ({
    id: item.id,
    productId: item.product.code,
    quantity: item.quantity,
    lineTotalCents: item.quantity * item.product.priceCents,
    product: productPayload(item.product)
  }));

  const subtotalCents = items.reduce((sum, item) => sum + item.lineTotalCents, 0);

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    subtotalCents,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

export function orderPayload(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    currency: order.currency,
    shippingName: order.shippingName,
    shippingPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      productId: item.productCode,
      name: { en: item.productNameEn, zh: item.productNameZh },
      image: item.imageUrl,
      unitPriceCents: item.unitPriceCents,
      quantity: item.quantity
    }))
  };
}
