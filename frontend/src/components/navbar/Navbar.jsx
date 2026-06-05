import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ShareDialogBox from "../shareDialogBox/ShareDialogBox";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function Nav() {
    const [openNav, setOpenNav] = useState(false);
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    const avatarRedirectPath = user?.role === "ADMIN"
        ? "/dashboard"
        : user?.role === "PROVIDER"
        ? "/donor-dashboard"
        : user?.role === "DISTRIBUTOR"
        ? "/ngo-dashboard"
        : "/";

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate("/");
    };

    const navLinks = (
        <ul className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6 mb-4 mt-2 lg:mb-0 lg:mt-0">
            <li className="p-1 font-medium">
                <Link to="/" className="flex items-center text-lg text-white hover:text-yellow-300 transition-colors duration-300">Home</Link>
            </li>
            <li className="p-1 font-medium">
                <Link to="/allblogs" className="flex items-center text-lg text-white hover:text-yellow-300 transition-colors duration-300">Blogs</Link>
            </li>
        </ul>
    );

    return (
        <nav className="sticky top-0 z-50 w-full py-3 px-6 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <div className="flex items-center justify-between">
                <Link to="/" className="flex items-center">
                    <img className="h-10" src="https://i.imgur.com/gEHDYl2.png" alt="Hunger Connect logo" />
                </Link>

                <div className="hidden lg:flex items-center gap-6">
                    {navLinks}
                    <div className="flex items-center gap-4">
                        <ShareDialogBox />
                        {isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Link to={avatarRedirectPath}>
                                    <img
                                        src={user?.profileImageUrl || 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png'}
                                        alt={user?.name || "User"}
                                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-white hover:border-yellow-300 transition-all object-cover"
                                    />
                                </Link>
                                <button onClick={handleLogout} className="text-white text-sm px-3 py-1 rounded hover:bg-white/20 transition-colors">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/adminlogin')} className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 lg:hidden">
                    <button onClick={() => setOpenNav(!openNav)} className="text-white hover:bg-white/20 p-1 rounded">
                        {openNav ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {openNav && (
                <div className="lg:hidden pt-4 pb-2">
                    {navLinks}
                    <div className="flex items-center justify-between pt-4 border-t border-white/20">
                        <ShareDialogBox mobile={true} />
                        {isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Link to={avatarRedirectPath}>
                                    <img
                                        src={user?.profileImageUrl || 'https://cdn-icons-png.flaticon.com/128/3135/3135715.png'}
                                        alt="User"
                                        className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                    />
                                </Link>
                                <button onClick={handleLogout} className="text-white text-sm hover:text-yellow-300">
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => navigate('/adminlogin')} className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-semibold text-sm px-4 py-1.5 rounded-lg transition-colors">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
