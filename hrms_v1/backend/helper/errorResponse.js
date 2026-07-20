export default function errorResponse(res, statusCode = 500, message = "Something went wrong", error = null) {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(error && { error })
    })
}
