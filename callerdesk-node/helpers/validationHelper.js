// Helper function to validate required parameters
function validateRequired(params, paramNames) {
    paramNames.forEach(param => {
        if (!params[param] || params[param].trim() === '') {
            throw new Error(`${param} is required and cannot be empty`);
        }
    });
}

// Helper function to validate environment variables
function validateEnvironmentVars(vars) {
    vars.forEach(({ name, value }) => {
        if (!value) {
            throw new Error(`${name} environment variable is not configured`);
        }
    });
}

module.exports = {
    validateRequired,
    validateEnvironmentVars
};
