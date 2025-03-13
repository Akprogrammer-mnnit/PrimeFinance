import { Message } from "../models/message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
const getUserForSideBar = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(404, "User not found");
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(401, "Invalid user ID");
    }

    const users = await Message.aggregate([
        {
            $match: {
                $or: [
                    { senderId: new mongoose.Types.ObjectId(userId) },
                    { receiverId: new mongoose.Types.ObjectId(userId) }
                ]
            }
        },
        {
            $sort: { createdAt: -1 } 
        },
        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiverDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $project: {
                senderDetails: { $arrayElemAt: ["$senderDetails", 0] },
                receiverDetails: { $arrayElemAt: ["$receiverDetails", 0] },
                createdAt: 1
            }
        },
        {
            $addFields: {
                userDetails: {
                    $cond: [
                        { $eq: ["$senderDetails._id", new mongoose.Types.ObjectId(userId)] },
                        "$receiverDetails",
                        "$senderDetails"
                    ]
                }
            }
        },
        {
            $group: {
                _id: "$userDetails._id", 
                userDetails: { $first: "$userDetails" },
                lastInteraction: { $max: "$createdAt" } 
            }
        },
        {
            $sort: { lastInteraction: -1 } 
        },
        {
            $project: {
                userDetails: 1
            }
        }
    ]);

    const uniqueUsers = users.map(user => user.userDetails);
    return res.status(200).json(
        new ApiResponse(200, uniqueUsers, "Users fetched successfully")
    );
});



const getMessages = asyncHandler(async (req, res) => {
    const { receiverId: userToChat } = req.params;
    if (!userToChat) {
        throw new ApiError(404, "User not found");
    }
    const myId = req.user?._id;
    if (!myId) {
        throw new ApiError(401, "Unauthorized user");
    }
    if (!mongoose.isValidObjectId(myId) || !mongoose.isValidObjectId(userToChat)){
        throw new ApiError(401, "Invalid user ID");
    }
    const messages = await Message.aggregate([
        {
            $match: {
                $or: [
                    { senderId: myId, receiverId: new mongoose.Types.ObjectId(userToChat) },
                    { senderId: new mongoose.Types.ObjectId(userToChat), receiverId: myId }
                ]
            }
        },
        {
            $sort: { createdAt: 1 } 
        }
    ]);
    return res.status(200).json(
        new ApiResponse(200, messages, "Messages retrieved successfully")
    );
});


const sendMessage = asyncHandler(async(req,res)=> {
    const {text} = req.body
    const {receiverId} = req.params;
    if (!receiverId){
        throw new ApiError(404,"Receiver not found");
    }
    const content= {};
    if (text && text.trim()!==''){
        content.text = text;
    }
    const imageLocalPath = req.file?.path;
    if (imageLocalPath) {
        const image = await uploadOnCloudinary(imageLocalPath);
        if (!image) {
            throw new ApiError(500, "Problem while uploading the image");
        }
        content.image = image.url;
    }
    if (Object.keys(content).length === 0) {
        return res.status(400).json(
            new ApiResponse(400, "No content provided")
        )
    }
    content.receiverId = receiverId
    content.senderId = req.user?._id
    const message = await Message.create(content)
    if (!message){
        throw new ApiError(500,"Failed to send message")
    }
    return res.status(200).json(
        new ApiResponse(200,message,"Message sent successfully")
    )
})

export {
    getUserForSideBar,
    getMessages,
    sendMessage,
 
}