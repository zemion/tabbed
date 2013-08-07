tabbed
======
*A HTML/CSS/JS approach to tabs with D'n'D reordering and drag over.*

Motivation
----------
This project rose due to the fact that there are different UI classes for the web (jQueryUI, to name only one prestigious) providing tabbed panes, but none of which provides the ability to drag and drop the panes. The furthes development seen until now is the possibility to reorder the tabs via DnD.
The code provided here is not based on any framework, but could be easily adapted.

Main goals
----------
- highest possible browser compatibility
- should degrade gracefully,
- usable and customizable

Current features
----------------
- "container managers", which holds all containers (multiple managers should be possible, not tested yet)
- "containers", which hold tabs and a content pane (the content display is not working yet)
- "tabs", which can be reordered and dragged between the containers and onto the blank to make a new container
- compatibility: tested in the latest versions of Chrome, Firefox, Opera, Safari and IE10 (including compatibility mode down to IE7) [all on Windows]

Next steps
----------
- [x] ~~the HTML, JS and CSS portion should be separated~~
- [ ] there should be content, which should be displayed
- [ ] the tabs need to be managed in with and overflow
- [ ] the different containers need to be overlayed correctly
- [ ] eventually, the classes probably need to be in seperate files (for better maintenance)
- [ ] the containers should be reduced to straight forward containers and NOT be moved (this would be a different type)

Possibilities
-------------
This project can be used in different manners. I can imagine draggable toolbars, which are dockable and can be brought together via drag and drop.
Another variant is to focus on the "window" concept, and focus on the container concept, providing different classes like windows, toolbars etc.
