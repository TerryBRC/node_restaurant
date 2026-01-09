const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Error de validación de Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Error de validación',
            details: err.errors.map(e => ({
                campo: e.path,
                mensaje: e.message
            }))
        });
    }

    // Error de clave única duplicada
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Ya existe un registro con estos datos',
            campo: err.errors[0]?.path
        });
    }

    // Error de clave foránea
    if (err.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({
            error: 'Referencia inválida a otro registro'
        });
    }

    // Error de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token inválido'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expirado'
        });
    }

    // Error personalizado
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    // Error genérico
    res.status(500).json({
        error: 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
};

export default errorHandler;
