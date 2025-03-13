
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loading } from './index.js'
import { login } from "../store/authSlice.js";
import { useDispatch, useSelector } from "react-redux";

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setloading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const mode = useSelector(state => state.auth.mode);

    const onSubmit = async (data) => {
        setloading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/users/login`, data, {
                withCredentials: true,
            });
            if (response) {
                dispatch(login(response.data.message));
                navigate("/");
            }
            setErrorMessage(null);
        } catch (error) {
            setErrorMessage(error.response?.data?.message || "Something went wrong. Please try again.");
        }
        finally {
            setloading(false);
        }
    };
    if (loading) {
        return <Loading />
    }
    return (
        <div className={`relative flex justify-center items-center min-h-screen px-4 sm:px-6 md:px-8 lg:px-10 overflow-hidden 
            ${mode === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>

            <div className="absolute inset-0">
                <div className="absolute top-10 left-10 w-40 h-40 md:w-72 md:h-72 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-48 h-48 md:w-80 md:h-80 bg-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>

            <div className={`relative z-10 shadow-lg rounded-xl w-full max-w-md p-6 md:p-8 transition duration-300 
                ${mode === "dark" ? "bg-gray-800 shadow-gray-700" : "bg-white shadow-gray-400"}`}>

                <h1 className="text-2xl md:text-3xl font-bold text-center mb-6">Login</h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                    message: "Invalid email address"
                                }
                            })}
                            className={`w-full px-3 py-2 border rounded-lg 
                                ${errors.email ? "border-red-500" : "border-gray-300"} 
                                focus:outline-none focus:ring-2 focus:ring-blue-500
                                ${mode === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
                            placeholder="Enter your email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                {...register("password", { required: "Password is required" })}
                                className={`w-full px-3 py-2 border rounded-lg 
                                    ${errors.password ? "border-red-500" : "border-gray-300"} 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500
                                    ${mode === "dark" ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-900"}`}
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
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    {errorMessage && <div className="text-red-500 text-sm mt-2 text-center">{errorMessage}</div>}

                    <div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg 
                                hover:bg-blue-600 transition duration-300"
                        >
                            Login
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400">
                        Don't have an account? {" "}
                        <Link to="/signup" className="text-blue-500 hover:text-blue-600">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
