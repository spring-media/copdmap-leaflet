!function(){function e(){function e(e,o){for(var t in e.objects.mapFreigestellt.geometries){var n=e.objects.mapFreigestellt.geometries[t].properties.RS;for(var a in r[n])e.objects.mapFreigestellt.geometries[t].properties[a]=o[n][a]}}function o(e){function o(e){var o=e.target;o.setStyle({weight:5,color:"#666",dashArray:"",fillOpacity:.7}),n.setContent(o.feature.properties.name),n.setLatLng([54.8709,13.0195]),console.log(e)}function r(e){return e.properties.color}function a(e){var o=e.target;o.setStyle({fillColor:r(o.feature),fillOpacity:1,color:"#555",weight:1,opacity:.5})}function s(e){console.log(e.feature.properties.color),e.setStyle({fillColor:e.feature.properties.color,fillOpacity:1,color:"#555",weight:1,opacity:.5}),e.on({mouseover:o,mouseout:a})}var i=new L.TopoJSON;i.addData(e),i.eachLayer(s),i.addTo(t)}var t=L.map("copd_map",{center:[50.8709,10.0195],zoom:6,zoomAnimation:!0,fadeAnimation:!0,zoomControl:!0}),n=L.popup().setLatLng([50.8709,10.0195]).setContent("I am a standalone popup.").openOn(t);e(a,r),o(a)}function o(){"undefined"!=typeof a&&"undefined"!=typeof r?(console.log("paint"),e()):console.log("map not ready")}function t(){var e=new XMLHttpRequest;e.open("GET","/data/data.json",!0),e.onload=function(){if(e.status>=200&&e.status<400){var t=JSON.parse(e.responseText);r=t,o()}},e.onerror=function(){},e.send()}function n(){var e=new XMLHttpRequest;e.open("GET","/shapes/map.json",!0),e.onload=function(){if(e.status>=200&&e.status<400){var t=JSON.parse(e.responseText);a=t,o()}},e.onerror=function(){},e.send()}var r,a;t(),n()}();