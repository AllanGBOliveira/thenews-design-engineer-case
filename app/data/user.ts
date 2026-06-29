export type ActivityItem = {
  type: 'habit_complete' | 'edition_read'
  name: string
  timeAgo: string
}

export type VerificationCriterion = {
  emoji: string
  labelKey: string
  current: number
  goal: number
  goalDisplay: string
  progress: number
}

export type Book = {
  title: string
  coverUrl: string | null
}

export type TodayHabit = {
  emoji: string
  badge?: number
}

export type User = {
  id: string
  name: string
  username: string | null
  email: string
  avatarUrl: string
  plan: 'free' | 'premium'
  joinedAt: string
  streakCurrent: number
  streakLongest: number
  editionsRead: number
  bestHabit: string
  followers: number
  following: number
  recentActivity: ActivityItem[]
  verificationProgress: number
  verificationCriteria: VerificationCriterion[]
  performanceStreak: number
  performanceBooks: number
  performanceHabitsPercent: number
  todayHabits: TodayHabit[]
  activityDaysCount: number
  books: Book[]
  engagementPoints: number
  engagementTrophies: number
}

export const mockUser: User = {
  id: 'u_01',
  name: 'Allan Oliveira',
  username: null,
  email: 'allebeira@gmail.com',
  avatarUrl: 'https://picsum.photos/seed/thenews-user/200/200',
  plan: 'premium',
  joinedAt: 'jun. de 2026',
  streakCurrent: 47,
  streakLongest: 112,
  editionsRead: 284,
  bestHabit: 'edition',
  followers: 0,
  following: 0,

  recentActivity: [
    { type: 'habit_complete', name: 'Alimentação', timeAgo: '22h' },
    { type: 'habit_complete', name: 'Edição',      timeAgo: '22h' },
    { type: 'edition_read',   name: 'night',        timeAgo: '22h' },
    { type: 'habit_complete', name: 'Edição',      timeAgo: '1d' },
    { type: 'edition_read',   name: 'the news',    timeAgo: '1d' },
  ],

  verificationProgress: 6,
  verificationCriteria: [
    { emoji: '📚', labelKey: 'settings.verification.bookReading',    current: 0,   goal: 300,  goalDisplay: '5h',     progress: 0  },
    { emoji: '📰', labelKey: 'settings.verification.editionsRead',   current: 1,   goal: 21,   goalDisplay: '21',     progress: 5  },
    { emoji: '🏆', labelKey: 'settings.verification.streakRecord',   current: 2,   goal: 12,   goalDisplay: '12 dias', progress: 17 },
    { emoji: '✅', labelKey: 'settings.verification.habitsCompleted', current: 2,   goal: 50,   goalDisplay: '50',     progress: 4  },
    { emoji: '📱', labelKey: 'settings.verification.appOpens',       current: 3,   goal: 30,   goalDisplay: '30',     progress: 10 },
    { emoji: '🤝', labelKey: 'settings.verification.inviteFriends',  current: 0,   goal: 10,   goalDisplay: '10',     progress: 0  },
  ],

  performanceStreak: 1,
  performanceBooks: 1,
  performanceHabitsPercent: 0,

  todayHabits: [
    { emoji: '🍎', badge: 1 },
    { emoji: '❤️' },
    { emoji: '📖' },
    { emoji: '📰', badge: 1 },
    { emoji: '🌙' },
    { emoji: '⭐' },
  ],

  activityDaysCount: 1,

  books: [
    { title: 'Canção de Susannah', coverUrl: 'https://picsum.photos/seed/book-susannah/80/120' },
    { title: 'Dragon Ball',         coverUrl: null },
    { title: 'It a Coisa',          coverUrl: 'https://picsum.photos/seed/book-it/80/120' },
  ],

  engagementPoints: 360,
  engagementTrophies: 1,
}
