import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { FiPlusCircle } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import PlusButton from "../../../components/plusButton/PlusButton";
import CreateDonation from "../../../components/createDonation/CreateDonation";
import { toast } from "react-hot-toast";
import DonationDetailDialog from "../../../components/donationDetailDialog/DonationDetailDialog";
import { Card, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Avatar } from "@mui/material";
import { Event, Fastfood, Delete, Article, Scale } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { donationApi } from "../../../api/donation";
import { useAuth } from "../../../hooks/useAuth";

const STATUS_COLOR = { PENDING: "warning", ACCEPTED: "success", REJECTED: "error", COMPLETED: "default" };

function DonorDashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();

    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
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
            toast.success("Donation deleted successfully!");
            setConfirmOpen(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to delete donation.");
        },
    });

    const donations = donationsPage?.content || [];

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        navigate("/");
    };

    const openDeleteDialog = (e, donation) => {
        e.stopPropagation();
        setSelectedDonation(donation);
        setConfirmOpen(true);
    };

    const handleDeleteDonation = () => {
        if (!selectedDonation) return;
        deleteMutation.mutate(selectedDonation.id);
    };

    return (
        <Layout>
            <div className="py-8 px-4 max-w-full mx-auto">
                <Card className="p-6 mb-8 rounded-xl shadow-sm bg-gradient-to-br from-white to-blue-50 border border-blue-100">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600">
                            <FaUserCircle className="text-4xl text-white" />
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <Typography variant="h4" className="font-bold text-gray-800">{user?.name}</Typography>
                            <Typography variant="subtitle1" className="text-blue-600">{user?.role} Donor</Typography>
                            <Typography variant="body2" className="mt-1 text-gray-600">{user?.email}</Typography>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/createblog">
                                <button className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors">
                                    <Article fontSize="small" /> Create Blog
                                </button>
                            </Link>
                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg shadow-md transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-4">
                        {[
                            { label: "Total", value: donations.length, cls: "blue" },
                            { label: "Accepted", value: donations.filter(d => d.status === "ACCEPTED").length, cls: "green" },
                            { label: "Pending", value: donations.filter(d => d.status === "PENDING").length, cls: "yellow" },
                            { label: "Completed", value: donations.filter(d => d.status === "COMPLETED").length, cls: "purple" },
                        ].map(({ label, value, cls }) => (
                            <div key={label} className={`p-3 rounded-lg bg-${cls}-100 shadow-sm`}>
                                <Typography variant="h5" className={`font-bold text-${cls}-800`}>{value}</Typography>
                                <Typography variant="body2" className={`text-${cls}-600`}>{label}</Typography>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-xl shadow-lg max-w-7xl mx-auto bg-gradient-to-br from-white to-blue-50 border border-blue-100">
                    <div className="p-6 bg-gray-100">
                        <Typography variant="h5" className="font-bold mb-4 text-blue-600">Your Donations</Typography>

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="text-center py-8">
                                <Fastfood className="text-4xl mx-auto text-gray-400 mb-2" />
                                <Typography variant="h6" className="text-gray-500">No donations yet</Typography>
                                <button onClick={() => setOpen(true)} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                                    Make your first donation
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {donations.map((donation, index) => (
                                    <Card
                                        key={donation.id}
                                        className={`p-4 rounded-lg cursor-pointer hover:shadow-lg border-l-4 ${
                                            donation.status === "ACCEPTED" ? "border-green-500" :
                                            donation.status === "COMPLETED" ? "border-blue-500" :
                                            donation.status === "REJECTED" ? "border-red-500" : "border-yellow-500"
                                        }`}
                                        onClick={() => { setSelectedDonation(donation); setDonationDialogOpen(true); }}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="bg-blue-100 text-blue-800">{index + 1}</Avatar>
                                                <div>
                                                    <Typography variant="subtitle1" className="font-medium">{donation.city}</Typography>
                                                    <div className="flex items-center gap-2">
                                                        <Event fontSize="small" className="text-gray-400" />
                                                        <Typography variant="body2" className="text-gray-600">
                                                            {donation.pickupDate} • {donation.pickupTime}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Scale fontSize="small" className="text-blue-500" />
                                                    <Typography variant="body2" className="font-medium text-blue-600">
                                                        {donation.quantity}
                                                    </Typography>
                                                </div>
                                                <Chip
                                                    label={donation.status}
                                                    color={STATUS_COLOR[donation.status] || "default"}
                                                    size="small"
                                                />
                                                <button
                                                    onClick={(e) => openDeleteDialog(e, donation)}
                                                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-lg shadow-sm transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                <PlusButton onClick={() => setOpen(true)} />
                <CreateDonation open={open} setOpen={setOpen} />

                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">Confirm Deletion</DialogTitle>
                    <DialogContent>
                        <Typography className="mt-4">Are you sure you want to delete this donation?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <button onClick={() => setConfirmOpen(false)} className="border border-gray-400 text-gray-700 font-medium px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
                        <button
                            onClick={handleDeleteDonation}
                            disabled={deleteMutation.isPending}
                            className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-1.5 rounded-lg disabled:opacity-60 transition-colors"
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </button>
                    </DialogActions>
                </Dialog>

                <DonationDetailDialog
                    open={donationDialogOpen}
                    onClose={() => setDonationDialogOpen(false)}
                    selectedDonation={selectedDonation}
                />
            </div>
        </Layout>
    );
}

export default DonorDashboard;
