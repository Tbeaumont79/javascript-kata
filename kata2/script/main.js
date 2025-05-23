const API_URL = "https://dummyjson.com/posts";
const getInput = document.getElementById("search-id");
const mainElement = document.getElementsByTagName("main");

function arrayFilter(array, seachTerm) {
	return array.filter(
		(post) => post.title.includes(seachTerm) || post.body.includes(seachTerm)
	);
}
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

async function displayCards(parrentElem, posts) {
	parrentElem[0].innerHTML = "";
	posts.map((items) => {
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

getInput.addEventListener("input", async (e) => {
	const currentValue = e.target.value;
	const postDatas = await getPosts();
	const filteredArray = arrayFilter(postDatas, currentValue);
	displayCards(mainElement, filteredArray);
});

document.addEventListener("keydown", function (e) {
	const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
	const isCmdK =
		(isMac && e.metaKey && e.key === "k") ||
		(!isMac && e.ctrlKey && e.key === "k");

	if (isCmdK) {
		e.preventDefault();
		getInput.focus();
	}
});
async function init() {
	const posts = await getPosts();
	displayCards(mainElement, posts);
}
init();
