
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop$1() {}

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	/** @returns {void} */
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char }
		};
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
	}

	function get_slot_changes(definition, $$scope, dirty, fn) {
		if (definition[2] && fn) {
			const lets = definition[2](fn(dirty));
			if ($$scope.dirty === undefined) {
				return lets;
			}
			if (typeof lets === 'object') {
				const merged = [];
				const len = Math.max($$scope.dirty.length, lets.length);
				for (let i = 0; i < len; i += 1) {
					merged[i] = $$scope.dirty[i] | lets[i];
				}
				return merged;
			}
			return $$scope.dirty | lets;
		}
		return $$scope.dirty;
	}

	/** @returns {void} */
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}

	/** @returns {any[] | -1} */
	function get_all_dirty_from_scope($$scope) {
		if ($$scope.ctx.length > 32) {
			const dirty = [];
			const length = $$scope.ctx.length / 32;
			for (let i = 0; i < length; i++) {
				dirty[i] = -1;
			}
			return dirty;
		}
		return -1;
	}

	/** @returns {{}} */
	function compute_slots(slots) {
		const result = {};
		for (const key in slots) {
			result[key] = true;
		}
		return result;
	}

	function action_destroyer(action_result) {
		return action_result && is_function(action_result.destroy) ? action_result.destroy : noop$1;
	}

	/** @type {typeof globalThis} */
	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: // @ts-ignore Node typings have this
			  global;

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @template {keyof SVGElementTagNameMap} K
	 * @param {K} name
	 * @returns {SVGElement}
	 */
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @returns {(event: any) => any} */
	function prevent_default(fn) {
		return function (event) {
			event.preventDefault();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @returns {(event: any) => any} */
	function stop_propagation(fn) {
		return function (event) {
			event.stopPropagation();
			// @ts-ignore
			return fn.call(this, event);
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}
	/**
	 * List of attributes that should always be set through the attr method,
	 * because updating them through the property setter doesn't work reliably.
	 * In the example of `width`/`height`, the problem is that the setter only
	 * accepts numeric values, but the attribute can also be set to a string like `50%`.
	 * If this list becomes too big, rethink this approach.
	 */
	const always_set_through_set_attribute = ['width', 'height'];

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {{ [x: string]: string }} attributes
	 * @returns {void}
	 */
	function set_attributes(node, attributes) {
		// @ts-ignore
		const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
		for (const key in attributes) {
			if (attributes[key] == null) {
				node.removeAttribute(key);
			} else if (key === 'style') {
				node.style.cssText = attributes[key];
			} else if (key === '__value') {
				/** @type {any} */ (node).value = node[key] = attributes[key];
			} else if (
				descriptors[key] &&
				descriptors[key].set &&
				always_set_through_set_attribute.indexOf(key) === -1
			) {
				node[key] = attributes[key];
			} else {
				attr(node, key, attributes[key]);
			}
		}
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function select_option(select, value, mounting) {
		for (let i = 0; i < select.options.length; i += 1) {
			const option = select.options[i];
			if (option.__value === value) {
				option.selected = true;
				return;
			}
		}
		if (!mounting || value !== undefined) {
			select.selectedIndex = -1; // no option should be selected
		}
	}

	function select_value(select) {
		const selected_option = select.querySelector(':checked');
		return selected_option && selected_option.__value;
	}

	/**
	 * @returns {void} */
	function toggle_class(element, name, toggle) {
		// The `!!` is required because an `undefined` flag means flipping the current state.
		element.classList.toggle(name, !!toggle);
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}

	/**
	 * Schedules a callback to run immediately before the component is updated after any state change.
	 *
	 * The first time the callback runs will be before the initial `onMount`
	 *
	 * https://svelte.dev/docs/svelte#beforeupdate
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function beforeUpdate(fn) {
		get_current_component().$$.before_update.push(fn);
	}

	/**
	 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
	 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
	 * it can be called from an external module).
	 *
	 * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
	 *
	 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
	 *
	 * https://svelte.dev/docs/svelte#onmount
	 * @template T
	 * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
	 * @returns {void}
	 */
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}

	/**
	 * Schedules a callback to run immediately before the component is unmounted.
	 *
	 * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
	 * only one that runs inside a server-side component.
	 *
	 * https://svelte.dev/docs/svelte#ondestroy
	 * @param {() => any} fn
	 * @returns {void}
	 */
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}

	/**
	 * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
	 * Event dispatchers are functions that can take two arguments: `name` and `detail`.
	 *
	 * Component events created with `createEventDispatcher` create a
	 * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
	 * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
	 * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
	 * property and can contain any type of data.
	 *
	 * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
	 * ```ts
	 * const dispatch = createEventDispatcher<{
	 *  loaded: never; // does not take a detail argument
	 *  change: string; // takes a detail argument of type string, which is required
	 *  optional: number | null; // takes an optional detail argument of type number
	 * }>();
	 * ```
	 *
	 * https://svelte.dev/docs/svelte#createeventdispatcher
	 * @template {Record<string, any>} [EventMap=any]
	 * @returns {import('./public.js').EventDispatcher<EventMap>}
	 */
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(/** @type {string} */ (type), detail, { cancelable });
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}

	// TODO figure out if we still want to support
	// shorthand events, or if we want to implement
	// a real bubbling mechanism
	/**
	 * @param component
	 * @param event
	 * @returns {void}
	 */
	function bubble(component, event) {
		const callbacks = component.$$.callbacks[event.type];
		if (callbacks) {
			// @ts-ignore
			callbacks.slice().forEach((fn) => fn.call(this, event));
		}
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {Promise<void>} */
	function tick() {
		schedule_update();
		return resolved_promise;
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	/** @returns {void} */
	function add_flush_callback(fn) {
		flush_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	// keyed each functions:

	/** @returns {void} */
	function destroy_block(block, lookup) {
		block.d(1);
		lookup.delete(block.key);
	}

	/** @returns {any[]} */
	function update_keyed_each(
		old_blocks,
		dirty,
		get_key,
		dynamic,
		ctx,
		list,
		lookup,
		node,
		destroy,
		create_each_block,
		next,
		get_context
	) {
		let o = old_blocks.length;
		let n = list.length;
		let i = o;
		const old_indexes = {};
		while (i--) old_indexes[old_blocks[i].key] = i;
		const new_blocks = [];
		const new_lookup = new Map();
		const deltas = new Map();
		const updates = [];
		i = n;
		while (i--) {
			const child_ctx = get_context(ctx, list, i);
			const key = get_key(child_ctx);
			let block = lookup.get(key);
			if (!block) {
				block = create_each_block(key, child_ctx);
				block.c();
			} else if (dynamic) {
				// defer updates until all the DOM shuffling is done
				updates.push(() => block.p(child_ctx, dirty));
			}
			new_lookup.set(key, (new_blocks[i] = block));
			if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
		}
		const will_move = new Set();
		const did_move = new Set();
		/** @returns {void} */
		function insert(block) {
			transition_in(block, 1);
			block.m(node, next);
			lookup.set(block.key, block);
			next = block.first;
			n--;
		}
		while (o && n) {
			const new_block = new_blocks[n - 1];
			const old_block = old_blocks[o - 1];
			const new_key = new_block.key;
			const old_key = old_block.key;
			if (new_block === old_block) {
				// do nothing
				next = new_block.first;
				o--;
				n--;
			} else if (!new_lookup.has(old_key)) {
				// remove old block
				destroy(old_block, lookup);
				o--;
			} else if (!lookup.has(new_key) || will_move.has(new_key)) {
				insert(new_block);
			} else if (did_move.has(old_key)) {
				o--;
			} else if (deltas.get(new_key) > deltas.get(old_key)) {
				did_move.add(new_key);
				insert(new_block);
			} else {
				will_move.add(old_key);
				o--;
			}
		}
		while (o--) {
			const old_block = old_blocks[o];
			if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
		}
		while (n) insert(new_blocks[n - 1]);
		run_all(updates);
		return new_blocks;
	}

	/** @returns {void} */
	function validate_each_keys(ctx, list, get_context, get_key) {
		const keys = new Map();
		for (let i = 0; i < list.length; i++) {
			const key = get_key(get_context(ctx, list, i));
			if (keys.has(key)) {
				let value = '';
				try {
					value = `with value '${String(key)}' `;
				} catch (e) {
					// can't stringify
				}
				throw new Error(
					`Cannot have duplicate keys in a keyed each: Keys at index ${keys.get(
					key
				)} and ${i} ${value}are duplicates`
				);
			}
			keys.set(key, i);
		}
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	/** @returns {void} */
	function bind(component, name, callback) {
		const index = component.$$.props[name];
		if (index !== undefined) {
			component.$$.bound[index] = callback;
			callback(component.$$.ctx[index]);
		}
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop$1,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop$1;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop$1;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	/**
	 * The current version, as set in package.json.
	 *
	 * https://svelte.dev/docs/svelte-compiler#svelte-version
	 * @type {string}
	 */
	const VERSION = '4.2.9';
	const PUBLIC_VERSION = '4';

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @returns {void}
	 */
	function dispatch_dev(type, detail) {
		document.dispatchEvent(custom_event(type, { version: VERSION, ...detail }, { bubbles: true }));
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}

	/**
	 * @param {Node} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @param {boolean} [has_prevent_default]
	 * @param {boolean} [has_stop_propagation]
	 * @param {boolean} [has_stop_immediate_propagation]
	 * @returns {() => void}
	 */
	function listen_dev(
		node,
		event,
		handler,
		options,
		has_prevent_default,
		has_stop_propagation,
		has_stop_immediate_propagation
	) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		if (has_stop_immediate_propagation) modifiers.push('stopImmediatePropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}

	/**
	 * @param {Element} node
	 * @param {string} property
	 * @param {any} [value]
	 * @returns {void}
	 */
	function prop_dev(node, property, value) {
		node[property] = value;
		dispatch_dev('SvelteDOMSetProperty', { node, property, value });
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.data === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = /** @type {string} */ (data);
	}

	function ensure_array_like_dev(arg) {
		if (
			typeof arg !== 'string' &&
			!(arg && typeof arg === 'object' && 'length' in arg) &&
			!(typeof Symbol === 'function' && arg && Symbol.iterator in arg)
		) {
			throw new Error('{#each} only works with iterable values.');
		}
		return ensure_array_like(arg);
	}

	/**
	 * @returns {void} */
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}

	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 *
	 * Can be used to create strongly typed Svelte components.
	 *
	 * #### Example:
	 *
	 * You have component library on npm called `component-library`, from which
	 * you export a component called `MyComponent`. For Svelte+TypeScript users,
	 * you want to provide typings. Therefore you create a `index.d.ts`:
	 * ```ts
	 * import { SvelteComponent } from "svelte";
	 * export class MyComponent extends SvelteComponent<{foo: string}> {}
	 * ```
	 * Typing this makes it possible for IDEs like VS Code with the Svelte extension
	 * to provide intellisense and to use the component like this in a Svelte file
	 * with TypeScript:
	 * ```svelte
	 * <script lang="ts">
	 * 	import { MyComponent } from "component-library";
	 * </script>
	 * <MyComponent foo={'bar'} />
	 * ```
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 * @template {Record<string, any>} [Slots=any]
	 * @extends {SvelteComponent<Props, Events>}
	 */
	class SvelteComponentDev extends SvelteComponent {
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Props}
		 */
		$$prop_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Events}
		 */
		$$events_def;
		/**
		 * For type checking capabilities only.
		 * Does not exist at runtime.
		 * ### DO NOT USE!
		 *
		 * @type {Slots}
		 */
		$$slot_def;

		/** @param {import('./public.js').ComponentConstructorOptions<Props>} options */
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}

		/** @returns {void} */
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}

		/** @returns {void} */
		$capture_state() {}

		/** @returns {void} */
		$inject_state() {}
	}

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	var Events = /** @class */ (function () {
	    function Events(eventType, eventFunctions) {
	        if (eventFunctions === void 0) { eventFunctions = []; }
	        this._eventType = eventType;
	        this._eventFunctions = eventFunctions;
	    }
	    Events.prototype.init = function () {
	        var _this = this;
	        this._eventFunctions.forEach(function (eventFunction) {
	            if (typeof window !== 'undefined') {
	                window.addEventListener(_this._eventType, eventFunction);
	            }
	        });
	    };
	    return Events;
	}());

	var Instances = /** @class */ (function () {
	    function Instances() {
	        this._instances = {
	            Accordion: {},
	            Carousel: {},
	            Collapse: {},
	            Dial: {},
	            Dismiss: {},
	            Drawer: {},
	            Dropdown: {},
	            Modal: {},
	            Popover: {},
	            Tabs: {},
	            Tooltip: {},
	            InputCounter: {},
	        };
	    }
	    Instances.prototype.addInstance = function (component, instance, id, override) {
	        if (override === void 0) { override = false; }
	        if (!this._instances[component]) {
	            console.warn("Flowbite: Component ".concat(component, " does not exist."));
	            return false;
	        }
	        if (this._instances[component][id] && !override) {
	            console.warn("Flowbite: Instance with ID ".concat(id, " already exists."));
	            return;
	        }
	        if (override && this._instances[component][id]) {
	            this._instances[component][id].destroyAndRemoveInstance();
	        }
	        this._instances[component][id ? id : this._generateRandomId()] =
	            instance;
	    };
	    Instances.prototype.getAllInstances = function () {
	        return this._instances;
	    };
	    Instances.prototype.getInstances = function (component) {
	        if (!this._instances[component]) {
	            console.warn("Flowbite: Component ".concat(component, " does not exist."));
	            return false;
	        }
	        return this._instances[component];
	    };
	    Instances.prototype.getInstance = function (component, id) {
	        if (!this._componentAndInstanceCheck(component, id)) {
	            return;
	        }
	        if (!this._instances[component][id]) {
	            console.warn("Flowbite: Instance with ID ".concat(id, " does not exist."));
	            return;
	        }
	        return this._instances[component][id];
	    };
	    Instances.prototype.destroyAndRemoveInstance = function (component, id) {
	        if (!this._componentAndInstanceCheck(component, id)) {
	            return;
	        }
	        this.destroyInstanceObject(component, id);
	        this.removeInstance(component, id);
	    };
	    Instances.prototype.removeInstance = function (component, id) {
	        if (!this._componentAndInstanceCheck(component, id)) {
	            return;
	        }
	        delete this._instances[component][id];
	    };
	    Instances.prototype.destroyInstanceObject = function (component, id) {
	        if (!this._componentAndInstanceCheck(component, id)) {
	            return;
	        }
	        this._instances[component][id].destroy();
	    };
	    Instances.prototype.instanceExists = function (component, id) {
	        if (!this._instances[component]) {
	            return false;
	        }
	        if (!this._instances[component][id]) {
	            return false;
	        }
	        return true;
	    };
	    Instances.prototype._generateRandomId = function () {
	        return Math.random().toString(36).substr(2, 9);
	    };
	    Instances.prototype._componentAndInstanceCheck = function (component, id) {
	        if (!this._instances[component]) {
	            console.warn("Flowbite: Component ".concat(component, " does not exist."));
	            return false;
	        }
	        if (!this._instances[component][id]) {
	            console.warn("Flowbite: Instance with ID ".concat(id, " does not exist."));
	            return false;
	        }
	        return true;
	    };
	    return Instances;
	}());
	var instances$1 = new Instances();
	if (typeof window !== 'undefined') {
	    window.FlowbiteInstances = instances$1;
	}

	var __assign$b = (undefined && undefined.__assign) || function () {
	    __assign$b = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$b.apply(this, arguments);
	};
	var Default$b = {
	    alwaysOpen: false,
	    activeClasses: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white',
	    inactiveClasses: 'text-gray-500 dark:text-gray-400',
	    onOpen: function () { },
	    onClose: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$b = {
	    id: null,
	    override: true,
	};
	var Accordion = /** @class */ (function () {
	    function Accordion(accordionEl, items, options, instanceOptions) {
	        if (accordionEl === void 0) { accordionEl = null; }
	        if (items === void 0) { items = []; }
	        if (options === void 0) { options = Default$b; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$b; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : accordionEl.id;
	        this._accordionEl = accordionEl;
	        this._items = items;
	        this._options = __assign$b(__assign$b({}, Default$b), options);
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Accordion', this, this._instanceId, instanceOptions.override);
	    }
	    Accordion.prototype.init = function () {
	        var _this = this;
	        if (this._items.length && !this._initialized) {
	            // show accordion item based on click
	            this._items.forEach(function (item) {
	                if (item.active) {
	                    _this.open(item.id);
	                }
	                var clickHandler = function () {
	                    _this.toggle(item.id);
	                };
	                item.triggerEl.addEventListener('click', clickHandler);
	                // Store the clickHandler in a property of the item for removal later
	                item.clickHandler = clickHandler;
	            });
	            this._initialized = true;
	        }
	    };
	    Accordion.prototype.destroy = function () {
	        if (this._items.length && this._initialized) {
	            this._items.forEach(function (item) {
	                item.triggerEl.removeEventListener('click', item.clickHandler);
	                // Clean up by deleting the clickHandler property from the item
	                delete item.clickHandler;
	            });
	            this._initialized = false;
	        }
	    };
	    Accordion.prototype.removeInstance = function () {
	        instances$1.removeInstance('Accordion', this._instanceId);
	    };
	    Accordion.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Accordion.prototype.getItem = function (id) {
	        return this._items.filter(function (item) { return item.id === id; })[0];
	    };
	    Accordion.prototype.open = function (id) {
	        var _a, _b;
	        var _this = this;
	        var item = this.getItem(id);
	        // don't hide other accordions if always open
	        if (!this._options.alwaysOpen) {
	            this._items.map(function (i) {
	                var _a, _b;
	                if (i !== item) {
	                    (_a = i.triggerEl.classList).remove.apply(_a, _this._options.activeClasses.split(' '));
	                    (_b = i.triggerEl.classList).add.apply(_b, _this._options.inactiveClasses.split(' '));
	                    i.targetEl.classList.add('hidden');
	                    i.triggerEl.setAttribute('aria-expanded', 'false');
	                    i.active = false;
	                    // rotate icon if set
	                    if (i.iconEl) {
	                        i.iconEl.classList.remove('rotate-180');
	                    }
	                }
	            });
	        }
	        // show active item
	        (_a = item.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(' '));
	        (_b = item.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(' '));
	        item.triggerEl.setAttribute('aria-expanded', 'true');
	        item.targetEl.classList.remove('hidden');
	        item.active = true;
	        // rotate icon if set
	        if (item.iconEl) {
	            item.iconEl.classList.add('rotate-180');
	        }
	        // callback function
	        this._options.onOpen(this, item);
	    };
	    Accordion.prototype.toggle = function (id) {
	        var item = this.getItem(id);
	        if (item.active) {
	            this.close(id);
	        }
	        else {
	            this.open(id);
	        }
	        // callback function
	        this._options.onToggle(this, item);
	    };
	    Accordion.prototype.close = function (id) {
	        var _a, _b;
	        var item = this.getItem(id);
	        (_a = item.triggerEl.classList).remove.apply(_a, this._options.activeClasses.split(' '));
	        (_b = item.triggerEl.classList).add.apply(_b, this._options.inactiveClasses.split(' '));
	        item.targetEl.classList.add('hidden');
	        item.triggerEl.setAttribute('aria-expanded', 'false');
	        item.active = false;
	        // rotate icon if set
	        if (item.iconEl) {
	            item.iconEl.classList.remove('rotate-180');
	        }
	        // callback function
	        this._options.onClose(this, item);
	    };
	    return Accordion;
	}());
	function initAccordions() {
	    document.querySelectorAll('[data-accordion]').forEach(function ($accordionEl) {
	        var alwaysOpen = $accordionEl.getAttribute('data-accordion');
	        var activeClasses = $accordionEl.getAttribute('data-active-classes');
	        var inactiveClasses = $accordionEl.getAttribute('data-inactive-classes');
	        var items = [];
	        $accordionEl
	            .querySelectorAll('[data-accordion-target]')
	            .forEach(function ($triggerEl) {
	            // Consider only items that directly belong to $accordionEl
	            // (to make nested accordions work).
	            if ($triggerEl.closest('[data-accordion]') === $accordionEl) {
	                var item = {
	                    id: $triggerEl.getAttribute('data-accordion-target'),
	                    triggerEl: $triggerEl,
	                    targetEl: document.querySelector($triggerEl.getAttribute('data-accordion-target')),
	                    iconEl: $triggerEl.querySelector('[data-accordion-icon]'),
	                    active: $triggerEl.getAttribute('aria-expanded') === 'true'
	                        ? true
	                        : false,
	                };
	                items.push(item);
	            }
	        });
	        new Accordion($accordionEl, items, {
	            alwaysOpen: alwaysOpen === 'open' ? true : false,
	            activeClasses: activeClasses
	                ? activeClasses
	                : Default$b.activeClasses,
	            inactiveClasses: inactiveClasses
	                ? inactiveClasses
	                : Default$b.inactiveClasses,
	        });
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Accordion = Accordion;
	    window.initAccordions = initAccordions;
	}

	var __assign$a = (undefined && undefined.__assign) || function () {
	    __assign$a = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$a.apply(this, arguments);
	};
	var Default$a = {
	    onCollapse: function () { },
	    onExpand: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$a = {
	    id: null,
	    override: true,
	};
	var Collapse = /** @class */ (function () {
	    function Collapse(targetEl, triggerEl, options, instanceOptions) {
	        if (targetEl === void 0) { targetEl = null; }
	        if (triggerEl === void 0) { triggerEl = null; }
	        if (options === void 0) { options = Default$a; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$a; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._targetEl = targetEl;
	        this._triggerEl = triggerEl;
	        this._options = __assign$a(__assign$a({}, Default$a), options);
	        this._visible = false;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Collapse', this, this._instanceId, instanceOptions.override);
	    }
	    Collapse.prototype.init = function () {
	        var _this = this;
	        if (this._triggerEl && this._targetEl && !this._initialized) {
	            if (this._triggerEl.hasAttribute('aria-expanded')) {
	                this._visible =
	                    this._triggerEl.getAttribute('aria-expanded') === 'true';
	            }
	            else {
	                // fix until v2 not to break previous single collapses which became dismiss
	                this._visible = !this._targetEl.classList.contains('hidden');
	            }
	            this._clickHandler = function () {
	                _this.toggle();
	            };
	            this._triggerEl.addEventListener('click', this._clickHandler);
	            this._initialized = true;
	        }
	    };
	    Collapse.prototype.destroy = function () {
	        if (this._triggerEl && this._initialized) {
	            this._triggerEl.removeEventListener('click', this._clickHandler);
	            this._initialized = false;
	        }
	    };
	    Collapse.prototype.removeInstance = function () {
	        instances$1.removeInstance('Collapse', this._instanceId);
	    };
	    Collapse.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Collapse.prototype.collapse = function () {
	        this._targetEl.classList.add('hidden');
	        if (this._triggerEl) {
	            this._triggerEl.setAttribute('aria-expanded', 'false');
	        }
	        this._visible = false;
	        // callback function
	        this._options.onCollapse(this);
	    };
	    Collapse.prototype.expand = function () {
	        this._targetEl.classList.remove('hidden');
	        if (this._triggerEl) {
	            this._triggerEl.setAttribute('aria-expanded', 'true');
	        }
	        this._visible = true;
	        // callback function
	        this._options.onExpand(this);
	    };
	    Collapse.prototype.toggle = function () {
	        if (this._visible) {
	            this.collapse();
	        }
	        else {
	            this.expand();
	        }
	        // callback function
	        this._options.onToggle(this);
	    };
	    return Collapse;
	}());
	function initCollapses() {
	    document
	        .querySelectorAll('[data-collapse-toggle]')
	        .forEach(function ($triggerEl) {
	        var targetId = $triggerEl.getAttribute('data-collapse-toggle');
	        var $targetEl = document.getElementById(targetId);
	        // check if the target element exists
	        if ($targetEl) {
	            if (!instances$1.instanceExists('Collapse', $targetEl.getAttribute('id'))) {
	                new Collapse($targetEl, $triggerEl);
	            }
	            else {
	                // if instance exists already for the same target element then create a new one with a different trigger element
	                new Collapse($targetEl, $triggerEl, {}, {
	                    id: $targetEl.getAttribute('id') +
	                        '_' +
	                        instances$1._generateRandomId(),
	                });
	            }
	        }
	        else {
	            console.error("The target element with id \"".concat(targetId, "\" does not exist. Please check the data-collapse-toggle attribute."));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Collapse = Collapse;
	    window.initCollapses = initCollapses;
	}

	var __assign$9 = (undefined && undefined.__assign) || function () {
	    __assign$9 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$9.apply(this, arguments);
	};
	var Default$9 = {
	    defaultPosition: 0,
	    indicators: {
	        items: [],
	        activeClasses: 'bg-white dark:bg-gray-800',
	        inactiveClasses: 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800',
	    },
	    interval: 3000,
	    onNext: function () { },
	    onPrev: function () { },
	    onChange: function () { },
	};
	var DefaultInstanceOptions$9 = {
	    id: null,
	    override: true,
	};
	var Carousel = /** @class */ (function () {
	    function Carousel(carouselEl, items, options, instanceOptions) {
	        if (carouselEl === void 0) { carouselEl = null; }
	        if (items === void 0) { items = []; }
	        if (options === void 0) { options = Default$9; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$9; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : carouselEl.id;
	        this._carouselEl = carouselEl;
	        this._items = items;
	        this._options = __assign$9(__assign$9(__assign$9({}, Default$9), options), { indicators: __assign$9(__assign$9({}, Default$9.indicators), options.indicators) });
	        this._activeItem = this.getItem(this._options.defaultPosition);
	        this._indicators = this._options.indicators.items;
	        this._intervalDuration = this._options.interval;
	        this._intervalInstance = null;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Carousel', this, this._instanceId, instanceOptions.override);
	    }
	    /**
	     * initialize carousel and items based on active one
	     */
	    Carousel.prototype.init = function () {
	        var _this = this;
	        if (this._items.length && !this._initialized) {
	            this._items.map(function (item) {
	                item.el.classList.add('absolute', 'inset-0', 'transition-transform', 'transform');
	            });
	            // if no active item is set then first position is default
	            if (this._getActiveItem()) {
	                this.slideTo(this._getActiveItem().position);
	            }
	            else {
	                this.slideTo(0);
	            }
	            this._indicators.map(function (indicator, position) {
	                indicator.el.addEventListener('click', function () {
	                    _this.slideTo(position);
	                });
	            });
	            this._initialized = true;
	        }
	    };
	    Carousel.prototype.destroy = function () {
	        if (this._initialized) {
	            this._initialized = false;
	        }
	    };
	    Carousel.prototype.removeInstance = function () {
	        instances$1.removeInstance('Carousel', this._instanceId);
	    };
	    Carousel.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Carousel.prototype.getItem = function (position) {
	        return this._items[position];
	    };
	    /**
	     * Slide to the element based on id
	     * @param {*} position
	     */
	    Carousel.prototype.slideTo = function (position) {
	        var nextItem = this._items[position];
	        var rotationItems = {
	            left: nextItem.position === 0
	                ? this._items[this._items.length - 1]
	                : this._items[nextItem.position - 1],
	            middle: nextItem,
	            right: nextItem.position === this._items.length - 1
	                ? this._items[0]
	                : this._items[nextItem.position + 1],
	        };
	        this._rotate(rotationItems);
	        this._setActiveItem(nextItem);
	        if (this._intervalInstance) {
	            this.pause();
	            this.cycle();
	        }
	        this._options.onChange(this);
	    };
	    /**
	     * Based on the currently active item it will go to the next position
	     */
	    Carousel.prototype.next = function () {
	        var activeItem = this._getActiveItem();
	        var nextItem = null;
	        // check if last item
	        if (activeItem.position === this._items.length - 1) {
	            nextItem = this._items[0];
	        }
	        else {
	            nextItem = this._items[activeItem.position + 1];
	        }
	        this.slideTo(nextItem.position);
	        // callback function
	        this._options.onNext(this);
	    };
	    /**
	     * Based on the currently active item it will go to the previous position
	     */
	    Carousel.prototype.prev = function () {
	        var activeItem = this._getActiveItem();
	        var prevItem = null;
	        // check if first item
	        if (activeItem.position === 0) {
	            prevItem = this._items[this._items.length - 1];
	        }
	        else {
	            prevItem = this._items[activeItem.position - 1];
	        }
	        this.slideTo(prevItem.position);
	        // callback function
	        this._options.onPrev(this);
	    };
	    /**
	     * This method applies the transform classes based on the left, middle, and right rotation carousel items
	     * @param {*} rotationItems
	     */
	    Carousel.prototype._rotate = function (rotationItems) {
	        // reset
	        this._items.map(function (item) {
	            item.el.classList.add('hidden');
	        });
	        // left item (previously active)
	        rotationItems.left.el.classList.remove('-translate-x-full', 'translate-x-full', 'translate-x-0', 'hidden', 'z-20');
	        rotationItems.left.el.classList.add('-translate-x-full', 'z-10');
	        // currently active item
	        rotationItems.middle.el.classList.remove('-translate-x-full', 'translate-x-full', 'translate-x-0', 'hidden', 'z-10');
	        rotationItems.middle.el.classList.add('translate-x-0', 'z-20');
	        // right item (upcoming active)
	        rotationItems.right.el.classList.remove('-translate-x-full', 'translate-x-full', 'translate-x-0', 'hidden', 'z-20');
	        rotationItems.right.el.classList.add('translate-x-full', 'z-10');
	    };
	    /**
	     * Set an interval to cycle through the carousel items
	     */
	    Carousel.prototype.cycle = function () {
	        var _this = this;
	        if (typeof window !== 'undefined') {
	            this._intervalInstance = window.setInterval(function () {
	                _this.next();
	            }, this._intervalDuration);
	        }
	    };
	    /**
	     * Clears the cycling interval
	     */
	    Carousel.prototype.pause = function () {
	        clearInterval(this._intervalInstance);
	    };
	    /**
	     * Get the currently active item
	     */
	    Carousel.prototype._getActiveItem = function () {
	        return this._activeItem;
	    };
	    /**
	     * Set the currently active item and data attribute
	     * @param {*} position
	     */
	    Carousel.prototype._setActiveItem = function (item) {
	        var _a, _b;
	        var _this = this;
	        this._activeItem = item;
	        var position = item.position;
	        // update the indicators if available
	        if (this._indicators.length) {
	            this._indicators.map(function (indicator) {
	                var _a, _b;
	                indicator.el.setAttribute('aria-current', 'false');
	                (_a = indicator.el.classList).remove.apply(_a, _this._options.indicators.activeClasses.split(' '));
	                (_b = indicator.el.classList).add.apply(_b, _this._options.indicators.inactiveClasses.split(' '));
	            });
	            (_a = this._indicators[position].el.classList).add.apply(_a, this._options.indicators.activeClasses.split(' '));
	            (_b = this._indicators[position].el.classList).remove.apply(_b, this._options.indicators.inactiveClasses.split(' '));
	            this._indicators[position].el.setAttribute('aria-current', 'true');
	        }
	    };
	    return Carousel;
	}());
	function initCarousels() {
	    document.querySelectorAll('[data-carousel]').forEach(function ($carouselEl) {
	        var interval = $carouselEl.getAttribute('data-carousel-interval');
	        var slide = $carouselEl.getAttribute('data-carousel') === 'slide'
	            ? true
	            : false;
	        var items = [];
	        var defaultPosition = 0;
	        if ($carouselEl.querySelectorAll('[data-carousel-item]').length) {
	            Array.from($carouselEl.querySelectorAll('[data-carousel-item]')).map(function ($carouselItemEl, position) {
	                items.push({
	                    position: position,
	                    el: $carouselItemEl,
	                });
	                if ($carouselItemEl.getAttribute('data-carousel-item') ===
	                    'active') {
	                    defaultPosition = position;
	                }
	            });
	        }
	        var indicators = [];
	        if ($carouselEl.querySelectorAll('[data-carousel-slide-to]').length) {
	            Array.from($carouselEl.querySelectorAll('[data-carousel-slide-to]')).map(function ($indicatorEl) {
	                indicators.push({
	                    position: parseInt($indicatorEl.getAttribute('data-carousel-slide-to')),
	                    el: $indicatorEl,
	                });
	            });
	        }
	        var carousel = new Carousel($carouselEl, items, {
	            defaultPosition: defaultPosition,
	            indicators: {
	                items: indicators,
	            },
	            interval: interval ? interval : Default$9.interval,
	        });
	        if (slide) {
	            carousel.cycle();
	        }
	        // check for controls
	        var carouselNextEl = $carouselEl.querySelector('[data-carousel-next]');
	        var carouselPrevEl = $carouselEl.querySelector('[data-carousel-prev]');
	        if (carouselNextEl) {
	            carouselNextEl.addEventListener('click', function () {
	                carousel.next();
	            });
	        }
	        if (carouselPrevEl) {
	            carouselPrevEl.addEventListener('click', function () {
	                carousel.prev();
	            });
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Carousel = Carousel;
	    window.initCarousels = initCarousels;
	}

	var __assign$8 = (undefined && undefined.__assign) || function () {
	    __assign$8 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$8.apply(this, arguments);
	};
	var Default$8 = {
	    transition: 'transition-opacity',
	    duration: 300,
	    timing: 'ease-out',
	    onHide: function () { },
	};
	var DefaultInstanceOptions$8 = {
	    id: null,
	    override: true,
	};
	var Dismiss = /** @class */ (function () {
	    function Dismiss(targetEl, triggerEl, options, instanceOptions) {
	        if (targetEl === void 0) { targetEl = null; }
	        if (triggerEl === void 0) { triggerEl = null; }
	        if (options === void 0) { options = Default$8; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$8; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._targetEl = targetEl;
	        this._triggerEl = triggerEl;
	        this._options = __assign$8(__assign$8({}, Default$8), options);
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Dismiss', this, this._instanceId, instanceOptions.override);
	    }
	    Dismiss.prototype.init = function () {
	        var _this = this;
	        if (this._triggerEl && this._targetEl && !this._initialized) {
	            this._clickHandler = function () {
	                _this.hide();
	            };
	            this._triggerEl.addEventListener('click', this._clickHandler);
	            this._initialized = true;
	        }
	    };
	    Dismiss.prototype.destroy = function () {
	        if (this._triggerEl && this._initialized) {
	            this._triggerEl.removeEventListener('click', this._clickHandler);
	            this._initialized = false;
	        }
	    };
	    Dismiss.prototype.removeInstance = function () {
	        instances$1.removeInstance('Dismiss', this._instanceId);
	    };
	    Dismiss.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Dismiss.prototype.hide = function () {
	        var _this = this;
	        this._targetEl.classList.add(this._options.transition, "duration-".concat(this._options.duration), this._options.timing, 'opacity-0');
	        setTimeout(function () {
	            _this._targetEl.classList.add('hidden');
	        }, this._options.duration);
	        // callback function
	        this._options.onHide(this, this._targetEl);
	    };
	    return Dismiss;
	}());
	function initDismisses() {
	    document.querySelectorAll('[data-dismiss-target]').forEach(function ($triggerEl) {
	        var targetId = $triggerEl.getAttribute('data-dismiss-target');
	        var $dismissEl = document.querySelector(targetId);
	        if ($dismissEl) {
	            new Dismiss($dismissEl, $triggerEl);
	        }
	        else {
	            console.error("The dismiss element with id \"".concat(targetId, "\" does not exist. Please check the data-dismiss-target attribute."));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Dismiss = Dismiss;
	    window.initDismisses = initDismisses;
	}

	var top = 'top';
	var bottom = 'bottom';
	var right = 'right';
	var left = 'left';
	var auto = 'auto';
	var basePlacements = [top, bottom, right, left];
	var start = 'start';
	var end = 'end';
	var clippingParents = 'clippingParents';
	var viewport = 'viewport';
	var popper = 'popper';
	var reference = 'reference';
	var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
	  return acc.concat([placement + "-" + start, placement + "-" + end]);
	}, []);
	var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
	  return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
	}, []); // modifiers that need to read the DOM

	var beforeRead = 'beforeRead';
	var read = 'read';
	var afterRead = 'afterRead'; // pure-logic modifiers

	var beforeMain = 'beforeMain';
	var main = 'main';
	var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)

	var beforeWrite = 'beforeWrite';
	var write = 'write';
	var afterWrite = 'afterWrite';
	var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

	function getNodeName$1(element) {
	  return element ? (element.nodeName || '').toLowerCase() : null;
	}

	function getWindow$1(node) {
	  if (node == null) {
	    return window;
	  }

	  if (node.toString() !== '[object Window]') {
	    var ownerDocument = node.ownerDocument;
	    return ownerDocument ? ownerDocument.defaultView || window : window;
	  }

	  return node;
	}

	function isElement$1(node) {
	  var OwnElement = getWindow$1(node).Element;
	  return node instanceof OwnElement || node instanceof Element;
	}

	function isHTMLElement$1(node) {
	  var OwnElement = getWindow$1(node).HTMLElement;
	  return node instanceof OwnElement || node instanceof HTMLElement;
	}

	function isShadowRoot$1(node) {
	  // IE 11 has no ShadowRoot
	  if (typeof ShadowRoot === 'undefined') {
	    return false;
	  }

	  var OwnElement = getWindow$1(node).ShadowRoot;
	  return node instanceof OwnElement || node instanceof ShadowRoot;
	}

	// and applies them to the HTMLElements such as popper and arrow

	function applyStyles(_ref) {
	  var state = _ref.state;
	  Object.keys(state.elements).forEach(function (name) {
	    var style = state.styles[name] || {};
	    var attributes = state.attributes[name] || {};
	    var element = state.elements[name]; // arrow is optional + virtual elements

	    if (!isHTMLElement$1(element) || !getNodeName$1(element)) {
	      return;
	    } // Flow doesn't support to extend this property, but it's the most
	    // effective way to apply styles to an HTMLElement
	    // $FlowFixMe[cannot-write]


	    Object.assign(element.style, style);
	    Object.keys(attributes).forEach(function (name) {
	      var value = attributes[name];

	      if (value === false) {
	        element.removeAttribute(name);
	      } else {
	        element.setAttribute(name, value === true ? '' : value);
	      }
	    });
	  });
	}

	function effect$2(_ref2) {
	  var state = _ref2.state;
	  var initialStyles = {
	    popper: {
	      position: state.options.strategy,
	      left: '0',
	      top: '0',
	      margin: '0'
	    },
	    arrow: {
	      position: 'absolute'
	    },
	    reference: {}
	  };
	  Object.assign(state.elements.popper.style, initialStyles.popper);
	  state.styles = initialStyles;

	  if (state.elements.arrow) {
	    Object.assign(state.elements.arrow.style, initialStyles.arrow);
	  }

	  return function () {
	    Object.keys(state.elements).forEach(function (name) {
	      var element = state.elements[name];
	      var attributes = state.attributes[name] || {};
	      var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them

	      var style = styleProperties.reduce(function (style, property) {
	        style[property] = '';
	        return style;
	      }, {}); // arrow is optional + virtual elements

	      if (!isHTMLElement$1(element) || !getNodeName$1(element)) {
	        return;
	      }

	      Object.assign(element.style, style);
	      Object.keys(attributes).forEach(function (attribute) {
	        element.removeAttribute(attribute);
	      });
	    });
	  };
	} // eslint-disable-next-line import/no-unused-modules


	var applyStyles$1 = {
	  name: 'applyStyles',
	  enabled: true,
	  phase: 'write',
	  fn: applyStyles,
	  effect: effect$2,
	  requires: ['computeStyles']
	};

	function getBasePlacement(placement) {
	  return placement.split('-')[0];
	}

	var max$1 = Math.max;
	var min$1 = Math.min;
	var round$2 = Math.round;

	function getUAString() {
	  var uaData = navigator.userAgentData;

	  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
	    return uaData.brands.map(function (item) {
	      return item.brand + "/" + item.version;
	    }).join(' ');
	  }

	  return navigator.userAgent;
	}

	function isLayoutViewport() {
	  return !/^((?!chrome|android).)*safari/i.test(getUAString());
	}

	function getBoundingClientRect$1(element, includeScale, isFixedStrategy) {
	  if (includeScale === void 0) {
	    includeScale = false;
	  }

	  if (isFixedStrategy === void 0) {
	    isFixedStrategy = false;
	  }

	  var clientRect = element.getBoundingClientRect();
	  var scaleX = 1;
	  var scaleY = 1;

	  if (includeScale && isHTMLElement$1(element)) {
	    scaleX = element.offsetWidth > 0 ? round$2(clientRect.width) / element.offsetWidth || 1 : 1;
	    scaleY = element.offsetHeight > 0 ? round$2(clientRect.height) / element.offsetHeight || 1 : 1;
	  }

	  var _ref = isElement$1(element) ? getWindow$1(element) : window,
	      visualViewport = _ref.visualViewport;

	  var addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
	  var x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
	  var y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
	  var width = clientRect.width / scaleX;
	  var height = clientRect.height / scaleY;
	  return {
	    width: width,
	    height: height,
	    top: y,
	    right: x + width,
	    bottom: y + height,
	    left: x,
	    x: x,
	    y: y
	  };
	}

	// means it doesn't take into account transforms.

	function getLayoutRect(element) {
	  var clientRect = getBoundingClientRect$1(element); // Use the clientRect sizes if it's not been transformed.
	  // Fixes https://github.com/popperjs/popper-core/issues/1223

	  var width = element.offsetWidth;
	  var height = element.offsetHeight;

	  if (Math.abs(clientRect.width - width) <= 1) {
	    width = clientRect.width;
	  }

	  if (Math.abs(clientRect.height - height) <= 1) {
	    height = clientRect.height;
	  }

	  return {
	    x: element.offsetLeft,
	    y: element.offsetTop,
	    width: width,
	    height: height
	  };
	}

	function contains(parent, child) {
	  var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method

	  if (parent.contains(child)) {
	    return true;
	  } // then fallback to custom implementation with Shadow DOM support
	  else if (rootNode && isShadowRoot$1(rootNode)) {
	      var next = child;

	      do {
	        if (next && parent.isSameNode(next)) {
	          return true;
	        } // $FlowFixMe[prop-missing]: need a better way to handle this...


	        next = next.parentNode || next.host;
	      } while (next);
	    } // Give up, the result is false


	  return false;
	}

	function getComputedStyle$2(element) {
	  return getWindow$1(element).getComputedStyle(element);
	}

	function isTableElement$1(element) {
	  return ['table', 'td', 'th'].indexOf(getNodeName$1(element)) >= 0;
	}

	function getDocumentElement$1(element) {
	  // $FlowFixMe[incompatible-return]: assume body is always available
	  return ((isElement$1(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
	  element.document) || window.document).documentElement;
	}

	function getParentNode$1(element) {
	  if (getNodeName$1(element) === 'html') {
	    return element;
	  }

	  return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
	    // $FlowFixMe[incompatible-return]
	    // $FlowFixMe[prop-missing]
	    element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
	    element.parentNode || ( // DOM Element detected
	    isShadowRoot$1(element) ? element.host : null) || // ShadowRoot detected
	    // $FlowFixMe[incompatible-call]: HTMLElement is a Node
	    getDocumentElement$1(element) // fallback

	  );
	}

	function getTrueOffsetParent$1(element) {
	  if (!isHTMLElement$1(element) || // https://github.com/popperjs/popper-core/issues/837
	  getComputedStyle$2(element).position === 'fixed') {
	    return null;
	  }

	  return element.offsetParent;
	} // `.offsetParent` reports `null` for fixed elements, while absolute elements
	// return the containing block


	function getContainingBlock$1(element) {
	  var isFirefox = /firefox/i.test(getUAString());
	  var isIE = /Trident/i.test(getUAString());

	  if (isIE && isHTMLElement$1(element)) {
	    // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
	    var elementCss = getComputedStyle$2(element);

	    if (elementCss.position === 'fixed') {
	      return null;
	    }
	  }

	  var currentNode = getParentNode$1(element);

	  if (isShadowRoot$1(currentNode)) {
	    currentNode = currentNode.host;
	  }

	  while (isHTMLElement$1(currentNode) && ['html', 'body'].indexOf(getNodeName$1(currentNode)) < 0) {
	    var css = getComputedStyle$2(currentNode); // This is non-exhaustive but covers the most common CSS properties that
	    // create a containing block.
	    // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block

	    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
	      return currentNode;
	    } else {
	      currentNode = currentNode.parentNode;
	    }
	  }

	  return null;
	} // Gets the closest ancestor positioned element. Handles some edge cases,
	// such as table ancestors and cross browser bugs.


	function getOffsetParent$1(element) {
	  var window = getWindow$1(element);
	  var offsetParent = getTrueOffsetParent$1(element);

	  while (offsetParent && isTableElement$1(offsetParent) && getComputedStyle$2(offsetParent).position === 'static') {
	    offsetParent = getTrueOffsetParent$1(offsetParent);
	  }

	  if (offsetParent && (getNodeName$1(offsetParent) === 'html' || getNodeName$1(offsetParent) === 'body' && getComputedStyle$2(offsetParent).position === 'static')) {
	    return window;
	  }

	  return offsetParent || getContainingBlock$1(element) || window;
	}

	function getMainAxisFromPlacement(placement) {
	  return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
	}

	function within(min, value, max) {
	  return max$1(min, min$1(value, max));
	}
	function withinMaxClamp(min, value, max) {
	  var v = within(min, value, max);
	  return v > max ? max : v;
	}

	function getFreshSideObject() {
	  return {
	    top: 0,
	    right: 0,
	    bottom: 0,
	    left: 0
	  };
	}

	function mergePaddingObject(paddingObject) {
	  return Object.assign({}, getFreshSideObject(), paddingObject);
	}

	function expandToHashMap(value, keys) {
	  return keys.reduce(function (hashMap, key) {
	    hashMap[key] = value;
	    return hashMap;
	  }, {});
	}

	var toPaddingObject = function toPaddingObject(padding, state) {
	  padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
	    placement: state.placement
	  })) : padding;
	  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
	};

	function arrow(_ref) {
	  var _state$modifiersData$;

	  var state = _ref.state,
	      name = _ref.name,
	      options = _ref.options;
	  var arrowElement = state.elements.arrow;
	  var popperOffsets = state.modifiersData.popperOffsets;
	  var basePlacement = getBasePlacement(state.placement);
	  var axis = getMainAxisFromPlacement(basePlacement);
	  var isVertical = [left, right].indexOf(basePlacement) >= 0;
	  var len = isVertical ? 'height' : 'width';

	  if (!arrowElement || !popperOffsets) {
	    return;
	  }

	  var paddingObject = toPaddingObject(options.padding, state);
	  var arrowRect = getLayoutRect(arrowElement);
	  var minProp = axis === 'y' ? top : left;
	  var maxProp = axis === 'y' ? bottom : right;
	  var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
	  var startDiff = popperOffsets[axis] - state.rects.reference[axis];
	  var arrowOffsetParent = getOffsetParent$1(arrowElement);
	  var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
	  var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
	  // outside of the popper bounds

	  var min = paddingObject[minProp];
	  var max = clientSize - arrowRect[len] - paddingObject[maxProp];
	  var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
	  var offset = within(min, center, max); // Prevents breaking syntax highlighting...

	  var axisProp = axis;
	  state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
	}

	function effect$1(_ref2) {
	  var state = _ref2.state,
	      options = _ref2.options;
	  var _options$element = options.element,
	      arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;

	  if (arrowElement == null) {
	    return;
	  } // CSS selector


	  if (typeof arrowElement === 'string') {
	    arrowElement = state.elements.popper.querySelector(arrowElement);

	    if (!arrowElement) {
	      return;
	    }
	  }

	  if (!contains(state.elements.popper, arrowElement)) {
	    return;
	  }

	  state.elements.arrow = arrowElement;
	} // eslint-disable-next-line import/no-unused-modules


	var arrow$1 = {
	  name: 'arrow',
	  enabled: true,
	  phase: 'main',
	  fn: arrow,
	  effect: effect$1,
	  requires: ['popperOffsets'],
	  requiresIfExists: ['preventOverflow']
	};

	function getVariation(placement) {
	  return placement.split('-')[1];
	}

	var unsetSides = {
	  top: 'auto',
	  right: 'auto',
	  bottom: 'auto',
	  left: 'auto'
	}; // Round the offsets to the nearest suitable subpixel based on the DPR.
	// Zooming can change the DPR, but it seems to report a value that will
	// cleanly divide the values into the appropriate subpixels.

	function roundOffsetsByDPR(_ref, win) {
	  var x = _ref.x,
	      y = _ref.y;
	  var dpr = win.devicePixelRatio || 1;
	  return {
	    x: round$2(x * dpr) / dpr || 0,
	    y: round$2(y * dpr) / dpr || 0
	  };
	}

	function mapToStyles(_ref2) {
	  var _Object$assign2;

	  var popper = _ref2.popper,
	      popperRect = _ref2.popperRect,
	      placement = _ref2.placement,
	      variation = _ref2.variation,
	      offsets = _ref2.offsets,
	      position = _ref2.position,
	      gpuAcceleration = _ref2.gpuAcceleration,
	      adaptive = _ref2.adaptive,
	      roundOffsets = _ref2.roundOffsets,
	      isFixed = _ref2.isFixed;
	  var _offsets$x = offsets.x,
	      x = _offsets$x === void 0 ? 0 : _offsets$x,
	      _offsets$y = offsets.y,
	      y = _offsets$y === void 0 ? 0 : _offsets$y;

	  var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
	    x: x,
	    y: y
	  }) : {
	    x: x,
	    y: y
	  };

	  x = _ref3.x;
	  y = _ref3.y;
	  var hasX = offsets.hasOwnProperty('x');
	  var hasY = offsets.hasOwnProperty('y');
	  var sideX = left;
	  var sideY = top;
	  var win = window;

	  if (adaptive) {
	    var offsetParent = getOffsetParent$1(popper);
	    var heightProp = 'clientHeight';
	    var widthProp = 'clientWidth';

	    if (offsetParent === getWindow$1(popper)) {
	      offsetParent = getDocumentElement$1(popper);

	      if (getComputedStyle$2(offsetParent).position !== 'static' && position === 'absolute') {
	        heightProp = 'scrollHeight';
	        widthProp = 'scrollWidth';
	      }
	    } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it


	    offsetParent = offsetParent;

	    if (placement === top || (placement === left || placement === right) && variation === end) {
	      sideY = bottom;
	      var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
	      offsetParent[heightProp];
	      y -= offsetY - popperRect.height;
	      y *= gpuAcceleration ? 1 : -1;
	    }

	    if (placement === left || (placement === top || placement === bottom) && variation === end) {
	      sideX = right;
	      var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
	      offsetParent[widthProp];
	      x -= offsetX - popperRect.width;
	      x *= gpuAcceleration ? 1 : -1;
	    }
	  }

	  var commonStyles = Object.assign({
	    position: position
	  }, adaptive && unsetSides);

	  var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
	    x: x,
	    y: y
	  }, getWindow$1(popper)) : {
	    x: x,
	    y: y
	  };

	  x = _ref4.x;
	  y = _ref4.y;

	  if (gpuAcceleration) {
	    var _Object$assign;

	    return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
	  }

	  return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
	}

	function computeStyles(_ref5) {
	  var state = _ref5.state,
	      options = _ref5.options;
	  var _options$gpuAccelerat = options.gpuAcceleration,
	      gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
	      _options$adaptive = options.adaptive,
	      adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
	      _options$roundOffsets = options.roundOffsets,
	      roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
	  var commonStyles = {
	    placement: getBasePlacement(state.placement),
	    variation: getVariation(state.placement),
	    popper: state.elements.popper,
	    popperRect: state.rects.popper,
	    gpuAcceleration: gpuAcceleration,
	    isFixed: state.options.strategy === 'fixed'
	  };

	  if (state.modifiersData.popperOffsets != null) {
	    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
	      offsets: state.modifiersData.popperOffsets,
	      position: state.options.strategy,
	      adaptive: adaptive,
	      roundOffsets: roundOffsets
	    })));
	  }

	  if (state.modifiersData.arrow != null) {
	    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
	      offsets: state.modifiersData.arrow,
	      position: 'absolute',
	      adaptive: false,
	      roundOffsets: roundOffsets
	    })));
	  }

	  state.attributes.popper = Object.assign({}, state.attributes.popper, {
	    'data-popper-placement': state.placement
	  });
	} // eslint-disable-next-line import/no-unused-modules


	var computeStyles$1 = {
	  name: 'computeStyles',
	  enabled: true,
	  phase: 'beforeWrite',
	  fn: computeStyles,
	  data: {}
	};

	var passive = {
	  passive: true
	};

	function effect(_ref) {
	  var state = _ref.state,
	      instance = _ref.instance,
	      options = _ref.options;
	  var _options$scroll = options.scroll,
	      scroll = _options$scroll === void 0 ? true : _options$scroll,
	      _options$resize = options.resize,
	      resize = _options$resize === void 0 ? true : _options$resize;
	  var window = getWindow$1(state.elements.popper);
	  var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

	  if (scroll) {
	    scrollParents.forEach(function (scrollParent) {
	      scrollParent.addEventListener('scroll', instance.update, passive);
	    });
	  }

	  if (resize) {
	    window.addEventListener('resize', instance.update, passive);
	  }

	  return function () {
	    if (scroll) {
	      scrollParents.forEach(function (scrollParent) {
	        scrollParent.removeEventListener('scroll', instance.update, passive);
	      });
	    }

	    if (resize) {
	      window.removeEventListener('resize', instance.update, passive);
	    }
	  };
	} // eslint-disable-next-line import/no-unused-modules


	var eventListeners = {
	  name: 'eventListeners',
	  enabled: true,
	  phase: 'write',
	  fn: function fn() {},
	  effect: effect,
	  data: {}
	};

	var hash$1 = {
	  left: 'right',
	  right: 'left',
	  bottom: 'top',
	  top: 'bottom'
	};
	function getOppositePlacement$1(placement) {
	  return placement.replace(/left|right|bottom|top/g, function (matched) {
	    return hash$1[matched];
	  });
	}

	var hash = {
	  start: 'end',
	  end: 'start'
	};
	function getOppositeVariationPlacement(placement) {
	  return placement.replace(/start|end/g, function (matched) {
	    return hash[matched];
	  });
	}

	function getWindowScroll(node) {
	  var win = getWindow$1(node);
	  var scrollLeft = win.pageXOffset;
	  var scrollTop = win.pageYOffset;
	  return {
	    scrollLeft: scrollLeft,
	    scrollTop: scrollTop
	  };
	}

	function getWindowScrollBarX$1(element) {
	  // If <html> has a CSS width greater than the viewport, then this will be
	  // incorrect for RTL.
	  // Popper 1 is broken in this case and never had a bug report so let's assume
	  // it's not an issue. I don't think anyone ever specifies width on <html>
	  // anyway.
	  // Browsers where the left scrollbar doesn't cause an issue report `0` for
	  // this (e.g. Edge 2019, IE11, Safari)
	  return getBoundingClientRect$1(getDocumentElement$1(element)).left + getWindowScroll(element).scrollLeft;
	}

	function getViewportRect$1(element, strategy) {
	  var win = getWindow$1(element);
	  var html = getDocumentElement$1(element);
	  var visualViewport = win.visualViewport;
	  var width = html.clientWidth;
	  var height = html.clientHeight;
	  var x = 0;
	  var y = 0;

	  if (visualViewport) {
	    width = visualViewport.width;
	    height = visualViewport.height;
	    var layoutViewport = isLayoutViewport();

	    if (layoutViewport || !layoutViewport && strategy === 'fixed') {
	      x = visualViewport.offsetLeft;
	      y = visualViewport.offsetTop;
	    }
	  }

	  return {
	    width: width,
	    height: height,
	    x: x + getWindowScrollBarX$1(element),
	    y: y
	  };
	}

	// of the `<html>` and `<body>` rect bounds if horizontally scrollable

	function getDocumentRect$1(element) {
	  var _element$ownerDocumen;

	  var html = getDocumentElement$1(element);
	  var winScroll = getWindowScroll(element);
	  var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
	  var width = max$1(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
	  var height = max$1(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
	  var x = -winScroll.scrollLeft + getWindowScrollBarX$1(element);
	  var y = -winScroll.scrollTop;

	  if (getComputedStyle$2(body || html).direction === 'rtl') {
	    x += max$1(html.clientWidth, body ? body.clientWidth : 0) - width;
	  }

	  return {
	    width: width,
	    height: height,
	    x: x,
	    y: y
	  };
	}

	function isScrollParent(element) {
	  // Firefox wants us to check `-x` and `-y` variations as well
	  var _getComputedStyle = getComputedStyle$2(element),
	      overflow = _getComputedStyle.overflow,
	      overflowX = _getComputedStyle.overflowX,
	      overflowY = _getComputedStyle.overflowY;

	  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
	}

	function getScrollParent(node) {
	  if (['html', 'body', '#document'].indexOf(getNodeName$1(node)) >= 0) {
	    // $FlowFixMe[incompatible-return]: assume body is always available
	    return node.ownerDocument.body;
	  }

	  if (isHTMLElement$1(node) && isScrollParent(node)) {
	    return node;
	  }

	  return getScrollParent(getParentNode$1(node));
	}

	/*
	given a DOM element, return the list of all scroll parents, up the list of ancesors
	until we get to the top window object. This list is what we attach scroll listeners
	to, because if any of these parent elements scroll, we'll need to re-calculate the
	reference element's position.
	*/

	function listScrollParents(element, list) {
	  var _element$ownerDocumen;

	  if (list === void 0) {
	    list = [];
	  }

	  var scrollParent = getScrollParent(element);
	  var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
	  var win = getWindow$1(scrollParent);
	  var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
	  var updatedList = list.concat(target);
	  return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
	  updatedList.concat(listScrollParents(getParentNode$1(target)));
	}

	function rectToClientRect$1(rect) {
	  return Object.assign({}, rect, {
	    left: rect.x,
	    top: rect.y,
	    right: rect.x + rect.width,
	    bottom: rect.y + rect.height
	  });
	}

	function getInnerBoundingClientRect$1(element, strategy) {
	  var rect = getBoundingClientRect$1(element, false, strategy === 'fixed');
	  rect.top = rect.top + element.clientTop;
	  rect.left = rect.left + element.clientLeft;
	  rect.bottom = rect.top + element.clientHeight;
	  rect.right = rect.left + element.clientWidth;
	  rect.width = element.clientWidth;
	  rect.height = element.clientHeight;
	  rect.x = rect.left;
	  rect.y = rect.top;
	  return rect;
	}

	function getClientRectFromMixedType(element, clippingParent, strategy) {
	  return clippingParent === viewport ? rectToClientRect$1(getViewportRect$1(element, strategy)) : isElement$1(clippingParent) ? getInnerBoundingClientRect$1(clippingParent, strategy) : rectToClientRect$1(getDocumentRect$1(getDocumentElement$1(element)));
	} // A "clipping parent" is an overflowable container with the characteristic of
	// clipping (or hiding) overflowing elements with a position different from
	// `initial`


	function getClippingParents(element) {
	  var clippingParents = listScrollParents(getParentNode$1(element));
	  var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$2(element).position) >= 0;
	  var clipperElement = canEscapeClipping && isHTMLElement$1(element) ? getOffsetParent$1(element) : element;

	  if (!isElement$1(clipperElement)) {
	    return [];
	  } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414


	  return clippingParents.filter(function (clippingParent) {
	    return isElement$1(clippingParent) && contains(clippingParent, clipperElement) && getNodeName$1(clippingParent) !== 'body';
	  });
	} // Gets the maximum area that the element is visible in due to any number of
	// clipping parents


	function getClippingRect$1(element, boundary, rootBoundary, strategy) {
	  var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
	  var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
	  var firstClippingParent = clippingParents[0];
	  var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
	    var rect = getClientRectFromMixedType(element, clippingParent, strategy);
	    accRect.top = max$1(rect.top, accRect.top);
	    accRect.right = min$1(rect.right, accRect.right);
	    accRect.bottom = min$1(rect.bottom, accRect.bottom);
	    accRect.left = max$1(rect.left, accRect.left);
	    return accRect;
	  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
	  clippingRect.width = clippingRect.right - clippingRect.left;
	  clippingRect.height = clippingRect.bottom - clippingRect.top;
	  clippingRect.x = clippingRect.left;
	  clippingRect.y = clippingRect.top;
	  return clippingRect;
	}

	function computeOffsets(_ref) {
	  var reference = _ref.reference,
	      element = _ref.element,
	      placement = _ref.placement;
	  var basePlacement = placement ? getBasePlacement(placement) : null;
	  var variation = placement ? getVariation(placement) : null;
	  var commonX = reference.x + reference.width / 2 - element.width / 2;
	  var commonY = reference.y + reference.height / 2 - element.height / 2;
	  var offsets;

	  switch (basePlacement) {
	    case top:
	      offsets = {
	        x: commonX,
	        y: reference.y - element.height
	      };
	      break;

	    case bottom:
	      offsets = {
	        x: commonX,
	        y: reference.y + reference.height
	      };
	      break;

	    case right:
	      offsets = {
	        x: reference.x + reference.width,
	        y: commonY
	      };
	      break;

	    case left:
	      offsets = {
	        x: reference.x - element.width,
	        y: commonY
	      };
	      break;

	    default:
	      offsets = {
	        x: reference.x,
	        y: reference.y
	      };
	  }

	  var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;

	  if (mainAxis != null) {
	    var len = mainAxis === 'y' ? 'height' : 'width';

	    switch (variation) {
	      case start:
	        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
	        break;

	      case end:
	        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
	        break;
	    }
	  }

	  return offsets;
	}

	function detectOverflow$1(state, options) {
	  if (options === void 0) {
	    options = {};
	  }

	  var _options = options,
	      _options$placement = _options.placement,
	      placement = _options$placement === void 0 ? state.placement : _options$placement,
	      _options$strategy = _options.strategy,
	      strategy = _options$strategy === void 0 ? state.strategy : _options$strategy,
	      _options$boundary = _options.boundary,
	      boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
	      _options$rootBoundary = _options.rootBoundary,
	      rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
	      _options$elementConte = _options.elementContext,
	      elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
	      _options$altBoundary = _options.altBoundary,
	      altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
	      _options$padding = _options.padding,
	      padding = _options$padding === void 0 ? 0 : _options$padding;
	  var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
	  var altContext = elementContext === popper ? reference : popper;
	  var popperRect = state.rects.popper;
	  var element = state.elements[altBoundary ? altContext : elementContext];
	  var clippingClientRect = getClippingRect$1(isElement$1(element) ? element : element.contextElement || getDocumentElement$1(state.elements.popper), boundary, rootBoundary, strategy);
	  var referenceClientRect = getBoundingClientRect$1(state.elements.reference);
	  var popperOffsets = computeOffsets({
	    reference: referenceClientRect,
	    element: popperRect,
	    strategy: 'absolute',
	    placement: placement
	  });
	  var popperClientRect = rectToClientRect$1(Object.assign({}, popperRect, popperOffsets));
	  var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
	  // 0 or negative = within the clipping rect

	  var overflowOffsets = {
	    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
	    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
	    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
	    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
	  };
	  var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element

	  if (elementContext === popper && offsetData) {
	    var offset = offsetData[placement];
	    Object.keys(overflowOffsets).forEach(function (key) {
	      var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
	      var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
	      overflowOffsets[key] += offset[axis] * multiply;
	    });
	  }

	  return overflowOffsets;
	}

	function computeAutoPlacement(state, options) {
	  if (options === void 0) {
	    options = {};
	  }

	  var _options = options,
	      placement = _options.placement,
	      boundary = _options.boundary,
	      rootBoundary = _options.rootBoundary,
	      padding = _options.padding,
	      flipVariations = _options.flipVariations,
	      _options$allowedAutoP = _options.allowedAutoPlacements,
	      allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
	  var variation = getVariation(placement);
	  var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
	    return getVariation(placement) === variation;
	  }) : basePlacements;
	  var allowedPlacements = placements$1.filter(function (placement) {
	    return allowedAutoPlacements.indexOf(placement) >= 0;
	  });

	  if (allowedPlacements.length === 0) {
	    allowedPlacements = placements$1;
	  } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...


	  var overflows = allowedPlacements.reduce(function (acc, placement) {
	    acc[placement] = detectOverflow$1(state, {
	      placement: placement,
	      boundary: boundary,
	      rootBoundary: rootBoundary,
	      padding: padding
	    })[getBasePlacement(placement)];
	    return acc;
	  }, {});
	  return Object.keys(overflows).sort(function (a, b) {
	    return overflows[a] - overflows[b];
	  });
	}

	function getExpandedFallbackPlacements(placement) {
	  if (getBasePlacement(placement) === auto) {
	    return [];
	  }

	  var oppositePlacement = getOppositePlacement$1(placement);
	  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
	}

	function flip$2(_ref) {
	  var state = _ref.state,
	      options = _ref.options,
	      name = _ref.name;

	  if (state.modifiersData[name]._skip) {
	    return;
	  }

	  var _options$mainAxis = options.mainAxis,
	      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
	      _options$altAxis = options.altAxis,
	      checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
	      specifiedFallbackPlacements = options.fallbackPlacements,
	      padding = options.padding,
	      boundary = options.boundary,
	      rootBoundary = options.rootBoundary,
	      altBoundary = options.altBoundary,
	      _options$flipVariatio = options.flipVariations,
	      flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
	      allowedAutoPlacements = options.allowedAutoPlacements;
	  var preferredPlacement = state.options.placement;
	  var basePlacement = getBasePlacement(preferredPlacement);
	  var isBasePlacement = basePlacement === preferredPlacement;
	  var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement$1(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
	  var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
	    return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
	      placement: placement,
	      boundary: boundary,
	      rootBoundary: rootBoundary,
	      padding: padding,
	      flipVariations: flipVariations,
	      allowedAutoPlacements: allowedAutoPlacements
	    }) : placement);
	  }, []);
	  var referenceRect = state.rects.reference;
	  var popperRect = state.rects.popper;
	  var checksMap = new Map();
	  var makeFallbackChecks = true;
	  var firstFittingPlacement = placements[0];

	  for (var i = 0; i < placements.length; i++) {
	    var placement = placements[i];

	    var _basePlacement = getBasePlacement(placement);

	    var isStartVariation = getVariation(placement) === start;
	    var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
	    var len = isVertical ? 'width' : 'height';
	    var overflow = detectOverflow$1(state, {
	      placement: placement,
	      boundary: boundary,
	      rootBoundary: rootBoundary,
	      altBoundary: altBoundary,
	      padding: padding
	    });
	    var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;

	    if (referenceRect[len] > popperRect[len]) {
	      mainVariationSide = getOppositePlacement$1(mainVariationSide);
	    }

	    var altVariationSide = getOppositePlacement$1(mainVariationSide);
	    var checks = [];

	    if (checkMainAxis) {
	      checks.push(overflow[_basePlacement] <= 0);
	    }

	    if (checkAltAxis) {
	      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
	    }

	    if (checks.every(function (check) {
	      return check;
	    })) {
	      firstFittingPlacement = placement;
	      makeFallbackChecks = false;
	      break;
	    }

	    checksMap.set(placement, checks);
	  }

	  if (makeFallbackChecks) {
	    // `2` may be desired in some cases – research later
	    var numberOfChecks = flipVariations ? 3 : 1;

	    var _loop = function _loop(_i) {
	      var fittingPlacement = placements.find(function (placement) {
	        var checks = checksMap.get(placement);

	        if (checks) {
	          return checks.slice(0, _i).every(function (check) {
	            return check;
	          });
	        }
	      });

	      if (fittingPlacement) {
	        firstFittingPlacement = fittingPlacement;
	        return "break";
	      }
	    };

	    for (var _i = numberOfChecks; _i > 0; _i--) {
	      var _ret = _loop(_i);

	      if (_ret === "break") break;
	    }
	  }

	  if (state.placement !== firstFittingPlacement) {
	    state.modifiersData[name]._skip = true;
	    state.placement = firstFittingPlacement;
	    state.reset = true;
	  }
	} // eslint-disable-next-line import/no-unused-modules


	var flip$3 = {
	  name: 'flip',
	  enabled: true,
	  phase: 'main',
	  fn: flip$2,
	  requiresIfExists: ['offset'],
	  data: {
	    _skip: false
	  }
	};

	function getSideOffsets(overflow, rect, preventedOffsets) {
	  if (preventedOffsets === void 0) {
	    preventedOffsets = {
	      x: 0,
	      y: 0
	    };
	  }

	  return {
	    top: overflow.top - rect.height - preventedOffsets.y,
	    right: overflow.right - rect.width + preventedOffsets.x,
	    bottom: overflow.bottom - rect.height + preventedOffsets.y,
	    left: overflow.left - rect.width - preventedOffsets.x
	  };
	}

	function isAnySideFullyClipped(overflow) {
	  return [top, right, bottom, left].some(function (side) {
	    return overflow[side] >= 0;
	  });
	}

	function hide(_ref) {
	  var state = _ref.state,
	      name = _ref.name;
	  var referenceRect = state.rects.reference;
	  var popperRect = state.rects.popper;
	  var preventedOffsets = state.modifiersData.preventOverflow;
	  var referenceOverflow = detectOverflow$1(state, {
	    elementContext: 'reference'
	  });
	  var popperAltOverflow = detectOverflow$1(state, {
	    altBoundary: true
	  });
	  var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
	  var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
	  var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
	  var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
	  state.modifiersData[name] = {
	    referenceClippingOffsets: referenceClippingOffsets,
	    popperEscapeOffsets: popperEscapeOffsets,
	    isReferenceHidden: isReferenceHidden,
	    hasPopperEscaped: hasPopperEscaped
	  };
	  state.attributes.popper = Object.assign({}, state.attributes.popper, {
	    'data-popper-reference-hidden': isReferenceHidden,
	    'data-popper-escaped': hasPopperEscaped
	  });
	} // eslint-disable-next-line import/no-unused-modules


	var hide$1 = {
	  name: 'hide',
	  enabled: true,
	  phase: 'main',
	  requiresIfExists: ['preventOverflow'],
	  fn: hide
	};

	function distanceAndSkiddingToXY(placement, rects, offset) {
	  var basePlacement = getBasePlacement(placement);
	  var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;

	  var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
	    placement: placement
	  })) : offset,
	      skidding = _ref[0],
	      distance = _ref[1];

	  skidding = skidding || 0;
	  distance = (distance || 0) * invertDistance;
	  return [left, right].indexOf(basePlacement) >= 0 ? {
	    x: distance,
	    y: skidding
	  } : {
	    x: skidding,
	    y: distance
	  };
	}

	function offset$1(_ref2) {
	  var state = _ref2.state,
	      options = _ref2.options,
	      name = _ref2.name;
	  var _options$offset = options.offset,
	      offset = _options$offset === void 0 ? [0, 0] : _options$offset;
	  var data = placements.reduce(function (acc, placement) {
	    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
	    return acc;
	  }, {});
	  var _data$state$placement = data[state.placement],
	      x = _data$state$placement.x,
	      y = _data$state$placement.y;

	  if (state.modifiersData.popperOffsets != null) {
	    state.modifiersData.popperOffsets.x += x;
	    state.modifiersData.popperOffsets.y += y;
	  }

	  state.modifiersData[name] = data;
	} // eslint-disable-next-line import/no-unused-modules


	var offset$2 = {
	  name: 'offset',
	  enabled: true,
	  phase: 'main',
	  requires: ['popperOffsets'],
	  fn: offset$1
	};

	function popperOffsets(_ref) {
	  var state = _ref.state,
	      name = _ref.name;
	  // Offsets are the actual position the popper needs to have to be
	  // properly positioned near its reference element
	  // This is the most basic placement, and will be adjusted by
	  // the modifiers in the next step
	  state.modifiersData[name] = computeOffsets({
	    reference: state.rects.reference,
	    element: state.rects.popper,
	    strategy: 'absolute',
	    placement: state.placement
	  });
	} // eslint-disable-next-line import/no-unused-modules


	var popperOffsets$1 = {
	  name: 'popperOffsets',
	  enabled: true,
	  phase: 'read',
	  fn: popperOffsets,
	  data: {}
	};

	function getAltAxis(axis) {
	  return axis === 'x' ? 'y' : 'x';
	}

	function preventOverflow(_ref) {
	  var state = _ref.state,
	      options = _ref.options,
	      name = _ref.name;
	  var _options$mainAxis = options.mainAxis,
	      checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
	      _options$altAxis = options.altAxis,
	      checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
	      boundary = options.boundary,
	      rootBoundary = options.rootBoundary,
	      altBoundary = options.altBoundary,
	      padding = options.padding,
	      _options$tether = options.tether,
	      tether = _options$tether === void 0 ? true : _options$tether,
	      _options$tetherOffset = options.tetherOffset,
	      tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
	  var overflow = detectOverflow$1(state, {
	    boundary: boundary,
	    rootBoundary: rootBoundary,
	    padding: padding,
	    altBoundary: altBoundary
	  });
	  var basePlacement = getBasePlacement(state.placement);
	  var variation = getVariation(state.placement);
	  var isBasePlacement = !variation;
	  var mainAxis = getMainAxisFromPlacement(basePlacement);
	  var altAxis = getAltAxis(mainAxis);
	  var popperOffsets = state.modifiersData.popperOffsets;
	  var referenceRect = state.rects.reference;
	  var popperRect = state.rects.popper;
	  var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
	    placement: state.placement
	  })) : tetherOffset;
	  var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
	    mainAxis: tetherOffsetValue,
	    altAxis: tetherOffsetValue
	  } : Object.assign({
	    mainAxis: 0,
	    altAxis: 0
	  }, tetherOffsetValue);
	  var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
	  var data = {
	    x: 0,
	    y: 0
	  };

	  if (!popperOffsets) {
	    return;
	  }

	  if (checkMainAxis) {
	    var _offsetModifierState$;

	    var mainSide = mainAxis === 'y' ? top : left;
	    var altSide = mainAxis === 'y' ? bottom : right;
	    var len = mainAxis === 'y' ? 'height' : 'width';
	    var offset = popperOffsets[mainAxis];
	    var min = offset + overflow[mainSide];
	    var max = offset - overflow[altSide];
	    var additive = tether ? -popperRect[len] / 2 : 0;
	    var minLen = variation === start ? referenceRect[len] : popperRect[len];
	    var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
	    // outside the reference bounds

	    var arrowElement = state.elements.arrow;
	    var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
	      width: 0,
	      height: 0
	    };
	    var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
	    var arrowPaddingMin = arrowPaddingObject[mainSide];
	    var arrowPaddingMax = arrowPaddingObject[altSide]; // If the reference length is smaller than the arrow length, we don't want
	    // to include its full size in the calculation. If the reference is small
	    // and near the edge of a boundary, the popper can overflow even if the
	    // reference is not overflowing as well (e.g. virtual elements with no
	    // width or height)

	    var arrowLen = within(0, referenceRect[len], arrowRect[len]);
	    var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
	    var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
	    var arrowOffsetParent = state.elements.arrow && getOffsetParent$1(state.elements.arrow);
	    var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
	    var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
	    var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
	    var tetherMax = offset + maxOffset - offsetModifierValue;
	    var preventedOffset = within(tether ? min$1(min, tetherMin) : min, offset, tether ? max$1(max, tetherMax) : max);
	    popperOffsets[mainAxis] = preventedOffset;
	    data[mainAxis] = preventedOffset - offset;
	  }

	  if (checkAltAxis) {
	    var _offsetModifierState$2;

	    var _mainSide = mainAxis === 'x' ? top : left;

	    var _altSide = mainAxis === 'x' ? bottom : right;

	    var _offset = popperOffsets[altAxis];

	    var _len = altAxis === 'y' ? 'height' : 'width';

	    var _min = _offset + overflow[_mainSide];

	    var _max = _offset - overflow[_altSide];

	    var isOriginSide = [top, left].indexOf(basePlacement) !== -1;

	    var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;

	    var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;

	    var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;

	    var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);

	    popperOffsets[altAxis] = _preventedOffset;
	    data[altAxis] = _preventedOffset - _offset;
	  }

	  state.modifiersData[name] = data;
	} // eslint-disable-next-line import/no-unused-modules


	var preventOverflow$1 = {
	  name: 'preventOverflow',
	  enabled: true,
	  phase: 'main',
	  fn: preventOverflow,
	  requiresIfExists: ['offset']
	};

	function getHTMLElementScroll(element) {
	  return {
	    scrollLeft: element.scrollLeft,
	    scrollTop: element.scrollTop
	  };
	}

	function getNodeScroll$1(node) {
	  if (node === getWindow$1(node) || !isHTMLElement$1(node)) {
	    return getWindowScroll(node);
	  } else {
	    return getHTMLElementScroll(node);
	  }
	}

	function isElementScaled(element) {
	  var rect = element.getBoundingClientRect();
	  var scaleX = round$2(rect.width) / element.offsetWidth || 1;
	  var scaleY = round$2(rect.height) / element.offsetHeight || 1;
	  return scaleX !== 1 || scaleY !== 1;
	} // Returns the composite rect of an element relative to its offsetParent.
	// Composite means it takes into account transforms as well as layout.


	function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
	  if (isFixed === void 0) {
	    isFixed = false;
	  }

	  var isOffsetParentAnElement = isHTMLElement$1(offsetParent);
	  var offsetParentIsScaled = isHTMLElement$1(offsetParent) && isElementScaled(offsetParent);
	  var documentElement = getDocumentElement$1(offsetParent);
	  var rect = getBoundingClientRect$1(elementOrVirtualElement, offsetParentIsScaled, isFixed);
	  var scroll = {
	    scrollLeft: 0,
	    scrollTop: 0
	  };
	  var offsets = {
	    x: 0,
	    y: 0
	  };

	  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
	    if (getNodeName$1(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
	    isScrollParent(documentElement)) {
	      scroll = getNodeScroll$1(offsetParent);
	    }

	    if (isHTMLElement$1(offsetParent)) {
	      offsets = getBoundingClientRect$1(offsetParent, true);
	      offsets.x += offsetParent.clientLeft;
	      offsets.y += offsetParent.clientTop;
	    } else if (documentElement) {
	      offsets.x = getWindowScrollBarX$1(documentElement);
	    }
	  }

	  return {
	    x: rect.left + scroll.scrollLeft - offsets.x,
	    y: rect.top + scroll.scrollTop - offsets.y,
	    width: rect.width,
	    height: rect.height
	  };
	}

	function order(modifiers) {
	  var map = new Map();
	  var visited = new Set();
	  var result = [];
	  modifiers.forEach(function (modifier) {
	    map.set(modifier.name, modifier);
	  }); // On visiting object, check for its dependencies and visit them recursively

	  function sort(modifier) {
	    visited.add(modifier.name);
	    var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
	    requires.forEach(function (dep) {
	      if (!visited.has(dep)) {
	        var depModifier = map.get(dep);

	        if (depModifier) {
	          sort(depModifier);
	        }
	      }
	    });
	    result.push(modifier);
	  }

	  modifiers.forEach(function (modifier) {
	    if (!visited.has(modifier.name)) {
	      // check for visited object
	      sort(modifier);
	    }
	  });
	  return result;
	}

	function orderModifiers(modifiers) {
	  // order based on dependencies
	  var orderedModifiers = order(modifiers); // order based on phase

	  return modifierPhases.reduce(function (acc, phase) {
	    return acc.concat(orderedModifiers.filter(function (modifier) {
	      return modifier.phase === phase;
	    }));
	  }, []);
	}

	function debounce$1(fn) {
	  var pending;
	  return function () {
	    if (!pending) {
	      pending = new Promise(function (resolve) {
	        Promise.resolve().then(function () {
	          pending = undefined;
	          resolve(fn());
	        });
	      });
	    }

	    return pending;
	  };
	}

	function mergeByName(modifiers) {
	  var merged = modifiers.reduce(function (merged, current) {
	    var existing = merged[current.name];
	    merged[current.name] = existing ? Object.assign({}, existing, current, {
	      options: Object.assign({}, existing.options, current.options),
	      data: Object.assign({}, existing.data, current.data)
	    }) : current;
	    return merged;
	  }, {}); // IE11 does not support Object.values

	  return Object.keys(merged).map(function (key) {
	    return merged[key];
	  });
	}

	var DEFAULT_OPTIONS = {
	  placement: 'bottom',
	  modifiers: [],
	  strategy: 'absolute'
	};

	function areValidElements() {
	  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  return !args.some(function (element) {
	    return !(element && typeof element.getBoundingClientRect === 'function');
	  });
	}

	function popperGenerator(generatorOptions) {
	  if (generatorOptions === void 0) {
	    generatorOptions = {};
	  }

	  var _generatorOptions = generatorOptions,
	      _generatorOptions$def = _generatorOptions.defaultModifiers,
	      defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
	      _generatorOptions$def2 = _generatorOptions.defaultOptions,
	      defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
	  return function createPopper(reference, popper, options) {
	    if (options === void 0) {
	      options = defaultOptions;
	    }

	    var state = {
	      placement: 'bottom',
	      orderedModifiers: [],
	      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
	      modifiersData: {},
	      elements: {
	        reference: reference,
	        popper: popper
	      },
	      attributes: {},
	      styles: {}
	    };
	    var effectCleanupFns = [];
	    var isDestroyed = false;
	    var instance = {
	      state: state,
	      setOptions: function setOptions(setOptionsAction) {
	        var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
	        cleanupModifierEffects();
	        state.options = Object.assign({}, defaultOptions, state.options, options);
	        state.scrollParents = {
	          reference: isElement$1(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
	          popper: listScrollParents(popper)
	        }; // Orders the modifiers based on their dependencies and `phase`
	        // properties

	        var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers

	        state.orderedModifiers = orderedModifiers.filter(function (m) {
	          return m.enabled;
	        });
	        runModifierEffects();
	        return instance.update();
	      },
	      // Sync update – it will always be executed, even if not necessary. This
	      // is useful for low frequency updates where sync behavior simplifies the
	      // logic.
	      // For high frequency updates (e.g. `resize` and `scroll` events), always
	      // prefer the async Popper#update method
	      forceUpdate: function forceUpdate() {
	        if (isDestroyed) {
	          return;
	        }

	        var _state$elements = state.elements,
	            reference = _state$elements.reference,
	            popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
	        // anymore

	        if (!areValidElements(reference, popper)) {
	          return;
	        } // Store the reference and popper rects to be read by modifiers


	        state.rects = {
	          reference: getCompositeRect(reference, getOffsetParent$1(popper), state.options.strategy === 'fixed'),
	          popper: getLayoutRect(popper)
	        }; // Modifiers have the ability to reset the current update cycle. The
	        // most common use case for this is the `flip` modifier changing the
	        // placement, which then needs to re-run all the modifiers, because the
	        // logic was previously ran for the previous placement and is therefore
	        // stale/incorrect

	        state.reset = false;
	        state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
	        // is filled with the initial data specified by the modifier. This means
	        // it doesn't persist and is fresh on each update.
	        // To ensure persistent data, use `${name}#persistent`

	        state.orderedModifiers.forEach(function (modifier) {
	          return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
	        });

	        for (var index = 0; index < state.orderedModifiers.length; index++) {
	          if (state.reset === true) {
	            state.reset = false;
	            index = -1;
	            continue;
	          }

	          var _state$orderedModifie = state.orderedModifiers[index],
	              fn = _state$orderedModifie.fn,
	              _state$orderedModifie2 = _state$orderedModifie.options,
	              _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
	              name = _state$orderedModifie.name;

	          if (typeof fn === 'function') {
	            state = fn({
	              state: state,
	              options: _options,
	              name: name,
	              instance: instance
	            }) || state;
	          }
	        }
	      },
	      // Async and optimistically optimized update – it will not be executed if
	      // not necessary (debounced to run at most once-per-tick)
	      update: debounce$1(function () {
	        return new Promise(function (resolve) {
	          instance.forceUpdate();
	          resolve(state);
	        });
	      }),
	      destroy: function destroy() {
	        cleanupModifierEffects();
	        isDestroyed = true;
	      }
	    };

	    if (!areValidElements(reference, popper)) {
	      return instance;
	    }

	    instance.setOptions(options).then(function (state) {
	      if (!isDestroyed && options.onFirstUpdate) {
	        options.onFirstUpdate(state);
	      }
	    }); // Modifiers have the ability to execute arbitrary code before the first
	    // update cycle runs. They will be executed in the same order as the update
	    // cycle. This is useful when a modifier adds some persistent data that
	    // other modifiers need to use, but the modifier is run after the dependent
	    // one.

	    function runModifierEffects() {
	      state.orderedModifiers.forEach(function (_ref) {
	        var name = _ref.name,
	            _ref$options = _ref.options,
	            options = _ref$options === void 0 ? {} : _ref$options,
	            effect = _ref.effect;

	        if (typeof effect === 'function') {
	          var cleanupFn = effect({
	            state: state,
	            name: name,
	            instance: instance,
	            options: options
	          });

	          var noopFn = function noopFn() {};

	          effectCleanupFns.push(cleanupFn || noopFn);
	        }
	      });
	    }

	    function cleanupModifierEffects() {
	      effectCleanupFns.forEach(function (fn) {
	        return fn();
	      });
	      effectCleanupFns = [];
	    }

	    return instance;
	  };
	}

	var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$2, flip$3, preventOverflow$1, arrow$1, hide$1];
	var createPopper = /*#__PURE__*/popperGenerator({
	  defaultModifiers: defaultModifiers
	}); // eslint-disable-next-line import/no-unused-modules

	var __assign$7 = (undefined && undefined.__assign) || function () {
	    __assign$7 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$7.apply(this, arguments);
	};
	var __spreadArray$2 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	var Default$7 = {
	    placement: 'bottom',
	    triggerType: 'click',
	    offsetSkidding: 0,
	    offsetDistance: 10,
	    delay: 300,
	    ignoreClickOutsideClass: false,
	    onShow: function () { },
	    onHide: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$7 = {
	    id: null,
	    override: true,
	};
	var Dropdown = /** @class */ (function () {
	    function Dropdown(targetElement, triggerElement, options, instanceOptions) {
	        if (targetElement === void 0) { targetElement = null; }
	        if (triggerElement === void 0) { triggerElement = null; }
	        if (options === void 0) { options = Default$7; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$7; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetElement.id;
	        this._targetEl = targetElement;
	        this._triggerEl = triggerElement;
	        this._options = __assign$7(__assign$7({}, Default$7), options);
	        this._popperInstance = null;
	        this._visible = false;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Dropdown', this, this._instanceId, instanceOptions.override);
	    }
	    Dropdown.prototype.init = function () {
	        if (this._triggerEl && this._targetEl && !this._initialized) {
	            this._popperInstance = this._createPopperInstance();
	            this._setupEventListeners();
	            this._initialized = true;
	        }
	    };
	    Dropdown.prototype.destroy = function () {
	        var _this = this;
	        var triggerEvents = this._getTriggerEvents();
	        // Remove click event listeners for trigger element
	        if (this._options.triggerType === 'click') {
	            triggerEvents.showEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._clickHandler);
	            });
	        }
	        // Remove hover event listeners for trigger and target elements
	        if (this._options.triggerType === 'hover') {
	            triggerEvents.showEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._hoverShowTriggerElHandler);
	                _this._targetEl.removeEventListener(ev, _this._hoverShowTargetElHandler);
	            });
	            triggerEvents.hideEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._hoverHideHandler);
	                _this._targetEl.removeEventListener(ev, _this._hoverHideHandler);
	            });
	        }
	        this._popperInstance.destroy();
	        this._initialized = false;
	    };
	    Dropdown.prototype.removeInstance = function () {
	        instances$1.removeInstance('Dropdown', this._instanceId);
	    };
	    Dropdown.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Dropdown.prototype._setupEventListeners = function () {
	        var _this = this;
	        var triggerEvents = this._getTriggerEvents();
	        this._clickHandler = function () {
	            _this.toggle();
	        };
	        // click event handling for trigger element
	        if (this._options.triggerType === 'click') {
	            triggerEvents.showEvents.forEach(function (ev) {
	                _this._triggerEl.addEventListener(ev, _this._clickHandler);
	            });
	        }
	        this._hoverShowTriggerElHandler = function (ev) {
	            if (ev.type === 'click') {
	                _this.toggle();
	            }
	            else {
	                setTimeout(function () {
	                    _this.show();
	                }, _this._options.delay);
	            }
	        };
	        this._hoverShowTargetElHandler = function () {
	            _this.show();
	        };
	        this._hoverHideHandler = function () {
	            setTimeout(function () {
	                if (!_this._targetEl.matches(':hover')) {
	                    _this.hide();
	                }
	            }, _this._options.delay);
	        };
	        // hover event handling for trigger element
	        if (this._options.triggerType === 'hover') {
	            triggerEvents.showEvents.forEach(function (ev) {
	                _this._triggerEl.addEventListener(ev, _this._hoverShowTriggerElHandler);
	                _this._targetEl.addEventListener(ev, _this._hoverShowTargetElHandler);
	            });
	            triggerEvents.hideEvents.forEach(function (ev) {
	                _this._triggerEl.addEventListener(ev, _this._hoverHideHandler);
	                _this._targetEl.addEventListener(ev, _this._hoverHideHandler);
	            });
	        }
	    };
	    Dropdown.prototype._createPopperInstance = function () {
	        return createPopper(this._triggerEl, this._targetEl, {
	            placement: this._options.placement,
	            modifiers: [
	                {
	                    name: 'offset',
	                    options: {
	                        offset: [
	                            this._options.offsetSkidding,
	                            this._options.offsetDistance,
	                        ],
	                    },
	                },
	            ],
	        });
	    };
	    Dropdown.prototype._setupClickOutsideListener = function () {
	        var _this = this;
	        this._clickOutsideEventListener = function (ev) {
	            _this._handleClickOutside(ev, _this._targetEl);
	        };
	        document.body.addEventListener('click', this._clickOutsideEventListener, true);
	    };
	    Dropdown.prototype._removeClickOutsideListener = function () {
	        document.body.removeEventListener('click', this._clickOutsideEventListener, true);
	    };
	    Dropdown.prototype._handleClickOutside = function (ev, targetEl) {
	        var clickedEl = ev.target;
	        // Ignore clicks on the trigger element (ie. a datepicker input)
	        var ignoreClickOutsideClass = this._options.ignoreClickOutsideClass;
	        var isIgnored = false;
	        if (ignoreClickOutsideClass) {
	            var ignoredClickOutsideEls = document.querySelectorAll(".".concat(ignoreClickOutsideClass));
	            ignoredClickOutsideEls.forEach(function (el) {
	                if (el.contains(clickedEl)) {
	                    isIgnored = true;
	                    return;
	                }
	            });
	        }
	        // Ignore clicks on the target element (ie. dropdown itself)
	        if (clickedEl !== targetEl &&
	            !targetEl.contains(clickedEl) &&
	            !this._triggerEl.contains(clickedEl) &&
	            !isIgnored &&
	            this.isVisible()) {
	            this.hide();
	        }
	    };
	    Dropdown.prototype._getTriggerEvents = function () {
	        switch (this._options.triggerType) {
	            case 'hover':
	                return {
	                    showEvents: ['mouseenter', 'click'],
	                    hideEvents: ['mouseleave'],
	                };
	            case 'click':
	                return {
	                    showEvents: ['click'],
	                    hideEvents: [],
	                };
	            case 'none':
	                return {
	                    showEvents: [],
	                    hideEvents: [],
	                };
	            default:
	                return {
	                    showEvents: ['click'],
	                    hideEvents: [],
	                };
	        }
	    };
	    Dropdown.prototype.toggle = function () {
	        if (this.isVisible()) {
	            this.hide();
	        }
	        else {
	            this.show();
	        }
	        this._options.onToggle(this);
	    };
	    Dropdown.prototype.isVisible = function () {
	        return this._visible;
	    };
	    Dropdown.prototype.show = function () {
	        this._targetEl.classList.remove('hidden');
	        this._targetEl.classList.add('block');
	        // Enable the event listeners
	        this._popperInstance.setOptions(function (options) { return (__assign$7(__assign$7({}, options), { modifiers: __spreadArray$2(__spreadArray$2([], options.modifiers, true), [
	                { name: 'eventListeners', enabled: true },
	            ], false) })); });
	        this._setupClickOutsideListener();
	        // Update its position
	        this._popperInstance.update();
	        this._visible = true;
	        // callback function
	        this._options.onShow(this);
	    };
	    Dropdown.prototype.hide = function () {
	        this._targetEl.classList.remove('block');
	        this._targetEl.classList.add('hidden');
	        // Disable the event listeners
	        this._popperInstance.setOptions(function (options) { return (__assign$7(__assign$7({}, options), { modifiers: __spreadArray$2(__spreadArray$2([], options.modifiers, true), [
	                { name: 'eventListeners', enabled: false },
	            ], false) })); });
	        this._visible = false;
	        this._removeClickOutsideListener();
	        // callback function
	        this._options.onHide(this);
	    };
	    return Dropdown;
	}());
	function initDropdowns() {
	    document
	        .querySelectorAll('[data-dropdown-toggle]')
	        .forEach(function ($triggerEl) {
	        var dropdownId = $triggerEl.getAttribute('data-dropdown-toggle');
	        var $dropdownEl = document.getElementById(dropdownId);
	        if ($dropdownEl) {
	            var placement = $triggerEl.getAttribute('data-dropdown-placement');
	            var offsetSkidding = $triggerEl.getAttribute('data-dropdown-offset-skidding');
	            var offsetDistance = $triggerEl.getAttribute('data-dropdown-offset-distance');
	            var triggerType = $triggerEl.getAttribute('data-dropdown-trigger');
	            var delay = $triggerEl.getAttribute('data-dropdown-delay');
	            var ignoreClickOutsideClass = $triggerEl.getAttribute('data-dropdown-ignore-click-outside-class');
	            new Dropdown($dropdownEl, $triggerEl, {
	                placement: placement ? placement : Default$7.placement,
	                triggerType: triggerType
	                    ? triggerType
	                    : Default$7.triggerType,
	                offsetSkidding: offsetSkidding
	                    ? parseInt(offsetSkidding)
	                    : Default$7.offsetSkidding,
	                offsetDistance: offsetDistance
	                    ? parseInt(offsetDistance)
	                    : Default$7.offsetDistance,
	                delay: delay ? parseInt(delay) : Default$7.delay,
	                ignoreClickOutsideClass: ignoreClickOutsideClass
	                    ? ignoreClickOutsideClass
	                    : Default$7.ignoreClickOutsideClass,
	            });
	        }
	        else {
	            console.error("The dropdown element with id \"".concat(dropdownId, "\" does not exist. Please check the data-dropdown-toggle attribute."));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Dropdown = Dropdown;
	    window.initDropdowns = initDropdowns;
	}

	var __assign$6 = (undefined && undefined.__assign) || function () {
	    __assign$6 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$6.apply(this, arguments);
	};
	var Default$6 = {
	    placement: 'center',
	    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
	    backdrop: 'dynamic',
	    closable: true,
	    onHide: function () { },
	    onShow: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$6 = {
	    id: null,
	    override: true,
	};
	var Modal = /** @class */ (function () {
	    function Modal(targetEl, options, instanceOptions) {
	        if (targetEl === void 0) { targetEl = null; }
	        if (options === void 0) { options = Default$6; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$6; }
	        this._eventListenerInstances = [];
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._targetEl = targetEl;
	        this._options = __assign$6(__assign$6({}, Default$6), options);
	        this._isHidden = true;
	        this._backdropEl = null;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Modal', this, this._instanceId, instanceOptions.override);
	    }
	    Modal.prototype.init = function () {
	        var _this = this;
	        if (this._targetEl && !this._initialized) {
	            this._getPlacementClasses().map(function (c) {
	                _this._targetEl.classList.add(c);
	            });
	            this._initialized = true;
	        }
	    };
	    Modal.prototype.destroy = function () {
	        if (this._initialized) {
	            this.removeAllEventListenerInstances();
	            this._destroyBackdropEl();
	            this._initialized = false;
	        }
	    };
	    Modal.prototype.removeInstance = function () {
	        instances$1.removeInstance('Modal', this._instanceId);
	    };
	    Modal.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Modal.prototype._createBackdrop = function () {
	        var _a;
	        if (this._isHidden) {
	            var backdropEl = document.createElement('div');
	            backdropEl.setAttribute('modal-backdrop', '');
	            (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(' '));
	            document.querySelector('body').append(backdropEl);
	            this._backdropEl = backdropEl;
	        }
	    };
	    Modal.prototype._destroyBackdropEl = function () {
	        if (!this._isHidden) {
	            document.querySelector('[modal-backdrop]').remove();
	        }
	    };
	    Modal.prototype._setupModalCloseEventListeners = function () {
	        var _this = this;
	        if (this._options.backdrop === 'dynamic') {
	            this._clickOutsideEventListener = function (ev) {
	                _this._handleOutsideClick(ev.target);
	            };
	            this._targetEl.addEventListener('click', this._clickOutsideEventListener, true);
	        }
	        this._keydownEventListener = function (ev) {
	            if (ev.key === 'Escape') {
	                _this.hide();
	            }
	        };
	        document.body.addEventListener('keydown', this._keydownEventListener, true);
	    };
	    Modal.prototype._removeModalCloseEventListeners = function () {
	        if (this._options.backdrop === 'dynamic') {
	            this._targetEl.removeEventListener('click', this._clickOutsideEventListener, true);
	        }
	        document.body.removeEventListener('keydown', this._keydownEventListener, true);
	    };
	    Modal.prototype._handleOutsideClick = function (target) {
	        if (target === this._targetEl ||
	            (target === this._backdropEl && this.isVisible())) {
	            this.hide();
	        }
	    };
	    Modal.prototype._getPlacementClasses = function () {
	        switch (this._options.placement) {
	            // top
	            case 'top-left':
	                return ['justify-start', 'items-start'];
	            case 'top-center':
	                return ['justify-center', 'items-start'];
	            case 'top-right':
	                return ['justify-end', 'items-start'];
	            // center
	            case 'center-left':
	                return ['justify-start', 'items-center'];
	            case 'center':
	                return ['justify-center', 'items-center'];
	            case 'center-right':
	                return ['justify-end', 'items-center'];
	            // bottom
	            case 'bottom-left':
	                return ['justify-start', 'items-end'];
	            case 'bottom-center':
	                return ['justify-center', 'items-end'];
	            case 'bottom-right':
	                return ['justify-end', 'items-end'];
	            default:
	                return ['justify-center', 'items-center'];
	        }
	    };
	    Modal.prototype.toggle = function () {
	        if (this._isHidden) {
	            this.show();
	        }
	        else {
	            this.hide();
	        }
	        // callback function
	        this._options.onToggle(this);
	    };
	    Modal.prototype.show = function () {
	        if (this.isHidden) {
	            this._targetEl.classList.add('flex');
	            this._targetEl.classList.remove('hidden');
	            this._targetEl.setAttribute('aria-modal', 'true');
	            this._targetEl.setAttribute('role', 'dialog');
	            this._targetEl.removeAttribute('aria-hidden');
	            this._createBackdrop();
	            this._isHidden = false;
	            // Add keyboard event listener to the document
	            if (this._options.closable) {
	                this._setupModalCloseEventListeners();
	            }
	            // prevent body scroll
	            document.body.classList.add('overflow-hidden');
	            // callback function
	            this._options.onShow(this);
	        }
	    };
	    Modal.prototype.hide = function () {
	        if (this.isVisible) {
	            this._targetEl.classList.add('hidden');
	            this._targetEl.classList.remove('flex');
	            this._targetEl.setAttribute('aria-hidden', 'true');
	            this._targetEl.removeAttribute('aria-modal');
	            this._targetEl.removeAttribute('role');
	            this._destroyBackdropEl();
	            this._isHidden = true;
	            // re-apply body scroll
	            document.body.classList.remove('overflow-hidden');
	            if (this._options.closable) {
	                this._removeModalCloseEventListeners();
	            }
	            // callback function
	            this._options.onHide(this);
	        }
	    };
	    Modal.prototype.isVisible = function () {
	        return !this._isHidden;
	    };
	    Modal.prototype.isHidden = function () {
	        return this._isHidden;
	    };
	    Modal.prototype.addEventListenerInstance = function (element, type, handler) {
	        this._eventListenerInstances.push({
	            element: element,
	            type: type,
	            handler: handler,
	        });
	    };
	    Modal.prototype.removeAllEventListenerInstances = function () {
	        this._eventListenerInstances.map(function (eventListenerInstance) {
	            eventListenerInstance.element.removeEventListener(eventListenerInstance.type, eventListenerInstance.handler);
	        });
	        this._eventListenerInstances = [];
	    };
	    Modal.prototype.getAllEventListenerInstances = function () {
	        return this._eventListenerInstances;
	    };
	    return Modal;
	}());
	function initModals() {
	    // initiate modal based on data-modal-target
	    document.querySelectorAll('[data-modal-target]').forEach(function ($triggerEl) {
	        var modalId = $triggerEl.getAttribute('data-modal-target');
	        var $modalEl = document.getElementById(modalId);
	        if ($modalEl) {
	            var placement = $modalEl.getAttribute('data-modal-placement');
	            var backdrop = $modalEl.getAttribute('data-modal-backdrop');
	            new Modal($modalEl, {
	                placement: placement ? placement : Default$6.placement,
	                backdrop: backdrop ? backdrop : Default$6.backdrop,
	            });
	        }
	        else {
	            console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-target attribute points to the correct modal id?."));
	        }
	    });
	    // toggle modal visibility
	    document.querySelectorAll('[data-modal-toggle]').forEach(function ($triggerEl) {
	        var modalId = $triggerEl.getAttribute('data-modal-toggle');
	        var $modalEl = document.getElementById(modalId);
	        if ($modalEl) {
	            var modal_1 = instances$1.getInstance('Modal', modalId);
	            if (modal_1) {
	                var toggleModal = function () {
	                    modal_1.toggle();
	                };
	                $triggerEl.addEventListener('click', toggleModal);
	                modal_1.addEventListenerInstance($triggerEl, 'click', toggleModal);
	            }
	            else {
	                console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
	            }
	        }
	        else {
	            console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-toggle attribute points to the correct modal id?"));
	        }
	    });
	    // show modal on click if exists based on id
	    document.querySelectorAll('[data-modal-show]').forEach(function ($triggerEl) {
	        var modalId = $triggerEl.getAttribute('data-modal-show');
	        var $modalEl = document.getElementById(modalId);
	        if ($modalEl) {
	            var modal_2 = instances$1.getInstance('Modal', modalId);
	            if (modal_2) {
	                var showModal = function () {
	                    modal_2.show();
	                };
	                $triggerEl.addEventListener('click', showModal);
	                modal_2.addEventListenerInstance($triggerEl, 'click', showModal);
	            }
	            else {
	                console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
	            }
	        }
	        else {
	            console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-show attribute points to the correct modal id?"));
	        }
	    });
	    // hide modal on click if exists based on id
	    document.querySelectorAll('[data-modal-hide]').forEach(function ($triggerEl) {
	        var modalId = $triggerEl.getAttribute('data-modal-hide');
	        var $modalEl = document.getElementById(modalId);
	        if ($modalEl) {
	            var modal_3 = instances$1.getInstance('Modal', modalId);
	            if (modal_3) {
	                var hideModal = function () {
	                    modal_3.hide();
	                };
	                $triggerEl.addEventListener('click', hideModal);
	                modal_3.addEventListenerInstance($triggerEl, 'click', hideModal);
	            }
	            else {
	                console.error("Modal with id ".concat(modalId, " has not been initialized. Please initialize it using the data-modal-target attribute."));
	            }
	        }
	        else {
	            console.error("Modal with id ".concat(modalId, " does not exist. Are you sure that the data-modal-hide attribute points to the correct modal id?"));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Modal = Modal;
	    window.initModals = initModals;
	}

	var __assign$5 = (undefined && undefined.__assign) || function () {
	    __assign$5 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$5.apply(this, arguments);
	};
	var Default$5 = {
	    placement: 'left',
	    bodyScrolling: false,
	    backdrop: true,
	    edge: false,
	    edgeOffset: 'bottom-[60px]',
	    backdropClasses: 'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-30',
	    onShow: function () { },
	    onHide: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$5 = {
	    id: null,
	    override: true,
	};
	var Drawer = /** @class */ (function () {
	    function Drawer(targetEl, options, instanceOptions) {
	        if (targetEl === void 0) { targetEl = null; }
	        if (options === void 0) { options = Default$5; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$5; }
	        this._eventListenerInstances = [];
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._targetEl = targetEl;
	        this._options = __assign$5(__assign$5({}, Default$5), options);
	        this._visible = false;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Drawer', this, this._instanceId, instanceOptions.override);
	    }
	    Drawer.prototype.init = function () {
	        var _this = this;
	        // set initial accessibility attributes
	        if (this._targetEl && !this._initialized) {
	            this._targetEl.setAttribute('aria-hidden', 'true');
	            this._targetEl.classList.add('transition-transform');
	            // set base placement classes
	            this._getPlacementClasses(this._options.placement).base.map(function (c) {
	                _this._targetEl.classList.add(c);
	            });
	            this._handleEscapeKey = function (event) {
	                if (event.key === 'Escape') {
	                    // if 'Escape' key is pressed
	                    if (_this.isVisible()) {
	                        // if the Drawer is visible
	                        _this.hide(); // hide the Drawer
	                    }
	                }
	            };
	            // add keyboard event listener to document
	            document.addEventListener('keydown', this._handleEscapeKey);
	            this._initialized = true;
	        }
	    };
	    Drawer.prototype.destroy = function () {
	        if (this._initialized) {
	            this.removeAllEventListenerInstances();
	            this._destroyBackdropEl();
	            // Remove the keyboard event listener
	            document.removeEventListener('keydown', this._handleEscapeKey);
	            this._initialized = false;
	        }
	    };
	    Drawer.prototype.removeInstance = function () {
	        instances$1.removeInstance('Drawer', this._instanceId);
	    };
	    Drawer.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Drawer.prototype.hide = function () {
	        var _this = this;
	        // based on the edge option show placement classes
	        if (this._options.edge) {
	            this._getPlacementClasses(this._options.placement + '-edge').active.map(function (c) {
	                _this._targetEl.classList.remove(c);
	            });
	            this._getPlacementClasses(this._options.placement + '-edge').inactive.map(function (c) {
	                _this._targetEl.classList.add(c);
	            });
	        }
	        else {
	            this._getPlacementClasses(this._options.placement).active.map(function (c) {
	                _this._targetEl.classList.remove(c);
	            });
	            this._getPlacementClasses(this._options.placement).inactive.map(function (c) {
	                _this._targetEl.classList.add(c);
	            });
	        }
	        // set accessibility attributes
	        this._targetEl.setAttribute('aria-hidden', 'true');
	        this._targetEl.removeAttribute('aria-modal');
	        this._targetEl.removeAttribute('role');
	        // enable body scroll
	        if (!this._options.bodyScrolling) {
	            document.body.classList.remove('overflow-hidden');
	        }
	        // destroy backdrop
	        if (this._options.backdrop) {
	            this._destroyBackdropEl();
	        }
	        this._visible = false;
	        // callback function
	        this._options.onHide(this);
	    };
	    Drawer.prototype.show = function () {
	        var _this = this;
	        if (this._options.edge) {
	            this._getPlacementClasses(this._options.placement + '-edge').active.map(function (c) {
	                _this._targetEl.classList.add(c);
	            });
	            this._getPlacementClasses(this._options.placement + '-edge').inactive.map(function (c) {
	                _this._targetEl.classList.remove(c);
	            });
	        }
	        else {
	            this._getPlacementClasses(this._options.placement).active.map(function (c) {
	                _this._targetEl.classList.add(c);
	            });
	            this._getPlacementClasses(this._options.placement).inactive.map(function (c) {
	                _this._targetEl.classList.remove(c);
	            });
	        }
	        // set accessibility attributes
	        this._targetEl.setAttribute('aria-modal', 'true');
	        this._targetEl.setAttribute('role', 'dialog');
	        this._targetEl.removeAttribute('aria-hidden');
	        // disable body scroll
	        if (!this._options.bodyScrolling) {
	            document.body.classList.add('overflow-hidden');
	        }
	        // show backdrop
	        if (this._options.backdrop) {
	            this._createBackdrop();
	        }
	        this._visible = true;
	        // callback function
	        this._options.onShow(this);
	    };
	    Drawer.prototype.toggle = function () {
	        if (this.isVisible()) {
	            this.hide();
	        }
	        else {
	            this.show();
	        }
	    };
	    Drawer.prototype._createBackdrop = function () {
	        var _a;
	        var _this = this;
	        if (!this._visible) {
	            var backdropEl = document.createElement('div');
	            backdropEl.setAttribute('drawer-backdrop', '');
	            (_a = backdropEl.classList).add.apply(_a, this._options.backdropClasses.split(' '));
	            document.querySelector('body').append(backdropEl);
	            backdropEl.addEventListener('click', function () {
	                _this.hide();
	            });
	        }
	    };
	    Drawer.prototype._destroyBackdropEl = function () {
	        if (this._visible) {
	            document.querySelector('[drawer-backdrop]').remove();
	        }
	    };
	    Drawer.prototype._getPlacementClasses = function (placement) {
	        switch (placement) {
	            case 'top':
	                return {
	                    base: ['top-0', 'left-0', 'right-0'],
	                    active: ['transform-none'],
	                    inactive: ['-translate-y-full'],
	                };
	            case 'right':
	                return {
	                    base: ['right-0', 'top-0'],
	                    active: ['transform-none'],
	                    inactive: ['translate-x-full'],
	                };
	            case 'bottom':
	                return {
	                    base: ['bottom-0', 'left-0', 'right-0'],
	                    active: ['transform-none'],
	                    inactive: ['translate-y-full'],
	                };
	            case 'left':
	                return {
	                    base: ['left-0', 'top-0'],
	                    active: ['transform-none'],
	                    inactive: ['-translate-x-full'],
	                };
	            case 'bottom-edge':
	                return {
	                    base: ['left-0', 'top-0'],
	                    active: ['transform-none'],
	                    inactive: ['translate-y-full', this._options.edgeOffset],
	                };
	            default:
	                return {
	                    base: ['left-0', 'top-0'],
	                    active: ['transform-none'],
	                    inactive: ['-translate-x-full'],
	                };
	        }
	    };
	    Drawer.prototype.isHidden = function () {
	        return !this._visible;
	    };
	    Drawer.prototype.isVisible = function () {
	        return this._visible;
	    };
	    Drawer.prototype.addEventListenerInstance = function (element, type, handler) {
	        this._eventListenerInstances.push({
	            element: element,
	            type: type,
	            handler: handler,
	        });
	    };
	    Drawer.prototype.removeAllEventListenerInstances = function () {
	        this._eventListenerInstances.map(function (eventListenerInstance) {
	            eventListenerInstance.element.removeEventListener(eventListenerInstance.type, eventListenerInstance.handler);
	        });
	        this._eventListenerInstances = [];
	    };
	    Drawer.prototype.getAllEventListenerInstances = function () {
	        return this._eventListenerInstances;
	    };
	    return Drawer;
	}());
	function initDrawers() {
	    document.querySelectorAll('[data-drawer-target]').forEach(function ($triggerEl) {
	        // mandatory
	        var drawerId = $triggerEl.getAttribute('data-drawer-target');
	        var $drawerEl = document.getElementById(drawerId);
	        if ($drawerEl) {
	            var placement = $triggerEl.getAttribute('data-drawer-placement');
	            var bodyScrolling = $triggerEl.getAttribute('data-drawer-body-scrolling');
	            var backdrop = $triggerEl.getAttribute('data-drawer-backdrop');
	            var edge = $triggerEl.getAttribute('data-drawer-edge');
	            var edgeOffset = $triggerEl.getAttribute('data-drawer-edge-offset');
	            new Drawer($drawerEl, {
	                placement: placement ? placement : Default$5.placement,
	                bodyScrolling: bodyScrolling
	                    ? bodyScrolling === 'true'
	                        ? true
	                        : false
	                    : Default$5.bodyScrolling,
	                backdrop: backdrop
	                    ? backdrop === 'true'
	                        ? true
	                        : false
	                    : Default$5.backdrop,
	                edge: edge ? (edge === 'true' ? true : false) : Default$5.edge,
	                edgeOffset: edgeOffset ? edgeOffset : Default$5.edgeOffset,
	            });
	        }
	        else {
	            console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
	        }
	    });
	    document.querySelectorAll('[data-drawer-toggle]').forEach(function ($triggerEl) {
	        var drawerId = $triggerEl.getAttribute('data-drawer-toggle');
	        var $drawerEl = document.getElementById(drawerId);
	        if ($drawerEl) {
	            var drawer_1 = instances$1.getInstance('Drawer', drawerId);
	            if (drawer_1) {
	                var toggleDrawer = function () {
	                    drawer_1.toggle();
	                };
	                $triggerEl.addEventListener('click', toggleDrawer);
	                drawer_1.addEventListenerInstance($triggerEl, 'click', toggleDrawer);
	            }
	            else {
	                console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
	            }
	        }
	        else {
	            console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
	        }
	    });
	    document
	        .querySelectorAll('[data-drawer-dismiss], [data-drawer-hide]')
	        .forEach(function ($triggerEl) {
	        var drawerId = $triggerEl.getAttribute('data-drawer-dismiss')
	            ? $triggerEl.getAttribute('data-drawer-dismiss')
	            : $triggerEl.getAttribute('data-drawer-hide');
	        var $drawerEl = document.getElementById(drawerId);
	        if ($drawerEl) {
	            var drawer_2 = instances$1.getInstance('Drawer', drawerId);
	            if (drawer_2) {
	                var hideDrawer = function () {
	                    drawer_2.hide();
	                };
	                $triggerEl.addEventListener('click', hideDrawer);
	                drawer_2.addEventListenerInstance($triggerEl, 'click', hideDrawer);
	            }
	            else {
	                console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
	            }
	        }
	        else {
	            console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id"));
	        }
	    });
	    document.querySelectorAll('[data-drawer-show]').forEach(function ($triggerEl) {
	        var drawerId = $triggerEl.getAttribute('data-drawer-show');
	        var $drawerEl = document.getElementById(drawerId);
	        if ($drawerEl) {
	            var drawer_3 = instances$1.getInstance('Drawer', drawerId);
	            if (drawer_3) {
	                var showDrawer = function () {
	                    drawer_3.show();
	                };
	                $triggerEl.addEventListener('click', showDrawer);
	                drawer_3.addEventListenerInstance($triggerEl, 'click', showDrawer);
	            }
	            else {
	                console.error("Drawer with id ".concat(drawerId, " has not been initialized. Please initialize it using the data-drawer-target attribute."));
	            }
	        }
	        else {
	            console.error("Drawer with id ".concat(drawerId, " not found. Are you sure that the data-drawer-target attribute points to the correct drawer id?"));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Drawer = Drawer;
	    window.initDrawers = initDrawers;
	}

	var __assign$4 = (undefined && undefined.__assign) || function () {
	    __assign$4 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$4.apply(this, arguments);
	};
	var Default$4 = {
	    defaultTabId: null,
	    activeClasses: 'text-blue-600 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500 border-blue-600 dark:border-blue-500',
	    inactiveClasses: 'dark:border-transparent text-gray-500 hover:text-gray-600 dark:text-gray-400 border-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:text-gray-300',
	    onShow: function () { },
	};
	var DefaultInstanceOptions$4 = {
	    id: null,
	    override: true,
	};
	var Tabs = /** @class */ (function () {
	    function Tabs(tabsEl, items, options, instanceOptions) {
	        if (tabsEl === void 0) { tabsEl = null; }
	        if (items === void 0) { items = []; }
	        if (options === void 0) { options = Default$4; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$4; }
	        this._instanceId = instanceOptions.id ? instanceOptions.id : tabsEl.id;
	        this._tabsEl = tabsEl;
	        this._items = items;
	        this._activeTab = options ? this.getTab(options.defaultTabId) : null;
	        this._options = __assign$4(__assign$4({}, Default$4), options);
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Tabs', this, this._tabsEl.id, true);
	        instances$1.addInstance('Tabs', this, this._instanceId, instanceOptions.override);
	    }
	    Tabs.prototype.init = function () {
	        var _this = this;
	        if (this._items.length && !this._initialized) {
	            // set the first tab as active if not set by explicitly
	            if (!this._activeTab) {
	                this.setActiveTab(this._items[0]);
	            }
	            // force show the first default tab
	            this.show(this._activeTab.id, true);
	            // show tab content based on click
	            this._items.map(function (tab) {
	                tab.triggerEl.addEventListener('click', function () {
	                    _this.show(tab.id);
	                });
	            });
	        }
	    };
	    Tabs.prototype.destroy = function () {
	        if (this._initialized) {
	            this._initialized = false;
	        }
	    };
	    Tabs.prototype.removeInstance = function () {
	        this.destroy();
	        instances$1.removeInstance('Tabs', this._instanceId);
	    };
	    Tabs.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Tabs.prototype.getActiveTab = function () {
	        return this._activeTab;
	    };
	    Tabs.prototype.setActiveTab = function (tab) {
	        this._activeTab = tab;
	    };
	    Tabs.prototype.getTab = function (id) {
	        return this._items.filter(function (t) { return t.id === id; })[0];
	    };
	    Tabs.prototype.show = function (id, forceShow) {
	        var _a, _b;
	        var _this = this;
	        if (forceShow === void 0) { forceShow = false; }
	        var tab = this.getTab(id);
	        // don't do anything if already active
	        if (tab === this._activeTab && !forceShow) {
	            return;
	        }
	        // hide other tabs
	        this._items.map(function (t) {
	            var _a, _b;
	            if (t !== tab) {
	                (_a = t.triggerEl.classList).remove.apply(_a, _this._options.activeClasses.split(' '));
	                (_b = t.triggerEl.classList).add.apply(_b, _this._options.inactiveClasses.split(' '));
	                t.targetEl.classList.add('hidden');
	                t.triggerEl.setAttribute('aria-selected', 'false');
	            }
	        });
	        // show active tab
	        (_a = tab.triggerEl.classList).add.apply(_a, this._options.activeClasses.split(' '));
	        (_b = tab.triggerEl.classList).remove.apply(_b, this._options.inactiveClasses.split(' '));
	        tab.triggerEl.setAttribute('aria-selected', 'true');
	        tab.targetEl.classList.remove('hidden');
	        this.setActiveTab(tab);
	        // callback function
	        this._options.onShow(this, tab);
	    };
	    return Tabs;
	}());
	function initTabs() {
	    document.querySelectorAll('[data-tabs-toggle]').forEach(function ($parentEl) {
	        var tabItems = [];
	        var defaultTabId = null;
	        $parentEl
	            .querySelectorAll('[role="tab"]')
	            .forEach(function ($triggerEl) {
	            var isActive = $triggerEl.getAttribute('aria-selected') === 'true';
	            var tab = {
	                id: $triggerEl.getAttribute('data-tabs-target'),
	                triggerEl: $triggerEl,
	                targetEl: document.querySelector($triggerEl.getAttribute('data-tabs-target')),
	            };
	            tabItems.push(tab);
	            if (isActive) {
	                defaultTabId = tab.id;
	            }
	        });
	        new Tabs($parentEl, tabItems, {
	            defaultTabId: defaultTabId,
	        });
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Tabs = Tabs;
	    window.initTabs = initTabs;
	}

	var __assign$3 = (undefined && undefined.__assign) || function () {
	    __assign$3 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$3.apply(this, arguments);
	};
	var __spreadArray$1 = (undefined && undefined.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	var Default$3 = {
	    placement: 'top',
	    triggerType: 'hover',
	    onShow: function () { },
	    onHide: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$3 = {
	    id: null,
	    override: true,
	};
	var Tooltip$1 = /** @class */ (function () {
	    function Tooltip(targetEl, triggerEl, options, instanceOptions) {
	        if (targetEl === void 0) { targetEl = null; }
	        if (triggerEl === void 0) { triggerEl = null; }
	        if (options === void 0) { options = Default$3; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$3; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._targetEl = targetEl;
	        this._triggerEl = triggerEl;
	        this._options = __assign$3(__assign$3({}, Default$3), options);
	        this._popperInstance = null;
	        this._visible = false;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Tooltip', this, this._instanceId, instanceOptions.override);
	    }
	    Tooltip.prototype.init = function () {
	        if (this._triggerEl && this._targetEl && !this._initialized) {
	            this._setupEventListeners();
	            this._popperInstance = this._createPopperInstance();
	            this._initialized = true;
	        }
	    };
	    Tooltip.prototype.destroy = function () {
	        var _this = this;
	        if (this._initialized) {
	            // remove event listeners associated with the trigger element
	            var triggerEvents = this._getTriggerEvents();
	            triggerEvents.showEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._showHandler);
	            });
	            triggerEvents.hideEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._hideHandler);
	            });
	            // remove event listeners for keydown
	            this._removeKeydownListener();
	            // remove event listeners for click outside
	            this._removeClickOutsideListener();
	            // destroy the Popper instance if you have one (assuming this._popperInstance is the Popper instance)
	            if (this._popperInstance) {
	                this._popperInstance.destroy();
	            }
	            this._initialized = false;
	        }
	    };
	    Tooltip.prototype.removeInstance = function () {
	        instances$1.removeInstance('Tooltip', this._instanceId);
	    };
	    Tooltip.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Tooltip.prototype._setupEventListeners = function () {
	        var _this = this;
	        var triggerEvents = this._getTriggerEvents();
	        this._showHandler = function () {
	            _this.show();
	        };
	        this._hideHandler = function () {
	            _this.hide();
	        };
	        triggerEvents.showEvents.forEach(function (ev) {
	            _this._triggerEl.addEventListener(ev, _this._showHandler);
	        });
	        triggerEvents.hideEvents.forEach(function (ev) {
	            _this._triggerEl.addEventListener(ev, _this._hideHandler);
	        });
	    };
	    Tooltip.prototype._createPopperInstance = function () {
	        return createPopper(this._triggerEl, this._targetEl, {
	            placement: this._options.placement,
	            modifiers: [
	                {
	                    name: 'offset',
	                    options: {
	                        offset: [0, 8],
	                    },
	                },
	            ],
	        });
	    };
	    Tooltip.prototype._getTriggerEvents = function () {
	        switch (this._options.triggerType) {
	            case 'hover':
	                return {
	                    showEvents: ['mouseenter', 'focus'],
	                    hideEvents: ['mouseleave', 'blur'],
	                };
	            case 'click':
	                return {
	                    showEvents: ['click', 'focus'],
	                    hideEvents: ['focusout', 'blur'],
	                };
	            case 'none':
	                return {
	                    showEvents: [],
	                    hideEvents: [],
	                };
	            default:
	                return {
	                    showEvents: ['mouseenter', 'focus'],
	                    hideEvents: ['mouseleave', 'blur'],
	                };
	        }
	    };
	    Tooltip.prototype._setupKeydownListener = function () {
	        var _this = this;
	        this._keydownEventListener = function (ev) {
	            if (ev.key === 'Escape') {
	                _this.hide();
	            }
	        };
	        document.body.addEventListener('keydown', this._keydownEventListener, true);
	    };
	    Tooltip.prototype._removeKeydownListener = function () {
	        document.body.removeEventListener('keydown', this._keydownEventListener, true);
	    };
	    Tooltip.prototype._setupClickOutsideListener = function () {
	        var _this = this;
	        this._clickOutsideEventListener = function (ev) {
	            _this._handleClickOutside(ev, _this._targetEl);
	        };
	        document.body.addEventListener('click', this._clickOutsideEventListener, true);
	    };
	    Tooltip.prototype._removeClickOutsideListener = function () {
	        document.body.removeEventListener('click', this._clickOutsideEventListener, true);
	    };
	    Tooltip.prototype._handleClickOutside = function (ev, targetEl) {
	        var clickedEl = ev.target;
	        if (clickedEl !== targetEl &&
	            !targetEl.contains(clickedEl) &&
	            !this._triggerEl.contains(clickedEl) &&
	            this.isVisible()) {
	            this.hide();
	        }
	    };
	    Tooltip.prototype.isVisible = function () {
	        return this._visible;
	    };
	    Tooltip.prototype.toggle = function () {
	        if (this.isVisible()) {
	            this.hide();
	        }
	        else {
	            this.show();
	        }
	    };
	    Tooltip.prototype.show = function () {
	        this._targetEl.classList.remove('opacity-0', 'invisible');
	        this._targetEl.classList.add('opacity-100', 'visible');
	        // Enable the event listeners
	        this._popperInstance.setOptions(function (options) { return (__assign$3(__assign$3({}, options), { modifiers: __spreadArray$1(__spreadArray$1([], options.modifiers, true), [
	                { name: 'eventListeners', enabled: true },
	            ], false) })); });
	        // handle click outside
	        this._setupClickOutsideListener();
	        // handle esc keydown
	        this._setupKeydownListener();
	        // Update its position
	        this._popperInstance.update();
	        // set visibility
	        this._visible = true;
	        // callback function
	        this._options.onShow(this);
	    };
	    Tooltip.prototype.hide = function () {
	        this._targetEl.classList.remove('opacity-100', 'visible');
	        this._targetEl.classList.add('opacity-0', 'invisible');
	        // Disable the event listeners
	        this._popperInstance.setOptions(function (options) { return (__assign$3(__assign$3({}, options), { modifiers: __spreadArray$1(__spreadArray$1([], options.modifiers, true), [
	                { name: 'eventListeners', enabled: false },
	            ], false) })); });
	        // handle click outside
	        this._removeClickOutsideListener();
	        // handle esc keydown
	        this._removeKeydownListener();
	        // set visibility
	        this._visible = false;
	        // callback function
	        this._options.onHide(this);
	    };
	    return Tooltip;
	}());
	function initTooltips() {
	    document.querySelectorAll('[data-tooltip-target]').forEach(function ($triggerEl) {
	        var tooltipId = $triggerEl.getAttribute('data-tooltip-target');
	        var $tooltipEl = document.getElementById(tooltipId);
	        if ($tooltipEl) {
	            var triggerType = $triggerEl.getAttribute('data-tooltip-trigger');
	            var placement = $triggerEl.getAttribute('data-tooltip-placement');
	            new Tooltip$1($tooltipEl, $triggerEl, {
	                placement: placement ? placement : Default$3.placement,
	                triggerType: triggerType
	                    ? triggerType
	                    : Default$3.triggerType,
	            });
	        }
	        else {
	            console.error("The tooltip element with id \"".concat(tooltipId, "\" does not exist. Please check the data-tooltip-target attribute."));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Tooltip = Tooltip$1;
	    window.initTooltips = initTooltips;
	}

	var __assign$2 = (undefined && undefined.__assign) || function () {
	    __assign$2 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$2.apply(this, arguments);
	};
	var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
	    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	        if (ar || !(i in from)) {
	            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	            ar[i] = from[i];
	        }
	    }
	    return to.concat(ar || Array.prototype.slice.call(from));
	};
	var Default$2 = {
	    placement: 'top',
	    offset: 10,
	    triggerType: 'hover',
	    onShow: function () { },
	    onHide: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$2 = {
	    id: null,
	    override: true,
	};
	var Popover = /** @class */ (function () {
	    function Popover(targetEl, triggerEl, options, instanceOptions) {
	        if (targetEl === void 0) { targetEl = null; }
	        if (triggerEl === void 0) { triggerEl = null; }
	        if (options === void 0) { options = Default$2; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$2; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._targetEl = targetEl;
	        this._triggerEl = triggerEl;
	        this._options = __assign$2(__assign$2({}, Default$2), options);
	        this._popperInstance = null;
	        this._visible = false;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Popover', this, instanceOptions.id ? instanceOptions.id : this._targetEl.id, instanceOptions.override);
	    }
	    Popover.prototype.init = function () {
	        if (this._triggerEl && this._targetEl && !this._initialized) {
	            this._setupEventListeners();
	            this._popperInstance = this._createPopperInstance();
	            this._initialized = true;
	        }
	    };
	    Popover.prototype.destroy = function () {
	        var _this = this;
	        if (this._initialized) {
	            // remove event listeners associated with the trigger element and target element
	            var triggerEvents = this._getTriggerEvents();
	            triggerEvents.showEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._showHandler);
	                _this._targetEl.removeEventListener(ev, _this._showHandler);
	            });
	            triggerEvents.hideEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._hideHandler);
	                _this._targetEl.removeEventListener(ev, _this._hideHandler);
	            });
	            // remove event listeners for keydown
	            this._removeKeydownListener();
	            // remove event listeners for click outside
	            this._removeClickOutsideListener();
	            // destroy the Popper instance if you have one (assuming this._popperInstance is the Popper instance)
	            if (this._popperInstance) {
	                this._popperInstance.destroy();
	            }
	            this._initialized = false;
	        }
	    };
	    Popover.prototype.removeInstance = function () {
	        instances$1.removeInstance('Popover', this._instanceId);
	    };
	    Popover.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Popover.prototype._setupEventListeners = function () {
	        var _this = this;
	        var triggerEvents = this._getTriggerEvents();
	        this._showHandler = function () {
	            _this.show();
	        };
	        this._hideHandler = function () {
	            setTimeout(function () {
	                if (!_this._targetEl.matches(':hover')) {
	                    _this.hide();
	                }
	            }, 100);
	        };
	        triggerEvents.showEvents.forEach(function (ev) {
	            _this._triggerEl.addEventListener(ev, _this._showHandler);
	            _this._targetEl.addEventListener(ev, _this._showHandler);
	        });
	        triggerEvents.hideEvents.forEach(function (ev) {
	            _this._triggerEl.addEventListener(ev, _this._hideHandler);
	            _this._targetEl.addEventListener(ev, _this._hideHandler);
	        });
	    };
	    Popover.prototype._createPopperInstance = function () {
	        return createPopper(this._triggerEl, this._targetEl, {
	            placement: this._options.placement,
	            modifiers: [
	                {
	                    name: 'offset',
	                    options: {
	                        offset: [0, this._options.offset],
	                    },
	                },
	            ],
	        });
	    };
	    Popover.prototype._getTriggerEvents = function () {
	        switch (this._options.triggerType) {
	            case 'hover':
	                return {
	                    showEvents: ['mouseenter', 'focus'],
	                    hideEvents: ['mouseleave', 'blur'],
	                };
	            case 'click':
	                return {
	                    showEvents: ['click', 'focus'],
	                    hideEvents: ['focusout', 'blur'],
	                };
	            case 'none':
	                return {
	                    showEvents: [],
	                    hideEvents: [],
	                };
	            default:
	                return {
	                    showEvents: ['mouseenter', 'focus'],
	                    hideEvents: ['mouseleave', 'blur'],
	                };
	        }
	    };
	    Popover.prototype._setupKeydownListener = function () {
	        var _this = this;
	        this._keydownEventListener = function (ev) {
	            if (ev.key === 'Escape') {
	                _this.hide();
	            }
	        };
	        document.body.addEventListener('keydown', this._keydownEventListener, true);
	    };
	    Popover.prototype._removeKeydownListener = function () {
	        document.body.removeEventListener('keydown', this._keydownEventListener, true);
	    };
	    Popover.prototype._setupClickOutsideListener = function () {
	        var _this = this;
	        this._clickOutsideEventListener = function (ev) {
	            _this._handleClickOutside(ev, _this._targetEl);
	        };
	        document.body.addEventListener('click', this._clickOutsideEventListener, true);
	    };
	    Popover.prototype._removeClickOutsideListener = function () {
	        document.body.removeEventListener('click', this._clickOutsideEventListener, true);
	    };
	    Popover.prototype._handleClickOutside = function (ev, targetEl) {
	        var clickedEl = ev.target;
	        if (clickedEl !== targetEl &&
	            !targetEl.contains(clickedEl) &&
	            !this._triggerEl.contains(clickedEl) &&
	            this.isVisible()) {
	            this.hide();
	        }
	    };
	    Popover.prototype.isVisible = function () {
	        return this._visible;
	    };
	    Popover.prototype.toggle = function () {
	        if (this.isVisible()) {
	            this.hide();
	        }
	        else {
	            this.show();
	        }
	        this._options.onToggle(this);
	    };
	    Popover.prototype.show = function () {
	        this._targetEl.classList.remove('opacity-0', 'invisible');
	        this._targetEl.classList.add('opacity-100', 'visible');
	        // Enable the event listeners
	        this._popperInstance.setOptions(function (options) { return (__assign$2(__assign$2({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
	                { name: 'eventListeners', enabled: true },
	            ], false) })); });
	        // handle click outside
	        this._setupClickOutsideListener();
	        // handle esc keydown
	        this._setupKeydownListener();
	        // Update its position
	        this._popperInstance.update();
	        // set visibility to true
	        this._visible = true;
	        // callback function
	        this._options.onShow(this);
	    };
	    Popover.prototype.hide = function () {
	        this._targetEl.classList.remove('opacity-100', 'visible');
	        this._targetEl.classList.add('opacity-0', 'invisible');
	        // Disable the event listeners
	        this._popperInstance.setOptions(function (options) { return (__assign$2(__assign$2({}, options), { modifiers: __spreadArray(__spreadArray([], options.modifiers, true), [
	                { name: 'eventListeners', enabled: false },
	            ], false) })); });
	        // handle click outside
	        this._removeClickOutsideListener();
	        // handle esc keydown
	        this._removeKeydownListener();
	        // set visibility to false
	        this._visible = false;
	        // callback function
	        this._options.onHide(this);
	    };
	    return Popover;
	}());
	function initPopovers() {
	    document.querySelectorAll('[data-popover-target]').forEach(function ($triggerEl) {
	        var popoverID = $triggerEl.getAttribute('data-popover-target');
	        var $popoverEl = document.getElementById(popoverID);
	        if ($popoverEl) {
	            var triggerType = $triggerEl.getAttribute('data-popover-trigger');
	            var placement = $triggerEl.getAttribute('data-popover-placement');
	            var offset = $triggerEl.getAttribute('data-popover-offset');
	            new Popover($popoverEl, $triggerEl, {
	                placement: placement ? placement : Default$2.placement,
	                offset: offset ? parseInt(offset) : Default$2.offset,
	                triggerType: triggerType
	                    ? triggerType
	                    : Default$2.triggerType,
	            });
	        }
	        else {
	            console.error("The popover element with id \"".concat(popoverID, "\" does not exist. Please check the data-popover-target attribute."));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Popover = Popover;
	    window.initPopovers = initPopovers;
	}

	var __assign$1 = (undefined && undefined.__assign) || function () {
	    __assign$1 = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign$1.apply(this, arguments);
	};
	var Default$1 = {
	    triggerType: 'hover',
	    onShow: function () { },
	    onHide: function () { },
	    onToggle: function () { },
	};
	var DefaultInstanceOptions$1 = {
	    id: null,
	    override: true,
	};
	var Dial = /** @class */ (function () {
	    function Dial(parentEl, triggerEl, targetEl, options, instanceOptions) {
	        if (parentEl === void 0) { parentEl = null; }
	        if (triggerEl === void 0) { triggerEl = null; }
	        if (targetEl === void 0) { targetEl = null; }
	        if (options === void 0) { options = Default$1; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions$1; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._parentEl = parentEl;
	        this._triggerEl = triggerEl;
	        this._targetEl = targetEl;
	        this._options = __assign$1(__assign$1({}, Default$1), options);
	        this._visible = false;
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('Dial', this, this._instanceId, instanceOptions.override);
	    }
	    Dial.prototype.init = function () {
	        var _this = this;
	        if (this._triggerEl && this._targetEl && !this._initialized) {
	            var triggerEventTypes = this._getTriggerEventTypes(this._options.triggerType);
	            this._showEventHandler = function () {
	                _this.show();
	            };
	            triggerEventTypes.showEvents.forEach(function (ev) {
	                _this._triggerEl.addEventListener(ev, _this._showEventHandler);
	                _this._targetEl.addEventListener(ev, _this._showEventHandler);
	            });
	            this._hideEventHandler = function () {
	                if (!_this._parentEl.matches(':hover')) {
	                    _this.hide();
	                }
	            };
	            triggerEventTypes.hideEvents.forEach(function (ev) {
	                _this._parentEl.addEventListener(ev, _this._hideEventHandler);
	            });
	            this._initialized = true;
	        }
	    };
	    Dial.prototype.destroy = function () {
	        var _this = this;
	        if (this._initialized) {
	            var triggerEventTypes = this._getTriggerEventTypes(this._options.triggerType);
	            triggerEventTypes.showEvents.forEach(function (ev) {
	                _this._triggerEl.removeEventListener(ev, _this._showEventHandler);
	                _this._targetEl.removeEventListener(ev, _this._showEventHandler);
	            });
	            triggerEventTypes.hideEvents.forEach(function (ev) {
	                _this._parentEl.removeEventListener(ev, _this._hideEventHandler);
	            });
	            this._initialized = false;
	        }
	    };
	    Dial.prototype.removeInstance = function () {
	        instances$1.removeInstance('Dial', this._instanceId);
	    };
	    Dial.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    Dial.prototype.hide = function () {
	        this._targetEl.classList.add('hidden');
	        if (this._triggerEl) {
	            this._triggerEl.setAttribute('aria-expanded', 'false');
	        }
	        this._visible = false;
	        // callback function
	        this._options.onHide(this);
	    };
	    Dial.prototype.show = function () {
	        this._targetEl.classList.remove('hidden');
	        if (this._triggerEl) {
	            this._triggerEl.setAttribute('aria-expanded', 'true');
	        }
	        this._visible = true;
	        // callback function
	        this._options.onShow(this);
	    };
	    Dial.prototype.toggle = function () {
	        if (this._visible) {
	            this.hide();
	        }
	        else {
	            this.show();
	        }
	    };
	    Dial.prototype.isHidden = function () {
	        return !this._visible;
	    };
	    Dial.prototype.isVisible = function () {
	        return this._visible;
	    };
	    Dial.prototype._getTriggerEventTypes = function (triggerType) {
	        switch (triggerType) {
	            case 'hover':
	                return {
	                    showEvents: ['mouseenter', 'focus'],
	                    hideEvents: ['mouseleave', 'blur'],
	                };
	            case 'click':
	                return {
	                    showEvents: ['click', 'focus'],
	                    hideEvents: ['focusout', 'blur'],
	                };
	            case 'none':
	                return {
	                    showEvents: [],
	                    hideEvents: [],
	                };
	            default:
	                return {
	                    showEvents: ['mouseenter', 'focus'],
	                    hideEvents: ['mouseleave', 'blur'],
	                };
	        }
	    };
	    return Dial;
	}());
	function initDials() {
	    document.querySelectorAll('[data-dial-init]').forEach(function ($parentEl) {
	        var $triggerEl = $parentEl.querySelector('[data-dial-toggle]');
	        if ($triggerEl) {
	            var dialId = $triggerEl.getAttribute('data-dial-toggle');
	            var $dialEl = document.getElementById(dialId);
	            if ($dialEl) {
	                var triggerType = $triggerEl.getAttribute('data-dial-trigger');
	                new Dial($parentEl, $triggerEl, $dialEl, {
	                    triggerType: triggerType
	                        ? triggerType
	                        : Default$1.triggerType,
	                });
	            }
	            else {
	                console.error("Dial with id ".concat(dialId, " does not exist. Are you sure that the data-dial-toggle attribute points to the correct modal id?"));
	            }
	        }
	        else {
	            console.error("Dial with id ".concat($parentEl.id, " does not have a trigger element. Are you sure that the data-dial-toggle attribute exists?"));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.Dial = Dial;
	    window.initDials = initDials;
	}

	var __assign = (undefined && undefined.__assign) || function () {
	    __assign = Object.assign || function(t) {
	        for (var s, i = 1, n = arguments.length; i < n; i++) {
	            s = arguments[i];
	            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	                t[p] = s[p];
	        }
	        return t;
	    };
	    return __assign.apply(this, arguments);
	};
	var Default = {
	    minValue: null,
	    maxValue: null,
	    onIncrement: function () { },
	    onDecrement: function () { },
	};
	var DefaultInstanceOptions = {
	    id: null,
	    override: true,
	};
	var InputCounter = /** @class */ (function () {
	    function InputCounter(targetEl, incrementEl, decrementEl, options, instanceOptions) {
	        if (targetEl === void 0) { targetEl = null; }
	        if (incrementEl === void 0) { incrementEl = null; }
	        if (decrementEl === void 0) { decrementEl = null; }
	        if (options === void 0) { options = Default; }
	        if (instanceOptions === void 0) { instanceOptions = DefaultInstanceOptions; }
	        this._instanceId = instanceOptions.id
	            ? instanceOptions.id
	            : targetEl.id;
	        this._targetEl = targetEl;
	        this._incrementEl = incrementEl;
	        this._decrementEl = decrementEl;
	        this._options = __assign(__assign({}, Default), options);
	        this._initialized = false;
	        this.init();
	        instances$1.addInstance('InputCounter', this, this._instanceId, instanceOptions.override);
	    }
	    InputCounter.prototype.init = function () {
	        var _this = this;
	        if (this._targetEl && !this._initialized) {
	            this._inputHandler = function (event) {
	                {
	                    var target = event.target;
	                    // check if the value is numeric
	                    if (!/^\d*$/.test(target.value)) {
	                        // Regex to check if the value is numeric
	                        target.value = target.value.replace(/[^\d]/g, ''); // Remove non-numeric characters
	                    }
	                    // check for max value
	                    if (_this._options.maxValue !== null &&
	                        parseInt(target.value) > _this._options.maxValue) {
	                        target.value = _this._options.maxValue.toString();
	                    }
	                    // check for min value
	                    if (_this._options.minValue !== null &&
	                        parseInt(target.value) < _this._options.minValue) {
	                        target.value = _this._options.minValue.toString();
	                    }
	                }
	            };
	            this._incrementClickHandler = function () {
	                _this.increment();
	            };
	            this._decrementClickHandler = function () {
	                _this.decrement();
	            };
	            // Add event listener to restrict input to numeric values only
	            this._targetEl.addEventListener('input', this._inputHandler);
	            if (this._incrementEl) {
	                this._incrementEl.addEventListener('click', this._incrementClickHandler);
	            }
	            if (this._decrementEl) {
	                this._decrementEl.addEventListener('click', this._decrementClickHandler);
	            }
	            this._initialized = true;
	        }
	    };
	    InputCounter.prototype.destroy = function () {
	        if (this._targetEl && this._initialized) {
	            this._targetEl.removeEventListener('input', this._inputHandler);
	            if (this._incrementEl) {
	                this._incrementEl.removeEventListener('click', this._incrementClickHandler);
	            }
	            if (this._decrementEl) {
	                this._decrementEl.removeEventListener('click', this._decrementClickHandler);
	            }
	            this._initialized = false;
	        }
	    };
	    InputCounter.prototype.removeInstance = function () {
	        instances$1.removeInstance('InputCounter', this._instanceId);
	    };
	    InputCounter.prototype.destroyAndRemoveInstance = function () {
	        this.destroy();
	        this.removeInstance();
	    };
	    InputCounter.prototype.getCurrentValue = function () {
	        return parseInt(this._targetEl.value) || 0;
	    };
	    InputCounter.prototype.increment = function () {
	        // don't increment if the value is already at the maximum value
	        if (this._options.maxValue !== null &&
	            this.getCurrentValue() >= this._options.maxValue) {
	            return;
	        }
	        this._targetEl.value = (this.getCurrentValue() + 1).toString();
	        this._options.onIncrement(this);
	    };
	    InputCounter.prototype.decrement = function () {
	        // don't decrement if the value is already at the minimum value
	        if (this._options.minValue !== null &&
	            this.getCurrentValue() <= this._options.minValue) {
	            return;
	        }
	        this._targetEl.value = (this.getCurrentValue() - 1).toString();
	        this._options.onDecrement(this);
	    };
	    return InputCounter;
	}());
	function initInputCounters() {
	    document.querySelectorAll('[data-input-counter]').forEach(function ($targetEl) {
	        var targetId = $targetEl.id;
	        var $incrementEl = document.querySelector('[data-input-counter-increment="' + targetId + '"]');
	        var $decrementEl = document.querySelector('[data-input-counter-decrement="' + targetId + '"]');
	        var minValue = $targetEl.getAttribute('data-input-counter-min');
	        var maxValue = $targetEl.getAttribute('data-input-counter-max');
	        // check if the target element exists
	        if ($targetEl) {
	            if (!instances$1.instanceExists('InputCounter', $targetEl.getAttribute('id'))) {
	                new InputCounter($targetEl, $incrementEl ? $incrementEl : null, $decrementEl ? $decrementEl : null, {
	                    minValue: minValue ? parseInt(minValue) : null,
	                    maxValue: maxValue ? parseInt(maxValue) : null,
	                });
	            }
	        }
	        else {
	            console.error("The target element with id \"".concat(targetId, "\" does not exist. Please check the data-input-counter attribute."));
	        }
	    });
	}
	if (typeof window !== 'undefined') {
	    window.InputCounter = InputCounter;
	    window.initInputCounters = initInputCounters;
	}

	function initFlowbite() {
	    initAccordions();
	    initCollapses();
	    initCarousels();
	    initDismisses();
	    initDropdowns();
	    initModals();
	    initDrawers();
	    initTabs();
	    initTooltips();
	    initPopovers();
	    initDials();
	    initInputCounters();
	}
	if (typeof window !== 'undefined') {
	    window.initFlowbite = initFlowbite;
	}

	// setup events for data attributes
	var events = new Events('load', [
	    initAccordions,
	    initCollapses,
	    initCarousels,
	    initDismisses,
	    initDropdowns,
	    initModals,
	    initDrawers,
	    initTabs,
	    initTooltips,
	    initPopovers,
	    initDials,
	    initInputCounters,
	]);
	events.init();

	/**
	 * Custom positioning reference element.
	 * @see https://floating-ui.com/docs/virtual-elements
	 */

	const min = Math.min;
	const max = Math.max;
	const round$1 = Math.round;
	const floor = Math.floor;
	const createCoords = v => ({
	  x: v,
	  y: v
	});
	const oppositeSideMap = {
	  left: 'right',
	  right: 'left',
	  bottom: 'top',
	  top: 'bottom'
	};
	const oppositeAlignmentMap = {
	  start: 'end',
	  end: 'start'
	};
	function clamp(start, value, end) {
	  return max(start, min(value, end));
	}
	function evaluate(value, param) {
	  return typeof value === 'function' ? value(param) : value;
	}
	function getSide(placement) {
	  return placement.split('-')[0];
	}
	function getAlignment(placement) {
	  return placement.split('-')[1];
	}
	function getOppositeAxis(axis) {
	  return axis === 'x' ? 'y' : 'x';
	}
	function getAxisLength(axis) {
	  return axis === 'y' ? 'height' : 'width';
	}
	function getSideAxis(placement) {
	  return ['top', 'bottom'].includes(getSide(placement)) ? 'y' : 'x';
	}
	function getAlignmentAxis(placement) {
	  return getOppositeAxis(getSideAxis(placement));
	}
	function getAlignmentSides(placement, rects, rtl) {
	  if (rtl === void 0) {
	    rtl = false;
	  }
	  const alignment = getAlignment(placement);
	  const alignmentAxis = getAlignmentAxis(placement);
	  const length = getAxisLength(alignmentAxis);
	  let mainAlignmentSide = alignmentAxis === 'x' ? alignment === (rtl ? 'end' : 'start') ? 'right' : 'left' : alignment === 'start' ? 'bottom' : 'top';
	  if (rects.reference[length] > rects.floating[length]) {
	    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
	  }
	  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
	}
	function getExpandedPlacements(placement) {
	  const oppositePlacement = getOppositePlacement(placement);
	  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
	}
	function getOppositeAlignmentPlacement(placement) {
	  return placement.replace(/start|end/g, alignment => oppositeAlignmentMap[alignment]);
	}
	function getSideList(side, isStart, rtl) {
	  const lr = ['left', 'right'];
	  const rl = ['right', 'left'];
	  const tb = ['top', 'bottom'];
	  const bt = ['bottom', 'top'];
	  switch (side) {
	    case 'top':
	    case 'bottom':
	      if (rtl) return isStart ? rl : lr;
	      return isStart ? lr : rl;
	    case 'left':
	    case 'right':
	      return isStart ? tb : bt;
	    default:
	      return [];
	  }
	}
	function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
	  const alignment = getAlignment(placement);
	  let list = getSideList(getSide(placement), direction === 'start', rtl);
	  if (alignment) {
	    list = list.map(side => side + "-" + alignment);
	    if (flipAlignment) {
	      list = list.concat(list.map(getOppositeAlignmentPlacement));
	    }
	  }
	  return list;
	}
	function getOppositePlacement(placement) {
	  return placement.replace(/left|right|bottom|top/g, side => oppositeSideMap[side]);
	}
	function expandPaddingObject(padding) {
	  return {
	    top: 0,
	    right: 0,
	    bottom: 0,
	    left: 0,
	    ...padding
	  };
	}
	function getPaddingObject(padding) {
	  return typeof padding !== 'number' ? expandPaddingObject(padding) : {
	    top: padding,
	    right: padding,
	    bottom: padding,
	    left: padding
	  };
	}
	function rectToClientRect(rect) {
	  return {
	    ...rect,
	    top: rect.y,
	    left: rect.x,
	    right: rect.x + rect.width,
	    bottom: rect.y + rect.height
	  };
	}

	function computeCoordsFromPlacement(_ref, placement, rtl) {
	  let {
	    reference,
	    floating
	  } = _ref;
	  const sideAxis = getSideAxis(placement);
	  const alignmentAxis = getAlignmentAxis(placement);
	  const alignLength = getAxisLength(alignmentAxis);
	  const side = getSide(placement);
	  const isVertical = sideAxis === 'y';
	  const commonX = reference.x + reference.width / 2 - floating.width / 2;
	  const commonY = reference.y + reference.height / 2 - floating.height / 2;
	  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
	  let coords;
	  switch (side) {
	    case 'top':
	      coords = {
	        x: commonX,
	        y: reference.y - floating.height
	      };
	      break;
	    case 'bottom':
	      coords = {
	        x: commonX,
	        y: reference.y + reference.height
	      };
	      break;
	    case 'right':
	      coords = {
	        x: reference.x + reference.width,
	        y: commonY
	      };
	      break;
	    case 'left':
	      coords = {
	        x: reference.x - floating.width,
	        y: commonY
	      };
	      break;
	    default:
	      coords = {
	        x: reference.x,
	        y: reference.y
	      };
	  }
	  switch (getAlignment(placement)) {
	    case 'start':
	      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
	      break;
	    case 'end':
	      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
	      break;
	  }
	  return coords;
	}

	/**
	 * Computes the `x` and `y` coordinates that will place the floating element
	 * next to a given reference element.
	 *
	 * This export does not have any `platform` interface logic. You will need to
	 * write one for the platform you are using Floating UI with.
	 */
	const computePosition$1 = async (reference, floating, config) => {
	  const {
	    placement = 'bottom',
	    strategy = 'absolute',
	    middleware = [],
	    platform
	  } = config;
	  const validMiddleware = middleware.filter(Boolean);
	  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(floating));
	  let rects = await platform.getElementRects({
	    reference,
	    floating,
	    strategy
	  });
	  let {
	    x,
	    y
	  } = computeCoordsFromPlacement(rects, placement, rtl);
	  let statefulPlacement = placement;
	  let middlewareData = {};
	  let resetCount = 0;
	  for (let i = 0; i < validMiddleware.length; i++) {
	    const {
	      name,
	      fn
	    } = validMiddleware[i];
	    const {
	      x: nextX,
	      y: nextY,
	      data,
	      reset
	    } = await fn({
	      x,
	      y,
	      initialPlacement: placement,
	      placement: statefulPlacement,
	      strategy,
	      middlewareData,
	      rects,
	      platform,
	      elements: {
	        reference,
	        floating
	      }
	    });
	    x = nextX != null ? nextX : x;
	    y = nextY != null ? nextY : y;
	    middlewareData = {
	      ...middlewareData,
	      [name]: {
	        ...middlewareData[name],
	        ...data
	      }
	    };
	    if (reset && resetCount <= 50) {
	      resetCount++;
	      if (typeof reset === 'object') {
	        if (reset.placement) {
	          statefulPlacement = reset.placement;
	        }
	        if (reset.rects) {
	          rects = reset.rects === true ? await platform.getElementRects({
	            reference,
	            floating,
	            strategy
	          }) : reset.rects;
	        }
	        ({
	          x,
	          y
	        } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
	      }
	      i = -1;
	      continue;
	    }
	  }
	  return {
	    x,
	    y,
	    placement: statefulPlacement,
	    strategy,
	    middlewareData
	  };
	};

	/**
	 * Resolves with an object of overflow side offsets that determine how much the
	 * element is overflowing a given clipping boundary on each side.
	 * - positive = overflowing the boundary by that number of pixels
	 * - negative = how many pixels left before it will overflow
	 * - 0 = lies flush with the boundary
	 * @see https://floating-ui.com/docs/detectOverflow
	 */
	async function detectOverflow(state, options) {
	  var _await$platform$isEle;
	  if (options === void 0) {
	    options = {};
	  }
	  const {
	    x,
	    y,
	    platform,
	    rects,
	    elements,
	    strategy
	  } = state;
	  const {
	    boundary = 'clippingAncestors',
	    rootBoundary = 'viewport',
	    elementContext = 'floating',
	    altBoundary = false,
	    padding = 0
	  } = evaluate(options, state);
	  const paddingObject = getPaddingObject(padding);
	  const altContext = elementContext === 'floating' ? 'reference' : 'floating';
	  const element = elements[altBoundary ? altContext : elementContext];
	  const clippingClientRect = rectToClientRect(await platform.getClippingRect({
	    element: ((_await$platform$isEle = await (platform.isElement == null ? void 0 : platform.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || (await (platform.getDocumentElement == null ? void 0 : platform.getDocumentElement(elements.floating))),
	    boundary,
	    rootBoundary,
	    strategy
	  }));
	  const rect = elementContext === 'floating' ? {
	    ...rects.floating,
	    x,
	    y
	  } : rects.reference;
	  const offsetParent = await (platform.getOffsetParent == null ? void 0 : platform.getOffsetParent(elements.floating));
	  const offsetScale = (await (platform.isElement == null ? void 0 : platform.isElement(offsetParent))) ? (await (platform.getScale == null ? void 0 : platform.getScale(offsetParent))) || {
	    x: 1,
	    y: 1
	  } : {
	    x: 1,
	    y: 1
	  };
	  const elementClientRect = rectToClientRect(platform.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform.convertOffsetParentRelativeRectToViewportRelativeRect({
	    rect,
	    offsetParent,
	    strategy
	  }) : rect);
	  return {
	    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
	    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
	    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
	    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
	  };
	}

	/**
	 * Optimizes the visibility of the floating element by flipping the `placement`
	 * in order to keep it in view when the preferred placement(s) will overflow the
	 * clipping boundary. Alternative to `autoPlacement`.
	 * @see https://floating-ui.com/docs/flip
	 */
	const flip$1 = function (options) {
	  if (options === void 0) {
	    options = {};
	  }
	  return {
	    name: 'flip',
	    options,
	    async fn(state) {
	      var _middlewareData$arrow, _middlewareData$flip;
	      const {
	        placement,
	        middlewareData,
	        rects,
	        initialPlacement,
	        platform,
	        elements
	      } = state;
	      const {
	        mainAxis: checkMainAxis = true,
	        crossAxis: checkCrossAxis = true,
	        fallbackPlacements: specifiedFallbackPlacements,
	        fallbackStrategy = 'bestFit',
	        fallbackAxisSideDirection = 'none',
	        flipAlignment = true,
	        ...detectOverflowOptions
	      } = evaluate(options, state);

	      // If a reset by the arrow was caused due to an alignment offset being
	      // added, we should skip any logic now since `flip()` has already done its
	      // work.
	      // https://github.com/floating-ui/floating-ui/issues/2549#issuecomment-1719601643
	      if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
	        return {};
	      }
	      const side = getSide(placement);
	      const isBasePlacement = getSide(initialPlacement) === initialPlacement;
	      const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
	      const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
	      if (!specifiedFallbackPlacements && fallbackAxisSideDirection !== 'none') {
	        fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
	      }
	      const placements = [initialPlacement, ...fallbackPlacements];
	      const overflow = await detectOverflow(state, detectOverflowOptions);
	      const overflows = [];
	      let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
	      if (checkMainAxis) {
	        overflows.push(overflow[side]);
	      }
	      if (checkCrossAxis) {
	        const sides = getAlignmentSides(placement, rects, rtl);
	        overflows.push(overflow[sides[0]], overflow[sides[1]]);
	      }
	      overflowsData = [...overflowsData, {
	        placement,
	        overflows
	      }];

	      // One or more sides is overflowing.
	      if (!overflows.every(side => side <= 0)) {
	        var _middlewareData$flip2, _overflowsData$filter;
	        const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
	        const nextPlacement = placements[nextIndex];
	        if (nextPlacement) {
	          // Try next placement and re-run the lifecycle.
	          return {
	            data: {
	              index: nextIndex,
	              overflows: overflowsData
	            },
	            reset: {
	              placement: nextPlacement
	            }
	          };
	        }

	        // First, find the candidates that fit on the mainAxis side of overflow,
	        // then find the placement that fits the best on the main crossAxis side.
	        let resetPlacement = (_overflowsData$filter = overflowsData.filter(d => d.overflows[0] <= 0).sort((a, b) => a.overflows[1] - b.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;

	        // Otherwise fallback.
	        if (!resetPlacement) {
	          switch (fallbackStrategy) {
	            case 'bestFit':
	              {
	                var _overflowsData$map$so;
	                const placement = (_overflowsData$map$so = overflowsData.map(d => [d.placement, d.overflows.filter(overflow => overflow > 0).reduce((acc, overflow) => acc + overflow, 0)]).sort((a, b) => a[1] - b[1])[0]) == null ? void 0 : _overflowsData$map$so[0];
	                if (placement) {
	                  resetPlacement = placement;
	                }
	                break;
	              }
	            case 'initialPlacement':
	              resetPlacement = initialPlacement;
	              break;
	          }
	        }
	        if (placement !== resetPlacement) {
	          return {
	            reset: {
	              placement: resetPlacement
	            }
	          };
	        }
	      }
	      return {};
	    }
	  };
	};

	// For type backwards-compatibility, the `OffsetOptions` type was also
	// Derivable.

	async function convertValueToCoords(state, options) {
	  const {
	    placement,
	    platform,
	    elements
	  } = state;
	  const rtl = await (platform.isRTL == null ? void 0 : platform.isRTL(elements.floating));
	  const side = getSide(placement);
	  const alignment = getAlignment(placement);
	  const isVertical = getSideAxis(placement) === 'y';
	  const mainAxisMulti = ['left', 'top'].includes(side) ? -1 : 1;
	  const crossAxisMulti = rtl && isVertical ? -1 : 1;
	  const rawValue = evaluate(options, state);

	  // eslint-disable-next-line prefer-const
	  let {
	    mainAxis,
	    crossAxis,
	    alignmentAxis
	  } = typeof rawValue === 'number' ? {
	    mainAxis: rawValue,
	    crossAxis: 0,
	    alignmentAxis: null
	  } : {
	    mainAxis: 0,
	    crossAxis: 0,
	    alignmentAxis: null,
	    ...rawValue
	  };
	  if (alignment && typeof alignmentAxis === 'number') {
	    crossAxis = alignment === 'end' ? alignmentAxis * -1 : alignmentAxis;
	  }
	  return isVertical ? {
	    x: crossAxis * crossAxisMulti,
	    y: mainAxis * mainAxisMulti
	  } : {
	    x: mainAxis * mainAxisMulti,
	    y: crossAxis * crossAxisMulti
	  };
	}

	/**
	 * Modifies the placement by translating the floating element along the
	 * specified axes.
	 * A number (shorthand for `mainAxis` or distance), or an axes configuration
	 * object may be passed.
	 * @see https://floating-ui.com/docs/offset
	 */
	const offset = function (options) {
	  if (options === void 0) {
	    options = 0;
	  }
	  return {
	    name: 'offset',
	    options,
	    async fn(state) {
	      var _middlewareData$offse, _middlewareData$arrow;
	      const {
	        x,
	        y,
	        placement,
	        middlewareData
	      } = state;
	      const diffCoords = await convertValueToCoords(state, options);

	      // If the placement is the same and the arrow caused an alignment offset
	      // then we don't need to change the positioning coordinates.
	      if (placement === ((_middlewareData$offse = middlewareData.offset) == null ? void 0 : _middlewareData$offse.placement) && (_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
	        return {};
	      }
	      return {
	        x: x + diffCoords.x,
	        y: y + diffCoords.y,
	        data: {
	          ...diffCoords,
	          placement
	        }
	      };
	    }
	  };
	};

	/**
	 * Optimizes the visibility of the floating element by shifting it in order to
	 * keep it in view when it will overflow the clipping boundary.
	 * @see https://floating-ui.com/docs/shift
	 */
	const shift$1 = function (options) {
	  if (options === void 0) {
	    options = {};
	  }
	  return {
	    name: 'shift',
	    options,
	    async fn(state) {
	      const {
	        x,
	        y,
	        placement
	      } = state;
	      const {
	        mainAxis: checkMainAxis = true,
	        crossAxis: checkCrossAxis = false,
	        limiter = {
	          fn: _ref => {
	            let {
	              x,
	              y
	            } = _ref;
	            return {
	              x,
	              y
	            };
	          }
	        },
	        ...detectOverflowOptions
	      } = evaluate(options, state);
	      const coords = {
	        x,
	        y
	      };
	      const overflow = await detectOverflow(state, detectOverflowOptions);
	      const crossAxis = getSideAxis(getSide(placement));
	      const mainAxis = getOppositeAxis(crossAxis);
	      let mainAxisCoord = coords[mainAxis];
	      let crossAxisCoord = coords[crossAxis];
	      if (checkMainAxis) {
	        const minSide = mainAxis === 'y' ? 'top' : 'left';
	        const maxSide = mainAxis === 'y' ? 'bottom' : 'right';
	        const min = mainAxisCoord + overflow[minSide];
	        const max = mainAxisCoord - overflow[maxSide];
	        mainAxisCoord = clamp(min, mainAxisCoord, max);
	      }
	      if (checkCrossAxis) {
	        const minSide = crossAxis === 'y' ? 'top' : 'left';
	        const maxSide = crossAxis === 'y' ? 'bottom' : 'right';
	        const min = crossAxisCoord + overflow[minSide];
	        const max = crossAxisCoord - overflow[maxSide];
	        crossAxisCoord = clamp(min, crossAxisCoord, max);
	      }
	      const limitedCoords = limiter.fn({
	        ...state,
	        [mainAxis]: mainAxisCoord,
	        [crossAxis]: crossAxisCoord
	      });
	      return {
	        ...limitedCoords,
	        data: {
	          x: limitedCoords.x - x,
	          y: limitedCoords.y - y
	        }
	      };
	    }
	  };
	};

	function getNodeName(node) {
	  if (isNode(node)) {
	    return (node.nodeName || '').toLowerCase();
	  }
	  // Mocked nodes in testing environments may not be instances of Node. By
	  // returning `#document` an infinite loop won't occur.
	  // https://github.com/floating-ui/floating-ui/issues/2317
	  return '#document';
	}
	function getWindow(node) {
	  var _node$ownerDocument;
	  return (node == null || (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
	}
	function getDocumentElement(node) {
	  var _ref;
	  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
	}
	function isNode(value) {
	  return value instanceof Node || value instanceof getWindow(value).Node;
	}
	function isElement(value) {
	  return value instanceof Element || value instanceof getWindow(value).Element;
	}
	function isHTMLElement(value) {
	  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
	}
	function isShadowRoot(value) {
	  // Browsers without `ShadowRoot` support.
	  if (typeof ShadowRoot === 'undefined') {
	    return false;
	  }
	  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
	}
	function isOverflowElement(element) {
	  const {
	    overflow,
	    overflowX,
	    overflowY,
	    display
	  } = getComputedStyle$1(element);
	  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !['inline', 'contents'].includes(display);
	}
	function isTableElement(element) {
	  return ['table', 'td', 'th'].includes(getNodeName(element));
	}
	function isContainingBlock(element) {
	  const webkit = isWebKit();
	  const css = getComputedStyle$1(element);

	  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
	  return css.transform !== 'none' || css.perspective !== 'none' || (css.containerType ? css.containerType !== 'normal' : false) || !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || !webkit && (css.filter ? css.filter !== 'none' : false) || ['transform', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
	}
	function getContainingBlock(element) {
	  let currentNode = getParentNode(element);
	  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
	    if (isContainingBlock(currentNode)) {
	      return currentNode;
	    } else {
	      currentNode = getParentNode(currentNode);
	    }
	  }
	  return null;
	}
	function isWebKit() {
	  if (typeof CSS === 'undefined' || !CSS.supports) return false;
	  return CSS.supports('-webkit-backdrop-filter', 'none');
	}
	function isLastTraversableNode(node) {
	  return ['html', 'body', '#document'].includes(getNodeName(node));
	}
	function getComputedStyle$1(element) {
	  return getWindow(element).getComputedStyle(element);
	}
	function getNodeScroll(element) {
	  if (isElement(element)) {
	    return {
	      scrollLeft: element.scrollLeft,
	      scrollTop: element.scrollTop
	    };
	  }
	  return {
	    scrollLeft: element.pageXOffset,
	    scrollTop: element.pageYOffset
	  };
	}
	function getParentNode(node) {
	  if (getNodeName(node) === 'html') {
	    return node;
	  }
	  const result =
	  // Step into the shadow DOM of the parent of a slotted node.
	  node.assignedSlot ||
	  // DOM Element detected.
	  node.parentNode ||
	  // ShadowRoot detected.
	  isShadowRoot(node) && node.host ||
	  // Fallback.
	  getDocumentElement(node);
	  return isShadowRoot(result) ? result.host : result;
	}
	function getNearestOverflowAncestor(node) {
	  const parentNode = getParentNode(node);
	  if (isLastTraversableNode(parentNode)) {
	    return node.ownerDocument ? node.ownerDocument.body : node.body;
	  }
	  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
	    return parentNode;
	  }
	  return getNearestOverflowAncestor(parentNode);
	}
	function getOverflowAncestors(node, list, traverseIframes) {
	  var _node$ownerDocument2;
	  if (list === void 0) {
	    list = [];
	  }
	  if (traverseIframes === void 0) {
	    traverseIframes = true;
	  }
	  const scrollableAncestor = getNearestOverflowAncestor(node);
	  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
	  const win = getWindow(scrollableAncestor);
	  if (isBody) {
	    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], win.frameElement && traverseIframes ? getOverflowAncestors(win.frameElement) : []);
	  }
	  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
	}

	function getCssDimensions(element) {
	  const css = getComputedStyle$1(element);
	  // In testing environments, the `width` and `height` properties are empty
	  // strings for SVG elements, returning NaN. Fallback to `0` in this case.
	  let width = parseFloat(css.width) || 0;
	  let height = parseFloat(css.height) || 0;
	  const hasOffset = isHTMLElement(element);
	  const offsetWidth = hasOffset ? element.offsetWidth : width;
	  const offsetHeight = hasOffset ? element.offsetHeight : height;
	  const shouldFallback = round$1(width) !== offsetWidth || round$1(height) !== offsetHeight;
	  if (shouldFallback) {
	    width = offsetWidth;
	    height = offsetHeight;
	  }
	  return {
	    width,
	    height,
	    $: shouldFallback
	  };
	}

	function unwrapElement(element) {
	  return !isElement(element) ? element.contextElement : element;
	}

	function getScale(element) {
	  const domElement = unwrapElement(element);
	  if (!isHTMLElement(domElement)) {
	    return createCoords(1);
	  }
	  const rect = domElement.getBoundingClientRect();
	  const {
	    width,
	    height,
	    $
	  } = getCssDimensions(domElement);
	  let x = ($ ? round$1(rect.width) : rect.width) / width;
	  let y = ($ ? round$1(rect.height) : rect.height) / height;

	  // 0, NaN, or Infinity should always fallback to 1.

	  if (!x || !Number.isFinite(x)) {
	    x = 1;
	  }
	  if (!y || !Number.isFinite(y)) {
	    y = 1;
	  }
	  return {
	    x,
	    y
	  };
	}

	const noOffsets = /*#__PURE__*/createCoords(0);
	function getVisualOffsets(element) {
	  const win = getWindow(element);
	  if (!isWebKit() || !win.visualViewport) {
	    return noOffsets;
	  }
	  return {
	    x: win.visualViewport.offsetLeft,
	    y: win.visualViewport.offsetTop
	  };
	}
	function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
	  if (isFixed === void 0) {
	    isFixed = false;
	  }
	  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
	    return false;
	  }
	  return isFixed;
	}

	function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
	  if (includeScale === void 0) {
	    includeScale = false;
	  }
	  if (isFixedStrategy === void 0) {
	    isFixedStrategy = false;
	  }
	  const clientRect = element.getBoundingClientRect();
	  const domElement = unwrapElement(element);
	  let scale = createCoords(1);
	  if (includeScale) {
	    if (offsetParent) {
	      if (isElement(offsetParent)) {
	        scale = getScale(offsetParent);
	      }
	    } else {
	      scale = getScale(element);
	    }
	  }
	  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
	  let x = (clientRect.left + visualOffsets.x) / scale.x;
	  let y = (clientRect.top + visualOffsets.y) / scale.y;
	  let width = clientRect.width / scale.x;
	  let height = clientRect.height / scale.y;
	  if (domElement) {
	    const win = getWindow(domElement);
	    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
	    let currentIFrame = win.frameElement;
	    while (currentIFrame && offsetParent && offsetWin !== win) {
	      const iframeScale = getScale(currentIFrame);
	      const iframeRect = currentIFrame.getBoundingClientRect();
	      const css = getComputedStyle$1(currentIFrame);
	      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
	      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
	      x *= iframeScale.x;
	      y *= iframeScale.y;
	      width *= iframeScale.x;
	      height *= iframeScale.y;
	      x += left;
	      y += top;
	      currentIFrame = getWindow(currentIFrame).frameElement;
	    }
	  }
	  return rectToClientRect({
	    width,
	    height,
	    x,
	    y
	  });
	}

	function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
	  let {
	    rect,
	    offsetParent,
	    strategy
	  } = _ref;
	  const isOffsetParentAnElement = isHTMLElement(offsetParent);
	  const documentElement = getDocumentElement(offsetParent);
	  if (offsetParent === documentElement) {
	    return rect;
	  }
	  let scroll = {
	    scrollLeft: 0,
	    scrollTop: 0
	  };
	  let scale = createCoords(1);
	  const offsets = createCoords(0);
	  if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== 'fixed') {
	    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
	      scroll = getNodeScroll(offsetParent);
	    }
	    if (isHTMLElement(offsetParent)) {
	      const offsetRect = getBoundingClientRect(offsetParent);
	      scale = getScale(offsetParent);
	      offsets.x = offsetRect.x + offsetParent.clientLeft;
	      offsets.y = offsetRect.y + offsetParent.clientTop;
	    }
	  }
	  return {
	    width: rect.width * scale.x,
	    height: rect.height * scale.y,
	    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
	    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
	  };
	}

	function getClientRects(element) {
	  return Array.from(element.getClientRects());
	}

	function getWindowScrollBarX(element) {
	  // If <html> has a CSS width greater than the viewport, then this will be
	  // incorrect for RTL.
	  return getBoundingClientRect(getDocumentElement(element)).left + getNodeScroll(element).scrollLeft;
	}

	// Gets the entire size of the scrollable document area, even extending outside
	// of the `<html>` and `<body>` rect bounds if horizontally scrollable.
	function getDocumentRect(element) {
	  const html = getDocumentElement(element);
	  const scroll = getNodeScroll(element);
	  const body = element.ownerDocument.body;
	  const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
	  const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
	  let x = -scroll.scrollLeft + getWindowScrollBarX(element);
	  const y = -scroll.scrollTop;
	  if (getComputedStyle$1(body).direction === 'rtl') {
	    x += max(html.clientWidth, body.clientWidth) - width;
	  }
	  return {
	    width,
	    height,
	    x,
	    y
	  };
	}

	function getViewportRect(element, strategy) {
	  const win = getWindow(element);
	  const html = getDocumentElement(element);
	  const visualViewport = win.visualViewport;
	  let width = html.clientWidth;
	  let height = html.clientHeight;
	  let x = 0;
	  let y = 0;
	  if (visualViewport) {
	    width = visualViewport.width;
	    height = visualViewport.height;
	    const visualViewportBased = isWebKit();
	    if (!visualViewportBased || visualViewportBased && strategy === 'fixed') {
	      x = visualViewport.offsetLeft;
	      y = visualViewport.offsetTop;
	    }
	  }
	  return {
	    width,
	    height,
	    x,
	    y
	  };
	}

	// Returns the inner client rect, subtracting scrollbars if present.
	function getInnerBoundingClientRect(element, strategy) {
	  const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
	  const top = clientRect.top + element.clientTop;
	  const left = clientRect.left + element.clientLeft;
	  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
	  const width = element.clientWidth * scale.x;
	  const height = element.clientHeight * scale.y;
	  const x = left * scale.x;
	  const y = top * scale.y;
	  return {
	    width,
	    height,
	    x,
	    y
	  };
	}
	function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
	  let rect;
	  if (clippingAncestor === 'viewport') {
	    rect = getViewportRect(element, strategy);
	  } else if (clippingAncestor === 'document') {
	    rect = getDocumentRect(getDocumentElement(element));
	  } else if (isElement(clippingAncestor)) {
	    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
	  } else {
	    const visualOffsets = getVisualOffsets(element);
	    rect = {
	      ...clippingAncestor,
	      x: clippingAncestor.x - visualOffsets.x,
	      y: clippingAncestor.y - visualOffsets.y
	    };
	  }
	  return rectToClientRect(rect);
	}
	function hasFixedPositionAncestor(element, stopNode) {
	  const parentNode = getParentNode(element);
	  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
	    return false;
	  }
	  return getComputedStyle$1(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
	}

	// A "clipping ancestor" is an `overflow` element with the characteristic of
	// clipping (or hiding) child elements. This returns all clipping ancestors
	// of the given element up the tree.
	function getClippingElementAncestors(element, cache) {
	  const cachedResult = cache.get(element);
	  if (cachedResult) {
	    return cachedResult;
	  }
	  let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
	  let currentContainingBlockComputedStyle = null;
	  const elementIsFixed = getComputedStyle$1(element).position === 'fixed';
	  let currentNode = elementIsFixed ? getParentNode(element) : element;

	  // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
	  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
	    const computedStyle = getComputedStyle$1(currentNode);
	    const currentNodeIsContaining = isContainingBlock(currentNode);
	    if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
	      currentContainingBlockComputedStyle = null;
	    }
	    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle && ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
	    if (shouldDropCurrentNode) {
	      // Drop non-containing blocks.
	      result = result.filter(ancestor => ancestor !== currentNode);
	    } else {
	      // Record last containing block for next iteration.
	      currentContainingBlockComputedStyle = computedStyle;
	    }
	    currentNode = getParentNode(currentNode);
	  }
	  cache.set(element, result);
	  return result;
	}

	// Gets the maximum area that the element is visible in due to any number of
	// clipping ancestors.
	function getClippingRect(_ref) {
	  let {
	    element,
	    boundary,
	    rootBoundary,
	    strategy
	  } = _ref;
	  const elementClippingAncestors = boundary === 'clippingAncestors' ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
	  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
	  const firstClippingAncestor = clippingAncestors[0];
	  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
	    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
	    accRect.top = max(rect.top, accRect.top);
	    accRect.right = min(rect.right, accRect.right);
	    accRect.bottom = min(rect.bottom, accRect.bottom);
	    accRect.left = max(rect.left, accRect.left);
	    return accRect;
	  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
	  return {
	    width: clippingRect.right - clippingRect.left,
	    height: clippingRect.bottom - clippingRect.top,
	    x: clippingRect.left,
	    y: clippingRect.top
	  };
	}

	function getDimensions(element) {
	  const {
	    width,
	    height
	  } = getCssDimensions(element);
	  return {
	    width,
	    height
	  };
	}

	function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
	  const isOffsetParentAnElement = isHTMLElement(offsetParent);
	  const documentElement = getDocumentElement(offsetParent);
	  const isFixed = strategy === 'fixed';
	  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
	  let scroll = {
	    scrollLeft: 0,
	    scrollTop: 0
	  };
	  const offsets = createCoords(0);
	  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
	    if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
	      scroll = getNodeScroll(offsetParent);
	    }
	    if (isOffsetParentAnElement) {
	      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
	      offsets.x = offsetRect.x + offsetParent.clientLeft;
	      offsets.y = offsetRect.y + offsetParent.clientTop;
	    } else if (documentElement) {
	      offsets.x = getWindowScrollBarX(documentElement);
	    }
	  }
	  return {
	    x: rect.left + scroll.scrollLeft - offsets.x,
	    y: rect.top + scroll.scrollTop - offsets.y,
	    width: rect.width,
	    height: rect.height
	  };
	}

	function getTrueOffsetParent(element, polyfill) {
	  if (!isHTMLElement(element) || getComputedStyle$1(element).position === 'fixed') {
	    return null;
	  }
	  if (polyfill) {
	    return polyfill(element);
	  }
	  return element.offsetParent;
	}

	// Gets the closest ancestor positioned element. Handles some edge cases,
	// such as table ancestors and cross browser bugs.
	function getOffsetParent(element, polyfill) {
	  const window = getWindow(element);
	  if (!isHTMLElement(element)) {
	    return window;
	  }
	  let offsetParent = getTrueOffsetParent(element, polyfill);
	  while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
	    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
	  }
	  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static' && !isContainingBlock(offsetParent))) {
	    return window;
	  }
	  return offsetParent || getContainingBlock(element) || window;
	}

	const getElementRects = async function (_ref) {
	  let {
	    reference,
	    floating,
	    strategy
	  } = _ref;
	  const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
	  const getDimensionsFn = this.getDimensions;
	  return {
	    reference: getRectRelativeToOffsetParent(reference, await getOffsetParentFn(floating), strategy),
	    floating: {
	      x: 0,
	      y: 0,
	      ...(await getDimensionsFn(floating))
	    }
	  };
	};

	function isRTL(element) {
	  return getComputedStyle$1(element).direction === 'rtl';
	}

	const platform = {
	  convertOffsetParentRelativeRectToViewportRelativeRect,
	  getDocumentElement,
	  getClippingRect,
	  getOffsetParent,
	  getElementRects,
	  getClientRects,
	  getDimensions,
	  getScale,
	  isElement,
	  isRTL
	};

	// https://samthor.au/2021/observing-dom/
	function observeMove(element, onMove) {
	  let io = null;
	  let timeoutId;
	  const root = getDocumentElement(element);
	  function cleanup() {
	    clearTimeout(timeoutId);
	    io && io.disconnect();
	    io = null;
	  }
	  function refresh(skip, threshold) {
	    if (skip === void 0) {
	      skip = false;
	    }
	    if (threshold === void 0) {
	      threshold = 1;
	    }
	    cleanup();
	    const {
	      left,
	      top,
	      width,
	      height
	    } = element.getBoundingClientRect();
	    if (!skip) {
	      onMove();
	    }
	    if (!width || !height) {
	      return;
	    }
	    const insetTop = floor(top);
	    const insetRight = floor(root.clientWidth - (left + width));
	    const insetBottom = floor(root.clientHeight - (top + height));
	    const insetLeft = floor(left);
	    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
	    const options = {
	      rootMargin,
	      threshold: max(0, min(1, threshold)) || 1
	    };
	    let isFirstUpdate = true;
	    function handleObserve(entries) {
	      const ratio = entries[0].intersectionRatio;
	      if (ratio !== threshold) {
	        if (!isFirstUpdate) {
	          return refresh();
	        }
	        if (!ratio) {
	          timeoutId = setTimeout(() => {
	            refresh(false, 1e-7);
	          }, 100);
	        } else {
	          refresh(false, ratio);
	        }
	      }
	      isFirstUpdate = false;
	    }

	    // Older browsers don't support a `document` as the root and will throw an
	    // error.
	    try {
	      io = new IntersectionObserver(handleObserve, {
	        ...options,
	        // Handle <iframe>s
	        root: root.ownerDocument
	      });
	    } catch (e) {
	      io = new IntersectionObserver(handleObserve, options);
	    }
	    io.observe(element);
	  }
	  refresh(true);
	  return cleanup;
	}

	/**
	 * Automatically updates the position of the floating element when necessary.
	 * Should only be called when the floating element is mounted on the DOM or
	 * visible on the screen.
	 * @returns cleanup function that should be invoked when the floating element is
	 * removed from the DOM or hidden from the screen.
	 * @see https://floating-ui.com/docs/autoUpdate
	 */
	function autoUpdate(reference, floating, update, options) {
	  if (options === void 0) {
	    options = {};
	  }
	  const {
	    ancestorScroll = true,
	    ancestorResize = true,
	    elementResize = typeof ResizeObserver === 'function',
	    layoutShift = typeof IntersectionObserver === 'function',
	    animationFrame = false
	  } = options;
	  const referenceEl = unwrapElement(reference);
	  const ancestors = ancestorScroll || ancestorResize ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...getOverflowAncestors(floating)] : [];
	  ancestors.forEach(ancestor => {
	    ancestorScroll && ancestor.addEventListener('scroll', update, {
	      passive: true
	    });
	    ancestorResize && ancestor.addEventListener('resize', update);
	  });
	  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
	  let reobserveFrame = -1;
	  let resizeObserver = null;
	  if (elementResize) {
	    resizeObserver = new ResizeObserver(_ref => {
	      let [firstEntry] = _ref;
	      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
	        // Prevent update loops when using the `size` middleware.
	        // https://github.com/floating-ui/floating-ui/issues/1740
	        resizeObserver.unobserve(floating);
	        cancelAnimationFrame(reobserveFrame);
	        reobserveFrame = requestAnimationFrame(() => {
	          resizeObserver && resizeObserver.observe(floating);
	        });
	      }
	      update();
	    });
	    if (referenceEl && !animationFrame) {
	      resizeObserver.observe(referenceEl);
	    }
	    resizeObserver.observe(floating);
	  }
	  let frameId;
	  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
	  if (animationFrame) {
	    frameLoop();
	  }
	  function frameLoop() {
	    const nextRefRect = getBoundingClientRect(reference);
	    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
	      update();
	    }
	    prevRefRect = nextRefRect;
	    frameId = requestAnimationFrame(frameLoop);
	  }
	  update();
	  return () => {
	    ancestors.forEach(ancestor => {
	      ancestorScroll && ancestor.removeEventListener('scroll', update);
	      ancestorResize && ancestor.removeEventListener('resize', update);
	    });
	    cleanupIo && cleanupIo();
	    resizeObserver && resizeObserver.disconnect();
	    resizeObserver = null;
	    if (animationFrame) {
	      cancelAnimationFrame(frameId);
	    }
	  };
	}

	/**
	 * Optimizes the visibility of the floating element by shifting it in order to
	 * keep it in view when it will overflow the clipping boundary.
	 * @see https://floating-ui.com/docs/shift
	 */
	const shift = shift$1;

	/**
	 * Optimizes the visibility of the floating element by flipping the `placement`
	 * in order to keep it in view when the preferred placement(s) will overflow the
	 * clipping boundary. Alternative to `autoPlacement`.
	 * @see https://floating-ui.com/docs/flip
	 */
	const flip = flip$1;

	/**
	 * Computes the `x` and `y` coordinates that will place the floating element
	 * next to a given reference element.
	 */
	const computePosition = (reference, floating, options) => {
	  // This caches the expensive `getClippingElementAncestors` function so that
	  // multiple lifecycle resets re-use the same result. It only lives for a
	  // single call. If other functions become expensive, we can add them as well.
	  const cache = new Map();
	  const mergedOptions = {
	    platform,
	    ...options
	  };
	  const platformWithCache = {
	    ...mergedOptions.platform,
	    _c: cache
	  };
	  return computePosition$1(reference, floating, {
	    ...mergedOptions,
	    platform: platformWithCache
	  });
	};

	//@ts-ignore
	function createFloatingActions(initOptions) {
	    let referenceElement;
	    let floatingElement;
	    const defaultOptions = {
	        autoUpdate: true
	    };
	    let options = initOptions;
	    const getOptions = (mixin) => {
	        return { ...defaultOptions, ...(initOptions || {}), ...(mixin || {}) };
	    };
	    const updatePosition = (updateOptions) => {
	        if (referenceElement && floatingElement) {
	            options = getOptions(updateOptions);
	            computePosition(referenceElement, floatingElement, options)
	                .then(v => {
	                Object.assign(floatingElement.style, {
	                    position: v.strategy,
	                    left: `${v.x}px`,
	                    top: `${v.y}px`,
	                });
	                options?.onComputed && options.onComputed(v);
	            });
	        }
	    };
	    const referenceAction = node => {
	        if ('subscribe' in node) {
	            setupVirtualElementObserver(node);
	            return {};
	        }
	        else {
	            referenceElement = node;
	            updatePosition();
	        }
	    };
	    const contentAction = (node, contentOptions) => {
	        let autoUpdateDestroy;
	        floatingElement = node;
	        options = getOptions(contentOptions);
	        setTimeout(() => updatePosition(contentOptions), 0); //tick doesn't work
	        updatePosition(contentOptions);
	        const destroyAutoUpdate = () => {
	            if (autoUpdateDestroy) {
	                autoUpdateDestroy();
	                autoUpdateDestroy = undefined;
	            }
	        };
	        const initAutoUpdate = ({ autoUpdate: autoUpdate$1 } = options || {}) => {
	            destroyAutoUpdate();
	            if (autoUpdate$1 !== false) {
	                tick().then(() => {
	                    return autoUpdate(referenceElement, floatingElement, () => updatePosition(options), (autoUpdate$1 === true ? {} : autoUpdate$1));
	                });
	            }
	            return;
	        };
	        autoUpdateDestroy = initAutoUpdate();
	        return {
	            update(contentOptions) {
	                updatePosition(contentOptions);
	                autoUpdateDestroy = initAutoUpdate(contentOptions);
	            },
	            destroy() {
	                destroyAutoUpdate();
	            }
	        };
	    };
	    const setupVirtualElementObserver = (node) => {
	        const unsubscribe = node.subscribe(($node) => {
	            if (referenceElement === undefined) {
	                referenceElement = $node;
	                updatePosition();
	            }
	            else {
	                // Preserve the reference to the virtual element.
	                Object.assign(referenceElement, $node);
	                updatePosition();
	            }
	        });
	        onDestroy(unsubscribe);
	    };
	    return [
	        referenceAction,
	        contentAction,
	        updatePosition
	    ];
	}

	function filter({
	    loadOptions,
	    filterText,
	    items,
	    multiple,
	    value,
	    itemId,
	    groupBy,
	    filterSelectedItems,
	    itemFilter,
	    convertStringItemsToObjects,
	    filterGroupedItems,
	    label,
	}) {
	    if (items && loadOptions) return items;
	    if (!items) return [];

	    if (items && items.length > 0 && typeof items[0] !== 'object') {
	        items = convertStringItemsToObjects(items);
	    }

	    let filterResults = items.filter((item) => {
	        let matchesFilter = itemFilter(item[label], filterText, item);
	        if (matchesFilter && multiple && value?.length) {
	            matchesFilter = !value.some((x) => {
	                return filterSelectedItems ? x[itemId] === item[itemId] : false;
	            });
	        }

	        return matchesFilter;
	    });

	    if (groupBy) {
	        filterResults = filterGroupedItems(filterResults);
	    }

	    return filterResults;
	}

	async function getItems({ dispatch, loadOptions, convertStringItemsToObjects, filterText }) {
	    let res = await loadOptions(filterText).catch((err) => {
	        console.warn('svelte-select loadOptions error :>> ', err);
	        dispatch('error', { type: 'loadOptions', details: err });
	    });

	    if (res && !res.cancelled) {        
	        if (res) {
	            if (res && res.length > 0 && typeof res[0] !== 'object') {
	                res = convertStringItemsToObjects(res);
	            }
	            
	            dispatch('loaded', { items: res });
	        } else {
	            res = [];
	        }

	        return {
	            filteredItems: res,
	            loading: false,
	            focused: true,
	            listOpen: true,
	        };
	    }
	}

	/* node_modules\svelte-select\ChevronIcon.svelte generated by Svelte v4.2.9 */
	const file$a = "node_modules\\svelte-select\\ChevronIcon.svelte";

	function create_fragment$a(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill", "currentColor");
				attr_dev(path, "d", "M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747\n          3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0\n          1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502\n          0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0\n          0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z");
				add_location(path, file$a, 6, 4, 114);
				attr_dev(svg, "width", "100%");
				attr_dev(svg, "height", "100%");
				attr_dev(svg, "viewBox", "0 0 20 20");
				attr_dev(svg, "focusable", "false");
				attr_dev(svg, "aria-hidden", "true");
				attr_dev(svg, "class", "svelte-qbd276");
				add_location(svg, file$a, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$a.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$a($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ChevronIcon', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ChevronIcon> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class ChevronIcon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ChevronIcon",
				options,
				id: create_fragment$a.name
			});
		}
	}

	/* node_modules\svelte-select\ClearIcon.svelte generated by Svelte v4.2.9 */
	const file$9 = "node_modules\\svelte-select\\ClearIcon.svelte";

	function create_fragment$9(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				path = svg_element("path");
				attr_dev(path, "fill", "currentColor");
				attr_dev(path, "d", "M34.923,37.251L24,26.328L13.077,37.251L9.436,33.61l10.923-10.923L9.436,11.765l3.641-3.641L24,19.047L34.923,8.124\n    l3.641,3.641L27.641,22.688L38.564,33.61L34.923,37.251z");
				add_location(path, file$9, 8, 4, 141);
				attr_dev(svg, "width", "100%");
				attr_dev(svg, "height", "100%");
				attr_dev(svg, "viewBox", "-2 -2 50 50");
				attr_dev(svg, "focusable", "false");
				attr_dev(svg, "aria-hidden", "true");
				attr_dev(svg, "role", "presentation");
				attr_dev(svg, "class", "svelte-whdbu1");
				add_location(svg, file$9, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$9.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$9($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ClearIcon', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ClearIcon> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class ClearIcon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ClearIcon",
				options,
				id: create_fragment$9.name
			});
		}
	}

	/* node_modules\svelte-select\LoadingIcon.svelte generated by Svelte v4.2.9 */
	const file$8 = "node_modules\\svelte-select\\LoadingIcon.svelte";

	function create_fragment$8(ctx) {
		let svg;
		let circle;

		const block = {
			c: function create() {
				svg = svg_element("svg");
				circle = svg_element("circle");
				attr_dev(circle, "class", "circle_path svelte-1p3nqvd");
				attr_dev(circle, "cx", "50");
				attr_dev(circle, "cy", "50");
				attr_dev(circle, "r", "20");
				attr_dev(circle, "fill", "none");
				attr_dev(circle, "stroke", "currentColor");
				attr_dev(circle, "stroke-width", "5");
				attr_dev(circle, "stroke-miterlimit", "10");
				add_location(circle, file$8, 1, 4, 48);
				attr_dev(svg, "class", "loading svelte-1p3nqvd");
				attr_dev(svg, "viewBox", "25 25 50 50");
				add_location(svg, file$8, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, circle);
			},
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(svg);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$8.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$8($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('LoadingIcon', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LoadingIcon> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class LoadingIcon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "LoadingIcon",
				options,
				id: create_fragment$8.name
			});
		}
	}

	/* node_modules\svelte-select\Select.svelte generated by Svelte v4.2.9 */

	const { Object: Object_1 } = globals;
	const file$7 = "node_modules\\svelte-select\\Select.svelte";
	const get_required_slot_changes = dirty => ({ value: dirty[0] & /*value*/ 8 });
	const get_required_slot_context = ctx => ({ value: /*value*/ ctx[3] });
	const get_input_hidden_slot_changes = dirty => ({ value: dirty[0] & /*value*/ 8 });
	const get_input_hidden_slot_context = ctx => ({ value: /*value*/ ctx[3] });
	const get_chevron_icon_slot_changes = dirty => ({ listOpen: dirty[0] & /*listOpen*/ 64 });
	const get_chevron_icon_slot_context = ctx => ({ listOpen: /*listOpen*/ ctx[6] });
	const get_clear_icon_slot_changes = dirty => ({});
	const get_clear_icon_slot_context = ctx => ({});
	const get_loading_icon_slot_changes = dirty => ({});
	const get_loading_icon_slot_context = ctx => ({});
	const get_selection_slot_changes_1 = dirty => ({ selection: dirty[0] & /*value*/ 8 });
	const get_selection_slot_context_1 = ctx => ({ selection: /*value*/ ctx[3] });

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[126] = list[i];
		child_ctx[128] = i;
		return child_ctx;
	}

	const get_multi_clear_icon_slot_changes = dirty => ({});
	const get_multi_clear_icon_slot_context = ctx => ({});
	const get_selection_slot_changes = dirty => ({ selection: dirty[0] & /*value*/ 8 });

	const get_selection_slot_context = ctx => ({
		selection: /*item*/ ctx[126],
		index: /*i*/ ctx[128]
	});

	const get_prepend_slot_changes = dirty => ({});
	const get_prepend_slot_context = ctx => ({});
	const get_list_append_slot_changes = dirty => ({});
	const get_list_append_slot_context = ctx => ({});
	const get_empty_slot_changes = dirty => ({});
	const get_empty_slot_context = ctx => ({});

	function get_each_context_1$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[126] = list[i];
		child_ctx[128] = i;
		return child_ctx;
	}

	const get_item_slot_changes = dirty => ({
		item: dirty[0] & /*filteredItems*/ 16777216
	});

	const get_item_slot_context = ctx => ({
		item: /*item*/ ctx[126],
		index: /*i*/ ctx[128]
	});

	const get_list_slot_changes = dirty => ({
		filteredItems: dirty[0] & /*filteredItems*/ 16777216
	});

	const get_list_slot_context = ctx => ({ filteredItems: /*filteredItems*/ ctx[24] });
	const get_list_prepend_slot_changes = dirty => ({});
	const get_list_prepend_slot_context = ctx => ({});

	// (686:4) {#if listOpen}
	function create_if_block_8(ctx) {
		let div;
		let t0;
		let current_block_type_index;
		let if_block1;
		let t1;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*$$slots*/ ctx[50]['list-prepend'] && create_if_block_13(ctx);
		const if_block_creators = [create_if_block_10, create_if_block_11, create_if_block_12];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*$$slots*/ ctx[50].list) return 0;
			if (/*filteredItems*/ ctx[24].length > 0) return 1;
			if (!/*hideEmptyState*/ ctx[19]) return 2;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		}

		let if_block2 = /*$$slots*/ ctx[50]['list-append'] && create_if_block_9(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				if (if_block1) if_block1.c();
				t1 = space();
				if (if_block2) if_block2.c();
				attr_dev(div, "class", "svelte-select-list svelte-82qwg8");
				attr_dev(div, "role", "none");
				toggle_class(div, "prefloat", /*prefloat*/ ctx[28]);
				add_location(div, file$7, 686, 8, 21006);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if (if_block0) if_block0.m(div, null);
				append_dev(div, t0);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(div, null);
				}

				append_dev(div, t1);
				if (if_block2) if_block2.m(div, null);
				/*div_binding*/ ctx[91](div);
				current = true;

				if (!mounted) {
					dispose = [
						action_destroyer(/*floatingContent*/ ctx[49].call(null, div)),
						listen_dev(div, "scroll", /*handleListScroll*/ ctx[41], false, false, false, false),
						listen_dev(div, "pointerup", stop_propagation(prevent_default(/*pointerup_handler*/ ctx[85])), false, true, true, false),
						listen_dev(div, "mousedown", stop_propagation(prevent_default(/*mousedown_handler*/ ctx[86])), false, true, true, false)
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*$$slots*/ ctx[50]['list-prepend']) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty[1] & /*$$slots*/ 524288) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_13(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) {
						if_blocks[current_block_type_index].p(ctx, dirty);
					}
				} else {
					if (if_block1) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block1 = if_blocks[current_block_type_index];

						if (!if_block1) {
							if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
							if_block1.c();
						} else {
							if_block1.p(ctx, dirty);
						}

						transition_in(if_block1, 1);
						if_block1.m(div, t1);
					} else {
						if_block1 = null;
					}
				}

				if (/*$$slots*/ ctx[50]['list-append']) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty[1] & /*$$slots*/ 524288) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block_9(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div, null);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				if (!current || dirty[0] & /*prefloat*/ 268435456) {
					toggle_class(div, "prefloat", /*prefloat*/ ctx[28]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(if_block1);
				transition_in(if_block2);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(if_block1);
				transition_out(if_block2);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (if_block0) if_block0.d();

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d();
				}

				if (if_block2) if_block2.d();
				/*div_binding*/ ctx[91](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_8.name,
			type: "if",
			source: "(686:4) {#if listOpen}",
			ctx
		});

		return block;
	}

	// (696:12) {#if $$slots['list-prepend']}
	function create_if_block_13(ctx) {
		let current;
		const list_prepend_slot_template = /*#slots*/ ctx[83]["list-prepend"];
		const list_prepend_slot = create_slot(list_prepend_slot_template, ctx, /*$$scope*/ ctx[82], get_list_prepend_slot_context);

		const block = {
			c: function create() {
				if (list_prepend_slot) list_prepend_slot.c();
			},
			m: function mount(target, anchor) {
				if (list_prepend_slot) {
					list_prepend_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (list_prepend_slot) {
					if (list_prepend_slot.p && (!current || dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							list_prepend_slot,
							list_prepend_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(list_prepend_slot_template, /*$$scope*/ ctx[82], dirty, get_list_prepend_slot_changes),
							get_list_prepend_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(list_prepend_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(list_prepend_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (list_prepend_slot) list_prepend_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_13.name,
			type: "if",
			source: "(696:12) {#if $$slots['list-prepend']}",
			ctx
		});

		return block;
	}

	// (724:38) 
	function create_if_block_12(ctx) {
		let current;
		const empty_slot_template = /*#slots*/ ctx[83].empty;
		const empty_slot = create_slot(empty_slot_template, ctx, /*$$scope*/ ctx[82], get_empty_slot_context);
		const empty_slot_or_fallback = empty_slot || fallback_block_9(ctx);

		const block = {
			c: function create() {
				if (empty_slot_or_fallback) empty_slot_or_fallback.c();
			},
			m: function mount(target, anchor) {
				if (empty_slot_or_fallback) {
					empty_slot_or_fallback.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (empty_slot) {
					if (empty_slot.p && (!current || dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							empty_slot,
							empty_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(empty_slot_template, /*$$scope*/ ctx[82], dirty, get_empty_slot_changes),
							get_empty_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(empty_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(empty_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (empty_slot_or_fallback) empty_slot_or_fallback.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_12.name,
			type: "if",
			source: "(724:38) ",
			ctx
		});

		return block;
	}

	// (698:47) 
	function create_if_block_11(ctx) {
		let each_1_anchor;
		let current;
		let each_value_1 = ensure_array_like_dev(/*filteredItems*/ ctx[24]);
		let each_blocks = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*filteredItems, value, itemId, listDom, scrollToHoverItem, hoverItemIndex, label*/ 1627402376 | dirty[1] & /*handleHover, handleItemClick, isItemActive*/ 28672 | dirty[2] & /*$$scope*/ 1048576) {
					each_value_1 = ensure_array_like_dev(/*filteredItems*/ ctx[24]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block_1$2(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value_1.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value_1.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_11.name,
			type: "if",
			source: "(698:47) ",
			ctx
		});

		return block;
	}

	// (697:12) {#if $$slots.list}
	function create_if_block_10(ctx) {
		let current;
		const list_slot_template = /*#slots*/ ctx[83].list;
		const list_slot = create_slot(list_slot_template, ctx, /*$$scope*/ ctx[82], get_list_slot_context);

		const block = {
			c: function create() {
				if (list_slot) list_slot.c();
			},
			m: function mount(target, anchor) {
				if (list_slot) {
					list_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (list_slot) {
					if (list_slot.p && (!current || dirty[0] & /*filteredItems*/ 16777216 | dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							list_slot,
							list_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(list_slot_template, /*$$scope*/ ctx[82], dirty, get_list_slot_changes),
							get_list_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(list_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(list_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (list_slot) list_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_10.name,
			type: "if",
			source: "(697:12) {#if $$slots.list}",
			ctx
		});

		return block;
	}

	// (725:35)                      
	function fallback_block_9(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element("div");
				div.textContent = "No options";
				attr_dev(div, "class", "empty svelte-82qwg8");
				add_location(div, file$7, 725, 20, 22952);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_9.name,
			type: "fallback",
			source: "(725:35)                      ",
			ctx
		});

		return block;
	}

	// (718:63)                                  
	function fallback_block_8(ctx) {
		let t_value = /*item*/ ctx[126]?.[/*label*/ ctx[12]] + "";
		let t;

		const block = {
			c: function create() {
				t = text(t_value);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*filteredItems, label*/ 16781312 && t_value !== (t_value = /*item*/ ctx[126]?.[/*label*/ ctx[12]] + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_8.name,
			type: "fallback",
			source: "(718:63)                                  ",
			ctx
		});

		return block;
	}

	// (699:16) {#each filteredItems as item, i}
	function create_each_block_1$2(ctx) {
		let div1;
		let div0;
		let activeScroll_action;
		let hoverScroll_action;
		let t;
		let current;
		let mounted;
		let dispose;
		const item_slot_template = /*#slots*/ ctx[83].item;
		const item_slot = create_slot(item_slot_template, ctx, /*$$scope*/ ctx[82], get_item_slot_context);
		const item_slot_or_fallback = item_slot || fallback_block_8(ctx);

		function mouseover_handler() {
			return /*mouseover_handler*/ ctx[88](/*i*/ ctx[128]);
		}

		function focus_handler() {
			return /*focus_handler*/ ctx[89](/*i*/ ctx[128]);
		}

		function click_handler() {
			return /*click_handler*/ ctx[90](/*item*/ ctx[126], /*i*/ ctx[128]);
		}

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				if (item_slot_or_fallback) item_slot_or_fallback.c();
				t = space();
				attr_dev(div0, "class", "item svelte-82qwg8");
				toggle_class(div0, "list-group-title", /*item*/ ctx[126].groupHeader);
				toggle_class(div0, "active", /*isItemActive*/ ctx[45](/*item*/ ctx[126], /*value*/ ctx[3], /*itemId*/ ctx[13]));
				toggle_class(div0, "first", isItemFirst(/*i*/ ctx[128]));
				toggle_class(div0, "hover", /*hoverItemIndex*/ ctx[7] === /*i*/ ctx[128]);
				toggle_class(div0, "group-item", /*item*/ ctx[126].groupItem);
				toggle_class(div0, "not-selectable", /*item*/ ctx[126]?.selectable === false);
				add_location(div0, file$7, 707, 24, 21980);
				attr_dev(div1, "class", "list-item svelte-82qwg8");
				attr_dev(div1, "tabindex", "-1");
				attr_dev(div1, "role", "none");
				add_location(div1, file$7, 699, 20, 21566);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);

				if (item_slot_or_fallback) {
					item_slot_or_fallback.m(div0, null);
				}

				append_dev(div1, t);
				current = true;

				if (!mounted) {
					dispose = [
						action_destroyer(activeScroll_action = /*activeScroll*/ ctx[46].call(null, div0, {
							scroll: /*isItemActive*/ ctx[45](/*item*/ ctx[126], /*value*/ ctx[3], /*itemId*/ ctx[13]),
							listDom: /*listDom*/ ctx[30]
						})),
						action_destroyer(hoverScroll_action = /*hoverScroll*/ ctx[47].call(null, div0, {
							scroll: /*scrollToHoverItem*/ ctx[29] === /*i*/ ctx[128],
							listDom: /*listDom*/ ctx[30]
						})),
						listen_dev(div1, "mouseover", mouseover_handler, false, false, false, false),
						listen_dev(div1, "focus", focus_handler, false, false, false, false),
						listen_dev(div1, "click", stop_propagation(click_handler), false, false, true, false),
						listen_dev(div1, "keydown", stop_propagation(prevent_default(/*keydown_handler*/ ctx[87])), false, true, true, false)
					];

					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (item_slot) {
					if (item_slot.p && (!current || dirty[0] & /*filteredItems*/ 16777216 | dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							item_slot,
							item_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(item_slot_template, /*$$scope*/ ctx[82], dirty, get_item_slot_changes),
							get_item_slot_context
						);
					}
				} else {
					if (item_slot_or_fallback && item_slot_or_fallback.p && (!current || dirty[0] & /*filteredItems, label*/ 16781312)) {
						item_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
					}
				}

				if (activeScroll_action && is_function(activeScroll_action.update) && dirty[0] & /*filteredItems, value, itemId, listDom*/ 1090527240) activeScroll_action.update.call(null, {
					scroll: /*isItemActive*/ ctx[45](/*item*/ ctx[126], /*value*/ ctx[3], /*itemId*/ ctx[13]),
					listDom: /*listDom*/ ctx[30]
				});

				if (hoverScroll_action && is_function(hoverScroll_action.update) && dirty[0] & /*scrollToHoverItem, listDom*/ 1610612736) hoverScroll_action.update.call(null, {
					scroll: /*scrollToHoverItem*/ ctx[29] === /*i*/ ctx[128],
					listDom: /*listDom*/ ctx[30]
				});

				if (!current || dirty[0] & /*filteredItems*/ 16777216) {
					toggle_class(div0, "list-group-title", /*item*/ ctx[126].groupHeader);
				}

				if (!current || dirty[0] & /*filteredItems, value, itemId*/ 16785416 | dirty[1] & /*isItemActive*/ 16384) {
					toggle_class(div0, "active", /*isItemActive*/ ctx[45](/*item*/ ctx[126], /*value*/ ctx[3], /*itemId*/ ctx[13]));
				}

				if (!current || dirty[0] & /*hoverItemIndex*/ 128) {
					toggle_class(div0, "hover", /*hoverItemIndex*/ ctx[7] === /*i*/ ctx[128]);
				}

				if (!current || dirty[0] & /*filteredItems*/ 16777216) {
					toggle_class(div0, "group-item", /*item*/ ctx[126].groupItem);
				}

				if (!current || dirty[0] & /*filteredItems*/ 16777216) {
					toggle_class(div0, "not-selectable", /*item*/ ctx[126]?.selectable === false);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(item_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(item_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				if (item_slot_or_fallback) item_slot_or_fallback.d(detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1$2.name,
			type: "each",
			source: "(699:16) {#each filteredItems as item, i}",
			ctx
		});

		return block;
	}

	// (729:12) {#if $$slots['list-append']}
	function create_if_block_9(ctx) {
		let current;
		const list_append_slot_template = /*#slots*/ ctx[83]["list-append"];
		const list_append_slot = create_slot(list_append_slot_template, ctx, /*$$scope*/ ctx[82], get_list_append_slot_context);

		const block = {
			c: function create() {
				if (list_append_slot) list_append_slot.c();
			},
			m: function mount(target, anchor) {
				if (list_append_slot) {
					list_append_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (list_append_slot) {
					if (list_append_slot.p && (!current || dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							list_append_slot,
							list_append_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(list_append_slot_template, /*$$scope*/ ctx[82], dirty, get_list_append_slot_changes),
							get_list_append_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(list_append_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(list_append_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (list_append_slot) list_append_slot.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_9.name,
			type: "if",
			source: "(729:12) {#if $$slots['list-append']}",
			ctx
		});

		return block;
	}

	// (734:8) {#if focused}
	function create_if_block_7(ctx) {
		let span0;
		let t0;
		let t1;
		let span1;
		let t2;

		const block = {
			c: function create() {
				span0 = element("span");
				t0 = text(/*ariaSelection*/ ctx[32]);
				t1 = space();
				span1 = element("span");
				t2 = text(/*ariaContext*/ ctx[31]);
				attr_dev(span0, "id", "aria-selection");
				attr_dev(span0, "class", "svelte-82qwg8");
				add_location(span0, file$7, 734, 12, 23262);
				attr_dev(span1, "id", "aria-context");
				attr_dev(span1, "class", "svelte-82qwg8");
				add_location(span1, file$7, 735, 12, 23323);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span0, anchor);
				append_dev(span0, t0);
				insert_dev(target, t1, anchor);
				insert_dev(target, span1, anchor);
				append_dev(span1, t2);
			},
			p: function update(ctx, dirty) {
				if (dirty[1] & /*ariaSelection*/ 2) set_data_dev(t0, /*ariaSelection*/ ctx[32]);
				if (dirty[1] & /*ariaContext*/ 1) set_data_dev(t2, /*ariaContext*/ ctx[31]);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(span0);
					detach_dev(t1);
					detach_dev(span1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_7.name,
			type: "if",
			source: "(734:8) {#if focused}",
			ctx
		});

		return block;
	}

	// (747:8) {#if hasValue}
	function create_if_block_4(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_5, create_else_block];
		const if_blocks = [];

		function select_block_type_1(ctx, dirty) {
			if (/*multiple*/ ctx[9]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type_1(ctx);
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type_1(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(if_block_anchor);
				}

				if_blocks[current_block_type_index].d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_4.name,
			type: "if",
			source: "(747:8) {#if hasValue}",
			ctx
		});

		return block;
	}

	// (774:12) {:else}
	function create_else_block(ctx) {
		let div;
		let current;
		const selection_slot_template = /*#slots*/ ctx[83].selection;
		const selection_slot = create_slot(selection_slot_template, ctx, /*$$scope*/ ctx[82], get_selection_slot_context_1);
		const selection_slot_or_fallback = selection_slot || fallback_block_7(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (selection_slot_or_fallback) selection_slot_or_fallback.c();
				attr_dev(div, "class", "selected-item svelte-82qwg8");
				toggle_class(div, "hide-selected-item", /*hideSelectedItem*/ ctx[35]);
				add_location(div, file$7, 774, 16, 24832);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (selection_slot_or_fallback) {
					selection_slot_or_fallback.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (selection_slot) {
					if (selection_slot.p && (!current || dirty[0] & /*value*/ 8 | dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							selection_slot,
							selection_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(selection_slot_template, /*$$scope*/ ctx[82], dirty, get_selection_slot_changes_1),
							get_selection_slot_context_1
						);
					}
				} else {
					if (selection_slot_or_fallback && selection_slot_or_fallback.p && (!current || dirty[0] & /*value, label*/ 4104)) {
						selection_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
					}
				}

				if (!current || dirty[1] & /*hideSelectedItem*/ 16) {
					toggle_class(div, "hide-selected-item", /*hideSelectedItem*/ ctx[35]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(selection_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(selection_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (selection_slot_or_fallback) selection_slot_or_fallback.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_else_block.name,
			type: "else",
			source: "(774:12) {:else}",
			ctx
		});

		return block;
	}

	// (748:12) {#if multiple}
	function create_if_block_5(ctx) {
		let each_1_anchor;
		let current;
		let each_value = ensure_array_like_dev(/*value*/ ctx[3]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		const block = {
			c: function create() {
				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each_1_anchor = empty();
			},
			m: function mount(target, anchor) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert_dev(target, each_1_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*activeValue, disabled, multiFullItemClearable, value, label*/ 67116040 | dirty[1] & /*handleMultiItemClear*/ 32 | dirty[2] & /*$$scope*/ 1048576) {
					each_value = ensure_array_like_dev(/*value*/ ctx[3]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(each_1_anchor);
				}

				destroy_each(each_blocks, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_5.name,
			type: "if",
			source: "(748:12) {#if multiple}",
			ctx
		});

		return block;
	}

	// (776:61)                          
	function fallback_block_7(ctx) {
		let t_value = /*value*/ ctx[3][/*label*/ ctx[12]] + "";
		let t;

		const block = {
			c: function create() {
				t = text(t_value);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*value, label*/ 4104 && t_value !== (t_value = /*value*/ ctx[3][/*label*/ ctx[12]] + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_7.name,
			type: "fallback",
			source: "(776:61)                          ",
			ctx
		});

		return block;
	}

	// (758:78)                                  
	function fallback_block_6(ctx) {
		let t_value = /*item*/ ctx[126][/*label*/ ctx[12]] + "";
		let t;

		const block = {
			c: function create() {
				t = text(t_value);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*value, label*/ 4104 && t_value !== (t_value = /*item*/ ctx[126][/*label*/ ctx[12]] + "")) set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(t);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_6.name,
			type: "fallback",
			source: "(758:78)                                  ",
			ctx
		});

		return block;
	}

	// (763:24) {#if !disabled && !multiFullItemClearable && ClearIcon}
	function create_if_block_6(ctx) {
		let div;
		let current;
		let mounted;
		let dispose;
		const multi_clear_icon_slot_template = /*#slots*/ ctx[83]["multi-clear-icon"];
		const multi_clear_icon_slot = create_slot(multi_clear_icon_slot_template, ctx, /*$$scope*/ ctx[82], get_multi_clear_icon_slot_context);
		const multi_clear_icon_slot_or_fallback = multi_clear_icon_slot || fallback_block_5(ctx);

		function pointerup_handler_1() {
			return /*pointerup_handler_1*/ ctx[92](/*i*/ ctx[128]);
		}

		const block = {
			c: function create() {
				div = element("div");
				if (multi_clear_icon_slot_or_fallback) multi_clear_icon_slot_or_fallback.c();
				attr_dev(div, "class", "multi-item-clear svelte-82qwg8");
				add_location(div, file$7, 763, 28, 24356);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (multi_clear_icon_slot_or_fallback) {
					multi_clear_icon_slot_or_fallback.m(div, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(div, "pointerup", stop_propagation(prevent_default(pointerup_handler_1)), false, true, true, false);
					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (multi_clear_icon_slot) {
					if (multi_clear_icon_slot.p && (!current || dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							multi_clear_icon_slot,
							multi_clear_icon_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(multi_clear_icon_slot_template, /*$$scope*/ ctx[82], dirty, get_multi_clear_icon_slot_changes),
							get_multi_clear_icon_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(multi_clear_icon_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(multi_clear_icon_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (multi_clear_icon_slot_or_fallback) multi_clear_icon_slot_or_fallback.d(detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_6.name,
			type: "if",
			source: "(763:24) {#if !disabled && !multiFullItemClearable && ClearIcon}",
			ctx
		});

		return block;
	}

	// (767:62)                                      
	function fallback_block_5(ctx) {
		let clearicon;
		let current;
		clearicon = new ClearIcon({ $$inline: true });

		const block = {
			c: function create() {
				create_component(clearicon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(clearicon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(clearicon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(clearicon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(clearicon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_5.name,
			type: "fallback",
			source: "(767:62)                                      ",
			ctx
		});

		return block;
	}

	// (749:16) {#each value as item, i}
	function create_each_block$2(ctx) {
		let div;
		let span;
		let t0;
		let t1;
		let current;
		let mounted;
		let dispose;
		const selection_slot_template = /*#slots*/ ctx[83].selection;
		const selection_slot = create_slot(selection_slot_template, ctx, /*$$scope*/ ctx[82], get_selection_slot_context);
		const selection_slot_or_fallback = selection_slot || fallback_block_6(ctx);
		let if_block = !/*disabled*/ ctx[11] && !/*multiFullItemClearable*/ ctx[10] && ClearIcon && create_if_block_6(ctx);

		function click_handler_1() {
			return /*click_handler_1*/ ctx[93](/*i*/ ctx[128]);
		}

		const block = {
			c: function create() {
				div = element("div");
				span = element("span");
				if (selection_slot_or_fallback) selection_slot_or_fallback.c();
				t0 = space();
				if (if_block) if_block.c();
				t1 = space();
				attr_dev(span, "class", "multi-item-text svelte-82qwg8");
				add_location(span, file$7, 756, 24, 24023);
				attr_dev(div, "class", "multi-item svelte-82qwg8");
				attr_dev(div, "role", "none");
				toggle_class(div, "active", /*activeValue*/ ctx[26] === /*i*/ ctx[128]);
				toggle_class(div, "disabled", /*disabled*/ ctx[11]);
				add_location(div, file$7, 749, 20, 23640);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, span);

				if (selection_slot_or_fallback) {
					selection_slot_or_fallback.m(span, null);
				}

				append_dev(div, t0);
				if (if_block) if_block.m(div, null);
				append_dev(div, t1);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(div, "click", prevent_default(click_handler_1), false, true, false, false),
						listen_dev(div, "keydown", stop_propagation(prevent_default(/*keydown_handler_1*/ ctx[84])), false, true, true, false)
					];

					mounted = true;
				}
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (selection_slot) {
					if (selection_slot.p && (!current || dirty[0] & /*value*/ 8 | dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							selection_slot,
							selection_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(selection_slot_template, /*$$scope*/ ctx[82], dirty, get_selection_slot_changes),
							get_selection_slot_context
						);
					}
				} else {
					if (selection_slot_or_fallback && selection_slot_or_fallback.p && (!current || dirty[0] & /*value, label*/ 4104)) {
						selection_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
					}
				}

				if (!/*disabled*/ ctx[11] && !/*multiFullItemClearable*/ ctx[10] && ClearIcon) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty[0] & /*disabled, multiFullItemClearable*/ 3072) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_6(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div, t1);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}

				if (!current || dirty[0] & /*activeValue*/ 67108864) {
					toggle_class(div, "active", /*activeValue*/ ctx[26] === /*i*/ ctx[128]);
				}

				if (!current || dirty[0] & /*disabled*/ 2048) {
					toggle_class(div, "disabled", /*disabled*/ ctx[11]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(selection_slot_or_fallback, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(selection_slot_or_fallback, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (selection_slot_or_fallback) selection_slot_or_fallback.d(detaching);
				if (if_block) if_block.d();
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$2.name,
			type: "each",
			source: "(749:16) {#each value as item, i}",
			ctx
		});

		return block;
	}

	// (797:8) {#if loading}
	function create_if_block_3(ctx) {
		let div;
		let current;
		const loading_icon_slot_template = /*#slots*/ ctx[83]["loading-icon"];
		const loading_icon_slot = create_slot(loading_icon_slot_template, ctx, /*$$scope*/ ctx[82], get_loading_icon_slot_context);
		const loading_icon_slot_or_fallback = loading_icon_slot || fallback_block_4(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (loading_icon_slot_or_fallback) loading_icon_slot_or_fallback.c();
				attr_dev(div, "class", "icon loading svelte-82qwg8");
				attr_dev(div, "aria-hidden", "true");
				add_location(div, file$7, 797, 12, 25521);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (loading_icon_slot_or_fallback) {
					loading_icon_slot_or_fallback.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (loading_icon_slot) {
					if (loading_icon_slot.p && (!current || dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							loading_icon_slot,
							loading_icon_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(loading_icon_slot_template, /*$$scope*/ ctx[82], dirty, get_loading_icon_slot_changes),
							get_loading_icon_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(loading_icon_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loading_icon_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (loading_icon_slot_or_fallback) loading_icon_slot_or_fallback.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_3.name,
			type: "if",
			source: "(797:8) {#if loading}",
			ctx
		});

		return block;
	}

	// (799:42)                      
	function fallback_block_4(ctx) {
		let loadingicon;
		let current;
		loadingicon = new LoadingIcon({ $$inline: true });

		const block = {
			c: function create() {
				create_component(loadingicon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(loadingicon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(loadingicon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(loadingicon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(loadingicon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_4.name,
			type: "fallback",
			source: "(799:42)                      ",
			ctx
		});

		return block;
	}

	// (805:8) {#if showClear}
	function create_if_block_2(ctx) {
		let button;
		let current;
		let mounted;
		let dispose;
		const clear_icon_slot_template = /*#slots*/ ctx[83]["clear-icon"];
		const clear_icon_slot = create_slot(clear_icon_slot_template, ctx, /*$$scope*/ ctx[82], get_clear_icon_slot_context);
		const clear_icon_slot_or_fallback = clear_icon_slot || fallback_block_3(ctx);

		const block = {
			c: function create() {
				button = element("button");
				if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.c();
				attr_dev(button, "type", "button");
				attr_dev(button, "class", "icon clear-select svelte-82qwg8");
				add_location(button, file$7, 805, 12, 25740);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);

				if (clear_icon_slot_or_fallback) {
					clear_icon_slot_or_fallback.m(button, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(button, "click", /*handleClear*/ ctx[22], false, false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (clear_icon_slot) {
					if (clear_icon_slot.p && (!current || dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							clear_icon_slot,
							clear_icon_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(clear_icon_slot_template, /*$$scope*/ ctx[82], dirty, get_clear_icon_slot_changes),
							get_clear_icon_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(clear_icon_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(clear_icon_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(button);
				}

				if (clear_icon_slot_or_fallback) clear_icon_slot_or_fallback.d(detaching);
				mounted = false;
				dispose();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_2.name,
			type: "if",
			source: "(805:8) {#if showClear}",
			ctx
		});

		return block;
	}

	// (807:40)                      
	function fallback_block_3(ctx) {
		let clearicon;
		let current;
		clearicon = new ClearIcon({ $$inline: true });

		const block = {
			c: function create() {
				create_component(clearicon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(clearicon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(clearicon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(clearicon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(clearicon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_3.name,
			type: "fallback",
			source: "(807:40)                      ",
			ctx
		});

		return block;
	}

	// (813:8) {#if showChevron}
	function create_if_block_1$2(ctx) {
		let div;
		let current;
		const chevron_icon_slot_template = /*#slots*/ ctx[83]["chevron-icon"];
		const chevron_icon_slot = create_slot(chevron_icon_slot_template, ctx, /*$$scope*/ ctx[82], get_chevron_icon_slot_context);
		const chevron_icon_slot_or_fallback = chevron_icon_slot || fallback_block_2(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (chevron_icon_slot_or_fallback) chevron_icon_slot_or_fallback.c();
				attr_dev(div, "class", "icon chevron svelte-82qwg8");
				attr_dev(div, "aria-hidden", "true");
				add_location(div, file$7, 813, 12, 25986);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (chevron_icon_slot_or_fallback) {
					chevron_icon_slot_or_fallback.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (chevron_icon_slot) {
					if (chevron_icon_slot.p && (!current || dirty[0] & /*listOpen*/ 64 | dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							chevron_icon_slot,
							chevron_icon_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(chevron_icon_slot_template, /*$$scope*/ ctx[82], dirty, get_chevron_icon_slot_changes),
							get_chevron_icon_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(chevron_icon_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(chevron_icon_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (chevron_icon_slot_or_fallback) chevron_icon_slot_or_fallback.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$2.name,
			type: "if",
			source: "(813:8) {#if showChevron}",
			ctx
		});

		return block;
	}

	// (815:53)                      
	function fallback_block_2(ctx) {
		let chevronicon;
		let current;
		chevronicon = new ChevronIcon({ $$inline: true });

		const block = {
			c: function create() {
				create_component(chevronicon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(chevronicon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(chevronicon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(chevronicon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(chevronicon, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_2.name,
			type: "fallback",
			source: "(815:53)                      ",
			ctx
		});

		return block;
	}

	// (822:38)          
	function fallback_block_1(ctx) {
		let input_1;
		let input_1_value_value;

		const block = {
			c: function create() {
				input_1 = element("input");
				attr_dev(input_1, "name", /*name*/ ctx[8]);
				attr_dev(input_1, "type", "hidden");

				input_1.value = input_1_value_value = /*value*/ ctx[3]
				? JSON.stringify(/*value*/ ctx[3])
				: null;

				attr_dev(input_1, "class", "svelte-82qwg8");
				add_location(input_1, file$7, 822, 8, 26238);
			},
			m: function mount(target, anchor) {
				insert_dev(target, input_1, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*name*/ 256) {
					attr_dev(input_1, "name", /*name*/ ctx[8]);
				}

				if (dirty[0] & /*value*/ 8 && input_1_value_value !== (input_1_value_value = /*value*/ ctx[3]
				? JSON.stringify(/*value*/ ctx[3])
				: null)) {
					prop_dev(input_1, "value", input_1_value_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(input_1);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block_1.name,
			type: "fallback",
			source: "(822:38)          ",
			ctx
		});

		return block;
	}

	// (826:4) {#if required && (!value || value.length === 0)}
	function create_if_block$3(ctx) {
		let current;
		const required_slot_template = /*#slots*/ ctx[83].required;
		const required_slot = create_slot(required_slot_template, ctx, /*$$scope*/ ctx[82], get_required_slot_context);
		const required_slot_or_fallback = required_slot || fallback_block(ctx);

		const block = {
			c: function create() {
				if (required_slot_or_fallback) required_slot_or_fallback.c();
			},
			m: function mount(target, anchor) {
				if (required_slot_or_fallback) {
					required_slot_or_fallback.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (required_slot) {
					if (required_slot.p && (!current || dirty[0] & /*value*/ 8 | dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							required_slot,
							required_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(required_slot_template, /*$$scope*/ ctx[82], dirty, get_required_slot_changes),
							get_required_slot_context
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(required_slot_or_fallback, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(required_slot_or_fallback, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (required_slot_or_fallback) required_slot_or_fallback.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$3.name,
			type: "if",
			source: "(826:4) {#if required && (!value || value.length === 0)}",
			ctx
		});

		return block;
	}

	// (827:38)              
	function fallback_block(ctx) {
		let select;

		const block = {
			c: function create() {
				select = element("select");
				attr_dev(select, "class", "required svelte-82qwg8");
				select.required = true;
				attr_dev(select, "tabindex", "-1");
				attr_dev(select, "aria-hidden", "true");
				add_location(select, file$7, 827, 12, 26431);
			},
			m: function mount(target, anchor) {
				insert_dev(target, select, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(select);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: fallback_block.name,
			type: "fallback",
			source: "(827:38)              ",
			ctx
		});

		return block;
	}

	function create_fragment$7(ctx) {
		let div3;
		let t0;
		let span;
		let t1;
		let div0;
		let t2;
		let div1;
		let t3;
		let input_1;
		let input_1_readonly_value;
		let t4;
		let div2;
		let t5;
		let t6;
		let t7;
		let t8;
		let div3_class_value;
		let current;
		let mounted;
		let dispose;
		let if_block0 = /*listOpen*/ ctx[6] && create_if_block_8(ctx);
		let if_block1 = /*focused*/ ctx[2] && create_if_block_7(ctx);
		const prepend_slot_template = /*#slots*/ ctx[83].prepend;
		const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[82], get_prepend_slot_context);
		let if_block2 = /*hasValue*/ ctx[25] && create_if_block_4(ctx);

		let input_1_levels = [
			{
				readOnly: input_1_readonly_value = !/*searchable*/ ctx[17]
			},
			/*_inputAttributes*/ ctx[27],
			{ placeholder: /*placeholderText*/ ctx[33] },
			{ style: /*inputStyles*/ ctx[18] },
			{ disabled: /*disabled*/ ctx[11] }
		];

		let input_data = {};

		for (let i = 0; i < input_1_levels.length; i += 1) {
			input_data = assign(input_data, input_1_levels[i]);
		}

		let if_block3 = /*loading*/ ctx[5] && create_if_block_3(ctx);
		let if_block4 = /*showClear*/ ctx[34] && create_if_block_2(ctx);
		let if_block5 = /*showChevron*/ ctx[20] && create_if_block_1$2(ctx);
		const input_hidden_slot_template = /*#slots*/ ctx[83]["input-hidden"];
		const input_hidden_slot = create_slot(input_hidden_slot_template, ctx, /*$$scope*/ ctx[82], get_input_hidden_slot_context);
		const input_hidden_slot_or_fallback = input_hidden_slot || fallback_block_1(ctx);
		let if_block6 = /*required*/ ctx[16] && (!/*value*/ ctx[3] || /*value*/ ctx[3].length === 0) && create_if_block$3(ctx);

		const block = {
			c: function create() {
				div3 = element("div");
				if (if_block0) if_block0.c();
				t0 = space();
				span = element("span");
				if (if_block1) if_block1.c();
				t1 = space();
				div0 = element("div");
				if (prepend_slot) prepend_slot.c();
				t2 = space();
				div1 = element("div");
				if (if_block2) if_block2.c();
				t3 = space();
				input_1 = element("input");
				t4 = space();
				div2 = element("div");
				if (if_block3) if_block3.c();
				t5 = space();
				if (if_block4) if_block4.c();
				t6 = space();
				if (if_block5) if_block5.c();
				t7 = space();
				if (input_hidden_slot_or_fallback) input_hidden_slot_or_fallback.c();
				t8 = space();
				if (if_block6) if_block6.c();
				attr_dev(span, "aria-live", "polite");
				attr_dev(span, "aria-atomic", "false");
				attr_dev(span, "aria-relevant", "additions text");
				attr_dev(span, "class", "a11y-text svelte-82qwg8");
				add_location(span, file$7, 732, 4, 23133);
				attr_dev(div0, "class", "prepend svelte-82qwg8");
				add_location(div0, file$7, 741, 4, 23429);
				set_attributes(input_1, input_data);
				toggle_class(input_1, "svelte-82qwg8", true);
				add_location(input_1, file$7, 782, 8, 25097);
				attr_dev(div1, "class", "value-container svelte-82qwg8");
				add_location(div1, file$7, 745, 4, 23499);
				attr_dev(div2, "class", "indicators svelte-82qwg8");
				add_location(div2, file$7, 795, 4, 25462);
				attr_dev(div3, "class", div3_class_value = "svelte-select " + /*containerClasses*/ ctx[21] + " svelte-82qwg8");
				attr_dev(div3, "style", /*containerStyles*/ ctx[14]);
				attr_dev(div3, "role", "none");
				toggle_class(div3, "multi", /*multiple*/ ctx[9]);
				toggle_class(div3, "disabled", /*disabled*/ ctx[11]);
				toggle_class(div3, "focused", /*focused*/ ctx[2]);
				toggle_class(div3, "list-open", /*listOpen*/ ctx[6]);
				toggle_class(div3, "show-chevron", /*showChevron*/ ctx[20]);
				toggle_class(div3, "error", /*hasError*/ ctx[15]);
				add_location(div3, file$7, 672, 0, 20633);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div3, anchor);
				if (if_block0) if_block0.m(div3, null);
				append_dev(div3, t0);
				append_dev(div3, span);
				if (if_block1) if_block1.m(span, null);
				append_dev(div3, t1);
				append_dev(div3, div0);

				if (prepend_slot) {
					prepend_slot.m(div0, null);
				}

				append_dev(div3, t2);
				append_dev(div3, div1);
				if (if_block2) if_block2.m(div1, null);
				append_dev(div1, t3);
				append_dev(div1, input_1);
				if (input_1.autofocus) input_1.focus();
				/*input_1_binding*/ ctx[94](input_1);
				set_input_value(input_1, /*filterText*/ ctx[4]);
				append_dev(div3, t4);
				append_dev(div3, div2);
				if (if_block3) if_block3.m(div2, null);
				append_dev(div2, t5);
				if (if_block4) if_block4.m(div2, null);
				append_dev(div2, t6);
				if (if_block5) if_block5.m(div2, null);
				append_dev(div3, t7);

				if (input_hidden_slot_or_fallback) {
					input_hidden_slot_or_fallback.m(div3, null);
				}

				append_dev(div3, t8);
				if (if_block6) if_block6.m(div3, null);
				/*div3_binding*/ ctx[96](div3);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(window, "click", /*handleClickOutside*/ ctx[42], false, false, false, false),
						listen_dev(window, "keydown", /*handleKeyDown*/ ctx[37], false, false, false, false),
						listen_dev(input_1, "keydown", /*handleKeyDown*/ ctx[37], false, false, false, false),
						listen_dev(input_1, "blur", /*handleBlur*/ ctx[39], false, false, false, false),
						listen_dev(input_1, "focus", /*handleFocus*/ ctx[38], false, false, false, false),
						listen_dev(input_1, "input", /*input_1_input_handler*/ ctx[95]),
						listen_dev(div3, "pointerup", prevent_default(/*handleClick*/ ctx[40]), false, true, false, false),
						action_destroyer(/*floatingRef*/ ctx[48].call(null, div3))
					];

					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (/*listOpen*/ ctx[6]) {
					if (if_block0) {
						if_block0.p(ctx, dirty);

						if (dirty[0] & /*listOpen*/ 64) {
							transition_in(if_block0, 1);
						}
					} else {
						if_block0 = create_if_block_8(ctx);
						if_block0.c();
						transition_in(if_block0, 1);
						if_block0.m(div3, t0);
					}
				} else if (if_block0) {
					group_outros();

					transition_out(if_block0, 1, 1, () => {
						if_block0 = null;
					});

					check_outros();
				}

				if (/*focused*/ ctx[2]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_7(ctx);
						if_block1.c();
						if_block1.m(span, null);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (prepend_slot) {
					if (prepend_slot.p && (!current || dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							prepend_slot,
							prepend_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(prepend_slot_template, /*$$scope*/ ctx[82], dirty, get_prepend_slot_changes),
							get_prepend_slot_context
						);
					}
				}

				if (/*hasValue*/ ctx[25]) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty[0] & /*hasValue*/ 33554432) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block_4(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div1, t3);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				set_attributes(input_1, input_data = get_spread_update(input_1_levels, [
					(!current || dirty[0] & /*searchable*/ 131072 && input_1_readonly_value !== (input_1_readonly_value = !/*searchable*/ ctx[17])) && { readOnly: input_1_readonly_value },
					dirty[0] & /*_inputAttributes*/ 134217728 && /*_inputAttributes*/ ctx[27],
					(!current || dirty[1] & /*placeholderText*/ 4) && { placeholder: /*placeholderText*/ ctx[33] },
					(!current || dirty[0] & /*inputStyles*/ 262144) && { style: /*inputStyles*/ ctx[18] },
					(!current || dirty[0] & /*disabled*/ 2048) && { disabled: /*disabled*/ ctx[11] }
				]));

				if (dirty[0] & /*filterText*/ 16 && input_1.value !== /*filterText*/ ctx[4]) {
					set_input_value(input_1, /*filterText*/ ctx[4]);
				}

				toggle_class(input_1, "svelte-82qwg8", true);

				if (/*loading*/ ctx[5]) {
					if (if_block3) {
						if_block3.p(ctx, dirty);

						if (dirty[0] & /*loading*/ 32) {
							transition_in(if_block3, 1);
						}
					} else {
						if_block3 = create_if_block_3(ctx);
						if_block3.c();
						transition_in(if_block3, 1);
						if_block3.m(div2, t5);
					}
				} else if (if_block3) {
					group_outros();

					transition_out(if_block3, 1, 1, () => {
						if_block3 = null;
					});

					check_outros();
				}

				if (/*showClear*/ ctx[34]) {
					if (if_block4) {
						if_block4.p(ctx, dirty);

						if (dirty[1] & /*showClear*/ 8) {
							transition_in(if_block4, 1);
						}
					} else {
						if_block4 = create_if_block_2(ctx);
						if_block4.c();
						transition_in(if_block4, 1);
						if_block4.m(div2, t6);
					}
				} else if (if_block4) {
					group_outros();

					transition_out(if_block4, 1, 1, () => {
						if_block4 = null;
					});

					check_outros();
				}

				if (/*showChevron*/ ctx[20]) {
					if (if_block5) {
						if_block5.p(ctx, dirty);

						if (dirty[0] & /*showChevron*/ 1048576) {
							transition_in(if_block5, 1);
						}
					} else {
						if_block5 = create_if_block_1$2(ctx);
						if_block5.c();
						transition_in(if_block5, 1);
						if_block5.m(div2, null);
					}
				} else if (if_block5) {
					group_outros();

					transition_out(if_block5, 1, 1, () => {
						if_block5 = null;
					});

					check_outros();
				}

				if (input_hidden_slot) {
					if (input_hidden_slot.p && (!current || dirty[0] & /*value*/ 8 | dirty[2] & /*$$scope*/ 1048576)) {
						update_slot_base(
							input_hidden_slot,
							input_hidden_slot_template,
							ctx,
							/*$$scope*/ ctx[82],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[82])
							: get_slot_changes(input_hidden_slot_template, /*$$scope*/ ctx[82], dirty, get_input_hidden_slot_changes),
							get_input_hidden_slot_context
						);
					}
				} else {
					if (input_hidden_slot_or_fallback && input_hidden_slot_or_fallback.p && (!current || dirty[0] & /*name, value*/ 264)) {
						input_hidden_slot_or_fallback.p(ctx, !current ? [-1, -1, -1, -1, -1] : dirty);
					}
				}

				if (/*required*/ ctx[16] && (!/*value*/ ctx[3] || /*value*/ ctx[3].length === 0)) {
					if (if_block6) {
						if_block6.p(ctx, dirty);

						if (dirty[0] & /*required, value*/ 65544) {
							transition_in(if_block6, 1);
						}
					} else {
						if_block6 = create_if_block$3(ctx);
						if_block6.c();
						transition_in(if_block6, 1);
						if_block6.m(div3, null);
					}
				} else if (if_block6) {
					group_outros();

					transition_out(if_block6, 1, 1, () => {
						if_block6 = null;
					});

					check_outros();
				}

				if (!current || dirty[0] & /*containerClasses*/ 2097152 && div3_class_value !== (div3_class_value = "svelte-select " + /*containerClasses*/ ctx[21] + " svelte-82qwg8")) {
					attr_dev(div3, "class", div3_class_value);
				}

				if (!current || dirty[0] & /*containerStyles*/ 16384) {
					attr_dev(div3, "style", /*containerStyles*/ ctx[14]);
				}

				if (!current || dirty[0] & /*containerClasses, multiple*/ 2097664) {
					toggle_class(div3, "multi", /*multiple*/ ctx[9]);
				}

				if (!current || dirty[0] & /*containerClasses, disabled*/ 2099200) {
					toggle_class(div3, "disabled", /*disabled*/ ctx[11]);
				}

				if (!current || dirty[0] & /*containerClasses, focused*/ 2097156) {
					toggle_class(div3, "focused", /*focused*/ ctx[2]);
				}

				if (!current || dirty[0] & /*containerClasses, listOpen*/ 2097216) {
					toggle_class(div3, "list-open", /*listOpen*/ ctx[6]);
				}

				if (!current || dirty[0] & /*containerClasses, showChevron*/ 3145728) {
					toggle_class(div3, "show-chevron", /*showChevron*/ ctx[20]);
				}

				if (!current || dirty[0] & /*containerClasses, hasError*/ 2129920) {
					toggle_class(div3, "error", /*hasError*/ ctx[15]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block0);
				transition_in(prepend_slot, local);
				transition_in(if_block2);
				transition_in(if_block3);
				transition_in(if_block4);
				transition_in(if_block5);
				transition_in(input_hidden_slot_or_fallback, local);
				transition_in(if_block6);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block0);
				transition_out(prepend_slot, local);
				transition_out(if_block2);
				transition_out(if_block3);
				transition_out(if_block4);
				transition_out(if_block5);
				transition_out(input_hidden_slot_or_fallback, local);
				transition_out(if_block6);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div3);
				}

				if (if_block0) if_block0.d();
				if (if_block1) if_block1.d();
				if (prepend_slot) prepend_slot.d(detaching);
				if (if_block2) if_block2.d();
				/*input_1_binding*/ ctx[94](null);
				if (if_block3) if_block3.d();
				if (if_block4) if_block4.d();
				if (if_block5) if_block5.d();
				if (input_hidden_slot_or_fallback) input_hidden_slot_or_fallback.d(detaching);
				if (if_block6) if_block6.d();
				/*div3_binding*/ ctx[96](null);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$7.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function convertStringItemsToObjects(_items) {
		return _items.map((item, index) => {
			return { index, value: item, label: `${item}` };
		});
	}

	function isItemFirst(itemIndex) {
		return itemIndex === 0;
	}

	function isItemSelectable(item) {
		return item.groupHeader && item.selectable || item.selectable || !item.hasOwnProperty('selectable');
	}

	function instance$7($$self, $$props, $$invalidate) {
		let hasValue;
		let hideSelectedItem;
		let showClear;
		let placeholderText;
		let ariaSelection;
		let ariaContext;
		let filteredItems;
		let listDom;
		let scrollToHoverItem;
		let { $$slots: slots = {}, $$scope } = $$props;

		validate_slots('Select', slots, [
			'list-prepend','list','item','empty','list-append','prepend','selection','multi-clear-icon','loading-icon','clear-icon','chevron-icon','input-hidden','required'
		]);

		const $$slots = compute_slots(slots);
		const dispatch = createEventDispatcher();
		let { justValue = null } = $$props;
		let { filter: filter$1 = filter } = $$props;
		let { getItems: getItems$1 = getItems } = $$props;
		let { id = null } = $$props;
		let { name = null } = $$props;
		let { container = undefined } = $$props;
		let { input = undefined } = $$props;
		let { multiple = false } = $$props;
		let { multiFullItemClearable = false } = $$props;
		let { disabled = false } = $$props;
		let { focused = false } = $$props;
		let { value = null } = $$props;
		let { filterText = '' } = $$props;
		let { placeholder = 'Please select' } = $$props;
		let { placeholderAlwaysShow = false } = $$props;
		let { items = null } = $$props;
		let { label = 'label' } = $$props;
		let { itemFilter = (label, filterText, option) => `${label}`.toLowerCase().includes(filterText.toLowerCase()) } = $$props;
		let { groupBy = undefined } = $$props;
		let { groupFilter = groups => groups } = $$props;
		let { groupHeaderSelectable = false } = $$props;
		let { itemId = 'value' } = $$props;
		let { loadOptions = undefined } = $$props;
		let { containerStyles = '' } = $$props;
		let { hasError = false } = $$props;
		let { filterSelectedItems = true } = $$props;
		let { required = false } = $$props;
		let { closeListOnChange = true } = $$props;
		let { clearFilterTextOnBlur = true } = $$props;

		let { createGroupHeaderItem = (groupValue, item) => {
			return { value: groupValue, [label]: groupValue };
		} } = $$props;

		const getFilteredItems = () => {
			return filteredItems;
		};

		let { searchable = true } = $$props;
		let { inputStyles = '' } = $$props;
		let { clearable = true } = $$props;
		let { loading = false } = $$props;
		let { listOpen = false } = $$props;
		let timeout;

		let { debounce = (fn, wait = 1) => {
			clearTimeout(timeout);
			timeout = setTimeout(fn, wait);
		} } = $$props;

		let { debounceWait = 300 } = $$props;
		let { hideEmptyState = false } = $$props;
		let { inputAttributes = {} } = $$props;
		let { listAutoWidth = true } = $$props;
		let { showChevron = false } = $$props;
		let { listOffset = 5 } = $$props;
		let { hoverItemIndex = 0 } = $$props;
		let { floatingConfig = {} } = $$props;
		let { class: containerClasses = '' } = $$props;
		let activeValue;
		let prev_value;
		let prev_filterText;
		let prev_multiple;

		function setValue() {
			if (typeof value === 'string') {
				let item = (items || []).find(item => item[itemId] === value);
				$$invalidate(3, value = item || { [itemId]: value, label: value });
			} else if (multiple && Array.isArray(value) && value.length > 0) {
				$$invalidate(3, value = value.map(item => typeof item === 'string'
				? { value: item, label: item }
				: item));
			}
		}

		let _inputAttributes;

		function assignInputAttributes() {
			$$invalidate(27, _inputAttributes = Object.assign(
				{
					autocapitalize: 'none',
					autocomplete: 'off',
					autocorrect: 'off',
					spellcheck: false,
					tabindex: 0,
					type: 'text',
					'aria-autocomplete': 'list'
				},
				inputAttributes
			));

			if (id) {
				$$invalidate(27, _inputAttributes['id'] = id, _inputAttributes);
			}

			if (!searchable) {
				$$invalidate(27, _inputAttributes['readonly'] = true, _inputAttributes);
			}
		}

		function filterGroupedItems(_items) {
			const groupValues = [];
			const groups = {};

			_items.forEach(item => {
				const groupValue = groupBy(item);

				if (!groupValues.includes(groupValue)) {
					groupValues.push(groupValue);
					groups[groupValue] = [];

					if (groupValue) {
						groups[groupValue].push(Object.assign(createGroupHeaderItem(groupValue, item), {
							id: groupValue,
							groupHeader: true,
							selectable: groupHeaderSelectable
						}));
					}
				}

				groups[groupValue].push(Object.assign({ groupItem: !!groupValue }, item));
			});

			const sortedGroupedItems = [];

			groupFilter(groupValues).forEach(groupValue => {
				if (groups[groupValue]) sortedGroupedItems.push(...groups[groupValue]);
			});

			return sortedGroupedItems;
		}

		function dispatchSelectedItem() {
			if (multiple) {
				if (JSON.stringify(value) !== JSON.stringify(prev_value)) {
					if (checkValueForDuplicates()) {
						dispatch('input', value);
					}
				}

				return;
			}

			if (!prev_value || JSON.stringify(value[itemId]) !== JSON.stringify(prev_value[itemId])) {
				dispatch('input', value);
			}
		}

		function setupMulti() {
			if (value) {
				if (Array.isArray(value)) {
					$$invalidate(3, value = [...value]);
				} else {
					$$invalidate(3, value = [value]);
				}
			}
		}

		function setupSingle() {
			if (value) $$invalidate(3, value = null);
		}

		function setValueIndexAsHoverIndex() {
			const valueIndex = filteredItems.findIndex(i => {
				return i[itemId] === value[itemId];
			});

			checkHoverSelectable(valueIndex, true);
		}

		function dispatchHover(i) {
			dispatch('hoverItem', i);
		}

		function checkHoverSelectable(startingIndex = 0, ignoreGroup) {
			$$invalidate(7, hoverItemIndex = startingIndex < 0 ? 0 : startingIndex);

			if (!ignoreGroup && groupBy && filteredItems[hoverItemIndex] && !filteredItems[hoverItemIndex].selectable) {
				setHoverIndex(1);
			}
		}

		function setupFilterText() {
			if (!loadOptions && filterText.length === 0) return;

			if (loadOptions) {
				debounce(
					async function () {
						$$invalidate(5, loading = true);

						let res = await getItems$1({
							dispatch,
							loadOptions,
							convertStringItemsToObjects,
							filterText
						});

						if (res) {
							$$invalidate(5, loading = res.loading);

							$$invalidate(6, listOpen = listOpen
							? res.listOpen
							: filterText.length > 0 ? true : false);

							$$invalidate(2, focused = listOpen && res.focused);

							$$invalidate(51, items = groupBy
							? filterGroupedItems(res.filteredItems)
							: res.filteredItems);
						} else {
							$$invalidate(5, loading = false);
							$$invalidate(2, focused = true);
							$$invalidate(6, listOpen = true);
						}
					},
					debounceWait
				);
			} else {
				$$invalidate(6, listOpen = true);

				if (multiple) {
					$$invalidate(26, activeValue = undefined);
				}
			}
		}

		function handleFilterEvent(items) {
			if (listOpen) dispatch('filter', items);
		}

		beforeUpdate(async () => {
			$$invalidate(78, prev_value = value);
			$$invalidate(79, prev_filterText = filterText);
			$$invalidate(80, prev_multiple = multiple);
		});

		function computeJustValue() {
			if (multiple) return value ? value.map(item => item[itemId]) : null;
			return value ? value[itemId] : value;
		}

		function checkValueForDuplicates() {
			let noDuplicates = true;

			if (value) {
				const ids = [];
				const uniqueValues = [];

				value.forEach(val => {
					if (!ids.includes(val[itemId])) {
						ids.push(val[itemId]);
						uniqueValues.push(val);
					} else {
						noDuplicates = false;
					}
				});

				if (!noDuplicates) $$invalidate(3, value = uniqueValues);
			}

			return noDuplicates;
		}

		function findItem(selection) {
			let matchTo = selection ? selection[itemId] : value[itemId];
			return items.find(item => item[itemId] === matchTo);
		}

		function updateValueDisplay(items) {
			if (!items || items.length === 0 || items.some(item => typeof item !== 'object')) return;

			if (!value || (multiple
			? value.some(selection => !selection || !selection[itemId])
			: !value[itemId])) return;

			if (Array.isArray(value)) {
				$$invalidate(3, value = value.map(selection => findItem(selection) || selection));
			} else {
				$$invalidate(3, value = findItem() || value);
			}
		}

		async function handleMultiItemClear(i) {
			const itemToRemove = value[i];

			if (value.length === 1) {
				$$invalidate(3, value = undefined);
			} else {
				$$invalidate(3, value = value.filter(item => {
					return item !== itemToRemove;
				}));
			}

			dispatch('clear', itemToRemove);
		}

		function handleKeyDown(e) {
			if (!focused) return;
			e.stopPropagation();

			switch (e.key) {
				case 'Escape':
					e.preventDefault();
					closeList();
					break;
				case 'Enter':
					e.preventDefault();
					if (listOpen) {
						if (filteredItems.length === 0) break;
						const hoverItem = filteredItems[hoverItemIndex];

						if (value && !multiple && value[itemId] === hoverItem[itemId]) {
							closeList();
							break;
						} else {
							handleSelect(filteredItems[hoverItemIndex]);
						}
					}
					break;
				case 'ArrowDown':
					e.preventDefault();
					if (listOpen) {
						setHoverIndex(1);
					} else {
						$$invalidate(6, listOpen = true);
						$$invalidate(26, activeValue = undefined);
					}
					break;
				case 'ArrowUp':
					e.preventDefault();
					if (listOpen) {
						setHoverIndex(-1);
					} else {
						$$invalidate(6, listOpen = true);
						$$invalidate(26, activeValue = undefined);
					}
					break;
				case 'Tab':
					if (listOpen && focused) {
						if (filteredItems.length === 0 || value && value[itemId] === filteredItems[hoverItemIndex][itemId]) return closeList();
						e.preventDefault();
						handleSelect(filteredItems[hoverItemIndex]);
						closeList();
					}
					break;
				case 'Backspace':
					if (!multiple || filterText.length > 0) return;
					if (multiple && value && value.length > 0) {
						handleMultiItemClear(activeValue !== undefined
						? activeValue
						: value.length - 1);

						if (activeValue === 0 || activeValue === undefined) break;
						$$invalidate(26, activeValue = value.length > activeValue ? activeValue - 1 : undefined);
					}
					break;
				case 'ArrowLeft':
					if (!value || !multiple || filterText.length > 0) return;
					if (activeValue === undefined) {
						$$invalidate(26, activeValue = value.length - 1);
					} else if (value.length > activeValue && activeValue !== 0) {
						$$invalidate(26, activeValue -= 1);
					}
					break;
				case 'ArrowRight':
					if (!value || !multiple || filterText.length > 0 || activeValue === undefined) return;
					if (activeValue === value.length - 1) {
						$$invalidate(26, activeValue = undefined);
					} else if (activeValue < value.length - 1) {
						$$invalidate(26, activeValue += 1);
					}
					break;
			}
		}

		function handleFocus(e) {
			if (focused && input === document?.activeElement) return;
			if (e) dispatch('focus', e);
			input?.focus();
			$$invalidate(2, focused = true);
		}

		async function handleBlur(e) {
			if (isScrolling) return;

			if (listOpen || focused) {
				dispatch('blur', e);
				closeList();
				$$invalidate(2, focused = false);
				$$invalidate(26, activeValue = undefined);
				input?.blur();
			}
		}

		function handleClick() {
			if (disabled) return;
			if (filterText.length > 0) return $$invalidate(6, listOpen = true);
			$$invalidate(6, listOpen = !listOpen);
		}

		function handleClear() {
			dispatch('clear', value);
			$$invalidate(3, value = undefined);
			closeList();
			handleFocus();
		}

		onMount(() => {
			if (listOpen) $$invalidate(2, focused = true);
			if (focused && input) input.focus();
		});

		function itemSelected(selection) {
			if (selection) {
				$$invalidate(4, filterText = '');
				const item = Object.assign({}, selection);
				if (item.groupHeader && !item.selectable) return;

				$$invalidate(3, value = multiple
				? value ? value.concat([item]) : [item]
				: $$invalidate(3, value = item));

				setTimeout(() => {
					if (closeListOnChange) closeList();
					$$invalidate(26, activeValue = undefined);
					dispatch('change', value);
					dispatch('select', selection);
				});
			}
		}

		function closeList() {
			if (clearFilterTextOnBlur) {
				$$invalidate(4, filterText = '');
			}

			$$invalidate(6, listOpen = false);
		}

		let { ariaValues = values => {
			return `Option ${values}, selected.`;
		} } = $$props;

		let { ariaListOpen = (label, count) => {
			return `You are currently focused on option ${label}. There are ${count} results available.`;
		} } = $$props;

		let { ariaFocused = () => {
			return `Select is focused, type to refine list, press down to open the menu.`;
		} } = $$props;

		function handleAriaSelection(_multiple) {
			let selected = undefined;

			if (_multiple && value.length > 0) {
				selected = value.map(v => v[label]).join(', ');
			} else {
				selected = value[label];
			}

			return ariaValues(selected);
		}

		function handleAriaContent() {
			if (!filteredItems || filteredItems.length === 0) return '';
			let _item = filteredItems[hoverItemIndex];

			if (listOpen && _item) {
				let count = filteredItems ? filteredItems.length : 0;
				return ariaListOpen(_item[label], count);
			} else {
				return ariaFocused();
			}
		}

		let list = null;
		let isScrollingTimer;

		function handleListScroll() {
			clearTimeout(isScrollingTimer);

			isScrollingTimer = setTimeout(
				() => {
					isScrolling = false;
				},
				100
			);
		}

		function handleClickOutside(event) {
			if (!listOpen && !focused && container && !container.contains(event.target) && !list?.contains(event.target)) {
				handleBlur();
			}
		}

		onDestroy(() => {
			list?.remove();
		});

		let isScrolling = false;

		function handleSelect(item) {
			if (!item || item.selectable === false) return;
			itemSelected(item);
		}

		function handleHover(i) {
			if (isScrolling) return;
			$$invalidate(7, hoverItemIndex = i);
		}

		function handleItemClick(args) {
			const { item, i } = args;
			if (item?.selectable === false) return;
			if (value && !multiple && value[itemId] === item[itemId]) return closeList();

			if (isItemSelectable(item)) {
				$$invalidate(7, hoverItemIndex = i);
				handleSelect(item);
			}
		}

		function setHoverIndex(increment) {
			let selectableFilteredItems = filteredItems.filter(item => !Object.hasOwn(item, 'selectable') || item.selectable === true);

			if (selectableFilteredItems.length === 0) {
				return $$invalidate(7, hoverItemIndex = 0);
			}

			if (increment > 0 && hoverItemIndex === filteredItems.length - 1) {
				$$invalidate(7, hoverItemIndex = 0);
			} else if (increment < 0 && hoverItemIndex === 0) {
				$$invalidate(7, hoverItemIndex = filteredItems.length - 1);
			} else {
				$$invalidate(7, hoverItemIndex = hoverItemIndex + increment);
			}

			const hover = filteredItems[hoverItemIndex];

			if (hover && hover.selectable === false) {
				if (increment === 1 || increment === -1) setHoverIndex(increment);
				return;
			}
		}

		function isItemActive(item, value, itemId) {
			if (multiple) return;
			return value && value[itemId] === item[itemId];
		}

		const activeScroll = scrollAction;
		const hoverScroll = scrollAction;

		function scrollAction(node) {
			return {
				update(args) {
					if (args.scroll) {
						handleListScroll();
						node.scrollIntoView({ behavior: 'auto', block: 'nearest' });
					}
				}
			};
		}

		function setListWidth() {
			const { width } = container.getBoundingClientRect();
			$$invalidate(23, list.style.width = listAutoWidth ? width + 'px' : 'auto', list);
		}

		let _floatingConfig = {
			strategy: 'absolute',
			placement: 'bottom-start',
			middleware: [offset(listOffset), flip(), shift()],
			autoUpdate: false
		};

		const [floatingRef, floatingContent, floatingUpdate] = createFloatingActions(_floatingConfig);
		let prefloat = true;

		function listMounted(list, listOpen) {
			if (!list || !listOpen) return $$invalidate(28, prefloat = true);

			setTimeout(
				() => {
					$$invalidate(28, prefloat = false);
				},
				0
			);
		}

		const writable_props = [
			'justValue',
			'filter',
			'getItems',
			'id',
			'name',
			'container',
			'input',
			'multiple',
			'multiFullItemClearable',
			'disabled',
			'focused',
			'value',
			'filterText',
			'placeholder',
			'placeholderAlwaysShow',
			'items',
			'label',
			'itemFilter',
			'groupBy',
			'groupFilter',
			'groupHeaderSelectable',
			'itemId',
			'loadOptions',
			'containerStyles',
			'hasError',
			'filterSelectedItems',
			'required',
			'closeListOnChange',
			'clearFilterTextOnBlur',
			'createGroupHeaderItem',
			'searchable',
			'inputStyles',
			'clearable',
			'loading',
			'listOpen',
			'debounce',
			'debounceWait',
			'hideEmptyState',
			'inputAttributes',
			'listAutoWidth',
			'showChevron',
			'listOffset',
			'hoverItemIndex',
			'floatingConfig',
			'class',
			'ariaValues',
			'ariaListOpen',
			'ariaFocused'
		];

		Object_1.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Select> was created with unknown prop '${key}'`);
		});

		function keydown_handler_1(event) {
			bubble.call(this, $$self, event);
		}

		function pointerup_handler(event) {
			bubble.call(this, $$self, event);
		}

		function mousedown_handler(event) {
			bubble.call(this, $$self, event);
		}

		function keydown_handler(event) {
			bubble.call(this, $$self, event);
		}

		const mouseover_handler = i => handleHover(i);
		const focus_handler = i => handleHover(i);
		const click_handler = (item, i) => handleItemClick({ item, i });

		function div_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				list = $$value;
				$$invalidate(23, list);
			});
		}

		const pointerup_handler_1 = i => handleMultiItemClear(i);
		const click_handler_1 = i => multiFullItemClearable ? handleMultiItemClear(i) : {};

		function input_1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				input = $$value;
				$$invalidate(1, input);
			});
		}

		function input_1_input_handler() {
			filterText = this.value;
			$$invalidate(4, filterText);
		}

		function div3_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				container = $$value;
				$$invalidate(0, container);
			});
		}

		$$self.$$set = $$props => {
			if ('justValue' in $$props) $$invalidate(52, justValue = $$props.justValue);
			if ('filter' in $$props) $$invalidate(53, filter$1 = $$props.filter);
			if ('getItems' in $$props) $$invalidate(54, getItems$1 = $$props.getItems);
			if ('id' in $$props) $$invalidate(55, id = $$props.id);
			if ('name' in $$props) $$invalidate(8, name = $$props.name);
			if ('container' in $$props) $$invalidate(0, container = $$props.container);
			if ('input' in $$props) $$invalidate(1, input = $$props.input);
			if ('multiple' in $$props) $$invalidate(9, multiple = $$props.multiple);
			if ('multiFullItemClearable' in $$props) $$invalidate(10, multiFullItemClearable = $$props.multiFullItemClearable);
			if ('disabled' in $$props) $$invalidate(11, disabled = $$props.disabled);
			if ('focused' in $$props) $$invalidate(2, focused = $$props.focused);
			if ('value' in $$props) $$invalidate(3, value = $$props.value);
			if ('filterText' in $$props) $$invalidate(4, filterText = $$props.filterText);
			if ('placeholder' in $$props) $$invalidate(56, placeholder = $$props.placeholder);
			if ('placeholderAlwaysShow' in $$props) $$invalidate(57, placeholderAlwaysShow = $$props.placeholderAlwaysShow);
			if ('items' in $$props) $$invalidate(51, items = $$props.items);
			if ('label' in $$props) $$invalidate(12, label = $$props.label);
			if ('itemFilter' in $$props) $$invalidate(58, itemFilter = $$props.itemFilter);
			if ('groupBy' in $$props) $$invalidate(59, groupBy = $$props.groupBy);
			if ('groupFilter' in $$props) $$invalidate(60, groupFilter = $$props.groupFilter);
			if ('groupHeaderSelectable' in $$props) $$invalidate(61, groupHeaderSelectable = $$props.groupHeaderSelectable);
			if ('itemId' in $$props) $$invalidate(13, itemId = $$props.itemId);
			if ('loadOptions' in $$props) $$invalidate(62, loadOptions = $$props.loadOptions);
			if ('containerStyles' in $$props) $$invalidate(14, containerStyles = $$props.containerStyles);
			if ('hasError' in $$props) $$invalidate(15, hasError = $$props.hasError);
			if ('filterSelectedItems' in $$props) $$invalidate(63, filterSelectedItems = $$props.filterSelectedItems);
			if ('required' in $$props) $$invalidate(16, required = $$props.required);
			if ('closeListOnChange' in $$props) $$invalidate(64, closeListOnChange = $$props.closeListOnChange);
			if ('clearFilterTextOnBlur' in $$props) $$invalidate(65, clearFilterTextOnBlur = $$props.clearFilterTextOnBlur);
			if ('createGroupHeaderItem' in $$props) $$invalidate(66, createGroupHeaderItem = $$props.createGroupHeaderItem);
			if ('searchable' in $$props) $$invalidate(17, searchable = $$props.searchable);
			if ('inputStyles' in $$props) $$invalidate(18, inputStyles = $$props.inputStyles);
			if ('clearable' in $$props) $$invalidate(68, clearable = $$props.clearable);
			if ('loading' in $$props) $$invalidate(5, loading = $$props.loading);
			if ('listOpen' in $$props) $$invalidate(6, listOpen = $$props.listOpen);
			if ('debounce' in $$props) $$invalidate(69, debounce = $$props.debounce);
			if ('debounceWait' in $$props) $$invalidate(70, debounceWait = $$props.debounceWait);
			if ('hideEmptyState' in $$props) $$invalidate(19, hideEmptyState = $$props.hideEmptyState);
			if ('inputAttributes' in $$props) $$invalidate(71, inputAttributes = $$props.inputAttributes);
			if ('listAutoWidth' in $$props) $$invalidate(72, listAutoWidth = $$props.listAutoWidth);
			if ('showChevron' in $$props) $$invalidate(20, showChevron = $$props.showChevron);
			if ('listOffset' in $$props) $$invalidate(73, listOffset = $$props.listOffset);
			if ('hoverItemIndex' in $$props) $$invalidate(7, hoverItemIndex = $$props.hoverItemIndex);
			if ('floatingConfig' in $$props) $$invalidate(74, floatingConfig = $$props.floatingConfig);
			if ('class' in $$props) $$invalidate(21, containerClasses = $$props.class);
			if ('ariaValues' in $$props) $$invalidate(75, ariaValues = $$props.ariaValues);
			if ('ariaListOpen' in $$props) $$invalidate(76, ariaListOpen = $$props.ariaListOpen);
			if ('ariaFocused' in $$props) $$invalidate(77, ariaFocused = $$props.ariaFocused);
			if ('$$scope' in $$props) $$invalidate(82, $$scope = $$props.$$scope);
		};

		$$self.$capture_state = () => ({
			beforeUpdate,
			createEventDispatcher,
			onDestroy,
			onMount,
			offset,
			flip,
			shift,
			createFloatingActions,
			dispatch,
			_filter: filter,
			_getItems: getItems,
			ChevronIcon,
			ClearIcon,
			LoadingIcon,
			justValue,
			filter: filter$1,
			getItems: getItems$1,
			id,
			name,
			container,
			input,
			multiple,
			multiFullItemClearable,
			disabled,
			focused,
			value,
			filterText,
			placeholder,
			placeholderAlwaysShow,
			items,
			label,
			itemFilter,
			groupBy,
			groupFilter,
			groupHeaderSelectable,
			itemId,
			loadOptions,
			containerStyles,
			hasError,
			filterSelectedItems,
			required,
			closeListOnChange,
			clearFilterTextOnBlur,
			createGroupHeaderItem,
			getFilteredItems,
			searchable,
			inputStyles,
			clearable,
			loading,
			listOpen,
			timeout,
			debounce,
			debounceWait,
			hideEmptyState,
			inputAttributes,
			listAutoWidth,
			showChevron,
			listOffset,
			hoverItemIndex,
			floatingConfig,
			containerClasses,
			activeValue,
			prev_value,
			prev_filterText,
			prev_multiple,
			setValue,
			_inputAttributes,
			assignInputAttributes,
			convertStringItemsToObjects,
			filterGroupedItems,
			dispatchSelectedItem,
			setupMulti,
			setupSingle,
			setValueIndexAsHoverIndex,
			dispatchHover,
			checkHoverSelectable,
			setupFilterText,
			handleFilterEvent,
			computeJustValue,
			checkValueForDuplicates,
			findItem,
			updateValueDisplay,
			handleMultiItemClear,
			handleKeyDown,
			handleFocus,
			handleBlur,
			handleClick,
			handleClear,
			itemSelected,
			closeList,
			ariaValues,
			ariaListOpen,
			ariaFocused,
			handleAriaSelection,
			handleAriaContent,
			list,
			isScrollingTimer,
			handleListScroll,
			handleClickOutside,
			isScrolling,
			handleSelect,
			handleHover,
			handleItemClick,
			setHoverIndex,
			isItemActive,
			isItemFirst,
			isItemSelectable,
			activeScroll,
			hoverScroll,
			scrollAction,
			setListWidth,
			_floatingConfig,
			floatingRef,
			floatingContent,
			floatingUpdate,
			prefloat,
			listMounted,
			filteredItems,
			scrollToHoverItem,
			listDom,
			ariaContext,
			ariaSelection,
			placeholderText,
			hasValue,
			showClear,
			hideSelectedItem
		});

		$$self.$inject_state = $$props => {
			if ('justValue' in $$props) $$invalidate(52, justValue = $$props.justValue);
			if ('filter' in $$props) $$invalidate(53, filter$1 = $$props.filter);
			if ('getItems' in $$props) $$invalidate(54, getItems$1 = $$props.getItems);
			if ('id' in $$props) $$invalidate(55, id = $$props.id);
			if ('name' in $$props) $$invalidate(8, name = $$props.name);
			if ('container' in $$props) $$invalidate(0, container = $$props.container);
			if ('input' in $$props) $$invalidate(1, input = $$props.input);
			if ('multiple' in $$props) $$invalidate(9, multiple = $$props.multiple);
			if ('multiFullItemClearable' in $$props) $$invalidate(10, multiFullItemClearable = $$props.multiFullItemClearable);
			if ('disabled' in $$props) $$invalidate(11, disabled = $$props.disabled);
			if ('focused' in $$props) $$invalidate(2, focused = $$props.focused);
			if ('value' in $$props) $$invalidate(3, value = $$props.value);
			if ('filterText' in $$props) $$invalidate(4, filterText = $$props.filterText);
			if ('placeholder' in $$props) $$invalidate(56, placeholder = $$props.placeholder);
			if ('placeholderAlwaysShow' in $$props) $$invalidate(57, placeholderAlwaysShow = $$props.placeholderAlwaysShow);
			if ('items' in $$props) $$invalidate(51, items = $$props.items);
			if ('label' in $$props) $$invalidate(12, label = $$props.label);
			if ('itemFilter' in $$props) $$invalidate(58, itemFilter = $$props.itemFilter);
			if ('groupBy' in $$props) $$invalidate(59, groupBy = $$props.groupBy);
			if ('groupFilter' in $$props) $$invalidate(60, groupFilter = $$props.groupFilter);
			if ('groupHeaderSelectable' in $$props) $$invalidate(61, groupHeaderSelectable = $$props.groupHeaderSelectable);
			if ('itemId' in $$props) $$invalidate(13, itemId = $$props.itemId);
			if ('loadOptions' in $$props) $$invalidate(62, loadOptions = $$props.loadOptions);
			if ('containerStyles' in $$props) $$invalidate(14, containerStyles = $$props.containerStyles);
			if ('hasError' in $$props) $$invalidate(15, hasError = $$props.hasError);
			if ('filterSelectedItems' in $$props) $$invalidate(63, filterSelectedItems = $$props.filterSelectedItems);
			if ('required' in $$props) $$invalidate(16, required = $$props.required);
			if ('closeListOnChange' in $$props) $$invalidate(64, closeListOnChange = $$props.closeListOnChange);
			if ('clearFilterTextOnBlur' in $$props) $$invalidate(65, clearFilterTextOnBlur = $$props.clearFilterTextOnBlur);
			if ('createGroupHeaderItem' in $$props) $$invalidate(66, createGroupHeaderItem = $$props.createGroupHeaderItem);
			if ('searchable' in $$props) $$invalidate(17, searchable = $$props.searchable);
			if ('inputStyles' in $$props) $$invalidate(18, inputStyles = $$props.inputStyles);
			if ('clearable' in $$props) $$invalidate(68, clearable = $$props.clearable);
			if ('loading' in $$props) $$invalidate(5, loading = $$props.loading);
			if ('listOpen' in $$props) $$invalidate(6, listOpen = $$props.listOpen);
			if ('timeout' in $$props) timeout = $$props.timeout;
			if ('debounce' in $$props) $$invalidate(69, debounce = $$props.debounce);
			if ('debounceWait' in $$props) $$invalidate(70, debounceWait = $$props.debounceWait);
			if ('hideEmptyState' in $$props) $$invalidate(19, hideEmptyState = $$props.hideEmptyState);
			if ('inputAttributes' in $$props) $$invalidate(71, inputAttributes = $$props.inputAttributes);
			if ('listAutoWidth' in $$props) $$invalidate(72, listAutoWidth = $$props.listAutoWidth);
			if ('showChevron' in $$props) $$invalidate(20, showChevron = $$props.showChevron);
			if ('listOffset' in $$props) $$invalidate(73, listOffset = $$props.listOffset);
			if ('hoverItemIndex' in $$props) $$invalidate(7, hoverItemIndex = $$props.hoverItemIndex);
			if ('floatingConfig' in $$props) $$invalidate(74, floatingConfig = $$props.floatingConfig);
			if ('containerClasses' in $$props) $$invalidate(21, containerClasses = $$props.containerClasses);
			if ('activeValue' in $$props) $$invalidate(26, activeValue = $$props.activeValue);
			if ('prev_value' in $$props) $$invalidate(78, prev_value = $$props.prev_value);
			if ('prev_filterText' in $$props) $$invalidate(79, prev_filterText = $$props.prev_filterText);
			if ('prev_multiple' in $$props) $$invalidate(80, prev_multiple = $$props.prev_multiple);
			if ('_inputAttributes' in $$props) $$invalidate(27, _inputAttributes = $$props._inputAttributes);
			if ('ariaValues' in $$props) $$invalidate(75, ariaValues = $$props.ariaValues);
			if ('ariaListOpen' in $$props) $$invalidate(76, ariaListOpen = $$props.ariaListOpen);
			if ('ariaFocused' in $$props) $$invalidate(77, ariaFocused = $$props.ariaFocused);
			if ('list' in $$props) $$invalidate(23, list = $$props.list);
			if ('isScrollingTimer' in $$props) isScrollingTimer = $$props.isScrollingTimer;
			if ('isScrolling' in $$props) isScrolling = $$props.isScrolling;
			if ('_floatingConfig' in $$props) $$invalidate(81, _floatingConfig = $$props._floatingConfig);
			if ('prefloat' in $$props) $$invalidate(28, prefloat = $$props.prefloat);
			if ('filteredItems' in $$props) $$invalidate(24, filteredItems = $$props.filteredItems);
			if ('scrollToHoverItem' in $$props) $$invalidate(29, scrollToHoverItem = $$props.scrollToHoverItem);
			if ('listDom' in $$props) $$invalidate(30, listDom = $$props.listDom);
			if ('ariaContext' in $$props) $$invalidate(31, ariaContext = $$props.ariaContext);
			if ('ariaSelection' in $$props) $$invalidate(32, ariaSelection = $$props.ariaSelection);
			if ('placeholderText' in $$props) $$invalidate(33, placeholderText = $$props.placeholderText);
			if ('hasValue' in $$props) $$invalidate(25, hasValue = $$props.hasValue);
			if ('showClear' in $$props) $$invalidate(34, showClear = $$props.showClear);
			if ('hideSelectedItem' in $$props) $$invalidate(35, hideSelectedItem = $$props.hideSelectedItem);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*value*/ 8 | $$self.$$.dirty[1] & /*items*/ 1048576) {
				if ((value)) setValue();
			}

			if ($$self.$$.dirty[0] & /*searchable*/ 131072 | $$self.$$.dirty[2] & /*inputAttributes*/ 512) {
				if (inputAttributes || !searchable) assignInputAttributes();
			}

			if ($$self.$$.dirty[0] & /*multiple*/ 512) {
				if (multiple) setupMulti();
			}

			if ($$self.$$.dirty[0] & /*multiple*/ 512 | $$self.$$.dirty[2] & /*prev_multiple*/ 262144) {
				if (prev_multiple && !multiple) setupSingle();
			}

			if ($$self.$$.dirty[0] & /*multiple, value*/ 520) {
				if (multiple && value && value.length > 1) checkValueForDuplicates();
			}

			if ($$self.$$.dirty[0] & /*value*/ 8) {
				if (value) dispatchSelectedItem();
			}

			if ($$self.$$.dirty[0] & /*value, multiple*/ 520 | $$self.$$.dirty[2] & /*prev_value*/ 65536) {
				if (!value && multiple && prev_value) dispatch('input', value);
			}

			if ($$self.$$.dirty[0] & /*focused, input*/ 6) {
				if (!focused && input) closeList();
			}

			if ($$self.$$.dirty[0] & /*filterText*/ 16 | $$self.$$.dirty[2] & /*prev_filterText*/ 131072) {
				if (filterText !== prev_filterText) setupFilterText();
			}

			if ($$self.$$.dirty[0] & /*filterText, multiple, value, itemId, label*/ 12824 | $$self.$$.dirty[1] & /*filter, items, groupBy, itemFilter*/ 407896064 | $$self.$$.dirty[2] & /*loadOptions, filterSelectedItems*/ 3) {
				$$invalidate(24, filteredItems = filter$1({
					loadOptions,
					filterText,
					items,
					multiple,
					value,
					itemId,
					groupBy,
					label,
					filterSelectedItems,
					itemFilter,
					convertStringItemsToObjects,
					filterGroupedItems
				}));
			}

			if ($$self.$$.dirty[0] & /*multiple, listOpen, value, filteredItems*/ 16777800) {
				if (!multiple && listOpen && value && filteredItems) setValueIndexAsHoverIndex();
			}

			if ($$self.$$.dirty[0] & /*listOpen, multiple*/ 576) {
				if (listOpen && multiple) $$invalidate(7, hoverItemIndex = 0);
			}

			if ($$self.$$.dirty[0] & /*filterText*/ 16) {
				if (filterText) $$invalidate(7, hoverItemIndex = 0);
			}

			if ($$self.$$.dirty[0] & /*hoverItemIndex*/ 128) {
				dispatchHover(hoverItemIndex);
			}

			if ($$self.$$.dirty[0] & /*multiple, value*/ 520) {
				$$invalidate(25, hasValue = multiple ? value && value.length > 0 : value);
			}

			if ($$self.$$.dirty[0] & /*hasValue, filterText*/ 33554448) {
				$$invalidate(35, hideSelectedItem = hasValue && filterText.length > 0);
			}

			if ($$self.$$.dirty[0] & /*hasValue, disabled, loading*/ 33556512 | $$self.$$.dirty[2] & /*clearable*/ 64) {
				$$invalidate(34, showClear = hasValue && clearable && !disabled && !loading);
			}

			if ($$self.$$.dirty[0] & /*multiple, value*/ 520 | $$self.$$.dirty[1] & /*placeholderAlwaysShow, placeholder*/ 100663296) {
				$$invalidate(33, placeholderText = placeholderAlwaysShow && multiple
				? placeholder
				: multiple && value?.length === 0
					? placeholder
					: value ? '' : placeholder);
			}

			if ($$self.$$.dirty[0] & /*value, multiple*/ 520) {
				$$invalidate(32, ariaSelection = value ? handleAriaSelection(multiple) : '');
			}

			if ($$self.$$.dirty[0] & /*filteredItems, hoverItemIndex, focused, listOpen*/ 16777412) {
				$$invalidate(31, ariaContext = handleAriaContent());
			}

			if ($$self.$$.dirty[1] & /*items*/ 1048576) {
				updateValueDisplay(items);
			}

			if ($$self.$$.dirty[0] & /*multiple, value, itemId*/ 8712) {
				$$invalidate(52, justValue = computeJustValue());
			}

			if ($$self.$$.dirty[0] & /*multiple, value*/ 520 | $$self.$$.dirty[2] & /*prev_value*/ 65536) {
				if (!multiple && prev_value && !value) dispatch('input', value);
			}

			if ($$self.$$.dirty[0] & /*listOpen, filteredItems, multiple, value*/ 16777800) {
				if (listOpen && filteredItems && !multiple && !value) checkHoverSelectable();
			}

			if ($$self.$$.dirty[0] & /*filteredItems*/ 16777216) {
				handleFilterEvent(filteredItems);
			}

			if ($$self.$$.dirty[0] & /*container*/ 1 | $$self.$$.dirty[2] & /*floatingConfig*/ 4096) {
				if (container && floatingConfig?.autoUpdate === undefined) {
					$$invalidate(81, _floatingConfig.autoUpdate = true, _floatingConfig);
				}
			}

			if ($$self.$$.dirty[0] & /*container*/ 1 | $$self.$$.dirty[2] & /*floatingConfig, _floatingConfig*/ 528384) {
				if (container && floatingConfig) floatingUpdate(Object.assign(_floatingConfig, floatingConfig));
			}

			if ($$self.$$.dirty[0] & /*list*/ 8388608) {
				$$invalidate(30, listDom = !!list);
			}

			if ($$self.$$.dirty[0] & /*list, listOpen*/ 8388672) {
				listMounted(list, listOpen);
			}

			if ($$self.$$.dirty[0] & /*listOpen, container, list*/ 8388673) {
				if (listOpen && container && list) setListWidth();
			}

			if ($$self.$$.dirty[0] & /*hoverItemIndex*/ 128) {
				$$invalidate(29, scrollToHoverItem = hoverItemIndex);
			}

			if ($$self.$$.dirty[0] & /*input, listOpen, focused*/ 70) {
				if (input && listOpen && !focused) handleFocus();
			}
		};

		return [
			container,
			input,
			focused,
			value,
			filterText,
			loading,
			listOpen,
			hoverItemIndex,
			name,
			multiple,
			multiFullItemClearable,
			disabled,
			label,
			itemId,
			containerStyles,
			hasError,
			required,
			searchable,
			inputStyles,
			hideEmptyState,
			showChevron,
			containerClasses,
			handleClear,
			list,
			filteredItems,
			hasValue,
			activeValue,
			_inputAttributes,
			prefloat,
			scrollToHoverItem,
			listDom,
			ariaContext,
			ariaSelection,
			placeholderText,
			showClear,
			hideSelectedItem,
			handleMultiItemClear,
			handleKeyDown,
			handleFocus,
			handleBlur,
			handleClick,
			handleListScroll,
			handleClickOutside,
			handleHover,
			handleItemClick,
			isItemActive,
			activeScroll,
			hoverScroll,
			floatingRef,
			floatingContent,
			$$slots,
			items,
			justValue,
			filter$1,
			getItems$1,
			id,
			placeholder,
			placeholderAlwaysShow,
			itemFilter,
			groupBy,
			groupFilter,
			groupHeaderSelectable,
			loadOptions,
			filterSelectedItems,
			closeListOnChange,
			clearFilterTextOnBlur,
			createGroupHeaderItem,
			getFilteredItems,
			clearable,
			debounce,
			debounceWait,
			inputAttributes,
			listAutoWidth,
			listOffset,
			floatingConfig,
			ariaValues,
			ariaListOpen,
			ariaFocused,
			prev_value,
			prev_filterText,
			prev_multiple,
			_floatingConfig,
			$$scope,
			slots,
			keydown_handler_1,
			pointerup_handler,
			mousedown_handler,
			keydown_handler,
			mouseover_handler,
			focus_handler,
			click_handler,
			div_binding,
			pointerup_handler_1,
			click_handler_1,
			input_1_binding,
			input_1_input_handler,
			div3_binding
		];
	}

	class Select extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(
				this,
				options,
				instance$7,
				create_fragment$7,
				safe_not_equal,
				{
					justValue: 52,
					filter: 53,
					getItems: 54,
					id: 55,
					name: 8,
					container: 0,
					input: 1,
					multiple: 9,
					multiFullItemClearable: 10,
					disabled: 11,
					focused: 2,
					value: 3,
					filterText: 4,
					placeholder: 56,
					placeholderAlwaysShow: 57,
					items: 51,
					label: 12,
					itemFilter: 58,
					groupBy: 59,
					groupFilter: 60,
					groupHeaderSelectable: 61,
					itemId: 13,
					loadOptions: 62,
					containerStyles: 14,
					hasError: 15,
					filterSelectedItems: 63,
					required: 16,
					closeListOnChange: 64,
					clearFilterTextOnBlur: 65,
					createGroupHeaderItem: 66,
					getFilteredItems: 67,
					searchable: 17,
					inputStyles: 18,
					clearable: 68,
					loading: 5,
					listOpen: 6,
					debounce: 69,
					debounceWait: 70,
					hideEmptyState: 19,
					inputAttributes: 71,
					listAutoWidth: 72,
					showChevron: 20,
					listOffset: 73,
					hoverItemIndex: 7,
					floatingConfig: 74,
					class: 21,
					handleClear: 22,
					ariaValues: 75,
					ariaListOpen: 76,
					ariaFocused: 77
				},
				null,
				[-1, -1, -1, -1, -1]
			);

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "Select",
				options,
				id: create_fragment$7.name
			});
		}

		get justValue() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set justValue(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get filter() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set filter(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get getItems() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set getItems(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get id() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set id(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get name() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set name(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get container() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set container(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get input() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set input(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get multiple() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set multiple(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get multiFullItemClearable() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set multiFullItemClearable(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get disabled() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set disabled(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get focused() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set focused(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get value() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set value(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get filterText() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set filterText(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get placeholder() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set placeholder(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get placeholderAlwaysShow() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set placeholderAlwaysShow(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get items() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set items(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get label() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set label(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get itemFilter() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set itemFilter(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get groupBy() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set groupBy(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get groupFilter() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set groupFilter(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get groupHeaderSelectable() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set groupHeaderSelectable(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get itemId() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set itemId(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get loadOptions() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set loadOptions(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get containerStyles() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set containerStyles(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get hasError() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set hasError(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get filterSelectedItems() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set filterSelectedItems(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get required() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set required(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get closeListOnChange() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set closeListOnChange(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get clearFilterTextOnBlur() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set clearFilterTextOnBlur(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get createGroupHeaderItem() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set createGroupHeaderItem(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get getFilteredItems() {
			return this.$$.ctx[67];
		}

		set getFilteredItems(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get searchable() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set searchable(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get inputStyles() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set inputStyles(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get clearable() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set clearable(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get loading() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set loading(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get listOpen() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set listOpen(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get debounce() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set debounce(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get debounceWait() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set debounceWait(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get hideEmptyState() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set hideEmptyState(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get inputAttributes() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set inputAttributes(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get listAutoWidth() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set listAutoWidth(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get showChevron() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set showChevron(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get listOffset() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set listOffset(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get hoverItemIndex() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set hoverItemIndex(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get floatingConfig() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set floatingConfig(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get class() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set class(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get handleClear() {
			return this.$$.ctx[22];
		}

		set handleClear(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get ariaValues() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set ariaValues(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get ariaListOpen() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set ariaListOpen(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get ariaFocused() {
			throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set ariaFocused(value) {
			throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\CustomItem.svelte generated by Svelte v4.2.9 */

	const { console: console_1 } = globals;
	const file$6 = "src\\components\\CustomItem.svelte";

	// (9:2) {#if item.icon}
	function create_if_block$2(ctx) {
		let img;
		let img_src_value;
		let img_alt_value;

		const block = {
			c: function create() {
				img = element("img");
				if (!src_url_equal(img.src, img_src_value = /*item*/ ctx[0].icon)) attr_dev(img, "src", img_src_value);
				attr_dev(img, "alt", img_alt_value = /*item*/ ctx[0].label);
				attr_dev(img, "class", "game-icon svelte-rwn1t");
				add_location(img, file$6, 9, 4, 206);
			},
			m: function mount(target, anchor) {
				insert_dev(target, img, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*item*/ 1 && !src_url_equal(img.src, img_src_value = /*item*/ ctx[0].icon)) {
					attr_dev(img, "src", img_src_value);
				}

				if (dirty & /*item*/ 1 && img_alt_value !== (img_alt_value = /*item*/ ctx[0].label)) {
					attr_dev(img, "alt", img_alt_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(img);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$2.name,
			type: "if",
			source: "(9:2) {#if item.icon}",
			ctx
		});

		return block;
	}

	function create_fragment$6(ctx) {
		let div;
		let t0;
		let span;
		let t1_value = /*item*/ ctx[0].label + "";
		let t1;
		let if_block = /*item*/ ctx[0].icon && create_if_block$2(ctx);

		const block = {
			c: function create() {
				div = element("div");
				if (if_block) if_block.c();
				t0 = space();
				span = element("span");
				t1 = text(t1_value);
				add_location(span, file$6, 11, 2, 277);
				attr_dev(div, "class", "custom-item svelte-rwn1t");
				add_location(div, file$6, 7, 0, 156);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				if (if_block) if_block.m(div, null);
				append_dev(div, t0);
				append_dev(div, span);
				append_dev(span, t1);
			},
			p: function update(ctx, [dirty]) {
				if (/*item*/ ctx[0].icon) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$2(ctx);
						if_block.c();
						if_block.m(div, t0);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}

				if (dirty & /*item*/ 1 && t1_value !== (t1_value = /*item*/ ctx[0].label + "")) set_data_dev(t1, t1_value);
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (if_block) if_block.d();
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$6.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$6($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CustomItem', slots, []);
		let { item } = $$props;

		$$self.$$.on_mount.push(function () {
			if (item === undefined && !('item' in $$props || $$self.$$.bound[$$self.$$.props['item']])) {
				console_1.warn("<CustomItem> was created without expected prop 'item'");
			}
		});

		const writable_props = ['item'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<CustomItem> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('item' in $$props) $$invalidate(0, item = $$props.item);
		};

		$$self.$capture_state = () => ({ item });

		$$self.$inject_state = $$props => {
			if ('item' in $$props) $$invalidate(0, item = $$props.item);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		console.log("hello");
		return [item];
	}

	class CustomItem extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$6, safe_not_equal, { item: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "CustomItem",
				options,
				id: create_fragment$6.name
			});
		}

		get item() {
			throw new Error("<CustomItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set item(value) {
			throw new Error("<CustomItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\FilterBar.svelte generated by Svelte v4.2.9 */
	const file$5 = "src\\components\\FilterBar.svelte";

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[15] = list[i].value;
		child_ctx[16] = list[i].label;
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[15] = list[i].value;
		child_ctx[16] = list[i].label;
		return child_ctx;
	}

	// (92:2) 
	function create_item_slot(ctx) {
		let div;
		let customitem;
		let current;

		customitem = new CustomItem({
				props: { item: /*item*/ ctx[23] },
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				create_component(customitem.$$.fragment);
				attr_dev(div, "class", "game-item");
				attr_dev(div, "slot", "item");
				add_location(div, file$5, 91, 2, 3093);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(customitem, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const customitem_changes = {};
				if (dirty & /*item*/ 8388608) customitem_changes.item = /*item*/ ctx[23];
				customitem.$set(customitem_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(customitem.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(customitem.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(customitem);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_item_slot.name,
			type: "slot",
			source: "(92:2) ",
			ctx
		});

		return block;
	}

	// (96:2) 
	function create_selection_slot(ctx) {
		let div;
		let customitem;
		let current;

		customitem = new CustomItem({
				props: { item: /*selection*/ ctx[21] },
				$$inline: true
			});

		const block = {
			c: function create() {
				div = element("div");
				create_component(customitem.$$.fragment);
				attr_dev(div, "class", "game-item");
				attr_dev(div, "slot", "selection");
				add_location(div, file$5, 95, 2, 3192);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(customitem, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const customitem_changes = {};
				if (dirty & /*selection*/ 2097152) customitem_changes.item = /*selection*/ ctx[21];
				customitem.$set(customitem_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(customitem.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(customitem.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				destroy_component(customitem);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_selection_slot.name,
			type: "slot",
			source: "(96:2) ",
			ctx
		});

		return block;
	}

	// (105:2) {#each filteredVersions as { value, label }}
	function create_each_block_1$1(ctx) {
		let option;
		let t_value = /*label*/ ctx[16] + "";
		let t;
		let option_value_value;

		const block = {
			c: function create() {
				option = element("option");
				t = text(t_value);
				option.__value = option_value_value = /*value*/ ctx[15];
				set_input_value(option, option.__value);
				add_location(option, file$5, 105, 4, 3480);
			},
			m: function mount(target, anchor) {
				insert_dev(target, option, anchor);
				append_dev(option, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*filteredVersions*/ 16 && t_value !== (t_value = /*label*/ ctx[16] + "")) set_data_dev(t, t_value);

				if (dirty & /*filteredVersions*/ 16 && option_value_value !== (option_value_value = /*value*/ ctx[15])) {
					prop_dev(option, "__value", option_value_value);
					set_input_value(option, option.__value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(option);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1$1.name,
			type: "each",
			source: "(105:2) {#each filteredVersions as { value, label }}",
			ctx
		});

		return block;
	}

	// (113:2) {#each filteredCountries as { value, label }}
	function create_each_block$1(ctx) {
		let option;
		let t_value = /*label*/ ctx[16] + "";
		let t;
		let option_value_value;
		let option_title_value;

		const block = {
			c: function create() {
				option = element("option");
				t = text(t_value);
				option.__value = option_value_value = /*value*/ ctx[15];
				set_input_value(option, option.__value);
				attr_dev(option, "title", option_title_value = /*value*/ ctx[15]);
				add_location(option, file$5, 113, 4, 3705);
			},
			m: function mount(target, anchor) {
				insert_dev(target, option, anchor);
				append_dev(option, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*filteredCountries*/ 8 && t_value !== (t_value = /*label*/ ctx[16] + "")) set_data_dev(t, t_value);

				if (dirty & /*filteredCountries*/ 8 && option_value_value !== (option_value_value = /*value*/ ctx[15])) {
					prop_dev(option, "__value", option_value_value);
					set_input_value(option, option.__value);
				}

				if (dirty & /*filteredCountries*/ 8 && option_title_value !== (option_title_value = /*value*/ ctx[15])) {
					attr_dev(option, "title", option_title_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(option);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block$1.name,
			type: "each",
			source: "(113:2) {#each filteredCountries as { value, label }}",
			ctx
		});

		return block;
	}

	function create_fragment$5(ctx) {
		let div1;
		let div0;
		let select0;
		let t0;
		let select1;
		let option0;
		let t2;
		let select2;
		let option1;
		let current;
		let mounted;
		let dispose;

		select0 = new Select({
				props: {
					class: "filter-dropdown",
					items: /*items*/ ctx[5],
					searchable: /*searchable*/ ctx[6],
					value: /*selectedGame*/ ctx[0],
					$$slots: {
						selection: [
							create_selection_slot,
							({ selection }) => ({ 21: selection }),
							({ selection }) => selection ? 2097152 : 0
						],
						item: [
							create_item_slot,
							({ index, item }) => ({ 22: index, 23: item }),
							({ index, item }) => (index ? 4194304 : 0) | (item ? 8388608 : 0)
						]
					},
					$$scope: { ctx }
				},
				$$inline: true
			});

		select0.$on("select", /*handleSelectChange*/ ctx[7]);
		let each_value_1 = ensure_array_like_dev(/*filteredVersions*/ ctx[4]);
		let each_blocks_1 = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
		}

		let each_value = ensure_array_like_dev(/*filteredCountries*/ ctx[3]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				div1 = element("div");
				div0 = element("div");
				create_component(select0.$$.fragment);
				t0 = space();
				select1 = element("select");
				option0 = element("option");
				option0.textContent = "All";

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t2 = space();
				select2 = element("select");
				option1 = element("option");
				option1.textContent = "All";

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div0, "class", "filter-dropdown");
				add_location(div0, file$5, 83, 2, 2916);
				option0.__value = "All";
				set_input_value(option0, option0.__value);
				add_location(option0, file$5, 103, 2, 3394);
				if (/*selectedVersion*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[10].call(select1));
				add_location(select1, file$5, 102, 0, 3353);
				option1.__value = "All";
				set_input_value(option1, option1.__value);
				add_location(option1, file$5, 111, 2, 3618);
				if (/*selectedCountry*/ ctx[2] === void 0) add_render_callback(() => /*select2_change_handler*/ ctx[11].call(select2));
				add_location(select2, file$5, 110, 0, 3577);
				attr_dev(div1, "class", "filter-bar");
				add_location(div1, file$5, 82, 1, 2888);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				mount_component(select0, div0, null);
				append_dev(div1, t0);
				append_dev(div1, select1);
				append_dev(select1, option0);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(select1, null);
					}
				}

				select_option(select1, /*selectedVersion*/ ctx[1], true);
				append_dev(div1, t2);
				append_dev(div1, select2);
				append_dev(select2, option1);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(select2, null);
					}
				}

				select_option(select2, /*selectedCountry*/ ctx[2], true);
				current = true;

				if (!mounted) {
					dispose = [
						listen_dev(select1, "change", /*select1_change_handler*/ ctx[10]),
						listen_dev(select2, "change", /*select2_change_handler*/ ctx[11])
					];

					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				const select0_changes = {};
				if (dirty & /*items*/ 32) select0_changes.items = /*items*/ ctx[5];
				if (dirty & /*selectedGame*/ 1) select0_changes.value = /*selectedGame*/ ctx[0];

				if (dirty & /*$$scope, selection, item*/ 27262976) {
					select0_changes.$$scope = { dirty, ctx };
				}

				select0.$set(select0_changes);

				if (dirty & /*filteredVersions*/ 16) {
					each_value_1 = ensure_array_like_dev(/*filteredVersions*/ ctx[4]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

						if (each_blocks_1[i]) {
							each_blocks_1[i].p(child_ctx, dirty);
						} else {
							each_blocks_1[i] = create_each_block_1$1(child_ctx);
							each_blocks_1[i].c();
							each_blocks_1[i].m(select1, null);
						}
					}

					for (; i < each_blocks_1.length; i += 1) {
						each_blocks_1[i].d(1);
					}

					each_blocks_1.length = each_value_1.length;
				}

				if (dirty & /*selectedVersion, filteredVersions*/ 18) {
					select_option(select1, /*selectedVersion*/ ctx[1]);
				}

				if (dirty & /*filteredCountries*/ 8) {
					each_value = ensure_array_like_dev(/*filteredCountries*/ ctx[3]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(select2, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (dirty & /*selectedCountry, filteredCountries*/ 12) {
					select_option(select2, /*selectedCountry*/ ctx[2]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(select0.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(select0.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div1);
				}

				destroy_component(select0);
				destroy_each(each_blocks_1, detaching);
				destroy_each(each_blocks, detaching);
				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$5.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$5($$self, $$props, $$invalidate) {
		let items;
		let filteredVersions;
		let filteredCountries;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('FilterBar', slots, []);
		let { games } = $$props;
		let { retention } = $$props;
		let { selectedGame } = $$props;
		let { selectedVersion } = $$props;
		let { selectedCountry } = $$props;
		let searchable = true;
		let icons = 'https://upload.wikimedia.org/wikipedia/en/b/bc/Candy_Crush_logo.png';

		function handleSelectChange(event) {
			$$invalidate(0, selectedGame = event.detail.value);
		}

		function calculateDevicesForVersion(version) {
			return retention.filter(item => item.app_ver === version && (selectedGame === 'All' || item.app_id === selectedGame)).reduce((sum, item) => sum + (item.days[0] || 0), 0);
		}

		function calculateDevicesForCountry(country) {
			return retention.filter(item => item.country === country && (selectedGame === 'All' || item.app_id === selectedGame) && (selectedVersion === 'All' || item.app_ver === selectedVersion)).reduce((sum, item) => sum + (item.days[0] || 0), 0);
		}

		$$self.$$.on_mount.push(function () {
			if (games === undefined && !('games' in $$props || $$self.$$.bound[$$self.$$.props['games']])) {
				console.warn("<FilterBar> was created without expected prop 'games'");
			}

			if (retention === undefined && !('retention' in $$props || $$self.$$.bound[$$self.$$.props['retention']])) {
				console.warn("<FilterBar> was created without expected prop 'retention'");
			}

			if (selectedGame === undefined && !('selectedGame' in $$props || $$self.$$.bound[$$self.$$.props['selectedGame']])) {
				console.warn("<FilterBar> was created without expected prop 'selectedGame'");
			}

			if (selectedVersion === undefined && !('selectedVersion' in $$props || $$self.$$.bound[$$self.$$.props['selectedVersion']])) {
				console.warn("<FilterBar> was created without expected prop 'selectedVersion'");
			}

			if (selectedCountry === undefined && !('selectedCountry' in $$props || $$self.$$.bound[$$self.$$.props['selectedCountry']])) {
				console.warn("<FilterBar> was created without expected prop 'selectedCountry'");
			}
		});

		const writable_props = ['games', 'retention', 'selectedGame', 'selectedVersion', 'selectedCountry'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<FilterBar> was created with unknown prop '${key}'`);
		});

		function select1_change_handler() {
			selectedVersion = select_value(this);
			$$invalidate(1, selectedVersion);
			((($$invalidate(4, filteredVersions), $$invalidate(0, selectedGame)), $$invalidate(9, retention)), $$invalidate(1, selectedVersion));
		}

		function select2_change_handler() {
			selectedCountry = select_value(this);
			$$invalidate(2, selectedCountry);
			((($$invalidate(3, filteredCountries), $$invalidate(0, selectedGame)), $$invalidate(1, selectedVersion)), $$invalidate(9, retention));
		}

		$$self.$$set = $$props => {
			if ('games' in $$props) $$invalidate(8, games = $$props.games);
			if ('retention' in $$props) $$invalidate(9, retention = $$props.retention);
			if ('selectedGame' in $$props) $$invalidate(0, selectedGame = $$props.selectedGame);
			if ('selectedVersion' in $$props) $$invalidate(1, selectedVersion = $$props.selectedVersion);
			if ('selectedCountry' in $$props) $$invalidate(2, selectedCountry = $$props.selectedCountry);
		};

		$$self.$capture_state = () => ({
			Select,
			CustomItem,
			games,
			retention,
			selectedGame,
			selectedVersion,
			selectedCountry,
			searchable,
			icons,
			handleSelectChange,
			calculateDevicesForVersion,
			calculateDevicesForCountry,
			filteredCountries,
			filteredVersions,
			items
		});

		$$self.$inject_state = $$props => {
			if ('games' in $$props) $$invalidate(8, games = $$props.games);
			if ('retention' in $$props) $$invalidate(9, retention = $$props.retention);
			if ('selectedGame' in $$props) $$invalidate(0, selectedGame = $$props.selectedGame);
			if ('selectedVersion' in $$props) $$invalidate(1, selectedVersion = $$props.selectedVersion);
			if ('selectedCountry' in $$props) $$invalidate(2, selectedCountry = $$props.selectedCountry);
			if ('searchable' in $$props) $$invalidate(6, searchable = $$props.searchable);
			if ('icons' in $$props) icons = $$props.icons;
			if ('filteredCountries' in $$props) $$invalidate(3, filteredCountries = $$props.filteredCountries);
			if ('filteredVersions' in $$props) $$invalidate(4, filteredVersions = $$props.filteredVersions);
			if ('items' in $$props) $$invalidate(5, items = $$props.items);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*games*/ 256) {
				$$invalidate(5, items = [{ value: 'All', label: 'All', icon: null }].concat(games.map(game => ({
					value: game.app_id,
					label: game.name,
					icon: game.icon
				}))).sort((a, b) => a.label.localeCompare(b.label)));
			}

			if ($$self.$$.dirty & /*selectedGame, retention*/ 513) {
				$$invalidate(4, filteredVersions = (selectedGame === 'All'
				? retention
				: retention.filter(r => r.app_id === selectedGame)).map(r => ({
					version: r.app_ver,
					devices: calculateDevicesForVersion(r.app_ver)
				})).reduce(
					(acc, { version, devices }) => {
						const existing = acc.find(v => v.version === version);

						if (existing) {
							existing.devices += devices;
						} else {
							acc.push({ version, devices });
						}

						return acc;
					},
					[]
				).sort((a, b) => parseFloat(b.version) - parseFloat(a.version)).map(
					({ version, devices }) => ({
						value: version,
						label: `${version} (${devices})`
					})
				));
			}

			if ($$self.$$.dirty & /*selectedGame, selectedVersion, retention*/ 515) {
				$$invalidate(3, filteredCountries = (selectedGame === 'All' && selectedVersion === 'All'
				? retention
				: retention.filter(r => (selectedGame === 'All' || r.app_id === selectedGame) && (selectedVersion === 'All' || r.app_ver === selectedVersion))).map(r => ({
					country: r.country,
					devices: calculateDevicesForCountry(r.country)
				})).reduce(
					(acc, { country, devices }) => {
						const existing = acc.find(c => c.country === country);

						if (existing) {
							existing.devices += devices;
						} else {
							acc.push({ country, devices });
						}

						return acc;
					},
					[]
				).sort((a, b) => b.devices - a.devices).map(
					({ country, devices }) => ({
						value: country,
						label: `${country} (${devices})`
					})
				));
			}
		};

		return [
			selectedGame,
			selectedVersion,
			selectedCountry,
			filteredCountries,
			filteredVersions,
			items,
			searchable,
			handleSelectChange,
			games,
			retention,
			select1_change_handler,
			select2_change_handler
		];
	}

	class FilterBar extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$5, create_fragment$5, safe_not_equal, {
				games: 8,
				retention: 9,
				selectedGame: 0,
				selectedVersion: 1,
				selectedCountry: 2
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "FilterBar",
				options,
				id: create_fragment$5.name
			});
		}

		get games() {
			throw new Error("<FilterBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set games(value) {
			throw new Error("<FilterBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get retention() {
			throw new Error("<FilterBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set retention(value) {
			throw new Error("<FilterBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedGame() {
			throw new Error("<FilterBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedGame(value) {
			throw new Error("<FilterBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedVersion() {
			throw new Error("<FilterBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedVersion(value) {
			throw new Error("<FilterBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedCountry() {
			throw new Error("<FilterBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedCountry(value) {
			throw new Error("<FilterBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\ViewBar.svelte generated by Svelte v4.2.9 */
	const file$4 = "src\\components\\ViewBar.svelte";

	function create_fragment$4(ctx) {
		let div;
		let button0;
		let t1;
		let button1;
		let mounted;
		let dispose;

		const block = {
			c: function create() {
				div = element("div");
				button0 = element("button");
				button0.textContent = "Table View";
				t1 = space();
				button1 = element("button");
				button1.textContent = "Chart View";
				add_location(button0, file$4, 6, 4, 118);
				add_location(button1, file$4, 7, 4, 192);
				attr_dev(div, "class", "view-bar svelte-50qi6");
				add_location(div, file$4, 5, 2, 90);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, button0);
				append_dev(div, t1);
				append_dev(div, button1);

				if (!mounted) {
					dispose = [
						listen_dev(button0, "click", /*click_handler*/ ctx[1], false, false, false, false),
						listen_dev(button1, "click", /*click_handler_1*/ ctx[2], false, false, false, false)
					];

					mounted = true;
				}
			},
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				mounted = false;
				run_all(dispose);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$4.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$4($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ViewBar', slots, []);
		let { setCurrentView } = $$props;

		$$self.$$.on_mount.push(function () {
			if (setCurrentView === undefined && !('setCurrentView' in $$props || $$self.$$.bound[$$self.$$.props['setCurrentView']])) {
				console.warn("<ViewBar> was created without expected prop 'setCurrentView'");
			}
		});

		const writable_props = ['setCurrentView'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ViewBar> was created with unknown prop '${key}'`);
		});

		const click_handler = () => setCurrentView('table');
		const click_handler_1 = () => setCurrentView('chart');

		$$self.$$set = $$props => {
			if ('setCurrentView' in $$props) $$invalidate(0, setCurrentView = $$props.setCurrentView);
		};

		$$self.$capture_state = () => ({ setCurrentView });

		$$self.$inject_state = $$props => {
			if ('setCurrentView' in $$props) $$invalidate(0, setCurrentView = $$props.setCurrentView);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [setCurrentView, click_handler, click_handler_1];
	}

	class ViewBar extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, { setCurrentView: 0 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ViewBar",
				options,
				id: create_fragment$4.name
			});
		}

		get setCurrentView() {
			throw new Error("<ViewBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set setCurrentView(value) {
			throw new Error("<ViewBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/*!
	 * @kurkle/color v0.3.2
	 * https://github.com/kurkle/color#readme
	 * (c) 2023 Jukka Kurkela
	 * Released under the MIT License
	 */
	function round(v) {
	  return v + 0.5 | 0;
	}
	const lim = (v, l, h) => Math.max(Math.min(v, h), l);
	function p2b(v) {
	  return lim(round(v * 2.55), 0, 255);
	}
	function n2b(v) {
	  return lim(round(v * 255), 0, 255);
	}
	function b2n(v) {
	  return lim(round(v / 2.55) / 100, 0, 1);
	}
	function n2p(v) {
	  return lim(round(v * 100), 0, 100);
	}

	const map$1 = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15};
	const hex = [...'0123456789ABCDEF'];
	const h1 = b => hex[b & 0xF];
	const h2 = b => hex[(b & 0xF0) >> 4] + hex[b & 0xF];
	const eq = b => ((b & 0xF0) >> 4) === (b & 0xF);
	const isShort = v => eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a);
	function hexParse(str) {
	  var len = str.length;
	  var ret;
	  if (str[0] === '#') {
	    if (len === 4 || len === 5) {
	      ret = {
	        r: 255 & map$1[str[1]] * 17,
	        g: 255 & map$1[str[2]] * 17,
	        b: 255 & map$1[str[3]] * 17,
	        a: len === 5 ? map$1[str[4]] * 17 : 255
	      };
	    } else if (len === 7 || len === 9) {
	      ret = {
	        r: map$1[str[1]] << 4 | map$1[str[2]],
	        g: map$1[str[3]] << 4 | map$1[str[4]],
	        b: map$1[str[5]] << 4 | map$1[str[6]],
	        a: len === 9 ? (map$1[str[7]] << 4 | map$1[str[8]]) : 255
	      };
	    }
	  }
	  return ret;
	}
	const alpha = (a, f) => a < 255 ? f(a) : '';
	function hexString(v) {
	  var f = isShort(v) ? h1 : h2;
	  return v
	    ? '#' + f(v.r) + f(v.g) + f(v.b) + alpha(v.a, f)
	    : undefined;
	}

	const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
	function hsl2rgbn(h, s, l) {
	  const a = s * Math.min(l, 1 - l);
	  const f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	  return [f(0), f(8), f(4)];
	}
	function hsv2rgbn(h, s, v) {
	  const f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
	  return [f(5), f(3), f(1)];
	}
	function hwb2rgbn(h, w, b) {
	  const rgb = hsl2rgbn(h, 1, 0.5);
	  let i;
	  if (w + b > 1) {
	    i = 1 / (w + b);
	    w *= i;
	    b *= i;
	  }
	  for (i = 0; i < 3; i++) {
	    rgb[i] *= 1 - w - b;
	    rgb[i] += w;
	  }
	  return rgb;
	}
	function hueValue(r, g, b, d, max) {
	  if (r === max) {
	    return ((g - b) / d) + (g < b ? 6 : 0);
	  }
	  if (g === max) {
	    return (b - r) / d + 2;
	  }
	  return (r - g) / d + 4;
	}
	function rgb2hsl(v) {
	  const range = 255;
	  const r = v.r / range;
	  const g = v.g / range;
	  const b = v.b / range;
	  const max = Math.max(r, g, b);
	  const min = Math.min(r, g, b);
	  const l = (max + min) / 2;
	  let h, s, d;
	  if (max !== min) {
	    d = max - min;
	    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	    h = hueValue(r, g, b, d, max);
	    h = h * 60 + 0.5;
	  }
	  return [h | 0, s || 0, l];
	}
	function calln(f, a, b, c) {
	  return (
	    Array.isArray(a)
	      ? f(a[0], a[1], a[2])
	      : f(a, b, c)
	  ).map(n2b);
	}
	function hsl2rgb(h, s, l) {
	  return calln(hsl2rgbn, h, s, l);
	}
	function hwb2rgb(h, w, b) {
	  return calln(hwb2rgbn, h, w, b);
	}
	function hsv2rgb(h, s, v) {
	  return calln(hsv2rgbn, h, s, v);
	}
	function hue(h) {
	  return (h % 360 + 360) % 360;
	}
	function hueParse(str) {
	  const m = HUE_RE.exec(str);
	  let a = 255;
	  let v;
	  if (!m) {
	    return;
	  }
	  if (m[5] !== v) {
	    a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
	  }
	  const h = hue(+m[2]);
	  const p1 = +m[3] / 100;
	  const p2 = +m[4] / 100;
	  if (m[1] === 'hwb') {
	    v = hwb2rgb(h, p1, p2);
	  } else if (m[1] === 'hsv') {
	    v = hsv2rgb(h, p1, p2);
	  } else {
	    v = hsl2rgb(h, p1, p2);
	  }
	  return {
	    r: v[0],
	    g: v[1],
	    b: v[2],
	    a: a
	  };
	}
	function rotate(v, deg) {
	  var h = rgb2hsl(v);
	  h[0] = hue(h[0] + deg);
	  h = hsl2rgb(h);
	  v.r = h[0];
	  v.g = h[1];
	  v.b = h[2];
	}
	function hslString(v) {
	  if (!v) {
	    return;
	  }
	  const a = rgb2hsl(v);
	  const h = a[0];
	  const s = n2p(a[1]);
	  const l = n2p(a[2]);
	  return v.a < 255
	    ? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})`
	    : `hsl(${h}, ${s}%, ${l}%)`;
	}

	const map$2 = {
	  x: 'dark',
	  Z: 'light',
	  Y: 're',
	  X: 'blu',
	  W: 'gr',
	  V: 'medium',
	  U: 'slate',
	  A: 'ee',
	  T: 'ol',
	  S: 'or',
	  B: 'ra',
	  C: 'lateg',
	  D: 'ights',
	  R: 'in',
	  Q: 'turquois',
	  E: 'hi',
	  P: 'ro',
	  O: 'al',
	  N: 'le',
	  M: 'de',
	  L: 'yello',
	  F: 'en',
	  K: 'ch',
	  G: 'arks',
	  H: 'ea',
	  I: 'ightg',
	  J: 'wh'
	};
	const names$1 = {
	  OiceXe: 'f0f8ff',
	  antiquewEte: 'faebd7',
	  aqua: 'ffff',
	  aquamarRe: '7fffd4',
	  azuY: 'f0ffff',
	  beige: 'f5f5dc',
	  bisque: 'ffe4c4',
	  black: '0',
	  blanKedOmond: 'ffebcd',
	  Xe: 'ff',
	  XeviTet: '8a2be2',
	  bPwn: 'a52a2a',
	  burlywood: 'deb887',
	  caMtXe: '5f9ea0',
	  KartYuse: '7fff00',
	  KocTate: 'd2691e',
	  cSO: 'ff7f50',
	  cSnflowerXe: '6495ed',
	  cSnsilk: 'fff8dc',
	  crimson: 'dc143c',
	  cyan: 'ffff',
	  xXe: '8b',
	  xcyan: '8b8b',
	  xgTMnPd: 'b8860b',
	  xWay: 'a9a9a9',
	  xgYF: '6400',
	  xgYy: 'a9a9a9',
	  xkhaki: 'bdb76b',
	  xmagFta: '8b008b',
	  xTivegYF: '556b2f',
	  xSange: 'ff8c00',
	  xScEd: '9932cc',
	  xYd: '8b0000',
	  xsOmon: 'e9967a',
	  xsHgYF: '8fbc8f',
	  xUXe: '483d8b',
	  xUWay: '2f4f4f',
	  xUgYy: '2f4f4f',
	  xQe: 'ced1',
	  xviTet: '9400d3',
	  dAppRk: 'ff1493',
	  dApskyXe: 'bfff',
	  dimWay: '696969',
	  dimgYy: '696969',
	  dodgerXe: '1e90ff',
	  fiYbrick: 'b22222',
	  flSOwEte: 'fffaf0',
	  foYstWAn: '228b22',
	  fuKsia: 'ff00ff',
	  gaRsbSo: 'dcdcdc',
	  ghostwEte: 'f8f8ff',
	  gTd: 'ffd700',
	  gTMnPd: 'daa520',
	  Way: '808080',
	  gYF: '8000',
	  gYFLw: 'adff2f',
	  gYy: '808080',
	  honeyMw: 'f0fff0',
	  hotpRk: 'ff69b4',
	  RdianYd: 'cd5c5c',
	  Rdigo: '4b0082',
	  ivSy: 'fffff0',
	  khaki: 'f0e68c',
	  lavFMr: 'e6e6fa',
	  lavFMrXsh: 'fff0f5',
	  lawngYF: '7cfc00',
	  NmoncEffon: 'fffacd',
	  ZXe: 'add8e6',
	  ZcSO: 'f08080',
	  Zcyan: 'e0ffff',
	  ZgTMnPdLw: 'fafad2',
	  ZWay: 'd3d3d3',
	  ZgYF: '90ee90',
	  ZgYy: 'd3d3d3',
	  ZpRk: 'ffb6c1',
	  ZsOmon: 'ffa07a',
	  ZsHgYF: '20b2aa',
	  ZskyXe: '87cefa',
	  ZUWay: '778899',
	  ZUgYy: '778899',
	  ZstAlXe: 'b0c4de',
	  ZLw: 'ffffe0',
	  lime: 'ff00',
	  limegYF: '32cd32',
	  lRF: 'faf0e6',
	  magFta: 'ff00ff',
	  maPon: '800000',
	  VaquamarRe: '66cdaa',
	  VXe: 'cd',
	  VScEd: 'ba55d3',
	  VpurpN: '9370db',
	  VsHgYF: '3cb371',
	  VUXe: '7b68ee',
	  VsprRggYF: 'fa9a',
	  VQe: '48d1cc',
	  VviTetYd: 'c71585',
	  midnightXe: '191970',
	  mRtcYam: 'f5fffa',
	  mistyPse: 'ffe4e1',
	  moccasR: 'ffe4b5',
	  navajowEte: 'ffdead',
	  navy: '80',
	  Tdlace: 'fdf5e6',
	  Tive: '808000',
	  TivedBb: '6b8e23',
	  Sange: 'ffa500',
	  SangeYd: 'ff4500',
	  ScEd: 'da70d6',
	  pOegTMnPd: 'eee8aa',
	  pOegYF: '98fb98',
	  pOeQe: 'afeeee',
	  pOeviTetYd: 'db7093',
	  papayawEp: 'ffefd5',
	  pHKpuff: 'ffdab9',
	  peru: 'cd853f',
	  pRk: 'ffc0cb',
	  plum: 'dda0dd',
	  powMrXe: 'b0e0e6',
	  purpN: '800080',
	  YbeccapurpN: '663399',
	  Yd: 'ff0000',
	  Psybrown: 'bc8f8f',
	  PyOXe: '4169e1',
	  saddNbPwn: '8b4513',
	  sOmon: 'fa8072',
	  sandybPwn: 'f4a460',
	  sHgYF: '2e8b57',
	  sHshell: 'fff5ee',
	  siFna: 'a0522d',
	  silver: 'c0c0c0',
	  skyXe: '87ceeb',
	  UXe: '6a5acd',
	  UWay: '708090',
	  UgYy: '708090',
	  snow: 'fffafa',
	  sprRggYF: 'ff7f',
	  stAlXe: '4682b4',
	  tan: 'd2b48c',
	  teO: '8080',
	  tEstN: 'd8bfd8',
	  tomato: 'ff6347',
	  Qe: '40e0d0',
	  viTet: 'ee82ee',
	  JHt: 'f5deb3',
	  wEte: 'ffffff',
	  wEtesmoke: 'f5f5f5',
	  Lw: 'ffff00',
	  LwgYF: '9acd32'
	};
	function unpack() {
	  const unpacked = {};
	  const keys = Object.keys(names$1);
	  const tkeys = Object.keys(map$2);
	  let i, j, k, ok, nk;
	  for (i = 0; i < keys.length; i++) {
	    ok = nk = keys[i];
	    for (j = 0; j < tkeys.length; j++) {
	      k = tkeys[j];
	      nk = nk.replace(k, map$2[k]);
	    }
	    k = parseInt(names$1[ok], 16);
	    unpacked[nk] = [k >> 16 & 0xFF, k >> 8 & 0xFF, k & 0xFF];
	  }
	  return unpacked;
	}

	let names;
	function nameParse(str) {
	  if (!names) {
	    names = unpack();
	    names.transparent = [0, 0, 0, 0];
	  }
	  const a = names[str.toLowerCase()];
	  return a && {
	    r: a[0],
	    g: a[1],
	    b: a[2],
	    a: a.length === 4 ? a[3] : 255
	  };
	}

	const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
	function rgbParse(str) {
	  const m = RGB_RE.exec(str);
	  let a = 255;
	  let r, g, b;
	  if (!m) {
	    return;
	  }
	  if (m[7] !== r) {
	    const v = +m[7];
	    a = m[8] ? p2b(v) : lim(v * 255, 0, 255);
	  }
	  r = +m[1];
	  g = +m[3];
	  b = +m[5];
	  r = 255 & (m[2] ? p2b(r) : lim(r, 0, 255));
	  g = 255 & (m[4] ? p2b(g) : lim(g, 0, 255));
	  b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255));
	  return {
	    r: r,
	    g: g,
	    b: b,
	    a: a
	  };
	}
	function rgbString(v) {
	  return v && (
	    v.a < 255
	      ? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})`
	      : `rgb(${v.r}, ${v.g}, ${v.b})`
	  );
	}

	const to = v => v <= 0.0031308 ? v * 12.92 : Math.pow(v, 1.0 / 2.4) * 1.055 - 0.055;
	const from = v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	function interpolate$1(rgb1, rgb2, t) {
	  const r = from(b2n(rgb1.r));
	  const g = from(b2n(rgb1.g));
	  const b = from(b2n(rgb1.b));
	  return {
	    r: n2b(to(r + t * (from(b2n(rgb2.r)) - r))),
	    g: n2b(to(g + t * (from(b2n(rgb2.g)) - g))),
	    b: n2b(to(b + t * (from(b2n(rgb2.b)) - b))),
	    a: rgb1.a + t * (rgb2.a - rgb1.a)
	  };
	}

	function modHSL(v, i, ratio) {
	  if (v) {
	    let tmp = rgb2hsl(v);
	    tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
	    tmp = hsl2rgb(tmp);
	    v.r = tmp[0];
	    v.g = tmp[1];
	    v.b = tmp[2];
	  }
	}
	function clone$1(v, proto) {
	  return v ? Object.assign(proto || {}, v) : v;
	}
	function fromObject(input) {
	  var v = {r: 0, g: 0, b: 0, a: 255};
	  if (Array.isArray(input)) {
	    if (input.length >= 3) {
	      v = {r: input[0], g: input[1], b: input[2], a: 255};
	      if (input.length > 3) {
	        v.a = n2b(input[3]);
	      }
	    }
	  } else {
	    v = clone$1(input, {r: 0, g: 0, b: 0, a: 1});
	    v.a = n2b(v.a);
	  }
	  return v;
	}
	function functionParse(str) {
	  if (str.charAt(0) === 'r') {
	    return rgbParse(str);
	  }
	  return hueParse(str);
	}
	class Color {
	  constructor(input) {
	    if (input instanceof Color) {
	      return input;
	    }
	    const type = typeof input;
	    let v;
	    if (type === 'object') {
	      v = fromObject(input);
	    } else if (type === 'string') {
	      v = hexParse(input) || nameParse(input) || functionParse(input);
	    }
	    this._rgb = v;
	    this._valid = !!v;
	  }
	  get valid() {
	    return this._valid;
	  }
	  get rgb() {
	    var v = clone$1(this._rgb);
	    if (v) {
	      v.a = b2n(v.a);
	    }
	    return v;
	  }
	  set rgb(obj) {
	    this._rgb = fromObject(obj);
	  }
	  rgbString() {
	    return this._valid ? rgbString(this._rgb) : undefined;
	  }
	  hexString() {
	    return this._valid ? hexString(this._rgb) : undefined;
	  }
	  hslString() {
	    return this._valid ? hslString(this._rgb) : undefined;
	  }
	  mix(color, weight) {
	    if (color) {
	      const c1 = this.rgb;
	      const c2 = color.rgb;
	      let w2;
	      const p = weight === w2 ? 0.5 : weight;
	      const w = 2 * p - 1;
	      const a = c1.a - c2.a;
	      const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2.0;
	      w2 = 1 - w1;
	      c1.r = 0xFF & w1 * c1.r + w2 * c2.r + 0.5;
	      c1.g = 0xFF & w1 * c1.g + w2 * c2.g + 0.5;
	      c1.b = 0xFF & w1 * c1.b + w2 * c2.b + 0.5;
	      c1.a = p * c1.a + (1 - p) * c2.a;
	      this.rgb = c1;
	    }
	    return this;
	  }
	  interpolate(color, t) {
	    if (color) {
	      this._rgb = interpolate$1(this._rgb, color._rgb, t);
	    }
	    return this;
	  }
	  clone() {
	    return new Color(this.rgb);
	  }
	  alpha(a) {
	    this._rgb.a = n2b(a);
	    return this;
	  }
	  clearer(ratio) {
	    const rgb = this._rgb;
	    rgb.a *= 1 - ratio;
	    return this;
	  }
	  greyscale() {
	    const rgb = this._rgb;
	    const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
	    rgb.r = rgb.g = rgb.b = val;
	    return this;
	  }
	  opaquer(ratio) {
	    const rgb = this._rgb;
	    rgb.a *= 1 + ratio;
	    return this;
	  }
	  negate() {
	    const v = this._rgb;
	    v.r = 255 - v.r;
	    v.g = 255 - v.g;
	    v.b = 255 - v.b;
	    return this;
	  }
	  lighten(ratio) {
	    modHSL(this._rgb, 2, ratio);
	    return this;
	  }
	  darken(ratio) {
	    modHSL(this._rgb, 2, -ratio);
	    return this;
	  }
	  saturate(ratio) {
	    modHSL(this._rgb, 1, ratio);
	    return this;
	  }
	  desaturate(ratio) {
	    modHSL(this._rgb, 1, -ratio);
	    return this;
	  }
	  rotate(deg) {
	    rotate(this._rgb, deg);
	    return this;
	  }
	}

	/*!
	 * Chart.js v4.4.1
	 * https://www.chartjs.org
	 * (c) 2023 Chart.js Contributors
	 * Released under the MIT License
	 */

	/**
	 * @namespace Chart.helpers
	 */ /**
	 * An empty function that can be used, for example, for optional callback.
	 */ function noop() {
	/* noop */ }
	/**
	 * Returns a unique id, sequentially generated from a global variable.
	 */ const uid = (()=>{
	    let id = 0;
	    return ()=>id++;
	})();
	/**
	 * Returns true if `value` is neither null nor undefined, else returns false.
	 * @param value - The value to test.
	 * @since 2.7.0
	 */ function isNullOrUndef(value) {
	    return value === null || typeof value === 'undefined';
	}
	/**
	 * Returns true if `value` is an array (including typed arrays), else returns false.
	 * @param value - The value to test.
	 * @function
	 */ function isArray(value) {
	    if (Array.isArray && Array.isArray(value)) {
	        return true;
	    }
	    const type = Object.prototype.toString.call(value);
	    if (type.slice(0, 7) === '[object' && type.slice(-6) === 'Array]') {
	        return true;
	    }
	    return false;
	}
	/**
	 * Returns true if `value` is an object (excluding null), else returns false.
	 * @param value - The value to test.
	 * @since 2.7.0
	 */ function isObject(value) {
	    return value !== null && Object.prototype.toString.call(value) === '[object Object]';
	}
	/**
	 * Returns true if `value` is a finite number, else returns false
	 * @param value  - The value to test.
	 */ function isNumberFinite(value) {
	    return (typeof value === 'number' || value instanceof Number) && isFinite(+value);
	}
	/**
	 * Returns `value` if finite, else returns `defaultValue`.
	 * @param value - The value to return if defined.
	 * @param defaultValue - The value to return if `value` is not finite.
	 */ function finiteOrDefault(value, defaultValue) {
	    return isNumberFinite(value) ? value : defaultValue;
	}
	/**
	 * Returns `value` if defined, else returns `defaultValue`.
	 * @param value - The value to return if defined.
	 * @param defaultValue - The value to return if `value` is undefined.
	 */ function valueOrDefault(value, defaultValue) {
	    return typeof value === 'undefined' ? defaultValue : value;
	}
	const toPercentage = (value, dimension)=>typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 : +value / dimension;
	const toDimension = (value, dimension)=>typeof value === 'string' && value.endsWith('%') ? parseFloat(value) / 100 * dimension : +value;
	/**
	 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
	 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
	 * @param fn - The function to call.
	 * @param args - The arguments with which `fn` should be called.
	 * @param [thisArg] - The value of `this` provided for the call to `fn`.
	 */ function callback(fn, args, thisArg) {
	    if (fn && typeof fn.call === 'function') {
	        return fn.apply(thisArg, args);
	    }
	}
	function each(loopable, fn, thisArg, reverse) {
	    let i, len, keys;
	    if (isArray(loopable)) {
	        len = loopable.length;
	        if (reverse) {
	            for(i = len - 1; i >= 0; i--){
	                fn.call(thisArg, loopable[i], i);
	            }
	        } else {
	            for(i = 0; i < len; i++){
	                fn.call(thisArg, loopable[i], i);
	            }
	        }
	    } else if (isObject(loopable)) {
	        keys = Object.keys(loopable);
	        len = keys.length;
	        for(i = 0; i < len; i++){
	            fn.call(thisArg, loopable[keys[i]], keys[i]);
	        }
	    }
	}
	/**
	 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
	 * @param a0 - The array to compare
	 * @param a1 - The array to compare
	 * @private
	 */ function _elementsEqual(a0, a1) {
	    let i, ilen, v0, v1;
	    if (!a0 || !a1 || a0.length !== a1.length) {
	        return false;
	    }
	    for(i = 0, ilen = a0.length; i < ilen; ++i){
	        v0 = a0[i];
	        v1 = a1[i];
	        if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
	            return false;
	        }
	    }
	    return true;
	}
	/**
	 * Returns a deep copy of `source` without keeping references on objects and arrays.
	 * @param source - The value to clone.
	 */ function clone(source) {
	    if (isArray(source)) {
	        return source.map(clone);
	    }
	    if (isObject(source)) {
	        const target = Object.create(null);
	        const keys = Object.keys(source);
	        const klen = keys.length;
	        let k = 0;
	        for(; k < klen; ++k){
	            target[keys[k]] = clone(source[keys[k]]);
	        }
	        return target;
	    }
	    return source;
	}
	function isValidKey(key) {
	    return [
	        '__proto__',
	        'prototype',
	        'constructor'
	    ].indexOf(key) === -1;
	}
	/**
	 * The default merger when Chart.helpers.merge is called without merger option.
	 * Note(SB): also used by mergeConfig and mergeScaleConfig as fallback.
	 * @private
	 */ function _merger(key, target, source, options) {
	    if (!isValidKey(key)) {
	        return;
	    }
	    const tval = target[key];
	    const sval = source[key];
	    if (isObject(tval) && isObject(sval)) {
	        // eslint-disable-next-line @typescript-eslint/no-use-before-define
	        merge(tval, sval, options);
	    } else {
	        target[key] = clone(sval);
	    }
	}
	function merge(target, source, options) {
	    const sources = isArray(source) ? source : [
	        source
	    ];
	    const ilen = sources.length;
	    if (!isObject(target)) {
	        return target;
	    }
	    options = options || {};
	    const merger = options.merger || _merger;
	    let current;
	    for(let i = 0; i < ilen; ++i){
	        current = sources[i];
	        if (!isObject(current)) {
	            continue;
	        }
	        const keys = Object.keys(current);
	        for(let k = 0, klen = keys.length; k < klen; ++k){
	            merger(keys[k], target, current, options);
	        }
	    }
	    return target;
	}
	function mergeIf(target, source) {
	    // eslint-disable-next-line @typescript-eslint/no-use-before-define
	    return merge(target, source, {
	        merger: _mergerIf
	    });
	}
	/**
	 * Merges source[key] in target[key] only if target[key] is undefined.
	 * @private
	 */ function _mergerIf(key, target, source) {
	    if (!isValidKey(key)) {
	        return;
	    }
	    const tval = target[key];
	    const sval = source[key];
	    if (isObject(tval) && isObject(sval)) {
	        mergeIf(tval, sval);
	    } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
	        target[key] = clone(sval);
	    }
	}
	// resolveObjectKey resolver cache
	const keyResolvers = {
	    // Chart.helpers.core resolveObjectKey should resolve empty key to root object
	    '': (v)=>v,
	    // default resolvers
	    x: (o)=>o.x,
	    y: (o)=>o.y
	};
	/**
	 * @private
	 */ function _splitKey(key) {
	    const parts = key.split('.');
	    const keys = [];
	    let tmp = '';
	    for (const part of parts){
	        tmp += part;
	        if (tmp.endsWith('\\')) {
	            tmp = tmp.slice(0, -1) + '.';
	        } else {
	            keys.push(tmp);
	            tmp = '';
	        }
	    }
	    return keys;
	}
	function _getKeyResolver(key) {
	    const keys = _splitKey(key);
	    return (obj)=>{
	        for (const k of keys){
	            if (k === '') {
	                break;
	            }
	            obj = obj && obj[k];
	        }
	        return obj;
	    };
	}
	function resolveObjectKey(obj, key) {
	    const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
	    return resolver(obj);
	}
	/**
	 * @private
	 */ function _capitalize(str) {
	    return str.charAt(0).toUpperCase() + str.slice(1);
	}
	const defined = (value)=>typeof value !== 'undefined';
	const isFunction = (value)=>typeof value === 'function';
	// Adapted from https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality#31129384
	const setsEqual = (a, b)=>{
	    if (a.size !== b.size) {
	        return false;
	    }
	    for (const item of a){
	        if (!b.has(item)) {
	            return false;
	        }
	    }
	    return true;
	};
	/**
	 * @param e - The event
	 * @private
	 */ function _isClickEvent(e) {
	    return e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu';
	}

	/**
	 * @alias Chart.helpers.math
	 * @namespace
	 */ const PI = Math.PI;
	const TAU = 2 * PI;
	const PITAU = TAU + PI;
	const INFINITY = Number.POSITIVE_INFINITY;
	const RAD_PER_DEG = PI / 180;
	const HALF_PI = PI / 2;
	const QUARTER_PI = PI / 4;
	const TWO_THIRDS_PI = PI * 2 / 3;
	const log10 = Math.log10;
	const sign = Math.sign;
	function almostEquals(x, y, epsilon) {
	    return Math.abs(x - y) < epsilon;
	}
	/**
	 * Implementation of the nice number algorithm used in determining where axis labels will go
	 */ function niceNum(range) {
	    const roundedRange = Math.round(range);
	    range = almostEquals(range, roundedRange, range / 1000) ? roundedRange : range;
	    const niceRange = Math.pow(10, Math.floor(log10(range)));
	    const fraction = range / niceRange;
	    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
	    return niceFraction * niceRange;
	}
	/**
	 * Returns an array of factors sorted from 1 to sqrt(value)
	 * @private
	 */ function _factorize(value) {
	    const result = [];
	    const sqrt = Math.sqrt(value);
	    let i;
	    for(i = 1; i < sqrt; i++){
	        if (value % i === 0) {
	            result.push(i);
	            result.push(value / i);
	        }
	    }
	    if (sqrt === (sqrt | 0)) {
	        result.push(sqrt);
	    }
	    result.sort((a, b)=>a - b).pop();
	    return result;
	}
	function isNumber(n) {
	    return !isNaN(parseFloat(n)) && isFinite(n);
	}
	function almostWhole(x, epsilon) {
	    const rounded = Math.round(x);
	    return rounded - epsilon <= x && rounded + epsilon >= x;
	}
	/**
	 * @private
	 */ function _setMinAndMaxByKey(array, target, property) {
	    let i, ilen, value;
	    for(i = 0, ilen = array.length; i < ilen; i++){
	        value = array[i][property];
	        if (!isNaN(value)) {
	            target.min = Math.min(target.min, value);
	            target.max = Math.max(target.max, value);
	        }
	    }
	}
	function toRadians(degrees) {
	    return degrees * (PI / 180);
	}
	function toDegrees(radians) {
	    return radians * (180 / PI);
	}
	/**
	 * Returns the number of decimal places
	 * i.e. the number of digits after the decimal point, of the value of this Number.
	 * @param x - A number.
	 * @returns The number of decimal places.
	 * @private
	 */ function _decimalPlaces(x) {
	    if (!isNumberFinite(x)) {
	        return;
	    }
	    let e = 1;
	    let p = 0;
	    while(Math.round(x * e) / e !== x){
	        e *= 10;
	        p++;
	    }
	    return p;
	}
	// Gets the angle from vertical upright to the point about a centre.
	function getAngleFromPoint(centrePoint, anglePoint) {
	    const distanceFromXCenter = anglePoint.x - centrePoint.x;
	    const distanceFromYCenter = anglePoint.y - centrePoint.y;
	    const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
	    let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
	    if (angle < -0.5 * PI) {
	        angle += TAU; // make sure the returned angle is in the range of (-PI/2, 3PI/2]
	    }
	    return {
	        angle,
	        distance: radialDistanceFromCenter
	    };
	}
	function distanceBetweenPoints(pt1, pt2) {
	    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
	}
	/**
	 * Shortest distance between angles, in either direction.
	 * @private
	 */ function _angleDiff(a, b) {
	    return (a - b + PITAU) % TAU - PI;
	}
	/**
	 * Normalize angle to be between 0 and 2*PI
	 * @private
	 */ function _normalizeAngle(a) {
	    return (a % TAU + TAU) % TAU;
	}
	/**
	 * @private
	 */ function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
	    const a = _normalizeAngle(angle);
	    const s = _normalizeAngle(start);
	    const e = _normalizeAngle(end);
	    const angleToStart = _normalizeAngle(s - a);
	    const angleToEnd = _normalizeAngle(e - a);
	    const startToAngle = _normalizeAngle(a - s);
	    const endToAngle = _normalizeAngle(a - e);
	    return a === s || a === e || sameAngleIsFullCircle && s === e || angleToStart > angleToEnd && startToAngle < endToAngle;
	}
	/**
	 * Limit `value` between `min` and `max`
	 * @param value
	 * @param min
	 * @param max
	 * @private
	 */ function _limitValue(value, min, max) {
	    return Math.max(min, Math.min(max, value));
	}
	/**
	 * @param {number} value
	 * @private
	 */ function _int16Range(value) {
	    return _limitValue(value, -32768, 32767);
	}
	/**
	 * @param value
	 * @param start
	 * @param end
	 * @param [epsilon]
	 * @private
	 */ function _isBetween(value, start, end, epsilon = 1e-6) {
	    return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
	}

	function _lookup(table, value, cmp) {
	    cmp = cmp || ((index)=>table[index] < value);
	    let hi = table.length - 1;
	    let lo = 0;
	    let mid;
	    while(hi - lo > 1){
	        mid = lo + hi >> 1;
	        if (cmp(mid)) {
	            lo = mid;
	        } else {
	            hi = mid;
	        }
	    }
	    return {
	        lo,
	        hi
	    };
	}
	/**
	 * Binary search
	 * @param table - the table search. must be sorted!
	 * @param key - property name for the value in each entry
	 * @param value - value to find
	 * @param last - lookup last index
	 * @private
	 */ const _lookupByKey = (table, key, value, last)=>_lookup(table, value, last ? (index)=>{
	        const ti = table[index][key];
	        return ti < value || ti === value && table[index + 1][key] === value;
	    } : (index)=>table[index][key] < value);
	/**
	 * Reverse binary search
	 * @param table - the table search. must be sorted!
	 * @param key - property name for the value in each entry
	 * @param value - value to find
	 * @private
	 */ const _rlookupByKey = (table, key, value)=>_lookup(table, value, (index)=>table[index][key] >= value);
	/**
	 * Return subset of `values` between `min` and `max` inclusive.
	 * Values are assumed to be in sorted order.
	 * @param values - sorted array of values
	 * @param min - min value
	 * @param max - max value
	 */ function _filterBetween(values, min, max) {
	    let start = 0;
	    let end = values.length;
	    while(start < end && values[start] < min){
	        start++;
	    }
	    while(end > start && values[end - 1] > max){
	        end--;
	    }
	    return start > 0 || end < values.length ? values.slice(start, end) : values;
	}
	const arrayEvents = [
	    'push',
	    'pop',
	    'shift',
	    'splice',
	    'unshift'
	];
	function listenArrayEvents(array, listener) {
	    if (array._chartjs) {
	        array._chartjs.listeners.push(listener);
	        return;
	    }
	    Object.defineProperty(array, '_chartjs', {
	        configurable: true,
	        enumerable: false,
	        value: {
	            listeners: [
	                listener
	            ]
	        }
	    });
	    arrayEvents.forEach((key)=>{
	        const method = '_onData' + _capitalize(key);
	        const base = array[key];
	        Object.defineProperty(array, key, {
	            configurable: true,
	            enumerable: false,
	            value (...args) {
	                const res = base.apply(this, args);
	                array._chartjs.listeners.forEach((object)=>{
	                    if (typeof object[method] === 'function') {
	                        object[method](...args);
	                    }
	                });
	                return res;
	            }
	        });
	    });
	}
	function unlistenArrayEvents(array, listener) {
	    const stub = array._chartjs;
	    if (!stub) {
	        return;
	    }
	    const listeners = stub.listeners;
	    const index = listeners.indexOf(listener);
	    if (index !== -1) {
	        listeners.splice(index, 1);
	    }
	    if (listeners.length > 0) {
	        return;
	    }
	    arrayEvents.forEach((key)=>{
	        delete array[key];
	    });
	    delete array._chartjs;
	}
	/**
	 * @param items
	 */ function _arrayUnique(items) {
	    const set = new Set(items);
	    if (set.size === items.length) {
	        return items;
	    }
	    return Array.from(set);
	}
	/**
	* Request animation polyfill
	*/ const requestAnimFrame = function() {
	    if (typeof window === 'undefined') {
	        return function(callback) {
	            return callback();
	        };
	    }
	    return window.requestAnimationFrame;
	}();
	/**
	 * Throttles calling `fn` once per animation frame
	 * Latest arguments are used on the actual call
	 */ function throttled(fn, thisArg) {
	    let argsToUse = [];
	    let ticking = false;
	    return function(...args) {
	        // Save the args for use later
	        argsToUse = args;
	        if (!ticking) {
	            ticking = true;
	            requestAnimFrame.call(window, ()=>{
	                ticking = false;
	                fn.apply(thisArg, argsToUse);
	            });
	        }
	    };
	}
	/**
	 * Debounces calling `fn` for `delay` ms
	 */ function debounce(fn, delay) {
	    let timeout;
	    return function(...args) {
	        if (delay) {
	            clearTimeout(timeout);
	            timeout = setTimeout(fn, delay, args);
	        } else {
	            fn.apply(this, args);
	        }
	        return delay;
	    };
	}
	/**
	 * Converts 'start' to 'left', 'end' to 'right' and others to 'center'
	 * @private
	 */ const _toLeftRightCenter = (align)=>align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';
	/**
	 * Returns `start`, `end` or `(start + end) / 2` depending on `align`. Defaults to `center`
	 * @private
	 */ const _alignStartEnd = (align, start, end)=>align === 'start' ? start : align === 'end' ? end : (start + end) / 2;
	/**
	 * Returns `left`, `right` or `(left + right) / 2` depending on `align`. Defaults to `left`
	 * @private
	 */ const _textX = (align, left, right, rtl)=>{
	    const check = rtl ? 'left' : 'right';
	    return align === check ? right : align === 'center' ? (left + right) / 2 : left;
	};
	/**
	 * Return start and count of visible points.
	 * @private
	 */ function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
	    const pointCount = points.length;
	    let start = 0;
	    let count = pointCount;
	    if (meta._sorted) {
	        const { iScale , _parsed  } = meta;
	        const axis = iScale.axis;
	        const { min , max , minDefined , maxDefined  } = iScale.getUserBounds();
	        if (minDefined) {
	            start = _limitValue(Math.min(// @ts-expect-error Need to type _parsed
	            _lookupByKey(_parsed, axis, min).lo, // @ts-expect-error Need to fix types on _lookupByKey
	            animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo), 0, pointCount - 1);
	        }
	        if (maxDefined) {
	            count = _limitValue(Math.max(// @ts-expect-error Need to type _parsed
	            _lookupByKey(_parsed, iScale.axis, max, true).hi + 1, // @ts-expect-error Need to fix types on _lookupByKey
	            animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1), start, pointCount) - start;
	        } else {
	            count = pointCount - start;
	        }
	    }
	    return {
	        start,
	        count
	    };
	}
	/**
	 * Checks if the scale ranges have changed.
	 * @param {object} meta - dataset meta.
	 * @returns {boolean}
	 * @private
	 */ function _scaleRangesChanged(meta) {
	    const { xScale , yScale , _scaleRanges  } = meta;
	    const newRanges = {
	        xmin: xScale.min,
	        xmax: xScale.max,
	        ymin: yScale.min,
	        ymax: yScale.max
	    };
	    if (!_scaleRanges) {
	        meta._scaleRanges = newRanges;
	        return true;
	    }
	    const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
	    Object.assign(_scaleRanges, newRanges);
	    return changed;
	}

	const atEdge = (t)=>t === 0 || t === 1;
	const elasticIn = (t, s, p)=>-(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p));
	const elasticOut = (t, s, p)=>Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1;
	/**
	 * Easing functions adapted from Robert Penner's easing equations.
	 * @namespace Chart.helpers.easing.effects
	 * @see http://www.robertpenner.com/easing/
	 */ const effects = {
	    linear: (t)=>t,
	    easeInQuad: (t)=>t * t,
	    easeOutQuad: (t)=>-t * (t - 2),
	    easeInOutQuad: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1),
	    easeInCubic: (t)=>t * t * t,
	    easeOutCubic: (t)=>(t -= 1) * t * t + 1,
	    easeInOutCubic: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2),
	    easeInQuart: (t)=>t * t * t * t,
	    easeOutQuart: (t)=>-((t -= 1) * t * t * t - 1),
	    easeInOutQuart: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2),
	    easeInQuint: (t)=>t * t * t * t * t,
	    easeOutQuint: (t)=>(t -= 1) * t * t * t * t + 1,
	    easeInOutQuint: (t)=>(t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2),
	    easeInSine: (t)=>-Math.cos(t * HALF_PI) + 1,
	    easeOutSine: (t)=>Math.sin(t * HALF_PI),
	    easeInOutSine: (t)=>-0.5 * (Math.cos(PI * t) - 1),
	    easeInExpo: (t)=>t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
	    easeOutExpo: (t)=>t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
	    easeInOutExpo: (t)=>atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),
	    easeInCirc: (t)=>t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1),
	    easeOutCirc: (t)=>Math.sqrt(1 - (t -= 1) * t),
	    easeInOutCirc: (t)=>(t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
	    easeInElastic: (t)=>atEdge(t) ? t : elasticIn(t, 0.075, 0.3),
	    easeOutElastic: (t)=>atEdge(t) ? t : elasticOut(t, 0.075, 0.3),
	    easeInOutElastic (t) {
	        const s = 0.1125;
	        const p = 0.45;
	        return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
	    },
	    easeInBack (t) {
	        const s = 1.70158;
	        return t * t * ((s + 1) * t - s);
	    },
	    easeOutBack (t) {
	        const s = 1.70158;
	        return (t -= 1) * t * ((s + 1) * t + s) + 1;
	    },
	    easeInOutBack (t) {
	        let s = 1.70158;
	        if ((t /= 0.5) < 1) {
	            return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
	        }
	        return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
	    },
	    easeInBounce: (t)=>1 - effects.easeOutBounce(1 - t),
	    easeOutBounce (t) {
	        const m = 7.5625;
	        const d = 2.75;
	        if (t < 1 / d) {
	            return m * t * t;
	        }
	        if (t < 2 / d) {
	            return m * (t -= 1.5 / d) * t + 0.75;
	        }
	        if (t < 2.5 / d) {
	            return m * (t -= 2.25 / d) * t + 0.9375;
	        }
	        return m * (t -= 2.625 / d) * t + 0.984375;
	    },
	    easeInOutBounce: (t)=>t < 0.5 ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
	};

	function isPatternOrGradient(value) {
	    if (value && typeof value === 'object') {
	        const type = value.toString();
	        return type === '[object CanvasPattern]' || type === '[object CanvasGradient]';
	    }
	    return false;
	}
	function color(value) {
	    return isPatternOrGradient(value) ? value : new Color(value);
	}
	function getHoverColor(value) {
	    return isPatternOrGradient(value) ? value : new Color(value).saturate(0.5).darken(0.1).hexString();
	}

	const numbers = [
	    'x',
	    'y',
	    'borderWidth',
	    'radius',
	    'tension'
	];
	const colors = [
	    'color',
	    'borderColor',
	    'backgroundColor'
	];
	function applyAnimationsDefaults(defaults) {
	    defaults.set('animation', {
	        delay: undefined,
	        duration: 1000,
	        easing: 'easeOutQuart',
	        fn: undefined,
	        from: undefined,
	        loop: undefined,
	        to: undefined,
	        type: undefined
	    });
	    defaults.describe('animation', {
	        _fallback: false,
	        _indexable: false,
	        _scriptable: (name)=>name !== 'onProgress' && name !== 'onComplete' && name !== 'fn'
	    });
	    defaults.set('animations', {
	        colors: {
	            type: 'color',
	            properties: colors
	        },
	        numbers: {
	            type: 'number',
	            properties: numbers
	        }
	    });
	    defaults.describe('animations', {
	        _fallback: 'animation'
	    });
	    defaults.set('transitions', {
	        active: {
	            animation: {
	                duration: 400
	            }
	        },
	        resize: {
	            animation: {
	                duration: 0
	            }
	        },
	        show: {
	            animations: {
	                colors: {
	                    from: 'transparent'
	                },
	                visible: {
	                    type: 'boolean',
	                    duration: 0
	                }
	            }
	        },
	        hide: {
	            animations: {
	                colors: {
	                    to: 'transparent'
	                },
	                visible: {
	                    type: 'boolean',
	                    easing: 'linear',
	                    fn: (v)=>v | 0
	                }
	            }
	        }
	    });
	}

	function applyLayoutsDefaults(defaults) {
	    defaults.set('layout', {
	        autoPadding: true,
	        padding: {
	            top: 0,
	            right: 0,
	            bottom: 0,
	            left: 0
	        }
	    });
	}

	const intlCache = new Map();
	function getNumberFormat(locale, options) {
	    options = options || {};
	    const cacheKey = locale + JSON.stringify(options);
	    let formatter = intlCache.get(cacheKey);
	    if (!formatter) {
	        formatter = new Intl.NumberFormat(locale, options);
	        intlCache.set(cacheKey, formatter);
	    }
	    return formatter;
	}
	function formatNumber(num, locale, options) {
	    return getNumberFormat(locale, options).format(num);
	}

	const formatters = {
	 values (value) {
	        return isArray(value) ?  value : '' + value;
	    },
	 numeric (tickValue, index, ticks) {
	        if (tickValue === 0) {
	            return '0';
	        }
	        const locale = this.chart.options.locale;
	        let notation;
	        let delta = tickValue;
	        if (ticks.length > 1) {
	            const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
	            if (maxTick < 1e-4 || maxTick > 1e+15) {
	                notation = 'scientific';
	            }
	            delta = calculateDelta(tickValue, ticks);
	        }
	        const logDelta = log10(Math.abs(delta));
	        const numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
	        const options = {
	            notation,
	            minimumFractionDigits: numDecimal,
	            maximumFractionDigits: numDecimal
	        };
	        Object.assign(options, this.options.ticks.format);
	        return formatNumber(tickValue, locale, options);
	    },
	 logarithmic (tickValue, index, ticks) {
	        if (tickValue === 0) {
	            return '0';
	        }
	        const remain = ticks[index].significand || tickValue / Math.pow(10, Math.floor(log10(tickValue)));
	        if ([
	            1,
	            2,
	            3,
	            5,
	            10,
	            15
	        ].includes(remain) || index > 0.8 * ticks.length) {
	            return formatters.numeric.call(this, tickValue, index, ticks);
	        }
	        return '';
	    }
	};
	function calculateDelta(tickValue, ticks) {
	    let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
	    if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
	        delta = tickValue - Math.floor(tickValue);
	    }
	    return delta;
	}
	 var Ticks = {
	    formatters
	};

	function applyScaleDefaults(defaults) {
	    defaults.set('scale', {
	        display: true,
	        offset: false,
	        reverse: false,
	        beginAtZero: false,
	 bounds: 'ticks',
	        clip: true,
	 grace: 0,
	        grid: {
	            display: true,
	            lineWidth: 1,
	            drawOnChartArea: true,
	            drawTicks: true,
	            tickLength: 8,
	            tickWidth: (_ctx, options)=>options.lineWidth,
	            tickColor: (_ctx, options)=>options.color,
	            offset: false
	        },
	        border: {
	            display: true,
	            dash: [],
	            dashOffset: 0.0,
	            width: 1
	        },
	        title: {
	            display: false,
	            text: '',
	            padding: {
	                top: 4,
	                bottom: 4
	            }
	        },
	        ticks: {
	            minRotation: 0,
	            maxRotation: 50,
	            mirror: false,
	            textStrokeWidth: 0,
	            textStrokeColor: '',
	            padding: 3,
	            display: true,
	            autoSkip: true,
	            autoSkipPadding: 3,
	            labelOffset: 0,
	            callback: Ticks.formatters.values,
	            minor: {},
	            major: {},
	            align: 'center',
	            crossAlign: 'near',
	            showLabelBackdrop: false,
	            backdropColor: 'rgba(255, 255, 255, 0.75)',
	            backdropPadding: 2
	        }
	    });
	    defaults.route('scale.ticks', 'color', '', 'color');
	    defaults.route('scale.grid', 'color', '', 'borderColor');
	    defaults.route('scale.border', 'color', '', 'borderColor');
	    defaults.route('scale.title', 'color', '', 'color');
	    defaults.describe('scale', {
	        _fallback: false,
	        _scriptable: (name)=>!name.startsWith('before') && !name.startsWith('after') && name !== 'callback' && name !== 'parser',
	        _indexable: (name)=>name !== 'borderDash' && name !== 'tickBorderDash' && name !== 'dash'
	    });
	    defaults.describe('scales', {
	        _fallback: 'scale'
	    });
	    defaults.describe('scale.ticks', {
	        _scriptable: (name)=>name !== 'backdropPadding' && name !== 'callback',
	        _indexable: (name)=>name !== 'backdropPadding'
	    });
	}

	const overrides = Object.create(null);
	const descriptors = Object.create(null);
	 function getScope$1(node, key) {
	    if (!key) {
	        return node;
	    }
	    const keys = key.split('.');
	    for(let i = 0, n = keys.length; i < n; ++i){
	        const k = keys[i];
	        node = node[k] || (node[k] = Object.create(null));
	    }
	    return node;
	}
	function set(root, scope, values) {
	    if (typeof scope === 'string') {
	        return merge(getScope$1(root, scope), values);
	    }
	    return merge(getScope$1(root, ''), scope);
	}
	 class Defaults {
	    constructor(_descriptors, _appliers){
	        this.animation = undefined;
	        this.backgroundColor = 'rgba(0,0,0,0.1)';
	        this.borderColor = 'rgba(0,0,0,0.1)';
	        this.color = '#666';
	        this.datasets = {};
	        this.devicePixelRatio = (context)=>context.chart.platform.getDevicePixelRatio();
	        this.elements = {};
	        this.events = [
	            'mousemove',
	            'mouseout',
	            'click',
	            'touchstart',
	            'touchmove'
	        ];
	        this.font = {
	            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
	            size: 12,
	            style: 'normal',
	            lineHeight: 1.2,
	            weight: null
	        };
	        this.hover = {};
	        this.hoverBackgroundColor = (ctx, options)=>getHoverColor(options.backgroundColor);
	        this.hoverBorderColor = (ctx, options)=>getHoverColor(options.borderColor);
	        this.hoverColor = (ctx, options)=>getHoverColor(options.color);
	        this.indexAxis = 'x';
	        this.interaction = {
	            mode: 'nearest',
	            intersect: true,
	            includeInvisible: false
	        };
	        this.maintainAspectRatio = true;
	        this.onHover = null;
	        this.onClick = null;
	        this.parsing = true;
	        this.plugins = {};
	        this.responsive = true;
	        this.scale = undefined;
	        this.scales = {};
	        this.showLine = true;
	        this.drawActiveElementsOnTop = true;
	        this.describe(_descriptors);
	        this.apply(_appliers);
	    }
	 set(scope, values) {
	        return set(this, scope, values);
	    }
	 get(scope) {
	        return getScope$1(this, scope);
	    }
	 describe(scope, values) {
	        return set(descriptors, scope, values);
	    }
	    override(scope, values) {
	        return set(overrides, scope, values);
	    }
	 route(scope, name, targetScope, targetName) {
	        const scopeObject = getScope$1(this, scope);
	        const targetScopeObject = getScope$1(this, targetScope);
	        const privateName = '_' + name;
	        Object.defineProperties(scopeObject, {
	            [privateName]: {
	                value: scopeObject[name],
	                writable: true
	            },
	            [name]: {
	                enumerable: true,
	                get () {
	                    const local = this[privateName];
	                    const target = targetScopeObject[targetName];
	                    if (isObject(local)) {
	                        return Object.assign({}, target, local);
	                    }
	                    return valueOrDefault(local, target);
	                },
	                set (value) {
	                    this[privateName] = value;
	                }
	            }
	        });
	    }
	    apply(appliers) {
	        appliers.forEach((apply)=>apply(this));
	    }
	}
	var defaults = /* #__PURE__ */ new Defaults({
	    _scriptable: (name)=>!name.startsWith('on'),
	    _indexable: (name)=>name !== 'events',
	    hover: {
	        _fallback: 'interaction'
	    },
	    interaction: {
	        _scriptable: false,
	        _indexable: false
	    }
	}, [
	    applyAnimationsDefaults,
	    applyLayoutsDefaults,
	    applyScaleDefaults
	]);

	/**
	 * Converts the given font object into a CSS font string.
	 * @param font - A font object.
	 * @return The CSS font string. See https://developer.mozilla.org/en-US/docs/Web/CSS/font
	 * @private
	 */ function toFontString(font) {
	    if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
	        return null;
	    }
	    return (font.style ? font.style + ' ' : '') + (font.weight ? font.weight + ' ' : '') + font.size + 'px ' + font.family;
	}
	/**
	 * @private
	 */ function _measureText(ctx, data, gc, longest, string) {
	    let textWidth = data[string];
	    if (!textWidth) {
	        textWidth = data[string] = ctx.measureText(string).width;
	        gc.push(string);
	    }
	    if (textWidth > longest) {
	        longest = textWidth;
	    }
	    return longest;
	}
	/**
	 * @private
	 */ // eslint-disable-next-line complexity
	function _longestText(ctx, font, arrayOfThings, cache) {
	    cache = cache || {};
	    let data = cache.data = cache.data || {};
	    let gc = cache.garbageCollect = cache.garbageCollect || [];
	    if (cache.font !== font) {
	        data = cache.data = {};
	        gc = cache.garbageCollect = [];
	        cache.font = font;
	    }
	    ctx.save();
	    ctx.font = font;
	    let longest = 0;
	    const ilen = arrayOfThings.length;
	    let i, j, jlen, thing, nestedThing;
	    for(i = 0; i < ilen; i++){
	        thing = arrayOfThings[i];
	        // Undefined strings and arrays should not be measured
	        if (thing !== undefined && thing !== null && !isArray(thing)) {
	            longest = _measureText(ctx, data, gc, longest, thing);
	        } else if (isArray(thing)) {
	            // if it is an array lets measure each element
	            // to do maybe simplify this function a bit so we can do this more recursively?
	            for(j = 0, jlen = thing.length; j < jlen; j++){
	                nestedThing = thing[j];
	                // Undefined strings and arrays should not be measured
	                if (nestedThing !== undefined && nestedThing !== null && !isArray(nestedThing)) {
	                    longest = _measureText(ctx, data, gc, longest, nestedThing);
	                }
	            }
	        }
	    }
	    ctx.restore();
	    const gcLen = gc.length / 2;
	    if (gcLen > arrayOfThings.length) {
	        for(i = 0; i < gcLen; i++){
	            delete data[gc[i]];
	        }
	        gc.splice(0, gcLen);
	    }
	    return longest;
	}
	/**
	 * Returns the aligned pixel value to avoid anti-aliasing blur
	 * @param chart - The chart instance.
	 * @param pixel - A pixel value.
	 * @param width - The width of the element.
	 * @returns The aligned pixel value.
	 * @private
	 */ function _alignPixel(chart, pixel, width) {
	    const devicePixelRatio = chart.currentDevicePixelRatio;
	    const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
	    return Math.round((pixel - halfWidth) * devicePixelRatio) / devicePixelRatio + halfWidth;
	}
	/**
	 * Clears the entire canvas.
	 */ function clearCanvas(canvas, ctx) {
	    ctx = ctx || canvas.getContext('2d');
	    ctx.save();
	    // canvas.width and canvas.height do not consider the canvas transform,
	    // while clearRect does
	    ctx.resetTransform();
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    ctx.restore();
	}
	function drawPoint(ctx, options, x, y) {
	    // eslint-disable-next-line @typescript-eslint/no-use-before-define
	    drawPointLegend(ctx, options, x, y, null);
	}
	// eslint-disable-next-line complexity
	function drawPointLegend(ctx, options, x, y, w) {
	    let type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
	    const style = options.pointStyle;
	    const rotation = options.rotation;
	    const radius = options.radius;
	    let rad = (rotation || 0) * RAD_PER_DEG;
	    if (style && typeof style === 'object') {
	        type = style.toString();
	        if (type === '[object HTMLImageElement]' || type === '[object HTMLCanvasElement]') {
	            ctx.save();
	            ctx.translate(x, y);
	            ctx.rotate(rad);
	            ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
	            ctx.restore();
	            return;
	        }
	    }
	    if (isNaN(radius) || radius <= 0) {
	        return;
	    }
	    ctx.beginPath();
	    switch(style){
	        // Default includes circle
	        default:
	            if (w) {
	                ctx.ellipse(x, y, w / 2, radius, 0, 0, TAU);
	            } else {
	                ctx.arc(x, y, radius, 0, TAU);
	            }
	            ctx.closePath();
	            break;
	        case 'triangle':
	            width = w ? w / 2 : radius;
	            ctx.moveTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
	            rad += TWO_THIRDS_PI;
	            ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
	            rad += TWO_THIRDS_PI;
	            ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
	            ctx.closePath();
	            break;
	        case 'rectRounded':
	            // NOTE: the rounded rect implementation changed to use `arc` instead of
	            // `quadraticCurveTo` since it generates better results when rect is
	            // almost a circle. 0.516 (instead of 0.5) produces results with visually
	            // closer proportion to the previous impl and it is inscribed in the
	            // circle with `radius`. For more details, see the following PRs:
	            // https://github.com/chartjs/Chart.js/issues/5597
	            // https://github.com/chartjs/Chart.js/issues/5858
	            cornerRadius = radius * 0.516;
	            size = radius - cornerRadius;
	            xOffset = Math.cos(rad + QUARTER_PI) * size;
	            xOffsetW = Math.cos(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
	            yOffset = Math.sin(rad + QUARTER_PI) * size;
	            yOffsetW = Math.sin(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
	            ctx.arc(x - xOffsetW, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
	            ctx.arc(x + yOffsetW, y - xOffset, cornerRadius, rad - HALF_PI, rad);
	            ctx.arc(x + xOffsetW, y + yOffset, cornerRadius, rad, rad + HALF_PI);
	            ctx.arc(x - yOffsetW, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
	            ctx.closePath();
	            break;
	        case 'rect':
	            if (!rotation) {
	                size = Math.SQRT1_2 * radius;
	                width = w ? w / 2 : size;
	                ctx.rect(x - width, y - size, 2 * width, 2 * size);
	                break;
	            }
	            rad += QUARTER_PI;
	        /* falls through */ case 'rectRot':
	            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
	            xOffset = Math.cos(rad) * radius;
	            yOffset = Math.sin(rad) * radius;
	            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
	            ctx.moveTo(x - xOffsetW, y - yOffset);
	            ctx.lineTo(x + yOffsetW, y - xOffset);
	            ctx.lineTo(x + xOffsetW, y + yOffset);
	            ctx.lineTo(x - yOffsetW, y + xOffset);
	            ctx.closePath();
	            break;
	        case 'crossRot':
	            rad += QUARTER_PI;
	        /* falls through */ case 'cross':
	            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
	            xOffset = Math.cos(rad) * radius;
	            yOffset = Math.sin(rad) * radius;
	            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
	            ctx.moveTo(x - xOffsetW, y - yOffset);
	            ctx.lineTo(x + xOffsetW, y + yOffset);
	            ctx.moveTo(x + yOffsetW, y - xOffset);
	            ctx.lineTo(x - yOffsetW, y + xOffset);
	            break;
	        case 'star':
	            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
	            xOffset = Math.cos(rad) * radius;
	            yOffset = Math.sin(rad) * radius;
	            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
	            ctx.moveTo(x - xOffsetW, y - yOffset);
	            ctx.lineTo(x + xOffsetW, y + yOffset);
	            ctx.moveTo(x + yOffsetW, y - xOffset);
	            ctx.lineTo(x - yOffsetW, y + xOffset);
	            rad += QUARTER_PI;
	            xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
	            xOffset = Math.cos(rad) * radius;
	            yOffset = Math.sin(rad) * radius;
	            yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
	            ctx.moveTo(x - xOffsetW, y - yOffset);
	            ctx.lineTo(x + xOffsetW, y + yOffset);
	            ctx.moveTo(x + yOffsetW, y - xOffset);
	            ctx.lineTo(x - yOffsetW, y + xOffset);
	            break;
	        case 'line':
	            xOffset = w ? w / 2 : Math.cos(rad) * radius;
	            yOffset = Math.sin(rad) * radius;
	            ctx.moveTo(x - xOffset, y - yOffset);
	            ctx.lineTo(x + xOffset, y + yOffset);
	            break;
	        case 'dash':
	            ctx.moveTo(x, y);
	            ctx.lineTo(x + Math.cos(rad) * (w ? w / 2 : radius), y + Math.sin(rad) * radius);
	            break;
	        case false:
	            ctx.closePath();
	            break;
	    }
	    ctx.fill();
	    if (options.borderWidth > 0) {
	        ctx.stroke();
	    }
	}
	/**
	 * Returns true if the point is inside the rectangle
	 * @param point - The point to test
	 * @param area - The rectangle
	 * @param margin - allowed margin
	 * @private
	 */ function _isPointInArea(point, area, margin) {
	    margin = margin || 0.5; // margin - default is to match rounded decimals
	    return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
	}
	function clipArea(ctx, area) {
	    ctx.save();
	    ctx.beginPath();
	    ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
	    ctx.clip();
	}
	function unclipArea(ctx) {
	    ctx.restore();
	}
	/**
	 * @private
	 */ function _steppedLineTo(ctx, previous, target, flip, mode) {
	    if (!previous) {
	        return ctx.lineTo(target.x, target.y);
	    }
	    if (mode === 'middle') {
	        const midpoint = (previous.x + target.x) / 2.0;
	        ctx.lineTo(midpoint, previous.y);
	        ctx.lineTo(midpoint, target.y);
	    } else if (mode === 'after' !== !!flip) {
	        ctx.lineTo(previous.x, target.y);
	    } else {
	        ctx.lineTo(target.x, previous.y);
	    }
	    ctx.lineTo(target.x, target.y);
	}
	/**
	 * @private
	 */ function _bezierCurveTo(ctx, previous, target, flip) {
	    if (!previous) {
	        return ctx.lineTo(target.x, target.y);
	    }
	    ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
	}
	function setRenderOpts(ctx, opts) {
	    if (opts.translation) {
	        ctx.translate(opts.translation[0], opts.translation[1]);
	    }
	    if (!isNullOrUndef(opts.rotation)) {
	        ctx.rotate(opts.rotation);
	    }
	    if (opts.color) {
	        ctx.fillStyle = opts.color;
	    }
	    if (opts.textAlign) {
	        ctx.textAlign = opts.textAlign;
	    }
	    if (opts.textBaseline) {
	        ctx.textBaseline = opts.textBaseline;
	    }
	}
	function decorateText(ctx, x, y, line, opts) {
	    if (opts.strikethrough || opts.underline) {
	        /**
	     * Now that IE11 support has been dropped, we can use more
	     * of the TextMetrics object. The actual bounding boxes
	     * are unflagged in Chrome, Firefox, Edge, and Safari so they
	     * can be safely used.
	     * See https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#Browser_compatibility
	     */ const metrics = ctx.measureText(line);
	        const left = x - metrics.actualBoundingBoxLeft;
	        const right = x + metrics.actualBoundingBoxRight;
	        const top = y - metrics.actualBoundingBoxAscent;
	        const bottom = y + metrics.actualBoundingBoxDescent;
	        const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
	        ctx.strokeStyle = ctx.fillStyle;
	        ctx.beginPath();
	        ctx.lineWidth = opts.decorationWidth || 2;
	        ctx.moveTo(left, yDecoration);
	        ctx.lineTo(right, yDecoration);
	        ctx.stroke();
	    }
	}
	function drawBackdrop(ctx, opts) {
	    const oldColor = ctx.fillStyle;
	    ctx.fillStyle = opts.color;
	    ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
	    ctx.fillStyle = oldColor;
	}
	/**
	 * Render text onto the canvas
	 */ function renderText(ctx, text, x, y, font, opts = {}) {
	    const lines = isArray(text) ? text : [
	        text
	    ];
	    const stroke = opts.strokeWidth > 0 && opts.strokeColor !== '';
	    let i, line;
	    ctx.save();
	    ctx.font = font.string;
	    setRenderOpts(ctx, opts);
	    for(i = 0; i < lines.length; ++i){
	        line = lines[i];
	        if (opts.backdrop) {
	            drawBackdrop(ctx, opts.backdrop);
	        }
	        if (stroke) {
	            if (opts.strokeColor) {
	                ctx.strokeStyle = opts.strokeColor;
	            }
	            if (!isNullOrUndef(opts.strokeWidth)) {
	                ctx.lineWidth = opts.strokeWidth;
	            }
	            ctx.strokeText(line, x, y, opts.maxWidth);
	        }
	        ctx.fillText(line, x, y, opts.maxWidth);
	        decorateText(ctx, x, y, line, opts);
	        y += Number(font.lineHeight);
	    }
	    ctx.restore();
	}
	/**
	 * Add a path of a rectangle with rounded corners to the current sub-path
	 * @param ctx - Context
	 * @param rect - Bounding rect
	 */ function addRoundedRectPath(ctx, rect) {
	    const { x , y , w , h , radius  } = rect;
	    // top left arc
	    ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, 1.5 * PI, PI, true);
	    // line from top left to bottom left
	    ctx.lineTo(x, y + h - radius.bottomLeft);
	    // bottom left arc
	    ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
	    // line from bottom left to bottom right
	    ctx.lineTo(x + w - radius.bottomRight, y + h);
	    // bottom right arc
	    ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
	    // line from bottom right to top right
	    ctx.lineTo(x + w, y + radius.topRight);
	    // top right arc
	    ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);
	    // line from top right to top left
	    ctx.lineTo(x + radius.topLeft, y);
	}

	const LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
	const FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
	/**
	 * @alias Chart.helpers.options
	 * @namespace
	 */ /**
	 * Converts the given line height `value` in pixels for a specific font `size`.
	 * @param value - The lineHeight to parse (eg. 1.6, '14px', '75%', '1.6em').
	 * @param size - The font size (in pixels) used to resolve relative `value`.
	 * @returns The effective line height in pixels (size * 1.2 if value is invalid).
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
	 * @since 2.7.0
	 */ function toLineHeight(value, size) {
	    const matches = ('' + value).match(LINE_HEIGHT);
	    if (!matches || matches[1] === 'normal') {
	        return size * 1.2;
	    }
	    value = +matches[2];
	    switch(matches[3]){
	        case 'px':
	            return value;
	        case '%':
	            value /= 100;
	            break;
	    }
	    return size * value;
	}
	const numberOrZero = (v)=>+v || 0;
	function _readValueToProps(value, props) {
	    const ret = {};
	    const objProps = isObject(props);
	    const keys = objProps ? Object.keys(props) : props;
	    const read = isObject(value) ? objProps ? (prop)=>valueOrDefault(value[prop], value[props[prop]]) : (prop)=>value[prop] : ()=>value;
	    for (const prop of keys){
	        ret[prop] = numberOrZero(read(prop));
	    }
	    return ret;
	}
	/**
	 * Converts the given value into a TRBL object.
	 * @param value - If a number, set the value to all TRBL component,
	 *  else, if an object, use defined properties and sets undefined ones to 0.
	 *  x / y are shorthands for same value for left/right and top/bottom.
	 * @returns The padding values (top, right, bottom, left)
	 * @since 3.0.0
	 */ function toTRBL(value) {
	    return _readValueToProps(value, {
	        top: 'y',
	        right: 'x',
	        bottom: 'y',
	        left: 'x'
	    });
	}
	/**
	 * Converts the given value into a TRBL corners object (similar with css border-radius).
	 * @param value - If a number, set the value to all TRBL corner components,
	 *  else, if an object, use defined properties and sets undefined ones to 0.
	 * @returns The TRBL corner values (topLeft, topRight, bottomLeft, bottomRight)
	 * @since 3.0.0
	 */ function toTRBLCorners(value) {
	    return _readValueToProps(value, [
	        'topLeft',
	        'topRight',
	        'bottomLeft',
	        'bottomRight'
	    ]);
	}
	/**
	 * Converts the given value into a padding object with pre-computed width/height.
	 * @param value - If a number, set the value to all TRBL component,
	 *  else, if an object, use defined properties and sets undefined ones to 0.
	 *  x / y are shorthands for same value for left/right and top/bottom.
	 * @returns The padding values (top, right, bottom, left, width, height)
	 * @since 2.7.0
	 */ function toPadding(value) {
	    const obj = toTRBL(value);
	    obj.width = obj.left + obj.right;
	    obj.height = obj.top + obj.bottom;
	    return obj;
	}
	/**
	 * Parses font options and returns the font object.
	 * @param options - A object that contains font options to be parsed.
	 * @param fallback - A object that contains fallback font options.
	 * @return The font object.
	 * @private
	 */ function toFont(options, fallback) {
	    options = options || {};
	    fallback = fallback || defaults.font;
	    let size = valueOrDefault(options.size, fallback.size);
	    if (typeof size === 'string') {
	        size = parseInt(size, 10);
	    }
	    let style = valueOrDefault(options.style, fallback.style);
	    if (style && !('' + style).match(FONT_STYLE)) {
	        console.warn('Invalid font style specified: "' + style + '"');
	        style = undefined;
	    }
	    const font = {
	        family: valueOrDefault(options.family, fallback.family),
	        lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
	        size,
	        style,
	        weight: valueOrDefault(options.weight, fallback.weight),
	        string: ''
	    };
	    font.string = toFontString(font);
	    return font;
	}
	/**
	 * Evaluates the given `inputs` sequentially and returns the first defined value.
	 * @param inputs - An array of values, falling back to the last value.
	 * @param context - If defined and the current value is a function, the value
	 * is called with `context` as first argument and the result becomes the new input.
	 * @param index - If defined and the current value is an array, the value
	 * at `index` become the new input.
	 * @param info - object to return information about resolution in
	 * @param info.cacheable - Will be set to `false` if option is not cacheable.
	 * @since 2.7.0
	 */ function resolve(inputs, context, index, info) {
	    let cacheable = true;
	    let i, ilen, value;
	    for(i = 0, ilen = inputs.length; i < ilen; ++i){
	        value = inputs[i];
	        if (value === undefined) {
	            continue;
	        }
	        if (context !== undefined && typeof value === 'function') {
	            value = value(context);
	            cacheable = false;
	        }
	        if (index !== undefined && isArray(value)) {
	            value = value[index % value.length];
	            cacheable = false;
	        }
	        if (value !== undefined) {
	            if (info && !cacheable) {
	                info.cacheable = false;
	            }
	            return value;
	        }
	    }
	}
	/**
	 * @param minmax
	 * @param grace
	 * @param beginAtZero
	 * @private
	 */ function _addGrace(minmax, grace, beginAtZero) {
	    const { min , max  } = minmax;
	    const change = toDimension(grace, (max - min) / 2);
	    const keepZero = (value, add)=>beginAtZero && value === 0 ? 0 : value + add;
	    return {
	        min: keepZero(min, -Math.abs(change)),
	        max: keepZero(max, change)
	    };
	}
	function createContext(parentContext, context) {
	    return Object.assign(Object.create(parentContext), context);
	}

	/**
	 * Creates a Proxy for resolving raw values for options.
	 * @param scopes - The option scopes to look for values, in resolution order
	 * @param prefixes - The prefixes for values, in resolution order.
	 * @param rootScopes - The root option scopes
	 * @param fallback - Parent scopes fallback
	 * @param getTarget - callback for getting the target for changed values
	 * @returns Proxy
	 * @private
	 */ function _createResolver(scopes, prefixes = [
	    ''
	], rootScopes, fallback, getTarget = ()=>scopes[0]) {
	    const finalRootScopes = rootScopes || scopes;
	    if (typeof fallback === 'undefined') {
	        fallback = _resolve('_fallback', scopes);
	    }
	    const cache = {
	        [Symbol.toStringTag]: 'Object',
	        _cacheable: true,
	        _scopes: scopes,
	        _rootScopes: finalRootScopes,
	        _fallback: fallback,
	        _getTarget: getTarget,
	        override: (scope)=>_createResolver([
	                scope,
	                ...scopes
	            ], prefixes, finalRootScopes, fallback)
	    };
	    return new Proxy(cache, {
	        /**
	     * A trap for the delete operator.
	     */ deleteProperty (target, prop) {
	            delete target[prop]; // remove from cache
	            delete target._keys; // remove cached keys
	            delete scopes[0][prop]; // remove from top level scope
	            return true;
	        },
	        /**
	     * A trap for getting property values.
	     */ get (target, prop) {
	            return _cached(target, prop, ()=>_resolveWithPrefixes(prop, prefixes, scopes, target));
	        },
	        /**
	     * A trap for Object.getOwnPropertyDescriptor.
	     * Also used by Object.hasOwnProperty.
	     */ getOwnPropertyDescriptor (target, prop) {
	            return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
	        },
	        /**
	     * A trap for Object.getPrototypeOf.
	     */ getPrototypeOf () {
	            return Reflect.getPrototypeOf(scopes[0]);
	        },
	        /**
	     * A trap for the in operator.
	     */ has (target, prop) {
	            return getKeysFromAllScopes(target).includes(prop);
	        },
	        /**
	     * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
	     */ ownKeys (target) {
	            return getKeysFromAllScopes(target);
	        },
	        /**
	     * A trap for setting property values.
	     */ set (target, prop, value) {
	            const storage = target._storage || (target._storage = getTarget());
	            target[prop] = storage[prop] = value; // set to top level scope + cache
	            delete target._keys; // remove cached keys
	            return true;
	        }
	    });
	}
	/**
	 * Returns an Proxy for resolving option values with context.
	 * @param proxy - The Proxy returned by `_createResolver`
	 * @param context - Context object for scriptable/indexable options
	 * @param subProxy - The proxy provided for scriptable options
	 * @param descriptorDefaults - Defaults for descriptors
	 * @private
	 */ function _attachContext(proxy, context, subProxy, descriptorDefaults) {
	    const cache = {
	        _cacheable: false,
	        _proxy: proxy,
	        _context: context,
	        _subProxy: subProxy,
	        _stack: new Set(),
	        _descriptors: _descriptors(proxy, descriptorDefaults),
	        setContext: (ctx)=>_attachContext(proxy, ctx, subProxy, descriptorDefaults),
	        override: (scope)=>_attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
	    };
	    return new Proxy(cache, {
	        /**
	     * A trap for the delete operator.
	     */ deleteProperty (target, prop) {
	            delete target[prop]; // remove from cache
	            delete proxy[prop]; // remove from proxy
	            return true;
	        },
	        /**
	     * A trap for getting property values.
	     */ get (target, prop, receiver) {
	            return _cached(target, prop, ()=>_resolveWithContext(target, prop, receiver));
	        },
	        /**
	     * A trap for Object.getOwnPropertyDescriptor.
	     * Also used by Object.hasOwnProperty.
	     */ getOwnPropertyDescriptor (target, prop) {
	            return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? {
	                enumerable: true,
	                configurable: true
	            } : undefined : Reflect.getOwnPropertyDescriptor(proxy, prop);
	        },
	        /**
	     * A trap for Object.getPrototypeOf.
	     */ getPrototypeOf () {
	            return Reflect.getPrototypeOf(proxy);
	        },
	        /**
	     * A trap for the in operator.
	     */ has (target, prop) {
	            return Reflect.has(proxy, prop);
	        },
	        /**
	     * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
	     */ ownKeys () {
	            return Reflect.ownKeys(proxy);
	        },
	        /**
	     * A trap for setting property values.
	     */ set (target, prop, value) {
	            proxy[prop] = value; // set to proxy
	            delete target[prop]; // remove from cache
	            return true;
	        }
	    });
	}
	/**
	 * @private
	 */ function _descriptors(proxy, defaults = {
	    scriptable: true,
	    indexable: true
	}) {
	    const { _scriptable =defaults.scriptable , _indexable =defaults.indexable , _allKeys =defaults.allKeys  } = proxy;
	    return {
	        allKeys: _allKeys,
	        scriptable: _scriptable,
	        indexable: _indexable,
	        isScriptable: isFunction(_scriptable) ? _scriptable : ()=>_scriptable,
	        isIndexable: isFunction(_indexable) ? _indexable : ()=>_indexable
	    };
	}
	const readKey = (prefix, name)=>prefix ? prefix + _capitalize(name) : name;
	const needsSubResolver = (prop, value)=>isObject(value) && prop !== 'adapters' && (Object.getPrototypeOf(value) === null || value.constructor === Object);
	function _cached(target, prop, resolve) {
	    if (Object.prototype.hasOwnProperty.call(target, prop)) {
	        return target[prop];
	    }
	    const value = resolve();
	    // cache the resolved value
	    target[prop] = value;
	    return value;
	}
	function _resolveWithContext(target, prop, receiver) {
	    const { _proxy , _context , _subProxy , _descriptors: descriptors  } = target;
	    let value = _proxy[prop]; // resolve from proxy
	    // resolve with context
	    if (isFunction(value) && descriptors.isScriptable(prop)) {
	        value = _resolveScriptable(prop, value, target, receiver);
	    }
	    if (isArray(value) && value.length) {
	        value = _resolveArray(prop, value, target, descriptors.isIndexable);
	    }
	    if (needsSubResolver(prop, value)) {
	        // if the resolved value is an object, create a sub resolver for it
	        value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors);
	    }
	    return value;
	}
	function _resolveScriptable(prop, getValue, target, receiver) {
	    const { _proxy , _context , _subProxy , _stack  } = target;
	    if (_stack.has(prop)) {
	        throw new Error('Recursion detected: ' + Array.from(_stack).join('->') + '->' + prop);
	    }
	    _stack.add(prop);
	    let value = getValue(_context, _subProxy || receiver);
	    _stack.delete(prop);
	    if (needsSubResolver(prop, value)) {
	        // When scriptable option returns an object, create a resolver on that.
	        value = createSubResolver(_proxy._scopes, _proxy, prop, value);
	    }
	    return value;
	}
	function _resolveArray(prop, value, target, isIndexable) {
	    const { _proxy , _context , _subProxy , _descriptors: descriptors  } = target;
	    if (typeof _context.index !== 'undefined' && isIndexable(prop)) {
	        return value[_context.index % value.length];
	    } else if (isObject(value[0])) {
	        // Array of objects, return array or resolvers
	        const arr = value;
	        const scopes = _proxy._scopes.filter((s)=>s !== arr);
	        value = [];
	        for (const item of arr){
	            const resolver = createSubResolver(scopes, _proxy, prop, item);
	            value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors));
	        }
	    }
	    return value;
	}
	function resolveFallback(fallback, prop, value) {
	    return isFunction(fallback) ? fallback(prop, value) : fallback;
	}
	const getScope = (key, parent)=>key === true ? parent : typeof key === 'string' ? resolveObjectKey(parent, key) : undefined;
	function addScopes(set, parentScopes, key, parentFallback, value) {
	    for (const parent of parentScopes){
	        const scope = getScope(key, parent);
	        if (scope) {
	            set.add(scope);
	            const fallback = resolveFallback(scope._fallback, key, value);
	            if (typeof fallback !== 'undefined' && fallback !== key && fallback !== parentFallback) {
	                // When we reach the descriptor that defines a new _fallback, return that.
	                // The fallback will resume to that new scope.
	                return fallback;
	            }
	        } else if (scope === false && typeof parentFallback !== 'undefined' && key !== parentFallback) {
	            // Fallback to `false` results to `false`, when falling back to different key.
	            // For example `interaction` from `hover` or `plugins.tooltip` and `animation` from `animations`
	            return null;
	        }
	    }
	    return false;
	}
	function createSubResolver(parentScopes, resolver, prop, value) {
	    const rootScopes = resolver._rootScopes;
	    const fallback = resolveFallback(resolver._fallback, prop, value);
	    const allScopes = [
	        ...parentScopes,
	        ...rootScopes
	    ];
	    const set = new Set();
	    set.add(value);
	    let key = addScopesFromKey(set, allScopes, prop, fallback || prop, value);
	    if (key === null) {
	        return false;
	    }
	    if (typeof fallback !== 'undefined' && fallback !== prop) {
	        key = addScopesFromKey(set, allScopes, fallback, key, value);
	        if (key === null) {
	            return false;
	        }
	    }
	    return _createResolver(Array.from(set), [
	        ''
	    ], rootScopes, fallback, ()=>subGetTarget(resolver, prop, value));
	}
	function addScopesFromKey(set, allScopes, key, fallback, item) {
	    while(key){
	        key = addScopes(set, allScopes, key, fallback, item);
	    }
	    return key;
	}
	function subGetTarget(resolver, prop, value) {
	    const parent = resolver._getTarget();
	    if (!(prop in parent)) {
	        parent[prop] = {};
	    }
	    const target = parent[prop];
	    if (isArray(target) && isObject(value)) {
	        // For array of objects, the object is used to store updated values
	        return value;
	    }
	    return target || {};
	}
	function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
	    let value;
	    for (const prefix of prefixes){
	        value = _resolve(readKey(prefix, prop), scopes);
	        if (typeof value !== 'undefined') {
	            return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
	        }
	    }
	}
	function _resolve(key, scopes) {
	    for (const scope of scopes){
	        if (!scope) {
	            continue;
	        }
	        const value = scope[key];
	        if (typeof value !== 'undefined') {
	            return value;
	        }
	    }
	}
	function getKeysFromAllScopes(target) {
	    let keys = target._keys;
	    if (!keys) {
	        keys = target._keys = resolveKeysFromAllScopes(target._scopes);
	    }
	    return keys;
	}
	function resolveKeysFromAllScopes(scopes) {
	    const set = new Set();
	    for (const scope of scopes){
	        for (const key of Object.keys(scope).filter((k)=>!k.startsWith('_'))){
	            set.add(key);
	        }
	    }
	    return Array.from(set);
	}
	function _parseObjectDataRadialScale(meta, data, start, count) {
	    const { iScale  } = meta;
	    const { key ='r'  } = this._parsing;
	    const parsed = new Array(count);
	    let i, ilen, index, item;
	    for(i = 0, ilen = count; i < ilen; ++i){
	        index = i + start;
	        item = data[index];
	        parsed[i] = {
	            r: iScale.parse(resolveObjectKey(item, key), index)
	        };
	    }
	    return parsed;
	}

	const EPSILON = Number.EPSILON || 1e-14;
	const getPoint = (points, i)=>i < points.length && !points[i].skip && points[i];
	const getValueAxis = (indexAxis)=>indexAxis === 'x' ? 'y' : 'x';
	function splineCurve(firstPoint, middlePoint, afterPoint, t) {
	    // Props to Rob Spencer at scaled innovation for his post on splining between points
	    // http://scaledinnovation.com/analytics/splines/aboutSplines.html
	    // This function must also respect "skipped" points
	    const previous = firstPoint.skip ? middlePoint : firstPoint;
	    const current = middlePoint;
	    const next = afterPoint.skip ? middlePoint : afterPoint;
	    const d01 = distanceBetweenPoints(current, previous);
	    const d12 = distanceBetweenPoints(next, current);
	    let s01 = d01 / (d01 + d12);
	    let s12 = d12 / (d01 + d12);
	    // If all points are the same, s01 & s02 will be inf
	    s01 = isNaN(s01) ? 0 : s01;
	    s12 = isNaN(s12) ? 0 : s12;
	    const fa = t * s01; // scaling factor for triangle Ta
	    const fb = t * s12;
	    return {
	        previous: {
	            x: current.x - fa * (next.x - previous.x),
	            y: current.y - fa * (next.y - previous.y)
	        },
	        next: {
	            x: current.x + fb * (next.x - previous.x),
	            y: current.y + fb * (next.y - previous.y)
	        }
	    };
	}
	/**
	 * Adjust tangents to ensure monotonic properties
	 */ function monotoneAdjust(points, deltaK, mK) {
	    const pointsLen = points.length;
	    let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
	    let pointAfter = getPoint(points, 0);
	    for(let i = 0; i < pointsLen - 1; ++i){
	        pointCurrent = pointAfter;
	        pointAfter = getPoint(points, i + 1);
	        if (!pointCurrent || !pointAfter) {
	            continue;
	        }
	        if (almostEquals(deltaK[i], 0, EPSILON)) {
	            mK[i] = mK[i + 1] = 0;
	            continue;
	        }
	        alphaK = mK[i] / deltaK[i];
	        betaK = mK[i + 1] / deltaK[i];
	        squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
	        if (squaredMagnitude <= 9) {
	            continue;
	        }
	        tauK = 3 / Math.sqrt(squaredMagnitude);
	        mK[i] = alphaK * tauK * deltaK[i];
	        mK[i + 1] = betaK * tauK * deltaK[i];
	    }
	}
	function monotoneCompute(points, mK, indexAxis = 'x') {
	    const valueAxis = getValueAxis(indexAxis);
	    const pointsLen = points.length;
	    let delta, pointBefore, pointCurrent;
	    let pointAfter = getPoint(points, 0);
	    for(let i = 0; i < pointsLen; ++i){
	        pointBefore = pointCurrent;
	        pointCurrent = pointAfter;
	        pointAfter = getPoint(points, i + 1);
	        if (!pointCurrent) {
	            continue;
	        }
	        const iPixel = pointCurrent[indexAxis];
	        const vPixel = pointCurrent[valueAxis];
	        if (pointBefore) {
	            delta = (iPixel - pointBefore[indexAxis]) / 3;
	            pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
	            pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i];
	        }
	        if (pointAfter) {
	            delta = (pointAfter[indexAxis] - iPixel) / 3;
	            pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
	            pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i];
	        }
	    }
	}
	/**
	 * This function calculates Bézier control points in a similar way than |splineCurve|,
	 * but preserves monotonicity of the provided data and ensures no local extremums are added
	 * between the dataset discrete points due to the interpolation.
	 * See : https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
	 */ function splineCurveMonotone(points, indexAxis = 'x') {
	    const valueAxis = getValueAxis(indexAxis);
	    const pointsLen = points.length;
	    const deltaK = Array(pointsLen).fill(0);
	    const mK = Array(pointsLen);
	    // Calculate slopes (deltaK) and initialize tangents (mK)
	    let i, pointBefore, pointCurrent;
	    let pointAfter = getPoint(points, 0);
	    for(i = 0; i < pointsLen; ++i){
	        pointBefore = pointCurrent;
	        pointCurrent = pointAfter;
	        pointAfter = getPoint(points, i + 1);
	        if (!pointCurrent) {
	            continue;
	        }
	        if (pointAfter) {
	            const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
	            // In the case of two points that appear at the same x pixel, slopeDeltaX is 0
	            deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
	        }
	        mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : sign(deltaK[i - 1]) !== sign(deltaK[i]) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
	    }
	    monotoneAdjust(points, deltaK, mK);
	    monotoneCompute(points, mK, indexAxis);
	}
	function capControlPoint(pt, min, max) {
	    return Math.max(Math.min(pt, max), min);
	}
	function capBezierPoints(points, area) {
	    let i, ilen, point, inArea, inAreaPrev;
	    let inAreaNext = _isPointInArea(points[0], area);
	    for(i = 0, ilen = points.length; i < ilen; ++i){
	        inAreaPrev = inArea;
	        inArea = inAreaNext;
	        inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area);
	        if (!inArea) {
	            continue;
	        }
	        point = points[i];
	        if (inAreaPrev) {
	            point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
	            point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
	        }
	        if (inAreaNext) {
	            point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
	            point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
	        }
	    }
	}
	/**
	 * @private
	 */ function _updateBezierControlPoints(points, options, area, loop, indexAxis) {
	    let i, ilen, point, controlPoints;
	    // Only consider points that are drawn in case the spanGaps option is used
	    if (options.spanGaps) {
	        points = points.filter((pt)=>!pt.skip);
	    }
	    if (options.cubicInterpolationMode === 'monotone') {
	        splineCurveMonotone(points, indexAxis);
	    } else {
	        let prev = loop ? points[points.length - 1] : points[0];
	        for(i = 0, ilen = points.length; i < ilen; ++i){
	            point = points[i];
	            controlPoints = splineCurve(prev, point, points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen], options.tension);
	            point.cp1x = controlPoints.previous.x;
	            point.cp1y = controlPoints.previous.y;
	            point.cp2x = controlPoints.next.x;
	            point.cp2y = controlPoints.next.y;
	            prev = point;
	        }
	    }
	    if (options.capBezierPoints) {
	        capBezierPoints(points, area);
	    }
	}

	/**
	 * Note: typedefs are auto-exported, so use a made-up `dom` namespace where
	 * necessary to avoid duplicates with `export * from './helpers`; see
	 * https://github.com/microsoft/TypeScript/issues/46011
	 * @typedef { import('../core/core.controller.js').default } dom.Chart
	 * @typedef { import('../../types').ChartEvent } ChartEvent
	 */ /**
	 * @private
	 */ function _isDomSupported() {
	    return typeof window !== 'undefined' && typeof document !== 'undefined';
	}
	/**
	 * @private
	 */ function _getParentNode(domNode) {
	    let parent = domNode.parentNode;
	    if (parent && parent.toString() === '[object ShadowRoot]') {
	        parent = parent.host;
	    }
	    return parent;
	}
	/**
	 * convert max-width/max-height values that may be percentages into a number
	 * @private
	 */ function parseMaxStyle(styleValue, node, parentProperty) {
	    let valueInPixels;
	    if (typeof styleValue === 'string') {
	        valueInPixels = parseInt(styleValue, 10);
	        if (styleValue.indexOf('%') !== -1) {
	            // percentage * size in dimension
	            valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
	        }
	    } else {
	        valueInPixels = styleValue;
	    }
	    return valueInPixels;
	}
	const getComputedStyle = (element)=>element.ownerDocument.defaultView.getComputedStyle(element, null);
	function getStyle(el, property) {
	    return getComputedStyle(el).getPropertyValue(property);
	}
	const positions = [
	    'top',
	    'right',
	    'bottom',
	    'left'
	];
	function getPositionedStyle(styles, style, suffix) {
	    const result = {};
	    suffix = suffix ? '-' + suffix : '';
	    for(let i = 0; i < 4; i++){
	        const pos = positions[i];
	        result[pos] = parseFloat(styles[style + '-' + pos + suffix]) || 0;
	    }
	    result.width = result.left + result.right;
	    result.height = result.top + result.bottom;
	    return result;
	}
	const useOffsetPos = (x, y, target)=>(x > 0 || y > 0) && (!target || !target.shadowRoot);
	/**
	 * @param e
	 * @param canvas
	 * @returns Canvas position
	 */ function getCanvasPosition(e, canvas) {
	    const touches = e.touches;
	    const source = touches && touches.length ? touches[0] : e;
	    const { offsetX , offsetY  } = source;
	    let box = false;
	    let x, y;
	    if (useOffsetPos(offsetX, offsetY, e.target)) {
	        x = offsetX;
	        y = offsetY;
	    } else {
	        const rect = canvas.getBoundingClientRect();
	        x = source.clientX - rect.left;
	        y = source.clientY - rect.top;
	        box = true;
	    }
	    return {
	        x,
	        y,
	        box
	    };
	}
	/**
	 * Gets an event's x, y coordinates, relative to the chart area
	 * @param event
	 * @param chart
	 * @returns x and y coordinates of the event
	 */ function getRelativePosition(event, chart) {
	    if ('native' in event) {
	        return event;
	    }
	    const { canvas , currentDevicePixelRatio  } = chart;
	    const style = getComputedStyle(canvas);
	    const borderBox = style.boxSizing === 'border-box';
	    const paddings = getPositionedStyle(style, 'padding');
	    const borders = getPositionedStyle(style, 'border', 'width');
	    const { x , y , box  } = getCanvasPosition(event, canvas);
	    const xOffset = paddings.left + (box && borders.left);
	    const yOffset = paddings.top + (box && borders.top);
	    let { width , height  } = chart;
	    if (borderBox) {
	        width -= paddings.width + borders.width;
	        height -= paddings.height + borders.height;
	    }
	    return {
	        x: Math.round((x - xOffset) / width * canvas.width / currentDevicePixelRatio),
	        y: Math.round((y - yOffset) / height * canvas.height / currentDevicePixelRatio)
	    };
	}
	function getContainerSize(canvas, width, height) {
	    let maxWidth, maxHeight;
	    if (width === undefined || height === undefined) {
	        const container = _getParentNode(canvas);
	        if (!container) {
	            width = canvas.clientWidth;
	            height = canvas.clientHeight;
	        } else {
	            const rect = container.getBoundingClientRect(); // this is the border box of the container
	            const containerStyle = getComputedStyle(container);
	            const containerBorder = getPositionedStyle(containerStyle, 'border', 'width');
	            const containerPadding = getPositionedStyle(containerStyle, 'padding');
	            width = rect.width - containerPadding.width - containerBorder.width;
	            height = rect.height - containerPadding.height - containerBorder.height;
	            maxWidth = parseMaxStyle(containerStyle.maxWidth, container, 'clientWidth');
	            maxHeight = parseMaxStyle(containerStyle.maxHeight, container, 'clientHeight');
	        }
	    }
	    return {
	        width,
	        height,
	        maxWidth: maxWidth || INFINITY,
	        maxHeight: maxHeight || INFINITY
	    };
	}
	const round1 = (v)=>Math.round(v * 10) / 10;
	// eslint-disable-next-line complexity
	function getMaximumSize(canvas, bbWidth, bbHeight, aspectRatio) {
	    const style = getComputedStyle(canvas);
	    const margins = getPositionedStyle(style, 'margin');
	    const maxWidth = parseMaxStyle(style.maxWidth, canvas, 'clientWidth') || INFINITY;
	    const maxHeight = parseMaxStyle(style.maxHeight, canvas, 'clientHeight') || INFINITY;
	    const containerSize = getContainerSize(canvas, bbWidth, bbHeight);
	    let { width , height  } = containerSize;
	    if (style.boxSizing === 'content-box') {
	        const borders = getPositionedStyle(style, 'border', 'width');
	        const paddings = getPositionedStyle(style, 'padding');
	        width -= paddings.width + borders.width;
	        height -= paddings.height + borders.height;
	    }
	    width = Math.max(0, width - margins.width);
	    height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
	    width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
	    height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
	    if (width && !height) {
	        // https://github.com/chartjs/Chart.js/issues/4659
	        // If the canvas has width, but no height, default to aspectRatio of 2 (canvas default)
	        height = round1(width / 2);
	    }
	    const maintainHeight = bbWidth !== undefined || bbHeight !== undefined;
	    if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
	        height = containerSize.height;
	        width = round1(Math.floor(height * aspectRatio));
	    }
	    return {
	        width,
	        height
	    };
	}
	/**
	 * @param chart
	 * @param forceRatio
	 * @param forceStyle
	 * @returns True if the canvas context size or transformation has changed.
	 */ function retinaScale(chart, forceRatio, forceStyle) {
	    const pixelRatio = forceRatio || 1;
	    const deviceHeight = Math.floor(chart.height * pixelRatio);
	    const deviceWidth = Math.floor(chart.width * pixelRatio);
	    chart.height = Math.floor(chart.height);
	    chart.width = Math.floor(chart.width);
	    const canvas = chart.canvas;
	    // If no style has been set on the canvas, the render size is used as display size,
	    // making the chart visually bigger, so let's enforce it to the "correct" values.
	    // See https://github.com/chartjs/Chart.js/issues/3575
	    if (canvas.style && (forceStyle || !canvas.style.height && !canvas.style.width)) {
	        canvas.style.height = `${chart.height}px`;
	        canvas.style.width = `${chart.width}px`;
	    }
	    if (chart.currentDevicePixelRatio !== pixelRatio || canvas.height !== deviceHeight || canvas.width !== deviceWidth) {
	        chart.currentDevicePixelRatio = pixelRatio;
	        canvas.height = deviceHeight;
	        canvas.width = deviceWidth;
	        chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
	        return true;
	    }
	    return false;
	}
	/**
	 * Detects support for options object argument in addEventListener.
	 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Safely_detecting_option_support
	 * @private
	 */ const supportsEventListenerOptions = function() {
	    let passiveSupported = false;
	    try {
	        const options = {
	            get passive () {
	                passiveSupported = true;
	                return false;
	            }
	        };
	        if (_isDomSupported()) {
	            window.addEventListener('test', null, options);
	            window.removeEventListener('test', null, options);
	        }
	    } catch (e) {
	    // continue regardless of error
	    }
	    return passiveSupported;
	}();
	/**
	 * The "used" size is the final value of a dimension property after all calculations have
	 * been performed. This method uses the computed style of `element` but returns undefined
	 * if the computed style is not expressed in pixels. That can happen in some cases where
	 * `element` has a size relative to its parent and this last one is not yet displayed,
	 * for example because of `display: none` on a parent node.
	 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/used_value
	 * @returns Size in pixels or undefined if unknown.
	 */ function readUsedSize(element, property) {
	    const value = getStyle(element, property);
	    const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
	    return matches ? +matches[1] : undefined;
	}

	/**
	 * @private
	 */ function _pointInLine(p1, p2, t, mode) {
	    return {
	        x: p1.x + t * (p2.x - p1.x),
	        y: p1.y + t * (p2.y - p1.y)
	    };
	}
	/**
	 * @private
	 */ function _steppedInterpolation(p1, p2, t, mode) {
	    return {
	        x: p1.x + t * (p2.x - p1.x),
	        y: mode === 'middle' ? t < 0.5 ? p1.y : p2.y : mode === 'after' ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y
	    };
	}
	/**
	 * @private
	 */ function _bezierInterpolation(p1, p2, t, mode) {
	    const cp1 = {
	        x: p1.cp2x,
	        y: p1.cp2y
	    };
	    const cp2 = {
	        x: p2.cp1x,
	        y: p2.cp1y
	    };
	    const a = _pointInLine(p1, cp1, t);
	    const b = _pointInLine(cp1, cp2, t);
	    const c = _pointInLine(cp2, p2, t);
	    const d = _pointInLine(a, b, t);
	    const e = _pointInLine(b, c, t);
	    return _pointInLine(d, e, t);
	}

	const getRightToLeftAdapter = function(rectX, width) {
	    return {
	        x (x) {
	            return rectX + rectX + width - x;
	        },
	        setWidth (w) {
	            width = w;
	        },
	        textAlign (align) {
	            if (align === 'center') {
	                return align;
	            }
	            return align === 'right' ? 'left' : 'right';
	        },
	        xPlus (x, value) {
	            return x - value;
	        },
	        leftForLtr (x, itemWidth) {
	            return x - itemWidth;
	        }
	    };
	};
	const getLeftToRightAdapter = function() {
	    return {
	        x (x) {
	            return x;
	        },
	        setWidth (w) {},
	        textAlign (align) {
	            return align;
	        },
	        xPlus (x, value) {
	            return x + value;
	        },
	        leftForLtr (x, _itemWidth) {
	            return x;
	        }
	    };
	};
	function getRtlAdapter(rtl, rectX, width) {
	    return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
	}
	function overrideTextDirection(ctx, direction) {
	    let style, original;
	    if (direction === 'ltr' || direction === 'rtl') {
	        style = ctx.canvas.style;
	        original = [
	            style.getPropertyValue('direction'),
	            style.getPropertyPriority('direction')
	        ];
	        style.setProperty('direction', direction, 'important');
	        ctx.prevTextDirection = original;
	    }
	}
	function restoreTextDirection(ctx, original) {
	    if (original !== undefined) {
	        delete ctx.prevTextDirection;
	        ctx.canvas.style.setProperty('direction', original[0], original[1]);
	    }
	}

	function propertyFn(property) {
	    if (property === 'angle') {
	        return {
	            between: _angleBetween,
	            compare: _angleDiff,
	            normalize: _normalizeAngle
	        };
	    }
	    return {
	        between: _isBetween,
	        compare: (a, b)=>a - b,
	        normalize: (x)=>x
	    };
	}
	function normalizeSegment({ start , end , count , loop , style  }) {
	    return {
	        start: start % count,
	        end: end % count,
	        loop: loop && (end - start + 1) % count === 0,
	        style
	    };
	}
	function getSegment(segment, points, bounds) {
	    const { property , start: startBound , end: endBound  } = bounds;
	    const { between , normalize  } = propertyFn(property);
	    const count = points.length;
	    let { start , end , loop  } = segment;
	    let i, ilen;
	    if (loop) {
	        start += count;
	        end += count;
	        for(i = 0, ilen = count; i < ilen; ++i){
	            if (!between(normalize(points[start % count][property]), startBound, endBound)) {
	                break;
	            }
	            start--;
	            end--;
	        }
	        start %= count;
	        end %= count;
	    }
	    if (end < start) {
	        end += count;
	    }
	    return {
	        start,
	        end,
	        loop,
	        style: segment.style
	    };
	}
	 function _boundSegment(segment, points, bounds) {
	    if (!bounds) {
	        return [
	            segment
	        ];
	    }
	    const { property , start: startBound , end: endBound  } = bounds;
	    const count = points.length;
	    const { compare , between , normalize  } = propertyFn(property);
	    const { start , end , loop , style  } = getSegment(segment, points, bounds);
	    const result = [];
	    let inside = false;
	    let subStart = null;
	    let value, point, prevValue;
	    const startIsBefore = ()=>between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0;
	    const endIsBefore = ()=>compare(endBound, value) === 0 || between(endBound, prevValue, value);
	    const shouldStart = ()=>inside || startIsBefore();
	    const shouldStop = ()=>!inside || endIsBefore();
	    for(let i = start, prev = start; i <= end; ++i){
	        point = points[i % count];
	        if (point.skip) {
	            continue;
	        }
	        value = normalize(point[property]);
	        if (value === prevValue) {
	            continue;
	        }
	        inside = between(value, startBound, endBound);
	        if (subStart === null && shouldStart()) {
	            subStart = compare(value, startBound) === 0 ? i : prev;
	        }
	        if (subStart !== null && shouldStop()) {
	            result.push(normalizeSegment({
	                start: subStart,
	                end: i,
	                loop,
	                count,
	                style
	            }));
	            subStart = null;
	        }
	        prev = i;
	        prevValue = value;
	    }
	    if (subStart !== null) {
	        result.push(normalizeSegment({
	            start: subStart,
	            end,
	            loop,
	            count,
	            style
	        }));
	    }
	    return result;
	}
	 function _boundSegments(line, bounds) {
	    const result = [];
	    const segments = line.segments;
	    for(let i = 0; i < segments.length; i++){
	        const sub = _boundSegment(segments[i], line.points, bounds);
	        if (sub.length) {
	            result.push(...sub);
	        }
	    }
	    return result;
	}
	 function findStartAndEnd(points, count, loop, spanGaps) {
	    let start = 0;
	    let end = count - 1;
	    if (loop && !spanGaps) {
	        while(start < count && !points[start].skip){
	            start++;
	        }
	    }
	    while(start < count && points[start].skip){
	        start++;
	    }
	    start %= count;
	    if (loop) {
	        end += start;
	    }
	    while(end > start && points[end % count].skip){
	        end--;
	    }
	    end %= count;
	    return {
	        start,
	        end
	    };
	}
	 function solidSegments(points, start, max, loop) {
	    const count = points.length;
	    const result = [];
	    let last = start;
	    let prev = points[start];
	    let end;
	    for(end = start + 1; end <= max; ++end){
	        const cur = points[end % count];
	        if (cur.skip || cur.stop) {
	            if (!prev.skip) {
	                loop = false;
	                result.push({
	                    start: start % count,
	                    end: (end - 1) % count,
	                    loop
	                });
	                start = last = cur.stop ? end : null;
	            }
	        } else {
	            last = end;
	            if (prev.skip) {
	                start = end;
	            }
	        }
	        prev = cur;
	    }
	    if (last !== null) {
	        result.push({
	            start: start % count,
	            end: last % count,
	            loop
	        });
	    }
	    return result;
	}
	 function _computeSegments(line, segmentOptions) {
	    const points = line.points;
	    const spanGaps = line.options.spanGaps;
	    const count = points.length;
	    if (!count) {
	        return [];
	    }
	    const loop = !!line._loop;
	    const { start , end  } = findStartAndEnd(points, count, loop, spanGaps);
	    if (spanGaps === true) {
	        return splitByStyles(line, [
	            {
	                start,
	                end,
	                loop
	            }
	        ], points, segmentOptions);
	    }
	    const max = end < start ? end + count : end;
	    const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
	    return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
	}
	 function splitByStyles(line, segments, points, segmentOptions) {
	    if (!segmentOptions || !segmentOptions.setContext || !points) {
	        return segments;
	    }
	    return doSplitByStyles(line, segments, points, segmentOptions);
	}
	 function doSplitByStyles(line, segments, points, segmentOptions) {
	    const chartContext = line._chart.getContext();
	    const baseStyle = readStyle(line.options);
	    const { _datasetIndex: datasetIndex , options: { spanGaps  }  } = line;
	    const count = points.length;
	    const result = [];
	    let prevStyle = baseStyle;
	    let start = segments[0].start;
	    let i = start;
	    function addStyle(s, e, l, st) {
	        const dir = spanGaps ? -1 : 1;
	        if (s === e) {
	            return;
	        }
	        s += count;
	        while(points[s % count].skip){
	            s -= dir;
	        }
	        while(points[e % count].skip){
	            e += dir;
	        }
	        if (s % count !== e % count) {
	            result.push({
	                start: s % count,
	                end: e % count,
	                loop: l,
	                style: st
	            });
	            prevStyle = st;
	            start = e % count;
	        }
	    }
	    for (const segment of segments){
	        start = spanGaps ? start : segment.start;
	        let prev = points[start % count];
	        let style;
	        for(i = start + 1; i <= segment.end; i++){
	            const pt = points[i % count];
	            style = readStyle(segmentOptions.setContext(createContext(chartContext, {
	                type: 'segment',
	                p0: prev,
	                p1: pt,
	                p0DataIndex: (i - 1) % count,
	                p1DataIndex: i % count,
	                datasetIndex
	            })));
	            if (styleChanged(style, prevStyle)) {
	                addStyle(start, i - 1, segment.loop, prevStyle);
	            }
	            prev = pt;
	            prevStyle = style;
	        }
	        if (start < i - 1) {
	            addStyle(start, i - 1, segment.loop, prevStyle);
	        }
	    }
	    return result;
	}
	function readStyle(options) {
	    return {
	        backgroundColor: options.backgroundColor,
	        borderCapStyle: options.borderCapStyle,
	        borderDash: options.borderDash,
	        borderDashOffset: options.borderDashOffset,
	        borderJoinStyle: options.borderJoinStyle,
	        borderWidth: options.borderWidth,
	        borderColor: options.borderColor
	    };
	}
	function styleChanged(style, prevStyle) {
	    if (!prevStyle) {
	        return false;
	    }
	    const cache = [];
	    const replacer = function(key, value) {
	        if (!isPatternOrGradient(value)) {
	            return value;
	        }
	        if (!cache.includes(value)) {
	            cache.push(value);
	        }
	        return cache.indexOf(value);
	    };
	    return JSON.stringify(style, replacer) !== JSON.stringify(prevStyle, replacer);
	}

	/*!
	 * Chart.js v4.4.1
	 * https://www.chartjs.org
	 * (c) 2023 Chart.js Contributors
	 * Released under the MIT License
	 */

	class Animator {
	    constructor(){
	        this._request = null;
	        this._charts = new Map();
	        this._running = false;
	        this._lastDate = undefined;
	    }
	 _notify(chart, anims, date, type) {
	        const callbacks = anims.listeners[type];
	        const numSteps = anims.duration;
	        callbacks.forEach((fn)=>fn({
	                chart,
	                initial: anims.initial,
	                numSteps,
	                currentStep: Math.min(date - anims.start, numSteps)
	            }));
	    }
	 _refresh() {
	        if (this._request) {
	            return;
	        }
	        this._running = true;
	        this._request = requestAnimFrame.call(window, ()=>{
	            this._update();
	            this._request = null;
	            if (this._running) {
	                this._refresh();
	            }
	        });
	    }
	 _update(date = Date.now()) {
	        let remaining = 0;
	        this._charts.forEach((anims, chart)=>{
	            if (!anims.running || !anims.items.length) {
	                return;
	            }
	            const items = anims.items;
	            let i = items.length - 1;
	            let draw = false;
	            let item;
	            for(; i >= 0; --i){
	                item = items[i];
	                if (item._active) {
	                    if (item._total > anims.duration) {
	                        anims.duration = item._total;
	                    }
	                    item.tick(date);
	                    draw = true;
	                } else {
	                    items[i] = items[items.length - 1];
	                    items.pop();
	                }
	            }
	            if (draw) {
	                chart.draw();
	                this._notify(chart, anims, date, 'progress');
	            }
	            if (!items.length) {
	                anims.running = false;
	                this._notify(chart, anims, date, 'complete');
	                anims.initial = false;
	            }
	            remaining += items.length;
	        });
	        this._lastDate = date;
	        if (remaining === 0) {
	            this._running = false;
	        }
	    }
	 _getAnims(chart) {
	        const charts = this._charts;
	        let anims = charts.get(chart);
	        if (!anims) {
	            anims = {
	                running: false,
	                initial: true,
	                items: [],
	                listeners: {
	                    complete: [],
	                    progress: []
	                }
	            };
	            charts.set(chart, anims);
	        }
	        return anims;
	    }
	 listen(chart, event, cb) {
	        this._getAnims(chart).listeners[event].push(cb);
	    }
	 add(chart, items) {
	        if (!items || !items.length) {
	            return;
	        }
	        this._getAnims(chart).items.push(...items);
	    }
	 has(chart) {
	        return this._getAnims(chart).items.length > 0;
	    }
	 start(chart) {
	        const anims = this._charts.get(chart);
	        if (!anims) {
	            return;
	        }
	        anims.running = true;
	        anims.start = Date.now();
	        anims.duration = anims.items.reduce((acc, cur)=>Math.max(acc, cur._duration), 0);
	        this._refresh();
	    }
	    running(chart) {
	        if (!this._running) {
	            return false;
	        }
	        const anims = this._charts.get(chart);
	        if (!anims || !anims.running || !anims.items.length) {
	            return false;
	        }
	        return true;
	    }
	 stop(chart) {
	        const anims = this._charts.get(chart);
	        if (!anims || !anims.items.length) {
	            return;
	        }
	        const items = anims.items;
	        let i = items.length - 1;
	        for(; i >= 0; --i){
	            items[i].cancel();
	        }
	        anims.items = [];
	        this._notify(chart, anims, Date.now(), 'complete');
	    }
	 remove(chart) {
	        return this._charts.delete(chart);
	    }
	}
	var animator = /* #__PURE__ */ new Animator();

	const transparent = 'transparent';
	const interpolators = {
	    boolean (from, to, factor) {
	        return factor > 0.5 ? to : from;
	    },
	 color (from, to, factor) {
	        const c0 = color(from || transparent);
	        const c1 = c0.valid && color(to || transparent);
	        return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to;
	    },
	    number (from, to, factor) {
	        return from + (to - from) * factor;
	    }
	};
	class Animation {
	    constructor(cfg, target, prop, to){
	        const currentValue = target[prop];
	        to = resolve([
	            cfg.to,
	            to,
	            currentValue,
	            cfg.from
	        ]);
	        const from = resolve([
	            cfg.from,
	            currentValue,
	            to
	        ]);
	        this._active = true;
	        this._fn = cfg.fn || interpolators[cfg.type || typeof from];
	        this._easing = effects[cfg.easing] || effects.linear;
	        this._start = Math.floor(Date.now() + (cfg.delay || 0));
	        this._duration = this._total = Math.floor(cfg.duration);
	        this._loop = !!cfg.loop;
	        this._target = target;
	        this._prop = prop;
	        this._from = from;
	        this._to = to;
	        this._promises = undefined;
	    }
	    active() {
	        return this._active;
	    }
	    update(cfg, to, date) {
	        if (this._active) {
	            this._notify(false);
	            const currentValue = this._target[this._prop];
	            const elapsed = date - this._start;
	            const remain = this._duration - elapsed;
	            this._start = date;
	            this._duration = Math.floor(Math.max(remain, cfg.duration));
	            this._total += elapsed;
	            this._loop = !!cfg.loop;
	            this._to = resolve([
	                cfg.to,
	                to,
	                currentValue,
	                cfg.from
	            ]);
	            this._from = resolve([
	                cfg.from,
	                currentValue,
	                to
	            ]);
	        }
	    }
	    cancel() {
	        if (this._active) {
	            this.tick(Date.now());
	            this._active = false;
	            this._notify(false);
	        }
	    }
	    tick(date) {
	        const elapsed = date - this._start;
	        const duration = this._duration;
	        const prop = this._prop;
	        const from = this._from;
	        const loop = this._loop;
	        const to = this._to;
	        let factor;
	        this._active = from !== to && (loop || elapsed < duration);
	        if (!this._active) {
	            this._target[prop] = to;
	            this._notify(true);
	            return;
	        }
	        if (elapsed < 0) {
	            this._target[prop] = from;
	            return;
	        }
	        factor = elapsed / duration % 2;
	        factor = loop && factor > 1 ? 2 - factor : factor;
	        factor = this._easing(Math.min(1, Math.max(0, factor)));
	        this._target[prop] = this._fn(from, to, factor);
	    }
	    wait() {
	        const promises = this._promises || (this._promises = []);
	        return new Promise((res, rej)=>{
	            promises.push({
	                res,
	                rej
	            });
	        });
	    }
	    _notify(resolved) {
	        const method = resolved ? 'res' : 'rej';
	        const promises = this._promises || [];
	        for(let i = 0; i < promises.length; i++){
	            promises[i][method]();
	        }
	    }
	}

	class Animations {
	    constructor(chart, config){
	        this._chart = chart;
	        this._properties = new Map();
	        this.configure(config);
	    }
	    configure(config) {
	        if (!isObject(config)) {
	            return;
	        }
	        const animationOptions = Object.keys(defaults.animation);
	        const animatedProps = this._properties;
	        Object.getOwnPropertyNames(config).forEach((key)=>{
	            const cfg = config[key];
	            if (!isObject(cfg)) {
	                return;
	            }
	            const resolved = {};
	            for (const option of animationOptions){
	                resolved[option] = cfg[option];
	            }
	            (isArray(cfg.properties) && cfg.properties || [
	                key
	            ]).forEach((prop)=>{
	                if (prop === key || !animatedProps.has(prop)) {
	                    animatedProps.set(prop, resolved);
	                }
	            });
	        });
	    }
	 _animateOptions(target, values) {
	        const newOptions = values.options;
	        const options = resolveTargetOptions(target, newOptions);
	        if (!options) {
	            return [];
	        }
	        const animations = this._createAnimations(options, newOptions);
	        if (newOptions.$shared) {
	            awaitAll(target.options.$animations, newOptions).then(()=>{
	                target.options = newOptions;
	            }, ()=>{
	            });
	        }
	        return animations;
	    }
	 _createAnimations(target, values) {
	        const animatedProps = this._properties;
	        const animations = [];
	        const running = target.$animations || (target.$animations = {});
	        const props = Object.keys(values);
	        const date = Date.now();
	        let i;
	        for(i = props.length - 1; i >= 0; --i){
	            const prop = props[i];
	            if (prop.charAt(0) === '$') {
	                continue;
	            }
	            if (prop === 'options') {
	                animations.push(...this._animateOptions(target, values));
	                continue;
	            }
	            const value = values[prop];
	            let animation = running[prop];
	            const cfg = animatedProps.get(prop);
	            if (animation) {
	                if (cfg && animation.active()) {
	                    animation.update(cfg, value, date);
	                    continue;
	                } else {
	                    animation.cancel();
	                }
	            }
	            if (!cfg || !cfg.duration) {
	                target[prop] = value;
	                continue;
	            }
	            running[prop] = animation = new Animation(cfg, target, prop, value);
	            animations.push(animation);
	        }
	        return animations;
	    }
	 update(target, values) {
	        if (this._properties.size === 0) {
	            Object.assign(target, values);
	            return;
	        }
	        const animations = this._createAnimations(target, values);
	        if (animations.length) {
	            animator.add(this._chart, animations);
	            return true;
	        }
	    }
	}
	function awaitAll(animations, properties) {
	    const running = [];
	    const keys = Object.keys(properties);
	    for(let i = 0; i < keys.length; i++){
	        const anim = animations[keys[i]];
	        if (anim && anim.active()) {
	            running.push(anim.wait());
	        }
	    }
	    return Promise.all(running);
	}
	function resolveTargetOptions(target, newOptions) {
	    if (!newOptions) {
	        return;
	    }
	    let options = target.options;
	    if (!options) {
	        target.options = newOptions;
	        return;
	    }
	    if (options.$shared) {
	        target.options = options = Object.assign({}, options, {
	            $shared: false,
	            $animations: {}
	        });
	    }
	    return options;
	}

	function scaleClip(scale, allowedOverflow) {
	    const opts = scale && scale.options || {};
	    const reverse = opts.reverse;
	    const min = opts.min === undefined ? allowedOverflow : 0;
	    const max = opts.max === undefined ? allowedOverflow : 0;
	    return {
	        start: reverse ? max : min,
	        end: reverse ? min : max
	    };
	}
	function defaultClip(xScale, yScale, allowedOverflow) {
	    if (allowedOverflow === false) {
	        return false;
	    }
	    const x = scaleClip(xScale, allowedOverflow);
	    const y = scaleClip(yScale, allowedOverflow);
	    return {
	        top: y.end,
	        right: x.end,
	        bottom: y.start,
	        left: x.start
	    };
	}
	function toClip(value) {
	    let t, r, b, l;
	    if (isObject(value)) {
	        t = value.top;
	        r = value.right;
	        b = value.bottom;
	        l = value.left;
	    } else {
	        t = r = b = l = value;
	    }
	    return {
	        top: t,
	        right: r,
	        bottom: b,
	        left: l,
	        disabled: value === false
	    };
	}
	function getSortedDatasetIndices(chart, filterVisible) {
	    const keys = [];
	    const metasets = chart._getSortedDatasetMetas(filterVisible);
	    let i, ilen;
	    for(i = 0, ilen = metasets.length; i < ilen; ++i){
	        keys.push(metasets[i].index);
	    }
	    return keys;
	}
	function applyStack(stack, value, dsIndex, options = {}) {
	    const keys = stack.keys;
	    const singleMode = options.mode === 'single';
	    let i, ilen, datasetIndex, otherValue;
	    if (value === null) {
	        return;
	    }
	    for(i = 0, ilen = keys.length; i < ilen; ++i){
	        datasetIndex = +keys[i];
	        if (datasetIndex === dsIndex) {
	            if (options.all) {
	                continue;
	            }
	            break;
	        }
	        otherValue = stack.values[datasetIndex];
	        if (isNumberFinite(otherValue) && (singleMode || value === 0 || sign(value) === sign(otherValue))) {
	            value += otherValue;
	        }
	    }
	    return value;
	}
	function convertObjectDataToArray(data) {
	    const keys = Object.keys(data);
	    const adata = new Array(keys.length);
	    let i, ilen, key;
	    for(i = 0, ilen = keys.length; i < ilen; ++i){
	        key = keys[i];
	        adata[i] = {
	            x: key,
	            y: data[key]
	        };
	    }
	    return adata;
	}
	function isStacked(scale, meta) {
	    const stacked = scale && scale.options.stacked;
	    return stacked || stacked === undefined && meta.stack !== undefined;
	}
	function getStackKey(indexScale, valueScale, meta) {
	    return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
	}
	function getUserBounds(scale) {
	    const { min , max , minDefined , maxDefined  } = scale.getUserBounds();
	    return {
	        min: minDefined ? min : Number.NEGATIVE_INFINITY,
	        max: maxDefined ? max : Number.POSITIVE_INFINITY
	    };
	}
	function getOrCreateStack(stacks, stackKey, indexValue) {
	    const subStack = stacks[stackKey] || (stacks[stackKey] = {});
	    return subStack[indexValue] || (subStack[indexValue] = {});
	}
	function getLastIndexInStack(stack, vScale, positive, type) {
	    for (const meta of vScale.getMatchingVisibleMetas(type).reverse()){
	        const value = stack[meta.index];
	        if (positive && value > 0 || !positive && value < 0) {
	            return meta.index;
	        }
	    }
	    return null;
	}
	function updateStacks(controller, parsed) {
	    const { chart , _cachedMeta: meta  } = controller;
	    const stacks = chart._stacks || (chart._stacks = {});
	    const { iScale , vScale , index: datasetIndex  } = meta;
	    const iAxis = iScale.axis;
	    const vAxis = vScale.axis;
	    const key = getStackKey(iScale, vScale, meta);
	    const ilen = parsed.length;
	    let stack;
	    for(let i = 0; i < ilen; ++i){
	        const item = parsed[i];
	        const { [iAxis]: index , [vAxis]: value  } = item;
	        const itemStacks = item._stacks || (item._stacks = {});
	        stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
	        stack[datasetIndex] = value;
	        stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
	        stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
	        const visualValues = stack._visualValues || (stack._visualValues = {});
	        visualValues[datasetIndex] = value;
	    }
	}
	function getFirstScaleId(chart, axis) {
	    const scales = chart.scales;
	    return Object.keys(scales).filter((key)=>scales[key].axis === axis).shift();
	}
	function createDatasetContext(parent, index) {
	    return createContext(parent, {
	        active: false,
	        dataset: undefined,
	        datasetIndex: index,
	        index,
	        mode: 'default',
	        type: 'dataset'
	    });
	}
	function createDataContext(parent, index, element) {
	    return createContext(parent, {
	        active: false,
	        dataIndex: index,
	        parsed: undefined,
	        raw: undefined,
	        element,
	        index,
	        mode: 'default',
	        type: 'data'
	    });
	}
	function clearStacks(meta, items) {
	    const datasetIndex = meta.controller.index;
	    const axis = meta.vScale && meta.vScale.axis;
	    if (!axis) {
	        return;
	    }
	    items = items || meta._parsed;
	    for (const parsed of items){
	        const stacks = parsed._stacks;
	        if (!stacks || stacks[axis] === undefined || stacks[axis][datasetIndex] === undefined) {
	            return;
	        }
	        delete stacks[axis][datasetIndex];
	        if (stacks[axis]._visualValues !== undefined && stacks[axis]._visualValues[datasetIndex] !== undefined) {
	            delete stacks[axis]._visualValues[datasetIndex];
	        }
	    }
	}
	const isDirectUpdateMode = (mode)=>mode === 'reset' || mode === 'none';
	const cloneIfNotShared = (cached, shared)=>shared ? cached : Object.assign({}, cached);
	const createStack = (canStack, meta, chart)=>canStack && !meta.hidden && meta._stacked && {
	        keys: getSortedDatasetIndices(chart, true),
	        values: null
	    };
	class DatasetController {
	 static defaults = {};
	 static datasetElementType = null;
	 static dataElementType = null;
	 constructor(chart, datasetIndex){
	        this.chart = chart;
	        this._ctx = chart.ctx;
	        this.index = datasetIndex;
	        this._cachedDataOpts = {};
	        this._cachedMeta = this.getMeta();
	        this._type = this._cachedMeta.type;
	        this.options = undefined;
	         this._parsing = false;
	        this._data = undefined;
	        this._objectData = undefined;
	        this._sharedOptions = undefined;
	        this._drawStart = undefined;
	        this._drawCount = undefined;
	        this.enableOptionSharing = false;
	        this.supportsDecimation = false;
	        this.$context = undefined;
	        this._syncList = [];
	        this.datasetElementType = new.target.datasetElementType;
	        this.dataElementType = new.target.dataElementType;
	        this.initialize();
	    }
	    initialize() {
	        const meta = this._cachedMeta;
	        this.configure();
	        this.linkScales();
	        meta._stacked = isStacked(meta.vScale, meta);
	        this.addElements();
	        if (this.options.fill && !this.chart.isPluginEnabled('filler')) {
	            console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
	        }
	    }
	    updateIndex(datasetIndex) {
	        if (this.index !== datasetIndex) {
	            clearStacks(this._cachedMeta);
	        }
	        this.index = datasetIndex;
	    }
	    linkScales() {
	        const chart = this.chart;
	        const meta = this._cachedMeta;
	        const dataset = this.getDataset();
	        const chooseId = (axis, x, y, r)=>axis === 'x' ? x : axis === 'r' ? r : y;
	        const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, 'x'));
	        const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, 'y'));
	        const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, 'r'));
	        const indexAxis = meta.indexAxis;
	        const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
	        const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
	        meta.xScale = this.getScaleForId(xid);
	        meta.yScale = this.getScaleForId(yid);
	        meta.rScale = this.getScaleForId(rid);
	        meta.iScale = this.getScaleForId(iid);
	        meta.vScale = this.getScaleForId(vid);
	    }
	    getDataset() {
	        return this.chart.data.datasets[this.index];
	    }
	    getMeta() {
	        return this.chart.getDatasetMeta(this.index);
	    }
	 getScaleForId(scaleID) {
	        return this.chart.scales[scaleID];
	    }
	 _getOtherScale(scale) {
	        const meta = this._cachedMeta;
	        return scale === meta.iScale ? meta.vScale : meta.iScale;
	    }
	    reset() {
	        this._update('reset');
	    }
	 _destroy() {
	        const meta = this._cachedMeta;
	        if (this._data) {
	            unlistenArrayEvents(this._data, this);
	        }
	        if (meta._stacked) {
	            clearStacks(meta);
	        }
	    }
	 _dataCheck() {
	        const dataset = this.getDataset();
	        const data = dataset.data || (dataset.data = []);
	        const _data = this._data;
	        if (isObject(data)) {
	            this._data = convertObjectDataToArray(data);
	        } else if (_data !== data) {
	            if (_data) {
	                unlistenArrayEvents(_data, this);
	                const meta = this._cachedMeta;
	                clearStacks(meta);
	                meta._parsed = [];
	            }
	            if (data && Object.isExtensible(data)) {
	                listenArrayEvents(data, this);
	            }
	            this._syncList = [];
	            this._data = data;
	        }
	    }
	    addElements() {
	        const meta = this._cachedMeta;
	        this._dataCheck();
	        if (this.datasetElementType) {
	            meta.dataset = new this.datasetElementType();
	        }
	    }
	    buildOrUpdateElements(resetNewElements) {
	        const meta = this._cachedMeta;
	        const dataset = this.getDataset();
	        let stackChanged = false;
	        this._dataCheck();
	        const oldStacked = meta._stacked;
	        meta._stacked = isStacked(meta.vScale, meta);
	        if (meta.stack !== dataset.stack) {
	            stackChanged = true;
	            clearStacks(meta);
	            meta.stack = dataset.stack;
	        }
	        this._resyncElements(resetNewElements);
	        if (stackChanged || oldStacked !== meta._stacked) {
	            updateStacks(this, meta._parsed);
	        }
	    }
	 configure() {
	        const config = this.chart.config;
	        const scopeKeys = config.datasetScopeKeys(this._type);
	        const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
	        this.options = config.createResolver(scopes, this.getContext());
	        this._parsing = this.options.parsing;
	        this._cachedDataOpts = {};
	    }
	 parse(start, count) {
	        const { _cachedMeta: meta , _data: data  } = this;
	        const { iScale , _stacked  } = meta;
	        const iAxis = iScale.axis;
	        let sorted = start === 0 && count === data.length ? true : meta._sorted;
	        let prev = start > 0 && meta._parsed[start - 1];
	        let i, cur, parsed;
	        if (this._parsing === false) {
	            meta._parsed = data;
	            meta._sorted = true;
	            parsed = data;
	        } else {
	            if (isArray(data[start])) {
	                parsed = this.parseArrayData(meta, data, start, count);
	            } else if (isObject(data[start])) {
	                parsed = this.parseObjectData(meta, data, start, count);
	            } else {
	                parsed = this.parsePrimitiveData(meta, data, start, count);
	            }
	            const isNotInOrderComparedToPrev = ()=>cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis];
	            for(i = 0; i < count; ++i){
	                meta._parsed[i + start] = cur = parsed[i];
	                if (sorted) {
	                    if (isNotInOrderComparedToPrev()) {
	                        sorted = false;
	                    }
	                    prev = cur;
	                }
	            }
	            meta._sorted = sorted;
	        }
	        if (_stacked) {
	            updateStacks(this, parsed);
	        }
	    }
	 parsePrimitiveData(meta, data, start, count) {
	        const { iScale , vScale  } = meta;
	        const iAxis = iScale.axis;
	        const vAxis = vScale.axis;
	        const labels = iScale.getLabels();
	        const singleScale = iScale === vScale;
	        const parsed = new Array(count);
	        let i, ilen, index;
	        for(i = 0, ilen = count; i < ilen; ++i){
	            index = i + start;
	            parsed[i] = {
	                [iAxis]: singleScale || iScale.parse(labels[index], index),
	                [vAxis]: vScale.parse(data[index], index)
	            };
	        }
	        return parsed;
	    }
	 parseArrayData(meta, data, start, count) {
	        const { xScale , yScale  } = meta;
	        const parsed = new Array(count);
	        let i, ilen, index, item;
	        for(i = 0, ilen = count; i < ilen; ++i){
	            index = i + start;
	            item = data[index];
	            parsed[i] = {
	                x: xScale.parse(item[0], index),
	                y: yScale.parse(item[1], index)
	            };
	        }
	        return parsed;
	    }
	 parseObjectData(meta, data, start, count) {
	        const { xScale , yScale  } = meta;
	        const { xAxisKey ='x' , yAxisKey ='y'  } = this._parsing;
	        const parsed = new Array(count);
	        let i, ilen, index, item;
	        for(i = 0, ilen = count; i < ilen; ++i){
	            index = i + start;
	            item = data[index];
	            parsed[i] = {
	                x: xScale.parse(resolveObjectKey(item, xAxisKey), index),
	                y: yScale.parse(resolveObjectKey(item, yAxisKey), index)
	            };
	        }
	        return parsed;
	    }
	 getParsed(index) {
	        return this._cachedMeta._parsed[index];
	    }
	 getDataElement(index) {
	        return this._cachedMeta.data[index];
	    }
	 applyStack(scale, parsed, mode) {
	        const chart = this.chart;
	        const meta = this._cachedMeta;
	        const value = parsed[scale.axis];
	        const stack = {
	            keys: getSortedDatasetIndices(chart, true),
	            values: parsed._stacks[scale.axis]._visualValues
	        };
	        return applyStack(stack, value, meta.index, {
	            mode
	        });
	    }
	 updateRangeFromParsed(range, scale, parsed, stack) {
	        const parsedValue = parsed[scale.axis];
	        let value = parsedValue === null ? NaN : parsedValue;
	        const values = stack && parsed._stacks[scale.axis];
	        if (stack && values) {
	            stack.values = values;
	            value = applyStack(stack, parsedValue, this._cachedMeta.index);
	        }
	        range.min = Math.min(range.min, value);
	        range.max = Math.max(range.max, value);
	    }
	 getMinMax(scale, canStack) {
	        const meta = this._cachedMeta;
	        const _parsed = meta._parsed;
	        const sorted = meta._sorted && scale === meta.iScale;
	        const ilen = _parsed.length;
	        const otherScale = this._getOtherScale(scale);
	        const stack = createStack(canStack, meta, this.chart);
	        const range = {
	            min: Number.POSITIVE_INFINITY,
	            max: Number.NEGATIVE_INFINITY
	        };
	        const { min: otherMin , max: otherMax  } = getUserBounds(otherScale);
	        let i, parsed;
	        function _skip() {
	            parsed = _parsed[i];
	            const otherValue = parsed[otherScale.axis];
	            return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
	        }
	        for(i = 0; i < ilen; ++i){
	            if (_skip()) {
	                continue;
	            }
	            this.updateRangeFromParsed(range, scale, parsed, stack);
	            if (sorted) {
	                break;
	            }
	        }
	        if (sorted) {
	            for(i = ilen - 1; i >= 0; --i){
	                if (_skip()) {
	                    continue;
	                }
	                this.updateRangeFromParsed(range, scale, parsed, stack);
	                break;
	            }
	        }
	        return range;
	    }
	    getAllParsedValues(scale) {
	        const parsed = this._cachedMeta._parsed;
	        const values = [];
	        let i, ilen, value;
	        for(i = 0, ilen = parsed.length; i < ilen; ++i){
	            value = parsed[i][scale.axis];
	            if (isNumberFinite(value)) {
	                values.push(value);
	            }
	        }
	        return values;
	    }
	 getMaxOverflow() {
	        return false;
	    }
	 getLabelAndValue(index) {
	        const meta = this._cachedMeta;
	        const iScale = meta.iScale;
	        const vScale = meta.vScale;
	        const parsed = this.getParsed(index);
	        return {
	            label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '',
	            value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : ''
	        };
	    }
	 _update(mode) {
	        const meta = this._cachedMeta;
	        this.update(mode || 'default');
	        meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
	    }
	 update(mode) {}
	    draw() {
	        const ctx = this._ctx;
	        const chart = this.chart;
	        const meta = this._cachedMeta;
	        const elements = meta.data || [];
	        const area = chart.chartArea;
	        const active = [];
	        const start = this._drawStart || 0;
	        const count = this._drawCount || elements.length - start;
	        const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
	        let i;
	        if (meta.dataset) {
	            meta.dataset.draw(ctx, area, start, count);
	        }
	        for(i = start; i < start + count; ++i){
	            const element = elements[i];
	            if (element.hidden) {
	                continue;
	            }
	            if (element.active && drawActiveElementsOnTop) {
	                active.push(element);
	            } else {
	                element.draw(ctx, area);
	            }
	        }
	        for(i = 0; i < active.length; ++i){
	            active[i].draw(ctx, area);
	        }
	    }
	 getStyle(index, active) {
	        const mode = active ? 'active' : 'default';
	        return index === undefined && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index || 0, mode);
	    }
	 getContext(index, active, mode) {
	        const dataset = this.getDataset();
	        let context;
	        if (index >= 0 && index < this._cachedMeta.data.length) {
	            const element = this._cachedMeta.data[index];
	            context = element.$context || (element.$context = createDataContext(this.getContext(), index, element));
	            context.parsed = this.getParsed(index);
	            context.raw = dataset.data[index];
	            context.index = context.dataIndex = index;
	        } else {
	            context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
	            context.dataset = dataset;
	            context.index = context.datasetIndex = this.index;
	        }
	        context.active = !!active;
	        context.mode = mode;
	        return context;
	    }
	 resolveDatasetElementOptions(mode) {
	        return this._resolveElementOptions(this.datasetElementType.id, mode);
	    }
	 resolveDataElementOptions(index, mode) {
	        return this._resolveElementOptions(this.dataElementType.id, mode, index);
	    }
	 _resolveElementOptions(elementType, mode = 'default', index) {
	        const active = mode === 'active';
	        const cache = this._cachedDataOpts;
	        const cacheKey = elementType + '-' + mode;
	        const cached = cache[cacheKey];
	        const sharing = this.enableOptionSharing && defined(index);
	        if (cached) {
	            return cloneIfNotShared(cached, sharing);
	        }
	        const config = this.chart.config;
	        const scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
	        const prefixes = active ? [
	            `${elementType}Hover`,
	            'hover',
	            elementType,
	            ''
	        ] : [
	            elementType,
	            ''
	        ];
	        const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
	        const names = Object.keys(defaults.elements[elementType]);
	        const context = ()=>this.getContext(index, active, mode);
	        const values = config.resolveNamedOptions(scopes, names, context, prefixes);
	        if (values.$shared) {
	            values.$shared = sharing;
	            cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
	        }
	        return values;
	    }
	 _resolveAnimations(index, transition, active) {
	        const chart = this.chart;
	        const cache = this._cachedDataOpts;
	        const cacheKey = `animation-${transition}`;
	        const cached = cache[cacheKey];
	        if (cached) {
	            return cached;
	        }
	        let options;
	        if (chart.options.animation !== false) {
	            const config = this.chart.config;
	            const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
	            const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
	            options = config.createResolver(scopes, this.getContext(index, active, transition));
	        }
	        const animations = new Animations(chart, options && options.animations);
	        if (options && options._cacheable) {
	            cache[cacheKey] = Object.freeze(animations);
	        }
	        return animations;
	    }
	 getSharedOptions(options) {
	        if (!options.$shared) {
	            return;
	        }
	        return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
	    }
	 includeOptions(mode, sharedOptions) {
	        return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
	    }
	 _getSharedOptions(start, mode) {
	        const firstOpts = this.resolveDataElementOptions(start, mode);
	        const previouslySharedOptions = this._sharedOptions;
	        const sharedOptions = this.getSharedOptions(firstOpts);
	        const includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
	        this.updateSharedOptions(sharedOptions, mode, firstOpts);
	        return {
	            sharedOptions,
	            includeOptions
	        };
	    }
	 updateElement(element, index, properties, mode) {
	        if (isDirectUpdateMode(mode)) {
	            Object.assign(element, properties);
	        } else {
	            this._resolveAnimations(index, mode).update(element, properties);
	        }
	    }
	 updateSharedOptions(sharedOptions, mode, newOptions) {
	        if (sharedOptions && !isDirectUpdateMode(mode)) {
	            this._resolveAnimations(undefined, mode).update(sharedOptions, newOptions);
	        }
	    }
	 _setStyle(element, index, mode, active) {
	        element.active = active;
	        const options = this.getStyle(index, active);
	        this._resolveAnimations(index, mode, active).update(element, {
	            options: !active && this.getSharedOptions(options) || options
	        });
	    }
	    removeHoverStyle(element, datasetIndex, index) {
	        this._setStyle(element, index, 'active', false);
	    }
	    setHoverStyle(element, datasetIndex, index) {
	        this._setStyle(element, index, 'active', true);
	    }
	 _removeDatasetHoverStyle() {
	        const element = this._cachedMeta.dataset;
	        if (element) {
	            this._setStyle(element, undefined, 'active', false);
	        }
	    }
	 _setDatasetHoverStyle() {
	        const element = this._cachedMeta.dataset;
	        if (element) {
	            this._setStyle(element, undefined, 'active', true);
	        }
	    }
	 _resyncElements(resetNewElements) {
	        const data = this._data;
	        const elements = this._cachedMeta.data;
	        for (const [method, arg1, arg2] of this._syncList){
	            this[method](arg1, arg2);
	        }
	        this._syncList = [];
	        const numMeta = elements.length;
	        const numData = data.length;
	        const count = Math.min(numData, numMeta);
	        if (count) {
	            this.parse(0, count);
	        }
	        if (numData > numMeta) {
	            this._insertElements(numMeta, numData - numMeta, resetNewElements);
	        } else if (numData < numMeta) {
	            this._removeElements(numData, numMeta - numData);
	        }
	    }
	 _insertElements(start, count, resetNewElements = true) {
	        const meta = this._cachedMeta;
	        const data = meta.data;
	        const end = start + count;
	        let i;
	        const move = (arr)=>{
	            arr.length += count;
	            for(i = arr.length - 1; i >= end; i--){
	                arr[i] = arr[i - count];
	            }
	        };
	        move(data);
	        for(i = start; i < end; ++i){
	            data[i] = new this.dataElementType();
	        }
	        if (this._parsing) {
	            move(meta._parsed);
	        }
	        this.parse(start, count);
	        if (resetNewElements) {
	            this.updateElements(data, start, count, 'reset');
	        }
	    }
	    updateElements(element, start, count, mode) {}
	 _removeElements(start, count) {
	        const meta = this._cachedMeta;
	        if (this._parsing) {
	            const removed = meta._parsed.splice(start, count);
	            if (meta._stacked) {
	                clearStacks(meta, removed);
	            }
	        }
	        meta.data.splice(start, count);
	    }
	 _sync(args) {
	        if (this._parsing) {
	            this._syncList.push(args);
	        } else {
	            const [method, arg1, arg2] = args;
	            this[method](arg1, arg2);
	        }
	        this.chart._dataChanges.push([
	            this.index,
	            ...args
	        ]);
	    }
	    _onDataPush() {
	        const count = arguments.length;
	        this._sync([
	            '_insertElements',
	            this.getDataset().data.length - count,
	            count
	        ]);
	    }
	    _onDataPop() {
	        this._sync([
	            '_removeElements',
	            this._cachedMeta.data.length - 1,
	            1
	        ]);
	    }
	    _onDataShift() {
	        this._sync([
	            '_removeElements',
	            0,
	            1
	        ]);
	    }
	    _onDataSplice(start, count) {
	        if (count) {
	            this._sync([
	                '_removeElements',
	                start,
	                count
	            ]);
	        }
	        const newCount = arguments.length - 2;
	        if (newCount) {
	            this._sync([
	                '_insertElements',
	                start,
	                newCount
	            ]);
	        }
	    }
	    _onDataUnshift() {
	        this._sync([
	            '_insertElements',
	            0,
	            arguments.length
	        ]);
	    }
	}

	function getAllScaleValues(scale, type) {
	    if (!scale._cache.$bar) {
	        const visibleMetas = scale.getMatchingVisibleMetas(type);
	        let values = [];
	        for(let i = 0, ilen = visibleMetas.length; i < ilen; i++){
	            values = values.concat(visibleMetas[i].controller.getAllParsedValues(scale));
	        }
	        scale._cache.$bar = _arrayUnique(values.sort((a, b)=>a - b));
	    }
	    return scale._cache.$bar;
	}
	 function computeMinSampleSize(meta) {
	    const scale = meta.iScale;
	    const values = getAllScaleValues(scale, meta.type);
	    let min = scale._length;
	    let i, ilen, curr, prev;
	    const updateMinAndPrev = ()=>{
	        if (curr === 32767 || curr === -32768) {
	            return;
	        }
	        if (defined(prev)) {
	            min = Math.min(min, Math.abs(curr - prev) || min);
	        }
	        prev = curr;
	    };
	    for(i = 0, ilen = values.length; i < ilen; ++i){
	        curr = scale.getPixelForValue(values[i]);
	        updateMinAndPrev();
	    }
	    prev = undefined;
	    for(i = 0, ilen = scale.ticks.length; i < ilen; ++i){
	        curr = scale.getPixelForTick(i);
	        updateMinAndPrev();
	    }
	    return min;
	}
	 function computeFitCategoryTraits(index, ruler, options, stackCount) {
	    const thickness = options.barThickness;
	    let size, ratio;
	    if (isNullOrUndef(thickness)) {
	        size = ruler.min * options.categoryPercentage;
	        ratio = options.barPercentage;
	    } else {
	        size = thickness * stackCount;
	        ratio = 1;
	    }
	    return {
	        chunk: size / stackCount,
	        ratio,
	        start: ruler.pixels[index] - size / 2
	    };
	}
	 function computeFlexCategoryTraits(index, ruler, options, stackCount) {
	    const pixels = ruler.pixels;
	    const curr = pixels[index];
	    let prev = index > 0 ? pixels[index - 1] : null;
	    let next = index < pixels.length - 1 ? pixels[index + 1] : null;
	    const percent = options.categoryPercentage;
	    if (prev === null) {
	        prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
	    }
	    if (next === null) {
	        next = curr + curr - prev;
	    }
	    const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
	    const size = Math.abs(next - prev) / 2 * percent;
	    return {
	        chunk: size / stackCount,
	        ratio: options.barPercentage,
	        start
	    };
	}
	function parseFloatBar(entry, item, vScale, i) {
	    const startValue = vScale.parse(entry[0], i);
	    const endValue = vScale.parse(entry[1], i);
	    const min = Math.min(startValue, endValue);
	    const max = Math.max(startValue, endValue);
	    let barStart = min;
	    let barEnd = max;
	    if (Math.abs(min) > Math.abs(max)) {
	        barStart = max;
	        barEnd = min;
	    }
	    item[vScale.axis] = barEnd;
	    item._custom = {
	        barStart,
	        barEnd,
	        start: startValue,
	        end: endValue,
	        min,
	        max
	    };
	}
	function parseValue(entry, item, vScale, i) {
	    if (isArray(entry)) {
	        parseFloatBar(entry, item, vScale, i);
	    } else {
	        item[vScale.axis] = vScale.parse(entry, i);
	    }
	    return item;
	}
	function parseArrayOrPrimitive(meta, data, start, count) {
	    const iScale = meta.iScale;
	    const vScale = meta.vScale;
	    const labels = iScale.getLabels();
	    const singleScale = iScale === vScale;
	    const parsed = [];
	    let i, ilen, item, entry;
	    for(i = start, ilen = start + count; i < ilen; ++i){
	        entry = data[i];
	        item = {};
	        item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
	        parsed.push(parseValue(entry, item, vScale, i));
	    }
	    return parsed;
	}
	function isFloatBar(custom) {
	    return custom && custom.barStart !== undefined && custom.barEnd !== undefined;
	}
	function barSign(size, vScale, actualBase) {
	    if (size !== 0) {
	        return sign(size);
	    }
	    return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
	}
	function borderProps(properties) {
	    let reverse, start, end, top, bottom;
	    if (properties.horizontal) {
	        reverse = properties.base > properties.x;
	        start = 'left';
	        end = 'right';
	    } else {
	        reverse = properties.base < properties.y;
	        start = 'bottom';
	        end = 'top';
	    }
	    if (reverse) {
	        top = 'end';
	        bottom = 'start';
	    } else {
	        top = 'start';
	        bottom = 'end';
	    }
	    return {
	        start,
	        end,
	        reverse,
	        top,
	        bottom
	    };
	}
	function setBorderSkipped(properties, options, stack, index) {
	    let edge = options.borderSkipped;
	    const res = {};
	    if (!edge) {
	        properties.borderSkipped = res;
	        return;
	    }
	    if (edge === true) {
	        properties.borderSkipped = {
	            top: true,
	            right: true,
	            bottom: true,
	            left: true
	        };
	        return;
	    }
	    const { start , end , reverse , top , bottom  } = borderProps(properties);
	    if (edge === 'middle' && stack) {
	        properties.enableBorderRadius = true;
	        if ((stack._top || 0) === index) {
	            edge = top;
	        } else if ((stack._bottom || 0) === index) {
	            edge = bottom;
	        } else {
	            res[parseEdge(bottom, start, end, reverse)] = true;
	            edge = top;
	        }
	    }
	    res[parseEdge(edge, start, end, reverse)] = true;
	    properties.borderSkipped = res;
	}
	function parseEdge(edge, a, b, reverse) {
	    if (reverse) {
	        edge = swap(edge, a, b);
	        edge = startEnd(edge, b, a);
	    } else {
	        edge = startEnd(edge, a, b);
	    }
	    return edge;
	}
	function swap(orig, v1, v2) {
	    return orig === v1 ? v2 : orig === v2 ? v1 : orig;
	}
	function startEnd(v, start, end) {
	    return v === 'start' ? start : v === 'end' ? end : v;
	}
	function setInflateAmount(properties, { inflateAmount  }, ratio) {
	    properties.inflateAmount = inflateAmount === 'auto' ? ratio === 1 ? 0.33 : 0 : inflateAmount;
	}
	class BarController extends DatasetController {
	    static id = 'bar';
	 static defaults = {
	        datasetElementType: false,
	        dataElementType: 'bar',
	        categoryPercentage: 0.8,
	        barPercentage: 0.9,
	        grouped: true,
	        animations: {
	            numbers: {
	                type: 'number',
	                properties: [
	                    'x',
	                    'y',
	                    'base',
	                    'width',
	                    'height'
	                ]
	            }
	        }
	    };
	 static overrides = {
	        scales: {
	            _index_: {
	                type: 'category',
	                offset: true,
	                grid: {
	                    offset: true
	                }
	            },
	            _value_: {
	                type: 'linear',
	                beginAtZero: true
	            }
	        }
	    };
	 parsePrimitiveData(meta, data, start, count) {
	        return parseArrayOrPrimitive(meta, data, start, count);
	    }
	 parseArrayData(meta, data, start, count) {
	        return parseArrayOrPrimitive(meta, data, start, count);
	    }
	 parseObjectData(meta, data, start, count) {
	        const { iScale , vScale  } = meta;
	        const { xAxisKey ='x' , yAxisKey ='y'  } = this._parsing;
	        const iAxisKey = iScale.axis === 'x' ? xAxisKey : yAxisKey;
	        const vAxisKey = vScale.axis === 'x' ? xAxisKey : yAxisKey;
	        const parsed = [];
	        let i, ilen, item, obj;
	        for(i = start, ilen = start + count; i < ilen; ++i){
	            obj = data[i];
	            item = {};
	            item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i);
	            parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i));
	        }
	        return parsed;
	    }
	 updateRangeFromParsed(range, scale, parsed, stack) {
	        super.updateRangeFromParsed(range, scale, parsed, stack);
	        const custom = parsed._custom;
	        if (custom && scale === this._cachedMeta.vScale) {
	            range.min = Math.min(range.min, custom.min);
	            range.max = Math.max(range.max, custom.max);
	        }
	    }
	 getMaxOverflow() {
	        return 0;
	    }
	 getLabelAndValue(index) {
	        const meta = this._cachedMeta;
	        const { iScale , vScale  } = meta;
	        const parsed = this.getParsed(index);
	        const custom = parsed._custom;
	        const value = isFloatBar(custom) ? '[' + custom.start + ', ' + custom.end + ']' : '' + vScale.getLabelForValue(parsed[vScale.axis]);
	        return {
	            label: '' + iScale.getLabelForValue(parsed[iScale.axis]),
	            value
	        };
	    }
	    initialize() {
	        this.enableOptionSharing = true;
	        super.initialize();
	        const meta = this._cachedMeta;
	        meta.stack = this.getDataset().stack;
	    }
	    update(mode) {
	        const meta = this._cachedMeta;
	        this.updateElements(meta.data, 0, meta.data.length, mode);
	    }
	    updateElements(bars, start, count, mode) {
	        const reset = mode === 'reset';
	        const { index , _cachedMeta: { vScale  }  } = this;
	        const base = vScale.getBasePixel();
	        const horizontal = vScale.isHorizontal();
	        const ruler = this._getRuler();
	        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
	        for(let i = start; i < start + count; i++){
	            const parsed = this.getParsed(i);
	            const vpixels = reset || isNullOrUndef(parsed[vScale.axis]) ? {
	                base,
	                head: base
	            } : this._calculateBarValuePixels(i);
	            const ipixels = this._calculateBarIndexPixels(i, ruler);
	            const stack = (parsed._stacks || {})[vScale.axis];
	            const properties = {
	                horizontal,
	                base: vpixels.base,
	                enableBorderRadius: !stack || isFloatBar(parsed._custom) || index === stack._top || index === stack._bottom,
	                x: horizontal ? vpixels.head : ipixels.center,
	                y: horizontal ? ipixels.center : vpixels.head,
	                height: horizontal ? ipixels.size : Math.abs(vpixels.size),
	                width: horizontal ? Math.abs(vpixels.size) : ipixels.size
	            };
	            if (includeOptions) {
	                properties.options = sharedOptions || this.resolveDataElementOptions(i, bars[i].active ? 'active' : mode);
	            }
	            const options = properties.options || bars[i].options;
	            setBorderSkipped(properties, options, stack, index);
	            setInflateAmount(properties, options, ruler.ratio);
	            this.updateElement(bars[i], i, properties, mode);
	        }
	    }
	 _getStacks(last, dataIndex) {
	        const { iScale  } = this._cachedMeta;
	        const metasets = iScale.getMatchingVisibleMetas(this._type).filter((meta)=>meta.controller.options.grouped);
	        const stacked = iScale.options.stacked;
	        const stacks = [];
	        const skipNull = (meta)=>{
	            const parsed = meta.controller.getParsed(dataIndex);
	            const val = parsed && parsed[meta.vScale.axis];
	            if (isNullOrUndef(val) || isNaN(val)) {
	                return true;
	            }
	        };
	        for (const meta of metasets){
	            if (dataIndex !== undefined && skipNull(meta)) {
	                continue;
	            }
	            if (stacked === false || stacks.indexOf(meta.stack) === -1 || stacked === undefined && meta.stack === undefined) {
	                stacks.push(meta.stack);
	            }
	            if (meta.index === last) {
	                break;
	            }
	        }
	        if (!stacks.length) {
	            stacks.push(undefined);
	        }
	        return stacks;
	    }
	 _getStackCount(index) {
	        return this._getStacks(undefined, index).length;
	    }
	 _getStackIndex(datasetIndex, name, dataIndex) {
	        const stacks = this._getStacks(datasetIndex, dataIndex);
	        const index = name !== undefined ? stacks.indexOf(name) : -1;
	        return index === -1 ? stacks.length - 1 : index;
	    }
	 _getRuler() {
	        const opts = this.options;
	        const meta = this._cachedMeta;
	        const iScale = meta.iScale;
	        const pixels = [];
	        let i, ilen;
	        for(i = 0, ilen = meta.data.length; i < ilen; ++i){
	            pixels.push(iScale.getPixelForValue(this.getParsed(i)[iScale.axis], i));
	        }
	        const barThickness = opts.barThickness;
	        const min = barThickness || computeMinSampleSize(meta);
	        return {
	            min,
	            pixels,
	            start: iScale._startPixel,
	            end: iScale._endPixel,
	            stackCount: this._getStackCount(),
	            scale: iScale,
	            grouped: opts.grouped,
	            ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
	        };
	    }
	 _calculateBarValuePixels(index) {
	        const { _cachedMeta: { vScale , _stacked , index: datasetIndex  } , options: { base: baseValue , minBarLength  }  } = this;
	        const actualBase = baseValue || 0;
	        const parsed = this.getParsed(index);
	        const custom = parsed._custom;
	        const floating = isFloatBar(custom);
	        let value = parsed[vScale.axis];
	        let start = 0;
	        let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
	        let head, size;
	        if (length !== value) {
	            start = length - value;
	            length = value;
	        }
	        if (floating) {
	            value = custom.barStart;
	            length = custom.barEnd - custom.barStart;
	            if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
	                start = 0;
	            }
	            start += value;
	        }
	        const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
	        let base = vScale.getPixelForValue(startValue);
	        if (this.chart.getDataVisibility(index)) {
	            head = vScale.getPixelForValue(start + length);
	        } else {
	            head = base;
	        }
	        size = head - base;
	        if (Math.abs(size) < minBarLength) {
	            size = barSign(size, vScale, actualBase) * minBarLength;
	            if (value === actualBase) {
	                base -= size / 2;
	            }
	            const startPixel = vScale.getPixelForDecimal(0);
	            const endPixel = vScale.getPixelForDecimal(1);
	            const min = Math.min(startPixel, endPixel);
	            const max = Math.max(startPixel, endPixel);
	            base = Math.max(Math.min(base, max), min);
	            head = base + size;
	            if (_stacked && !floating) {
	                parsed._stacks[vScale.axis]._visualValues[datasetIndex] = vScale.getValueForPixel(head) - vScale.getValueForPixel(base);
	            }
	        }
	        if (base === vScale.getPixelForValue(actualBase)) {
	            const halfGrid = sign(size) * vScale.getLineWidthForValue(actualBase) / 2;
	            base += halfGrid;
	            size -= halfGrid;
	        }
	        return {
	            size,
	            base,
	            head,
	            center: head + size / 2
	        };
	    }
	 _calculateBarIndexPixels(index, ruler) {
	        const scale = ruler.scale;
	        const options = this.options;
	        const skipNull = options.skipNull;
	        const maxBarThickness = valueOrDefault(options.maxBarThickness, Infinity);
	        let center, size;
	        if (ruler.grouped) {
	            const stackCount = skipNull ? this._getStackCount(index) : ruler.stackCount;
	            const range = options.barThickness === 'flex' ? computeFlexCategoryTraits(index, ruler, options, stackCount) : computeFitCategoryTraits(index, ruler, options, stackCount);
	            const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index : undefined);
	            center = range.start + range.chunk * stackIndex + range.chunk / 2;
	            size = Math.min(maxBarThickness, range.chunk * range.ratio);
	        } else {
	            center = scale.getPixelForValue(this.getParsed(index)[scale.axis], index);
	            size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
	        }
	        return {
	            base: center - size / 2,
	            head: center + size / 2,
	            center,
	            size
	        };
	    }
	    draw() {
	        const meta = this._cachedMeta;
	        const vScale = meta.vScale;
	        const rects = meta.data;
	        const ilen = rects.length;
	        let i = 0;
	        for(; i < ilen; ++i){
	            if (this.getParsed(i)[vScale.axis] !== null) {
	                rects[i].draw(this._ctx);
	            }
	        }
	    }
	}

	class BubbleController extends DatasetController {
	    static id = 'bubble';
	 static defaults = {
	        datasetElementType: false,
	        dataElementType: 'point',
	        animations: {
	            numbers: {
	                type: 'number',
	                properties: [
	                    'x',
	                    'y',
	                    'borderWidth',
	                    'radius'
	                ]
	            }
	        }
	    };
	 static overrides = {
	        scales: {
	            x: {
	                type: 'linear'
	            },
	            y: {
	                type: 'linear'
	            }
	        }
	    };
	    initialize() {
	        this.enableOptionSharing = true;
	        super.initialize();
	    }
	 parsePrimitiveData(meta, data, start, count) {
	        const parsed = super.parsePrimitiveData(meta, data, start, count);
	        for(let i = 0; i < parsed.length; i++){
	            parsed[i]._custom = this.resolveDataElementOptions(i + start).radius;
	        }
	        return parsed;
	    }
	 parseArrayData(meta, data, start, count) {
	        const parsed = super.parseArrayData(meta, data, start, count);
	        for(let i = 0; i < parsed.length; i++){
	            const item = data[start + i];
	            parsed[i]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i + start).radius);
	        }
	        return parsed;
	    }
	 parseObjectData(meta, data, start, count) {
	        const parsed = super.parseObjectData(meta, data, start, count);
	        for(let i = 0; i < parsed.length; i++){
	            const item = data[start + i];
	            parsed[i]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius);
	        }
	        return parsed;
	    }
	 getMaxOverflow() {
	        const data = this._cachedMeta.data;
	        let max = 0;
	        for(let i = data.length - 1; i >= 0; --i){
	            max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
	        }
	        return max > 0 && max;
	    }
	 getLabelAndValue(index) {
	        const meta = this._cachedMeta;
	        const labels = this.chart.data.labels || [];
	        const { xScale , yScale  } = meta;
	        const parsed = this.getParsed(index);
	        const x = xScale.getLabelForValue(parsed.x);
	        const y = yScale.getLabelForValue(parsed.y);
	        const r = parsed._custom;
	        return {
	            label: labels[index] || '',
	            value: '(' + x + ', ' + y + (r ? ', ' + r : '') + ')'
	        };
	    }
	    update(mode) {
	        const points = this._cachedMeta.data;
	        this.updateElements(points, 0, points.length, mode);
	    }
	    updateElements(points, start, count, mode) {
	        const reset = mode === 'reset';
	        const { iScale , vScale  } = this._cachedMeta;
	        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
	        const iAxis = iScale.axis;
	        const vAxis = vScale.axis;
	        for(let i = start; i < start + count; i++){
	            const point = points[i];
	            const parsed = !reset && this.getParsed(i);
	            const properties = {};
	            const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
	            const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
	            properties.skip = isNaN(iPixel) || isNaN(vPixel);
	            if (includeOptions) {
	                properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
	                if (reset) {
	                    properties.options.radius = 0;
	                }
	            }
	            this.updateElement(point, i, properties, mode);
	        }
	    }
	 resolveDataElementOptions(index, mode) {
	        const parsed = this.getParsed(index);
	        let values = super.resolveDataElementOptions(index, mode);
	        if (values.$shared) {
	            values = Object.assign({}, values, {
	                $shared: false
	            });
	        }
	        const radius = values.radius;
	        if (mode !== 'active') {
	            values.radius = 0;
	        }
	        values.radius += valueOrDefault(parsed && parsed._custom, radius);
	        return values;
	    }
	}

	function getRatioAndOffset(rotation, circumference, cutout) {
	    let ratioX = 1;
	    let ratioY = 1;
	    let offsetX = 0;
	    let offsetY = 0;
	    if (circumference < TAU) {
	        const startAngle = rotation;
	        const endAngle = startAngle + circumference;
	        const startX = Math.cos(startAngle);
	        const startY = Math.sin(startAngle);
	        const endX = Math.cos(endAngle);
	        const endY = Math.sin(endAngle);
	        const calcMax = (angle, a, b)=>_angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout);
	        const calcMin = (angle, a, b)=>_angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout);
	        const maxX = calcMax(0, startX, endX);
	        const maxY = calcMax(HALF_PI, startY, endY);
	        const minX = calcMin(PI, startX, endX);
	        const minY = calcMin(PI + HALF_PI, startY, endY);
	        ratioX = (maxX - minX) / 2;
	        ratioY = (maxY - minY) / 2;
	        offsetX = -(maxX + minX) / 2;
	        offsetY = -(maxY + minY) / 2;
	    }
	    return {
	        ratioX,
	        ratioY,
	        offsetX,
	        offsetY
	    };
	}
	class DoughnutController extends DatasetController {
	    static id = 'doughnut';
	 static defaults = {
	        datasetElementType: false,
	        dataElementType: 'arc',
	        animation: {
	            animateRotate: true,
	            animateScale: false
	        },
	        animations: {
	            numbers: {
	                type: 'number',
	                properties: [
	                    'circumference',
	                    'endAngle',
	                    'innerRadius',
	                    'outerRadius',
	                    'startAngle',
	                    'x',
	                    'y',
	                    'offset',
	                    'borderWidth',
	                    'spacing'
	                ]
	            }
	        },
	        cutout: '50%',
	        rotation: 0,
	        circumference: 360,
	        radius: '100%',
	        spacing: 0,
	        indexAxis: 'r'
	    };
	    static descriptors = {
	        _scriptable: (name)=>name !== 'spacing',
	        _indexable: (name)=>name !== 'spacing' && !name.startsWith('borderDash') && !name.startsWith('hoverBorderDash')
	    };
	 static overrides = {
	        aspectRatio: 1,
	        plugins: {
	            legend: {
	                labels: {
	                    generateLabels (chart) {
	                        const data = chart.data;
	                        if (data.labels.length && data.datasets.length) {
	                            const { labels: { pointStyle , color  }  } = chart.legend.options;
	                            return data.labels.map((label, i)=>{
	                                const meta = chart.getDatasetMeta(0);
	                                const style = meta.controller.getStyle(i);
	                                return {
	                                    text: label,
	                                    fillStyle: style.backgroundColor,
	                                    strokeStyle: style.borderColor,
	                                    fontColor: color,
	                                    lineWidth: style.borderWidth,
	                                    pointStyle: pointStyle,
	                                    hidden: !chart.getDataVisibility(i),
	                                    index: i
	                                };
	                            });
	                        }
	                        return [];
	                    }
	                },
	                onClick (e, legendItem, legend) {
	                    legend.chart.toggleDataVisibility(legendItem.index);
	                    legend.chart.update();
	                }
	            }
	        }
	    };
	    constructor(chart, datasetIndex){
	        super(chart, datasetIndex);
	        this.enableOptionSharing = true;
	        this.innerRadius = undefined;
	        this.outerRadius = undefined;
	        this.offsetX = undefined;
	        this.offsetY = undefined;
	    }
	    linkScales() {}
	 parse(start, count) {
	        const data = this.getDataset().data;
	        const meta = this._cachedMeta;
	        if (this._parsing === false) {
	            meta._parsed = data;
	        } else {
	            let getter = (i)=>+data[i];
	            if (isObject(data[start])) {
	                const { key ='value'  } = this._parsing;
	                getter = (i)=>+resolveObjectKey(data[i], key);
	            }
	            let i, ilen;
	            for(i = start, ilen = start + count; i < ilen; ++i){
	                meta._parsed[i] = getter(i);
	            }
	        }
	    }
	 _getRotation() {
	        return toRadians(this.options.rotation - 90);
	    }
	 _getCircumference() {
	        return toRadians(this.options.circumference);
	    }
	 _getRotationExtents() {
	        let min = TAU;
	        let max = -TAU;
	        for(let i = 0; i < this.chart.data.datasets.length; ++i){
	            if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
	                const controller = this.chart.getDatasetMeta(i).controller;
	                const rotation = controller._getRotation();
	                const circumference = controller._getCircumference();
	                min = Math.min(min, rotation);
	                max = Math.max(max, rotation + circumference);
	            }
	        }
	        return {
	            rotation: min,
	            circumference: max - min
	        };
	    }
	 update(mode) {
	        const chart = this.chart;
	        const { chartArea  } = chart;
	        const meta = this._cachedMeta;
	        const arcs = meta.data;
	        const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
	        const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
	        const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
	        const chartWeight = this._getRingWeight(this.index);
	        const { circumference , rotation  } = this._getRotationExtents();
	        const { ratioX , ratioY , offsetX , offsetY  } = getRatioAndOffset(rotation, circumference, cutout);
	        const maxWidth = (chartArea.width - spacing) / ratioX;
	        const maxHeight = (chartArea.height - spacing) / ratioY;
	        const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
	        const outerRadius = toDimension(this.options.radius, maxRadius);
	        const innerRadius = Math.max(outerRadius * cutout, 0);
	        const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
	        this.offsetX = offsetX * outerRadius;
	        this.offsetY = offsetY * outerRadius;
	        meta.total = this.calculateTotal();
	        this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
	        this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
	        this.updateElements(arcs, 0, arcs.length, mode);
	    }
	 _circumference(i, reset) {
	        const opts = this.options;
	        const meta = this._cachedMeta;
	        const circumference = this._getCircumference();
	        if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) {
	            return 0;
	        }
	        return this.calculateCircumference(meta._parsed[i] * circumference / TAU);
	    }
	    updateElements(arcs, start, count, mode) {
	        const reset = mode === 'reset';
	        const chart = this.chart;
	        const chartArea = chart.chartArea;
	        const opts = chart.options;
	        const animationOpts = opts.animation;
	        const centerX = (chartArea.left + chartArea.right) / 2;
	        const centerY = (chartArea.top + chartArea.bottom) / 2;
	        const animateScale = reset && animationOpts.animateScale;
	        const innerRadius = animateScale ? 0 : this.innerRadius;
	        const outerRadius = animateScale ? 0 : this.outerRadius;
	        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
	        let startAngle = this._getRotation();
	        let i;
	        for(i = 0; i < start; ++i){
	            startAngle += this._circumference(i, reset);
	        }
	        for(i = start; i < start + count; ++i){
	            const circumference = this._circumference(i, reset);
	            const arc = arcs[i];
	            const properties = {
	                x: centerX + this.offsetX,
	                y: centerY + this.offsetY,
	                startAngle,
	                endAngle: startAngle + circumference,
	                circumference,
	                outerRadius,
	                innerRadius
	            };
	            if (includeOptions) {
	                properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? 'active' : mode);
	            }
	            startAngle += circumference;
	            this.updateElement(arc, i, properties, mode);
	        }
	    }
	    calculateTotal() {
	        const meta = this._cachedMeta;
	        const metaData = meta.data;
	        let total = 0;
	        let i;
	        for(i = 0; i < metaData.length; i++){
	            const value = meta._parsed[i];
	            if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) {
	                total += Math.abs(value);
	            }
	        }
	        return total;
	    }
	    calculateCircumference(value) {
	        const total = this._cachedMeta.total;
	        if (total > 0 && !isNaN(value)) {
	            return TAU * (Math.abs(value) / total);
	        }
	        return 0;
	    }
	    getLabelAndValue(index) {
	        const meta = this._cachedMeta;
	        const chart = this.chart;
	        const labels = chart.data.labels || [];
	        const value = formatNumber(meta._parsed[index], chart.options.locale);
	        return {
	            label: labels[index] || '',
	            value
	        };
	    }
	    getMaxBorderWidth(arcs) {
	        let max = 0;
	        const chart = this.chart;
	        let i, ilen, meta, controller, options;
	        if (!arcs) {
	            for(i = 0, ilen = chart.data.datasets.length; i < ilen; ++i){
	                if (chart.isDatasetVisible(i)) {
	                    meta = chart.getDatasetMeta(i);
	                    arcs = meta.data;
	                    controller = meta.controller;
	                    break;
	                }
	            }
	        }
	        if (!arcs) {
	            return 0;
	        }
	        for(i = 0, ilen = arcs.length; i < ilen; ++i){
	            options = controller.resolveDataElementOptions(i);
	            if (options.borderAlign !== 'inner') {
	                max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
	            }
	        }
	        return max;
	    }
	    getMaxOffset(arcs) {
	        let max = 0;
	        for(let i = 0, ilen = arcs.length; i < ilen; ++i){
	            const options = this.resolveDataElementOptions(i);
	            max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
	        }
	        return max;
	    }
	 _getRingWeightOffset(datasetIndex) {
	        let ringWeightOffset = 0;
	        for(let i = 0; i < datasetIndex; ++i){
	            if (this.chart.isDatasetVisible(i)) {
	                ringWeightOffset += this._getRingWeight(i);
	            }
	        }
	        return ringWeightOffset;
	    }
	 _getRingWeight(datasetIndex) {
	        return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
	    }
	 _getVisibleDatasetWeightTotal() {
	        return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
	    }
	}

	class LineController extends DatasetController {
	    static id = 'line';
	 static defaults = {
	        datasetElementType: 'line',
	        dataElementType: 'point',
	        showLine: true,
	        spanGaps: false
	    };
	 static overrides = {
	        scales: {
	            _index_: {
	                type: 'category'
	            },
	            _value_: {
	                type: 'linear'
	            }
	        }
	    };
	    initialize() {
	        this.enableOptionSharing = true;
	        this.supportsDecimation = true;
	        super.initialize();
	    }
	    update(mode) {
	        const meta = this._cachedMeta;
	        const { dataset: line , data: points = [] , _dataset  } = meta;
	        const animationsDisabled = this.chart._animationsDisabled;
	        let { start , count  } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
	        this._drawStart = start;
	        this._drawCount = count;
	        if (_scaleRangesChanged(meta)) {
	            start = 0;
	            count = points.length;
	        }
	        line._chart = this.chart;
	        line._datasetIndex = this.index;
	        line._decimated = !!_dataset._decimated;
	        line.points = points;
	        const options = this.resolveDatasetElementOptions(mode);
	        if (!this.options.showLine) {
	            options.borderWidth = 0;
	        }
	        options.segment = this.options.segment;
	        this.updateElement(line, undefined, {
	            animated: !animationsDisabled,
	            options
	        }, mode);
	        this.updateElements(points, start, count, mode);
	    }
	    updateElements(points, start, count, mode) {
	        const reset = mode === 'reset';
	        const { iScale , vScale , _stacked , _dataset  } = this._cachedMeta;
	        const { sharedOptions , includeOptions  } = this._getSharedOptions(start, mode);
	        const iAxis = iScale.axis;
	        const vAxis = vScale.axis;
	        const { spanGaps , segment  } = this.options;
	        const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
	        const directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
	        const end = start + count;
	        const pointsCount = points.length;
	        let prevParsed = start > 0 && this.getParsed(start - 1);
	        for(let i = 0; i < pointsCount; ++i){
	            const point = points[i];
	            const properties = directUpdate ? point : {};
	            if (i < start || i >= end) {
	                properties.skip = true;
	                continue;
	            }
	            const parsed = this.getParsed(i);
	            const nullData = isNullOrUndef(parsed[vAxis]);
	            const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
	            const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
	            properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
	            properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
	            if (segment) {
	                properties.parsed = parsed;
	                properties.raw = _dataset.data[i];
	            }
	            if (includeOptions) {
	                properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
	            }
	            if (!directUpdate) {
	                this.updateElement(point, i, properties, mode);
	            }
	            prevParsed = parsed;
	        }
	    }
	 getMaxOverflow() {
	        const meta = this._cachedMeta;
	        const dataset = meta.dataset;
	        const border = dataset.options && dataset.options.borderWidth || 0;
	        const data = meta.data || [];
	        if (!data.length) {
	            return border;
	        }
	        const firstPoint = data[0].size(this.resolveDataElementOptions(0));
	        const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
	        return Math.max(border, firstPoint, lastPoint) / 2;
	    }
	    draw() {
	        const meta = this._cachedMeta;
	        meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
	        super.draw();
	    }
	}

	class PolarAreaController extends DatasetController {
	    static id = 'polarArea';
	 static defaults = {
	        dataElementType: 'arc',
	        animation: {
	            animateRotate: true,
	            animateScale: true
	        },
	        animations: {
	            numbers: {
	                type: 'number',
	                properties: [
	                    'x',
	                    'y',
	                    'startAngle',
	                    'endAngle',
	                    'innerRadius',
	                    'outerRadius'
	                ]
	            }
	        },
	        indexAxis: 'r',
	        startAngle: 0
	    };
	 static overrides = {
	        aspectRatio: 1,
	        plugins: {
	            legend: {
	                labels: {
	                    generateLabels (chart) {
	                        const data = chart.data;
	                        if (data.labels.length && data.datasets.length) {
	                            const { labels: { pointStyle , color  }  } = chart.legend.options;
	                            return data.labels.map((label, i)=>{
	                                const meta = chart.getDatasetMeta(0);
	                                const style = meta.controller.getStyle(i);
	                                return {
	                                    text: label,
	                                    fillStyle: style.backgroundColor,
	                                    strokeStyle: style.borderColor,
	                                    fontColor: color,
	                                    lineWidth: style.borderWidth,
	                                    pointStyle: pointStyle,
	                                    hidden: !chart.getDataVisibility(i),
	                                    index: i
	                                };
	                            });
	                        }
	                        return [];
	                    }
	                },
	                onClick (e, legendItem, legend) {
	                    legend.chart.toggleDataVisibility(legendItem.index);
	                    legend.chart.update();
	                }
	            }
	        },
	        scales: {
	            r: {
	                type: 'radialLinear',
	                angleLines: {
	                    display: false
	                },
	                beginAtZero: true,
	                grid: {
	                    circular: true
	                },
	                pointLabels: {
	                    display: false
	                },
	                startAngle: 0
	            }
	        }
	    };
	    constructor(chart, datasetIndex){
	        super(chart, datasetIndex);
	        this.innerRadius = undefined;
	        this.outerRadius = undefined;
	    }
	    getLabelAndValue(index) {
	        const meta = this._cachedMeta;
	        const chart = this.chart;
	        const labels = chart.data.labels || [];
	        const value = formatNumber(meta._parsed[index].r, chart.options.locale);
	        return {
	            label: labels[index] || '',
	            value
	        };
	    }
	    parseObjectData(meta, data, start, count) {
	        return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
	    }
	    update(mode) {
	        const arcs = this._cachedMeta.data;
	        this._updateRadius();
	        this.updateElements(arcs, 0, arcs.length, mode);
	    }
	 getMinMax() {
	        const meta = this._cachedMeta;
	        const range = {
	            min: Number.POSITIVE_INFINITY,
	            max: Number.NEGATIVE_INFINITY
	        };
	        meta.data.forEach((element, index)=>{
	            const parsed = this.getParsed(index).r;
	            if (!isNaN(parsed) && this.chart.getDataVisibility(index)) {
	                if (parsed < range.min) {
	                    range.min = parsed;
	                }
	                if (parsed > range.max) {
	                    range.max = parsed;
	                }
	            }
	        });
	        return range;
	    }
	 _updateRadius() {
	        const chart = this.chart;
	        const chartArea = chart.chartArea;
	        const opts = chart.options;
	        const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
	        const outerRadius = Math.max(minSize / 2, 0);
	        const innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
	        const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
	        this.outerRadius = outerRadius - radiusLength * this.index;
	        this.innerRadius = this.outerRadius - radiusLength;
	    }
	    updateElements(arcs, start, count, mode) {
	        const reset = mode === 'reset';
	        const chart = this.chart;
	        const opts = chart.options;
	        const animationOpts = opts.animation;
	        const scale = this._cachedMeta.rScale;
	        const centerX = scale.xCenter;
	        const centerY = scale.yCenter;
	        const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
	        let angle = datasetStartAngle;
	        let i;
	        const defaultAngle = 360 / this.countVisibleElements();
	        for(i = 0; i < start; ++i){
	            angle += this._computeAngle(i, mode, defaultAngle);
	        }
	        for(i = start; i < start + count; i++){
	            const arc = arcs[i];
	            let startAngle = angle;
	            let endAngle = angle + this._computeAngle(i, mode, defaultAngle);
	            let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(this.getParsed(i).r) : 0;
	            angle = endAngle;
	            if (reset) {
	                if (animationOpts.animateScale) {
	                    outerRadius = 0;
	                }
	                if (animationOpts.animateRotate) {
	                    startAngle = endAngle = datasetStartAngle;
	                }
	            }
	            const properties = {
	                x: centerX,
	                y: centerY,
	                innerRadius: 0,
	                outerRadius,
	                startAngle,
	                endAngle,
	                options: this.resolveDataElementOptions(i, arc.active ? 'active' : mode)
	            };
	            this.updateElement(arc, i, properties, mode);
	        }
	    }
	    countVisibleElements() {
	        const meta = this._cachedMeta;
	        let count = 0;
	        meta.data.forEach((element, index)=>{
	            if (!isNaN(this.getParsed(index).r) && this.chart.getDataVisibility(index)) {
	                count++;
	            }
	        });
	        return count;
	    }
	 _computeAngle(index, mode, defaultAngle) {
	        return this.chart.getDataVisibility(index) ? toRadians(this.resolveDataElementOptions(index, mode).angle || defaultAngle) : 0;
	    }
	}

	class PieController extends DoughnutController {
	    static id = 'pie';
	 static defaults = {
	        cutout: 0,
	        rotation: 0,
	        circumference: 360,
	        radius: '100%'
	    };
	}

	class RadarController extends DatasetController {
	    static id = 'radar';
	 static defaults = {
	        datasetElementType: 'line',
	        dataElementType: 'point',
	        indexAxis: 'r',
	        showLine: true,
	        elements: {
	            line: {
	                fill: 'start'
	            }
	        }
	    };
	 static overrides = {
	        aspectRatio: 1,
	        scales: {
	            r: {
	                type: 'radialLinear'
	            }
	        }
	    };
	 getLabelAndValue(index) {
	        const vScale = this._cachedMeta.vScale;
	        const parsed = this.getParsed(index);
	        return {
	            label: vScale.getLabels()[index],
	            value: '' + vScale.getLabelForValue(parsed[vScale.axis])
	        };
	    }
	    parseObjectData(meta, data, start, count) {
	        return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
	    }
	    update(mode) {
	        const meta = this._cachedMeta;
	        const line = meta.dataset;
	        const points = meta.data || [];
	        const labels = meta.iScale.getLabels();
	        line.points = points;
	        if (mode !== 'resize') {
	            const options = this.resolveDatasetElementOptions(mode);
	            if (!this.options.showLine) {
	                options.borderWidth = 0;
	            }
	            const properties = {
	                _loop: true,
	                _fullLoop: labels.length === points.length,
	                options
	            };
	            this.updateElement(line, undefined, properties, mode);
	        }
	        this.updateElements(points, 0, points.length, mode);
	    }
	    updateElements(points, start, count, mode) {
	        const scale = this._cachedMeta.rScale;
	        const reset = mode === 'reset';
	        for(let i = start; i < start + count; i++){
	            const point = points[i];
	            const options = this.resolveDataElementOptions(i, point.active ? 'active' : mode);
	            const pointPosition = scale.getPointPositionForValue(i, this.getParsed(i).r);
	            const x = reset ? scale.xCenter : pointPosition.x;
	            const y = reset ? scale.yCenter : pointPosition.y;
	            const properties = {
	                x,
	                y,
	                angle: pointPosition.angle,
	                skip: isNaN(x) || isNaN(y),
	                options
	            };
	            this.updateElement(point, i, properties, mode);
	        }
	    }
	}

	class ScatterController extends DatasetController {
	    static id = 'scatter';
	 static defaults = {
	        datasetElementType: false,
	        dataElementType: 'point',
	        showLine: false,
	        fill: false
	    };
	 static overrides = {
	        interaction: {
	            mode: 'point'
	        },
	        scales: {
	            x: {
	                type: 'linear'
	            },
	            y: {
	                type: 'linear'
	            }
	        }
	    };
	 getLabelAndValue(index) {
	        const meta = this._cachedMeta;
	        const labels = this.chart.data.labels || [];
	        const { xScale , yScale  } = meta;
	        const parsed = this.getParsed(index);
	        const x = xScale.getLabelForValue(parsed.x);
	        const y = yScale.getLabelForValue(parsed.y);
	        return {
	            label: labels[index] || '',
	            value: '(' + x + ', ' + y + ')'
	        };
	    }
	    update(mode) {
	        const meta = this._cachedMeta;
	        const { data: points = []  } = meta;
	        const animationsDisabled = this.chart._animationsDisabled;
	        let { start , count  } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
	        this._drawStart = start;
	        this._drawCount = count;
	        if (_scaleRangesChanged(meta)) {
	            start = 0;
	            count = points.length;
	        }
	        if (this.options.showLine) {
	            if (!this.datasetElementType) {
	                this.addElements();
	            }
	            const { dataset: line , _dataset  } = meta;
	            line._chart = this.chart;
	            line._datasetIndex = this.index;
	            line._decimated = !!_dataset._decimated;
	            line.points = points;
	            const options = this.resolveDatasetElementOptions(mode);
	            options.segment = this.options.segment;
	            this.updateElement(line, undefined, {
	                animated: !animationsDisabled,
	                options
	            }, mode);
	        } else if (this.datasetElementType) {
	            delete meta.dataset;
	            this.datasetElementType = false;
	        }
	        this.updateElements(points, start, count, mode);
	    }
	    addElements() {
	        const { showLine  } = this.options;
	        if (!this.datasetElementType && showLine) {
	            this.datasetElementType = this.chart.registry.getElement('line');
	        }
	        super.addElements();
	    }
	    updateElements(points, start, count, mode) {
	        const reset = mode === 'reset';
	        const { iScale , vScale , _stacked , _dataset  } = this._cachedMeta;
	        const firstOpts = this.resolveDataElementOptions(start, mode);
	        const sharedOptions = this.getSharedOptions(firstOpts);
	        const includeOptions = this.includeOptions(mode, sharedOptions);
	        const iAxis = iScale.axis;
	        const vAxis = vScale.axis;
	        const { spanGaps , segment  } = this.options;
	        const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
	        const directUpdate = this.chart._animationsDisabled || reset || mode === 'none';
	        let prevParsed = start > 0 && this.getParsed(start - 1);
	        for(let i = start; i < start + count; ++i){
	            const point = points[i];
	            const parsed = this.getParsed(i);
	            const properties = directUpdate ? point : {};
	            const nullData = isNullOrUndef(parsed[vAxis]);
	            const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
	            const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
	            properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
	            properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
	            if (segment) {
	                properties.parsed = parsed;
	                properties.raw = _dataset.data[i];
	            }
	            if (includeOptions) {
	                properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? 'active' : mode);
	            }
	            if (!directUpdate) {
	                this.updateElement(point, i, properties, mode);
	            }
	            prevParsed = parsed;
	        }
	        this.updateSharedOptions(sharedOptions, mode, firstOpts);
	    }
	 getMaxOverflow() {
	        const meta = this._cachedMeta;
	        const data = meta.data || [];
	        if (!this.options.showLine) {
	            let max = 0;
	            for(let i = data.length - 1; i >= 0; --i){
	                max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
	            }
	            return max > 0 && max;
	        }
	        const dataset = meta.dataset;
	        const border = dataset.options && dataset.options.borderWidth || 0;
	        if (!data.length) {
	            return border;
	        }
	        const firstPoint = data[0].size(this.resolveDataElementOptions(0));
	        const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
	        return Math.max(border, firstPoint, lastPoint) / 2;
	    }
	}

	var controllers = /*#__PURE__*/Object.freeze({
	__proto__: null,
	BarController: BarController,
	BubbleController: BubbleController,
	DoughnutController: DoughnutController,
	LineController: LineController,
	PieController: PieController,
	PolarAreaController: PolarAreaController,
	RadarController: RadarController,
	ScatterController: ScatterController
	});

	/**
	 * @namespace Chart._adapters
	 * @since 2.8.0
	 * @private
	 */ function abstract() {
	    throw new Error('This method is not implemented: Check that a complete date adapter is provided.');
	}
	/**
	 * Date adapter (current used by the time scale)
	 * @namespace Chart._adapters._date
	 * @memberof Chart._adapters
	 * @private
	 */ class DateAdapterBase {
	    /**
	   * Override default date adapter methods.
	   * Accepts type parameter to define options type.
	   * @example
	   * Chart._adapters._date.override<{myAdapterOption: string}>({
	   *   init() {
	   *     console.log(this.options.myAdapterOption);
	   *   }
	   * })
	   */ static override(members) {
	        Object.assign(DateAdapterBase.prototype, members);
	    }
	    options;
	    constructor(options){
	        this.options = options || {};
	    }
	    // eslint-disable-next-line @typescript-eslint/no-empty-function
	    init() {}
	    formats() {
	        return abstract();
	    }
	    parse() {
	        return abstract();
	    }
	    format() {
	        return abstract();
	    }
	    add() {
	        return abstract();
	    }
	    diff() {
	        return abstract();
	    }
	    startOf() {
	        return abstract();
	    }
	    endOf() {
	        return abstract();
	    }
	}
	var adapters = {
	    _date: DateAdapterBase
	};

	function binarySearch(metaset, axis, value, intersect) {
	    const { controller , data , _sorted  } = metaset;
	    const iScale = controller._cachedMeta.iScale;
	    if (iScale && axis === iScale.axis && axis !== 'r' && _sorted && data.length) {
	        const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
	        if (!intersect) {
	            return lookupMethod(data, axis, value);
	        } else if (controller._sharedOptions) {
	            const el = data[0];
	            const range = typeof el.getRange === 'function' && el.getRange(axis);
	            if (range) {
	                const start = lookupMethod(data, axis, value - range);
	                const end = lookupMethod(data, axis, value + range);
	                return {
	                    lo: start.lo,
	                    hi: end.hi
	                };
	            }
	        }
	    }
	    return {
	        lo: 0,
	        hi: data.length - 1
	    };
	}
	 function evaluateInteractionItems(chart, axis, position, handler, intersect) {
	    const metasets = chart.getSortedVisibleDatasetMetas();
	    const value = position[axis];
	    for(let i = 0, ilen = metasets.length; i < ilen; ++i){
	        const { index , data  } = metasets[i];
	        const { lo , hi  } = binarySearch(metasets[i], axis, value, intersect);
	        for(let j = lo; j <= hi; ++j){
	            const element = data[j];
	            if (!element.skip) {
	                handler(element, index, j);
	            }
	        }
	    }
	}
	 function getDistanceMetricForAxis(axis) {
	    const useX = axis.indexOf('x') !== -1;
	    const useY = axis.indexOf('y') !== -1;
	    return function(pt1, pt2) {
	        const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
	        const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
	        return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	    };
	}
	 function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
	    const items = [];
	    if (!includeInvisible && !chart.isPointInArea(position)) {
	        return items;
	    }
	    const evaluationFunc = function(element, datasetIndex, index) {
	        if (!includeInvisible && !_isPointInArea(element, chart.chartArea, 0)) {
	            return;
	        }
	        if (element.inRange(position.x, position.y, useFinalPosition)) {
	            items.push({
	                element,
	                datasetIndex,
	                index
	            });
	        }
	    };
	    evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
	    return items;
	}
	 function getNearestRadialItems(chart, position, axis, useFinalPosition) {
	    let items = [];
	    function evaluationFunc(element, datasetIndex, index) {
	        const { startAngle , endAngle  } = element.getProps([
	            'startAngle',
	            'endAngle'
	        ], useFinalPosition);
	        const { angle  } = getAngleFromPoint(element, {
	            x: position.x,
	            y: position.y
	        });
	        if (_angleBetween(angle, startAngle, endAngle)) {
	            items.push({
	                element,
	                datasetIndex,
	                index
	            });
	        }
	    }
	    evaluateInteractionItems(chart, axis, position, evaluationFunc);
	    return items;
	}
	 function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
	    let items = [];
	    const distanceMetric = getDistanceMetricForAxis(axis);
	    let minDistance = Number.POSITIVE_INFINITY;
	    function evaluationFunc(element, datasetIndex, index) {
	        const inRange = element.inRange(position.x, position.y, useFinalPosition);
	        if (intersect && !inRange) {
	            return;
	        }
	        const center = element.getCenterPoint(useFinalPosition);
	        const pointInArea = !!includeInvisible || chart.isPointInArea(center);
	        if (!pointInArea && !inRange) {
	            return;
	        }
	        const distance = distanceMetric(position, center);
	        if (distance < minDistance) {
	            items = [
	                {
	                    element,
	                    datasetIndex,
	                    index
	                }
	            ];
	            minDistance = distance;
	        } else if (distance === minDistance) {
	            items.push({
	                element,
	                datasetIndex,
	                index
	            });
	        }
	    }
	    evaluateInteractionItems(chart, axis, position, evaluationFunc);
	    return items;
	}
	 function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
	    if (!includeInvisible && !chart.isPointInArea(position)) {
	        return [];
	    }
	    return axis === 'r' && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
	}
	 function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
	    const items = [];
	    const rangeMethod = axis === 'x' ? 'inXRange' : 'inYRange';
	    let intersectsItem = false;
	    evaluateInteractionItems(chart, axis, position, (element, datasetIndex, index)=>{
	        if (element[rangeMethod](position[axis], useFinalPosition)) {
	            items.push({
	                element,
	                datasetIndex,
	                index
	            });
	            intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
	        }
	    });
	    if (intersect && !intersectsItem) {
	        return [];
	    }
	    return items;
	}
	 var Interaction = {
	    evaluateInteractionItems,
	    modes: {
	 index (chart, e, options, useFinalPosition) {
	            const position = getRelativePosition(e, chart);
	            const axis = options.axis || 'x';
	            const includeInvisible = options.includeInvisible || false;
	            const items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
	            const elements = [];
	            if (!items.length) {
	                return [];
	            }
	            chart.getSortedVisibleDatasetMetas().forEach((meta)=>{
	                const index = items[0].index;
	                const element = meta.data[index];
	                if (element && !element.skip) {
	                    elements.push({
	                        element,
	                        datasetIndex: meta.index,
	                        index
	                    });
	                }
	            });
	            return elements;
	        },
	 dataset (chart, e, options, useFinalPosition) {
	            const position = getRelativePosition(e, chart);
	            const axis = options.axis || 'xy';
	            const includeInvisible = options.includeInvisible || false;
	            let items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
	            if (items.length > 0) {
	                const datasetIndex = items[0].datasetIndex;
	                const data = chart.getDatasetMeta(datasetIndex).data;
	                items = [];
	                for(let i = 0; i < data.length; ++i){
	                    items.push({
	                        element: data[i],
	                        datasetIndex,
	                        index: i
	                    });
	                }
	            }
	            return items;
	        },
	 point (chart, e, options, useFinalPosition) {
	            const position = getRelativePosition(e, chart);
	            const axis = options.axis || 'xy';
	            const includeInvisible = options.includeInvisible || false;
	            return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
	        },
	 nearest (chart, e, options, useFinalPosition) {
	            const position = getRelativePosition(e, chart);
	            const axis = options.axis || 'xy';
	            const includeInvisible = options.includeInvisible || false;
	            return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible);
	        },
	 x (chart, e, options, useFinalPosition) {
	            const position = getRelativePosition(e, chart);
	            return getAxisItems(chart, position, 'x', options.intersect, useFinalPosition);
	        },
	 y (chart, e, options, useFinalPosition) {
	            const position = getRelativePosition(e, chart);
	            return getAxisItems(chart, position, 'y', options.intersect, useFinalPosition);
	        }
	    }
	};

	const STATIC_POSITIONS = [
	    'left',
	    'top',
	    'right',
	    'bottom'
	];
	function filterByPosition(array, position) {
	    return array.filter((v)=>v.pos === position);
	}
	function filterDynamicPositionByAxis(array, axis) {
	    return array.filter((v)=>STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
	}
	function sortByWeight(array, reverse) {
	    return array.sort((a, b)=>{
	        const v0 = reverse ? b : a;
	        const v1 = reverse ? a : b;
	        return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
	    });
	}
	function wrapBoxes(boxes) {
	    const layoutBoxes = [];
	    let i, ilen, box, pos, stack, stackWeight;
	    for(i = 0, ilen = (boxes || []).length; i < ilen; ++i){
	        box = boxes[i];
	        ({ position: pos , options: { stack , stackWeight =1  }  } = box);
	        layoutBoxes.push({
	            index: i,
	            box,
	            pos,
	            horizontal: box.isHorizontal(),
	            weight: box.weight,
	            stack: stack && pos + stack,
	            stackWeight
	        });
	    }
	    return layoutBoxes;
	}
	function buildStacks(layouts) {
	    const stacks = {};
	    for (const wrap of layouts){
	        const { stack , pos , stackWeight  } = wrap;
	        if (!stack || !STATIC_POSITIONS.includes(pos)) {
	            continue;
	        }
	        const _stack = stacks[stack] || (stacks[stack] = {
	            count: 0,
	            placed: 0,
	            weight: 0,
	            size: 0
	        });
	        _stack.count++;
	        _stack.weight += stackWeight;
	    }
	    return stacks;
	}
	 function setLayoutDims(layouts, params) {
	    const stacks = buildStacks(layouts);
	    const { vBoxMaxWidth , hBoxMaxHeight  } = params;
	    let i, ilen, layout;
	    for(i = 0, ilen = layouts.length; i < ilen; ++i){
	        layout = layouts[i];
	        const { fullSize  } = layout.box;
	        const stack = stacks[layout.stack];
	        const factor = stack && layout.stackWeight / stack.weight;
	        if (layout.horizontal) {
	            layout.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
	            layout.height = hBoxMaxHeight;
	        } else {
	            layout.width = vBoxMaxWidth;
	            layout.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
	        }
	    }
	    return stacks;
	}
	function buildLayoutBoxes(boxes) {
	    const layoutBoxes = wrapBoxes(boxes);
	    const fullSize = sortByWeight(layoutBoxes.filter((wrap)=>wrap.box.fullSize), true);
	    const left = sortByWeight(filterByPosition(layoutBoxes, 'left'), true);
	    const right = sortByWeight(filterByPosition(layoutBoxes, 'right'));
	    const top = sortByWeight(filterByPosition(layoutBoxes, 'top'), true);
	    const bottom = sortByWeight(filterByPosition(layoutBoxes, 'bottom'));
	    const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, 'x');
	    const centerVertical = filterDynamicPositionByAxis(layoutBoxes, 'y');
	    return {
	        fullSize,
	        leftAndTop: left.concat(top),
	        rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
	        chartArea: filterByPosition(layoutBoxes, 'chartArea'),
	        vertical: left.concat(right).concat(centerVertical),
	        horizontal: top.concat(bottom).concat(centerHorizontal)
	    };
	}
	function getCombinedMax(maxPadding, chartArea, a, b) {
	    return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
	}
	function updateMaxPadding(maxPadding, boxPadding) {
	    maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
	    maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
	    maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
	    maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
	}
	function updateDims(chartArea, params, layout, stacks) {
	    const { pos , box  } = layout;
	    const maxPadding = chartArea.maxPadding;
	    if (!isObject(pos)) {
	        if (layout.size) {
	            chartArea[pos] -= layout.size;
	        }
	        const stack = stacks[layout.stack] || {
	            size: 0,
	            count: 1
	        };
	        stack.size = Math.max(stack.size, layout.horizontal ? box.height : box.width);
	        layout.size = stack.size / stack.count;
	        chartArea[pos] += layout.size;
	    }
	    if (box.getPadding) {
	        updateMaxPadding(maxPadding, box.getPadding());
	    }
	    const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, 'left', 'right'));
	    const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, 'top', 'bottom'));
	    const widthChanged = newWidth !== chartArea.w;
	    const heightChanged = newHeight !== chartArea.h;
	    chartArea.w = newWidth;
	    chartArea.h = newHeight;
	    return layout.horizontal ? {
	        same: widthChanged,
	        other: heightChanged
	    } : {
	        same: heightChanged,
	        other: widthChanged
	    };
	}
	function handleMaxPadding(chartArea) {
	    const maxPadding = chartArea.maxPadding;
	    function updatePos(pos) {
	        const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
	        chartArea[pos] += change;
	        return change;
	    }
	    chartArea.y += updatePos('top');
	    chartArea.x += updatePos('left');
	    updatePos('right');
	    updatePos('bottom');
	}
	function getMargins(horizontal, chartArea) {
	    const maxPadding = chartArea.maxPadding;
	    function marginForPositions(positions) {
	        const margin = {
	            left: 0,
	            top: 0,
	            right: 0,
	            bottom: 0
	        };
	        positions.forEach((pos)=>{
	            margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
	        });
	        return margin;
	    }
	    return horizontal ? marginForPositions([
	        'left',
	        'right'
	    ]) : marginForPositions([
	        'top',
	        'bottom'
	    ]);
	}
	function fitBoxes(boxes, chartArea, params, stacks) {
	    const refitBoxes = [];
	    let i, ilen, layout, box, refit, changed;
	    for(i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i){
	        layout = boxes[i];
	        box = layout.box;
	        box.update(layout.width || chartArea.w, layout.height || chartArea.h, getMargins(layout.horizontal, chartArea));
	        const { same , other  } = updateDims(chartArea, params, layout, stacks);
	        refit |= same && refitBoxes.length;
	        changed = changed || other;
	        if (!box.fullSize) {
	            refitBoxes.push(layout);
	        }
	    }
	    return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
	}
	function setBoxDims(box, left, top, width, height) {
	    box.top = top;
	    box.left = left;
	    box.right = left + width;
	    box.bottom = top + height;
	    box.width = width;
	    box.height = height;
	}
	function placeBoxes(boxes, chartArea, params, stacks) {
	    const userPadding = params.padding;
	    let { x , y  } = chartArea;
	    for (const layout of boxes){
	        const box = layout.box;
	        const stack = stacks[layout.stack] || {
	            count: 1,
	            placed: 0,
	            weight: 1
	        };
	        const weight = layout.stackWeight / stack.weight || 1;
	        if (layout.horizontal) {
	            const width = chartArea.w * weight;
	            const height = stack.size || box.height;
	            if (defined(stack.start)) {
	                y = stack.start;
	            }
	            if (box.fullSize) {
	                setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height);
	            } else {
	                setBoxDims(box, chartArea.left + stack.placed, y, width, height);
	            }
	            stack.start = y;
	            stack.placed += width;
	            y = box.bottom;
	        } else {
	            const height = chartArea.h * weight;
	            const width = stack.size || box.width;
	            if (defined(stack.start)) {
	                x = stack.start;
	            }
	            if (box.fullSize) {
	                setBoxDims(box, x, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
	            } else {
	                setBoxDims(box, x, chartArea.top + stack.placed, width, height);
	            }
	            stack.start = x;
	            stack.placed += height;
	            x = box.right;
	        }
	    }
	    chartArea.x = x;
	    chartArea.y = y;
	}
	var layouts = {
	 addBox (chart, item) {
	        if (!chart.boxes) {
	            chart.boxes = [];
	        }
	        item.fullSize = item.fullSize || false;
	        item.position = item.position || 'top';
	        item.weight = item.weight || 0;
	        item._layers = item._layers || function() {
	            return [
	                {
	                    z: 0,
	                    draw (chartArea) {
	                        item.draw(chartArea);
	                    }
	                }
	            ];
	        };
	        chart.boxes.push(item);
	    },
	 removeBox (chart, layoutItem) {
	        const index = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
	        if (index !== -1) {
	            chart.boxes.splice(index, 1);
	        }
	    },
	 configure (chart, item, options) {
	        item.fullSize = options.fullSize;
	        item.position = options.position;
	        item.weight = options.weight;
	    },
	 update (chart, width, height, minPadding) {
	        if (!chart) {
	            return;
	        }
	        const padding = toPadding(chart.options.layout.padding);
	        const availableWidth = Math.max(width - padding.width, 0);
	        const availableHeight = Math.max(height - padding.height, 0);
	        const boxes = buildLayoutBoxes(chart.boxes);
	        const verticalBoxes = boxes.vertical;
	        const horizontalBoxes = boxes.horizontal;
	        each(chart.boxes, (box)=>{
	            if (typeof box.beforeLayout === 'function') {
	                box.beforeLayout();
	            }
	        });
	        const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap)=>wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
	        const params = Object.freeze({
	            outerWidth: width,
	            outerHeight: height,
	            padding,
	            availableWidth,
	            availableHeight,
	            vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
	            hBoxMaxHeight: availableHeight / 2
	        });
	        const maxPadding = Object.assign({}, padding);
	        updateMaxPadding(maxPadding, toPadding(minPadding));
	        const chartArea = Object.assign({
	            maxPadding,
	            w: availableWidth,
	            h: availableHeight,
	            x: padding.left,
	            y: padding.top
	        }, padding);
	        const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
	        fitBoxes(boxes.fullSize, chartArea, params, stacks);
	        fitBoxes(verticalBoxes, chartArea, params, stacks);
	        if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
	            fitBoxes(verticalBoxes, chartArea, params, stacks);
	        }
	        handleMaxPadding(chartArea);
	        placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
	        chartArea.x += chartArea.w;
	        chartArea.y += chartArea.h;
	        placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
	        chart.chartArea = {
	            left: chartArea.left,
	            top: chartArea.top,
	            right: chartArea.left + chartArea.w,
	            bottom: chartArea.top + chartArea.h,
	            height: chartArea.h,
	            width: chartArea.w
	        };
	        each(boxes.chartArea, (layout)=>{
	            const box = layout.box;
	            Object.assign(box, chart.chartArea);
	            box.update(chartArea.w, chartArea.h, {
	                left: 0,
	                top: 0,
	                right: 0,
	                bottom: 0
	            });
	        });
	    }
	};

	class BasePlatform {
	 acquireContext(canvas, aspectRatio) {}
	 releaseContext(context) {
	        return false;
	    }
	 addEventListener(chart, type, listener) {}
	 removeEventListener(chart, type, listener) {}
	 getDevicePixelRatio() {
	        return 1;
	    }
	 getMaximumSize(element, width, height, aspectRatio) {
	        width = Math.max(0, width || element.width);
	        height = height || element.height;
	        return {
	            width,
	            height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
	        };
	    }
	 isAttached(canvas) {
	        return true;
	    }
	 updateConfig(config) {
	    }
	}

	class BasicPlatform extends BasePlatform {
	    acquireContext(item) {
	        return item && item.getContext && item.getContext('2d') || null;
	    }
	    updateConfig(config) {
	        config.options.animation = false;
	    }
	}

	const EXPANDO_KEY = '$chartjs';
	 const EVENT_TYPES = {
	    touchstart: 'mousedown',
	    touchmove: 'mousemove',
	    touchend: 'mouseup',
	    pointerenter: 'mouseenter',
	    pointerdown: 'mousedown',
	    pointermove: 'mousemove',
	    pointerup: 'mouseup',
	    pointerleave: 'mouseout',
	    pointerout: 'mouseout'
	};
	const isNullOrEmpty = (value)=>value === null || value === '';
	 function initCanvas(canvas, aspectRatio) {
	    const style = canvas.style;
	    const renderHeight = canvas.getAttribute('height');
	    const renderWidth = canvas.getAttribute('width');
	    canvas[EXPANDO_KEY] = {
	        initial: {
	            height: renderHeight,
	            width: renderWidth,
	            style: {
	                display: style.display,
	                height: style.height,
	                width: style.width
	            }
	        }
	    };
	    style.display = style.display || 'block';
	    style.boxSizing = style.boxSizing || 'border-box';
	    if (isNullOrEmpty(renderWidth)) {
	        const displayWidth = readUsedSize(canvas, 'width');
	        if (displayWidth !== undefined) {
	            canvas.width = displayWidth;
	        }
	    }
	    if (isNullOrEmpty(renderHeight)) {
	        if (canvas.style.height === '') {
	            canvas.height = canvas.width / (aspectRatio || 2);
	        } else {
	            const displayHeight = readUsedSize(canvas, 'height');
	            if (displayHeight !== undefined) {
	                canvas.height = displayHeight;
	            }
	        }
	    }
	    return canvas;
	}
	const eventListenerOptions = supportsEventListenerOptions ? {
	    passive: true
	} : false;
	function addListener(node, type, listener) {
	    node.addEventListener(type, listener, eventListenerOptions);
	}
	function removeListener(chart, type, listener) {
	    chart.canvas.removeEventListener(type, listener, eventListenerOptions);
	}
	function fromNativeEvent(event, chart) {
	    const type = EVENT_TYPES[event.type] || event.type;
	    const { x , y  } = getRelativePosition(event, chart);
	    return {
	        type,
	        chart,
	        native: event,
	        x: x !== undefined ? x : null,
	        y: y !== undefined ? y : null
	    };
	}
	function nodeListContains(nodeList, canvas) {
	    for (const node of nodeList){
	        if (node === canvas || node.contains(canvas)) {
	            return true;
	        }
	    }
	}
	function createAttachObserver(chart, type, listener) {
	    const canvas = chart.canvas;
	    const observer = new MutationObserver((entries)=>{
	        let trigger = false;
	        for (const entry of entries){
	            trigger = trigger || nodeListContains(entry.addedNodes, canvas);
	            trigger = trigger && !nodeListContains(entry.removedNodes, canvas);
	        }
	        if (trigger) {
	            listener();
	        }
	    });
	    observer.observe(document, {
	        childList: true,
	        subtree: true
	    });
	    return observer;
	}
	function createDetachObserver(chart, type, listener) {
	    const canvas = chart.canvas;
	    const observer = new MutationObserver((entries)=>{
	        let trigger = false;
	        for (const entry of entries){
	            trigger = trigger || nodeListContains(entry.removedNodes, canvas);
	            trigger = trigger && !nodeListContains(entry.addedNodes, canvas);
	        }
	        if (trigger) {
	            listener();
	        }
	    });
	    observer.observe(document, {
	        childList: true,
	        subtree: true
	    });
	    return observer;
	}
	const drpListeningCharts = new Map();
	let oldDevicePixelRatio = 0;
	function onWindowResize() {
	    const dpr = window.devicePixelRatio;
	    if (dpr === oldDevicePixelRatio) {
	        return;
	    }
	    oldDevicePixelRatio = dpr;
	    drpListeningCharts.forEach((resize, chart)=>{
	        if (chart.currentDevicePixelRatio !== dpr) {
	            resize();
	        }
	    });
	}
	function listenDevicePixelRatioChanges(chart, resize) {
	    if (!drpListeningCharts.size) {
	        window.addEventListener('resize', onWindowResize);
	    }
	    drpListeningCharts.set(chart, resize);
	}
	function unlistenDevicePixelRatioChanges(chart) {
	    drpListeningCharts.delete(chart);
	    if (!drpListeningCharts.size) {
	        window.removeEventListener('resize', onWindowResize);
	    }
	}
	function createResizeObserver(chart, type, listener) {
	    const canvas = chart.canvas;
	    const container = canvas && _getParentNode(canvas);
	    if (!container) {
	        return;
	    }
	    const resize = throttled((width, height)=>{
	        const w = container.clientWidth;
	        listener(width, height);
	        if (w < container.clientWidth) {
	            listener();
	        }
	    }, window);
	    const observer = new ResizeObserver((entries)=>{
	        const entry = entries[0];
	        const width = entry.contentRect.width;
	        const height = entry.contentRect.height;
	        if (width === 0 && height === 0) {
	            return;
	        }
	        resize(width, height);
	    });
	    observer.observe(container);
	    listenDevicePixelRatioChanges(chart, resize);
	    return observer;
	}
	function releaseObserver(chart, type, observer) {
	    if (observer) {
	        observer.disconnect();
	    }
	    if (type === 'resize') {
	        unlistenDevicePixelRatioChanges(chart);
	    }
	}
	function createProxyAndListen(chart, type, listener) {
	    const canvas = chart.canvas;
	    const proxy = throttled((event)=>{
	        if (chart.ctx !== null) {
	            listener(fromNativeEvent(event, chart));
	        }
	    }, chart);
	    addListener(canvas, type, proxy);
	    return proxy;
	}
	 class DomPlatform extends BasePlatform {
	 acquireContext(canvas, aspectRatio) {
	        const context = canvas && canvas.getContext && canvas.getContext('2d');
	        if (context && context.canvas === canvas) {
	            initCanvas(canvas, aspectRatio);
	            return context;
	        }
	        return null;
	    }
	 releaseContext(context) {
	        const canvas = context.canvas;
	        if (!canvas[EXPANDO_KEY]) {
	            return false;
	        }
	        const initial = canvas[EXPANDO_KEY].initial;
	        [
	            'height',
	            'width'
	        ].forEach((prop)=>{
	            const value = initial[prop];
	            if (isNullOrUndef(value)) {
	                canvas.removeAttribute(prop);
	            } else {
	                canvas.setAttribute(prop, value);
	            }
	        });
	        const style = initial.style || {};
	        Object.keys(style).forEach((key)=>{
	            canvas.style[key] = style[key];
	        });
	        canvas.width = canvas.width;
	        delete canvas[EXPANDO_KEY];
	        return true;
	    }
	 addEventListener(chart, type, listener) {
	        this.removeEventListener(chart, type);
	        const proxies = chart.$proxies || (chart.$proxies = {});
	        const handlers = {
	            attach: createAttachObserver,
	            detach: createDetachObserver,
	            resize: createResizeObserver
	        };
	        const handler = handlers[type] || createProxyAndListen;
	        proxies[type] = handler(chart, type, listener);
	    }
	 removeEventListener(chart, type) {
	        const proxies = chart.$proxies || (chart.$proxies = {});
	        const proxy = proxies[type];
	        if (!proxy) {
	            return;
	        }
	        const handlers = {
	            attach: releaseObserver,
	            detach: releaseObserver,
	            resize: releaseObserver
	        };
	        const handler = handlers[type] || removeListener;
	        handler(chart, type, proxy);
	        proxies[type] = undefined;
	    }
	    getDevicePixelRatio() {
	        return window.devicePixelRatio;
	    }
	 getMaximumSize(canvas, width, height, aspectRatio) {
	        return getMaximumSize(canvas, width, height, aspectRatio);
	    }
	 isAttached(canvas) {
	        const container = _getParentNode(canvas);
	        return !!(container && container.isConnected);
	    }
	}

	function _detectPlatform(canvas) {
	    if (!_isDomSupported() || typeof OffscreenCanvas !== 'undefined' && canvas instanceof OffscreenCanvas) {
	        return BasicPlatform;
	    }
	    return DomPlatform;
	}

	let Element$1 = class Element {
	    static defaults = {};
	    static defaultRoutes = undefined;
	    x;
	    y;
	    active = false;
	    options;
	    $animations;
	    tooltipPosition(useFinalPosition) {
	        const { x , y  } = this.getProps([
	            'x',
	            'y'
	        ], useFinalPosition);
	        return {
	            x,
	            y
	        };
	    }
	    hasValue() {
	        return isNumber(this.x) && isNumber(this.y);
	    }
	    getProps(props, final) {
	        const anims = this.$animations;
	        if (!final || !anims) {
	            // let's not create an object, if not needed
	            return this;
	        }
	        const ret = {};
	        props.forEach((prop)=>{
	            ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
	        });
	        return ret;
	    }
	};

	function autoSkip(scale, ticks) {
	    const tickOpts = scale.options.ticks;
	    const determinedMaxTicks = determineMaxTicks(scale);
	    const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
	    const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
	    const numMajorIndices = majorIndices.length;
	    const first = majorIndices[0];
	    const last = majorIndices[numMajorIndices - 1];
	    const newTicks = [];
	    if (numMajorIndices > ticksLimit) {
	        skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
	        return newTicks;
	    }
	    const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
	    if (numMajorIndices > 0) {
	        let i, ilen;
	        const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
	        skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
	        for(i = 0, ilen = numMajorIndices - 1; i < ilen; i++){
	            skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
	        }
	        skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
	        return newTicks;
	    }
	    skip(ticks, newTicks, spacing);
	    return newTicks;
	}
	function determineMaxTicks(scale) {
	    const offset = scale.options.offset;
	    const tickLength = scale._tickSize();
	    const maxScale = scale._length / tickLength + (offset ? 0 : 1);
	    const maxChart = scale._maxLength / tickLength;
	    return Math.floor(Math.min(maxScale, maxChart));
	}
	 function calculateSpacing(majorIndices, ticks, ticksLimit) {
	    const evenMajorSpacing = getEvenSpacing(majorIndices);
	    const spacing = ticks.length / ticksLimit;
	    if (!evenMajorSpacing) {
	        return Math.max(spacing, 1);
	    }
	    const factors = _factorize(evenMajorSpacing);
	    for(let i = 0, ilen = factors.length - 1; i < ilen; i++){
	        const factor = factors[i];
	        if (factor > spacing) {
	            return factor;
	        }
	    }
	    return Math.max(spacing, 1);
	}
	 function getMajorIndices(ticks) {
	    const result = [];
	    let i, ilen;
	    for(i = 0, ilen = ticks.length; i < ilen; i++){
	        if (ticks[i].major) {
	            result.push(i);
	        }
	    }
	    return result;
	}
	 function skipMajors(ticks, newTicks, majorIndices, spacing) {
	    let count = 0;
	    let next = majorIndices[0];
	    let i;
	    spacing = Math.ceil(spacing);
	    for(i = 0; i < ticks.length; i++){
	        if (i === next) {
	            newTicks.push(ticks[i]);
	            count++;
	            next = majorIndices[count * spacing];
	        }
	    }
	}
	 function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
	    const start = valueOrDefault(majorStart, 0);
	    const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
	    let count = 0;
	    let length, i, next;
	    spacing = Math.ceil(spacing);
	    if (majorEnd) {
	        length = majorEnd - majorStart;
	        spacing = length / Math.floor(length / spacing);
	    }
	    next = start;
	    while(next < 0){
	        count++;
	        next = Math.round(start + count * spacing);
	    }
	    for(i = Math.max(start, 0); i < end; i++){
	        if (i === next) {
	            newTicks.push(ticks[i]);
	            count++;
	            next = Math.round(start + count * spacing);
	        }
	    }
	}
	 function getEvenSpacing(arr) {
	    const len = arr.length;
	    let i, diff;
	    if (len < 2) {
	        return false;
	    }
	    for(diff = arr[0], i = 1; i < len; ++i){
	        if (arr[i] - arr[i - 1] !== diff) {
	            return false;
	        }
	    }
	    return diff;
	}

	const reverseAlign = (align)=>align === 'left' ? 'right' : align === 'right' ? 'left' : align;
	const offsetFromEdge = (scale, edge, offset)=>edge === 'top' || edge === 'left' ? scale[edge] + offset : scale[edge] - offset;
	const getTicksLimit = (ticksLength, maxTicksLimit)=>Math.min(maxTicksLimit || ticksLength, ticksLength);
	 function sample(arr, numItems) {
	    const result = [];
	    const increment = arr.length / numItems;
	    const len = arr.length;
	    let i = 0;
	    for(; i < len; i += increment){
	        result.push(arr[Math.floor(i)]);
	    }
	    return result;
	}
	 function getPixelForGridLine(scale, index, offsetGridLines) {
	    const length = scale.ticks.length;
	    const validIndex = Math.min(index, length - 1);
	    const start = scale._startPixel;
	    const end = scale._endPixel;
	    const epsilon = 1e-6;
	    let lineValue = scale.getPixelForTick(validIndex);
	    let offset;
	    if (offsetGridLines) {
	        if (length === 1) {
	            offset = Math.max(lineValue - start, end - lineValue);
	        } else if (index === 0) {
	            offset = (scale.getPixelForTick(1) - lineValue) / 2;
	        } else {
	            offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2;
	        }
	        lineValue += validIndex < index ? offset : -offset;
	        if (lineValue < start - epsilon || lineValue > end + epsilon) {
	            return;
	        }
	    }
	    return lineValue;
	}
	 function garbageCollect(caches, length) {
	    each(caches, (cache)=>{
	        const gc = cache.gc;
	        const gcLen = gc.length / 2;
	        let i;
	        if (gcLen > length) {
	            for(i = 0; i < gcLen; ++i){
	                delete cache.data[gc[i]];
	            }
	            gc.splice(0, gcLen);
	        }
	    });
	}
	 function getTickMarkLength(options) {
	    return options.drawTicks ? options.tickLength : 0;
	}
	 function getTitleHeight(options, fallback) {
	    if (!options.display) {
	        return 0;
	    }
	    const font = toFont(options.font, fallback);
	    const padding = toPadding(options.padding);
	    const lines = isArray(options.text) ? options.text.length : 1;
	    return lines * font.lineHeight + padding.height;
	}
	function createScaleContext(parent, scale) {
	    return createContext(parent, {
	        scale,
	        type: 'scale'
	    });
	}
	function createTickContext(parent, index, tick) {
	    return createContext(parent, {
	        tick,
	        index,
	        type: 'tick'
	    });
	}
	function titleAlign(align, position, reverse) {
	     let ret = _toLeftRightCenter(align);
	    if (reverse && position !== 'right' || !reverse && position === 'right') {
	        ret = reverseAlign(ret);
	    }
	    return ret;
	}
	function titleArgs(scale, offset, position, align) {
	    const { top , left , bottom , right , chart  } = scale;
	    const { chartArea , scales  } = chart;
	    let rotation = 0;
	    let maxWidth, titleX, titleY;
	    const height = bottom - top;
	    const width = right - left;
	    if (scale.isHorizontal()) {
	        titleX = _alignStartEnd(align, left, right);
	        if (isObject(position)) {
	            const positionAxisID = Object.keys(position)[0];
	            const value = position[positionAxisID];
	            titleY = scales[positionAxisID].getPixelForValue(value) + height - offset;
	        } else if (position === 'center') {
	            titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
	        } else {
	            titleY = offsetFromEdge(scale, position, offset);
	        }
	        maxWidth = right - left;
	    } else {
	        if (isObject(position)) {
	            const positionAxisID = Object.keys(position)[0];
	            const value = position[positionAxisID];
	            titleX = scales[positionAxisID].getPixelForValue(value) - width + offset;
	        } else if (position === 'center') {
	            titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
	        } else {
	            titleX = offsetFromEdge(scale, position, offset);
	        }
	        titleY = _alignStartEnd(align, bottom, top);
	        rotation = position === 'left' ? -HALF_PI : HALF_PI;
	    }
	    return {
	        titleX,
	        titleY,
	        maxWidth,
	        rotation
	    };
	}
	class Scale extends Element$1 {
	    constructor(cfg){
	        super();
	         this.id = cfg.id;
	         this.type = cfg.type;
	         this.options = undefined;
	         this.ctx = cfg.ctx;
	         this.chart = cfg.chart;
	         this.top = undefined;
	         this.bottom = undefined;
	         this.left = undefined;
	         this.right = undefined;
	         this.width = undefined;
	         this.height = undefined;
	        this._margins = {
	            left: 0,
	            right: 0,
	            top: 0,
	            bottom: 0
	        };
	         this.maxWidth = undefined;
	         this.maxHeight = undefined;
	         this.paddingTop = undefined;
	         this.paddingBottom = undefined;
	         this.paddingLeft = undefined;
	         this.paddingRight = undefined;
	         this.axis = undefined;
	         this.labelRotation = undefined;
	        this.min = undefined;
	        this.max = undefined;
	        this._range = undefined;
	         this.ticks = [];
	         this._gridLineItems = null;
	         this._labelItems = null;
	         this._labelSizes = null;
	        this._length = 0;
	        this._maxLength = 0;
	        this._longestTextCache = {};
	         this._startPixel = undefined;
	         this._endPixel = undefined;
	        this._reversePixels = false;
	        this._userMax = undefined;
	        this._userMin = undefined;
	        this._suggestedMax = undefined;
	        this._suggestedMin = undefined;
	        this._ticksLength = 0;
	        this._borderValue = 0;
	        this._cache = {};
	        this._dataLimitsCached = false;
	        this.$context = undefined;
	    }
	 init(options) {
	        this.options = options.setContext(this.getContext());
	        this.axis = options.axis;
	        this._userMin = this.parse(options.min);
	        this._userMax = this.parse(options.max);
	        this._suggestedMin = this.parse(options.suggestedMin);
	        this._suggestedMax = this.parse(options.suggestedMax);
	    }
	 parse(raw, index) {
	        return raw;
	    }
	 getUserBounds() {
	        let { _userMin , _userMax , _suggestedMin , _suggestedMax  } = this;
	        _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
	        _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
	        _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
	        _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
	        return {
	            min: finiteOrDefault(_userMin, _suggestedMin),
	            max: finiteOrDefault(_userMax, _suggestedMax),
	            minDefined: isNumberFinite(_userMin),
	            maxDefined: isNumberFinite(_userMax)
	        };
	    }
	 getMinMax(canStack) {
	        let { min , max , minDefined , maxDefined  } = this.getUserBounds();
	        let range;
	        if (minDefined && maxDefined) {
	            return {
	                min,
	                max
	            };
	        }
	        const metas = this.getMatchingVisibleMetas();
	        for(let i = 0, ilen = metas.length; i < ilen; ++i){
	            range = metas[i].controller.getMinMax(this, canStack);
	            if (!minDefined) {
	                min = Math.min(min, range.min);
	            }
	            if (!maxDefined) {
	                max = Math.max(max, range.max);
	            }
	        }
	        min = maxDefined && min > max ? max : min;
	        max = minDefined && min > max ? min : max;
	        return {
	            min: finiteOrDefault(min, finiteOrDefault(max, min)),
	            max: finiteOrDefault(max, finiteOrDefault(min, max))
	        };
	    }
	 getPadding() {
	        return {
	            left: this.paddingLeft || 0,
	            top: this.paddingTop || 0,
	            right: this.paddingRight || 0,
	            bottom: this.paddingBottom || 0
	        };
	    }
	 getTicks() {
	        return this.ticks;
	    }
	 getLabels() {
	        const data = this.chart.data;
	        return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
	    }
	 getLabelItems(chartArea = this.chart.chartArea) {
	        const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
	        return items;
	    }
	    beforeLayout() {
	        this._cache = {};
	        this._dataLimitsCached = false;
	    }
	    beforeUpdate() {
	        callback(this.options.beforeUpdate, [
	            this
	        ]);
	    }
	 update(maxWidth, maxHeight, margins) {
	        const { beginAtZero , grace , ticks: tickOpts  } = this.options;
	        const sampleSize = tickOpts.sampleSize;
	        this.beforeUpdate();
	        this.maxWidth = maxWidth;
	        this.maxHeight = maxHeight;
	        this._margins = margins = Object.assign({
	            left: 0,
	            right: 0,
	            top: 0,
	            bottom: 0
	        }, margins);
	        this.ticks = null;
	        this._labelSizes = null;
	        this._gridLineItems = null;
	        this._labelItems = null;
	        this.beforeSetDimensions();
	        this.setDimensions();
	        this.afterSetDimensions();
	        this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
	        if (!this._dataLimitsCached) {
	            this.beforeDataLimits();
	            this.determineDataLimits();
	            this.afterDataLimits();
	            this._range = _addGrace(this, grace, beginAtZero);
	            this._dataLimitsCached = true;
	        }
	        this.beforeBuildTicks();
	        this.ticks = this.buildTicks() || [];
	        this.afterBuildTicks();
	        const samplingEnabled = sampleSize < this.ticks.length;
	        this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
	        this.configure();
	        this.beforeCalculateLabelRotation();
	        this.calculateLabelRotation();
	        this.afterCalculateLabelRotation();
	        if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto')) {
	            this.ticks = autoSkip(this, this.ticks);
	            this._labelSizes = null;
	            this.afterAutoSkip();
	        }
	        if (samplingEnabled) {
	            this._convertTicksToLabels(this.ticks);
	        }
	        this.beforeFit();
	        this.fit();
	        this.afterFit();
	        this.afterUpdate();
	    }
	 configure() {
	        let reversePixels = this.options.reverse;
	        let startPixel, endPixel;
	        if (this.isHorizontal()) {
	            startPixel = this.left;
	            endPixel = this.right;
	        } else {
	            startPixel = this.top;
	            endPixel = this.bottom;
	            reversePixels = !reversePixels;
	        }
	        this._startPixel = startPixel;
	        this._endPixel = endPixel;
	        this._reversePixels = reversePixels;
	        this._length = endPixel - startPixel;
	        this._alignToPixels = this.options.alignToPixels;
	    }
	    afterUpdate() {
	        callback(this.options.afterUpdate, [
	            this
	        ]);
	    }
	    beforeSetDimensions() {
	        callback(this.options.beforeSetDimensions, [
	            this
	        ]);
	    }
	    setDimensions() {
	        if (this.isHorizontal()) {
	            this.width = this.maxWidth;
	            this.left = 0;
	            this.right = this.width;
	        } else {
	            this.height = this.maxHeight;
	            this.top = 0;
	            this.bottom = this.height;
	        }
	        this.paddingLeft = 0;
	        this.paddingTop = 0;
	        this.paddingRight = 0;
	        this.paddingBottom = 0;
	    }
	    afterSetDimensions() {
	        callback(this.options.afterSetDimensions, [
	            this
	        ]);
	    }
	    _callHooks(name) {
	        this.chart.notifyPlugins(name, this.getContext());
	        callback(this.options[name], [
	            this
	        ]);
	    }
	    beforeDataLimits() {
	        this._callHooks('beforeDataLimits');
	    }
	    determineDataLimits() {}
	    afterDataLimits() {
	        this._callHooks('afterDataLimits');
	    }
	    beforeBuildTicks() {
	        this._callHooks('beforeBuildTicks');
	    }
	 buildTicks() {
	        return [];
	    }
	    afterBuildTicks() {
	        this._callHooks('afterBuildTicks');
	    }
	    beforeTickToLabelConversion() {
	        callback(this.options.beforeTickToLabelConversion, [
	            this
	        ]);
	    }
	 generateTickLabels(ticks) {
	        const tickOpts = this.options.ticks;
	        let i, ilen, tick;
	        for(i = 0, ilen = ticks.length; i < ilen; i++){
	            tick = ticks[i];
	            tick.label = callback(tickOpts.callback, [
	                tick.value,
	                i,
	                ticks
	            ], this);
	        }
	    }
	    afterTickToLabelConversion() {
	        callback(this.options.afterTickToLabelConversion, [
	            this
	        ]);
	    }
	    beforeCalculateLabelRotation() {
	        callback(this.options.beforeCalculateLabelRotation, [
	            this
	        ]);
	    }
	    calculateLabelRotation() {
	        const options = this.options;
	        const tickOpts = options.ticks;
	        const numTicks = getTicksLimit(this.ticks.length, options.ticks.maxTicksLimit);
	        const minRotation = tickOpts.minRotation || 0;
	        const maxRotation = tickOpts.maxRotation;
	        let labelRotation = minRotation;
	        let tickWidth, maxHeight, maxLabelDiagonal;
	        if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
	            this.labelRotation = minRotation;
	            return;
	        }
	        const labelSizes = this._getLabelSizes();
	        const maxLabelWidth = labelSizes.widest.width;
	        const maxLabelHeight = labelSizes.highest.height;
	        const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
	        tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
	        if (maxLabelWidth + 6 > tickWidth) {
	            tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
	            maxHeight = this.maxHeight - getTickMarkLength(options.grid) - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
	            maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
	            labelRotation = toDegrees(Math.min(Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))));
	            labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
	        }
	        this.labelRotation = labelRotation;
	    }
	    afterCalculateLabelRotation() {
	        callback(this.options.afterCalculateLabelRotation, [
	            this
	        ]);
	    }
	    afterAutoSkip() {}
	    beforeFit() {
	        callback(this.options.beforeFit, [
	            this
	        ]);
	    }
	    fit() {
	        const minSize = {
	            width: 0,
	            height: 0
	        };
	        const { chart , options: { ticks: tickOpts , title: titleOpts , grid: gridOpts  }  } = this;
	        const display = this._isVisible();
	        const isHorizontal = this.isHorizontal();
	        if (display) {
	            const titleHeight = getTitleHeight(titleOpts, chart.options.font);
	            if (isHorizontal) {
	                minSize.width = this.maxWidth;
	                minSize.height = getTickMarkLength(gridOpts) + titleHeight;
	            } else {
	                minSize.height = this.maxHeight;
	                minSize.width = getTickMarkLength(gridOpts) + titleHeight;
	            }
	            if (tickOpts.display && this.ticks.length) {
	                const { first , last , widest , highest  } = this._getLabelSizes();
	                const tickPadding = tickOpts.padding * 2;
	                const angleRadians = toRadians(this.labelRotation);
	                const cos = Math.cos(angleRadians);
	                const sin = Math.sin(angleRadians);
	                if (isHorizontal) {
	                    const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
	                    minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
	                } else {
	                    const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
	                    minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
	                }
	                this._calculatePadding(first, last, sin, cos);
	            }
	        }
	        this._handleMargins();
	        if (isHorizontal) {
	            this.width = this._length = chart.width - this._margins.left - this._margins.right;
	            this.height = minSize.height;
	        } else {
	            this.width = minSize.width;
	            this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
	        }
	    }
	    _calculatePadding(first, last, sin, cos) {
	        const { ticks: { align , padding  } , position  } = this.options;
	        const isRotated = this.labelRotation !== 0;
	        const labelsBelowTicks = position !== 'top' && this.axis === 'x';
	        if (this.isHorizontal()) {
	            const offsetLeft = this.getPixelForTick(0) - this.left;
	            const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
	            let paddingLeft = 0;
	            let paddingRight = 0;
	            if (isRotated) {
	                if (labelsBelowTicks) {
	                    paddingLeft = cos * first.width;
	                    paddingRight = sin * last.height;
	                } else {
	                    paddingLeft = sin * first.height;
	                    paddingRight = cos * last.width;
	                }
	            } else if (align === 'start') {
	                paddingRight = last.width;
	            } else if (align === 'end') {
	                paddingLeft = first.width;
	            } else if (align !== 'inner') {
	                paddingLeft = first.width / 2;
	                paddingRight = last.width / 2;
	            }
	            this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
	            this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
	        } else {
	            let paddingTop = last.height / 2;
	            let paddingBottom = first.height / 2;
	            if (align === 'start') {
	                paddingTop = 0;
	                paddingBottom = first.height;
	            } else if (align === 'end') {
	                paddingTop = last.height;
	                paddingBottom = 0;
	            }
	            this.paddingTop = paddingTop + padding;
	            this.paddingBottom = paddingBottom + padding;
	        }
	    }
	 _handleMargins() {
	        if (this._margins) {
	            this._margins.left = Math.max(this.paddingLeft, this._margins.left);
	            this._margins.top = Math.max(this.paddingTop, this._margins.top);
	            this._margins.right = Math.max(this.paddingRight, this._margins.right);
	            this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
	        }
	    }
	    afterFit() {
	        callback(this.options.afterFit, [
	            this
	        ]);
	    }
	 isHorizontal() {
	        const { axis , position  } = this.options;
	        return position === 'top' || position === 'bottom' || axis === 'x';
	    }
	 isFullSize() {
	        return this.options.fullSize;
	    }
	 _convertTicksToLabels(ticks) {
	        this.beforeTickToLabelConversion();
	        this.generateTickLabels(ticks);
	        let i, ilen;
	        for(i = 0, ilen = ticks.length; i < ilen; i++){
	            if (isNullOrUndef(ticks[i].label)) {
	                ticks.splice(i, 1);
	                ilen--;
	                i--;
	            }
	        }
	        this.afterTickToLabelConversion();
	    }
	 _getLabelSizes() {
	        let labelSizes = this._labelSizes;
	        if (!labelSizes) {
	            const sampleSize = this.options.ticks.sampleSize;
	            let ticks = this.ticks;
	            if (sampleSize < ticks.length) {
	                ticks = sample(ticks, sampleSize);
	            }
	            this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length, this.options.ticks.maxTicksLimit);
	        }
	        return labelSizes;
	    }
	 _computeLabelSizes(ticks, length, maxTicksLimit) {
	        const { ctx , _longestTextCache: caches  } = this;
	        const widths = [];
	        const heights = [];
	        const increment = Math.floor(length / getTicksLimit(length, maxTicksLimit));
	        let widestLabelSize = 0;
	        let highestLabelSize = 0;
	        let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
	        for(i = 0; i < length; i += increment){
	            label = ticks[i].label;
	            tickFont = this._resolveTickFontOptions(i);
	            ctx.font = fontString = tickFont.string;
	            cache = caches[fontString] = caches[fontString] || {
	                data: {},
	                gc: []
	            };
	            lineHeight = tickFont.lineHeight;
	            width = height = 0;
	            if (!isNullOrUndef(label) && !isArray(label)) {
	                width = _measureText(ctx, cache.data, cache.gc, width, label);
	                height = lineHeight;
	            } else if (isArray(label)) {
	                for(j = 0, jlen = label.length; j < jlen; ++j){
	                    nestedLabel =  label[j];
	                    if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
	                        width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
	                        height += lineHeight;
	                    }
	                }
	            }
	            widths.push(width);
	            heights.push(height);
	            widestLabelSize = Math.max(width, widestLabelSize);
	            highestLabelSize = Math.max(height, highestLabelSize);
	        }
	        garbageCollect(caches, length);
	        const widest = widths.indexOf(widestLabelSize);
	        const highest = heights.indexOf(highestLabelSize);
	        const valueAt = (idx)=>({
	                width: widths[idx] || 0,
	                height: heights[idx] || 0
	            });
	        return {
	            first: valueAt(0),
	            last: valueAt(length - 1),
	            widest: valueAt(widest),
	            highest: valueAt(highest),
	            widths,
	            heights
	        };
	    }
	 getLabelForValue(value) {
	        return value;
	    }
	 getPixelForValue(value, index) {
	        return NaN;
	    }
	 getValueForPixel(pixel) {}
	 getPixelForTick(index) {
	        const ticks = this.ticks;
	        if (index < 0 || index > ticks.length - 1) {
	            return null;
	        }
	        return this.getPixelForValue(ticks[index].value);
	    }
	 getPixelForDecimal(decimal) {
	        if (this._reversePixels) {
	            decimal = 1 - decimal;
	        }
	        const pixel = this._startPixel + decimal * this._length;
	        return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
	    }
	 getDecimalForPixel(pixel) {
	        const decimal = (pixel - this._startPixel) / this._length;
	        return this._reversePixels ? 1 - decimal : decimal;
	    }
	 getBasePixel() {
	        return this.getPixelForValue(this.getBaseValue());
	    }
	 getBaseValue() {
	        const { min , max  } = this;
	        return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
	    }
	 getContext(index) {
	        const ticks = this.ticks || [];
	        if (index >= 0 && index < ticks.length) {
	            const tick = ticks[index];
	            return tick.$context || (tick.$context = createTickContext(this.getContext(), index, tick));
	        }
	        return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
	    }
	 _tickSize() {
	        const optionTicks = this.options.ticks;
	        const rot = toRadians(this.labelRotation);
	        const cos = Math.abs(Math.cos(rot));
	        const sin = Math.abs(Math.sin(rot));
	        const labelSizes = this._getLabelSizes();
	        const padding = optionTicks.autoSkipPadding || 0;
	        const w = labelSizes ? labelSizes.widest.width + padding : 0;
	        const h = labelSizes ? labelSizes.highest.height + padding : 0;
	        return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin;
	    }
	 _isVisible() {
	        const display = this.options.display;
	        if (display !== 'auto') {
	            return !!display;
	        }
	        return this.getMatchingVisibleMetas().length > 0;
	    }
	 _computeGridLineItems(chartArea) {
	        const axis = this.axis;
	        const chart = this.chart;
	        const options = this.options;
	        const { grid , position , border  } = options;
	        const offset = grid.offset;
	        const isHorizontal = this.isHorizontal();
	        const ticks = this.ticks;
	        const ticksLength = ticks.length + (offset ? 1 : 0);
	        const tl = getTickMarkLength(grid);
	        const items = [];
	        const borderOpts = border.setContext(this.getContext());
	        const axisWidth = borderOpts.display ? borderOpts.width : 0;
	        const axisHalfWidth = axisWidth / 2;
	        const alignBorderValue = function(pixel) {
	            return _alignPixel(chart, pixel, axisWidth);
	        };
	        let borderValue, i, lineValue, alignedLineValue;
	        let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
	        if (position === 'top') {
	            borderValue = alignBorderValue(this.bottom);
	            ty1 = this.bottom - tl;
	            ty2 = borderValue - axisHalfWidth;
	            y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
	            y2 = chartArea.bottom;
	        } else if (position === 'bottom') {
	            borderValue = alignBorderValue(this.top);
	            y1 = chartArea.top;
	            y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
	            ty1 = borderValue + axisHalfWidth;
	            ty2 = this.top + tl;
	        } else if (position === 'left') {
	            borderValue = alignBorderValue(this.right);
	            tx1 = this.right - tl;
	            tx2 = borderValue - axisHalfWidth;
	            x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
	            x2 = chartArea.right;
	        } else if (position === 'right') {
	            borderValue = alignBorderValue(this.left);
	            x1 = chartArea.left;
	            x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
	            tx1 = borderValue + axisHalfWidth;
	            tx2 = this.left + tl;
	        } else if (axis === 'x') {
	            if (position === 'center') {
	                borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
	            } else if (isObject(position)) {
	                const positionAxisID = Object.keys(position)[0];
	                const value = position[positionAxisID];
	                borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
	            }
	            y1 = chartArea.top;
	            y2 = chartArea.bottom;
	            ty1 = borderValue + axisHalfWidth;
	            ty2 = ty1 + tl;
	        } else if (axis === 'y') {
	            if (position === 'center') {
	                borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
	            } else if (isObject(position)) {
	                const positionAxisID = Object.keys(position)[0];
	                const value = position[positionAxisID];
	                borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
	            }
	            tx1 = borderValue - axisHalfWidth;
	            tx2 = tx1 - tl;
	            x1 = chartArea.left;
	            x2 = chartArea.right;
	        }
	        const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength);
	        const step = Math.max(1, Math.ceil(ticksLength / limit));
	        for(i = 0; i < ticksLength; i += step){
	            const context = this.getContext(i);
	            const optsAtIndex = grid.setContext(context);
	            const optsAtIndexBorder = border.setContext(context);
	            const lineWidth = optsAtIndex.lineWidth;
	            const lineColor = optsAtIndex.color;
	            const borderDash = optsAtIndexBorder.dash || [];
	            const borderDashOffset = optsAtIndexBorder.dashOffset;
	            const tickWidth = optsAtIndex.tickWidth;
	            const tickColor = optsAtIndex.tickColor;
	            const tickBorderDash = optsAtIndex.tickBorderDash || [];
	            const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
	            lineValue = getPixelForGridLine(this, i, offset);
	            if (lineValue === undefined) {
	                continue;
	            }
	            alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
	            if (isHorizontal) {
	                tx1 = tx2 = x1 = x2 = alignedLineValue;
	            } else {
	                ty1 = ty2 = y1 = y2 = alignedLineValue;
	            }
	            items.push({
	                tx1,
	                ty1,
	                tx2,
	                ty2,
	                x1,
	                y1,
	                x2,
	                y2,
	                width: lineWidth,
	                color: lineColor,
	                borderDash,
	                borderDashOffset,
	                tickWidth,
	                tickColor,
	                tickBorderDash,
	                tickBorderDashOffset
	            });
	        }
	        this._ticksLength = ticksLength;
	        this._borderValue = borderValue;
	        return items;
	    }
	 _computeLabelItems(chartArea) {
	        const axis = this.axis;
	        const options = this.options;
	        const { position , ticks: optionTicks  } = options;
	        const isHorizontal = this.isHorizontal();
	        const ticks = this.ticks;
	        const { align , crossAlign , padding , mirror  } = optionTicks;
	        const tl = getTickMarkLength(options.grid);
	        const tickAndPadding = tl + padding;
	        const hTickAndPadding = mirror ? -padding : tickAndPadding;
	        const rotation = -toRadians(this.labelRotation);
	        const items = [];
	        let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
	        let textBaseline = 'middle';
	        if (position === 'top') {
	            y = this.bottom - hTickAndPadding;
	            textAlign = this._getXAxisLabelAlignment();
	        } else if (position === 'bottom') {
	            y = this.top + hTickAndPadding;
	            textAlign = this._getXAxisLabelAlignment();
	        } else if (position === 'left') {
	            const ret = this._getYAxisLabelAlignment(tl);
	            textAlign = ret.textAlign;
	            x = ret.x;
	        } else if (position === 'right') {
	            const ret = this._getYAxisLabelAlignment(tl);
	            textAlign = ret.textAlign;
	            x = ret.x;
	        } else if (axis === 'x') {
	            if (position === 'center') {
	                y = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
	            } else if (isObject(position)) {
	                const positionAxisID = Object.keys(position)[0];
	                const value = position[positionAxisID];
	                y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
	            }
	            textAlign = this._getXAxisLabelAlignment();
	        } else if (axis === 'y') {
	            if (position === 'center') {
	                x = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
	            } else if (isObject(position)) {
	                const positionAxisID = Object.keys(position)[0];
	                const value = position[positionAxisID];
	                x = this.chart.scales[positionAxisID].getPixelForValue(value);
	            }
	            textAlign = this._getYAxisLabelAlignment(tl).textAlign;
	        }
	        if (axis === 'y') {
	            if (align === 'start') {
	                textBaseline = 'top';
	            } else if (align === 'end') {
	                textBaseline = 'bottom';
	            }
	        }
	        const labelSizes = this._getLabelSizes();
	        for(i = 0, ilen = ticks.length; i < ilen; ++i){
	            tick = ticks[i];
	            label = tick.label;
	            const optsAtIndex = optionTicks.setContext(this.getContext(i));
	            pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
	            font = this._resolveTickFontOptions(i);
	            lineHeight = font.lineHeight;
	            lineCount = isArray(label) ? label.length : 1;
	            const halfCount = lineCount / 2;
	            const color = optsAtIndex.color;
	            const strokeColor = optsAtIndex.textStrokeColor;
	            const strokeWidth = optsAtIndex.textStrokeWidth;
	            let tickTextAlign = textAlign;
	            if (isHorizontal) {
	                x = pixel;
	                if (textAlign === 'inner') {
	                    if (i === ilen - 1) {
	                        tickTextAlign = !this.options.reverse ? 'right' : 'left';
	                    } else if (i === 0) {
	                        tickTextAlign = !this.options.reverse ? 'left' : 'right';
	                    } else {
	                        tickTextAlign = 'center';
	                    }
	                }
	                if (position === 'top') {
	                    if (crossAlign === 'near' || rotation !== 0) {
	                        textOffset = -lineCount * lineHeight + lineHeight / 2;
	                    } else if (crossAlign === 'center') {
	                        textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
	                    } else {
	                        textOffset = -labelSizes.highest.height + lineHeight / 2;
	                    }
	                } else {
	                    if (crossAlign === 'near' || rotation !== 0) {
	                        textOffset = lineHeight / 2;
	                    } else if (crossAlign === 'center') {
	                        textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
	                    } else {
	                        textOffset = labelSizes.highest.height - lineCount * lineHeight;
	                    }
	                }
	                if (mirror) {
	                    textOffset *= -1;
	                }
	                if (rotation !== 0 && !optsAtIndex.showLabelBackdrop) {
	                    x += lineHeight / 2 * Math.sin(rotation);
	                }
	            } else {
	                y = pixel;
	                textOffset = (1 - lineCount) * lineHeight / 2;
	            }
	            let backdrop;
	            if (optsAtIndex.showLabelBackdrop) {
	                const labelPadding = toPadding(optsAtIndex.backdropPadding);
	                const height = labelSizes.heights[i];
	                const width = labelSizes.widths[i];
	                let top = textOffset - labelPadding.top;
	                let left = 0 - labelPadding.left;
	                switch(textBaseline){
	                    case 'middle':
	                        top -= height / 2;
	                        break;
	                    case 'bottom':
	                        top -= height;
	                        break;
	                }
	                switch(textAlign){
	                    case 'center':
	                        left -= width / 2;
	                        break;
	                    case 'right':
	                        left -= width;
	                        break;
	                    case 'inner':
	                        if (i === ilen - 1) {
	                            left -= width;
	                        } else if (i > 0) {
	                            left -= width / 2;
	                        }
	                        break;
	                }
	                backdrop = {
	                    left,
	                    top,
	                    width: width + labelPadding.width,
	                    height: height + labelPadding.height,
	                    color: optsAtIndex.backdropColor
	                };
	            }
	            items.push({
	                label,
	                font,
	                textOffset,
	                options: {
	                    rotation,
	                    color,
	                    strokeColor,
	                    strokeWidth,
	                    textAlign: tickTextAlign,
	                    textBaseline,
	                    translation: [
	                        x,
	                        y
	                    ],
	                    backdrop
	                }
	            });
	        }
	        return items;
	    }
	    _getXAxisLabelAlignment() {
	        const { position , ticks  } = this.options;
	        const rotation = -toRadians(this.labelRotation);
	        if (rotation) {
	            return position === 'top' ? 'left' : 'right';
	        }
	        let align = 'center';
	        if (ticks.align === 'start') {
	            align = 'left';
	        } else if (ticks.align === 'end') {
	            align = 'right';
	        } else if (ticks.align === 'inner') {
	            align = 'inner';
	        }
	        return align;
	    }
	    _getYAxisLabelAlignment(tl) {
	        const { position , ticks: { crossAlign , mirror , padding  }  } = this.options;
	        const labelSizes = this._getLabelSizes();
	        const tickAndPadding = tl + padding;
	        const widest = labelSizes.widest.width;
	        let textAlign;
	        let x;
	        if (position === 'left') {
	            if (mirror) {
	                x = this.right + padding;
	                if (crossAlign === 'near') {
	                    textAlign = 'left';
	                } else if (crossAlign === 'center') {
	                    textAlign = 'center';
	                    x += widest / 2;
	                } else {
	                    textAlign = 'right';
	                    x += widest;
	                }
	            } else {
	                x = this.right - tickAndPadding;
	                if (crossAlign === 'near') {
	                    textAlign = 'right';
	                } else if (crossAlign === 'center') {
	                    textAlign = 'center';
	                    x -= widest / 2;
	                } else {
	                    textAlign = 'left';
	                    x = this.left;
	                }
	            }
	        } else if (position === 'right') {
	            if (mirror) {
	                x = this.left + padding;
	                if (crossAlign === 'near') {
	                    textAlign = 'right';
	                } else if (crossAlign === 'center') {
	                    textAlign = 'center';
	                    x -= widest / 2;
	                } else {
	                    textAlign = 'left';
	                    x -= widest;
	                }
	            } else {
	                x = this.left + tickAndPadding;
	                if (crossAlign === 'near') {
	                    textAlign = 'left';
	                } else if (crossAlign === 'center') {
	                    textAlign = 'center';
	                    x += widest / 2;
	                } else {
	                    textAlign = 'right';
	                    x = this.right;
	                }
	            }
	        } else {
	            textAlign = 'right';
	        }
	        return {
	            textAlign,
	            x
	        };
	    }
	 _computeLabelArea() {
	        if (this.options.ticks.mirror) {
	            return;
	        }
	        const chart = this.chart;
	        const position = this.options.position;
	        if (position === 'left' || position === 'right') {
	            return {
	                top: 0,
	                left: this.left,
	                bottom: chart.height,
	                right: this.right
	            };
	        }
	        if (position === 'top' || position === 'bottom') {
	            return {
	                top: this.top,
	                left: 0,
	                bottom: this.bottom,
	                right: chart.width
	            };
	        }
	    }
	 drawBackground() {
	        const { ctx , options: { backgroundColor  } , left , top , width , height  } = this;
	        if (backgroundColor) {
	            ctx.save();
	            ctx.fillStyle = backgroundColor;
	            ctx.fillRect(left, top, width, height);
	            ctx.restore();
	        }
	    }
	    getLineWidthForValue(value) {
	        const grid = this.options.grid;
	        if (!this._isVisible() || !grid.display) {
	            return 0;
	        }
	        const ticks = this.ticks;
	        const index = ticks.findIndex((t)=>t.value === value);
	        if (index >= 0) {
	            const opts = grid.setContext(this.getContext(index));
	            return opts.lineWidth;
	        }
	        return 0;
	    }
	 drawGrid(chartArea) {
	        const grid = this.options.grid;
	        const ctx = this.ctx;
	        const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
	        let i, ilen;
	        const drawLine = (p1, p2, style)=>{
	            if (!style.width || !style.color) {
	                return;
	            }
	            ctx.save();
	            ctx.lineWidth = style.width;
	            ctx.strokeStyle = style.color;
	            ctx.setLineDash(style.borderDash || []);
	            ctx.lineDashOffset = style.borderDashOffset;
	            ctx.beginPath();
	            ctx.moveTo(p1.x, p1.y);
	            ctx.lineTo(p2.x, p2.y);
	            ctx.stroke();
	            ctx.restore();
	        };
	        if (grid.display) {
	            for(i = 0, ilen = items.length; i < ilen; ++i){
	                const item = items[i];
	                if (grid.drawOnChartArea) {
	                    drawLine({
	                        x: item.x1,
	                        y: item.y1
	                    }, {
	                        x: item.x2,
	                        y: item.y2
	                    }, item);
	                }
	                if (grid.drawTicks) {
	                    drawLine({
	                        x: item.tx1,
	                        y: item.ty1
	                    }, {
	                        x: item.tx2,
	                        y: item.ty2
	                    }, {
	                        color: item.tickColor,
	                        width: item.tickWidth,
	                        borderDash: item.tickBorderDash,
	                        borderDashOffset: item.tickBorderDashOffset
	                    });
	                }
	            }
	        }
	    }
	 drawBorder() {
	        const { chart , ctx , options: { border , grid  }  } = this;
	        const borderOpts = border.setContext(this.getContext());
	        const axisWidth = border.display ? borderOpts.width : 0;
	        if (!axisWidth) {
	            return;
	        }
	        const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
	        const borderValue = this._borderValue;
	        let x1, x2, y1, y2;
	        if (this.isHorizontal()) {
	            x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2;
	            x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2;
	            y1 = y2 = borderValue;
	        } else {
	            y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2;
	            y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
	            x1 = x2 = borderValue;
	        }
	        ctx.save();
	        ctx.lineWidth = borderOpts.width;
	        ctx.strokeStyle = borderOpts.color;
	        ctx.beginPath();
	        ctx.moveTo(x1, y1);
	        ctx.lineTo(x2, y2);
	        ctx.stroke();
	        ctx.restore();
	    }
	 drawLabels(chartArea) {
	        const optionTicks = this.options.ticks;
	        if (!optionTicks.display) {
	            return;
	        }
	        const ctx = this.ctx;
	        const area = this._computeLabelArea();
	        if (area) {
	            clipArea(ctx, area);
	        }
	        const items = this.getLabelItems(chartArea);
	        for (const item of items){
	            const renderTextOptions = item.options;
	            const tickFont = item.font;
	            const label = item.label;
	            const y = item.textOffset;
	            renderText(ctx, label, 0, y, tickFont, renderTextOptions);
	        }
	        if (area) {
	            unclipArea(ctx);
	        }
	    }
	 drawTitle() {
	        const { ctx , options: { position , title , reverse  }  } = this;
	        if (!title.display) {
	            return;
	        }
	        const font = toFont(title.font);
	        const padding = toPadding(title.padding);
	        const align = title.align;
	        let offset = font.lineHeight / 2;
	        if (position === 'bottom' || position === 'center' || isObject(position)) {
	            offset += padding.bottom;
	            if (isArray(title.text)) {
	                offset += font.lineHeight * (title.text.length - 1);
	            }
	        } else {
	            offset += padding.top;
	        }
	        const { titleX , titleY , maxWidth , rotation  } = titleArgs(this, offset, position, align);
	        renderText(ctx, title.text, 0, 0, font, {
	            color: title.color,
	            maxWidth,
	            rotation,
	            textAlign: titleAlign(align, position, reverse),
	            textBaseline: 'middle',
	            translation: [
	                titleX,
	                titleY
	            ]
	        });
	    }
	    draw(chartArea) {
	        if (!this._isVisible()) {
	            return;
	        }
	        this.drawBackground();
	        this.drawGrid(chartArea);
	        this.drawBorder();
	        this.drawTitle();
	        this.drawLabels(chartArea);
	    }
	 _layers() {
	        const opts = this.options;
	        const tz = opts.ticks && opts.ticks.z || 0;
	        const gz = valueOrDefault(opts.grid && opts.grid.z, -1);
	        const bz = valueOrDefault(opts.border && opts.border.z, 0);
	        if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
	            return [
	                {
	                    z: tz,
	                    draw: (chartArea)=>{
	                        this.draw(chartArea);
	                    }
	                }
	            ];
	        }
	        return [
	            {
	                z: gz,
	                draw: (chartArea)=>{
	                    this.drawBackground();
	                    this.drawGrid(chartArea);
	                    this.drawTitle();
	                }
	            },
	            {
	                z: bz,
	                draw: ()=>{
	                    this.drawBorder();
	                }
	            },
	            {
	                z: tz,
	                draw: (chartArea)=>{
	                    this.drawLabels(chartArea);
	                }
	            }
	        ];
	    }
	 getMatchingVisibleMetas(type) {
	        const metas = this.chart.getSortedVisibleDatasetMetas();
	        const axisID = this.axis + 'AxisID';
	        const result = [];
	        let i, ilen;
	        for(i = 0, ilen = metas.length; i < ilen; ++i){
	            const meta = metas[i];
	            if (meta[axisID] === this.id && (!type || meta.type === type)) {
	                result.push(meta);
	            }
	        }
	        return result;
	    }
	 _resolveTickFontOptions(index) {
	        const opts = this.options.ticks.setContext(this.getContext(index));
	        return toFont(opts.font);
	    }
	 _maxDigits() {
	        const fontSize = this._resolveTickFontOptions(0).lineHeight;
	        return (this.isHorizontal() ? this.width : this.height) / fontSize;
	    }
	}

	class TypedRegistry {
	    constructor(type, scope, override){
	        this.type = type;
	        this.scope = scope;
	        this.override = override;
	        this.items = Object.create(null);
	    }
	    isForType(type) {
	        return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
	    }
	 register(item) {
	        const proto = Object.getPrototypeOf(item);
	        let parentScope;
	        if (isIChartComponent(proto)) {
	            parentScope = this.register(proto);
	        }
	        const items = this.items;
	        const id = item.id;
	        const scope = this.scope + '.' + id;
	        if (!id) {
	            throw new Error('class does not have id: ' + item);
	        }
	        if (id in items) {
	            return scope;
	        }
	        items[id] = item;
	        registerDefaults(item, scope, parentScope);
	        if (this.override) {
	            defaults.override(item.id, item.overrides);
	        }
	        return scope;
	    }
	 get(id) {
	        return this.items[id];
	    }
	 unregister(item) {
	        const items = this.items;
	        const id = item.id;
	        const scope = this.scope;
	        if (id in items) {
	            delete items[id];
	        }
	        if (scope && id in defaults[scope]) {
	            delete defaults[scope][id];
	            if (this.override) {
	                delete overrides[id];
	            }
	        }
	    }
	}
	function registerDefaults(item, scope, parentScope) {
	    const itemDefaults = merge(Object.create(null), [
	        parentScope ? defaults.get(parentScope) : {},
	        defaults.get(scope),
	        item.defaults
	    ]);
	    defaults.set(scope, itemDefaults);
	    if (item.defaultRoutes) {
	        routeDefaults(scope, item.defaultRoutes);
	    }
	    if (item.descriptors) {
	        defaults.describe(scope, item.descriptors);
	    }
	}
	function routeDefaults(scope, routes) {
	    Object.keys(routes).forEach((property)=>{
	        const propertyParts = property.split('.');
	        const sourceName = propertyParts.pop();
	        const sourceScope = [
	            scope
	        ].concat(propertyParts).join('.');
	        const parts = routes[property].split('.');
	        const targetName = parts.pop();
	        const targetScope = parts.join('.');
	        defaults.route(sourceScope, sourceName, targetScope, targetName);
	    });
	}
	function isIChartComponent(proto) {
	    return 'id' in proto && 'defaults' in proto;
	}

	class Registry {
	    constructor(){
	        this.controllers = new TypedRegistry(DatasetController, 'datasets', true);
	        this.elements = new TypedRegistry(Element$1, 'elements');
	        this.plugins = new TypedRegistry(Object, 'plugins');
	        this.scales = new TypedRegistry(Scale, 'scales');
	        this._typedRegistries = [
	            this.controllers,
	            this.scales,
	            this.elements
	        ];
	    }
	 add(...args) {
	        this._each('register', args);
	    }
	    remove(...args) {
	        this._each('unregister', args);
	    }
	 addControllers(...args) {
	        this._each('register', args, this.controllers);
	    }
	 addElements(...args) {
	        this._each('register', args, this.elements);
	    }
	 addPlugins(...args) {
	        this._each('register', args, this.plugins);
	    }
	 addScales(...args) {
	        this._each('register', args, this.scales);
	    }
	 getController(id) {
	        return this._get(id, this.controllers, 'controller');
	    }
	 getElement(id) {
	        return this._get(id, this.elements, 'element');
	    }
	 getPlugin(id) {
	        return this._get(id, this.plugins, 'plugin');
	    }
	 getScale(id) {
	        return this._get(id, this.scales, 'scale');
	    }
	 removeControllers(...args) {
	        this._each('unregister', args, this.controllers);
	    }
	 removeElements(...args) {
	        this._each('unregister', args, this.elements);
	    }
	 removePlugins(...args) {
	        this._each('unregister', args, this.plugins);
	    }
	 removeScales(...args) {
	        this._each('unregister', args, this.scales);
	    }
	 _each(method, args, typedRegistry) {
	        [
	            ...args
	        ].forEach((arg)=>{
	            const reg = typedRegistry || this._getRegistryForType(arg);
	            if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
	                this._exec(method, reg, arg);
	            } else {
	                each(arg, (item)=>{
	                    const itemReg = typedRegistry || this._getRegistryForType(item);
	                    this._exec(method, itemReg, item);
	                });
	            }
	        });
	    }
	 _exec(method, registry, component) {
	        const camelMethod = _capitalize(method);
	        callback(component['before' + camelMethod], [], component);
	        registry[method](component);
	        callback(component['after' + camelMethod], [], component);
	    }
	 _getRegistryForType(type) {
	        for(let i = 0; i < this._typedRegistries.length; i++){
	            const reg = this._typedRegistries[i];
	            if (reg.isForType(type)) {
	                return reg;
	            }
	        }
	        return this.plugins;
	    }
	 _get(id, typedRegistry, type) {
	        const item = typedRegistry.get(id);
	        if (item === undefined) {
	            throw new Error('"' + id + '" is not a registered ' + type + '.');
	        }
	        return item;
	    }
	}
	var registry = /* #__PURE__ */ new Registry();

	class PluginService {
	    constructor(){
	        this._init = [];
	    }
	 notify(chart, hook, args, filter) {
	        if (hook === 'beforeInit') {
	            this._init = this._createDescriptors(chart, true);
	            this._notify(this._init, chart, 'install');
	        }
	        const descriptors = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
	        const result = this._notify(descriptors, chart, hook, args);
	        if (hook === 'afterDestroy') {
	            this._notify(descriptors, chart, 'stop');
	            this._notify(this._init, chart, 'uninstall');
	        }
	        return result;
	    }
	 _notify(descriptors, chart, hook, args) {
	        args = args || {};
	        for (const descriptor of descriptors){
	            const plugin = descriptor.plugin;
	            const method = plugin[hook];
	            const params = [
	                chart,
	                args,
	                descriptor.options
	            ];
	            if (callback(method, params, plugin) === false && args.cancelable) {
	                return false;
	            }
	        }
	        return true;
	    }
	    invalidate() {
	        if (!isNullOrUndef(this._cache)) {
	            this._oldCache = this._cache;
	            this._cache = undefined;
	        }
	    }
	 _descriptors(chart) {
	        if (this._cache) {
	            return this._cache;
	        }
	        const descriptors = this._cache = this._createDescriptors(chart);
	        this._notifyStateChanges(chart);
	        return descriptors;
	    }
	    _createDescriptors(chart, all) {
	        const config = chart && chart.config;
	        const options = valueOrDefault(config.options && config.options.plugins, {});
	        const plugins = allPlugins(config);
	        return options === false && !all ? [] : createDescriptors(chart, plugins, options, all);
	    }
	 _notifyStateChanges(chart) {
	        const previousDescriptors = this._oldCache || [];
	        const descriptors = this._cache;
	        const diff = (a, b)=>a.filter((x)=>!b.some((y)=>x.plugin.id === y.plugin.id));
	        this._notify(diff(previousDescriptors, descriptors), chart, 'stop');
	        this._notify(diff(descriptors, previousDescriptors), chart, 'start');
	    }
	}
	 function allPlugins(config) {
	    const localIds = {};
	    const plugins = [];
	    const keys = Object.keys(registry.plugins.items);
	    for(let i = 0; i < keys.length; i++){
	        plugins.push(registry.getPlugin(keys[i]));
	    }
	    const local = config.plugins || [];
	    for(let i = 0; i < local.length; i++){
	        const plugin = local[i];
	        if (plugins.indexOf(plugin) === -1) {
	            plugins.push(plugin);
	            localIds[plugin.id] = true;
	        }
	    }
	    return {
	        plugins,
	        localIds
	    };
	}
	function getOpts(options, all) {
	    if (!all && options === false) {
	        return null;
	    }
	    if (options === true) {
	        return {};
	    }
	    return options;
	}
	function createDescriptors(chart, { plugins , localIds  }, options, all) {
	    const result = [];
	    const context = chart.getContext();
	    for (const plugin of plugins){
	        const id = plugin.id;
	        const opts = getOpts(options[id], all);
	        if (opts === null) {
	            continue;
	        }
	        result.push({
	            plugin,
	            options: pluginOpts(chart.config, {
	                plugin,
	                local: localIds[id]
	            }, opts, context)
	        });
	    }
	    return result;
	}
	function pluginOpts(config, { plugin , local  }, opts, context) {
	    const keys = config.pluginScopeKeys(plugin);
	    const scopes = config.getOptionScopes(opts, keys);
	    if (local && plugin.defaults) {
	        scopes.push(plugin.defaults);
	    }
	    return config.createResolver(scopes, context, [
	        ''
	    ], {
	        scriptable: false,
	        indexable: false,
	        allKeys: true
	    });
	}

	function getIndexAxis(type, options) {
	    const datasetDefaults = defaults.datasets[type] || {};
	    const datasetOptions = (options.datasets || {})[type] || {};
	    return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || 'x';
	}
	function getAxisFromDefaultScaleID(id, indexAxis) {
	    let axis = id;
	    if (id === '_index_') {
	        axis = indexAxis;
	    } else if (id === '_value_') {
	        axis = indexAxis === 'x' ? 'y' : 'x';
	    }
	    return axis;
	}
	function getDefaultScaleIDFromAxis(axis, indexAxis) {
	    return axis === indexAxis ? '_index_' : '_value_';
	}
	function idMatchesAxis(id) {
	    if (id === 'x' || id === 'y' || id === 'r') {
	        return id;
	    }
	}
	function axisFromPosition(position) {
	    if (position === 'top' || position === 'bottom') {
	        return 'x';
	    }
	    if (position === 'left' || position === 'right') {
	        return 'y';
	    }
	}
	function determineAxis(id, ...scaleOptions) {
	    if (idMatchesAxis(id)) {
	        return id;
	    }
	    for (const opts of scaleOptions){
	        const axis = opts.axis || axisFromPosition(opts.position) || id.length > 1 && idMatchesAxis(id[0].toLowerCase());
	        if (axis) {
	            return axis;
	        }
	    }
	    throw new Error(`Cannot determine type of '${id}' axis. Please provide 'axis' or 'position' option.`);
	}
	function getAxisFromDataset(id, axis, dataset) {
	    if (dataset[axis + 'AxisID'] === id) {
	        return {
	            axis
	        };
	    }
	}
	function retrieveAxisFromDatasets(id, config) {
	    if (config.data && config.data.datasets) {
	        const boundDs = config.data.datasets.filter((d)=>d.xAxisID === id || d.yAxisID === id);
	        if (boundDs.length) {
	            return getAxisFromDataset(id, 'x', boundDs[0]) || getAxisFromDataset(id, 'y', boundDs[0]);
	        }
	    }
	    return {};
	}
	function mergeScaleConfig(config, options) {
	    const chartDefaults = overrides[config.type] || {
	        scales: {}
	    };
	    const configScales = options.scales || {};
	    const chartIndexAxis = getIndexAxis(config.type, options);
	    const scales = Object.create(null);
	    Object.keys(configScales).forEach((id)=>{
	        const scaleConf = configScales[id];
	        if (!isObject(scaleConf)) {
	            return console.error(`Invalid scale configuration for scale: ${id}`);
	        }
	        if (scaleConf._proxy) {
	            return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
	        }
	        const axis = determineAxis(id, scaleConf, retrieveAxisFromDatasets(id, config), defaults.scales[scaleConf.type]);
	        const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
	        const defaultScaleOptions = chartDefaults.scales || {};
	        scales[id] = mergeIf(Object.create(null), [
	            {
	                axis
	            },
	            scaleConf,
	            defaultScaleOptions[axis],
	            defaultScaleOptions[defaultId]
	        ]);
	    });
	    config.data.datasets.forEach((dataset)=>{
	        const type = dataset.type || config.type;
	        const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
	        const datasetDefaults = overrides[type] || {};
	        const defaultScaleOptions = datasetDefaults.scales || {};
	        Object.keys(defaultScaleOptions).forEach((defaultID)=>{
	            const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
	            const id = dataset[axis + 'AxisID'] || axis;
	            scales[id] = scales[id] || Object.create(null);
	            mergeIf(scales[id], [
	                {
	                    axis
	                },
	                configScales[id],
	                defaultScaleOptions[defaultID]
	            ]);
	        });
	    });
	    Object.keys(scales).forEach((key)=>{
	        const scale = scales[key];
	        mergeIf(scale, [
	            defaults.scales[scale.type],
	            defaults.scale
	        ]);
	    });
	    return scales;
	}
	function initOptions(config) {
	    const options = config.options || (config.options = {});
	    options.plugins = valueOrDefault(options.plugins, {});
	    options.scales = mergeScaleConfig(config, options);
	}
	function initData(data) {
	    data = data || {};
	    data.datasets = data.datasets || [];
	    data.labels = data.labels || [];
	    return data;
	}
	function initConfig(config) {
	    config = config || {};
	    config.data = initData(config.data);
	    initOptions(config);
	    return config;
	}
	const keyCache = new Map();
	const keysCached = new Set();
	function cachedKeys(cacheKey, generate) {
	    let keys = keyCache.get(cacheKey);
	    if (!keys) {
	        keys = generate();
	        keyCache.set(cacheKey, keys);
	        keysCached.add(keys);
	    }
	    return keys;
	}
	const addIfFound = (set, obj, key)=>{
	    const opts = resolveObjectKey(obj, key);
	    if (opts !== undefined) {
	        set.add(opts);
	    }
	};
	class Config {
	    constructor(config){
	        this._config = initConfig(config);
	        this._scopeCache = new Map();
	        this._resolverCache = new Map();
	    }
	    get platform() {
	        return this._config.platform;
	    }
	    get type() {
	        return this._config.type;
	    }
	    set type(type) {
	        this._config.type = type;
	    }
	    get data() {
	        return this._config.data;
	    }
	    set data(data) {
	        this._config.data = initData(data);
	    }
	    get options() {
	        return this._config.options;
	    }
	    set options(options) {
	        this._config.options = options;
	    }
	    get plugins() {
	        return this._config.plugins;
	    }
	    update() {
	        const config = this._config;
	        this.clearCache();
	        initOptions(config);
	    }
	    clearCache() {
	        this._scopeCache.clear();
	        this._resolverCache.clear();
	    }
	 datasetScopeKeys(datasetType) {
	        return cachedKeys(datasetType, ()=>[
	                [
	                    `datasets.${datasetType}`,
	                    ''
	                ]
	            ]);
	    }
	 datasetAnimationScopeKeys(datasetType, transition) {
	        return cachedKeys(`${datasetType}.transition.${transition}`, ()=>[
	                [
	                    `datasets.${datasetType}.transitions.${transition}`,
	                    `transitions.${transition}`
	                ],
	                [
	                    `datasets.${datasetType}`,
	                    ''
	                ]
	            ]);
	    }
	 datasetElementScopeKeys(datasetType, elementType) {
	        return cachedKeys(`${datasetType}-${elementType}`, ()=>[
	                [
	                    `datasets.${datasetType}.elements.${elementType}`,
	                    `datasets.${datasetType}`,
	                    `elements.${elementType}`,
	                    ''
	                ]
	            ]);
	    }
	 pluginScopeKeys(plugin) {
	        const id = plugin.id;
	        const type = this.type;
	        return cachedKeys(`${type}-plugin-${id}`, ()=>[
	                [
	                    `plugins.${id}`,
	                    ...plugin.additionalOptionScopes || []
	                ]
	            ]);
	    }
	 _cachedScopes(mainScope, resetCache) {
	        const _scopeCache = this._scopeCache;
	        let cache = _scopeCache.get(mainScope);
	        if (!cache || resetCache) {
	            cache = new Map();
	            _scopeCache.set(mainScope, cache);
	        }
	        return cache;
	    }
	 getOptionScopes(mainScope, keyLists, resetCache) {
	        const { options , type  } = this;
	        const cache = this._cachedScopes(mainScope, resetCache);
	        const cached = cache.get(keyLists);
	        if (cached) {
	            return cached;
	        }
	        const scopes = new Set();
	        keyLists.forEach((keys)=>{
	            if (mainScope) {
	                scopes.add(mainScope);
	                keys.forEach((key)=>addIfFound(scopes, mainScope, key));
	            }
	            keys.forEach((key)=>addIfFound(scopes, options, key));
	            keys.forEach((key)=>addIfFound(scopes, overrides[type] || {}, key));
	            keys.forEach((key)=>addIfFound(scopes, defaults, key));
	            keys.forEach((key)=>addIfFound(scopes, descriptors, key));
	        });
	        const array = Array.from(scopes);
	        if (array.length === 0) {
	            array.push(Object.create(null));
	        }
	        if (keysCached.has(keyLists)) {
	            cache.set(keyLists, array);
	        }
	        return array;
	    }
	 chartOptionScopes() {
	        const { options , type  } = this;
	        return [
	            options,
	            overrides[type] || {},
	            defaults.datasets[type] || {},
	            {
	                type
	            },
	            defaults,
	            descriptors
	        ];
	    }
	 resolveNamedOptions(scopes, names, context, prefixes = [
	        ''
	    ]) {
	        const result = {
	            $shared: true
	        };
	        const { resolver , subPrefixes  } = getResolver(this._resolverCache, scopes, prefixes);
	        let options = resolver;
	        if (needContext(resolver, names)) {
	            result.$shared = false;
	            context = isFunction(context) ? context() : context;
	            const subResolver = this.createResolver(scopes, context, subPrefixes);
	            options = _attachContext(resolver, context, subResolver);
	        }
	        for (const prop of names){
	            result[prop] = options[prop];
	        }
	        return result;
	    }
	 createResolver(scopes, context, prefixes = [
	        ''
	    ], descriptorDefaults) {
	        const { resolver  } = getResolver(this._resolverCache, scopes, prefixes);
	        return isObject(context) ? _attachContext(resolver, context, undefined, descriptorDefaults) : resolver;
	    }
	}
	function getResolver(resolverCache, scopes, prefixes) {
	    let cache = resolverCache.get(scopes);
	    if (!cache) {
	        cache = new Map();
	        resolverCache.set(scopes, cache);
	    }
	    const cacheKey = prefixes.join();
	    let cached = cache.get(cacheKey);
	    if (!cached) {
	        const resolver = _createResolver(scopes, prefixes);
	        cached = {
	            resolver,
	            subPrefixes: prefixes.filter((p)=>!p.toLowerCase().includes('hover'))
	        };
	        cache.set(cacheKey, cached);
	    }
	    return cached;
	}
	const hasFunction = (value)=>isObject(value) && Object.getOwnPropertyNames(value).some((key)=>isFunction(value[key]));
	function needContext(proxy, names) {
	    const { isScriptable , isIndexable  } = _descriptors(proxy);
	    for (const prop of names){
	        const scriptable = isScriptable(prop);
	        const indexable = isIndexable(prop);
	        const value = (indexable || scriptable) && proxy[prop];
	        if (scriptable && (isFunction(value) || hasFunction(value)) || indexable && isArray(value)) {
	            return true;
	        }
	    }
	    return false;
	}

	var version = "4.4.1";

	const KNOWN_POSITIONS = [
	    'top',
	    'bottom',
	    'left',
	    'right',
	    'chartArea'
	];
	function positionIsHorizontal(position, axis) {
	    return position === 'top' || position === 'bottom' || KNOWN_POSITIONS.indexOf(position) === -1 && axis === 'x';
	}
	function compare2Level(l1, l2) {
	    return function(a, b) {
	        return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1];
	    };
	}
	function onAnimationsComplete(context) {
	    const chart = context.chart;
	    const animationOptions = chart.options.animation;
	    chart.notifyPlugins('afterRender');
	    callback(animationOptions && animationOptions.onComplete, [
	        context
	    ], chart);
	}
	function onAnimationProgress(context) {
	    const chart = context.chart;
	    const animationOptions = chart.options.animation;
	    callback(animationOptions && animationOptions.onProgress, [
	        context
	    ], chart);
	}
	 function getCanvas(item) {
	    if (_isDomSupported() && typeof item === 'string') {
	        item = document.getElementById(item);
	    } else if (item && item.length) {
	        item = item[0];
	    }
	    if (item && item.canvas) {
	        item = item.canvas;
	    }
	    return item;
	}
	const instances = {};
	const getChart = (key)=>{
	    const canvas = getCanvas(key);
	    return Object.values(instances).filter((c)=>c.canvas === canvas).pop();
	};
	function moveNumericKeys(obj, start, move) {
	    const keys = Object.keys(obj);
	    for (const key of keys){
	        const intKey = +key;
	        if (intKey >= start) {
	            const value = obj[key];
	            delete obj[key];
	            if (move > 0 || intKey > start) {
	                obj[intKey + move] = value;
	            }
	        }
	    }
	}
	 function determineLastEvent(e, lastEvent, inChartArea, isClick) {
	    if (!inChartArea || e.type === 'mouseout') {
	        return null;
	    }
	    if (isClick) {
	        return lastEvent;
	    }
	    return e;
	}
	function getSizeForArea(scale, chartArea, field) {
	    return scale.options.clip ? scale[field] : chartArea[field];
	}
	function getDatasetArea(meta, chartArea) {
	    const { xScale , yScale  } = meta;
	    if (xScale && yScale) {
	        return {
	            left: getSizeForArea(xScale, chartArea, 'left'),
	            right: getSizeForArea(xScale, chartArea, 'right'),
	            top: getSizeForArea(yScale, chartArea, 'top'),
	            bottom: getSizeForArea(yScale, chartArea, 'bottom')
	        };
	    }
	    return chartArea;
	}
	class Chart {
	    static defaults = defaults;
	    static instances = instances;
	    static overrides = overrides;
	    static registry = registry;
	    static version = version;
	    static getChart = getChart;
	    static register(...items) {
	        registry.add(...items);
	        invalidatePlugins();
	    }
	    static unregister(...items) {
	        registry.remove(...items);
	        invalidatePlugins();
	    }
	    constructor(item, userConfig){
	        const config = this.config = new Config(userConfig);
	        const initialCanvas = getCanvas(item);
	        const existingChart = getChart(initialCanvas);
	        if (existingChart) {
	            throw new Error('Canvas is already in use. Chart with ID \'' + existingChart.id + '\'' + ' must be destroyed before the canvas with ID \'' + existingChart.canvas.id + '\' can be reused.');
	        }
	        const options = config.createResolver(config.chartOptionScopes(), this.getContext());
	        this.platform = new (config.platform || _detectPlatform(initialCanvas))();
	        this.platform.updateConfig(config);
	        const context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
	        const canvas = context && context.canvas;
	        const height = canvas && canvas.height;
	        const width = canvas && canvas.width;
	        this.id = uid();
	        this.ctx = context;
	        this.canvas = canvas;
	        this.width = width;
	        this.height = height;
	        this._options = options;
	        this._aspectRatio = this.aspectRatio;
	        this._layers = [];
	        this._metasets = [];
	        this._stacks = undefined;
	        this.boxes = [];
	        this.currentDevicePixelRatio = undefined;
	        this.chartArea = undefined;
	        this._active = [];
	        this._lastEvent = undefined;
	        this._listeners = {};
	         this._responsiveListeners = undefined;
	        this._sortedMetasets = [];
	        this.scales = {};
	        this._plugins = new PluginService();
	        this.$proxies = {};
	        this._hiddenIndices = {};
	        this.attached = false;
	        this._animationsDisabled = undefined;
	        this.$context = undefined;
	        this._doResize = debounce((mode)=>this.update(mode), options.resizeDelay || 0);
	        this._dataChanges = [];
	        instances[this.id] = this;
	        if (!context || !canvas) {
	            console.error("Failed to create chart: can't acquire context from the given item");
	            return;
	        }
	        animator.listen(this, 'complete', onAnimationsComplete);
	        animator.listen(this, 'progress', onAnimationProgress);
	        this._initialize();
	        if (this.attached) {
	            this.update();
	        }
	    }
	    get aspectRatio() {
	        const { options: { aspectRatio , maintainAspectRatio  } , width , height , _aspectRatio  } = this;
	        if (!isNullOrUndef(aspectRatio)) {
	            return aspectRatio;
	        }
	        if (maintainAspectRatio && _aspectRatio) {
	            return _aspectRatio;
	        }
	        return height ? width / height : null;
	    }
	    get data() {
	        return this.config.data;
	    }
	    set data(data) {
	        this.config.data = data;
	    }
	    get options() {
	        return this._options;
	    }
	    set options(options) {
	        this.config.options = options;
	    }
	    get registry() {
	        return registry;
	    }
	 _initialize() {
	        this.notifyPlugins('beforeInit');
	        if (this.options.responsive) {
	            this.resize();
	        } else {
	            retinaScale(this, this.options.devicePixelRatio);
	        }
	        this.bindEvents();
	        this.notifyPlugins('afterInit');
	        return this;
	    }
	    clear() {
	        clearCanvas(this.canvas, this.ctx);
	        return this;
	    }
	    stop() {
	        animator.stop(this);
	        return this;
	    }
	 resize(width, height) {
	        if (!animator.running(this)) {
	            this._resize(width, height);
	        } else {
	            this._resizeBeforeDraw = {
	                width,
	                height
	            };
	        }
	    }
	    _resize(width, height) {
	        const options = this.options;
	        const canvas = this.canvas;
	        const aspectRatio = options.maintainAspectRatio && this.aspectRatio;
	        const newSize = this.platform.getMaximumSize(canvas, width, height, aspectRatio);
	        const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
	        const mode = this.width ? 'resize' : 'attach';
	        this.width = newSize.width;
	        this.height = newSize.height;
	        this._aspectRatio = this.aspectRatio;
	        if (!retinaScale(this, newRatio, true)) {
	            return;
	        }
	        this.notifyPlugins('resize', {
	            size: newSize
	        });
	        callback(options.onResize, [
	            this,
	            newSize
	        ], this);
	        if (this.attached) {
	            if (this._doResize(mode)) {
	                this.render();
	            }
	        }
	    }
	    ensureScalesHaveIDs() {
	        const options = this.options;
	        const scalesOptions = options.scales || {};
	        each(scalesOptions, (axisOptions, axisID)=>{
	            axisOptions.id = axisID;
	        });
	    }
	 buildOrUpdateScales() {
	        const options = this.options;
	        const scaleOpts = options.scales;
	        const scales = this.scales;
	        const updated = Object.keys(scales).reduce((obj, id)=>{
	            obj[id] = false;
	            return obj;
	        }, {});
	        let items = [];
	        if (scaleOpts) {
	            items = items.concat(Object.keys(scaleOpts).map((id)=>{
	                const scaleOptions = scaleOpts[id];
	                const axis = determineAxis(id, scaleOptions);
	                const isRadial = axis === 'r';
	                const isHorizontal = axis === 'x';
	                return {
	                    options: scaleOptions,
	                    dposition: isRadial ? 'chartArea' : isHorizontal ? 'bottom' : 'left',
	                    dtype: isRadial ? 'radialLinear' : isHorizontal ? 'category' : 'linear'
	                };
	            }));
	        }
	        each(items, (item)=>{
	            const scaleOptions = item.options;
	            const id = scaleOptions.id;
	            const axis = determineAxis(id, scaleOptions);
	            const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
	            if (scaleOptions.position === undefined || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
	                scaleOptions.position = item.dposition;
	            }
	            updated[id] = true;
	            let scale = null;
	            if (id in scales && scales[id].type === scaleType) {
	                scale = scales[id];
	            } else {
	                const scaleClass = registry.getScale(scaleType);
	                scale = new scaleClass({
	                    id,
	                    type: scaleType,
	                    ctx: this.ctx,
	                    chart: this
	                });
	                scales[scale.id] = scale;
	            }
	            scale.init(scaleOptions, options);
	        });
	        each(updated, (hasUpdated, id)=>{
	            if (!hasUpdated) {
	                delete scales[id];
	            }
	        });
	        each(scales, (scale)=>{
	            layouts.configure(this, scale, scale.options);
	            layouts.addBox(this, scale);
	        });
	    }
	 _updateMetasets() {
	        const metasets = this._metasets;
	        const numData = this.data.datasets.length;
	        const numMeta = metasets.length;
	        metasets.sort((a, b)=>a.index - b.index);
	        if (numMeta > numData) {
	            for(let i = numData; i < numMeta; ++i){
	                this._destroyDatasetMeta(i);
	            }
	            metasets.splice(numData, numMeta - numData);
	        }
	        this._sortedMetasets = metasets.slice(0).sort(compare2Level('order', 'index'));
	    }
	 _removeUnreferencedMetasets() {
	        const { _metasets: metasets , data: { datasets  }  } = this;
	        if (metasets.length > datasets.length) {
	            delete this._stacks;
	        }
	        metasets.forEach((meta, index)=>{
	            if (datasets.filter((x)=>x === meta._dataset).length === 0) {
	                this._destroyDatasetMeta(index);
	            }
	        });
	    }
	    buildOrUpdateControllers() {
	        const newControllers = [];
	        const datasets = this.data.datasets;
	        let i, ilen;
	        this._removeUnreferencedMetasets();
	        for(i = 0, ilen = datasets.length; i < ilen; i++){
	            const dataset = datasets[i];
	            let meta = this.getDatasetMeta(i);
	            const type = dataset.type || this.config.type;
	            if (meta.type && meta.type !== type) {
	                this._destroyDatasetMeta(i);
	                meta = this.getDatasetMeta(i);
	            }
	            meta.type = type;
	            meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
	            meta.order = dataset.order || 0;
	            meta.index = i;
	            meta.label = '' + dataset.label;
	            meta.visible = this.isDatasetVisible(i);
	            if (meta.controller) {
	                meta.controller.updateIndex(i);
	                meta.controller.linkScales();
	            } else {
	                const ControllerClass = registry.getController(type);
	                const { datasetElementType , dataElementType  } = defaults.datasets[type];
	                Object.assign(ControllerClass, {
	                    dataElementType: registry.getElement(dataElementType),
	                    datasetElementType: datasetElementType && registry.getElement(datasetElementType)
	                });
	                meta.controller = new ControllerClass(this, i);
	                newControllers.push(meta.controller);
	            }
	        }
	        this._updateMetasets();
	        return newControllers;
	    }
	 _resetElements() {
	        each(this.data.datasets, (dataset, datasetIndex)=>{
	            this.getDatasetMeta(datasetIndex).controller.reset();
	        }, this);
	    }
	 reset() {
	        this._resetElements();
	        this.notifyPlugins('reset');
	    }
	    update(mode) {
	        const config = this.config;
	        config.update();
	        const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
	        const animsDisabled = this._animationsDisabled = !options.animation;
	        this._updateScales();
	        this._checkEventBindings();
	        this._updateHiddenIndices();
	        this._plugins.invalidate();
	        if (this.notifyPlugins('beforeUpdate', {
	            mode,
	            cancelable: true
	        }) === false) {
	            return;
	        }
	        const newControllers = this.buildOrUpdateControllers();
	        this.notifyPlugins('beforeElementsUpdate');
	        let minPadding = 0;
	        for(let i = 0, ilen = this.data.datasets.length; i < ilen; i++){
	            const { controller  } = this.getDatasetMeta(i);
	            const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
	            controller.buildOrUpdateElements(reset);
	            minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
	        }
	        minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
	        this._updateLayout(minPadding);
	        if (!animsDisabled) {
	            each(newControllers, (controller)=>{
	                controller.reset();
	            });
	        }
	        this._updateDatasets(mode);
	        this.notifyPlugins('afterUpdate', {
	            mode
	        });
	        this._layers.sort(compare2Level('z', '_idx'));
	        const { _active , _lastEvent  } = this;
	        if (_lastEvent) {
	            this._eventHandler(_lastEvent, true);
	        } else if (_active.length) {
	            this._updateHoverStyles(_active, _active, true);
	        }
	        this.render();
	    }
	 _updateScales() {
	        each(this.scales, (scale)=>{
	            layouts.removeBox(this, scale);
	        });
	        this.ensureScalesHaveIDs();
	        this.buildOrUpdateScales();
	    }
	 _checkEventBindings() {
	        const options = this.options;
	        const existingEvents = new Set(Object.keys(this._listeners));
	        const newEvents = new Set(options.events);
	        if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
	            this.unbindEvents();
	            this.bindEvents();
	        }
	    }
	 _updateHiddenIndices() {
	        const { _hiddenIndices  } = this;
	        const changes = this._getUniformDataChanges() || [];
	        for (const { method , start , count  } of changes){
	            const move = method === '_removeElements' ? -count : count;
	            moveNumericKeys(_hiddenIndices, start, move);
	        }
	    }
	 _getUniformDataChanges() {
	        const _dataChanges = this._dataChanges;
	        if (!_dataChanges || !_dataChanges.length) {
	            return;
	        }
	        this._dataChanges = [];
	        const datasetCount = this.data.datasets.length;
	        const makeSet = (idx)=>new Set(_dataChanges.filter((c)=>c[0] === idx).map((c, i)=>i + ',' + c.splice(1).join(',')));
	        const changeSet = makeSet(0);
	        for(let i = 1; i < datasetCount; i++){
	            if (!setsEqual(changeSet, makeSet(i))) {
	                return;
	            }
	        }
	        return Array.from(changeSet).map((c)=>c.split(',')).map((a)=>({
	                method: a[1],
	                start: +a[2],
	                count: +a[3]
	            }));
	    }
	 _updateLayout(minPadding) {
	        if (this.notifyPlugins('beforeLayout', {
	            cancelable: true
	        }) === false) {
	            return;
	        }
	        layouts.update(this, this.width, this.height, minPadding);
	        const area = this.chartArea;
	        const noArea = area.width <= 0 || area.height <= 0;
	        this._layers = [];
	        each(this.boxes, (box)=>{
	            if (noArea && box.position === 'chartArea') {
	                return;
	            }
	            if (box.configure) {
	                box.configure();
	            }
	            this._layers.push(...box._layers());
	        }, this);
	        this._layers.forEach((item, index)=>{
	            item._idx = index;
	        });
	        this.notifyPlugins('afterLayout');
	    }
	 _updateDatasets(mode) {
	        if (this.notifyPlugins('beforeDatasetsUpdate', {
	            mode,
	            cancelable: true
	        }) === false) {
	            return;
	        }
	        for(let i = 0, ilen = this.data.datasets.length; i < ilen; ++i){
	            this.getDatasetMeta(i).controller.configure();
	        }
	        for(let i = 0, ilen = this.data.datasets.length; i < ilen; ++i){
	            this._updateDataset(i, isFunction(mode) ? mode({
	                datasetIndex: i
	            }) : mode);
	        }
	        this.notifyPlugins('afterDatasetsUpdate', {
	            mode
	        });
	    }
	 _updateDataset(index, mode) {
	        const meta = this.getDatasetMeta(index);
	        const args = {
	            meta,
	            index,
	            mode,
	            cancelable: true
	        };
	        if (this.notifyPlugins('beforeDatasetUpdate', args) === false) {
	            return;
	        }
	        meta.controller._update(mode);
	        args.cancelable = false;
	        this.notifyPlugins('afterDatasetUpdate', args);
	    }
	    render() {
	        if (this.notifyPlugins('beforeRender', {
	            cancelable: true
	        }) === false) {
	            return;
	        }
	        if (animator.has(this)) {
	            if (this.attached && !animator.running(this)) {
	                animator.start(this);
	            }
	        } else {
	            this.draw();
	            onAnimationsComplete({
	                chart: this
	            });
	        }
	    }
	    draw() {
	        let i;
	        if (this._resizeBeforeDraw) {
	            const { width , height  } = this._resizeBeforeDraw;
	            this._resize(width, height);
	            this._resizeBeforeDraw = null;
	        }
	        this.clear();
	        if (this.width <= 0 || this.height <= 0) {
	            return;
	        }
	        if (this.notifyPlugins('beforeDraw', {
	            cancelable: true
	        }) === false) {
	            return;
	        }
	        const layers = this._layers;
	        for(i = 0; i < layers.length && layers[i].z <= 0; ++i){
	            layers[i].draw(this.chartArea);
	        }
	        this._drawDatasets();
	        for(; i < layers.length; ++i){
	            layers[i].draw(this.chartArea);
	        }
	        this.notifyPlugins('afterDraw');
	    }
	 _getSortedDatasetMetas(filterVisible) {
	        const metasets = this._sortedMetasets;
	        const result = [];
	        let i, ilen;
	        for(i = 0, ilen = metasets.length; i < ilen; ++i){
	            const meta = metasets[i];
	            if (!filterVisible || meta.visible) {
	                result.push(meta);
	            }
	        }
	        return result;
	    }
	 getSortedVisibleDatasetMetas() {
	        return this._getSortedDatasetMetas(true);
	    }
	 _drawDatasets() {
	        if (this.notifyPlugins('beforeDatasetsDraw', {
	            cancelable: true
	        }) === false) {
	            return;
	        }
	        const metasets = this.getSortedVisibleDatasetMetas();
	        for(let i = metasets.length - 1; i >= 0; --i){
	            this._drawDataset(metasets[i]);
	        }
	        this.notifyPlugins('afterDatasetsDraw');
	    }
	 _drawDataset(meta) {
	        const ctx = this.ctx;
	        const clip = meta._clip;
	        const useClip = !clip.disabled;
	        const area = getDatasetArea(meta, this.chartArea);
	        const args = {
	            meta,
	            index: meta.index,
	            cancelable: true
	        };
	        if (this.notifyPlugins('beforeDatasetDraw', args) === false) {
	            return;
	        }
	        if (useClip) {
	            clipArea(ctx, {
	                left: clip.left === false ? 0 : area.left - clip.left,
	                right: clip.right === false ? this.width : area.right + clip.right,
	                top: clip.top === false ? 0 : area.top - clip.top,
	                bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom
	            });
	        }
	        meta.controller.draw();
	        if (useClip) {
	            unclipArea(ctx);
	        }
	        args.cancelable = false;
	        this.notifyPlugins('afterDatasetDraw', args);
	    }
	 isPointInArea(point) {
	        return _isPointInArea(point, this.chartArea, this._minPadding);
	    }
	    getElementsAtEventForMode(e, mode, options, useFinalPosition) {
	        const method = Interaction.modes[mode];
	        if (typeof method === 'function') {
	            return method(this, e, options, useFinalPosition);
	        }
	        return [];
	    }
	    getDatasetMeta(datasetIndex) {
	        const dataset = this.data.datasets[datasetIndex];
	        const metasets = this._metasets;
	        let meta = metasets.filter((x)=>x && x._dataset === dataset).pop();
	        if (!meta) {
	            meta = {
	                type: null,
	                data: [],
	                dataset: null,
	                controller: null,
	                hidden: null,
	                xAxisID: null,
	                yAxisID: null,
	                order: dataset && dataset.order || 0,
	                index: datasetIndex,
	                _dataset: dataset,
	                _parsed: [],
	                _sorted: false
	            };
	            metasets.push(meta);
	        }
	        return meta;
	    }
	    getContext() {
	        return this.$context || (this.$context = createContext(null, {
	            chart: this,
	            type: 'chart'
	        }));
	    }
	    getVisibleDatasetCount() {
	        return this.getSortedVisibleDatasetMetas().length;
	    }
	    isDatasetVisible(datasetIndex) {
	        const dataset = this.data.datasets[datasetIndex];
	        if (!dataset) {
	            return false;
	        }
	        const meta = this.getDatasetMeta(datasetIndex);
	        return typeof meta.hidden === 'boolean' ? !meta.hidden : !dataset.hidden;
	    }
	    setDatasetVisibility(datasetIndex, visible) {
	        const meta = this.getDatasetMeta(datasetIndex);
	        meta.hidden = !visible;
	    }
	    toggleDataVisibility(index) {
	        this._hiddenIndices[index] = !this._hiddenIndices[index];
	    }
	    getDataVisibility(index) {
	        return !this._hiddenIndices[index];
	    }
	 _updateVisibility(datasetIndex, dataIndex, visible) {
	        const mode = visible ? 'show' : 'hide';
	        const meta = this.getDatasetMeta(datasetIndex);
	        const anims = meta.controller._resolveAnimations(undefined, mode);
	        if (defined(dataIndex)) {
	            meta.data[dataIndex].hidden = !visible;
	            this.update();
	        } else {
	            this.setDatasetVisibility(datasetIndex, visible);
	            anims.update(meta, {
	                visible
	            });
	            this.update((ctx)=>ctx.datasetIndex === datasetIndex ? mode : undefined);
	        }
	    }
	    hide(datasetIndex, dataIndex) {
	        this._updateVisibility(datasetIndex, dataIndex, false);
	    }
	    show(datasetIndex, dataIndex) {
	        this._updateVisibility(datasetIndex, dataIndex, true);
	    }
	 _destroyDatasetMeta(datasetIndex) {
	        const meta = this._metasets[datasetIndex];
	        if (meta && meta.controller) {
	            meta.controller._destroy();
	        }
	        delete this._metasets[datasetIndex];
	    }
	    _stop() {
	        let i, ilen;
	        this.stop();
	        animator.remove(this);
	        for(i = 0, ilen = this.data.datasets.length; i < ilen; ++i){
	            this._destroyDatasetMeta(i);
	        }
	    }
	    destroy() {
	        this.notifyPlugins('beforeDestroy');
	        const { canvas , ctx  } = this;
	        this._stop();
	        this.config.clearCache();
	        if (canvas) {
	            this.unbindEvents();
	            clearCanvas(canvas, ctx);
	            this.platform.releaseContext(ctx);
	            this.canvas = null;
	            this.ctx = null;
	        }
	        delete instances[this.id];
	        this.notifyPlugins('afterDestroy');
	    }
	    toBase64Image(...args) {
	        return this.canvas.toDataURL(...args);
	    }
	 bindEvents() {
	        this.bindUserEvents();
	        if (this.options.responsive) {
	            this.bindResponsiveEvents();
	        } else {
	            this.attached = true;
	        }
	    }
	 bindUserEvents() {
	        const listeners = this._listeners;
	        const platform = this.platform;
	        const _add = (type, listener)=>{
	            platform.addEventListener(this, type, listener);
	            listeners[type] = listener;
	        };
	        const listener = (e, x, y)=>{
	            e.offsetX = x;
	            e.offsetY = y;
	            this._eventHandler(e);
	        };
	        each(this.options.events, (type)=>_add(type, listener));
	    }
	 bindResponsiveEvents() {
	        if (!this._responsiveListeners) {
	            this._responsiveListeners = {};
	        }
	        const listeners = this._responsiveListeners;
	        const platform = this.platform;
	        const _add = (type, listener)=>{
	            platform.addEventListener(this, type, listener);
	            listeners[type] = listener;
	        };
	        const _remove = (type, listener)=>{
	            if (listeners[type]) {
	                platform.removeEventListener(this, type, listener);
	                delete listeners[type];
	            }
	        };
	        const listener = (width, height)=>{
	            if (this.canvas) {
	                this.resize(width, height);
	            }
	        };
	        let detached;
	        const attached = ()=>{
	            _remove('attach', attached);
	            this.attached = true;
	            this.resize();
	            _add('resize', listener);
	            _add('detach', detached);
	        };
	        detached = ()=>{
	            this.attached = false;
	            _remove('resize', listener);
	            this._stop();
	            this._resize(0, 0);
	            _add('attach', attached);
	        };
	        if (platform.isAttached(this.canvas)) {
	            attached();
	        } else {
	            detached();
	        }
	    }
	 unbindEvents() {
	        each(this._listeners, (listener, type)=>{
	            this.platform.removeEventListener(this, type, listener);
	        });
	        this._listeners = {};
	        each(this._responsiveListeners, (listener, type)=>{
	            this.platform.removeEventListener(this, type, listener);
	        });
	        this._responsiveListeners = undefined;
	    }
	    updateHoverStyle(items, mode, enabled) {
	        const prefix = enabled ? 'set' : 'remove';
	        let meta, item, i, ilen;
	        if (mode === 'dataset') {
	            meta = this.getDatasetMeta(items[0].datasetIndex);
	            meta.controller['_' + prefix + 'DatasetHoverStyle']();
	        }
	        for(i = 0, ilen = items.length; i < ilen; ++i){
	            item = items[i];
	            const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
	            if (controller) {
	                controller[prefix + 'HoverStyle'](item.element, item.datasetIndex, item.index);
	            }
	        }
	    }
	 getActiveElements() {
	        return this._active || [];
	    }
	 setActiveElements(activeElements) {
	        const lastActive = this._active || [];
	        const active = activeElements.map(({ datasetIndex , index  })=>{
	            const meta = this.getDatasetMeta(datasetIndex);
	            if (!meta) {
	                throw new Error('No dataset found at index ' + datasetIndex);
	            }
	            return {
	                datasetIndex,
	                element: meta.data[index],
	                index
	            };
	        });
	        const changed = !_elementsEqual(active, lastActive);
	        if (changed) {
	            this._active = active;
	            this._lastEvent = null;
	            this._updateHoverStyles(active, lastActive);
	        }
	    }
	 notifyPlugins(hook, args, filter) {
	        return this._plugins.notify(this, hook, args, filter);
	    }
	 isPluginEnabled(pluginId) {
	        return this._plugins._cache.filter((p)=>p.plugin.id === pluginId).length === 1;
	    }
	 _updateHoverStyles(active, lastActive, replay) {
	        const hoverOptions = this.options.hover;
	        const diff = (a, b)=>a.filter((x)=>!b.some((y)=>x.datasetIndex === y.datasetIndex && x.index === y.index));
	        const deactivated = diff(lastActive, active);
	        const activated = replay ? active : diff(active, lastActive);
	        if (deactivated.length) {
	            this.updateHoverStyle(deactivated, hoverOptions.mode, false);
	        }
	        if (activated.length && hoverOptions.mode) {
	            this.updateHoverStyle(activated, hoverOptions.mode, true);
	        }
	    }
	 _eventHandler(e, replay) {
	        const args = {
	            event: e,
	            replay,
	            cancelable: true,
	            inChartArea: this.isPointInArea(e)
	        };
	        const eventFilter = (plugin)=>(plugin.options.events || this.options.events).includes(e.native.type);
	        if (this.notifyPlugins('beforeEvent', args, eventFilter) === false) {
	            return;
	        }
	        const changed = this._handleEvent(e, replay, args.inChartArea);
	        args.cancelable = false;
	        this.notifyPlugins('afterEvent', args, eventFilter);
	        if (changed || args.changed) {
	            this.render();
	        }
	        return this;
	    }
	 _handleEvent(e, replay, inChartArea) {
	        const { _active: lastActive = [] , options  } = this;
	        const useFinalPosition = replay;
	        const active = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition);
	        const isClick = _isClickEvent(e);
	        const lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick);
	        if (inChartArea) {
	            this._lastEvent = null;
	            callback(options.onHover, [
	                e,
	                active,
	                this
	            ], this);
	            if (isClick) {
	                callback(options.onClick, [
	                    e,
	                    active,
	                    this
	                ], this);
	            }
	        }
	        const changed = !_elementsEqual(active, lastActive);
	        if (changed || replay) {
	            this._active = active;
	            this._updateHoverStyles(active, lastActive, replay);
	        }
	        this._lastEvent = lastEvent;
	        return changed;
	    }
	 _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
	        if (e.type === 'mouseout') {
	            return [];
	        }
	        if (!inChartArea) {
	            return lastActive;
	        }
	        const hoverOptions = this.options.hover;
	        return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
	    }
	}
	function invalidatePlugins() {
	    return each(Chart.instances, (chart)=>chart._plugins.invalidate());
	}

	function clipArc(ctx, element, endAngle) {
	    const { startAngle , pixelMargin , x , y , outerRadius , innerRadius  } = element;
	    let angleMargin = pixelMargin / outerRadius;
	    // Draw an inner border by clipping the arc and drawing a double-width border
	    // Enlarge the clipping arc by 0.33 pixels to eliminate glitches between borders
	    ctx.beginPath();
	    ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
	    if (innerRadius > pixelMargin) {
	        angleMargin = pixelMargin / innerRadius;
	        ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
	    } else {
	        ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
	    }
	    ctx.closePath();
	    ctx.clip();
	}
	function toRadiusCorners(value) {
	    return _readValueToProps(value, [
	        'outerStart',
	        'outerEnd',
	        'innerStart',
	        'innerEnd'
	    ]);
	}
	/**
	 * Parse border radius from the provided options
	 */ function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
	    const o = toRadiusCorners(arc.options.borderRadius);
	    const halfThickness = (outerRadius - innerRadius) / 2;
	    const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
	    // Outer limits are complicated. We want to compute the available angular distance at
	    // a radius of outerRadius - borderRadius because for small angular distances, this term limits.
	    // We compute at r = outerRadius - borderRadius because this circle defines the center of the border corners.
	    //
	    // If the borderRadius is large, that value can become negative.
	    // This causes the outer borders to lose their radius entirely, which is rather unexpected. To solve that, if borderRadius > outerRadius
	    // we know that the thickness term will dominate and compute the limits at that point
	    const computeOuterLimit = (val)=>{
	        const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
	        return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit));
	    };
	    return {
	        outerStart: computeOuterLimit(o.outerStart),
	        outerEnd: computeOuterLimit(o.outerEnd),
	        innerStart: _limitValue(o.innerStart, 0, innerLimit),
	        innerEnd: _limitValue(o.innerEnd, 0, innerLimit)
	    };
	}
	/**
	 * Convert (r, 𝜃) to (x, y)
	 */ function rThetaToXY(r, theta, x, y) {
	    return {
	        x: x + r * Math.cos(theta),
	        y: y + r * Math.sin(theta)
	    };
	}
	/**
	 * Path the arc, respecting border radius by separating into left and right halves.
	 *
	 *   Start      End
	 *
	 *    1--->a--->2    Outer
	 *   /           \
	 *   8           3
	 *   |           |
	 *   |           |
	 *   7           4
	 *   \           /
	 *    6<---b<---5    Inner
	 */ function pathArc(ctx, element, offset, spacing, end, circular) {
	    const { x , y , startAngle: start , pixelMargin , innerRadius: innerR  } = element;
	    const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
	    const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
	    let spacingOffset = 0;
	    const alpha = end - start;
	    if (spacing) {
	        // When spacing is present, it is the same for all items
	        // So we adjust the start and end angle of the arc such that
	        // the distance is the same as it would be without the spacing
	        const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
	        const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
	        const avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
	        const adjustedAngle = avNogSpacingRadius !== 0 ? alpha * avNogSpacingRadius / (avNogSpacingRadius + spacing) : alpha;
	        spacingOffset = (alpha - adjustedAngle) / 2;
	    }
	    const beta = Math.max(0.001, alpha * outerRadius - offset / PI) / outerRadius;
	    const angleOffset = (alpha - beta) / 2;
	    const startAngle = start + angleOffset + spacingOffset;
	    const endAngle = end - angleOffset - spacingOffset;
	    const { outerStart , outerEnd , innerStart , innerEnd  } = parseBorderRadius$1(element, innerRadius, outerRadius, endAngle - startAngle);
	    const outerStartAdjustedRadius = outerRadius - outerStart;
	    const outerEndAdjustedRadius = outerRadius - outerEnd;
	    const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
	    const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;
	    const innerStartAdjustedRadius = innerRadius + innerStart;
	    const innerEndAdjustedRadius = innerRadius + innerEnd;
	    const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
	    const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;
	    ctx.beginPath();
	    if (circular) {
	        // The first arc segments from point 1 to point a to point 2
	        const outerMidAdjustedAngle = (outerStartAdjustedAngle + outerEndAdjustedAngle) / 2;
	        ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerMidAdjustedAngle);
	        ctx.arc(x, y, outerRadius, outerMidAdjustedAngle, outerEndAdjustedAngle);
	        // The corner segment from point 2 to point 3
	        if (outerEnd > 0) {
	            const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
	            ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + HALF_PI);
	        }
	        // The line from point 3 to point 4
	        const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y);
	        ctx.lineTo(p4.x, p4.y);
	        // The corner segment from point 4 to point 5
	        if (innerEnd > 0) {
	            const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
	            ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
	        }
	        // The inner arc from point 5 to point b to point 6
	        const innerMidAdjustedAngle = (endAngle - innerEnd / innerRadius + (startAngle + innerStart / innerRadius)) / 2;
	        ctx.arc(x, y, innerRadius, endAngle - innerEnd / innerRadius, innerMidAdjustedAngle, true);
	        ctx.arc(x, y, innerRadius, innerMidAdjustedAngle, startAngle + innerStart / innerRadius, true);
	        // The corner segment from point 6 to point 7
	        if (innerStart > 0) {
	            const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
	            ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - HALF_PI);
	        }
	        // The line from point 7 to point 8
	        const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y);
	        ctx.lineTo(p8.x, p8.y);
	        // The corner segment from point 8 to point 1
	        if (outerStart > 0) {
	            const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
	            ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - HALF_PI, outerStartAdjustedAngle);
	        }
	    } else {
	        ctx.moveTo(x, y);
	        const outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x;
	        const outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y;
	        ctx.lineTo(outerStartX, outerStartY);
	        const outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x;
	        const outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y;
	        ctx.lineTo(outerEndX, outerEndY);
	    }
	    ctx.closePath();
	}
	function drawArc(ctx, element, offset, spacing, circular) {
	    const { fullCircles , startAngle , circumference  } = element;
	    let endAngle = element.endAngle;
	    if (fullCircles) {
	        pathArc(ctx, element, offset, spacing, endAngle, circular);
	        for(let i = 0; i < fullCircles; ++i){
	            ctx.fill();
	        }
	        if (!isNaN(circumference)) {
	            endAngle = startAngle + (circumference % TAU || TAU);
	        }
	    }
	    pathArc(ctx, element, offset, spacing, endAngle, circular);
	    ctx.fill();
	    return endAngle;
	}
	function drawBorder(ctx, element, offset, spacing, circular) {
	    const { fullCircles , startAngle , circumference , options  } = element;
	    const { borderWidth , borderJoinStyle , borderDash , borderDashOffset  } = options;
	    const inner = options.borderAlign === 'inner';
	    if (!borderWidth) {
	        return;
	    }
	    ctx.setLineDash(borderDash || []);
	    ctx.lineDashOffset = borderDashOffset;
	    if (inner) {
	        ctx.lineWidth = borderWidth * 2;
	        ctx.lineJoin = borderJoinStyle || 'round';
	    } else {
	        ctx.lineWidth = borderWidth;
	        ctx.lineJoin = borderJoinStyle || 'bevel';
	    }
	    let endAngle = element.endAngle;
	    if (fullCircles) {
	        pathArc(ctx, element, offset, spacing, endAngle, circular);
	        for(let i = 0; i < fullCircles; ++i){
	            ctx.stroke();
	        }
	        if (!isNaN(circumference)) {
	            endAngle = startAngle + (circumference % TAU || TAU);
	        }
	    }
	    if (inner) {
	        clipArc(ctx, element, endAngle);
	    }
	    if (!fullCircles) {
	        pathArc(ctx, element, offset, spacing, endAngle, circular);
	        ctx.stroke();
	    }
	}
	class ArcElement extends Element$1 {
	    static id = 'arc';
	    static defaults = {
	        borderAlign: 'center',
	        borderColor: '#fff',
	        borderDash: [],
	        borderDashOffset: 0,
	        borderJoinStyle: undefined,
	        borderRadius: 0,
	        borderWidth: 2,
	        offset: 0,
	        spacing: 0,
	        angle: undefined,
	        circular: true
	    };
	    static defaultRoutes = {
	        backgroundColor: 'backgroundColor'
	    };
	    static descriptors = {
	        _scriptable: true,
	        _indexable: (name)=>name !== 'borderDash'
	    };
	    circumference;
	    endAngle;
	    fullCircles;
	    innerRadius;
	    outerRadius;
	    pixelMargin;
	    startAngle;
	    constructor(cfg){
	        super();
	        this.options = undefined;
	        this.circumference = undefined;
	        this.startAngle = undefined;
	        this.endAngle = undefined;
	        this.innerRadius = undefined;
	        this.outerRadius = undefined;
	        this.pixelMargin = 0;
	        this.fullCircles = 0;
	        if (cfg) {
	            Object.assign(this, cfg);
	        }
	    }
	    inRange(chartX, chartY, useFinalPosition) {
	        const point = this.getProps([
	            'x',
	            'y'
	        ], useFinalPosition);
	        const { angle , distance  } = getAngleFromPoint(point, {
	            x: chartX,
	            y: chartY
	        });
	        const { startAngle , endAngle , innerRadius , outerRadius , circumference  } = this.getProps([
	            'startAngle',
	            'endAngle',
	            'innerRadius',
	            'outerRadius',
	            'circumference'
	        ], useFinalPosition);
	        const rAdjust = (this.options.spacing + this.options.borderWidth) / 2;
	        const _circumference = valueOrDefault(circumference, endAngle - startAngle);
	        const betweenAngles = _circumference >= TAU || _angleBetween(angle, startAngle, endAngle);
	        const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust);
	        return betweenAngles && withinRadius;
	    }
	    getCenterPoint(useFinalPosition) {
	        const { x , y , startAngle , endAngle , innerRadius , outerRadius  } = this.getProps([
	            'x',
	            'y',
	            'startAngle',
	            'endAngle',
	            'innerRadius',
	            'outerRadius'
	        ], useFinalPosition);
	        const { offset , spacing  } = this.options;
	        const halfAngle = (startAngle + endAngle) / 2;
	        const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
	        return {
	            x: x + Math.cos(halfAngle) * halfRadius,
	            y: y + Math.sin(halfAngle) * halfRadius
	        };
	    }
	    tooltipPosition(useFinalPosition) {
	        return this.getCenterPoint(useFinalPosition);
	    }
	    draw(ctx) {
	        const { options , circumference  } = this;
	        const offset = (options.offset || 0) / 4;
	        const spacing = (options.spacing || 0) / 2;
	        const circular = options.circular;
	        this.pixelMargin = options.borderAlign === 'inner' ? 0.33 : 0;
	        this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0;
	        if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
	            return;
	        }
	        ctx.save();
	        const halfAngle = (this.startAngle + this.endAngle) / 2;
	        ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
	        const fix = 1 - Math.sin(Math.min(PI, circumference || 0));
	        const radiusOffset = offset * fix;
	        ctx.fillStyle = options.backgroundColor;
	        ctx.strokeStyle = options.borderColor;
	        drawArc(ctx, this, radiusOffset, spacing, circular);
	        drawBorder(ctx, this, radiusOffset, spacing, circular);
	        ctx.restore();
	    }
	}

	function setStyle(ctx, options, style = options) {
	    ctx.lineCap = valueOrDefault(style.borderCapStyle, options.borderCapStyle);
	    ctx.setLineDash(valueOrDefault(style.borderDash, options.borderDash));
	    ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options.borderDashOffset);
	    ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options.borderJoinStyle);
	    ctx.lineWidth = valueOrDefault(style.borderWidth, options.borderWidth);
	    ctx.strokeStyle = valueOrDefault(style.borderColor, options.borderColor);
	}
	function lineTo(ctx, previous, target) {
	    ctx.lineTo(target.x, target.y);
	}
	 function getLineMethod(options) {
	    if (options.stepped) {
	        return _steppedLineTo;
	    }
	    if (options.tension || options.cubicInterpolationMode === 'monotone') {
	        return _bezierCurveTo;
	    }
	    return lineTo;
	}
	function pathVars(points, segment, params = {}) {
	    const count = points.length;
	    const { start: paramsStart = 0 , end: paramsEnd = count - 1  } = params;
	    const { start: segmentStart , end: segmentEnd  } = segment;
	    const start = Math.max(paramsStart, segmentStart);
	    const end = Math.min(paramsEnd, segmentEnd);
	    const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
	    return {
	        count,
	        start,
	        loop: segment.loop,
	        ilen: end < start && !outside ? count + end - start : end - start
	    };
	}
	 function pathSegment(ctx, line, segment, params) {
	    const { points , options  } = line;
	    const { count , start , loop , ilen  } = pathVars(points, segment, params);
	    const lineMethod = getLineMethod(options);
	    let { move =true , reverse  } = params || {};
	    let i, point, prev;
	    for(i = 0; i <= ilen; ++i){
	        point = points[(start + (reverse ? ilen - i : i)) % count];
	        if (point.skip) {
	            continue;
	        } else if (move) {
	            ctx.moveTo(point.x, point.y);
	            move = false;
	        } else {
	            lineMethod(ctx, prev, point, reverse, options.stepped);
	        }
	        prev = point;
	    }
	    if (loop) {
	        point = points[(start + (reverse ? ilen : 0)) % count];
	        lineMethod(ctx, prev, point, reverse, options.stepped);
	    }
	    return !!loop;
	}
	 function fastPathSegment(ctx, line, segment, params) {
	    const points = line.points;
	    const { count , start , ilen  } = pathVars(points, segment, params);
	    const { move =true , reverse  } = params || {};
	    let avgX = 0;
	    let countX = 0;
	    let i, point, prevX, minY, maxY, lastY;
	    const pointIndex = (index)=>(start + (reverse ? ilen - index : index)) % count;
	    const drawX = ()=>{
	        if (minY !== maxY) {
	            ctx.lineTo(avgX, maxY);
	            ctx.lineTo(avgX, minY);
	            ctx.lineTo(avgX, lastY);
	        }
	    };
	    if (move) {
	        point = points[pointIndex(0)];
	        ctx.moveTo(point.x, point.y);
	    }
	    for(i = 0; i <= ilen; ++i){
	        point = points[pointIndex(i)];
	        if (point.skip) {
	            continue;
	        }
	        const x = point.x;
	        const y = point.y;
	        const truncX = x | 0;
	        if (truncX === prevX) {
	            if (y < minY) {
	                minY = y;
	            } else if (y > maxY) {
	                maxY = y;
	            }
	            avgX = (countX * avgX + x) / ++countX;
	        } else {
	            drawX();
	            ctx.lineTo(x, y);
	            prevX = truncX;
	            countX = 0;
	            minY = maxY = y;
	        }
	        lastY = y;
	    }
	    drawX();
	}
	 function _getSegmentMethod(line) {
	    const opts = line.options;
	    const borderDash = opts.borderDash && opts.borderDash.length;
	    const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== 'monotone' && !opts.stepped && !borderDash;
	    return useFastPath ? fastPathSegment : pathSegment;
	}
	 function _getInterpolationMethod(options) {
	    if (options.stepped) {
	        return _steppedInterpolation;
	    }
	    if (options.tension || options.cubicInterpolationMode === 'monotone') {
	        return _bezierInterpolation;
	    }
	    return _pointInLine;
	}
	function strokePathWithCache(ctx, line, start, count) {
	    let path = line._path;
	    if (!path) {
	        path = line._path = new Path2D();
	        if (line.path(path, start, count)) {
	            path.closePath();
	        }
	    }
	    setStyle(ctx, line.options);
	    ctx.stroke(path);
	}
	function strokePathDirect(ctx, line, start, count) {
	    const { segments , options  } = line;
	    const segmentMethod = _getSegmentMethod(line);
	    for (const segment of segments){
	        setStyle(ctx, options, segment.style);
	        ctx.beginPath();
	        if (segmentMethod(ctx, line, segment, {
	            start,
	            end: start + count - 1
	        })) {
	            ctx.closePath();
	        }
	        ctx.stroke();
	    }
	}
	const usePath2D = typeof Path2D === 'function';
	function draw(ctx, line, start, count) {
	    if (usePath2D && !line.options.segment) {
	        strokePathWithCache(ctx, line, start, count);
	    } else {
	        strokePathDirect(ctx, line, start, count);
	    }
	}
	class LineElement extends Element$1 {
	    static id = 'line';
	 static defaults = {
	        borderCapStyle: 'butt',
	        borderDash: [],
	        borderDashOffset: 0,
	        borderJoinStyle: 'miter',
	        borderWidth: 3,
	        capBezierPoints: true,
	        cubicInterpolationMode: 'default',
	        fill: false,
	        spanGaps: false,
	        stepped: false,
	        tension: 0
	    };
	 static defaultRoutes = {
	        backgroundColor: 'backgroundColor',
	        borderColor: 'borderColor'
	    };
	    static descriptors = {
	        _scriptable: true,
	        _indexable: (name)=>name !== 'borderDash' && name !== 'fill'
	    };
	    constructor(cfg){
	        super();
	        this.animated = true;
	        this.options = undefined;
	        this._chart = undefined;
	        this._loop = undefined;
	        this._fullLoop = undefined;
	        this._path = undefined;
	        this._points = undefined;
	        this._segments = undefined;
	        this._decimated = false;
	        this._pointsUpdated = false;
	        this._datasetIndex = undefined;
	        if (cfg) {
	            Object.assign(this, cfg);
	        }
	    }
	    updateControlPoints(chartArea, indexAxis) {
	        const options = this.options;
	        if ((options.tension || options.cubicInterpolationMode === 'monotone') && !options.stepped && !this._pointsUpdated) {
	            const loop = options.spanGaps ? this._loop : this._fullLoop;
	            _updateBezierControlPoints(this._points, options, chartArea, loop, indexAxis);
	            this._pointsUpdated = true;
	        }
	    }
	    set points(points) {
	        this._points = points;
	        delete this._segments;
	        delete this._path;
	        this._pointsUpdated = false;
	    }
	    get points() {
	        return this._points;
	    }
	    get segments() {
	        return this._segments || (this._segments = _computeSegments(this, this.options.segment));
	    }
	 first() {
	        const segments = this.segments;
	        const points = this.points;
	        return segments.length && points[segments[0].start];
	    }
	 last() {
	        const segments = this.segments;
	        const points = this.points;
	        const count = segments.length;
	        return count && points[segments[count - 1].end];
	    }
	 interpolate(point, property) {
	        const options = this.options;
	        const value = point[property];
	        const points = this.points;
	        const segments = _boundSegments(this, {
	            property,
	            start: value,
	            end: value
	        });
	        if (!segments.length) {
	            return;
	        }
	        const result = [];
	        const _interpolate = _getInterpolationMethod(options);
	        let i, ilen;
	        for(i = 0, ilen = segments.length; i < ilen; ++i){
	            const { start , end  } = segments[i];
	            const p1 = points[start];
	            const p2 = points[end];
	            if (p1 === p2) {
	                result.push(p1);
	                continue;
	            }
	            const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
	            const interpolated = _interpolate(p1, p2, t, options.stepped);
	            interpolated[property] = point[property];
	            result.push(interpolated);
	        }
	        return result.length === 1 ? result[0] : result;
	    }
	 pathSegment(ctx, segment, params) {
	        const segmentMethod = _getSegmentMethod(this);
	        return segmentMethod(ctx, this, segment, params);
	    }
	 path(ctx, start, count) {
	        const segments = this.segments;
	        const segmentMethod = _getSegmentMethod(this);
	        let loop = this._loop;
	        start = start || 0;
	        count = count || this.points.length - start;
	        for (const segment of segments){
	            loop &= segmentMethod(ctx, this, segment, {
	                start,
	                end: start + count - 1
	            });
	        }
	        return !!loop;
	    }
	 draw(ctx, chartArea, start, count) {
	        const options = this.options || {};
	        const points = this.points || [];
	        if (points.length && options.borderWidth) {
	            ctx.save();
	            draw(ctx, this, start, count);
	            ctx.restore();
	        }
	        if (this.animated) {
	            this._pointsUpdated = false;
	            this._path = undefined;
	        }
	    }
	}

	function inRange$1(el, pos, axis, useFinalPosition) {
	    const options = el.options;
	    const { [axis]: value  } = el.getProps([
	        axis
	    ], useFinalPosition);
	    return Math.abs(pos - value) < options.radius + options.hitRadius;
	}
	class PointElement extends Element$1 {
	    static id = 'point';
	    parsed;
	    skip;
	    stop;
	    /**
	   * @type {any}
	   */ static defaults = {
	        borderWidth: 1,
	        hitRadius: 1,
	        hoverBorderWidth: 1,
	        hoverRadius: 4,
	        pointStyle: 'circle',
	        radius: 3,
	        rotation: 0
	    };
	    /**
	   * @type {any}
	   */ static defaultRoutes = {
	        backgroundColor: 'backgroundColor',
	        borderColor: 'borderColor'
	    };
	    constructor(cfg){
	        super();
	        this.options = undefined;
	        this.parsed = undefined;
	        this.skip = undefined;
	        this.stop = undefined;
	        if (cfg) {
	            Object.assign(this, cfg);
	        }
	    }
	    inRange(mouseX, mouseY, useFinalPosition) {
	        const options = this.options;
	        const { x , y  } = this.getProps([
	            'x',
	            'y'
	        ], useFinalPosition);
	        return Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2) < Math.pow(options.hitRadius + options.radius, 2);
	    }
	    inXRange(mouseX, useFinalPosition) {
	        return inRange$1(this, mouseX, 'x', useFinalPosition);
	    }
	    inYRange(mouseY, useFinalPosition) {
	        return inRange$1(this, mouseY, 'y', useFinalPosition);
	    }
	    getCenterPoint(useFinalPosition) {
	        const { x , y  } = this.getProps([
	            'x',
	            'y'
	        ], useFinalPosition);
	        return {
	            x,
	            y
	        };
	    }
	    size(options) {
	        options = options || this.options || {};
	        let radius = options.radius || 0;
	        radius = Math.max(radius, radius && options.hoverRadius || 0);
	        const borderWidth = radius && options.borderWidth || 0;
	        return (radius + borderWidth) * 2;
	    }
	    draw(ctx, area) {
	        const options = this.options;
	        if (this.skip || options.radius < 0.1 || !_isPointInArea(this, area, this.size(options) / 2)) {
	            return;
	        }
	        ctx.strokeStyle = options.borderColor;
	        ctx.lineWidth = options.borderWidth;
	        ctx.fillStyle = options.backgroundColor;
	        drawPoint(ctx, options, this.x, this.y);
	    }
	    getRange() {
	        const options = this.options || {};
	        // @ts-expect-error Fallbacks should never be hit in practice
	        return options.radius + options.hitRadius;
	    }
	}

	function getBarBounds(bar, useFinalPosition) {
	    const { x , y , base , width , height  } =  bar.getProps([
	        'x',
	        'y',
	        'base',
	        'width',
	        'height'
	    ], useFinalPosition);
	    let left, right, top, bottom, half;
	    if (bar.horizontal) {
	        half = height / 2;
	        left = Math.min(x, base);
	        right = Math.max(x, base);
	        top = y - half;
	        bottom = y + half;
	    } else {
	        half = width / 2;
	        left = x - half;
	        right = x + half;
	        top = Math.min(y, base);
	        bottom = Math.max(y, base);
	    }
	    return {
	        left,
	        top,
	        right,
	        bottom
	    };
	}
	function skipOrLimit(skip, value, min, max) {
	    return skip ? 0 : _limitValue(value, min, max);
	}
	function parseBorderWidth(bar, maxW, maxH) {
	    const value = bar.options.borderWidth;
	    const skip = bar.borderSkipped;
	    const o = toTRBL(value);
	    return {
	        t: skipOrLimit(skip.top, o.top, 0, maxH),
	        r: skipOrLimit(skip.right, o.right, 0, maxW),
	        b: skipOrLimit(skip.bottom, o.bottom, 0, maxH),
	        l: skipOrLimit(skip.left, o.left, 0, maxW)
	    };
	}
	function parseBorderRadius(bar, maxW, maxH) {
	    const { enableBorderRadius  } = bar.getProps([
	        'enableBorderRadius'
	    ]);
	    const value = bar.options.borderRadius;
	    const o = toTRBLCorners(value);
	    const maxR = Math.min(maxW, maxH);
	    const skip = bar.borderSkipped;
	    const enableBorder = enableBorderRadius || isObject(value);
	    return {
	        topLeft: skipOrLimit(!enableBorder || skip.top || skip.left, o.topLeft, 0, maxR),
	        topRight: skipOrLimit(!enableBorder || skip.top || skip.right, o.topRight, 0, maxR),
	        bottomLeft: skipOrLimit(!enableBorder || skip.bottom || skip.left, o.bottomLeft, 0, maxR),
	        bottomRight: skipOrLimit(!enableBorder || skip.bottom || skip.right, o.bottomRight, 0, maxR)
	    };
	}
	function boundingRects(bar) {
	    const bounds = getBarBounds(bar);
	    const width = bounds.right - bounds.left;
	    const height = bounds.bottom - bounds.top;
	    const border = parseBorderWidth(bar, width / 2, height / 2);
	    const radius = parseBorderRadius(bar, width / 2, height / 2);
	    return {
	        outer: {
	            x: bounds.left,
	            y: bounds.top,
	            w: width,
	            h: height,
	            radius
	        },
	        inner: {
	            x: bounds.left + border.l,
	            y: bounds.top + border.t,
	            w: width - border.l - border.r,
	            h: height - border.t - border.b,
	            radius: {
	                topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
	                topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
	                bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
	                bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r))
	            }
	        }
	    };
	}
	function inRange(bar, x, y, useFinalPosition) {
	    const skipX = x === null;
	    const skipY = y === null;
	    const skipBoth = skipX && skipY;
	    const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
	    return bounds && (skipX || _isBetween(x, bounds.left, bounds.right)) && (skipY || _isBetween(y, bounds.top, bounds.bottom));
	}
	function hasRadius(radius) {
	    return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
	}
	 function addNormalRectPath(ctx, rect) {
	    ctx.rect(rect.x, rect.y, rect.w, rect.h);
	}
	function inflateRect(rect, amount, refRect = {}) {
	    const x = rect.x !== refRect.x ? -amount : 0;
	    const y = rect.y !== refRect.y ? -amount : 0;
	    const w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x;
	    const h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y;
	    return {
	        x: rect.x + x,
	        y: rect.y + y,
	        w: rect.w + w,
	        h: rect.h + h,
	        radius: rect.radius
	    };
	}
	class BarElement extends Element$1 {
	    static id = 'bar';
	 static defaults = {
	        borderSkipped: 'start',
	        borderWidth: 0,
	        borderRadius: 0,
	        inflateAmount: 'auto',
	        pointStyle: undefined
	    };
	 static defaultRoutes = {
	        backgroundColor: 'backgroundColor',
	        borderColor: 'borderColor'
	    };
	    constructor(cfg){
	        super();
	        this.options = undefined;
	        this.horizontal = undefined;
	        this.base = undefined;
	        this.width = undefined;
	        this.height = undefined;
	        this.inflateAmount = undefined;
	        if (cfg) {
	            Object.assign(this, cfg);
	        }
	    }
	    draw(ctx) {
	        const { inflateAmount , options: { borderColor , backgroundColor  }  } = this;
	        const { inner , outer  } = boundingRects(this);
	        const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;
	        ctx.save();
	        if (outer.w !== inner.w || outer.h !== inner.h) {
	            ctx.beginPath();
	            addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
	            ctx.clip();
	            addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
	            ctx.fillStyle = borderColor;
	            ctx.fill('evenodd');
	        }
	        ctx.beginPath();
	        addRectPath(ctx, inflateRect(inner, inflateAmount));
	        ctx.fillStyle = backgroundColor;
	        ctx.fill();
	        ctx.restore();
	    }
	    inRange(mouseX, mouseY, useFinalPosition) {
	        return inRange(this, mouseX, mouseY, useFinalPosition);
	    }
	    inXRange(mouseX, useFinalPosition) {
	        return inRange(this, mouseX, null, useFinalPosition);
	    }
	    inYRange(mouseY, useFinalPosition) {
	        return inRange(this, null, mouseY, useFinalPosition);
	    }
	    getCenterPoint(useFinalPosition) {
	        const { x , y , base , horizontal  } =  this.getProps([
	            'x',
	            'y',
	            'base',
	            'horizontal'
	        ], useFinalPosition);
	        return {
	            x: horizontal ? (x + base) / 2 : x,
	            y: horizontal ? y : (y + base) / 2
	        };
	    }
	    getRange(axis) {
	        return axis === 'x' ? this.width / 2 : this.height / 2;
	    }
	}

	var elements = /*#__PURE__*/Object.freeze({
	__proto__: null,
	ArcElement: ArcElement,
	BarElement: BarElement,
	LineElement: LineElement,
	PointElement: PointElement
	});

	const BORDER_COLORS = [
	    'rgb(54, 162, 235)',
	    'rgb(255, 99, 132)',
	    'rgb(255, 159, 64)',
	    'rgb(255, 205, 86)',
	    'rgb(75, 192, 192)',
	    'rgb(153, 102, 255)',
	    'rgb(201, 203, 207)' // grey
	];
	// Border colors with 50% transparency
	const BACKGROUND_COLORS = /* #__PURE__ */ BORDER_COLORS.map((color)=>color.replace('rgb(', 'rgba(').replace(')', ', 0.5)'));
	function getBorderColor(i) {
	    return BORDER_COLORS[i % BORDER_COLORS.length];
	}
	function getBackgroundColor(i) {
	    return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
	}
	function colorizeDefaultDataset(dataset, i) {
	    dataset.borderColor = getBorderColor(i);
	    dataset.backgroundColor = getBackgroundColor(i);
	    return ++i;
	}
	function colorizeDoughnutDataset(dataset, i) {
	    dataset.backgroundColor = dataset.data.map(()=>getBorderColor(i++));
	    return i;
	}
	function colorizePolarAreaDataset(dataset, i) {
	    dataset.backgroundColor = dataset.data.map(()=>getBackgroundColor(i++));
	    return i;
	}
	function getColorizer(chart) {
	    let i = 0;
	    return (dataset, datasetIndex)=>{
	        const controller = chart.getDatasetMeta(datasetIndex).controller;
	        if (controller instanceof DoughnutController) {
	            i = colorizeDoughnutDataset(dataset, i);
	        } else if (controller instanceof PolarAreaController) {
	            i = colorizePolarAreaDataset(dataset, i);
	        } else if (controller) {
	            i = colorizeDefaultDataset(dataset, i);
	        }
	    };
	}
	function containsColorsDefinitions(descriptors) {
	    let k;
	    for(k in descriptors){
	        if (descriptors[k].borderColor || descriptors[k].backgroundColor) {
	            return true;
	        }
	    }
	    return false;
	}
	function containsColorsDefinition(descriptor) {
	    return descriptor && (descriptor.borderColor || descriptor.backgroundColor);
	}
	var plugin_colors = {
	    id: 'colors',
	    defaults: {
	        enabled: true,
	        forceOverride: false
	    },
	    beforeLayout (chart, _args, options) {
	        if (!options.enabled) {
	            return;
	        }
	        const { data: { datasets  } , options: chartOptions  } = chart.config;
	        const { elements  } = chartOptions;
	        if (!options.forceOverride && (containsColorsDefinitions(datasets) || containsColorsDefinition(chartOptions) || elements && containsColorsDefinitions(elements))) {
	            return;
	        }
	        const colorizer = getColorizer(chart);
	        datasets.forEach(colorizer);
	    }
	};

	function lttbDecimation(data, start, count, availableWidth, options) {
	 const samples = options.samples || availableWidth;
	    if (samples >= count) {
	        return data.slice(start, start + count);
	    }
	    const decimated = [];
	    const bucketWidth = (count - 2) / (samples - 2);
	    let sampledIndex = 0;
	    const endIndex = start + count - 1;
	    let a = start;
	    let i, maxAreaPoint, maxArea, area, nextA;
	    decimated[sampledIndex++] = data[a];
	    for(i = 0; i < samples - 2; i++){
	        let avgX = 0;
	        let avgY = 0;
	        let j;
	        const avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start;
	        const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start;
	        const avgRangeLength = avgRangeEnd - avgRangeStart;
	        for(j = avgRangeStart; j < avgRangeEnd; j++){
	            avgX += data[j].x;
	            avgY += data[j].y;
	        }
	        avgX /= avgRangeLength;
	        avgY /= avgRangeLength;
	        const rangeOffs = Math.floor(i * bucketWidth) + 1 + start;
	        const rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start;
	        const { x: pointAx , y: pointAy  } = data[a];
	        maxArea = area = -1;
	        for(j = rangeOffs; j < rangeTo; j++){
	            area = 0.5 * Math.abs((pointAx - avgX) * (data[j].y - pointAy) - (pointAx - data[j].x) * (avgY - pointAy));
	            if (area > maxArea) {
	                maxArea = area;
	                maxAreaPoint = data[j];
	                nextA = j;
	            }
	        }
	        decimated[sampledIndex++] = maxAreaPoint;
	        a = nextA;
	    }
	    decimated[sampledIndex++] = data[endIndex];
	    return decimated;
	}
	function minMaxDecimation(data, start, count, availableWidth) {
	    let avgX = 0;
	    let countX = 0;
	    let i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY;
	    const decimated = [];
	    const endIndex = start + count - 1;
	    const xMin = data[start].x;
	    const xMax = data[endIndex].x;
	    const dx = xMax - xMin;
	    for(i = start; i < start + count; ++i){
	        point = data[i];
	        x = (point.x - xMin) / dx * availableWidth;
	        y = point.y;
	        const truncX = x | 0;
	        if (truncX === prevX) {
	            if (y < minY) {
	                minY = y;
	                minIndex = i;
	            } else if (y > maxY) {
	                maxY = y;
	                maxIndex = i;
	            }
	            avgX = (countX * avgX + point.x) / ++countX;
	        } else {
	            const lastIndex = i - 1;
	            if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
	                const intermediateIndex1 = Math.min(minIndex, maxIndex);
	                const intermediateIndex2 = Math.max(minIndex, maxIndex);
	                if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
	                    decimated.push({
	                        ...data[intermediateIndex1],
	                        x: avgX
	                    });
	                }
	                if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
	                    decimated.push({
	                        ...data[intermediateIndex2],
	                        x: avgX
	                    });
	                }
	            }
	            if (i > 0 && lastIndex !== startIndex) {
	                decimated.push(data[lastIndex]);
	            }
	            decimated.push(point);
	            prevX = truncX;
	            countX = 0;
	            minY = maxY = y;
	            minIndex = maxIndex = startIndex = i;
	        }
	    }
	    return decimated;
	}
	function cleanDecimatedDataset(dataset) {
	    if (dataset._decimated) {
	        const data = dataset._data;
	        delete dataset._decimated;
	        delete dataset._data;
	        Object.defineProperty(dataset, 'data', {
	            configurable: true,
	            enumerable: true,
	            writable: true,
	            value: data
	        });
	    }
	}
	function cleanDecimatedData(chart) {
	    chart.data.datasets.forEach((dataset)=>{
	        cleanDecimatedDataset(dataset);
	    });
	}
	function getStartAndCountOfVisiblePointsSimplified(meta, points) {
	    const pointCount = points.length;
	    let start = 0;
	    let count;
	    const { iScale  } = meta;
	    const { min , max , minDefined , maxDefined  } = iScale.getUserBounds();
	    if (minDefined) {
	        start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1);
	    }
	    if (maxDefined) {
	        count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start;
	    } else {
	        count = pointCount - start;
	    }
	    return {
	        start,
	        count
	    };
	}
	var plugin_decimation = {
	    id: 'decimation',
	    defaults: {
	        algorithm: 'min-max',
	        enabled: false
	    },
	    beforeElementsUpdate: (chart, args, options)=>{
	        if (!options.enabled) {
	            cleanDecimatedData(chart);
	            return;
	        }
	        const availableWidth = chart.width;
	        chart.data.datasets.forEach((dataset, datasetIndex)=>{
	            const { _data , indexAxis  } = dataset;
	            const meta = chart.getDatasetMeta(datasetIndex);
	            const data = _data || dataset.data;
	            if (resolve([
	                indexAxis,
	                chart.options.indexAxis
	            ]) === 'y') {
	                return;
	            }
	            if (!meta.controller.supportsDecimation) {
	                return;
	            }
	            const xAxis = chart.scales[meta.xAxisID];
	            if (xAxis.type !== 'linear' && xAxis.type !== 'time') {
	                return;
	            }
	            if (chart.options.parsing) {
	                return;
	            }
	            let { start , count  } = getStartAndCountOfVisiblePointsSimplified(meta, data);
	            const threshold = options.threshold || 4 * availableWidth;
	            if (count <= threshold) {
	                cleanDecimatedDataset(dataset);
	                return;
	            }
	            if (isNullOrUndef(_data)) {
	                dataset._data = data;
	                delete dataset.data;
	                Object.defineProperty(dataset, 'data', {
	                    configurable: true,
	                    enumerable: true,
	                    get: function() {
	                        return this._decimated;
	                    },
	                    set: function(d) {
	                        this._data = d;
	                    }
	                });
	            }
	            let decimated;
	            switch(options.algorithm){
	                case 'lttb':
	                    decimated = lttbDecimation(data, start, count, availableWidth, options);
	                    break;
	                case 'min-max':
	                    decimated = minMaxDecimation(data, start, count, availableWidth);
	                    break;
	                default:
	                    throw new Error(`Unsupported decimation algorithm '${options.algorithm}'`);
	            }
	            dataset._decimated = decimated;
	        });
	    },
	    destroy (chart) {
	        cleanDecimatedData(chart);
	    }
	};

	function _segments(line, target, property) {
	    const segments = line.segments;
	    const points = line.points;
	    const tpoints = target.points;
	    const parts = [];
	    for (const segment of segments){
	        let { start , end  } = segment;
	        end = _findSegmentEnd(start, end, points);
	        const bounds = _getBounds(property, points[start], points[end], segment.loop);
	        if (!target.segments) {
	            parts.push({
	                source: segment,
	                target: bounds,
	                start: points[start],
	                end: points[end]
	            });
	            continue;
	        }
	        const targetSegments = _boundSegments(target, bounds);
	        for (const tgt of targetSegments){
	            const subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
	            const fillSources = _boundSegment(segment, points, subBounds);
	            for (const fillSource of fillSources){
	                parts.push({
	                    source: fillSource,
	                    target: tgt,
	                    start: {
	                        [property]: _getEdge(bounds, subBounds, 'start', Math.max)
	                    },
	                    end: {
	                        [property]: _getEdge(bounds, subBounds, 'end', Math.min)
	                    }
	                });
	            }
	        }
	    }
	    return parts;
	}
	function _getBounds(property, first, last, loop) {
	    if (loop) {
	        return;
	    }
	    let start = first[property];
	    let end = last[property];
	    if (property === 'angle') {
	        start = _normalizeAngle(start);
	        end = _normalizeAngle(end);
	    }
	    return {
	        property,
	        start,
	        end
	    };
	}
	function _pointsFromSegments(boundary, line) {
	    const { x =null , y =null  } = boundary || {};
	    const linePoints = line.points;
	    const points = [];
	    line.segments.forEach(({ start , end  })=>{
	        end = _findSegmentEnd(start, end, linePoints);
	        const first = linePoints[start];
	        const last = linePoints[end];
	        if (y !== null) {
	            points.push({
	                x: first.x,
	                y
	            });
	            points.push({
	                x: last.x,
	                y
	            });
	        } else if (x !== null) {
	            points.push({
	                x,
	                y: first.y
	            });
	            points.push({
	                x,
	                y: last.y
	            });
	        }
	    });
	    return points;
	}
	function _findSegmentEnd(start, end, points) {
	    for(; end > start; end--){
	        const point = points[end];
	        if (!isNaN(point.x) && !isNaN(point.y)) {
	            break;
	        }
	    }
	    return end;
	}
	function _getEdge(a, b, prop, fn) {
	    if (a && b) {
	        return fn(a[prop], b[prop]);
	    }
	    return a ? a[prop] : b ? b[prop] : 0;
	}

	function _createBoundaryLine(boundary, line) {
	    let points = [];
	    let _loop = false;
	    if (isArray(boundary)) {
	        _loop = true;
	        points = boundary;
	    } else {
	        points = _pointsFromSegments(boundary, line);
	    }
	    return points.length ? new LineElement({
	        points,
	        options: {
	            tension: 0
	        },
	        _loop,
	        _fullLoop: _loop
	    }) : null;
	}
	function _shouldApplyFill(source) {
	    return source && source.fill !== false;
	}

	function _resolveTarget(sources, index, propagate) {
	    const source = sources[index];
	    let fill = source.fill;
	    const visited = [
	        index
	    ];
	    let target;
	    if (!propagate) {
	        return fill;
	    }
	    while(fill !== false && visited.indexOf(fill) === -1){
	        if (!isNumberFinite(fill)) {
	            return fill;
	        }
	        target = sources[fill];
	        if (!target) {
	            return false;
	        }
	        if (target.visible) {
	            return fill;
	        }
	        visited.push(fill);
	        fill = target.fill;
	    }
	    return false;
	}
	 function _decodeFill(line, index, count) {
	     const fill = parseFillOption(line);
	    if (isObject(fill)) {
	        return isNaN(fill.value) ? false : fill;
	    }
	    let target = parseFloat(fill);
	    if (isNumberFinite(target) && Math.floor(target) === target) {
	        return decodeTargetIndex(fill[0], index, target, count);
	    }
	    return [
	        'origin',
	        'start',
	        'end',
	        'stack',
	        'shape'
	    ].indexOf(fill) >= 0 && fill;
	}
	function decodeTargetIndex(firstCh, index, target, count) {
	    if (firstCh === '-' || firstCh === '+') {
	        target = index + target;
	    }
	    if (target === index || target < 0 || target >= count) {
	        return false;
	    }
	    return target;
	}
	 function _getTargetPixel(fill, scale) {
	    let pixel = null;
	    if (fill === 'start') {
	        pixel = scale.bottom;
	    } else if (fill === 'end') {
	        pixel = scale.top;
	    } else if (isObject(fill)) {
	        pixel = scale.getPixelForValue(fill.value);
	    } else if (scale.getBasePixel) {
	        pixel = scale.getBasePixel();
	    }
	    return pixel;
	}
	 function _getTargetValue(fill, scale, startValue) {
	    let value;
	    if (fill === 'start') {
	        value = startValue;
	    } else if (fill === 'end') {
	        value = scale.options.reverse ? scale.min : scale.max;
	    } else if (isObject(fill)) {
	        value = fill.value;
	    } else {
	        value = scale.getBaseValue();
	    }
	    return value;
	}
	 function parseFillOption(line) {
	    const options = line.options;
	    const fillOption = options.fill;
	    let fill = valueOrDefault(fillOption && fillOption.target, fillOption);
	    if (fill === undefined) {
	        fill = !!options.backgroundColor;
	    }
	    if (fill === false || fill === null) {
	        return false;
	    }
	    if (fill === true) {
	        return 'origin';
	    }
	    return fill;
	}

	function _buildStackLine(source) {
	    const { scale , index , line  } = source;
	    const points = [];
	    const segments = line.segments;
	    const sourcePoints = line.points;
	    const linesBelow = getLinesBelow(scale, index);
	    linesBelow.push(_createBoundaryLine({
	        x: null,
	        y: scale.bottom
	    }, line));
	    for(let i = 0; i < segments.length; i++){
	        const segment = segments[i];
	        for(let j = segment.start; j <= segment.end; j++){
	            addPointsBelow(points, sourcePoints[j], linesBelow);
	        }
	    }
	    return new LineElement({
	        points,
	        options: {}
	    });
	}
	 function getLinesBelow(scale, index) {
	    const below = [];
	    const metas = scale.getMatchingVisibleMetas('line');
	    for(let i = 0; i < metas.length; i++){
	        const meta = metas[i];
	        if (meta.index === index) {
	            break;
	        }
	        if (!meta.hidden) {
	            below.unshift(meta.dataset);
	        }
	    }
	    return below;
	}
	 function addPointsBelow(points, sourcePoint, linesBelow) {
	    const postponed = [];
	    for(let j = 0; j < linesBelow.length; j++){
	        const line = linesBelow[j];
	        const { first , last , point  } = findPoint(line, sourcePoint, 'x');
	        if (!point || first && last) {
	            continue;
	        }
	        if (first) {
	            postponed.unshift(point);
	        } else {
	            points.push(point);
	            if (!last) {
	                break;
	            }
	        }
	    }
	    points.push(...postponed);
	}
	 function findPoint(line, sourcePoint, property) {
	    const point = line.interpolate(sourcePoint, property);
	    if (!point) {
	        return {};
	    }
	    const pointValue = point[property];
	    const segments = line.segments;
	    const linePoints = line.points;
	    let first = false;
	    let last = false;
	    for(let i = 0; i < segments.length; i++){
	        const segment = segments[i];
	        const firstValue = linePoints[segment.start][property];
	        const lastValue = linePoints[segment.end][property];
	        if (_isBetween(pointValue, firstValue, lastValue)) {
	            first = pointValue === firstValue;
	            last = pointValue === lastValue;
	            break;
	        }
	    }
	    return {
	        first,
	        last,
	        point
	    };
	}

	class simpleArc {
	    constructor(opts){
	        this.x = opts.x;
	        this.y = opts.y;
	        this.radius = opts.radius;
	    }
	    pathSegment(ctx, bounds, opts) {
	        const { x , y , radius  } = this;
	        bounds = bounds || {
	            start: 0,
	            end: TAU
	        };
	        ctx.arc(x, y, radius, bounds.end, bounds.start, true);
	        return !opts.bounds;
	    }
	    interpolate(point) {
	        const { x , y , radius  } = this;
	        const angle = point.angle;
	        return {
	            x: x + Math.cos(angle) * radius,
	            y: y + Math.sin(angle) * radius,
	            angle
	        };
	    }
	}

	function _getTarget(source) {
	    const { chart , fill , line  } = source;
	    if (isNumberFinite(fill)) {
	        return getLineByIndex(chart, fill);
	    }
	    if (fill === 'stack') {
	        return _buildStackLine(source);
	    }
	    if (fill === 'shape') {
	        return true;
	    }
	    const boundary = computeBoundary(source);
	    if (boundary instanceof simpleArc) {
	        return boundary;
	    }
	    return _createBoundaryLine(boundary, line);
	}
	 function getLineByIndex(chart, index) {
	    const meta = chart.getDatasetMeta(index);
	    const visible = meta && chart.isDatasetVisible(index);
	    return visible ? meta.dataset : null;
	}
	function computeBoundary(source) {
	    const scale = source.scale || {};
	    if (scale.getPointPositionForValue) {
	        return computeCircularBoundary(source);
	    }
	    return computeLinearBoundary(source);
	}
	function computeLinearBoundary(source) {
	    const { scale ={} , fill  } = source;
	    const pixel = _getTargetPixel(fill, scale);
	    if (isNumberFinite(pixel)) {
	        const horizontal = scale.isHorizontal();
	        return {
	            x: horizontal ? pixel : null,
	            y: horizontal ? null : pixel
	        };
	    }
	    return null;
	}
	function computeCircularBoundary(source) {
	    const { scale , fill  } = source;
	    const options = scale.options;
	    const length = scale.getLabels().length;
	    const start = options.reverse ? scale.max : scale.min;
	    const value = _getTargetValue(fill, scale, start);
	    const target = [];
	    if (options.grid.circular) {
	        const center = scale.getPointPositionForValue(0, start);
	        return new simpleArc({
	            x: center.x,
	            y: center.y,
	            radius: scale.getDistanceFromCenterForValue(value)
	        });
	    }
	    for(let i = 0; i < length; ++i){
	        target.push(scale.getPointPositionForValue(i, value));
	    }
	    return target;
	}

	function _drawfill(ctx, source, area) {
	    const target = _getTarget(source);
	    const { line , scale , axis  } = source;
	    const lineOpts = line.options;
	    const fillOption = lineOpts.fill;
	    const color = lineOpts.backgroundColor;
	    const { above =color , below =color  } = fillOption || {};
	    if (target && line.points.length) {
	        clipArea(ctx, area);
	        doFill(ctx, {
	            line,
	            target,
	            above,
	            below,
	            area,
	            scale,
	            axis
	        });
	        unclipArea(ctx);
	    }
	}
	function doFill(ctx, cfg) {
	    const { line , target , above , below , area , scale  } = cfg;
	    const property = line._loop ? 'angle' : cfg.axis;
	    ctx.save();
	    if (property === 'x' && below !== above) {
	        clipVertical(ctx, target, area.top);
	        fill(ctx, {
	            line,
	            target,
	            color: above,
	            scale,
	            property
	        });
	        ctx.restore();
	        ctx.save();
	        clipVertical(ctx, target, area.bottom);
	    }
	    fill(ctx, {
	        line,
	        target,
	        color: below,
	        scale,
	        property
	    });
	    ctx.restore();
	}
	function clipVertical(ctx, target, clipY) {
	    const { segments , points  } = target;
	    let first = true;
	    let lineLoop = false;
	    ctx.beginPath();
	    for (const segment of segments){
	        const { start , end  } = segment;
	        const firstPoint = points[start];
	        const lastPoint = points[_findSegmentEnd(start, end, points)];
	        if (first) {
	            ctx.moveTo(firstPoint.x, firstPoint.y);
	            first = false;
	        } else {
	            ctx.lineTo(firstPoint.x, clipY);
	            ctx.lineTo(firstPoint.x, firstPoint.y);
	        }
	        lineLoop = !!target.pathSegment(ctx, segment, {
	            move: lineLoop
	        });
	        if (lineLoop) {
	            ctx.closePath();
	        } else {
	            ctx.lineTo(lastPoint.x, clipY);
	        }
	    }
	    ctx.lineTo(target.first().x, clipY);
	    ctx.closePath();
	    ctx.clip();
	}
	function fill(ctx, cfg) {
	    const { line , target , property , color , scale  } = cfg;
	    const segments = _segments(line, target, property);
	    for (const { source: src , target: tgt , start , end  } of segments){
	        const { style: { backgroundColor =color  } = {}  } = src;
	        const notShape = target !== true;
	        ctx.save();
	        ctx.fillStyle = backgroundColor;
	        clipBounds(ctx, scale, notShape && _getBounds(property, start, end));
	        ctx.beginPath();
	        const lineLoop = !!line.pathSegment(ctx, src);
	        let loop;
	        if (notShape) {
	            if (lineLoop) {
	                ctx.closePath();
	            } else {
	                interpolatedLineTo(ctx, target, end, property);
	            }
	            const targetLoop = !!target.pathSegment(ctx, tgt, {
	                move: lineLoop,
	                reverse: true
	            });
	            loop = lineLoop && targetLoop;
	            if (!loop) {
	                interpolatedLineTo(ctx, target, start, property);
	            }
	        }
	        ctx.closePath();
	        ctx.fill(loop ? 'evenodd' : 'nonzero');
	        ctx.restore();
	    }
	}
	function clipBounds(ctx, scale, bounds) {
	    const { top , bottom  } = scale.chart.chartArea;
	    const { property , start , end  } = bounds || {};
	    if (property === 'x') {
	        ctx.beginPath();
	        ctx.rect(start, top, end - start, bottom - top);
	        ctx.clip();
	    }
	}
	function interpolatedLineTo(ctx, target, point, property) {
	    const interpolatedPoint = target.interpolate(point, property);
	    if (interpolatedPoint) {
	        ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
	    }
	}

	var index = {
	    id: 'filler',
	    afterDatasetsUpdate (chart, _args, options) {
	        const count = (chart.data.datasets || []).length;
	        const sources = [];
	        let meta, i, line, source;
	        for(i = 0; i < count; ++i){
	            meta = chart.getDatasetMeta(i);
	            line = meta.dataset;
	            source = null;
	            if (line && line.options && line instanceof LineElement) {
	                source = {
	                    visible: chart.isDatasetVisible(i),
	                    index: i,
	                    fill: _decodeFill(line, i, count),
	                    chart,
	                    axis: meta.controller.options.indexAxis,
	                    scale: meta.vScale,
	                    line
	                };
	            }
	            meta.$filler = source;
	            sources.push(source);
	        }
	        for(i = 0; i < count; ++i){
	            source = sources[i];
	            if (!source || source.fill === false) {
	                continue;
	            }
	            source.fill = _resolveTarget(sources, i, options.propagate);
	        }
	    },
	    beforeDraw (chart, _args, options) {
	        const draw = options.drawTime === 'beforeDraw';
	        const metasets = chart.getSortedVisibleDatasetMetas();
	        const area = chart.chartArea;
	        for(let i = metasets.length - 1; i >= 0; --i){
	            const source = metasets[i].$filler;
	            if (!source) {
	                continue;
	            }
	            source.line.updateControlPoints(area, source.axis);
	            if (draw && source.fill) {
	                _drawfill(chart.ctx, source, area);
	            }
	        }
	    },
	    beforeDatasetsDraw (chart, _args, options) {
	        if (options.drawTime !== 'beforeDatasetsDraw') {
	            return;
	        }
	        const metasets = chart.getSortedVisibleDatasetMetas();
	        for(let i = metasets.length - 1; i >= 0; --i){
	            const source = metasets[i].$filler;
	            if (_shouldApplyFill(source)) {
	                _drawfill(chart.ctx, source, chart.chartArea);
	            }
	        }
	    },
	    beforeDatasetDraw (chart, args, options) {
	        const source = args.meta.$filler;
	        if (!_shouldApplyFill(source) || options.drawTime !== 'beforeDatasetDraw') {
	            return;
	        }
	        _drawfill(chart.ctx, source, chart.chartArea);
	    },
	    defaults: {
	        propagate: true,
	        drawTime: 'beforeDatasetDraw'
	    }
	};

	const getBoxSize = (labelOpts, fontSize)=>{
	    let { boxHeight =fontSize , boxWidth =fontSize  } = labelOpts;
	    if (labelOpts.usePointStyle) {
	        boxHeight = Math.min(boxHeight, fontSize);
	        boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
	    }
	    return {
	        boxWidth,
	        boxHeight,
	        itemHeight: Math.max(fontSize, boxHeight)
	    };
	};
	const itemsEqual = (a, b)=>a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index;
	class Legend extends Element$1 {
	 constructor(config){
	        super();
	        this._added = false;
	        this.legendHitBoxes = [];
	 this._hoveredItem = null;
	        this.doughnutMode = false;
	        this.chart = config.chart;
	        this.options = config.options;
	        this.ctx = config.ctx;
	        this.legendItems = undefined;
	        this.columnSizes = undefined;
	        this.lineWidths = undefined;
	        this.maxHeight = undefined;
	        this.maxWidth = undefined;
	        this.top = undefined;
	        this.bottom = undefined;
	        this.left = undefined;
	        this.right = undefined;
	        this.height = undefined;
	        this.width = undefined;
	        this._margins = undefined;
	        this.position = undefined;
	        this.weight = undefined;
	        this.fullSize = undefined;
	    }
	    update(maxWidth, maxHeight, margins) {
	        this.maxWidth = maxWidth;
	        this.maxHeight = maxHeight;
	        this._margins = margins;
	        this.setDimensions();
	        this.buildLabels();
	        this.fit();
	    }
	    setDimensions() {
	        if (this.isHorizontal()) {
	            this.width = this.maxWidth;
	            this.left = this._margins.left;
	            this.right = this.width;
	        } else {
	            this.height = this.maxHeight;
	            this.top = this._margins.top;
	            this.bottom = this.height;
	        }
	    }
	    buildLabels() {
	        const labelOpts = this.options.labels || {};
	        let legendItems = callback(labelOpts.generateLabels, [
	            this.chart
	        ], this) || [];
	        if (labelOpts.filter) {
	            legendItems = legendItems.filter((item)=>labelOpts.filter(item, this.chart.data));
	        }
	        if (labelOpts.sort) {
	            legendItems = legendItems.sort((a, b)=>labelOpts.sort(a, b, this.chart.data));
	        }
	        if (this.options.reverse) {
	            legendItems.reverse();
	        }
	        this.legendItems = legendItems;
	    }
	    fit() {
	        const { options , ctx  } = this;
	        if (!options.display) {
	            this.width = this.height = 0;
	            return;
	        }
	        const labelOpts = options.labels;
	        const labelFont = toFont(labelOpts.font);
	        const fontSize = labelFont.size;
	        const titleHeight = this._computeTitleHeight();
	        const { boxWidth , itemHeight  } = getBoxSize(labelOpts, fontSize);
	        let width, height;
	        ctx.font = labelFont.string;
	        if (this.isHorizontal()) {
	            width = this.maxWidth;
	            height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
	        } else {
	            height = this.maxHeight;
	            width = this._fitCols(titleHeight, labelFont, boxWidth, itemHeight) + 10;
	        }
	        this.width = Math.min(width, options.maxWidth || this.maxWidth);
	        this.height = Math.min(height, options.maxHeight || this.maxHeight);
	    }
	 _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
	        const { ctx , maxWidth , options: { labels: { padding  }  }  } = this;
	        const hitboxes = this.legendHitBoxes = [];
	        const lineWidths = this.lineWidths = [
	            0
	        ];
	        const lineHeight = itemHeight + padding;
	        let totalHeight = titleHeight;
	        ctx.textAlign = 'left';
	        ctx.textBaseline = 'middle';
	        let row = -1;
	        let top = -lineHeight;
	        this.legendItems.forEach((legendItem, i)=>{
	            const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
	            if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
	                totalHeight += lineHeight;
	                lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
	                top += lineHeight;
	                row++;
	            }
	            hitboxes[i] = {
	                left: 0,
	                top,
	                row,
	                width: itemWidth,
	                height: itemHeight
	            };
	            lineWidths[lineWidths.length - 1] += itemWidth + padding;
	        });
	        return totalHeight;
	    }
	    _fitCols(titleHeight, labelFont, boxWidth, _itemHeight) {
	        const { ctx , maxHeight , options: { labels: { padding  }  }  } = this;
	        const hitboxes = this.legendHitBoxes = [];
	        const columnSizes = this.columnSizes = [];
	        const heightLimit = maxHeight - titleHeight;
	        let totalWidth = padding;
	        let currentColWidth = 0;
	        let currentColHeight = 0;
	        let left = 0;
	        let col = 0;
	        this.legendItems.forEach((legendItem, i)=>{
	            const { itemWidth , itemHeight  } = calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight);
	            if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
	                totalWidth += currentColWidth + padding;
	                columnSizes.push({
	                    width: currentColWidth,
	                    height: currentColHeight
	                });
	                left += currentColWidth + padding;
	                col++;
	                currentColWidth = currentColHeight = 0;
	            }
	            hitboxes[i] = {
	                left,
	                top: currentColHeight,
	                col,
	                width: itemWidth,
	                height: itemHeight
	            };
	            currentColWidth = Math.max(currentColWidth, itemWidth);
	            currentColHeight += itemHeight + padding;
	        });
	        totalWidth += currentColWidth;
	        columnSizes.push({
	            width: currentColWidth,
	            height: currentColHeight
	        });
	        return totalWidth;
	    }
	    adjustHitBoxes() {
	        if (!this.options.display) {
	            return;
	        }
	        const titleHeight = this._computeTitleHeight();
	        const { legendHitBoxes: hitboxes , options: { align , labels: { padding  } , rtl  }  } = this;
	        const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
	        if (this.isHorizontal()) {
	            let row = 0;
	            let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
	            for (const hitbox of hitboxes){
	                if (row !== hitbox.row) {
	                    row = hitbox.row;
	                    left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
	                }
	                hitbox.top += this.top + titleHeight + padding;
	                hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
	                left += hitbox.width + padding;
	            }
	        } else {
	            let col = 0;
	            let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
	            for (const hitbox of hitboxes){
	                if (hitbox.col !== col) {
	                    col = hitbox.col;
	                    top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
	                }
	                hitbox.top = top;
	                hitbox.left += this.left + padding;
	                hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
	                top += hitbox.height + padding;
	            }
	        }
	    }
	    isHorizontal() {
	        return this.options.position === 'top' || this.options.position === 'bottom';
	    }
	    draw() {
	        if (this.options.display) {
	            const ctx = this.ctx;
	            clipArea(ctx, this);
	            this._draw();
	            unclipArea(ctx);
	        }
	    }
	 _draw() {
	        const { options: opts , columnSizes , lineWidths , ctx  } = this;
	        const { align , labels: labelOpts  } = opts;
	        const defaultColor = defaults.color;
	        const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
	        const labelFont = toFont(labelOpts.font);
	        const { padding  } = labelOpts;
	        const fontSize = labelFont.size;
	        const halfFontSize = fontSize / 2;
	        let cursor;
	        this.drawTitle();
	        ctx.textAlign = rtlHelper.textAlign('left');
	        ctx.textBaseline = 'middle';
	        ctx.lineWidth = 0.5;
	        ctx.font = labelFont.string;
	        const { boxWidth , boxHeight , itemHeight  } = getBoxSize(labelOpts, fontSize);
	        const drawLegendBox = function(x, y, legendItem) {
	            if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
	                return;
	            }
	            ctx.save();
	            const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
	            ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
	            ctx.lineCap = valueOrDefault(legendItem.lineCap, 'butt');
	            ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
	            ctx.lineJoin = valueOrDefault(legendItem.lineJoin, 'miter');
	            ctx.lineWidth = lineWidth;
	            ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);
	            ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));
	            if (labelOpts.usePointStyle) {
	                const drawOptions = {
	                    radius: boxHeight * Math.SQRT2 / 2,
	                    pointStyle: legendItem.pointStyle,
	                    rotation: legendItem.rotation,
	                    borderWidth: lineWidth
	                };
	                const centerX = rtlHelper.xPlus(x, boxWidth / 2);
	                const centerY = y + halfFontSize;
	                drawPointLegend(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
	            } else {
	                const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
	                const xBoxLeft = rtlHelper.leftForLtr(x, boxWidth);
	                const borderRadius = toTRBLCorners(legendItem.borderRadius);
	                ctx.beginPath();
	                if (Object.values(borderRadius).some((v)=>v !== 0)) {
	                    addRoundedRectPath(ctx, {
	                        x: xBoxLeft,
	                        y: yBoxTop,
	                        w: boxWidth,
	                        h: boxHeight,
	                        radius: borderRadius
	                    });
	                } else {
	                    ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
	                }
	                ctx.fill();
	                if (lineWidth !== 0) {
	                    ctx.stroke();
	                }
	            }
	            ctx.restore();
	        };
	        const fillText = function(x, y, legendItem) {
	            renderText(ctx, legendItem.text, x, y + itemHeight / 2, labelFont, {
	                strikethrough: legendItem.hidden,
	                textAlign: rtlHelper.textAlign(legendItem.textAlign)
	            });
	        };
	        const isHorizontal = this.isHorizontal();
	        const titleHeight = this._computeTitleHeight();
	        if (isHorizontal) {
	            cursor = {
	                x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]),
	                y: this.top + padding + titleHeight,
	                line: 0
	            };
	        } else {
	            cursor = {
	                x: this.left + padding,
	                y: _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
	                line: 0
	            };
	        }
	        overrideTextDirection(this.ctx, opts.textDirection);
	        const lineHeight = itemHeight + padding;
	        this.legendItems.forEach((legendItem, i)=>{
	            ctx.strokeStyle = legendItem.fontColor;
	            ctx.fillStyle = legendItem.fontColor;
	            const textWidth = ctx.measureText(legendItem.text).width;
	            const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
	            const width = boxWidth + halfFontSize + textWidth;
	            let x = cursor.x;
	            let y = cursor.y;
	            rtlHelper.setWidth(this.width);
	            if (isHorizontal) {
	                if (i > 0 && x + width + padding > this.right) {
	                    y = cursor.y += lineHeight;
	                    cursor.line++;
	                    x = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]);
	                }
	            } else if (i > 0 && y + lineHeight > this.bottom) {
	                x = cursor.x = x + columnSizes[cursor.line].width + padding;
	                cursor.line++;
	                y = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height);
	            }
	            const realX = rtlHelper.x(x);
	            drawLegendBox(realX, y, legendItem);
	            x = _textX(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : this.right, opts.rtl);
	            fillText(rtlHelper.x(x), y, legendItem);
	            if (isHorizontal) {
	                cursor.x += width + padding;
	            } else if (typeof legendItem.text !== 'string') {
	                const fontLineHeight = labelFont.lineHeight;
	                cursor.y += calculateLegendItemHeight(legendItem, fontLineHeight) + padding;
	            } else {
	                cursor.y += lineHeight;
	            }
	        });
	        restoreTextDirection(this.ctx, opts.textDirection);
	    }
	 drawTitle() {
	        const opts = this.options;
	        const titleOpts = opts.title;
	        const titleFont = toFont(titleOpts.font);
	        const titlePadding = toPadding(titleOpts.padding);
	        if (!titleOpts.display) {
	            return;
	        }
	        const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
	        const ctx = this.ctx;
	        const position = titleOpts.position;
	        const halfFontSize = titleFont.size / 2;
	        const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
	        let y;
	        let left = this.left;
	        let maxWidth = this.width;
	        if (this.isHorizontal()) {
	            maxWidth = Math.max(...this.lineWidths);
	            y = this.top + topPaddingPlusHalfFontSize;
	            left = _alignStartEnd(opts.align, left, this.right - maxWidth);
	        } else {
	            const maxHeight = this.columnSizes.reduce((acc, size)=>Math.max(acc, size.height), 0);
	            y = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
	        }
	        const x = _alignStartEnd(position, left, left + maxWidth);
	        ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
	        ctx.textBaseline = 'middle';
	        ctx.strokeStyle = titleOpts.color;
	        ctx.fillStyle = titleOpts.color;
	        ctx.font = titleFont.string;
	        renderText(ctx, titleOpts.text, x, y, titleFont);
	    }
	 _computeTitleHeight() {
	        const titleOpts = this.options.title;
	        const titleFont = toFont(titleOpts.font);
	        const titlePadding = toPadding(titleOpts.padding);
	        return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
	    }
	 _getLegendItemAt(x, y) {
	        let i, hitBox, lh;
	        if (_isBetween(x, this.left, this.right) && _isBetween(y, this.top, this.bottom)) {
	            lh = this.legendHitBoxes;
	            for(i = 0; i < lh.length; ++i){
	                hitBox = lh[i];
	                if (_isBetween(x, hitBox.left, hitBox.left + hitBox.width) && _isBetween(y, hitBox.top, hitBox.top + hitBox.height)) {
	                    return this.legendItems[i];
	                }
	            }
	        }
	        return null;
	    }
	 handleEvent(e) {
	        const opts = this.options;
	        if (!isListened(e.type, opts)) {
	            return;
	        }
	        const hoveredItem = this._getLegendItemAt(e.x, e.y);
	        if (e.type === 'mousemove' || e.type === 'mouseout') {
	            const previous = this._hoveredItem;
	            const sameItem = itemsEqual(previous, hoveredItem);
	            if (previous && !sameItem) {
	                callback(opts.onLeave, [
	                    e,
	                    previous,
	                    this
	                ], this);
	            }
	            this._hoveredItem = hoveredItem;
	            if (hoveredItem && !sameItem) {
	                callback(opts.onHover, [
	                    e,
	                    hoveredItem,
	                    this
	                ], this);
	            }
	        } else if (hoveredItem) {
	            callback(opts.onClick, [
	                e,
	                hoveredItem,
	                this
	            ], this);
	        }
	    }
	}
	function calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight) {
	    const itemWidth = calculateItemWidth(legendItem, boxWidth, labelFont, ctx);
	    const itemHeight = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
	    return {
	        itemWidth,
	        itemHeight
	    };
	}
	function calculateItemWidth(legendItem, boxWidth, labelFont, ctx) {
	    let legendItemText = legendItem.text;
	    if (legendItemText && typeof legendItemText !== 'string') {
	        legendItemText = legendItemText.reduce((a, b)=>a.length > b.length ? a : b);
	    }
	    return boxWidth + labelFont.size / 2 + ctx.measureText(legendItemText).width;
	}
	function calculateItemHeight(_itemHeight, legendItem, fontLineHeight) {
	    let itemHeight = _itemHeight;
	    if (typeof legendItem.text !== 'string') {
	        itemHeight = calculateLegendItemHeight(legendItem, fontLineHeight);
	    }
	    return itemHeight;
	}
	function calculateLegendItemHeight(legendItem, fontLineHeight) {
	    const labelHeight = legendItem.text ? legendItem.text.length : 0;
	    return fontLineHeight * labelHeight;
	}
	function isListened(type, opts) {
	    if ((type === 'mousemove' || type === 'mouseout') && (opts.onHover || opts.onLeave)) {
	        return true;
	    }
	    if (opts.onClick && (type === 'click' || type === 'mouseup')) {
	        return true;
	    }
	    return false;
	}
	var plugin_legend = {
	    id: 'legend',
	 _element: Legend,
	    start (chart, _args, options) {
	        const legend = chart.legend = new Legend({
	            ctx: chart.ctx,
	            options,
	            chart
	        });
	        layouts.configure(chart, legend, options);
	        layouts.addBox(chart, legend);
	    },
	    stop (chart) {
	        layouts.removeBox(chart, chart.legend);
	        delete chart.legend;
	    },
	    beforeUpdate (chart, _args, options) {
	        const legend = chart.legend;
	        layouts.configure(chart, legend, options);
	        legend.options = options;
	    },
	    afterUpdate (chart) {
	        const legend = chart.legend;
	        legend.buildLabels();
	        legend.adjustHitBoxes();
	    },
	    afterEvent (chart, args) {
	        if (!args.replay) {
	            chart.legend.handleEvent(args.event);
	        }
	    },
	    defaults: {
	        display: true,
	        position: 'top',
	        align: 'center',
	        fullSize: true,
	        reverse: false,
	        weight: 1000,
	        onClick (e, legendItem, legend) {
	            const index = legendItem.datasetIndex;
	            const ci = legend.chart;
	            if (ci.isDatasetVisible(index)) {
	                ci.hide(index);
	                legendItem.hidden = true;
	            } else {
	                ci.show(index);
	                legendItem.hidden = false;
	            }
	        },
	        onHover: null,
	        onLeave: null,
	        labels: {
	            color: (ctx)=>ctx.chart.options.color,
	            boxWidth: 40,
	            padding: 10,
	            generateLabels (chart) {
	                const datasets = chart.data.datasets;
	                const { labels: { usePointStyle , pointStyle , textAlign , color , useBorderRadius , borderRadius  }  } = chart.legend.options;
	                return chart._getSortedDatasetMetas().map((meta)=>{
	                    const style = meta.controller.getStyle(usePointStyle ? 0 : undefined);
	                    const borderWidth = toPadding(style.borderWidth);
	                    return {
	                        text: datasets[meta.index].label,
	                        fillStyle: style.backgroundColor,
	                        fontColor: color,
	                        hidden: !meta.visible,
	                        lineCap: style.borderCapStyle,
	                        lineDash: style.borderDash,
	                        lineDashOffset: style.borderDashOffset,
	                        lineJoin: style.borderJoinStyle,
	                        lineWidth: (borderWidth.width + borderWidth.height) / 4,
	                        strokeStyle: style.borderColor,
	                        pointStyle: pointStyle || style.pointStyle,
	                        rotation: style.rotation,
	                        textAlign: textAlign || style.textAlign,
	                        borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
	                        datasetIndex: meta.index
	                    };
	                }, this);
	            }
	        },
	        title: {
	            color: (ctx)=>ctx.chart.options.color,
	            display: false,
	            position: 'center',
	            text: ''
	        }
	    },
	    descriptors: {
	        _scriptable: (name)=>!name.startsWith('on'),
	        labels: {
	            _scriptable: (name)=>![
	                    'generateLabels',
	                    'filter',
	                    'sort'
	                ].includes(name)
	        }
	    }
	};

	class Title extends Element$1 {
	 constructor(config){
	        super();
	        this.chart = config.chart;
	        this.options = config.options;
	        this.ctx = config.ctx;
	        this._padding = undefined;
	        this.top = undefined;
	        this.bottom = undefined;
	        this.left = undefined;
	        this.right = undefined;
	        this.width = undefined;
	        this.height = undefined;
	        this.position = undefined;
	        this.weight = undefined;
	        this.fullSize = undefined;
	    }
	    update(maxWidth, maxHeight) {
	        const opts = this.options;
	        this.left = 0;
	        this.top = 0;
	        if (!opts.display) {
	            this.width = this.height = this.right = this.bottom = 0;
	            return;
	        }
	        this.width = this.right = maxWidth;
	        this.height = this.bottom = maxHeight;
	        const lineCount = isArray(opts.text) ? opts.text.length : 1;
	        this._padding = toPadding(opts.padding);
	        const textSize = lineCount * toFont(opts.font).lineHeight + this._padding.height;
	        if (this.isHorizontal()) {
	            this.height = textSize;
	        } else {
	            this.width = textSize;
	        }
	    }
	    isHorizontal() {
	        const pos = this.options.position;
	        return pos === 'top' || pos === 'bottom';
	    }
	    _drawArgs(offset) {
	        const { top , left , bottom , right , options  } = this;
	        const align = options.align;
	        let rotation = 0;
	        let maxWidth, titleX, titleY;
	        if (this.isHorizontal()) {
	            titleX = _alignStartEnd(align, left, right);
	            titleY = top + offset;
	            maxWidth = right - left;
	        } else {
	            if (options.position === 'left') {
	                titleX = left + offset;
	                titleY = _alignStartEnd(align, bottom, top);
	                rotation = PI * -0.5;
	            } else {
	                titleX = right - offset;
	                titleY = _alignStartEnd(align, top, bottom);
	                rotation = PI * 0.5;
	            }
	            maxWidth = bottom - top;
	        }
	        return {
	            titleX,
	            titleY,
	            maxWidth,
	            rotation
	        };
	    }
	    draw() {
	        const ctx = this.ctx;
	        const opts = this.options;
	        if (!opts.display) {
	            return;
	        }
	        const fontOpts = toFont(opts.font);
	        const lineHeight = fontOpts.lineHeight;
	        const offset = lineHeight / 2 + this._padding.top;
	        const { titleX , titleY , maxWidth , rotation  } = this._drawArgs(offset);
	        renderText(ctx, opts.text, 0, 0, fontOpts, {
	            color: opts.color,
	            maxWidth,
	            rotation,
	            textAlign: _toLeftRightCenter(opts.align),
	            textBaseline: 'middle',
	            translation: [
	                titleX,
	                titleY
	            ]
	        });
	    }
	}
	function createTitle(chart, titleOpts) {
	    const title = new Title({
	        ctx: chart.ctx,
	        options: titleOpts,
	        chart
	    });
	    layouts.configure(chart, title, titleOpts);
	    layouts.addBox(chart, title);
	    chart.titleBlock = title;
	}
	var plugin_title = {
	    id: 'title',
	 _element: Title,
	    start (chart, _args, options) {
	        createTitle(chart, options);
	    },
	    stop (chart) {
	        const titleBlock = chart.titleBlock;
	        layouts.removeBox(chart, titleBlock);
	        delete chart.titleBlock;
	    },
	    beforeUpdate (chart, _args, options) {
	        const title = chart.titleBlock;
	        layouts.configure(chart, title, options);
	        title.options = options;
	    },
	    defaults: {
	        align: 'center',
	        display: false,
	        font: {
	            weight: 'bold'
	        },
	        fullSize: true,
	        padding: 10,
	        position: 'top',
	        text: '',
	        weight: 2000
	    },
	    defaultRoutes: {
	        color: 'color'
	    },
	    descriptors: {
	        _scriptable: true,
	        _indexable: false
	    }
	};

	const map = new WeakMap();
	var plugin_subtitle = {
	    id: 'subtitle',
	    start (chart, _args, options) {
	        const title = new Title({
	            ctx: chart.ctx,
	            options,
	            chart
	        });
	        layouts.configure(chart, title, options);
	        layouts.addBox(chart, title);
	        map.set(chart, title);
	    },
	    stop (chart) {
	        layouts.removeBox(chart, map.get(chart));
	        map.delete(chart);
	    },
	    beforeUpdate (chart, _args, options) {
	        const title = map.get(chart);
	        layouts.configure(chart, title, options);
	        title.options = options;
	    },
	    defaults: {
	        align: 'center',
	        display: false,
	        font: {
	            weight: 'normal'
	        },
	        fullSize: true,
	        padding: 0,
	        position: 'top',
	        text: '',
	        weight: 1500
	    },
	    defaultRoutes: {
	        color: 'color'
	    },
	    descriptors: {
	        _scriptable: true,
	        _indexable: false
	    }
	};

	const positioners = {
	 average (items) {
	        if (!items.length) {
	            return false;
	        }
	        let i, len;
	        let x = 0;
	        let y = 0;
	        let count = 0;
	        for(i = 0, len = items.length; i < len; ++i){
	            const el = items[i].element;
	            if (el && el.hasValue()) {
	                const pos = el.tooltipPosition();
	                x += pos.x;
	                y += pos.y;
	                ++count;
	            }
	        }
	        return {
	            x: x / count,
	            y: y / count
	        };
	    },
	 nearest (items, eventPosition) {
	        if (!items.length) {
	            return false;
	        }
	        let x = eventPosition.x;
	        let y = eventPosition.y;
	        let minDistance = Number.POSITIVE_INFINITY;
	        let i, len, nearestElement;
	        for(i = 0, len = items.length; i < len; ++i){
	            const el = items[i].element;
	            if (el && el.hasValue()) {
	                const center = el.getCenterPoint();
	                const d = distanceBetweenPoints(eventPosition, center);
	                if (d < minDistance) {
	                    minDistance = d;
	                    nearestElement = el;
	                }
	            }
	        }
	        if (nearestElement) {
	            const tp = nearestElement.tooltipPosition();
	            x = tp.x;
	            y = tp.y;
	        }
	        return {
	            x,
	            y
	        };
	    }
	};
	function pushOrConcat(base, toPush) {
	    if (toPush) {
	        if (isArray(toPush)) {
	            Array.prototype.push.apply(base, toPush);
	        } else {
	            base.push(toPush);
	        }
	    }
	    return base;
	}
	 function splitNewlines(str) {
	    if ((typeof str === 'string' || str instanceof String) && str.indexOf('\n') > -1) {
	        return str.split('\n');
	    }
	    return str;
	}
	 function createTooltipItem(chart, item) {
	    const { element , datasetIndex , index  } = item;
	    const controller = chart.getDatasetMeta(datasetIndex).controller;
	    const { label , value  } = controller.getLabelAndValue(index);
	    return {
	        chart,
	        label,
	        parsed: controller.getParsed(index),
	        raw: chart.data.datasets[datasetIndex].data[index],
	        formattedValue: value,
	        dataset: controller.getDataset(),
	        dataIndex: index,
	        datasetIndex,
	        element
	    };
	}
	 function getTooltipSize(tooltip, options) {
	    const ctx = tooltip.chart.ctx;
	    const { body , footer , title  } = tooltip;
	    const { boxWidth , boxHeight  } = options;
	    const bodyFont = toFont(options.bodyFont);
	    const titleFont = toFont(options.titleFont);
	    const footerFont = toFont(options.footerFont);
	    const titleLineCount = title.length;
	    const footerLineCount = footer.length;
	    const bodyLineItemCount = body.length;
	    const padding = toPadding(options.padding);
	    let height = padding.height;
	    let width = 0;
	    let combinedBodyLength = body.reduce((count, bodyItem)=>count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
	    combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
	    if (titleLineCount) {
	        height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options.titleSpacing + options.titleMarginBottom;
	    }
	    if (combinedBodyLength) {
	        const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
	        height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options.bodySpacing;
	    }
	    if (footerLineCount) {
	        height += options.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options.footerSpacing;
	    }
	    let widthPadding = 0;
	    const maxLineWidth = function(line) {
	        width = Math.max(width, ctx.measureText(line).width + widthPadding);
	    };
	    ctx.save();
	    ctx.font = titleFont.string;
	    each(tooltip.title, maxLineWidth);
	    ctx.font = bodyFont.string;
	    each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
	    widthPadding = options.displayColors ? boxWidth + 2 + options.boxPadding : 0;
	    each(body, (bodyItem)=>{
	        each(bodyItem.before, maxLineWidth);
	        each(bodyItem.lines, maxLineWidth);
	        each(bodyItem.after, maxLineWidth);
	    });
	    widthPadding = 0;
	    ctx.font = footerFont.string;
	    each(tooltip.footer, maxLineWidth);
	    ctx.restore();
	    width += padding.width;
	    return {
	        width,
	        height
	    };
	}
	function determineYAlign(chart, size) {
	    const { y , height  } = size;
	    if (y < height / 2) {
	        return 'top';
	    } else if (y > chart.height - height / 2) {
	        return 'bottom';
	    }
	    return 'center';
	}
	function doesNotFitWithAlign(xAlign, chart, options, size) {
	    const { x , width  } = size;
	    const caret = options.caretSize + options.caretPadding;
	    if (xAlign === 'left' && x + width + caret > chart.width) {
	        return true;
	    }
	    if (xAlign === 'right' && x - width - caret < 0) {
	        return true;
	    }
	}
	function determineXAlign(chart, options, size, yAlign) {
	    const { x , width  } = size;
	    const { width: chartWidth , chartArea: { left , right  }  } = chart;
	    let xAlign = 'center';
	    if (yAlign === 'center') {
	        xAlign = x <= (left + right) / 2 ? 'left' : 'right';
	    } else if (x <= width / 2) {
	        xAlign = 'left';
	    } else if (x >= chartWidth - width / 2) {
	        xAlign = 'right';
	    }
	    if (doesNotFitWithAlign(xAlign, chart, options, size)) {
	        xAlign = 'center';
	    }
	    return xAlign;
	}
	 function determineAlignment(chart, options, size) {
	    const yAlign = size.yAlign || options.yAlign || determineYAlign(chart, size);
	    return {
	        xAlign: size.xAlign || options.xAlign || determineXAlign(chart, options, size, yAlign),
	        yAlign
	    };
	}
	function alignX(size, xAlign) {
	    let { x , width  } = size;
	    if (xAlign === 'right') {
	        x -= width;
	    } else if (xAlign === 'center') {
	        x -= width / 2;
	    }
	    return x;
	}
	function alignY(size, yAlign, paddingAndSize) {
	    let { y , height  } = size;
	    if (yAlign === 'top') {
	        y += paddingAndSize;
	    } else if (yAlign === 'bottom') {
	        y -= height + paddingAndSize;
	    } else {
	        y -= height / 2;
	    }
	    return y;
	}
	 function getBackgroundPoint(options, size, alignment, chart) {
	    const { caretSize , caretPadding , cornerRadius  } = options;
	    const { xAlign , yAlign  } = alignment;
	    const paddingAndSize = caretSize + caretPadding;
	    const { topLeft , topRight , bottomLeft , bottomRight  } = toTRBLCorners(cornerRadius);
	    let x = alignX(size, xAlign);
	    const y = alignY(size, yAlign, paddingAndSize);
	    if (yAlign === 'center') {
	        if (xAlign === 'left') {
	            x += paddingAndSize;
	        } else if (xAlign === 'right') {
	            x -= paddingAndSize;
	        }
	    } else if (xAlign === 'left') {
	        x -= Math.max(topLeft, bottomLeft) + caretSize;
	    } else if (xAlign === 'right') {
	        x += Math.max(topRight, bottomRight) + caretSize;
	    }
	    return {
	        x: _limitValue(x, 0, chart.width - size.width),
	        y: _limitValue(y, 0, chart.height - size.height)
	    };
	}
	function getAlignedX(tooltip, align, options) {
	    const padding = toPadding(options.padding);
	    return align === 'center' ? tooltip.x + tooltip.width / 2 : align === 'right' ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
	}
	 function getBeforeAfterBodyLines(callback) {
	    return pushOrConcat([], splitNewlines(callback));
	}
	function createTooltipContext(parent, tooltip, tooltipItems) {
	    return createContext(parent, {
	        tooltip,
	        tooltipItems,
	        type: 'tooltip'
	    });
	}
	function overrideCallbacks(callbacks, context) {
	    const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
	    return override ? callbacks.override(override) : callbacks;
	}
	const defaultCallbacks = {
	    beforeTitle: noop,
	    title (tooltipItems) {
	        if (tooltipItems.length > 0) {
	            const item = tooltipItems[0];
	            const labels = item.chart.data.labels;
	            const labelCount = labels ? labels.length : 0;
	            if (this && this.options && this.options.mode === 'dataset') {
	                return item.dataset.label || '';
	            } else if (item.label) {
	                return item.label;
	            } else if (labelCount > 0 && item.dataIndex < labelCount) {
	                return labels[item.dataIndex];
	            }
	        }
	        return '';
	    },
	    afterTitle: noop,
	    beforeBody: noop,
	    beforeLabel: noop,
	    label (tooltipItem) {
	        if (this && this.options && this.options.mode === 'dataset') {
	            return tooltipItem.label + ': ' + tooltipItem.formattedValue || tooltipItem.formattedValue;
	        }
	        let label = tooltipItem.dataset.label || '';
	        if (label) {
	            label += ': ';
	        }
	        const value = tooltipItem.formattedValue;
	        if (!isNullOrUndef(value)) {
	            label += value;
	        }
	        return label;
	    },
	    labelColor (tooltipItem) {
	        const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
	        const options = meta.controller.getStyle(tooltipItem.dataIndex);
	        return {
	            borderColor: options.borderColor,
	            backgroundColor: options.backgroundColor,
	            borderWidth: options.borderWidth,
	            borderDash: options.borderDash,
	            borderDashOffset: options.borderDashOffset,
	            borderRadius: 0
	        };
	    },
	    labelTextColor () {
	        return this.options.bodyColor;
	    },
	    labelPointStyle (tooltipItem) {
	        const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
	        const options = meta.controller.getStyle(tooltipItem.dataIndex);
	        return {
	            pointStyle: options.pointStyle,
	            rotation: options.rotation
	        };
	    },
	    afterLabel: noop,
	    afterBody: noop,
	    beforeFooter: noop,
	    footer: noop,
	    afterFooter: noop
	};
	 function invokeCallbackWithFallback(callbacks, name, ctx, arg) {
	    const result = callbacks[name].call(ctx, arg);
	    if (typeof result === 'undefined') {
	        return defaultCallbacks[name].call(ctx, arg);
	    }
	    return result;
	}
	class Tooltip extends Element$1 {
	 static positioners = positioners;
	    constructor(config){
	        super();
	        this.opacity = 0;
	        this._active = [];
	        this._eventPosition = undefined;
	        this._size = undefined;
	        this._cachedAnimations = undefined;
	        this._tooltipItems = [];
	        this.$animations = undefined;
	        this.$context = undefined;
	        this.chart = config.chart;
	        this.options = config.options;
	        this.dataPoints = undefined;
	        this.title = undefined;
	        this.beforeBody = undefined;
	        this.body = undefined;
	        this.afterBody = undefined;
	        this.footer = undefined;
	        this.xAlign = undefined;
	        this.yAlign = undefined;
	        this.x = undefined;
	        this.y = undefined;
	        this.height = undefined;
	        this.width = undefined;
	        this.caretX = undefined;
	        this.caretY = undefined;
	        this.labelColors = undefined;
	        this.labelPointStyles = undefined;
	        this.labelTextColors = undefined;
	    }
	    initialize(options) {
	        this.options = options;
	        this._cachedAnimations = undefined;
	        this.$context = undefined;
	    }
	 _resolveAnimations() {
	        const cached = this._cachedAnimations;
	        if (cached) {
	            return cached;
	        }
	        const chart = this.chart;
	        const options = this.options.setContext(this.getContext());
	        const opts = options.enabled && chart.options.animation && options.animations;
	        const animations = new Animations(this.chart, opts);
	        if (opts._cacheable) {
	            this._cachedAnimations = Object.freeze(animations);
	        }
	        return animations;
	    }
	 getContext() {
	        return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
	    }
	    getTitle(context, options) {
	        const { callbacks  } = options;
	        const beforeTitle = invokeCallbackWithFallback(callbacks, 'beforeTitle', this, context);
	        const title = invokeCallbackWithFallback(callbacks, 'title', this, context);
	        const afterTitle = invokeCallbackWithFallback(callbacks, 'afterTitle', this, context);
	        let lines = [];
	        lines = pushOrConcat(lines, splitNewlines(beforeTitle));
	        lines = pushOrConcat(lines, splitNewlines(title));
	        lines = pushOrConcat(lines, splitNewlines(afterTitle));
	        return lines;
	    }
	    getBeforeBody(tooltipItems, options) {
	        return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, 'beforeBody', this, tooltipItems));
	    }
	    getBody(tooltipItems, options) {
	        const { callbacks  } = options;
	        const bodyItems = [];
	        each(tooltipItems, (context)=>{
	            const bodyItem = {
	                before: [],
	                lines: [],
	                after: []
	            };
	            const scoped = overrideCallbacks(callbacks, context);
	            pushOrConcat(bodyItem.before, splitNewlines(invokeCallbackWithFallback(scoped, 'beforeLabel', this, context)));
	            pushOrConcat(bodyItem.lines, invokeCallbackWithFallback(scoped, 'label', this, context));
	            pushOrConcat(bodyItem.after, splitNewlines(invokeCallbackWithFallback(scoped, 'afterLabel', this, context)));
	            bodyItems.push(bodyItem);
	        });
	        return bodyItems;
	    }
	    getAfterBody(tooltipItems, options) {
	        return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, 'afterBody', this, tooltipItems));
	    }
	    getFooter(tooltipItems, options) {
	        const { callbacks  } = options;
	        const beforeFooter = invokeCallbackWithFallback(callbacks, 'beforeFooter', this, tooltipItems);
	        const footer = invokeCallbackWithFallback(callbacks, 'footer', this, tooltipItems);
	        const afterFooter = invokeCallbackWithFallback(callbacks, 'afterFooter', this, tooltipItems);
	        let lines = [];
	        lines = pushOrConcat(lines, splitNewlines(beforeFooter));
	        lines = pushOrConcat(lines, splitNewlines(footer));
	        lines = pushOrConcat(lines, splitNewlines(afterFooter));
	        return lines;
	    }
	 _createItems(options) {
	        const active = this._active;
	        const data = this.chart.data;
	        const labelColors = [];
	        const labelPointStyles = [];
	        const labelTextColors = [];
	        let tooltipItems = [];
	        let i, len;
	        for(i = 0, len = active.length; i < len; ++i){
	            tooltipItems.push(createTooltipItem(this.chart, active[i]));
	        }
	        if (options.filter) {
	            tooltipItems = tooltipItems.filter((element, index, array)=>options.filter(element, index, array, data));
	        }
	        if (options.itemSort) {
	            tooltipItems = tooltipItems.sort((a, b)=>options.itemSort(a, b, data));
	        }
	        each(tooltipItems, (context)=>{
	            const scoped = overrideCallbacks(options.callbacks, context);
	            labelColors.push(invokeCallbackWithFallback(scoped, 'labelColor', this, context));
	            labelPointStyles.push(invokeCallbackWithFallback(scoped, 'labelPointStyle', this, context));
	            labelTextColors.push(invokeCallbackWithFallback(scoped, 'labelTextColor', this, context));
	        });
	        this.labelColors = labelColors;
	        this.labelPointStyles = labelPointStyles;
	        this.labelTextColors = labelTextColors;
	        this.dataPoints = tooltipItems;
	        return tooltipItems;
	    }
	    update(changed, replay) {
	        const options = this.options.setContext(this.getContext());
	        const active = this._active;
	        let properties;
	        let tooltipItems = [];
	        if (!active.length) {
	            if (this.opacity !== 0) {
	                properties = {
	                    opacity: 0
	                };
	            }
	        } else {
	            const position = positioners[options.position].call(this, active, this._eventPosition);
	            tooltipItems = this._createItems(options);
	            this.title = this.getTitle(tooltipItems, options);
	            this.beforeBody = this.getBeforeBody(tooltipItems, options);
	            this.body = this.getBody(tooltipItems, options);
	            this.afterBody = this.getAfterBody(tooltipItems, options);
	            this.footer = this.getFooter(tooltipItems, options);
	            const size = this._size = getTooltipSize(this, options);
	            const positionAndSize = Object.assign({}, position, size);
	            const alignment = determineAlignment(this.chart, options, positionAndSize);
	            const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart);
	            this.xAlign = alignment.xAlign;
	            this.yAlign = alignment.yAlign;
	            properties = {
	                opacity: 1,
	                x: backgroundPoint.x,
	                y: backgroundPoint.y,
	                width: size.width,
	                height: size.height,
	                caretX: position.x,
	                caretY: position.y
	            };
	        }
	        this._tooltipItems = tooltipItems;
	        this.$context = undefined;
	        if (properties) {
	            this._resolveAnimations().update(this, properties);
	        }
	        if (changed && options.external) {
	            options.external.call(this, {
	                chart: this.chart,
	                tooltip: this,
	                replay
	            });
	        }
	    }
	    drawCaret(tooltipPoint, ctx, size, options) {
	        const caretPosition = this.getCaretPosition(tooltipPoint, size, options);
	        ctx.lineTo(caretPosition.x1, caretPosition.y1);
	        ctx.lineTo(caretPosition.x2, caretPosition.y2);
	        ctx.lineTo(caretPosition.x3, caretPosition.y3);
	    }
	    getCaretPosition(tooltipPoint, size, options) {
	        const { xAlign , yAlign  } = this;
	        const { caretSize , cornerRadius  } = options;
	        const { topLeft , topRight , bottomLeft , bottomRight  } = toTRBLCorners(cornerRadius);
	        const { x: ptX , y: ptY  } = tooltipPoint;
	        const { width , height  } = size;
	        let x1, x2, x3, y1, y2, y3;
	        if (yAlign === 'center') {
	            y2 = ptY + height / 2;
	            if (xAlign === 'left') {
	                x1 = ptX;
	                x2 = x1 - caretSize;
	                y1 = y2 + caretSize;
	                y3 = y2 - caretSize;
	            } else {
	                x1 = ptX + width;
	                x2 = x1 + caretSize;
	                y1 = y2 - caretSize;
	                y3 = y2 + caretSize;
	            }
	            x3 = x1;
	        } else {
	            if (xAlign === 'left') {
	                x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
	            } else if (xAlign === 'right') {
	                x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
	            } else {
	                x2 = this.caretX;
	            }
	            if (yAlign === 'top') {
	                y1 = ptY;
	                y2 = y1 - caretSize;
	                x1 = x2 - caretSize;
	                x3 = x2 + caretSize;
	            } else {
	                y1 = ptY + height;
	                y2 = y1 + caretSize;
	                x1 = x2 + caretSize;
	                x3 = x2 - caretSize;
	            }
	            y3 = y1;
	        }
	        return {
	            x1,
	            x2,
	            x3,
	            y1,
	            y2,
	            y3
	        };
	    }
	    drawTitle(pt, ctx, options) {
	        const title = this.title;
	        const length = title.length;
	        let titleFont, titleSpacing, i;
	        if (length) {
	            const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
	            pt.x = getAlignedX(this, options.titleAlign, options);
	            ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
	            ctx.textBaseline = 'middle';
	            titleFont = toFont(options.titleFont);
	            titleSpacing = options.titleSpacing;
	            ctx.fillStyle = options.titleColor;
	            ctx.font = titleFont.string;
	            for(i = 0; i < length; ++i){
	                ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
	                pt.y += titleFont.lineHeight + titleSpacing;
	                if (i + 1 === length) {
	                    pt.y += options.titleMarginBottom - titleSpacing;
	                }
	            }
	        }
	    }
	 _drawColorBox(ctx, pt, i, rtlHelper, options) {
	        const labelColor = this.labelColors[i];
	        const labelPointStyle = this.labelPointStyles[i];
	        const { boxHeight , boxWidth  } = options;
	        const bodyFont = toFont(options.bodyFont);
	        const colorX = getAlignedX(this, 'left', options);
	        const rtlColorX = rtlHelper.x(colorX);
	        const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
	        const colorY = pt.y + yOffSet;
	        if (options.usePointStyle) {
	            const drawOptions = {
	                radius: Math.min(boxWidth, boxHeight) / 2,
	                pointStyle: labelPointStyle.pointStyle,
	                rotation: labelPointStyle.rotation,
	                borderWidth: 1
	            };
	            const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
	            const centerY = colorY + boxHeight / 2;
	            ctx.strokeStyle = options.multiKeyBackground;
	            ctx.fillStyle = options.multiKeyBackground;
	            drawPoint(ctx, drawOptions, centerX, centerY);
	            ctx.strokeStyle = labelColor.borderColor;
	            ctx.fillStyle = labelColor.backgroundColor;
	            drawPoint(ctx, drawOptions, centerX, centerY);
	        } else {
	            ctx.lineWidth = isObject(labelColor.borderWidth) ? Math.max(...Object.values(labelColor.borderWidth)) : labelColor.borderWidth || 1;
	            ctx.strokeStyle = labelColor.borderColor;
	            ctx.setLineDash(labelColor.borderDash || []);
	            ctx.lineDashOffset = labelColor.borderDashOffset || 0;
	            const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth);
	            const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2);
	            const borderRadius = toTRBLCorners(labelColor.borderRadius);
	            if (Object.values(borderRadius).some((v)=>v !== 0)) {
	                ctx.beginPath();
	                ctx.fillStyle = options.multiKeyBackground;
	                addRoundedRectPath(ctx, {
	                    x: outerX,
	                    y: colorY,
	                    w: boxWidth,
	                    h: boxHeight,
	                    radius: borderRadius
	                });
	                ctx.fill();
	                ctx.stroke();
	                ctx.fillStyle = labelColor.backgroundColor;
	                ctx.beginPath();
	                addRoundedRectPath(ctx, {
	                    x: innerX,
	                    y: colorY + 1,
	                    w: boxWidth - 2,
	                    h: boxHeight - 2,
	                    radius: borderRadius
	                });
	                ctx.fill();
	            } else {
	                ctx.fillStyle = options.multiKeyBackground;
	                ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
	                ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
	                ctx.fillStyle = labelColor.backgroundColor;
	                ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
	            }
	        }
	        ctx.fillStyle = this.labelTextColors[i];
	    }
	    drawBody(pt, ctx, options) {
	        const { body  } = this;
	        const { bodySpacing , bodyAlign , displayColors , boxHeight , boxWidth , boxPadding  } = options;
	        const bodyFont = toFont(options.bodyFont);
	        let bodyLineHeight = bodyFont.lineHeight;
	        let xLinePadding = 0;
	        const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
	        const fillLineOfText = function(line) {
	            ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
	            pt.y += bodyLineHeight + bodySpacing;
	        };
	        const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
	        let bodyItem, textColor, lines, i, j, ilen, jlen;
	        ctx.textAlign = bodyAlign;
	        ctx.textBaseline = 'middle';
	        ctx.font = bodyFont.string;
	        pt.x = getAlignedX(this, bodyAlignForCalculation, options);
	        ctx.fillStyle = options.bodyColor;
	        each(this.beforeBody, fillLineOfText);
	        xLinePadding = displayColors && bodyAlignForCalculation !== 'right' ? bodyAlign === 'center' ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
	        for(i = 0, ilen = body.length; i < ilen; ++i){
	            bodyItem = body[i];
	            textColor = this.labelTextColors[i];
	            ctx.fillStyle = textColor;
	            each(bodyItem.before, fillLineOfText);
	            lines = bodyItem.lines;
	            if (displayColors && lines.length) {
	                this._drawColorBox(ctx, pt, i, rtlHelper, options);
	                bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
	            }
	            for(j = 0, jlen = lines.length; j < jlen; ++j){
	                fillLineOfText(lines[j]);
	                bodyLineHeight = bodyFont.lineHeight;
	            }
	            each(bodyItem.after, fillLineOfText);
	        }
	        xLinePadding = 0;
	        bodyLineHeight = bodyFont.lineHeight;
	        each(this.afterBody, fillLineOfText);
	        pt.y -= bodySpacing;
	    }
	    drawFooter(pt, ctx, options) {
	        const footer = this.footer;
	        const length = footer.length;
	        let footerFont, i;
	        if (length) {
	            const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
	            pt.x = getAlignedX(this, options.footerAlign, options);
	            pt.y += options.footerMarginTop;
	            ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
	            ctx.textBaseline = 'middle';
	            footerFont = toFont(options.footerFont);
	            ctx.fillStyle = options.footerColor;
	            ctx.font = footerFont.string;
	            for(i = 0; i < length; ++i){
	                ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
	                pt.y += footerFont.lineHeight + options.footerSpacing;
	            }
	        }
	    }
	    drawBackground(pt, ctx, tooltipSize, options) {
	        const { xAlign , yAlign  } = this;
	        const { x , y  } = pt;
	        const { width , height  } = tooltipSize;
	        const { topLeft , topRight , bottomLeft , bottomRight  } = toTRBLCorners(options.cornerRadius);
	        ctx.fillStyle = options.backgroundColor;
	        ctx.strokeStyle = options.borderColor;
	        ctx.lineWidth = options.borderWidth;
	        ctx.beginPath();
	        ctx.moveTo(x + topLeft, y);
	        if (yAlign === 'top') {
	            this.drawCaret(pt, ctx, tooltipSize, options);
	        }
	        ctx.lineTo(x + width - topRight, y);
	        ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
	        if (yAlign === 'center' && xAlign === 'right') {
	            this.drawCaret(pt, ctx, tooltipSize, options);
	        }
	        ctx.lineTo(x + width, y + height - bottomRight);
	        ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
	        if (yAlign === 'bottom') {
	            this.drawCaret(pt, ctx, tooltipSize, options);
	        }
	        ctx.lineTo(x + bottomLeft, y + height);
	        ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
	        if (yAlign === 'center' && xAlign === 'left') {
	            this.drawCaret(pt, ctx, tooltipSize, options);
	        }
	        ctx.lineTo(x, y + topLeft);
	        ctx.quadraticCurveTo(x, y, x + topLeft, y);
	        ctx.closePath();
	        ctx.fill();
	        if (options.borderWidth > 0) {
	            ctx.stroke();
	        }
	    }
	 _updateAnimationTarget(options) {
	        const chart = this.chart;
	        const anims = this.$animations;
	        const animX = anims && anims.x;
	        const animY = anims && anims.y;
	        if (animX || animY) {
	            const position = positioners[options.position].call(this, this._active, this._eventPosition);
	            if (!position) {
	                return;
	            }
	            const size = this._size = getTooltipSize(this, options);
	            const positionAndSize = Object.assign({}, position, this._size);
	            const alignment = determineAlignment(chart, options, positionAndSize);
	            const point = getBackgroundPoint(options, positionAndSize, alignment, chart);
	            if (animX._to !== point.x || animY._to !== point.y) {
	                this.xAlign = alignment.xAlign;
	                this.yAlign = alignment.yAlign;
	                this.width = size.width;
	                this.height = size.height;
	                this.caretX = position.x;
	                this.caretY = position.y;
	                this._resolveAnimations().update(this, point);
	            }
	        }
	    }
	 _willRender() {
	        return !!this.opacity;
	    }
	    draw(ctx) {
	        const options = this.options.setContext(this.getContext());
	        let opacity = this.opacity;
	        if (!opacity) {
	            return;
	        }
	        this._updateAnimationTarget(options);
	        const tooltipSize = {
	            width: this.width,
	            height: this.height
	        };
	        const pt = {
	            x: this.x,
	            y: this.y
	        };
	        opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
	        const padding = toPadding(options.padding);
	        const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
	        if (options.enabled && hasTooltipContent) {
	            ctx.save();
	            ctx.globalAlpha = opacity;
	            this.drawBackground(pt, ctx, tooltipSize, options);
	            overrideTextDirection(ctx, options.textDirection);
	            pt.y += padding.top;
	            this.drawTitle(pt, ctx, options);
	            this.drawBody(pt, ctx, options);
	            this.drawFooter(pt, ctx, options);
	            restoreTextDirection(ctx, options.textDirection);
	            ctx.restore();
	        }
	    }
	 getActiveElements() {
	        return this._active || [];
	    }
	 setActiveElements(activeElements, eventPosition) {
	        const lastActive = this._active;
	        const active = activeElements.map(({ datasetIndex , index  })=>{
	            const meta = this.chart.getDatasetMeta(datasetIndex);
	            if (!meta) {
	                throw new Error('Cannot find a dataset at index ' + datasetIndex);
	            }
	            return {
	                datasetIndex,
	                element: meta.data[index],
	                index
	            };
	        });
	        const changed = !_elementsEqual(lastActive, active);
	        const positionChanged = this._positionChanged(active, eventPosition);
	        if (changed || positionChanged) {
	            this._active = active;
	            this._eventPosition = eventPosition;
	            this._ignoreReplayEvents = true;
	            this.update(true);
	        }
	    }
	 handleEvent(e, replay, inChartArea = true) {
	        if (replay && this._ignoreReplayEvents) {
	            return false;
	        }
	        this._ignoreReplayEvents = false;
	        const options = this.options;
	        const lastActive = this._active || [];
	        const active = this._getActiveElements(e, lastActive, replay, inChartArea);
	        const positionChanged = this._positionChanged(active, e);
	        const changed = replay || !_elementsEqual(active, lastActive) || positionChanged;
	        if (changed) {
	            this._active = active;
	            if (options.enabled || options.external) {
	                this._eventPosition = {
	                    x: e.x,
	                    y: e.y
	                };
	                this.update(true, replay);
	            }
	        }
	        return changed;
	    }
	 _getActiveElements(e, lastActive, replay, inChartArea) {
	        const options = this.options;
	        if (e.type === 'mouseout') {
	            return [];
	        }
	        if (!inChartArea) {
	            return lastActive.filter((i)=>this.chart.data.datasets[i.datasetIndex] && this.chart.getDatasetMeta(i.datasetIndex).controller.getParsed(i.index) !== undefined);
	        }
	        const active = this.chart.getElementsAtEventForMode(e, options.mode, options, replay);
	        if (options.reverse) {
	            active.reverse();
	        }
	        return active;
	    }
	 _positionChanged(active, e) {
	        const { caretX , caretY , options  } = this;
	        const position = positioners[options.position].call(this, active, e);
	        return position !== false && (caretX !== position.x || caretY !== position.y);
	    }
	}
	var plugin_tooltip = {
	    id: 'tooltip',
	    _element: Tooltip,
	    positioners,
	    afterInit (chart, _args, options) {
	        if (options) {
	            chart.tooltip = new Tooltip({
	                chart,
	                options
	            });
	        }
	    },
	    beforeUpdate (chart, _args, options) {
	        if (chart.tooltip) {
	            chart.tooltip.initialize(options);
	        }
	    },
	    reset (chart, _args, options) {
	        if (chart.tooltip) {
	            chart.tooltip.initialize(options);
	        }
	    },
	    afterDraw (chart) {
	        const tooltip = chart.tooltip;
	        if (tooltip && tooltip._willRender()) {
	            const args = {
	                tooltip
	            };
	            if (chart.notifyPlugins('beforeTooltipDraw', {
	                ...args,
	                cancelable: true
	            }) === false) {
	                return;
	            }
	            tooltip.draw(chart.ctx);
	            chart.notifyPlugins('afterTooltipDraw', args);
	        }
	    },
	    afterEvent (chart, args) {
	        if (chart.tooltip) {
	            const useFinalPosition = args.replay;
	            if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
	                args.changed = true;
	            }
	        }
	    },
	    defaults: {
	        enabled: true,
	        external: null,
	        position: 'average',
	        backgroundColor: 'rgba(0,0,0,0.8)',
	        titleColor: '#fff',
	        titleFont: {
	            weight: 'bold'
	        },
	        titleSpacing: 2,
	        titleMarginBottom: 6,
	        titleAlign: 'left',
	        bodyColor: '#fff',
	        bodySpacing: 2,
	        bodyFont: {},
	        bodyAlign: 'left',
	        footerColor: '#fff',
	        footerSpacing: 2,
	        footerMarginTop: 6,
	        footerFont: {
	            weight: 'bold'
	        },
	        footerAlign: 'left',
	        padding: 6,
	        caretPadding: 2,
	        caretSize: 5,
	        cornerRadius: 6,
	        boxHeight: (ctx, opts)=>opts.bodyFont.size,
	        boxWidth: (ctx, opts)=>opts.bodyFont.size,
	        multiKeyBackground: '#fff',
	        displayColors: true,
	        boxPadding: 0,
	        borderColor: 'rgba(0,0,0,0)',
	        borderWidth: 0,
	        animation: {
	            duration: 400,
	            easing: 'easeOutQuart'
	        },
	        animations: {
	            numbers: {
	                type: 'number',
	                properties: [
	                    'x',
	                    'y',
	                    'width',
	                    'height',
	                    'caretX',
	                    'caretY'
	                ]
	            },
	            opacity: {
	                easing: 'linear',
	                duration: 200
	            }
	        },
	        callbacks: defaultCallbacks
	    },
	    defaultRoutes: {
	        bodyFont: 'font',
	        footerFont: 'font',
	        titleFont: 'font'
	    },
	    descriptors: {
	        _scriptable: (name)=>name !== 'filter' && name !== 'itemSort' && name !== 'external',
	        _indexable: false,
	        callbacks: {
	            _scriptable: false,
	            _indexable: false
	        },
	        animation: {
	            _fallback: false
	        },
	        animations: {
	            _fallback: 'animation'
	        }
	    },
	    additionalOptionScopes: [
	        'interaction'
	    ]
	};

	var plugins = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Colors: plugin_colors,
	Decimation: plugin_decimation,
	Filler: index,
	Legend: plugin_legend,
	SubTitle: plugin_subtitle,
	Title: plugin_title,
	Tooltip: plugin_tooltip
	});

	const addIfString = (labels, raw, index, addedLabels)=>{
	    if (typeof raw === 'string') {
	        index = labels.push(raw) - 1;
	        addedLabels.unshift({
	            index,
	            label: raw
	        });
	    } else if (isNaN(raw)) {
	        index = null;
	    }
	    return index;
	};
	function findOrAddLabel(labels, raw, index, addedLabels) {
	    const first = labels.indexOf(raw);
	    if (first === -1) {
	        return addIfString(labels, raw, index, addedLabels);
	    }
	    const last = labels.lastIndexOf(raw);
	    return first !== last ? index : first;
	}
	const validIndex = (index, max)=>index === null ? null : _limitValue(Math.round(index), 0, max);
	function _getLabelForValue(value) {
	    const labels = this.getLabels();
	    if (value >= 0 && value < labels.length) {
	        return labels[value];
	    }
	    return value;
	}
	class CategoryScale extends Scale {
	    static id = 'category';
	 static defaults = {
	        ticks: {
	            callback: _getLabelForValue
	        }
	    };
	    constructor(cfg){
	        super(cfg);
	         this._startValue = undefined;
	        this._valueRange = 0;
	        this._addedLabels = [];
	    }
	    init(scaleOptions) {
	        const added = this._addedLabels;
	        if (added.length) {
	            const labels = this.getLabels();
	            for (const { index , label  } of added){
	                if (labels[index] === label) {
	                    labels.splice(index, 1);
	                }
	            }
	            this._addedLabels = [];
	        }
	        super.init(scaleOptions);
	    }
	    parse(raw, index) {
	        if (isNullOrUndef(raw)) {
	            return null;
	        }
	        const labels = this.getLabels();
	        index = isFinite(index) && labels[index] === raw ? index : findOrAddLabel(labels, raw, valueOrDefault(index, raw), this._addedLabels);
	        return validIndex(index, labels.length - 1);
	    }
	    determineDataLimits() {
	        const { minDefined , maxDefined  } = this.getUserBounds();
	        let { min , max  } = this.getMinMax(true);
	        if (this.options.bounds === 'ticks') {
	            if (!minDefined) {
	                min = 0;
	            }
	            if (!maxDefined) {
	                max = this.getLabels().length - 1;
	            }
	        }
	        this.min = min;
	        this.max = max;
	    }
	    buildTicks() {
	        const min = this.min;
	        const max = this.max;
	        const offset = this.options.offset;
	        const ticks = [];
	        let labels = this.getLabels();
	        labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
	        this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
	        this._startValue = this.min - (offset ? 0.5 : 0);
	        for(let value = min; value <= max; value++){
	            ticks.push({
	                value
	            });
	        }
	        return ticks;
	    }
	    getLabelForValue(value) {
	        return _getLabelForValue.call(this, value);
	    }
	 configure() {
	        super.configure();
	        if (!this.isHorizontal()) {
	            this._reversePixels = !this._reversePixels;
	        }
	    }
	    getPixelForValue(value) {
	        if (typeof value !== 'number') {
	            value = this.parse(value);
	        }
	        return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
	    }
	    getPixelForTick(index) {
	        const ticks = this.ticks;
	        if (index < 0 || index > ticks.length - 1) {
	            return null;
	        }
	        return this.getPixelForValue(ticks[index].value);
	    }
	    getValueForPixel(pixel) {
	        return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
	    }
	    getBasePixel() {
	        return this.bottom;
	    }
	}

	function generateTicks$1(generationOptions, dataRange) {
	    const ticks = [];
	    const MIN_SPACING = 1e-14;
	    const { bounds , step , min , max , precision , count , maxTicks , maxDigits , includeBounds  } = generationOptions;
	    const unit = step || 1;
	    const maxSpaces = maxTicks - 1;
	    const { min: rmin , max: rmax  } = dataRange;
	    const minDefined = !isNullOrUndef(min);
	    const maxDefined = !isNullOrUndef(max);
	    const countDefined = !isNullOrUndef(count);
	    const minSpacing = (rmax - rmin) / (maxDigits + 1);
	    let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
	    let factor, niceMin, niceMax, numSpaces;
	    if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
	        return [
	            {
	                value: rmin
	            },
	            {
	                value: rmax
	            }
	        ];
	    }
	    numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
	    if (numSpaces > maxSpaces) {
	        spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
	    }
	    if (!isNullOrUndef(precision)) {
	        factor = Math.pow(10, precision);
	        spacing = Math.ceil(spacing * factor) / factor;
	    }
	    if (bounds === 'ticks') {
	        niceMin = Math.floor(rmin / spacing) * spacing;
	        niceMax = Math.ceil(rmax / spacing) * spacing;
	    } else {
	        niceMin = rmin;
	        niceMax = rmax;
	    }
	    if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1000)) {
	        numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
	        spacing = (max - min) / numSpaces;
	        niceMin = min;
	        niceMax = max;
	    } else if (countDefined) {
	        niceMin = minDefined ? min : niceMin;
	        niceMax = maxDefined ? max : niceMax;
	        numSpaces = count - 1;
	        spacing = (niceMax - niceMin) / numSpaces;
	    } else {
	        numSpaces = (niceMax - niceMin) / spacing;
	        if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
	            numSpaces = Math.round(numSpaces);
	        } else {
	            numSpaces = Math.ceil(numSpaces);
	        }
	    }
	    const decimalPlaces = Math.max(_decimalPlaces(spacing), _decimalPlaces(niceMin));
	    factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
	    niceMin = Math.round(niceMin * factor) / factor;
	    niceMax = Math.round(niceMax * factor) / factor;
	    let j = 0;
	    if (minDefined) {
	        if (includeBounds && niceMin !== min) {
	            ticks.push({
	                value: min
	            });
	            if (niceMin < min) {
	                j++;
	            }
	            if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
	                j++;
	            }
	        } else if (niceMin < min) {
	            j++;
	        }
	    }
	    for(; j < numSpaces; ++j){
	        const tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
	        if (maxDefined && tickValue > max) {
	            break;
	        }
	        ticks.push({
	            value: tickValue
	        });
	    }
	    if (maxDefined && includeBounds && niceMax !== max) {
	        if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
	            ticks[ticks.length - 1].value = max;
	        } else {
	            ticks.push({
	                value: max
	            });
	        }
	    } else if (!maxDefined || niceMax === max) {
	        ticks.push({
	            value: niceMax
	        });
	    }
	    return ticks;
	}
	function relativeLabelSize(value, minSpacing, { horizontal , minRotation  }) {
	    const rad = toRadians(minRotation);
	    const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 0.001;
	    const length = 0.75 * minSpacing * ('' + value).length;
	    return Math.min(minSpacing / ratio, length);
	}
	class LinearScaleBase extends Scale {
	    constructor(cfg){
	        super(cfg);
	         this.start = undefined;
	         this.end = undefined;
	         this._startValue = undefined;
	         this._endValue = undefined;
	        this._valueRange = 0;
	    }
	    parse(raw, index) {
	        if (isNullOrUndef(raw)) {
	            return null;
	        }
	        if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) {
	            return null;
	        }
	        return +raw;
	    }
	    handleTickRangeOptions() {
	        const { beginAtZero  } = this.options;
	        const { minDefined , maxDefined  } = this.getUserBounds();
	        let { min , max  } = this;
	        const setMin = (v)=>min = minDefined ? min : v;
	        const setMax = (v)=>max = maxDefined ? max : v;
	        if (beginAtZero) {
	            const minSign = sign(min);
	            const maxSign = sign(max);
	            if (minSign < 0 && maxSign < 0) {
	                setMax(0);
	            } else if (minSign > 0 && maxSign > 0) {
	                setMin(0);
	            }
	        }
	        if (min === max) {
	            let offset = max === 0 ? 1 : Math.abs(max * 0.05);
	            setMax(max + offset);
	            if (!beginAtZero) {
	                setMin(min - offset);
	            }
	        }
	        this.min = min;
	        this.max = max;
	    }
	    getTickLimit() {
	        const tickOpts = this.options.ticks;
	        let { maxTicksLimit , stepSize  } = tickOpts;
	        let maxTicks;
	        if (stepSize) {
	            maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
	            if (maxTicks > 1000) {
	                console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
	                maxTicks = 1000;
	            }
	        } else {
	            maxTicks = this.computeTickLimit();
	            maxTicksLimit = maxTicksLimit || 11;
	        }
	        if (maxTicksLimit) {
	            maxTicks = Math.min(maxTicksLimit, maxTicks);
	        }
	        return maxTicks;
	    }
	 computeTickLimit() {
	        return Number.POSITIVE_INFINITY;
	    }
	    buildTicks() {
	        const opts = this.options;
	        const tickOpts = opts.ticks;
	        let maxTicks = this.getTickLimit();
	        maxTicks = Math.max(2, maxTicks);
	        const numericGeneratorOptions = {
	            maxTicks,
	            bounds: opts.bounds,
	            min: opts.min,
	            max: opts.max,
	            precision: tickOpts.precision,
	            step: tickOpts.stepSize,
	            count: tickOpts.count,
	            maxDigits: this._maxDigits(),
	            horizontal: this.isHorizontal(),
	            minRotation: tickOpts.minRotation || 0,
	            includeBounds: tickOpts.includeBounds !== false
	        };
	        const dataRange = this._range || this;
	        const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
	        if (opts.bounds === 'ticks') {
	            _setMinAndMaxByKey(ticks, this, 'value');
	        }
	        if (opts.reverse) {
	            ticks.reverse();
	            this.start = this.max;
	            this.end = this.min;
	        } else {
	            this.start = this.min;
	            this.end = this.max;
	        }
	        return ticks;
	    }
	 configure() {
	        const ticks = this.ticks;
	        let start = this.min;
	        let end = this.max;
	        super.configure();
	        if (this.options.offset && ticks.length) {
	            const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
	            start -= offset;
	            end += offset;
	        }
	        this._startValue = start;
	        this._endValue = end;
	        this._valueRange = end - start;
	    }
	    getLabelForValue(value) {
	        return formatNumber(value, this.chart.options.locale, this.options.ticks.format);
	    }
	}

	class LinearScale extends LinearScaleBase {
	    static id = 'linear';
	 static defaults = {
	        ticks: {
	            callback: Ticks.formatters.numeric
	        }
	    };
	    determineDataLimits() {
	        const { min , max  } = this.getMinMax(true);
	        this.min = isNumberFinite(min) ? min : 0;
	        this.max = isNumberFinite(max) ? max : 1;
	        this.handleTickRangeOptions();
	    }
	 computeTickLimit() {
	        const horizontal = this.isHorizontal();
	        const length = horizontal ? this.width : this.height;
	        const minRotation = toRadians(this.options.ticks.minRotation);
	        const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 0.001;
	        const tickFont = this._resolveTickFontOptions(0);
	        return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
	    }
	    getPixelForValue(value) {
	        return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
	    }
	    getValueForPixel(pixel) {
	        return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
	    }
	}

	const log10Floor = (v)=>Math.floor(log10(v));
	const changeExponent = (v, m)=>Math.pow(10, log10Floor(v) + m);
	function isMajor(tickVal) {
	    const remain = tickVal / Math.pow(10, log10Floor(tickVal));
	    return remain === 1;
	}
	function steps(min, max, rangeExp) {
	    const rangeStep = Math.pow(10, rangeExp);
	    const start = Math.floor(min / rangeStep);
	    const end = Math.ceil(max / rangeStep);
	    return end - start;
	}
	function startExp(min, max) {
	    const range = max - min;
	    let rangeExp = log10Floor(range);
	    while(steps(min, max, rangeExp) > 10){
	        rangeExp++;
	    }
	    while(steps(min, max, rangeExp) < 10){
	        rangeExp--;
	    }
	    return Math.min(rangeExp, log10Floor(min));
	}
	 function generateTicks(generationOptions, { min , max  }) {
	    min = finiteOrDefault(generationOptions.min, min);
	    const ticks = [];
	    const minExp = log10Floor(min);
	    let exp = startExp(min, max);
	    let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
	    const stepSize = Math.pow(10, exp);
	    const base = minExp > exp ? Math.pow(10, minExp) : 0;
	    const start = Math.round((min - base) * precision) / precision;
	    const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
	    let significand = Math.floor((start - offset) / Math.pow(10, exp));
	    let value = finiteOrDefault(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
	    while(value < max){
	        ticks.push({
	            value,
	            major: isMajor(value),
	            significand
	        });
	        if (significand >= 10) {
	            significand = significand < 15 ? 15 : 20;
	        } else {
	            significand++;
	        }
	        if (significand >= 20) {
	            exp++;
	            significand = 2;
	            precision = exp >= 0 ? 1 : precision;
	        }
	        value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
	    }
	    const lastTick = finiteOrDefault(generationOptions.max, value);
	    ticks.push({
	        value: lastTick,
	        major: isMajor(lastTick),
	        significand
	    });
	    return ticks;
	}
	class LogarithmicScale extends Scale {
	    static id = 'logarithmic';
	 static defaults = {
	        ticks: {
	            callback: Ticks.formatters.logarithmic,
	            major: {
	                enabled: true
	            }
	        }
	    };
	    constructor(cfg){
	        super(cfg);
	         this.start = undefined;
	         this.end = undefined;
	         this._startValue = undefined;
	        this._valueRange = 0;
	    }
	    parse(raw, index) {
	        const value = LinearScaleBase.prototype.parse.apply(this, [
	            raw,
	            index
	        ]);
	        if (value === 0) {
	            this._zero = true;
	            return undefined;
	        }
	        return isNumberFinite(value) && value > 0 ? value : null;
	    }
	    determineDataLimits() {
	        const { min , max  } = this.getMinMax(true);
	        this.min = isNumberFinite(min) ? Math.max(0, min) : null;
	        this.max = isNumberFinite(max) ? Math.max(0, max) : null;
	        if (this.options.beginAtZero) {
	            this._zero = true;
	        }
	        if (this._zero && this.min !== this._suggestedMin && !isNumberFinite(this._userMin)) {
	            this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
	        }
	        this.handleTickRangeOptions();
	    }
	    handleTickRangeOptions() {
	        const { minDefined , maxDefined  } = this.getUserBounds();
	        let min = this.min;
	        let max = this.max;
	        const setMin = (v)=>min = minDefined ? min : v;
	        const setMax = (v)=>max = maxDefined ? max : v;
	        if (min === max) {
	            if (min <= 0) {
	                setMin(1);
	                setMax(10);
	            } else {
	                setMin(changeExponent(min, -1));
	                setMax(changeExponent(max, +1));
	            }
	        }
	        if (min <= 0) {
	            setMin(changeExponent(max, -1));
	        }
	        if (max <= 0) {
	            setMax(changeExponent(min, +1));
	        }
	        this.min = min;
	        this.max = max;
	    }
	    buildTicks() {
	        const opts = this.options;
	        const generationOptions = {
	            min: this._userMin,
	            max: this._userMax
	        };
	        const ticks = generateTicks(generationOptions, this);
	        if (opts.bounds === 'ticks') {
	            _setMinAndMaxByKey(ticks, this, 'value');
	        }
	        if (opts.reverse) {
	            ticks.reverse();
	            this.start = this.max;
	            this.end = this.min;
	        } else {
	            this.start = this.min;
	            this.end = this.max;
	        }
	        return ticks;
	    }
	 getLabelForValue(value) {
	        return value === undefined ? '0' : formatNumber(value, this.chart.options.locale, this.options.ticks.format);
	    }
	 configure() {
	        const start = this.min;
	        super.configure();
	        this._startValue = log10(start);
	        this._valueRange = log10(this.max) - log10(start);
	    }
	    getPixelForValue(value) {
	        if (value === undefined || value === 0) {
	            value = this.min;
	        }
	        if (value === null || isNaN(value)) {
	            return NaN;
	        }
	        return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
	    }
	    getValueForPixel(pixel) {
	        const decimal = this.getDecimalForPixel(pixel);
	        return Math.pow(10, this._startValue + decimal * this._valueRange);
	    }
	}

	function getTickBackdropHeight(opts) {
	    const tickOpts = opts.ticks;
	    if (tickOpts.display && opts.display) {
	        const padding = toPadding(tickOpts.backdropPadding);
	        return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults.font.size) + padding.height;
	    }
	    return 0;
	}
	function measureLabelSize(ctx, font, label) {
	    label = isArray(label) ? label : [
	        label
	    ];
	    return {
	        w: _longestText(ctx, font.string, label),
	        h: label.length * font.lineHeight
	    };
	}
	function determineLimits(angle, pos, size, min, max) {
	    if (angle === min || angle === max) {
	        return {
	            start: pos - size / 2,
	            end: pos + size / 2
	        };
	    } else if (angle < min || angle > max) {
	        return {
	            start: pos - size,
	            end: pos
	        };
	    }
	    return {
	        start: pos,
	        end: pos + size
	    };
	}
	 function fitWithPointLabels(scale) {
	    const orig = {
	        l: scale.left + scale._padding.left,
	        r: scale.right - scale._padding.right,
	        t: scale.top + scale._padding.top,
	        b: scale.bottom - scale._padding.bottom
	    };
	    const limits = Object.assign({}, orig);
	    const labelSizes = [];
	    const padding = [];
	    const valueCount = scale._pointLabels.length;
	    const pointLabelOpts = scale.options.pointLabels;
	    const additionalAngle = pointLabelOpts.centerPointLabels ? PI / valueCount : 0;
	    for(let i = 0; i < valueCount; i++){
	        const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i));
	        padding[i] = opts.padding;
	        const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle);
	        const plFont = toFont(opts.font);
	        const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
	        labelSizes[i] = textSize;
	        const angleRadians = _normalizeAngle(scale.getIndexAngle(i) + additionalAngle);
	        const angle = Math.round(toDegrees(angleRadians));
	        const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
	        const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
	        updateLimits(limits, orig, angleRadians, hLimits, vLimits);
	    }
	    scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b);
	    scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
	}
	function updateLimits(limits, orig, angle, hLimits, vLimits) {
	    const sin = Math.abs(Math.sin(angle));
	    const cos = Math.abs(Math.cos(angle));
	    let x = 0;
	    let y = 0;
	    if (hLimits.start < orig.l) {
	        x = (orig.l - hLimits.start) / sin;
	        limits.l = Math.min(limits.l, orig.l - x);
	    } else if (hLimits.end > orig.r) {
	        x = (hLimits.end - orig.r) / sin;
	        limits.r = Math.max(limits.r, orig.r + x);
	    }
	    if (vLimits.start < orig.t) {
	        y = (orig.t - vLimits.start) / cos;
	        limits.t = Math.min(limits.t, orig.t - y);
	    } else if (vLimits.end > orig.b) {
	        y = (vLimits.end - orig.b) / cos;
	        limits.b = Math.max(limits.b, orig.b + y);
	    }
	}
	function createPointLabelItem(scale, index, itemOpts) {
	    const outerDistance = scale.drawingArea;
	    const { extra , additionalAngle , padding , size  } = itemOpts;
	    const pointLabelPosition = scale.getPointPosition(index, outerDistance + extra + padding, additionalAngle);
	    const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI)));
	    const y = yForAngle(pointLabelPosition.y, size.h, angle);
	    const textAlign = getTextAlignForAngle(angle);
	    const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
	    return {
	        visible: true,
	        x: pointLabelPosition.x,
	        y,
	        textAlign,
	        left,
	        top: y,
	        right: left + size.w,
	        bottom: y + size.h
	    };
	}
	function isNotOverlapped(item, area) {
	    if (!area) {
	        return true;
	    }
	    const { left , top , right , bottom  } = item;
	    const apexesInArea = _isPointInArea({
	        x: left,
	        y: top
	    }, area) || _isPointInArea({
	        x: left,
	        y: bottom
	    }, area) || _isPointInArea({
	        x: right,
	        y: top
	    }, area) || _isPointInArea({
	        x: right,
	        y: bottom
	    }, area);
	    return !apexesInArea;
	}
	function buildPointLabelItems(scale, labelSizes, padding) {
	    const items = [];
	    const valueCount = scale._pointLabels.length;
	    const opts = scale.options;
	    const { centerPointLabels , display  } = opts.pointLabels;
	    const itemOpts = {
	        extra: getTickBackdropHeight(opts) / 2,
	        additionalAngle: centerPointLabels ? PI / valueCount : 0
	    };
	    let area;
	    for(let i = 0; i < valueCount; i++){
	        itemOpts.padding = padding[i];
	        itemOpts.size = labelSizes[i];
	        const item = createPointLabelItem(scale, i, itemOpts);
	        items.push(item);
	        if (display === 'auto') {
	            item.visible = isNotOverlapped(item, area);
	            if (item.visible) {
	                area = item;
	            }
	        }
	    }
	    return items;
	}
	function getTextAlignForAngle(angle) {
	    if (angle === 0 || angle === 180) {
	        return 'center';
	    } else if (angle < 180) {
	        return 'left';
	    }
	    return 'right';
	}
	function leftForTextAlign(x, w, align) {
	    if (align === 'right') {
	        x -= w;
	    } else if (align === 'center') {
	        x -= w / 2;
	    }
	    return x;
	}
	function yForAngle(y, h, angle) {
	    if (angle === 90 || angle === 270) {
	        y -= h / 2;
	    } else if (angle > 270 || angle < 90) {
	        y -= h;
	    }
	    return y;
	}
	function drawPointLabelBox(ctx, opts, item) {
	    const { left , top , right , bottom  } = item;
	    const { backdropColor  } = opts;
	    if (!isNullOrUndef(backdropColor)) {
	        const borderRadius = toTRBLCorners(opts.borderRadius);
	        const padding = toPadding(opts.backdropPadding);
	        ctx.fillStyle = backdropColor;
	        const backdropLeft = left - padding.left;
	        const backdropTop = top - padding.top;
	        const backdropWidth = right - left + padding.width;
	        const backdropHeight = bottom - top + padding.height;
	        if (Object.values(borderRadius).some((v)=>v !== 0)) {
	            ctx.beginPath();
	            addRoundedRectPath(ctx, {
	                x: backdropLeft,
	                y: backdropTop,
	                w: backdropWidth,
	                h: backdropHeight,
	                radius: borderRadius
	            });
	            ctx.fill();
	        } else {
	            ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
	        }
	    }
	}
	function drawPointLabels(scale, labelCount) {
	    const { ctx , options: { pointLabels  }  } = scale;
	    for(let i = labelCount - 1; i >= 0; i--){
	        const item = scale._pointLabelItems[i];
	        if (!item.visible) {
	            continue;
	        }
	        const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
	        drawPointLabelBox(ctx, optsAtIndex, item);
	        const plFont = toFont(optsAtIndex.font);
	        const { x , y , textAlign  } = item;
	        renderText(ctx, scale._pointLabels[i], x, y + plFont.lineHeight / 2, plFont, {
	            color: optsAtIndex.color,
	            textAlign: textAlign,
	            textBaseline: 'middle'
	        });
	    }
	}
	function pathRadiusLine(scale, radius, circular, labelCount) {
	    const { ctx  } = scale;
	    if (circular) {
	        ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
	    } else {
	        let pointPosition = scale.getPointPosition(0, radius);
	        ctx.moveTo(pointPosition.x, pointPosition.y);
	        for(let i = 1; i < labelCount; i++){
	            pointPosition = scale.getPointPosition(i, radius);
	            ctx.lineTo(pointPosition.x, pointPosition.y);
	        }
	    }
	}
	function drawRadiusLine(scale, gridLineOpts, radius, labelCount, borderOpts) {
	    const ctx = scale.ctx;
	    const circular = gridLineOpts.circular;
	    const { color , lineWidth  } = gridLineOpts;
	    if (!circular && !labelCount || !color || !lineWidth || radius < 0) {
	        return;
	    }
	    ctx.save();
	    ctx.strokeStyle = color;
	    ctx.lineWidth = lineWidth;
	    ctx.setLineDash(borderOpts.dash);
	    ctx.lineDashOffset = borderOpts.dashOffset;
	    ctx.beginPath();
	    pathRadiusLine(scale, radius, circular, labelCount);
	    ctx.closePath();
	    ctx.stroke();
	    ctx.restore();
	}
	function createPointLabelContext(parent, index, label) {
	    return createContext(parent, {
	        label,
	        index,
	        type: 'pointLabel'
	    });
	}
	class RadialLinearScale extends LinearScaleBase {
	    static id = 'radialLinear';
	 static defaults = {
	        display: true,
	        animate: true,
	        position: 'chartArea',
	        angleLines: {
	            display: true,
	            lineWidth: 1,
	            borderDash: [],
	            borderDashOffset: 0.0
	        },
	        grid: {
	            circular: false
	        },
	        startAngle: 0,
	        ticks: {
	            showLabelBackdrop: true,
	            callback: Ticks.formatters.numeric
	        },
	        pointLabels: {
	            backdropColor: undefined,
	            backdropPadding: 2,
	            display: true,
	            font: {
	                size: 10
	            },
	            callback (label) {
	                return label;
	            },
	            padding: 5,
	            centerPointLabels: false
	        }
	    };
	    static defaultRoutes = {
	        'angleLines.color': 'borderColor',
	        'pointLabels.color': 'color',
	        'ticks.color': 'color'
	    };
	    static descriptors = {
	        angleLines: {
	            _fallback: 'grid'
	        }
	    };
	    constructor(cfg){
	        super(cfg);
	         this.xCenter = undefined;
	         this.yCenter = undefined;
	         this.drawingArea = undefined;
	         this._pointLabels = [];
	        this._pointLabelItems = [];
	    }
	    setDimensions() {
	        const padding = this._padding = toPadding(getTickBackdropHeight(this.options) / 2);
	        const w = this.width = this.maxWidth - padding.width;
	        const h = this.height = this.maxHeight - padding.height;
	        this.xCenter = Math.floor(this.left + w / 2 + padding.left);
	        this.yCenter = Math.floor(this.top + h / 2 + padding.top);
	        this.drawingArea = Math.floor(Math.min(w, h) / 2);
	    }
	    determineDataLimits() {
	        const { min , max  } = this.getMinMax(false);
	        this.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
	        this.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
	        this.handleTickRangeOptions();
	    }
	 computeTickLimit() {
	        return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
	    }
	    generateTickLabels(ticks) {
	        LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
	        this._pointLabels = this.getLabels().map((value, index)=>{
	            const label = callback(this.options.pointLabels.callback, [
	                value,
	                index
	            ], this);
	            return label || label === 0 ? label : '';
	        }).filter((v, i)=>this.chart.getDataVisibility(i));
	    }
	    fit() {
	        const opts = this.options;
	        if (opts.display && opts.pointLabels.display) {
	            fitWithPointLabels(this);
	        } else {
	            this.setCenterPoint(0, 0, 0, 0);
	        }
	    }
	    setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
	        this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
	        this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
	        this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
	    }
	    getIndexAngle(index) {
	        const angleMultiplier = TAU / (this._pointLabels.length || 1);
	        const startAngle = this.options.startAngle || 0;
	        return _normalizeAngle(index * angleMultiplier + toRadians(startAngle));
	    }
	    getDistanceFromCenterForValue(value) {
	        if (isNullOrUndef(value)) {
	            return NaN;
	        }
	        const scalingFactor = this.drawingArea / (this.max - this.min);
	        if (this.options.reverse) {
	            return (this.max - value) * scalingFactor;
	        }
	        return (value - this.min) * scalingFactor;
	    }
	    getValueForDistanceFromCenter(distance) {
	        if (isNullOrUndef(distance)) {
	            return NaN;
	        }
	        const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
	        return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
	    }
	    getPointLabelContext(index) {
	        const pointLabels = this._pointLabels || [];
	        if (index >= 0 && index < pointLabels.length) {
	            const pointLabel = pointLabels[index];
	            return createPointLabelContext(this.getContext(), index, pointLabel);
	        }
	    }
	    getPointPosition(index, distanceFromCenter, additionalAngle = 0) {
	        const angle = this.getIndexAngle(index) - HALF_PI + additionalAngle;
	        return {
	            x: Math.cos(angle) * distanceFromCenter + this.xCenter,
	            y: Math.sin(angle) * distanceFromCenter + this.yCenter,
	            angle
	        };
	    }
	    getPointPositionForValue(index, value) {
	        return this.getPointPosition(index, this.getDistanceFromCenterForValue(value));
	    }
	    getBasePosition(index) {
	        return this.getPointPositionForValue(index || 0, this.getBaseValue());
	    }
	    getPointLabelPosition(index) {
	        const { left , top , right , bottom  } = this._pointLabelItems[index];
	        return {
	            left,
	            top,
	            right,
	            bottom
	        };
	    }
	 drawBackground() {
	        const { backgroundColor , grid: { circular  }  } = this.options;
	        if (backgroundColor) {
	            const ctx = this.ctx;
	            ctx.save();
	            ctx.beginPath();
	            pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
	            ctx.closePath();
	            ctx.fillStyle = backgroundColor;
	            ctx.fill();
	            ctx.restore();
	        }
	    }
	 drawGrid() {
	        const ctx = this.ctx;
	        const opts = this.options;
	        const { angleLines , grid , border  } = opts;
	        const labelCount = this._pointLabels.length;
	        let i, offset, position;
	        if (opts.pointLabels.display) {
	            drawPointLabels(this, labelCount);
	        }
	        if (grid.display) {
	            this.ticks.forEach((tick, index)=>{
	                if (index !== 0) {
	                    offset = this.getDistanceFromCenterForValue(tick.value);
	                    const context = this.getContext(index);
	                    const optsAtIndex = grid.setContext(context);
	                    const optsAtIndexBorder = border.setContext(context);
	                    drawRadiusLine(this, optsAtIndex, offset, labelCount, optsAtIndexBorder);
	                }
	            });
	        }
	        if (angleLines.display) {
	            ctx.save();
	            for(i = labelCount - 1; i >= 0; i--){
	                const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
	                const { color , lineWidth  } = optsAtIndex;
	                if (!lineWidth || !color) {
	                    continue;
	                }
	                ctx.lineWidth = lineWidth;
	                ctx.strokeStyle = color;
	                ctx.setLineDash(optsAtIndex.borderDash);
	                ctx.lineDashOffset = optsAtIndex.borderDashOffset;
	                offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max);
	                position = this.getPointPosition(i, offset);
	                ctx.beginPath();
	                ctx.moveTo(this.xCenter, this.yCenter);
	                ctx.lineTo(position.x, position.y);
	                ctx.stroke();
	            }
	            ctx.restore();
	        }
	    }
	 drawBorder() {}
	 drawLabels() {
	        const ctx = this.ctx;
	        const opts = this.options;
	        const tickOpts = opts.ticks;
	        if (!tickOpts.display) {
	            return;
	        }
	        const startAngle = this.getIndexAngle(0);
	        let offset, width;
	        ctx.save();
	        ctx.translate(this.xCenter, this.yCenter);
	        ctx.rotate(startAngle);
	        ctx.textAlign = 'center';
	        ctx.textBaseline = 'middle';
	        this.ticks.forEach((tick, index)=>{
	            if (index === 0 && !opts.reverse) {
	                return;
	            }
	            const optsAtIndex = tickOpts.setContext(this.getContext(index));
	            const tickFont = toFont(optsAtIndex.font);
	            offset = this.getDistanceFromCenterForValue(this.ticks[index].value);
	            if (optsAtIndex.showLabelBackdrop) {
	                ctx.font = tickFont.string;
	                width = ctx.measureText(tick.label).width;
	                ctx.fillStyle = optsAtIndex.backdropColor;
	                const padding = toPadding(optsAtIndex.backdropPadding);
	                ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
	            }
	            renderText(ctx, tick.label, 0, -offset, tickFont, {
	                color: optsAtIndex.color,
	                strokeColor: optsAtIndex.textStrokeColor,
	                strokeWidth: optsAtIndex.textStrokeWidth
	            });
	        });
	        ctx.restore();
	    }
	 drawTitle() {}
	}

	const INTERVALS = {
	    millisecond: {
	        common: true,
	        size: 1,
	        steps: 1000
	    },
	    second: {
	        common: true,
	        size: 1000,
	        steps: 60
	    },
	    minute: {
	        common: true,
	        size: 60000,
	        steps: 60
	    },
	    hour: {
	        common: true,
	        size: 3600000,
	        steps: 24
	    },
	    day: {
	        common: true,
	        size: 86400000,
	        steps: 30
	    },
	    week: {
	        common: false,
	        size: 604800000,
	        steps: 4
	    },
	    month: {
	        common: true,
	        size: 2.628e9,
	        steps: 12
	    },
	    quarter: {
	        common: false,
	        size: 7.884e9,
	        steps: 4
	    },
	    year: {
	        common: true,
	        size: 3.154e10
	    }
	};
	 const UNITS =  /* #__PURE__ */ Object.keys(INTERVALS);
	 function sorter(a, b) {
	    return a - b;
	}
	 function parse(scale, input) {
	    if (isNullOrUndef(input)) {
	        return null;
	    }
	    const adapter = scale._adapter;
	    const { parser , round , isoWeekday  } = scale._parseOpts;
	    let value = input;
	    if (typeof parser === 'function') {
	        value = parser(value);
	    }
	    if (!isNumberFinite(value)) {
	        value = typeof parser === 'string' ? adapter.parse(value,  parser) : adapter.parse(value);
	    }
	    if (value === null) {
	        return null;
	    }
	    if (round) {
	        value = round === 'week' && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, 'isoWeek', isoWeekday) : adapter.startOf(value, round);
	    }
	    return +value;
	}
	 function determineUnitForAutoTicks(minUnit, min, max, capacity) {
	    const ilen = UNITS.length;
	    for(let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i){
	        const interval = INTERVALS[UNITS[i]];
	        const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
	        if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
	            return UNITS[i];
	        }
	    }
	    return UNITS[ilen - 1];
	}
	 function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
	    for(let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--){
	        const unit = UNITS[i];
	        if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
	            return unit;
	        }
	    }
	    return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
	}
	 function determineMajorUnit(unit) {
	    for(let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i){
	        if (INTERVALS[UNITS[i]].common) {
	            return UNITS[i];
	        }
	    }
	}
	 function addTick(ticks, time, timestamps) {
	    if (!timestamps) {
	        ticks[time] = true;
	    } else if (timestamps.length) {
	        const { lo , hi  } = _lookup(timestamps, time);
	        const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
	        ticks[timestamp] = true;
	    }
	}
	 function setMajorTicks(scale, ticks, map, majorUnit) {
	    const adapter = scale._adapter;
	    const first = +adapter.startOf(ticks[0].value, majorUnit);
	    const last = ticks[ticks.length - 1].value;
	    let major, index;
	    for(major = first; major <= last; major = +adapter.add(major, 1, majorUnit)){
	        index = map[major];
	        if (index >= 0) {
	            ticks[index].major = true;
	        }
	    }
	    return ticks;
	}
	 function ticksFromTimestamps(scale, values, majorUnit) {
	    const ticks = [];
	     const map = {};
	    const ilen = values.length;
	    let i, value;
	    for(i = 0; i < ilen; ++i){
	        value = values[i];
	        map[value] = i;
	        ticks.push({
	            value,
	            major: false
	        });
	    }
	    return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map, majorUnit);
	}
	class TimeScale extends Scale {
	    static id = 'time';
	 static defaults = {
	 bounds: 'data',
	        adapters: {},
	        time: {
	            parser: false,
	            unit: false,
	            round: false,
	            isoWeekday: false,
	            minUnit: 'millisecond',
	            displayFormats: {}
	        },
	        ticks: {
	 source: 'auto',
	            callback: false,
	            major: {
	                enabled: false
	            }
	        }
	    };
	 constructor(props){
	        super(props);
	         this._cache = {
	            data: [],
	            labels: [],
	            all: []
	        };
	         this._unit = 'day';
	         this._majorUnit = undefined;
	        this._offsets = {};
	        this._normalized = false;
	        this._parseOpts = undefined;
	    }
	    init(scaleOpts, opts = {}) {
	        const time = scaleOpts.time || (scaleOpts.time = {});
	         const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
	        adapter.init(opts);
	        mergeIf(time.displayFormats, adapter.formats());
	        this._parseOpts = {
	            parser: time.parser,
	            round: time.round,
	            isoWeekday: time.isoWeekday
	        };
	        super.init(scaleOpts);
	        this._normalized = opts.normalized;
	    }
	 parse(raw, index) {
	        if (raw === undefined) {
	            return null;
	        }
	        return parse(this, raw);
	    }
	    beforeLayout() {
	        super.beforeLayout();
	        this._cache = {
	            data: [],
	            labels: [],
	            all: []
	        };
	    }
	    determineDataLimits() {
	        const options = this.options;
	        const adapter = this._adapter;
	        const unit = options.time.unit || 'day';
	        let { min , max , minDefined , maxDefined  } = this.getUserBounds();
	 function _applyBounds(bounds) {
	            if (!minDefined && !isNaN(bounds.min)) {
	                min = Math.min(min, bounds.min);
	            }
	            if (!maxDefined && !isNaN(bounds.max)) {
	                max = Math.max(max, bounds.max);
	            }
	        }
	        if (!minDefined || !maxDefined) {
	            _applyBounds(this._getLabelBounds());
	            if (options.bounds !== 'ticks' || options.ticks.source !== 'labels') {
	                _applyBounds(this.getMinMax(false));
	            }
	        }
	        min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
	        max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
	        this.min = Math.min(min, max - 1);
	        this.max = Math.max(min + 1, max);
	    }
	 _getLabelBounds() {
	        const arr = this.getLabelTimestamps();
	        let min = Number.POSITIVE_INFINITY;
	        let max = Number.NEGATIVE_INFINITY;
	        if (arr.length) {
	            min = arr[0];
	            max = arr[arr.length - 1];
	        }
	        return {
	            min,
	            max
	        };
	    }
	 buildTicks() {
	        const options = this.options;
	        const timeOpts = options.time;
	        const tickOpts = options.ticks;
	        const timestamps = tickOpts.source === 'labels' ? this.getLabelTimestamps() : this._generate();
	        if (options.bounds === 'ticks' && timestamps.length) {
	            this.min = this._userMin || timestamps[0];
	            this.max = this._userMax || timestamps[timestamps.length - 1];
	        }
	        const min = this.min;
	        const max = this.max;
	        const ticks = _filterBetween(timestamps, min, max);
	        this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
	        this._majorUnit = !tickOpts.major.enabled || this._unit === 'year' ? undefined : determineMajorUnit(this._unit);
	        this.initOffsets(timestamps);
	        if (options.reverse) {
	            ticks.reverse();
	        }
	        return ticksFromTimestamps(this, ticks, this._majorUnit);
	    }
	    afterAutoSkip() {
	        if (this.options.offsetAfterAutoskip) {
	            this.initOffsets(this.ticks.map((tick)=>+tick.value));
	        }
	    }
	 initOffsets(timestamps = []) {
	        let start = 0;
	        let end = 0;
	        let first, last;
	        if (this.options.offset && timestamps.length) {
	            first = this.getDecimalForValue(timestamps[0]);
	            if (timestamps.length === 1) {
	                start = 1 - first;
	            } else {
	                start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
	            }
	            last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
	            if (timestamps.length === 1) {
	                end = last;
	            } else {
	                end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
	            }
	        }
	        const limit = timestamps.length < 3 ? 0.5 : 0.25;
	        start = _limitValue(start, 0, limit);
	        end = _limitValue(end, 0, limit);
	        this._offsets = {
	            start,
	            end,
	            factor: 1 / (start + 1 + end)
	        };
	    }
	 _generate() {
	        const adapter = this._adapter;
	        const min = this.min;
	        const max = this.max;
	        const options = this.options;
	        const timeOpts = options.time;
	        const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
	        const stepSize = valueOrDefault(options.ticks.stepSize, 1);
	        const weekday = minor === 'week' ? timeOpts.isoWeekday : false;
	        const hasWeekday = isNumber(weekday) || weekday === true;
	        const ticks = {};
	        let first = min;
	        let time, count;
	        if (hasWeekday) {
	            first = +adapter.startOf(first, 'isoWeek', weekday);
	        }
	        first = +adapter.startOf(first, hasWeekday ? 'day' : minor);
	        if (adapter.diff(max, min, minor) > 100000 * stepSize) {
	            throw new Error(min + ' and ' + max + ' are too far apart with stepSize of ' + stepSize + ' ' + minor);
	        }
	        const timestamps = options.ticks.source === 'data' && this.getDataTimestamps();
	        for(time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++){
	            addTick(ticks, time, timestamps);
	        }
	        if (time === max || options.bounds === 'ticks' || count === 1) {
	            addTick(ticks, time, timestamps);
	        }
	        return Object.keys(ticks).sort(sorter).map((x)=>+x);
	    }
	 getLabelForValue(value) {
	        const adapter = this._adapter;
	        const timeOpts = this.options.time;
	        if (timeOpts.tooltipFormat) {
	            return adapter.format(value, timeOpts.tooltipFormat);
	        }
	        return adapter.format(value, timeOpts.displayFormats.datetime);
	    }
	 format(value, format) {
	        const options = this.options;
	        const formats = options.time.displayFormats;
	        const unit = this._unit;
	        const fmt = format || formats[unit];
	        return this._adapter.format(value, fmt);
	    }
	 _tickFormatFunction(time, index, ticks, format) {
	        const options = this.options;
	        const formatter = options.ticks.callback;
	        if (formatter) {
	            return callback(formatter, [
	                time,
	                index,
	                ticks
	            ], this);
	        }
	        const formats = options.time.displayFormats;
	        const unit = this._unit;
	        const majorUnit = this._majorUnit;
	        const minorFormat = unit && formats[unit];
	        const majorFormat = majorUnit && formats[majorUnit];
	        const tick = ticks[index];
	        const major = majorUnit && majorFormat && tick && tick.major;
	        return this._adapter.format(time, format || (major ? majorFormat : minorFormat));
	    }
	 generateTickLabels(ticks) {
	        let i, ilen, tick;
	        for(i = 0, ilen = ticks.length; i < ilen; ++i){
	            tick = ticks[i];
	            tick.label = this._tickFormatFunction(tick.value, i, ticks);
	        }
	    }
	 getDecimalForValue(value) {
	        return value === null ? NaN : (value - this.min) / (this.max - this.min);
	    }
	 getPixelForValue(value) {
	        const offsets = this._offsets;
	        const pos = this.getDecimalForValue(value);
	        return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
	    }
	 getValueForPixel(pixel) {
	        const offsets = this._offsets;
	        const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
	        return this.min + pos * (this.max - this.min);
	    }
	 _getLabelSize(label) {
	        const ticksOpts = this.options.ticks;
	        const tickLabelWidth = this.ctx.measureText(label).width;
	        const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
	        const cosRotation = Math.cos(angle);
	        const sinRotation = Math.sin(angle);
	        const tickFontSize = this._resolveTickFontOptions(0).size;
	        return {
	            w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
	            h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
	        };
	    }
	 _getLabelCapacity(exampleTime) {
	        const timeOpts = this.options.time;
	        const displayFormats = timeOpts.displayFormats;
	        const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
	        const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [
	            exampleTime
	        ], this._majorUnit), format);
	        const size = this._getLabelSize(exampleLabel);
	        const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
	        return capacity > 0 ? capacity : 1;
	    }
	 getDataTimestamps() {
	        let timestamps = this._cache.data || [];
	        let i, ilen;
	        if (timestamps.length) {
	            return timestamps;
	        }
	        const metas = this.getMatchingVisibleMetas();
	        if (this._normalized && metas.length) {
	            return this._cache.data = metas[0].controller.getAllParsedValues(this);
	        }
	        for(i = 0, ilen = metas.length; i < ilen; ++i){
	            timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this));
	        }
	        return this._cache.data = this.normalize(timestamps);
	    }
	 getLabelTimestamps() {
	        const timestamps = this._cache.labels || [];
	        let i, ilen;
	        if (timestamps.length) {
	            return timestamps;
	        }
	        const labels = this.getLabels();
	        for(i = 0, ilen = labels.length; i < ilen; ++i){
	            timestamps.push(parse(this, labels[i]));
	        }
	        return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
	    }
	 normalize(values) {
	        return _arrayUnique(values.sort(sorter));
	    }
	}

	function interpolate(table, val, reverse) {
	    let lo = 0;
	    let hi = table.length - 1;
	    let prevSource, nextSource, prevTarget, nextTarget;
	    if (reverse) {
	        if (val >= table[lo].pos && val <= table[hi].pos) {
	            ({ lo , hi  } = _lookupByKey(table, 'pos', val));
	        }
	        ({ pos: prevSource , time: prevTarget  } = table[lo]);
	        ({ pos: nextSource , time: nextTarget  } = table[hi]);
	    } else {
	        if (val >= table[lo].time && val <= table[hi].time) {
	            ({ lo , hi  } = _lookupByKey(table, 'time', val));
	        }
	        ({ time: prevSource , pos: prevTarget  } = table[lo]);
	        ({ time: nextSource , pos: nextTarget  } = table[hi]);
	    }
	    const span = nextSource - prevSource;
	    return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
	}
	class TimeSeriesScale extends TimeScale {
	    static id = 'timeseries';
	 static defaults = TimeScale.defaults;
	 constructor(props){
	        super(props);
	         this._table = [];
	         this._minPos = undefined;
	         this._tableRange = undefined;
	    }
	 initOffsets() {
	        const timestamps = this._getTimestampsForTable();
	        const table = this._table = this.buildLookupTable(timestamps);
	        this._minPos = interpolate(table, this.min);
	        this._tableRange = interpolate(table, this.max) - this._minPos;
	        super.initOffsets(timestamps);
	    }
	 buildLookupTable(timestamps) {
	        const { min , max  } = this;
	        const items = [];
	        const table = [];
	        let i, ilen, prev, curr, next;
	        for(i = 0, ilen = timestamps.length; i < ilen; ++i){
	            curr = timestamps[i];
	            if (curr >= min && curr <= max) {
	                items.push(curr);
	            }
	        }
	        if (items.length < 2) {
	            return [
	                {
	                    time: min,
	                    pos: 0
	                },
	                {
	                    time: max,
	                    pos: 1
	                }
	            ];
	        }
	        for(i = 0, ilen = items.length; i < ilen; ++i){
	            next = items[i + 1];
	            prev = items[i - 1];
	            curr = items[i];
	            if (Math.round((next + prev) / 2) !== curr) {
	                table.push({
	                    time: curr,
	                    pos: i / (ilen - 1)
	                });
	            }
	        }
	        return table;
	    }
	 _generate() {
	        const min = this.min;
	        const max = this.max;
	        let timestamps = super.getDataTimestamps();
	        if (!timestamps.includes(min) || !timestamps.length) {
	            timestamps.splice(0, 0, min);
	        }
	        if (!timestamps.includes(max) || timestamps.length === 1) {
	            timestamps.push(max);
	        }
	        return timestamps.sort((a, b)=>a - b);
	    }
	 _getTimestampsForTable() {
	        let timestamps = this._cache.all || [];
	        if (timestamps.length) {
	            return timestamps;
	        }
	        const data = this.getDataTimestamps();
	        const label = this.getLabelTimestamps();
	        if (data.length && label.length) {
	            timestamps = this.normalize(data.concat(label));
	        } else {
	            timestamps = data.length ? data : label;
	        }
	        timestamps = this._cache.all = timestamps;
	        return timestamps;
	    }
	 getDecimalForValue(value) {
	        return (interpolate(this._table, value) - this._minPos) / this._tableRange;
	    }
	 getValueForPixel(pixel) {
	        const offsets = this._offsets;
	        const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
	        return interpolate(this._table, decimal * this._tableRange + this._minPos, true);
	    }
	}

	var scales = /*#__PURE__*/Object.freeze({
	__proto__: null,
	CategoryScale: CategoryScale,
	LinearScale: LinearScale,
	LogarithmicScale: LogarithmicScale,
	RadialLinearScale: RadialLinearScale,
	TimeScale: TimeScale,
	TimeSeriesScale: TimeSeriesScale
	});

	const registerables = [
	    controllers,
	    elements,
	    plugins,
	    scales
	];

	Chart.register(...registerables);

	/* src\components\ChartView.svelte generated by Svelte v4.2.9 */
	const file$3 = "src\\components\\ChartView.svelte";

	function create_fragment$3(ctx) {
		let canvas_1;

		const block = {
			c: function create() {
				canvas_1 = element("canvas");
				add_location(canvas_1, file$3, 31, 2, 749);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, canvas_1, anchor);
				/*canvas_1_binding*/ ctx[4](canvas_1);
			},
			p: noop$1,
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(canvas_1);
				}

				/*canvas_1_binding*/ ctx[4](null);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$3.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance$3($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ChartView', slots, []);
		let { chartData } = $$props;
		let { key } = $$props;
		let chart;
		let canvas;

		onMount(() => {
			const context = canvas.getContext('2d');
			$$invalidate(3, chart = new Chart(context, { type: 'bar', data: chartData })); // ... options

			return () => {
				chart.destroy(); // Cleanup chart when the component is destroyed
			};
		});

		$$self.$$.on_mount.push(function () {
			if (chartData === undefined && !('chartData' in $$props || $$self.$$.bound[$$self.$$.props['chartData']])) {
				console.warn("<ChartView> was created without expected prop 'chartData'");
			}

			if (key === undefined && !('key' in $$props || $$self.$$.bound[$$self.$$.props['key']])) {
				console.warn("<ChartView> was created without expected prop 'key'");
			}
		});

		const writable_props = ['chartData', 'key'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ChartView> was created with unknown prop '${key}'`);
		});

		function canvas_1_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				canvas = $$value;
				$$invalidate(0, canvas);
			});
		}

		$$self.$$set = $$props => {
			if ('chartData' in $$props) $$invalidate(1, chartData = $$props.chartData);
			if ('key' in $$props) $$invalidate(2, key = $$props.key);
		};

		$$self.$capture_state = () => ({
			onMount,
			Chart,
			chartData,
			key,
			chart,
			canvas
		});

		$$self.$inject_state = $$props => {
			if ('chartData' in $$props) $$invalidate(1, chartData = $$props.chartData);
			if ('key' in $$props) $$invalidate(2, key = $$props.key);
			if ('chart' in $$props) $$invalidate(3, chart = $$props.chart);
			if ('canvas' in $$props) $$invalidate(0, canvas = $$props.canvas);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*chart, chartData*/ 10) {
				// If you need to react to changes in chartData within the same component instance
				if (chart && chartData) {
					$$invalidate(3, chart.data = chartData, chart);
					chart.update();
				}
			}
		};

		return [canvas, chartData, key, chart, canvas_1_binding];
	}

	class ChartView extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, { chartData: 1, key: 2 });

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ChartView",
				options,
				id: create_fragment$3.name
			});
		}

		get chartData() {
			throw new Error("<ChartView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set chartData(value) {
			throw new Error("<ChartView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get key() {
			throw new Error("<ChartView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set key(value) {
			throw new Error("<ChartView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\TableView.svelte generated by Svelte v4.2.9 */
	const file$2 = "src\\components\\TableView.svelte";

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[5] = list[i];
		child_ctx[7] = i;
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[8] = list[i];
		child_ctx[10] = i;
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[11] = list[i];
		child_ctx[7] = i;
		return child_ctx;
	}

	// (27:10) {#if i % 5 === 0}
	function create_if_block_1$1(ctx) {
		let th;

		const block = {
			c: function create() {
				th = element("th");
				th.textContent = `D${/*i*/ ctx[7]}`;
				attr_dev(th, "class", "dynamic-col svelte-7qs73g");
				add_location(th, file$2, 27, 12, 856);
			},
			m: function mount(target, anchor) {
				insert_dev(target, th, anchor);
			},
			p: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(th);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1$1.name,
			type: "if",
			source: "(27:10) {#if i % 5 === 0}",
			ctx
		});

		return block;
	}

	// (26:8) {#each Array(91) as _, i (i)}
	function create_each_block_2(key_1, ctx) {
		let first;
		let if_block_anchor;
		let if_block = /*i*/ ctx[7] % 5 === 0 && create_if_block_1$1(ctx);

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (/*i*/ ctx[7] % 5 === 0) if_block.p(ctx, dirty);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_2.name,
			type: "each",
			source: "(26:8) {#each Array(91) as _, i (i)}",
			ctx
		});

		return block;
	}

	// (39:12) {#if index % 5 === 0}
	function create_if_block$1(ctx) {
		let td;
		let t0_value = calculateRetention$1(/*day*/ ctx[8], /*data*/ ctx[5].days[0]) + "";
		let t0;
		let t1;

		const block = {
			c: function create() {
				td = element("td");
				t0 = text(t0_value);
				t1 = text("%");
				attr_dev(td, "class", "dynamic-col svelte-7qs73g");
				add_location(td, file$2, 39, 14, 1360);
			},
			m: function mount(target, anchor) {
				insert_dev(target, td, anchor);
				append_dev(td, t0);
				append_dev(td, t1);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*filteredRetention*/ 1 && t0_value !== (t0_value = calculateRetention$1(/*day*/ ctx[8], /*data*/ ctx[5].days[0]) + "")) set_data_dev(t0, t0_value);
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(td);
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block$1.name,
			type: "if",
			source: "(39:12) {#if index % 5 === 0}",
			ctx
		});

		return block;
	}

	// (38:10) {#each data.days as day, index (`${data.app_id}
	function create_each_block_1(key_1, ctx) {
		let first;
		let if_block_anchor;
		let if_block = /*index*/ ctx[10] % 5 === 0 && create_if_block$1(ctx);

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				first = empty();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				this.first = first;
			},
			m: function mount(target, anchor) {
				insert_dev(target, first, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				if (/*index*/ ctx[10] % 5 === 0) {
					if (if_block) {
						if_block.p(ctx, dirty);
					} else {
						if_block = create_if_block$1(ctx);
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					if_block.d(1);
					if_block = null;
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(first);
					detach_dev(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block_1.name,
			type: "each",
			source: "(38:10) {#each data.days as day, index (`${data.app_id}",
			ctx
		});

		return block;
	}

	// (34:6) {#each filteredRetention as data, i (data.app_id + '-' + data.app_ver + '-' + data.country)}
	function create_each_block(key_1, ctx) {
		let tr;
		let td0;
		let t0_value = /*data*/ ctx[5].app_ver + "";
		let t0;
		let t1;
		let td1;
		let t2_value = /*data*/ ctx[5].country + "";
		let t2;
		let t3;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let t4;
		let each_value_1 = ensure_array_like_dev(/*data*/ ctx[5].days);
		const get_key = ctx => `${/*data*/ ctx[5].app_id}-${/*data*/ ctx[5].app_ver}-${/*data*/ ctx[5].country}-${/*index*/ ctx[10]}`;
		validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

		for (let i = 0; i < each_value_1.length; i += 1) {
			let child_ctx = get_each_context_1(ctx, each_value_1, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
		}

		const block = {
			key: key_1,
			first: null,
			c: function create() {
				tr = element("tr");
				td0 = element("td");
				t0 = text(t0_value);
				t1 = space();
				td1 = element("td");
				t2 = text(t2_value);
				t3 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t4 = space();
				attr_dev(td0, "class", "sticky-col first-col svelte-7qs73g");
				add_location(td0, file$2, 35, 10, 1089);
				attr_dev(td1, "class", "sticky-col second-col svelte-7qs73g");
				add_location(td1, file$2, 36, 10, 1153);
				add_location(tr, file$2, 34, 8, 1073);
				this.first = tr;
			},
			m: function mount(target, anchor) {
				insert_dev(target, tr, anchor);
				append_dev(tr, td0);
				append_dev(td0, t0);
				append_dev(tr, t1);
				append_dev(tr, td1);
				append_dev(td1, t2);
				append_dev(tr, t3);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tr, null);
					}
				}

				append_dev(tr, t4);
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*filteredRetention*/ 1 && t0_value !== (t0_value = /*data*/ ctx[5].app_ver + "")) set_data_dev(t0, t0_value);
				if (dirty & /*filteredRetention*/ 1 && t2_value !== (t2_value = /*data*/ ctx[5].country + "")) set_data_dev(t2, t2_value);

				if (dirty & /*calculateRetention, filteredRetention*/ 1) {
					each_value_1 = ensure_array_like_dev(/*data*/ ctx[5].days);
					validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, tr, destroy_block, create_each_block_1, t4, get_each_context_1);
				}
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(tr);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_each_block.name,
			type: "each",
			source: "(34:6) {#each filteredRetention as data, i (data.app_id + '-' + data.app_ver + '-' + data.country)}",
			ctx
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let div;
		let table;
		let thead;
		let tr;
		let th0;
		let t1;
		let th1;
		let t3;
		let each_blocks_1 = [];
		let each0_lookup = new Map();
		let t4;
		let tbody;
		let each_blocks = [];
		let each1_lookup = new Map();
		let each_value_2 = ensure_array_like_dev(Array(91));
		const get_key = ctx => /*i*/ ctx[7];
		validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

		for (let i = 0; i < each_value_2.length; i += 1) {
			let child_ctx = get_each_context_2(ctx, each_value_2, i);
			let key = get_key(child_ctx);
			each0_lookup.set(key, each_blocks_1[i] = create_each_block_2(key, child_ctx));
		}

		let each_value = ensure_array_like_dev(/*filteredRetention*/ ctx[0]);
		const get_key_1 = ctx => /*data*/ ctx[5].app_id + '-' + /*data*/ ctx[5].app_ver + '-' + /*data*/ ctx[5].country;
		validate_each_keys(ctx, each_value, get_each_context, get_key_1);

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context(ctx, each_value, i);
			let key = get_key_1(child_ctx);
			each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
		}

		const block = {
			c: function create() {
				div = element("div");
				table = element("table");
				thead = element("thead");
				tr = element("tr");
				th0 = element("th");
				th0.textContent = "Version";
				t1 = space();
				th1 = element("th");
				th1.textContent = "Country";
				t3 = space();

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t4 = space();
				tbody = element("tbody");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(th0, "class", "sticky-col svelte-7qs73g");
				add_location(th0, file$2, 23, 8, 694);
				attr_dev(th1, "class", "sticky-col svelte-7qs73g");
				add_location(th1, file$2, 24, 8, 739);
				add_location(tr, file$2, 22, 6, 680);
				attr_dev(thead, "class", "svelte-7qs73g");
				add_location(thead, file$2, 21, 4, 665);
				add_location(tbody, file$2, 32, 4, 956);
				attr_dev(table, "class", "svelte-7qs73g");
				add_location(table, file$2, 20, 2, 652);
				attr_dev(div, "class", "table-container svelte-7qs73g");
				add_location(div, file$2, 19, 0, 619);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, table);
				append_dev(table, thead);
				append_dev(thead, tr);
				append_dev(tr, th0);
				append_dev(tr, t1);
				append_dev(tr, th1);
				append_dev(tr, t3);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(tr, null);
					}
				}

				append_dev(table, t4);
				append_dev(table, tbody);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(tbody, null);
					}
				}
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*Array*/ 0) {
					each_value_2 = ensure_array_like_dev(Array(91));
					validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
					each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, tr, destroy_block, create_each_block_2, null, get_each_context_2);
				}

				if (dirty & /*filteredRetention, calculateRetention*/ 1) {
					each_value = ensure_array_like_dev(/*filteredRetention*/ ctx[0]);
					validate_each_keys(ctx, each_value, get_each_context, get_key_1);
					each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, tbody, destroy_block, create_each_block, null, get_each_context);
				}
			},
			i: noop$1,
			o: noop$1,
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d();
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$2.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function calculateRetention$1(dayCount, index0Count) {
		return Math.round(dayCount / index0Count * 100);
	}

	function instance$2($$self, $$props, $$invalidate) {
		let filteredRetention;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TableView', slots, []);
		let { retention } = $$props;
		let { selectedGame } = $$props;
		let { selectedVersion } = $$props;
		let { selectedCountry } = $$props;

		$$self.$$.on_mount.push(function () {
			if (retention === undefined && !('retention' in $$props || $$self.$$.bound[$$self.$$.props['retention']])) {
				console.warn("<TableView> was created without expected prop 'retention'");
			}

			if (selectedGame === undefined && !('selectedGame' in $$props || $$self.$$.bound[$$self.$$.props['selectedGame']])) {
				console.warn("<TableView> was created without expected prop 'selectedGame'");
			}

			if (selectedVersion === undefined && !('selectedVersion' in $$props || $$self.$$.bound[$$self.$$.props['selectedVersion']])) {
				console.warn("<TableView> was created without expected prop 'selectedVersion'");
			}

			if (selectedCountry === undefined && !('selectedCountry' in $$props || $$self.$$.bound[$$self.$$.props['selectedCountry']])) {
				console.warn("<TableView> was created without expected prop 'selectedCountry'");
			}
		});

		const writable_props = ['retention', 'selectedGame', 'selectedVersion', 'selectedCountry'];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TableView> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('retention' in $$props) $$invalidate(1, retention = $$props.retention);
			if ('selectedGame' in $$props) $$invalidate(2, selectedGame = $$props.selectedGame);
			if ('selectedVersion' in $$props) $$invalidate(3, selectedVersion = $$props.selectedVersion);
			if ('selectedCountry' in $$props) $$invalidate(4, selectedCountry = $$props.selectedCountry);
		};

		$$self.$capture_state = () => ({
			retention,
			selectedGame,
			selectedVersion,
			selectedCountry,
			calculateRetention: calculateRetention$1,
			filteredRetention
		});

		$$self.$inject_state = $$props => {
			if ('retention' in $$props) $$invalidate(1, retention = $$props.retention);
			if ('selectedGame' in $$props) $$invalidate(2, selectedGame = $$props.selectedGame);
			if ('selectedVersion' in $$props) $$invalidate(3, selectedVersion = $$props.selectedVersion);
			if ('selectedCountry' in $$props) $$invalidate(4, selectedCountry = $$props.selectedCountry);
			if ('filteredRetention' in $$props) $$invalidate(0, filteredRetention = $$props.filteredRetention);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*retention, selectedGame, selectedVersion, selectedCountry*/ 30) {
				// A derived store or reactive statement to filter retention data
				$$invalidate(0, filteredRetention = retention.filter(item => (selectedGame === 'All' || item.app_id === selectedGame) && (selectedVersion === 'All' || item.app_ver === selectedVersion) && (selectedCountry === 'All' || item.country === selectedCountry)));
			}
		};

		return [filteredRetention, retention, selectedGame, selectedVersion, selectedCountry];
	}

	class TableView extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$2, create_fragment$2, safe_not_equal, {
				retention: 1,
				selectedGame: 2,
				selectedVersion: 3,
				selectedCountry: 4
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "TableView",
				options,
				id: create_fragment$2.name
			});
		}

		get retention() {
			throw new Error("<TableView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set retention(value) {
			throw new Error("<TableView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedGame() {
			throw new Error("<TableView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedGame(value) {
			throw new Error("<TableView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedVersion() {
			throw new Error("<TableView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedVersion(value) {
			throw new Error("<TableView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedCountry() {
			throw new Error("<TableView>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedCountry(value) {
			throw new Error("<TableView>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\components\ContentArea.svelte generated by Svelte v4.2.9 */
	const file$1 = "src\\components\\ContentArea.svelte";

	// (54:38) 
	function create_if_block_1(ctx) {
		let chartview;
		let current;

		chartview = new ChartView({
				props: { chartData: /*chartData*/ ctx[0] },
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(chartview.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(chartview, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const chartview_changes = {};
				if (dirty & /*chartData*/ 1) chartview_changes.chartData = /*chartData*/ ctx[0];
				chartview.$set(chartview_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(chartview.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(chartview.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(chartview, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block_1.name,
			type: "if",
			source: "(54:38) ",
			ctx
		});

		return block;
	}

	// (47:4) {#if currentView === 'table'}
	function create_if_block(ctx) {
		let tableview;
		let current;

		tableview = new TableView({
				props: {
					retention: /*retention*/ ctx[1],
					selectedGame: /*selectedGame*/ ctx[2],
					selectedVersion: /*selectedVersion*/ ctx[3],
					selectedCountry: /*selectedCountry*/ ctx[4]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				create_component(tableview.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(tableview, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const tableview_changes = {};
				if (dirty & /*retention*/ 2) tableview_changes.retention = /*retention*/ ctx[1];
				if (dirty & /*selectedGame*/ 4) tableview_changes.selectedGame = /*selectedGame*/ ctx[2];
				if (dirty & /*selectedVersion*/ 8) tableview_changes.selectedVersion = /*selectedVersion*/ ctx[3];
				if (dirty & /*selectedCountry*/ 16) tableview_changes.selectedCountry = /*selectedCountry*/ ctx[4];
				tableview.$set(tableview_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tableview.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(tableview.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(tableview, detaching);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_if_block.name,
			type: "if",
			source: "(47:4) {#if currentView === 'table'}",
			ctx
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block, create_if_block_1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*currentView*/ ctx[5] === 'table') return 0;
			if (/*currentView*/ ctx[5] === 'chart') return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		}

		const block = {
			c: function create() {
				div = element("div");
				if (if_block) if_block.c();
				attr_dev(div, "class", "content-area");
				add_location(div, file$1, 45, 2, 1390);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(div, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) {
						if_blocks[current_block_type_index].p(ctx, dirty);
					}
				} else {
					if (if_block) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];

						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
							if_block.c();
						} else {
							if_block.p(ctx, dirty);
						}

						transition_in(if_block, 1);
						if_block.m(div, null);
					} else {
						if_block = null;
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(div);
				}

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d();
				}
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment$1.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function calculateRetention(dayCount, index0Count) {
		return Math.round(dayCount / index0Count * 100);
	}

	function instance$1($$self, $$props, $$invalidate) {
		let filteredRetention;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ContentArea', slots, []);
		let { retention } = $$props;
		let { selectedGame } = $$props;
		let { selectedVersion } = $$props;
		let { selectedCountry } = $$props;
		let { currentView } = $$props;
		let { chartData } = $$props;

		$$self.$$.on_mount.push(function () {
			if (retention === undefined && !('retention' in $$props || $$self.$$.bound[$$self.$$.props['retention']])) {
				console.warn("<ContentArea> was created without expected prop 'retention'");
			}

			if (selectedGame === undefined && !('selectedGame' in $$props || $$self.$$.bound[$$self.$$.props['selectedGame']])) {
				console.warn("<ContentArea> was created without expected prop 'selectedGame'");
			}

			if (selectedVersion === undefined && !('selectedVersion' in $$props || $$self.$$.bound[$$self.$$.props['selectedVersion']])) {
				console.warn("<ContentArea> was created without expected prop 'selectedVersion'");
			}

			if (selectedCountry === undefined && !('selectedCountry' in $$props || $$self.$$.bound[$$self.$$.props['selectedCountry']])) {
				console.warn("<ContentArea> was created without expected prop 'selectedCountry'");
			}

			if (currentView === undefined && !('currentView' in $$props || $$self.$$.bound[$$self.$$.props['currentView']])) {
				console.warn("<ContentArea> was created without expected prop 'currentView'");
			}

			if (chartData === undefined && !('chartData' in $$props || $$self.$$.bound[$$self.$$.props['chartData']])) {
				console.warn("<ContentArea> was created without expected prop 'chartData'");
			}
		});

		const writable_props = [
			'retention',
			'selectedGame',
			'selectedVersion',
			'selectedCountry',
			'currentView',
			'chartData'
		];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ContentArea> was created with unknown prop '${key}'`);
		});

		$$self.$$set = $$props => {
			if ('retention' in $$props) $$invalidate(1, retention = $$props.retention);
			if ('selectedGame' in $$props) $$invalidate(2, selectedGame = $$props.selectedGame);
			if ('selectedVersion' in $$props) $$invalidate(3, selectedVersion = $$props.selectedVersion);
			if ('selectedCountry' in $$props) $$invalidate(4, selectedCountry = $$props.selectedCountry);
			if ('currentView' in $$props) $$invalidate(5, currentView = $$props.currentView);
			if ('chartData' in $$props) $$invalidate(0, chartData = $$props.chartData);
		};

		$$self.$capture_state = () => ({
			ChartView,
			TableView,
			retention,
			selectedGame,
			selectedVersion,
			selectedCountry,
			currentView,
			chartData,
			calculateRetention,
			filteredRetention
		});

		$$self.$inject_state = $$props => {
			if ('retention' in $$props) $$invalidate(1, retention = $$props.retention);
			if ('selectedGame' in $$props) $$invalidate(2, selectedGame = $$props.selectedGame);
			if ('selectedVersion' in $$props) $$invalidate(3, selectedVersion = $$props.selectedVersion);
			if ('selectedCountry' in $$props) $$invalidate(4, selectedCountry = $$props.selectedCountry);
			if ('currentView' in $$props) $$invalidate(5, currentView = $$props.currentView);
			if ('chartData' in $$props) $$invalidate(0, chartData = $$props.chartData);
			if ('filteredRetention' in $$props) $$invalidate(6, filteredRetention = $$props.filteredRetention);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*retention, selectedGame, selectedVersion, selectedCountry*/ 30) {
				// A derived store or reactive statement to filter retention data
				$$invalidate(6, filteredRetention = retention.filter(item => (selectedGame === 'All' || item.app_id === selectedGame) && (selectedVersion === 'All' || item.app_ver === selectedVersion) && (selectedCountry === 'All' || item.country === selectedCountry)));
			}

			if ($$self.$$.dirty & /*filteredRetention, chartData*/ 65) {
				$$invalidate(0, chartData = {
					labels: ['D0', 'D5', 'D10', 'D20', 'D25', 'D30', 'D60', 'D90'], // Example labels
					datasets: filteredRetention.map(item => {
						// Assuming 'days' is an array [D0, D5, D10, ..., D90]
						const data = item.days.slice(0, chartData.labels.length).map((day, index) => ({ x: chartData.labels[index], y: day }));

						return {
							label: `${item.app_ver} - ${item.country}`,
							data,
							backgroundColor: 'rgba(54, 162, 235, 0.5)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 1
						};
					})
				});
			}
		};

		return [
			chartData,
			retention,
			selectedGame,
			selectedVersion,
			selectedCountry,
			currentView,
			filteredRetention
		];
	}

	class ContentArea extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$1, create_fragment$1, safe_not_equal, {
				retention: 1,
				selectedGame: 2,
				selectedVersion: 3,
				selectedCountry: 4,
				currentView: 5,
				chartData: 0
			});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "ContentArea",
				options,
				id: create_fragment$1.name
			});
		}

		get retention() {
			throw new Error("<ContentArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set retention(value) {
			throw new Error("<ContentArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedGame() {
			throw new Error("<ContentArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedGame(value) {
			throw new Error("<ContentArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedVersion() {
			throw new Error("<ContentArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedVersion(value) {
			throw new Error("<ContentArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get selectedCountry() {
			throw new Error("<ContentArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set selectedCountry(value) {
			throw new Error("<ContentArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get currentView() {
			throw new Error("<ContentArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set currentView(value) {
			throw new Error("<ContentArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		get chartData() {
			throw new Error("<ContentArea>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}

		set chartData(value) {
			throw new Error("<ContentArea>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
		}
	}

	/* src\App.svelte generated by Svelte v4.2.9 */
	const file = "src\\App.svelte";

	function create_fragment(ctx) {
		let main;
		let filterbar;
		let updating_selectedGame;
		let updating_selectedVersion;
		let updating_selectedCountry;
		let t0;
		let viewbar;
		let t1;
		let contentarea;
		let current;

		function filterbar_selectedGame_binding(value) {
			/*filterbar_selectedGame_binding*/ ctx[7](value);
		}

		function filterbar_selectedVersion_binding(value) {
			/*filterbar_selectedVersion_binding*/ ctx[8](value);
		}

		function filterbar_selectedCountry_binding(value) {
			/*filterbar_selectedCountry_binding*/ ctx[9](value);
		}

		let filterbar_props = {
			games: /*games*/ ctx[0],
			retention: /*retention*/ ctx[1]
		};

		if (/*selectedGame*/ ctx[2] !== void 0) {
			filterbar_props.selectedGame = /*selectedGame*/ ctx[2];
		}

		if (/*selectedVersion*/ ctx[3] !== void 0) {
			filterbar_props.selectedVersion = /*selectedVersion*/ ctx[3];
		}

		if (/*selectedCountry*/ ctx[4] !== void 0) {
			filterbar_props.selectedCountry = /*selectedCountry*/ ctx[4];
		}

		filterbar = new FilterBar({ props: filterbar_props, $$inline: true });
		binding_callbacks.push(() => bind(filterbar, 'selectedGame', filterbar_selectedGame_binding));
		binding_callbacks.push(() => bind(filterbar, 'selectedVersion', filterbar_selectedVersion_binding));
		binding_callbacks.push(() => bind(filterbar, 'selectedCountry', filterbar_selectedCountry_binding));

		viewbar = new ViewBar({
				props: {
					setCurrentView: /*setCurrentView*/ ctx[6]
				},
				$$inline: true
			});

		contentarea = new ContentArea({
				props: {
					currentView: /*currentView*/ ctx[5],
					retention: /*retention*/ ctx[1],
					selectedGame: /*selectedGame*/ ctx[2],
					selectedVersion: /*selectedVersion*/ ctx[3],
					selectedCountry: /*selectedCountry*/ ctx[4]
				},
				$$inline: true
			});

		const block = {
			c: function create() {
				main = element("main");
				create_component(filterbar.$$.fragment);
				t0 = space();
				create_component(viewbar.$$.fragment);
				t1 = space();
				create_component(contentarea.$$.fragment);
				add_location(main, file, 29, 0, 822);
			},
			l: function claim(nodes) {
				throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
			},
			m: function mount(target, anchor) {
				insert_dev(target, main, anchor);
				mount_component(filterbar, main, null);
				append_dev(main, t0);
				mount_component(viewbar, main, null);
				append_dev(main, t1);
				mount_component(contentarea, main, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const filterbar_changes = {};
				if (dirty & /*games*/ 1) filterbar_changes.games = /*games*/ ctx[0];
				if (dirty & /*retention*/ 2) filterbar_changes.retention = /*retention*/ ctx[1];

				if (!updating_selectedGame && dirty & /*selectedGame*/ 4) {
					updating_selectedGame = true;
					filterbar_changes.selectedGame = /*selectedGame*/ ctx[2];
					add_flush_callback(() => updating_selectedGame = false);
				}

				if (!updating_selectedVersion && dirty & /*selectedVersion*/ 8) {
					updating_selectedVersion = true;
					filterbar_changes.selectedVersion = /*selectedVersion*/ ctx[3];
					add_flush_callback(() => updating_selectedVersion = false);
				}

				if (!updating_selectedCountry && dirty & /*selectedCountry*/ 16) {
					updating_selectedCountry = true;
					filterbar_changes.selectedCountry = /*selectedCountry*/ ctx[4];
					add_flush_callback(() => updating_selectedCountry = false);
				}

				filterbar.$set(filterbar_changes);
				const contentarea_changes = {};
				if (dirty & /*currentView*/ 32) contentarea_changes.currentView = /*currentView*/ ctx[5];
				if (dirty & /*retention*/ 2) contentarea_changes.retention = /*retention*/ ctx[1];
				if (dirty & /*selectedGame*/ 4) contentarea_changes.selectedGame = /*selectedGame*/ ctx[2];
				if (dirty & /*selectedVersion*/ 8) contentarea_changes.selectedVersion = /*selectedVersion*/ ctx[3];
				if (dirty & /*selectedCountry*/ 16) contentarea_changes.selectedCountry = /*selectedCountry*/ ctx[4];
				contentarea.$set(contentarea_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(filterbar.$$.fragment, local);
				transition_in(viewbar.$$.fragment, local);
				transition_in(contentarea.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(filterbar.$$.fragment, local);
				transition_out(viewbar.$$.fragment, local);
				transition_out(contentarea.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) {
					detach_dev(main);
				}

				destroy_component(filterbar);
				destroy_component(viewbar);
				destroy_component(contentarea);
			}
		};

		dispatch_dev("SvelteRegisterBlock", {
			block,
			id: create_fragment.name,
			type: "component",
			source: "",
			ctx
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		let games = [];
		let retention = [];
		let selectedGame = 'All';
		let selectedVersion = 'All';
		let selectedCountry = 'All';
		let currentView = 'table'; //default view

		function setCurrentView(view) {
			$$invalidate(5, currentView = view);
		}

		onMount(async () => {
			const gamesResponse = await fetch('https://storage.googleapis.com/estoty-temp/games.json');
			$$invalidate(0, games = await gamesResponse.json());
			const retentionResponse = await fetch('https://storage.googleapis.com/estoty-temp/retention.json');
			$$invalidate(1, retention = await retentionResponse.json());
		});

		const writable_props = [];

		Object.keys($$props).forEach(key => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
		});

		function filterbar_selectedGame_binding(value) {
			selectedGame = value;
			$$invalidate(2, selectedGame);
		}

		function filterbar_selectedVersion_binding(value) {
			selectedVersion = value;
			$$invalidate(3, selectedVersion);
		}

		function filterbar_selectedCountry_binding(value) {
			selectedCountry = value;
			$$invalidate(4, selectedCountry);
		}

		$$self.$capture_state = () => ({
			onMount,
			FilterBar,
			ViewBar,
			ContentArea,
			games,
			retention,
			selectedGame,
			selectedVersion,
			selectedCountry,
			currentView,
			setCurrentView
		});

		$$self.$inject_state = $$props => {
			if ('games' in $$props) $$invalidate(0, games = $$props.games);
			if ('retention' in $$props) $$invalidate(1, retention = $$props.retention);
			if ('selectedGame' in $$props) $$invalidate(2, selectedGame = $$props.selectedGame);
			if ('selectedVersion' in $$props) $$invalidate(3, selectedVersion = $$props.selectedVersion);
			if ('selectedCountry' in $$props) $$invalidate(4, selectedCountry = $$props.selectedCountry);
			if ('currentView' in $$props) $$invalidate(5, currentView = $$props.currentView);
		};

		if ($$props && "$$inject" in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [
			games,
			retention,
			selectedGame,
			selectedVersion,
			selectedCountry,
			currentView,
			setCurrentView,
			filterbar_selectedGame_binding,
			filterbar_selectedVersion_binding,
			filterbar_selectedCountry_binding
		];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev("SvelteRegisterComponent", {
				component: this,
				tagName: "App",
				options,
				id: create_fragment.name
			});
		}
	}

	const app = new App({
		target: document.body,
		
	});

	return app;

})();
//# sourceMappingURL=bundle.js.map
