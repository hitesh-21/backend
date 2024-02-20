import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import pkg from 'jsonwebtoken';
import { User } from "../models/user.model.js"
const { Jwt } = pkg;
export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        const decodedToken = await Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
    
            //will discuss about frontend in next video
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user=user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.msg||"error in auth middleware catch block")
    }
    
})