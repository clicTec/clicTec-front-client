import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface HomeFeatureResponse {
  tag: string;
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
}

export interface HomeLatestItemResponse {
  category: string;
  title: string;
  timeAgo: string;
  route: string;
}

export interface HomeTopicResponse {
  label: string;
  route: string;
}

export interface HomeStoryResponse {
  tag: string;
  title: string;
  description: string;
  routeLabel: string;
  route: string;
}

export interface HomeResponse {
  eyebrow: string;
  title: string;
  subtitle: string;
  feature: HomeFeatureResponse;
  latest: HomeLatestItemResponse[];
  topics: HomeTopicResponse[];
  stories: HomeStoryResponse[];
}

export interface MobileFilterGroupResponse {
  key: 'brand' | 'tier' | 'priceRange' | 'os';
  title: string;
  options: string[];
}

export interface MobileSpecResponse {
  label: string;
  value: string;
}

export interface MobileCardResponse {
  slug: string;
  model: string;
  brand: string;
  segment: string;
  price: string;
  score: string;
  review: string;
  image: string;
  chips: string[];
  specs: MobileSpecResponse[];
  route: string;
  routeLabel: string;
  tier: string;
  priceRange: string;
  os: string;
}

export interface MobileCatalogResponse {
  items: MobileCardResponse[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface LaunchEntryResponse {
  month: string;
  device: string;
  target: string;
  notes: string;
}

export interface MobileSelectedFiltersResponse {
  brand: string;
  tier: string;
  priceRange: string;
  os: string;
}

export interface MobileResponse {
  filterGroups: MobileFilterGroupResponse[];
  launchCalendar: LaunchEntryResponse[];
  buyingChecklist: string[];
  selectedFilters: MobileSelectedFiltersResponse;
  catalog: MobileCatalogResponse;
}

export interface ComparisonFocusOptionResponse {
  id: 'global' | 'camera' | 'performance' | 'battery' | 'value';
  label: string;
  description: string;
}

export interface ComparisonDeviceResponse {
  id: string;
  name: string;
  brand: string;
  segment: string;
  os: string;
  tier: string;
  manufactureYear: number;
  priceLabel: string;
  priceValue: number;
  chipset: string;
  cameraMain: string;
  batteryMah: number;
  chargingW: number;
  softwareYears: number;
  performance: number;
  camera: number;
  battery: number;
  value: number;
}

export interface FeaturedDuelResponse {
  id: string;
  title: string;
  summary: string;
  tag: string;
  focus: 'global' | 'camera' | 'performance' | 'battery' | 'value';
  leftDeviceId: string;
  rightDeviceId: string;
}

export interface ComparisonResponse {
  activeFocusId: 'global' | 'camera' | 'performance' | 'battery' | 'value';
  leftDeviceId: string;
  rightDeviceId: string;
  focusOptions: ComparisonFocusOptionResponse[];
  devices: ComparisonDeviceResponse[];
  featuredDuels: FeaturedDuelResponse[];
}

export interface GuideResponse {
  eyebrow: string;
  title: string;
  items: string[];
}

export interface RankingResponse {
  eyebrow: string;
  title: string;
  items: string[];
}

export interface ReviewCardResponse {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  score: number;
}

export interface ReviewResponse {
  eyebrow: string;
  title: string;
  description: string;
  items: ReviewCardResponse[];
}

export interface TechNewsResponse {
  id: number;
  title: string;
  contentHtml: string;
  commercialLabel: string | null;
  affiliateDisclosure: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewImageResponse {
  url: string;
  alt: string;
  type: 'cover' | 'gallery';
}

export interface ReviewDetailResponse {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  score: number;
  coverImage: string;
  images: ReviewImageResponse[];
  publishedAt: string | null;
}

export interface MobilePageRequest {
  brand: string;
  tier: string;
  priceRange: string;
  os: string;
  page: number;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class ContentApiService {
  private readonly apiBase = '/api';

  constructor(private readonly httpClient: HttpClient) {}

  getHomePage(): Observable<HomeResponse> {
    return this.httpClient.get<HomeResponse>(`${this.apiBase}/home`);
  }

  getMobilePage(request: MobilePageRequest): Observable<MobileResponse> {
    const params = new HttpParams({
      fromObject: {
        brand: request.brand,
        tier: request.tier,
        priceRange: request.priceRange,
        os: request.os,
        page: String(request.page),
        size: String(request.size)
      }
    });

    return this.httpClient.get<MobileResponse>(`${this.apiBase}/moviles`, { params });
  }

  getComparisonPage(): Observable<ComparisonResponse> {
    return this.httpClient.get<ComparisonResponse>(`${this.apiBase}/comparativas`);
  }

  getGuidePage(): Observable<GuideResponse> {
    return this.httpClient.get<GuideResponse>(`${this.apiBase}/guias`);
  }

  getRankingPage(): Observable<RankingResponse> {
    return this.httpClient.get<RankingResponse>(`${this.apiBase}/rankings`);
  }

  getReviewPage(): Observable<ReviewResponse> {
    return this.httpClient.get<ReviewResponse>(`${this.apiBase}/reviews`);
  }

  getTechNews(): Observable<TechNewsResponse[]> {
    return this.httpClient.get<TechNewsResponse[]>(`${this.apiBase}/tech-news`);
  }

  getReviewBySlug(slug: string): Observable<ReviewDetailResponse> {
    return this.httpClient.get<ReviewDetailResponse>(`${this.apiBase}/reviews/${slug}`);
  }

  getMobileReviewBySlug(slug: string): Observable<ReviewDetailResponse> {
    return this.httpClient.get<ReviewDetailResponse>(`${this.apiBase}/moviles/${slug}`);
  }
}
