const FOOD_TYPES = { PACKED: "Packed", COOKED: "Cooked" };
const FOOD_PREFERENCES = { VEG: "Veg", NON_VEG: "Non-Veg", BOTH: "Both" };

const FoodPreferenceStep = ({ formData, handleInputChange, handleNextStep, errors }) => {
    const handleCheckboxChange = (foodType) => {
        const updatedFoodType = formData.foodType.includes(foodType)
            ? formData.foodType.filter((type) => type !== foodType)
            : [...formData.foodType, foodType];
        handleInputChange({ target: { name: "foodType", value: updatedFoodType } });
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <p className="text-base font-semibold text-gray-700 mb-3">Food Preference</p>
                <div className="flex gap-6">
                    {Object.entries(FOOD_PREFERENCES).map(([key, pref]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="vegNonVeg"
                                value={pref}
                                checked={formData.vegNonVeg === pref}
                                onChange={handleInputChange}
                                className="accent-blue-500"
                            />
                            <span className="text-sm text-gray-700">{pref}</span>
                        </label>
                    ))}
                </div>
                {errors.vegNonVeg && <p className="text-red-500 text-xs mt-1">{errors.vegNonVeg}</p>}
            </div>

            <div>
                <p className="text-base font-semibold text-gray-700 mb-3">Food Type</p>
                <div className="flex gap-6">
                    {Object.entries(FOOD_TYPES).map(([key, type]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.foodType.includes(type)}
                                onChange={() => handleCheckboxChange(type)}
                                className="accent-blue-500 w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                        </label>
                    ))}
                </div>
                {errors.foodType && <p className="text-red-500 text-xs mt-1">{errors.foodType}</p>}
            </div>

            <div>
                <p className="text-base font-semibold text-gray-700 mb-3">Food Quantity (in Kgs)</p>
                <div className="w-full md:w-1/3">
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Quantity"
                        value={formData.quantity || ""}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${errors.quantity ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleNextStep} className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg transition-colors">
                    Next
                </button>
            </div>
        </div>
    );
};

export default FoodPreferenceStep;