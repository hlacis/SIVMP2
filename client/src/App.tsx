
import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import UsersPage from './pages/UsersPage'

type UserRole = 'Admin' | 'Superuser' | 'User'

function App() {
    const [currentPage, setCurrentPage] = useState<'login' | 'users'>('login')
    const [currentRole, setCurrentRole] = useState<UserRole>('Admin')

    return (
        <>
            {currentPage === 'login' ? (
                <LoginPage />
            ) : (
                <UsersPage role={currentRole} />
            )}

            {/* Temporary navigation for development */}
            <nav className="page-switcher">
                <button onClick={() => setCurrentPage('login')}>
                    Login page
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
