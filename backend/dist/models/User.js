import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: String,
    city: String,
    state: String,
    country: {
        type: String,
        default: 'India'
    },
    dateOfBirth: Date,
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    preferences: {
        notifications: {
            type: Boolean,
            default: true
        },
        publicProfile: {
            type: Boolean,
            default: false
        },
        showPhone: {
            type: Boolean,
            default: false
        }
    }
}, {
    timestamps: true
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.verificationToken;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
};
export default mongoose.model('User', userSchema);
//# sourceMappingURL=User.js.map