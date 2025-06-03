import mongoose from 'mongoose'

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Listening Stats
  listening: {
    totalTime: {
      type: Number,
      default: 0 // in minutes
    },
    sessionsJoined: {
      type: Number,
      default: 0
    },
    roomsCreated: {
      type: Number,
      default: 0
    },
    tracksPlayed: {
      type: Number,
      default: 0
    },
    favoriteGenres: [{
      genre: String,
      count: Number
    }],
    topArtists: [{
      artist: String,
      playCount: Number
    }],
    currentStreak: {
      type: Number,
      default: 0 // days
    },
    longestStreak: {
      type: Number,
      default: 0 // days
    }
  },
  
  // Social Stats
  social: {
    friendsCount: {
      type: Number,
      default: 0
    },
    roomsShared: {
      type: Number,
      default: 0
    },
    invitesSent: {
      type: Number,
      default: 0
    },
    invitesReceived: {
      type: Number,
      default: 0
    },
    collaborativeRooms: {
      type: Number,
      default: 0
    }
  },
  
  // Device Usage
  deviceUsage: [{
    deviceType: {
      type: String,
      enum: ['mobile', 'desktop', 'tablet', 'smart_speaker', 'web', 'other']
    },
    usageTime: {
      type: Number,
      default: 0 // in minutes
    },
    sessionsCount: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Recent Activity
  recentRooms: [{
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    roomName: String,
    lastJoined: {
      type: Date,
      default: Date.now
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'participant'],
      default: 'participant'
    },
    timeSpent: {
      type: Number,
      default: 0 // in minutes
    }
  }],
  
  // Weekly/Monthly Stats
  weeklyStats: {
    currentWeek: {
      listeningTime: { type: Number, default: 0 },
      roomsJoined: { type: Number, default: 0 },
      tracksPlayed: { type: Number, default: 0 }
    },
    lastWeek: {
      listeningTime: { type: Number, default: 0 },
      roomsJoined: { type: Number, default: 0 },
      tracksPlayed: { type: Number, default: 0 }
    }
  },
  
  // Achievements/Badges
  achievements: [{
    name: String,
    description: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['listening', 'social', 'creative', 'milestone']
    }
  }],
  
  // Preferences learned from usage
  learnedPreferences: {
    preferredGenres: [String],
    listeningHours: [{
      hour: Number, // 0-23
      frequency: Number
    }],
    averageSessionLength: {
      type: Number,
      default: 0 // in minutes
    },
    preferredDeviceType: String
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

userStatsSchema.index({ userId: 1 }, { unique: true })
userStatsSchema.index({ 'recentRooms.roomId': 1 })
userStatsSchema.index({ 'achievements.category': 1 })

// Instance methods
userStatsSchema.methods.incrementListeningTime = function(minutes, deviceType = 'other') {
  this.listening.totalTime += minutes
  
  // Update device usage
  const deviceStat = this.deviceUsage.find(d => d.deviceType === deviceType)
  if (deviceStat) {
    deviceStat.usageTime += minutes
    deviceStat.lastUsed = Date.now()
    deviceStat.sessionsCount += 1
  } else {
    this.deviceUsage.push({
      deviceType,
      usageTime: minutes,
      sessionsCount: 1,
      lastUsed: Date.now()
    })
  }
  
  // Update weekly stats
  this.weeklyStats.currentWeek.listeningTime += minutes
  
  this.lastUpdated = Date.now()
  return this.save()
}

userStatsSchema.methods.addRoomActivity = function(roomId, roomName, role = 'participant', timeSpent = 0) {
  // Update recent rooms (keep last 10)
  const existingRoom = this.recentRooms.find(r => r.roomId.toString() === roomId.toString())
  
  if (existingRoom) {
    existingRoom.lastJoined = Date.now()
    existingRoom.timeSpent += timeSpent
  } else {
    this.recentRooms.unshift({
      roomId,
      roomName,
      role,
      timeSpent,
      lastJoined: Date.now()
    })
    
    // Keep only last 10 rooms
    if (this.recentRooms.length > 10) {
      this.recentRooms = this.recentRooms.slice(0, 10)
    }
  }
  
  // Update counters
  this.listening.sessionsJoined += 1
  this.weeklyStats.currentWeek.roomsJoined += 1
  
  this.lastUpdated = Date.now()
  return this.save()
}

userStatsSchema.methods.incrementTracksPlayed = function(count = 1) {
  this.listening.tracksPlayed += count
  this.weeklyStats.currentWeek.tracksPlayed += count
  this.lastUpdated = Date.now()
  return this.save()
}

userStatsSchema.methods.addGenreListening = function(genre) {
  const existingGenre = this.listening.favoriteGenres.find(g => g.genre === genre)
  
  if (existingGenre) {
    existingGenre.count += 1
  } else {
    this.listening.favoriteGenres.push({ genre, count: 1 })
  }
  
  // Sort and keep top 10 genres
  this.listening.favoriteGenres.sort((a, b) => b.count - a.count)
  if (this.listening.favoriteGenres.length > 10) {
    this.listening.favoriteGenres = this.listening.favoriteGenres.slice(0, 10)
  }
  
  return this.save()
}

userStatsSchema.methods.addAchievement = function(name, description, category = 'milestone') {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(a => a.name === name)
  if (existingAchievement) return Promise.resolve(this)
  
  this.achievements.push({
    name,
    description,
    category,
    unlockedAt: Date.now()
  })
  
  return this.save()
}

userStatsSchema.methods.resetWeeklyStats = function() {
  this.weeklyStats.lastWeek = { ...this.weeklyStats.currentWeek }
  this.weeklyStats.currentWeek = {
    listeningTime: 0,
    roomsJoined: 0,
    tracksPlayed: 0
  }
  return this.save()
}

// Static methods
userStatsSchema.statics.getTopListeners = function(limit = 10, timeframe = 'allTime') {
  const sortField = timeframe === 'week' 
    ? 'weeklyStats.currentWeek.listeningTime' 
    : 'listening.totalTime'
    
  return this.find({})
    .populate('userId', 'username avatar')
    .sort({ [sortField]: -1 })
    .limit(limit)
}

userStatsSchema.statics.getUserRanking = async function(userId, metric = 'totalTime') {
  const userStats = await this.findOne({ userId })
  if (!userStats) return null
  
  let userValue
  switch (metric) {
    case 'totalTime':
      userValue = userStats.listening.totalTime
      break
    case 'roomsCreated':
      userValue = userStats.listening.roomsCreated
      break
    case 'tracksPlayed':
      userValue = userStats.listening.tracksPlayed
      break
    default:
      userValue = userStats.listening.totalTime
  }
  
  const ranking = await this.countDocuments({
    [`listening.${metric}`]: { $gt: userValue }
  })
  
  return ranking + 1
}

userStatsSchema.statics.initializeUserStats = function(userId) {
  return this.create({ userId })
}

export default mongoose.model('UserStats', userStatsSchema)