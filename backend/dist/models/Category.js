import mongoose, { Schema } from 'mongoose';
const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        trim: true
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});
categorySchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});
export default mongoose.model('Category', categorySchema);
//# sourceMappingURL=Category.js.map