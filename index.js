import { chromium } from "playwright";
import sharp from "sharp";
import ssim from "ssim.js";

const data = {
  tcNumber: "",
  schoolNumber: "",
  day: "",
  month: "",
  year: "",
  district: "",
  city: "",
  class: "",
};

async function AnswerQuestion(question, answer) {
  const text = await page.locator(question).textContent();
  switch (text) {
    case "Öğrencinin doğum yılı nedir?":
      await page.type(answer, data.year);
      break;
    case "Öğrencinin doğum ayı hangisidir?":
      await page.selectOption(answer, { label: data.month });
      break;
    case "Öğrencinin doğum günü hangisidir?":
      await page.selectOption(answer, { label: data.day });
      break;
    case "Öğrencinin nüfusa kayıtlı olduğu ilçe hangisidir?":
      await page.selectOption(answer, { label: data.district });
      break;
    case "Öğrencinin nüfusa kayıtlı olduğu il hangisidir?":
      await page.selectOption(answer, { label: data.city });
      break;
    case "Öğrencinin okuduğu şube hangisidir?":
      await page.selectOption(answer, { label: data.class });
      break;
    default:
      console.error("Error");
      break;
  }
}

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto("https://e-okul.meb.gov.tr/");
await page.locator('//*[@id="information"]/div/div/a[2]').click();
await page.waitForSelector('//*[@id="VBSKullanici"]');
await page.locator('//*[@id="VBSKullanici"]').type(data.tcNumber);
await page.locator('//*[@id="VBSpassword"]').type(data.schoolNumber);
await page.waitForTimeout(10000);
await page.locator('//*[@id="btnVBSGiris"]').click();

await page.waitForSelector('//*[@id="pnlSorular"]');
await AnswerQuestion(
  '//*[@id="pnlSorular"]/div[1]/div/label/span',
  '//*[@id="pnlSorular"]/div[1]/div/div/select'
);
await AnswerQuestion(
  '//*[@id="pnlSorular"]/div[2]/div/label/span',
  '//*[@id="pnlSorular"]/div[2]/div/div/select'
);

const original = await sharp("original.png").resize(105, 120).raw().toBuffer();

for (let i = 1; i <= 5; i++) {
  const element = await page.locator(`//*[@id="imgR${i}"]`);
  const data = await element.screenshot();
  const img = await sharp(data).resize(105, 120).raw().toBuffer();

  const { mssim, performance } = ssim.ssim(
    {
      data: original,
      height: 105,
      width: 120,
    },
    {
      data: img,
      height: 105,
      width: 120,
    }
  );

  if (mssim > 0.8) {
    page.check(`//*[@id="rdRes${i}"]`);
  }
}

await page.locator('//*[@id="btnTamam"]').scrollIntoViewIfNeeded();
await page.locator('//*[@id="btnTamam"]').click();
await page.locator('//*[@id="IOVMenu1_anamenu"]/li[3]/ul/li[3]/a').click();
await page.locator('//*[@id="Form1"]/div[4]/div[3]/div/div/div/div/div/div[2]/div/div').screenshot({ path: 'first.png' });
await page.locator('//*[@id="pillsDonem2"]').click();
await page.locator('//*[@id="Form1"]/div[4]/div[3]/div/div/div/div/div/div[2]/div/div').screenshot({ path: 'second.png' });
await browser.close();
