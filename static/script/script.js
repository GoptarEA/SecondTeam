ymaps.ready(init);

function init(){
    function addRouteOnMap(arrofpoints) {
        multiRoute = new ymaps.multiRouter.MultiRoute({
            referencePoints: arrofpoints,
            params: {
                routingMode: 'pedestrian'
            }
        }, {
            boundsAutoApply: true
        });
        myMap.geoObjects.add(multiRoute);
    }

    function addPointsOnMap(arrofpoints) {
        for (const [key, value] of arrofpoints) {
            myMap.geoObjects.add(new ymaps.Placemark([value[0], value[1]], {
                balloonContent: '<strong>' + key + '</strong>'
            }, {
                preset: 'islands#dotIcon',
                iconColor: '#' + (Math.random().toString(16) + '000000').substring(2,8).toUpperCase()
            }));   
        }
    }

    async function getNewRoute(point1, point2) {
            return new ymaps.multiRouter.MultiRoute({
                referencePoints: [
                    point1,
                    point2
                ],
                params: {
                    routingMode: 'pedestrian'
                }
            }, {
                boundsAutoApply: true
            });
    }

    async function addNewRoute(multiRoute, key, start, tm) {
        multiRoute.model.events.add('requestsuccess', async () => {
            var a = await multiRoute.getActiveRoute().getPaths();
            let s = "";
            a.each(function(path) {
                let a1 = Array.from(path.properties.get('coordinates')) 
                for (let i = 0; i < a1.length; i += 1) {
                        s += String(a1[i][1]).split(".")[0] + "." + String(a1[i][1]).split(".")[1] + "," +
                        String(a1[i][0]).split(".")[0] + "." + String(a1[i][0]).split(".")[1] + ",";
                }
            });
            const div = document.querySelector('div#pop_up_time_routes');
            const t = document.querySelector("#time_route_temp");
            const p = t.content.querySelectorAll("#about_route");
            const image = t.content.querySelectorAll("#small_map");
            var activeRouteTime = await multiRoute.getActiveRoute().properties.get("duration").text;
            if (parseInt(activeRouteTime) <= tm && key !== start) {
                p[0].textContent = "Старт: " + String(start);
                p[1].textContent = "Финиш: " + String(key);
                p[2].textContent = "Время: " + String(activeRouteTime);
                image[0].src="https://static-maps.yandex.ru/1.x/?l=map&pl=" + s.slice(0, -1);
                div.append(t.content.cloneNode(true));
            }
        });
    }


    function changeType() {
        myMap.setType('yandex#satellite'); 
    }

    var myMap = new ymaps.Map("map", {
    center: [55.831054, 37.629914],
    zoom: 15
    }, {
        restrictMapArea: [[55.843203, 37.608155], [55.821900, 37.654070]]
    });

    ['zoomControl', 'searchControl', 'rulerControl',
    'typeSelector', 'fullscreenControl', 'trafficControl'].forEach(elem => myMap.controls.remove(elem));

    Array.from(document.getElementsByClassName("new_point_route_input")).forEach(elem => 
        new ymaps.SuggestView(elem, {provider: provider, results: 10}));

    document.getElementById("sub_menu_links").addEventListener("click", () => myMap.geoObjects.removeAll());

    document.getElementById("POI").addEventListener("click", () => addPointsOnMap(dict));

    document.getElementById("type").addEventListener("click", () => changeType());

    document.getElementById("btn_add_route").addEventListener("click", () => {
        myMap.geoObjects.removeAll();
        addRouteOnMap(getCoords.gcMultiple(Array.from(document.getElementsByClassName("new_point_route_input")).map((elem) => elem.value)));
        document.getElementById("dyn_routes_win").style.display = "none";
        Array.from(document.getElementsByClassName("new_point_route_input")).forEach(elem => elem.value = "");
    });

    Array.from(document.getElementsByClassName("pop_up_route")).forEach(elem => elem.addEventListener("click",
    () => [myMap.geoObjects.removeAll(), addRouteOnMap(getCoords.gcMultiple(routeHtmlPointParse(elem.childNodes[1])))]));


    document.getElementById("search_routes_btn").addEventListener("click", async () => {
        for (const [key, value] of dict) {
            await addNewRoute(await getNewRoute(value, 
                getCoords.gcSingle(document.getElementById("time_route_input").value)), key, 
                document.getElementById("time_route_input").value, 
                parseInt(document.getElementById("time_input").value.split(":")[0]) * 60 + 
                parseInt(document.getElementById("time_input").value.split(":")[1]));
        }
    });

    document.getElementById("pop_up_time_routes").addEventListener("click", (elem) => {
        var neededblock;
        if (elem.target.id === "about_route") {
            neededblock = elem.target.parentElement;
        } else if (elem.target.id === "pop_up_about_block") {
            neededblock = elem.target;
        } else if (elem.target.id === "pop_up_route") {
            neededblock = elem.target.childNodes[1];
        }
        myMap.geoObjects.removeAll();
        addRouteOnMap(getCoords.gcMultiple(routeHtmlPointParse(neededblock)));
        document.getElementById("time_routes_win").style.display = "none";
    });
}

