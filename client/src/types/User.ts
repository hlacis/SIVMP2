
export type UserRole = 'User' | 'Superuser' | 'Admin'

export type User = {
    id: string
    name: string
    username: string
    role: UserRole
}