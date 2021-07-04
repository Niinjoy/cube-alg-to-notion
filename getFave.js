const fs = require("fs")
const fetch = require('node-fetch'); 
const cheerio = require('cheerio')

const speedCubeId = "1952"
const algsets = ["F2L", "OLL", "PLL"]
const algLost = ["U R U' R'", "F' r U r'", "U L U' L'", "U f R' f'"] // F2L 1 won't show complete, so add manually
const faveJsonDir = __dirname+"/asset/algFave.json"
let algFave = []

async function main() {
  algFave.push.apply(algFave,(algLost.map(alg => { return {algset: "F2L", alg: alg }})))
  for (algset of algsets) {
    await getAlgFave(algset)
  }
  fs.writeFileSync(faveJsonDir, JSON.stringify(algFave, null, "  "))
}

async function getAlgFave(algset) {
  const url = "https://www.speedcubedb.com/algsheet/" + speedCubeId + "/" + algset
  const response = await fetch(url)
  const body = await response.text()
  const data = cheerio.load(body)
  var algs = []
  data("span").each(function(i, elem) {
    algs[i] = data(this).text()
  })
  algs = algs.filter(i => i && !algLost.includes(i)) // delete empty element and element in algLost
  algFave.push.apply(algFave,(algs.map(alg => { return {algset: algset, alg: alg }})))
}

main()