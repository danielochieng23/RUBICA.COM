// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  profileImage?: string;
  bio?: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  role: 'user' | 'provider' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  lastLogin: string;
  listings: string[];
  favorites: string[];
  ratings: {
    average: number;
    count: number;
  };
  socialMedia?: {
    website?: string;
    instagram?: string;
    twitter?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
    };
    privacy: {
      showPhone: boolean;
      showEmail: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
  fullName: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image?: string;
  color: string;
  parentCategory?: string;
  subcategories: string[];
  isActive: boolean;
  sortOrder: number;
  meta: {
    keywords: string[];
    metaTitle?: string;
    metaDescription?: string;
  };
  restrictions: {
    minAge: number;
    requiresVerification: boolean;
  };
  stats: {
    listingCount: number;
    viewCount: number;
  };
  createdAt: string;
  updatedAt: string;
  fullPath: string;
}

// Listing types
export interface Listing {
  _id: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: Category;
  user: User;
  images: {
    url: string;
    caption?: string;
    isMain: boolean;
  }[];
  pricing: {
    type: 'fixed' | 'hourly' | 'negotiable' | 'free';
    amount?: number;
    currency: string;
    duration?: string;
  };
  location: {
    city: string;
    state: string;
    area?: string;
    pincode?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    whatsapp?: string;
    email?: string;
    preferredContact: 'phone' | 'whatsapp' | 'email';
    availability?: {
      hours?: string;
      days?: string[];
    };
  };
  features: {
    verified: boolean;
    premium: boolean;
    featured: boolean;
    urgent: boolean;
  };
  status: 'active' | 'inactive' | 'pending' | 'rejected' | 'expired';
  moderationNotes?: string;
  stats: {
    views: number;
    contacts: number;
    favorites: number;
    shares: number;
  };
  ratings: {
    average: number;
    count: number;
  };
  tags: string[];
  services: string[];
  ageRange: {
    min: number;
    max: number;
  };
  workingHours: {
    [key: string]: {
      start?: string;
      end?: string;
      available: boolean;
    };
  };
  expiresAt: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
  mainImage: string;
  formattedPrice: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    msg: string;
    param: string;
    location: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit?: number;
  };
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: {
    city: string;
    state: string;
    country?: string;
  };
  bio?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Filter types
export interface ListingFilters {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  verified?: boolean;
  sortBy?: 'createdAt' | 'price' | 'views';
  sortOrder?: 'asc' | 'desc';
}

// Form types
export interface CreateListingForm {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  images: File[];
  pricing: {
    type: 'fixed' | 'hourly' | 'negotiable' | 'free';
    amount?: number;
    duration?: string;
  };
  location: {
    city: string;
    state: string;
    area?: string;
    pincode?: string;
    address?: string;
  };
  contact: {
    phone: string;
    whatsapp?: string;
    email?: string;
    preferredContact: 'phone' | 'whatsapp' | 'email';
    availability?: {
      hours?: string;
      days?: string[];
    };
  };
  tags: string[];
  services: string[];
  ageRange: {
    min: number;
    max: number;
  };
  workingHours: {
    [key: string]: {
      start?: string;
      end?: string;
      available: boolean;
    };
  };
}

// Admin types
export interface AdminStats {
  summary: {
    totalUsers: number;
    totalListings: number;
    totalCategories: number;
    activeListings: number;
    pendingListings: number;
    verifiedUsers: number;
    todayRegistrations: number;
    todayListings: number;
  };
  recentActivities: {
    users: Pick<User, '_id' | 'username' | 'firstName' | 'lastName' | 'createdAt'>[];
    listings: Pick<Listing, '_id' | 'title' | 'status' | 'createdAt' | 'user' | 'category'>[];
  };
  categoryStats: Array<{
    _id: string;
    name: string;
    listingCount: number;
    activeListings: number;
  }>;
}