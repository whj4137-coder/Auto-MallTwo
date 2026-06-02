import type { Product, Category, Banner, UserInfo } from "@apex/shared";

// 种子数据 — 源自 PRD §10 数据契约 ★SSOT。默认全部 published=true、stock=IN_STOCK。

export const SEED_CATEGORIES: Category[] = [
  { categoryCode: "cat_car_goods", name: "车品", type: "PHYSICAL", sortOrder: 1 },
  { categoryCode: "cat_electronics", name: "电子配件", type: "PHYSICAL", sortOrder: 2 },
  { categoryCode: "cat_membership", name: "会员服务", type: "MEMBERSHIP", sortOrder: 3 },
  { categoryCode: "cat_charging", name: "充电服务", type: "DISPLAY_SERVICE", sortOrder: 4 },
  { categoryCode: "cat_life", name: "生活服务", type: "DISPLAY_SERVICE", sortOrder: 5 },
];

export const DELIVERY = "预计 2-3 个工作日送达（演示）";

export const SEED_PRODUCTS: Product[] = [
  {
    productCode: "phy_car_001", category: "cat_car_goods", type: "PHYSICAL", name: "磁吸手机支架",
    priceCents: 12900, colors: ["曜石黑", "银灰"], capacities: [], homeFeatured: true,
    published: true, sortOrder: 1, stock: "IN_STOCK", deliveryNote: DELIVERY,
  },
  {
    productCode: "phy_car_002", category: "cat_car_goods", type: "PHYSICAL", name: "后备箱折叠收纳箱",
    priceCents: 19900, colors: ["黑色", "深灰"], capacities: [], homeFeatured: false,
    published: true, sortOrder: 2, stock: "IN_STOCK", deliveryNote: DELIVERY,
  },
  {
    productCode: "phy_car_003", category: "cat_car_goods", type: "PHYSICAL", name: "车载香氛补充装",
    priceCents: 8900, colors: ["海盐蓝", "森林绿"], capacities: [], homeFeatured: false,
    published: true, sortOrder: 3, stock: "IN_STOCK", deliveryNote: DELIVERY,
  },
  {
    productCode: "phy_ele_001", category: "cat_electronics", type: "PHYSICAL", name: "行车记录仪 Mini",
    priceCents: 49900, colors: ["黑色"], capacities: ["64G", "128G"], homeFeatured: true,
    published: true, sortOrder: 1, stock: "IN_STOCK", deliveryNote: DELIVERY,
  },
  {
    productCode: "phy_ele_002", category: "cat_electronics", type: "PHYSICAL", name: "双口快充充电器",
    priceCents: 15900, colors: ["黑色", "银色"], capacities: [], homeFeatured: false,
    published: true, sortOrder: 2, stock: "IN_STOCK", deliveryNote: DELIVERY,
  },
  {
    productCode: "mem_001", category: "cat_membership", type: "MEMBERSHIP", name: "悦行会员月卡",
    priceCents: 3900, colors: [], capacities: [], homeFeatured: true, published: true, sortOrder: 1,
    stock: "IN_STOCK", validDays: 30, benefits: ["专属主题", "车主精选权益", "会员日特惠"], boundVehicle: "特斯拉 Model Y",
  },
  {
    productCode: "mem_002", category: "cat_membership", type: "MEMBERSHIP", name: "尊享会员年卡",
    priceCents: 29900, colors: [], capacities: [], homeFeatured: false, published: true, sortOrder: 2,
    stock: "IN_STOCK", validDays: 365, benefits: ["全年权益", "专属活动", "年度礼遇"], boundVehicle: "特斯拉 Model Y",
  },
  {
    productCode: "svc_charge_001", category: "cat_charging", type: "DISPLAY_SERVICE", name: "城市快充服务",
    priceCents: null, colors: [], capacities: [], homeFeatured: false, published: true, sortOrder: 1,
    stock: "IN_STOCK", serviceDesc: "充电服务交易能力将在后续版本提供",
  },
  {
    productCode: "svc_charge_002", category: "cat_charging", type: "DISPLAY_SERVICE", name: "目的地充电服务",
    priceCents: null, colors: [], capacities: [], homeFeatured: false, published: true, sortOrder: 2,
    stock: "IN_STOCK", serviceDesc: "充电服务交易能力将在后续版本提供",
  },
  {
    productCode: "svc_life_001", category: "cat_life", type: "DISPLAY_SERVICE", name: "精洗护理服务",
    priceCents: null, colors: [], capacities: [], homeFeatured: false, published: true, sortOrder: 1,
    stock: "IN_STOCK", serviceDesc: "生活服务交易能力将在后续版本提供",
  },
];

export const SEED_BANNERS: Banner[] = [
  { bannerCode: "banner_001", title: "稳固出行装备", subtitle: "磁吸手机支架，舒适触达", targetProductCode: "phy_car_001", published: true, sortOrder: 1 },
  { bannerCode: "banner_002", title: "便捷充电服务", subtitle: "城市快充服务展示", targetProductCode: "svc_charge_001", published: true, sortOrder: 2 },
  { bannerCode: "banner_003", title: "会员专属权益", subtitle: "开启您的专属车内体验", targetProductCode: "mem_001", published: true, sortOrder: 3 },
];

export const SEED_USER: UserInfo = {
  username: "admin",
  displayName: "车主用户",
  phoneMasked: "138****5678",
  plateMasked: "沪A·****5",
  vehicle: "特斯拉 Model Y",
  vehicleColor: "珍珠白",
  receiver: { name: "张先生", phone: "138****5678", address: "上海浦东新区张江中科路1730号", label: "默认地址" },
};

export const DEMO_PASSWORD = "123456";
