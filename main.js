const getCookRecipy = async () => {
	try {
		const result = await fetch("https://dummyjson.com/recipes");
		const data = await result.json();
		const datasFiltered = data.recipes.map(
			({ name, cookTimeMinutes, difficulty, tags, image }) => ({
				name,
				cookTimeMinutes,
				difficulty,
				tags,
				image,
			})
		);
		return datasFiltered;
	} catch (error) {
		throw `error: when fetching data's ${error}`;
	}
};