// https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
const axios = require('axios')
const cheerio = require('cheerio')

const eventUrl = 'https://www.cyclingtimetrials.org.uk/race-entrant-list/15766'
const course = 'M21'
const distance = '25 Miles'

axios.get(eventUrl)
  .then(extractRiders)
  .then(riders => axios.all(riders.map(getPersonalBests)))
  .then(riders => axios.all(riders.map(getResults)))
  .then(x => {
    x.forEach(y => console.log(y.join(',')))
  })
  .catch(function (error) {
    console.log(error)
  })

function getPersonalBests (rider) {
  const riderId = rider[7]
  return axios.get(`https://www.cyclingtimetrials.org.uk/rider-pbs/${riderId}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6)',
      'Accept': 'text/html'
    }
  })
    .then(extractPersonalBests)
    .then(pbs => rider.concat(pbs))
}

function getResults (rider) {
  const riderId = rider[7]
  return axios.get(`https://www.cyclingtimetrials.org.uk/rider-results/${riderId}`)
    .then(extractResults)
    .then(getBestResult)
    .then(bestResult => rider.concat(bestResult))
}

function extractResults (response) {
  let $ = cheerio.load(response.data)
  let results = []
  $('#eventsTable tbody tr').each((index, tr) => {
    let data = $(tr).find('td').map((index, td) => $(td).text()).get()
    results.push(data)
  })
  return results
}

function extractPersonalBests (response) {
  let pbs = []
  let $ = cheerio.load(response.data)
  $('#eventsTable tbody tr').each((index, tr) => {
    let data = $(tr).find('td').map((index, td) => $(td).text()).get()
    pbs.push(data)
  })

  if (pbs.length === 0) return ['', '', '', '']
  const pb10 = formatTime(pbs[0][1])
  const pb25 = formatTime(pbs[1][1])
  const pb50 = formatTime(pbs[2][1])
  const pb100 = formatTime(pbs[3][1])

  return [pb10, pb25, pb50, pb100]
}

function extractRiders (response) {
  let riders = []
  let $ = cheerio.load(response.data)
  let headers = $('#racesUsersTable thead tr th').map((index, header) => $(header).text()).get()
  headers.push('Rider Id', 'PB 10', 'PB 25', 'PB 50', 'PB 100', 'Result', 'Speed', 'Date', 'Course', 'Position')

  console.log(headers.join(','))

  $('#racesUsersTable tbody tr').each((index, tr) => {
    let data = $(tr).find('td').map((index, td) => $(td).text()).get()
    let riderId = $(tr).find('a').attr('href').split('/')[2]
    data.push(riderId)
    riders.push(data)
  })

  return riders
}

function formatTime (time) {
  let formattedTime = time.split(':').length === 3 ? time : '0:' + time
  return formattedTime === '0:00:00' ? '' : formattedTime
}

function getBestResult (results) {
  const courseIndex = 2
  const distanceIndex = 3
  const positionIndex = 5
  let found = results.filter(result => result[courseIndex].toUpperCase() === course)
                      .filter(result => result[positionIndex].toUpperCase() !== 'DNF' && result[positionIndex].toUpperCase() !== 'DNS')

  if (found.length > 0) {
    return formatBestTime(found[0])
  }

  found = results.filter(result => result[distanceIndex] === distance)
                  .filter(result => result[positionIndex].toUpperCase() !== 'DNF' && result[positionIndex].toUpperCase() !== 'DNS')

  if (found.length > 0) {
    return formatBestTime(found[0])
  } else {
    return ['', '', '', '']
  }
}

function formatBestTime (bestResult) {
  const result = formatTime(bestResult[6])
  const speed = bestResult[7]
  const date = bestResult[0]
  const position = bestResult[5]
  const course = bestResult[2]
  return [result, speed, date, course, position]
}
