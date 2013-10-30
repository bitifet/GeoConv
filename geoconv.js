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
 */


if (typeof isNumeric === "undefined") {
	function isNumeric (n) {
		return ! isNaN(parseFloat(n)) && isFinite(n);
	}
};


if (typeof Array.prototype.contains === "undefined") {
	Array.prototype.contains=function(){
		 for(var j in this){
			  if(this[j]==arguments[0]){
					return true;
			  }
		 }
		 return false;    
	}
};


if (typeof Math.trunc === "undefined") {
	Math.trunc = function (n) {
		return n < 0 ? Math.ceil(n) : Math.floor(n);
	};
};



var geoconv = function(e) {

	var self = this;

	self.defaultEllipsoidId = "wgs84";

	self.ellipsoids = {/*{{{*/
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
		'hough 1960': ['Hough 1960', '1960', 6378270.000000, 6356794.343479],
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



	self.check_ellipsoid = function(eId) { // Check ellipsoid./*{{{*/

		// Load & check basic data:
		var e = self.ellipsoids[eId];
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


	self.set_ellipsoid = function(eId) { // Set current ellipsoid./*{{{*/
		if (
			eId === undefined
		) {
			eId = self.defaultEllipsoidId;
		};
		if (self.ellipsoids[eId] === undefined) throw (
			"Bad ellipsoid id: " + eId
		);
		return self.e = self.check_ellipsoid(eId);
	};/*}}}*/

	self.get_ellipsoid = function() { // Get current ellipsoid./*{{{*/
		return self.e;
	};/*}}}*/

	self.get_ellipsoid_data = function (eId) {/*{{{*/

		// Load basic data:
		eId = (eId === undefined) ? self.e : self.check_ellipsoid(eId); // Use current if unspecified.
		var e = self.ellipsoids[eId];
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


	self.geo2utm = function (lon, lat, e) { // Returns [x, y, TimeZone] /*{{{*/

		var eData = self.get_ellipsoid_data(e);
		var e_2 = eData[0];
		var c = eData[1];


		// Input:/*{{{*/
		// =====

		// Lambda (longitud):
		var LonD = lon[0];
		var LonM = lon[1];
		var LonS = lon[2];
		var EW = lon[3];

		// Fi (latitud):
		var LatD = lat[0];
		var LatM = lat[1];
		var LatS = lat[2];
		var NS = lat[3];

		/*}}}*/


		// Sexas Decimales:/*{{{*/
		var LambdaSex = (EW=="W" ? -1:1)*(((LonS/60)/60)+(LonM/60)+LonD); // Lambda
		var fiSex = (NS=="S" ? -1:1)*(((LatS/60)/60)+(LatM/60)+LatD); // fi
		NS || NS = 'N'; // Fix if omitted for output.


		/*}}}*/

		// En Radianes/*{{{*/
		var Lambda = LambdaSex*Math.PI/180; // Lambda
		var fi = fiSex*Math.PI/180; // fi
		/*}}}*/

		// Otros cálculos:/*{{{*/
		var tz = Math.trunc((LambdaSex/6)+31); // TimeZone calculation.
		var tzMer = 6*tz-183; // TimeZone meridian.
		var ALambda = +Lambda-((tzMer*Math.PI)/180); // Delta Lambda
		var A = Math.cos(fi)*Math.sin(ALambda); // A
		var Eta = Math.atan((Math.tan(fi))/Math.cos(ALambda))-fi; // Eta
		var Ni = (c/Math.pow((1+e_2*Math.pow((Math.cos(fi)),2)),(1/2)))*0.9996; // Ni
		var Xi = (1/2)*log((1+A)/(1-A)); // Xi
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
		x = Xi*Ni*(1+Zeta/3)+500000; // UTM Este X
		y = NS=="S" ? Eta*Ni*(1+Zeta)+B_fi+10000000 : Eta*Ni*(1+Zeta)+B_fi; // UTM Norte Y
		// tz = tz; // Time zone.
		// NS = NS; // Hemisferio
		/*}}}*/

		return [
			x,
			y,
			tz . NS // Time zone.+Hemisphere.
		];

	};/*}}}*/

	self.utm2geo = function (x, y, tz, NS, e) {/*{{{*/

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
			|| ! tz.match(/\d/)
			|| ! ['N', 'S'].contains(NS)
		) throw ("utm2geo(): Bad input coordinates: "+x+", "+y+" ("+tz+NS+")");
		tz += 0;
		/*}}}*/

		var eData = self.get_ellipsoid_data(e);
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
		var LambdaSex = +(ALambda/Math.PI)*180+CMerid; // Lambda
		var FiRad = Fi_+(1+e_2*Math.pow((Math.cos(Fi_)),2)-(3/2)*e_2*Math.sin(Fi_)*Math.cos(Fi_)*(Tau-Fi_))*(Tau-Fi_); // Fi en Radianes.
		var FiSex = +(FiRad/Math.PI)*180; // Fi


		// COORDENADES CONVERTIDES:/*{{{*/
		// =======================

		// Lambda (longitud)
		var LongD = Math.trunc(LambdaSex);
		var LongM = Math.trunc((LambdaSex-LongD)*60);
		var LongS = (((LambdaSex-LongD)*60)-LongM)*60;

		// Fi (latitud)
		var LatD = Math.trunc(FiSex);
		var LatM = Math.trunc((FiSex-LatD)*60);
		var LatS = (((FiSex-LatD)*60)-LatM)*60;

		// Hemisferio
		//NS = NS;

		/*}}}*/

		return [
			[LongD, LongM, LongS],
			[LatD, LatM, LatS]
		];

	};/*}}}*/

	self.utm2geo_abs = function (x, y, tz, NS, e) {/*{{{*/
		var g = self.utm2geo(x, y, tz, NS, e);
		var lon = g[0];
		var lat = g[1];

		var WE = array_sum(lon) < 0 ? 'W' : 'E';
		NS = array_sum(lat) < 0 ? 'S' : 'N';
		return ([
			[abs(lon[0]), abs(lon[1]), abs(lon[2]), WE],
			[abs(lat[0]), abs(lat[1]), abs(lat[2]), NS]
		]);
	};/*}}}*/


	// Startup:
	self.set_ellipsoid(e);



	this.test = function (a, b) {

		console.log ("a: "+a);
		console.log ("b: "+b);

	};


};




var m = new geoconv();


var x = m.utm2geo(34,34, '34N');


	console.log(x);

// vim: foldmethod=marker
