/*
 используя Google Maps имеем возможность поставить точки на карте (правой кнопкой мыши поставить точку левой удалить).
 После последующей точки добавляем точке описание, сколько времени мы будем двигаться с начальной точки до этой,
 если у нас 3 точки то у 2ой точки растояние и время от 1ой у 3ей точки от 1ой и 2ой..
 есть поле в которое мы вводим среднюю скорость движения, от этого и считаем наше время… Также есть кнопка старт,
 при нажатии на нее на карте показывает как мы двигаемся по нашему маршруту согласно нашей скорости…
 */

var map;
var markers = [];
var dist = [];
var id_marker = 0;

$(document).ready(function() {
    initMap();

    $('#range_val').html($('#range').val() + ' km/h')

    $('#range').on('input', function(){
        $('#range_val').html($('#range').val() + ' km/h');

        if(getDistance() > 0 ) $('#times').html('Duration: ' + getDuration(rangerms()) + '<br />' +
            'Distance: ' + getDistance()/1000 + ' km');
    });
});

function initMap() {
    var start_p = { lat:47.8388129,  lng:35.123269 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: start_p,
        scrollwheel: true,
        zoom: 7
    });

    google.maps.event.addListener(map, 'click', function(event){
        if(markers.length < 8) {
            var marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                title: '',
                id: id_marker++
            });

            google.maps.event.addListener(marker, 'rightclick', function () {
                marker.setMap(null);
                markers.splice(markers.indexOf(marker), 1);
                deleteMarker(marker);
            });

            markers.push(marker);
            showOneMarker(marker);
        }
        else{
            alert('NOPE!');
        }
    });
}

function route() {
    var directionsDisplay = new google.maps.DirectionsRenderer({
        map: map
    });

    var wp = [];
    markers.forEach(function(e, i){
        if(i == 0 || i == markers.length - 1) { }
        else {
            wp.push({
                location: e.position,
                stopover: true
            });
        }
    });

    var request = {
        origin: markers[0].position,
        destination:markers[markers.length - 1].position ,
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: wp
    };

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        }
    });
}

function buildRoutes() {
    dist = [];
    $('#map').html('');
    initMap();
    route();
    distance();
}

function resetRoutes() {
    $('#map').html('');
    $('#times').html('');
    initMap();
    markers.forEach(function(e){
        e.setMap(map);
    });
    dist = [];
}

function resetMarkers() {
    $('#warning').html('Осталось: 8 точек');
    $('#map').html('');
    $('#times').html('');
    $('#markers').html('');
    initMap();
    markers = [];
    dist = [];
}

function showOneMarker(marker) {
    $('#warning').html('Осталось: ' + (8 - markers.length) + ' точек');
    var show =  $('#markers');
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': marker.position}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                show.append('<div id="id_'+ marker.id + '">' + results[1].formatted_address +'  ' + marker.position.toString()+ '</div>')
            } else {
                show.append('<div id="id_'+ marker.id  + '">No results found  ' + marker.position.toString() + '</div>')
            }
        } else {
            showOneMarker(marker);
        }
    });
}

function deleteMarker(marker) {
    $('#warning').html('Осталось: ' + (8 - markers.length) + ' точек');
    $('#id_' + marker.id).remove();
}

function distance() {
    markers.forEach(function(e, i) {
        if(i < markers.length - 1) {
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [e.position],
                destinations: [markers[i + 1].position],
                travelMode: google.maps.TravelMode.DRIVING,
                avoidHighways: true,
                avoidTolls: true
            }, callback);
        }
    });

    function callback(response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK) {
            var origins = response.originAddresses;
            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;
                for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    var distance = element.distance.value;
                    dist.push(distance);
                    $('#times').html('Duration: ' + getDuration(rangerms()) + '<br />' +
                        'Distance: ' + getDistance()/1000 + ' km');
                }
            }
        }
    }
}

function rangerms() {
    var kms = $('#range').val();
    return kms*1000/3600
}

function getDistance() {
    var d = 0;
    dist.forEach(function(e){d+=e});
    return d;
}

function getDuration(speed) {
    var t = getDistance() / speed;
    var m = Math.floor((t/60)%60),
        h = Math.floor((t/60/60)%24),
        d = Math.floor(t/24/60/60);
    var date = '';
    if(d > 0) date += d + ' days ';
    if(h > 0) date += h + ' hours ';
    if(m > 0) date += m + ' minutes ';
    return date;
}