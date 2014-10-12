<?php
/*
 * geoconv.class.php
 * ------------------
 * UTM <-> Geographic coordinates conversion class
 *
 * @credits: Based on xls spreadsheet from Gabriel Ortiz (http://gabrielortiz.com)
 *       URL: http://www.gabrielortiz.com/descargas/descarga.asp?Fichero=Conversion_UTM_Geograficas.xls
 *       Equations from:
 *           "Bolettino di Geodesia e Science Affini", num 1
 *           by: Alberto Cotticia & Luciano Surace .
 *
 * @author: Joan Miquel Torres <jmtorres@112ib.com> (Tranlation to PHP/Javascript only)
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

class geoconv {

	public $ellipsoids = array (/*{{{*/
		//	'id' => array ('Elipsoide', 'Fecha', 'a (semieje mayor)', 'b (semieje menor)'),
		'airy_1830' => array ('Airy 1830', '1830', 6377563.396000, 6356256.910000),
		'airy_modificado_1965' => array ('Airy Modificado 1965', '1965', 6377340.189000, 6356034.447900),
		'bessel_1841' => array ('Bessel 1841', '1841', 6377397.155000, 6356078.962840),
		'clarke_1866' => array ('Clarke 1866', '1866', 6378206.400000, 6356583.800000),
		'clarke_1880' => array ('Clarke 1880', '1880', 6378249.145000, 6356514.869550),
		'fischer_1960' => array ('Fischer 1960', '1960', 6378166.000000, 6356784.280000),
		'fischer_1968' => array ('Fischer 1968', '1968', 6378150.000000, 6356768.330000),
		'grs80' => array ('GRS80', '1980', '6378137.000000', 6356752.314140),
		'hayford_1909' => array ('Hayford 1909', '1909', 6378388.000000, 6356911.946130),
		'helmert_1906' => array ('Helmert 1906', '1906', 6378200.000000, 6356818.170000),
		'hough 1960' => array ('Hough 1960', '1960', 6378270.000000, 6356794.343479),
		'internacional_1909' => array ('Internacional 1909', '1909', 6378388.000000, 6356911.946130),
		'internacional_1924' => array ('Internacional 1924', '1924', 6378388.000000, 6356911.946130),
		'krasovsky 1940' => array ('Krasovsky 1940', '1940', 6378245.000000, 6356863.018800),
		'mercury_1960' => array ('Mercury 1960', '1960', 6378166.000000, 6356784.283666),
		'mercury_modificado_1968' => array ('Mercury Modificado 1968', '1968', 6378150.000000, 6356768.337303),
		'nuevo_international_1967' => array ('Nuevo International 1967', '1967', 6378157.500000, 6356772.200000),
		'sudamericano_1969' => array ('Sudamericano 1969', '1969', 6378160.000000, 6356774.720000),
		'walbeck_1817' => array ('Walbeck 1817', '1817', 6376896.000000, 6355834.846700),
		'wgs66' => array ('WGS66', '1966', '6378145.000000', '6356759.769356'),
		'wgs72' => array ('WGS72', '1972', '6378135.000000', '6356750.519915'),
		'wgs84' => array ('WGS84', '1984', '6378137.000000', '6356752.314245'),
		// 'user_defined1' => array ('Definido por el Usuario1', '????', '6378388.000000', '6356911.946130'),
		// ...
	);/*}}}*/

	private $e; // Current ellipsoid id.


	public function __construct ($ellipsoid = "wgs84") {/*{{{*/

		$this->set_ellipsoid($ellipsoid);

	}/*}}}*/


	private function trunc ($n) {/*{{{*/
		return $n < 0 ? ceil($n) : floor($n);
	}/*}}}*/

	private function check_ellipsoid ($e) { // Check ellipsoid./*{{{*/

		// Load & check basic data:
		list ($name, $date, $a, $b) = $this->ellipsoids[$e]; // (a, b) => semieje mayor y menor.
		if (! is_numeric ($a) || ! is_numeric ($b)) throw new Exception ("Bad ellipsoid ({$e})");

		return $e;

	}/*}}}*/


	public function set_ellipsoid ($e) { // Set current ellipsoid./*{{{*/
		return $this->e = $this->check_ellipsoid($e);
	}/*}}}*/

	public function get_ellipsoid () { // Get current ellipsoid./*{{{*/
		return $this->e;
	}/*}}}*/

	public function get_ellipsoid_data ($e = null) {/*{{{*/

		// Load basic data:
		$e = is_null($e) ? $this->e : $this->check_ellipsoid($e); // Use current if unspecified.
		list ($name, $date, $a, $b) = $this->ellipsoids[$e]; // (a, b) => semieje mayor y menor.

		// Intermediate calculations:
		//unused// $I03 = =sqrt($a^2-$b^2)/G03 // Excentricidad (really unused -tested on spreadsheet-).
		$e_ = sqrt(pow($a,2)-pow($b,2))/$b; // 2ª Excentric. ( e' )

		// Add calculated parameters:
		$e_2 = pow($e_,2); // e' ²
		$c = +(pow($a,2))/$b; // c (radio polar de curvatura)

		return array (
			$e_2, // e' ²
			$c, // c (radio polar de curvatura)
			$a, // Semieje mayor.
			$b, // Semieje menor.
			$name,
			$date,
			$e // id
		);

	}/*}}}*/


	public function geo2utm ($fiDeg, $LambdaDeg = null, $e = null) { // Returns array ($x, $y, $TimeZone) /*{{{*/

		list ($e_2, $c) = $this->get_ellipsoid_data($e);


		// Input:/*{{{*/
		// =====

		// All data received packed in single array./*{{{*/
		if (is_null($LambdaDeg)) {
			list ($fiDeg, $LambdaDeg) = $fiDeg;
		};
		/*}}}*/

		// Fi (latitud)://{{{
		if (is_array($fiDeg)) { // Sexagesimal degree (º,',")/*{{{*/
			@ list ($LatD, $LatM, $LatS, $NS) = $fiDeg;
			if (is_null ($NS)) {
				if (
					preg_match("/([NS])/i", $LatD, $m)
					|| preg_match("/([NS])/i", $LatS)
				) $NS = strtoupper($m[1]);
			};
			$NS || $NS = 'N'; // Fix if omitted for output.
			$fiDeg = ($NS=="S" ? -1:1)*( // fi
				((preg_replace("/[\"NS]+/i", "", $LatS)/60)/60)
				+(preg_replace("/'/", "", $LatM)/60)
				+preg_replace("/[ºNS]+/i", "", $LatD)
			);
		}/*}}}*/
		else if (is_string($fiDeg)) { // Decimal with optional N/S./*{{{*/
			$NS = preg_match ("/S/i", $fiDeg) ? "S" : "N";
			$fiDeg = ($NS=="S" ? -1:1)*$fiDeg;
		}/*}}}*/
		else if (is_numeric($fiDeg)) { // Decimal degree (South < 0)/*{{{*/
			$NS = $fiDeg >= 0 ? "N" : "S";
			$fiDeg = ($NS=="S" ? -1:1)*$fiDeg;
		}/*}}}*/
		else { // ...or report if not:/*{{{*/
			throw new Exception("Bad type (" . gettype($fiDeg) . ") for latitude: " + $fiDeg);
		}/*}}}*/
		;//}}}

		// Lambda (longitud)://{{{
		if (is_array($LambdaDeg)) { // Sexagesimal degree (º,',")/*{{{*/
			@ list ($LonD, $LonM, $LonS, $EW) = $LambdaDeg;
			if (is_null ($EW)) {
				if (
					preg_match("/[EW]/i", $LonD, $m)
					|| preg_match("/[EW]/i", $LonS, $m)
				) $EW = strtoupper($m[1]);
			};
			$LambdaDeg = ($EW=="W" ? -1:1)*( // Lambda
				((preg_replace("/[\"EW]+/i", "", $LonS)/60)/60)
				+(preg_replace("/'/", "", $LonM)/60)
				+preg_replace("/[ºEW]+/i", "", $LonD)
			);
		}/*}}}*/
		else if (is_string($LambdaDeg)) { // Decimal with optional E/W./*{{{*/
			$EW = preg_match("/W/i", $LambdaDeg) ? "W" : "E";
			$LambdaDeg = ($EW=="W" ? -1:1)*$LambdaDeg;
		}/*}}}*/
		else if (! is_numeric($LambdaDeg)) { // Supose decimal (West < 0)/*{{{*/
			throw new Exception("Bad type (" . gettype($LambdaDeg) . ") for longitude: " + $LambdaDeg);
		}/*}}}*/
		;//}}}

		/*}}}*/


		// Sexas Decimales:/*{{{*/


		/*}}}*/

		// En Radianes/*{{{*/
		$Lambda = $LambdaDeg*pi()/180; // Lambda
		$fi = $fiDeg*pi()/180; // fi
		/*}}}*/

		// Otros cálculos:/*{{{*/
		$tz = $this->trunc(($LambdaDeg/6)+31); // TimeZone calculation.
		$tzMer = 6*$tz-183; // TimeZone meridian.
		$ALambda = +$Lambda-(($tzMer*pi())/180); // Delta Lambda
		$A = cos($fi)*sin($ALambda); // A
		$Eta = atan((tan($fi))/cos($ALambda))-$fi; // Eta
		$Ni = ($c/pow((1+$e_2*pow((cos($fi)),2)),(1/2)))*0.9996; // Ni
		$Xi = (1/2)*log((1+$A)/(1-$A)); // Xi
		$Zeta = ($e_2/2)*pow($Xi,2)*pow((cos($fi)),2); // Zeta
		$A1 = sin(2*$fi); // A1
		$A2 = +$A1*pow((cos($fi)),2); // A2
		$J2 = $fi+($A1/2); // J2
		$J4 = ((3*$J2)+$A2)/4; // J4
		$J6 = (5*$J4+$A2*pow((cos($fi)),2))/3; // J6
		$Alfa = (3/4)*$e_2; // Alfa
		$Beta = (5/3)*pow($Alfa,2); // Beta
		$Gamma = (35/27)*pow($Alfa,3); // Gamma
		$B_fi = 0.9996*$c*($fi-($Alfa*$J2)+($Beta*$J4)-($Gamma*$J6)); // B(fi)
		/*}}}*/


		// CONVERTED COORDINATES:/*{{{*/
		// =====================
		$x = $Xi*$Ni*(1+$Zeta/3)+500000; // UTM Este X
		$y = $NS=="S" ? $Eta*$Ni*(1+$Zeta)+$B_fi+10000000 : $Eta*$Ni*(1+$Zeta)+$B_fi; // UTM Norte Y
		// $tz = $tz; // Time zone.
		// $NS = $NS; // Hemisferio
		/*}}}*/

		return  array (
			$x,
			$y,
			$tz . $NS // Time zone.+Hemisphere.
		);

	}/*}}}*/

	public function utm2geo_dec ($x, $y = null, $tz = null, $NS = null, $e = null) {/*{{{*/

		// All data received packed in single array:
		if (is_null($y)) @ list ($x, $y, $tz, $NS, $e) = $x;

		if (preg_match ( // "34N", p. ej. // Accept joined or separated./*{{{*/
			'/^\s*[+-]?([\d.]+)([NS])\s*$/',
			$tz,
			$matches
		)) {
			$e = $NS; // Shift parameter position.
			list ($foo, $tz, $NS) = $matches;
		};/*}}}*/

		if ( // Input data check:/*{{{*/
			! is_numeric ($x)
			|| ! is_numeric ($y)
			|| ! preg_match ('/\d/', $tz)
			|| ! in_array ($NS, array ('N', 'S'))
		) throw new Exception ("utm2geo(): Bad input coordinates: {$x}, {$y} ({$tz}{$NS})");
		$tz += 0;
		/*}}}*/


		list ($e_2, $c) = $this->get_ellipsoid_data($e);

		$CMerid = 6*$tz-183; // Meridiano Central.
		$yS = $NS=="S" ? $y-10000000 : $y; // Y al sur del Ecuador.
		$Fi_ = ($yS)/(6366197.724*0.9996); // Fi'
		$Ni = ($c/pow((1+$e_2*pow((cos($Fi_)),2)),(1/2)))*0.9996; // Ni
		$a = ($x-500000)/$Ni; // a
		$A1 = sin(2*$Fi_); // "A1"
		$A2 = $A1*pow((cos($Fi_)),2); // "A2"
		$J2 = $Fi_+($A1/2); // "J2"
		$J4 = (3*$J2+$A2)/4; // "J4"
		$J6 = (5*$J4+$A2*pow((cos($Fi_)),2))/3; // "J6"
		$Alfa = (3/4)*$e_2; // Alfa
		$Beta = (5/3)*pow(($Alfa),2); // Beta
		$Gamma = (35/27)*pow(($Alfa),3); // Gamma
		$B_fi = 0.9996*$c*($Fi_-($Alfa*$J2)+($Beta*$J4)-($Gamma*$J6)); // B(fi)
		$b = ($yS-$B_fi)/$Ni; // b
		$Zeta = (($e_2*pow($a,2))/2)*pow((cos($Fi_)),2); // Zeta
		$Xi = $a*(1-($Zeta/3)); // Xi
		$Eta = $b*(1-$Zeta)+$Fi_; // Eta
		$SinhXi = (exp($Xi)-exp(-$Xi))/2; // Sen h Xi
		$ALambda = atan($SinhXi/cos($Eta)); // Delta Lambda
		$Tau = atan(cos($ALambda)*tan($Eta)); // Tau


		// En Sexas Decimales:
		$LambdaDeg = +($ALambda/pi())*180+$CMerid; // Lambda
		$FiRad = $Fi_+(1+$e_2*pow((cos($Fi_)),2)-(3/2)*$e_2*sin($Fi_)*cos($Fi_)*($Tau-$Fi_))*($Tau-$Fi_); // Fi en Radianes.
		$fiDeg = +($FiRad/pi())*180; // Fi

		return array ($fiDeg, $LambdaDeg);

	}/*}}}*/

	public function utm2geo_sex ($x, $y, $tz, $NS = null, $e = null) {/*{{{*/

		list ($fiDeg, $LambdaDeg) = $this->utm2geo_dec($x, $y, $tz, $NS, $e);

		// Fi (latitud)
		$LatD = $this->trunc($FiSex);
		$LatM = $this->trunc(($FiSex-$LatD)*60);
		$LatS = ((($FiSex-$LatD)*60)-$LatM)*60;

		// Lambda (longitud)
		$LongD = $this->trunc($LambdaDeg);
		$LongM = $this->trunc(($LambdaDeg-$LongD)*60);
		$LongS = ((($LambdaDeg-$LongD)*60)-$LongM)*60;

		// Hemisferio
		//$NS = $NS;

		return (array (
			array ($LatD, $LatM, $LatS),
			array ($LongD, $LongM, $LongS)
		));


	}/*}}}*/

	public function utm2geo_abs ($x, $y, $tz, $NS = null, $e = null) {/*{{{*/
		list ($lat, $lon) = $this->utm2geo_sex($x, $y, $tz, $NS, $e);
		$NS = array_sum($lat) < 0 ? 'S' : 'N';
		$WE = array_sum($lon) < 0 ? 'W' : 'E';
		return (array (
			array (abs($lat[0]), abs($lat[1]), abs($lat[2]), $NS),
			array (abs($lon[0]), abs($lon[1]), abs($lon[2]), $WE)
		));
	}/*}}}*/

	public function utm2geo_SW ($x, $y, $tz, $NS, $e) {/*{{{*/
		list($lat, $lon) = $this->utm2geo_abs($x, $y, $tz, $NS, $e);
		$lat[0] = $lat[0]."º"; // Degree
		$lon[0] = $lon[0]."º";
		$lat[1] = $lat[1]."'"; // Minutes
		$lon[1] = $lon[1]."'";
		$lat[2] = $lat[2]."\""; // Seconds
		$lon[2] = $lon[2]."\"";
		// Mark only negative (South / West) values:
		if ($lat[3] == 'S') $lat[0] .= $lat[3];
		if ($lon[3] == 'W') $lon[0] .= $lon[3];
		// Drop original marks:
		array_pop($lat);
		array_pop($lon);
		return array($lat, $lon);
	}/*}}}*/

	public function utm2geo_NE ($x, $y, $tz, $NS, $e) {/*{{{*/
		list($lat, $lon) = $this->utm2geo_abs($x, $y, $tz, $NS, $e);
		$lat[0] .= "º".$lat[3]; // Degree with N/S
		$lon[0] .= "º".$lon[3]; // Degree with E/W
		$lat[1] .= "'"; // Minutes
		$lon[1] .= "'";
		$lat[2] .= "\""; // Secnods
		$lon[2] .= "\"";
		// Drop original marks:
		array_pop($lat);
		array_pop($lon);
		return array($lat, $lon);
	}/*}}}*/

};


// vim: foldmethod=marker
