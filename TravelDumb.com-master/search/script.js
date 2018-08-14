/* loading of information required */
function pageLoad(){
    getCurrentLocation();
    setTimeout(initMap, 250);
    console.log(sessionStorage.getItem('userLat'));
}

function positionUpdated(){
    locationArray = [""];
    countriesArray = [""];
    saveState();
    loadFirebaseSearch();
    loadAutoCompleteScript();
}

/* bootstrap element disabling */
var dateDisabled;
var activityDisabled;
var checkboxDisabled;
function disableUpdate(){
    saveState();
    getState();
    for (var i = 0; i < countriesArray.length; i++){
        if (l === countriesArray[i]){
            $('#date').attr('disabled', 'disabled');
            $('#checkbox-toggle').attr('disabled', 'disabled');
            dateDisabled = true;
            checkboxDisabled = true;
            $('#activity').removeAttr('disabled');
            activityDisabled = false;
            break;
        } else {
            $('#date').removeAttr('disabled');
            $('#checkbox-toggle').removeAttr('disabled');
            dateDisabled = false;
            checkboxDisabled = false;
            $('#activity').attr('disabled', 'disabled');
            activityDisabled = true;
        }
    }
}

function post(){

    // disableUpdate();
    saveState();
    getState();
    setTimeout(getFirebaseActivitiesData, 100);
    setTimeout(sortSearchType, 800);
    setTimeout(configureMarker, 800);
}

var redirect = false;
function saveState(){

    sessionStorage.setItem('continent', $('#continent option:selected').val());
    // console.log(sessionStorage.getItem('continent'));
    if (redirect === false){
        sessionStorage.setItem('location', $('input#search-box').val());
        // console.log(sessionStorage.getItem('location'));
    } else {
        sessionStorage.setItem('location', redirectLocation);
    }
    sessionStorage.setItem('date', $('#date option:selected').val());
    // console.log(sessionStorage.getItem('date'));
    sessionStorage.setItem('activity', $('#activity option:selected').val());
    // console.log(sessionStorage.getItem('activity'));
    sessionStorage.setItem('nearby', $('#checkbox-search').is(':checked'));
    // console.log(sessionStorage.getItem('nearby'));
}

var c, l, lr, d, a, n;
function getState(){
    c = sessionStorage.getItem('continent');
    l = sessionStorage.getItem('location');
    // lr = sessionStorage.getItem('location-redirect');
    d = sessionStorage.getItem('date');
    a = sessionStorage.getItem('activity');
    n = sessionStorage.getItem('nearby');
    console.log("refined location: "+l);
}

/* retrieves arrays of city/country pairs, and countries */
var locations;
var countries;
var locationArray = [];
var locationArrayAlt = [];
var countriesArray = [];

function loadFirebaseSearch(){

    /* add default search box exception to avoid console errors */
    var continentCode = sessionStorage.getItem('continent');

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://mu-travel-search.firebaseio.com/"+continentCode+"/.json",
            dataType : "jsonp",
            success : function(parsed_json) {

                locations = parsed_json['data'];
                countries = parsed_json['countries'];
                var countLocations = Object.keys(locations).length;
                var countCountries = Object.keys(countries).length;
                if (continentCode !== "default"){
                    for (var i = 0; i < countLocations-1; i++){
                        var locationP1 = parsed_json['data'][i]['name'];
                        var locationP2 = parsed_json['data'][i]['state'];
                        var locationP3 = parsed_json['data'][i]['country'];
                        if (locationP3 !== "United States"){
                            locationArray[i] = locationP1 + ", " + locationP3;
                        } else {
                            locationArray[i] = locationP1 + ", " + locationP2;
                        }
                        // locationArrayAlt[i] = locationP1 + ", " + locationP3;
                    }
                    for (var j = 0; j < countCountries; j++){
                        countriesArray[j] = parsed_json['countries'][j];
                    }
                }
            }
        });
    });
    loadAutoCompleteScript();
}

function getSearchChoices(){
    /* unexplained index skip, when using down arrow to pick location */
    return locationArray.concat(countriesArray);
}

