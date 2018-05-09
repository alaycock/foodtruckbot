"use strict";

const ts = require('./tinyspeck.js'),
      axios = require('axios'),
      getDate = require('./getDate.js');

var slack = ts.instance({ });

slack.on('/foodtrucks', payload => {
  let channel_id = payload.channel_id;
  let response_url = payload.response_url;
  
  getNearbyTrucks()
  .then((openTrucks) => {
    if(openTrucks.length) {
      return openTrucks.map(truck => 
        truck.name + ", " + truck.open.friendly_time +  ", https://streetfoodapp.com/calgary/" + truck.identifier
      ).join('\n');
    } else {
      return "No trucks nearby today :cry:";
    }
  }).then((message) => {
    slack.send(response_url, getMessage(channel_id, message))
  }).catch(e => console.error("An error occurred" + e));
      
});

function getNearbyTrucks() {
  return axios({
      url: "https://streetfoodapp.com/widgets/map/calgary?display=name,description,openings",
      method: 'post', 
      headers: { 'user-agent': 'TinySpeck' }
    }).then((response) => {
    
    const htmlResponse = response.data;
    const matches = htmlResponse.match(/StreetFoodApp\.vendors = (.+);/);
    if (matches.length !== 2) throw new Error("Couldn't parse food truck list");
    
    const allTrucks = JSON.parse(matches[1]);
    
    const openTrucks = Object.keys(allTrucks)
      .map(key => {
        // Using this map as a foreach
        const foundObject = getOpenObject(allTrucks[key]);
        if (key === 'arepas-ranch') 
          console.log(allTrucks[key])
        
        allTrucks[key].open = foundObject;
        return key;
      })
      .filter((key) => allTrucks[key].open)
      .map(key => allTrucks[key]);
    
    return openTrucks;
  });
}

function withinBounds(location) {
  return location.latitude > 51.039608 && location.latitude < 51.042704 &&
  location.longitude > -114.074070 && location.longitude < -114.065991;
}
                                              
// From JS on this page: https://streetfoodapp.com/widgets/map/calgary?display=name,description,openings
function getOpenObject(truck) {
  for (var openIndex = 0; openIndex < truck.open.length; openIndex++) {
    
    var time = timeAtNoon();
    console.log(time)
    var open = time > truck.open[openIndex]["start"]
      && time < truck.open[openIndex]["end"];

    if (open && withinBounds(truck.open[openIndex])) {
      return truck.open[openIndex];
    }
  }
  return false;
}

function timeAtNoon() {
  const today = new Date();
  today.setDate(today.getDate())
  const offset = getDate("America/Edmonton", today);
  
  today.setUTCHours(12);
  today.setUTCMinutes(5);
  today.setUTCSeconds(0);
  today.setUTCMilliseconds(0);
  
  today.setMinutes(today.getMinutes() + offset);
  return today.getTime() / 1000;
}
    
function getMessage(channel, message) {
  return Object.assign({ channel, text: message });
}
    
// incoming http requests
slack.listen('3000');