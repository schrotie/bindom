# bindom
Tiny, powerful data binding & web application framework

## Hello world!

```html
<html>
	<body>
		<span data-bind=greet:§> </span> <span data-bind=whom:§> </span>!
		<script type=module>
			import $ from "../bindom.min.mjs"
			$(document.body).bind({greet: "Hello", whom: "world"});
		</script>
	</body>
</html>
```

## Features

* 2-Way binding between DOM and JavaScript Objects
* *full* DOM access
* unified handling of events, attribute-, property-, and text-changes
* scoped binding
* web component based view-modules with JS-code, HTML-templates and styles
* dynamically binding added DOM and cleaning up removed DOM bindings
* conditional rendering
* iterative rendering (rendering from array-data)
* ponyfill-style non-intrusive behavior, that *only ever* applies where you
  invoke it


## Why?

Yet another frickin' web framework??? Yup, sorry. Size matters. Standards
matter. Simplicity matters. Performance matters. Style and power matter.

I want a framework that is so small, that it's easy to maintain. Because if you
use it, you own it. You have to update it until it falls out of fashion and then
take over maintenance completely. Bindom is 800 lines plus Quary (another few
hundred lines). This gives me a complete web application framework and DOM
manipulation toolkit (Quary) at maybe 1200 lines. More than I'd like, but still
maintainable.

I want a framework, that leverages standards. As little framework specific
syntax as possible. Bindom ships three ECMAScript methods and three web
components. The web components use six custom attributes, and two of those are
for edge cases. Bindom code will be easily readable by developers 20 years from
now.

