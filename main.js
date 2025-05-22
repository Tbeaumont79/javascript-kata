const cookRecipy = async () => {
	try {
		const result = await fetch("https://dummyjson.com/recipes");
		const data = await result.json();
		console.log(data);
	} catch (error) {
		throw error;
	}
};
cookRecipy();
