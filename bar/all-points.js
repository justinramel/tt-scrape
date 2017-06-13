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
        if (!found[event.length]) {
          found[event.length] = []
        }
        if (!found.events) {
          found.events = {}
        }
        found.events[event.id] = rider
        found[event.length].push({eventId: event.id, bar: rider.bar})
        found.totals = totals(found)
      })
    })

    let header = `pos, name, club, total, short, medium, long`
    events.forEach(event => {
      header = header + `, ${event.name}`
    })
    console.log(header)
    let position = 1
    barResults.sort((a, b) => b.totals.grand - a.totals.grand).forEach(result => {
      let data = `${position++}, ${result.name}, ${result.club}, ${result.totals.grand}, ${result.totals.short}, ${result.totals.medium}, ${result.totals.long}`
      events.forEach(event => {
        let barPoints = result.events[event.id] ? result.events[event.id].bar : 0
        data = data + `, ${barPoints}`
      })
      console.log(data)
    })
    console.log('', '', '', '', '')

    console.log(`pos, team, points`)
    position = 1
    barResults.sort((a, b) => b.totals.grand - a.totals.grand).forEach(result => {
      let data = `${position++}, ${result.name}, ${result.club}, ${result.totals.grand}, ${result.totals.short}, ${result.totals.medium}, ${result.totals.long}`
      events.forEach(event => {
        let barPoints = result.events[event.id] ? result.events[event.id].bar : 0
        data = data + `, ${barPoints}`
      })
      console.log(data)
    })
    console.log('', '', '', '', '')

    let grouped = groupBy(barResults, x => x.club)
    grouped.forEach(clubs => {
      clubs.forEach(club => {
        let top3 = club.sort((a, b) => b.totals.grand - a.totals.grand).slice(0, 3)
        debugger
      })

      // if (times.length > 1) {
      //   const best = times.sort((a, b) => b.bar - a.bar).slice(0, 1)[0].bar
      //   times.forEach(time => {
      //     let result = points.find(p => p.id === time.id)
      //     result.bar = best
      //   })
      // }
    })

  }))

// axios.all(events.map(extractResults))
//   // .then(riders => axios.all(riders.map(getPersonalBests)))
//   // .then(riders => axios.all(riders.map(getResults)))
//   .then(x => {
//     // x.forEach(y => console.log(y.join(',')))
//     debugger
//   })
//   .catch(function (error) {
//     console.log(error)
//   })


/*
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
*/

function totals (rider) {
  let short = 0
  let medium = 0
  let long = 0

  if (rider.short) {
    short = rider.short.sort((a, b) => b.bar - a.bar).slice(0, 2).reduce((total, result) => total + result.bar, 0)
  }
  if (rider.medium) {
    medium = rider.medium.sort((a, b) => b.bar - a.bar).slice(0, 3).reduce((total, result) => total + result.bar, 0)
  }
  if (rider.long) {
    long = rider.long.sort((a, b) => b.bar - a.bar).slice(0, 1).reduce((total, result) => total + result.bar, 0)
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
