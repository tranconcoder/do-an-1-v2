export const getErrorStr = (error: Error) => {
	return `${error.name}: ${error.message}`;
};
