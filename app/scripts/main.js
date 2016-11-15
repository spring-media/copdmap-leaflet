/*jslint browser: true*/
/*global L */
var deb;
(function () {
    var mapdata, mapshape, map;
    var tooltip = {
        tt: document.querySelector('#tooltip'), //prefix?id?
        show: function (x, y) {
            this.tt.style.top = y != 0 ? ((y + 20) + 'px') : "inherit";
            this.tt.style.left = x != 0 ? ((x - 100) + 'px') : "inherit";
            this.tt.style.display = '';
        },
        update: function (label) {
            this.tt.children[0].textContent = mapdata[label].name;
        },
        hide: function () {
            this.tt.style.display = 'none';
        }
    };

    function loadCOPDMap() {

        map = L.map('copd_map', {
            center: [50.8709, 10.0195],
            zoom: 6,
            zoomAnimation: true,
            fadeAnimation: true,
            zoomControl: true,
            maxZoom: 8,
            minZoom: 5,
            attributionControl:false
        });
        map.zoomControl.setPosition('bottomright');
        loadMap(mapshape);
    }

    function populateSelect(options) {
        var select = document.querySelector("#copd_app select");
        var RS = Object.keys(options);
        for (var i = 0; i < RS.length; i++) {

            var option = document.createElement('option');
            option.value = RS[i];
            option.textContent = mapdata[RS[i]].name;
            select.append(option);
        }

        sortSelect(select);
        select.options[2].selected = true;
        updateStats("11");

        select.addEventListener("change", function (e) {
            showSelection(e);
        });
    }

    function updateStats(RS) {
        document.querySelector("#graph_text").innerText = mapdata[RS].name;
        document.querySelector("#graph_subtext_percentage").innerText = mapdata[RS].percentageSmoker + "%" ;
        document.querySelector("#graph_svg_bar").setAttribute("style", "width:" + parseFloat(mapdata[RS].percentageSmoker)*3.333333333333 + "%");

        document.querySelector("#ranking_smoking").innerText = mapdata[RS].rankingSmoker + ".";
        document.querySelector("#ranking_copd").innerText = mapdata[RS].rankingCOPD + ".";
    }

    function showSelection(e) {


        var layer;
        if (e.type === 'change') {
            layer = "";

            updateStats(e.target.value);
        } else {
            layer = e.target;
            layer.setStyle({
                fillOpacity: 0.7
            });
            updateStats(layer.feature.properties.RS);
        }
    }

    function loadMap(mapData) {
        var topoLayer = new L.TopoJSON();

        function highlight(e) {
            var x = e.originalEvent.clientX,
                y = e.originalEvent.clientY;
            var layer = e.target;
            tooltip.update(layer.feature.properties.RS);
            tooltip.show(x, y);

            layer.setStyle({
                fillOpacity: 0.7
            });
        }

        function resetHighlight(e) {
            tooltip.hide();
            var layer = e.target;
            layer.setStyle({
                fillOpacity: 1
            });
        }

        function handleLayer(layer) {
            layer.setStyle({
                weight: 1,
                color: '#fff',
                fillColor: '#00639E',
                dashArray: '',
                fillOpacity: 1
            });

            layer.on({
                mouseover: highlight,
                mouseout: resetHighlight,
                click: showSelection
            });
        }

        topoLayer.addData(mapData);
        topoLayer.eachLayer(handleLayer);
        topoLayer.addTo(map);
    }

    function paintMapIfReady() {
        if (typeof mapshape !== 'undefined' && typeof mapdata !== 'undefined') {

            loadCOPDMap();
            deb = mapdata;
        } else {

        }
    }

    function loadMapdata() {
        var request = new XMLHttpRequest();
        request.open('GET', '/data/data.json', true);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                mapdata = JSON.parse(request.responseText);
                populateSelect(mapdata);
                paintMapIfReady();
            } else {
                // We reached our target server, but it returned an error

            }
        };

        request.onerror = function () {
            // There was a connection error of some sort
        };

        request.send();
    }

    function loadMapShape() { // only on large screens
        var request = new XMLHttpRequest();
        request.open('GET', '/shapes/map.json', true);

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                mapshape = JSON.parse(request.responseText);
                paintMapIfReady();
            } else {
                // We reached our target server, but it returned an error

            }
        };

        request.onerror = function () {
            // There was a connection error of some sort
        };

        request.send();
    }

    function isMobile() {
        return (window.matchMedia("screen and (max-width:639px)").matches);
    }

    function sortSelect(selElem) {
        var tmpAry = [];
        for (var i=0;i<selElem.options.length;i++) {
            tmpAry[i] = [];
            tmpAry[i][0] = selElem.options[i].text;
            tmpAry[i][1] = selElem.options[i].value;
        }
        tmpAry.sort();
        while (selElem.options.length > 0) {
            selElem.options[0] = null;
        }
        for (var j=0;j<tmpAry.length;j++) {
            selElem.options[j] = new Option(tmpAry[j][0], tmpAry[j][1]);
        }
    }

    loadMapdata();
    if (!isMobile()) {
        loadMapShape();
    }

})();
