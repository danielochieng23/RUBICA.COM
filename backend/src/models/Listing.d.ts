import mongoose, { Document } from 'mongoose';
export interface IListing extends Document {
    title: string;
    description: string;
    category: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    images: string[];
    price?: {
        amount: number;
        currency: string;
        type: 'hourly' | 'daily' | 'fixed' | 'negotiable';
    };
    location: {
        city: string;
        state: string;
        country: string;
        address?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    contact: {
        phone?: string;
        email?: string;
        whatsapp?: string;
        telegram?: string;
    };
    availability: {
        days: string[];
        hours: {
            start: string;
            end: string;
        };
        isAvailable24x7: boolean;
    };
    services: string[];
    ageRange?: {
        min: number;
        max: number;
    };
    bodyType?: string;
    ethnicity?: string;
    languages: string[];
    isVerified: boolean;
    isPremium: boolean;
    isActive: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'expired';
    views: number;
    likes: number;
    reports: number;
    expiresAt: Date;
    lastActiveAt: Date;
    metaTitle?: string;
    metaDescription?: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IListing, {}, {}, {}, mongoose.Document<unknown, {}, IListing, {}, {}> & IListing & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Listing.d.ts.map