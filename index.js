const cheerio = require("cheerio");
const axios = require("axios");
const reader = require('xlsx')

// global variable
var searchURL
var links = []
var extractData = []
const file = reader.readFile('./data.xlsx')

// Reading our test file
readDataFromFile(file)
function readDataFromFile(file){
	let data = []
	const sheets = file.SheetNames
	for (let i = 0; i < sheets.length; i++) {
		const temp = reader.utils.sheet_to_json(
			file.Sheets[file.SheetNames[i]])
		temp.forEach((res) => {
			data.push(res)
		})
	}

	searchURL = data[0].search_url
}
function writeDataToFile(data, file){
	const outputFileName = "output-" + new Date().valueOf();
	const ws = reader.utils.json_to_sheet(data)
	reader.utils.book_append_sheet(file,ws, outputFileName)
	// Writing to our file
	reader.writeFile(file,'./data.xlsx')
}
	










// Request
axios.get(searchURL).then((res) => {
	const body = res.data;

	let $ = cheerio.load(body);

	// BigCardList
	$("#MainContentPlaceHolder_Panel1 .tnresult--card.jq-cardhover").each((i, element) => {
		const item = $(element).find(".relative").find("a").attr("href").trim()
		links.push(item)
	})

	// SmallCardList
	$("#MainContentPlaceHolder_Panel1 .tnresult--small--card.bottom_card").each((i, element) => {
		const item = $(element).find("a").attr("href").trim()
		links.push(item)
	})
	

	links.forEach((element) => {
		axios.get(element).then((res) => {
			let body = res.data
			let $ = cheerio.load(body);

			let phone = $(".inquiry--hdr--lt > .prem--owner--phn > p > a").html().trim()
			let contact = $(".inquiry--hdr--lt > h4").html().trim()
			let url = element

			extractData.push({contact, phone, url})


		})
	})

	writeDataToFile(extractData, file)

	
	
});


