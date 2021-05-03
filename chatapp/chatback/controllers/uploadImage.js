const { cloudinary } = require("../utils/cloudinary");

const handleUploadImage = async (req, res) => {
  try {
    const { base64EncodedImage } = req.body;
    const uploadedResponse = await cloudinary.uploader.upload(
      base64EncodedImage,
      {
        upload_preset: "dev_setups",
      }
    );
    console.log("image uploaded", uploadedResponse.public_id);
    res.json(uploadedResponse.public_id);
  } catch (error) {
    console.log("IMAGE ERROR", error);
    res.status(500).json({ err: "Somthing get worng" });
  }
};

module.exports = {
  handleUploadImage: handleUploadImage,
};
