import fs from "node:fs";
import jsdom from "jsdom";

function parseCredits(str) {
    return Number([...str.matchAll(/(\d.*) credit/g)][0][1]);
}

const SBCS = fs.readFileSync("sbcs.json");

let courses = {};
for (const file of fs.readdirSync("html")) {
    const department = file.substring(0, 3).toUpperCase();
    const filePath = `html/${file}`;
    const data = fs.readFileSync(filePath);

    const document = new jsdom.JSDOM(data).window.document;
    for (const e of Array.from(
        document
            .getElementsByClassName("column_2_text")[0]
            .getElementsByClassName("course")
    )) {
        courses[`${department} ${e.id}`] = {
            dep: department,
            number: Number(e.id),
            name: e.getElementsByTagName("h3")[0].textContent.substring(9),
            credits: parseCredits(
                Array.from(e.getElementsByTagName("p")).slice(-1)[0].textContent
            ),
            sbcs: Array.from(e.getElementsByTagName("a"))
                .map((e) => e.textContent)
                .filter((e) => SBCS.includes(e)),
        };
    }
}
fs.writeFileSync("courses.json", JSON.stringify(courses, null, 4));
