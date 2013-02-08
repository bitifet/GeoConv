=======
GeoConv
=======

-------------------------------------------------------------------------------------
UTM <-> Geographic coordinates conversion class
-------------------------------------------------------------------------------------

:License: GNU GENERAL PUBLIC LICENSE v.3
:Author: Joan Miquel Torres <jmtorres@112ib.com> (Tranlation to PHP only)
:Company: Gestió d'Emergències de les Illes Balears (GEIBSAU).
:Url: http://www.112ib.com
:Thanks to: Gabriel Ortiz.


Credits:
========

Based on xls spreadsheet from Gabriel Ortiz (http://gabrielortiz.com)

:Url: http://www.gabrielortiz.com/descargas/descarga.asp?Fichero=Conversion_UTM_Geograficas.xls

Equations from: "Bolettino di Geodesia e Science Affini", num 1
     by: Alberto Cotticia & Luciano Surace .


Usage:
======

Constructor:
------------

::

    $conv = new geoconv(); // To use default ellipsoid (wgs84).
    $conv = new geoconv($ellipsoid_id); // To select desired ellipsoid.
       // More ellipsoids can be easily added in the source code. See it!!


Conversion:
-----------

Geographic to UTM:
~~~~~~~~~~~~~~~~~~

::

    $conv->geo2utm($long, $lat); // Convert to utm using current ellipsoid.
    $conv->geo2utm($long, $lat, $ellipsoid_id); // Convert using specified ellipsoid.
    //
    // Input:
    //     $log = array ($LongDegree, $LongMins, $LongSecs, $NS);
    //        $NS = 'N' for North or 'S' for South (case insensitive).
    //          Alternatively: ($LongDegre, $LongMins, $LongSecs . $NS)
    //             ...or use negative values and fully omit $NS.
    //     $lat = array ($LatDegree, $LatMins, $LatSecs, $ES);
    //        $ES = 'E' for East' or 'W' for West (case insensitive).
    //          Alternatively: ($LatDegre, $LatMins, $LatSecs . $ES)
    //             ...or use negative values and fully omit $ES.
    //
    // Returns: array ($x, $y, $TimeZone.$NS) 


UTM to Geographic:
~~~~~~~~~~~~~~~~~~


::

    $conv->utm2geo ($x, $y, $tZone, $NS); // Convert to Geographic using current ellipsoid.
    $conv->utm2geo ($x, $y, $tZone, $NS, $ellipsoid_id); // Same using given ellipsoid.
    $conv->utm2geo ($x, $y, $tZone.$NS); // Specify concatenating hemisphere to timezone.
    $conv->utm2geo ($x, $y, $tZone.$NS, $ellipsoid_id); // Same using given ellipsoid.
    //
    // Returns: array ($long, $lat);
    //   Where...
    //     $long = array ($lnDegree, $lnMinutes, $lnSeconds)
    //     $lat = array ($ltDegree, $ltMinutes, $ltSeconds)

or...


::

    $conv->utm2geo_abs ($x, $y, $tZone, $NS);
    $conv->utm2geo_abs ($x, $y, $tZone, $NS, $ellipsoid_id);
    $conv->utm2geo_abs ($x, $y, $tZone.$NS);
    $conv->utm2geo_abs ($x, $y, $tZone.$NS, $ellipsoid_id);
    //
    // Same as utm2geo but returned $long and $lat has the form:
    //     $long = array (abs($lnDegree), abs($lnMinutes), abs($lnSeconds), $NS)
    //     $lat = array (abs($ltDegree), abs($ltMinutes), abs($ltSeconds), $WE)


Ellipsoid selection:
--------------------

::

    $conv->set_ellipsoid ($ellipsoid_id); // To change current ellipsoid.
    $conv->get_ellipsoid (); // To get current ellipsoid.
    

Ellipsoid details retriving:
----------------------------

::

    $conv->get_ellipsoid_data (); // Returns current ellipsoid data.
    $conv->get_ellipsoid_data ($ellipsoid_id); // Returns given ellipsoid data.

Details are returned as array with below data:
    
  * e' ²
  * c (radio polar de curvatura)
  * Semieje mayor.
  * Semieje menor.
  * Name,
  * Date,
  * id

Examples:

::

     list ($e_2, $c, $a, $b, $name, $date, $e) = $conv->get_ellipsoid_data();
     list ($e_2, $c, $a, $b, $name, $date, $e) = $conv->get_ellipsoid_data("hayford_1909");


