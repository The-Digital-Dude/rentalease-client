import { useEffect, useRef } from "react";
import { useAppDispatch } from "../store/hooks";
import { fetchUnreadCount } from "../store/notificationSlice";

export const useNotificationPolling = (intervalMs: number = 30000) => {
  const dispatch = useAppDispatch();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial fetch
    dispatch(fetchUnreadCount());

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dispatch, intervalMs]);

  // Function to manually refresh (useful for immediate updates)
  const refreshUnreadCount = () => {
    dispatch(fetchUnreadCount());
  };

  return { refreshUnreadCount };
};
