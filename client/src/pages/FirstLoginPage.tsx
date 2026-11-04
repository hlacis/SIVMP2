import { useState } from 'react'
import '../styles/FirstLoginPage.css'

const FirstLoginPage = () => {
    const [newPassword, setNewPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [error, setError] = useState('')

    // Validates the new password before continuing
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')

        if (newPassword.length < 12) {
            setError('The password must be at least 12 characters.')
            return
        }

        if (newPassword !== repeatPassword) {
            setError('The passwords do not match.')
            return
        }

        // Backend integration will be added later
        setError('The form is valid. Password saving is not connected yet.')
    }

    return (
        <main className="first-login-page">
            <section className="first-login-card">
                <h1>Choose a new password</h1>

                <p className="first-login-description">
                    An admin set a temporary password for you.
                    Pick your own before you continue.
                </p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="new-password">New password</label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={event => setNewPassword(event.target.value)}
                        placeholder="Enter new password"
                        minLength={12}
                        required
                    />

                    <p className="password-helper">
                        At least 12 characters.
                    </p>

                    <label htmlFor="repeat-password">
                        Repeat new password
                    </label>
                    <input
                        id="repeat-password"
                        type="password"
                        value={repeatPassword}
                        onChange={event => setRepeatPassword(event.target.value)}
                        placeholder="Repeat new password"
                        minLength={12}
                        required
                    />

                    {error && (
                        <p className="first-login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button type="submit" className="first-login-button">
                        Save new password
                    </button>
                </form>
            </section>
        </main>
    )
}

export default FirstLoginPage
