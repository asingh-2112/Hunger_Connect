import React, { useCallback, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const ROLE_MAP = { provider: "PROVIDER", distributor: "DISTRIBUTOR" };

const DONOR_TYPE_MAP = {
    Individual: "INDIVIDUAL",
    Restaurant: "RESTAURANT",
    Hotel: "HOTEL",
    Catering: "CATERING",
    Other: "OTHER",
};

const STATES_DISTRICTS = {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna", "Kurnool"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "South Delhi", "West Delhi"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar"],
    "Karnataka": ["Bangalore Urban", "Mysore", "Hubli", "Mangalore", "Belgaum", "Dharwad"],
    "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Telangana": ["Hyderabad", "Warangal", "Karimnagar", "Nizamabad", "Khammam"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad", "Ghaziabad"],
    "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Asansol", "Durgapur"],
};

const STEPS = ["Choose Role", "Your Details", "Address", "Account"];

function FieldError({ msg }) {
    return msg ? <p className="text-red-500 text-xs mt-1">{msg}</p> : null;
}

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        donorType: "", name: "", organizationName: "", organizationType: "",
        state: "", district: "", city: "", locality: "", street: "",
        pinCode: "", phone: "", email: "", password: "", confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validate = () => {
        const e = {};
        if (step === 2) {
            if (role === "provider") {
                if (!formData.donorType) e.donorType = "Please select a donor type.";
                if (!formData.name) e.name = "Please enter your name.";
            } else {
                if (!formData.organizationType) e.organizationType = "Please select an organization type.";
                if (!formData.organizationName) e.organizationName = "Please enter the organization name.";
            }
        }
        if (step === 3) {
            if (!formData.state) e.state = "Please select a state.";
            if (!formData.city) e.city = "Please enter the city.";
            if (!formData.pinCode) e.pinCode = "Please enter the pin code.";
            else if (!/^\d{6}$/.test(formData.pinCode)) e.pinCode = "Pincode must be 6 digits.";
            if (!formData.phone) e.phone = "Please enter the phone number.";
            else if (!/^\d{10}$/.test(formData.phone)) e.phone = "Phone must be 10 digits.";
        }
        if (step === 4) {
            if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                e.email = "Please enter a valid email.";
            if (!formData.password || formData.password.length < 8)
                e.password = "Password must be at least 8 characters.";
            if (formData.password !== formData.confirmPassword)
                e.confirmPassword = "Passwords do not match.";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    }, []);

    const next = () => { if (validate()) setStep((s) => s + 1); };
    const back = () => { setErrors({}); setStep((s) => s - 1); };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                name: role === "provider" ? formData.name : formData.organizationName,
                role: ROLE_MAP[role],
                donorType: role === "provider" ? (DONOR_TYPE_MAP[formData.donorType] || "OTHER") : undefined,
                organizationName: formData.organizationName || undefined,
                organizationType: formData.organizationType || undefined,
                phone: formData.phone,
                addressLine1: `${formData.street}, ${formData.locality}`.trim(),
                city: formData.city,
                state: formData.state,
                pincode: formData.pinCode,
            };
            await register(payload);
            toast.success("Registration successful!");
            navigate(ROLE_MAP[role] === 'PROVIDER' ? '/donor-dashboard' : '/ngo-dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "input";
    const selectClass = "input";

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Left brand panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-600 text-white p-12">
                <img className="h-9" src="https://i.imgur.com/gEHDYl2.png" alt="HungerConnect" />
                <div>
                    <h1 className="text-4xl font-bold mb-4 leading-tight">
                        Join the Fight<br />Against Hunger.
                    </h1>
                    <p className="text-brand-100 text-lg leading-relaxed max-w-md">
                        Register as a food provider or distributor and start making a real difference today.
                    </p>
                </div>
                <p className="text-brand-200 text-sm">© {new Date().getFullYear()} HungerConnect</p>
            </div>

            {/* Right form panel */}
            <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 overflow-y-auto">
                <div className="w-full max-w-sm mx-auto">
                    <div className="lg:hidden mb-8">
                        <img className="h-9" src="https://i.imgur.com/gEHDYl2.png" alt="HungerConnect" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Already have an account?{" "}
                        <Link to="/adminlogin" className="text-brand-600 hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>

                    {/* Step indicator */}
                    <div className="flex items-center gap-1.5 mb-8">
                        {STEPS.map((label, i) => (
                            <React.Fragment key={label}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                        step > i + 1 ? "bg-brand-600 text-white"
                                        : step === i + 1 ? "bg-brand-600 text-white ring-4 ring-brand-100"
                                        : "bg-slate-200 text-slate-500"
                                    }`}>
                                        {step > i + 1 ? "✓" : i + 1}
                                    </div>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 transition-colors ${step > i + 1 ? "bg-brand-600" : "bg-slate-200"}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step 1: Role */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">I want to join as a…</p>
                            <button
                                onClick={() => { setRole("provider"); next(); }}
                                className="w-full card p-4 flex items-center gap-4 hover:border-brand-400 hover:shadow-md transition-all text-left group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">Food Provider</p>
                                    <p className="text-xs text-slate-500">Restaurant, hotel, individual, catering</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { setRole("distributor"); next(); }}
                                className="w-full card p-4 flex items-center gap-4 hover:border-brand-400 hover:shadow-md transition-all text-left group"
                            >
                                <div className="w-10 h-10 rounded-lg bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center transition-colors">
                                    <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">Food Distributor</p>
                                    <p className="text-xs text-slate-500">NGO, shelter, community kitchen</p>
                                </div>
                            </button>
                        </div>
                    )}

                    {/* Step 2: Details */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">
                                {role === "provider" ? "Your details" : "Organization details"}
                            </p>
                            {role === "provider" ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Type of Donor</label>
                                        <select name="donorType" value={formData.donorType} onChange={handleChange} className={selectClass}>
                                            <option value="">Select type…</option>
                                            <option value="Individual">Individual</option>
                                            <option value="Restaurant">Restaurant / Cafe</option>
                                            <option value="Hotel">Hotel</option>
                                            <option value="Catering">Catering Service</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <FieldError msg={errors.donorType} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                                        <input type="text" name="name" placeholder="e.g. Priya Sharma" value={formData.name} onChange={handleChange} className={inputClass} />
                                        <FieldError msg={errors.name} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization Type</label>
                                        <select name="organizationType" value={formData.organizationType} onChange={handleChange} className={selectClass}>
                                            <option value="">Select type…</option>
                                            <option value="Child Welfare NGO">Child Welfare NGO</option>
                                            <option value="Homeless Shelter">Homeless Shelter</option>
                                            <option value="Disaster Relief Organization">Disaster Relief</option>
                                            <option value="Community Kitchen">Community Kitchen</option>
                                            <option value="Religious NGO">Faith-Based NGO</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <FieldError msg={errors.organizationType} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Organization Name</label>
                                        <input type="text" name="organizationName" placeholder="e.g. Annapoorna Foundation" value={formData.organizationName} onChange={handleChange} className={inputClass} />
                                        <FieldError msg={errors.organizationName} />
                                    </div>
                                </>
                            )}
                            <button onClick={next} className="btn-primary w-full justify-center py-2.5">Next →</button>
                        </div>
                    )}

                    {/* Step 3: Address */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Address</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                                <select name="state" value={formData.state} onChange={handleChange} className={selectClass}>
                                    <option value="">Select state…</option>
                                    {Object.keys(STATES_DISTRICTS).map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <FieldError msg={errors.state} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">District</label>
                                <select name="district" value={formData.district} onChange={handleChange} className={selectClass} disabled={!formData.state}>
                                    <option value="">Select district…</option>
                                    {(STATES_DISTRICTS[formData.state] || []).map((d) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                                <input type="text" name="city" placeholder="e.g. Mumbai" value={formData.city} onChange={handleChange} className={inputClass} />
                                <FieldError msg={errors.city} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Locality / Area</label>
                                <input type="text" name="locality" placeholder="e.g. Bandra West" value={formData.locality} onChange={handleChange} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Street Address</label>
                                <input type="text" name="street" placeholder="Plot / Street" value={formData.street} onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Pin Code</label>
                                    <input type="text" name="pinCode" placeholder="6 digits" value={formData.pinCode} onChange={handleChange} className={inputClass} maxLength={6} />
                                    <FieldError msg={errors.pinCode} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                                    <input type="text" name="phone" placeholder="10 digits" value={formData.phone} onChange={handleChange} className={inputClass} maxLength={10} />
                                    <FieldError msg={errors.phone} />
                                </div>
                            </div>
                            <button onClick={next} className="btn-primary w-full justify-center py-2.5">Next →</button>
                        </div>
                    )}

                    {/* Step 4: Account credentials */}
                    {step === 4 && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <p className="text-sm font-semibold text-slate-700 mb-2">Account credentials</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                                <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className={inputClass} />
                                <FieldError msg={errors.email} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} name="password" placeholder="Min 8 characters" onChange={handleChange} className={`${inputClass} pr-10`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <FieldError msg={errors.password} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Repeat password" onChange={handleChange} className={`${inputClass} pr-10`} />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <FieldError msg={errors.confirmPassword} />
                            </div>
                            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
                                {loading ? "Creating account…" : "Create Account"}
                            </button>
                        </form>
                    )}

                    {step > 1 && (
                        <button onClick={back} className="btn-ghost w-full justify-center mt-3 text-slate-500">
                            ← Back
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Register;
