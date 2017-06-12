// https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
const axios = require('axios')
const cheerio = require('cheerio')

const clubs = [
  'Adept Precision RT',
  'Allen Valley Velo',
  'Alnwick Cycling Club',
  'Barnesbury CC',
  'Blaydon CC',
  'Blumilk.com',
  'Breeze Bikes RT',
  'Cestria C.C.',
  'Cestria Cycles RT',
  'Cramlington CC',
  'Derwentside CC',
  'Gosforth RC',
  'GS Metro',
  'Houghton CC',
  'M Steel Cycles RT',
  'Manilla Cycling',
  'Muckle Cycle Club',
  'North Tyneside Riders CC',
  'Northumbria Police CC',
  'Ryton Tri Club',
  'South Shields Velo Cycling Club',
  'Sunderland Clarion',
  'Tyneside Vagabonds CC',
  'Wansbeck CC'
]

const eventId = process.argv[2] || 15232
const resultUrl = `https://www.cyclingtimetrials.org.uk/race-results/${eventId}`
const distance = '25 Miles'

axios.get(resultUrl)
  .then(extractResults)
  .then(extractRiders)
  .then(calculatePoints)
  .then(riders => {
    console.log('position, name, gender, category, club, time, speed, bar, vbar, lbar, jbar')
    riders.forEach(rider => console.log(`${rider.position}, ${rider.name}, ${rider.sex}, ${rider.category}, ${rider.club}, ${rider.time}, ${rider.speed}, ${rider.bar}, ${rider.vbar}, ${rider.lbar}, ${rider.jbar}`))
  })
  // .then(riders => {
  //   riders.forEach(rider => console.log(JSON.stringify(rider)))
  // })
  .catch(function (error) {
    console.log(error)
  })

function extractRiders (results) {
  return results.map(result => ({
    position: result[0],
    name: `${result[2]} ${result[3]}`,
    sex: result[4],
    category: result[5].trim(),
    club: result[6],
    time: formatTime(result[7]),
    speed: result[8]
  }))
}

function calculatePoints (riders) {
  let barPoints = 120
  let vetPoints = 120
  let ladyPoints = 120
  let juniorPoints = 120

  return riders.map(rider => {
    let bar = 0
    if (inBar(rider)) {
      bar = barPoints
      barPoints = barPoints - 1
    }
    let vbar = 0
    if (vet(rider)) {
      vbar = vetPoints
      vetPoints = vetPoints - 1
    }
    let lbar = 0
    if (lady(rider)) {
      lbar = ladyPoints
      ladyPoints = ladyPoints - 1
    }
    let jbar = 0
    if (junior(rider)) {
      jbar = juniorPoints
      juniorPoints = juniorPoints - 1
    }
    return {
      position: rider.position,
      name: rider.name,
      sex: rider.sex,
      category: rider.category,
      club: rider.club,
      time: rider.time,
      speed: rider.speed,
      bar,
      vbar,
      lbar,
      jbar
    }
  })
}

function inBar (rider) {
  return clubs.includes(rider.club) && rider.time !== ''
}

function vet (rider) {
  return inBar(rider) && rider.category === 'Vet'
}

function lady (rider) {
  return inBar(rider) && rider.sex === 'Female'
}

function junior (rider) {
  return inBar(rider) && rider.category === 'Juvenile'
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

function formatTime (time) {
  let formattedTime = time.split(':').length === 3 ? time : '0:' + (time || '00:00')
  return formattedTime === '0:00:00' ? '' : formattedTime
}