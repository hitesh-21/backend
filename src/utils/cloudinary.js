import { v2 as cloudinary } from "cloudinary";
import fs from "fs"


// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });
          
cloudinary.config({ 
  cloud_name: 'dfmlxo695', 
  api_key: '969779955174411', 
  api_secret: 'dpw_uA_6dWbf1CKEzhDFKen7vXQ' 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        console.log('uploading !!!')
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uplaoded successfully
        console.log('file uplaoded sccuessfully on cloudinary' + response.url);
        console.log(response);
        return response
    } catch (error) {
        console.log('error while uploading');
        console.log(error)
        fs.unlinkSync(localFilePath)
        //  it will remove the locally saved fule as operation got some probelm
        return null;
    }
}

export {uploadOnCloudinary}