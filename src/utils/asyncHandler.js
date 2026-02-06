const asyncHandler = (requsetHandler) => {
    (req,res,next) => {
        Promise.resolve(requsetHandler(req,res,next)).catch((err) => next(err))
    }
}

/*const asyncHandler = (fn)=> async(req,res,next) => {//Here the next is for going to next middleware and fn is function passed to callback
    try{
        await fn(req,res,next)
    }catch(err){
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}*/


export default asyncHandler