// var userLat, userLng;
function getCurrentLocation(){
    // jQuery(document).ready(function($) {
    //     $.ajax({
    //         url: "http://gd.geobytes.com/GetNearbyCities?call-back=?",
    //         dataType: "jsonp",
    //         success: function (parsed_json) {
    //             userLat = parseFloat(parsed_json[0][8]);
    //             userLng = parseFloat(parsed_json[0][10]);
    //             console.log(userLat + ", " + userLng);
    //         }
    //     });
    // });
}

function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: parseFloat(sessionStorage.getItem('userLat')), lng: parseFloat(sessionStorage.getItem('userLng'))},
        zoom: 10,
    });
}

/* information processing section */

var multimarker = false;
function sortSearchType(){
    multimarker = false;
    /* notifies if required data has been inputted */
    if (c === "default" || (l === "" && (a === "default" || d === "default"))){
        warning();
    }
    for (var i = 0; i < countriesArray.length; i++){
        if (countriesArray[i] === l && redirect === false){
            multimarker = true;
            break;
        } else if (redirect === true){
            multimarker = false;
            break;
        }
    }
}

function warning(){
    var a = "<div class=\"alert alert-warning fade in\" style='width: 80%;margin: 5px auto;text-align: center;' >\n" +
        "  <strong>Uh oh!</strong> Please enter the required information, so that our systems can accurately fulfil your request." +
        "</div>";
    document.getElementById('warning-sign').innerHTML = a;
    setTimeout(function(){ document.getElementById('warning-sign').innerHTML = ""; }, 5000);
}

/* weather processing */

var temp_c;
var temp_avg;
function executeWeatherAPI(location){
    var fields = location.split(',');
    var country = fields[1];
    var city = fields[0];

    console.log(dateDisabled);
    if (d !== "default"){
        jQuery(document).ready(function($) {
            $.ajax({
                url: "http://api.wunderground.com/api/bcf92972757dbf5b/planner_" + d + "01" + d + "28/q/" + country + "/" + city + ".json",
                dataType: "jsonp",
                async: false,
                success: function (parsed_json) {
                    var temp_high = parseFloat(parsed_json['trip']['temp_high']['avg']['C']);
                    var temp_low = parseFloat(parsed_json['trip']['temp_low']['avg']['C']);
                    temp_avg = (temp_high+temp_low)/2;
                    console.log(temp_avg);

                    /* JS TOO FAST FOR API, MUST EXECUTE INSIDE AJAX */
                    var contentString = setInfoWindowCurrentMonth(l, temp_avg, city);

                    var marker = new google.maps.Marker({
                        position: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
                        map: map
                    });

                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    infowindow.open(map, marker);
                    marker.addListener('click', function () {
                        infowindow.open(map, marker);
                    });
                }
            });
        });
    } else {
        jQuery(document).ready(function($) {
            $.ajax({
                url: "http://api.wunderground.com/api/bcf92972757dbf5b/conditions/q/" + country + "/" + city + ".json",
                dataType: "jsonp",
                async: false,
                success: function (parsed_json) {
                    temp_c = parsed_json['current_observation']['temp_c'];
                    console.log(temp_c);

                    var contentString = setInfoWindowCurrent(l, temp_c, city);

                    var marker = new google.maps.Marker({
                        position: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
                        map: map
                    });

                    var infowindow = new google.maps.InfoWindow({
                        content: contentString
                    });

                    infowindow.open(map, marker);
                    marker.addListener('click', function () {
                        infowindow.open(map, marker);
                    });

                }
            });
        });
    }
}

// var months = [
//     'January', 'February', 'March', 'April', 'May',
//     'June', 'July', 'August', 'September',
//     'October', 'November', 'December'
// ];
// function monthNameToNumber(monthname) {
//     var month = months.indexOf(monthname);
//     return month ? month + 1 : 0;
// }


var longitude, latitude, coord = "";
function getCoordinates(city){
    var count = Object.keys(locations).length;
    for (var i = 0; i < count-1; i++){
        if (locationArray[i] === city){
            latitude = locations[i].lat;
            longitude = locations[i].lng;
            coord = latitude + ", " + longitude;
            break;
        } else {
            coord = "failed";
            // console.log("no coordinates found")
        }
    }
}

