// A simple web crawler

const JSSoup = require("jssoup").default; // Allows us to parse html to search for data
const readline = require("readline"); // NodeJS core lib toget input from the terminal
const axios = require("axios"); // Used for HTTP requests
const maximumDepth = 3; // Max depth allows us to specify how deep the crawler should go into each URL trail
const urls = []; // We'll be storing our urls and corresponding depths in this array
const crawledUrls = []; // This will store the urls crawled so far

// Create a question interface
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// Request input from the user
rl.question("Starting URL? ", async function(starUrl) {
    // 0. Add start URL to url array with a depth of 0
    urls.push({ url: starUrl, depth: 0 });

    while (urls.length > 0) {
        try{
            // 1. Get HTML content of first URL in the array and remove it
            const [{ url, depth }] = urls.splice(0, 1);
            
            if (depth === maximumDepth) continue;
            
            const response = await axios.get(url);
            const { data } =  response;

            // 2. Add URL of site to urls array with its depth
            const soup = new JSSoup(data);
            const links = soup.findAll("a");
            urls.push(...links.map(l => {
                const link = l.attrs.href;
                if (link.startsWith("http")) return { url: link, depth: depth + 1 };
                else return { url: starUrl + link, depth: depth + 1 };
            }));

            // 3. Remove the first URL from te array and repeat 1 and 2 until max depth is reached
            crawledUrls.push(url);
            console.log(`Urls for next iteration: ${urls.length}`);
        } catch (err) {
            console.error(err);
        }
    }


    console.log(`Crawled URLs ${crawledUrls.length}`);
    for (const url of crawledUrls) console.log(url);
    console.log("Finished!!!");
});