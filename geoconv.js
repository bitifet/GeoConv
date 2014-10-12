/*
 * geoconv.js
 * ------------------
 * UTM <-> Geographic coordinates conversion class
 *
 * @credits: Based on xls spreadsheet from Gabriel Ortiz (http://gabrielortiz.com)
 *       URL: http://www.gabrielortiz.com/descargas/descarga.asp?Fichero=Conversion_UTM_Geograficas.xls
 *       Equations from:
 *           "Bolettino di Geodesia e Science Affini", num 1
 *           by: Alberto Cotticia & Luciano Surace .
 *
 * @author: Joan Miquel Torres <jmtorres@112ib.com> (Tranlation to PHP/javascript only)
 * @company: Gestió d'Emergències de les Illes Balears (GEIBSAU).
 *       http://www.112ib.com
 *
 * Git repository: https://github.com/bitifet/GeoConv
 *
 * Copyright: Joan Miquel Torres, Gabriel Ortiz.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
"use strict";

(function geoconvModule (){

	// Miscellaneous helpers://{{{
	// ======================

	function inArray(which, arr){ // Search inside an array.//{{{
		 for(var i in arr){
			  if(arr[i]==which){
					return true;
			  }
		 }
		 return false;    
	};//}}}

	function isNumeric (n) {//{{{
		return ! isNaN(parseFloat(n)) && isFinite(n);
	}//}}}

	function trunc (n) {//{{{
		return n < 0 ? Math.ceil(n) : Math.floor(n);
	}//}}}

	// ======================//}}}

	// Static data and defults://{{{
	// ========================

	var ellipsoids = {/*{{{*/
		//	'id': ['Elipsoide', 'Fecha', 'a (semieje mayor)', 'b (semieje menor)'],
		'airy_1830': ['Airy 1830', '1830', 6377563.396000, 6356256.910000],
		'airy_modificado_1965': ['Airy Modificado 1965', '1965', 6377340.189000, 6356034.447900],
		'bessel_1841': ['Bessel 1841', '1841', 6377397.155000, 6356078.962840],
		'clarke_1866': ['Clarke 1866', '1866', 6378206.400000, 6356583.800000],
		'clarke_1880': ['Clarke 1880', '1880', 6378249.145000, 6356514.869550],
		'fischer_1960': ['Fischer 1960', '1960', 6378166.000000, 6356784.280000],
		'fischer_1968': ['Fischer 1968', '1968', 6378150.000000, 6356768.330000],
		'grs80': ['GRS80', '1980', '6378137.000000', 6356752.314140],
		'hayford_1909': ['Hayford 1909', '1909', 6378388.000000, 6356911.946130],
		'helmert_1906': ['Helmert 1906', '1906', 6378200.000000, 6356818.170000],
		'hough_1960': ['Hough 1960', '1960', 6378270.000000, 6356794.343479],
		'internacional_1909': ['Internacional 1909', '1909', 6378388.000000, 6356911.946130],
		'internacional_1924': ['Internacional 1924', '1924', 6378388.000000, 6356911.946130],
		'krasovsky 1940': ['Krasovsky 1940', '1940', 6378245.000000, 6356863.018800],
		'mercury_1960': ['Mercury 1960', '1960', 6378166.000000, 6356784.283666],
		'mercury_modificado_1968': ['Mercury Modificado 1968', '1968', 6378150.000000, 6356768.337303],
		'nuevo_international_1967': ['Nuevo International 1967', '1967', 6378157.500000, 6356772.200000],
		'sudamericano_1969': ['Sudamericano 1969', '1969', 6378160.000000, 6356774.720000],
		'walbeck_1817': ['Walbeck 1817', '1817', 6376896.000000, 6355834.846700],
		'wgs66': ['WGS66', '1966', '6378145.000000', '6356759.769356'],
		'wgs72': ['WGS72', '1972', '6378135.000000', '6356750.519915'],
		'wgs84': ['WGS84', '1984', '6378137.000000', '6356752.314245'],
		// 'user_defined1': ['Definido por el Usuario1', '????', '6378388.000000', '6356911.946130'],
		// ...
	};/*}}}*/

	var defaultEllipsoidId = "wgs84";

	// ========================//}}}

	// API implementation://{{{
	// ===================

	function api (eid) {//{{{
		var e; // Current ellipsoid.
		this.set_ellipsoid(eid); // Set specified (or default) ellipsoid as current.
	};//}}}

	api.prototype.check_ellipsoid = function check_ellipsoid(eId) { // Check ellipsoid./*{{{*/

		// Load & check basic data:
		var e = ellipsoids[eId];
		///var name = e[0];
		///var date = e[1];
		var a = e[2]; // Semieje mayor.
		var b = e[3]; // Semieje menor.
		if (
			! isNumeric(a)
			|| ! isNumeric(b)
		) throw ("Bad ellipsoid (" + eId + ")");

		return eId;

	};/*}}}*/

	api.prototype.set_ellipsoid = function set_ellipsoid(eId) { // Set current ellipsoid./*{{{*/
		if (
			eId === undefined
		) {
			eId = defaultEllipsoidId;
		};
		if (ellipsoids[eId] === undefined) throw (
			"Bad ellipsoid id: " + eId
		);
		this.e = this.check_ellipsoid(eId);
		return this.e;
	};/*}}}*/

	api.prototype.get_ellipsoid = function get_ellipsoid() { // Get current ellipsoid./*{{{*/
		return this.e;
	};/*}}}*/

	api.prototype.get_ellipsoid_data = function get_ellipsoid_data(eId) {/*{{{*/

		// Load basic data:
		eId = (eId === undefined) ? this.e : check_ellipsoid(eId); // Use current if unspecified.
		var e = ellipsoids[eId];
		var name = e[0];
		var date = e[1];
		var a = e[2]; // Semieje mayor.
		var b = e[3]; // Semieje menor.

		// Intermediate calculations:
		//unused// var I03 = =Math.sqrt(a^2-b^2)/G03 // Excentricidad (really unused -tested on spreadsheet-).
		var e_ = Math.sqrt(Math.pow(a,2)-Math.pow(b,2))/b; // 2ª Excentric. ( e' )

		// Add calculated parameters:
		var e_2 = Math.pow(e_,2); // e' ²
		var c = +(Math.pow(a,2))/b; // c (radio polar de curvatura)

		return [
			e_2, // e' ²
			c, // c (radio polar de curvatura)
			a, // Semieje mayor.
			b, // Semieje menor.
			name,
			date,
			e // id
		];

	};/*}}}*/

	api.prototype.geo2utm = function geo2utm(fiDeg, LambdaDeg, e) { // Returns [x, y, TimeZone] /*{{{*/

		var eData = this.get_ellipsoid_data(e);
		var e_2 = eData[0];
		var c = eData[1];


		// Input:/*{{{*/
		// =====

		if (LambdaDeg === undefined) { // All data received packed in single array./*{{{*/
			LambdaDeg = fiDeg[1];
			fiDeg = fiDeg[0];
		};/*}}}*/

		// Fi (latitud)://{{{
		if (typeof fiDeg == "object") { // Sexagesimal degree (º,',")//{{{
			var LatD = fiDeg[0];
			var LatM = fiDeg[1];
			var LatS = fiDeg[2];
			var NS = fiDeg[3];
			if (NS === undefined) {
				var m;
				if (
					null !== (m = /([NS])/i.exec(LatD))
					|| null !== (m = /([NS])/i.exec(LatS))
				) NS = m[1].toUpperCase();
			};
			if (! NS) NS = 'N'; // Fix if omitted for output.
			fiDeg = (NS=="S" ? -1:1)*( // fi
				parseFloat((LatS.toString().replace(/["NS]+/i, "")/60)/60)
				+parseFloat(LatM.toString().replace(/'/, "")/60)
				+parseFloat(LatD.toString().replace(/[ºNS]+/i, ""))
			);
		}//}}}
		else if (typeof fiDeg == "string") { // Decimal with optional N/S//{{{
			var NS = fiDeg.toUpperCase().match(/S/) ? "S" : "N";
			fiDeg = (NS=="S" ? -1:1)*parseFloat(fiDeg);
		}//}}}
		else if (typeof fiDeg == "number") { // Decimal degree (South < 0)//{{{
			var NS = fiDeg >= 0 ? "N" : "S";
			fiDeg = (NS=="S" ? -1:1)*fiDeg;
		}//}}}
		else { // ...or report if not://{{{
			throw ("Bad type (" + (typeof fiDeg) + ") for latitude: " + fiDeg);
		}//}}}
		;//}}}

		// Lambda (longitud)://{{{
		if (typeof LambdaDeg == "object") { // Sexagesimal degree (º, ', ")//{{{
			var LonD = LambdaDeg[0];
			var LonM = LambdaDeg[1];
			var LonS = LambdaDeg[2];
			var EW = LambdaDeg[3];
			if (EW === undefined) {
				var m;
				if (
					null !== (m = /([EW])/i.exec(LonD))
					|| null !== (m = /([EW])/i.exec(LonS))
				) EW = m[1].toUpperCase();
			};
			LambdaDeg = (EW=="W" ? -1:1)*( // Lambda
					parseFloat((LonS.toString().replace(/["EW]+/i, "")/60)/60)
					+parseFloat(LonM.toString().replace(/'/, "")/60)
					+parseFloat(LonD.toString().replace(/[ºEW]+/i, ""))
			);
		}//}}}
		else if (typeof LambdaDeg == "string") { // Decimal with optional E/W.//{{{
			var EW = LambdaDeg.toUpperCase().match(/W/) ? "W" : "E";
			LambdaDeg = (EW=="W" ? -1:1)*parseFloat(LambdaDeg);
		}//}}}
		else if (typeof LambdaDeg != "number") { // Supose decimal (West < 0)//{{{
			throw ("Bad type (" + (typeof LambdaDeg) + ") for longitude: " + LambdaDeg);
		}//}}}
		;//}}}

		/*}}}*/


		// En Radianes/*{{{*/
		var Lambda = LambdaDeg*Math.PI/180; // Lambda
		var fi = fiDeg*Math.PI/180; // fi
		/*}}}*/

		// Otros cálculos:/*{{{*/
		var tz = trunc((LambdaDeg/6)+31); // TimeZone calculation.
		var tzMer = 6*tz-183; // TimeZone meridian.
		var ALambda = +Lambda-((tzMer*Math.PI)/180); // Delta Lambda
		var A = Math.cos(fi)*Math.sin(ALambda); // A
		var Eta = Math.atan((Math.tan(fi))/Math.cos(ALambda))-fi; // Eta
		var Ni = (c/Math.pow((1+e_2*Math.pow((Math.cos(fi)),2)),(1/2)))*0.9996; // Ni
		var Xi = (1/2)*Math.log((1+A)/(1-A)); // Xi
		var Zeta = (e_2/2)*Math.pow(Xi,2)*Math.pow((Math.cos(fi)),2); // Zeta
		var A1 = Math.sin(2*fi); // A1
		var A2 = +A1*Math.pow((Math.cos(fi)),2); // A2
		var J2 = fi+(A1/2); // J2
		var J4 = ((3*J2)+A2)/4; // J4
		var J6 = (5*J4+A2*Math.pow((Math.cos(fi)),2))/3; // J6
		var Alfa = (3/4)*e_2; // Alfa
		var Beta = (5/3)*Math.pow(Alfa,2); // Beta
		var Gamma = (35/27)*Math.pow(Alfa,3); // Gamma
		var B_fi = 0.9996*c*(fi-(Alfa*J2)+(Beta*J4)-(Gamma*J6)); // B(fi)
		/*}}}*/


		// CONVERTED COORDINATES:/*{{{*/
		// =====================
		var x = Xi*Ni*(1+Zeta/3)+500000; // UTM Este X
		var y = NS=="S" ? Eta*Ni*(1+Zeta)+B_fi+10000000 : Eta*Ni*(1+Zeta)+B_fi; // UTM Norte Y
		// tz = tz; // Time zone.
		// NS = NS; // Hemisferio
		/*}}}*/

		return [
			x,
			y,
			tz+NS // Time zone.+Hemisphere.
		];

	};/*}}}*/

	api.prototype.utm2geo_dec = function geo2utm_dec(x, y, tz, NS, e) {/*{{{*/

		if (y === undefined) { // All data received packed in single array.//{{{
			e = x[4];
			NS = x[3];
			tz = x[2];
			y = x[1];
			x = x[0];
		};//}}}

		// "34N", p. ej. // Accept joined or separated./*{{{*/
		var matches = /^\s*[+-]?([\d.]+)([NS])\s*$/.exec(tz);
		if (matches !== null) {
			e = NS; // Shift parameter position.
			tz = matches[1];
			NS = matches[2];
		};/*}}}*/

		if ( // Input data check:/*{{{*/
			! isNumeric (x)
			|| ! isNumeric (y)
			|| ! (tz !== undefined && tz.match(/\d/))
			|| ! inArray(NS, ['N', 'S'])
		) throw ("utm2geo(): Bad input coordinates: "+x+", "+y+" ("+tz+NS+")");
		tz = parseInt(tz);
		/*}}}*/


		var eData = this.get_ellipsoid_data(e);
		var e_2 = eData[0];
		var c = eData[1];


		var CMerid = 6*tz-183; // Meridiano Central.
		var yS = NS=="S" ? y-10000000 : y; // Y al sur del Ecuador.
		var Fi_ = (yS)/(6366197.724*0.9996); // Fi'
		var Ni = (c/Math.pow((1+e_2*Math.pow((Math.cos(Fi_)),2)),(1/2)))*0.9996; // Ni
		var a = (x-500000)/Ni; // a
		var A1 = Math.sin(2*Fi_); // "A1"
		var A2 = A1*Math.pow((Math.cos(Fi_)),2); // "A2"
		var J2 = Fi_+(A1/2); // "J2"
		var J4 = (3*J2+A2)/4; // "J4"
		var J6 = (5*J4+A2*Math.pow((Math.cos(Fi_)),2))/3; // "J6"
		var Alfa = (3/4)*e_2; // Alfa
		var Beta = (5/3)*Math.pow((Alfa),2); // Beta
		var Gamma = (35/27)*Math.pow((Alfa),3); // Gamma
		var B_fi = 0.9996*c*(Fi_-(Alfa*J2)+(Beta*J4)-(Gamma*J6)); // B(fi)
		var b = (yS-B_fi)/Ni; // b
		var Zeta = ((e_2*Math.pow(a,2))/2)*Math.pow((Math.cos(Fi_)),2); // Zeta
		var Xi = a*(1-(Zeta/3)); // Xi
		var Eta = b*(1-Zeta)+Fi_; // Eta
		var SinhXi = (Math.exp(Xi)-Math.exp(-Xi))/2; // Sen h Xi
		var ALambda = Math.atan(SinhXi/Math.cos(Eta)); // Delta Lambda
		var Tau = Math.atan(Math.cos(ALambda)*Math.tan(Eta)); // Tau


		// En Sexas Decimales:
		var LambdaDeg = +(ALambda/Math.PI)*180+CMerid; // Lambda
		var FiRad = Fi_+(1+e_2*Math.pow((Math.cos(Fi_)),2)-(3/2)*e_2*Math.sin(Fi_)*Math.cos(Fi_)*(Tau-Fi_))*(Tau-Fi_); // Fi en Radianes.
		var fiDeg = +(FiRad/Math.PI)*180; // Fi


		return [fiDeg, LambdaDeg];

	};/*}}}*/

	api.prototype.utm2geo_sex = function utm2geo_sex(x, y, tz, NS, e) {//{{{

		// Obtain decimal:
		var sex = this.utm2geo_dec (x, y, tz, NS, e);
		var fiDeg = sex[0];
		var LambdaDeg = sex[1];

		// Fi (latitud)
		var LatD = trunc(fiDeg);
		var LatM = trunc((fiDeg-LatD)*60);
		var LatS = (((fiDeg-LatD)*60)-LatM)*60;

		// Lambda (longitud)
		var LongD = trunc(LambdaDeg);
		var LongM = trunc((LambdaDeg-LongD)*60);
		var LongS = (((LambdaDeg-LongD)*60)-LongM)*60;

		// Hemisferio
		//NS = NS;


		return [
			[LatD, LatM, LatS],
			[LongD, LongM, LongS]
		];

	}//}}}

	api.prototype.utm2geo_abs = function utm2geo_abs(x, y, tz, NS, e) {/*{{{*/
		var g = this.utm2geo_sex(x, y, tz, NS, e);
		var lat = g[0];
		var lon = g[1];

		NS = (lat[0] + lat[1] + lat[2]) < 0 ? 'S' : 'N';
		var WE = (lon[0] + lon[1] + lon[2]) < 0 ? 'W' : 'E';
		return ([
			[Math.abs(lat[0]), Math.abs(lat[1]), Math.abs(lat[2]), NS],
			[Math.abs(lon[0]), Math.abs(lon[1]), Math.abs(lon[2]), WE]
		]);
	};/*}}}*/

	api.prototype.utm2geo_SW = function utm2geo_SW(x, y, tz, NS, e) {//{{{
		var g = this.utm2geo_abs(x, y, tz, NS, e);
		var lat = g[0];
		var lon = g[1];
		lat[0] = lat[0]+"º"; // Degree
		lon[0] = lon[0]+"º";
		lat[1] = lat[1]+"'"; // Minutes
		lon[1] = lon[1]+"'";
		lat[2] = lat[2]+"\""; // Seconds
		lon[2] = lon[2]+"\"";
		// Mark only negative (South / West) values:
		if (lat[3] == 'S') lat[0] = lat[0]+lat[3];
		if (lon[3] == 'W') lon[0] = lon[0]+lon[3];
		// Drop original marks:
		lat.pop();
		lon.pop();
		return [lat, lon];
	};//}}}

	api.prototype.utm2geo_NE = function utm2geo_NE(x, y, tz, NS, e) {//{{{
		var g = this.utm2geo_abs(x, y, tz, NS, e);
		var lat = g[0];
		var lon = g[1];
		lat[0] = lat[0]+"º"+lat[3];
		lon[0] = lon[0]+"º"+lon[3];
		lat[1] = lat[1]+"'";
		lon[1] = lon[1]+"'";
		lat[2] = lat[2]+"\"";
		lon[2] = lon[2]+"\"";
		// Drop original marks:
		lat.pop();
		lon.pop();
		return [lat, lon];
	};//}}}

	api.prototype.new = function newInstance(e) {//{{{
		return new api(e);
	};//}}}

	// =============================//}}}


	var geoconv = api.prototype.new();
	// NOTE: Uses default ellipsoid. use geoconv.set_ellipsoid() to change it.
	// Example:
	//   geoconv.set_ellipsoid('wgs72'); // Only if you want to change it.
	//
	// NOTE2: Alternatively, you can obtain a new instance to easily work
	// with multiple ellipsoids.
	// Example:
	//   var geoconv2 = geoconv.new('fischer_1968');


	// Try to export as a supported module type:
	if ( // RequireJS module.//{{{
		typeof require === "function"
		&& typeof require.specified === "function"
	) {
		define (function() { return geoconv; });
	}//}}}
	else if ( // Node.JS module.//{{{
		typeof module == 'object'
		&& typeof module.parent == 'object'
	) {
		module.exports = geoconv;
	}//}}}
	else if ( // Failback to global scope.//{{{
		typeof global == 'object'
	) {
		global.geoconv = geoconv;
	}//}}}
	else throw "Dont't know how to export!!"; // This should never happen.


})();


// vim: foldmethod=marker
