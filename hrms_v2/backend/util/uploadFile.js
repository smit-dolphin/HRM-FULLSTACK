import path from "path"
import cloudinary from "../config/claudinary.config.js"
import fs from "fs"


export default async function uploadFile(file) {

    const directPath = process.cwd()

    const uploadpath=path.join(directPath, 'uploads', file.filename)
    const result = await cloudinary.v2.uploader.upload(uploadpath)
    fs.unlinkSync(uploadpath)
    return result
}