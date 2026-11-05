import type { User, UserRole } from '../types/User'

type EditUserModalProps = {
    user: User
    role: UserRole
    isOpen: boolean
    editName: string
    editUsername: string
    editRole: UserRole
    formError: string
    setEditName: (value: string) => void
    setEditUsername: (value: string) => void
    setEditRole: (value: UserRole) => void
    onClose: () => void
    onSubmit: () => void
}

const EditUserModal = ({
                           user,
                           role,
                           isOpen,
                           editName,
                           editUsername,
                           editRole,
                           formError,
                           setEditName,
                           setEditUsername,
                           setEditRole,
                           onClose,
                           onSubmit
                       }: EditUserModalProps) => {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="user-modal"
                onClick={event => event.stopPropagation()}
            >
                <div className="modal-header">
                    <div>
                        <h2>Edit user</h2>
                        <p>Update the details for {user.name}.</p>
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
                    <label htmlFor="edit-name">Full name</label>
                    <input
                        id="edit-name"
                        type="text"
                        value={editName}
                        onChange={event => setEditName(event.target.value)}
                        placeholder="Enter full name"
                        required
                    />

                    <label htmlFor="edit-username">Username</label>
                    <input
                        id="edit-username"
                        type="text"
                        value={editUsername}
                        onChange={event => setEditUsername(event.target.value)}
                        placeholder="Enter username"
                        required
                    />

                    <label htmlFor="edit-role">Role</label>
                    {role === 'Admin' ? (
                        <select
                            id="edit-role"
                            value={editRole}
                            onChange={event =>
                                setEditRole(event.target.value as UserRole)
                            }
                            required
                        >
                            <option value="User">User</option>
                            <option value="Superuser">Superuser</option>
                            <option value="Admin">Admin</option>
                        </select>
                    ) : (
                        <>
                            <div className="role-locked-field">
                                <span>{editRole}</span>
                                <span aria-hidden="true">🔒</span>
                            </div>

                            <p className="modal-helper-text">
                                Contact an Admin to change this user's role.
                            </p>
                        </>
                    )}

                    {user.role === 'Admin' && (
                        <p className="modal-helper-text">
                            Admin roles cannot be changed here.
                        </p>
                    )}

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
                            Save changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditUserModal
