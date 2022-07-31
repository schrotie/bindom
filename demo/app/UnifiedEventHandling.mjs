import {addClass} from '../../bindom.mjs';

const template = /* html */`
<button data-bind=change:!click data-what=attr>Attribute</button>
<button data-bind=change:!click data-what=prop>Property</button>
<button data-bind=change:!click data-what=text>Text</button>
<!-- Note how you can do multi-line data-bindings for nicer layout: -->
<div data-bind="
                 test:*
                 attr:@data-test
                 prop:.testProp
                 text:§
                "
> </div>
<div data-bind=description:§> </div>
`;

addClass(class UnifiedEventHandling {
	set change({target: {dataset: {what}}}) {
		const n = Math.random();
		switch(what) {
		// this.test is a Quary Object for manipulating the node:
		case 'attr': this.test[what]('data-test', n); break;
		// the node is always this.test[0]:
		case 'prop': this.test[0].testProp =      n;  break;
		case 'text': this.test[what](            n);  break;
		}
	}

	set attr(a) {this.description = `Attribute set to ${a}`;}
	set prop(a) {this.description = `Property  set to ${a}`;}
	set text(a) {this.description = `Text      set to ${a}`;}
}, {template});
