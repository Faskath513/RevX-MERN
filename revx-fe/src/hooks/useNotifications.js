import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth'; // Make sure this path is correct

export const useNotificationCount = () => {
  const { user } = useAuth(); // Now properly imported
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.token) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        setUnreadCount(response.data.count || 0);
        setError(null);
      } catch (err) {
        console.error("Error fetching unread count:", err);
        setError(err.message);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, [user]); // Re-run when user changes

  return { unreadCount, error };
};