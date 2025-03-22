
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Image } from "lucide-react";
import { useSelector } from "react-redux";
import { getSocket } from "../../lib/socket.js";
import { Loading } from "../index.js";

const ChatContainer = ({ user }) => {
    const userData = useSelector((state) => state.auth.userData);
    const mode = useSelector((state) => state.auth.mode);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagetopreview, setImageToPreview] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/chat/get-message/${user._id}`,
                    { withCredentials: true }
                );
                setMessages(response.data.message);
            } catch (error) {
                console.error(
                    "Error fetching messages:",
                    error.response?.data?.message || error.message
                );
            }
        };

        if (user) fetchMessages();
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const toggleImagePreviewer = (imageUrl) => {
        setImageToPreview(imageUrl);
    };

    function formatDateToDMY(isoDate) {
        const date = new Date(isoDate);
        return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}/${date.getFullYear()}`;
    }

    const sendMessage = async () => {
        if (!newMessage.trim() && !image) return;

        const formData = new FormData();
        formData.append("text", newMessage);
        if (image) {
            setLoading(true);
            formData.append("image", image);
        }
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/chat/send-message/${user._id}`,
                formData,
                { withCredentials: true }
            );

            if (response.data.message) {
                const newMsg = response.data.message;
                const socket = getSocket();
                if (socket) {
                    socket.emit("message", { room: user._id, message: newMsg });
                }
                setMessages((prev) => [...prev, newMsg]);
                setNewMessage("");
                setImage(null);
            }
        } catch (error) {
            console.error(
                "Error sending message:",
                error.response?.data?.message || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const socket = getSocket();
        if (socket) {
            socket.emit("join-room", user._id);
            socket.on("recieve-message", (data) => {
                if (user._id === data.senderId) {
                    setMessages((prevMessages) => [...prevMessages, data.message]);
                }
            });
        }
        return () => {
            if (socket) socket.off("recieve-message");
        };
    }, [user]);

    if (loading) return <Loading />;
    return (
        <>
            <div
                className={`flex flex-col h-full w-full shadow-md ${mode === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
                    } rounded-lg overflow-hidden`}
            >
                {/* Header */}
                <div
                    className={`flex items-center px-4 py-3 border-b ${mode === "dark" ? "border-gray-700" : "border-gray-200"
                        }`}
                >
                    <img
                        src={user.avatar || "/default-avatar.png"}
                        alt={user.username}
                        className="w-10 h-10 rounded-full border"
                    />
                    <h2 className="ml-3 text-lg font-semibold">{user.username}</h2>
                </div>

                {/* Messages */}
                <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.senderId === userData._id ? "justify-end" : "justify-start"
                                } mb-3`}
                        >
                            <div
                                className={`max-w-xs sm:max-w-md px-3 py-2 rounded-lg ${message.senderId === userData._id
                                    ? "bg-blue-500 text-white"
                                    : mode === "dark"
                                        ? "bg-gray-800 text-gray-300"
                                        : "bg-gray-200 text-gray-800"
                                    }`}
                            >
                                {message.text}
                                {message.image && (
                                    <img
                                        src={message.image}
                                        alt="Attached"
                                        className="mt-2 w-24 sm:w-32 h-24 sm:h-32 object-cover rounded-lg cursor-pointer"
                                        onClick={() => toggleImagePreviewer(message.image)}
                                    />
                                )}
                                <div className="text-[8px] text-right opacity-70">
                                    {formatDateToDMY(message.createdAt)}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef}></div>
                </div>

                {/* Input Area */}
                <div
                    className={`flex items-center px-2 py-2 border-t ${mode === "dark" ? "border-gray-700" : "border-gray-200"
                        }`}
                >
                    <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className={`flex-grow min-w-0 px-2 py-1 border rounded-lg focus:outline-none ${mode === "dark"
                            ? "bg-gray-800 border-gray-700 text-white focus:ring-blue-500"
                            : "border-gray-300 text-gray-700 focus:ring-blue-500"
                            }`}
                    />
                    <div className="flex-shrink-0 flex items-center ml-2 space-x-1">
                        <label className="p-2 cursor-pointer hover:opacity-80">
                            <Image
                                className={`w-5 h-5 ${mode === "dark" ? "text-white" : "text-blue-500"
                                    }`}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImage(e.target.files[0])}
                                className="hidden"
                            />
                        </label>
                        <button onClick={sendMessage} className="p-2 rounded-full hover:opacity-80">
                            <Send
                                className={`w-5 h-5 ${mode === "dark" ? "text-white" : "text-green-500"
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
            {imagetopreview && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
                    <div className="relative">
                        <button
                            onClick={() => toggleImagePreviewer(null)}
                            className="absolute top-2 right-2 text-white text-3xl font-bold hover:text-red-400"
                        >
                            &times;
                        </button>
                        <img
                            src={imagetopreview}
                            alt="Enlarged Preview"
                            className="max-w-full max-h-screen rounded-lg shadow-lg"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatContainer;
