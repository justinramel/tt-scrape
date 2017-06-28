// https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
const axios = require('axios')
const cheerio = require('cheerio')

const clubs = [
  {id: 1, name: 'Adept Precision RT'},
  {id: 2, name: 'Allen Valley Velo'},
  {id: 3, name: 'Alnwick Cycling Club'},
  {id: 4, name: 'Barnesbury CC'},
  {id: 5, name: 'Blaydon CC'},
  {id: 6, name: 'Blumilk.com'},
  {id: 7, name: 'Breeze Bikes RT'},
  {id: 8, name: 'Cestria C.C.'},
  {id: 9, name: 'Cestria Cycles RT'},
  {id: 10, name: 'Cestria Cycles Racing Team'},
  {id: 11, name: 'Cramlington CC'},
  {id: 12, name: 'Derwentside CC'},
  {id: 13, name: 'Gosforth RC'},
  {id: 14, name: 'GS Metro'},
  {id: 15, name: 'Houghton CC'},
  {id: 16, name: 'M Steel Cycles RT'},
  {id: 17, name: 'Manilla Cycling'},
  {id: 18, name: 'Muckle Cycle Club'},
  {id: 19, name: 'North Tyneside Riders CC'},
  {id: 20, name: 'Northumbria Police C.C.'},
  {id: 21, name: 'Ryton Tri Club'},
  {id: 22, name: 'South Shields Velo Cycling Club'},
  {id: 23, name: 'Sunderland Clarion'},
  {id: 24, name: 'Tyneside Vagabonds CC'},
  {id: 25, name: 'Wansbeck CC'}
]

const events = [
  { id: '14610', name: 'Barnesbury Cc (150 Riders)(Cheques To B Bayne)', course: 'M21', distance: 21, fee: 8.50, date: '18 March 2017', length: 'medium', closes: '07 March 2017' },
  { id: '14649', name: 'Cramlington Cc (Cheques To Keith Sibbald)', course: 'M18', distance: 18, fee: 8.50, date: '25 March 2017', length: 'medium', closes: '14 March 2017' },
  { id: '14700', name: 'North Tyneside Riders', course: 'M27', distance: 27, fee: 8.50, date: '02 April 2017', length: 'medium', closes: '21 March 2017' },
  { id: '14821', name: 'Wansbeck Cc', course: 'M21', distance: 21, fee: 8.50, date: '22 April 2017', length: 'medium', closes: '11 April 2017' },
  { id: '14861', name: 'Houghton Cc', course: 'M1010B', distance: 10, fee: 8.50, date: '23 April 2017', length: 'short', closes: '11 April 2017' },
  { id: '14909', name: 'North Tyneside Riders (N&Dca Champs)', course: 'M102B', distance: 10, fee: 8.50, date: '30 April 2017', length: 'short', closes: '18 April 2017' },
  { id: '14959', name: 'Derwentside Cc (Lakes & Lancs Spoco)', course: 'M40', distance: 40, fee: 9.50, date: '07 May 2017', length: 'long', closes: '25 April 2017' },
  { id: '15017', name: 'Tyneside Vagabonds Cc (Lakes & Lancs Spoco)', course: 'M47', distance: 47, fee: 11.00, date: '14 May 2017', length: 'long', closes: '02 May 2017' },
  { id: '15075', name: 'Cramlington Cc (Cheques To John Hopper)', course: 'M102B', distance: 10, fee: 8.50, date: '20 May 2017', length: 'short', closes: '09 May 2017' },
  { id: '15161', name: 'Blaydon Cc', course: 'M107', distance: 9.9, fee: 8.50, date: '28 May 2017', length: 'short', closes: '16 May 2017' },
  { id: '15202', name: 'Allen Valley Velo (Lakes & Lancs Spoco)', course: 'M24.8', distance: 24.8, fee: 8.50, date: '04 June 2017', length: 'medium', closes: '23 May 2017' },
  { id: '15232', name: 'Alnwick Cc', course: 'M13', distance: 13, fee: 8.50, date: '10 June 2017', length: 'short', closes: '30 May 2017' },
  { id: '15260', name: 'North Tyneside Riders', course: 'M2511', distance: 25, fee: 8.50, date: '11 June 2017', length: 'medium', closes: '30 May 2017' },
  { id: '15334', name: 'Barnesbury Cc (Cheques To Sharon Dyson)', course: 'M2510', distance: 25, fee: 8.50, date: '18 June 2017', length: 'medium', closes: '10 June 2017' },
  { id: '15378', name: 'Cestria Cc (Cheques To R Mitford)', course: 'M9', distance: 9, fee: 9.50, date: '24 June 2017', length: 'short', closes: '06 June 2017' },
  { id: '15392', name: '(B) Houghton Cc', course: 'M254', distance: 25, fee: 8.50, date: '25 June 2017', length: 'medium', closes: '13 June 2017' },
  { id: '15524', name: '(B) Gosforth Rc (N&Dca Champs)(Cheques To Gosforth Rc)', course: 'M2511', distance: 25, fee: 8.50, date: '09 July 2017', length: 'medium', closes: '27 June 2017' },
  { id: '15534', name: 'Barnesbury Cc (80 Riders)(Cheques To B Bayne)', course: 'M102B', distance: 10, fee: 8.50, date: '12 July 2017', length: 'short', closes: '01 July 2017' },
  { id: '15587', name: 'Blaydon Cc', course: 'M14', distance: 14, fee: 8.50, date: '15 July 2017', length: 'short', closes: '04 July 2017' },
  { id: '15601', name: 'Gs Metro', course: 'M26', distance: 26, fee: 8.50, date: '22 July 2017', length: 'medium', closes: '11 July 2017' },
  { id: '15675', name: 'Sunderland Clarion Cc', course: 'M254', distance: 25, fee: 8.50, date: '30 July 2017', length: 'medium', closes: '18 July 2017' },
  { id: '15710', name: '(B) N & Dca (N&Dca Champs)', course: 'M509', distance: 50, fee: 8.50, date: '06 August 2017', length: 'long', closes: '25 July 2017' },
  { id: '15741', name: '(B) Tyneside Vagabonds Cc (N&Dca Champs)(Cheques To M Reed)', course: 'M100/20', distance: 100, fee: 10.00, date: '13 August 2017', length: 'long', closes: '01 August 2017' },
  { id: '15766', name: 'Cramlington Cc', course: 'M21', distance: 21, fee: 8.50, date: '19 August 2017', length: 'medium', closes: '08 August 2017' }
]

