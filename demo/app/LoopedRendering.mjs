import {addClass} from '../../bindom.mjs';

const template = /* html */`
<table>
	<p>FPS: <span data-bind=fps:§> </span></p>
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
	constructor() {
		this.count = 0;
		this.rendered = this.now;
		this.render();
	}

	get now() {return Math.floor(Date.now() / 1000);}

	render() {
		this.countFps();
		this.content = (new Array(60)).fill(0).map(() => ({
			a: Math.random(),
			b: Math.random(),
			c: Math.random(),
		}));
		if(!this.die) setTimeout(() => this.render());
	}

	countFps() {
		const now = this.now;
		if(now > this.rendered) {
			this.fps = this.count;
			this.count = 0;
		}
		this.rendered = now;
		this.count++;
	}

	set unbound(u) {if(this.unbound !== 'LoopedRendering') this.die = true;}
}, {template, bindHost: 'unbound:@data-class'});
