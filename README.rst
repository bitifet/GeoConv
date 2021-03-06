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

geoconv.js
   Javascript implementation.

geoconv.class.php
   PHP implementation.
   

Basic usage (Javascript):
=========================

You can use geoconv with Node.JS and RequireJS module systems out of the box.

If none of the supported module systems were detected, it will be exported as //geoconv// variable in global scope.

NOTE: For brevity reasons, we will suppose you imported it in a variable named //conv// in your current scope. If no module system used, you instead will get it named as //geoconv// so you should use it instead or reassign to //conv//. When no module system is present, library exports to geoconv due to reasonably avoid variable name collision. Also, in PHP examples, we will supoppose you instantiated it as //$conv//.


Node.JS:
--------

Example:

::

    var conv = require("path/to/geoconv");


RequireJS:
----------

As usual, you can include geoconv as a module depnedency for your own modules.

Example:

::

    define (['path/to/geoconv'], function(conv) {
        ...
    });



Basic usage (PHP):
==================

The unique differences between PHP and javascript usage are the imposed by each
language syntax and the fact that PHP has a class-oriented OOP model and
therefore you should build an instance by yourself (see example below).

::

    $conv = new geoconv(); // To use default ellipsoid (wgs84).
    $conv = new geoconv($ellipsoid_id); // To select desired ellipsoid.

...and then access same methods with same parameters by only using '.' instead of '->' and with minimal datatype syntax differences. Examples:

::

    $conv->geo2utm($long, $lat); // Convert to utm using current ellipsoid.
    $conv->geo2utm($long, $lat, $ellipsoid_id); // Convert using specified ellipsoid.



NOTE: PHP usage is almost identical to Javascript one. So for the rest of the
documentation, except for the current PHP usage section, we will use javascript
syntax by default.


Valid formats:
==============

Following tables shows all notations supported by the multiple conversion
methods available and the functions (if any) which outputs them.

In the UTM section you can see the output format of the geo2utm() method and
all formats accepted by all utm2geo_xxx() ones.

In the Geographical section, you can see all formats that the multiple flavours of utm2geo_xxx() functions (and which one) can produce which all of them (and a few variants explained in notes) are all valid inputs for geo2utm() too.


UTM:
----

+----------+--------------+-----------+---------------------------------------------------+
| Format   | Syntax       | Function  | Example                                           |
+==========+==============+===========+===================================================+
| General  | x, y, tz, NS | geo2utm() | [ 467301.22793929646, 4379418.168333972, 31,'N' ] |
+----------+--------------+-----------+---------------------------------------------------+
| General  | x, y, tzNS   |     --    | [ 467301.22793929646, 4379418.168333972, '31N' ]  |
+----------+--------------+-----------+---------------------------------------------------+

Geographical:
-------------

+-------------+----------------+---------------+------------------------------------------+
| Format      | Syntax         | Function      | Examples / Notes                         |
+=============+================+===============+==========================================+
| Decimal     | lat, lon, tz   | utm2geo_dec() | [ 39.56383500648545, 2.619341004181191 ] |
+-------------+----------------+---------------+------------------------------------------+
| Sexagesimal | lat, lon       | utm2geo_sex() | [ [ 39, 33, 49.806070042931765 ],        |
| (N,E>=0)    | lat=[dg,min,s] |               | [ 2, 37, 9.627645156895426 ] ]           |
| (S,W<0)     | lon=[dg,min,s] |               |                                          |
+-------------+----------------+---------------+------------------------------------------+
| Sexagesimal | lat, lon       | utm2geo_abs() | [ [ 39, 33, 49.80609339057878, 'N' ],    |
| (Absolute   |                |               | [ 2, 37, 9.627660209229418, 'E' ] ]      |
| with N/S    | lat/lon=[      |               |                                          |
| and E/W)    |   degree,      |               |                                          |
|             |   minutes,     |               |                                          |
|             |   seconds      |               |                                          |
|             |   [NS/EW]      |               |                                          |
|             |                |               |                                          |
|             | ]              |               |                                          |
+-------------+----------------+---------------+------------------------------------------+
| Sexagesimal | lat, lon       | utm2geo_SW()  | Output:                                  |
| with º,',"  |                |               | [['39ºS','33\'','49.806116738251376"'],  |
| and S or W  | lat/lon=[      |               | ['2º','37\'','9.627675261548916"']]      |
| when needed |   degree,      |               |                                          |
|             |   minutes,     |               | Input:                                   |
|             |   seconds      |               | * º, ' and " ar optional at input.       |
|             |                |               | * Numeric/string types are both valid    |
|             | ]              |               |                                          |
+-------------+----------------+---------------+------------------------------------------+
| Sexagesimal | lat, lon       | utm2geo_NE()  | Output:                                  |
| with º,',"  |                |               | [['39ºN','33\'','49.806116738251376"'],  |
|             | lat/lon=[      |               | ['2ºE','37\'','9.627675261548916"']]     |
| and NS,EW   |   degree,      |               |                                          |
| always      |   minutes,     |               | Input:                                   |
|             |   seconds      |               | * º, ' and " ar optional at input.       |
|             |                |               | * Numeric/string types are both valid    |
|             | ]              |               |                                          |
+-------------+----------------+---------------+------------------------------------------+

