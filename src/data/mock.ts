import type { Locale } from "@/i18n/translations";

export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "pickedup"
  | "delivering"
  | "completed"
  | "cancelled";

export interface OrderItem {
  name: { ar: string; en: string; ku: string };
  qty: number;
  price: number;
  notes?: { ar: string; en: string; ku: string };
}

export interface Order {
  id: string;
  customer: { ar: string; en: string; ku: string };
  phone: string;
  items: OrderItem[];
  total: number;
  deliveryFee: number;
  status: OrderStatus;
  minutesAgo: number;
  acceptDeadlineSec?: number; // remaining seconds to accept (for new orders)
  address: { ar: string; en: string; ku: string };
  paymentMethod: { ar: string; en: string; ku: string };
}

export const ORDERS: Order[] = [
  {
    id: "EZ-10238",
    customer: { ar: "أحمد الجبوري", en: "Ahmed Al-Jubouri", ku: "ئەحمەد جبووری" },
    phone: "+964 770 123 4567",
    items: [
      { name: { ar: "برغر دجاج كلاسيك", en: "Classic Chicken Burger", ku: "برگەری مریشک" }, qty: 2, price: 8500 },
      { name: { ar: "بطاطا مقلية", en: "French Fries", ku: "پەتاتەی برژاو" }, qty: 1, price: 3500 },
      { name: { ar: "بيبسي", en: "Pepsi", ku: "پێپسی" }, qty: 2, price: 1500 },
    ],
    total: 23500,
    status: "new",
    minutesAgo: 2,
    address: { ar: "بغداد - الكرادة، شارع 62", en: "Baghdad - Karrada, St. 62", ku: "بەغدا - کەڕادە، شەقامی ٦٢" },
  },
  {
    id: "EZ-10237",
    customer: { ar: "زينب علي", en: "Zainab Ali", ku: "زەینەب عەلی" },
    phone: "+964 750 987 1122",
    items: [
      { name: { ar: "بيتزا مارغريتا", en: "Margherita Pizza", ku: "پیتزای مارگاریتا" }, qty: 1, price: 14000 },
      { name: { ar: "سلطة سيزر", en: "Caesar Salad", ku: "سالاتی سیزەر" }, qty: 1, price: 6500 },
    ],
    total: 20500,
    status: "preparing",
    minutesAgo: 8,
    address: { ar: "بغداد - المنصور", en: "Baghdad - Mansour", ku: "بەغدا - مەنسوور" },
  },
  {
    id: "EZ-10236",
    customer: { ar: "محمد حسين", en: "Mohammed Hussein", ku: "محەمەد حسێن" },
    phone: "+964 771 555 0099",
    items: [
      { name: { ar: "شاورما لحم", en: "Beef Shawarma", ku: "شاورمای گۆشت" }, qty: 3, price: 5500 },
      { name: { ar: "حمص", en: "Hummus", ku: "حومس" }, qty: 1, price: 4000 },
    ],
    total: 20500,
    status: "ready",
    minutesAgo: 14,
    address: { ar: "أربيل - عينكاوة", en: "Erbil - Ainkawa", ku: "هەولێر - عەینکاوە" },
  },
  {
    id: "EZ-10235",
    customer: { ar: "سارة كريم", en: "Sara Kareem", ku: "سارا کەریم" },
    phone: "+964 780 222 8844",
    items: [
      { name: { ar: "كباب مشكل", en: "Mixed Kebab", ku: "کەبابی تێکەڵ" }, qty: 1, price: 18000 },
      { name: { ar: "أرز برياني", en: "Biryani Rice", ku: "برنجی بریانی" }, qty: 2, price: 6000 },
    ],
    total: 30000,
    status: "delivering",
    minutesAgo: 24,
    address: { ar: "البصرة - العشار", en: "Basra - Ashar", ku: "بەسرە - عەشار" },
  },
  {
    id: "EZ-10234",
    customer: { ar: "حسن عبدالله", en: "Hassan Abdullah", ku: "حەسەن عەبدوڵڵا" },
    phone: "+964 751 333 7766",
    items: [{ name: { ar: "وجبة عائلية", en: "Family Meal", ku: "ژەمی خێزانی" }, qty: 1, price: 45000 }],
    total: 45000,
    status: "completed",
    minutesAgo: 52,
    address: { ar: "بغداد - الجادرية", en: "Baghdad - Jadriya", ku: "بەغدا - جادرییە" },
  },
  {
    id: "EZ-10233",
    customer: { ar: "نور سالم", en: "Noor Salem", ku: "نوور سالم" },
    phone: "+964 770 111 4422",
    items: [{ name: { ar: "ساندويش فلافل", en: "Falafel Sandwich", ku: "ساندویچی فەلافل" }, qty: 2, price: 3000 }],
    total: 6000,
    status: "cancelled",
    minutesAgo: 78,
    address: { ar: "بغداد - الكاظمية", en: "Baghdad - Kadhimiya", ku: "بەغدا - کازمییە" },
  },
];

