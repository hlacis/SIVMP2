
import { useState } from 'react'
import '../styles/LoginPage.css'

type AuthenticatedUser = {
    id: string
    userName: string
    email: string | null
    roles: string[]
}

type LoginPageProps = {
    onLoginSuccess: (user: AuthenticatedUser) => void
}

function App({ onLoginSuccess }: LoginPageProps) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loginError, setLoginError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        setLoginError('')
        setIsLoading(true)

        try {
            // Step 1: Obtain the CSRF token
            const csrfResponse = await fetch('/api/auth/csrf', {
                credentials: 'same-origin'
            })

            if (!csrfResponse.ok) {
                throw new Error('Could not initialize secure login.')
            }

            const { csrfToken } = await csrfResponse.json()

            // Step 2: Send credentials to ASP.NET Core
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    userName: username,
                    password: password
                })
            })

            if (!loginResponse.ok) {
                if (loginResponse.status === 401) {
                    throw new Error('Invalid username or password.')
                }

                throw new Error('Login failed. Please try again.')
            }

            const user: AuthenticatedUser = await loginResponse.json()

            onLoginSuccess(user)
        } catch (error) {
            setLoginError(
                error instanceof Error ? error.message : 'Something went wrong.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <div className="login-brand">

                    <div className="brand-logo">
                        <svg
                            viewBox="0 0 24 24"
                            width="30"
                            height="30"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M20 4C11 4 5 7 5 14c0 3 2 5 5 5 7 0 10-6 10-15Z" />
                            <path d="M4 21c3-5 7-8 12-11" />
                        </svg>
                    </div>

                    <h1>Kvist & Bjælke</h1>
                    <p>Secure access to your account</p>
                </div>

                <div className="login-heading">
                    <h2>Welcome back</h2>
                    <p>Please enter your login details below.</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={event => setUsername(event.target.value)}
                            placeholder="Enter your username"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />

                        <button
                            className="password-toggle"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide password' : 'Show password'}
                        </button>
                    </div>

                    {loginError && (
                        <p role="alert" style={{ color: '#dc2626', marginBottom: '12px' }}>
                            {loginError}
                        </p>
                    )}

                    <button
                        className="login-button"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Log in'}
                    </button>
                </form>

                <p className="login-footer">
                    Secure access for authorised employees
                </p>
            </section>
        </main>
    )
}

export default App
