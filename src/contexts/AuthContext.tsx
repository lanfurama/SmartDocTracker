import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiClient, type AuthUser } from '../infrastructure/api/apiClient';

const AUTH_TOKEN_KEY = 'auth_token';

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    updateProfile: (name: string) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setTokenState] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(AUTH_TOKEN_KEY);
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setToken = useCallback((newToken: string | null) => {
        setTokenState(newToken);
        apiClient.setToken(newToken);
        if (typeof window !== 'undefined') {
            if (newToken) localStorage.setItem(AUTH_TOKEN_KEY, newToken);
            else localStorage.removeItem(AUTH_TOKEN_KEY);
        }
    }, []);

    const loadUser = useCallback(async () => {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
        if (!stored) {
            setLoading(false);
            return;
        }
        apiClient.setToken(stored);
        setTokenState(stored);
        try {
            const res = await apiClient.getMe();
            const u = res.user;
            setUser({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                createdAt: u.createdAt ?? u.created_at,
            });
        } catch {
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, [setToken]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        setLoading(true);
        try {
            const res = await apiClient.login(email, password);
            setToken(res.token);
            setUser(res.user);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Đăng nhập thất bại';
            setError(msg);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [setToken]);

    const register = useCallback(async (email: string, password: string, name: string) => {
        setError(null);
        setLoading(true);
        try {
            const res = await apiClient.register(email, password, name);
            setToken(res.token);
            setUser(res.user);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Đăng ký thất bại';
            setError(msg);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [setToken]);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        setError(null);
    }, [setToken]);

    const clearError = useCallback(() => setError(null), []);

    const updateProfile = useCallback(async (name: string) => {
        setError(null);
        try {
            const res = await apiClient.updateProfile(name);
            const u = res.user;
            setUser({
                id: u.id,
                email: u.email,
                name: u.name,
                role: u.role,
                createdAt: u.createdAt ?? u.created_at,
            });
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Cập nhật thất bại';
            setError(msg);
            throw e;
        }
    }, []);

    const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
        setError(null);
        try {
            await apiClient.changePassword(currentPassword, newPassword);
        } catch (e) {
            const msg = e instanceof Error ? e.message : 'Đổi mật khẩu thất bại';
            setError(msg);
            throw e;
        }
    }, []);

    const value: AuthContextValue = {
        user,
        token,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
        updateProfile,
        changePassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
