export type User = {
  id: string
  name: string
  username: string
  email: string
  avatarUrl: string
  plan: 'free' | 'premium'
  joinedAt: string
  streakCurrent: number
  streakLongest: number
  editionsRead: number
  bestHabit: string
}

export const mockUser: User = {
  id: 'u_01',
  name: 'Allan Olveira',
  username: '@allanolveira',
  email: 'allebeira@gmail.com',
  avatarUrl: 'https://picsum.photos/seed/thenews-user/200/200',
  plan: 'premium',
  joinedAt: '2024-01-15',
  streakCurrent: 47,
  streakLongest: 112,
  editionsRead: 284,
  bestHabit: 'edition',
}
