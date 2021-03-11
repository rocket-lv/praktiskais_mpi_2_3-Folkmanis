/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready

map1 = null;
map2 = null;

var app = {
	initialize: function () {
	document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
	},
	onDeviceReady: function () {
      this.receivedEvent('deviceready');
      this.clearCache();
      loadMapAndGetData();
	},
	clearCache: function () {
      var success = function (status) {
      };
      var error = function (status) {
         alert('Error: ' + status);
      };
      if (window.CacheClear)
         window.CacheClear(success, error);
	},
	
	receivedEvent: function (id) {
      var parentElement = document.getElementById(id);
      var listeningElement = parentElement.querySelector('.listening');
      var receivedElement = parentElement.querySelector('.received');

      listeningElement.setAttribute('style', 'display:none;');
      receivedElement.setAttribute('style', 'display:block;');

      console.log('Received Event: ' + id);
	}
};

nearbyMarkers = [];
nearbyPositions = [];

function updateMapsData(position) {

   var pos = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
   };
   getWeather(pos);
   if (map1 != null) {
      map1.setCameraZoom(15);
      map1.moveCamera({
         zoom: 15,
         tilt: 90,
         bearing: 0,
      });
      map1.setCameraTarget(pos);
      map1.addMarker({
         'position': pos,
         'title': "Mana atrašanās vieta"
      });

      
      let url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + pos.lat + "," + pos.lng + "&radius=500&key=" + apikey;
      $.get(url).done((data) => {

         data.results.forEach(element => {
            var marker = {
               'position': element.geometry.location,
               'title': element.name
            }
            nearbyPositions.push(element.geometry.location);
            var addedMarker = map2.addMarker(marker);
            nearbyMarkers.push(addedMarker);
         });

         if (nearbyPositions && nearbyPositions.length) { 
            latlngbounds = new plugin.google.maps.LatLngBounds(nearbyPositions);
            var map2Pos = latlngbounds.getCenter();
           
            map2.moveCamera({
               target: latlngbounds,
            });
            map2.setCameraTarget(map2Pos);
            
         } else {
            alert("center not found")
         }
      });

   } else {
      alert('Map objekts nav inicializēts');
   }
}

function getPosition() {
   var options = {
      enableHighAccuracy: true,
      maximumAge: 3600000
   }
   var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

   function onSuccess(position) {
      updateMapsData(position);
   };

   function onError(error) {
      alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
   }
}
var marker = null;

function getWeather(pos) {

   let appendUL = function (ul, txt) {
      ul.append('<li>' + txt + '</li>');
   }
   let ul = $("#laikapstakli");

   let url = "https://weather.api.here.com/weather/1.0/report.json?product=observation&latitude=" + pos.lat + "&longitude=" + pos.lng + "&oneobservation=true&app_id=devportal-demo-20180625&app_code=9v2BkviRwi9Ot26kp2IysQ";
   $.get(url)
      .done(
         (data) => {
            var a = data;

            appendUL(ul, a.observations.location[0].city + " (" + a.observations.location[0].country + ")");
            appendUL(ul, a.observations.location[0].observation[0].description);

            appendUL(ul, a.observations.location[0].observation[0].temperature + "C");
            appendUL(ul, a.observations.location[0].observation[0].lowTemperature + "C - " + a.observations.location[0].observation[0].highTemperature + "C");
            appendUL(ul, "Mitrums: " + a.observations.location[0].observation[0].humidity + " %");
            appendUL(ul, a.feedCreation);
         }
      )
      .fail(
         (err) => { alert("get request failed" + err) }
      );
}

function loadMapAndGetData() {
   var div = document.getElementById("karte");
   var div2 = document.getElementById("karte2");
   map1 = plugin.google.maps.Map.getMap(div);
   map2 = plugin.google.maps.Map.getMap(div2);
   getPosition();
}

app.initialize();
