import {addClass} from '../../bindom.mjs';

const template = /* html */`
<label>
	<input type="checkbox" data-bind=classlessChecked:.checked>
	Classless
</label>

<label>
	<input type="checkbox" data-bind=withClassChecked:.checked>
	With Class
</label>

<div>
	<template is=if-dom data-bind=showClassless:.if>
		Lorem ipsum dolor sit amet, <span>consectetur adip</span>...
		<p data-bind=dynamicallyBound:§> </div>
	</template>
</div>

<div>
	<template is=if-dom data-bind=^showWithClass:.if data-class=IfClass>
	</template>
</div>
`;

const style = /* css */`
.ConditionalRendering {
	display: grid;
	grid-template:
		'classless withClass' 1rem
		'classless withClass' 1fr /
		1fr 1fr;
	gap: 2rem;
}

.ConditionalRendering label {cursor: pointer;}
`;

addClass(class ConditionalRendering {
	// contructor() {
	// 	// TODO bug, no worky
	// 	this.dynamicallyBound = `Note how this is bound once the DOM is
	// instantiated!`;
	// }
	set classlessChecked(checked) {
		this.showClassless = checked;
		// TODO should not require timeout - need to determine what takes
		// precedence, DOM value or JS value? Possibly check what value seems
		// more sensible ...
		setTimeout(() => this.dynamicallyBound =
			`Note how this is bound once the DOM is instantiated!`, 10);
	}
	set withClassChecked(checked) {this.showWithClass = checked;}
}, {style, template});

addClass(class IfClass {}, {template: 'This rendered a class'});
