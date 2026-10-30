
import { useState } from 'react'
import '../styles/UsersPage.css'
import { LockKeyhole } from 'lucide-react'

type UserRole = 'User' | 'Superuser' | 'Admin'

type User = {
    id: number
    name: string
    username: string
    role: UserRole
}
type UsersPageProps = {
    role: UserRole
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

const UsersPage = ({ role }: UsersPageProps) => {
    const [users] = useState<User[]>(exampleUsers)
    const [search, setSearch] = useState('')
    const [selectedRole, setSelectedRole] = useState('All')

    // Filter users by name, username and selected role
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.username.toLowerCase().includes(search.toLowerCase())

        const matchesRole =
            selectedRole === 'All' || user.role === selectedRole

        return matchesSearch && matchesRole
    })

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

                    <button className="logout-button" type="button">
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
                        <button className="add-user-button" type="button">
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

                <div className="users-table-wrapper">
                    <table className="users-table">
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Role</th>
                            {role !== 'User' && <th>Actions</th>}
                        </tr>
                        </thead>


                        <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.name}</td>
                                <td className="username-cell">{user.username}</td>
                                <td>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                </span>
                                </td>

                                {/* Only show the Actions column for Admin and Superuser */}
                                {role !== 'User' && (
                                    <td>
                                        <div className="user-actions">
                                            {/* Admin can manage all users */}
                                            {role === 'Admin' && (
                                                <>
                                                    <button type="button" className="edit-button">
                                                        Edit
                                                    </button>
                                                    <button type="button" className="delete-button">
                                                        Delete
                                                    </button>
                                                </>
                                            )}

                                            {/* Superuser can manage regular users only */}
                                            {role === 'Superuser' && user.role === 'User' && (
                                                <>
                                                    <button type="button" className="edit-button">
                                                        Edit
                                                    </button>
                                                    <button type="button" className="delete-button">
                                                        Delete
                                                    </button>
                                                </>
                                            )}

                                            {/* Admin access is required to manage privileged accounts */}
                                            {role === 'Superuser' && user.role !== 'User' && (
                                                <span
                                                    className="locked-action"
                                                    title="Admin access required."
                                                    aria-label="Admin access required"
                                                >
                                <LockKeyhole size={16} />
                            </span>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}

                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={role === 'User' ? 3 : 4} className="empty-message">
                                    No users found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <p className="users-count">
                    Showing {filteredUsers.length} of {users.length} users
                </p>
            </section>
        </main>
    )
}
export default UsersPage
