export const validate = (schema, source = 'body') => (req, res, next) => {
    const result = schema.safeParse(req[source])
    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: result.error.flatten().fieldErrors
        })
    }
    req.validated = result.data
    next()
}
