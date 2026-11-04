
import { useEffect, useState } from 'react'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'

type UserRole = 'Admin' | 'Superuser' | 'User'

type AuthenticatedUser = {
    id: string
    userName: string
    email: string | null
    roles: string[]
}

function App() {
    const [currentUser, setCurrentUser] =
        useState<AuthenticatedUser | null>(null)

    const [accessToken, setAccessToken] =
        useState<string | null>(null)

    const handleLoginSuccess = (
        user: AuthenticatedUser,
        token: string
    ) => {
        setAccessToken(token)
        setCurrentUser(user)
    }

    const handleLogout = () => {
        setAccessToken(null)
        setCurrentUser(null)
    }

    // Automatically log out when the JWT expires.
    useEffect(() => {
        if (!accessToken) return

        const payloadPart = accessToken.split('.')[1]

        if (!payloadPart) {
            handleLogout()
            return
        }

        try {
            const base64 = payloadPart
                .replace(/-/g, '+')
                .replace(/_/g, '/')

            const payload = JSON.parse(atob(base64))
            const expiresAt = payload.exp * 1000
            const remainingTime = expiresAt - Date.now()

            if (!Number.isFinite(remainingTime) || remainingTime <= 0) {
                handleLogout()
                return
            }

            const timeout = window.setTimeout(
                handleLogout,
                Math.min(remainingTime, 2147483647)
            )

            return () => window.clearTimeout(timeout)
        } catch {
            handleLogout()
        }
    }, [accessToken])

    const currentRole: UserRole =
        currentUser?.roles.includes('Admin') ? 'Admin' :
            currentUser?.roles.includes('Superuser') ? 'Superuser' :
                'User'

    return (
        <>
            {currentUser && accessToken ? (
                <UsersPage
                    role={currentRole}
                    userName={currentUser.userName}
                    accessToken={accessToken}
                    onLogout={handleLogout}
                />
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            )}
        </>
    )
}

export default App
