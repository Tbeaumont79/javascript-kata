const getCookRecipe = async () => {
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

const createAndAppendChildElement = (tagName, propertyName, value, parent) => {
	const element = document.createElement(tagName);
	if (propertyName && value !== undefined) {
		element[propertyName] = value;
	}
	parent.appendChild(element);
	return element;
};

const displayRecipes = async () => {
	const cookRecipe = await getCookRecipe();
	const mainContent = document.querySelector("main");
	const section = document.createElement("section");

	cookRecipe.forEach((item) => {
		const article = document.createElement("article");
		createAndAppendChildElement("h2", "textContent", item.name, article);
		createAndAppendChildElement("img", "src", item.image, article);

		const ul = document.createElement("ul");
		createAndAppendChildElement("li", "textContent", item.difficulty, ul);
		createAndAppendChildElement("li", "textContent", item.cookTimeMinutes, ul);
		item.tags.map((elem) => {
			createAndAppendChildElement("li", "textContent", elem, ul);
		});
		createAndAppendChildElement("li", "textContent", item.difficulty, ul);
		article.appendChild(ul);
		section.appendChild(article);
	});
	mainContent.appendChild(section);
};
displayRecipes();
