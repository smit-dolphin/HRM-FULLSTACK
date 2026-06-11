import errorResponse from "../helper/errorResponse.js"

export default function autherize(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 403, "forbidden", "you are not authorized to access this route")
        }
        next()
    }
}
