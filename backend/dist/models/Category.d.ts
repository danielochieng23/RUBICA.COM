import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    parentCategory?: mongoose.Types.ObjectId;
    isActive: boolean;
    sortOrder: number;
    metaTitle?: string;
    metaDescription?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, {}> & ICategory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Category.d.ts.map