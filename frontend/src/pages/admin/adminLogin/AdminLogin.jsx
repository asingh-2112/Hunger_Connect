import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Dialog, DialogContent } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import LayoutRegLog from "../../../components/layoutRegLog/LayoutRegLog";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, forgotPassword, isAuthenticated, role } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotPasswordDialog, setForgotPasswordDialog] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    // Redirect if already logged in
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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            return toast.error("All fields are required");
        }
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success("Login successful");
            const dashboardByRole = {
                PROVIDER: '/donor-dashboard',
                DISTRIBUTOR: '/ngo-dashboard',
                ADMIN: '/dashboard',
            };
            navigate(dashboardByRole[user.role] || '/');
        } catch (error) {
            const msg = error.response?.data?.message || "Invalid credentials";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!resetEmail) return toast.error("Please enter your email");
        setResetLoading(true);
        try {
            await forgotPassword(resetEmail);
            toast.success("If that email is registered, a reset link has been sent.");
            setForgotPasswordDialog(false);
            setResetEmail('');
        } catch {
            toast.error("Failed to send reset email. Please try again.");
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <LayoutRegLog>
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>

                    <div className="flex justify-center mb-4">
                        <img
                            src="https://cdn-icons-png.flaticon.com/128/727/727399.png"
                            alt="Login Icon"
                            className="h-20 w-20"
                        />
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-60 transition-colors"
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>

                        <div className="text-center text-sm">
                            <button
                                type="button"
                                onClick={() => setForgotPasswordDialog(true)}
                                className="text-blue-500 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        <p className="text-center text-gray-600">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="text-blue-500 hover:underline"
                            >
                                Register here
                            </button>
                        </p>
                    </form>
                </div>
            </div>

            <Dialog open={forgotPasswordDialog} onClose={() => setForgotPasswordDialog(false)}>
                <DialogContent>
                    <div className="p-2 space-y-4 bg-gray-900 text-white rounded-lg">
                        <h3 className="text-xl font-semibold">Reset Password</h3>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                        <button
                            onClick={handleForgotPassword}
                            disabled={resetLoading}
                            className="w-full bg-white text-gray-900 font-semibold py-2 rounded-lg shadow-lg hover:bg-gray-200 transition disabled:opacity-60"
                        >
                            {resetLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </LayoutRegLog>
    );
}
