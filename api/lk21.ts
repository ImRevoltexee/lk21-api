import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const searchQuery = searchParams.get("search");

    if (!searchQuery) {
        return NextResponse.json({ error: "Query tidak boleh kosong" }, { status: 400 });
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    try {
        await page.goto(`https://lk21-api-endpoint.com/search?q=${searchQuery}`);
        const result = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".result-item")).map(el => ({
                title: el.querySelector(".title")?.innerText,
                link: el.querySelector("a")?.href
            }));
        });

        await browser.close();
        return NextResponse.json({ results: result });
    } catch (error) {
        await browser.close();
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
