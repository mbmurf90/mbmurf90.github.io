/* loading of information required */
function pageLoad(){
    getCurrentLocation();
    latitude = sessionStorage.getItem('userLat');
    longitude = sessionStorage.getItem('userLng');
    console.log("preload " + latitude);
    initMap();
    setTimeout(getIATA, 250);
    // console.log(sessionStorage.getItem('userLat'));
}

function positionUpdated(){
    locationArray = [""];
    countriesArray = [""];
    saveState();
    loadFirebaseSearch();
    loadAutoCompleteScript();
}

/* bootstrap dropdown element disabling */
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
            if (sessionStorage.getItem('userLat') === "undefined"){
                $('#date').removeAttr('disabled');
                dateDisabled = false;
                $('#activity').attr('disabled', 'disabled');
                activityDisabled = true;
                $('#checkbox-toggle').attr('disabled', 'disabled');
                checkboxDisabled = true;
            } else {
                $('#date').removeAttr('disabled');
                dateDisabled = false;
                $('#activity').attr('disabled', 'disabled');
                activityDisabled = true;
                $('#checkbox-toggle').removeAttr('disabled');
                checkboxDisabled = false;
            }
        }
    }
}

/* upon execution of search mechanism */
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
    // console.log("refined location: "+l);
}

/* required as workaround for SkyScanner SSL blockage,
* as it concatenates the required URL airport marker
* in place of the previous API implementation */
var userIATA = "";
var destIATA = "";
function getIATA(a, b){

    var userFetch = false;
    var latIATA, lngIATA;
    if (userIATA === ""){
        if (latitude === "undefined"){
            latIATA = 53.350;
            lngIATA = -6.266;
        } else {
            latIATA = sessionStorage.getItem('userLat');
            lngIATA = sessionStorage.getItem('userLng');
        }
        userFetch = true;
    } else {
        latIATA = a;
        lngIATA = b;
    }

    latIATA = parseFloat(latIATA);
    lngIATA = parseFloat(lngIATA);

    jQuery(document).ready(function($) {
        $.ajax({
            url : "https://iatageo.com/getCode/" + latIATA + "/" + lngIATA,
            dataType : "json",
            success : function(parsed_json) {

                if (userFetch === true){
                    userIATA = parsed_json['IATA'];
                    console.log("userIATA "+userIATA);
                } else {
                    destIATA = parsed_json['IATA'];
                    console.log("destIATA "+destIATA);
                }
                userFetch = false;
            }
        });
    });

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

/* search box content retrieval */
function getSearchChoices(){
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

/* SSL break on server client, requires HTTPS - default location
 * will be selected, as unable to retrieve data from GeoBytes. */
function initMap(){
    var mapLat, mapLng;
    if (latitude === "undefined" || longitude === "undefined"){
        mapLat = 53.350;
        mapLng = -6.266;
        $('#checkbox-toggle').attr('disabled', 'disabled');
        checkboxDisabled = true;
    } else {
        mapLat = parseFloat(latitude);
        mapLng = parseFloat(longitude);
    }

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: mapLat, lng: mapLng},
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

/* missing parameter warning on search page */
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
    // process firebase location data
    var fields = location.split(',');
    var country = fields[1];
    var city = fields[0];

    // console.log(dateDisabled);
    /* checks if date has been selected, and executes suitable AJAX call */
    if (d !== "default"){
        jQuery(document).ready(function($) {
            $.ajax({
                url: "https://api.wunderground.com/api/bcf92972757dbf5b/planner_" + d + "01" + d + "28/q/" + country + "/" + city + ".json",
                dataType: "jsonp",
                async: false,
                success: function (parsed_json) {
                    // weather parameter fetch
                    var temp_high = parseFloat(parsed_json['trip']['temp_high']['avg']['C']);
                    var temp_low = parseFloat(parsed_json['trip']['temp_low']['avg']['C']);
                    temp_avg = (temp_high+temp_low)/2;
                    // console.log(temp_avg);

                    var monthCode = monthNumberToName(d);

                    /* verify date number for flight search, as it selects the month of travel automatically */
                    // efficient way of figuring out if month selected has passed (e.g. March search in May),
                    // since planner API will display the last year used in calculations,
                    // if month hasn't been reached then it'll use the previous year instead of current
                    var yearAPI = parsed_json['trip']['period_of_record']['date_end']['date']['year'];
                    var dY = new Date();
                    var n = dY.getFullYear();

                    var pMonth, pPM, pPMFull;
                    if (yearAPI === n){
                        var pInt = parseInt(yearAPI);
                        pMonth = pInt + 1;
                        pPM = pMonth.toString();
                        pPMFull = pPM;
                        pPM = pPM.substring(2,4);
                    } else {
                        pPM = n.toString();
                        pPMFull = pPM;
                        pPM = pPM.substring(2,4);
                    }

                    /* JS TOO FAST FOR API, MUST EXECUTE INSIDE AJAX */
                    var contentString = setInfoWindowCurrentMonth(l, temp_avg, d, monthCode, city, destIATA, pPM, pPMFull);

                    var marker = new google.maps.Marker({
                        position: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
                        map: map
                    });

                    var infowindow = new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
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
                url: "https://api.wunderground.com/api/bcf92972757dbf5b/conditions/q/" + country + "/" + city + ".json",
                dataType: "jsonp",
                async: false,
                success: function (parsed_json) {
                    temp_c = parsed_json['current_observation']['temp_c'];
                    console.log(temp_c);

                    var contentString = setInfoWindowCurrent(l, temp_c, city, destIATA);

                    var marker = new google.maps.Marker({
                        position: {lat: parseFloat(latitude), lng: parseFloat(longitude)},
                        map: map
                    });

                    var infowindow = new google.maps.InfoWindow({
                        // content: '<div id="myInfoWinDiv">'+ contentString +'<script src="https://widgets.skyscanner.net/widget-server/js/loader.js" async></script></div>'
                        content: contentString,
                        maxWidth: 320
                    });

                    infowindow.open(map, marker);
                    marker.addListener('click', function () {
                        infowindow.open(map, marker);
                    });

                    // google.maps.event.addListener(marker, 'click', function(e){
                    //     infowindow.open(map, marker);
                    // });

                }
            });
        });
    }
}

var months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September',
    'October', 'November', 'December'
];
// function monthNameToNumber(monthname) {
//     var month = months.indexOf(monthname);
//     return month ? month + 1 : 0;
// }
function monthNumberToName(monthnumber){
    return months[monthnumber-1];
}


/* global firebase coordinate retrieval */
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
    if (multimarker === true){
        configureMultiMarkers();
    } else {
        setSingleMapMarker();
    }
}

