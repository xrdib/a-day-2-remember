const axios = require("axios").default;
const path = require("path");
const fs = require("fs");
const setPic = require("./getPic");
const genIndex = require("./genIndex");
const {
  generateMarkupLocal,
  generateMarkupRemote,
} = require("./generateMarkup");

// Hardcoded values for testing
const NAME = "Piyumi"; // Replace with the name of the recipient
const PIC = "sample-pic.jpeg"; // Replace with the image file name
const NICKNAME = "Buddy"; // Replace with a nickname
const HBD_MSG = "May your soul rest in peace"; // Replace with your greeting message
const SCROLL_MSG = "sample-scroll.txt"; // Replace with the text file containing the scroll message

// Debugging: Log values at the start
console.log("Debug Info:");
console.log("NAME:", NAME);
console.log("PIC:", PIC);
console.log("NICKNAME:", NICKNAME);
console.log("HBD_MSG:", HBD_MSG);
console.log("SCROLL_MSG:", SCROLL_MSG);

// Local initialization
const setLocalData = async () => {
  try {
    console.log("Starting local initialization...");
    const pic = path.join(__dirname, "../local/", PIC);
    console.log("PIC Path:", pic);

    let markup = "";
    if (SCROLL_MSG) {
      const text = fs.readFileSync(path.join(__dirname, "../local/", SCROLL_MSG), {
        encoding: "utf-8",
      });
      console.log("Scroll Message Content:", text);
      markup = generateMarkupLocal(text);
    }
    console.log("Generated Markup:", markup);

    await setPic(pic);
    console.log("Picture has been processed.");
    genIndex(markup);
    console.log("Index file has been generated.");
  } catch (e) {
    console.error("Error during local initialization:", e.message);
  }
};

// Remote initialization
const setRemoteData = async () => {
  try {
    console.log("Starting remote initialization...");
    console.log("Fetching picture from remote path:", PIC);

    let res = await axios.get(PIC, {
      responseType: "arraybuffer",
    });
    const pic = res.data;
    console.log("Fetched remote picture data.");

    let markup = "";
    if (SCROLL_MSG) {
      const article = SCROLL_MSG.split("/").pop();
      console.log("Fetching scroll message content from remote path...");
      res = await axios.get(
        `https://api.telegra.ph/getPage/${article}?return_content=true`
      );
      const { content } = res.data.result;
      console.log("Fetched scroll message content:", content);

      markup = content.reduce(
        (string, node) => string + generateMarkupRemote(node),
        ""
      );
    }
    console.log("Generated Markup:", markup);

    await setPic(pic);
    console.log("Picture has been processed.");
    genIndex(markup);
    console.log("Index file has been generated.");
  } catch (e) {
    console.error("Error during remote initialization:", e.message);
  }
};

// Determine mode of initialization
if (process.argv[2] === "--local") {
  console.log("Running in Local Mode...");
  setLocalData();
} else if (process.argv[2] === "--remote") {
  console.log("Running in Remote Mode...");
  setRemoteData();
} else {
  console.log("Fetch mode not specified.");
}