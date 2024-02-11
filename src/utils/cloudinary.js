import { v2 as cloudinary } from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uplaoded successfully
        console.log('file uplaoded sccuessfully on cloudinary' + response.url);
        console.log(response);
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        //  it will remove the locally saved fule as operation got some probelm
        return null;
    }
}

export {uploadOnCloudinary}