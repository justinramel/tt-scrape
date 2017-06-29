// https://www.digitalocean.com/community/tutorials/how-to-use-node-js-request-and-cheerio-to-set-up-simple-web-scraping
const axios = require('axios')
const cheerio = require('cheerio')

const inputFile = process.argv[2] || './provisional-points/input/m24-8.json'
const outputFile = process.argv[3] || '15202.json'
const input = require(`./${inputFile}`)

let provisional = []

axios.all(input.map(result => {
  const names = result.Name.split(' ')
  let firstname = ''
  let lastname = ''
  if (names.length === 2) {
    firstname = names[0]
    lastname = names[1]
  } else {
    firstname = names[0]
    lastname = names[names.length - 1]
  }
  console.log(firstname, lastname)
  const id = result.id || ''
  return axios.get(`https://www.cyclingtimetrials.org.uk/find-registered-users?firstname=${firstname}&lastname=${lastname}&id=${id}`)
})).then(axios.spread(function (...responses) {
  responses.forEach(response => {
    const id = response.request.path.split('=')[3] || null
    let result = null
    let rider = null

    if (id) {
      result = input.find(r => r.id === id)
      rider = {
        id: result.id,
        name: result.name,
        gender: result.gender,
        category: result.category,
        club: result.club
      }
    } else {
      rider = extractRider(response)
      result = input.find(r => r.Name.toLowerCase() === rider.name.toLowerCase())
    }
    if (!result) {
      console.error(rider)
      throw 'rider not found in results'
    }
    const fullResult = {
      id: rider.id,
      position: result.Position,
      name: rider.name,
      sex: rider.gender,
      category: rider.category,
      club: rider.club,
      time: result.Time,
      speed: ''
    }
    console.log(fullResult)
    provisional.push(fullResult)
  })
  let fs = require('fs')
  fs.writeFile(`./provisional-points/${outputFile}`, JSON.stringify(provisional, null, 2), function (err) {
    console.log(err)
  })
}))
  .catch(function (error) {
    console.log(error)
  })

function extractRider (response) {
  let $ = cheerio.load(response.data)
  let result = {}

  $('table tbody tr').each((index, tr) => {
    let data = $(tr).find('td').map((index, td) => $(td).text().trim()).get()
    result = {
      id: data[2],
      name: `${data[0]} ${data[1]}`,
      club: data[4],
      gender: data[5],
      category: data[6]
    }
  })
  return result
  // const results = $('table tbody tr:first-child')
  // let data = $(results).find('td').map(td => $(td).text().trim()).get()
  // if (results.length > 1) {
  //   debugger
  //   console.log(data)
  //   throw 'Multiple riders with this name'
  // }
  // return {
  //   id: data[2],
  //   club: data[4],
  //   gender: data[5],
  //   category: data[6]
  // }
}

function formatTime (time) {
  let formattedTime = time.split(':').length === 3 ? time : '0:' + (time || '00:00')
  return formattedTime === '0:00:00' ? '' : formattedTime
}
