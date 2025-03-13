
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const RecurringPayment = () => {
    const mode = useSelector((state) => state.auth.mode);
    const [recurringPayments, setRecurringPayments] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        frequency: 'monthly',
        startDate: '',
        endDate: '',
    });
    const [editingPayment, setEditingPayment] = useState({
        _id: '',
        title: '',
        amount: '',
        frequency: 'monthly',
        startDate: '',
        endDate: '',
    });
    const [showPopUp, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchRecurringPayments = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/recurringPayment/`,
                { withCredentials: true }
            );
            setRecurringPayments(response.data.message);
        } catch (error) {
            console.error(
                'Error fetching recurring payments:',
                error.response?.data?.message || error.message
            );
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/recurringPayment/create-recurringPayment`,
                formData,
                { withCredentials: true }
            );
            setRecurringPayments([...recurringPayments, response.data.message]);
            setFormData({ title: '', amount: '', frequency: 'daily', startDate: '', endDate: '' });
        } catch (error) {
            console.error(
                'Error creating recurring payment:',
                error.response?.data?.message || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (paymentId) => {
        try {
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/recurringPayment/delete-recurringPayment/${paymentId}`,
                { withCredentials: true }
            );
            setRecurringPayments((prev) =>
                prev.filter((payment) => payment._id !== paymentId)
            );
        } catch (error) {
            console.error(
                'Error deleting recurring payment:',
                error.response?.data?.message || error.message
            );
        }
    };

    useEffect(() => {
        fetchRecurringPayments();
    }, []);

    const extractDate = (dateString) => {
        return dateString ? dateString.split('T')[0] : '';
    };

    const handleEdit = async (paymentId) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/recurringPayment/get-recurringPaymentById/${paymentId}`,
                { withCredentials: true }
            );
            setEditingPayment(response.data.message);
            setShowPopup(true);
        } catch (error) {
            console.log(
                'Error fetching recurring payment:',
                error.response?.data?.message || error.message
            );
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/recurringPayment/update-recurringPayment/${editingPayment._id}`,
                editingPayment,
                { withCredentials: true }
            );
            const updatedPayments = recurringPayments.map((payment) =>
                payment._id === editingPayment._id
                    ? { ...payment, ...editingPayment }
                    : payment
            );
            setRecurringPayments(updatedPayments);
            setShowPopup(false);
        } catch (error) {
            console.error(
                'Error updating recurring payment:',
                error.response?.data?.message || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                } min-h-screen`}
        >
            <div className="container mx-auto p-6">
                <h1 className="text-2xl font-semibold mb-4">Recurring Payments</h1>
                <form
                    onSubmit={handleCreate}
                    className={`${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                        } p-6 shadow rounded-md mb-6 max-w-md mx-auto`}
                >
                    <h2 className="text-lg font-semibold mb-4">Create Recurring Payment</h2>
                    <input
                        type="text"
                        placeholder="Title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                            }`}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Amount"
                        value={formData.amount}
                        onChange={(e) =>
                            setFormData({ ...formData, amount: e.target.value })
                        }
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                            }`}
                        required
                    />
                    <select
                        value={formData.frequency}
                        onChange={(e) =>
                            setFormData({ ...formData, frequency: e.target.value })
                        }
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                            }`}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                    <input
                        type="date"
                        placeholder="Start Date"
                        value={formData.startDate}
                        onChange={(e) =>
                            setFormData({ ...formData, startDate: e.target.value })
                        }
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                            }`}
                        required
                    />
                    <input
                        type="date"
                        placeholder="End Date (Optional)"
                        value={formData.endDate}
                        onChange={(e) =>
                            setFormData({ ...formData, endDate: e.target.value })
                        }
                        className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
                            }`}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        {loading ? 'Saving...' : 'Create Recurring Payment'}
                    </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recurringPayments.map((payment) => (
                        <div
                            key={payment._id}
                            className={`p-4 shadow rounded ${mode === 'dark'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-50 text-gray-900'
                                }`}
                        >
                            <h3 className="font-semibold">{payment.title}</h3>
                            <p>Amount: ₹{payment.amount}</p>
                            <p>Frequency: {payment.frequency}</p>
                            <p>
                                Start Date:{' '}
                                {new Date(payment.startDate).toLocaleDateString()}
                            </p>
                            {payment.endDate && (
                                <p>
                                    End Date: {new Date(payment.endDate).toLocaleDateString()}
                                </p>
                            )}
                            <div className="mt-4 flex justify-between">
                                <button
                                    className="text-blue-500"
                                    onClick={() => handleEdit(payment._id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="text-red-500"
                                    onClick={() => handleDelete(payment._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {showPopUp && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
                        <div
                            className={`relative p-6 shadow rounded-md w-full max-w-md ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                                }`}
                        >
                            <button
                                onClick={() => setShowPopup(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                            <form onSubmit={handleUpdate} className="w-full">
                                <h2 className="text-lg font-semibold mb-4">
                                    Create Recurring Payment
                                </h2>
                                <input
                                    type="text"
                                    placeholder="Title"
                                    value={editingPayment.title}
                                    onChange={(e) =>
                                        setEditingPayment({
                                            ...editingPayment,
                                            title: e.target.value,
                                        })
                                    }
                                    className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-50 text-gray-900'
                                        }`}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Amount"
                                    value={editingPayment.amount}
                                    onChange={(e) =>
                                        setEditingPayment({
                                            ...editingPayment,
                                            amount: e.target.value,
                                        })
                                    }
                                    className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-50 text-gray-900'
                                        }`}
                                    required
                                />
                                <select
                                    value={editingPayment.frequency}
                                    onChange={(e) =>
                                        setEditingPayment({
                                            ...editingPayment,
                                            frequency: e.target.value,
                                        })
                                    }
                                    className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-50 text-gray-900'
                                        }`}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <input
                                    type="date"
                                    placeholder="Start Date"
                                    value={extractDate(editingPayment.startDate)}
                                    onChange={(e) =>
                                        setEditingPayment({
                                            ...editingPayment,
                                            startDate: e.target.value,
                                        })
                                    }
                                    className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-50 text-gray-900'
                                        }`}
                                    required
                                />
                                <input
                                    type="date"
                                    placeholder="End Date (Optional)"
                                    value={extractDate(editingPayment.endDate)}
                                    onChange={(e) =>
                                        setEditingPayment({
                                            ...editingPayment,
                                            endDate: e.target.value,
                                        })
                                    }
                                    className={`w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400 ${mode === 'dark'
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-gray-50 text-gray-900'
                                        }`}
                                />
                                <button
                                    type="submit"
                                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                                >
                                    {loading ? 'Saving...' : 'Update Recurring Payment'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecurringPayment;
