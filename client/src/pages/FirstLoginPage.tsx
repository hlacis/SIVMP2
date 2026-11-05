
import { useState } from 'react'
import '../styles/FirstLoginPage.css'

type FirstLoginPageProps = {
    accessToken: string
    onPasswordChanged: () => void
}

const FirstLoginPage = ({
                            accessToken,
                            onPasswordChanged
                        }: FirstLoginPageProps) => {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [repeatPassword, setRepeatPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword: repeatPassword
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(
                    data.message ||
                    (data.errors
                        ? data.errors.join(', ')
                        : 'Password change failed.')
                )
            }

            onPasswordChanged()
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not change password.'
            )
        } finally {
            setIsLoading(false)
        }
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
                    <label htmlFor="current-password">
                        Temporary password
                    </label>
                    <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={event => setCurrentPassword(event.target.value)}
                        placeholder="Enter temporary password"
                        autoComplete="current-password"
                        required
                    />

                    <label htmlFor="new-password">
                        New password
                    </label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={event => setNewPassword(event.target.value)}
                        placeholder="Enter new password"
                        autoComplete="new-password"
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
                        autoComplete="new-password"
                        minLength={12}
                        required
                    />

                    {error && (
                        <p className="first-login-error" role="alert">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="first-login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save new password'}
                    </button>
                </form>
            </section>
        </main>
    )
}

export default FirstLoginPage