// var longitudeSingle;
// var latitudeSingle;
// var coordSingle = "";
// function getCoordinatesSingle(city){
//     var count = Object.keys(locations).length;
//     for (var i = 0; i < count-1; i++){
//         if (locationArray[i] === city){
//             latitudeSingle = locations[i].lat;
//             longitudeSingle = locations[i].lng;
//             coordSingle = latitude + ", " + longitude;
//             break;
//         }
//     }
// }

var latitudeAlter;
function configureMarker(){
    // console.log("configureMarker: "+l);
    // console.log("redirect status: "+redirect);
    // getCoordinates(l);
    if (multimarker === true){
        configureMultiMarkers();
    } else {
        // console.log("TRIGGER");
        // console.log("configureMarker: "+l);
        // console.log(latitude + ", "+ longitude);
        setSingleMapMarker();
        // if (n === true){
        //     setNearbyMarkers();
        // }
    }
}
/* extract activity types & country associated */

var activityArray = [], activityMonthArray = [], countryData = [];
function getFirebaseActivitiesData(){

    var continentCode = sessionStorage.getItem('continent');
    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://mu-travel-search.firebaseio.com/"+continentCode+"/.json",
            dataType : "jsonp",
            async: false,
            success : function(parsed_json_) {
                /* get activity node for additional modularity */

                var monthArray = a + "m";
                // var countLocations = Object.keys(locations).length;
                for (var i = 0; i < locationArray.length; i++){
                    countryData[i] = parsed_json_['data'][i]['country'];
                    activityArray[i] = parsed_json_['data'][i][a];
                    // activityMonthArray[i] = parsed_json_['data'][i][monthArray];
                }
            }
        });
    });
}

var lat = [];
var lng = [];
function configureMultiMarkers(){
    map = new google.maps.Map(document.getElementById('map'), {
        /* default US map overview, for demo purposes */
        center: {lat: 42.957417, lng: -100.484740},
        zoom: 4,
    });
    // console.log(activityArray);
    lat = [];
    lng = [];
    var array = [];
    var c = 0;
    var d = 0;
    /* ERROR HERE: LAGGING BEHIND */
    // console.log(activityArray);
    console.log("configureMultiMarkers");

    for (var i = 0; i < locationArray.length; i++){
        if (activityArray[i] === "1" && countryData[i] === l){
            getCoordinates(locationArray[i]);
            array[c] = locationArray[i];
            lat[c] = latitude;
            lng[c] = longitude;
            var dataA = locationArray[i];
            setMultipleMapMarkers(lat[c], lng[c], dataA);
            c++;
        }
        if (a === "default" && countryData[i] === l){
            getCoordinates(locationArray[i]);
            array[d] = locationArray[i];
            lat[d] = latitude;
            lng[d] = longitude;
            var dataB = locationArray[i];
            setMultipleMapMarkers(lat[d], lng[d], dataB);
            d++;
        }
    }
}


var geoLat = [], geoLng = [], geoCity = [], geoState = [], geoCountry = [], geoFullLoc = [];
function setSingleMapMarker(){
    // var a = parseFloat(latitude);
    /* increase in latitude gives additional infowindow headroom */
    // latitudeAlter = a + 0.02;
    // console.log("single marker l: " + l);

    getCoordinates(l);
    // console.log(latitude + ", " + longitude);

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
        zoom: 12,
    });
    executeWeatherAPI(l);

    // var marker = new google.maps.Marker({
    //     position: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
    //     map: map
    // });


    if (n === "true"){
        console.log("geo-trigger");
        jQuery(document).ready(function($) {
            $.ajax({
                url: "http://gd.geobytes.com/GetNearbyCities?callback=?&radius=200&Latitude=" + latitude + "&Longitude=" + longitude,
                dataType: "jsonp",
                success: function (parsed_json) {
                    for (var i = 0; i < parsed_json.length; i++) {
                        geoCity[i] = (parsed_json[i][1]);
                        geoState[i] = (parsed_json[i][2]);
                        geoCountry[i] = (parsed_json[i][3]);
                        geoLat[i] = parseFloat(parsed_json[i][8]);
                        geoLng[i] = parseFloat(parsed_json[i][10]);
                        geoFullLoc[i] = geoCity[i] + ", " + geoState[i];
                        // console.log(geoFullLoc[i]);
                        /* avoids duplicate conflict with core location */
                        if (geoFullLoc[i] !== l){
                            executeGeo(geoCity[i],geoFullLoc[i],geoLat[i],geoLng[i]);
                        }
                    }
                }
            });
        });

    }

    // var contentString = "";
    // if (d === "default"){
    //     executeWeatherAPI(l);
    //     checkVariable(200, temp_c);
    //     contentString = setInfoWindowCurrent(l, temp_c);
    // } else {
    //     executeWeatherAPI(l);
    //     checkVariable(200, temp_avg);
    //     contentString = setInfoWindowCurrentMonth(l, temp_avg);
    // }

    // var infowindow = new google.maps.InfoWindow({
    //     content: contentString
    // });
    //
    // infowindow.open(map, marker);
    // marker.addListener('click', function () {
    //     infowindow.open(map, marker);
    // });
}

