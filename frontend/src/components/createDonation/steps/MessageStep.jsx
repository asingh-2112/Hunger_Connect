const MessageStep = ({
    formData,
    handleInputChange,
    handlePreviousStep,
    handleSubmit,
    errors,
}) => (
    <div className="space-y-3 md:space-y-4">
        <p className="text-lg font-semibold text-gray-700 mb-4">Final Details</p>

        <textarea
            name="message"
            placeholder="Additional Message (Optional)"
            value={formData.message || ""}
            onChange={handleInputChange}
            rows={4}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${errors.message ? "border-red-400" : "border-gray-300"}`}
        />
        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}

        <div className="flex flex-col md:flex-row justify-between gap-2 pt-4">
            <button onClick={handlePreviousStep} className="w-full md:w-auto border border-gray-400 text-gray-700 font-medium px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Back
            </button>
            <button onClick={handleSubmit} className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                Submit Donation
            </button>
        </div>
    </div>
);

export default MessageStep;