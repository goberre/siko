import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// 초기 서비스 데이터 (data.ts 내용과 동일)
const initialServices = [
  { title: "네이버 스마트스토어 상위노출", category: "store", subcategory: "네이버 스마트스토어", industry: ["shopping"], price: 10000, priceUnit: "건", rating: 4.9, reviewCount: 2763, badge: "인기", description: "알림받기·상품찜·트래픽·구매평 통합 관리로 검색 상위노출을 달성합니다.", tags: ["알림받기", "상품찜", "구매평", "트래픽"] },
  { title: "쿠팡 상위노출 종합 패키지", category: "store", subcategory: "쿠팡", industry: ["shopping"], price: 15000, priceUnit: "건", rating: 4.9, reviewCount: 66, badge: "신규", description: "구매평·후기·찜·공유·트래픽으로 쿠팡 내 순위를 끌어올립니다.", tags: ["구매평", "후기", "찜", "트래픽"] },
  { title: "오픈마켓 상위노출 통합", category: "store", subcategory: "오픈마켓 전체", industry: ["shopping"], price: 15000, priceUnit: "건", rating: 5.0, reviewCount: 1956, badge: "인기", description: "상품찜·스토어찜·트래픽·구매평 증가로 오픈마켓 전반의 노출을 높입니다.", tags: ["상품찜", "스토어찜", "트래픽", "구매평"] },
  { title: "올리브영 상위노출 마케팅", category: "store", subcategory: "오픈마켓 전체", industry: ["shopping", "beauty"], price: 15000, priceUnit: "건", rating: 4.9, reviewCount: 123, badge: null, description: "리뷰·구매평·찜·공유로 올리브영 내 상품 노출을 극대화합니다.", tags: ["리뷰", "찜", "구매평", "공유"] },
  { title: "스토어 구매평 · 후기 관리", category: "store", subcategory: "네이버 스마트스토어", industry: ["shopping"], price: 15000, priceUnit: "건", rating: 4.9, reviewCount: 1975, badge: "추천", description: "실사용자 리뷰로 신뢰도를 높이고 상위노출을 달성합니다.", tags: ["구매평", "후기", "Q&A", "리뷰"] },
  { title: "네이버 플레이스 상위노출", category: "place", subcategory: "네이버 플레이스", industry: ["restaurant", "beauty", "hospital", "brand"], price: 11000, priceUnit: "건", rating: 5.0, reviewCount: 2340, badge: "인기", description: "영수증리뷰·예약리뷰·저장하기·즐겨찾기 관리로 플레이스 최상단 노출.", tags: ["영수증리뷰", "예약리뷰", "저장하기", "즐겨찾기"] },
  { title: "구글맵 리뷰 · 평점 관리", category: "place", subcategory: "구글맵", industry: ["restaurant", "hospital", "accommodation", "brand"], price: 10000, priceUnit: "건", rating: 5.0, reviewCount: 1836, badge: "인기", description: "구글지도 리뷰·평점·저장·공유 증가로 SEO 상위노출을 이끌어냅니다.", tags: ["리뷰", "평점", "저장", "공유"] },
  { title: "카카오맵 상위노출 마케팅", category: "place", subcategory: "카카오맵", industry: ["restaurant", "beauty", "hospital"], price: 10000, priceUnit: "건", rating: 4.4, reviewCount: 1753, badge: null, description: "카카오내비·다음지도 리뷰·트래픽 관리로 지역 검색 노출을 높입니다.", tags: ["리뷰", "트래픽", "카카오내비", "다음지도"] },
  { title: "야놀자 · 여기어때 리뷰 관리", category: "place", subcategory: "숙박 · 호텔", industry: ["accommodation"], price: 42500, priceUnit: "건", rating: 4.2, reviewCount: 1595, badge: null, description: "실제 이용자 후기·노출 상승·예약 전환 강화로 숙박업소 경쟁력을 높입니다.", tags: ["리뷰", "평점", "노출상승", "예약전환"] },
  { title: "모두닥 · 굿닥 병원 체험단 마케팅", category: "place", subcategory: "네이버 플레이스", industry: ["hospital"], price: 32500, priceUnit: "건", rating: 5.0, reviewCount: 86, badge: "추천", description: "병원 신뢰도 상승 & 노출 극대화를 위한 실사용자 체험단 서비스.", tags: ["병원리뷰", "체험단", "신뢰도", "노출상승"] },
  { title: "식신 · 다이닝코드 맛집 리뷰", category: "place", subcategory: "맛집 마케팅", industry: ["restaurant"], price: 40000, priceUnit: "건", rating: 4.9, reviewCount: 108, badge: null, description: "맛집 평점 관리 및 상위노출을 위한 실사용자 리뷰 마케팅.", tags: ["맛집리뷰", "평점관리", "상위노출", "방문전환"] },
  { title: "구글플레이 앱 상위노출 ASO", category: "app", subcategory: "구글플레이", industry: ["app"], price: 21250, priceUnit: "건", rating: 4.9, reviewCount: 2108, badge: "인기", description: "앱 다운로드·앱 리뷰·순위 상승·ASO 최적화 통합 서비스.", tags: ["다운로드", "리뷰", "ASO", "순위상승"] },
  { title: "앱스토어 iOS 상위노출", category: "app", subcategory: "앱스토어 iOS", industry: ["app"], price: 60000, priceUnit: "건", rating: 5.0, reviewCount: 130, badge: null, description: "iOS 앱 다운로드·리뷰·순위 상승·ASO 전문 서비스.", tags: ["다운로드", "리뷰", "ASO", "iOS"] },
  { title: "인스타그램 인기게시물 관리", category: "sns", subcategory: "인스타그램", industry: ["creator", "beauty", "restaurant", "shopping"], price: 8000, priceUnit: "건", rating: 4.9, reviewCount: 1798, badge: "인기", description: "팔로워·좋아요·댓글·공유 증가로 인스타 인기게시물 노출을 달성합니다.", tags: ["팔로워", "좋아요", "댓글", "공유"] },
  { title: "유튜브 구독자 · 조회수 마케팅", category: "sns", subcategory: "유튜브", industry: ["creator", "brand"], price: 8000, priceUnit: "건", rating: 4.9, reviewCount: 2045, badge: "인기", description: "구독자·조회수·좋아요·댓글·공유로 유튜브 상위노출을 이끕니다.", tags: ["구독자", "조회수", "좋아요", "댓글"] },
  { title: "틱톡 팔로워 · 조회수 마케팅", category: "sns", subcategory: "틱톡", industry: ["creator"], price: 1000, priceUnit: "건", rating: 5.0, reviewCount: 87, badge: "신규", description: "실사용자 기반 팔로워·조회수·좋아요·공유·댓글 증가 서비스.", tags: ["팔로워", "조회수", "좋아요", "공유"] },
  { title: "카카오채널 친구추가 마케팅", category: "sns", subcategory: "카카오", industry: ["brand", "shopping", "restaurant"], price: 8000, priceUnit: "건", rating: 4.8, reviewCount: 1957, badge: null, description: "카카오채널 친구추가·좋아요·댓글·공유 활성화 마케팅.", tags: ["친구추가", "좋아요", "댓글", "공유"] },
  { title: "네이버 블로그 상위노출", category: "blog", subcategory: "네이버 블로그", industry: ["brand", "restaurant", "beauty", "hospital", "shopping"], price: 8000, priceUnit: "건", rating: 4.8, reviewCount: 1932, badge: "인기", description: "지수 상승·이웃·공감·조회수 증가로 네이버 블로그 상위노출.", tags: ["지수상승", "이웃", "공감", "조회수"] },
  { title: "네이버 카페 회원 증가", category: "blog", subcategory: "네이버 카페", industry: ["brand"], price: 10000, priceUnit: "건", rating: 4.9, reviewCount: 1890, badge: null, description: "회원수 증가·인사 활성화로 카페 커뮤니티를 성장시킵니다.", tags: ["회원가입", "인사", "활성화"] },
  { title: "고품질 실사용자 트래픽", category: "seo", subcategory: "트래픽", industry: ["brand", "shopping", "app"], price: 9000, priceUnit: "건", rating: 4.8, reviewCount: 1707, badge: "추천", description: "방문자 유입·조회수 상승·사이트 SEO 최적화 마케팅.", tags: ["트래픽", "방문자유입", "조회수", "SEO"] },
  { title: "네이버 자동완성 키워드 등록", category: "seo", subcategory: "자동완성 키워드", industry: ["brand"], price: 250000, priceUnit: "건", rating: 4.9, reviewCount: 61, badge: null, description: "연관검색어 등록·상위노출로 브랜드 검색 점유율을 높입니다.", tags: ["자동완성", "연관검색어", "상위노출"] },
  { title: "파워링크 · 키워드광고 운영대행", category: "ad", subcategory: "파워링크", industry: ["brand", "hospital", "shopping", "restaurant"], price: 200000, priceUnit: "월", rating: 4.9, reviewCount: 59, badge: "추천", description: "네이버·구글·다음 검색광고 최적화 세팅 및 1:1 맞춤 운영관리.", tags: ["파워링크", "키워드광고", "CPC", "운영대행"] },
  { title: "네이버 플레이스 광고 상단노출", category: "ad", subcategory: "플레이스 광고", industry: ["restaurant", "beauty", "hospital"], price: 200000, priceUnit: "월", rating: 4.9, reviewCount: 61, badge: null, description: "플레이스 광고 최적화 세팅 및 운영관리로 매출 상승을 이끌어냅니다.", tags: ["플레이스광고", "상단노출", "운영대행"] },
];

async function main() {
  // 어드민 계정 생성
  const adminEmail    = "admin@siko.kr";
  const adminPassword = "siko1234";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: { name: "관리자", email: adminEmail, password: hashed, role: "admin" },
    });
    console.log("✅  어드민 계정 생성:", adminEmail);
  } else {
    console.log("✅  어드민 계정 이미 존재:", adminEmail);
  }

  // 서비스 데이터 시드 (없는 경우에만)
  const count = await prisma.service.count();
  if (count === 0) {
    await prisma.service.createMany({ data: initialServices });
    console.log(`✅  서비스 ${initialServices.length}개 초기 데이터 등록 완료`);
  } else {
    console.log(`✅  서비스 데이터 이미 존재 (${count}개)`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
