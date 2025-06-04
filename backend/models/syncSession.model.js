import mongoose from 'mongoose'

const syncSessionSchema = new mongoose.Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  
  // Session Info
  sessionId: {
    type: String,
    required: true
  },
  
  // Sync Events Log
  events: [{
    type: {
      type: String,
      enum: ['play', 'pause', 'seek', 'volume_change', 'track_change', 'user_join', 'user_leave', 'queue_add', 'queue_remove'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    data: {
      type: mongoose.Schema.Types.Mixed // Store event-specific data
    }
  }],
  
  // Sync State
  syncState: {
    masterDevice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device'
    },
    lastSyncTime: {
      type: Date,
      default: Date.now
    },
    syncAccuracy: {
      type: Number,
      default: 0 // in ms
    },
    syncErrors: {
      type: Number,
      default: 0
    }
  },
  
  // Session Statistics
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    peakParticipants: {
      type: Number,
      default: 0
    },
    totalDuration: {
      type: Number,
      default: 0 // in minutes
    },
    tracksPlayed: {
      type: Number,
      default: 0
    },
    eventsLogged: {
      type: Number,
      default: 0
    }
  },
  
  // Session Status
  isActive: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

syncSessionSchema.index({ roomId: 1 })
syncSessionSchema.index({ sessionId: 1 }, { unique: true })
syncSessionSchema.index({ isActive: 1 })
syncSessionSchema.index({ 'events.timestamp': -1 })

// Instance methods
syncSessionSchema.methods.logEvent = function(eventType, userId, deviceId, eventData = {}) {
  this.events.push({
    type: eventType,
    timestamp: new Date(),
    userId,
    deviceId,
    data: eventData
  })
  
  this.stats.eventsLogged += 1
  
  // Limit events array to prevent excessive growth
  if (this.events.length > 1000) {
    this.events = this.events.slice(-500) 
  }
  
  return this.save()
}

syncSessionSchema.methods.updateSyncState = function(masterDevice, accuracy = 0) {
  this.syncState.masterDevice = masterDevice
  this.syncState.lastSyncTime = Date.now()
  this.syncState.syncAccuracy = accuracy
  return this.save()
}

syncSessionSchema.methods.updateStats = function(participants) {
  this.stats.totalParticipants = participants.length
  if (participants.length > this.stats.peakParticipants) {
    this.stats.peakParticipants = participants.length
  }
  return this.save()
}

syncSessionSchema.methods.endSession = function() {
  this.isActive = false
  this.endedAt = Date.now()
  
  // Calculate total duration
  if (this.startedAt) {
    const durationMs = this.endedAt - this.startedAt
    this.stats.totalDuration = Math.round(durationMs / (1000 * 60)) // Convert to minutes
  }
  
  return this.save()
}

syncSessionSchema.methods.getRecentEvents = function(limit = 50) {
  return this.events
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
}

// Static methods
syncSessionSchema.statics.generateSessionId = function() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

syncSessionSchema.statics.getActiveSession = function(roomId) {
  return this.findOne({ roomId, isActive: true })
}

syncSessionSchema.statics.createSession = function(roomId) {
  const sessionId = this.generateSessionId()
  return this.create({
    roomId,
    sessionId,
    isActive: true
  })
}

syncSessionSchema.statics.getSessionStats = function(roomId, days = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  
  return this.aggregate([
    {
      $match: {
        roomId: new mongoose.Types.ObjectId(roomId),
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$stats.totalDuration' },
        totalEvents: { $sum: '$stats.eventsLogged' },
        avgParticipants: { $avg: '$stats.totalParticipants' },
        peakParticipants: { $max: '$stats.peakParticipants' }
      }
    }
  ])
}

export default mongoose.model('SyncSession', syncSessionSchema)