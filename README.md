tabbed
======

A HTML/CSS/JS approach to tabs with D'n'D reordering and drag over.

Main goals:
- highest possible browser compatibility
- should degrade gracefully,
- usable and customizable

Current features:
- "container managers", which holds all containers (multiple managers should be possible, not tested yet)
- "containers", which hold tabs and a content pane (the content display is not working yet)
- "tabs", which can be reordered and dragged between the containers and onto the blank to make a new container
- compatibility: tested in the latest versions of Chrome, Firefox, Opera, Safari and IE10 (including compatibility mode down to IE7) [all on Windows]

What are the next steps:
- separate the HTML, CSS and JS portion for better maintenance
- there should be content, which should be displayed
- the tabs need to be managed in with and overflow
