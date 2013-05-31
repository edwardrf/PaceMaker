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
* invert    (optional true/false, default false, invert the color, 0->F, F->0, 1->E ...)
* loop      (optional integer in number of times a animation is played, default 1, 0 to loop forever)


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
[
  {
    name: 'smile_nagative',
    frames:[
      [
      '00000000',
      '00F00F00',
      '00F00F00',
      '00000000',
      'F000000F',
      '0F0000F0',
      '00FFFF00',
      '00000000',
      100
      ],
      [
      '00000000',
      '00F00F00',
      '00F00F00',
      '00000000',
      '00FFFF00',
      '0F0000F0',
      '00FFFF00',
      '00000000',
      200
      ]
    ]
  },
  {
    name: 'smile_nagative',
    frames:[
      [
      'FFFFFFFF',
      'FF0FF0FF',
      'FF0FF0FF',
      'FFFFFFFF',
      '0FFFFFF0',
      'F0FFFF0F',
      'FF0000FF',
      'FFFFFFFF',
      500
      ]
    ]
  }
]
````

The whole json file is an array of animations, each animation has 2 attributes: name and frames, name is the string of the name of the animation that follows, frames is a arry of array of strings in HEX number that represents the brightness of each lamp in each frame.

Frames
------

For each frames attribute, it is an array of frame, each frame is a array of strings of HEX number representing the brightness of each lamp.

0 being the lamp is off
F being the lamp is fully lit
8 is 50% brightness

The number after the 8 strings is the length of this frame in milliseconds.
