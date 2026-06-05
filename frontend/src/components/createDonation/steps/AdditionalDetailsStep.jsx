const inputCls = (err) =>
    `w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${err ? "border-red-400" : "border-gray-300"}`;

const AdditionalDetailsStep = ({
    formData,
    handleInputChange,
    handlePreviousStep,
    handleNextStep,
    errors,
}) => (
    <div className="space-y-3 md:space-y-4">
        <p className="text-lg font-semibold text-gray-700 mb-4">Contact Information</p>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div>
                <label className="block text-xs text-gray-500 mb-1">Pickup Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={inputCls(errors.date)} />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
                <label className="block text-xs text-gray-500 mb-1">Pickup Time</label>
                <input type="time" name="time" value={formData.time} onChange={handleInputChange} className={inputCls(errors.time)} />
                {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <div>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className={inputCls(errors.email)} />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
                <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleInputChange} className={inputCls(errors.phoneNumber)} />
                {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
        </div>

        <input type="tel" name="alternatePhoneNumber" placeholder="Alternate Phone Number (Optional)" value={formData.alternatePhoneNumber} onChange={handleInputChange} className={inputCls(errors.alternatePhoneNumber)} />
        {errors.alternatePhoneNumber && <p className="text-red-500 text-xs mt-1">{errors.alternatePhoneNumber}</p>}

        <div className="flex flex-col md:flex-row justify-between gap-2 pt-4">
            <button onClick={handlePreviousStep} className="w-full md:w-auto border border-gray-400 text-gray-700 font-medium px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Back
            </button>
            <button onClick={handleNextStep} className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                Next
            </button>
        </div>
    </div>
);

export default AdditionalDetailsStep;