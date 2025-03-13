
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Budget = () => {
    const [budgets, setBudgets] = useState([]);
    const [type, setType] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const userData = useSelector((state) => state.auth.userData);
    const mode = useSelector((state) => state.auth.mode);

    useEffect(() => {
        fetchBudgets();
    }, [currentPage, query]);

    const fetchBudgets = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/budget/`, {
                params: { page: currentPage, query, userId: userData?._id },
                withCredentials: true,
            });
            setBudgets(response.data.message.budgets);
            setTotalPages(response.data.message.totalPages);
        } catch (error) {
            console.error('Error fetching budgets:', error);
        }
    };

    const createBudget = async () => {
        if (type !== 'income' && type !== 'expense') {
            alert('Type must be "income" or "expense".');
            return;
        }

        try {
            await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/budget/create-budget`,
                { type, amount, category },
                { withCredentials: true }
            );
            fetchBudgets();
            setType('');
            setAmount('');
            setCategory('');
        } catch (error) {
            console.error('Error creating budget:', error);
        }
    };

    const deleteBudget = async (budgetId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/budget/delete-budget/${budgetId}`, { withCredentials: true });
            fetchBudgets();
        } catch (error) {
            console.error('Error deleting budget:', error);
        }
    };

    const getTypeColor = (type) => {
        return type === 'income' ? 'bg-green-600' : 'bg-red-600';
    };


    return (
        <div className={`container mx-auto p-4 transition-colors duration-300 ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Budget Management</h1>

            {/* Search Input */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search budgets..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border rounded-md px-4 py-2 w-full dark:bg-gray-800 dark:text-white"
                />
            </div>

            {/* Form Inputs - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="border rounded-md px-4 py-2 dark:bg-gray-800 dark:text-white"
                >
                    <option value="">Select Type</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => {
                        const value = e.target.value;
                        if (value >= 0 || value === '') {
                            setAmount(value);
                        }
                    }}
                    className="border rounded-md px-4 py-2 dark:bg-gray-800 dark:text-white"
                    min="0"
                />
                <input
                    type="text"
                    placeholder="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded-md px-4 py-2 dark:bg-gray-800 dark:text-white"
                />
            </div>

            {/* Create Button */}
            <div className="flex justify-center md:block">
                <button
                    onClick={createBudget}
                    className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 w-full md:w-auto"
                >
                    Create Budget
                </button>
            </div>

            {/* Budget Items */}
            <div className="mt-6">
                {budgets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {budgets.map((budget) => (
                            <div
                                key={budget._id}
                                className={`flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0 border rounded-md p-4 shadow-md ${getTypeColor(
                                    budget.type
                                )}`}
                            >
                                <div className="flex-1">
                                    <span className="text-lg font-bold text-white block">{budget.type}</span>
                                    <span className="text-white">{budget.category}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-white text-lg">
                                        {budget.type === 'income' ? null : '-'}₹{budget.amount}
                                    </span>
                                    <button
                                        onClick={() => deleteBudget(budget._id)}
                                        className="bg-red-300 text-[#333] px-3 py-1.5 rounded-md hover:bg-red-600 dark:bg-red-600 dark:text-white text-sm md:text-base"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center">No budgets found.</p>
                )}
            </div>

            {/* Pagination - Responsive Layout */}
            <div className="flex flex-col md:flex-row justify-center items-center mt-6 space-y-2 md:space-y-0 md:space-x-4">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-800 dark:text-white w-full md:w-auto"
                >
                    Previous
                </button>
                <span className="text-center">Page {currentPage} of {totalPages}</span>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50 dark:bg-gray-800 dark:text-white w-full md:w-auto"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Budget;