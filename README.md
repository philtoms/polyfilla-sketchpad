# polyfiller-sketchpad

This application translates a stream of touch generated screen coordinates into a line of melody. It provides a suitable musical context: key, tempo, etc, in which to sketch a tune by moving a stylus or a finger around a touch activated canvas area. The application captures, process, saves and plays the music in real time (latency notwithstanding). It also provides rudimentary playback and editing facilities.

The app fits into a broader, but as yet visionary, ambition of cross-training an AI gesture recognition model to output fully formed MIDI compatible musical data. For now, it is but a modest work-bench for exploring the pragmatics of programmed intentionality; a development approach which in turn leans towards a fully AI augmented development experience.

## Download sketch data

curl 'https://sedate-efficacious-nation.glitch.me/user/sketch/data' > sketch.json

## Clear sketch data

curl 'https://sedate-efficacious-nation.glitch.me/user/sketch/data/clear'

## upload sketch data

curl -X POST -H "Content-Type: application/json" -d @data.json https://sedate-efficacious-nation.glitch.me/user/sketch/data

## Download all data

curl 'https://sedate-efficacious-nation.glitch.me/user/data' > data.json

## upload all data

curl -X POST -H "Content-Type: application/json" -d @data.json https://sedate-efficacious-nation.glitch.me/user/data

## Programmed Intentionality notes

PI is not an exercise in hiding complexity. On the contrary, the methodology underlining PI is bent towards surfacing the intentional features of an application. From the brief intro above we can iconically outline these gathered intentions hierarchically.

```
  polyfiller-sketchpad
    metronome
    score
      title
      tempo
      signature
      stave

    canvas
      touch
      backdrop

    play
      start
      stop
      playback
```

Of course, iconic intentionality does not always need to be hierarchical, or for that matter topological. But it is often convenient to capture intentional relationships in this manner, particularly where conservative application structure is concerned.

This application is web based, and so is a good fit for the dom-circuit helper function that binds target DOM elements to a state machine. A state machine is a very good intermediate (or indexical) representation of intentionality and this particular software does a very good job of reducing Javascript boilerplate so that we can see the intentions from the trees so to speak.
