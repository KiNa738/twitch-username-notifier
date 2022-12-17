const puppeteer = require('puppeteer')
const fs = require('fs');
require('dotenv').config()
const notifier = require("node-notifier")

const TWITCH_URL = 'https://www.twitch.tv';
const PROFILE_URL = `${TWITCH_URL}/settings/profile`;
const USERNAME_INPUT_SELECTOR = '#signup-username';
const USERNAME_CHANGE_NAME_BUTTON = '#root > div > div > div > main > div > div > div > div > div > div > div:nth-child(6) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > button > div > div > div > div > div';
const USERNAME_AVAILABILITY_BUTTON_SELECTOR = 'body > div > div > div > div > div > div > div > div > div > div > form > div > div > button';
const cookies = [{
    'name': 'auth-token',
    'value': process.env.AUTH_TOKEN,
},
{
    'name': 'login',
    'value': process.env.LOGIN,
},
{
    'name': 'name',
    'value': process.env.NAME,
},
{
    'name': 'api_token',
    'value': process.env.API_TOKEN,
},
{
    'name': 'twilight-user',
    'value': process.env.TWILIGHT_USER,
},
{
    'name': 'server_session_id',
    'value': process.env.SERVER_SESSION_ID,
}];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkUsernameAvailability(page, username) {
  console.log(`Checking username availability: ${username}`);
  await page.type(USERNAME_INPUT_SELECTOR, username);
  await sleep(6000);
  const button = await page.$(USERNAME_AVAILABILITY_BUTTON_SELECTOR);
  const isDisabled = await page.evaluate((button) => button.disabled, button);
  console.log(`Button is disabled: ${isDisabled}`);
  return isDisabled;
}

async function takeScreenshot(page, status, date) {
  const fileName = `screenshots/${status}-${date}.png`;
  await page.screenshot({ path: fileName, fullPage: true });
}

async function run() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage()
    await page.goto(TWITCH_URL)
    console.log("Loading twitch.tv")
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setCookie(...cookies)
    console.log(`Applying Cookies, Logging in as: %c${process.env.NAME}`, 'color: #00FF00')
    await page.reload({
        waitUntil: ["networkidle2", "domcontentloaded"]
    })
    await page.goto(PROFILE_URL)
    console.log("Entering User Profile")
    await sleep(4000);
    await page.click(USERNAME_CHANGE_NAME_BUTTON)
    await sleep(2000);
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const currentDate = `${day}-${month}-${year}`;
    const isUsernameTaken = await checkUsernameAvailability(page, process.env.NEWUSERNAME);
    if (isUsernameTaken) {
        console.log(`Username ${process.env.NEWUSERNAME} is already taken`);
        await takeScreenshot(page, 'taken', currentDate);
        notifier.notify({
            title: `Username: ${process.env.NEWUSERNAME} is already taken`,
            message: 'UNLUCKY MAN, TODAY IS NOT THE DAY',
            sound: true,
            wait: true
        });
    } else {
        console.log(`Username ${process.env.NEWUSERNAME} is available`);
        await takeScreenshot(page, 'available', currentDate);
        notifier.notify({
            title: `Username: ${process.env.NEWUSERNAME} is available`,
            message: 'Go get it Now!!!!!',
            sound: true,
            wait: true
        });
        notifier.on('click', function(notifierObject, options) {
            console.log("Opening Browser")
            const { exec } = require('child_process');
            exec('start chrome https://www.twitch.tv/settings/profile', (err, stdout, stderr) => {
                if (err) {
                    console.error(err)
                } else {
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                }
            });
        });
    }
    await browser.close();
    return;
}

if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }

run()
