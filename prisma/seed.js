import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { code: "All", nameEn: "All aisles", nameZh: "全部货架", icon: "store", sortOrder: 0 },
  { code: "Walk", nameEn: "Walk", nameZh: "遛狗区", icon: "footprints", sortOrder: 1 },
  { code: "Play", nameEn: "Toys", nameZh: "玩具区", icon: "bone", sortOrder: 2 },
  { code: "Rest", nameEn: "Naps", nameZh: "午睡区", icon: "moon", sortOrder: 3 },
  { code: "Groom", nameEn: "Bath", nameZh: "洗护区", icon: "droplets", sortOrder: 4 },
  { code: "Feed", nameEn: "Food", nameZh: "喂食区", icon: "utensils", sortOrder: 5 },
  { code: "Wear", nameEn: "Wear", nameZh: "穿戴区", icon: "shirt", sortOrder: 6 }
];

const products = [
  {
    code: "walk-set",
    sku: "PB-WALK-001",
    categoryCode: "Walk",
    nameEn: "Daisy Walk Set",
    nameZh: "雏菊遛狗套装",
    detailEn: "Soft-grip leash and adjustable collar for daily neighborhood loops.",
    detailZh: "柔软握感牵引绳和可调节项圈，适合每天在社区散步。",
    altEn: "Two dogs walking together outdoors with leashes",
    altZh: "两只狗狗在户外一起牵绳散步",
    tagEn: "Best starter",
    tagZh: "入门首选",
    imageUrl: "/products/walk.jpg",
    priceCents: 3800,
    stock: 48,
    sortOrder: 1
  },
  {
    code: "cloud-bed",
    sku: "PB-REST-001",
    categoryCode: "Rest",
    nameEn: "Cloud Nap Bed",
    nameZh: "云朵午睡窝",
    detailEn: "Washable cushion with a low front edge for easy curling up.",
    detailZh: "可清洗软垫和低前沿设计，方便狗狗蜷起来休息。",
    altEn: "Small dog resting indoors in warm light",
    altZh: "小狗在温暖室内光线里休息",
    tagEn: "Washable",
    tagZh: "可清洗",
    imageUrl: "/products/bed.jpg",
    priceCents: 7200,
    stock: 22,
    sortOrder: 2
  },
  {
    code: "snuffle-mat",
    sku: "PB-PLAY-001",
    categoryCode: "Play",
    nameEn: "Snuffle Picnic Mat",
    nameZh: "嗅闻野餐垫",
    detailEn: "Hide treats in soft folds to slow snack time and build focus.",
    detailZh: "把零食藏进柔软褶皱里，让进食更慢，也更专注。",
    altEn: "Happy dog playing outside in a park",
    altZh: "开心的狗狗在户外玩耍",
    tagEn: "Enrichment",
    tagZh: "益智嗅闻",
    imageUrl: "/products/play.jpg",
    priceCents: 2900,
    stock: 35,
    sortOrder: 3
  },
  {
    code: "bath-brush",
    sku: "PB-GROOM-001",
    categoryCode: "Groom",
    nameEn: "Berry Bath Brush",
    nameZh: "莓果洗澡刷",
    detailEn: "Flexible bristles for bath suds, loose hair, and gentle massage.",
    detailZh: "柔韧刷毛适合起泡、带走浮毛，也能轻柔按摩。",
    altEn: "Dog portrait in natural outdoor light",
    altZh: "自然光下的狗狗肖像",
    tagEn: "Gentle",
    tagZh: "温和",
    imageUrl: "/products/groom.jpg",
    priceCents: 1600,
    stock: 64,
    sortOrder: 4
  },
  {
    code: "rain-shell",
    sku: "PB-WEAR-001",
    categoryCode: "Wear",
    nameEn: "Rainy-Day Shell",
    nameZh: "雨天轻薄外套",
    detailEn: "Lightweight water-resistant layer with a belly-safe fit.",
    detailZh: "轻薄防泼水面料，腹部版型更舒服安全。",
    altEn: "Small dog looking forward on a warm background",
    altZh: "暖色背景前的小狗看向前方",
    tagEn: "New color",
    tagZh: "新颜色",
    imageUrl: "/products/wear.jpg",
    priceCents: 4400,
    stock: 31,
    sortOrder: 5
  },
  {
    code: "rope-duo",
    sku: "PB-PLAY-002",
    categoryCode: "Play",
    nameEn: "Porch Rope Duo",
    nameZh: "门廊绳结两件组",
    detailEn: "Two tug ropes made for supervised chewing and fetch breaks.",
    detailZh: "两根牵拉绳结，适合陪伴式啃咬和短暂捡回游戏。",
    altEn: "Dog lying on a porch in bright daylight",
    altZh: "明亮日光下趴在门廊上的狗狗",
    tagEn: "Two pack",
    tagZh: "两件装",
    imageUrl: "/products/rope.jpg",
    priceCents: 1800,
    stock: 56,
    sortOrder: 6
  },
  {
    code: "slow-bowl",
    sku: "PB-FEED-001",
    categoryCode: "Feed",
    nameEn: "Slow Sunday Bowl",
    nameZh: "慢食周日碗",
    detailEn: "Non-slip puzzle bowl that turns fast meals into a calmer ritual.",
    detailZh: "防滑益智慢食碗，把急促进食变成更平静的小仪式。",
    altEn: "Dog sitting outside with attentive expression",
    altZh: "狗狗坐在户外专注看向镜头",
    tagEn: "Non-slip",
    tagZh: "防滑",
    imageUrl: "/products/feed.jpg",
    priceCents: 2400,
    stock: 43,
    sortOrder: 7
  },
  {
    code: "treat-pouch",
    sku: "PB-WALK-002",
    categoryCode: "Walk",
    nameEn: "Treat Pocket Pouch",
    nameZh: "训练零食小包",
    detailEn: "Clip-on pouch with one-hand magnetic open for training walks.",
    detailZh: "可夹挂零食包，磁吸开合，训练散步时单手也能取用。",
    altEn: "Dog sitting on grass with a bright collar",
    altZh: "戴着亮色项圈坐在草地上的狗狗",
    tagEn: "Clip-on",
    tagZh: "可夹挂",
    imageUrl: "/products/pouch.jpg",
    priceCents: 2100,
    stock: 39,
    sortOrder: 8
  }
];

