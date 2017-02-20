module.exports = function getErrorHandler() {
	return function errorHandler(err, req, res, next) {
		let code = 500;
		let error = 'internal server error';

		// handles mongoose validation errors
		if (err.name === 'ValidationError' || err.name === 'CastError') {
			code = 400;
			error = err.errors.name.message;
		}
		else if (err.code) {
			code = err.code;
			error = err.error;
			console.log('this is not mongoose validation error: ', err.code, err.error);
		}
		else {
			console.log('got unexpected error: ', err);
		}

		res.status(code.send({error}));
	};
};