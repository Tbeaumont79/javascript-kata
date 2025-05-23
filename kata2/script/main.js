const API_URL = "https://dummyjson.com/posts";

async function getPosts() {
	try {
		const result = await fetch("https://dummyjson.com/posts");
		const data = await result.json();
		const filteredData = data.posts.map(
			({ id, title, body, reactions, tags }) => ({
				id,
				title,
				body,
				reactions,
				tags,
			})
		);
		return filteredData;
	} catch (error) {
		throw new Error(`Error in getPosts : ${error}`);
	}
}

async function displayCards() {
	const mainElement = document.getElementsByTagName("main");
	const posts = await getPosts();
	await posts.map((items) => {
		console.log(items);
		postCard(mainElement, items.title, items.body, items.reactions, items.tags);
	});
}

async function postCard(mainElement, title, body, reactions, tags) {
	const section = document.createElement("section");
	mainElement[0].appendChild(section);
	section.innerHTML = `
	<div class="card bg-base-100 w-96 shadow-sm">
		<div class="card-body">
			<h2 class="card-title">
				${title}     
			</h2>
			<p>${body}</p>
			<div class="card-actions justify-end">
				<div class="badge badge-outline">${reactions.likes}</div>
				<div class="badge badge-outline">${reactions.dislikes}</div>
			</div>
			<div class="card-actions justify-end">
				${tags.map((item) => `<div class="badge badge-outline">${item}</div>`).join("")}
			</div>
		</div>
	</div>`;
}

displayCards();
