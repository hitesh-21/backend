import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const refreshToken = user.generateRefreshToken();
        const accessToken = user.generateAccessToken();

        user.refreshToken = refreshToken;
        user.save({ validateBeforeSave: false });


        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    //get user detail
    //validation not empty
    //check if user already exist ::usernam email
    //check  for images check fot avatar
    //upload to cloudinary,avatar
    //create user object :create entry in db
    // remove pass and refresh token  field from response
    // check for user creation
    // return response
    const { fullName, password, email, username } = req.body
    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");

    }
    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (existedUser) {
        throw new ApiError(409, "Username or email is existed")
    }

    // const avatarLocalPath =  req.files?.avatar[0].path;
    console.log(req.files)
    // const coverImageLocalPath =   req.files?.coverImage.path;
    // 

    // var avatarLocalPath;
    var coverImageLocalPath;
    if (req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
        avatarLocalPath = req.files.avatar[0].path;
    }

    // let avatarLocalPath

    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file local path is missing");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    console.log('value of avatar local path is given ' + avatarLocalPath)
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById({ _id: user._id }).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered sucessfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    //req-body username or email or password
    // find the user
    // passwoord check
    // access and refresh token 
    // send cookies

    const { email, username, password } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "Username or password is required");
    }
    const user = await User.findOne({ $or: [{ username }, { email }] })
    if (!user) {
        throw new ApiError(404, "user does not exist");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "password incorrect");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},"User Logged In Successfully")
    )
})

const logoutUser=asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:undefined
        }
    },{
        new:true
    })
    const options={
        httpOnly:true,
        secure:true
    }
    return res.status(200).clearCookie("refreshToken",options).clearCookie("accessToken",options)
    .json(new ApiResponse(200,{},"User logout"))
})


export { registerUser, loginUser,logoutUser }