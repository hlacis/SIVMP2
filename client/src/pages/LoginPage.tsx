
import { useState } from 'react'
import '../styles/LoginPage.css'

function App() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        // We will connect this form to the backend later
        console.log('Login form submitted')
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

                    <button className="login-button" type="submit">
                        Log in
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
