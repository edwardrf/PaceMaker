PaceMaker
=========

Animation controller of the lamp project, it stores a set of animations and through a web protocol these animations can be called and sent to the lamps through the lamp protocol.


Web Protocol 
============

This section defines how other programs can communicate with PaceMaker. PaceMaker is controlled via a simple web protocol.

Parameters
----------
* animation (name/number of the animation to display)
* queue     (optional true/false, default true, if true, the animation would be queued to display after the current animations)
* length    (optional integer in milliseconds, the total time the animation should play for, if left ommited, the animation would be displayed using default fps)


Examples
--------
The following examples assumes the service is hosted on example.local on port 9000

    http://example.local:9000/?animation=smile

This would enqueue the smile animation to be displayed next


    http://example.local:9000/?animation=smile&queue=false
    
Stop the current animation and display the smile animation


    http://example.local:9000/?animation=smile&length=10000
    
Queue the smile animation but instead of the normal fps, slow the animation to display total 10 seconds (10000ms)


Animation Format
================

Animations are coded in JSON format like below

````
{
  name: 'smile',
  frame:[
    'FFFFFFFF',
    'FFFFFFFF',
    'FFFFFFFF',
  ]
}
