import React, { useState } from "react";
import Layout from "../../../components/layout/Layout";
import { Button } from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import SearchButton from "../../../components/searchButton/SearchButton";
import DonationDetailDialog from "../../../components/donationDetailDialog/DonationDetailDialog";
import { Card, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Avatar } from "@mui/material";
import { LocationOn, Event, Fastfood, Delete, Article, Scale } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { donationApi } from "../../../api/donation";
import { useAuth } from "../../../hooks/useAuth";

function NgoDashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, logout } = useAuth();

    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const { data: donationsPage, isLoading } = useQuery({
        queryKey: ["donations", "accepted"],
        queryFn: () => donationApi.getAccepted({ page: 0, size: 50 }),
    });

    const withdrawMutation = useMutation({
        mutationFn: (donationId) => donationApi.withdraw(donationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["donations"] });
            toast.success("Donation withdrawn successfully!");
            setConfirmOpen(false);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to withdraw donation.");
        },
    });

    const donations = donationsPage?.content || [];

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        navigate("/");
    };

    const openWithdrawDialog = (donationId, e) => {
        e.stopPropagation();
        setSelectedDonation({ id: donationId });
        setConfirmOpen(true);
    };

    const handleWithdrawDonation = () => {
        if (!selectedDonation?.id) return;
        withdrawMutation.mutate(selectedDonation.id);
    };

    return (
        <Layout>
            <div className="py-8 px-4 max-w-full mx-auto">
                <Card className="p-6 mb-8 rounded-xl shadow-sm bg-gradient-to-br from-white to-teal-50 border border-teal-100">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Avatar className="w-20 h-20 bg-gradient-to-r from-teal-500 to-green-600">
                            <FaUserCircle className="text-4xl text-white" />
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <Typography variant="h4" className="font-bold text-gray-800">{user?.name}</Typography>
                            <Typography variant="subtitle1" className="text-teal-600">Food Distributor</Typography>
                            <Typography variant="body2" className="mt-1 text-gray-600">{user?.email}</Typography>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to="/createblog">
                                <Button variant="gradient" color="teal" className="flex items-center gap-2 shadow-md">
                                    <Article fontSize="small" /> Create Blog
                                </Button>
                            </Link>
                            <Button variant="gradient" color="red" className="shadow-md" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center mt-4">
                        <div className="p-3 rounded-lg bg-blue-100 shadow-sm">
                            <Typography variant="h5" className="font-bold text-blue-800">{donations.length}</Typography>
                            <Typography variant="body2" className="text-blue-600">Active Donations</Typography>
                        </div>
                        <div className="p-3 rounded-lg bg-green-100 shadow-sm">
                            <Typography variant="h5" className="font-bold text-green-800">
                                {donations.filter(d => d.status === "COMPLETED").length}
                            </Typography>
                            <Typography variant="body2" className="text-green-600">Completed</Typography>
                        </div>
                        <div className="p-3 rounded-lg bg-orange-100 shadow-sm">
                            <Typography variant="h5" className="font-bold text-orange-800">
                                {new Set(donations.map(d => d.donorId)).size}
                            </Typography>
                            <Typography variant="body2" className="text-orange-600">Unique Donors</Typography>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-xl shadow-lg max-w-7xl mx-auto bg-gradient-to-br from-white to-teal-50 border border-teal-100">
                    <div className="p-6 bg-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h5" className="font-bold text-gray-800">Accepted Donations</Typography>
                            <SearchButton onClick={() => setOpen(true)} />
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-500" />
                            </div>
                        ) : donations.length === 0 ? (
                            <div className="text-center py-8">
                                <Fastfood className="text-4xl mx-auto text-gray-400 mb-2" />
                                <Typography variant="h6" className="text-gray-500">No accepted donations yet</Typography>
                                <Button variant="gradient" color="teal" className="mt-4" onClick={() => setOpen(true)}>
                                    Search for donations
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {donations.map((donation, index) => (
                                    <Card
                                        key={donation.id}
                                        className="p-4 rounded-lg cursor-pointer hover:shadow-lg border-l-4 border-green-500"
                                        onClick={() => { setSelectedDonation(donation); setDetailDialogOpen(true); }}
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="bg-green-700 text-white">{index + 1}</Avatar>
                                                <div>
                                                    <Typography variant="subtitle1" className="font-medium">{donation.donorName || "Anonymous"}</Typography>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <LocationOn fontSize="small" className="text-blue-500" />
                                                        <Typography variant="body2" className="text-gray-600">{donation.city}</Typography>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Event fontSize="small" className="text-gray-400" />
                                                <Typography variant="body2">{donation.pickupDate || "Date N/A"}</Typography>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1">
                                                    <Scale fontSize="small" className="text-teal-500" />
                                                    <Typography variant="body2" className="font-medium text-teal-600">{donation.quantity}</Typography>
                                                </div>
                                                <Chip label={(donation.foodTypes || []).join(", ") || "Various"} color="primary" size="small" />
                                                <Button
                                                    variant="gradient"
                                                    color="red"
                                                    size="sm"
                                                    onClick={(e) => openWithdrawDialog(donation.id, e)}
                                                    className="shadow-sm"
                                                >
                                                    Withdraw
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>

                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle className="bg-gradient-to-r from-teal-500 to-green-600 text-white">Confirm Withdrawal</DialogTitle>
                    <DialogContent>
                        <Typography className="mt-4">Are you sure you want to withdraw from this donation?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)} variant="outlined" color="gray">Cancel</Button>
                        <Button
                            onClick={handleWithdrawDonation}
                            variant="gradient"
                            color="red"
                            disabled={withdrawMutation.isPending}
                        >
                            {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <DonationDetailDialog
                    open={detailDialogOpen}
                    onClose={() => setDetailDialogOpen(false)}
                    selectedDonation={selectedDonation}
                />
            </div>
        </Layout>
    );
}

export default NgoDashboard;
