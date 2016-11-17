/*jslint browser: true*/
/*global L */
var deb;

(function () {

    L.TopoJSON = L.GeoJSON.extend({
        addData: function(jsonData){
            if(jsonData.type === "Topology") {
                for (key in jsonData.objects){
                    geojson=topojson.feature(jsonData,jsonData.objects[key]);
                    L.GeoJSON.prototype.addData.call(this, geojson);
                }
            }else{
                L.GeoJSON.prototype.addData.call(this, jsonData);
            }
        }
    });


    var mapdata, mapshape,map,selectedLayer;
    selectedLayer='undefined';
    var tooltip = {
        tt: document.querySelector('#tooltip'), //prefix?id?
        show: function (x, y) {
            this.tt.style.top = y != 0 ? ((y-40) + 'px') : "inherit";
            this.tt.style.left = x != 0 ? ((x+120) + 'px') : "inherit";
            this.tt.style.display = '';
        },
        update: function (label) {
            this.tt.children[0].textContent = mapdata[label].name;
        },
        hide: function () {
            this.tt.style.display = 'none';
        }
    };



    function loadRessources(file,callback){
        var request = new XMLHttpRequest();
        request.open('GET', file, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                callback(request.responseText);

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
        // only on large screens
        loadMapShape();
    }
    function loadMapdata() {
        loadRessources(
            'https://static.apps.welt.de/2016/copd-dev/data/data.json',
            function(response){
                mapdata = JSON.parse(response);
                populateSelect(mapdata);
                paintMapIfReady();
            }
        );
    }




    function loadMapShape() {
        loadRessources(
            'https://static.apps.welt.de/2016/copd-dev/shapes/map.json',
            function (response){
                mapshape = JSON.parse(response);
                paintMapIfReady();
            }
        );
    }

    function populateSelect(options) {
        var select = document.querySelector("#copd_app select");
        var RS = Object.keys(options);
        for (var i = 0; i < RS.length; i++) {

            var option = document.createElement('option');
            option.value = RS[i];
            option.textContent = mapdata[RS[i]].name;
            select.appendChild(option);
        }

        sortSelect(select);
        select.options[2].selected = true;
        updateStats("11");

        select.addEventListener("change", function (e) {
            showSelection(e);
        });
    }

    function paintMapIfReady() {
        if (typeof mapshape !== 'undefined' && typeof mapdata !== 'undefined') {

            //Features can be set selected
            for(var i in mapshape.objects.mapFreigestellt.geometries){
                mapshape.objects.mapFreigestellt.geometries[i].properties['selected'] = false;
            }

            loadCOPDMap();
            deb = mapdata;
        } else {

        }
    }


    L.CRS.CustomZoom = L.extend({}, L.CRS.EPSG3857, {
        scale: function (zoom) {
            return 256 * Math.pow(1.25, zoom);
        }
    });

    function loadCOPDMap() {



        map = L.map('copd_map', {
            crs: L.CRS.CustomZoom,
            zoomAnimation: true,
            fadeAnimation: true,
            zoomControl: false,
            attributionControl:false
        });
        map.dragging.disable();
        // map.zoomControl.setPosition('bottomright');
        var bounds = [[55.0, 5.5],[47.0, 15.95]];
        // map.setView(new L.LatLng(51.2, 5.9), 2);
        map.fitBounds(bounds);


        loadLeafletMap(mapshape);
    }

    function loadLeafletMap(mapData) {
        var topoLayer = new L.TopoJSON();



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


    function highlight(e) {
        var x = e.layerPoint.x,
            y = e.layerPoint.y;
        var layer = e.target;
        console.log('Tooltip');
        console.loge
        console.log(e);
        console.log(layer.feature.properties.RS);
        console.log(x+":"+y);


        tooltip.update(layer.feature.properties.RS);
        tooltip.show(x, y);

        layer.setStyle({
            fillOpacity: 0.7
        });
    }

    function resetHighlight(e) {
        tooltip.hide();
        var layer = e.target;

        if(!layer.feature.properties.selected) {
            layer.setStyle({
                fillOpacity: 1
            });
        }
    }

    function showSelection(e) {

        var layer;
        if (e.type === 'change') {
            layer = "";

            updateStats(e.target.value);
        } else {
            selectLayer(e.target);
            updateStats(e.target.feature.properties.RS);
        }
    }

    function selectLayer(layer){
        if(selectedLayer!=='undefined'){
            selectedLayer.feature.properties.selected = false;
            selectedLayer.setStyle({
                fillOpacity: 1
            });
        }//

        layer.feature.properties.selected = true;
        layer.setStyle({
            fillOpacity: 0.7
        });
        selectedLayer = layer;
    }

    function updateStats(RS) {
        document.querySelector("#graph_text").innerText = mapdata[RS].name;
        document.querySelector("#graph_subtext_percentage").innerText = mapdata[RS].percentageSmoker + "%" ;
        document.querySelector("#graph_svg_bar").setAttribute("width", parseFloat(mapdata[RS].percentageSmoker)*3.333333333333 + "%");
        document.getElementById("ranking_smoking").getElementsByClassName('icon')[0].innerText = mapdata[RS].rankingSmoker + ".";
        document.getElementById("ranking_copd").getElementsByClassName('icon')[0].innerText = mapdata[RS].rankingCOPD + ".";
    }



})();
