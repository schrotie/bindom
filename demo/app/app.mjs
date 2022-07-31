import {addClass} from '../../bindom.mjs';

import './BindingTypes.mjs';
import './ConditionalRendering.mjs';
import './LoopedRendering.mjs';
import './Nav.mjs';
import './ScopedBinding.mjs';
import './UnifiedEventHandling.mjs';

const template = /* html */`
<bind-dom data-class=Nav data-bind=^pageChange:!page></bind-dom>
<bind-dom data-class     data-bind=^page:@data-class></bind-dom>
`;

const style = /* css */`
	.AppDemo {
		display: flex;
		gap: 2rem;
	}
	.AppDemo > :first-child {flex: 0 0 14rem;}
	.AppDemo > :last-child  {flex: 1 1 auto;}
`;

addClass(class AppDemo {
	// In a real-world scenario, you'd probably do this through your state
	// manager, not by propagating events through the DOM!
	set pageChange({detail}) {this.page = detail;}
}, {style, template});
