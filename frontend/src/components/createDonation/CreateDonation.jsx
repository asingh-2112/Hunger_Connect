import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent } from "@mui/material";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { donationApi } from "../../api/donation";
import { useAuth } from "../../hooks/useAuth";
import FoodPreferenceStep from "./steps/FoodPreferenceStep";
import AddressDetailsStep from "./steps/AddressDetailsStep";
import AdditionalDetailsStep from "./steps/AdditionalDetailsStep";
import MessageStep from "./steps/MessageStep";

const statesAndDistricts = {
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Karnataka": ["Bangalore Urban", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Nashik", "Thane"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Telangana": ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol"],
};

const VEG_MAP = { Veg: "VEG", "Non-Veg": "NON_VEG", Both: "BOTH" };

const CreateDonation = ({ open, setOpen }) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        foodType: [],
        vegNonVeg: "Veg",
        quantity: "",
        state: "",
        district: "",
        city: "",
        street: "",
        locality: "",
        pincode: "",
        phoneNumber: "",
        email: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        message: "",
    });

    const createMutation = useMutation({
        mutationFn: (payload) => donationApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["donations"] });
            toast.success("Donation added successfully!");
            setOpen(false);
            setStep(1);
            setFormData({
                foodType: [], vegNonVeg: "Veg", quantity: "", state: "", district: "",
                city: "", street: "", locality: "", pincode: "", phoneNumber: "",
                email: "", date: new Date().toISOString().split("T")[0], time: "", message: "",
            });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to add donation.");
        },
    });

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => {
            if (type === "checkbox") {
                return {
                    ...prev,
                    foodType: checked
                        ? [...prev.foodType, value]
                        : prev.foodType.filter((item) => item !== value),
                };
            }
            return { ...prev, [name]: value };
        });
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }, []);

    const validateStep = useCallback(() => {
        const newErrors = {};
        switch (step) {
            case 1:
                if (!formData.vegNonVeg) newErrors.vegNonVeg = "Please select a food preference.";
                if (formData.foodType.length === 0) newErrors.foodType = "Please select at least one food type.";
                if (!formData.quantity) newErrors.quantity = "Please enter the food quantity.";
                break;
            case 2:
                if (!formData.state) newErrors.state = "State is required.";
                if (!formData.city) newErrors.city = "City is required.";
                if (!formData.pincode) newErrors.pincode = "Pincode is required.";
                else if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = "Pincode must be 6 digits.";
                break;
            case 3:
                if (!formData.date) newErrors.date = "Date is required.";
                if (!formData.time) newErrors.time = "Time is required.";
                break;
            default:
                break;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [step, formData]);

    const handleNextStep = useCallback(() => {
        if (validateStep()) { setErrors({}); setStep((prev) => prev + 1); }
    }, [validateStep]);

    const handlePreviousStep = useCallback(() => {
        setErrors({});
        setStep((prev) => prev - 1);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateStep()) return;

        const payload = {
            foodTypes: formData.foodType,
            vegNonVeg: VEG_MAP[formData.vegNonVeg] || "VEG",
            quantity: formData.quantity,
            addressLine1: `${formData.street}, ${formData.locality}`.trim(),
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            pickupDate: formData.date,
            pickupTime: formData.time,
            message: formData.message || null,
        };

        createMutation.mutate(payload);
    }, [formData, validateStep, createMutation]);

    const districtOptions = useMemo(() => {
        return formData.state
            ? statesAndDistricts[formData.state]?.map((d) => <option key={d} value={d}>{d}</option>) || []
            : [];
    }, [formData.state]);

    return (
        <Dialog open={open} onClose={() => {}} maxWidth="md" fullWidth PaperProps={{ className: "rounded-lg" }}>
            <DialogContent className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-xl font-bold text-gray-800">Food Donation Form</p>
                    <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex justify-between mb-6 px-2">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step === n ? "bg-blue-500 text-white" : step > n ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
                            }`}>{n}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
                    {step === 1 && (
                        <FoodPreferenceStep
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handleNextStep={handleNextStep}
                            errors={errors}
                            setErrors={setErrors}
                        />
                    )}
                    {step === 2 && (
                        <AddressDetailsStep
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handlePreviousStep={handlePreviousStep}
                            handleNextStep={handleNextStep}
                            districtOptions={districtOptions}
                            errors={errors}
                            setErrors={setErrors}
                        />
                    )}
                    {step === 3 && (
                        <AdditionalDetailsStep
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handlePreviousStep={handlePreviousStep}
                            handleNextStep={handleNextStep}
                            errors={errors}
                            setErrors={setErrors}
                        />
                    )}
                    {step === 4 && (
                        <MessageStep
                            formData={formData}
                            handleInputChange={handleInputChange}
                            handlePreviousStep={handlePreviousStep}
                            handleSubmit={handleSubmit}
                            errors={errors}
                            setErrors={setErrors}
                            isLoading={createMutation.isPending}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CreateDonation;
