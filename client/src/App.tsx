
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'
import FirstLoginPage from './pages/FirstLoginPage'

type UserRole = 'Admin' | 'Superuser' | 'User'

type Page = 'login' | 'users' | 'firstLogin'

function App() {
    const [currentPage, setCurrentPage] = useState<Page>('login')
    const [currentRole, setCurrentRole] = useState<UserRole>('Admin')
    // Logs out the current user and returns to the login page
    const handleLogout = () => {
        setCurrentPage('login')
        setCurrentRole('User')
    }

    return (
        <>
            {currentPage === 'login' ? (
                <LoginPage
                    onLoginSuccess={() => setCurrentPage('users')}
                />
            ) : currentPage === 'firstLogin' ? (
                <FirstLoginPage />
            ) : (
                <UsersPage
                    role={currentRole}
                    onLogout={handleLogout}
                />
            )}

            {/* Temporary navigation for development */}
            <nav className="page-switcher">
                <button onClick={() => setCurrentPage('login')}>
                    Login page
                </button>

                <button onClick={() => setCurrentPage('firstLogin')}>
                    First login page
                </button>

                <button onClick={() => setCurrentPage('users')}>
                    Users page
                </button>

                <button onClick={() => setCurrentRole('Admin')}>
                    Admin
                </button>

                <button onClick={() => setCurrentRole('Superuser')}>
                    Superuser
                </button>

                <button onClick={() => setCurrentRole('User')}>
                    User
                </button>
            </nav>
        </>
    )
}

export default App
