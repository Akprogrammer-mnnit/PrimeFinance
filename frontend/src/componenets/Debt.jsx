
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const Debt = () => {
  const [debts, setDebts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const mode = useSelector(state => state.auth.mode);
  const [newDebt, setNewDebt] = useState({
    debtAmount: "",
    interestRate: "",
    debtTakenDate: "",
    debtPayingDate: "",
    amountPaid: "",
    debtTakenFromName: "",
  });
  const [editingDebt, setEditingDebt] = useState({
    _id: "",
    debtAmount: "",
    interestRate: "",
    debtTakenDate: "",
    debtPayingDate: "",
    amountPaid: "",
    debtTakenFromName: "",
  });
  const [showUpdatePopUp, setShowUpdatePopup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const userData = useSelector(state => state.auth.userData);
  const extractDate = (dateString) => {
    return dateString ? dateString.split("T")[0] : "";
  };
  const formatDate = (date) => {

    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDebt((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  const handleInputChangeUpdate = (e) => {
    const { name, value } = e.target;
    setEditingDebt((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formattedDebt = {
        ...newDebt,
        debtTakenDate: formatDate(newDebt.debtTakenDate),
        debtPayingDate: formatDate(newDebt.debtPayingDate),
      };
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/debt/create-debt`, formattedDebt, {
        withCredentials: true,
      });
      setDebts((prevState) => [...prevState, response.data.message]);
      setNewDebt({
        debtAmount: "",
        interestRate: "",
        debtTakenDate: "",
        debtPayingDate: "",
        amountPaid: "",
        debtTakenFromName: "",
      });
    } catch (error) {
      setError("Failed to create debt");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (debtId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/debt/delete-debt/${debtId}`, {
        withCredentials: true,
      });
      setDebts(debts.filter((debt) => debt._id !== debtId));
    } catch (error) {
      setError("Failed to delete debt");
    }
  };


  const calculateTotalDebt = (debtAmount, interestRate) => {
    return debtAmount + (debtAmount * interestRate) / 100;
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-300 text-yellow-800";
      case "Paid":
        return "bg-green-300 text-green-800";
      case "Overdue":
        return "bg-red-300 text-red-800";
      default:
        return "bg-gray-200 ";
    }
  };

  useEffect(() => {
    const fetchDebts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/debt/`, {
          params: { page: currentPage, query: searchQuery, userId: userData?._id },
          withCredentials: true,
        });
        setDebts(response.data.message.debts);
        setTotalPages(response.data.message.totalPages);
      } catch (error) {
        console.log("Failed to fetch debts: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDebts();
  }, [currentPage, searchQuery, userData]);

  const handleEdit = async (debtId) => {
    await axios.get(`${import.meta.env.VITE_BACKEND_URL}/debt/getDebtById/${debtId}`, {
      withCredentials: true,
    })
      .then((response) => {
        if (response) {
          setShowUpdatePopup(true);
          setEditingDebt({
            _id: response.data.message._id,
            debtAmount: response.data.message.debtAmount,
            interestRate: response.data.message.interestRate,
            debtTakenDate: extractDate(response.data.message.debtTakenDate),
            debtPayingDate: extractDate(response.data.message.debtPayingDate),
            amountPaid: response.data.message.amountPaid,
            debtTakenFromName: response.data.message.debtTakenFromName,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to fetch debt: ", error);
      })
  }
  const handleUpdate = async () => {
    await axios.post(`${import.meta.env.VITE_BACKEND_URL}/debt/update-debt/${editingDebt._id}`, editingDebt, {
      withCredentials: true,
    })
      .then((response) => {
       
        setDebts((prevDebts) =>
          prevDebts.map((debt) =>
            debt._id === response.data.message._id ? { ...debt, ...response.date.message } : debt
          )
        );
        setShowUpdatePopup(false);
      })
      .catch((error) => {
        console.error("Failed to update debt: ", error);
      })
  }

  return (
    <div className={`${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} container mx-auto p-4 md:p-6`}>
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 text-blue-600">Manage Debts</h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-100 p-2 rounded-md">{error}</div>
      )}

      {/* Create Debt Form */}
      <div className={`max-w-lg mx-auto mb-8 p-4 md:p-6 rounded-lg shadow-md ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-blue-600">Create Debt</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['debtAmount', 'interestRate', 'debtTakenDate', 'debtPayingDate', 'amountPaid', 'debtTakenFromName'].map((field) => (
            <div key={field}>
              <label className="block text-sm md:text-base mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
              <input
                type={field.includes('Date') ? 'date' : field === 'interestRate' || field === 'debtAmount' ? 'number' : 'text'}
                name={field}
                value={newDebt[field]}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${mode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                required={!['amountPaid'].includes(field)}
                min={field === 'interestRate' || field === 'debtAmount' ? "0" : undefined}
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? "Processing..." : "Create Debt"}
          </button>
        </form>
      </div>

      {/* Search Input */}
      <div className="mb-6 px-2 md:px-0">
        <input
          type="text"
          placeholder="Search debts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full px-4 py-2 rounded-md ${mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`}
        />
      </div>

      {/* Debts List */}
      <div className="px-2 md:px-0">
        <h2 className="text-xl md:text-2xl font-semibold mb-4">Your Debts</h2>
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debts.length > 0 ? (
              debts.map((debt) => (
                <div key={debt._id} className={`p-4 rounded-lg shadow-md ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="space-y-3">
                    <h3 className="text-lg md:text-xl font-semibold text-blue-600">{debt.debtTakenFromName}</h3>
                    <div className="space-y-2 text-sm md:text-base">
                      <p>Amount: ₹{debt.debtAmount}</p>
                      <p>Interest Rate: {debt.interestRate}%</p>
                      <p>Remaining: ₹{calculateTotalDebt(debt.debtAmount, debt.interestRate) - debt.amountPaid}</p>
                      <p>Paid: ₹{debt.amountPaid}</p>
                      <p>Taken: {new Date(debt.debtTakenDate).toLocaleDateString()}</p>
                      <p>Due: {new Date(debt.debtPayingDate).toLocaleDateString()}</p>
                      <span className={`inline-block py-1 px-3 rounded-full text-sm ${getStatusColor(debt.status)}`}>
                        {debt.status}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2 mt-4">
                      <button
                        onClick={() => handleDelete(debt._id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleEdit(debt._id)}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center col-span-full">No debts found.</p>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-center items-center mt-6 gap-4 px-2 md:px-0">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="w-full md:w-auto px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-sm md:text-base">Page {currentPage} of {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="w-full md:w-auto px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Update Modal */}
      {showUpdatePopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className={`${mode === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg w-full max-w-lg p-4 md:p-6`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Debt</h2>
              <button
                onClick={() => setShowUpdatePopup(false)}
                className="text-2xl hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              {Object.keys(editingDebt).map((key) => (
                key !== '_id' && (
                  <div key={key}>
                    <label className="block text-sm mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <input
                      type={key.includes('Date') ? 'date' : key === 'interestRate' || key === 'debtAmount' ? 'number' : 'text'}
                      name={key}
                      value={editingDebt[key]}
                      onChange={handleInputChangeUpdate}
                      className={`w-full px-3 py-2 border rounded-md ${mode === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      required={!['amountPaid'].includes(key)}
                      min={key === 'interestRate' || key === 'debtAmount' ? "0" : undefined}
                    />
                  </div>
                )
              ))}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                {loading ? "Processing..." : "Update Debt"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debt;
