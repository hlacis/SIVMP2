import { useEffect, useState } from 'react'
import '../styles/UsersPage.css'
import AddUserModal from '../components/AddUserModal'
import EditUserModal from '../components/EditUserModal'
import type { User, UserRole } from '../types/User'
import UsersTable from '../components/UsersTable'

type UsersPageProps = {
    role: UserRole
    userName: string
    accessToken: string
    onLogout: () => void
}

const UsersPage = ({role, userName, accessToken, onLogout}: UsersPageProps) => {
    const [users, setUsers] = useState<User[]>([])
    const [loadError, setLoadError] = useState('')
    const [deleteError, setDeleteError] = useState('')

    const api = async (path: string, options: RequestInit = {}) => {
        const response = await fetch(path, {
            ...options,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                ...(options.body ? { 'Content-Type': 'application/json' } : {})
            }
        })
        if (!response.ok) {
            const body = await response.json().catch(() => ({}))
            throw new Error(body.message || body.title ||
                (body.errors ? JSON.stringify(body.errors) : `Request failed (${response.status})`))
        }
        return response
    }

    const refreshUsers = async () => {
        const response = await api('/api/Users?page=1&pageSize=100')

        const data: {
            users: {
                id: string
                userName: string
                fullName: string | null
                roles: string[]
            }[]
        } = await response.json()

        setUsers(data.users.map(user => ({
            id: user.id,
            name: user.fullName ?? user.userName,
            username: user.userName,
            role: user.roles.includes('Admin') ? 'Admin' :
                user.roles.includes('Superuser') ? 'Superuser' : 'User'
        })))
    }

    useEffect(() => {
        void refreshUsers().catch(error => setLoadError(error.message))
    }, [accessToken])
    const [search, setSearch] = useState('')
    const [selectedRole, setSelectedRole] = useState('All')

    // Controls whether the Add user modal is open
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)

    // Stores the new user's form values
    const [newName, setNewName] = useState('')
    const [newUsername, setNewUsername] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [newRole, setNewRole] = useState<UserRole>('User')

    // Stores validation messages
    const [formError, setFormError] = useState('')

    // Controls the Edit user modal
    const [isEditUserOpen, setIsEditUserOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // Stores the selected user's editable values
    const [editName, setEditName] = useState('')
    const [editUsername, setEditUsername] = useState('')
    const [editRole, setEditRole] = useState<UserRole>('User')
    const [editFormError, setEditFormError] = useState('')

    // Controls the delete confirmation modal
    const [userToDelete, setUserToDelete] = useState<User | null>(null)

    // Filter users by name, username and selected role
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.username.toLowerCase().includes(search.toLowerCase())

        const matchesRole =
            selectedRole === 'All' || user.role === selectedRole

        return matchesSearch && matchesRole
    })

    // Create the account in SQL Server, then refresh the table.
    const handleAddUser = async () => {
        if (!newName.trim() || !newUsername.trim() || !newPassword) {
            setFormError('Please fill in all required fields.')
            return
        }
        if (newPassword.length < 12) {
            setFormError('The temporary password must be at least 12 characters.')
            return
        }
        if (role !== 'Admin' && newRole !== 'User') {
            setFormError('Only Admins can assign privileged roles.')
            return
        }

        setFormError('')
        try {
            const response = await api('/api/Users', {
                method: 'POST',
                body: JSON.stringify({
                    userName: newUsername.trim(),
                    fullName: newName.trim(),
                    password: newPassword
                })
            })
            const created: { id: string } = await response.json()
            if (newRole !== 'User') {
                try {
                    await api(`/api/Users/${created.id}/role`, {
                        method: 'PUT',
                        body: JSON.stringify({ role: newRole })
                    })
                } catch (error) {
                    await refreshUsers()
                    setFormError(`Account created as User, but role assignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
                    return
                }
            }
            await refreshUsers()
            setNewName('')
            setNewUsername('')
            setNewPassword('')
            setNewRole('User')
            setIsAddUserOpen(false)
        } catch (error) {
            setFormError(error instanceof Error ? error.message : 'Could not create user.')
        }
    }

    // Opens the Edit user modal with the selected user's current details
    const handleOpenEditUser = (user: User) => {
        setSelectedUser(user)
        setEditName(user.name)
        setEditUsername(user.username)
        setEditRole(user.role)
        setEditFormError('')
        setIsEditUserOpen(true)
    }

    // Update the account through the API.
    const handleSaveEditUser = async () => {
        if (!selectedUser) return
        if (!editName.trim() || !editUsername.trim()) {
            setEditFormError('Please fill in all required fields.')
            return
        }
        if (role !== 'Admin' && editRole !== selectedUser.role) {
            setEditFormError('Only Admins can change roles.')
            return
        }
        setEditFormError('')
        try {
            if (
                editUsername.trim() !== selectedUser.username ||
                editName.trim() !== selectedUser.name
            ) {
                await api(`/api/Users/${selectedUser.id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        userName: editUsername.trim(),
                        fullName: editName.trim()
                    })
                })
            }
            if (editRole !== selectedUser.role) {
                await api(`/api/Users/${selectedUser.id}/role`, {
                    method: 'PUT',
                    body: JSON.stringify({ role: editRole })
                })
            }
            await refreshUsers()
            setIsEditUserOpen(false)
            setSelectedUser(null)
        } catch (error) {
            setEditFormError(error instanceof Error ? error.message : 'Could not update user.')
            await refreshUsers().catch(() => {})
        }
    }

    // Opens the delete confirmation modal
    const handleOpenDeleteUser = (user: User) => {
        setUserToDelete(user)
    }

    // Delete from SQL Server, not just React state.
    const handleConfirmDeleteUser = async () => {
        if (!userToDelete) return
        setDeleteError('')
        try {
            await api(`/api/Users/${userToDelete.id}`, { method: 'DELETE' })
            setUserToDelete(null)
            await refreshUsers()
        } catch (error) {
            setDeleteError(error instanceof Error ? error.message : 'Could not delete user.')
        }
    }

    return (
        <main className="users-page">
            <header className="users-header">
                <div className="brand">
                    <div className="brand-logo" aria-hidden="true">
                        <svg
                            viewBox="0 0 24 24"
                            width="28"
                            height="28"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 4C11 4 5 7 5 14c0 3 2 5 5 5 7 0 10-6 10-15Z" />
                            <path d="M4 21c3-5 7-8 12-11" />
                        </svg>
                    </div>

                    <div>
                        <h1>Kvist &amp; Bjælke</h1>
                        <p>User management</p>
                    </div>
                </div>

                <div className="current-user">
                    <strong className="current-user-name">{userName}</strong>

                    <span className="current-user-role">{role}</span>

                    <button
                        className="logout-button"
                        type="button"
                        onClick={onLogout}
                    >
                        Log out
                    </button>
                </div>
            </header>

            <section className="users-content">
                <div className="page-heading">
                    <div>
                        <h2>User management</h2>
                        <p>
                            {role === 'Admin'
                                ? 'Manage users, superusers and admins'
                                : role === 'Superuser'
                                    ? 'Manage regular users'
                                    : 'User overview'}
                        </p>
                    </div>

                    {/* Only Admin and Superuser can add users */}
                    {role !== 'User' && (
                        <button
                            className="add-user-button"
                            type="button"
                            onClick={() => {
                                setFormError('')
                                setIsAddUserOpen(true)
                            }}
                        >
                            Add user
                        </button>
                    )}
                </div>

                <div className="users-toolbar">
                    <div className="role-filters" aria-label="Filter users by role">
                        {['All', 'User', 'Superuser', 'Admin'].map(role => (
                            <button
                                key={role}
                                type="button"
                                className={`role-filter ${selectedRole === role ? 'active' : ''}`}
                                onClick={() => setSelectedRole(role)}
                            >
                                {role === 'All' ? 'All users' : `${role}s`}
                            </button>
                        ))}
                    </div>

                    <input
                        className="user-search"
                        type="search"
                        placeholder="Search by name or username..."
                        aria-label="Search users"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                    />
                </div>

                {loadError && <p role="alert">{loadError}</p>}
                <UsersTable
                    users={filteredUsers}
                    role={role}
                    onEdit={handleOpenEditUser}
                    onDelete={handleOpenDeleteUser}
                />

                <p className="users-count">
                    Showing {filteredUsers.length} of {users.length} users
                </p>
            </section>

            <AddUserModal
                role={role}
                isOpen={isAddUserOpen}
                newName={newName}
                newUsername={newUsername}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                newRole={newRole}
                formError={formError}
                setNewName={setNewName}
                setNewUsername={setNewUsername}
                setNewRole={setNewRole}
                setFormError={setFormError}
                onClose={() => setIsAddUserOpen(false)}
                onSubmit={handleAddUser}
            />
            {userToDelete && (
                <div
                    className="modal-overlay"
                    onClick={() => setUserToDelete(null)}
                >
                    <div
                        className="user-modal"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>
                                <h2>Delete user?</h2>
                                <p>
                                    Are you sure you want to delete {userToDelete.name}?
                                    This action cannot be undone.
                                </p>
                            </div>

                            <button
                                className="modal-close-button"
                                type="button"
                                onClick={() => setUserToDelete(null)}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        {deleteError && <p role="alert">{deleteError}</p>}
                        <div className="modal-actions">
                            <button
                                className="cancel-button"
                                type="button"
                                onClick={() => setUserToDelete(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="delete-button"
                                type="button"
                                onClick={handleConfirmDeleteUser}
                            >
                                Delete user
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUser && (
                <EditUserModal
                    user={selectedUser}
                    role={role}
                    isOpen={isEditUserOpen}
                    editName={editName}
                    editUsername={editUsername}
                    editRole={editRole}
                    formError={editFormError}
                    setEditName={setEditName}
                    setEditUsername={setEditUsername}
                    setEditRole={setEditRole}
                    setFormError={setEditFormError}
                    onClose={() => {
                        setIsEditUserOpen(false)
                        setSelectedUser(null)
                    }}
                    onSubmit={handleSaveEditUser}
                />
            )}
        </main>
    )
}
export default UsersPage