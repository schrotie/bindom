import {addClass} from '../../bindom.mjs';

const template = /* html */`
<table>
	<template is=loop-dom data-bind=^content:.array>
		<tr>
			<td data-bind=a:§> </td>
			<td data-bind=b:§> </td>
			<td data-bind=c:§> </td>
		</tr>
	</template>
</table>
`;

addClass(class LoopedRendering {
	constructor() {this.intervalId = setInterval(this.render.bind(this), 10);}

	render() {
		this.content = (new Array(60)).fill(0).map(() => ({
			a: Math.random(),
			b: Math.random(),
			c: Math.random(),
		}));
	}

	set unbound(u) {clearInterval(this.intervalId);}
}, {template, bindHost: 'unbound:@data-class'});
