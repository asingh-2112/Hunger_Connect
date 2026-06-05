import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import PlusButton from "../../../components/plusButton/PlusButton";
import CreateDonation from "../../../components/createDonation/CreateDonation";
import { toast } from "react-hot-toast";
import DonationDetailDialog from "../../../components/donationDetailDialog/DonationDetailDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { donationApi } from "../../../api/donation";
import { useAuth } from "../../../hooks/useAuth";
import moment from "moment";

const STATUS_STYLES = {
    PENDING:   "bg-amber-100 text-amber-700",
    ACCEPTED:  "bg-green-100 text-green-700",
    REJECTED:  "bg-red-100 text-red-700",
    COMPLETED: "bg-slate-100 text-slate-600",
};

const STATUS_BAR = {
    ACCEPTED:  "border-green-500",
    COMPLETED: "border-brand-500",
    REJECTED:  "border-red-500",
    PENDING:   "border-amber-400",
};

function StatCard({ value, label, color }) {
    return (
        <div className={`card p-4 text-center ${color}`}>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        </div>
    );
}

function DonorDashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();

    const [open, setOpen] = useState(false);
    const [confirmId, setConfirmId] = useState(null);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [donationDialogOpen, setDonationDialogOpen] = useState(false);

    const { data: donationsPage, isLoading } = useQuery({
        queryKey: ["donations", "my"],
        queryFn: () => donationApi.getMy({ page: 0, size: 50 }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => donationApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["donations"] });
            toast.success("Donation deleted");
            setConfirmId(null);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
    });

    const donations = donationsPage?.content || [];

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        navigate("/");
    };

    const stats = [
        { label: "Total",     value: donations.length },
        { label: "Pending",   value: donations.filter(d => d.status === "PENDING").length },
        { label: "Accepted",  value: donations.filter(d => d.status === "ACCEPTED").length },
        { label: "Completed", value: donations.filter(d => d.status === "COMPLETED").length },
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
                                    : user?.name?.charAt(0)?.toUpperCase() || 'D'
                                }
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <h1 className="text-xl font-bold text-slate-900">{user?.name}</h1>
                                <p className="text-sm text-brand-600 font-medium">Food Provider</p>
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {stats.map(({ label, value }) => (
                            <StatCard key={label} label={label} value={value} />
                        ))}
                    </div>

                    {/* Donations list */}
                    <div className="card overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="font-bold text-slate-900">Your Donations</h2>
                            <button onClick={() => setOpen(true)} className="btn-primary text-sm">
                                + New Donation
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="p-8 flex justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-slate-400 text-sm mb-4">No donations yet. Start making an impact!</p>
                                <button onClick={() => setOpen(true)} className="btn-primary">
                                    Make Your First Donation
                                </button>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {donations.map((donation, i) => (
                                    <li
                                        key={donation.id}
                                        className={`flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 ${STATUS_BAR[donation.status] || "border-slate-200"}`}
                                        onClick={() => { setSelectedDonation(donation); setDonationDialogOpen(true); }}
                                    >
                                        <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{donation.city}</p>
                                            <p className="text-xs text-slate-400">
                                                {moment(donation.pickupDate).format("MMM D, YYYY")} · {donation.pickupTime} · {donation.quantity}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[donation.status] || "bg-slate-100 text-slate-600"}`}>
                                            {donation.status}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setConfirmId(donation.id); }}
                                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                            aria-label="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <PlusButton onClick={() => setOpen(true)} />
            <CreateDonation open={open} setOpen={setOpen} />

            {/* Delete confirm modal */}
            {confirmId && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="card p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Donation?</h3>
                        <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setConfirmId(null)} className="btn-secondary">Cancel</button>
                            <button
                                onClick={() => deleteMutation.mutate(confirmId)}
                                disabled={deleteMutation.isPending}
                                className="btn-danger disabled:opacity-60"
                            >
                                {deleteMutation.isPending ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DonationDetailDialog
                open={donationDialogOpen}
                onClose={() => setDonationDialogOpen(false)}
                selectedDonation={selectedDonation}
            />
        </Layout>
    );
}

export default DonorDashboard;
