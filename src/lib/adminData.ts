export type Order = {
  id: string;
  serviceTitle: string;
  category: string;
  customer: string;
  email: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  createdAt: string;
  tier: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  orderCount: number;
  totalSpent: number;
  status: "active" | "inactive";
};

export const orders: Order[] = [
  { id: "ORD-001", serviceTitle: "네이버 플레이스 상위노출", category: "플레이스", customer: "김지훈", email: "jhkim@email.com", amount: 27500, status: "processing", createdAt: "2026-06-09", tier: "스탠다드" },
  { id: "ORD-002", serviceTitle: "인스타그램 인기게시물 관리", category: "SNS", customer: "이수연", email: "suyeon@email.com", amount: 8000, status: "pending", createdAt: "2026-06-09", tier: "스타터" },
  { id: "ORD-003", serviceTitle: "구글플레이 앱 상위노출", category: "앱", customer: "박민준", email: "mjpark@email.com", amount: 63750, status: "completed", createdAt: "2026-06-08", tier: "프로" },
  { id: "ORD-004", serviceTitle: "네이버 스마트스토어 상위노출", category: "스토어", customer: "최유진", email: "yjchoi@email.com", amount: 25000, status: "completed", createdAt: "2026-06-08", tier: "스탠다드" },
  { id: "ORD-005", serviceTitle: "파워링크 운영대행", category: "검색광고", customer: "정현우", email: "hwjeong@email.com", amount: 200000, status: "processing", createdAt: "2026-06-07", tier: "월정액" },
  { id: "ORD-006", serviceTitle: "유튜브 구독자 마케팅", category: "SNS", customer: "한소희", email: "shhahn@email.com", amount: 48000, status: "pending", createdAt: "2026-06-07", tier: "프로" },
  { id: "ORD-007", serviceTitle: "구글맵 리뷰 관리", category: "플레이스", customer: "오태양", email: "tyoh@email.com", amount: 10000, status: "cancelled", createdAt: "2026-06-06", tier: "스타터" },
  { id: "ORD-008", serviceTitle: "쿠팡 상위노출 패키지", category: "스토어", customer: "윤서준", email: "sjyoon@email.com", amount: 37500, status: "completed", createdAt: "2026-06-06", tier: "스탠다드" },
];

export const adminUsers: AdminUser[] = [
  { id: "USR-001", name: "김지훈", email: "jhkim@email.com", joinedAt: "2026-05-10", orderCount: 5, totalSpent: 128000, status: "active" },
  { id: "USR-002", name: "이수연", email: "suyeon@email.com", joinedAt: "2026-05-22", orderCount: 2, totalSpent: 23000, status: "active" },
  { id: "USR-003", name: "박민준", email: "mjpark@email.com", joinedAt: "2026-04-15", orderCount: 8, totalSpent: 345000, status: "active" },
  { id: "USR-004", name: "최유진", email: "yjchoi@email.com", joinedAt: "2026-06-01", orderCount: 1, totalSpent: 25000, status: "active" },
  { id: "USR-005", name: "정현우", email: "hwjeong@email.com", joinedAt: "2026-03-20", orderCount: 12, totalSpent: 890000, status: "active" },
  { id: "USR-006", name: "한소희", email: "shhahn@email.com", joinedAt: "2026-05-30", orderCount: 3, totalSpent: 74000, status: "inactive" },
];

export const dashboardStats = {
  totalRevenue: 418250,
  revenueGrowth: 12.4,
  totalOrders: 8,
  orderGrowth: 8.1,
  totalUsers: 6,
  userGrowth: 25.0,
  pendingOrders: 3,
  conversionRate: 3.2,
};

export const revenueByDay = [
  { date: "6/3", revenue: 48000 },
  { date: "6/4", revenue: 32000 },
  { date: "6/5", revenue: 75000 },
  { date: "6/6", revenue: 47500 },
  { date: "6/7", revenue: 248000 },
  { date: "6/8", revenue: 88750 },
  { date: "6/9", revenue: 35000 },
];

export const categoryRevenue = [
  { name: "스토어", revenue: 87500, pct: 21 },
  { name: "플레이스", revenue: 37500, pct: 9 },
  { name: "SNS", revenue: 56000, pct: 13 },
  { name: "검색광고", revenue: 200000, pct: 48 },
  { name: "앱", revenue: 63750, pct: 15 },
];
