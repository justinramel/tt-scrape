// https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
const request = require('request')
const cheerio = require('cheerio')

const eventUrl = 'https://www.cyclingtimetrials.org.uk/race-entrant-list/14861'
const course = 'M1010B'
const distance = '10 Miles'

request(eventUrl, function (error, response, html) {
  if (!error && response.statusCode === 200) {
    let riders = []
    let $ = cheerio.load(html)
    // let headers = $('#racesUsersTable thead tr th').map((index, header) => $(header).text()).get()
    // headers.push('Results Url')
    // riders.push(headers)
    $('#racesUsersTable tbody tr').each((index, tr) => {
      let data = $(tr).find('td').map((index, td) => $(td).text()).get()
      let riderId = $(tr).find('a').attr('href').split('/')[2]
      data.push(riderId)
      riders.push(data)
    })
    fetchResults(riders)
  }
})

function fetchResults (riders) {
  riders.forEach(rider => {
    const riderId = rider[7]
    request(`https://www.cyclingtimetrials.org.uk/rider-results/${riderId}`, function (error, response, html) {
      let results = []

      if (!error && response.statusCode === 200) {
        let $ = cheerio.load(html)
        $('#eventsTable tbody tr').each((index, tr) => {
          let data = $(tr).find('td').map((index, td) => $(td).text()).get()
          results.push(data)
        })
      }
      console.log(rider.concat(bestResult(results)).join(','))
    })
  })
}

function bestResult (results) {
  const courseIndex = 2
  const distanceIndex = 3
  const positionIndex = 5
  let found = results.filter(result => result[courseIndex].toUpperCase() === course)
                      .filter(result => result[positionIndex].toUpperCase() !== 'DNF' && result[positionIndex].toUpperCase() !== 'DNS')

  if (found.length > 0) {
    return found[0]
  }

  found = results.filter(result => result[distanceIndex] === distance)
                  .filter(result => result[positionIndex].toUpperCase() !== 'DNF' && result[positionIndex].toUpperCase() !== 'DNS')

  if (found.length > 0) {
    return found[0]
  } else {
    return ['', '', '', '', '', '', '', '']
  }
}
