export default function selectBound(nodes) {
	const scoped = nodes.query('[data-class]');
	return nodes.query('[data-bind]').filter(el => {
		for(const s of scoped) {
			if(parentBinding(s, el)) return true;
			if(s ===      el)  return false;
			if(s.contains(el)) return false;
		}
		return true;
	}).concat(nodes.filter(n => n.matches && n.matches('[data-bind]')));
}

function parentBinding(s, el) {
	return (s === el) && /\^[^:]+:/.test(s.getAttribute('data-bind'));
}