export interface MenuCategory {
  id: string;
  name: { ar: string; en: string; ku: string };
  itemsCount: number;
  active: boolean;
}

export const CATEGORIES: MenuCategory[] = [
  { id: "c1", name: { ar: "برغر", en: "Burgers", ku: "برگەر" }, itemsCount: 8, active: true },
  { id: "c2", name: { ar: "بيتزا", en: "Pizza", ku: "پیتزا" }, itemsCount: 6, active: true },
  { id: "c3", name: { ar: "شاورما", en: "Shawarma", ku: "شاورما" }, itemsCount: 5, active: true },
  { id: "c4", name: { ar: "مشاوي", en: "Grills", ku: "برژاوەکان" }, itemsCount: 7, active: true },
  { id: "c5", name: { ar: "مقبلات", en: "Appetizers", ku: "پێشخواردن" }, itemsCount: 9, active: true },
  { id: "c6", name: { ar: "مشروبات", en: "Drinks", ku: "خواردنەوەکان" }, itemsCount: 12, active: true },
  { id: "c7", name: { ar: "حلويات", en: "Desserts", ku: "شیرینی" }, itemsCount: 6, active: false },
];

export interface MenuItem {
  id: string;
  category: string;
  name: { ar: string; en: string; ku: string };
  desc: { ar: string; en: string; ku: string };
  price: number;
  available: boolean;
  sold: number;
}

export const ITEMS: MenuItem[] = [
  {
    id: "i1", category: "c1",
    name: { ar: "برغر دجاج كلاسيك", en: "Classic Chicken Burger", ku: "برگەری مریشک" },
    desc: { ar: "صدر دجاج مقرمش مع صلصة خاصة", en: "Crispy chicken breast with house sauce", ku: "سنگی مریشکی برژاو" },
    price: 8500, available: true, sold: 142,
  },
  {
    id: "i2", category: "c2",
    name: { ar: "بيتزا مارغريتا", en: "Margherita Pizza", ku: "پیتزای مارگاریتا" },
    desc: { ar: "موزاريلا، طماطم، ريحان طازج", en: "Mozzarella, tomato, fresh basil", ku: "موزارێلا و تەماتە" },
    price: 14000, available: true, sold: 98,
  },
  {
    id: "i3", category: "c3",
    name: { ar: "شاورما لحم", en: "Beef Shawarma", ku: "شاورمای گۆشت" },
    desc: { ar: "لفّة لحم بقري مع خضار وثوم", en: "Beef wrap with veggies and garlic", ku: "گۆشتی گا لەگەڵ سەوزە" },
    price: 5500, available: true, sold: 215,
  },
  {
    id: "i4", category: "c4",
    name: { ar: "كباب مشكل", en: "Mixed Kebab", ku: "کەبابی تێکەڵ" },
    desc: { ar: "تشكيلة كباب مع أرز", en: "Assorted kebab with rice", ku: "کەبابی جۆراوجۆر" },
    price: 18000, available: true, sold: 76,
  },
  {
    id: "i5", category: "c5",
    name: { ar: "حمص", en: "Hummus", ku: "حومس" },
    desc: { ar: "حمص بالطحينة وزيت زيتون", en: "Hummus with tahini and olive oil", ku: "حومس لەگەڵ تەحینە" },
    price: 4000, available: true, sold: 130,
  },
  {
    id: "i6", category: "c6",
    name: { ar: "بيبسي", en: "Pepsi", ku: "پێپسی" },
    desc: { ar: "علبة 330مل", en: "330ml can", ku: "قوتوی ٣٣٠ مل" },
    price: 1500, available: true, sold: 320,
  },
  {
    id: "i7", category: "c7",
    name: { ar: "كنافة", en: "Knafeh", ku: "کنافە" },
    desc: { ar: "كنافة بالجبن مع قطر", en: "Cheese knafeh with syrup", ku: "کنافە بە پەنیر" },
    price: 5000, available: false, sold: 44,
  },
];

