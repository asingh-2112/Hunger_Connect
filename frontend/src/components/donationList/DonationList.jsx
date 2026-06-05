import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DonationDetailDialog from "../donationDetailDialog/DonationDetailDialog";
import { donationApi } from "../../api/donation";
import { useAuth } from "../../hooks/useAuth";

const DonationList = () => {
    const queryClient = useQueryClient();
    const { isAuthenticated, user } = useAuth();

    const [cityFilter, setCityFilter] = useState("");
    const [foodFilter, setFoodFilter] = useState("");
    const [selectedDonation, setSelectedDonation] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: donationsPage, isLoading } = useQuery({
        queryKey: ["donations", "pending", cityFilter],
        queryFn: () => donationApi.getPending({ city: cityFilter || undefined }),
    });

    const acceptMutation = useMutation({
        mutationFn: (donationId) => donationApi.accept(donationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["donations"] });
            toast.success("Donation accepted successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to accept donation!");
        },
    });

    const handleAccept = (e, donationId) => {
        e.stopPropagation();
        if (!isAuthenticated) return toast.error("Please login to accept donations");
        if (user?.role !== "DISTRIBUTOR") return toast.error("Only distributors can accept donations");
        acceptMutation.mutate(donationId);
    };

    const allDonations = donationsPage?.content || [];
    const filteredDonations = foodFilter
        ? allDonations.filter((d) => d.vegNonVeg === foodFilter)
        : allDonations;

    const vegLabel = (veg) => {
        if (veg === "VEG") return { label: "Veg", cls: "bg-green-100 text-green-800 border-green-200" };
        if (veg === "NON_VEG") return { label: "Non-Veg", cls: "bg-red-100 text-red-800 border-red-200" };
        return { label: "Both", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" };
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-4 sm:p-6 mb-8 border border-blue-100">
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 sm:mb-6">
                    Available Donations
                </h1>

                <div className="flex flex-col space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by City"
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <select
                        value={foodFilter}
                        onChange={(e) => setFoodFilter(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                        <option value="">All</option>
                        <option value="VEG">Veg</option>
                        <option value="NON_VEG">Non-Veg</option>
                        <option value="BOTH">Both</option>
                    </select>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                ) : filteredDonations.length === 0 ? (
                    <div className="text-center py-12 bg-white/70 rounded-lg border border-dashed border-blue-200">
                        <h3 className="mt-4 text-xl font-medium text-gray-800">No donations found</h3>
                        <p className="mt-2 text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
                        <button
                            onClick={() => { setCityFilter(""); setFoodFilter(""); }}
                            className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all"
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-blue-100 bg-white/80">
                        <table className="min-w-full divide-y divide-blue-100">
                            <thead className="bg-gradient-to-r from-blue-500 to-purple-500">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-white uppercase">City</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-white uppercase">Food Type</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-white uppercase">Quantity</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-blue-50">
                                {filteredDonations.map((donation) => {
                                    const veg = vegLabel(donation.vegNonVeg);
                                    return (
                                        <tr
                                            key={donation.id}
                                            className="hover:bg-blue-50/50 cursor-pointer transition-all"
                                            onClick={() => { setSelectedDonation(donation); setDialogOpen(true); }}
                                        >
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="text-sm font-semibold text-gray-900">{donation.city}</div>
                                                <div className="text-xs text-blue-600">{donation.pickupDate}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {(donation.foodTypes || []).join(", ")}
                                                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${veg.cls}`}>
                                                        {veg.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                <div className="text-sm font-bold text-purple-700">{donation.quantity}</div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4">
                                                {donation.status === "PENDING" ? (
                                                    <button
                                                        onClick={(e) => handleAccept(e, donation.id)}
                                                        disabled={acceptMutation.isPending}
                                                        className="bg-gradient-to-r from-green-400 to-green-600 text-white px-3 py-1 rounded-lg text-xs sm:text-sm disabled:opacity-60"
                                                    >
                                                        Accept
                                                    </button>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                        Accepted
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <DonationDetailDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                selectedDonation={selectedDonation}
            />
        </div>
    );
};

export default DonationList;
