import { create } from 'zustand'
import type { User } from '../types'

interface UserState {
  user: User | null
  token: string | null
  isLoggedIn: boolean
}

interface UserActions {
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  logout: () => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>((set) => ({
  // Initial state
  user: null,
  token: null,
  isLoggedIn: false,

  // Actions
  setUser: (user) =>
    set({
      user,
      isLoggedIn: user !== null,
    }),

  setToken: (token) => set({ token }),

  logout: () =>
    set({
      user: null,
      token: null,
      isLoggedIn: false,
    }),
}))
