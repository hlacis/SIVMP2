import { LockKeyhole } from 'lucide-react'
import type { User, UserRole } from '../types/User'

type UsersTableProps = {
    users: User[]
    role: UserRole
    onEdit: (user: User) => void
    onDelete: (user: User) => void
}

const UsersTable = ({ users, role, onEdit, onDelete }: UsersTableProps) => {
    return (
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
                {users.length > 0 ? (
                    users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.username}</td>
                            <td>
                                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                                        {user.role}
                                    </span>
                            </td>

                            {role !== 'User' && (
                                <td className="user-actions">
                                    {role === 'Admin' || user.role === 'User' ? (
                                        <>
                                            <button
                                                className="edit-button"
                                                onClick={() => onEdit(user)}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="delete-button"
                                                onClick={() => onDelete(user)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    ) : (
                                        <span
                                            className="restricted-action"
                                            title="Admin access required."
                                        >
                                                <LockKeyhole size={16} />
                                            </span>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td
                            colSpan={role === 'User' ? 3 : 4}
                            className="empty-message"
                        >
                            No users found.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    )
}

export default UsersTable
