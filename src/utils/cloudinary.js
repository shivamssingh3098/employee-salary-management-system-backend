const cloudinary = require("cloudinary").v2;

const fs = require("fs");

exports.uploadOnCloudinary = async (localFilePath) => {
  try {
    cloudinary.config({
      cloud_name: "dm6zltpzm",
      api_key: "385278456424974",
      api_secret: "KLLak1RknInIRL3_DBLoaZzDrRc",
    });
    if (!localFilePath) return null;
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    console.log("file uploaded successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.log("not uploaded", error);
    fs.unlinkSync(localFilePath); // remove the locally saved temporary files as the upload operation got failed
    return null;
  }
};