NOTES:
  * Both geo2utm_SW() and geo2utm_NE() output format are like the examples but
    as input for geo2utm() º, ', " can be omitted.
  * N (North), and E (East) too. And also S (South) and W (West) if you use negative
    values instead for all degree, minutes and seconds.
  * But BE CAREFULL to not to mix S or W with negative values. If you do so, it will
    be evaluated as North or East, respectively, instead.
  * Also DON'T mix degree, minutes and/or seconds with different signs. They will be aritmetically operated. N/S and E/W are only notational sugars.


Syntax:
-------

All mentioned above conversion methods:
    geo2utm()
    utm2geo_dec()
    utm2geo_sex()
    utm2geo_abs()
    utm2geo_SW()
    utm2geo_NS()

...can be invoked with an array containing the input cordinates in any of the syntaxes of any of its counterpart functions (documented above) and an optional parameter with the ellipsoid_id to be used for the conversion.

If not specified, the ellipsoid specified in the constructor or the default ellipsoid will be used instead.

Input coordinates can also be specified in separated parameters of its first level in the array.

For example:

:: 

  conv.utm2geo_dec([ 467301.2275770833, 4379418.167615722, '31N' ]);

and

:: 

  conv.utm2geo_dec(467301.2275770833, 4379418.167615722, '31N');

...are fully equivalent.

If you want to specify a specific ellipsoid, you can do so i both cases:


:: 

  // This two sentences are completely equivalent:
  conv.utm2geo_dec([ 467301.2275770833, 4379418.167615722, '31N' ], 'wgs66');
  conv.utm2geo_dec(467301.2275770833, 4379418.167615722, '31N','wgs66');


Ellipsoid selection:
--------------------

In PHP implementation you can select the ellipsoid by passing its id at construction time.

Example:

::

    $conv = new geoconv('helmert_1906');


In javascript, you directly get a working object with default ellipsoid (which currently is 'wgs84').

Later you could change it whenever you want with the set_ellipsoid() method.

::

    conv.set_ellipsoid (ellipsoid_id); // To change current ellipsoid.
    conv.get_ellipsoid (); // To get current ellipsoid.
    

In javascript, you also could get new instances with different ellipsoids with the additional new() method and work with each one indifferently.

Example:

::

    var bessel_conv = conv.new('bessel_1841');
    // Now conv continue using wgs84 ellipsoid (if you didn't changed)
    // and bessel_conv uses bessel_1841.



Ellipsoid details retriving:
----------------------------

::

    conv.get_ellipsoid_data (); // Returns current ellipsoid data.
    conv.get_ellipsoid_data (ellipsoid_id); // Returns given ellipsoid data.

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

     eData = conv.get_ellipsoid_data();
     eData = conv.get_ellipsoid_data("hayford_1909");
     // Both output: [e_2, c, a, b, name, date, e]


Adding new ellipsoids:
----------------------

Ellipsoidd data is hard coded in each implementation (currently javascript and PHP) of the library.

If you want to try more ellipsoids you can add your own ones by hand (the code is self explainatory enough).

If you think your new ellipsoids could be useful for anyone, you can clone this repository and make me a pull request.

Also I will thank any other suggestion or observation about the best default elliposoid or any other question you could consider useful.

I'm not a geographer or mathematician. I just translated the algorithms used by Gabriel Ortiz in its spreadsheet and used the same default ellipsoid that come in it by default. I don't know if it is the best or not.





