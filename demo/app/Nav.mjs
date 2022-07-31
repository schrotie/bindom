import {addClass} from '../../bindom.mjs';

const template = /* html */`
<ul data-bind=selectedPage:!click>
	<template is=loop-dom data-bind=^pages:.array>
		<li data-bind=page:@data-page;active:@data-active;label:§> </li>
	</template>
</ul>
`;

const style = /* css */`
	.Nav li {cursor: pointer;}
	.Nav li[data-active] {font-weight: bold;}
`;

addClass(class Nav {
	constructor() {
		const conditional = `Conditional Rendering & dynamic binding`;
		const unified = `Unified Event Handling & Full DOM Access`;
		this.pages = [
			{page: 'BindingTypes',         label: 'Binding Types'},
			{page: 'ConditionalRendering', label: conditional},
			{page: 'LoopedRendering',      label: 'Looped Rendering'},
			{page: 'ScopedBinding',        label: 'Scoped Binding'},
			{page: 'UnifiedEventHandling', label: unified},
		];
	}

	set selectedPage({target: {dataset: {page}}}) {
		if(!page) return;
		const p = page;
		this.pages = this.pages.map(
			({page, label}) => ({page, label, active: page === p}),
		);
		this.page = new CustomEvent('page', {detail: page});
	}
}, {style, template, bindHost: 'page:!page'});
