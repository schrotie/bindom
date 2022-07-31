import {addClass} from '../../bindom.mjs';

// Note how I don't add templates for the nested scopes. I could put the nested
// scope's DOM into templates and the behavior would be identical. I think, this
// is easier to read for this demonstration and also shows, that templates are
// optional.
const template = /* html */`
<bind-dom
	data-class=ScopeA
	data-bind=^childBound:!bound;^childScope:.proxy
>
	ScopeA localScope:  <span data-bind=localScope:§>  </span>
	       parentScope: <span data-bind=parentScope:§> </span>
	<bind-dom
		data-class=ScopeB
		data-bind=^childBound:!bound;^childScope:.proxy
	>
		ScopeB localScope: <span data-bind=localScope:§>  </span>
		      parentScope: <span data-bind=parentScope:§> </span>
		<bind-dom
			data-class=ScopeC
			data-bind=^childBound:!bound;^childScope:.proxy
		>
			ScopeC localScope: <span data-bind=localScope:§>  </span>
			      parentScope: <span data-bind=parentScope:§> </span>
		</bind-dom>
	</bind-dom>
</bind-dom>
`;

const style = /* css */`.ScopedBinding bind-dom {display: block;}`;

addClass(class ScopedBinding {
	constructor() {this.localScope = '0';}
	set childBound(s) {this.childScope.parentScope = this.localScope;}
}, {style, template});

addClass(class ScopeA {
	constructor() {this.localScope = 'A';}
	set childBound(s) {this.childScope.parentScope = this.localScope;}
});

addClass(class ScopeB {
	constructor() {this.localScope = 'B';}
	set childBound(s) {this.childScope.parentScope = this.localScope;}
});

addClass(class ScopeC {
	constructor() {this.localScope = 'C';}
});