I want a framework, that just works and works without magic. No compilation, no
custom language, nothing (if you actually understand, how whisker/handlebars
binding works, congratulations, you're one of the few - I consider this magic).
And if I bind some nodes, I want the rest of the DOM left alone.

I want a framework, that gives me awesome performance where I need it. A decent
web app should clock in at maybe 100K, not megabytes. Bindom is below 8K gzipped
(including Quary). And this is not optimized for size. No magic means I know
what's going on and can optimize for CPU or RAM where needed.

Finally I want a framework that helps me structuring script and DOM but does not
get in my way. I want easy power, native DOM APIs where I need them and nice
bindings where I don't.


## Demo

Bindom comes with an app demo, that shows most features you'll need to write web
apps. You may
```shell
git clone https://github.com/schrotie/bindom.git
cd bindom
npm install
npm start
```
This should open the demo in your browser. Note this will only work in Chrome
as of this writing. Other browsers need importmaps support as described below!
Check out the source code in demo/app/ and see in your browser, what it does.
Change it! The browser should automatically reload.
I guess, that's the quickest way to learn Bindom for most of you.

You may come back to the documentation in order to understand, how the features
work, what's actually going on there.

## Documentation

[Quary](https://github.com/schrotie/quary) is a "micro-library for writing
vanilla web components". Check it out, if you care. Bindom extends Quary by two
methods: `bind` and `undbind`. When Bindom gives you DOM-nodes, they are usually
wrapped in a Quary object. While this can be quite handy, you may ignore it, if
you don't care: Quary extends Array and is thus *just an array* of nodes with
some utility methods for DOM manipulation and monitoring.

Quary can help you with selecting nodes, but you can also just pass it a node
and then call the `bind` method on it. The bind method expects one argument - a
JavaScript object to which to bind the selected DOM. For example (see Hello
world! above):
```JavaScript
import $ from "bindom"
$(document.body).bind({greet: "Hello", whom: "world"});
```
Bindom will then search the respective DOM for `data-bind` attributes and bind
each HTMLElement with such an attribute to the object as specified in the
attribute.

Note that the bound object may be an instance of a specific class, designed
to interact with the specific bound DOM. Only thus you can leverage the full
power of Bindom.


### `import 'bindom'`, Development & Deployment

I hedge a deep and well-fostered hate against having a build step in my
development cycle and my apps work without one. If you want to import bindom
you have two options: import the bundled bindom.min.mjs. You may use absolute
paths to its position in your node\_modules folder and be somewhat fine.

However, if you want to import its unmingled source version from bindom.mjs,
you will need to tell it where to find Quary, on which it depends. The solution
to making this work without a build step is import-maps which are supported in
the major browsers with the exception of IE 12 (aka "Safari").

Put something like this into the head of your HTML:
```HTML
<script type="importmap">{"imports": {
	"bindom": "./node_modules/bindom/bindom.mjs",
	"quary": "./node_modules/quary/quary.mjs"
}}</script>
```
and you're good to go for development. You can then just `import 'bindom'` in
your code and develop on your sources, not some weird artifact that resembles
what you developed after having that artifact and the browser jump throw a
dozen or so hoops.

For production you absolutely want to have a build step that bundles your app. I
recommend rollup for this. It's the perfect tool for this task.


### Methods & Events

Bindom adds two methods to Quary:
```JavaScript
const bindToThisObject = {};
$(document.getElementById('bindThisElement'))
	.bind(bindToThisObject)
	.unbind(bindToThisObject);
```
`bindToThisObject` is optional in both call. 

`bind` will scan `bindThisElement` and its decendants for `data-bind` attributes
and bind accordingly (see below). If no argument is passed, it will bind to a
default `{}` object. When done, it will emit a `bound` event on
`bindThisElement`. The event will contain the bound `bindToThisObject` as
`detail`.

`unbind` will revert the binding. If no argument is passed, it will remove
_all_ bindings, otherwise only those to the passed object. _Before_ unbinding
it will emit a `beforeUnbind` event on `bindThisElement`. When done unbinding it
will emit an `removedBound` event on `bindThisElement`.

### data-bind


#### Introduction

Each binding consists of two parts that are separated by a colon: The bound
property or method of the object on the left and the bound DOM-stuff on the
right.

What the respective DOM-stuff is, is determined by the leading character, or
by dangling parantheses if it's a DOM method:
* @ attribute value
* . DOM property
* ! event
* § child text node
* () method
* \* the bound HTMLElement itself

So assume, you want to change the `class` attribute of a node from JavaScript.
You could give it a `data-bind=myClass:@class`. If you then do
`bound.myClass = 'foo'`, the node's class attribute will become `foo`.

However, sometimes you want to toggle some class, while leaving other classes
alone. Then you could do `data-bind=drawer:.classList;fold:!click`. Note that
you can combine several binding statements by concatenating them with
semicolons. This binding binds the classList property and the click event. A
class for dealing with this might look like this:
```JavaScript
class Bound {
	set fold(clickEvent) {this.drawer.toggle('open');}
}
```
You could also trigger the click event yourself like this:
```JavaScript
class Bound {
	triggerClick() {this.fold = new CustomEvent('click');}
}
```


#### Binding Types 

So here are examples for all binding types:

Type          | Binding
------------- | --------------------------------------
**Attribute** | `data-bind=objPropA:@data-dom-attribute`
**Property**  | `data-bind=objPropP:.domProperty`
**Text**      | `data-bind=objPropT:§`
**Event**     | `data-bind=objPropE:!domEventName`
**Method**    | `data-bind=objMethod:domNodeMethod()`
**Node**      | `data-bind=objPropN:*`

##### Atributes, Properties and Text
Note that on the object everything translates to properties, except for DOM
methods, which become methods on the object, too. You can always *access* bound
stuff from the JavaScript object.

If you take the attribute binding from the table above,for example,
`object.objPropA` will *return* the current value of the attribute of the bound
node. The attribute value is not stored somewhere, but read from the DOM when
you call the property getter `object.objPropA`. It will then call
`node.getAttribute('data-dom-attribute')`.

You can also always do `object.objPropA = 'x'`. This will invoke
`node.setAttribute('data-dom-attribute', 'x')`. All this also works if you bind
the same object property to several nodes. In this case the getter will return
the value of the "first" bound element.

This works exactly the same with property and text bindings.

##### Events, Methods and Nodes
You cannot *get* events (`object.objPropE` will raise an exception) and you
cannot *set* methods or nodes (`object.objMethod = 'x'` and
`object.objPropN = 'x'` will each raise exceptions).

Nodes you can only *get* and then have full access to their DOM APIs.

Methods can only be called. `object.objMethod()` will call the node's
`domNodeMethod` with the same arguments.

You can assign to events, but you should assign DOM events to them, e.g.
`object.objEvent = new CustomEvent('foo', {detail: 'bar'})`. This will emit the
event on the bound node. Since Bindom uses Quary's emit method for this, you may
assign anything, that Quary's emit method supports, see Quary's documentation
for details.

#### Change Notifications
Bindom can also track changes and events in the DOM for you. It will do that,
if it finds a *setter* for the bound property on the bound object. Let's assume
the JavaScript class of the object bound in the table above looks like this:
```JavaScript
class MyDomHandler {
	set objPropA(a) {}
	set objPropP(p) {}
	set objPropE(e) {}
	set objPropT(t) {}
}
```
Then Bindom will call the respective setter when the bound attribute, property,
or text changes, or (`objPropE`!) if the event `domEventName` is triggered on
the bound DOM node.

#### Quoting Bindings & Multiple Bindings
You may have noticed, that the `data-bind` attributes are usually listed without
quotes. Quotes for attributes are only *required* in some situations by the
HTML standard and Bindom's `data-bind` is designed to not *require* quotes.
You *may* add them if you like, though.

You can define several bindings by concatenating them with `;`, e.g.
```HTML
<span data-bind=text:§;className:@class;style:.style> </span>
```

When you do use quotes, though, you *may* also concatenate bindings with
newlines for better readability, especially when you have a lot of bindings. The
example above may also be written:
```HTML
<span data-bind="
                 text:§
                 className:@class
                 style:.style
                "
> </span>
```

#### Scoping

The DOM is organized in a tree. When you bind a node, Bindom will also bin all
its decendants, i.e. the whole tree-branch of that node. However, if Bindom
encounters a node that has a `data-class` attribute, Bindom will stop there. The
node with the `data-class` attribute will also be bound, but not *its*
decendants. And special rules will apply to that last node.

The significance of `data-class` will become clear, when discussing
`<bind-dom>`. For now let's suffice it to say, that `data-class` signifies the
opening of a new scope. Only the node with the `data-class` attribute may
receive a binding from the ancestor scope above in the tree. The decendants of
that node are out of scope for the ancestor.

Such a parent-/ancestor-binding is signified by a leading `^` in the object
property name. For example
```HTML
<div
	data-class=X
	data-bind=^parentObjProp:!someEvent;newScopeObjProp:@class
><!-- ... --></div>
```
will bind the `parentObjProp` of the parent-scope to the `someEvent`-event of
the new scope, and `newScopeObjProp` of the new scope to the @class attribute of
the *host node* of the new scope. The host node is always the node (or
collection of nodes) on which `bind` was called. And only host nodes can have
parent scope bindings.

#### Dynamic Binding

Bindom tracks additions to and removals from the DOM tree. When a node is
removed that was bound by Bindom, it will then be unbound. And under certain
ciscumstances, Bindom will bind new nodes to existing scopes.

The contents of HTMLTemplateElements is parsed but mostly ignored by the
browser. When binding scopes, Bindom looks for template elements and tags the
content as belonging to the respective scope. When the template content is
instantiated, Bindom will bind it to the respective scope/object, *regardless
of where the nodes are inserted!*

This will usually look quite nice and intelligible in your code, but depending
on where you insert stuff, the live DOM could look somewhat labyrinthine
(it usually doesn't but it *may*).

### `<bind-dom>`

The `<bind-dom>` custom element is where Bindom got its name. `<bind-dom>` is
how you write web apps and organize your code using Bindom.

`<bind-dom>` does what it says - it binds DOM. And it binds it to an object of
the class you give it in its `data-class` attribute. That's why Bindom considers
`data-class`to be the harbinger of a new scope.

The order of events is like this:
1. you tell Bindom, that you have a nice class you'd like to use
2. you put a `<bind-dom>` element into the DOM that references that class
3. `<bind-dom>` does its thing

Note that 1. *may* also come *after* 2.. Bindom will wait three seconds for a
class it should instantiate to be declared and will then raise an exception, if
the class was still not declared. That should be ample time because usually
you *should* bundle your production code. For real dynamic loading of modules
you *should* implement a component, that does what you need and only sets
`data-class` once you're good to go.

You declare a class to Bindom by calling Bindom's `addClass` method:
```JavaScript
import {addClass} from 'bindom';
addClass(class MyDomHandler {});
```
Bindom will call the constructor of your class without arguments and bind it to
the DOM inside (and including) the `<bind-dom>` element.

`<bind-dom>` will add the bound class instance as property `proxy` to the bound
`<bind-dom>` element.

Note that you can use bindom's lifecycle events as lifecycle callbacks in your
class. Just subribe to the host node's `bound` and `beforeUndbind` events,
preferably using `bindHost` (see below).

#### template

`addClass` actually accepts an optional argument besides your (mandatory)
class: a configuration object, that *may* (and usually *should*) contain a
`template` property. `template` *must* be a string defining the HTML for your
class to manage. `<bind-dom>` will
1. transform the template string into an actual HTMLTemplateElement
2. clone the template's content and *append* it to itself
3. bind a new instance of your class to that.

Please check out the app demo for several examples of this.

#### style

A second optional property of the configuration object accepted by `addClass`
is `style`. There you *may* add CSS for your module. The style-string will be
only ever added once to the page's styles.

Bindom will also add the name of the bound class to the `class` attribute or the
respective `<bind-dom>` node. You could also use `[data-class=MyDomHandler]` as
a CSS selector to scope the CSS to your module, but `.MyDomHandler` is a much
nicer selector.

#### bindHost

I recommend putting `template`, `style`, and JavaScript `class` of your modules
together into one file. When that gets unwieldly you should cut up the module
instead of separating DOM, style, and JavaScript.

However, that means, you'll usually not see you host node together with the
rest of the code of a module. And if you need to `data-bind` anything on your
host node you would have to remember to put that down, where that node is
instantiated. And if that happens in more than one place ...

In order to circumvent this madness you may pass the third and last supported
property to `addClass`'s configuration object: the `bindHost` configuration.
This will be *added* to the `data-bind` of your host node. If there already are
parent bindings, these will be left alown and still work.

#### Dynamic `data-class`
You *may* change the `data-class` attribute of a `<bind-dom>` element anytime.
`<bind-dom>` will then clean up the old bound stuff (remove the template,
unbind ...) and invoke the new stuff.

### `<template is=if-dom>`

`if-dom` is Bindom's conditional rendering facility. It is a custom
HTMLTemplateElement (you'll need a polyfill for this to work in IE 12, aka
"Safari") that renders its content *before* the template, when its
`.if` property is true.

Thus you'll usually want to bind to `if-dom`'s `.if`-propety:
```HTML
<template is=if-dom data-bind=render:.if>...</template>
```

#### `data-class`
You *may* add `data-bind`-attributes to elements inside the template and they
will be bound to the parent scope when instantiated, *except* if you give
`if-dom` an *optional* `data-class` attribute. In the latter case it will behave
like a `<bind-dom>` that only renders, if its `.if` property becomes true.

#### `data-parent` & `data-insert`
These two attributes allow you to customize where the template content is
inserted. If you give `if-dom` a `data-parent` attribute it will walk *up* the
DOM-tree and call `querySelector(this.dataset.parent)` until it finds a matching
node. Then it will *append* its content or call the DOM insertion method (as
supported by Quary!) you gave it with the `data-insert` attribute.


### `<template is=loop-dom>`

`loop-dom` is somewhat similar to `if-dom`. But it will instantiate its content
once for each element of the array you give it in its `.array` property. Thus
you'll usually bind to its `.array` property. However, since `loop-dom` *always*
opens a new scope, you *must always* use a parent binding for this:
```HTML
<template is=loop-dom data-bind=^myData:.array>...</template>
```
The array you pass *must* contain objects, and each template instance will be
bound to one such object.

You *may* give `loop-dom` a `data-class` attribute. If you don't it will just
bind to the objects you pass to it, but if you do, it will instantiate the
respective class (and additionally instantiating style and template string if
applicable), `Object.assign(newInstance, arrayObject)` and then bind
`newInstance`.

`loop-dom` also supports `data-parent` and `data-insert` attributes.

### Custom Elements

Bindom is intended to help with code organization, facilitate separation of
easily testable pure JavaScript code and DOM API and mostly implement views
for (sub-)pages.

It *may* also help with complex custom elements in some cases, but usually
you'll be better off using something like Quary or native APIs for such.
Since Bindom comes with Quary included, you already got a library intended for
implementing vanilla web components.

### State Management

State management is the final part missing for writing modern web applications
without leveraging god-frameworks like AngularVueReact. If you intend to write
a somewhat complex web application you should probably use Redux from the start.
Redux is React-agnostic, lean, powerful and just great for writing complex
apps.

However, most apps are much simpler than the complexity level calling for
Redux. And if you write something simple, you should use something simple for
state management. Since I didn't find something that satisfied my likings, I
implemented [xt8](https://github.com/schrotie/xt8).

I found that with the triumvirate of Quary, Bindom, and Xt8 I can very quickly
implement high performance quality web apps that are built to last, because they
are built on standards, are very lean and play nice with anything else you want
to use.

I encourage you to find your own stack that is not godframework XY. And I hope
you find Bindom useful.

Cheers, Thorsten
