type UserRole = 'User' | 'Superuser' | 'Admin'

type AddUserModalProps = {
    role: UserRole
    isOpen: boolean
    newName: string
    newUsername: string
    newRole: UserRole
    formError: string
    setNewName: (value: string) => void
    setNewUsername: (value: string) => void
    setNewRole: (value: UserRole) => void
    onClose: () => void
    onSubmit: () => void
    newPassword: string
    setNewPassword: (value: string) => void
}
const AddUserModal = ({
                          role,
                          isOpen,
                          newName,
                          newUsername,
                          newRole,
                          formError,
                          setNewName,
                          setNewUsername,
                          setNewRole,
                          onClose,
                          onSubmit,
                          newPassword,
                          setNewPassword,
    
                      }: AddUserModalProps) => {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="user-modal"
                onClick={event => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2>Add user</h2>
                        <p>Create a new account for an employee.</p>
                    </div>

                    <button
                        className="modal-close-button"
                        type="button"
                        onClick={onClose}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                <form
                    onSubmit={event => {
                        event.preventDefault()
                        onSubmit()
                    }}
                >
                    <label htmlFor="new-name">Full name</label>
                    <input
                        id="new-name"
                        type="text"
                        value={newName}
                        onChange={event => setNewName(event.target.value)}
                        placeholder="Enter full name"
                        required
                    />

                    <label htmlFor="new-username">Username</label>
                    <input
                        id="new-username"
                        type="text"
                        value={newUsername}
                        onChange={event => setNewUsername(event.target.value)}
                        placeholder="Enter username"
                        required
                    />

                    <label htmlFor="new-role">Role</label>
                    <select
                        id="new-role"
                        value={newRole}
                        onChange={event =>
                            setNewRole(event.target.value as UserRole)
                        }
                        required
                    >
                        <option value="User">User</option>

                        {role === 'Admin' && (
                            <>
                                <option value="Superuser">Superuser</option>
                                <option value="Admin">Admin</option>
                            </>
                        )}
                    </select>

                    <label htmlFor="new-password">Temporary password</label>
                    <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={event => setNewPassword(event.target.value)}
                        placeholder="Enter temporary password"
                        minLength={12}
                        required
                    />

                    <p className="modal-helper-text">
                        At least 12 characters. The user must change this password at first login.
                    </p>

                    {formError && (
                        <p className="form-error">{formError}</p>
                    )}

                    <div className="modal-actions">
                        <button
                            className="cancel-button"
                            type="button"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button className="save-button" type="submit">
                            Create user
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddUserModal
