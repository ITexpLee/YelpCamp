//If we directly say module.export it means the class will be sent inside an object with key = className
module.exports = func => {
    return (req, res, next) => {
        func(req, res, next).catch(e => next(e));
    }
}