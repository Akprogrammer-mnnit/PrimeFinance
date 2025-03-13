import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from 'react-redux';

const SearchedUsers = () => {
    const userData = useSelector((state) => state.auth.userData)
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            const fetchUsers = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/users/`, { params: { query }, withCredentials: true });
                    if (response) {
                        setUsers(response.data.message.users.filter((user) => user._id !== userData._id) || []);
                    }
                } catch (error) {
                    console.error("Error fetching users:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [query]);

    const handleUserClick = (user) => {
        navigate("/chat", { state: { selectedUser: user } });
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            {loading && <p>Loading...</p>}
            {!loading && users.length === 0 && <p>No users found for "{query}".</p>}
            {!loading && users.length > 0 && (
                <div className="space-y-4">
                    {users.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleUserClick(user)}
                            className="flex items-center space-x-4 p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                            <img
                                src={user.avatar || "/default-avatar.png"}
                                alt={`${user.username}'s avatar`}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <span className="text-gray-800 font-semibold">{user.username}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchedUsers;
