import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL, api } from '../api/config';
import { extractApiErrorMessage } from '../utils/apiError';

export default function Account() {
  const { isLoggedIn, currentUser, updateCurrentUser, logout } = useAuth();
  const { darkMode } = useTheme();

  const [editName, setEditName] = useState(currentUser?.name ?? '');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isLoggedIn || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE_URL}${api.endpoints.users}/${currentUser.userId}`, {
        name: editName,
      });
      updateCurrentUser({ name: editName });
      setSuccessMsg('Name updated successfully.');
    } catch (err: unknown) {
      setErrorMsg(extractApiErrorMessage(err, 'Failed to update profile. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const labelCls = `block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`;
  const valueCls = `${darkMode ? 'text-light' : 'text-gray-800'} font-medium`;
  const cardCls = `${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 transition-colors duration-300`;

  return (
    <div
      className={`min-h-screen pt-20 ${darkMode ? 'bg-dark' : 'bg-gray-100'} px-4 py-8 transition-colors duration-300`}
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <h1
          className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'} transition-colors duration-300`}
        >
          My Account
        </h1>

        {/* Profile Info */}
        <div className={cardCls}>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-700'} mb-4`}>
            Account Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className={labelCls}>Email</dt>
              <dd className={valueCls}>{currentUser.email}</dd>
            </div>
            <div>
              <dt className={labelCls}>Role</dt>
              <dd>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                    currentUser.role === 'admin'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {currentUser.role}
                </span>
              </dd>
            </div>
            <div>
              <dt className={labelCls}>Member since</dt>
              <dd className={valueCls}>
                {new Date(currentUser.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Edit Name */}
        <div className={cardCls}>
          <h2 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-700'} mb-4`}>
            Update Display Name
          </h2>

          {successMsg && (
            <div className="bg-green-500/10 border border-green-500 text-green-600 rounded-md p-3 mb-4 text-sm">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-md p-3 mb-4 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className={`block ${darkMode ? 'text-light' : 'text-gray-700'} mb-2`}
              >
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full ${darkMode ? 'bg-gray-700 text-light' : 'bg-gray-100 text-gray-800'} rounded px-3 py-2 transition-colors duration-300`}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-primary hover:bg-accent text-white py-2 px-6 rounded transition-colors disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className={`${cardCls} border border-red-400/30`}>
          <h2 className="text-xl font-semibold text-red-500 mb-2">Sign Out</h2>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
            You will be signed out of your account on this device.
          </p>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
