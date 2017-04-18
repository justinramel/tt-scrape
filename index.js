// https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping

var request = require('request')
var cheerio = require('cheerio')

request('https://www.cyclingtimetrials.org.uk/race-entrant-list/14861#anchor', function (error, response, html) {
  if (!error && response.statusCode === 200) {
    var $ = cheerio.load(html)
    var headers = $('#racesUsersTable thead tr th').map((index, header) => header.children[0].data)
    debugger
    console.log(headers)
  }
})
