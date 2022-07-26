# 0.0.16
* bugfix: exception when converting array binding to simple and reverting value
# 0.0.15
* bugfix: clean up bindHost when unbinding in bind-dom
* added beforeUnbind lifecycle event
* updated docs
# 0.0.14
* bugfix don't propagate non-prexisting props created by adding event-handler
* BREAKING: don't propagate pre-existing if object already has that property
# 0.0.13
* bugfix: correctly bind bind-dom as top-level node in template
* added db-monster rendering performance demo
* CHANGELOG -> CHANGELOG.md
* adapted demo documentation in README
* fixed & improved loop demo
* improved start and test scripts
* updated build system and swapped dev server 
# 0.0.12
* fix: only propagate host-bindings to proxy for bound attributes, properties and text
# 0.0.11
* bugfix: unbinding template did also undbind nested bind-doms
* now propagating bound attributes and properties of host nodes to bound object during binding
* force executing host-bindings even if the bound object hast no setter -> propagate to bound DOM
# 0.0.10
* don't auto-add className "Object"
* minor doc fixes
# 0.0.9
More fixes of things going wrong when deeply nesting arrays of array of stuff
(loop-dom), having to do with tracking addition and removal of nodes.
* BREAKING array proxy returns first element instead of array
# 0.0.8
Several fixes of things going wrong when deeply nesting arrays of array of stuff
(loop-dom), having to do with tracking addition and removal of nodes.
* retain ".proxy" values on <bind-dom> if set before binding
* revert to previous values when unbinding
* debounce template insertion
* correctly unbind parent-binding stuff in mutation observer
* correctly convert to simple from array when removing nodes
# 0.0.7
* added bindom.min.mjs to .gitignore
* include README in package
* fix package exports for rollup-plugin-node-resolve
# 0.0.6
* moved from absolute path imports to name and import-map
* documented that
# 0.0.5
* added documentation
* fixes
# 0.0.4
* dependency fix
# 0.0.3
* fixed directories included in package
# 0.0.2
* doc fix
# 0.0.1
* initial version
