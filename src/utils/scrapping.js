import puppeteer from 'puppeteer';

export const scrapeMinceturFicha = async (codFicha) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url = `https://consultasenlinea.mincetur.gob.pe/fichaInventario/index.aspx?cod_Ficha=${codFicha}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
        const getText = (selector) => document.querySelector(selector)?.innerText.trim() || '';

        return {
            titulo: getText('#TituloRecurso'),
        };
    });

    await browser.close();
    return data;
};