let barResults = []
let allRiders = []
let raceResults = []

axios.all(events.map(event => axios.get(`https://www.cyclingtimetrials.org.uk/race-results/${event.id}`)))
  .then(axios.spread(function (...responses) {
    responses.forEach(response => {
      let results = extractResults(response)
      let event = extractEvent(response)
      let riders = extractRiders(results)

      riders.forEach(rider => {
        let found = barResults.find(x => x.id === rider.id)
        if (found && found.club !== rider.club) {
          changeClub(found)
          raceResults.forEach(raceResult => {
            let result = raceResult.results.find(r => r.id === rider.id)
            if (result) changeClub(result)
          })
        }
        found = allRiders.find(x => x.id === rider.id)
        if (found && found.club !== rider.club) {
          changeClub(found)
          found = null
        }
        if (!found) {
          barResults.push(rider)
          allRiders.push({
            id: rider.id,
            name: rider.name,
            sex: rider.sex,
            category: rider.category,
            club: rider.club
          })
        }
      })
      let points = calculatePoints(riders)

      raceResults.push({
        eventId: event.id,
        results: points.map(rider => ({
          id: rider.id,
          position: rider.position,
          barPosition: 120 - rider.bar + 1,
          bar: rider.bar,
          vbar: rider.vbar,
          lbar: rider.lbar,
          jbar: rider.jbar,
          name: rider.name,
          gender: rider.sex,
          category: rider.category,
          club: rider.club,
          time: rider.time,
          speed: rider.speed
        }))
      })

      points.forEach(rider => {
        let found = barResults.find(x => x.id === rider.id)

        if (!found.races) {
          found.races = []
        }
        found.races.push({
          eventId: event.id,
          raceCategory: event.length,
          position: rider.position,
          time: rider.time,
          speed: rider.speed,
          bar: rider.bar,
          barPosition: 120 - rider.bar + 1,
          vbar: rider.vbar,
          lbar: rider.lbar,
          jbar: rider.jbar
        })

        found.totals = totals(found)
      })

      let position = 1
      barResults.sort((a, b) => b.totals.grand - a.totals.grand).forEach(result => {
        if (!result.barHistory) {
          result.barHistory = []
        }
        result.barHistory.push({
          eventId: event.id,
          date: event.date,
          name: event.course,
          points: result.totals,
          position: position++
        })
      })
    })

    let header = `pos, name, club, total, short, medium, long`
    events.forEach(event => {
      header = header + `, ${event.course}`
    })
    console.log(header)
    let position = 1
    const riderClubInBar = rider => clubs.map(c => c.name).includes(rider.club)
    barResults = barResults.filter(riderClubInBar)
    barResults.sort((a, b) => b.totals.grand - a.totals.grand).forEach(result => {
      result.position = position++
      let data = `${result.position}, ${result.name}, ${result.club}, ${result.totals.grand}, ${result.totals.short}, ${result.totals.medium}, ${result.totals.long}`
      events.forEach(event => {
        let riderEvent = result.races.find(x => x.eventId === event.id)
        let barPoints = riderEvent ? riderEvent.bar : 0
        data = data + `, ${barPoints}`
      })
      console.log(data)
    })

    writeToJSON()
  }))

