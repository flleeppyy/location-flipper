const fs = require("fs")
// const locations = [ // earthquakes
//   "40N 120W",
// "5S 110E",
// "4S 77W",
// "23N 88E",
// "14S 121E",
// "7N 34E",
// "44N 74W",
// "30S 70W",
// "45N 10E",
// "13N 85W",
// "23N 125E",
// "35N 30E",
// "35N 140E",
// "46N 12E",
// "28N 75E",
// "61N 150W",
// "47S 68W"
// ]

const locations = [ // volcanoes
"60N 150W",
"35S 70W",
"45N 120W",
"15N 61W",
"20N 105W",
"0N 75W",
"40N 122W",
"40N 30E",
"30N 60E",
"55N 160E",
"3S 37E",
"40N 145E",
"10S 120E",
"41N 14E",
"5S 105E",
"15N 35E",
"30S 70W"]

locations.forEach(location => {
  const split = location.split(" ")
  // longitude = split[1]
  // latitude = split[0]
  let oldeq = {
    original: location,
    latitude: split[0],
    longitude: split[1]
  };

  let neweq = {
    longitude: undefined,
    latitude: undefined,
    latlong: undefined,
    longlat: undefined
  }

  if (oldeq.latitude.slice(oldeq.latitude.length - 1) === "S") {
    neweq.latitude = "-" + oldeq.latitude.slice(0, oldeq.latitude.length - 1)
  } else {
    neweq.latitude = oldeq.latitude.slice(0, oldeq.latitude.length - 1)
  }

  if (oldeq.longitude.slice(oldeq.longitude.length - 1) === "W") {
    neweq.longitude = "-" + oldeq.longitude.slice(0, oldeq.longitude.length - 1)
  } else {
    neweq.longitude = oldeq.longitude.slice(0, oldeq.longitude.length - 1)
  }

  

  neweq.latlong = `${neweq.latitude}, ${neweq.longitude}`
  neweq.latlong = `${neweq.longitude}, ${neweq.latitude}`
  console.log(neweq.latlong)

})