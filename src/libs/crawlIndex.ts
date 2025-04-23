import algoliasearch from "algoliasearch";
import { load } from "cheerio";

const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID ?? "";
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? "";
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX ?? "";

export const structuredAlgoliaHtmlData = async ({
	pageUrl = "",
	htmlString = "",
	title = "",
	type = "",
	imageURL = "",
}) => {
	try {
		const c$ = load(htmlString).text();
		const data = {
			objectID: pageUrl,
			title: title,
			url: pageUrl,
			content: c$.slice(0, 7000),
			type: type,
			imageURL: imageURL,
			updatedAt: new Date().toISOString(),
		};

		await addToAlgolia(data);
		return data;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log("error in structuredAlgoliaHtmlData", error);
	}
};

async function addToAlgolia(record: any) {
	try {
		const client = algoliasearch(appID, apiKEY);
		const index = client.initIndex(INDEX);

		await index.saveObject(record, {
			autoGenerateObjectIDIfNotExist: true,
		});
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log("error in addToAlgolia", error);
	}
}