export const REVENUE_WEEK = [
  { day: "السبت", en: "Sat", ku: "شەممە", value: 285000 },
  { day: "الأحد", en: "Sun", ku: "یەکشەممە", value: 320000 },
  { day: "الإثنين", en: "Mon", ku: "دووشەممە", value: 410000 },
  { day: "الثلاثاء", en: "Tue", ku: "سێشەممە", value: 380000 },
  { day: "الأربعاء", en: "Wed", ku: "چوارشەممە", value: 445000 },
  { day: "الخميس", en: "Thu", ku: "پێنجشەممە", value: 520000 },
  { day: "الجمعة", en: "Fri", ku: "هەینی", value: 612000 },
];

export interface Transaction {
  id: string;
  date: string;
  type: "in" | "out";
  desc: { ar: string; en: string; ku: string };
  amount: number;
}

export const TRANSACTIONS: Transaction[] = [
  { id: "t1", date: "2025-04-26", type: "in", desc: { ar: "تسوية طلبات يومية", en: "Daily orders settlement", ku: "تسوییەی داواکارییەکان" }, amount: 612000 },
  { id: "t2", date: "2025-04-25", type: "in", desc: { ar: "تسوية طلبات يومية", en: "Daily orders settlement", ku: "تسوییەی داواکارییەکان" }, amount: 520000 },
  { id: "t3", date: "2025-04-24", type: "out", desc: { ar: "سحب إلى حساب بنكي", en: "Withdrawal to bank", ku: "دەرکردن بۆ بانک" }, amount: 1200000 },
  { id: "t4", date: "2025-04-23", type: "in", desc: { ar: "تسوية طلبات يومية", en: "Daily orders settlement", ku: "تسوییەی داواکارییەکان" }, amount: 445000 },
  { id: "t5", date: "2025-04-22", type: "in", desc: { ar: "تسوية طلبات يومية", en: "Daily orders settlement", ku: "تسوییەی داواکارییەکان" }, amount: 380000 },
];

export interface Review {
  id: string;
  customer: { ar: string; en: string; ku: string };
  rating: number;
  comment: { ar: string; en: string; ku: string };
  date: string;
}

export const REVIEWS: Review[] = [
  { id: "r1", customer: { ar: "أحمد الجبوري", en: "Ahmed Al-Jubouri", ku: "ئەحمەد جبووری" }, rating: 5,
    comment: { ar: "الطعام لذيذ جداً والتوصيل سريع. شكراً لكم!", en: "Food was delicious and delivery was fast!", ku: "خواردنەکە زۆر خۆش بوو و گەیاندن خێرا بوو" }, date: "2025-04-26" },
  { id: "r2", customer: { ar: "زينب علي", en: "Zainab Ali", ku: "زەینەب عەلی" }, rating: 4,
    comment: { ar: "البيتزا ممتازة لكن وصلت باردة قليلاً", en: "Pizza was great but arrived a bit cold", ku: "پیتزاکە باش بوو بەڵام کەمێک سارد بوو" }, date: "2025-04-25" },
  { id: "r3", customer: { ar: "محمد حسين", en: "Mohammed Hussein", ku: "محەمەد حسێن" }, rating: 5,
    comment: { ar: "أفضل شاورما في بغداد بدون منازع", en: "Best shawarma in Baghdad, hands down", ku: "باشترین شاورمای بەغدا" }, date: "2025-04-24" },
  { id: "r4", customer: { ar: "سارة كريم", en: "Sara Kareem", ku: "سارا کەریم" }, rating: 3,
    comment: { ar: "الكمية مناسبة لكن الأرز كان جافاً", en: "Portion was fine but the rice was dry", ku: "بڕەکە باش بوو بەڵام برنجەکە وشک بوو" }, date: "2025-04-23" },
];

export function pickName<T extends { ar: string; en: string; ku: string }>(obj: T, locale: Locale): string {
  return obj[locale];
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