// function checkVariable(time, a){
//     if (a === "undefined"){
//         pause(time);
//         checkVariable(a);
//     }
// }

function executeGeo(a, b, c, d){
    for (var i = 0; i < geoLat.length; i++){
        // console.log(geoFullLoc[i]);
        var contentString = "";
        contentString = setInfoWindowNearby(b);

        var marker = new google.maps.Marker({
            position: {lat: parseFloat(c), lng: parseFloat(d)},
            map: map
        });

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        // infowindow.open(map, marker);
        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });
    }
}

// function pause(numberMillis) {
//     var now = new Date();
//     var exitTime = now.getTime() + numberMillis;
//     while (true) {
//         now = new Date();
//         if (now.getTime() > exitTime)
//             return;
//     }
// }

function setMultipleMapMarkers(latA, lngA, data){
    var marker = new google.maps.Marker({
        position: {lat: parseFloat(latA), lng: parseFloat(lngA)},
        map: map
    });

    var contentString = setInfoWindowContinent(data);
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });
}

var redirectLocation;
function executeClick(a){
    redirect = true;
    console.log("Click event: "+a);
    redirectLocation = a;
    post();
    redirect = false;
}

function executeClickNearby(a){

}

// function setInfoWindowCurrent(l1, l2){
//     return "<h2 style='text-align: center; margin: 20px'>"+l1+"</h2>\n" +
//         "<p style='text-align: center; font-size: 40px; margin: 0;color:#00aeef;'>Current: "+l2+"ºC</p>\n" +
//         "<meta name=\"destination-name\" content=\"amsterdam\">\n" +
//         "<p data-skyscanner-widget=\"LocationWidget\" data-colour=\"glen\" data-destination-name=\"document.querySelector('meta[name=destination-name]').getAttribute('content')\"></p>\n";
// }
//
// function setInfoWindowCurrentMonth(l1, l2) {
//     return "<h2 id='"+l1+"' style='text-align: center; margin: 20px'>" + l1 + "</h2>\n" +
//         "<p style='text-align: center; font-size: 40px; margin: 0;color:#00aeef;'>Month Avg: " + l2 + "ºC</p>\n" +
//         "<meta name=\"destination-name\" content=\"amsterdam\">\n" +
//         "<p data-skyscanner-widget=\"LocationWidget\" data-colour=\"glen\" data-destination-name=\"document.querySelector('meta[name=destination-name]').getAttribute('content')\"></p>\n";
// }

