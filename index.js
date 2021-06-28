const { Client } = require("@notionhq/client")
const dotenv = require("dotenv")
const csv = require("csvtojson")
const fs = require("fs")
dotenv.config()

const notion = new Client({ auth: process.env.NOTION_KEY })
const caseDatabaseId = process.env.NOTION_CASE_DATABASE_ID
const algDatabaseId = process.env.NOTION_ALG_DATABASE_ID
const csvDir = __dirname+"/asset/allAlgs.csv"
const jsonDir = __dirname+"/asset/casePageId.json"

async function main() {
  // 1. Get json array from csv file
  const caseDbData = await readCsv(csvDir)

  // 2. Add all alg cases to case db
  // await createCasePages(caseDbData)

  // 3. Get existing pages in the database, and write to pageId json file
  // const casePages = await queryDatabase()
  // writeJson(jsonDir, casePages)

  // 4. read pageId json file, and create json array as { alg, name, rank, pageId }
  const casePagesRead = readJson(jsonDir)
  const algDbData = transformAlgData(caseDbData, casePagesRead)

  // 5. Add all algs to alg db
  // await createAlgPagesSliced(algDbData, 100)
}

//*========================================================================
// Requests
//*========================================================================

/**
 * Adds pages to case database
 *
 * @param caseDbData: Array<{ name: string, algset: string, ... }>
 */
async function createCasePages(caseDbData) {
  const isEmpty = await isEmptyDb(caseDatabaseId)
  if (!isEmpty) {
    return
  }
  await Promise.all(
    caseDbData.map(({ name, algset, caseid, catalog, alg1, alg2, alg3, alg4, video, videoimg, color, orientation }) =>
      notion.pages.create({
        parent: { database_id: caseDatabaseId },
        properties: {
          name: { title: [{ text: { content: name }}]},
          algset: { select: { name: algset }},
          caseid: { rich_text: [{ text: { content: caseid }}]},
          catalog: { rich_text: [{ text: { content: catalog }}]},
          alg1: { rich_text: [{ text: { content: alg1 }}]},
          alg2: { rich_text: [{ text: { content: alg2 }}]},
          alg3: { rich_text: [{ text: { content: alg3 }}]},
          alg4: { rich_text: [{ text: { content: alg4 }}]},
          video: { url: video!==""?video:null}, // "" is not allowed for url properties
          videoimg: { url: videoimg!==""?videoimg:null},
          color: { rich_text: [{ text: { content: color }}]},
          orientation: { select: { name: orientation }},
        },
      })
    )
  )
}

/**
 * Query the case database
 *
 * Returns array of objects with name property and pageId
 * Array<{ name: string, pageId: string }>
 */
async function queryDatabase() {
  let pages = []
  let cursor = undefined
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: caseDatabaseId,
      sorts: [{ property: "name", direction: "ascending" }],
      page_size: 100,
      start_cursor: cursor,
    })
    pages.push(...results)
    if (!next_cursor) {
      break
    }
    cursor = next_cursor
  }
  return pages.map(page => {
    const titleProperty = page.properties["name"]
    const richText = titleProperty.title
    const name = richText.map(({ plain_text }) => plain_text).join("")
    return { name, pageId: page.id }
  })
}

/**
 * Adds pages to alg database
 *
 * @param algDbData: Array<{ alg: string, rank: num, name: string, pageId: string }>
 */
async function createAlgPages(algDbData) {
  await Promise.all(
    algDbData.map(({ alg, rank, name, pageId }) =>
      notion.pages.create({
        parent: { database_id: algDatabaseId },
        properties: {
          alg: { title: [{ text: { content: alg }}]},
          rank: { number: rank},
          name: { rich_text: [{ text: { content: name }}]},
          case_relation: { relation: [{ id: pageId }]},
        },
      })
    )
  )
}

/**
 * Adds pages to alg database (less pages each time to prevent error)
 *
 * @param algDbData: Array<{ alg: string, rank: number, name: string, pageId: string }>
 * @param slice_size: number
 */
async function createAlgPagesSliced(algDbData, slice_size) {
  const data_len = algDbData.length
  for (var i = 0; i < algDbData.length; i = i + slice_size) {
    await createAlgPages(algDbData.slice(i, i + slice_size))
  }
}

//*========================================================================
// Helpers
//*========================================================================

/**
 * Returns true if DB is empty
 * Prevents duplication
 */
async function isEmptyDb(databaseId) {
  const { results } = await notion.databases.query({
    database_id: databaseId,
  })
  return results.length === 0
}

/**
 * Reads json objects from csv
 * 
 * @param dir: string
 * Returns Array of objects
 */
async function readCsv(dir) {
  return await csv().fromFile(dir)
}

/**
 * Write objects to json file
 * 
 * @param dir: string
 * @param data: Array of objects
 */
 function writeJson(dir, data) {
  fs.writeFileSync(dir, JSON.stringify(data, null, "  "))
}

/**
 * Read json objects from json file
 * 
 * @param dir: string
 * 
 * Returns Array of objects
 */
function readJson(dir) {
  const data = fs.readFileSync(dir)
  return JSON.parse(data)
}

/**
 * Combine name, algs from caseDbData and pageId from casePages (just combine or check names are the same?)
 * Change the structure to { alg, name, rank, pageId }
 *
 * @param caseDbData: Array<{ name: string, algset: string, ... }>
 * @param casePages: Array<{ name: string, pageId: string }>
 *
 * Returns algs of each case with rank
 * Array<{ alg: string, rank: number, name: string, pageId: string }>
 */
function transformAlgData(caseDbData, casePages) {
  return caseDbData.map((x, i) => {
    return [x.alg1, x.alg2, x.alg3, x.alg4].filter(Boolean).map((alg, alg_index) => {
      return {alg: alg, rank: alg_index+1, name: x.name, pageId: casePages[i].pageId}
    })
  }).flat()
}

main()
