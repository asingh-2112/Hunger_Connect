import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, forgotPassword, isAuthenticated, role } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            const dashboardByRole = {
                PROVIDER: '/donor-dashboard',
                DISTRIBUTOR: '/ngo-dashboard',
                ADMIN: '/dashboard',
            };
            navigate(dashboardByRole[role] || '/');
        }
    }, [isAuthenticated, role, navigate]);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error("All fields are required");
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success("Welcome back!");
            const dashboardByRole = {
                PROVIDER: '/donor-dashboard',
                DISTRIBUTOR: '/ngo-dashboard',
                ADMIN: '/dashboard',
            };
            navigate(dashboardByRole[user.role] || '/');
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail) return toast.error("Please enter your email");
        setResetLoading(true);
        try {
            await forgotPassword(resetEmail);
            toast.success("If that email is registered, a reset link has been sent.");
            setShowForgot(false);
            setResetEmail('');
        } catch {
            toast.error("Failed to send reset email. Please try again.");
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-600 text-white p-12">
                <img className="h-9" src="https://i.imgur.com/gEHDYl2.png" alt="HungerConnect" />
                <div>
                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        Fighting Hunger,<br />Together.
                    </h1>
                    <p className="text-brand-100 text-lg leading-relaxed max-w-md">
                        Join thousands of food providers and NGOs making a difference every single day.
                    </p>
                </div>
                <p className="text-brand-200 text-sm">© {new Date().getFullYear()} HungerConnect</p>
            </div>

            {/* Right panel — form */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
                <div className="w-full max-w-sm mx-auto">
                    <div className="lg:hidden mb-8">
                        <img className="h-9" src="https://i.imgur.com/gEHDYl2.png" alt="HungerConnect" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign in</h2>
                    <p className="text-sm text-slate-500 mb-8">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-brand-600 hover:underline font-medium">
                            Register
                        </Link>
                    </p>

                    {!showForgot ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="input pr-10"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForgot(true)}
                                    className="text-sm text-brand-600 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-2.5 text-sm disabled:opacity-60"
                            >
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                            <button
                                type="button"
                                onClick={() => setShowForgot(false)}
                                className="text-sm text-slate-500 hover:text-slate-800 mb-2 flex items-center gap-1"
                            >
                                ← Back to sign in
                            </button>
                            <h3 className="text-lg font-semibold text-slate-900">Reset Password</h3>
                            <p className="text-sm text-slate-500">We'll send a reset link to your email.</p>
                            <input
                                type="email"
                                className="input"
                                placeholder="you@example.com"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={resetLoading}
                                className="btn-primary w-full justify-center py-2.5 text-sm disabled:opacity-60"
                            >
                                {resetLoading ? "Sending…" : "Send Reset Link"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
