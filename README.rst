=======
GeoConv
=======

-------------------------------------------------------------------------------------
UTM <-> Geographic coordinates conversion class
-------------------------------------------------------------------------------------

:Description: PHP and Javascript UTM to Geographical and vice-versa coordinates
              conversion tool.
:License: GNU GENERAL PUBLIC LICENSE v.3
:Author: Joan Miquel Torres <jmtorres@112ib.com> (Tranlation to PHP and Javascript only)
:Company: Gestió d'Emergències de les Illes Balears (GEIBSAU).
:Url: http://www.112ib.com
:Thanks to: Gabriel Ortiz.


Credits:
========

Based on xls spreadsheet from Gabriel Ortiz (http://gabrielortiz.com)

:Url: http://www.gabrielortiz.com/descargas/descarga.asp?Fichero=Conversion_UTM_Geograficas.xls

Equations from: "Bolettino di Geodesia e Science Affini", num 1
     by: Alberto Cotticia & Luciano Surace .


Files:
======

README.rst
   This brief documentation file.

LICENSE
   Llicensing terms (GPLv3)

geoconv.class.php
   PHP implementation.
   
geoconv.js
   Javascript implementation.


Usage (PHP):
============

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

    $conv->geo2utm($lat, $long); // Convert to utm using current ellipsoid.
    $conv->geo2utm($lat, $long, $ellipsoid_id); // Convert using specified ellipsoid.
    $conv->geo2utm(array($lat, $long [,$ellipsoid_id])); // Packed in single array.
    //
    // Input:
    //   In decimal degree:
    //     $lat = Latitude (float)
    //     $long = Longitude (float)
    //   In sexagesimal degree:
    //     $lat = (One of the following)
    //        * array ($LatDegree, $LatMins, $LatSecs, $NS)
    //        * array ($LatDegree, $LatMins, $LatSecs.$NS) // Concatenated.
    //        * array ($LatDegree, $LatMins, $LatSecs) // (Absolute)
    //     $long =
    //        * array ($LongDegree, $LongMins, $LongSecs, $EW)
    //        * array ($LongDegree, $LongMins, $LongSecs.$EW) // Concatenated.
    //        * array ($LongDegree, $LongMins, $LongSecs) // (Absolute)
    //     ...where:
    //          $NS = 'N' for North' or 'S' for South (case insensitive).
    //          $EW = 'E' for East or 'W' for West (case insensitive).
    //          (Absolute) means that South and East are represented by
    //          negative values for each degree, mins and secs.
    //     WARNING: Mixings of below formats may result in unexpected
    //          behaviours. For example, 'S' with negative latitudes will
    //          result in North latitudes.
    //
    // Returns: array ($x, $y, $TimeZone.$NS) 


UTM to Geographic:
~~~~~~~~~~~~~~~~~~

Decimal:

::

    $conv->utm2geo_dec ($x, $y, $tZone, $NS); // Convert to Geographic using current ellipsoid.
    $conv->utm2geo_dec ($x, $y, $tZone, $NS, $ellipsoid_id); // Same using given ellipsoid.
    $conv->utm2geo_dec ($x, $y, $tZone.$NS); // Specify concatenating hemisphere to timezone.
    $conv->utm2geo_dec ($x, $y, $tZone.$NS, $ellipsoid_id); // Same using given ellipsoid.
    //
    // Returns: array ($lat, $long);
    // NOTE: This is the same format used by Google Maps API.


Sexagesimal:

::

    $conv->utm2geo_sex ($x, $y, $tZone, $NS);
    $conv->utm2geo_sex ($x, $y, $tZone, $NS, $ellipsoid_id);
    $conv->utm2geo_sex ($x, $y, $tZone.$NS);
    $conv->utm2geo_sex ($x, $y, $tZone.$NS, $ellipsoid_id);
    //
    // Returns: array ($lat, $long);
    //   Where...
    //     $long = array ($lnDegree, $lnMinutes, $lnSeconds)
    //     $lat = array ($ltDegree, $ltMinutes, $ltSeconds)


Sexagesimal (absolute value with extra N/S label):

::

    $conv->utm2geo_abs ($x, $y, $tZone, $NS);
    $conv->utm2geo_abs ($x, $y, $tZone, $NS, $ellipsoid_id);
    $conv->utm2geo_abs ($x, $y, $tZone.$NS);
    $conv->utm2geo_abs ($x, $y, $tZone.$NS, $ellipsoid_id);
    //
    // Same as utm2geo_sex but returned $lat and $long has the form:
    //     $lat = array (abs($ltDegree), abs($ltMinutes), abs($ltSeconds), $WE)
    //     $long = array (abs($lnDegree), abs($lnMinutes), abs($lnSeconds), $NS)


DEPRECATED methods:

::

    $conv->utm2geo();


This old method have been definitively discontinuated because it originally
returned array with sexagesimal degree coordinates $lat, $long (in reversed
order) and there is no way to mantain reasonably backward compatibility
paradigm because utm2geo_dec(), which may be the most useful function of the
original version (because provides coordinates in the format expected by Google
Maps APIs), has also inverted its result order.

For this reason, I think the best solution is to definitively remove it.

WARNING: Even removed utm2geo(), utm2geo_dec() now relies on utm2geo_sex() and
returns its result in latitude, longitude and code expecting old order will not
notice it. Please, review your code if you are uptating from old version of
this library.


Packed syntax:
~~~~~~~~~~~~~~

All conversion functions can be invoked with all parameters packed in a single
array (passed as a single parameter to the function.



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


Usage (Javascript):
===================

Javascript usage is almost identical to PHP usage (See PHP usage for more detailed information).


The unique differences are the imposed by each language syntax. You can instantiate geoconv in javascritpt similary the way you achieve it in PHP:

::

    var conv = new geoconv(); // To use default ellipsoid (wgs84).
    var conv = new geoconv(ellipsoid_id); // To select desired ellipsoid.

...and then access same methods with same parameters by only using '.' instead of '->' and with minimal datatype syntax differences. Examples:

::

    conv.geo2utm(long, lat); // Convert to utm using current ellipsoid.
    conv.geo2utm(long, lat, ellipsoid_id); // Convert using specified ellipsoid.

