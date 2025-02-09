import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: "dgmbchnny",
  api_key: "613898336592129",
  api_secret: "Hab83hFpcKEX1t1zAQLgmZOjMzE",
});

export default cloudinary;
