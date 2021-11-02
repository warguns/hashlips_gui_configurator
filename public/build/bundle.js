
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
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
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
        // find the complete implementation of crypto (msCrypto) on IE11.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    const defaultStore = {
        name: '',
        description: '',
        width: 512,
        height: 512,
        shuffle: false,
        ipfs: 'ipfs://NewUriToReplace',
        rarityDelimiter: '#',
        author: '',
        editions: [
            {
                editionId: v4(),
                grow: 1,
                layerOrders: [
                ]
            }
        ],

    };
    const store = writable(defaultStore);

    /* src/LayerOrder.svelte generated by Svelte v3.44.0 */

    const { console: console_1$3 } = globals;
    const file$5 = "src/LayerOrder.svelte";

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let label0;
    	let span0;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let span1;
    	let t4;
    	let input1;
    	let t5;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "Folder Name:";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Display Name:";
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			a = element("a");
    			a.textContent = "Remove Layer";
    			attr_dev(span0, "class", "text-gray-700");
    			add_location(span0, file$5, 31, 12, 1080);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input0, "placeholder", "Add here your folder layer name, try to avoid rare characters");
    			add_location(input0, file$5, 32, 12, 1140);
    			attr_dev(label0, "class", "block");
    			add_location(label0, file$5, 30, 8, 1046);
    			attr_dev(span1, "class", "text-gray-700");
    			add_location(span1, file$5, 43, 12, 1718);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input1, "placeholder", "Add here the name you want to display it on the market (the Rarity flags)");
    			add_location(input1, file$5, 44, 12, 1779);
    			attr_dev(label1, "class", "block");
    			add_location(label1, file$5, 42, 8, 1684);
    			attr_dev(a, "class", "text-cyan-600 hover:text-cyan-700 delete");
    			add_location(a, file$5, 54, 8, 2342);
    			attr_dev(div0, "class", "grid grid-cols-1 gap-6 w-full");
    			add_location(div0, file$5, 29, 4, 994);
    			attr_dev(div1, "class", "p-12 w-full h-full mx-auto bg-gray-50 rounded-xl shadow-md space-x-23");
    			add_location(div1, file$5, 28, 0, 906);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);
    			set_input_value(input0, /*layerOrder*/ ctx[0].name);
    			append_dev(div0, t2);
    			append_dev(div0, label1);
    			append_dev(label1, span1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			set_input_value(input1, /*layerOrder*/ ctx[0].displayName);
    			append_dev(div0, t5);
    			append_dev(div0, a);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input0, "keyup", /*updateLayerOrder*/ ctx[2], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(input1, "keyup", /*updateLayerOrder*/ ctx[2], false, false, false),
    					listen_dev(a, "click", /*removeLayerOrder*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*layerOrder*/ 1 && input0.value !== /*layerOrder*/ ctx[0].name) {
    				set_input_value(input0, /*layerOrder*/ ctx[0].name);
    			}

    			if (dirty & /*layerOrder*/ 1 && input1.value !== /*layerOrder*/ ctx[0].displayName) {
    				set_input_value(input1, /*layerOrder*/ ctx[0].displayName);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LayerOrder', slots, []);
    	const dispatch = createEventDispatcher();
    	let { editionId } = $$props;
    	let { layerOrder } = $$props;

    	function removeLayerOrder() {
    		dispatch('deleteLayerOrder', { key: layerOrder.layerOrderId });
    	}

    	function updateLayerOrder() {
    		store.update(value => {
    			const editionIndex = value.editions.findIndex(edition => edition.editionId === editionId);
    			const layerOrderIndex = value.editions[editionIndex].layerOrders.findIndex(value => value.layerOrderId === layerOrder.layerOrderId);
    			value.editions[editionIndex].layerOrders[layerOrderIndex] = layerOrder;
    			console.log(value);
    			dispatch('updateCommand', { project: value });
    			return value;
    		});
    	}

    	const writable_props = ['editionId', 'layerOrder'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<LayerOrder> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		layerOrder.name = this.value;
    		$$invalidate(0, layerOrder);
    	}

    	function input1_input_handler() {
    		layerOrder.displayName = this.value;
    		$$invalidate(0, layerOrder);
    	}

    	$$self.$$set = $$props => {
    		if ('editionId' in $$props) $$invalidate(3, editionId = $$props.editionId);
    		if ('layerOrder' in $$props) $$invalidate(0, layerOrder = $$props.layerOrder);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		store,
    		editionId,
    		layerOrder,
    		removeLayerOrder,
    		updateLayerOrder
    	});

    	$$self.$inject_state = $$props => {
    		if ('editionId' in $$props) $$invalidate(3, editionId = $$props.editionId);
    		if ('layerOrder' in $$props) $$invalidate(0, layerOrder = $$props.layerOrder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		layerOrder,
    		removeLayerOrder,
    		updateLayerOrder,
    		editionId,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class LayerOrder extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { editionId: 3, layerOrder: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LayerOrder",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*editionId*/ ctx[3] === undefined && !('editionId' in props)) {
    			console_1$3.warn("<LayerOrder> was created without expected prop 'editionId'");
    		}

    		if (/*layerOrder*/ ctx[0] === undefined && !('layerOrder' in props)) {
    			console_1$3.warn("<LayerOrder> was created without expected prop 'layerOrder'");
    		}
    	}

    	get editionId() {
    		throw new Error("<LayerOrder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editionId(value) {
    		throw new Error("<LayerOrder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layerOrder() {
    		throw new Error("<LayerOrder>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layerOrder(value) {
    		throw new Error("<LayerOrder>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Edition.svelte generated by Svelte v3.44.0 */

    const { console: console_1$2 } = globals;
    const file$4 = "src/Edition.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (81:8) {#each edition.layerOrders as layerOrder, i }
    function create_each_block$1(ctx) {
    	let layerorder;
    	let current;

    	layerorder = new LayerOrder({
    			props: {
    				editionId: /*edition*/ ctx[0].editionId,
    				layerOrder: /*layerOrder*/ ctx[11]
    			},
    			$$inline: true
    		});

    	layerorder.$on("deleteLayerOrder", /*handleMessage*/ ctx[5]);
    	layerorder.$on("updateCommand", /*updateEdition*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(layerorder.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(layerorder, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const layerorder_changes = {};
    			if (dirty & /*edition*/ 1) layerorder_changes.editionId = /*edition*/ ctx[0].editionId;
    			if (dirty & /*edition*/ 1) layerorder_changes.layerOrder = /*layerOrder*/ ctx[11];
    			layerorder.$set(layerorder_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layerorder.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layerorder.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(layerorder, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(81:8) {#each edition.layerOrders as layerOrder, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let label0;
    	let span0;

    	let t0_value = (/*index*/ ctx[1] > 0
    	? 'Grow the size of items to:'
    	: 'Create your First Edition with a total of:') + "";

    	let t0;
    	let t1;
    	let input0;
    	let input0_disabled_value;
    	let t2;
    	let span1;
    	let t3_value = (/*index*/ ctx[1] > 0 ? 'with a new Edition' : 'items.') + "";
    	let t3;
    	let t4;
    	let label1;
    	let span2;
    	let t6;
    	let t7;
    	let input1;
    	let t8;
    	let a;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*edition*/ ctx[0].layerOrders;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			label1 = element("label");
    			span2 = element("span");
    			span2.textContent = "Add your different design layers ordered from the deepest (Background) to the nearest:";
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			a = element("a");
    			a.textContent = "Remove Edition";
    			attr_dev(span0, "class", "text-gray-700");
    			add_location(span0, file$4, 66, 12, 2174);
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", "grow mt-1 w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input0, "placeholder", "");
    			attr_dev(input0, "min", /*previousGrow*/ ctx[2]);
    			input0.disabled = input0_disabled_value = !/*isLast*/ ctx[3];
    			add_location(input0, file$4, 67, 12, 2312);
    			add_location(span1, file$4, 75, 161, 2830);
    			attr_dev(label0, "class", "block");
    			add_location(label0, file$4, 65, 8, 2140);
    			attr_dev(span2, "class", "text-gray-700");
    			add_location(span2, file$4, 78, 12, 2950);
    			attr_dev(label1, "class", "block");
    			add_location(label1, file$4, 77, 8, 2916);
    			attr_dev(input1, "type", "button");
    			attr_dev(input1, "name", "addLayerOrder");
    			attr_dev(input1, "class", "pointer p-1 rounded-xl shadow-md");
    			input1.value = "Add Layer";
    			add_location(input1, file$4, 84, 8, 3321);
    			attr_dev(a, "class", "text-cyan-600 hover:text-cyan-700 delete");
    			add_location(a, file$4, 85, 8, 3456);
    			attr_dev(div0, "class", "grid grid-cols-1 gap-6");
    			add_location(div0, file$4, 64, 4, 2095);
    			attr_dev(div1, "class", "p-12 w-full bg-white rounded-xl shadow-md");
    			add_location(div1, file$4, 63, 0, 2035);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(span0, t0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);
    			set_input_value(input0, /*edition*/ ctx[0].grow);
    			append_dev(label0, t2);
    			append_dev(label0, span1);
    			append_dev(span1, t3);
    			append_dev(div0, t4);
    			append_dev(div0, label1);
    			append_dev(label1, span2);
    			append_dev(div0, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t7);
    			append_dev(div0, input1);
    			append_dev(div0, t8);
    			append_dev(div0, a);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[9]),
    					listen_dev(input0, "keyup", /*updateEdition*/ ctx[7], false, false, false),
    					listen_dev(input0, "change", /*updateEdition*/ ctx[7], false, false, false),
    					listen_dev(input1, "click", /*addLayerOrder*/ ctx[4], false, false, false),
    					listen_dev(a, "click", /*removeEdition*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*index*/ 2) && t0_value !== (t0_value = (/*index*/ ctx[1] > 0
    			? 'Grow the size of items to:'
    			: 'Create your First Edition with a total of:') + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*previousGrow*/ 4) {
    				attr_dev(input0, "min", /*previousGrow*/ ctx[2]);
    			}

    			if (!current || dirty & /*isLast*/ 8 && input0_disabled_value !== (input0_disabled_value = !/*isLast*/ ctx[3])) {
    				prop_dev(input0, "disabled", input0_disabled_value);
    			}

    			if (dirty & /*edition*/ 1 && to_number(input0.value) !== /*edition*/ ctx[0].grow) {
    				set_input_value(input0, /*edition*/ ctx[0].grow);
    			}

    			if ((!current || dirty & /*index*/ 2) && t3_value !== (t3_value = (/*index*/ ctx[1] > 0 ? 'with a new Edition' : 'items.') + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*edition, handleMessage, updateEdition*/ 161) {
    				each_value = /*edition*/ ctx[0].layerOrders;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, t7);
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
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
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
    	validate_slots('Edition', slots, []);
    	const dispatch = createEventDispatcher();
    	let { edition } = $$props;
    	let { length } = $$props;
    	let { index } = $$props;
    	let { previousGrow } = $$props;
    	let { isLast } = $$props;
    	addLayerOrder();

    	function addLayerOrder() {
    		store.update(value => {
    			edition.layerOrders.push({
    				layerOrderId: v4(),
    				name: '',
    				displayName: ''
    			});

    			const editionIndex = value.editions.findIndex(value => value.editionId === edition.editionId);
    			value.editions[editionIndex] = edition;
    			console.log(value);
    			dispatch('updateCommand', { project: value });
    			return value;
    		});
    	}

    	function handleMessage(event) {
    		if (edition.layerOrders.length > 1) {
    			console.log(event);

    			store.update(value => {
    				$$invalidate(0, edition.layerOrders = edition.layerOrders.filter(layerOrder => layerOrder.layerOrderId !== event.detail.key), edition);
    				const editionIndex = value.editions.findIndex(value => value.editionId === edition.editionId);
    				value.editions[editionIndex] = edition;
    				console.log(value);
    				dispatch('updateCommand', { project: value });
    				return value;
    			});
    		}
    	}

    	function removeEdition() {
    		dispatch('delete', { key: edition.editionId });
    	}

    	function updateEdition() {
    		store.update(value => {
    			const editionIndex = value.editions.findIndex(ed => ed.editionId === edition.editionId);
    			value.editions[editionIndex] = edition;
    			dispatch('updateCommand', { project: value });
    			return value;
    		});
    	}

    	const writable_props = ['edition', 'length', 'index', 'previousGrow', 'isLast'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Edition> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		edition.grow = to_number(this.value);
    		$$invalidate(0, edition);
    	}

    	$$self.$$set = $$props => {
    		if ('edition' in $$props) $$invalidate(0, edition = $$props.edition);
    		if ('length' in $$props) $$invalidate(8, length = $$props.length);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('previousGrow' in $$props) $$invalidate(2, previousGrow = $$props.previousGrow);
    		if ('isLast' in $$props) $$invalidate(3, isLast = $$props.isLast);
    	};

    	$$self.$capture_state = () => ({
    		LayerOrder,
    		createEventDispatcher,
    		store,
    		uuidv4: v4,
    		dispatch,
    		edition,
    		length,
    		index,
    		previousGrow,
    		isLast,
    		addLayerOrder,
    		handleMessage,
    		removeEdition,
    		updateEdition
    	});

    	$$self.$inject_state = $$props => {
    		if ('edition' in $$props) $$invalidate(0, edition = $$props.edition);
    		if ('length' in $$props) $$invalidate(8, length = $$props.length);
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('previousGrow' in $$props) $$invalidate(2, previousGrow = $$props.previousGrow);
    		if ('isLast' in $$props) $$invalidate(3, isLast = $$props.isLast);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		edition,
    		index,
    		previousGrow,
    		isLast,
    		addLayerOrder,
    		handleMessage,
    		removeEdition,
    		updateEdition,
    		length,
    		input0_input_handler
    	];
    }

    class Edition extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			edition: 0,
    			length: 8,
    			index: 1,
    			previousGrow: 2,
    			isLast: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Edition",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*edition*/ ctx[0] === undefined && !('edition' in props)) {
    			console_1$2.warn("<Edition> was created without expected prop 'edition'");
    		}

    		if (/*length*/ ctx[8] === undefined && !('length' in props)) {
    			console_1$2.warn("<Edition> was created without expected prop 'length'");
    		}

    		if (/*index*/ ctx[1] === undefined && !('index' in props)) {
    			console_1$2.warn("<Edition> was created without expected prop 'index'");
    		}

    		if (/*previousGrow*/ ctx[2] === undefined && !('previousGrow' in props)) {
    			console_1$2.warn("<Edition> was created without expected prop 'previousGrow'");
    		}

    		if (/*isLast*/ ctx[3] === undefined && !('isLast' in props)) {
    			console_1$2.warn("<Edition> was created without expected prop 'isLast'");
    		}
    	}

    	get edition() {
    		throw new Error("<Edition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set edition(value) {
    		throw new Error("<Edition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get length() {
    		throw new Error("<Edition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set length(value) {
    		throw new Error("<Edition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Edition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Edition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get previousGrow() {
    		throw new Error("<Edition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set previousGrow(value) {
    		throw new Error("<Edition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isLast() {
    		throw new Error("<Edition>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isLast(value) {
    		throw new Error("<Edition>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/LayerConfigurations.svelte generated by Svelte v3.44.0 */

    const { console: console_1$1 } = globals;
    const file$3 = "src/LayerConfigurations.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (55:8) {#each editions as edition, i }
    function create_each_block(ctx) {
    	let edition;
    	let current;

    	edition = new Edition({
    			props: {
    				index: /*i*/ ctx[8],
    				edition: /*edition*/ ctx[6],
    				length: /*editions*/ ctx[0].length,
    				previousGrow: /*i*/ ctx[8] > 0
    				? /*editions*/ ctx[0][/*i*/ ctx[8] - 1].grow + 1
    				: 1,
    				isLast: /*i*/ ctx[8] === /*editions*/ ctx[0].length - 1
    			},
    			$$inline: true
    		});

    	edition.$on("delete", /*handleMessage*/ ctx[2]);
    	edition.$on("updateCommand", /*updateProject*/ ctx[3]);

    	const block = {
    		c: function create() {
    			create_component(edition.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(edition, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const edition_changes = {};
    			if (dirty & /*editions*/ 1) edition_changes.edition = /*edition*/ ctx[6];
    			if (dirty & /*editions*/ 1) edition_changes.length = /*editions*/ ctx[0].length;

    			if (dirty & /*editions*/ 1) edition_changes.previousGrow = /*i*/ ctx[8] > 0
    			? /*editions*/ ctx[0][/*i*/ ctx[8] - 1].grow + 1
    			: 1;

    			if (dirty & /*editions*/ 1) edition_changes.isLast = /*i*/ ctx[8] === /*editions*/ ctx[0].length - 1;
    			edition.$set(edition_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(edition.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(edition.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(edition, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(55:8) {#each editions as edition, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let t;
    	let div1;
    	let div0;
    	let input;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*editions*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			attr_dev(input, "type", "button");
    			attr_dev(input, "class", "pointer p-2 rounded-xl shadow-md w-full");
    			attr_dev(input, "name", "addEdition");
    			input.value = "Add Edition";
    			add_location(input, file$3, 59, 16, 1910);
    			attr_dev(div0, "class", "grid grid-cols-1 gap-6");
    			add_location(div0, file$3, 58, 12, 1857);
    			attr_dev(div1, "class", "w-full mx-auto flex items-center space-x-4");
    			add_location(div1, file$3, 57, 8, 1788);
    			attr_dev(div2, "class", "grid grid-cols-1 gap-6 w-full");
    			add_location(div2, file$3, 53, 4, 1458);
    			attr_dev(div3, "class", "w-full");
    			add_location(div3, file$3, 52, 0, 1433);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*addEdition*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*editions, handleMessage, updateProject*/ 13) {
    				each_value = /*editions*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, t);
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
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
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
    	validate_slots('LayerConfigurations', slots, []);
    	const dispatch = createEventDispatcher();
    	let editions;
    	let project;

    	store.subscribe(value => {
    		project = value;
    		$$invalidate(0, editions = value.editions);
    	});

    	function addEdition() {
    		store.update(value => {
    			let last = editions[editions.length - 1];
    			const newUuid = v4();

    			editions.push({
    				editionId: newUuid,
    				grow: last.grow + 1,
    				layerOrders: []
    			});

    			value.editions = editions;
    			dispatch('updateCommand', { project: value });
    			console.log(value);
    			return value;
    		});
    	}

    	function handleMessage(event) {
    		if (editions.length > 1) {
    			store.update(value => {
    				value.editions = editions.filter(edition => edition.editionId !== event.detail.key);
    				console.log(value);
    				dispatch('updateCommand', { project: value });
    				return value;
    			});
    		}
    	}

    	function updateProject() {
    		dispatch('updateCommand', { project });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<LayerConfigurations> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Edition,
    		store,
    		uuidv4: v4,
    		createEventDispatcher,
    		dispatch,
    		editions,
    		project,
    		addEdition,
    		handleMessage,
    		updateProject
    	});

    	$$self.$inject_state = $$props => {
    		if ('editions' in $$props) $$invalidate(0, editions = $$props.editions);
    		if ('project' in $$props) project = $$props.project;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [editions, addEdition, handleMessage, updateProject];
    }

    class LayerConfigurations extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LayerConfigurations",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Form.svelte generated by Svelte v3.44.0 */
    const file$2 = "src/Form.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let label0;
    	let span0;
    	let t1;
    	let input0;
    	let t2;
    	let label1;
    	let span1;
    	let t4;
    	let textarea;
    	let t5;
    	let label2;
    	let span2;
    	let t7;
    	let input1;
    	let t8;
    	let label3;
    	let span3;
    	let t10;
    	let input2;
    	let t11;
    	let label4;
    	let span4;
    	let t13;
    	let input3;
    	let t14;
    	let input4;
    	let t15;
    	let t16;
    	let label5;
    	let input5;
    	let t17;
    	let span5;
    	let t19;
    	let layerconfigurations;
    	let current;
    	let mounted;
    	let dispose;
    	layerconfigurations = new LayerConfigurations({ $$inline: true });
    	layerconfigurations.$on("updateCommand", /*updateProject*/ ctx[1]);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "NFT Collection name";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Collection Description";
    			t4 = space();
    			textarea = element("textarea");
    			t5 = space();
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Put here your Author Name";
    			t7 = space();
    			input1 = element("input");
    			t8 = space();
    			label3 = element("label");
    			span3 = element("span");
    			span3.textContent = "Ipfs Url";
    			t10 = space();
    			input2 = element("input");
    			t11 = space();
    			label4 = element("label");
    			span4 = element("span");
    			span4.textContent = "Image format:";
    			t13 = space();
    			input3 = element("input");
    			t14 = text(" pixels x\n                ");
    			input4 = element("input");
    			t15 = text("pixels");
    			t16 = space();
    			label5 = element("label");
    			input5 = element("input");
    			t17 = space();
    			span5 = element("span");
    			span5.textContent = "Shuffle the different items' editions (it can help to shuffle rare items with normal ones).";
    			t19 = space();
    			create_component(layerconfigurations.$$.fragment);
    			attr_dev(span0, "class", "text-gray-700");
    			add_location(span0, file$2, 27, 16, 717);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input0, "placeholder", "Enter here the name of your NFT project");
    			add_location(input0, file$2, 28, 16, 788);
    			attr_dev(label0, "class", "block");
    			add_location(label0, file$2, 26, 12, 679);
    			attr_dev(span1, "class", "text-gray-700");
    			add_location(span1, file$2, 39, 16, 1350);
    			attr_dev(textarea, "class", "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50");
    			attr_dev(textarea, "placeholder", "Put here a brew description of the NFT project");
    			add_location(textarea, file$2, 40, 16, 1424);
    			attr_dev(label1, "class", "block");
    			add_location(label1, file$2, 38, 12, 1312);
    			attr_dev(span2, "class", "text-gray-700");
    			add_location(span2, file$2, 43, 16, 1778);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input1, "placeholder", "Author");
    			add_location(input1, file$2, 44, 16, 1855);
    			attr_dev(label2, "class", "block");
    			add_location(label2, file$2, 42, 12, 1740);
    			attr_dev(span3, "class", "text-gray-700");
    			add_location(span3, file$2, 55, 16, 2387);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input2, "placeholder", "ipfs://NewUriToReplace");
    			add_location(input2, file$2, 56, 16, 2447);
    			attr_dev(label3, "class", "block");
    			add_location(label3, file$2, 54, 12, 2349);
    			attr_dev(span4, "class", "text-gray-700");
    			add_location(span4, file$2, 67, 16, 3018);
    			attr_dev(input3, "type", "number");
    			attr_dev(input3, "class", "mt-1 w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input3, "placeholder", "width (pixels)");
    			add_location(input3, file$2, 68, 16, 3083);
    			attr_dev(input4, "type", "number");
    			attr_dev(input4, "class", "mt-1 w-24 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ");
    			attr_dev(input4, "placeholder", "height (pixels)");
    			add_location(input4, file$2, 76, 16, 3567);
    			attr_dev(label4, "class", "block");
    			add_location(label4, file$2, 66, 12, 2980);
    			attr_dev(input5, "type", "checkbox");
    			attr_dev(input5, "class", "pointer");
    			add_location(input5, file$2, 86, 16, 4132);
    			attr_dev(span5, "class", "ml-2");
    			add_location(span5, file$2, 87, 16, 4245);
    			attr_dev(label5, "class", "inline-flex items-center pointer");
    			add_location(label5, file$2, 85, 12, 4067);
    			attr_dev(div0, "class", "grid grid-cols-1 gap-6");
    			add_location(div0, file$2, 25, 8, 630);
    			attr_dev(div1, "class", "grid grid-cols-1 gap-6 w-full");
    			add_location(div1, file$2, 24, 4, 578);
    			attr_dev(div2, "class", "p-12 w-full mx-auto space-x-4 pokemon");
    			add_location(div2, file$2, 23, 0, 522);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(label0, t1);
    			append_dev(label0, input0);
    			set_input_value(input0, /*project*/ ctx[0].name);
    			append_dev(div0, t2);
    			append_dev(div0, label1);
    			append_dev(label1, span1);
    			append_dev(label1, t4);
    			append_dev(label1, textarea);
    			set_input_value(textarea, /*project*/ ctx[0].description);
    			append_dev(div0, t5);
    			append_dev(div0, label2);
    			append_dev(label2, span2);
    			append_dev(label2, t7);
    			append_dev(label2, input1);
    			set_input_value(input1, /*project*/ ctx[0].author);
    			append_dev(div0, t8);
    			append_dev(div0, label3);
    			append_dev(label3, span3);
    			append_dev(label3, t10);
    			append_dev(label3, input2);
    			set_input_value(input2, /*project*/ ctx[0].ipfs);
    			append_dev(div0, t11);
    			append_dev(div0, label4);
    			append_dev(label4, span4);
    			append_dev(label4, t13);
    			append_dev(label4, input3);
    			set_input_value(input3, /*project*/ ctx[0].width);
    			append_dev(label4, t14);
    			append_dev(label4, input4);
    			set_input_value(input4, /*project*/ ctx[0].height);
    			append_dev(label4, t15);
    			append_dev(div0, t16);
    			append_dev(div0, label5);
    			append_dev(label5, input5);
    			input5.checked = /*project*/ ctx[0].shuffle;
    			append_dev(label5, t17);
    			append_dev(label5, span5);
    			append_dev(div1, t19);
    			mount_component(layerconfigurations, div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input0, "keyup", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[3]),
    					listen_dev(textarea, "keyup", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[4]),
    					listen_dev(input1, "keyup", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[5]),
    					listen_dev(input2, "keyup", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input2, "change", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[6]),
    					listen_dev(input3, "keyup", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input3, "change", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[7]),
    					listen_dev(input4, "keyup", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input4, "change", /*updateProject*/ ctx[1], false, false, false),
    					listen_dev(input5, "change", /*input5_change_handler*/ ctx[8]),
    					listen_dev(input5, "change", /*updateProject*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project*/ 1 && input0.value !== /*project*/ ctx[0].name) {
    				set_input_value(input0, /*project*/ ctx[0].name);
    			}

    			if (dirty & /*project*/ 1) {
    				set_input_value(textarea, /*project*/ ctx[0].description);
    			}

    			if (dirty & /*project*/ 1 && input1.value !== /*project*/ ctx[0].author) {
    				set_input_value(input1, /*project*/ ctx[0].author);
    			}

    			if (dirty & /*project*/ 1 && input2.value !== /*project*/ ctx[0].ipfs) {
    				set_input_value(input2, /*project*/ ctx[0].ipfs);
    			}

    			if (dirty & /*project*/ 1 && to_number(input3.value) !== /*project*/ ctx[0].width) {
    				set_input_value(input3, /*project*/ ctx[0].width);
    			}

    			if (dirty & /*project*/ 1 && to_number(input4.value) !== /*project*/ ctx[0].height) {
    				set_input_value(input4, /*project*/ ctx[0].height);
    			}

    			if (dirty & /*project*/ 1) {
    				input5.checked = /*project*/ ctx[0].shuffle;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(layerconfigurations.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(layerconfigurations.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(layerconfigurations);
    			mounted = false;
    			run_all(dispose);
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

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Form', slots, []);
    	const dispatch = createEventDispatcher();
    	let project;

    	store.subscribe(value => {
    		$$invalidate(0, project = value);
    	});

    	function updateProject() {
    		store.update(value => {
    			value = project;
    			return value;
    		});

    		dispatch('updateCommand', { project });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Form> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		project.name = this.value;
    		$$invalidate(0, project);
    	}

    	function textarea_input_handler() {
    		project.description = this.value;
    		$$invalidate(0, project);
    	}

    	function input1_input_handler() {
    		project.author = this.value;
    		$$invalidate(0, project);
    	}

    	function input2_input_handler() {
    		project.ipfs = this.value;
    		$$invalidate(0, project);
    	}

    	function input3_input_handler() {
    		project.width = to_number(this.value);
    		$$invalidate(0, project);
    	}

    	function input4_input_handler() {
    		project.height = to_number(this.value);
    		$$invalidate(0, project);
    	}

    	function input5_change_handler() {
    		project.shuffle = this.checked;
    		$$invalidate(0, project);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		LayerConfigurations,
    		store,
    		project,
    		updateProject
    	});

    	$$self.$inject_state = $$props => {
    		if ('project' in $$props) $$invalidate(0, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		project,
    		updateProject,
    		input0_input_handler,
    		textarea_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler,
    		input5_change_handler
    	];
    }

    class Form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Form",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Command.svelte generated by Svelte v3.44.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/Command.svelte";

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let a;
    	let t1;
    	let label;
    	let span;
    	let t3;
    	let pre;
    	let code;
    	let t4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			a = element("a");
    			a.textContent = "Copy Generated Config";
    			t1 = space();
    			label = element("label");
    			span = element("span");
    			span.textContent = "Generated Config:";
    			t3 = space();
    			pre = element("pre");
    			code = element("code");
    			t4 = text(/*template*/ ctx[0]);
    			attr_dev(a, "id", "copier");
    			attr_dev(a, "class", "text-right pointer w-1/2 flex rounded-md border border-gray-300");
    			add_location(a, file$1, 172, 12, 5732);
    			attr_dev(span, "class", "text-gray-700");
    			add_location(span, file$1, 174, 16, 5912);
    			attr_dev(code, "id", "command");
    			attr_dev(code, "class", "language-javascript rounded-xl");
    			add_location(code, file$1, 175, 30, 5995);
    			attr_dev(pre, "class", "");
    			add_location(pre, file$1, 175, 16, 5981);
    			attr_dev(label, "class", "block");
    			add_location(label, file$1, 173, 12, 5874);
    			attr_dev(div0, "class", "grid grid-cols-1 gap-6");
    			add_location(div0, file$1, 171, 8, 5683);
    			attr_dev(div1, "class", "grid grid-cols-1 gap-6 w-full");
    			add_location(div1, file$1, 170, 4, 5631);
    			attr_dev(div2, "class", "p-12 w-full mx-auto space-x-4");
    			add_location(div2, file$1, 169, 0, 5583);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, a);
    			append_dev(div0, t1);
    			append_dev(div0, label);
    			append_dev(label, span);
    			append_dev(label, t3);
    			append_dev(label, pre);
    			append_dev(pre, code);
    			append_dev(code, t4);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*copy*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*template*/ 1) set_data_dev(t4, /*template*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
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

    function transformEdition(editions) {
    	let layerConfigurations = [];

    	editions.forEach(edition => {
    		console.log(edition);
    		let layersOrder = [];

    		edition.layerOrders.forEach(layerOrder => {
    			layersOrder.push({
    				name: layerOrder.name,
    				options: { displayName: layerOrder.displayName }
    			});
    		});

    		layerConfigurations.push({
    			growEditionSizeTo: edition.grow,
    			layersOrder
    		});
    	});

    	return layerConfigurations;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Command', slots, []);

    	afterUpdate(() => {
    		hljs.highlightAll();
    	});

    	function copy() {
    		navigator.clipboard.writeText(template);
    		document.getElementById('copier').innerHTML = "Copied to your clipboard!";

    		setTimeout(
    			() => {
    				document.getElementById('copier').innerHTML = "Copy Generated Config";
    			},
    			2000
    		);
    	}

    	let { project = defaultStore } = $$props;
    	let template = '"use strict";\n' + '\n' + '\n' + 'const path = require("path");\n' + 'const isLocal = typeof process.pkg === "undefined";\n' + 'const basePath = isLocal ? process.cwd() : path.dirname(process.execPath);\n' + 'const { MODE } = require(path.join(basePath, "constants/blend_mode.js"));\n' + 'const { NETWORK } = require(path.join(basePath, "constants/network.js"));\n' + '\n' + 'const network = NETWORK.eth;\n' + '\n' + '// General metadata for Ethereum\n' + 'const namePrefix = ###NAME###;\n' + 'const description = ###DESCRIPTION###;\n' + 'const baseUri = ###IPFS###;\n' + '\n' + 'const solanaMetadata = {\n' + '  symbol: "YC",\n' + '  seller_fee_basis_points: 1000, // Define how much % you want from secondary market sales 1000 = 10%\n' + '  external_url: "https://www.youtube.com/c/hashlipsnft",\n' + '  creators: [\n' + '    {\n' + '      address: "7fXNuer5sbZtaTEPhtJ5g5gNtuyRoKkvxdjEjEnPN4mC",\n' + '      share: 100,\n' + '    },\n' + '  ],\n' + '};\n' + '\n' + '// If you have selected Solana then the collection starts from 0 automatically\n' + 'const layerConfigurations = ###LAYERCONFIG###;\n' + '\n' + 'const debugLogs = false;\n' + 'const shuffleLayerConfigurations = ###SHUFFLE###;\n' + '\n' + 'const format = {\n' + '  width: ###WIDTH###,\n' + '  height: ###HEIGHT###,\n' + '};\n' + '\n' + 'const gif = {\n' + '  export: false,\n' + '  repeat: 0,\n' + '  quality: 100,\n' + '  delay: 500,\n' + '};\n' + '\n' + 'const text = {\n' + '  only: false,\n' + '  color: "#ffffff",\n' + '  size: 20,\n' + '  xGap: 40,\n' + '  yGap: 40,\n' + '  align: "left",\n' + '  baseline: "top",\n' + '  weight: "regular",\n' + '  family: "Courier",\n' + '  spacer: " => ",\n' + '};\n' + '\n' + 'const pixelFormat = {\n' + '  ratio: 2 / 128,\n' + '};\n' + '\n' + 'const background = {\n' + '  generate: true,\n' + '  brightness: "80%",\n' + '  static: false,\n' + '  default: "#000000",\n' + '};\n' + '\n' + 'const extraMetadata = { author: ###AUTHOR###};\n' + '\n' + 'const rarityDelimiter = "#";\n' + '\n' + 'const uniqueDnaTorrance = 10000;\n' + '\n' + 'const preview = {\n' + '  thumbPerRow: 5,\n' + '  thumbWidth: 50,\n' + '  imageRatio: format.height / format.width,\n' + '  imageName: "preview.png",\n' + '};\n' + '\n' + 'const preview_gif = {\n' + '  numberOfImages: 5,\n' + '  order: "ASC", // ASC, DESC, MIXED\n' + '  repeat: 0,\n' + '  quality: 100,\n' + '  delay: 500,\n' + '  imageName: "preview.gif",\n' + '};\n' + '\n' + 'module.exports = {\n' + '  format,\n' + '  baseUri,\n' + '  description,\n' + '  background,\n' + '  uniqueDnaTorrance,\n' + '  layerConfigurations,\n' + '  rarityDelimiter,\n' + '  preview,\n' + '  shuffleLayerConfigurations,\n' + '  debugLogs,\n' + '  extraMetadata,\n' + '  pixelFormat,\n' + '  text,\n' + '  namePrefix,\n' + '  network,\n' + '  solanaMetadata,\n' + '  gif,\n' + '  preview_gif,\n' + '};\n';
    	template = template.replace("###NAME###", JSON.stringify(project.name));
    	template = template.replace("###DESCRIPTION###", JSON.stringify(project.description));
    	template = template.replace("###WIDTH###", project.width);
    	template = template.replace("###HEIGHT###", project.height);
    	template = template.replace("###SHUFFLE###", project.shuffle);
    	template = template.replace("###AUTHOR###", JSON.stringify(project.author));
    	template = template.replace("###IPFS###", JSON.stringify(project.ipfs));
    	template = template.replace("###LAYERCONFIG###", JSON.stringify(transformEdition(project.editions)));
    	const writable_props = ['project'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Command> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('project' in $$props) $$invalidate(2, project = $$props.project);
    	};

    	$$self.$capture_state = () => ({
    		uuidv4: v4,
    		defaultStore,
    		afterUpdate,
    		copy,
    		project,
    		template,
    		transformEdition
    	});

    	$$self.$inject_state = $$props => {
    		if ('project' in $$props) $$invalidate(2, project = $$props.project);
    		if ('template' in $$props) $$invalidate(0, template = $$props.template);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [template, copy, project];
    }

    class Command extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { project: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Command",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get project() {
    		throw new Error("<Command>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set project(value) {
    		throw new Error("<Command>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.0 */
    const file = "src/App.svelte";

    // (26:3) {#key project}
    function create_key_block(ctx) {
    	let command;
    	let current;

    	command = new Command({
    			props: { project: /*project*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(command.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(command, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const command_changes = {};
    			if (dirty & /*project*/ 1) command_changes.project = /*project*/ ctx[0];
    			command.$set(command_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(command.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(command.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(command, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(26:3) {#key project}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h1;
    	let t2;
    	let h5;
    	let t4;
    	let div3;
    	let div1;
    	let form;
    	let t5;
    	let div2;
    	let previous_key = /*project*/ ctx[0];
    	let current;
    	form = new Form({ $$inline: true });
    	form.$on("updateCommand", /*handleMessage*/ ctx[1]);
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Config Editor Gui";
    			t2 = space();
    			h5 = element("h5");
    			h5.textContent = "alpha version 0.1";
    			t4 = space();
    			div3 = element("div");
    			div1 = element("div");
    			create_component(form.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			key_block.c();
    			if (!src_url_equal(img.src, img_src_value = "logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "200");
    			add_location(img, file, 15, 2, 261);
    			add_location(h1, file, 16, 2, 298);
    			attr_dev(h5, "class", "text-xs");
    			add_location(h5, file, 17, 2, 327);
    			attr_dev(div0, "class", "grid grid-cols-1 place-items-center");
    			add_location(div0, file, 14, 1, 209);
    			attr_dev(div1, "class", "space-x-4");
    			add_location(div1, file, 21, 2, 413);
    			attr_dev(div2, "class", "space-x-4");
    			add_location(div2, file, 24, 2, 493);
    			attr_dev(div3, "class", "grid grid-cols-2");
    			add_location(div3, file, 20, 1, 380);
    			add_location(main, file, 13, 0, 201);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, h5);
    			append_dev(main, t4);
    			append_dev(main, div3);
    			append_dev(div3, div1);
    			mount_component(form, div1, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			key_block.m(div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*project*/ 1 && safe_not_equal(previous_key, previous_key = /*project*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block);
    				key_block.m(div2, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(form.$$.fragment, local);
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(form.$$.fragment, local);
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(form);
    			key_block.d(detaching);
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
    	let { name } = $$props;
    	let project;

    	function handleMessage(event) {
    		$$invalidate(0, project = event.detail.project);
    	}

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		Form,
    		Command,
    		name,
    		project,
    		handleMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(2, name = $$props.name);
    		if ('project' in $$props) $$invalidate(0, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [project, handleMessage, name];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
