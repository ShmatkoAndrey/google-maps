/*
 используя Google Maps имеем возможность:

 поставить точки на карте (правой кнопкой мыши поставить точку левой удалить).

 После последующей точки добавляем точке описание, сколько времени мы будем двигаться с начальной точки до этой,
 если у нас 3 точки то у 2ой точки растояние и время от 1ой у 3ей точки от 1ой и 2ой..

 есть поле в которое мы вводим среднюю скорость движения, от этого и считаем наше время…

 Также есть кнопка старт, при нажатии на нее на карте показывает как мы двигаемся по нашему маршруту согласно нашей скорости…
 */

var map;
var markers = [];
var dist = [];
var id_marker = 0;
var way = [];
var interval_car;
var marker_car;

$(document).ready(function () {
    initMap();

    $('#range_val').html($('#range').val() + ' km/h')

    $('#range').on('input', function () {
        $('#range_val').html($('#range').val() + ' km/h');

        if (getDistance() > 0) $('#times').html('Duration: ' + getDuration(getDistance()) + '<br />' +
            'Distance: ' + getDistance() / 1000 + ' km');
    });
});

function initMap() {
    var start_p = {lat: 47.8388129, lng: 35.123269};
    map = new google.maps.Map(document.getElementById('map'), {
        center: start_p,
        scrollwheel: true,
        zoom: 7
    });

    google.maps.event.addListener(map, 'click', function (event) {
        if (markers.length < 8) {
            var marker = new google.maps.Marker({
                position: event.latLng,
                map: map,
                title: '',
                id: id_marker++,
                animation: google.maps.Animation.DROP
            });

            google.maps.event.addListener(marker, 'rightclick', function () {
                marker.setMap(null);
                markers.splice(markers.indexOf(marker), 1);
                deleteMarker(marker);
            });

            markers.push(marker);
            showOneMarker(marker);

            if ($('#checkbox').prop('checked') && markers.length > 1) {
                buildRoutes();
            }

            distanceAll();
            var infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', (function () {
                return function () {
                    var d = getDistPoints(marker);

                    var cs = '<div>';
                    if (d != 'start') {
                        cs += d / 1000 + ' km' +
                            '<br>' +
                            getDuration(d);
                    }
                    else {
                        cs += d;
                    }

                    cs += '</div>';
                    infowindow.setContent(cs);
                    infowindow.open(map, marker);
                }
            })(marker));
        }
        else {
            alert('NOPE!');
        }
    });
}

function route() {
    var directionsDisplay = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true
    });

    var wp = [];
    markers.forEach(function (e, i) {
        if (i != 0 && i != markers.length - 1) {
            wp.push({
                location: e.position,
                stopover: true
            });
        }
    });

    var request = {
        origin: markers[0].position,
        destination: markers[markers.length - 1].position,
        travelMode: google.maps.TravelMode.WALKING,
        waypoints: wp
    };

    var directionsService = new google.maps.DirectionsService();
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            way = response.routes[0].overview_path;
        }
    });

    markers.forEach(function(e){
        e.setMap(map);
    });
}

function buildRoutes() {
    if(interval_car) clearInterval(interval_car);
    if(marker_car) marker_car.setMap(null);
    dist = [];
    $('#map').html('');
    initMap();
    distanceAll();
    route();
}

function resetRoutes() {
    $('#map').html('');
    $('#times').html('');
    stopCarInterval();
    initMap();
    markers.forEach(function (e) {
        e.setMap(map);
    });
    dist = [];
}

function resetMarkers() {
    $('#warning').html('Осталось: 8 точек');
    $('#map').html('');
    $('#times').html('');
    $('#markers').html('');
    stopCarInterval();
    initMap();
    markers = [];
    dist = [];
}

function showOneMarker(marker) {
    $('#warning').html('Осталось: ' + (8 - markers.length) + ' точек');
    var show = $('#markers');
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({'location': marker.position}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            if (results[1]) {
                show.append('<div id="id_' + marker.id + '">' + results[1].formatted_address + ' ' + marker.position.toString() + '</div>')
            } else {
                show.append('<div id="id_' + marker.id + '">No results found  ' + marker.position.toString() + '</div>')
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

function distanceAll() {
    dist = [];
    markers.forEach(function (e, i) {
        if (i < markers.length - 1) {
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
        dist = [];
        if (status == google.maps.DistanceMatrixStatus.OK) {
            var origins = response.originAddresses;
            for (var i = 0; i < origins.length; i++) {
                var results = response.rows[i].elements;
                for (var j = 0; j < results.length; j++) {
                    var element = results[j];
                    if (element.distance) {
                        var distance = element.distance.value;
                        dist.push(distance);
                        $('#times').html('Duration: ' + getDuration(getDistance()) + '<br />' +
                            'Distance: ' + getDistance() / 1000 + ' km');
                    }
                    else {
                        if(response.destinationAddresses[0].substr(0, 15) ==
                            markers[markers.length - 1].position.toString().replace('(', '').replace(')', '').replace(' ', '').substr(0, 15)) {
                            var fail_marker = markers.pop();
                            fail_marker.setMap(null);
                            if($('#checkbox').prop('checked') && markers.length > 1) {
                                buildRoutes();
                            }
                        }
                    }
                }
            }
        }
    }
}

function getDistPoints(p2) {
    var n = markers.indexOf(p2);
    if(n > 0) {
        var d = 0;
        for(var i = n - 1; i >= 0; i--) {
            d += dist[i];
        }
        return d;
    }
    else return 'start'
}

function rangerms() {
    var kms = $('#range').val();
    return kms * 1000 / 3600
}

function getDistance() {
    var d = 0;
    dist.forEach(function (e) {
        d += e
    });
    return d;
}

function getDuration(distance) {
    var t = distance / rangerms();
    var m = Math.floor((t / 60) % 60),
        h = Math.floor((t / 60 / 60) % 24),
        d = Math.floor(t / 24 / 60 / 60);
    var date = '';
    if (d > 0) date += d + ' days ';
    if (h > 0) date += h + ' hours ';
    if (m > 0) date += m + ' minutes ';
    return date;
}

function stopCarInterval() {
    if(interval_car) clearInterval(interval_car);
    way = [];
    if(marker_car) marker_car.setMap(null);
}

function startDriving() {
    if(interval_car) {
        clearInterval(interval_car);
        marker_car.setMap(null);
    }

    if(way.length == 0) {
        buildRoutes();
        setTimeout(function(){
            startDriving();
        }, 5000)
    }
    var step = 0;
    var image = {
        url: 'imgs/car-icon.png',
        scaledSize: new google.maps.Size(25, 25)
    };

    marker_car = new google.maps.Marker({
        position: way[step],
        map: map,
        title: 'Car',
        icon: image
    });

    interval_car = setInterval(function() {
        if(step > way.length - 1) clearInterval(interval_car);
        marker_car.setMap(null);
        marker_car.position = way[step++];
        marker_car.setMap(map);
    }, getDistance() / rangerms() / 200);
}