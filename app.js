const axios = require("axios");
const cheerio = require("cheerio");
const xlsx = require("xlsx");

// global variable
const searchUrls = [];
const links = [];
const extractData = [];
// Reading our Input_Data.xlsx file
const file = xlsx.readFile("./Input_Data.xlsx");
const sheets = file.SheetNames;
sheets.forEach((res, index) => {
	const temp = xlsx.utils.sheet_to_json(file.Sheets[file.SheetNames[index]]);
	temp.forEach((res) => {
		searchUrls.push(res.URL.toString().trim());
	});
});

////////////// Step-1
let step1Processed = 0;
searchUrls.forEach(async (item, index, array) => {
	// Request
	let response = await axios.get(item);
	let html = response.data;
	let $ = cheerio.load(html);

	console.log(
		`getting data url from search urls [${step1Processed + 1}/${
			searchUrls.length
		}]`
	);
	try {
		// BigCardList
		$("#MainContentPlaceHolder_Panel1 .tnresult--card.jq-cardhover").each(
			(i, element) => {
				const item = $(element)
					.find(".relative")
					.find("a")
					.attr("href")
					.trim();
				links.push(item);
			}
		);
		// SmallCardList
		$(
			"#MainContentPlaceHolder_Panel1 .tnresult--small--card.bottom_card"
		).each((i, element) => {
			const item = $(element).find("a").attr("href").trim();
			links.push(item);
		});
	} catch (err) {
		console.error(err);
	}

	step1Processed++;
	if (step1Processed === array.length) {
		step2();
	}
});

////////////// Step-2
function step2() {
	let step2Processed = 0;
	links.forEach(async (item, index, array) => {
		// Request
		let response = await axios.get(item);
		let html = response.data;
		let $ = cheerio.load(html);

		console.log(
			`getting data from data urls [${step2Processed + 1}/${
				links.length
			}]`
		);

		try {
			let phone = $(".inquiry--hdr--lt > .prem--owner--phn > p > a")
				.text()
				.split("\n")[1]
				.trim();
			let contact = $(".inquiry--hdr--lt > h4")
				.text()
				.split("\n")[1]
				.trim();
			let url = item;
			extractData.push({ Contact: contact, Phone: phone, URL: url });
		} catch (err) {
			console.error(err);
		}

		step2Processed++;
		if (step2Processed === array.length) {
			step3();
		}
	});
}

////////////// Step-3
function step3() {
	console.log("\nSaving Data to New_Data.xlsx");
	// Writing our New_Data.xlsx file
	const newWB = xlsx.utils.book_new();
	const newWS = xlsx.utils.json_to_sheet(extractData);
	xlsx.utils.book_append_sheet(newWB, newWS, "New_Data");
	xlsx.writeFile(newWB, "./New_Data.xlsx");
	console.log("All Done ✔");
	console.log(
		'Please copy "New_Data.xlsx" to any safe area. next time it will overwrite!'
	);
}
