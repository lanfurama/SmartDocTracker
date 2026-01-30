import React, { useState } from 'react';
import { Mail, Lock, User, PackageCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Tab = 'login' | 'register';

const AuthScreen: React.FC = () => {
    const { login, register, error, clearError } = useAuth();
    const [tab, setTab] = useState<Tab>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);

        if (!email.trim()) {
            setLocalError('Vui lòng nhập email.');
            return;
        }
        if (!password.trim()) {
            setLocalError('Vui lòng nhập mật khẩu.');
            return;
        }
        if (tab === 'register' && !name.trim()) {
            setLocalError('Vui lòng nhập họ tên.');
            return;
        }
        if (tab === 'register' && password.length < 8) {
            setLocalError('Mật khẩu phải có ít nhất 8 ký tự.');
            return;
        }

        setSubmitting(true);
        try {
            if (tab === 'login') {
                await login(email, password);
            } else {
                await register(email, password, name.trim());
            }
        } catch (e) {
            setLocalError(e instanceof Error ? e.message : 'Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const err = localError ?? error;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50/20 to-blue-50/30 p-4 relative overflow-hidden">
            {/* Subtle data-flow background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -inset-[50%] bg-gradient-to-br from-cyan-200/10 via-transparent to-blue-200/10 rotate-12 animate-bg-shimmer" />
                <div className="absolute -inset-[50%] bg-gradient-to-tr from-blue-200/10 via-transparent to-cyan-200/10 -rotate-12 animate-bg-shimmer" style={{ animationDelay: '2s' }} />
            </div>
            <div className="w-full max-w-sm relative z-10">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                        <PackageCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">DocTracker</h1>
                    <p className="text-slate-500 text-sm mt-1">Đăng nhập để sử dụng ứng dụng</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden">
                    <div className="flex border-b-2 border-slate-200">
                        <button
                            type="button"
                            onClick={() => { setTab('login'); clearError(); setLocalError(null); }}
                            className={`flex-1 py-3.5 text-sm font-semibold ${tab === 'login' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500'}`}
                        >
                            Đăng nhập
                        </button>
                        <button
                            type="button"
                            onClick={() => { setTab('register'); clearError(); setLocalError(null); }}
                            className={`flex-1 py-3.5 text-sm font-semibold ${tab === 'register' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-slate-500'}`}
                        >
                            Đăng ký
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {err && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">
                                {err}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@company.com"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {tab === 'register' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Họ tên</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nguyễn Văn A"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        autoComplete="name"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={tab === 'register' ? 'Ít nhất 8 ký tự' : '••••••••'}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <span className="btn-loading-dots flex items-center">
                                    <span /><span /><span />
                                </span>
                            ) : null}
                            {submitting ? 'Đang xử lý...' : tab === 'login' ? 'Đăng nhập' : 'Đăng ký'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;
