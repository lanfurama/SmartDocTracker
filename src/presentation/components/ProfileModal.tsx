import React, { useState, useRef, useEffect } from 'react';
import { X, User, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileModalProps {
    onClose: () => void;
}

type Section = 'profile' | 'password';

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
    const { user, updateProfile, changePassword, error, clearError } = useAuth();
    const [section, setSection] = useState<Section>('profile');

    // Profile form
    const [name, setName] = useState(user?.name ?? '');
    const [profileSubmitting, setProfileSubmitting] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [passwordSubmitting, setPasswordSubmitting] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const [localError, setLocalError] = useState<string | null>(null);
    const messageRef = useRef<HTMLDivElement>(null);

    const err = localError ?? error;

    // Scroll message into view when error or success appears
    useEffect(() => {
        if (err || profileSuccess || passwordSuccess) {
            messageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [err, profileSuccess, passwordSuccess]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        setProfileSuccess(false);

        const trimmed = name.trim();
        if (trimmed.length < 2) {
            setLocalError('Họ tên phải có ít nhất 2 ký tự.');
            return;
        }

        setProfileSubmitting(true);
        try {
            await updateProfile(trimmed);
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 4000);
        } catch (e) {
            setLocalError(e instanceof Error ? e.message : 'Cập nhật thất bại. Vui lòng thử lại.');
        } finally {
            setProfileSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setLocalError(null);
        setPasswordSuccess(false);

        if (!currentPassword.trim()) {
            setLocalError('Vui lòng nhập mật khẩu hiện tại.');
            return;
        }
        if (newPassword.length < 8) {
            setLocalError('Mật khẩu mới phải có ít nhất 8 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setLocalError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setPasswordSubmitting(true);
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordSuccess(true);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setPasswordSuccess(false), 4000);
        } catch (e) {
            setLocalError(e instanceof Error ? e.message : 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
        } finally {
            setPasswordSubmitting(false);
        }
    };

    const switchSection = (s: Section) => {
        setSection(s);
        clearError();
        setLocalError(null);
        setProfileSuccess(false);
        setPasswordSuccess(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border-2 border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-zoom-in">
                <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
                    <h2 className="text-lg font-bold text-slate-800">Chỉnh sửa tài khoản</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                        aria-label="Đóng"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex border-b border-slate-200 shrink-0">
                    <button
                        type="button"
                        onClick={() => switchSection('profile')}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 ${
                            section === 'profile'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        Hồ sơ
                    </button>
                    <button
                        type="button"
                        onClick={() => switchSection('password')}
                        className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-1.5 ${
                            section === 'password'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Lock className="w-4 h-4" />
                        Mật khẩu
                    </button>
                </div>

                <div className="p-5 overflow-y-auto">
                    <div ref={messageRef} className="min-h-0">
                        {err && (
                            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2">
                                <span className="text-red-500 font-bold" aria-hidden>!</span>
                                <span>{err}</span>
                            </div>
                        )}
                        {section === 'profile' && profileSuccess && (
                            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                                <span>Đã cập nhật hồ sơ thành công.</span>
                            </div>
                        )}
                        {section === 'password' && passwordSuccess && (
                            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                                <span>Đã đổi mật khẩu thành công.</span>
                            </div>
                        )}
                    </div>

                    {section === 'profile' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Họ tên
                                </label>
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
                            {user && (
                                <p className="text-xs text-slate-400">
                                    Email: <span className="font-medium text-slate-600">{user.email}</span>
                                    <br />
                                    <span className="uppercase text-[10px]">{user.role}</span>
                                </p>
                            )}
                            <button
                                type="submit"
                                disabled={profileSubmitting}
                                className={`w-full py-3.5 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                                    profileSuccess
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                }`}
                            >
                                {profileSubmitting ? (
                                    <span className="btn-loading-dots flex items-center">
                                        <span /><span /><span />
                                    </span>
                                ) : null}
                                {profileSubmitting ? 'Đang lưu...' : profileSuccess ? 'Đã lưu thành công' : 'Lưu thay đổi'}
                            </button>
                        </form>
                    )}

                    {section === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Mật khẩu hiện tại
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showCurrentPw ? 'text' : 'password'}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPw((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        aria-label={showCurrentPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showNewPw ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Ít nhất 8 ký tự"
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPw((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        aria-label={showNewPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Xác nhận mật khẩu mới
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showConfirmPw ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPw((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        aria-label={showConfirmPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                    >
                                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={passwordSubmitting}
                                className={`w-full py-3.5 font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 ${
                                    passwordSuccess
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                                        : 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                }`}
                            >
                                {passwordSubmitting ? (
                                    <span className="btn-loading-dots flex items-center">
                                        <span /><span /><span />
                                    </span>
                                ) : null}
                                {passwordSubmitting ? 'Đang đổi mật khẩu...' : passwordSuccess ? 'Đổi mật khẩu thành công' : 'Đổi mật khẩu'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
