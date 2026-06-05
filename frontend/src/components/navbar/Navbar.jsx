import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import ShareDialogBox from "../shareDialogBox/ShareDialogBox";

export default function Nav() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [location.pathname]);

    const avatarRedirectPath =
        user?.role === "ADMIN" ? "/dashboard"
        : user?.role === "PROVIDER" ? "/donor-dashboard"
        : user?.role === "DISTRIBUTOR" ? "/ngo-dashboard"
        : "/";

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        navigate("/");
    };

    const navLinks = [
        { to: "/", label: "Home" },
        { to: "/allblogs", label: "Blogs" },
    ];

    return (
        <header className={`sticky top-0 z-50 bg-white transition-shadow duration-200 ${scrolled ? "shadow-md" : "border-b border-slate-200"}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <img className="h-9" src="https://i.imgur.com/gEHDYl2.png" alt="HungerConnect" />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    location.pathname === to
                                        ? "text-brand-600 bg-brand-50"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        <ShareDialogBox />
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link to={avatarRedirectPath}>
                                    <img
                                        src={user?.profileImageUrl || "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"}
                                        alt={user?.name || "User"}
                                        className="w-8 h-8 rounded-full border-2 border-slate-200 hover:border-brand-400 transition-all object-cover"
                                    />
                                </Link>
                                <span className="text-sm text-slate-700 font-medium hidden lg:block">{user?.name}</span>
                                <button onClick={handleLogout} className="btn-ghost text-slate-600">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate("/adminlogin")}
                                className="btn-primary"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
                    {navLinks.map(({ to, label }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                                location.pathname === to
                                    ? "text-brand-600 bg-brand-50"
                                    : "text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                            {label}
                        </Link>
                    ))}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <ShareDialogBox />
                        {isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link to={avatarRedirectPath}>
                                    <img
                                        src={user?.profileImageUrl || "https://cdn-icons-png.flaticon.com/128/3135/3135715.png"}
                                        alt="User"
                                        className="w-8 h-8 rounded-full border-2 border-slate-200 object-cover"
                                    />
                                </Link>
                                <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-red-500">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => navigate("/adminlogin")} className="btn-primary text-sm">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
