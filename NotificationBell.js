import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Assuming AuthContext path
import { notificationAPI } from '../../services/api'; // CORRECTED: Importing 'notificationAPI'

const NotificationBell = () => {
    const { user } = useAuth(); // Get user from AuthContext
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const fetchNotifications = useCallback(async () => {
        if (!user || !user.id) {
            // No user logged in or user ID not available, cannot fetch notifications
            setNotifications([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // CORRECTED: Using notificationAPI.getNotifications()
            const response = await notificationAPI.getNotifications(user.id); // Assuming API takes userId
            setNotifications(response.data.data); // Assuming response.data.data is an array of notifications
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err.response?.data?.message || 'Failed to fetch notifications.');
            setNotifications([]); // Clear notifications on error
        } finally {
            setLoading(false);
        }
    }, [user]); // Re-run when user changes

    useEffect(() => {
        fetchNotifications();
        // Optional: Set up an interval to poll for new notifications
        const interval = setInterval(fetchNotifications, 60000); // Poll every 60 seconds
        return () => clearInterval(interval); // Clean up interval on unmount
    }, [fetchNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            // CORRECTED: Using notificationAPI.markAsRead()
            await notificationAPI.markAsRead(notificationId);
            setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Error marking notification as read:', err);
            alert(err.response?.data?.message || 'Failed to mark notification as read.');
        }
    };

    const handleDeleteNotification = async (notificationId) => {
        try {
            // CORRECTED: Using notificationAPI.deleteNotification()
            await notificationAPI.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (err) {
            console.error('Error deleting notification:', err);
            alert(err.response?.data?.message || 'Failed to delete notification.');
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-20 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-200 text-lg font-semibold text-gray-800">
                        Notifications
                    </div>
                    {loading && <div className="p-4 text-center text-blue-500">Loading notifications...</div>}
                    {error && <div className="p-4 text-center text-red-500">{error}</div>}
                    {!loading && !error && notifications.length === 0 && (
                        <div className="p-4 text-center text-gray-600">No new notifications.</div>
                    )}
                    <ul className="max-h-60 overflow-y-auto">
                        {notifications.map(notification => (
                            <li
                                key={notification.id}
                                className={`flex items-center justify-between p-4 border-b border-gray-100 ${notification.isRead ? 'bg-gray-50' : 'bg-white font-medium'}`}
                            >
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">{notification.message}</p>
                                    <span className="text-xs text-gray-500">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className="text-blue-500 hover:text-blue-700 text-xs"
                                            title="Mark as Read"
                                        >
                                            Mark Read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDeleteNotification(notification.id)}
                                        className="text-red-500 hover:text-red-700 text-xs"
                                        title="Delete Notification"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
