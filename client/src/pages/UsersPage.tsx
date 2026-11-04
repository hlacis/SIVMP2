import { useState } from 'react'
import '../styles/UsersPage.css'
import AddUserModal from '../components/AddUserModal'
import EditUserModal from '../components/EditUserModal'
import type { User, UserRole } from '../types/User'
import UsersTable from '../components/UsersTable'

type UsersPageProps = {
    role: UserRole
    userName: string
    onLogout: () => void
}

// Temporary example data for the user overview
const exampleUsers: User[] = [
    { id: 1, name: 'Mette Kvist', username: 'kvist.mette', role: 'Admin' },
    { id: 2, name: 'Jonas Bjælke', username: 'bjaelke.jonas', role: 'Admin' },
    { id: 3, name: 'Sofie Lund', username: 'lund.sofie', role: 'Superuser' },
    { id: 4, name: 'Anders Holm', username: 'holm.anders', role: 'Superuser' },
    { id: 5, name: 'Camilla Nygaard', username: 'nygaard.camilla', role: 'User' },
    { id: 6, name: 'Peter Skov', username: 'skov.peter', role: 'User' },
    { id: 7, name: 'Ida Madsen', username: 'madsen.ida', role: 'User' }
]

const UsersPage = ({ role, userName, onLogout }: UsersPageProps) => {
    const [users, setUsers] = useState<User[]>(exampleUsers)
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

    // Adds a new user to the temporary frontend list
    const handleAddUser = () => {
        if (!newName.trim() || !newUsername.trim() || !newRole || !newPassword) {
            setFormError('Please fill in all required fields.')
            return
        }

        if (newPassword.length < 12) {
            setFormError('The temporary password must be at least 12 characters.')
            return
        }

        // Prevent duplicate usernames
        const usernameExists = users.some(
            user => user.username.toLowerCase() === newUsername.trim().toLowerCase()
        )

        if (usernameExists) {
            setFormError('This username already exists.')
            return
        }

        const newUser: User = {
            id: Math.max(0, ...users.map(user => user.id)) + 1,
            name: newName.trim(),
            username: newUsername.trim(),
            role: newRole
        }

        setUsers(currentUsers => [...currentUsers, newUser])

        // Reset the form after creating the user
        setNewName('')
        setNewUsername('')
        setNewPassword('')
        setNewRole('User')
        setFormError('')
        setIsAddUserOpen(false)
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

    // Saves changes to the selected user
    const handleSaveEditUser = () => {
        if (!selectedUser) return

        if (!editName.trim() || !editUsername.trim()) {
            setEditFormError('Please fill in all required fields.')
            return
        }

        // Prevent duplicate usernames belonging to another user
        const usernameExists = users.some(
            user =>
                user.id !== selectedUser.id &&
                user.username.toLowerCase() === editUsername.trim().toLowerCase()
        )

        if (usernameExists) {
            setEditFormError('This username already exists.')
            return
        }

        // Update the selected user in the temporary frontend list
        setUsers(currentUsers =>
            currentUsers.map(user =>
                user.id === selectedUser.id
                    ? {
                        ...user,
                        name: editName.trim(),
                        username: editUsername.trim(),
                        role: editRole
                    }
                    : user
            )
        )

        setIsEditUserOpen(false)
        setSelectedUser(null)
        setEditFormError('')
    }

    // Opens the delete confirmation modal
    const handleOpenDeleteUser = (user: User) => {
        setUserToDelete(user)
    }

    // Deletes the selected user after confirmation
    const handleConfirmDeleteUser = () => {
        if (!userToDelete) return

        setUsers(currentUsers =>
            currentUsers.filter(user => user.id !== userToDelete.id)
        )

        setUserToDelete(null)
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
                    <strong className="current-user-name">Mette Kvist</strong>

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
