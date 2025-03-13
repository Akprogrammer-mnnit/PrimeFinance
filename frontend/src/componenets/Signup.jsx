
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loading } from './index.js'
const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [avatar, setAvatar] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        setLoading(true);
        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("username", data.username);
        formData.append("password", data.password);
        if (avatar) {
            formData.append("avatar", avatar);
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/users/register`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response.status === 200) {
                navigate("/login");
            } else {
                setError(response.data.message || "Registration failed");
            }
        } catch (error) {
            console.error("Error during registration:", error);
            setError("An error occurred during registration. Please try again.");
        }
        finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) setAvatar(file);
    };
    if (loading) {
        return <Loading />;
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 px-4">
            <div className="bg-white shadow-lg rounded-lg max-w-sm w-full p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Sign Up
                </h1>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email address",
                                },
                            })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                            placeholder="Enter your email"
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            {...register("username", { required: "Username is required" })}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.username ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                            placeholder="Enter your username"
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Avatar */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Avatar Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="w-full px-3 py-2 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {avatar && (
                            <div className="mt-2 flex justify-center">
                                <img
                                    src={URL.createObjectURL(avatar)}
                                    alt="Avatar Preview"
                                    className="w-16 h-16 rounded-full object-cover border border-gray-300"
                                />
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", { required: "Password is required" })}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                    }`}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-2 text-gray-500 hover:text-blue-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-500 hover:text-blue-600">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
