/*jslint browser: true*/
/*global L */

(function(){
	var mapdata, mapshape;
    //console.log(window);
		function loadCOPDMap (){
		    var map = L.map('copd_map', {
		        center: [50.8709, 10.0195],
		        zoom: 6,
		        zoomAnimation:true,
		        fadeAnimation:true,
		        zoomControl: true
		    });

		    var popup = L.popup()
		        .setLatLng([50.8709, 10.0195])
		        .setContent('I am a standalone popup.')
		        .openOn(map);

						function mergeDataJsonToMapShape(map,data){
								for(var i in map.objects.mapFreigestellt.geometries){
										var entryID = map.objects.mapFreigestellt.geometries[i].properties.RS;
										for (var attrname in mapdata[entryID]) {
												map.objects.mapFreigestellt.geometries[i].properties[attrname]= data[entryID][attrname];
										}
								}
						}
		    mergeDataJsonToMapShape(mapshape,mapdata);
				function loadMap(mapData){

						var topoLayer = new L.TopoJSON();
						function highlight(e){
								var layer = e.target;

								layer.setStyle({
										weight: 5,
										color: '#666',
										dashArray: '',
										fillOpacity: 0.7
								});

								popup.setContent(layer.feature.properties.name);
								popup.setLatLng([54.8709, 13.0195]);

								console.log(e);
						}
						function getColor(feature){
								/*Einfärbung muss dann je nach Wert berechnet werden, Farbe momentan Hardcoded im DatenJSON*/
								return feature.properties.color;
						}
						function resetHighlight(e){
								var layer = e.target;
								layer.setStyle({
										fillColor : getColor(layer.feature),
										fillOpacity: 1,
										color:'#555',
										weight:1,
										opacity:0.5
								});
						}
						function handleLayer(layer){

								console.log(layer.feature.properties.color);

								layer.setStyle({
										fillColor : layer.feature.properties.color,
										fillOpacity: 1,
										color:'#555',
										weight:1,
										opacity:0.5
								});

								layer.on({
										mouseover:highlight,
										mouseout:resetHighlight
								});
						}
						topoLayer.addData(mapData);
						topoLayer.eachLayer(handleLayer);
						topoLayer.addTo(map);









				}
				loadMap(mapshape);




		}
	function paintMapIfReady() {
			if (typeof mapshape !== 'undefined' && typeof mapdata !== 'undefined') {
				console.log('paint');
				loadCOPDMap();
				//LoadCOPDMap();
			} else {
				console.log('map not ready');
			}
		}
	function loadMapdata() {
		var request = new XMLHttpRequest();
		request.open('GET', '/data/data.json', true);

		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		    // Success!
		    var data = JSON.parse(request.responseText);
				mapdata = data;
				paintMapIfReady();
		  } else {
		    // We reached our target server, but it returned an error

		  }
		};

		request.onerror = function() {
  	// There was a connection error of some sort
		};

		request.send();
	}
	function loadMapShape() {
		var request = new XMLHttpRequest();
		request.open('GET', '/shapes/map.json', true);

		request.onload = function() {
		  if (request.status >= 200 && request.status < 400) {
		    // Success!
		    var data = JSON.parse(request.responseText);
				mapshape = data;
				paintMapIfReady();
		  } else {
		    // We reached our target server, but it returned an error

		  }
		};

		request.onerror = function() {
  	// There was a connection error of some sort
		};

		request.send();
	}




loadMapdata();
loadMapShape();
})();
