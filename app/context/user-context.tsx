import { createContext, use } from 'react'
import { mockUser, type User } from '~/data/user'

const UserContext = createContext<User>(mockUser)

export function UserProvider({ children }: { children: React.ReactNode }) {
  return (
    <UserContext value={mockUser}>
      {children}
    </UserContext>
  )
}

export const useUser = () => use(UserContext)