document.getElementById("static").addEventListener("click", 
() => document.getElementById("static_routes_win").style.display = "block");

document.getElementById("static_routes_win").addEventListener("click", (e) => {
    if (e.target.id === "static_routes_win" || 
    e.target.id === "pop_up_about_block" || e.target.id === "about_route") {
        document.getElementById("static_routes_win").style.display = "none";
    }
});

document.getElementById("dynamic").addEventListener("click", 
() => document.getElementById("dyn_routes_win").style.display = "block");

document.getElementById("dyn_routes_win").addEventListener("click", (e) => {
    if (e.target.id === "dyn_routes_win") {
        document.getElementById("dyn_routes_win").style.display = "none";
    }
});

document.getElementById("time_routes").addEventListener("click", 
() => document.getElementById("time_routes_win").style.display = "block");

document.getElementById("login_btn").addEventListener("click", 
() => document.getElementById("login_pop_up").style.display = "block");

document.getElementById("time_routes_win").addEventListener("click", (e) => {
    if (e.target.id === "time_routes_win") {
        document.getElementById("time_routes_win").style.display = "none";
    }
});

document.getElementById("login_pop_up").addEventListener("click", (e) => {
    if (e.target.id === "login_pop_up" || e.target.id === "reg_btn") {
        document.getElementById("login_pop_up").style.display = "none";
    }
});

document.getElementById("btn_add_images").addEventListener("click", () => {
    if (Array.from(document.getElementsByClassName("first_route_point")).slice(1, 5).find(elem => 
        window.getComputedStyle(elem).display === "none") !== undefined) {
            Array.from(document.getElementsByClassName("first_route_point")).slice(1, 5).find(elem => 
                window.getComputedStyle(elem).display === "none").style.display = "block";
        }
});

document.getElementById("btn_del_images").addEventListener("click", () => {
    if (Array.from(document.getElementsByClassName("first_route_point")).slice(1, 5).reverse().find(elem => 
        window.getComputedStyle(elem).display === "block") !== undefined) {
            Array.from(document.getElementsByClassName("first_route_point")).slice(1, 5).reverse().find(elem => 
                window.getComputedStyle(elem).display === "block").style.display = "none";
        }
});


function routeHtmlPointParse (htmlelem) {
    return [htmlelem.childNodes[1].innerHTML.split(": ")[1],
    htmlelem.childNodes[3].innerHTML.split(": ")[1]]
}

$(function() {
    $("#btn_add_route").bind("click", function () {
        $.each(document.getElementsByClassName("new_point_route_input"), function (ind, elem) {
            let point = $(elem).val();
            $.getJSON($SCRIPT_ROOT + '/history', {
            pnt: point
            });
        });
    });
    $("#add_to_favorites").bind("click", function () {
        $.each(document.getElementsByClassName("new_point_route_input"), function (ind, elem) {
            let point = $(elem).val();
            $.getJSON($SCRIPT_ROOT + '/favorites', {
            pnt: point
            });
        });
    });
});
