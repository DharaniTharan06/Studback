const errorHandler = (err, req, res, next) => {
    res.status(err.statuscode || 500).json({
        success: false,
        message: err.message,
        errors: err.errors || [],
        data: null,
    });
};

export default errorHandler;