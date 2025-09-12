import React, { createContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService.js';
import socketService from '../services/socketService.js';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Actions
const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGOUT: 'LOGOUT',
    UPDATE_USER: 'UPDATE_USER',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
                error: null,
            };

        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };

        case AUTH_ACTIONS.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
                error: null,
            };

        case AUTH_ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false,
            };

        case AUTH_ACTIONS.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Check if user is authenticated on app load
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = authService.getStoredUser();

            if (token && storedUser) {
                try {
                    // Verify token with backend
                    const response = await authService.getCurrentUser();
                    if (response.success) {
                        dispatch({
                            type: AUTH_ACTIONS.LOGIN_SUCCESS,
                            payload: response.data.user,
                        });

                        // Connect to socket
                        socketService.connect(token);
                    } else {
                        // Invalid token, clear storage
                        authService.logout();
                        dispatch({ type: AUTH_ACTIONS.LOGOUT });
                    }
                } catch (error) {
                    // Token might be expired or invalid
                    authService.logout();
                    dispatch({ type: AUTH_ACTIONS.LOGOUT });
                }
            } else {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
            }
        };

        initializeAuth();
    }, []);

    // Login function
    const login = async (credentials) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            const response = await authService.login(credentials);

            if (response.success) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: response.data.user,
                });

                // Connect to socket
                socketService.connect(response.data.token);

                toast.success('Login successful!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

            const response = await authService.register(userData);

            if (response.success) {
                dispatch({
                    type: AUTH_ACTIONS.LOGIN_SUCCESS,
                    payload: response.data.user,
                });

                // Connect to socket
                socketService.connect(response.data.token);

                toast.success('Registration successful!');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: message });
            return { success: false, message };
        }
    };

    // Logout function
    const logout = () => {
        authService.logout();
        socketService.disconnect();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        toast.success('Logged out successfully');
    };

    // Update profile function
    const updateProfile = async (profileData) => {
        try {
            const response = await authService.updateProfile(profileData);

            if (response.success) {
                dispatch({
                    type: AUTH_ACTIONS.UPDATE_USER,
                    payload: response.data.user,
                });

                toast.success('Profile updated successfully');
                return { success: true };
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    // Clear error function
    const clearError = () => {
        dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
