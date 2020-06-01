const fs = require("fs");

const pa11y = require("pa11y");
const htmlReporter = require("pa11y-reporter-html");
const puppeteer = require("puppeteer");

testGithub();

async function testGithub() {
  let browser;
  let pages;
  try {
    // Launch our own browser
    browser = await puppeteer.launch();

    // Create a page for the test runs
    // (Pages cannot be used in multiple runs)
    pages = [await browser.newPage(), await browser.newPage()];

    const result1 = await pa11y("https://github.com/login/", {
      browser,
      page: pages[0],
      actions: [
        "set field #login_field to <username>",
        "set field #password to <password>",
        "click element .btn",
        
        // To test for primero replace the above three lines with
        // "set field input[name='user_name'] to primero",
        // "set field input[name='password'] to primer0!",
        // "click element button[type=submit]",
      ],
    });

    // Test http://example.com/otherpage/ with our shared browser
    const result2 = await pa11y("https://github.com/", {
      browser,
      page: pages[1],
    });

    fs.writeFileSync("./result1.html", await htmlReporter.results(result1));
    fs.writeFileSync("./result2.html", await htmlReporter.results(result2));

    // Close the browser instance and pages now we're done with it
    for (const page of pages) {
      await page.close();
    }
    await browser.close();
  } catch (error) {
    // Output an error if it occurred
    console.error(error.message);

    // Close the browser instance and pages if theys exist
    if (pages) {
      for (const page of pages) {
        await page.close();
      }
    }
    if (browser) {
      await browser.close();
    }
  }
}
