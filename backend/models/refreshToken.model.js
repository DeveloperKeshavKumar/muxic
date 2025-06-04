import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 } // MongoDB TTL index for automatic deletion
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false // We're handling timestamps manually
})

// Index for efficient cleanup
refreshTokenSchema.index({ userId: 1, createdAt: -1 })

// Update lastUsed when token is accessed
refreshTokenSchema.pre('findOne', function () {
    this.set({ lastUsed: new Date() })
})

export default mongoose.model('RefreshToken', refreshTokenSchema)