import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SearchButton from "../../../components/searchButton/SearchButton";
import DonationDetailDialog from "../../../components/donationDetailDialog/DonationDetailDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { donationApi } from "../../../api/donation";
import { useAuth } from "../../../hooks/useAuth";
import moment from "moment";

function NgoDashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();

    const [confirmId, setConfirmId] = useState(null);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const { data: donationsPage, isLoading } = useQuery({
        queryKey: ["donations", "accepted"],
        queryFn: () => donationApi.getAccepted({ page: 0, size: 50 }),
    });

    const withdrawMutation = useMutation({
        mutationFn: (id) => donationApi.withdraw(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["donations"] });
            toast.success("Withdrawn successfully");
            setConfirmId(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to withdraw"),
    });

    const donations = donationsPage?.content || [];

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        navigate("/");
    };

    const stats = [
        { label: "Active",      value: donations.filter(d => d.status !== "COMPLETED").length },
        { label: "Completed",   value: donations.filter(d => d.status === "COMPLETED").length },
        { label: "Unique Donors", value: new Set(donations.map(d => d.donorId)).size },
    ];

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Profile card */}
                    <div className="card p-6">
                        <div className="flex flex-col sm:flex-row items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl flex-shrink-0 overflow-hidden">
                                {user?.profileImageUrl
                                    ? <img src={user.profileImageUrl} alt={user.name} className="w-full h-full object-cover" />
                                    : user?.name?.charAt(0)?.toUpperCase() || 'N'
                                }
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
                                <p className="text-sm text-brand-600 font-medium">Food Distributor</p>
                                <p className="text-sm text-slate-500">{user?.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <Link to="/createblog" className="btn-secondary text-sm">
                                    + Write Story
                                </Link>
                                <button onClick={handleLogout} className="btn-ghost text-red-500 hover:bg-red-50">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stat cards */}
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map(({ label, value }) => (
                            <div key={label} className="card p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900">{value}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Accepted donations list */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-900">Accepted Donations</h2>
                            <SearchButton />
                        </div>

                        {isLoading ? (
                            <div className="p-8 flex justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-slate-400 text-sm mb-4">No accepted donations yet.</p>
                                <SearchButton />
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {donations.map((donation, i) => (
                                    <li
                                        key={donation.id}
                                        className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 border-brand-500"
                                        onClick={() => { setSelectedDonation(donation); setDetailDialogOpen(true); }}
                                    >
                                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{donation.donorName || "Anonymous"}</p>
                                            <p className="text-xs text-slate-400">
                                                {donation.city} · {moment(donation.pickupDate).format("MMM D, YYYY")} · {donation.quantity}
                                            </p>
                                        </div>
                                        {(donation.foodTypes || []).length > 0 && (
                                            <span className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium hidden sm:block">
                                                {(donation.foodTypes || []).join(", ")}
                                            </span>
                                        )}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmId(donation.id); }}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 text-xs font-medium"
                                            aria-label="Withdraw"
                                        >
                                            Withdraw
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            {/* Withdraw confirm modal */}
            {confirmId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Withdraw from Donation?</h3>
                        <p className="text-sm text-slate-500 mb-6">You will no longer be assigned to this donation.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setConfirmId(null)} className="btn-secondary">Cancel</button>
                            <button
                                onClick={() => withdrawMutation.mutate(confirmId)}
                                disabled={withdrawMutation.isPending}
                                className="btn-danger disabled:opacity-60"
                            >
                                {withdrawMutation.isPending ? "Withdrawing…" : "Withdraw"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DonationDetailDialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                selectedDonation={selectedDonation}
            />
        </Layout>
    );
}

export default NgoDashboard;