/* extract activity types & country associated */

var activityArray = [], activityMonthArray = [], countryData = [];
function getFirebaseActivitiesData(){

    var continentCode = sessionStorage.getItem('continent');
    jQuery(document).ready(function($) {
        $.ajax({
                url : "https://mu-travel-search.firebaseio.com/"+continentCode+"/.json",
            dataType : "json",
            async: false,
            success : function(parsed_json_) {
                /* get activity node for additional modularity */

                var monthArray = a + "m";
                console.log(monthArray);
                // var countLocations = Object.keys(locations).length;
                for (var i = 0; i < locationArray.length; i++){
                    countryData[i] = parsed_json_['data'][i]['country'];
                    activityArray[i] = parsed_json_['data'][i][a];
                    // if (a !== "default"){
                    //     activityMonthArray[i] = parsed_json_['data'][i][monthArray][0];
                    // }
                }
                // console.log(activityMonthArray);
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
    // var activityArray = [][12];
    var c = 0;
    var d = 0;

    for (var i = 0; i < locationArray.length; i++){

        // if (activityMonthArray[i] !== 0){
        //     var working = activityMonthArray[i].split(',');
        // }

        // for (var j = 0; j < 12; j++){
        //     activityArray[i][j] = working[j];
        // }
        // console.log(activityArray);


        if (activityArray[i] === "1" && countryData[i] === l){
            getCoordinates(locationArray[i]);
            array[c] = locationArray[i];
            lat[c] = latitude;
            lng[c] = longitude;
            var dataA = locationArray[i];
            setMultipleMapMarkers(lat[c], lng[c], dataA);
            c++;

            $('#date').val('default');
        }
        if (a === "default" && countryData[i] === l){
            getCoordinates(locationArray[i]);
            array[d] = locationArray[i];
            lat[d] = latitude;
            lng[d] = longitude;
            var dataB = locationArray[i];
            setMultipleMapMarkers(lat[d], lng[d], dataB);
            d++;

            $('#date').val('default');
        }
    }
}


var geoLat = [], geoLng = [], geoCity = [], geoState = [], geoCountry = [], geoFullLoc = [];
function setSingleMapMarker(){

    setTimeout(getCoordinates(l), 500);
    setTimeout(getIATA(latitude, longitude), 500);
    // console.log(latitude + ", " + longitude);

    /* requires conditional */
    // $('#activity').val('default');

    var a = parseFloat(latitude);
    /* increase in latitude gives additional infowindow headroom */
    latitudeAlter = a + 0.025;
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: parseFloat(latitudeAlter), lng: parseFloat(longitude)},
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
                url: "//gd.geobytes.com/GetNearbyCities?callback=?&radius=200&Latitude=" + latitude + "&Longitude=" + longitude,
                dataType: "json",
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

/* nearby location toggle function */
function executeGeo(a, b, c, d){
    for (var i = 0; i < geoLat.length; i++){

        var contentString = "";
        contentString = setInfoWindowNearbyHotel(b, sessionStorage.getItem('date'));

        var marker = new google.maps.Marker({
            position: {lat: parseFloat(c), lng: parseFloat(d)},
            map: map
        });

        var infowindow = new google.maps.InfoWindow({
            content: contentString,
            maxWidth: 320
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
        content: contentString,
        maxWidth: 320
    });

    marker.addListener('click', function () {
        infowindow.open(map, marker);
    });
}


/* 'Explore Location' InfoWindow executor */
var redirectLocation;
function executeClick(a){
    redirect = true;
    console.log("Click event: "+a);
    redirectLocation = a;
    post();
    redirect = false;
}

/* Google Maps InfoWindow setters */
function setInfoWindowContinent(l1){
    return "<h2 style='text-align: center; margin: 20px'>" + l1 + "</h2>\n" +
        "<button onclick='executeClick(\""+ l1 +"\")' type=\"button\" style='width: 100%;' class=\"btn btn-info\">Explore Location</button>";
}

function setInfoWindowNearbyHotel(l1, m1){
    return "<h2 style='text-align: center; margin: 20px'>" + l1 + "</h2>\n" +
        "<a href=\"https://www.skyscanner.com/hotels?q="+l1 +
        "&sd=2018-"+m1+"-07&ed=2018-"+m1+"-10\" role=\"button\" target=\"_blank\" style=\"width: 100%;\" class=\"btn btn-info\">Search for Hotels</a>";
}

function setInfoWindowCurrent(l1, l2, city, dIATA){
    return "<h2 style='text-align: center; margin: 20px'>"+l1+"</h2>\n" +
        // "<button onclick='setSearchBox(\""+l1+"\")' type=\"button\" class=\"btn btn-outline-info\">"+l1+"</button>" +
        "<p class=\"font-weight-bold\" style='text-align: center;'>Current Temperature</p>\n" +
        "<p style='text-align: center; font-size: 40px; margin: 15px;color:#5ac0df;'>"+l2+"ºC</p>\n" +
        "<a href=\"https://www.skyscanner.com/transport/flights/"+userIATA+"/"+dIATA+"\" role=\"button\" target=\"_blank\" style=\"width: 100%; margin-bottom: 4px; font-size: 16px;\" class=\"btn btn-info\">Search for flights to "+city+"</a>\n" +
        "<a href=\"https://www.skyscanner.com/hotels?q="+l1 +"\" role=\"button\" target=\"_blank\" style=\"width: 100%; font-size: 16px;\" class=\"btn btn-info\">Search for Hotels</a>";
}

function setInfoWindowCurrentMonth(l1, l2, m1, monthText, city, dIATA, pM, pMFull){
    return "<h2 style='text-align: center; margin: 20px'>"+l1+"</h2>\n" +
        // "<button onclick='setSearchBox(\""+l1+"\")' type=\"button\" class=\"btn btn-outline-info\">"+l1+"</button>" +
        "<p class=\"font-weight-bold\" style='text-align: center;'>Monthly Average for "+monthText+"</p>\n" +
        "<p style='text-align: center; font-size: 40px; margin: 15px;color:#5ac0df;'>"+l2+"ºC</p>\n" +
        "<a href=\"https://www.skyscanner.com/transport/flights/"+userIATA+"/"+dIATA+"?oym="+pM+m1+"&iym="+pM+m1+"\" role=\"button\" target=\"_blank\" style=\"width: 100%; margin-bottom: 4px; font-size: 16px;\" class=\"btn btn-info\">Search for flights to "+city+"</a>\n" +
        "<a href=\"https://www.skyscanner.com/hotels?q="+l1 +
        "&sd="+pMFull+"-"+m1+"-07&ed="+pMFull+"-"+m1+"-10\" role=\"button\" target=\"_blank\" style=\"width: 100%; font-size: 16px;\" class=\"btn btn-info\">Search for Hotels</a>";
}



