
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

    const [isCheckingSession, setIsCheckingSession] =
        useState(true)

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'same-origin'
                })

                if (response.ok) {
                    const user: AuthenticatedUser =
                        await response.json()

                    setCurrentUser(user)
                }
            } catch (error) {
                console.error('Session check failed:', error)
            } finally {
                setIsCheckingSession(false)
            }
        }

        restoreSession()
    }, [])

    const handleLoginSuccess = (user: AuthenticatedUser) => {
        setCurrentUser(user)
    }
    const handleLogout = async () => {
        try {
            const csrfResponse = await fetch('/api/auth/csrf', {
                credentials: 'same-origin'
            })

            if (!csrfResponse.ok) {
                throw new Error('Could not obtain CSRF token.')
            }

            const { csrfToken } = await csrfResponse.json()

            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': csrfToken
                }
            })

            if (!response.ok) {
                throw new Error('Logout failed.')
            }

            setCurrentUser(null)
        } catch (error) {
            console.error('Logout failed:', error)
            alert('Could not log out. Please try again.')
        }
    }

    const currentRole: UserRole =
        currentUser?.roles.includes('Admin') ? 'Admin' :
            currentUser?.roles.includes('Superuser') ? 'Superuser' :
                'User'

    if (isCheckingSession) {
        return <p>Checking session...</p>
    }

    return (
        <>
            {currentUser ? (
                <UsersPage
                    role={currentRole}
                    userName={currentUser.userName}
                    onLogout={handleLogout}
                />
            ) : (
                <LoginPage onLoginSuccess={handleLoginSuccess} />
            )}
        </>
    )
}

export default App
