"use strict";
const cheerio = require("cheerio");
const axios = require("axios");
const xlsx = require("xlsx");
const prompt = require("prompt-sync")();
const fs = require("fs");

// global variable
// const searchURL = "https://www.affordablehousing.com/jacksonville-fl-32209/";
const searchURL = prompt("Enter the search URL: ");
const links = [];
const extractData = [];

// Request
axios.get(searchURL).then((res) => {
	const body = res.data;

	let $ = cheerio.load(body);

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
	$("#MainContentPlaceHolder_Panel1 .tnresult--small--card.bottom_card").each(
		(i, element) => {
			const item = $(element).find("a").attr("href").trim();
			links.push(item);
		}
	);
	let count = 1;
	links.forEach((element, index) => {
		axios.get(element).then((res) => {
			let body = res.data;
			let $ = cheerio.load(body);

			let phone = $(".inquiry--hdr--lt > .prem--owner--phn > p > a")
				.html()
				.trim();
			let contact = $(".inquiry--hdr--lt > h4").html().trim();
			let url = element;

			extractData.push({ Contact: contact, Phone: phone, URL: url });

			console.log("[" + count + "/" + links.length + "]");
			count += 1;

			if (extractData.length == links.length) {
				// fs.writeFileSync("New_Data.json", JSON.stringify(extractData));
				const newWB = xlsx.utils.book_new();
				const newWS = xlsx.utils.json_to_sheet(extractData);
				xlsx.utils.book_append_sheet(newWB, newWS, "New_Data");
				xlsx.writeFile(newWB, "New_Data.xlsx");
				console.log("Done ✔");
			}
		});
	});
});
