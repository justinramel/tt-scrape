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
  'Cestria Cycles Racing Team',
  'Cramlington CC',
  'Derwentside CC',
  'Gosforth RC',
  'GS Metro',
  'Houghton CC',
  'M Steel Cycles RT',
  'Manilla Cycling',
  'Muckle Cycle Club',
  'North Tyneside Riders CC',
  'Northumbria Police C.C.',
  'Ryton Tri Club',
  'South Shields Velo Cycling Club',
  'Sunderland Clarion',
  'Tyneside Vagabonds CC',
  'Wansbeck CC'
]

const events = [
  { id: '14610', name: 'M21', date: '18 March 2017', length: 'medium' },
  { id: '14649', name: 'M18', date: '25 March 2017', length: 'medium' },
  { id: '14700', name: 'M27', date: '02 April 2017', length: 'medium' },
  { id: '14821', name: 'M21', date: '22 April 2017', length: 'medium' },
  { id: '14861', name: 'M1010B', date: '23 April 2017', length: 'short' },
  { id: '14909', name: 'M102B', date: '30 April 2017', length: 'short' },
  { id: '14959', name: 'M40', date: '07 May 2017', length: 'long' },
  { id: '15017', name: 'M47', date: '12 May 2017', length: 'long' },
  { id: '15075', name: 'M102B', date: '20 May 2017', length: 'short' },
  { id: '15161', name: 'M107', date: '28 May 2017', length: 'short' },
  { id: '15202', name: 'M24.8', date: '04 June 2017', length: 'medium' },
  { id: '15232', name: 'M13', date: '10 June 2017', length: 'short' }
]

let barResults = []

axios.all(events.map(event => axios.get(`https://www.cyclingtimetrials.org.uk/race-results/${event.id}`)))
  .then(axios.spread(function (...responses) {
    responses.forEach(response => {
      let results = extractResults(response)
      let event = extractEvent(response)
      let riders = extractRiders(results)
      riders.forEach(rider => {
        let found = barResults.find(x => x.id === rider.id)
        if (!found) {
          barResults.push(rider)
        }
      })
      let points = calculatePoints(riders)
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
        if (!found.pointsHistory) {
          found.pointsHistory = []
        }
        found.pointsHistory.push({
          eventId: event.id,
          date: event.date,
          name: event.name,
          raceCategory: event.length,
          bar: rider.bar,
          vbar: rider.vbar,
          lbar: rider.lbar,
          jbar: rider.jbar,
          position: rider.position
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
          name: event.name,
          points: result.totals,
          position: position++
        })
      })
    })

    let header = `pos, name, club, total, short, medium, long`
    events.forEach(event => {
      header = header + `, ${event.name}`
    })
    console.log(header)
    let position = 1
    const riderClubInBar = rider => clubs.includes(rider.club)
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

    addTags()
    var fs = require('fs')
    fs.writeFile('bar.json', JSON.stringify(barResults, null, 2), function (err) {
      console.log(err)
    })

    console.log('', '', '', '', '')

    let teamResults = calculateTeamPoints(barResults)
    outputTeamResults(teamResults)
  }))

function calculateTeamPoints (data) {
  let results = []
  groupBy(data, x => x.club).forEach(clubs => {
    let top3 = clubs.sort((a, b) => b.totals.grand - a.totals.grand).slice(0, 3)
    let total = top3.reduce((total, rider) => total + rider.totals.grand, 0)
    results.push({
      club: clubs[0].club,
      total,
      top3
    })
  })
  results.sort((a, b) => b.total - a.total)
  return results
}

function addTags () {
  barResults.forEach(result => {
    result.tags = []

    // addTag(result, r => r.position === '1', 'is-warning', '1st')
    // addTag(result, r => r.position === '2', 'is-warning', '2nd')
    // addTag(result, r => r.position === '3', 'is-warning', '3rd')
    // addTag(result, r => Number(r.position) <= 5, 'is-warning', 'Top 5')
    // addTag(result, r => Number(r.position) <= 10, 'is-warning', 'Top 10')

    addTag(result, r => r.barPosition === 1, 'is-warning', '1st BAR')
    addTag(result, r => r.barPosition === 2, 'is-warning', '2nd BAR')
    addTag(result, r => r.barPosition === 3, 'is-warning', '3rd BAR')
    addTag(result, r => r.barPosition <= 5, 'is-warning', 'Top 5 BAR')
    addTag(result, r => r.barPosition <= 10, 'is-warning', 'Top 10 BAR')

    addTag(result, r => r.position === 'DNS', 'is-black', 'DNS')
    addTag(result, r => r.position === 'DNF', 'is-dark', 'DNF')
  })
}

function addTag (result, filter, cssclass, text) {
  const count = result.races.filter(filter).length
  if (count > 0) {
    result.tags.push({cssclass: `tag ${cssclass}`, text: `${count} x ${text}`})
  }
}

function outputTeamResults (results) {
  console.log(`pos, team, points`)
  let position = 1
  results.forEach(team => {
    console.log(`${position++}, ${team.club}, ${team.total}`)
    team.top3.forEach(rider => {
      console.log(`,,, ${rider.name}, ${rider.totals.grand}`)
    })
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

function extractRiders (results) {
  return results.map(result => ({
    position: result[0],
    name: `${result[2]} ${result[3]}`,
    sex: result[4],
    category: result[5].trim(),
    club: result[6],
    time: formatTime(result[7]),
    speed: result[8],
    id: result[10]
  }))
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
  return inBar(rider) && rider.category === 'Junior'
}

function formatTime (time) {
  let formattedTime = time.split(':').length === 3 ? time : '0:' + (time || '00:00')
  return formattedTime === '0:00:00' ? '' : formattedTime
}
