import React, { useCallback, useState } from "react";
import { FaBox, FaTruckLoading } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import LayoutRegLog from "../../components/layoutRegLog/LayoutRegLog";
import { useAuth } from "../../hooks/useAuth";

const ROLE_MAP = { provider: "PROVIDER", distributor: "DISTRIBUTOR" };

const DONOR_TYPE_MAP = {
  Individual: "INDIVIDUAL",
  Restaurant: "RESTAURANT",
  Hotel: "HOTEL",
  Catering: "CATERING",
  Other: "OTHER",
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    donorType: "",
    name: "",
    organizationName: "",
    organizationType: "",
    state: "",
    district: "",
    city: "",
    locality: "",
    street: "",
    pinCode: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateStep = () => {
    const newErrors = {};
    switch (step) {
      case 2:
        if (role === "provider") {
          if (!formData.donorType) newErrors.donorType = "Please select a donor type.";
          if (!formData.name) newErrors.name = "Please enter your name.";
        } else if (role === "distributor") {
          if (!formData.organizationType) newErrors.organizationType = "Please select an organization type.";
          if (!formData.organizationName) newErrors.organizationName = "Please enter the organization name.";
        }
        break;
      case 3:
        if (!formData.state) newErrors.state = "Please select a state.";
        if (!formData.city) newErrors.city = "Please enter the city.";
        if (!formData.pinCode) newErrors.pinCode = "Please enter the pin code.";
        else if (!/^\d{6}$/.test(formData.pinCode)) newErrors.pinCode = "Pincode must be 6 digits.";
        if (!formData.phone) newErrors.phone = "Please enter the phone number.";
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone number must be 10 digits.";
        break;
      case 4:
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = "Please enter a valid email.";
        if (!formData.password || formData.password.length < 8)
          newErrors.password = "Password must be at least 8 characters.";
        if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match.";
        break;
      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const statesAndDistricts = {
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

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const prevStep = useCallback(() => {
    setErrors({});
    if (step === 2) {
      setFormData((prev) => ({ ...prev, organizationType: "", donorType: "" }));
    }
    setStep((prev) => prev - 1);
  }, [step]);

  const nextStep = () => {
    if (validateStep()) setStep((prev) => prev + 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

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
      const dashboardByRole = { PROVIDER: '/donor-dashboard', DISTRIBUTOR: '/ngo-dashboard' };
      navigate(dashboardByRole[ROLE_MAP[role]] || '/');
    } catch (error) {
      const msg = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutRegLog>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${step >= num ? "bg-blue-500" : "bg-gray-300"}`}>
                {num}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Register As</h2>
              <div className="flex justify-center gap-6">
                <button onClick={() => { setRole("provider"); nextStep(); }}
                  className="flex flex-col items-center bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition">
                  <FaBox size={30} />
                  <span className="mt-2">Food Provider</span>
                </button>
                <button onClick={() => { setRole("distributor"); nextStep(); }}
                  className="flex flex-col items-center bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition">
                  <FaTruckLoading size={30} />
                  <span className="mt-2">Food Distributor</span>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form className="space-y-4">
              <h2 className="text-xl font-semibold text-center">
                {role === "provider" ? "Food Provider Details" : "Food Distributor Details"}
              </h2>

              {role === "provider" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Donor</label>
                    <select name="donorType" onChange={handleChange} value={formData.donorType} className="w-full p-2 border rounded">
                      <option value="">Select</option>
                      <option value="Individual">Individual</option>
                      <option value="Restaurant">Restaurant/Cafe</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Catering">Catering Service</option>
                      <option value="Other">Others</option>
                    </select>
                    {errors.donorType && <p className="text-red-500 text-sm">{errors.donorType}</p>}
                  </div>
                  <div>
                    <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                </>
              )}

              {role === "distributor" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type of Organization</label>
                    <select name="organizationType" onChange={handleChange} value={formData.organizationType} className="w-full p-2 border rounded">
                      <option value="">Select</option>
                      <option value="Child Welfare NGO">Child Welfare NGO</option>
                      <option value="Homeless Shelter">Homeless Shelter</option>
                      <option value="Disaster Relief Organization">Disaster Relief Organization</option>
                      <option value="Community Kitchen">Community Kitchen</option>
                      <option value="Religious NGO">Religious / Faith Based NGO</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.organizationType && <p className="text-red-500 text-sm">{errors.organizationType}</p>}
                  </div>
                  <div>
                    <input type="text" name="organizationName" placeholder="Organization Name" onChange={handleChange} value={formData.organizationName} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                    {errors.organizationName && <p className="text-red-500 text-sm">{errors.organizationName}</p>}
                  </div>
                </>
              )}

              <button type="button" onClick={nextStep} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                Next
              </button>
            </form>
          )}

          {step === 3 && (
            <form className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Address Details</h2>

              <select name="state" onChange={handleChange} className="w-full p-2 border rounded" value={formData.state}>
                <option value="">Select State</option>
                {Object.keys(statesAndDistricts).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}

              <select name="district" onChange={handleChange} className="w-full p-2 border rounded" value={formData.district} disabled={!formData.state}>
                <option value="">Select District</option>
                {(statesAndDistricts[formData.state] || []).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <input type="text" name="city" placeholder="City" onChange={handleChange} value={formData.city} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

              <input name="locality" placeholder="Locality / Area" value={formData.locality} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              <input name="street" placeholder="Plot No. / Street Address" value={formData.street} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />

              <input type="text" name="pinCode" placeholder="Pin Code" onChange={handleChange} value={formData.pinCode} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              {errors.pinCode && <p className="text-red-500 text-sm">{errors.pinCode}</p>}

              <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} value={formData.phone} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

              <button type="button" onClick={nextStep} className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                Next
              </button>
            </form>
          )}

          {step === 4 && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-xl font-semibold text-center">Account Details</h2>

              <div>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" required />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-500">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter Password" onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-500">
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 disabled:opacity-60">
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          )}

          {step > 1 && (
            <button onClick={prevStep} className="w-full text-gray-500 p-2 mt-2">
              ← Back
            </button>
          )}

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <button onClick={() => navigate('/adminlogin')} className="text-blue-500 hover:underline">
              Login here
            </button>
          </p>
        </div>
      </div>
    </LayoutRegLog>
  );
};

export default Register;
