import {addClass} from '../../bindom.mjs';

const template = /* html */`
<div>
	<h3>Attribute</h3>
	<input type="checkbox" data-bind=hide:.checked>
	<label data-bind=hidden:@hidden>Hidden</label>
	<div data-bind=hidden:@hidden>This is hidden, too.</div>
</div>

<div data-bind=motion:!mousemove>
	<h3>Events</h3>
	<label>(mousemove)</label>
	<div data-bind=coordinates:§> </div>
</div>

<div>
	<h3>Method</h3>
	<label>(dialog.showModal)</label>
	<button type="button" data-bind=show:!click>Show</button>
	<dialog data-bind=showDialog:showModal();closeDialog:close()>
		<button type="button" data-bind=close:!click>Close</button>
	</dialog>
</div>

<div class=jump>
	<h3>Node</h3>
	<button type="button" data-bind=jump:!click>Jump</button>
	<div data-bind=a:*>A</div>
	<div data-bind=b:*>B</div>
	<div data-bind=c:*>C</div>
</div>

<div>
	<h3>Property</h3>
	<label>(input.value)</label></br>
	<input type="text" data-bind=inputText:.value>
	<div>You typed:
		<input type="text" disabled data-bind=outputText:.value>
	</div>
</div>

<div>
	<h3>Text</h3>
	<label>(from input above)</label></br>
	<div>You typed: <span data-bind=outputText:§> </span></div>
</div>
`;

const style = /* css */`
	.BindingTypes > div {margin: .5rem;}
	.BindingTypes .jump div {
		border: 1px solid #ccc;
		margin: .2rem;
	}
`;

addClass(class BindingTypes {
	set hide(bool) {this.hidden = bool;}

	set motion({clientX, clientY}) {
		this.coordinates = `x/y: ${clientX}/${clientY}`;
	}

	set show( s) {this.showDialog( );}
	set close(c) {this.closeDialog();}

	set jump(j) {
		if(this.a[0].contains(this.c[0])) this.b[0].appendChild(this.c[0]);
		else                              this.a[0].appendChild(this.c[0]);
		// Note: the bound nodes are Quary-Arrays. Thus the above could als be
		// written like this (yes, the if-condition is not more helpful ...):
		// if(this.a.call('contains', this.c[0])[0]) this.b.append(this.c);
		// else                                      this.a.append(this.c);
	}

	set inputText(t) {this.outputText = t;}
}, {style, template});