function setInfoWindowCurrent(l1, l2, city){
    return "<h2 style='text-align: center; margin: 20px'>"+l1+"</h2>\n" +
        "<p style='text-align: center; font-size: 40px; margin: 0;color:#00aeef;'>"+l2+"ºC</p>\n" +
        "<meta name=\"destination-name\" content=\""+l1+" \"></br>\n" +
        "<p data-skyscanner-widget-loaded=\"true\"><span class=\"skyscanner-widget-container\" data-radium=\"true\">" +
        "<a href=\"https://widgets.skyscanner.net/widget-server/v1.0/en-GB/IE/EUR/widgets/LocationWidget/refer?referrer=http%3A%2F%2Flocalhost%3A8888%2Fhomepage%2Fsearch%2Findex.html&amp;destinationId=LAXA&amp;keyword=Los%20Angeles\" " +
        "target=\"_blank\"><span class=\"skyscanner-widget basic-widget\" style=\"-moz-box-sizing:border-box;all:initial;display:inline-block;width:100%;max-width:500px;background-position:95% 50%;background-repeat:no-repeat;cursor:pointer;" +
        "border-radius:6px;border:none;box-sizing:border-box;background-color:#f1f1f1;color:#34363d;background-image:url(https://widgets.skyscanner.net/widget-server/arrow-icon.svg?colour=%2334363d&amp;v=8a3db0);padding:8px 55px 8px 20px;\" data-radium=\"true\">" +
        "<link href=\"https://fonts.googleapis.com/css?family=Source%20Sans%20Pro:600\" rel=\"stylesheet\" type=\"text/css\"><span class=\"skyscanner-widget-text\" style=\"all:initial;cursor:pointer;font:600 18px Source Sans Pro, sans-serif;text-decoration:none;" +
        "display:inline-block;color:#34363d;\" data-radium=\"true\">Search for flights to "+city+"</span></span></a></span></p>" +
        "<script src=\"https://widgets.skyscanner.net/widget-server/js/loader.js\" async><\/script>";

}

function setInfoWindowCurrentMonth(l1, l2, city) {
    return "<h2 style='text-align: center; margin: 20px'>"+l1+"</h2>\n" +
        "<p style='text-align: center; font-size: 40px; margin: 0;color:#00aeef;'>"+l2+"ºC</p>\n" +
        "<meta name=\"destination-name\" content=\""+l1+" \"></br>\n" +
        "<p data-skyscanner-widget-loaded=\"true\"><span class=\"skyscanner-widget-container\" data-radium=\"true\">" +
        "<a href=\"https://widgets.skyscanner.net/widget-server/v1.0/en-GB/IE/EUR/widgets/LocationWidget/refer?referrer=http%3A%2F%2Flocalhost%3A8888%2Fhomepage%2Fsearch%2Findex.html&amp;destinationId=LAXA&amp;keyword=Los%20Angeles\" " +
        "target=\"_blank\"><span class=\"skyscanner-widget basic-widget\" style=\"-moz-box-sizing:border-box;all:initial;display:inline-block;width:100%;max-width:500px;background-position:95% 50%;background-repeat:no-repeat;cursor:pointer;" +
        "border-radius:6px;border:none;box-sizing:border-box;background-color:#f1f1f1;color:#34363d;background-image:url(https://widgets.skyscanner.net/widget-server/arrow-icon.svg?colour=%2334363d&amp;v=8a3db0);padding:8px 55px 8px 20px;\" data-radium=\"true\">" +
        "<link href=\"https://fonts.googleapis.com/css?family=Source%20Sans%20Pro:600\" rel=\"stylesheet\" type=\"text/css\"><span class=\"skyscanner-widget-text\" style=\"all:initial;cursor:pointer;font:600 18px Source Sans Pro, sans-serif;text-decoration:none;" +
        "display:inline-block;color:#34363d;\" data-radium=\"true\">Search for flights to "+city+"</span></span></a></span></p>" +
        "<script src=\"https://widgets.skyscanner.net/widget-server/js/loader.js\" async><\/script>";
}

function setInfoWindowContinent(l1){
    return "<h2 style='text-align: center; margin: 20px'>" + l1 + "</h2>\n" +
        "<button onclick='executeClick(\""+ l1 +"\")' type=\"button\" style='width: 100%;' class=\"btn btn-info\">Explore Location</button>";
}

function setInfoWindowNearby(l1){
    return "<h2 style='text-align: center; margin: 20px'>" + l1 + "</h2>\n" +
        "<button onclick='executeClickNearby(\""+ l1 +"\")' type=\"button\" style='width: 100%;' class=\"btn btn-info\">Search for Hotels</button>";
}