const purchases = [
  ["Ms. Lin", "林女士", "Shanghai", "上海", "Daisy Walk Set", "雏菊遛狗套装", 2],
  ["Mr. Zhou", "周先生", "Hangzhou", "杭州", "Cloud Nap Bed", "云朵午睡窝", 5],
  ["Ms. Tang", "唐女士", "Chengdu", "成都", "Slow Sunday Bowl", "慢食周日碗", 8],
  ["Mr. Chen", "陈先生", "Shenzhen", "深圳", "Treat Pocket Pouch", "训练零食小包", 12],
  ["Ms. Xu", "徐女士", "Suzhou", "苏州", "Berry Bath Brush", "莓果洗澡刷", 16],
  ["Ms. He", "何女士", "Guangzhou", "广州", "Rainy-Day Shell", "雨天轻薄外套", 19]
];

async function main() {
  for (const category of categories) {
    await prisma.category.upsert({
      where: { code: category.code },
      update: category,
      create: category
    });
  }

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((category) => [category.code, category.id])
  );

  for (const product of products) {
    const { categoryCode, ...data } = product;
    await prisma.product.upsert({
      where: { code: product.code },
      update: { ...data, categoryId: categoryMap[categoryCode] },
      create: { ...data, categoryId: categoryMap[categoryCode] }
    });
  }

  const user = await prisma.user.upsert({
    where: { memberNo: "PB-0526" },
    update: {
      nameEn: "Berry Dog Parent",
      nameZh: "莓莓铲屎官",
      points: 860
    },
    create: {
      id: "preview-customer-001",
      phone: "13800006628",
      nameEn: "Berry Dog Parent",
      nameZh: "莓莓铲屎官",
      memberNo: "PB-0526",
      points: 860
    }
  });

  await prisma.address.upsert({
    where: { id: "preview-address-001" },
    update: {
      userId: user.id,
      receiver: "莓莓铲屎官",
      phone: "13800006628",
      province: "上海市",
      city: "上海市",
      district: "浦东新区",
      line1: "阳光小区 8 号楼",
      isDefault: true
    },
    create: {
      id: "preview-address-001",
      userId: user.id,
      receiver: "莓莓铲屎官",
      phone: "13800006628",
      province: "上海市",
      city: "上海市",
      district: "浦东新区",
      line1: "阳光小区 8 号楼",
      isDefault: true
    }
  });

  const bundle = await prisma.bundle.upsert({
    where: { code: "manager-walk-bundle" },
    update: {
      titleEn: "Walk Set + Treat Pouch + Rope Duo",
      titleZh: "遛狗套装 + 零食包 + 牵拉玩具",
      textEn: "$68 preview bundle for the first shoppers.",
      textZh: "$68 预览套装价，适合第一批顾客。",
      ctaEn: "Save this deal",
      ctaZh: "领取这个特惠",
      statusEn: "3-piece preview bundle",
      statusZh: "3 件预览套装",
      priceCents: 6800,
      sortOrder: 1
    },
    create: {
      code: "manager-walk-bundle",
      titleEn: "Walk Set + Treat Pouch + Rope Duo",
      titleZh: "遛狗套装 + 零食包 + 牵拉玩具",
      textEn: "$68 preview bundle for the first shoppers.",
      textZh: "$68 预览套装价，适合第一批顾客。",
      ctaEn: "Save this deal",
      ctaZh: "领取这个特惠",
      statusEn: "3-piece preview bundle",
      statusZh: "3 件预览套装",
      priceCents: 6800,
      sortOrder: 1
    }
  });

  const bundleProducts = await prisma.product.findMany({
    where: { code: { in: ["walk-set", "treat-pouch", "rope-duo"] } }
  });

  for (const product of bundleProducts) {
    await prisma.bundleItem.upsert({
      where: { bundleId_productId: { bundleId: bundle.id, productId: product.id } },
      update: { quantity: 1 },
      create: { bundleId: bundle.id, productId: product.id, quantity: 1 }
    });
  }

  await prisma.promotion.upsert({
    where: { code: "FIRST-BERRY" },
    update: {
      titleEn: "First cart treat",
      titleZh: "首篮小零食",
      descriptionEn: "Reserve a small treat for early shoppers.",
      descriptionZh: "给早期顾客预留一份小零食。",
      discountType: "GIFT",
      discountValue: 1,
      status: "ACTIVE"
    },
    create: {
      code: "FIRST-BERRY",
      titleEn: "First cart treat",
      titleZh: "首篮小零食",
      descriptionEn: "Reserve a small treat for early shoppers.",
      descriptionZh: "给早期顾客预留一份小零食。",
      discountType: "GIFT",
      discountValue: 1,
      status: "ACTIVE"
    }
  });

  await prisma.recentPurchase.deleteMany();
  const now = Date.now();
  for (const [buyerEn, buyerZh, cityEn, cityZh, productNameEn, productNameZh, minutes] of purchases) {
    await prisma.recentPurchase.create({
      data: {
        buyerEn,
        buyerZh,
        cityEn,
        cityZh,
        productNameEn,
        productNameZh,
        purchasedAt: new Date(now - minutes * 60 * 1000)
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
