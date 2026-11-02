export type UserRole = 'User' | 'Superuser' | 'Admin'

export type User = {
    id: number
    name: string
    username: string
    role: UserRole
}
