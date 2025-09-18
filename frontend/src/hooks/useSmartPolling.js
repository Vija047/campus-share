import { useCallback, useEffect, useRef } from 'react';

export const useSmartPolling = (fetchFunction, options = {}) => {
    const {
        interval = 90000, // Default 90 seconds (increased from 30)
        maxInterval = 600000, // Max 10 minutes (increased from 5)
        backoffMultiplier = 2, // More aggressive backoff
        enabled = true,
        dependencies = []
    } = options;

    const pollingRef = useRef(null);
    const currentIntervalRef = useRef(interval);
    const consecutiveErrorsRef = useRef(0);
    const isActiveRef = useRef(true);

    // Check if the tab/window is active
    useEffect(() => {
        const handleVisibilityChange = () => {
            isActiveRef.current = !document.hidden;
            if (isActiveRef.current && enabled) {
                // Tab became active, restart polling immediately
                startPolling(true);
            } else {
                // Tab became inactive, stop polling
                stopPolling();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled]);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const startPolling = useCallback(async (immediate = false) => {
        stopPolling();

        if (!enabled || !isActiveRef.current) {
            return;
        }

        const poll = async () => {
            try {
                await fetchFunction();

                // Reset on success
                consecutiveErrorsRef.current = 0;
                currentIntervalRef.current = interval;

                // Schedule next poll
                if (enabled && isActiveRef.current) {
                    pollingRef.current = setTimeout(poll, currentIntervalRef.current);
                }
            } catch (error) {
                console.warn('Polling error:', error);
                consecutiveErrorsRef.current += 1;

                // Implement exponential backoff on errors
                if (consecutiveErrorsRef.current > 1) {
                    currentIntervalRef.current = Math.min(
                        currentIntervalRef.current * backoffMultiplier,
                        maxInterval
                    );
                }

                // Don't retry immediately for rate limit errors
                const isRateLimited = error.response?.status === 429;
                const retryDelay = isRateLimited ? 300000 : currentIntervalRef.current; // 5 minutes for rate limits

                // Schedule retry
                if (enabled && isActiveRef.current) {
                    pollingRef.current = setTimeout(poll, retryDelay);
                }
            }
        };

        if (immediate) {
            poll();
        } else {
            pollingRef.current = setTimeout(poll, currentIntervalRef.current);
        }
    }, [fetchFunction, enabled, interval, maxInterval, backoffMultiplier, stopPolling]);

    // Start/stop polling based on dependencies
    useEffect(() => {
        if (enabled && isActiveRef.current) {
            startPolling();
        } else {
            stopPolling();
        }

        return stopPolling;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, startPolling, stopPolling, JSON.stringify(dependencies)]);

    return {
        startPolling,
        stopPolling,
        forceRefresh: () => startPolling(true)
    };
};