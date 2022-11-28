const puppeteer = require('puppeteer')
require('dotenv').config()
const notifier = require("node-notifier")

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const username = ''; // Change this to your desired username


async function run() {
    const browser = await puppeteer.launch({
         headless: true,
         executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' // Windows
     });
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
    }]
    const page = await browser.newPage()
    await page.goto('https://www.twitch.tv/ikina')
    console.log("Loading twitch.tv")
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setCookie(...cookies)
    console.log(`Applying Cookies, Logging in as: %c${process.env.NAME}`, 'color: #00FF00')
    await page.reload({
        waitUntil: ["networkidle2", "domcontentloaded"]
    })
    await page.goto('https://www.twitch.tv/settings/profile')
    console.log("Entering User Profile")
    /*debug*/
        // console.log('Cookies: ', cookies)
        // await sleep(2000);
        // await page.screenshot({ path: 'screenshots/debug.png' , fullPage: true})
    /*end debug*/
    await sleep(2000);
    await page.click('#root > div > div > div > main > div > div > div > div > div > div > div:nth-child(6) > div > div:nth-child(1) > div > div > div:nth-child(1) > div > button > div > div > div > div > div')
    await sleep(2000);
    await page.type('#signup-username', username);
    await sleep(6000);
    const button = await page.$(`body > div > div > div > div > div > div > div > div > div > div > form > div > div > button`)
    const is_disabled = await page.evaluate(button => button.disabled, button)
    console.log("Button is disabled: ", is_disabled)
    if (is_disabled == true ) {
        console.log(`Username: ${username} is already taken`)
        await page.screenshot({ path: 'screenshots/taken.png' , fullPage: true})
        await browser.close()
        return;
    } else {
        console.log(`Username: ${username} is available`)
        // await page.click(`body > div > div > div > div > div > div > div > div > div > div > form > div > div > button`)
        // await sleep(2000);
        await page.screenshot({ path: 'screenshots/available.png' , fullPage: true})
        await browser.close()
        notifier.notify({
            title: `Username: ${username} is available`,
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
        return;
    }
}

run()
