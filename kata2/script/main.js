const API_URL = "https://dummyjson.com/posts";

async function getPosts() {
	try {
		const result = await fetch("https://dummyjson.com/posts");
		const data = await result.json();
		return data;
	} catch (error) {
		throw new Error(`Error in getPosts : ${error}`);
	}
}
