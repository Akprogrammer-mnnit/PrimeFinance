
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const Saving = () => {
    const mode = useSelector(state => state.auth.mode);
    const extractDate = (dateString) => {
        return dateString ? dateString.split("T")[0] : "";
    };
    const [savings, setSavings] = useState([]);
    const [formData, setFormData] = useState({
        goalAmount: "",
        currentAmount: "",
        deadline: "",
    });
    const [showPopUp, setShowPopUp] = useState(false);
    const [editingSaving, setEditingSaving] = useState({
        _id: "",
        goalAmount: "",
        currentAmount: "",
        deadline: "",
    });
    const user = useSelector((state) => state.auth.userData);

    const fetchSavings = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/savings`, {
                withCredentials: true,
            });
            setSavings(response.data.message);
        } catch (err) {
            console.log("Failed to fetch savings: ", err);
        }
    };

    const createSaving = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/savings/create-saving`,
                formData,
                {
                    withCredentials: true,
                }
            );
            setFormData({ goalAmount: "", currentAmount: "", deadline: "" });
            fetchSavings();
        } catch (err) {
            console.log("Failed to create saving: ", err);
        }
    };

    const handleUpdate = async (savingId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/savings/getSavingById/${savingId}`,
                { withCredentials: true }
            );
            if (response) {
                setEditingSaving({
                    _id: response.data.message._id,
                    goalAmount: response.data.message.goalAmount,
                    currentAmount: response.data.message.currentAmount,
                    deadline: response.data.message.deadline,
                });
                setShowPopUp(true);
            }
        } catch (err) {
            console.log("Failed to fetch saving: ", err);
        }
    };

    const updateSaving = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/savings/update-saving/${editingSaving._id}`,
                editingSaving,
                {
                    withCredentials: true,
                }
            );
            setEditingSaving({
                _id: "",
                goalAmount: "",
                currentAmount: "",
                deadline: "",
            });
            setShowPopUp(false);
            fetchSavings();
        } catch (err) {
            console.log("Failed to update saving: ", err);
        }
    };

    const deleteSaving = async (savingId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/savings/delete-saving/${savingId}`,
                { withCredentials: true }
            );
            fetchSavings();
        } catch (err) {
            console.log("Failed to delete saving: ", err);
        }
    };

    useEffect(() => {
        fetchSavings();
    }, []);

    return (
        <div className={`min-h-screen ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">Savings</h1>
                <form
                    onSubmit={createSaving}
                    className={`p-6 shadow-sm rounded-md mb-6 mx-auto w-full max-w-md ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                >
                    <h2 className="text-lg font-semibold mb-4">Add Saving</h2>
                    <input
                        type="number"
                        placeholder="Goal Amount"
                        value={formData.goalAmount}
                        onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900'}`}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Current Amount"
                        value={formData.currentAmount}
                        onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900'}`}
                        required
                    />
                    <input
                        type="date"
                        placeholder="Deadline"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900'}`}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Add Saving
                    </button>
                </form>

                <ul className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
                    {savings.map((saving) => (
                        <li
                            key={saving._id}
                            className={`p-6 shadow rounded-md flex flex-col items-start ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
                        >
                            <h3 className="text-lg font-semibold">Goal: ₹{saving.goalAmount}</h3>
                            <p>Current: ₹{saving.currentAmount}</p>
                            <p>Deadline: {new Date(saving.deadline).toLocaleDateString()}</p>
                            <p className={`text-sm mt-2 ${saving.status === "completed" ? "text-green-600" : saving.status === "missed" ? "text-red-600" : "text-yellow-500"}`}>
                                Status: {saving.status}
                            </p>
                            <button
                                onClick={() => handleUpdate(saving._id)}
                                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => deleteSaving(saving._id)}
                                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>

                {showPopUp && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
                        <div className="bg-white dark:bg-gray-800 p-6 shadow rounded-md w-full max-w-md relative">
                            <button
                                onClick={() => setShowPopUp(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                            <form onSubmit={updateSaving}>
                                <h2 className="text-lg font-semibold mb-4">Update Saving</h2>
                                <input
                                    type="number"
                                    placeholder="Goal Amount"
                                    value={editingSaving.goalAmount}
                                    onChange={(e) => setEditingSaving({ ...editingSaving, goalAmount: e.target.value })}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Current Amount"
                                    value={editingSaving.currentAmount}
                                    onChange={(e) => setEditingSaving({ ...editingSaving, currentAmount: e.target.value })}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                                <input
                                    type="date"
                                    placeholder="Deadline"
                                    value={extractDate(editingSaving.deadline)}
                                    onChange={(e) => setEditingSaving({ ...editingSaving, deadline: e.target.value })}
                                    className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                                >
                                    Update Saving
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Saving;
