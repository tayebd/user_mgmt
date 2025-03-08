import React, { useState, useEffect } from 'react';
import { useApiStore } from '@/state/api';
import { User } from '@/types';

const UserManagement = () => {
  const { users, fetchUsers, createUser, updateUser, deleteUser } = useApiStore();
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const handleCreateUser = async () => {
    await createUser(newUser);
    setNewUser({});
  };

  const handleUpdateUser = async (user: User) => {
    if (!user.id) {
      throw new Error('User ID is required');
    }
    await updateUser(user.id, user);
    setEditingUser(null);
  };

  const handleDeleteUser = async (userId: number | undefined) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    await deleteUser(userId);
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div>
      <h1>User Management</h1>
      <div>
        <h2>Create User</h2>
        <input
          type="text"
          placeholder="Email"
          value={newUser.email || ''}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Name"
          value={newUser.name || ''}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
        />
        <button onClick={handleCreateUser}>Create User</button>
      </div>
      <div>
        <h2>User List</h2>
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              {user.name} ({user.email})
              <button onClick={() => setEditingUser(user)}>Edit</button>
              <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      {editingUser && (
        <div>
          <h2>Edit User</h2>
          <input
            type="text"
            placeholder="Email"
            value={editingUser.email || ''}
            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Name"
            value={editingUser.name || ''}
            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
          />
          <button onClick={() => handleUpdateUser(editingUser as User)}>Update User</button>
          <button onClick={() => setEditingUser(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
