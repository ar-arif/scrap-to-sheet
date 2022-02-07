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

	try {
		console.log(
			`Requesting Search URL [${step1Processed + 1}/${searchUrls.length}]`
		);
		let cardNum = 0;
		// BigCardList
		$("#MainContentPlaceHolder_Panel1 .tnresult--card.jq-cardhover").each(
			(i, element, array) => {
				const item = $(element)
					.find(".relative")
					.find("a")
					.attr("href")
					.trim();
				links.push(item);
				cardNum += 1;
			}
		);
		// SmallCardList
		$(
			"#MainContentPlaceHolder_Panel1 .tnresult--small--card.bottom_card"
		).each((i, element, array) => {
			const item = $(element).find("a").attr("href").trim();
			links.push(item);
			cardNum += 1;
		});
		console.log(`└── Collected Data's URL [${cardNum}]\n`);
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

		try {
			console.log(
				`├── Collecting Data [${step2Processed + 1}/${links.length}]`
			);
			let data = {};
			let url = item;
			data["URL"] = url;
			let phone = $(".inquiry--hdr--lt > .prem--owner--phn > p > a")
				.text()
				.split("\n")[1]
				.trim();
			let contact = $(".inquiry--hdr--lt > h4")
				.text()
				.split("\n")[1]
				.trim();
			let infoType = $("#divsinglePropertyDetail > ul > li > small")
				.map((index, item) => $(item).text().trim())
				.get();
			let infoVal = $("#divsinglePropertyDetail > ul > li > span")
				.map((index, item) => $(item).text().trim())
				.get();

			// location
			let address = $(
				"#propertyDetailMainContainer > div > div.prop--dtl--lt > div.breadcrumbs--container > div > span"
			)
				.text()
				.trim();
			let basename = $(
				"#propertyDetailMainContainer > div > div.prop--dtl--lt > div.breadcrumbs--container > div > a:nth-child(3)"
			)
				.attr("basename")
				.trim();

			let statecode = $(
				"#propertyDetailMainContainer > div > div.prop--dtl--lt > div.breadcrumbs--container > div > a:nth-child(3)"
			)
				.attr("statecode")
				.trim();
			let location = `${address} in ${basename}, ${statecode}`;
			data["Contact Name"] = contact;
			data["Phone Number"] = phone;
			data["Location"] = location;

			for (let i = 0; i < infoType.length; i++) {
				data[infoType[i]] = infoVal[i];
			}
			let detailsType = $(
				"#pdpDetails > div.prop--cont--blk > ul > li > div.dtls--opt--cont > small"
			)
				.map((index, item) => $(item).text().trim())
				.get();
			let detailsVal = $(
				"#pdpDetails > div.prop--cont--blk > ul > li > div.dtls--opt--cont > span"
			)
				.map((index, item) => $(item).text().trim())
				.get();

			for (let i = 0; i < detailsType.length; i++) {
				data[detailsType[i]] = detailsVal[i];
			}

			extractData.push(data);
		} catch (err) {
			console.error(err);
		}

		step2Processed++;
		if (step2Processed === array.length) {
			step3(extractData);
		}
	});
}

////////////// Step-3
function step3(finalData) {
	// Writing our New_Data.xlsx file
	const newWB = xlsx.utils.book_new();
	const newWS = xlsx.utils.json_to_sheet(finalData);
	xlsx.utils.book_append_sheet(newWB, newWS, "New_Data");
	xlsx.writeFile(newWB, "./New_Data.xlsx");
	console.log("\nAll Done ✔");
	console.log(
		'Please copy "New_Data.xlsx" to any safe area. next time it will overwrite!'
	);

	console.log("Press enter key to exit!");
	if (process.stdin.isTTY) {
		process.stdin.setRawMode(true);
	}
	process.stdin.resume();
	process.stdin.on("data", process.exit.bind(process, 0));
}