function changeClub (rider) {
  rider.id = `${rider.id}-${slugify(rider.club)}`
  rider.name = `${rider.name} (${rider.club})`
}

function writeToJSON () {
  removeAttributes()

  var fs = require('fs')
  // fs.writeFile('../../tt-bar/src/data/bar.json', JSON.stringify(barResults, null, 2), function (err) {
  //   console.log(err)
  // })
  fs.writeFile('../../tt-bar/src/data/events.json', JSON.stringify(events, null, 2), function (err) {
    console.log(err)
  })
  fs.writeFile('../../tt-bar/src/data/riders.json', JSON.stringify(allRiders, null, 2), function (err) {
    console.log(err)
  })
  fs.writeFile('../../tt-bar/src/data/results.json', JSON.stringify(raceResults, null, 2), function (err) {
    console.log(err)
  })
  fs.writeFile('../../tt-bar/src/data/clubs.json', JSON.stringify(clubs, null, 2), function (err) {
    console.log(err)
  })
}

function removeAttributes () {
  barResults.forEach(result => {
    result.races.forEach(race => {
      delete race.name
      delete race.date
      delete race.time
      delete race.speed
      delete race.raceCategory
      delete race.barPosition
      delete race.pointsHistory
    })
    result.barHistory.forEach(history => {
      delete history.date
      delete history.name
    })
    delete result.time
    delete result.speed
  })
}

function totals (rider) {
  let short = 0
  let medium = 0
  let long = 0

  const shortRaces = rider.races.filter(x => x.raceCategory === 'short').sort((a, b) => b.bar - a.bar)
  if (shortRaces.length > 0) {
    short = shortRaces.slice(0, 2).reduce((total, result) => total + result.bar, 0)
  }

  const mediumRaces = rider.races.filter(x => x.raceCategory === 'medium').sort((a, b) => b.bar - a.bar)
  if (mediumRaces.length > 0) {
    medium = mediumRaces.slice(0, 3).reduce((total, result) => total + result.bar, 0)
  }

  const longRaces = rider.races.filter(x => x.raceCategory === 'long').sort((a, b) => b.bar - a.bar)
  if (longRaces.length > 0) {
    long = longRaces.slice(0, 1).reduce((total, result) => total + result.bar, 0)
  }
  return {
    short,
    medium,
    long,
    grand: short + medium + long
  }
}

function extractResults (response) {
  let $ = cheerio.load(response.data)
  let results = []
  $('#eventsTable tbody tr').each((index, tr) => {
    let data = $(tr).find('td').map((index, td) => $(td).text()).get()
    let riderId = $(tr).find('a').attr('href').split('/')[2]
    data.push(riderId)
    results.push(data)
  })
  return results
}

function extractEvent (response) {
  const eventId = response.config.url.split('/')[4]
  return events.find(event => event.id === eventId)
}

function unique (a) {
  var seen = {}
  return a.filter(function (item) {
    return seen.hasOwnProperty(item.id) ? false : (seen[item.id] = true)
  })
}

function extractRiders (results) {
  let riders = results.map(result => ({
    position: result[0],
    name: `${result[2]} ${result[3]}`,
    sex: result[4],
    category: result[5].trim(),
    club: result[6],
    time: formatTime(result[7]),
    speed: result[8],
    id: result[10]
  }))

  return unique(riders)
}

function calculatePoints (riders) {
  let barPoints = 120
  let vetPoints = 120
  let ladyPoints = 120
  let juniorPoints = 120

  let points = riders.map(rider => {
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
      id: rider.id,
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

  // Fix time draws
  let grouped = groupBy(points, point => point.time)
  grouped.forEach(times => {
    if (times.length > 1) {
      const best = times.sort((a, b) => b.bar - a.bar).slice(0, 1)[0].bar
      times.forEach(time => {
        let result = points.find(p => p.id === time.id)
        result.bar = best
      })
    }
  })
  return points
}

function groupBy (list, keyGetter) {
  const map = new Map()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

function qualified (race) {
  return race.position !== 'DNS' && race.position !== 'DNF'
}

function inBar (rider) {
  return clubs.map(c => c.name).includes(rider.club) && qualified(rider)
}

function vet (rider) {
  return inBar(rider) && rider.category === 'Vet'
}

function lady (rider) {
  return inBar(rider) && rider.sex === 'Female'
}

function junior (rider) {
  return inBar(rider) && rider.category === 'Junior'
}

function formatTime (time) {
  let formattedTime = time.split(':').length === 3 ? time : '0:' + (time || '00:00')
  return formattedTime === '0:00:00' ? '' : formattedTime
}

/* eslint no-useless-escape: "off" */
function slugify (text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}
