import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken = async(userId)=>{
    const user = await User.findById(userId);
    if (!user){
        throw new ApiError(404,"User not found")
    }
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return {accessToken, refreshToken};
}
const registerUser = asyncHandler(async (req,res)=> {
    // console.log(req.body)
    const {email,password,username} = req.body
    if (!email || !password || !username || email.trim()==="" || username.trim()==="" || password.trim()==="" ) {
        throw new ApiError(404,"All fields are required")
    }
    
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(401,"User with already exists")
    }
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath){
        throw new ApiError(404,"Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar){
        throw new ApiError(501,"Error while uploading avatar");
    }
    const user = await User.create({
        email: email,
        username: username,
        password: password,
        avatar: avatar.url
    })
    const newUser = await User.findById(user?._id).select("-password -refreshToken")
    if (!newUser){
        throw new ApiError(500,"Something went wrong while registering user");
    }
    return res.status(200).json(
        new ApiResponse(200,newUser,"User registered successfully")
    )
})

const loginUser = asyncHandler(async (req,res)=>{
    // console.log(req.body);
    const {email,password} = req.body;
    if (!email || !password){
        throw new ApiError(404,"Email or password is required");
    } 
    const user = await User.findOne({email});
    if (!user){
        throw new ApiError(404,"User does not exist")
    }
    const checkPassword = await user.isPasswordCorrect(password);
    if (!checkPassword){
        throw new ApiError(401,"Invalid  password")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if (!loggedInUser){
        throw new ApiError(500,"Something went wrong while logging in user");
    }
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ Ensures HTTPS in production
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // ✅ Allows cross-origin cookies
    };
    
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user: loggedInUser,
            accessToken,
            refreshToken,
        },"User logged in successfully")
    )
})
const logoutUser = asyncHandler(async(req,res)=> {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshTokens: 1,
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User Logged Out Successfully"))
})
const RefreshAccessToken = asyncHandler(async(req, res)=>{
    const incommingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if (!incommingRefreshToken){
        throw new ApiError(401,"UnAuthorized request");
    }
    try {
        const decodedToken =  jwt.verify(incommingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user){
            throw new ApiError(401,"Invalid refresh token");
        }
        if (incommingRefreshToken !== user.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshToken(user._id);
        console.log(newrefreshToken);
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(200,
                {
                    accessToken,
                    refreshToken: newrefreshToken
                },
                "Refreshing access token Successfully")
            )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token");
    }
}) 
const changePassword = asyncHandler(async(req,res)=> {
    const {oldPassword,newPassword} = req.body;
    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400,"Password is incorrect");
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200).json(
        new ApiResponse(200, {},"Password changed successfully")
    )
})
const updateUserAvatar = asyncHandler(async(req,res)=> {
    const avatarPath = req.file?.path
    if (!avatarPath){
        throw new ApiError(400,"Avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarPath)
    if (!avatar.url){
        throw new ApiError(400,"Error while uploading avatar")
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatar.url
            }  
        },
        {new: true}
    ).select("-password -refreshToken")
    return res.status(200).json(
        new ApiResponse(200,user,"User avatar updated successfully")
    )
})


const getAllUser = asyncHandler(async (req, res) => {
    const { query } = req.query;

    const pipeline = [];

    if (query) {
        pipeline.push({
            $match: {
                $or: [
                    { email: { $regex: query, $options: "i" } },
                    { username: { $regex: query, $options: "i" } },
                ],
            },
        });
    }
    pipeline.push({
        $project: {
            _id: 1,
            email: 1,
            username: 1,
            avatar: 1,
        },
    });
    const users = await User.aggregate(pipeline);

    const totalUsers = await User.countDocuments(
        query
            ? {
                  $or: [
                      { email: { $regex: query, $options: "i" } },
                      { username: { $regex: query, $options: "i" } },
                  ],
              }
            : {}
    );

    if (users.length === 0) {
        return res.status(200).json(new ApiResponse(200, {}, "No users found"));
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                users,
                totalUsers,
            },
            "Users fetched successfully"
        )
    );
});

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new ApiResponse(200,req.user,"User send successfully"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    RefreshAccessToken,
    changePassword,
    updateUserAvatar,
    getAllUser,
    getCurrentUser,
}