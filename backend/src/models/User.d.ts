import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: 'user' | 'admin' | 'moderator';
    isActive: boolean;
    isVerified: boolean;
    verificationToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    avatar?: string;
    city?: string;
    state?: string;
    country?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    preferences?: {
        notifications: boolean;
        publicProfile: boolean;
        showPhone: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map