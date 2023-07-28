
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
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
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
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
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
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
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
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
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.1' }, detail), true));
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

    var EOL = {},
        EOF = {},
        QUOTE = 34,
        NEWLINE = 10,
        RETURN = 13;

    function objectConverter(columns) {
      return new Function("d", "return {" + columns.map(function(name, i) {
        return JSON.stringify(name) + ": d[" + i + "] || \"\"";
      }).join(",") + "}");
    }

    function customConverter(columns, f) {
      var object = objectConverter(columns);
      return function(row, i) {
        return f(object(row), i, columns);
      };
    }

    // Compute unique columns in order of discovery.
    function inferColumns(rows) {
      var columnSet = Object.create(null),
          columns = [];

      rows.forEach(function(row) {
        for (var column in row) {
          if (!(column in columnSet)) {
            columns.push(columnSet[column] = column);
          }
        }
      });

      return columns;
    }

    function pad(value, width) {
      var s = value + "", length = s.length;
      return length < width ? new Array(width - length + 1).join(0) + s : s;
    }

    function formatYear(year) {
      return year < 0 ? "-" + pad(-year, 6)
        : year > 9999 ? "+" + pad(year, 6)
        : pad(year, 4);
    }

    function formatDate(date) {
      var hours = date.getUTCHours(),
          minutes = date.getUTCMinutes(),
          seconds = date.getUTCSeconds(),
          milliseconds = date.getUTCMilliseconds();
      return isNaN(date) ? "Invalid Date"
          : formatYear(date.getUTCFullYear()) + "-" + pad(date.getUTCMonth() + 1, 2) + "-" + pad(date.getUTCDate(), 2)
          + (milliseconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "." + pad(milliseconds, 3) + "Z"
          : seconds ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + ":" + pad(seconds, 2) + "Z"
          : minutes || hours ? "T" + pad(hours, 2) + ":" + pad(minutes, 2) + "Z"
          : "");
    }

    function dsv(delimiter) {
      var reFormat = new RegExp("[\"" + delimiter + "\n\r]"),
          DELIMITER = delimiter.charCodeAt(0);

      function parse(text, f) {
        var convert, columns, rows = parseRows(text, function(row, i) {
          if (convert) return convert(row, i - 1);
          columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
        });
        rows.columns = columns || [];
        return rows;
      }

      function parseRows(text, f) {
        var rows = [], // output rows
            N = text.length,
            I = 0, // current character index
            n = 0, // current line number
            t, // current token
            eof = N <= 0, // current token followed by EOF?
            eol = false; // current token followed by EOL?

        // Strip the trailing newline.
        if (text.charCodeAt(N - 1) === NEWLINE) --N;
        if (text.charCodeAt(N - 1) === RETURN) --N;

        function token() {
          if (eof) return EOF;
          if (eol) return eol = false, EOL;

          // Unescape quotes.
          var i, j = I, c;
          if (text.charCodeAt(j) === QUOTE) {
            while (I++ < N && text.charCodeAt(I) !== QUOTE || text.charCodeAt(++I) === QUOTE);
            if ((i = I) >= N) eof = true;
            else if ((c = text.charCodeAt(I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            return text.slice(j + 1, i - 1).replace(/""/g, "\"");
          }

          // Find next delimiter or newline.
          while (I < N) {
            if ((c = text.charCodeAt(i = I++)) === NEWLINE) eol = true;
            else if (c === RETURN) { eol = true; if (text.charCodeAt(I) === NEWLINE) ++I; }
            else if (c !== DELIMITER) continue;
            return text.slice(j, i);
          }

          // Return last token before EOF.
          return eof = true, text.slice(j, N);
        }

        while ((t = token()) !== EOF) {
          var row = [];
          while (t !== EOL && t !== EOF) row.push(t), t = token();
          if (f && (row = f(row, n++)) == null) continue;
          rows.push(row);
        }

        return rows;
      }

      function preformatBody(rows, columns) {
        return rows.map(function(row) {
          return columns.map(function(column) {
            return formatValue(row[column]);
          }).join(delimiter);
        });
      }

      function format(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return [columns.map(formatValue).join(delimiter)].concat(preformatBody(rows, columns)).join("\n");
      }

      function formatBody(rows, columns) {
        if (columns == null) columns = inferColumns(rows);
        return preformatBody(rows, columns).join("\n");
      }

      function formatRows(rows) {
        return rows.map(formatRow).join("\n");
      }

      function formatRow(row) {
        return row.map(formatValue).join(delimiter);
      }

      function formatValue(value) {
        return value == null ? ""
            : value instanceof Date ? formatDate(value)
            : reFormat.test(value += "") ? "\"" + value.replace(/"/g, "\"\"") + "\""
            : value;
      }

      return {
        parse: parse,
        parseRows: parseRows,
        format: format,
        formatBody: formatBody,
        formatRows: formatRows,
        formatRow: formatRow,
        formatValue: formatValue
      };
    }

    var csv = dsv(",");

    var csvParse = csv.parse;

    function autoType(object) {
      for (var key in object) {
        var value = object[key].trim(), number, m;
        if (!value) value = null;
        else if (value === "true") value = true;
        else if (value === "false") value = false;
        else if (value === "NaN") value = NaN;
        else if (!isNaN(number = +value)) value = number;
        else if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
          if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, "/").replace(/T/, " ");
          value = new Date(value);
        }
        else continue;
        object[key] = value;
      }
      return object;
    }

    // https://github.com/d3/d3-dsv/issues/45
    const fixtz = new Date("2019-01-01T00:00").getHours() || new Date("2019-07-01T00:00").getHours();

    // CORE FUNCTIONS
    function setColors(themes, theme) {
      for (let color in themes[theme]) {
        document.documentElement.style.setProperty('--' + color, themes[theme][color]);
      }
    }

    function getMotion() {
      let mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)"); // Check if browser prefers reduced motion
    	return !mediaQuery || mediaQuery.matches ? false : true; // return true for motion, false for no motion
    }

    // DEMO-SPECIFIC FUNCTIONS
    async function getData(url) {
      let response = await fetch(url);
      let string = await response.text();
    	let data = await csvParse(string, autoType);
      return data;
    }

    function getColor(value, breaks, colors) {
      let color;
      let found = false;
      let i = 1;
      while (found == false) {
        if (value <= breaks[i]) {
          color = colors[i - 1];
          found = true;
        } else {
          i ++;
        }
      }
      return color ? color : 'lightgrey';
    }

    function getBreaks(vals) {
    	let len = vals.length;
    	let breaks = [
    		vals[0],
    		vals[Math.floor(len * 0.2)],
    		vals[Math.floor(len * 0.4)],
    		vals[Math.floor(len * 0.6)],
    		vals[Math.floor(len * 0.8)],
    		vals[len - 1]
    	];
    	return breaks;
    }

    // CORE CONFIG
    const themes = {
      'light': {
        'text': '#222',
        'muted': '#777',
        'pale': '#f0f0f0',
        'background': '#fff'
      },
      'dark': {
        'text': '#fff',
        'muted': '#bbb',
        'pale': '#333',
        'background': '#222'
      },
      'lightblue': {
        'text': '#206095',
        'muted': '#707070',
        'pale': '#f0f0f0',
        'background': 'rgb(188, 207, 222)'
      }
    };

    // DEMO-SPECIFIC CONFIG

    const colors = {
      seq: ['rgb(234, 236, 177)', 'rgb(169, 216, 145)', 'rgb(0, 167, 186)', 'rgb(0, 78, 166)', 'rgb(0, 13, 84)'],
      cat: ['#206095', '#A8BD3A', '#003C57', '#27A0CC', '#118C7B', '#F66068', '#746CB1', '#22D0B6', 'lightgrey']
    };

    /* src\layout\UHCHeader.svelte generated by Svelte v3.44.1 */
    const file = "src\\layout\\UHCHeader.svelte";

    function create_fragment(ctx) {
    	let nav;
    	let div1;
    	let a;
    	let div0;
    	let img;
    	let img_src_value;
    	let nav_style_value;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			a = element("a");
    			div0 = element("div");
    			img = element("img");
    			attr_dev(img, "id", "my-svg");
    			if (!src_url_equal(img.src, img_src_value = "./img/uhc-primary-blue_black.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drexel Urban Health Collaborative");
    			attr_dev(img, "class", "svelte-dmeou9");
    			add_location(img, file, 17, 8, 485);
    			attr_dev(div0, "id", "svg-container");
    			attr_dev(div0, "class", "svelte-dmeou9");
    			add_location(div0, file, 16, 6, 451);
    			attr_dev(a, "href", "https://drexel.edu/uhc/");
    			attr_dev(a, "class", "svelte-dmeou9");
    			add_location(a, file, 15, 4, 409);
    			attr_dev(div1, "class", "col-wide middle");
    			toggle_class(div1, "center", /*center*/ ctx[2]);
    			add_location(div1, file, 14, 2, 361);

    			attr_dev(nav, "style", nav_style_value = "border-bottom-color: " + themes[/*theme*/ ctx[0]]['muted'] + "; " + (/*filled*/ ctx[1]
    			? 'background-color: ' + themes[/*theme*/ ctx[0]]['background'] + ';'
    			: ''));

    			attr_dev(nav, "class", "svelte-dmeou9");
    			add_location(nav, file, 9, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, a);
    			append_dev(a, div0);
    			append_dev(div0, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*center*/ 4) {
    				toggle_class(div1, "center", /*center*/ ctx[2]);
    			}

    			if (dirty & /*theme, filled*/ 3 && nav_style_value !== (nav_style_value = "border-bottom-color: " + themes[/*theme*/ ctx[0]]['muted'] + "; " + (/*filled*/ ctx[1]
    			? 'background-color: ' + themes[/*theme*/ ctx[0]]['background'] + ';'
    			: ''))) {
    				attr_dev(nav, "style", nav_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
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
    	validate_slots('UHCHeader', slots, []);
    	let { theme = getContext('theme') } = $$props;
    	let { filled = false } = $$props;
    	let { center = true } = $$props;
    	const writable_props = ['theme', 'filled', 'center'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UHCHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('filled' in $$props) $$invalidate(1, filled = $$props.filled);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		getContext,
    		theme,
    		filled,
    		center
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('filled' in $$props) $$invalidate(1, filled = $$props.filled);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, filled, center];
    }

    class UHCHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { theme: 0, filled: 1, center: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UHCHeader",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get theme() {
    		throw new Error("<UHCHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<UHCHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filled() {
    		throw new Error("<UHCHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filled(value) {
    		throw new Error("<UHCHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<UHCHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<UHCHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const matchIconName = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    const stringToIcon = (value, validate, allowSimpleName, provider = "") => {
      const colonSeparated = value.split(":");
      if (value.slice(0, 1) === "@") {
        if (colonSeparated.length < 2 || colonSeparated.length > 3) {
          return null;
        }
        provider = colonSeparated.shift().slice(1);
      }
      if (colonSeparated.length > 3 || !colonSeparated.length) {
        return null;
      }
      if (colonSeparated.length > 1) {
        const name2 = colonSeparated.pop();
        const prefix = colonSeparated.pop();
        const result = {
          // Allow provider without '@': "provider:prefix:name"
          provider: colonSeparated.length > 0 ? colonSeparated[0] : provider,
          prefix,
          name: name2
        };
        return validate && !validateIconName(result) ? null : result;
      }
      const name = colonSeparated[0];
      const dashSeparated = name.split("-");
      if (dashSeparated.length > 1) {
        const result = {
          provider,
          prefix: dashSeparated.shift(),
          name: dashSeparated.join("-")
        };
        return validate && !validateIconName(result) ? null : result;
      }
      if (allowSimpleName && provider === "") {
        const result = {
          provider,
          prefix: "",
          name
        };
        return validate && !validateIconName(result, allowSimpleName) ? null : result;
      }
      return null;
    };
    const validateIconName = (icon, allowSimpleName) => {
      if (!icon) {
        return false;
      }
      return !!((icon.provider === "" || icon.provider.match(matchIconName)) && (allowSimpleName && icon.prefix === "" || icon.prefix.match(matchIconName)) && icon.name.match(matchIconName));
    };

    const defaultIconDimensions = Object.freeze(
      {
        left: 0,
        top: 0,
        width: 16,
        height: 16
      }
    );
    const defaultIconTransformations = Object.freeze({
      rotate: 0,
      vFlip: false,
      hFlip: false
    });
    const defaultIconProps = Object.freeze({
      ...defaultIconDimensions,
      ...defaultIconTransformations
    });
    const defaultExtendedIconProps = Object.freeze({
      ...defaultIconProps,
      body: "",
      hidden: false
    });

    function mergeIconTransformations(obj1, obj2) {
      const result = {};
      if (!obj1.hFlip !== !obj2.hFlip) {
        result.hFlip = true;
      }
      if (!obj1.vFlip !== !obj2.vFlip) {
        result.vFlip = true;
      }
      const rotate = ((obj1.rotate || 0) + (obj2.rotate || 0)) % 4;
      if (rotate) {
        result.rotate = rotate;
      }
      return result;
    }

    function mergeIconData(parent, child) {
      const result = mergeIconTransformations(parent, child);
      for (const key in defaultExtendedIconProps) {
        if (key in defaultIconTransformations) {
          if (key in parent && !(key in result)) {
            result[key] = defaultIconTransformations[key];
          }
        } else if (key in child) {
          result[key] = child[key];
        } else if (key in parent) {
          result[key] = parent[key];
        }
      }
      return result;
    }

    function getIconsTree(data, names) {
      const icons = data.icons;
      const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
      const resolved = /* @__PURE__ */ Object.create(null);
      function resolve(name) {
        if (icons[name]) {
          return resolved[name] = [];
        }
        if (!(name in resolved)) {
          resolved[name] = null;
          const parent = aliases[name] && aliases[name].parent;
          const value = parent && resolve(parent);
          if (value) {
            resolved[name] = [parent].concat(value);
          }
        }
        return resolved[name];
      }
      (names || Object.keys(icons).concat(Object.keys(aliases))).forEach(resolve);
      return resolved;
    }

    function internalGetIconData(data, name, tree) {
      const icons = data.icons;
      const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
      let currentProps = {};
      function parse(name2) {
        currentProps = mergeIconData(
          icons[name2] || aliases[name2],
          currentProps
        );
      }
      parse(name);
      tree.forEach(parse);
      return mergeIconData(data, currentProps);
    }

    function parseIconSet(data, callback) {
      const names = [];
      if (typeof data !== "object" || typeof data.icons !== "object") {
        return names;
      }
      if (data.not_found instanceof Array) {
        data.not_found.forEach((name) => {
          callback(name, null);
          names.push(name);
        });
      }
      const tree = getIconsTree(data);
      for (const name in tree) {
        const item = tree[name];
        if (item) {
          callback(name, internalGetIconData(data, name, item));
          names.push(name);
        }
      }
      return names;
    }

    const optionalPropertyDefaults = {
      provider: "",
      aliases: {},
      not_found: {},
      ...defaultIconDimensions
    };
    function checkOptionalProps(item, defaults) {
      for (const prop in defaults) {
        if (prop in item && typeof item[prop] !== typeof defaults[prop]) {
          return false;
        }
      }
      return true;
    }
    function quicklyValidateIconSet(obj) {
      if (typeof obj !== "object" || obj === null) {
        return null;
      }
      const data = obj;
      if (typeof data.prefix !== "string" || !obj.icons || typeof obj.icons !== "object") {
        return null;
      }
      if (!checkOptionalProps(obj, optionalPropertyDefaults)) {
        return null;
      }
      const icons = data.icons;
      for (const name in icons) {
        const icon = icons[name];
        if (!name.match(matchIconName) || typeof icon.body !== "string" || !checkOptionalProps(
          icon,
          defaultExtendedIconProps
        )) {
          return null;
        }
      }
      const aliases = data.aliases || /* @__PURE__ */ Object.create(null);
      for (const name in aliases) {
        const icon = aliases[name];
        const parent = icon.parent;
        if (!name.match(matchIconName) || typeof parent !== "string" || !icons[parent] && !aliases[parent] || !checkOptionalProps(
          icon,
          defaultExtendedIconProps
        )) {
          return null;
        }
      }
      return data;
    }

    const dataStorage = /* @__PURE__ */ Object.create(null);
    function newStorage(provider, prefix) {
      return {
        provider,
        prefix,
        icons: /* @__PURE__ */ Object.create(null),
        missing: /* @__PURE__ */ new Set()
      };
    }
    function getStorage(provider, prefix) {
      const providerStorage = dataStorage[provider] || (dataStorage[provider] = /* @__PURE__ */ Object.create(null));
      return providerStorage[prefix] || (providerStorage[prefix] = newStorage(provider, prefix));
    }
    function addIconSet(storage, data) {
      if (!quicklyValidateIconSet(data)) {
        return [];
      }
      return parseIconSet(data, (name, icon) => {
        if (icon) {
          storage.icons[name] = icon;
        } else {
          storage.missing.add(name);
        }
      });
    }
    function addIconToStorage(storage, name, icon) {
      try {
        if (typeof icon.body === "string") {
          storage.icons[name] = { ...icon };
          return true;
        }
      } catch (err) {
      }
      return false;
    }
    function listIcons(provider, prefix) {
      let allIcons = [];
      const providers = typeof provider === "string" ? [provider] : Object.keys(dataStorage);
      providers.forEach((provider2) => {
        const prefixes = typeof provider2 === "string" && typeof prefix === "string" ? [prefix] : Object.keys(dataStorage[provider2] || {});
        prefixes.forEach((prefix2) => {
          const storage = getStorage(provider2, prefix2);
          allIcons = allIcons.concat(
            Object.keys(storage.icons).map(
              (name) => (provider2 !== "" ? "@" + provider2 + ":" : "") + prefix2 + ":" + name
            )
          );
        });
      });
      return allIcons;
    }

    let simpleNames = false;
    function allowSimpleNames(allow) {
      if (typeof allow === "boolean") {
        simpleNames = allow;
      }
      return simpleNames;
    }
    function getIconData(name) {
      const icon = typeof name === "string" ? stringToIcon(name, true, simpleNames) : name;
      if (icon) {
        const storage = getStorage(icon.provider, icon.prefix);
        const iconName = icon.name;
        return storage.icons[iconName] || (storage.missing.has(iconName) ? null : void 0);
      }
    }
    function addIcon(name, data) {
      const icon = stringToIcon(name, true, simpleNames);
      if (!icon) {
        return false;
      }
      const storage = getStorage(icon.provider, icon.prefix);
      return addIconToStorage(storage, icon.name, data);
    }
    function addCollection(data, provider) {
      if (typeof data !== "object") {
        return false;
      }
      if (typeof provider !== "string") {
        provider = data.provider || "";
      }
      if (simpleNames && !provider && !data.prefix) {
        let added = false;
        if (quicklyValidateIconSet(data)) {
          data.prefix = "";
          parseIconSet(data, (name, icon) => {
            if (icon && addIcon(name, icon)) {
              added = true;
            }
          });
        }
        return added;
      }
      const prefix = data.prefix;
      if (!validateIconName({
        provider,
        prefix,
        name: "a"
      })) {
        return false;
      }
      const storage = getStorage(provider, prefix);
      return !!addIconSet(storage, data);
    }
    function iconExists(name) {
      return !!getIconData(name);
    }
    function getIcon(name) {
      const result = getIconData(name);
      return result ? {
        ...defaultIconProps,
        ...result
      } : null;
    }

    const defaultIconSizeCustomisations = Object.freeze({
      width: null,
      height: null
    });
    const defaultIconCustomisations = Object.freeze({
      // Dimensions
      ...defaultIconSizeCustomisations,
      // Transformations
      ...defaultIconTransformations
    });

    const unitsSplit = /(-?[0-9.]*[0-9]+[0-9.]*)/g;
    const unitsTest = /^-?[0-9.]*[0-9]+[0-9.]*$/g;
    function calculateSize(size, ratio, precision) {
      if (ratio === 1) {
        return size;
      }
      precision = precision || 100;
      if (typeof size === "number") {
        return Math.ceil(size * ratio * precision) / precision;
      }
      if (typeof size !== "string") {
        return size;
      }
      const oldParts = size.split(unitsSplit);
      if (oldParts === null || !oldParts.length) {
        return size;
      }
      const newParts = [];
      let code = oldParts.shift();
      let isNumber = unitsTest.test(code);
      while (true) {
        if (isNumber) {
          const num = parseFloat(code);
          if (isNaN(num)) {
            newParts.push(code);
          } else {
            newParts.push(Math.ceil(num * ratio * precision) / precision);
          }
        } else {
          newParts.push(code);
        }
        code = oldParts.shift();
        if (code === void 0) {
          return newParts.join("");
        }
        isNumber = !isNumber;
      }
    }

    const isUnsetKeyword = (value) => value === "unset" || value === "undefined" || value === "none";
    function iconToSVG(icon, customisations) {
      const fullIcon = {
        ...defaultIconProps,
        ...icon
      };
      const fullCustomisations = {
        ...defaultIconCustomisations,
        ...customisations
      };
      const box = {
        left: fullIcon.left,
        top: fullIcon.top,
        width: fullIcon.width,
        height: fullIcon.height
      };
      let body = fullIcon.body;
      [fullIcon, fullCustomisations].forEach((props) => {
        const transformations = [];
        const hFlip = props.hFlip;
        const vFlip = props.vFlip;
        let rotation = props.rotate;
        if (hFlip) {
          if (vFlip) {
            rotation += 2;
          } else {
            transformations.push(
              "translate(" + (box.width + box.left).toString() + " " + (0 - box.top).toString() + ")"
            );
            transformations.push("scale(-1 1)");
            box.top = box.left = 0;
          }
        } else if (vFlip) {
          transformations.push(
            "translate(" + (0 - box.left).toString() + " " + (box.height + box.top).toString() + ")"
          );
          transformations.push("scale(1 -1)");
          box.top = box.left = 0;
        }
        let tempValue;
        if (rotation < 0) {
          rotation -= Math.floor(rotation / 4) * 4;
        }
        rotation = rotation % 4;
        switch (rotation) {
          case 1:
            tempValue = box.height / 2 + box.top;
            transformations.unshift(
              "rotate(90 " + tempValue.toString() + " " + tempValue.toString() + ")"
            );
            break;
          case 2:
            transformations.unshift(
              "rotate(180 " + (box.width / 2 + box.left).toString() + " " + (box.height / 2 + box.top).toString() + ")"
            );
            break;
          case 3:
            tempValue = box.width / 2 + box.left;
            transformations.unshift(
              "rotate(-90 " + tempValue.toString() + " " + tempValue.toString() + ")"
            );
            break;
        }
        if (rotation % 2 === 1) {
          if (box.left !== box.top) {
            tempValue = box.left;
            box.left = box.top;
            box.top = tempValue;
          }
          if (box.width !== box.height) {
            tempValue = box.width;
            box.width = box.height;
            box.height = tempValue;
          }
        }
        if (transformations.length) {
          body = '<g transform="' + transformations.join(" ") + '">' + body + "</g>";
        }
      });
      const customisationsWidth = fullCustomisations.width;
      const customisationsHeight = fullCustomisations.height;
      const boxWidth = box.width;
      const boxHeight = box.height;
      let width;
      let height;
      if (customisationsWidth === null) {
        height = customisationsHeight === null ? "1em" : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
        width = calculateSize(height, boxWidth / boxHeight);
      } else {
        width = customisationsWidth === "auto" ? boxWidth : customisationsWidth;
        height = customisationsHeight === null ? calculateSize(width, boxHeight / boxWidth) : customisationsHeight === "auto" ? boxHeight : customisationsHeight;
      }
      const attributes = {};
      const setAttr = (prop, value) => {
        if (!isUnsetKeyword(value)) {
          attributes[prop] = value.toString();
        }
      };
      setAttr("width", width);
      setAttr("height", height);
      attributes.viewBox = box.left.toString() + " " + box.top.toString() + " " + boxWidth.toString() + " " + boxHeight.toString();
      return {
        attributes,
        body
      };
    }

    const regex = /\sid="(\S+)"/g;
    const randomPrefix = "IconifyId" + Date.now().toString(16) + (Math.random() * 16777216 | 0).toString(16);
    let counter = 0;
    function replaceIDs(body, prefix = randomPrefix) {
      const ids = [];
      let match;
      while (match = regex.exec(body)) {
        ids.push(match[1]);
      }
      if (!ids.length) {
        return body;
      }
      const suffix = "suffix" + (Math.random() * 16777216 | Date.now()).toString(16);
      ids.forEach((id) => {
        const newID = typeof prefix === "function" ? prefix(id) : prefix + (counter++).toString();
        const escapedID = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        body = body.replace(
          // Allowed characters before id: [#;"]
          // Allowed characters after id: [)"], .[a-z]
          new RegExp('([#;"])(' + escapedID + ')([")]|\\.[a-z])', "g"),
          "$1" + newID + suffix + "$3"
        );
      });
      body = body.replace(new RegExp(suffix, "g"), "");
      return body;
    }

    const storage = /* @__PURE__ */ Object.create(null);
    function setAPIModule(provider, item) {
      storage[provider] = item;
    }
    function getAPIModule(provider) {
      return storage[provider] || storage[""];
    }

    function createAPIConfig(source) {
      let resources;
      if (typeof source.resources === "string") {
        resources = [source.resources];
      } else {
        resources = source.resources;
        if (!(resources instanceof Array) || !resources.length) {
          return null;
        }
      }
      const result = {
        // API hosts
        resources,
        // Root path
        path: source.path || "/",
        // URL length limit
        maxURL: source.maxURL || 500,
        // Timeout before next host is used.
        rotate: source.rotate || 750,
        // Timeout before failing query.
        timeout: source.timeout || 5e3,
        // Randomise default API end point.
        random: source.random === true,
        // Start index
        index: source.index || 0,
        // Receive data after time out (used if time out kicks in first, then API module sends data anyway).
        dataAfterTimeout: source.dataAfterTimeout !== false
      };
      return result;
    }
    const configStorage = /* @__PURE__ */ Object.create(null);
    const fallBackAPISources = [
      "https://api.simplesvg.com",
      "https://api.unisvg.com"
    ];
    const fallBackAPI = [];
    while (fallBackAPISources.length > 0) {
      if (fallBackAPISources.length === 1) {
        fallBackAPI.push(fallBackAPISources.shift());
      } else {
        if (Math.random() > 0.5) {
          fallBackAPI.push(fallBackAPISources.shift());
        } else {
          fallBackAPI.push(fallBackAPISources.pop());
        }
      }
    }
    configStorage[""] = createAPIConfig({
      resources: ["https://api.iconify.design"].concat(fallBackAPI)
    });
    function addAPIProvider(provider, customConfig) {
      const config = createAPIConfig(customConfig);
      if (config === null) {
        return false;
      }
      configStorage[provider] = config;
      return true;
    }
    function getAPIConfig(provider) {
      return configStorage[provider];
    }
    function listAPIProviders() {
      return Object.keys(configStorage);
    }

    const detectFetch = () => {
      let callback;
      try {
        callback = fetch;
        if (typeof callback === "function") {
          return callback;
        }
      } catch (err) {
      }
    };
    let fetchModule = detectFetch();
    function setFetch(fetch2) {
      fetchModule = fetch2;
    }
    function getFetch() {
      return fetchModule;
    }
    function calculateMaxLength(provider, prefix) {
      const config = getAPIConfig(provider);
      if (!config) {
        return 0;
      }
      let result;
      if (!config.maxURL) {
        result = 0;
      } else {
        let maxHostLength = 0;
        config.resources.forEach((item) => {
          const host = item;
          maxHostLength = Math.max(maxHostLength, host.length);
        });
        const url = prefix + ".json?icons=";
        result = config.maxURL - maxHostLength - config.path.length - url.length;
      }
      return result;
    }
    function shouldAbort(status) {
      return status === 404;
    }
    const prepare = (provider, prefix, icons) => {
      const results = [];
      const maxLength = calculateMaxLength(provider, prefix);
      const type = "icons";
      let item = {
        type,
        provider,
        prefix,
        icons: []
      };
      let length = 0;
      icons.forEach((name, index) => {
        length += name.length + 1;
        if (length >= maxLength && index > 0) {
          results.push(item);
          item = {
            type,
            provider,
            prefix,
            icons: []
          };
          length = name.length;
        }
        item.icons.push(name);
      });
      results.push(item);
      return results;
    };
    function getPath(provider) {
      if (typeof provider === "string") {
        const config = getAPIConfig(provider);
        if (config) {
          return config.path;
        }
      }
      return "/";
    }
    const send = (host, params, callback) => {
      if (!fetchModule) {
        callback("abort", 424);
        return;
      }
      let path = getPath(params.provider);
      switch (params.type) {
        case "icons": {
          const prefix = params.prefix;
          const icons = params.icons;
          const iconsList = icons.join(",");
          const urlParams = new URLSearchParams({
            icons: iconsList
          });
          path += prefix + ".json?" + urlParams.toString();
          break;
        }
        case "custom": {
          const uri = params.uri;
          path += uri.slice(0, 1) === "/" ? uri.slice(1) : uri;
          break;
        }
        default:
          callback("abort", 400);
          return;
      }
      let defaultError = 503;
      fetchModule(host + path).then((response) => {
        const status = response.status;
        if (status !== 200) {
          setTimeout(() => {
            callback(shouldAbort(status) ? "abort" : "next", status);
          });
          return;
        }
        defaultError = 501;
        return response.json();
      }).then((data) => {
        if (typeof data !== "object" || data === null) {
          setTimeout(() => {
            if (data === 404) {
              callback("abort", data);
            } else {
              callback("next", defaultError);
            }
          });
          return;
        }
        setTimeout(() => {
          callback("success", data);
        });
      }).catch(() => {
        callback("next", defaultError);
      });
    };
    const fetchAPIModule = {
      prepare,
      send
    };

    function sortIcons(icons) {
      const result = {
        loaded: [],
        missing: [],
        pending: []
      };
      const storage = /* @__PURE__ */ Object.create(null);
      icons.sort((a, b) => {
        if (a.provider !== b.provider) {
          return a.provider.localeCompare(b.provider);
        }
        if (a.prefix !== b.prefix) {
          return a.prefix.localeCompare(b.prefix);
        }
        return a.name.localeCompare(b.name);
      });
      let lastIcon = {
        provider: "",
        prefix: "",
        name: ""
      };
      icons.forEach((icon) => {
        if (lastIcon.name === icon.name && lastIcon.prefix === icon.prefix && lastIcon.provider === icon.provider) {
          return;
        }
        lastIcon = icon;
        const provider = icon.provider;
        const prefix = icon.prefix;
        const name = icon.name;
        const providerStorage = storage[provider] || (storage[provider] = /* @__PURE__ */ Object.create(null));
        const localStorage = providerStorage[prefix] || (providerStorage[prefix] = getStorage(provider, prefix));
        let list;
        if (name in localStorage.icons) {
          list = result.loaded;
        } else if (prefix === "" || localStorage.missing.has(name)) {
          list = result.missing;
        } else {
          list = result.pending;
        }
        const item = {
          provider,
          prefix,
          name
        };
        list.push(item);
      });
      return result;
    }

    function removeCallback(storages, id) {
      storages.forEach((storage) => {
        const items = storage.loaderCallbacks;
        if (items) {
          storage.loaderCallbacks = items.filter((row) => row.id !== id);
        }
      });
    }
    function updateCallbacks(storage) {
      if (!storage.pendingCallbacksFlag) {
        storage.pendingCallbacksFlag = true;
        setTimeout(() => {
          storage.pendingCallbacksFlag = false;
          const items = storage.loaderCallbacks ? storage.loaderCallbacks.slice(0) : [];
          if (!items.length) {
            return;
          }
          let hasPending = false;
          const provider = storage.provider;
          const prefix = storage.prefix;
          items.forEach((item) => {
            const icons = item.icons;
            const oldLength = icons.pending.length;
            icons.pending = icons.pending.filter((icon) => {
              if (icon.prefix !== prefix) {
                return true;
              }
              const name = icon.name;
              if (storage.icons[name]) {
                icons.loaded.push({
                  provider,
                  prefix,
                  name
                });
              } else if (storage.missing.has(name)) {
                icons.missing.push({
                  provider,
                  prefix,
                  name
                });
              } else {
                hasPending = true;
                return true;
              }
              return false;
            });
            if (icons.pending.length !== oldLength) {
              if (!hasPending) {
                removeCallback([storage], item.id);
              }
              item.callback(
                icons.loaded.slice(0),
                icons.missing.slice(0),
                icons.pending.slice(0),
                item.abort
              );
            }
          });
        });
      }
    }
    let idCounter = 0;
    function storeCallback(callback, icons, pendingSources) {
      const id = idCounter++;
      const abort = removeCallback.bind(null, pendingSources, id);
      if (!icons.pending.length) {
        return abort;
      }
      const item = {
        id,
        icons,
        callback,
        abort
      };
      pendingSources.forEach((storage) => {
        (storage.loaderCallbacks || (storage.loaderCallbacks = [])).push(item);
      });
      return abort;
    }

    function listToIcons(list, validate = true, simpleNames = false) {
      const result = [];
      list.forEach((item) => {
        const icon = typeof item === "string" ? stringToIcon(item, validate, simpleNames) : item;
        if (icon) {
          result.push(icon);
        }
      });
      return result;
    }

    // src/config.ts
    var defaultConfig = {
      resources: [],
      index: 0,
      timeout: 2e3,
      rotate: 750,
      random: false,
      dataAfterTimeout: false
    };

    // src/query.ts
    function sendQuery(config, payload, query, done) {
      const resourcesCount = config.resources.length;
      const startIndex = config.random ? Math.floor(Math.random() * resourcesCount) : config.index;
      let resources;
      if (config.random) {
        let list = config.resources.slice(0);
        resources = [];
        while (list.length > 1) {
          const nextIndex = Math.floor(Math.random() * list.length);
          resources.push(list[nextIndex]);
          list = list.slice(0, nextIndex).concat(list.slice(nextIndex + 1));
        }
        resources = resources.concat(list);
      } else {
        resources = config.resources.slice(startIndex).concat(config.resources.slice(0, startIndex));
      }
      const startTime = Date.now();
      let status = "pending";
      let queriesSent = 0;
      let lastError;
      let timer = null;
      let queue = [];
      let doneCallbacks = [];
      if (typeof done === "function") {
        doneCallbacks.push(done);
      }
      function resetTimer() {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
      function abort() {
        if (status === "pending") {
          status = "aborted";
        }
        resetTimer();
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function subscribe(callback, overwrite) {
        if (overwrite) {
          doneCallbacks = [];
        }
        if (typeof callback === "function") {
          doneCallbacks.push(callback);
        }
      }
      function getQueryStatus() {
        return {
          startTime,
          payload,
          status,
          queriesSent,
          queriesPending: queue.length,
          subscribe,
          abort
        };
      }
      function failQuery() {
        status = "failed";
        doneCallbacks.forEach((callback) => {
          callback(void 0, lastError);
        });
      }
      function clearQueue() {
        queue.forEach((item) => {
          if (item.status === "pending") {
            item.status = "aborted";
          }
        });
        queue = [];
      }
      function moduleResponse(item, response, data) {
        const isError = response !== "success";
        queue = queue.filter((queued) => queued !== item);
        switch (status) {
          case "pending":
            break;
          case "failed":
            if (isError || !config.dataAfterTimeout) {
              return;
            }
            break;
          default:
            return;
        }
        if (response === "abort") {
          lastError = data;
          failQuery();
          return;
        }
        if (isError) {
          lastError = data;
          if (!queue.length) {
            if (!resources.length) {
              failQuery();
            } else {
              execNext();
            }
          }
          return;
        }
        resetTimer();
        clearQueue();
        if (!config.random) {
          const index = config.resources.indexOf(item.resource);
          if (index !== -1 && index !== config.index) {
            config.index = index;
          }
        }
        status = "completed";
        doneCallbacks.forEach((callback) => {
          callback(data);
        });
      }
      function execNext() {
        if (status !== "pending") {
          return;
        }
        resetTimer();
        const resource = resources.shift();
        if (resource === void 0) {
          if (queue.length) {
            timer = setTimeout(() => {
              resetTimer();
              if (status === "pending") {
                clearQueue();
                failQuery();
              }
            }, config.timeout);
            return;
          }
          failQuery();
          return;
        }
        const item = {
          status: "pending",
          resource,
          callback: (status2, data) => {
            moduleResponse(item, status2, data);
          }
        };
        queue.push(item);
        queriesSent++;
        timer = setTimeout(execNext, config.rotate);
        query(resource, payload, item.callback);
      }
      setTimeout(execNext);
      return getQueryStatus;
    }

    // src/index.ts
    function initRedundancy(cfg) {
      const config = {
        ...defaultConfig,
        ...cfg
      };
      let queries = [];
      function cleanup() {
        queries = queries.filter((item) => item().status === "pending");
      }
      function query(payload, queryCallback, doneCallback) {
        const query2 = sendQuery(
          config,
          payload,
          queryCallback,
          (data, error) => {
            cleanup();
            if (doneCallback) {
              doneCallback(data, error);
            }
          }
        );
        queries.push(query2);
        return query2;
      }
      function find(callback) {
        return queries.find((value) => {
          return callback(value);
        }) || null;
      }
      const instance = {
        query,
        find,
        setIndex: (index) => {
          config.index = index;
        },
        getIndex: () => config.index,
        cleanup
      };
      return instance;
    }

    function emptyCallback$1() {
    }
    const redundancyCache = /* @__PURE__ */ Object.create(null);
    function getRedundancyCache(provider) {
      if (!redundancyCache[provider]) {
        const config = getAPIConfig(provider);
        if (!config) {
          return;
        }
        const redundancy = initRedundancy(config);
        const cachedReundancy = {
          config,
          redundancy
        };
        redundancyCache[provider] = cachedReundancy;
      }
      return redundancyCache[provider];
    }
    function sendAPIQuery(target, query, callback) {
      let redundancy;
      let send;
      if (typeof target === "string") {
        const api = getAPIModule(target);
        if (!api) {
          callback(void 0, 424);
          return emptyCallback$1;
        }
        send = api.send;
        const cached = getRedundancyCache(target);
        if (cached) {
          redundancy = cached.redundancy;
        }
      } else {
        const config = createAPIConfig(target);
        if (config) {
          redundancy = initRedundancy(config);
          const moduleKey = target.resources ? target.resources[0] : "";
          const api = getAPIModule(moduleKey);
          if (api) {
            send = api.send;
          }
        }
      }
      if (!redundancy || !send) {
        callback(void 0, 424);
        return emptyCallback$1;
      }
      return redundancy.query(query, send, callback)().abort;
    }

    const browserCacheVersion = "iconify2";
    const browserCachePrefix = "iconify";
    const browserCacheCountKey = browserCachePrefix + "-count";
    const browserCacheVersionKey = browserCachePrefix + "-version";
    const browserStorageHour = 36e5;
    const browserStorageCacheExpiration = 168;

    function getStoredItem(func, key) {
      try {
        return func.getItem(key);
      } catch (err) {
      }
    }
    function setStoredItem(func, key, value) {
      try {
        func.setItem(key, value);
        return true;
      } catch (err) {
      }
    }
    function removeStoredItem(func, key) {
      try {
        func.removeItem(key);
      } catch (err) {
      }
    }

    function setBrowserStorageItemsCount(storage, value) {
      return setStoredItem(storage, browserCacheCountKey, value.toString());
    }
    function getBrowserStorageItemsCount(storage) {
      return parseInt(getStoredItem(storage, browserCacheCountKey)) || 0;
    }

    const browserStorageConfig = {
      local: true,
      session: true
    };
    const browserStorageEmptyItems = {
      local: /* @__PURE__ */ new Set(),
      session: /* @__PURE__ */ new Set()
    };
    let browserStorageStatus = false;
    function setBrowserStorageStatus(status) {
      browserStorageStatus = status;
    }

    let _window = typeof window === "undefined" ? {} : window;
    function getBrowserStorage(key) {
      const attr = key + "Storage";
      try {
        if (_window && _window[attr] && typeof _window[attr].length === "number") {
          return _window[attr];
        }
      } catch (err) {
      }
      browserStorageConfig[key] = false;
    }

    function iterateBrowserStorage(key, callback) {
      const func = getBrowserStorage(key);
      if (!func) {
        return;
      }
      const version = getStoredItem(func, browserCacheVersionKey);
      if (version !== browserCacheVersion) {
        if (version) {
          const total2 = getBrowserStorageItemsCount(func);
          for (let i = 0; i < total2; i++) {
            removeStoredItem(func, browserCachePrefix + i.toString());
          }
        }
        setStoredItem(func, browserCacheVersionKey, browserCacheVersion);
        setBrowserStorageItemsCount(func, 0);
        return;
      }
      const minTime = Math.floor(Date.now() / browserStorageHour) - browserStorageCacheExpiration;
      const parseItem = (index) => {
        const name = browserCachePrefix + index.toString();
        const item = getStoredItem(func, name);
        if (typeof item !== "string") {
          return;
        }
        try {
          const data = JSON.parse(item);
          if (typeof data === "object" && typeof data.cached === "number" && data.cached > minTime && typeof data.provider === "string" && typeof data.data === "object" && typeof data.data.prefix === "string" && // Valid item: run callback
          callback(data, index)) {
            return true;
          }
        } catch (err) {
        }
        removeStoredItem(func, name);
      };
      let total = getBrowserStorageItemsCount(func);
      for (let i = total - 1; i >= 0; i--) {
        if (!parseItem(i)) {
          if (i === total - 1) {
            total--;
            setBrowserStorageItemsCount(func, total);
          } else {
            browserStorageEmptyItems[key].add(i);
          }
        }
      }
    }

    function initBrowserStorage() {
      if (browserStorageStatus) {
        return;
      }
      setBrowserStorageStatus(true);
      for (const key in browserStorageConfig) {
        iterateBrowserStorage(key, (item) => {
          const iconSet = item.data;
          const provider = item.provider;
          const prefix = iconSet.prefix;
          const storage = getStorage(
            provider,
            prefix
          );
          if (!addIconSet(storage, iconSet).length) {
            return false;
          }
          const lastModified = iconSet.lastModified || -1;
          storage.lastModifiedCached = storage.lastModifiedCached ? Math.min(storage.lastModifiedCached, lastModified) : lastModified;
          return true;
        });
      }
    }

    function updateLastModified(storage, lastModified) {
      const lastValue = storage.lastModifiedCached;
      if (
        // Matches or newer
        lastValue && lastValue >= lastModified
      ) {
        return lastValue === lastModified;
      }
      storage.lastModifiedCached = lastModified;
      if (lastValue) {
        for (const key in browserStorageConfig) {
          iterateBrowserStorage(key, (item) => {
            const iconSet = item.data;
            return item.provider !== storage.provider || iconSet.prefix !== storage.prefix || iconSet.lastModified === lastModified;
          });
        }
      }
      return true;
    }
    function storeInBrowserStorage(storage, data) {
      if (!browserStorageStatus) {
        initBrowserStorage();
      }
      function store(key) {
        let func;
        if (!browserStorageConfig[key] || !(func = getBrowserStorage(key))) {
          return;
        }
        const set = browserStorageEmptyItems[key];
        let index;
        if (set.size) {
          set.delete(index = Array.from(set).shift());
        } else {
          index = getBrowserStorageItemsCount(func);
          if (!setBrowserStorageItemsCount(func, index + 1)) {
            return;
          }
        }
        const item = {
          cached: Math.floor(Date.now() / browserStorageHour),
          provider: storage.provider,
          data
        };
        return setStoredItem(
          func,
          browserCachePrefix + index.toString(),
          JSON.stringify(item)
        );
      }
      if (data.lastModified && !updateLastModified(storage, data.lastModified)) {
        return;
      }
      if (!Object.keys(data.icons).length) {
        return;
      }
      if (data.not_found) {
        data = Object.assign({}, data);
        delete data.not_found;
      }
      if (!store("local")) {
        store("session");
      }
    }

    function emptyCallback() {
    }
    function loadedNewIcons(storage) {
      if (!storage.iconsLoaderFlag) {
        storage.iconsLoaderFlag = true;
        setTimeout(() => {
          storage.iconsLoaderFlag = false;
          updateCallbacks(storage);
        });
      }
    }
    function loadNewIcons(storage, icons) {
      if (!storage.iconsToLoad) {
        storage.iconsToLoad = icons;
      } else {
        storage.iconsToLoad = storage.iconsToLoad.concat(icons).sort();
      }
      if (!storage.iconsQueueFlag) {
        storage.iconsQueueFlag = true;
        setTimeout(() => {
          storage.iconsQueueFlag = false;
          const { provider, prefix } = storage;
          const icons2 = storage.iconsToLoad;
          delete storage.iconsToLoad;
          let api;
          if (!icons2 || !(api = getAPIModule(provider))) {
            return;
          }
          const params = api.prepare(provider, prefix, icons2);
          params.forEach((item) => {
            sendAPIQuery(provider, item, (data) => {
              if (typeof data !== "object") {
                item.icons.forEach((name) => {
                  storage.missing.add(name);
                });
              } else {
                try {
                  const parsed = addIconSet(
                    storage,
                    data
                  );
                  if (!parsed.length) {
                    return;
                  }
                  const pending = storage.pendingIcons;
                  if (pending) {
                    parsed.forEach((name) => {
                      pending.delete(name);
                    });
                  }
                  storeInBrowserStorage(storage, data);
                } catch (err) {
                  console.error(err);
                }
              }
              loadedNewIcons(storage);
            });
          });
        });
      }
    }
    const loadIcons = (icons, callback) => {
      const cleanedIcons = listToIcons(icons, true, allowSimpleNames());
      const sortedIcons = sortIcons(cleanedIcons);
      if (!sortedIcons.pending.length) {
        let callCallback = true;
        if (callback) {
          setTimeout(() => {
            if (callCallback) {
              callback(
                sortedIcons.loaded,
                sortedIcons.missing,
                sortedIcons.pending,
                emptyCallback
              );
            }
          });
        }
        return () => {
          callCallback = false;
        };
      }
      const newIcons = /* @__PURE__ */ Object.create(null);
      const sources = [];
      let lastProvider, lastPrefix;
      sortedIcons.pending.forEach((icon) => {
        const { provider, prefix } = icon;
        if (prefix === lastPrefix && provider === lastProvider) {
          return;
        }
        lastProvider = provider;
        lastPrefix = prefix;
        sources.push(getStorage(provider, prefix));
        const providerNewIcons = newIcons[provider] || (newIcons[provider] = /* @__PURE__ */ Object.create(null));
        if (!providerNewIcons[prefix]) {
          providerNewIcons[prefix] = [];
        }
      });
      sortedIcons.pending.forEach((icon) => {
        const { provider, prefix, name } = icon;
        const storage = getStorage(provider, prefix);
        const pendingQueue = storage.pendingIcons || (storage.pendingIcons = /* @__PURE__ */ new Set());
        if (!pendingQueue.has(name)) {
          pendingQueue.add(name);
          newIcons[provider][prefix].push(name);
        }
      });
      sources.forEach((storage) => {
        const { provider, prefix } = storage;
        if (newIcons[provider][prefix].length) {
          loadNewIcons(storage, newIcons[provider][prefix]);
        }
      });
      return callback ? storeCallback(callback, sortedIcons, sources) : emptyCallback;
    };
    const loadIcon = (icon) => {
      return new Promise((fulfill, reject) => {
        const iconObj = typeof icon === "string" ? stringToIcon(icon, true) : icon;
        if (!iconObj) {
          reject(icon);
          return;
        }
        loadIcons([iconObj || icon], (loaded) => {
          if (loaded.length && iconObj) {
            const data = getIconData(iconObj);
            if (data) {
              fulfill({
                ...defaultIconProps,
                ...data
              });
              return;
            }
          }
          reject(icon);
        });
      });
    };

    function toggleBrowserCache(storage, value) {
      switch (storage) {
        case "local":
        case "session":
          browserStorageConfig[storage] = value;
          break;
        case "all":
          for (const key in browserStorageConfig) {
            browserStorageConfig[key] = value;
          }
          break;
      }
    }

    function mergeCustomisations(defaults, item) {
      const result = {
        ...defaults
      };
      for (const key in item) {
        const value = item[key];
        const valueType = typeof value;
        if (key in defaultIconSizeCustomisations) {
          if (value === null || value && (valueType === "string" || valueType === "number")) {
            result[key] = value;
          }
        } else if (valueType === typeof result[key]) {
          result[key] = key === "rotate" ? value % 4 : value;
        }
      }
      return result;
    }

    const separator = /[\s,]+/;
    function flipFromString(custom, flip) {
      flip.split(separator).forEach((str) => {
        const value = str.trim();
        switch (value) {
          case "horizontal":
            custom.hFlip = true;
            break;
          case "vertical":
            custom.vFlip = true;
            break;
        }
      });
    }

    function rotateFromString(value, defaultValue = 0) {
      const units = value.replace(/^-?[0-9.]*/, "");
      function cleanup(value2) {
        while (value2 < 0) {
          value2 += 4;
        }
        return value2 % 4;
      }
      if (units === "") {
        const num = parseInt(value);
        return isNaN(num) ? 0 : cleanup(num);
      } else if (units !== value) {
        let split = 0;
        switch (units) {
          case "%":
            split = 25;
            break;
          case "deg":
            split = 90;
        }
        if (split) {
          let num = parseFloat(value.slice(0, value.length - units.length));
          if (isNaN(num)) {
            return 0;
          }
          num = num / split;
          return num % 1 === 0 ? cleanup(num) : 0;
        }
      }
      return defaultValue;
    }

    function iconToHTML(body, attributes) {
      let renderAttribsHTML = body.indexOf("xlink:") === -1 ? "" : ' xmlns:xlink="http://www.w3.org/1999/xlink"';
      for (const attr in attributes) {
        renderAttribsHTML += " " + attr + '="' + attributes[attr] + '"';
      }
      return '<svg xmlns="http://www.w3.org/2000/svg"' + renderAttribsHTML + ">" + body + "</svg>";
    }

    function encodeSVGforURL(svg) {
      return svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E").replace(/\s+/g, " ");
    }
    function svgToData(svg) {
      return "data:image/svg+xml," + encodeSVGforURL(svg);
    }
    function svgToURL(svg) {
      return 'url("' + svgToData(svg) + '")';
    }

    const defaultExtendedIconCustomisations = {
        ...defaultIconCustomisations,
        inline: false,
    };

    /**
     * Default SVG attributes
     */
    const svgDefaults = {
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'aria-hidden': true,
        'role': 'img',
    };
    /**
     * Style modes
     */
    const commonProps = {
        display: 'inline-block',
    };
    const monotoneProps = {
        'background-color': 'currentColor',
    };
    const coloredProps = {
        'background-color': 'transparent',
    };
    // Dynamically add common props to variables above
    const propsToAdd = {
        image: 'var(--svg)',
        repeat: 'no-repeat',
        size: '100% 100%',
    };
    const propsToAddTo = {
        '-webkit-mask': monotoneProps,
        'mask': monotoneProps,
        'background': coloredProps,
    };
    for (const prefix in propsToAddTo) {
        const list = propsToAddTo[prefix];
        for (const prop in propsToAdd) {
            list[prefix + '-' + prop] = propsToAdd[prop];
        }
    }
    /**
     * Fix size: add 'px' to numbers
     */
    function fixSize(value) {
        return value + (value.match(/^[-0-9.]+$/) ? 'px' : '');
    }
    /**
     * Generate icon from properties
     */
    function render(
    // Icon must be validated before calling this function
    icon, 
    // Properties
    props) {
        const customisations = mergeCustomisations(defaultExtendedIconCustomisations, props);
        // Check mode
        const mode = props.mode || 'svg';
        const componentProps = (mode === 'svg' ? { ...svgDefaults } : {});
        if (icon.body.indexOf('xlink:') === -1) {
            delete componentProps['xmlns:xlink'];
        }
        // Create style if missing
        let style = typeof props.style === 'string' ? props.style : '';
        // Get element properties
        for (let key in props) {
            const value = props[key];
            if (value === void 0) {
                continue;
            }
            switch (key) {
                // Properties to ignore
                case 'icon':
                case 'style':
                case 'onLoad':
                case 'mode':
                    break;
                // Boolean attributes
                case 'inline':
                case 'hFlip':
                case 'vFlip':
                    customisations[key] =
                        value === true || value === 'true' || value === 1;
                    break;
                // Flip as string: 'horizontal,vertical'
                case 'flip':
                    if (typeof value === 'string') {
                        flipFromString(customisations, value);
                    }
                    break;
                // Color: copy to style, add extra ';' in case style is missing it
                case 'color':
                    style =
                        style +
                            (style.length > 0 && style.trim().slice(-1) !== ';'
                                ? ';'
                                : '') +
                            'color: ' +
                            value +
                            '; ';
                    break;
                // Rotation as string
                case 'rotate':
                    if (typeof value === 'string') {
                        customisations[key] = rotateFromString(value);
                    }
                    else if (typeof value === 'number') {
                        customisations[key] = value;
                    }
                    break;
                // Remove aria-hidden
                case 'ariaHidden':
                case 'aria-hidden':
                    if (value !== true && value !== 'true') {
                        delete componentProps['aria-hidden'];
                    }
                    break;
                default:
                    if (key.slice(0, 3) === 'on:') {
                        // Svelte event
                        break;
                    }
                    // Copy missing property if it does not exist in customisations
                    if (defaultExtendedIconCustomisations[key] === void 0) {
                        componentProps[key] = value;
                    }
            }
        }
        // Generate icon
        const item = iconToSVG(icon, customisations);
        const renderAttribs = item.attributes;
        // Inline display
        if (customisations.inline) {
            // Style overrides it
            style = 'vertical-align: -0.125em; ' + style;
        }
        if (mode === 'svg') {
            // Add icon stuff
            Object.assign(componentProps, renderAttribs);
            // Style
            if (style !== '') {
                componentProps.style = style;
            }
            // Counter for ids based on "id" property to render icons consistently on server and client
            let localCounter = 0;
            let id = props.id;
            if (typeof id === 'string') {
                // Convert '-' to '_' to avoid errors in animations
                id = id.replace(/-/g, '_');
            }
            // Generate HTML
            return {
                svg: true,
                attributes: componentProps,
                body: replaceIDs(item.body, id ? () => id + 'ID' + localCounter++ : 'iconifySvelte'),
            };
        }
        // Render <span> with style
        const { body, width, height } = icon;
        const useMask = mode === 'mask' ||
            (mode === 'bg' ? false : body.indexOf('currentColor') !== -1);
        // Generate SVG
        const html = iconToHTML(body, {
            ...renderAttribs,
            width: width + '',
            height: height + '',
        });
        // Generate style
        const url = svgToURL(html);
        const styles = {
            '--svg': url,
        };
        const size = (prop) => {
            const value = renderAttribs[prop];
            if (value) {
                styles[prop] = fixSize(value);
            }
        };
        size('width');
        size('height');
        Object.assign(styles, commonProps, useMask ? monotoneProps : coloredProps);
        let customStyle = '';
        for (const key in styles) {
            customStyle += key + ': ' + styles[key] + ';';
        }
        componentProps.style = customStyle + style;
        return {
            svg: false,
            attributes: componentProps,
        };
    }

    /**
     * Enable cache
     */
    function enableCache(storage) {
        toggleBrowserCache(storage, true);
    }
    /**
     * Disable cache
     */
    function disableCache(storage) {
        toggleBrowserCache(storage, false);
    }
    /**
     * Initialise stuff
     */
    // Enable short names
    allowSimpleNames(true);
    // Set API module
    setAPIModule('', fetchAPIModule);
    /**
     * Browser stuff
     */
    if (typeof document !== 'undefined' && typeof window !== 'undefined') {
        // Set cache and load existing cache
        initBrowserStorage();
        const _window = window;
        // Load icons from global "IconifyPreload"
        if (_window.IconifyPreload !== void 0) {
            const preload = _window.IconifyPreload;
            const err = 'Invalid IconifyPreload syntax.';
            if (typeof preload === 'object' && preload !== null) {
                (preload instanceof Array ? preload : [preload]).forEach((item) => {
                    try {
                        if (
                        // Check if item is an object and not null/array
                        typeof item !== 'object' ||
                            item === null ||
                            item instanceof Array ||
                            // Check for 'icons' and 'prefix'
                            typeof item.icons !== 'object' ||
                            typeof item.prefix !== 'string' ||
                            // Add icon set
                            !addCollection(item)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                });
            }
        }
        // Set API from global "IconifyProviders"
        if (_window.IconifyProviders !== void 0) {
            const providers = _window.IconifyProviders;
            if (typeof providers === 'object' && providers !== null) {
                for (let key in providers) {
                    const err = 'IconifyProviders[' + key + '] is invalid.';
                    try {
                        const value = providers[key];
                        if (typeof value !== 'object' ||
                            !value ||
                            value.resources === void 0) {
                            continue;
                        }
                        if (!addAPIProvider(key, value)) {
                            console.error(err);
                        }
                    }
                    catch (e) {
                        console.error(err);
                    }
                }
            }
        }
    }
    /**
     * Check if component needs to be updated
     */
    function checkIconState(icon, state, mounted, callback, onload) {
        // Abort loading icon
        function abortLoading() {
            if (state.loading) {
                state.loading.abort();
                state.loading = null;
            }
        }
        // Icon is an object
        if (typeof icon === 'object' &&
            icon !== null &&
            typeof icon.body === 'string') {
            // Stop loading
            state.name = '';
            abortLoading();
            return { data: { ...defaultIconProps, ...icon } };
        }
        // Invalid icon?
        let iconName;
        if (typeof icon !== 'string' ||
            (iconName = stringToIcon(icon, false, true)) === null) {
            abortLoading();
            return null;
        }
        // Load icon
        const data = getIconData(iconName);
        if (!data) {
            // Icon data is not available
            // Do not load icon until component is mounted
            if (mounted && (!state.loading || state.loading.name !== icon)) {
                // New icon to load
                abortLoading();
                state.name = '';
                state.loading = {
                    name: icon,
                    abort: loadIcons([iconName], callback),
                };
            }
            return null;
        }
        // Icon data is available
        abortLoading();
        if (state.name !== icon) {
            state.name = icon;
            if (onload && !state.destroyed) {
                onload(icon);
            }
        }
        // Add classes
        const classes = ['iconify'];
        if (iconName.prefix !== '') {
            classes.push('iconify--' + iconName.prefix);
        }
        if (iconName.provider !== '') {
            classes.push('iconify--' + iconName.provider);
        }
        return { data, classes };
    }
    /**
     * Generate icon
     */
    function generateIcon(icon, props) {
        return icon
            ? render({
                ...defaultIconProps,
                ...icon,
            }, props)
            : null;
    }
    /**
     * Internal API
     */
    const _api = {
        getAPIConfig,
        setAPIModule,
        sendAPIQuery,
        setFetch,
        getFetch,
        listAPIProviders,
    };

    /* node_modules\@iconify\svelte\dist\Icon.svelte generated by Svelte v3.44.1 */
    const file$1 = "node_modules\\@iconify\\svelte\\dist\\Icon.svelte";

    // (108:0) {#if data}
    function create_if_block(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*data*/ ctx[0].svg) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(108:0) {#if data}",
    		ctx
    	});

    	return block;
    }

    // (113:1) {:else}
    function create_else_block(ctx) {
    	let span;
    	let span_levels = [/*data*/ ctx[0].attributes];
    	let span_data = {};

    	for (let i = 0; i < span_levels.length; i += 1) {
    		span_data = assign(span_data, span_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			set_attributes(span, span_data);
    			add_location(span, file$1, 113, 2, 2001);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: function update(ctx, dirty) {
    			set_attributes(span, span_data = get_spread_update(span_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(113:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (109:1) {#if data.svg}
    function create_if_block_1(ctx) {
    	let svg;
    	let raw_value = /*data*/ ctx[0].body + "";
    	let svg_levels = [/*data*/ ctx[0].attributes];
    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			set_svg_attributes(svg, svg_data);
    			add_location(svg, file$1, 109, 2, 1933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			svg.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 1 && raw_value !== (raw_value = /*data*/ ctx[0].body + "")) svg.innerHTML = raw_value;			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [dirty & /*data*/ 1 && /*data*/ ctx[0].attributes]));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(109:1) {#if data.svg}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let if_block = /*data*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*data*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);

    	const state = {
    		// Last icon name
    		name: '',
    		// Loading status
    		loading: null,
    		// Destroyed status
    		destroyed: false
    	};

    	// Mounted status
    	let mounted = false;

    	// Callback counter
    	let counter = 0;

    	// Generated data
    	let data;

    	const onLoad = icon => {
    		// Legacy onLoad property
    		if (typeof $$props.onLoad === 'function') {
    			$$props.onLoad(icon);
    		}

    		// on:load event
    		const dispatch = createEventDispatcher();

    		dispatch('load', { icon });
    	};

    	// Increase counter when loaded to force re-calculation of data
    	function loaded() {
    		$$invalidate(3, counter++, counter);
    	}

    	// Force re-render
    	onMount(() => {
    		$$invalidate(2, mounted = true);
    	});

    	// Abort loading when component is destroyed
    	onDestroy(() => {
    		$$invalidate(1, state.destroyed = true, state);

    		if (state.loading) {
    			state.loading.abort();
    			$$invalidate(1, state.loading = null, state);
    		}
    	});

    	$$self.$$set = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({
    		enableCache,
    		disableCache,
    		iconExists,
    		getIcon,
    		listIcons,
    		addIcon,
    		addCollection,
    		calculateSize,
    		replaceIDs,
    		buildIcon: iconToSVG,
    		loadIcons,
    		loadIcon,
    		addAPIProvider,
    		_api,
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		checkIconState,
    		generateIcon,
    		state,
    		mounted,
    		counter,
    		data,
    		onLoad,
    		loaded
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(6, $$props = assign(assign({}, $$props), $$new_props));
    		if ('mounted' in $$props) $$invalidate(2, mounted = $$new_props.mounted);
    		if ('counter' in $$props) $$invalidate(3, counter = $$new_props.counter);
    		if ('data' in $$props) $$invalidate(0, data = $$new_props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 {
    			const iconData = checkIconState($$props.icon, state, mounted, loaded, onLoad);
    			$$invalidate(0, data = iconData ? generateIcon(iconData.data, $$props) : null);

    			if (data && iconData.classes) {
    				// Add classes
    				$$invalidate(
    					0,
    					data.attributes['class'] = (typeof $$props['class'] === 'string'
    					? $$props['class'] + ' '
    					: '') + iconData.classes.join(' '),
    					data
    				);
    			}
    		}
    	};

    	$$props = exclude_internal_props($$props);
    	return [data, state, mounted, counter];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\layout\UHCFooter.svelte generated by Svelte v3.44.1 */
    const file$2 = "src\\layout\\UHCFooter.svelte";

    function create_fragment$2(ctx) {
    	let footer;
    	let div13;
    	let div11;
    	let div2;
    	let a0;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let ul;
    	let li0;
    	let a1;
    	let t1;
    	let t2;
    	let li1;
    	let a2;
    	let t3;
    	let t4;
    	let div10;
    	let t5;
    	let div9;
    	let a3;
    	let div3;
    	let icon0;
    	let t6;
    	let a4;
    	let div4;
    	let icon1;
    	let t7;
    	let a5;
    	let div5;
    	let icon2;
    	let t8;
    	let a6;
    	let div6;
    	let icon3;
    	let t9;
    	let a7;
    	let div7;
    	let icon4;
    	let t10;
    	let a8;
    	let div8;
    	let icon5;
    	let t11;
    	let hr;
    	let t12;
    	let div12;
    	let t13;
    	let a9;
    	let t14;
    	let t15;
    	let a10;
    	let t16;
    	let t17;
    	let current;

    	icon0 = new Icon({
    			props: { icon: "mdi:github" },
    			$$inline: true
    		});

    	icon1 = new Icon({
    			props: { icon: "il:facebook" },
    			$$inline: true
    		});

    	icon2 = new Icon({
    			props: { icon: "mdi:twitter" },
    			$$inline: true
    		});

    	icon3 = new Icon({
    			props: { icon: "mdi:instagram" },
    			$$inline: true
    		});

    	icon4 = new Icon({
    			props: { icon: "mdi:youtube" },
    			$$inline: true
    		});

    	icon5 = new Icon({
    			props: { icon: "mdi:linkedin" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div13 = element("div");
    			div11 = element("div");
    			div2 = element("div");
    			a0 = element("a");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a1 = element("a");
    			t1 = text("Contact us");
    			t2 = space();
    			li1 = element("li");
    			a2 = element("a");
    			t3 = text("Privacy and legal");
    			t4 = space();
    			div10 = element("div");
    			t5 = text("Follow UHC:\r\n        ");
    			div9 = element("div");
    			a3 = element("a");
    			div3 = element("div");
    			create_component(icon0.$$.fragment);
    			t6 = space();
    			a4 = element("a");
    			div4 = element("div");
    			create_component(icon1.$$.fragment);
    			t7 = space();
    			a5 = element("a");
    			div5 = element("div");
    			create_component(icon2.$$.fragment);
    			t8 = space();
    			a6 = element("a");
    			div6 = element("div");
    			create_component(icon3.$$.fragment);
    			t9 = space();
    			a7 = element("a");
    			div7 = element("div");
    			create_component(icon4.$$.fragment);
    			t10 = space();
    			a8 = element("a");
    			div8 = element("div");
    			create_component(icon5.$$.fragment);
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			div12 = element("div");
    			t13 = text("This template was forked and modified from the ");
    			a9 = element("a");
    			t14 = text("UK Office of National Statistics");
    			t15 = text(". All content is available under the\r\n      ");
    			a10 = element("a");
    			t16 = text("MIT License");
    			t17 = text(", except where otherwise stated");
    			attr_dev(img, "id", "my-svg");
    			if (!src_url_equal(img.src, img_src_value = "./img/uhc-primary-blue_black.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Drexel Urban Health Collaborative");
    			attr_dev(img, "class", "svelte-jjyrck");
    			add_location(img, file$2, 17, 12, 492);
    			attr_dev(div0, "id", "svg-container");
    			attr_dev(div0, "class", "svelte-jjyrck");
    			add_location(div0, file$2, 16, 10, 454);
    			attr_dev(a0, "href", "https://drexel.edu/uhc/");
    			attr_dev(a0, "class", "svelte-jjyrck");
    			add_location(a0, file$2, 15, 8, 408);
    			attr_dev(a1, "href", "https://drexel.edu/uhc/about/contact/");
    			attr_dev(a1, "class", "link svelte-jjyrck");
    			set_style(a1, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a1, file$2, 27, 14, 763);
    			attr_dev(li0, "class", "svelte-jjyrck");
    			add_location(li0, file$2, 26, 12, 743);
    			attr_dev(a2, "href", "https://drexel.edu/privacy");
    			attr_dev(a2, "class", "link svelte-jjyrck");
    			set_style(a2, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a2, file$2, 35, 14, 999);
    			attr_dev(li1, "class", "svelte-jjyrck");
    			add_location(li1, file$2, 34, 12, 979);
    			attr_dev(ul, "class", "svelte-jjyrck");
    			add_location(ul, file$2, 25, 10, 725);
    			attr_dev(div1, "class", "link-tree svelte-jjyrck");
    			add_location(div1, file$2, 24, 8, 690);
    			attr_dev(div2, "class", "item svelte-jjyrck");
    			add_location(div2, file$2, 14, 6, 380);
    			attr_dev(div3, "class", "social-icon svelte-jjyrck");
    			add_location(div3, file$2, 48, 12, 1404);
    			attr_dev(a3, "href", "https://github.com/Drexel-UHC");
    			add_location(a3, file$2, 47, 10, 1350);
    			attr_dev(div4, "class", "social-icon svelte-jjyrck");
    			add_location(div4, file$2, 51, 12, 1549);
    			attr_dev(a4, "href", "https://www.facebook.com/DrexelUHC/");
    			add_location(a4, file$2, 50, 10, 1489);
    			attr_dev(div5, "class", "social-icon svelte-jjyrck");
    			add_location(div5, file$2, 54, 12, 1689);
    			attr_dev(a5, "href", "https://twitter.com/drexeluhc");
    			add_location(a5, file$2, 53, 10, 1635);
    			attr_dev(div6, "class", "social-icon svelte-jjyrck");
    			add_location(div6, file$2, 57, 12, 1835);
    			attr_dev(a6, "href", "https://www.instagram.com/drexeluhc");
    			add_location(a6, file$2, 56, 10, 1775);
    			attr_dev(div7, "class", "social-icon svelte-jjyrck");
    			add_location(div7, file$2, 60, 12, 2001);
    			attr_dev(a7, "href", "https://www.youtube.com/@urbanhealthcollaborative8928");
    			add_location(a7, file$2, 59, 10, 1923);
    			attr_dev(div8, "class", "social-icon svelte-jjyrck");
    			add_location(div8, file$2, 65, 12, 2204);
    			attr_dev(a8, "href", "https://www.linkedin.com/company/drexel-urban-health-collaborative/");
    			add_location(a8, file$2, 62, 10, 2087);
    			attr_dev(div9, "class", "container svelte-jjyrck");
    			add_location(div9, file$2, 46, 8, 1315);
    			attr_dev(div10, "class", "item svelte-jjyrck");
    			attr_dev(div10, "id", "follow-uhc");
    			add_location(div10, file$2, 44, 6, 1250);
    			attr_dev(div11, "class", "container svelte-jjyrck");
    			add_location(div11, file$2, 13, 4, 349);
    			set_style(hr, "border-top-color", themes[/*theme*/ ctx[0]]['muted']);
    			attr_dev(hr, "class", "svelte-jjyrck");
    			add_location(hr, file$2, 70, 4, 2327);
    			attr_dev(a9, "href", "https://github.com/ONSvisual/svelte-scrolly");
    			attr_dev(a9, "class", "link svelte-jjyrck");
    			attr_dev(a9, "target", "_blank");
    			attr_dev(a9, "rel", "noopener");
    			set_style(a9, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a9, file$2, 72, 53, 2466);
    			attr_dev(a10, "href", "https://opensource.org/licenses/MIT");
    			attr_dev(a10, "class", "link svelte-jjyrck");
    			attr_dev(a10, "target", "_blank");
    			attr_dev(a10, "rel", "noopener");
    			set_style(a10, "color", themes[/*theme*/ ctx[0]]['text']);
    			add_location(a10, file$2, 80, 6, 2746);
    			attr_dev(div12, "class", "license svelte-jjyrck");
    			add_location(div12, file$2, 71, 4, 2390);
    			attr_dev(div13, "class", "col-wide");
    			attr_dev(div13, "data-analytics", "footer");
    			add_location(div13, file$2, 12, 2, 297);
    			set_style(footer, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(footer, "background-color", themes[/*theme*/ ctx[0]]['pale']);
    			attr_dev(footer, "class", "svelte-jjyrck");
    			add_location(footer, file$2, 7, 0, 187);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div13);
    			append_dev(div13, div11);
    			append_dev(div11, div2);
    			append_dev(div2, a0);
    			append_dev(a0, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a1);
    			append_dev(a1, t1);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a2);
    			append_dev(a2, t3);
    			append_dev(div11, t4);
    			append_dev(div11, div10);
    			append_dev(div10, t5);
    			append_dev(div10, div9);
    			append_dev(div9, a3);
    			append_dev(a3, div3);
    			mount_component(icon0, div3, null);
    			append_dev(div9, t6);
    			append_dev(div9, a4);
    			append_dev(a4, div4);
    			mount_component(icon1, div4, null);
    			append_dev(div9, t7);
    			append_dev(div9, a5);
    			append_dev(a5, div5);
    			mount_component(icon2, div5, null);
    			append_dev(div9, t8);
    			append_dev(div9, a6);
    			append_dev(a6, div6);
    			mount_component(icon3, div6, null);
    			append_dev(div9, t9);
    			append_dev(div9, a7);
    			append_dev(a7, div7);
    			mount_component(icon4, div7, null);
    			append_dev(div9, t10);
    			append_dev(div9, a8);
    			append_dev(a8, div8);
    			mount_component(icon5, div8, null);
    			append_dev(div13, t11);
    			append_dev(div13, hr);
    			append_dev(div13, t12);
    			append_dev(div13, div12);
    			append_dev(div12, t13);
    			append_dev(div12, a9);
    			append_dev(a9, t14);
    			append_dev(div12, t15);
    			append_dev(div12, a10);
    			append_dev(a10, t16);
    			append_dev(div12, t17);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a1, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a2, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(hr, "border-top-color", themes[/*theme*/ ctx[0]]['muted']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a9, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(a10, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(footer, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(footer, "background-color", themes[/*theme*/ ctx[0]]['pale']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon0.$$.fragment, local);
    			transition_in(icon1.$$.fragment, local);
    			transition_in(icon2.$$.fragment, local);
    			transition_in(icon3.$$.fragment, local);
    			transition_in(icon4.$$.fragment, local);
    			transition_in(icon5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon0.$$.fragment, local);
    			transition_out(icon1.$$.fragment, local);
    			transition_out(icon2.$$.fragment, local);
    			transition_out(icon3.$$.fragment, local);
    			transition_out(icon4.$$.fragment, local);
    			transition_out(icon5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    			destroy_component(icon0);
    			destroy_component(icon1);
    			destroy_component(icon2);
    			destroy_component(icon3);
    			destroy_component(icon4);
    			destroy_component(icon5);
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
    	validate_slots('UHCFooter', slots, []);
    	let { theme = getContext('theme') } = $$props;
    	const writable_props = ['theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<UHCFooter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, Icon, theme });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme];
    }

    class UHCFooter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "UHCFooter",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get theme() {
    		throw new Error("<UHCFooter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<UHCFooter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Header.svelte generated by Svelte v3.44.1 */
    const file$3 = "src\\layout\\Header.svelte";

    function create_fragment$3(ctx) {
    	let header;
    	let div1;
    	let div0;
    	let header_style_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[8].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			toggle_class(div0, "center", /*center*/ ctx[2]);
    			add_location(div0, file$3, 36, 4, 816);
    			attr_dev(div1, "class", "v-padded col-wide middle svelte-14xpfcj");
    			set_style(div1, "position", "relative");
    			toggle_class(div1, "short", /*short*/ ctx[3]);
    			toggle_class(div1, "height-full", !/*short*/ ctx[3]);
    			add_location(div1, file$3, 30, 2, 682);

    			attr_dev(header, "style", header_style_value = "color: " + themes[/*theme*/ ctx[0]]['text'] + "; background-color: " + (/*bgcolor*/ ctx[1]
    			? /*bgcolor*/ ctx[1]
    			: themes[/*theme*/ ctx[0]]['background']) + "; " + /*style*/ ctx[4]);

    			attr_dev(header, "class", "svelte-14xpfcj");
    			toggle_class(header, "short", /*short*/ ctx[3]);
    			add_location(header, file$3, 24, 0, 523);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 128)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[7],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[7])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*center*/ 4) {
    				toggle_class(div0, "center", /*center*/ ctx[2]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div1, "short", /*short*/ ctx[3]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div1, "height-full", !/*short*/ ctx[3]);
    			}

    			if (!current || dirty & /*theme, bgcolor, style*/ 19 && header_style_value !== (header_style_value = "color: " + themes[/*theme*/ ctx[0]]['text'] + "; background-color: " + (/*bgcolor*/ ctx[1]
    			? /*bgcolor*/ ctx[1]
    			: themes[/*theme*/ ctx[0]]['background']) + "; " + /*style*/ ctx[4])) {
    				attr_dev(header, "style", header_style_value);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(header, "short", /*short*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('Header', slots, ['default']);
    	let { theme = getContext('theme') } = $$props;
    	let { bgimage = null } = $$props;
    	let { bgcolor = null } = $$props;
    	let { bgfixed = false } = $$props;
    	let { center = true } = $$props;
    	let { short = false } = $$props;
    	let style = '';

    	if (bgimage) {
    		style += `background-image: url(${bgimage});`;
    	} else {
    		style += 'background-image: none;';
    	}

    	if (bgfixed) {
    		style += ' background-attachment: fixed;';
    	}

    	const writable_props = ['theme', 'bgimage', 'bgcolor', 'bgfixed', 'center', 'short'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('bgimage' in $$props) $$invalidate(5, bgimage = $$props.bgimage);
    		if ('bgcolor' in $$props) $$invalidate(1, bgcolor = $$props.bgcolor);
    		if ('bgfixed' in $$props) $$invalidate(6, bgfixed = $$props.bgfixed);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    		if ('$$scope' in $$props) $$invalidate(7, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		getContext,
    		theme,
    		bgimage,
    		bgcolor,
    		bgfixed,
    		center,
    		short,
    		style
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('bgimage' in $$props) $$invalidate(5, bgimage = $$props.bgimage);
    		if ('bgcolor' in $$props) $$invalidate(1, bgcolor = $$props.bgcolor);
    		if ('bgfixed' in $$props) $$invalidate(6, bgfixed = $$props.bgfixed);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    		if ('style' in $$props) $$invalidate(4, style = $$props.style);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, bgcolor, center, short, style, bgimage, bgfixed, $$scope, slots];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			theme: 0,
    			bgimage: 5,
    			bgcolor: 1,
    			bgfixed: 6,
    			center: 2,
    			short: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get theme() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgimage() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgimage(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgcolor() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgcolor(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgfixed() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgfixed(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get short() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set short(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Section.svelte generated by Svelte v3.44.1 */
    const file$4 = "src\\layout\\Section.svelte";

    function create_fragment$4(ctx) {
    	let section;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "col-medium");
    			add_location(div, file$4, 8, 1, 247);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(section, file$4, 7, 0, 147);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
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
    	validate_slots('Section', slots, ['default']);
    	let { theme = getContext('theme') } = $$props;
    	const writable_props = ['theme'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { theme: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get theme() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /**
     * Returns a function, that, as long as it continues to be invoked, will not
     * be triggered. The function will be called after it stops being called for
     * N milliseconds. If `immediate` is passed, trigger the function on the
     * leading edge, instead of the trailing. The function also has a property 'clear' 
     * that is a function which will clear the timer to prevent previously scheduled executions. 
     *
     * @source underscore.js
     * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
     * @param {Function} function to wrap
     * @param {Number} timeout in ms (`100`)
     * @param {Boolean} whether to execute at the beginning (`false`)
     * @api public
     */
    function debounce(func, wait, immediate){
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      }
      var debounced = function(){
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };

      debounced.clear = function() {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };
      
      debounced.flush = function() {
        if (timeout) {
          result = func.apply(context, args);
          context = args = null;
          
          clearTimeout(timeout);
          timeout = null;
        }
      };

      return debounced;
    }
    // Adds compatibility for ES modules
    debounce.debounce = debounce;

    var debounce_1 = debounce;

    /* src\layout\Media.svelte generated by Svelte v3.44.1 */
    const file$5 = "src\\layout\\Media.svelte";

    // (95:0) {:else}
    function create_else_block$1(ctx) {
    	let figure;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", div0_class_value = "grid" + /*gridClass*/ ctx[5] + " svelte-15qq8ff");
    			set_style(div0, "grid-gap", /*gridGap*/ ctx[8]);
    			set_style(div0, "min-height", /*rowHeight*/ ctx[7]);
    			add_location(div0, file$5, 97, 2, 2518);
    			attr_dev(div1, "class", div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff");
    			add_location(div1, file$5, 96, 1, 2491);
    			set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(figure, file$5, 95, 0, 2391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*col*/ 2 && div1_class_value !== (div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(95:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (87:0) {#if nogrid}
    function create_if_block_1$1(ctx) {
    	let figure;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let div1_class_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);

    	const block = {
    		c: function create() {
    			figure = element("figure");
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "class", "grid-ms svelte-15qq8ff");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[15].call(div0));
    			add_location(div0, file$5, 89, 2, 2267);
    			attr_dev(div1, "class", div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff");
    			add_location(div1, file$5, 88, 1, 2240);
    			set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(figure, file$5, 87, 0, 2140);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, figure, anchor);
    			append_dev(figure, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[14](div0);
    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[15].bind(div0));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[12],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*col*/ 2 && div1_class_value !== (div1_class_value = "col-" + /*col*/ ctx[1] + " svelte-15qq8ff")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(figure, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(figure);
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[14](null);
    			div0_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(87:0) {#if nogrid}",
    		ctx
    	});

    	return block;
    }

    // (104:0) {#if caption}
    function create_if_block$1(ctx) {
    	let caption_1;
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			caption_1 = element("caption");
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "caption");
    			add_location(div0, file$5, 106, 3, 2805);
    			attr_dev(div1, "class", "col-medium");
    			add_location(div1, file$5, 105, 2, 2776);
    			set_style(caption_1, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(caption_1, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(caption_1, file$5, 104, 1, 2674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, caption_1, anchor);
    			append_dev(caption_1, div1);
    			append_dev(div1, div0);
    			div0.innerHTML = /*caption*/ ctx[2];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*caption*/ 4) div0.innerHTML = /*caption*/ ctx[2];
    			if (dirty & /*theme*/ 1) {
    				set_style(caption_1, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(caption_1, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(caption_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(104:0) {#if caption}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let current_block_type_index;
    	let if_block0;
    	let t;
    	let if_block1_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*nogrid*/ ctx[6]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*caption*/ ctx[2] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if_block0.p(ctx, dirty);

    			if (/*caption*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
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
    	validate_slots('Media', slots, ['default']);
    	const colWidths = { narrow: 200, medium: 300, wide: 500 };
    	let { theme = getContext("theme") } = $$props;
    	let { col = "medium" } = $$props;
    	let { grid = null } = $$props;
    	let { caption = null } = $$props;
    	let { height = 200 } = $$props;
    	let { gap = 12 } = $$props;
    	let gridClass = grid ? ` grid-${grid}` : '';
    	let nogrid = !("grid-gap" in document.body.style);
    	let rowHeight = !Number.isNaN(height) ? height + "px" : height;
    	let gridGap = !Number.isNaN(gap) ? gap + "px" : gap;

    	// The code below this point mimics CSS Grid functionality in IE 11
    	const minWidth = grid && colWidths[grid] ? colWidths[grid] : null;

    	let gridWidth;
    	let cols;
    	let el;
    	let divs;
    	let count;

    	if (nogrid) {
    		onMount(() => {
    			resize();
    		});
    	}

    	const update = debounce_1.debounce(resize, 200);

    	function resize() {
    		if (el && !divs) {
    			let arr = [];
    			let children = el.childNodes;

    			children.forEach(child => {
    				if (child.nodeName == "DIV") {
    					arr.push(child);
    				}
    			});

    			divs = arr;
    		}

    		count = divs.length;

    		cols = !minWidth || gridWidth <= minWidth
    		? 1
    		: Math.floor(gridWidth / minWidth);

    		makeCols();
    	}

    	function makeCols() {
    		let r = Math.ceil(count / cols) > 1
    		? `-ms-grid-rows: 1fr (${gap}px 1fr)[${Math.ceil(count / cols) - 1}]; grid-template-rows: 1fr repeat(${Math.ceil(count / cols) - 1}, ${gap}px 1fr);`
    		: `-ms-grid-rows: 1fr; grid-template-rows: 1fr;`;

    		let c = cols > 1
    		? `-ms-grid-columns: 1fr (${gap}px 1fr)[${cols - 1}]; grid-template-columns: 1fr repeat(${cols - 1}, ${gap}px 1fr);`
    		: "";

    		$$invalidate(4, el.style.cssText = r + c, el);

    		divs.forEach((div, i) => {
    			let col = i % cols * 2 + 1;
    			let row = Math.floor(i / cols) * 2 + 1;
    			div.style.cssText = `-ms-grid-column: ${col}; -ms-grid-row: ${row}; grid-column: ${col}; grid-row: ${row}; min-height: ${rowHeight};`;
    		});
    	}

    	const writable_props = ['theme', 'col', 'grid', 'caption', 'height', 'gap'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Media> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			el = $$value;
    			$$invalidate(4, el);
    		});
    	}

    	function div0_elementresize_handler() {
    		gridWidth = this.clientWidth;
    		$$invalidate(3, gridWidth);
    	}

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('col' in $$props) $$invalidate(1, col = $$props.col);
    		if ('grid' in $$props) $$invalidate(9, grid = $$props.grid);
    		if ('caption' in $$props) $$invalidate(2, caption = $$props.caption);
    		if ('height' in $$props) $$invalidate(10, height = $$props.height);
    		if ('gap' in $$props) $$invalidate(11, gap = $$props.gap);
    		if ('$$scope' in $$props) $$invalidate(12, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		onMount,
    		getContext,
    		debounce: debounce_1.debounce,
    		colWidths,
    		theme,
    		col,
    		grid,
    		caption,
    		height,
    		gap,
    		gridClass,
    		nogrid,
    		rowHeight,
    		gridGap,
    		minWidth,
    		gridWidth,
    		cols,
    		el,
    		divs,
    		count,
    		update,
    		resize,
    		makeCols
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('col' in $$props) $$invalidate(1, col = $$props.col);
    		if ('grid' in $$props) $$invalidate(9, grid = $$props.grid);
    		if ('caption' in $$props) $$invalidate(2, caption = $$props.caption);
    		if ('height' in $$props) $$invalidate(10, height = $$props.height);
    		if ('gap' in $$props) $$invalidate(11, gap = $$props.gap);
    		if ('gridClass' in $$props) $$invalidate(5, gridClass = $$props.gridClass);
    		if ('nogrid' in $$props) $$invalidate(6, nogrid = $$props.nogrid);
    		if ('rowHeight' in $$props) $$invalidate(7, rowHeight = $$props.rowHeight);
    		if ('gridGap' in $$props) $$invalidate(8, gridGap = $$props.gridGap);
    		if ('gridWidth' in $$props) $$invalidate(3, gridWidth = $$props.gridWidth);
    		if ('cols' in $$props) cols = $$props.cols;
    		if ('el' in $$props) $$invalidate(4, el = $$props.el);
    		if ('divs' in $$props) divs = $$props.divs;
    		if ('count' in $$props) count = $$props.count;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*gridWidth*/ 8) {
    			 nogrid && (minWidth || gridWidth) && update();
    		}
    	};

    	return [
    		theme,
    		col,
    		caption,
    		gridWidth,
    		el,
    		gridClass,
    		nogrid,
    		rowHeight,
    		gridGap,
    		grid,
    		height,
    		gap,
    		$$scope,
    		slots,
    		div0_binding,
    		div0_elementresize_handler
    	];
    }

    class Media extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			theme: 0,
    			col: 1,
    			grid: 9,
    			caption: 2,
    			height: 10,
    			gap: 11
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Media",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get theme() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get col() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set col(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get grid() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set grid(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get caption() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set caption(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gap() {
    		throw new Error("<Media>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gap(value) {
    		throw new Error("<Media>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Scroller.svelte generated by Svelte v3.44.1 */

    const { window: window_1 } = globals;
    const file$6 = "src\\layout\\Scroller.svelte";
    const get_foreground_slot_changes = dirty => ({});
    const get_foreground_slot_context = ctx => ({});
    const get_background_slot_changes = dirty => ({});
    const get_background_slot_context = ctx => ({});

    function create_fragment$6(ctx) {
    	let svelte_scroller_outer;
    	let svelte_scroller_background_container;
    	let svelte_scroller_background;
    	let t;
    	let svelte_scroller_foreground;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowresize*/ ctx[19]);
    	const background_slot_template = /*#slots*/ ctx[18].background;
    	const background_slot = create_slot(background_slot_template, ctx, /*$$scope*/ ctx[17], get_background_slot_context);
    	const foreground_slot_template = /*#slots*/ ctx[18].foreground;
    	const foreground_slot = create_slot(foreground_slot_template, ctx, /*$$scope*/ ctx[17], get_foreground_slot_context);

    	const block = {
    		c: function create() {
    			svelte_scroller_outer = element("svelte-scroller-outer");
    			svelte_scroller_background_container = element("svelte-scroller-background-container");
    			svelte_scroller_background = element("svelte-scroller-background");
    			if (background_slot) background_slot.c();
    			t = space();
    			svelte_scroller_foreground = element("svelte-scroller-foreground");
    			if (foreground_slot) foreground_slot.c();
    			set_custom_element_data(svelte_scroller_background, "class", "svelte-3stote");
    			add_location(svelte_scroller_background, file$6, 186, 2, 4913);
    			set_custom_element_data(svelte_scroller_background_container, "class", "background-container svelte-3stote");
    			add_location(svelte_scroller_background_container, file$6, 185, 1, 4818);
    			set_custom_element_data(svelte_scroller_foreground, "class", "svelte-3stote");
    			add_location(svelte_scroller_foreground, file$6, 191, 1, 5080);
    			set_custom_element_data(svelte_scroller_outer, "class", "svelte-3stote");
    			toggle_class(svelte_scroller_outer, "splitscreen", /*splitscreen*/ ctx[0]);
    			add_location(svelte_scroller_outer, file$6, 184, 0, 4756);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svelte_scroller_outer, anchor);
    			append_dev(svelte_scroller_outer, svelte_scroller_background_container);
    			append_dev(svelte_scroller_background_container, svelte_scroller_background);

    			if (background_slot) {
    				background_slot.m(svelte_scroller_background, null);
    			}

    			/*svelte_scroller_background_binding*/ ctx[20](svelte_scroller_background);
    			/*svelte_scroller_background_container_binding*/ ctx[21](svelte_scroller_background_container);
    			append_dev(svelte_scroller_outer, t);
    			append_dev(svelte_scroller_outer, svelte_scroller_foreground);

    			if (foreground_slot) {
    				foreground_slot.m(svelte_scroller_foreground, null);
    			}

    			/*svelte_scroller_foreground_binding*/ ctx[22](svelte_scroller_foreground);
    			/*svelte_scroller_outer_binding*/ ctx[23](svelte_scroller_outer);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*onwindowresize*/ ctx[19]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (background_slot) {
    				if (background_slot.p && (!current || dirty[0] & /*$$scope*/ 131072)) {
    					update_slot_base(
    						background_slot,
    						background_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(background_slot_template, /*$$scope*/ ctx[17], dirty, get_background_slot_changes),
    						get_background_slot_context
    					);
    				}
    			}

    			if (foreground_slot) {
    				if (foreground_slot.p && (!current || dirty[0] & /*$$scope*/ 131072)) {
    					update_slot_base(
    						foreground_slot,
    						foreground_slot_template,
    						ctx,
    						/*$$scope*/ ctx[17],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[17])
    						: get_slot_changes(foreground_slot_template, /*$$scope*/ ctx[17], dirty, get_foreground_slot_changes),
    						get_foreground_slot_context
    					);
    				}
    			}

    			if (dirty[0] & /*splitscreen*/ 1) {
    				toggle_class(svelte_scroller_outer, "splitscreen", /*splitscreen*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(background_slot, local);
    			transition_in(foreground_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(background_slot, local);
    			transition_out(foreground_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svelte_scroller_outer);
    			if (background_slot) background_slot.d(detaching);
    			/*svelte_scroller_background_binding*/ ctx[20](null);
    			/*svelte_scroller_background_container_binding*/ ctx[21](null);
    			if (foreground_slot) foreground_slot.d(detaching);
    			/*svelte_scroller_foreground_binding*/ ctx[22](null);
    			/*svelte_scroller_outer_binding*/ ctx[23](null);
    			mounted = false;
    			dispose();
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

    const handlers = [];
    let manager;

    if (typeof window !== 'undefined') {
    	const run_all = () => handlers.forEach(fn => fn());
    	window.addEventListener('scroll', run_all);
    	window.addEventListener('resize', run_all);
    }

    if (typeof IntersectionObserver !== 'undefined') {
    	const map = new Map();

    	const observer = new IntersectionObserver((entries, observer) => {
    			entries.forEach(entry => {
    				const update = map.get(entry.target);
    				const index = handlers.indexOf(update);

    				if (entry.isIntersecting) {
    					if (index === -1) handlers.push(update);
    				} else {
    					update();
    					if (index !== -1) handlers.splice(index, 1);
    				}
    			});
    		},
    	{
    			rootMargin: '400px 0px', // TODO why 400?
    			
    		});

    	manager = {
    		add: ({ outer, update }) => {
    			const { top, bottom } = outer.getBoundingClientRect();
    			if (top < window.innerHeight && bottom > 0) handlers.push(update);
    			map.set(outer, update);
    			observer.observe(outer);
    		},
    		remove: ({ outer, update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    			map.delete(outer);
    			observer.unobserve(outer);
    		}
    	};
    } else {
    	manager = {
    		add: ({ update }) => {
    			handlers.push(update);
    		},
    		remove: ({ update }) => {
    			const index = handlers.indexOf(update);
    			if (index !== -1) handlers.splice(index, 1);
    		}
    	};
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let top_px;
    	let bottom_px;
    	let threshold_px;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scroller', slots, ['background','foreground']);
    	let { top = 0 } = $$props;
    	let { bottom = 1 } = $$props;
    	let { threshold = 0.5 } = $$props;
    	let { query = 'section' } = $$props;
    	let { parallax = false } = $$props;
    	let { index = 0 } = $$props;
    	let { count = 0 } = $$props;
    	let { offset = 0 } = $$props;
    	let { progress = 0 } = $$props;
    	let { visible = false } = $$props;
    	let { splitscreen = false } = $$props;
    	let { id = null } = $$props;
    	let outer;
    	let bgContainer; // IE patch. Container binding to update inline style
    	let foreground;
    	let background;
    	let left;
    	let sections;
    	let wh = 0;
    	let fixed;
    	let offset_top;
    	let width = 1;
    	let height;
    	let inverted;

    	onMount(() => {
    		sections = foreground.querySelectorAll(query);
    		$$invalidate(7, count = sections.length);
    		update();
    		const scroller = { outer, update };
    		manager.add(scroller);
    		return () => manager.remove(scroller);
    	});

    	// IE patch. BG container style (fixed/unfixed) set via function
    	function setFixed() {
    		if (bgContainer) {
    			let style = `position: ${fixed ? 'fixed' : 'absolute'}; top: 0; transform: translate(0, ${offset_top}px); width: ${width}px; z-index: ${inverted ? 3 : 1};`;
    			$$invalidate(3, bgContainer.style.cssText = style, bgContainer);
    		}
    	}

    	function update() {
    		if (!foreground) return;

    		// re-measure outer container
    		const bcr = outer.getBoundingClientRect();

    		left = bcr.left;
    		width = bcr.right - bcr.left;

    		// determine fix state
    		const fg = foreground.getBoundingClientRect();

    		const bg = background.getBoundingClientRect();
    		$$invalidate(10, visible = fg.top < wh && fg.bottom > 0);
    		const foreground_height = fg.bottom - fg.top;
    		const background_height = bg.bottom - bg.top;
    		const available_space = bottom_px - top_px;
    		$$invalidate(9, progress = (top_px - fg.top) / (foreground_height - available_space));

    		if (progress <= 0) {
    			offset_top = 0;

    			if (fixed) {
    				fixed = false;
    				setFixed();
    			} // Non-IE specific patch to avoid setting style repeatedly
    		} else if (progress >= 1) {
    			offset_top = parallax
    			? foreground_height - background_height
    			: foreground_height - available_space;

    			if (fixed) {
    				fixed = false;
    				setFixed();
    			}
    		} else {
    			offset_top = parallax
    			? Math.round(top_px - progress * (background_height - available_space))
    			: top_px;

    			if (!fixed) {
    				fixed = true;
    				setFixed();
    			}
    		}

    		for ($$invalidate(6, index = 0); index < sections.length; $$invalidate(6, index += 1)) {
    			const section = sections[index];
    			const { top } = section.getBoundingClientRect();
    			const next = sections[index + 1];
    			const bottom = next ? next.getBoundingClientRect().top : fg.bottom;
    			$$invalidate(8, offset = (threshold_px - top) / (bottom - top));
    			$$invalidate(11, id = section.dataset.id ? section.dataset.id : null);
    			if (bottom >= threshold_px) break;
    		}
    	}

    	const writable_props = [
    		'top',
    		'bottom',
    		'threshold',
    		'query',
    		'parallax',
    		'index',
    		'count',
    		'offset',
    		'progress',
    		'visible',
    		'splitscreen',
    		'id'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scroller> was created with unknown prop '${key}'`);
    	});

    	function onwindowresize() {
    		$$invalidate(1, wh = window_1.innerHeight);
    	}

    	function svelte_scroller_background_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			background = $$value;
    			$$invalidate(5, background);
    		});
    	}

    	function svelte_scroller_background_container_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			bgContainer = $$value;
    			$$invalidate(3, bgContainer);
    		});
    	}

    	function svelte_scroller_foreground_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			foreground = $$value;
    			$$invalidate(4, foreground);
    		});
    	}

    	function svelte_scroller_outer_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			outer = $$value;
    			$$invalidate(2, outer);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('top' in $$props) $$invalidate(12, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(13, bottom = $$props.bottom);
    		if ('threshold' in $$props) $$invalidate(14, threshold = $$props.threshold);
    		if ('query' in $$props) $$invalidate(15, query = $$props.query);
    		if ('parallax' in $$props) $$invalidate(16, parallax = $$props.parallax);
    		if ('index' in $$props) $$invalidate(6, index = $$props.index);
    		if ('count' in $$props) $$invalidate(7, count = $$props.count);
    		if ('offset' in $$props) $$invalidate(8, offset = $$props.offset);
    		if ('progress' in $$props) $$invalidate(9, progress = $$props.progress);
    		if ('visible' in $$props) $$invalidate(10, visible = $$props.visible);
    		if ('splitscreen' in $$props) $$invalidate(0, splitscreen = $$props.splitscreen);
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('$$scope' in $$props) $$invalidate(17, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		handlers,
    		manager,
    		onMount,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		splitscreen,
    		id,
    		outer,
    		bgContainer,
    		foreground,
    		background,
    		left,
    		sections,
    		wh,
    		fixed,
    		offset_top,
    		width,
    		height,
    		inverted,
    		setFixed,
    		update,
    		threshold_px,
    		top_px,
    		bottom_px
    	});

    	$$self.$inject_state = $$props => {
    		if ('top' in $$props) $$invalidate(12, top = $$props.top);
    		if ('bottom' in $$props) $$invalidate(13, bottom = $$props.bottom);
    		if ('threshold' in $$props) $$invalidate(14, threshold = $$props.threshold);
    		if ('query' in $$props) $$invalidate(15, query = $$props.query);
    		if ('parallax' in $$props) $$invalidate(16, parallax = $$props.parallax);
    		if ('index' in $$props) $$invalidate(6, index = $$props.index);
    		if ('count' in $$props) $$invalidate(7, count = $$props.count);
    		if ('offset' in $$props) $$invalidate(8, offset = $$props.offset);
    		if ('progress' in $$props) $$invalidate(9, progress = $$props.progress);
    		if ('visible' in $$props) $$invalidate(10, visible = $$props.visible);
    		if ('splitscreen' in $$props) $$invalidate(0, splitscreen = $$props.splitscreen);
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('outer' in $$props) $$invalidate(2, outer = $$props.outer);
    		if ('bgContainer' in $$props) $$invalidate(3, bgContainer = $$props.bgContainer);
    		if ('foreground' in $$props) $$invalidate(4, foreground = $$props.foreground);
    		if ('background' in $$props) $$invalidate(5, background = $$props.background);
    		if ('left' in $$props) left = $$props.left;
    		if ('sections' in $$props) sections = $$props.sections;
    		if ('wh' in $$props) $$invalidate(1, wh = $$props.wh);
    		if ('fixed' in $$props) fixed = $$props.fixed;
    		if ('offset_top' in $$props) offset_top = $$props.offset_top;
    		if ('width' in $$props) width = $$props.width;
    		if ('height' in $$props) height = $$props.height;
    		if ('inverted' in $$props) inverted = $$props.inverted;
    		if ('threshold_px' in $$props) threshold_px = $$props.threshold_px;
    		if ('top_px' in $$props) top_px = $$props.top_px;
    		if ('bottom_px' in $$props) bottom_px = $$props.bottom_px;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*top, wh*/ 4098) {
    			 top_px = Math.round(top * wh);
    		}

    		if ($$self.$$.dirty[0] & /*bottom, wh*/ 8194) {
    			 bottom_px = Math.round(bottom * wh);
    		}

    		if ($$self.$$.dirty[0] & /*threshold, wh*/ 16386) {
    			 threshold_px = Math.round(threshold * wh);
    		}

    		if ($$self.$$.dirty[0] & /*top, bottom, threshold, parallax*/ 94208) {
    			 (update());
    		}
    	};

    	return [
    		splitscreen,
    		wh,
    		outer,
    		bgContainer,
    		foreground,
    		background,
    		index,
    		count,
    		offset,
    		progress,
    		visible,
    		id,
    		top,
    		bottom,
    		threshold,
    		query,
    		parallax,
    		$$scope,
    		slots,
    		onwindowresize,
    		svelte_scroller_background_binding,
    		svelte_scroller_background_container_binding,
    		svelte_scroller_foreground_binding,
    		svelte_scroller_outer_binding
    	];
    }

    class Scroller extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$6,
    			create_fragment$6,
    			safe_not_equal,
    			{
    				top: 12,
    				bottom: 13,
    				threshold: 14,
    				query: 15,
    				parallax: 16,
    				index: 6,
    				count: 7,
    				offset: 8,
    				progress: 9,
    				visible: 10,
    				splitscreen: 0,
    				id: 11
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scroller",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get top() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set top(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bottom() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bottom(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get threshold() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set threshold(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get query() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get parallax() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set parallax(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get index() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get offset() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set offset(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get progress() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set progress(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get visible() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set visible(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get splitscreen() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set splitscreen(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Scroller>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Scroller>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Filler.svelte generated by Svelte v3.44.1 */
    const file$7 = "src\\layout\\Filler.svelte";

    function create_fragment$7(ctx) {
    	let section;
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "middle svelte-1odf9sx");
    			toggle_class(div, "center", /*center*/ ctx[1]);
    			toggle_class(div, "col-medium", !/*wide*/ ctx[2]);
    			toggle_class(div, "col-wide", /*wide*/ ctx[2]);
    			toggle_class(div, "height-full", !/*short*/ ctx[3]);
    			toggle_class(div, "short", /*short*/ ctx[3]);
    			add_location(div, file$7, 20, 1, 424);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			attr_dev(section, "class", "svelte-1odf9sx");
    			add_location(section, file$7, 19, 0, 323);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*center*/ 2) {
    				toggle_class(div, "center", /*center*/ ctx[1]);
    			}

    			if (dirty & /*wide*/ 4) {
    				toggle_class(div, "col-medium", !/*wide*/ ctx[2]);
    			}

    			if (dirty & /*wide*/ 4) {
    				toggle_class(div, "col-wide", /*wide*/ ctx[2]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div, "height-full", !/*short*/ ctx[3]);
    			}

    			if (dirty & /*short*/ 8) {
    				toggle_class(div, "short", /*short*/ ctx[3]);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (!current || dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if (default_slot) default_slot.d(detaching);
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

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Filler', slots, ['default']);
    	let { theme = getContext('theme') } = $$props;
    	let { center = true } = $$props;
    	let { wide = false } = $$props;
    	let { short = false } = $$props;
    	const writable_props = ['theme', 'center', 'wide', 'short'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Filler> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('center' in $$props) $$invalidate(1, center = $$props.center);
    		if ('wide' in $$props) $$invalidate(2, wide = $$props.wide);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		themes,
    		getContext,
    		theme,
    		center,
    		wide,
    		short
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('center' in $$props) $$invalidate(1, center = $$props.center);
    		if ('wide' in $$props) $$invalidate(2, wide = $$props.wide);
    		if ('short' in $$props) $$invalidate(3, short = $$props.short);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, center, wide, short, $$scope, slots];
    }

    class Filler extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { theme: 0, center: 1, wide: 2, short: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Filler",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get theme() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get wide() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set wide(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get short() {
    		throw new Error("<Filler>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set short(value) {
    		throw new Error("<Filler>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\layout\Divider.svelte generated by Svelte v3.44.1 */
    const file$8 = "src\\layout\\Divider.svelte";

    // (13:4) {:else}
    function create_else_block$2(ctx) {
    	let hr_1;

    	const block = {
    		c: function create() {
    			hr_1 = element("hr");
    			set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			set_style(hr_1, "border", "none");
    			attr_dev(hr_1, "class", "svelte-1l2to1w");
    			add_location(hr_1, file$8, 13, 4, 382);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1) {
    				set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(13:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:4) {#if hr}
    function create_if_block$2(ctx) {
    	let hr_1;

    	const block = {
    		c: function create() {
    			hr_1 = element("hr");
    			set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			attr_dev(hr_1, "class", "svelte-1l2to1w");
    			add_location(hr_1, file$8, 11, 4, 318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr_1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*theme*/ 1) {
    				set_style(hr_1, "color", themes[/*theme*/ ctx[0]]['muted']);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:4) {#if hr}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let section;
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*hr*/ ctx[1]) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			section = element("section");
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "col-medium");
    			add_location(div, file$8, 9, 1, 274);
    			set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			add_location(section, file$8, 8, 0, 173);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(section, "color", themes[/*theme*/ ctx[0]]['text']);
    			}

    			if (dirty & /*theme*/ 1) {
    				set_style(section, "background-color", themes[/*theme*/ ctx[0]]['background']);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			if_block.d();
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

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Divider', slots, []);
    	let { theme = getContext('theme') } = $$props;
    	let { hr = true } = $$props;
    	const writable_props = ['theme', 'hr'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Divider> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('hr' in $$props) $$invalidate(1, hr = $$props.hr);
    	};

    	$$self.$capture_state = () => ({ themes, getContext, theme, hr });

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) $$invalidate(0, theme = $$props.theme);
    		if ('hr' in $$props) $$invalidate(1, hr = $$props.hr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [theme, hr];
    }

    class Divider extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { theme: 0, hr: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Divider",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get theme() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set theme(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hr() {
    		throw new Error("<Divider>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hr(value) {
    		throw new Error("<Divider>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Toggle.svelte generated by Svelte v3.44.1 */

    const file$9 = "src\\ui\\Toggle.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label_1;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(/*label*/ ctx[2]);
    			attr_dev(input, "id", /*id*/ ctx[1]);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "class", "switch-input svelte-g1x8yy");
    			attr_dev(input, "tabindex", "0");
    			add_location(input, file$9, 8, 2, 158);
    			attr_dev(label_1, "for", /*id*/ ctx[1]);
    			attr_dev(label_1, "class", "switch-label svelte-g1x8yy");
    			toggle_class(label_1, "mono", /*mono*/ ctx[3]);
    			add_location(label_1, file$9, 9, 2, 239);
    			attr_dev(div, "class", "switch svelte-g1x8yy");
    			add_location(div, file$9, 7, 0, 134);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			input.checked = /*checked*/ ctx[0];
    			append_dev(div, t0);
    			append_dev(div, label_1);
    			append_dev(label_1, t1);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*id*/ 2) {
    				attr_dev(input, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*checked*/ 1) {
    				input.checked = /*checked*/ ctx[0];
    			}

    			if (dirty & /*label*/ 4) set_data_dev(t1, /*label*/ ctx[2]);

    			if (dirty & /*id*/ 2) {
    				attr_dev(label_1, "for", /*id*/ ctx[1]);
    			}

    			if (dirty & /*mono*/ 8) {
    				toggle_class(label_1, "mono", /*mono*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
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

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Toggle', slots, []);
    	let { id = "switch" } = $$props;
    	let { label = "Label" } = $$props;
    	let { mono = false } = $$props;
    	let { checked } = $$props;
    	const writable_props = ['id', 'label', 'mono', 'checked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Toggle> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		checked = this.checked;
    		$$invalidate(0, checked);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('mono' in $$props) $$invalidate(3, mono = $$props.mono);
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({ id, label, mono, checked });

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('mono' in $$props) $$invalidate(3, mono = $$props.mono);
    		if ('checked' in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, id, label, mono, input_change_handler];
    }

    class Toggle extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { id: 1, label: 2, mono: 3, checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Toggle",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*checked*/ ctx[0] === undefined && !('checked' in props)) {
    			console.warn("<Toggle> was created without expected prop 'checked'");
    		}
    	}

    	get id() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get mono() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set mono(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\ui\Arrow.svelte generated by Svelte v3.44.1 */

    const file$a = "src\\ui\\Arrow.svelte";

    // (14:0) {:else}
    function create_else_block$3(ctx) {
    	let img;
    	let img_src_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (default_slot) default_slot.c();
    			if (!src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "arrow left svelte-1prdo3z");
    			attr_dev(img, "alt", "");
    			attr_dev(img, "aria-hidden", "true");
    			toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			add_location(img, file$a, 14, 0, 361);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*color*/ 1 && !src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*animation*/ 2) {
    				toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(14:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (11:0) {#if center}
    function create_if_block$3(ctx) {
    	let br;
    	let t;
    	let img;
    	let img_src_value;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    			br = element("br");
    			t = space();
    			img = element("img");
    			add_location(br, file$a, 11, 13, 236);
    			if (!src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "arrow svelte-1prdo3z");
    			attr_dev(img, "alt", "");
    			attr_dev(img, "aria-hidden", "true");
    			toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			add_location(img, file$a, 12, 0, 243);
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, img, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*color*/ 1 && !src_url_equal(img.src, img_src_value = "./img/scroll-down-" + /*color*/ ctx[0] + ".svg")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*animation*/ 2) {
    				toggle_class(img, "bounce", /*animation*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(11:0) {#if center}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*center*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Arrow', slots, ['default']);
    	let { color = "black" } = $$props;
    	let { animation = true } = $$props;
    	let { center = true } = $$props;
    	const colors = ["black", "white"];
    	color = colors.includes(color) ? color : "black";
    	const writable_props = ['color', 'animation', 'center'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('animation' in $$props) $$invalidate(1, animation = $$props.animation);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ color, animation, center, colors });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('animation' in $$props) $$invalidate(1, animation = $$props.animation);
    		if ('center' in $$props) $$invalidate(2, center = $$props.center);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, animation, center, $$scope, slots];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { color: 0, animation: 1, center: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arrow",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get color() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get animation() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set animation(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get center() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set center(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
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
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /* --------------------------------------------
     *
     * Return a truthy value if is zero
     *
     * --------------------------------------------
     */
    function canBeZero (val) {
    	if (val === 0) {
    		return true;
    	}
    	return val;
    }

    function makeAccessor (acc) {
    	if (!canBeZero(acc)) return null;
    	if (Array.isArray(acc)) {
    		return d => acc.map(k => {
    			return typeof k !== 'function' ? d[k] : k(d);
    		});
    	} else if (typeof acc !== 'function') { // eslint-disable-line no-else-return
    		return d => d[acc];
    	}
    	return acc;
    }

    /* --------------------------------------------
     *
     * Remove undefined fields from an object
     *
     * --------------------------------------------
     */

    // From Object.fromEntries polyfill https://github.com/tc39/proposal-object-from-entries/blob/master/polyfill.js#L1
    function fromEntries(iter) {
    	const obj = {};

    	for (const pair of iter) {
    		if (Object(pair) !== pair) {
    			throw new TypeError("iterable for fromEntries should yield objects");
    		}

    		// Consistency with Map: contract is that entry has "0" and "1" keys, not
    		// that it is an array or iterable.

    		const { "0": key, "1": val } = pair;

    		Object.defineProperty(obj, key, {
    			configurable: true,
    			enumerable: true,
    			writable: true,
    			value: val,
    		});
    	}

    	return obj;
    }

    function filterObject (obj) {
    	return fromEntries(Object.entries(obj).filter(([key, value]) => {
    		return value !== undefined;
    	}));
    }

    /* --------------------------------------------
     *
     * Calculate the extents of desired fields
     * Returns an object like:
     * `{x: [0, 10], y: [-10, 10]}` if `fields` is
     * `[{field:'x', accessor: d => d.x}, {field:'y', accessor: d => d.y}]`
     *
     * --------------------------------------------
     */
    function calcExtents (data, fields) {
    	if (!Array.isArray(data) || data.length === 0) return null;
    	const extents = {};
    	const fl = fields.length;
    	let i;
    	let j;
    	let f;
    	let val;
    	let s;

    	if (fl) {
    		for (i = 0; i < fl; i += 1) {
    			const firstRow = fields[i].accessor(data[0]);
    			if (firstRow === undefined || firstRow === null || Number.isNaN(firstRow) === true) {
    				extents[fields[i].field] = [Infinity, -Infinity];
    			} else {
    				extents[fields[i].field] = Array.isArray(firstRow) ? firstRow : [firstRow, firstRow];
    			}
    		}
    		const dl = data.length;
    		for (i = 0; i < dl; i += 1) {
    			for (j = 0; j < fl; j += 1) {
    				f = fields[j];
    				val = f.accessor(data[i]);
    				s = f.field;
    				if (Array.isArray(val)) {
    					const vl = val.length;
    					for (let k = 0; k < vl; k += 1) {
    						if (val[k] !== undefined && val[k] !== null && Number.isNaN(val[k]) === false) {
    							if (val[k] < extents[s][0]) {
    								extents[s][0] = val[k];
    							}
    							if (val[k] > extents[s][1]) {
    								extents[s][1] = val[k];
    							}
    						}
    					}
    				} else if (val !== undefined && val !== null && Number.isNaN(val) === false) {
    					if (val < extents[s][0]) {
    						extents[s][0] = val;
    					}
    					if (val > extents[s][1]) {
    						extents[s][1] = val;
    					}
    				}
    			}
    		}
    	} else {
    		return null;
    	}
    	return extents;
    }

    /* --------------------------------------------
     * If we have a domain from settings, fill in
     * any null values with ones from our measured extents
     * otherwise, return the measured extent
     */
    function partialDomain (domain = [], directive) {
    	if (Array.isArray(directive) === true) {
    		return directive.map((d, i) => {
    			if (d === null) {
    				return domain[i];
    			}
    			return d;
    		});
    	}
    	return domain;
    }

    function calcDomain (s) {
    	return function domainCalc ([$extents, $domain]) {
    		return $extents ? partialDomain($extents[s], $domain) : $domain;
    	};
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(f) {
      let delta = f;
      let compare = f;

      if (f.length === 1) {
        delta = (d, x) => f(d) - x;
        compare = ascendingComparator(f);
      }

      function left(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1;
          else hi = mid;
        }
        return lo;
      }

      function right(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        while (lo < hi) {
          const mid = (lo + hi) >>> 1;
          if (compare(a[mid], x) > 0) hi = mid;
          else lo = mid + 1;
        }
        return lo;
      }

      function center(a, x, lo, hi) {
        if (lo == null) lo = 0;
        if (hi == null) hi = a.length;
        const i = left(a, x, lo, hi - 1);
        return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
      }

      return {left, center, right};
    }

    function ascendingComparator(f) {
      return (d, x) => ascending(f(d), x);
    }

    function number(x) {
      return x === null ? NaN : +x;
    }

    const ascendingBisect = bisector(ascending);
    const bisectRight = ascendingBisect.right;
    const bisectCenter = bisector(number).center;

    class InternMap extends Map {
      constructor(entries = [], key = keyof) {
        super();
        Object.defineProperties(this, {_intern: {value: new Map()}, _key: {value: key}});
        for (const [key, value] of entries) this.set(key, value);
      }
      get(key) {
        return super.get(intern_get(this, key));
      }
      has(key) {
        return super.has(intern_get(this, key));
      }
      set(key, value) {
        return super.set(intern_set(this, key), value);
      }
      delete(key) {
        return super.delete(intern_delete(this, key));
      }
    }

    function intern_get({_intern, _key}, value) {
      const key = _key(value);
      return _intern.has(key) ? _intern.get(key) : value;
    }

    function intern_set({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) return _intern.get(key);
      _intern.set(key, value);
      return value;
    }

    function intern_delete({_intern, _key}, value) {
      const key = _key(value);
      if (_intern.has(key)) {
        value = _intern.get(value);
        _intern.delete(key);
      }
      return value;
    }

    function keyof(value) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        step = -step;
        start = Math.ceil(start * step);
        stop = Math.floor(stop * step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? rgba((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    var constant = x => () => x;

    function linear(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear(a, d) : constant(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color(b)) ? (b = c, rgb$1) : string)
          : b instanceof color ? rgb$1
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function constants(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$1(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity$1,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity$1, identity$1);
    }

    function formatDecimal(x) {
      return Math.abs(x = Math.round(x)) >= 1e21
          ? x.toLocaleString("en").replace(/,/g, "")
          : x.toString(10);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimalParts(1.23) returns ["123", 0].
    function formatDecimalParts(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimalParts(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimalParts(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimalParts(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": (x, p) => (x * 100).toFixed(p),
      "b": (x) => Math.round(x).toString(2),
      "c": (x) => x + "",
      "d": formatDecimal,
      "e": (x, p) => x.toExponential(p),
      "f": (x, p) => x.toFixed(p),
      "g": (x, p) => x.toPrecision(p),
      "o": (x) => Math.round(x).toString(8),
      "p": (x, p) => formatRounded(x * 100, p),
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": (x) => Math.round(x).toString(16).toUpperCase(),
      "x": (x) => Math.round(x).toString(16)
    };

    function identity$2(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "−" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear$1() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear$1());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function transformPow(exponent) {
      return function(x) {
        return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
      };
    }

    function transformSqrt(x) {
      return x < 0 ? -Math.sqrt(-x) : Math.sqrt(x);
    }

    function transformSquare(x) {
      return x < 0 ? -x * x : x * x;
    }

    function powish(transform) {
      var scale = transform(identity$1, identity$1),
          exponent = 1;

      function rescale() {
        return exponent === 1 ? transform(identity$1, identity$1)
            : exponent === 0.5 ? transform(transformSqrt, transformSquare)
            : transform(transformPow(exponent), transformPow(1 / exponent));
      }

      scale.exponent = function(_) {
        return arguments.length ? (exponent = +_, rescale()) : exponent;
      };

      return linearish(scale);
    }

    function pow() {
      var scale = powish(transformer());

      scale.copy = function() {
        return copy(scale, pow()).exponent(scale.exponent());
      };

      initRange.apply(scale, arguments);

      return scale;
    }

    function sqrt() {
      return pow.apply(null, arguments).exponent(0.5);
    }

    var defaultScales = {
    	x: linear$1,
    	y: linear$1,
    	z: linear$1,
    	r: sqrt
    };

    /* --------------------------------------------
     *
     * Determine whether a scale is a log, symlog, power or other
     * This is not meant to be exhaustive of all the different types of
     * scales in d3-scale and focuses on continuous scales
     *
     * --------------------------------------------
     */
    function findScaleType(scale) {
    	if (scale.constant) {
    		return 'symlog';
    	}
    	if (scale.base) {
    		return 'log';
    	}
    	if (scale.exponent) {
    		if (scale.exponent() === 0.5) {
    			return 'sqrt';
    		}
    		return 'pow';
    	}
    	return 'other';
    }

    function identity$3 (d) {
    	return d;
    }

    function log(sign) {
    	return x => Math.log(sign * x);
    }

    function exp(sign) {
    	return x => sign * Math.exp(x);
    }

    function symlog(c) {
    	return x => Math.sign(x) * Math.log1p(Math.abs(x / c));
    }

    function symexp(c) {
    	return x => Math.sign(x) * Math.expm1(Math.abs(x)) * c;
    }

    function pow$1(exponent) {
    	return function powFn(x) {
    		return x < 0 ? -Math.pow(-x, exponent) : Math.pow(x, exponent);
    	};
    }

    function getPadFunctions(scale) {
    	const scaleType = findScaleType(scale);

    	if (scaleType === 'log') {
    		const sign = Math.sign(scale.domain()[0]);
    		return { lift: log(sign), ground: exp(sign), scaleType };
    	}
    	if (scaleType === 'pow') {
    		const exponent = 1;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'sqrt') {
    		const exponent = 0.5;
    		return { lift: pow$1(exponent), ground: pow$1(1 / exponent), scaleType };
    	}
    	if (scaleType === 'symlog') {
    		const constant = 1;
    		return { lift: symlog(constant), ground: symexp(constant), scaleType };
    	}

    	return { lift: identity$3, ground: identity$3, scaleType };
    }

    /* --------------------------------------------
     *
     * Returns a modified scale domain by in/decreasing
     * the min/max by taking the desired difference
     * in pixels and converting it to units of data.
     * Returns an array that you can set as the new domain.
     * Padding contributed by @veltman.
     * See here for discussion of transforms: https://github.com/d3/d3-scale/issues/150
     *
     * --------------------------------------------
     */

    function padScale (scale, padding) {
    	if (typeof scale.range !== 'function') {
    		throw new Error('Scale method `range` must be a function');
    	}
    	if (typeof scale.domain !== 'function') {
    		throw new Error('Scale method `domain` must be a function');
    	}
    	if (!Array.isArray(padding)) {
    		return scale.domain();
    	}

    	if (scale.domain().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a domain of length 2 to use padding. Are you sure you want to use padding? Your scale\'s domain is:', scale.domain());
    	}
    	if (scale.range().length !== 2) {
    		console.warn('[LayerCake] The scale is expected to have a range of length 2 to use padding. Are you sure you want to use padding? Your scale\'s range is:', scale.range());
    	}

    	const { lift, ground } = getPadFunctions(scale);

    	const d0 = scale.domain()[0];

    	const isTime = Object.prototype.toString.call(d0) === '[object Date]';

    	const [d1, d2] = scale.domain().map(d => {
    		return isTime ? lift(d.getTime()) : lift(d);
    	});
    	const [r1, r2] = scale.range();
    	const paddingLeft = padding[0] || 0;
    	const paddingRight = padding[1] || 0;

    	const step = (d2 - d1) / (Math.abs(r2 - r1) - paddingLeft - paddingRight); // Math.abs() to properly handle reversed scales

    	return [d1 - paddingLeft * step, paddingRight * step + d2].map(d => {
    		return isTime ? ground(new Date(d)) : ground(d);
    	});
    }

    /* eslint-disable no-nested-ternary */
    function calcBaseRange(s, width, height, reverse, percentRange) {
    	let min;
    	let max;
    	if (percentRange === true) {
    		min = 0;
    		max = 100;
    	} else {
    		min = s === 'r' ? 1 : 0;
    		max = s === 'y' ? height : s === 'r' ? 25 : width;
    	}
    	return reverse === true ? [max, min] : [min, max];
    }

    function getDefaultRange(s, width, height, reverse, range, percentRange) {
    	return !range
    		? calcBaseRange(s, width, height, reverse, percentRange)
    		: typeof range === 'function'
    			? range({ width, height })
    			: range;
    }

    function createScale (s) {
    	return function scaleCreator ([$scale, $extents, $domain, $padding, $nice, $reverse, $width, $height, $range, $percentScale]) {
    		if ($extents === null) {
    			return null;
    		}

    		const defaultRange = getDefaultRange(s, $width, $height, $reverse, $range, $percentScale);

    		const scale = $scale === defaultScales[s] ? $scale() : $scale.copy();

    		/* --------------------------------------------
    		 * On creation, `$domain` will already have any nulls filled in
    		 * But if we set it via the context it might not, so rerun it through partialDomain
    		 */
    		scale
    			.domain(partialDomain($extents[s], $domain))
    			.range(defaultRange);

    		if ($padding) {
    			scale.domain(padScale(scale, $padding));
    		}

    		if ($nice === true) {
    			if (typeof scale.nice === 'function') {
    				scale.nice();
    			} else {
    				console.error(`[Layer Cake] You set \`${s}Nice: true\` but the ${s}Scale does not have a \`.nice\` method. Ignoring...`);
    			}
    		}

    		return scale;
    	};
    }

    function createGetter ([$acc, $scale]) {
    	return d => {
    		const val = $acc(d);
    		if (Array.isArray(val)) {
    			return val.map(v => $scale(v));
    		}
    		return $scale(val);
    	};
    }

    function getRange([$scale]) {
    	if (typeof $scale === 'function') {
    		if (typeof $scale.range === 'function') {
    			return $scale.range();
    		}
    		console.error('[LayerCake] Your scale doesn\'t have a `.range` method?');
    	}
    	return null;
    }

    var defaultReverses = {
    	x: false,
    	y: true,
    	z: false,
    	r: false
    };

    /* node_modules\layercake\src\LayerCake.svelte generated by Svelte v3.44.1 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$b = "node_modules\\layercake\\src\\LayerCake.svelte";

    const get_default_slot_changes = dirty => ({
    	width: dirty[0] & /*$width_d*/ 32,
    	height: dirty[0] & /*$height_d*/ 64,
    	aspectRatio: dirty[0] & /*$aspectRatio_d*/ 128,
    	containerWidth: dirty[0] & /*$_containerWidth*/ 256,
    	containerHeight: dirty[0] & /*$_containerHeight*/ 512
    });

    const get_default_slot_context = ctx => ({
    	width: /*$width_d*/ ctx[5],
    	height: /*$height_d*/ ctx[6],
    	aspectRatio: /*$aspectRatio_d*/ ctx[7],
    	containerWidth: /*$_containerWidth*/ ctx[8],
    	containerHeight: /*$_containerHeight*/ ctx[9]
    });

    // (294:0) {#if (ssr === true || typeof window !== 'undefined')}
    function create_if_block$4(ctx) {
    	let div;
    	let div_style_value;
    	let div_resize_listener;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[53].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[52], get_default_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "layercake-container svelte-vhzpsp");

    			attr_dev(div, "style", div_style_value = "position:" + /*position*/ ctx[4] + "; " + (/*position*/ ctx[4] === 'absolute'
    			? 'top:0;right:0;bottom:0;left:0;'
    			: '') + " " + (/*pointerEvents*/ ctx[3] === false
    			? 'pointer-events:none;'
    			: '') + "");

    			add_render_callback(() => /*div_elementresize_handler*/ ctx[54].call(div));
    			add_location(div, file$b, 294, 1, 9534);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			div_resize_listener = add_resize_listener(div, /*div_elementresize_handler*/ ctx[54].bind(div));
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*$width_d, $height_d, $aspectRatio_d, $_containerWidth, $_containerHeight*/ 992 | dirty[1] & /*$$scope*/ 2097152)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[52],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[52])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[52], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}

    			if (!current || dirty[0] & /*position, pointerEvents*/ 24 && div_style_value !== (div_style_value = "position:" + /*position*/ ctx[4] + "; " + (/*position*/ ctx[4] === 'absolute'
    			? 'top:0;right:0;bottom:0;left:0;'
    			: '') + " " + (/*pointerEvents*/ ctx[3] === false
    			? 'pointer-events:none;'
    			: '') + "")) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    			div_resize_listener();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(294:0) {#if (ssr === true || typeof window !== 'undefined')}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = (/*ssr*/ ctx[2] === true || typeof window !== 'undefined') && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*ssr*/ ctx[2] === true || typeof window !== 'undefined') {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*ssr*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let context;
    	let $width_d;
    	let $height_d;
    	let $aspectRatio_d;
    	let $_containerWidth;
    	let $_containerHeight;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LayerCake', slots, ['default']);
    	let { ssr = false } = $$props;
    	let { pointerEvents = true } = $$props;
    	let { position = 'relative' } = $$props;
    	let { percentRange = false } = $$props;
    	let { width = undefined } = $$props;
    	let { height = undefined } = $$props;
    	let { containerWidth = width || 100 } = $$props;
    	let { containerHeight = height || 100 } = $$props;
    	let { x = undefined } = $$props;
    	let { y = undefined } = $$props;
    	let { z = undefined } = $$props;
    	let { r = undefined } = $$props;
    	let { custom = {} } = $$props;
    	let { data = [] } = $$props;
    	let { xDomain = undefined } = $$props;
    	let { yDomain = undefined } = $$props;
    	let { zDomain = undefined } = $$props;
    	let { rDomain = undefined } = $$props;
    	let { xNice = false } = $$props;
    	let { yNice = false } = $$props;
    	let { zNice = false } = $$props;
    	let { rNice = false } = $$props;
    	let { xReverse = defaultReverses.x } = $$props;
    	let { yReverse = defaultReverses.y } = $$props;
    	let { zReverse = defaultReverses.z } = $$props;
    	let { rReverse = defaultReverses.r } = $$props;
    	let { xPadding = undefined } = $$props;
    	let { yPadding = undefined } = $$props;
    	let { zPadding = undefined } = $$props;
    	let { rPadding = undefined } = $$props;
    	let { xScale = defaultScales.x } = $$props;
    	let { yScale = defaultScales.y } = $$props;
    	let { zScale = defaultScales.y } = $$props;
    	let { rScale = defaultScales.r } = $$props;
    	let { xRange = undefined } = $$props;
    	let { yRange = undefined } = $$props;
    	let { zRange = undefined } = $$props;
    	let { rRange = undefined } = $$props;
    	let { padding = {} } = $$props;
    	let { extents = {} } = $$props;
    	let { flatData = undefined } = $$props;

    	/* --------------------------------------------
     * Preserve a copy of our passed in settings before we modify them
     * Return this to the user's context so they can reference things if need be
     * Add the active keys since those aren't on our settings object.
     * This is mostly an escape-hatch
     */
    	const config = {};

    	/* --------------------------------------------
     * Make store versions of each parameter
     * Prefix these with `_` to keep things organized
     */
    	const _percentRange = writable();

    	const _containerWidth = writable();
    	validate_store(_containerWidth, '_containerWidth');
    	component_subscribe($$self, _containerWidth, value => $$invalidate(8, $_containerWidth = value));
    	const _containerHeight = writable();
    	validate_store(_containerHeight, '_containerHeight');
    	component_subscribe($$self, _containerHeight, value => $$invalidate(9, $_containerHeight = value));
    	const _x = writable();
    	const _y = writable();
    	const _z = writable();
    	const _r = writable();
    	const _custom = writable();
    	const _data = writable();
    	const _xDomain = writable();
    	const _yDomain = writable();
    	const _zDomain = writable();
    	const _rDomain = writable();
    	const _xNice = writable();
    	const _yNice = writable();
    	const _zNice = writable();
    	const _rNice = writable();
    	const _xReverse = writable();
    	const _yReverse = writable();
    	const _zReverse = writable();
    	const _rReverse = writable();
    	const _xPadding = writable();
    	const _yPadding = writable();
    	const _zPadding = writable();
    	const _rPadding = writable();
    	const _xScale = writable();
    	const _yScale = writable();
    	const _zScale = writable();
    	const _rScale = writable();
    	const _xRange = writable();
    	const _yRange = writable();
    	const _zRange = writable();
    	const _rRange = writable();
    	const _padding = writable();
    	const _flatData = writable();
    	const _extents = writable();
    	const _config = writable(config);

    	/* --------------------------------------------
     * Create derived values
     * Suffix these with `_d`
     */
    	const activeGetters_d = derived([_x, _y, _z, _r], ([$x, $y, $z, $r]) => {
    		return [
    			{ field: 'x', accessor: $x },
    			{ field: 'y', accessor: $y },
    			{ field: 'z', accessor: $z },
    			{ field: 'r', accessor: $r }
    		].filter(d => d.accessor);
    	});

    	const padding_d = derived([_padding, _containerWidth, _containerHeight], ([$padding]) => {
    		const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };
    		return Object.assign(defaultPadding, $padding);
    	});

    	const box_d = derived([_containerWidth, _containerHeight, padding_d], ([$containerWidth, $containerHeight, $padding]) => {
    		const b = {};
    		b.top = $padding.top;
    		b.right = $containerWidth - $padding.right;
    		b.bottom = $containerHeight - $padding.bottom;
    		b.left = $padding.left;
    		b.width = b.right - b.left;
    		b.height = b.bottom - b.top;

    		if (b.width < 0 && b.height < 0) {
    			console.error('[LayerCake] Target div has negative width and height. Did you forget to set a width or height on the container?');
    		} else if (b.width < 0) {
    			console.error('[LayerCake] Target div has a negative width. Did you forget to set that CSS on the container?');
    		} else if (b.height < 0) {
    			console.error('[LayerCake] Target div has negative height. Did you forget to set that CSS on the container?');
    		}

    		return b;
    	});

    	const width_d = derived([box_d], ([$box]) => {
    		return $box.width;
    	});

    	validate_store(width_d, 'width_d');
    	component_subscribe($$self, width_d, value => $$invalidate(5, $width_d = value));

    	const height_d = derived([box_d], ([$box]) => {
    		return $box.height;
    	});

    	validate_store(height_d, 'height_d');
    	component_subscribe($$self, height_d, value => $$invalidate(6, $height_d = value));

    	/* --------------------------------------------
     * Calculate extents by taking the extent of the data
     * and filling that in with anything set by the user
     */
    	const extents_d = derived([_flatData, activeGetters_d, _extents], ([$flatData, $activeGetters, $extents]) => {
    		return {
    			...calcExtents($flatData, $activeGetters.filter(d => !$extents[d.field])),
    			...$extents
    		};
    	});

    	const xDomain_d = derived([extents_d, _xDomain], calcDomain('x'));
    	const yDomain_d = derived([extents_d, _yDomain], calcDomain('y'));
    	const zDomain_d = derived([extents_d, _zDomain], calcDomain('z'));
    	const rDomain_d = derived([extents_d, _rDomain], calcDomain('r'));

    	const xScale_d = derived(
    		[
    			_xScale,
    			extents_d,
    			xDomain_d,
    			_xPadding,
    			_xNice,
    			_xReverse,
    			width_d,
    			height_d,
    			_xRange,
    			_percentRange
    		],
    		createScale('x')
    	);

    	const xGet_d = derived([_x, xScale_d], createGetter);

    	const yScale_d = derived(
    		[
    			_yScale,
    			extents_d,
    			yDomain_d,
    			_yPadding,
    			_yNice,
    			_yReverse,
    			width_d,
    			height_d,
    			_yRange,
    			_percentRange
    		],
    		createScale('y')
    	);

    	const yGet_d = derived([_y, yScale_d], createGetter);

    	const zScale_d = derived(
    		[
    			_zScale,
    			extents_d,
    			zDomain_d,
    			_zPadding,
    			_zNice,
    			_zReverse,
    			width_d,
    			height_d,
    			_zRange,
    			_percentRange
    		],
    		createScale('z')
    	);

    	const zGet_d = derived([_z, zScale_d], createGetter);

    	const rScale_d = derived(
    		[
    			_rScale,
    			extents_d,
    			rDomain_d,
    			_rPadding,
    			_rNice,
    			_rReverse,
    			width_d,
    			height_d,
    			_rRange,
    			_percentRange
    		],
    		createScale('r')
    	);

    	const rGet_d = derived([_r, rScale_d], createGetter);
    	const xRange_d = derived([xScale_d], getRange);
    	const yRange_d = derived([yScale_d], getRange);
    	const zRange_d = derived([zScale_d], getRange);
    	const rRange_d = derived([rScale_d], getRange);

    	const aspectRatio_d = derived([width_d, height_d], ([$aspectRatio, $width, $height]) => {
    		return $width / $height;
    	});

    	validate_store(aspectRatio_d, 'aspectRatio_d');
    	component_subscribe($$self, aspectRatio_d, value => $$invalidate(7, $aspectRatio_d = value));

    	const writable_props = [
    		'ssr',
    		'pointerEvents',
    		'position',
    		'percentRange',
    		'width',
    		'height',
    		'containerWidth',
    		'containerHeight',
    		'x',
    		'y',
    		'z',
    		'r',
    		'custom',
    		'data',
    		'xDomain',
    		'yDomain',
    		'zDomain',
    		'rDomain',
    		'xNice',
    		'yNice',
    		'zNice',
    		'rNice',
    		'xReverse',
    		'yReverse',
    		'zReverse',
    		'rReverse',
    		'xPadding',
    		'yPadding',
    		'zPadding',
    		'rPadding',
    		'xScale',
    		'yScale',
    		'zScale',
    		'rScale',
    		'xRange',
    		'yRange',
    		'zRange',
    		'rRange',
    		'padding',
    		'extents',
    		'flatData'
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<LayerCake> was created with unknown prop '${key}'`);
    	});

    	function div_elementresize_handler() {
    		containerWidth = this.clientWidth;
    		containerHeight = this.clientHeight;
    		$$invalidate(0, containerWidth);
    		$$invalidate(1, containerHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('ssr' in $$props) $$invalidate(2, ssr = $$props.ssr);
    		if ('pointerEvents' in $$props) $$invalidate(3, pointerEvents = $$props.pointerEvents);
    		if ('position' in $$props) $$invalidate(4, position = $$props.position);
    		if ('percentRange' in $$props) $$invalidate(15, percentRange = $$props.percentRange);
    		if ('width' in $$props) $$invalidate(16, width = $$props.width);
    		if ('height' in $$props) $$invalidate(17, height = $$props.height);
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ('containerHeight' in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ('x' in $$props) $$invalidate(18, x = $$props.x);
    		if ('y' in $$props) $$invalidate(19, y = $$props.y);
    		if ('z' in $$props) $$invalidate(20, z = $$props.z);
    		if ('r' in $$props) $$invalidate(21, r = $$props.r);
    		if ('custom' in $$props) $$invalidate(22, custom = $$props.custom);
    		if ('data' in $$props) $$invalidate(23, data = $$props.data);
    		if ('xDomain' in $$props) $$invalidate(24, xDomain = $$props.xDomain);
    		if ('yDomain' in $$props) $$invalidate(25, yDomain = $$props.yDomain);
    		if ('zDomain' in $$props) $$invalidate(26, zDomain = $$props.zDomain);
    		if ('rDomain' in $$props) $$invalidate(27, rDomain = $$props.rDomain);
    		if ('xNice' in $$props) $$invalidate(28, xNice = $$props.xNice);
    		if ('yNice' in $$props) $$invalidate(29, yNice = $$props.yNice);
    		if ('zNice' in $$props) $$invalidate(30, zNice = $$props.zNice);
    		if ('rNice' in $$props) $$invalidate(31, rNice = $$props.rNice);
    		if ('xReverse' in $$props) $$invalidate(32, xReverse = $$props.xReverse);
    		if ('yReverse' in $$props) $$invalidate(33, yReverse = $$props.yReverse);
    		if ('zReverse' in $$props) $$invalidate(34, zReverse = $$props.zReverse);
    		if ('rReverse' in $$props) $$invalidate(35, rReverse = $$props.rReverse);
    		if ('xPadding' in $$props) $$invalidate(36, xPadding = $$props.xPadding);
    		if ('yPadding' in $$props) $$invalidate(37, yPadding = $$props.yPadding);
    		if ('zPadding' in $$props) $$invalidate(38, zPadding = $$props.zPadding);
    		if ('rPadding' in $$props) $$invalidate(39, rPadding = $$props.rPadding);
    		if ('xScale' in $$props) $$invalidate(40, xScale = $$props.xScale);
    		if ('yScale' in $$props) $$invalidate(41, yScale = $$props.yScale);
    		if ('zScale' in $$props) $$invalidate(42, zScale = $$props.zScale);
    		if ('rScale' in $$props) $$invalidate(43, rScale = $$props.rScale);
    		if ('xRange' in $$props) $$invalidate(44, xRange = $$props.xRange);
    		if ('yRange' in $$props) $$invalidate(45, yRange = $$props.yRange);
    		if ('zRange' in $$props) $$invalidate(46, zRange = $$props.zRange);
    		if ('rRange' in $$props) $$invalidate(47, rRange = $$props.rRange);
    		if ('padding' in $$props) $$invalidate(48, padding = $$props.padding);
    		if ('extents' in $$props) $$invalidate(49, extents = $$props.extents);
    		if ('flatData' in $$props) $$invalidate(50, flatData = $$props.flatData);
    		if ('$$scope' in $$props) $$invalidate(52, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		writable,
    		derived,
    		makeAccessor,
    		filterObject,
    		calcExtents,
    		calcDomain,
    		createScale,
    		createGetter,
    		getRange,
    		defaultScales,
    		defaultReverses,
    		ssr,
    		pointerEvents,
    		position,
    		percentRange,
    		width,
    		height,
    		containerWidth,
    		containerHeight,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		config,
    		_percentRange,
    		_containerWidth,
    		_containerHeight,
    		_x,
    		_y,
    		_z,
    		_r,
    		_custom,
    		_data,
    		_xDomain,
    		_yDomain,
    		_zDomain,
    		_rDomain,
    		_xNice,
    		_yNice,
    		_zNice,
    		_rNice,
    		_xReverse,
    		_yReverse,
    		_zReverse,
    		_rReverse,
    		_xPadding,
    		_yPadding,
    		_zPadding,
    		_rPadding,
    		_xScale,
    		_yScale,
    		_zScale,
    		_rScale,
    		_xRange,
    		_yRange,
    		_zRange,
    		_rRange,
    		_padding,
    		_flatData,
    		_extents,
    		_config,
    		activeGetters_d,
    		padding_d,
    		box_d,
    		width_d,
    		height_d,
    		extents_d,
    		xDomain_d,
    		yDomain_d,
    		zDomain_d,
    		rDomain_d,
    		xScale_d,
    		xGet_d,
    		yScale_d,
    		yGet_d,
    		zScale_d,
    		zGet_d,
    		rScale_d,
    		rGet_d,
    		xRange_d,
    		yRange_d,
    		zRange_d,
    		rRange_d,
    		aspectRatio_d,
    		context,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight
    	});

    	$$self.$inject_state = $$props => {
    		if ('ssr' in $$props) $$invalidate(2, ssr = $$props.ssr);
    		if ('pointerEvents' in $$props) $$invalidate(3, pointerEvents = $$props.pointerEvents);
    		if ('position' in $$props) $$invalidate(4, position = $$props.position);
    		if ('percentRange' in $$props) $$invalidate(15, percentRange = $$props.percentRange);
    		if ('width' in $$props) $$invalidate(16, width = $$props.width);
    		if ('height' in $$props) $$invalidate(17, height = $$props.height);
    		if ('containerWidth' in $$props) $$invalidate(0, containerWidth = $$props.containerWidth);
    		if ('containerHeight' in $$props) $$invalidate(1, containerHeight = $$props.containerHeight);
    		if ('x' in $$props) $$invalidate(18, x = $$props.x);
    		if ('y' in $$props) $$invalidate(19, y = $$props.y);
    		if ('z' in $$props) $$invalidate(20, z = $$props.z);
    		if ('r' in $$props) $$invalidate(21, r = $$props.r);
    		if ('custom' in $$props) $$invalidate(22, custom = $$props.custom);
    		if ('data' in $$props) $$invalidate(23, data = $$props.data);
    		if ('xDomain' in $$props) $$invalidate(24, xDomain = $$props.xDomain);
    		if ('yDomain' in $$props) $$invalidate(25, yDomain = $$props.yDomain);
    		if ('zDomain' in $$props) $$invalidate(26, zDomain = $$props.zDomain);
    		if ('rDomain' in $$props) $$invalidate(27, rDomain = $$props.rDomain);
    		if ('xNice' in $$props) $$invalidate(28, xNice = $$props.xNice);
    		if ('yNice' in $$props) $$invalidate(29, yNice = $$props.yNice);
    		if ('zNice' in $$props) $$invalidate(30, zNice = $$props.zNice);
    		if ('rNice' in $$props) $$invalidate(31, rNice = $$props.rNice);
    		if ('xReverse' in $$props) $$invalidate(32, xReverse = $$props.xReverse);
    		if ('yReverse' in $$props) $$invalidate(33, yReverse = $$props.yReverse);
    		if ('zReverse' in $$props) $$invalidate(34, zReverse = $$props.zReverse);
    		if ('rReverse' in $$props) $$invalidate(35, rReverse = $$props.rReverse);
    		if ('xPadding' in $$props) $$invalidate(36, xPadding = $$props.xPadding);
    		if ('yPadding' in $$props) $$invalidate(37, yPadding = $$props.yPadding);
    		if ('zPadding' in $$props) $$invalidate(38, zPadding = $$props.zPadding);
    		if ('rPadding' in $$props) $$invalidate(39, rPadding = $$props.rPadding);
    		if ('xScale' in $$props) $$invalidate(40, xScale = $$props.xScale);
    		if ('yScale' in $$props) $$invalidate(41, yScale = $$props.yScale);
    		if ('zScale' in $$props) $$invalidate(42, zScale = $$props.zScale);
    		if ('rScale' in $$props) $$invalidate(43, rScale = $$props.rScale);
    		if ('xRange' in $$props) $$invalidate(44, xRange = $$props.xRange);
    		if ('yRange' in $$props) $$invalidate(45, yRange = $$props.yRange);
    		if ('zRange' in $$props) $$invalidate(46, zRange = $$props.zRange);
    		if ('rRange' in $$props) $$invalidate(47, rRange = $$props.rRange);
    		if ('padding' in $$props) $$invalidate(48, padding = $$props.padding);
    		if ('extents' in $$props) $$invalidate(49, extents = $$props.extents);
    		if ('flatData' in $$props) $$invalidate(50, flatData = $$props.flatData);
    		if ('context' in $$props) $$invalidate(51, context = $$props.context);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*x*/ 262144) {
    			 if (x) config.x = x;
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 524288) {
    			 if (y) config.y = y;
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 1048576) {
    			 if (z) config.z = z;
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 2097152) {
    			 if (r) config.r = r;
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 16777216) {
    			 if (xDomain) config.xDomain = xDomain;
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 33554432) {
    			 if (yDomain) config.yDomain = yDomain;
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 67108864) {
    			 if (zDomain) config.zDomain = zDomain;
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 134217728) {
    			 if (rDomain) config.rDomain = rDomain;
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 8192) {
    			 if (xRange) config.xRange = xRange;
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 16384) {
    			 if (yRange) config.yRange = yRange;
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 32768) {
    			 if (zRange) config.zRange = zRange;
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 65536) {
    			 if (rRange) config.rRange = rRange;
    		}

    		if ($$self.$$.dirty[0] & /*percentRange*/ 32768) {
    			 _percentRange.set(percentRange);
    		}

    		if ($$self.$$.dirty[0] & /*containerWidth*/ 1) {
    			 _containerWidth.set(containerWidth);
    		}

    		if ($$self.$$.dirty[0] & /*containerHeight*/ 2) {
    			 _containerHeight.set(containerHeight);
    		}

    		if ($$self.$$.dirty[0] & /*x*/ 262144) {
    			 _x.set(makeAccessor(x));
    		}

    		if ($$self.$$.dirty[0] & /*y*/ 524288) {
    			 _y.set(makeAccessor(y));
    		}

    		if ($$self.$$.dirty[0] & /*z*/ 1048576) {
    			 _z.set(makeAccessor(z));
    		}

    		if ($$self.$$.dirty[0] & /*r*/ 2097152) {
    			 _r.set(makeAccessor(r));
    		}

    		if ($$self.$$.dirty[0] & /*xDomain*/ 16777216) {
    			 _xDomain.set(xDomain);
    		}

    		if ($$self.$$.dirty[0] & /*yDomain*/ 33554432) {
    			 _yDomain.set(yDomain);
    		}

    		if ($$self.$$.dirty[0] & /*zDomain*/ 67108864) {
    			 _zDomain.set(zDomain);
    		}

    		if ($$self.$$.dirty[0] & /*rDomain*/ 134217728) {
    			 _rDomain.set(rDomain);
    		}

    		if ($$self.$$.dirty[0] & /*custom*/ 4194304) {
    			 _custom.set(custom);
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 8388608) {
    			 _data.set(data);
    		}

    		if ($$self.$$.dirty[0] & /*xNice*/ 268435456) {
    			 _xNice.set(xNice);
    		}

    		if ($$self.$$.dirty[0] & /*yNice*/ 536870912) {
    			 _yNice.set(yNice);
    		}

    		if ($$self.$$.dirty[0] & /*zNice*/ 1073741824) {
    			 _zNice.set(zNice);
    		}

    		if ($$self.$$.dirty[1] & /*rNice*/ 1) {
    			 _rNice.set(rNice);
    		}

    		if ($$self.$$.dirty[1] & /*xReverse*/ 2) {
    			 _xReverse.set(xReverse);
    		}

    		if ($$self.$$.dirty[1] & /*yReverse*/ 4) {
    			 _yReverse.set(yReverse);
    		}

    		if ($$self.$$.dirty[1] & /*zReverse*/ 8) {
    			 _zReverse.set(zReverse);
    		}

    		if ($$self.$$.dirty[1] & /*rReverse*/ 16) {
    			 _rReverse.set(rReverse);
    		}

    		if ($$self.$$.dirty[1] & /*xPadding*/ 32) {
    			 _xPadding.set(xPadding);
    		}

    		if ($$self.$$.dirty[1] & /*yPadding*/ 64) {
    			 _yPadding.set(yPadding);
    		}

    		if ($$self.$$.dirty[1] & /*zPadding*/ 128) {
    			 _zPadding.set(zPadding);
    		}

    		if ($$self.$$.dirty[1] & /*rPadding*/ 256) {
    			 _rPadding.set(rPadding);
    		}

    		if ($$self.$$.dirty[1] & /*xScale*/ 512) {
    			 _xScale.set(xScale);
    		}

    		if ($$self.$$.dirty[1] & /*yScale*/ 1024) {
    			 _yScale.set(yScale);
    		}

    		if ($$self.$$.dirty[1] & /*zScale*/ 2048) {
    			 _zScale.set(zScale);
    		}

    		if ($$self.$$.dirty[1] & /*rScale*/ 4096) {
    			 _rScale.set(rScale);
    		}

    		if ($$self.$$.dirty[1] & /*xRange*/ 8192) {
    			 _xRange.set(xRange);
    		}

    		if ($$self.$$.dirty[1] & /*yRange*/ 16384) {
    			 _yRange.set(yRange);
    		}

    		if ($$self.$$.dirty[1] & /*zRange*/ 32768) {
    			 _zRange.set(zRange);
    		}

    		if ($$self.$$.dirty[1] & /*rRange*/ 65536) {
    			 _rRange.set(rRange);
    		}

    		if ($$self.$$.dirty[1] & /*padding*/ 131072) {
    			 _padding.set(padding);
    		}

    		if ($$self.$$.dirty[1] & /*extents*/ 262144) {
    			 _extents.set(filterObject(extents));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 8388608 | $$self.$$.dirty[1] & /*flatData*/ 524288) {
    			 _flatData.set(flatData || data);
    		}

    		if ($$self.$$.dirty[1] & /*context*/ 1048576) {
    			 setContext('LayerCake', context);
    		}
    	};

    	 $$invalidate(51, context = {
    		activeGetters: activeGetters_d,
    		width: width_d,
    		height: height_d,
    		percentRange: _percentRange,
    		aspectRatio: aspectRatio_d,
    		containerWidth: _containerWidth,
    		containerHeight: _containerHeight,
    		x: _x,
    		y: _y,
    		z: _z,
    		r: _r,
    		custom: _custom,
    		data: _data,
    		xNice: _xNice,
    		yNice: _yNice,
    		zNice: _zNice,
    		rNice: _rNice,
    		xReverse: _xReverse,
    		yReverse: _yReverse,
    		zReverse: _zReverse,
    		rReverse: _rReverse,
    		xPadding: _xPadding,
    		yPadding: _yPadding,
    		zPadding: _zPadding,
    		rPadding: _rPadding,
    		padding: padding_d,
    		flatData: _flatData,
    		extents: extents_d,
    		xDomain: xDomain_d,
    		yDomain: yDomain_d,
    		zDomain: zDomain_d,
    		rDomain: rDomain_d,
    		xRange: xRange_d,
    		yRange: yRange_d,
    		zRange: zRange_d,
    		rRange: rRange_d,
    		config: _config,
    		xScale: xScale_d,
    		xGet: xGet_d,
    		yScale: yScale_d,
    		yGet: yGet_d,
    		zScale: zScale_d,
    		zGet: zGet_d,
    		rScale: rScale_d,
    		rGet: rGet_d
    	});

    	return [
    		containerWidth,
    		containerHeight,
    		ssr,
    		pointerEvents,
    		position,
    		$width_d,
    		$height_d,
    		$aspectRatio_d,
    		$_containerWidth,
    		$_containerHeight,
    		_containerWidth,
    		_containerHeight,
    		width_d,
    		height_d,
    		aspectRatio_d,
    		percentRange,
    		width,
    		height,
    		x,
    		y,
    		z,
    		r,
    		custom,
    		data,
    		xDomain,
    		yDomain,
    		zDomain,
    		rDomain,
    		xNice,
    		yNice,
    		zNice,
    		rNice,
    		xReverse,
    		yReverse,
    		zReverse,
    		rReverse,
    		xPadding,
    		yPadding,
    		zPadding,
    		rPadding,
    		xScale,
    		yScale,
    		zScale,
    		rScale,
    		xRange,
    		yRange,
    		zRange,
    		rRange,
    		padding,
    		extents,
    		flatData,
    		context,
    		$$scope,
    		slots,
    		div_elementresize_handler
    	];
    }

    class LayerCake extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$b,
    			create_fragment$b,
    			safe_not_equal,
    			{
    				ssr: 2,
    				pointerEvents: 3,
    				position: 4,
    				percentRange: 15,
    				width: 16,
    				height: 17,
    				containerWidth: 0,
    				containerHeight: 1,
    				x: 18,
    				y: 19,
    				z: 20,
    				r: 21,
    				custom: 22,
    				data: 23,
    				xDomain: 24,
    				yDomain: 25,
    				zDomain: 26,
    				rDomain: 27,
    				xNice: 28,
    				yNice: 29,
    				zNice: 30,
    				rNice: 31,
    				xReverse: 32,
    				yReverse: 33,
    				zReverse: 34,
    				rReverse: 35,
    				xPadding: 36,
    				yPadding: 37,
    				zPadding: 38,
    				rPadding: 39,
    				xScale: 40,
    				yScale: 41,
    				zScale: 42,
    				rScale: 43,
    				xRange: 44,
    				yRange: 45,
    				zRange: 46,
    				rRange: 47,
    				padding: 48,
    				extents: 49,
    				flatData: 50
    			},
    			null,
    			[-1, -1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LayerCake",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get ssr() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ssr(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get percentRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set percentRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get width() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerWidth() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerWidth(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerHeight() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerHeight(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get x() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set x(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get y() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set y(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get z() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set z(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get r() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set r(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get custom() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rDomain() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rDomain(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rNice() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rNice(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rReverse() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rReverse(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rPadding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rPadding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rScale() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rScale(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get rRange() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set rRange(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get padding() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set padding(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get extents() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set extents(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get flatData() {
    		throw new Error("<LayerCake>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set flatData(value) {
    		throw new Error("<LayerCake>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\layercake\src\layouts\Svg.svelte generated by Svelte v3.44.1 */
    const file$c = "node_modules\\layercake\\src\\layouts\\Svg.svelte";
    const get_defs_slot_changes = dirty => ({});
    const get_defs_slot_context = ctx => ({});

    function create_fragment$c(ctx) {
    	let svg;
    	let defs;
    	let g;
    	let g_transform_value;
    	let svg_style_value;
    	let current;
    	const defs_slot_template = /*#slots*/ ctx[12].defs;
    	const defs_slot = create_slot(defs_slot_template, ctx, /*$$scope*/ ctx[11], get_defs_slot_context);
    	const default_slot_template = /*#slots*/ ctx[12].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[11], null);

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			if (defs_slot) defs_slot.c();
    			g = svg_element("g");
    			if (default_slot) default_slot.c();
    			add_location(defs, file$c, 22, 1, 598);
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$padding*/ ctx[5].left + ", " + /*$padding*/ ctx[5].top + ")");
    			add_location(g, file$c, 25, 1, 643);
    			attr_dev(svg, "class", "layercake-layout-svg svelte-u84d8d");
    			attr_dev(svg, "viewBox", /*viewBox*/ ctx[0]);
    			attr_dev(svg, "width", /*$containerWidth*/ ctx[3]);
    			attr_dev(svg, "height", /*$containerHeight*/ ctx[4]);
    			attr_dev(svg, "style", svg_style_value = "" + (/*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2]));
    			add_location(svg, file$c, 15, 0, 454);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);

    			if (defs_slot) {
    				defs_slot.m(defs, null);
    			}

    			append_dev(svg, g);

    			if (default_slot) {
    				default_slot.m(g, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (defs_slot) {
    				if (defs_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						defs_slot,
    						defs_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(defs_slot_template, /*$$scope*/ ctx[11], dirty, get_defs_slot_changes),
    						get_defs_slot_context
    					);
    				}
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2048)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[11],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[11])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[11], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*$padding*/ 32 && g_transform_value !== (g_transform_value = "translate(" + /*$padding*/ ctx[5].left + ", " + /*$padding*/ ctx[5].top + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}

    			if (!current || dirty & /*viewBox*/ 1) {
    				attr_dev(svg, "viewBox", /*viewBox*/ ctx[0]);
    			}

    			if (!current || dirty & /*$containerWidth*/ 8) {
    				attr_dev(svg, "width", /*$containerWidth*/ ctx[3]);
    			}

    			if (!current || dirty & /*$containerHeight*/ 16) {
    				attr_dev(svg, "height", /*$containerHeight*/ ctx[4]);
    			}

    			if (!current || dirty & /*zIndexStyle, pointerEventsStyle*/ 6 && svg_style_value !== (svg_style_value = "" + (/*zIndexStyle*/ ctx[1] + /*pointerEventsStyle*/ ctx[2]))) {
    				attr_dev(svg, "style", svg_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(defs_slot, local);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(defs_slot, local);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    			if (defs_slot) defs_slot.d(detaching);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $containerWidth;
    	let $containerHeight;
    	let $padding;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Svg', slots, ['defs','default']);
    	let { viewBox = undefined } = $$props;
    	let { zIndex = undefined } = $$props;
    	let { pointerEvents = undefined } = $$props;
    	let zIndexStyle = '';
    	let pointerEventsStyle = '';
    	const { containerWidth, containerHeight, padding } = getContext('LayerCake');
    	validate_store(containerWidth, 'containerWidth');
    	component_subscribe($$self, containerWidth, value => $$invalidate(3, $containerWidth = value));
    	validate_store(containerHeight, 'containerHeight');
    	component_subscribe($$self, containerHeight, value => $$invalidate(4, $containerHeight = value));
    	validate_store(padding, 'padding');
    	component_subscribe($$self, padding, value => $$invalidate(5, $padding = value));
    	const writable_props = ['viewBox', 'zIndex', 'pointerEvents'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('viewBox' in $$props) $$invalidate(0, viewBox = $$props.viewBox);
    		if ('zIndex' in $$props) $$invalidate(9, zIndex = $$props.zIndex);
    		if ('pointerEvents' in $$props) $$invalidate(10, pointerEvents = $$props.pointerEvents);
    		if ('$$scope' in $$props) $$invalidate(11, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		viewBox,
    		zIndex,
    		pointerEvents,
    		zIndexStyle,
    		pointerEventsStyle,
    		containerWidth,
    		containerHeight,
    		padding,
    		$containerWidth,
    		$containerHeight,
    		$padding
    	});

    	$$self.$inject_state = $$props => {
    		if ('viewBox' in $$props) $$invalidate(0, viewBox = $$props.viewBox);
    		if ('zIndex' in $$props) $$invalidate(9, zIndex = $$props.zIndex);
    		if ('pointerEvents' in $$props) $$invalidate(10, pointerEvents = $$props.pointerEvents);
    		if ('zIndexStyle' in $$props) $$invalidate(1, zIndexStyle = $$props.zIndexStyle);
    		if ('pointerEventsStyle' in $$props) $$invalidate(2, pointerEventsStyle = $$props.pointerEventsStyle);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*zIndex*/ 512) {
    			 $$invalidate(1, zIndexStyle = typeof zIndex !== 'undefined'
    			? `z-index:${zIndex};`
    			: '');
    		}

    		if ($$self.$$.dirty & /*pointerEvents*/ 1024) {
    			 $$invalidate(2, pointerEventsStyle = pointerEvents === false ? 'pointer-events:none;' : '');
    		}
    	};

    	return [
    		viewBox,
    		zIndexStyle,
    		pointerEventsStyle,
    		$containerWidth,
    		$containerHeight,
    		$padding,
    		containerWidth,
    		containerHeight,
    		padding,
    		zIndex,
    		pointerEvents,
    		$$scope,
    		slots
    	];
    }

    class Svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { viewBox: 0, zIndex: 9, pointerEvents: 10 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Svg",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get viewBox() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewBox(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pointerEvents() {
    		throw new Error("<Svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pointerEvents(value) {
    		throw new Error("<Svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function initRange$1(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    const implicit = Symbol("implicit");

    function ordinal() {
      var index = new InternMap(),
          domain = [],
          range = [],
          unknown = implicit;

      function scale(d) {
        let i = index.get(d);
        if (i === undefined) {
          if (unknown !== implicit) return unknown;
          index.set(d, i = domain.push(d) - 1);
        }
        return range[i % range.length];
      }

      scale.domain = function(_) {
        if (!arguments.length) return domain.slice();
        domain = [], index = new InternMap();
        for (const value of _) {
          if (index.has(value)) continue;
          index.set(value, domain.push(value) - 1);
        }
        return scale;
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), scale) : range.slice();
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      scale.copy = function() {
        return ordinal(domain, range).unknown(unknown);
      };

      initRange$1.apply(scale, arguments);

      return scale;
    }

    function constants$1(x) {
      return function() {
        return x;
      };
    }

    function number$2(x) {
      return +x;
    }

    var unit$1 = [0, 1];

    function identity$4(x) {
      return x;
    }

    function normalize$1(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constants$1(isNaN(b) ? NaN : 0.5);
    }

    function clamper$1(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap$1(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize$1(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize$1(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap$1(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize$1(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy$1(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer$1() {
      var domain = unit$1,
          range = unit$1,
          interpolate$1 = interpolate,
          transform,
          untransform,
          unknown,
          clamp = identity$4,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$4) clamp = clamper$1(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap$1 : bimap$1;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate$1)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$2), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate$1 = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$4, rescale()) : clamp !== identity$4;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate$1 = _, rescale()) : interpolate$1;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous$1() {
      return transformer$1()(identity$4, identity$4);
    }

    function tickFormat$1(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish$1(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat$1(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain();
        var i0 = 0;
        var i1 = d.length - 1;
        var start = d[i0];
        var stop = d[i1];
        var prestep;
        var step;
        var maxIter = 10;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }
        
        while (maxIter-- > 0) {
          step = tickIncrement(start, stop, count);
          if (step === prestep) {
            d[i0] = start;
            d[i1] = stop;
            return domain(d);
          } else if (step > 0) {
            start = Math.floor(start / step) * step;
            stop = Math.ceil(stop / step) * step;
          } else if (step < 0) {
            start = Math.ceil(start * step) / step;
            stop = Math.floor(stop * step) / step;
          } else {
            break;
          }
          prestep = step;
        }

        return scale;
      };

      return scale;
    }

    function linear$2() {
      var scale = continuous$1();

      scale.copy = function() {
        return copy$1(scale, linear$2());
      };

      initRange$1.apply(scale, arguments);

      return linearish$1(scale);
    }

    function transformSymlog(c) {
      return function(x) {
        return Math.sign(x) * Math.log1p(Math.abs(x / c));
      };
    }

    function transformSymexp(c) {
      return function(x) {
        return Math.sign(x) * Math.expm1(Math.abs(x)) * c;
      };
    }

    function symlogish(transform) {
      var c = 1, scale = transform(transformSymlog(c), transformSymexp(c));

      scale.constant = function(_) {
        return arguments.length ? transform(transformSymlog(c = +_), transformSymexp(c)) : c;
      };

      return linearish$1(scale);
    }

    function symlog$1() {
      var scale = symlogish(transformer$1());

      scale.copy = function() {
        return copy$1(scale, symlog$1()).constant(scale.constant());
      };

      return initRange$1.apply(scale, arguments);
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    const seed = 1;
    const randomness1 = 5;
    const randomness2 = 2;

    class AccurateBeeswarm {
      constructor(items, radiusFun, xFun, padding, yOffset) {
        this.items = items;
        this.radiusFun = radiusFun;
        this.xFun = xFun;
        this.padding = padding;
        this.yOffset = yOffset;
        this.tieBreakFn = this._sfc32(0x9E3779B9, 0x243F6A88, 0xB7E15162, seed);
        this.maxR = Math.max(...items.map(d => radiusFun(d)));
        this.rng = this._sfc32(1, 2, 3, seed);
      }

      calculateYPositions() {
        let all = this.items
          .map((d, i) => ({
            datum: d,
            originalIndex: i,
            x: this.xFun(d),
            r: this.radiusFun(d) + this.padding,
            y: null,
            placed: false
          }))
          .sort((a, b) => a.x - b.x);
        all.forEach(function(d, i) {
          d.index = i;
        });
        let tieBreakFn = this.tieBreakFn;
        all.forEach(function(d) {
          d.tieBreaker = tieBreakFn(d.x);
        });
        let allSortedByPriority = [...all].sort((a, b) => {
          let key_a = this.radiusFun(a.datum) + a.tieBreaker * randomness1;
          let key_b = this.radiusFun(b.datum) + b.tieBreaker * randomness1;
          if (key_a != key_b) return key_b - key_a;
          return a.x - b.x;
        });
        for (let item of allSortedByPriority) {
          item.placed = true;
          item.y = this._getBestYPosition(item, all);
        }
        all.sort((a, b) => a.originalIndex - b.originalIndex);
        return all.map(d => ({
          x: d.x,
          y: d.y + this.yOffset,
          r: this.radiusFun(d.datum)
        }));
      }

      // Random number generator (for reproducibility)
      // https://stackoverflow.com/a/47593316
      _sfc32(a, b, c, d) {
        let rng = function() {
          a >>>= 0;
          b >>>= 0;
          c >>>= 0;
          d >>>= 0;
          var t = (a + b) | 0;
          a = b ^ (b >>> 9);
          b = (c + (c << 3)) | 0;
          c = (c << 21) | (c >>> 11);
          d = (d + 1) | 0;
          t = (t + d) | 0;
          c = (c + t) | 0;
          return (t >>> 0) / 4294967296;
        };
        for (let i = 0; i < 10; i++) {
          rng();
        }
        return rng;
      }

      _getBestYPosition(item, all) {
        let forbiddenIntervals = [];
        for (let step of [-1, 1]) {
          let xDist;
          let r = item.r;
          for (
            let i = item.index + step;
            i >= 0 &&
            i < all.length &&
            (xDist = Math.abs(item.x - all[i].x)) < r + this.maxR;
            i += step
          ) {
            let other = all[i];
            if (!other.placed) continue;
            let sumOfRadii = r + other.r;
            if (xDist >= r + other.r) continue;
            let yDist = Math.sqrt(sumOfRadii * sumOfRadii - xDist * xDist);
            let forbiddenInterval = [other.y - yDist, other.y + yDist];
            forbiddenIntervals.push(forbiddenInterval);
          }
        }
        if (forbiddenIntervals.length == 0) {
          return item.r * (this.rng() - .5) * randomness2;
        }
        let candidatePositions = forbiddenIntervals.flat();
        candidatePositions.push(0);
        candidatePositions.sort((a, b) => {
          let abs_a = Math.abs(a);
          let abs_b = Math.abs(b);
          if (abs_a < abs_b) return -1;
          if (abs_a > abs_b) return 1;
          return a - b;
        });
        // find first candidate position that is not in any of the
        // forbidden intervals
        for (let i = 0; i < candidatePositions.length; i++) {
          let position = candidatePositions[i];
          if (
            forbiddenIntervals.every(
              interval => position <= interval[0] || position >= interval[1]
            )
          ) {
            return position;
          }
        }
      }
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\SetCoords.svelte generated by Svelte v3.44.1 */

    function create_fragment$d(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $yScale;
    	let $xScale;
    	let $yRange;
    	let $xGet;
    	let $rRange;
    	let $rGet;
    	let $yGet;
    	let $width;
    	let $r;
    	let $y;
    	let $x;
    	let $custom;
    	let $data;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SetCoords', slots, []);
    	const { data, x, y, r, xGet, yGet, rGet, xScale, yScale, yRange, rRange, custom, width } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(18, $data = value));
    	validate_store(x, 'x');
    	component_subscribe($$self, x, value => $$invalidate(16, $x = value));
    	validate_store(y, 'y');
    	component_subscribe($$self, y, value => $$invalidate(15, $y = value));
    	validate_store(r, 'r');
    	component_subscribe($$self, r, value => $$invalidate(14, $r = value));
    	validate_store(xGet, 'xGet');
    	component_subscribe($$self, xGet, value => $$invalidate(23, $xGet = value));
    	validate_store(yGet, 'yGet');
    	component_subscribe($$self, yGet, value => $$invalidate(26, $yGet = value));
    	validate_store(rGet, 'rGet');
    	component_subscribe($$self, rGet, value => $$invalidate(25, $rGet = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(21, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(20, $yScale = value));
    	validate_store(yRange, 'yRange');
    	component_subscribe($$self, yRange, value => $$invalidate(22, $yRange = value));
    	validate_store(rRange, 'rRange');
    	component_subscribe($$self, rRange, value => $$invalidate(24, $rRange = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(17, $custom = value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(13, $width = value));
    	let coords = $custom.coords;
    	let type = $custom.type;
    	let prevWidth = $width;

    	function setCoords(data, custom, x, y, r, width) {
    		let mode = custom.mode;
    		let padding = custom.padding;

    		let duration = custom.animation && width == prevWidth
    		? custom.duration
    		: 0;

    		prevWidth = width;
    		let newcoords;

    		if (type == 'bar') {
    			newcoords = data.map((d, i) => d.map((e, j) => {
    				return {
    					x: mode == 'default' || mode == 'grouped' || (mode == 'comparison' || mode == 'stacked') && i == 0
    					? 0
    					: mode == 'stacked' ? x(data[i - 1][j]) : x(e),
    					y: mode == 'grouped'
    					? $yGet(e) + i * (1 / data.length) * $yScale.bandwidth()
    					: $yGet(e),
    					w: mode == 'default' || mode == 'grouped' || (mode == 'comparison' || mode == 'stacked') && i == 0
    					? x(e)
    					: mode == 'stacked' ? x(e) - x(data[i - 1][j]) : 0,
    					h: mode == 'grouped'
    					? $yScale.bandwidth() / data.length
    					: $yScale.bandwidth()
    				};
    			}));
    		} else if (type == 'column') {
    			newcoords = data.map((d, i) => d.map((e, j) => {
    				return {
    					x: mode == 'grouped' && $xScale.bandwidth
    					? $xGet(e) + i * (1 / data.length) * $xScale.bandwidth()
    					: mode == 'grouped'
    						? $xGet(e)[0] + i * (1 / data.length) * Math.max(0, $xGet(e)[1] - $xGet(e)[0])
    						: $xScale.bandwidth ? $xGet(e) : $xGet(e)[0],
    					y: y(e),
    					w: mode == 'grouped' && $xScale.bandwidth
    					? $xScale.bandwidth() / data.length
    					: mode == 'grouped'
    						? Math.max(0, $xGet(e)[1] - $xGet(e)[0]) / data.length
    						: $xScale.bandwidth
    							? $xScale.bandwidth()
    							: Math.max(0, $xGet(e)[1] - $xGet(e)[0]),
    					h: mode == 'default' || mode == 'grouped' || (mode == 'comparison' || mode == 'stacked') && i == 0
    					? y(e)
    					: mode == 'stacked' ? y(e) - y(data[i - 1][j]) : 0
    				};
    			}));
    		} else if (type == 'scatter') {
    			let rVal = d => r ? $rGet(d) : $rRange[0];

    			newcoords = y
    			? data.map(d => ({ x: x(d), y: y(d), r: rVal(d) }))
    			: new AccurateBeeswarm(data, d => rVal(d), d => $xGet(d), padding, $yRange[0] / 2).calculateYPositions().map(d => ({
    					x: $xScale.invert(d.x),
    					y: $yScale.invert(d.y),
    					r: d.r
    				}));
    		} else if (type == 'line') {
    			newcoords = data.map(d => d.map(e => {
    				return { x: x(e), y: y(e) };
    			}));
    		}

    		coords.set(newcoords, { duration });
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SetCoords> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		AccurateBeeswarm,
    		data,
    		x,
    		y,
    		r,
    		xGet,
    		yGet,
    		rGet,
    		xScale,
    		yScale,
    		yRange,
    		rRange,
    		custom,
    		width,
    		coords,
    		type,
    		prevWidth,
    		setCoords,
    		$yScale,
    		$xScale,
    		$yRange,
    		$xGet,
    		$rRange,
    		$rGet,
    		$yGet,
    		$width,
    		$r,
    		$y,
    		$x,
    		$custom,
    		$data
    	});

    	$$self.$inject_state = $$props => {
    		if ('coords' in $$props) coords = $$props.coords;
    		if ('type' in $$props) type = $$props.type;
    		if ('prevWidth' in $$props) prevWidth = $$props.prevWidth;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$data, $custom, $x, $y, $r, $width*/ 516096) {
    			 setCoords($data, $custom, $x, $y, $r, $width);
    		}
    	};

    	return [
    		data,
    		x,
    		y,
    		r,
    		xGet,
    		yGet,
    		rGet,
    		xScale,
    		yScale,
    		yRange,
    		rRange,
    		custom,
    		width,
    		$width,
    		$r,
    		$y,
    		$x,
    		$custom,
    		$data
    	];
    }

    class SetCoords extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SetCoords",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\AxisX.svelte generated by Svelte v3.44.1 */
    const file$d = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\AxisX.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (46:3) {#if gridlines !== false}
    function create_if_block_1$2(ctx) {
    	let line;
    	let line_y__value;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "gridline svelte-r9f2bw");
    			attr_dev(line, "y1", line_y__value = /*$height*/ ctx[17] * -1);
    			attr_dev(line, "y2", "0");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", "0");
    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			toggle_class(line, "dashed", /*tickDashed*/ ctx[1]);
    			add_location(line, file$d, 46, 4, 1135);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$height*/ 131072 && line_y__value !== (line_y__value = /*$height*/ ctx[17] * -1)) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}

    			if (dirty & /*tickDashed*/ 2) {
    				toggle_class(line, "dashed", /*tickDashed*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(46:3) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (49:3) {#if tickMarks === true}
    function create_if_block$5(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;
    	let line_x__value;
    	let line_x__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "tick-mark svelte-r9f2bw");
    			attr_dev(line, "y1", line_y__value = 0);
    			attr_dev(line, "y2", line_y__value_1 = 6);

    			attr_dev(line, "x1", line_x__value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0);

    			attr_dev(line, "x2", line_x__value_1 = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0);

    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			add_location(line, file$d, 49, 4, 1302);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*xTick, isBandwidth, $xScale*/ 24704 && line_x__value !== (line_x__value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0)) {
    				attr_dev(line, "x1", line_x__value);
    			}

    			if (dirty & /*xTick, isBandwidth, $xScale*/ 24704 && line_x__value_1 !== (line_x__value_1 = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0)) {
    				attr_dev(line, "x2", line_x__value_1);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(49:3) {#if tickMarks === true}",
    		ctx
    	});

    	return block;
    }

    // (44:1) {#each tickVals as tick, i}
    function create_each_block(ctx) {
    	let g;
    	let if_block0_anchor;
    	let text_1;

    	let t_value = (/*i*/ ctx[26] == /*tickVals*/ ctx[15].length - 1
    	? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[24]) + /*suffix*/ ctx[12]
    	: /*formatTick*/ ctx[5](/*tick*/ ctx[24])) + "";

    	let t;
    	let text_1_x_value;
    	let text_1_text_anchor_value;
    	let g_class_value;
    	let g_transform_value;
    	let if_block0 = /*gridlines*/ ctx[0] !== false && create_if_block_1$2(ctx);
    	let if_block1 = /*tickMarks*/ ctx[2] === true && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			text_1 = svg_element("text");
    			t = text(t_value);

    			attr_dev(text_1, "x", text_1_x_value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0);

    			attr_dev(text_1, "y", /*yTick*/ ctx[8]);
    			attr_dev(text_1, "dx", /*dxTick*/ ctx[9]);
    			attr_dev(text_1, "dy", /*dyTick*/ ctx[10]);
    			attr_dev(text_1, "text-anchor", text_1_text_anchor_value = /*textAnchor*/ ctx[21](/*i*/ ctx[26]));
    			set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			attr_dev(text_1, "class", "svelte-r9f2bw");
    			add_location(text_1, file$d, 51, 3, 1508);
    			attr_dev(g, "class", g_class_value = "tick tick-" + /*tick*/ ctx[24] + " svelte-r9f2bw");
    			attr_dev(g, "transform", g_transform_value = "translate(" + /*$xScale*/ ctx[14](/*tick*/ ctx[24]) + "," + /*$yRange*/ ctx[16][0] + ")");
    			add_location(g, file$d, 44, 2, 1021);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[0] !== false) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$2(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tickMarks*/ ctx[2] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$5(ctx);
    					if_block1.c();
    					if_block1.m(g, text_1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*tickVals, prefix, formatTick, suffix*/ 38944 && t_value !== (t_value = (/*i*/ ctx[26] == /*tickVals*/ ctx[15].length - 1
    			? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[24]) + /*suffix*/ ctx[12]
    			: /*formatTick*/ ctx[5](/*tick*/ ctx[24])) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick, isBandwidth, $xScale*/ 24704 && text_1_x_value !== (text_1_x_value = /*xTick*/ ctx[7] || /*isBandwidth*/ ctx[13]
    			? /*$xScale*/ ctx[14].bandwidth() / 2
    			: 0)) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*yTick*/ 256) {
    				attr_dev(text_1, "y", /*yTick*/ ctx[8]);
    			}

    			if (dirty & /*dxTick*/ 512) {
    				attr_dev(text_1, "dx", /*dxTick*/ ctx[9]);
    			}

    			if (dirty & /*dyTick*/ 1024) {
    				attr_dev(text_1, "dy", /*dyTick*/ ctx[10]);
    			}

    			if (dirty & /*textColor*/ 16) {
    				set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			}

    			if (dirty & /*tickVals*/ 32768 && g_class_value !== (g_class_value = "tick tick-" + /*tick*/ ctx[24] + " svelte-r9f2bw")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty & /*$xScale, tickVals, $yRange*/ 114688 && g_transform_value !== (g_transform_value = "translate(" + /*$xScale*/ ctx[14](/*tick*/ ctx[24]) + "," + /*$yRange*/ ctx[16][0] + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(44:1) {#each tickVals as tick, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let g;
    	let each_value = /*tickVals*/ ctx[15];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "axis x-axis svelte-r9f2bw");
    			toggle_class(g, "snapTicks", /*snapTicks*/ ctx[6]);
    			add_location(g, file$d, 42, 0, 950);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tickVals, $xScale, $yRange, xTick, isBandwidth, yTick, dxTick, dyTick, textAnchor, textColor, prefix, formatTick, suffix, tickColor, tickMarks, $height, tickDashed, gridlines*/ 2359231) {
    				each_value = /*tickVals*/ ctx[15];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*snapTicks*/ 64) {
    				toggle_class(g, "snapTicks", /*snapTicks*/ ctx[6]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let isBandwidth;
    	let tickVals;
    	let $xScale;
    	let $yRange;
    	let $height;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AxisX', slots, []);
    	const { width, height, xScale, yRange } = getContext('LayerCake');
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(17, $height = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(14, $xScale = value));
    	validate_store(yRange, 'yRange');
    	component_subscribe($$self, yRange, value => $$invalidate(16, $yRange = value));
    	let { gridlines = true } = $$props;
    	let { tickDashed = false } = $$props;
    	let { tickMarks = false } = $$props;
    	let { tickColor = '#bbb' } = $$props;
    	let { textColor = '#666' } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { snapTicks = false } = $$props;
    	let { ticks = undefined } = $$props;
    	let { xTick = undefined } = $$props;
    	let { yTick = 16 } = $$props;
    	let { dxTick = 0 } = $$props;
    	let { dyTick = 0 } = $$props;
    	let { prefix = '' } = $$props;
    	let { suffix = '' } = $$props;

    	function textAnchor(i) {
    		if (snapTicks === true) {
    			if (i === 0) {
    				return 'start';
    			}

    			if (i === tickVals.length - 1) {
    				return 'end';
    			}
    		}

    		return 'middle';
    	}

    	const writable_props = [
    		'gridlines',
    		'tickDashed',
    		'tickMarks',
    		'tickColor',
    		'textColor',
    		'formatTick',
    		'snapTicks',
    		'ticks',
    		'xTick',
    		'yTick',
    		'dxTick',
    		'dyTick',
    		'prefix',
    		'suffix'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AxisX> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('gridlines' in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(1, tickDashed = $$props.tickDashed);
    		if ('tickMarks' in $$props) $$invalidate(2, tickMarks = $$props.tickMarks);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('snapTicks' in $$props) $$invalidate(6, snapTicks = $$props.snapTicks);
    		if ('ticks' in $$props) $$invalidate(22, ticks = $$props.ticks);
    		if ('xTick' in $$props) $$invalidate(7, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(8, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(9, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(10, dyTick = $$props.dyTick);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		width,
    		height,
    		xScale,
    		yRange,
    		gridlines,
    		tickDashed,
    		tickMarks,
    		tickColor,
    		textColor,
    		formatTick,
    		snapTicks,
    		ticks,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		prefix,
    		suffix,
    		textAnchor,
    		tickVals,
    		isBandwidth,
    		$xScale,
    		$yRange,
    		$height
    	});

    	$$self.$inject_state = $$props => {
    		if ('gridlines' in $$props) $$invalidate(0, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(1, tickDashed = $$props.tickDashed);
    		if ('tickMarks' in $$props) $$invalidate(2, tickMarks = $$props.tickMarks);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('snapTicks' in $$props) $$invalidate(6, snapTicks = $$props.snapTicks);
    		if ('ticks' in $$props) $$invalidate(22, ticks = $$props.ticks);
    		if ('xTick' in $$props) $$invalidate(7, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(8, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(9, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(10, dyTick = $$props.dyTick);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    		if ('tickVals' in $$props) $$invalidate(15, tickVals = $$props.tickVals);
    		if ('isBandwidth' in $$props) $$invalidate(13, isBandwidth = $$props.isBandwidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$xScale*/ 16384) {
    			 $$invalidate(13, isBandwidth = typeof $xScale.bandwidth === 'function');
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $xScale*/ 4218880) {
    			 $$invalidate(15, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth
    				? $xScale.domain()
    				: typeof ticks === 'function'
    					? ticks($xScale.ticks())
    					: $xScale.ticks(ticks));
    		}
    	};

    	return [
    		gridlines,
    		tickDashed,
    		tickMarks,
    		tickColor,
    		textColor,
    		formatTick,
    		snapTicks,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		prefix,
    		suffix,
    		isBandwidth,
    		$xScale,
    		tickVals,
    		$yRange,
    		$height,
    		height,
    		xScale,
    		yRange,
    		textAnchor,
    		ticks
    	];
    }

    class AxisX extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			gridlines: 0,
    			tickDashed: 1,
    			tickMarks: 2,
    			tickColor: 3,
    			textColor: 4,
    			formatTick: 5,
    			snapTicks: 6,
    			ticks: 22,
    			xTick: 7,
    			yTick: 8,
    			dxTick: 9,
    			dyTick: 10,
    			prefix: 11,
    			suffix: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisX",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get gridlines() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickDashed() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickDashed(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickMarks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickMarks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickColor() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickColor(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textColor() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get snapTicks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snapTicks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ticks() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dxTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dxTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dyTick() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dyTick(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<AxisX>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<AxisX>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\AxisY.svelte generated by Svelte v3.44.1 */
    const file$e = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\AxisY.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[22] = list[i];
    	child_ctx[24] = i;
    	return child_ctx;
    }

    // (34:3) {#if gridlines !== false}
    function create_if_block_1$3(ctx) {
    	let line;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "gridline svelte-f7wn4m");
    			attr_dev(line, "x2", "100%");

    			attr_dev(line, "y1", line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			attr_dev(line, "y2", line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			toggle_class(line, "dashed", /*tickDashed*/ ctx[2]);
    			add_location(line, file$e, 34, 4, 997);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value !== (line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value_1 !== (line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}

    			if (dirty & /*tickDashed*/ 4) {
    				toggle_class(line, "dashed", /*tickDashed*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(34:3) {#if gridlines !== false}",
    		ctx
    	});

    	return block;
    }

    // (44:3) {#if tickMarks === true}
    function create_if_block$6(ctx) {
    	let line;
    	let line_x__value;
    	let line_y__value;
    	let line_y__value_1;

    	const block = {
    		c: function create() {
    			line = svg_element("line");
    			attr_dev(line, "class", "tick-mark svelte-f7wn4m");
    			attr_dev(line, "x1", "0");
    			attr_dev(line, "x2", line_x__value = /*isBandwidth*/ ctx[13] ? -6 : 6);

    			attr_dev(line, "y1", line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			attr_dev(line, "y2", line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			add_location(line, file$e, 44, 4, 1286);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, line, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*isBandwidth*/ 8192 && line_x__value !== (line_x__value = /*isBandwidth*/ ctx[13] ? -6 : 6)) {
    				attr_dev(line, "x2", line_x__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value !== (line_y__value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y1", line_y__value);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && line_y__value_1 !== (line_y__value_1 = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(line, "y2", line_y__value_1);
    			}

    			if (dirty & /*tickColor*/ 8) {
    				set_style(line, "stroke", /*tickColor*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(line);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(44:3) {#if tickMarks === true}",
    		ctx
    	});

    	return block;
    }

    // (32:1) {#each tickVals as tick, i}
    function create_each_block$1(ctx) {
    	let g;
    	let if_block0_anchor;
    	let text_1;

    	let t_value = (/*i*/ ctx[24] == /*tickVals*/ ctx[15].length - 1
    	? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[22]) + /*suffix*/ ctx[12]
    	: /*formatTick*/ ctx[5](/*tick*/ ctx[22])) + "";

    	let t;
    	let text_1_y_value;
    	let text_1_dx_value;
    	let text_1_dy_value;
    	let g_class_value;
    	let g_transform_value;
    	let if_block0 = /*gridlines*/ ctx[1] !== false && create_if_block_1$3(ctx);
    	let if_block1 = /*tickMarks*/ ctx[0] === true && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			if (if_block1) if_block1.c();
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "x", /*xTick*/ ctx[6]);

    			attr_dev(text_1, "y", text_1_y_value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0));

    			attr_dev(text_1, "dx", text_1_dx_value = /*isBandwidth*/ ctx[13] ? -4 : /*dxTick*/ ctx[8]);
    			attr_dev(text_1, "dy", text_1_dy_value = /*isBandwidth*/ ctx[13] ? 4 : /*dyTick*/ ctx[9]);
    			set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[13] ? 'end' : /*textAnchor*/ ctx[10]);
    			set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			add_location(text_1, file$e, 53, 3, 1546);
    			attr_dev(g, "class", g_class_value = "tick tick-" + /*tick*/ ctx[22] + " svelte-f7wn4m");
    			attr_dev(g, "transform", g_transform_value = "translate(" + (/*$xRange*/ ctx[17][0] + (/*isBandwidth*/ ctx[13] ? /*$padding*/ ctx[16].left : 0)) + ", " + /*$yScale*/ ctx[14](/*tick*/ ctx[22]) + ")");
    			add_location(g, file$e, 32, 2, 846);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);
    			if (if_block0) if_block0.m(g, null);
    			append_dev(g, if_block0_anchor);
    			if (if_block1) if_block1.m(g, null);
    			append_dev(g, text_1);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (/*gridlines*/ ctx[1] !== false) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1$3(ctx);
    					if_block0.c();
    					if_block0.m(g, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*tickMarks*/ ctx[0] === true) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$6(ctx);
    					if_block1.c();
    					if_block1.m(g, text_1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*tickVals, prefix, formatTick, suffix*/ 38944 && t_value !== (t_value = (/*i*/ ctx[24] == /*tickVals*/ ctx[15].length - 1
    			? /*prefix*/ ctx[11] + /*formatTick*/ ctx[5](/*tick*/ ctx[22]) + /*suffix*/ ctx[12]
    			: /*formatTick*/ ctx[5](/*tick*/ ctx[22])) + "")) set_data_dev(t, t_value);

    			if (dirty & /*xTick*/ 64) {
    				attr_dev(text_1, "x", /*xTick*/ ctx[6]);
    			}

    			if (dirty & /*yTick, isBandwidth, $yScale*/ 24704 && text_1_y_value !== (text_1_y_value = /*yTick*/ ctx[7] + (/*isBandwidth*/ ctx[13]
    			? /*$yScale*/ ctx[14].bandwidth() / 2
    			: 0))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}

    			if (dirty & /*isBandwidth, dxTick*/ 8448 && text_1_dx_value !== (text_1_dx_value = /*isBandwidth*/ ctx[13] ? -4 : /*dxTick*/ ctx[8])) {
    				attr_dev(text_1, "dx", text_1_dx_value);
    			}

    			if (dirty & /*isBandwidth, dyTick*/ 8704 && text_1_dy_value !== (text_1_dy_value = /*isBandwidth*/ ctx[13] ? 4 : /*dyTick*/ ctx[9])) {
    				attr_dev(text_1, "dy", text_1_dy_value);
    			}

    			if (dirty & /*isBandwidth, textAnchor*/ 9216) {
    				set_style(text_1, "text-anchor", /*isBandwidth*/ ctx[13] ? 'end' : /*textAnchor*/ ctx[10]);
    			}

    			if (dirty & /*textColor*/ 16) {
    				set_style(text_1, "fill", /*textColor*/ ctx[4]);
    			}

    			if (dirty & /*tickVals*/ 32768 && g_class_value !== (g_class_value = "tick tick-" + /*tick*/ ctx[22] + " svelte-f7wn4m")) {
    				attr_dev(g, "class", g_class_value);
    			}

    			if (dirty & /*$xRange, isBandwidth, $padding, $yScale, tickVals*/ 253952 && g_transform_value !== (g_transform_value = "translate(" + (/*$xRange*/ ctx[17][0] + (/*isBandwidth*/ ctx[13] ? /*$padding*/ ctx[16].left : 0)) + ", " + /*$yScale*/ ctx[14](/*tick*/ ctx[22]) + ")")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(32:1) {#each tickVals as tick, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let g;
    	let g_transform_value;
    	let each_value = /*tickVals*/ ctx[15];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "axis y-axis");
    			attr_dev(g, "transform", g_transform_value = "translate(" + -/*$padding*/ ctx[16].left + ", 0)");
    			add_location(g, file$e, 30, 0, 748);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tickVals, $xRange, isBandwidth, $padding, $yScale, xTick, yTick, dxTick, dyTick, textAnchor, textColor, prefix, formatTick, suffix, tickColor, tickMarks, tickDashed, gridlines*/ 262143) {
    				each_value = /*tickVals*/ ctx[15];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*$padding*/ 65536 && g_transform_value !== (g_transform_value = "translate(" + -/*$padding*/ ctx[16].left + ", 0)")) {
    				attr_dev(g, "transform", g_transform_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let isBandwidth;
    	let tickVals;
    	let $yScale;
    	let $padding;
    	let $xRange;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('AxisY', slots, []);
    	const { padding, xRange, yScale } = getContext('LayerCake');
    	validate_store(padding, 'padding');
    	component_subscribe($$self, padding, value => $$invalidate(16, $padding = value));
    	validate_store(xRange, 'xRange');
    	component_subscribe($$self, xRange, value => $$invalidate(17, $xRange = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(14, $yScale = value));
    	let { ticks = 4 } = $$props;
    	let { tickMarks = false } = $$props;
    	let { gridlines = true } = $$props;
    	let { tickDashed = false } = $$props;
    	let { tickColor = '#bbb' } = $$props;
    	let { textColor = '#666' } = $$props;
    	let { formatTick = d => d } = $$props;
    	let { xTick = 0 } = $$props;
    	let { yTick = 0 } = $$props;
    	let { dxTick = 0 } = $$props;
    	let { dyTick = -4 } = $$props;
    	let { textAnchor = 'start' } = $$props;
    	let { prefix = '' } = $$props;
    	let { suffix = '' } = $$props;

    	const writable_props = [
    		'ticks',
    		'tickMarks',
    		'gridlines',
    		'tickDashed',
    		'tickColor',
    		'textColor',
    		'formatTick',
    		'xTick',
    		'yTick',
    		'dxTick',
    		'dyTick',
    		'textAnchor',
    		'prefix',
    		'suffix'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<AxisY> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('ticks' in $$props) $$invalidate(21, ticks = $$props.ticks);
    		if ('tickMarks' in $$props) $$invalidate(0, tickMarks = $$props.tickMarks);
    		if ('gridlines' in $$props) $$invalidate(1, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(2, tickDashed = $$props.tickDashed);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('xTick' in $$props) $$invalidate(6, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(7, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(8, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(9, dyTick = $$props.dyTick);
    		if ('textAnchor' in $$props) $$invalidate(10, textAnchor = $$props.textAnchor);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		padding,
    		xRange,
    		yScale,
    		ticks,
    		tickMarks,
    		gridlines,
    		tickDashed,
    		tickColor,
    		textColor,
    		formatTick,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		prefix,
    		suffix,
    		isBandwidth,
    		tickVals,
    		$yScale,
    		$padding,
    		$xRange
    	});

    	$$self.$inject_state = $$props => {
    		if ('ticks' in $$props) $$invalidate(21, ticks = $$props.ticks);
    		if ('tickMarks' in $$props) $$invalidate(0, tickMarks = $$props.tickMarks);
    		if ('gridlines' in $$props) $$invalidate(1, gridlines = $$props.gridlines);
    		if ('tickDashed' in $$props) $$invalidate(2, tickDashed = $$props.tickDashed);
    		if ('tickColor' in $$props) $$invalidate(3, tickColor = $$props.tickColor);
    		if ('textColor' in $$props) $$invalidate(4, textColor = $$props.textColor);
    		if ('formatTick' in $$props) $$invalidate(5, formatTick = $$props.formatTick);
    		if ('xTick' in $$props) $$invalidate(6, xTick = $$props.xTick);
    		if ('yTick' in $$props) $$invalidate(7, yTick = $$props.yTick);
    		if ('dxTick' in $$props) $$invalidate(8, dxTick = $$props.dxTick);
    		if ('dyTick' in $$props) $$invalidate(9, dyTick = $$props.dyTick);
    		if ('textAnchor' in $$props) $$invalidate(10, textAnchor = $$props.textAnchor);
    		if ('prefix' in $$props) $$invalidate(11, prefix = $$props.prefix);
    		if ('suffix' in $$props) $$invalidate(12, suffix = $$props.suffix);
    		if ('isBandwidth' in $$props) $$invalidate(13, isBandwidth = $$props.isBandwidth);
    		if ('tickVals' in $$props) $$invalidate(15, tickVals = $$props.tickVals);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$yScale*/ 16384) {
    			 $$invalidate(13, isBandwidth = typeof $yScale.bandwidth === 'function');
    		}

    		if ($$self.$$.dirty & /*ticks, isBandwidth, $yScale*/ 2121728) {
    			 $$invalidate(15, tickVals = Array.isArray(ticks)
    			? ticks
    			: isBandwidth
    				? $yScale.domain()
    				: typeof ticks === 'function'
    					? ticks($yScale.ticks())
    					: $yScale.ticks(ticks));
    		}
    	};

    	return [
    		tickMarks,
    		gridlines,
    		tickDashed,
    		tickColor,
    		textColor,
    		formatTick,
    		xTick,
    		yTick,
    		dxTick,
    		dyTick,
    		textAnchor,
    		prefix,
    		suffix,
    		isBandwidth,
    		$yScale,
    		tickVals,
    		$padding,
    		$xRange,
    		padding,
    		xRange,
    		yScale,
    		ticks
    	];
    }

    class AxisY extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			ticks: 21,
    			tickMarks: 0,
    			gridlines: 1,
    			tickDashed: 2,
    			tickColor: 3,
    			textColor: 4,
    			formatTick: 5,
    			xTick: 6,
    			yTick: 7,
    			dxTick: 8,
    			dyTick: 9,
    			textAnchor: 10,
    			prefix: 11,
    			suffix: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AxisY",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get ticks() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ticks(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickMarks() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickMarks(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get gridlines() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set gridlines(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickDashed() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickDashed(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tickColor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tickColor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textColor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textColor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get formatTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set formatTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get xTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set xTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get yTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set yTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dxTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dxTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dyTick() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dyTick(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get textAnchor() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textAnchor(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get suffix() {
    		throw new Error("<AxisY>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set suffix(value) {
    		throw new Error("<AxisY>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\Legend.svelte generated by Svelte v3.44.1 */

    const file$f = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Legend.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[10] = i;
    	return child_ctx;
    }

    // (12:0) {#if Array.isArray(domain) && Array.isArray(colors)}
    function create_if_block$7(ctx) {
    	let ul;
    	let each_value = /*domain*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "legend svelte-1w19nmy");
    			add_location(ul, file$f, 12, 2, 483);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*domain, colors, horizontal, line, comparison, markerWidth, markerLength, round*/ 255) {
    				each_value = /*domain*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(12:0) {#if Array.isArray(domain) && Array.isArray(colors)}",
    		ctx
    	});

    	return block;
    }

    // (14:4) {#each domain as label, i}
    function create_each_block$2(ctx) {
    	let li;
    	let div;
    	let t0;
    	let t1_value = /*label*/ ctx[8] + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			div = element("div");
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(div, "class", "bullet svelte-1w19nmy");
    			set_style(div, "background-color", /*colors*/ ctx[1][/*i*/ ctx[10]]);

    			set_style(div, "width", (!/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    			? /*markerWidth*/ ctx[5]
    			: /*markerLength*/ ctx[6]) + "px");

    			set_style(div, "height", (/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    			? /*markerWidth*/ ctx[5]
    			: /*markerLength*/ ctx[6]) + "px");

    			toggle_class(div, "round", /*round*/ ctx[7]);
    			add_location(div, file$f, 15, 8, 553);
    			attr_dev(li, "class", "svelte-1w19nmy");
    			add_location(li, file$f, 14, 6, 540);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*colors*/ 2) {
    				set_style(div, "background-color", /*colors*/ ctx[1][/*i*/ ctx[10]]);
    			}

    			if (dirty & /*horizontal, line, comparison, markerWidth, markerLength*/ 124) {
    				set_style(div, "width", (!/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    				? /*markerWidth*/ ctx[5]
    				: /*markerLength*/ ctx[6]) + "px");
    			}

    			if (dirty & /*horizontal, line, comparison, markerWidth, markerLength*/ 124) {
    				set_style(div, "height", (/*horizontal*/ ctx[4] && (/*line*/ ctx[2] || /*comparison*/ ctx[3] && /*i*/ ctx[10] != 0)
    				? /*markerWidth*/ ctx[5]
    				: /*markerLength*/ ctx[6]) + "px");
    			}

    			if (dirty & /*round*/ 128) {
    				toggle_class(div, "round", /*round*/ ctx[7]);
    			}

    			if (dirty & /*domain*/ 1 && t1_value !== (t1_value = /*label*/ ctx[8] + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(14:4) {#each domain as label, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let show_if = Array.isArray(/*domain*/ ctx[0]) && Array.isArray(/*colors*/ ctx[1]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block$7(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*domain, colors*/ 3) show_if = Array.isArray(/*domain*/ ctx[0]) && Array.isArray(/*colors*/ ctx[1]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$7(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Legend', slots, []);
    	let { domain = null } = $$props;
    	let { colors = null } = $$props;
    	let { line = false } = $$props;
    	let { comparison = false } = $$props;
    	let { horizontal = true } = $$props;
    	let { markerWidth = 2.5 } = $$props;
    	let { markerLength = 13 } = $$props;
    	let { round = false } = $$props;

    	const writable_props = [
    		'domain',
    		'colors',
    		'line',
    		'comparison',
    		'horizontal',
    		'markerWidth',
    		'markerLength',
    		'round'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Legend> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('domain' in $$props) $$invalidate(0, domain = $$props.domain);
    		if ('colors' in $$props) $$invalidate(1, colors = $$props.colors);
    		if ('line' in $$props) $$invalidate(2, line = $$props.line);
    		if ('comparison' in $$props) $$invalidate(3, comparison = $$props.comparison);
    		if ('horizontal' in $$props) $$invalidate(4, horizontal = $$props.horizontal);
    		if ('markerWidth' in $$props) $$invalidate(5, markerWidth = $$props.markerWidth);
    		if ('markerLength' in $$props) $$invalidate(6, markerLength = $$props.markerLength);
    		if ('round' in $$props) $$invalidate(7, round = $$props.round);
    	};

    	$$self.$capture_state = () => ({
    		domain,
    		colors,
    		line,
    		comparison,
    		horizontal,
    		markerWidth,
    		markerLength,
    		round
    	});

    	$$self.$inject_state = $$props => {
    		if ('domain' in $$props) $$invalidate(0, domain = $$props.domain);
    		if ('colors' in $$props) $$invalidate(1, colors = $$props.colors);
    		if ('line' in $$props) $$invalidate(2, line = $$props.line);
    		if ('comparison' in $$props) $$invalidate(3, comparison = $$props.comparison);
    		if ('horizontal' in $$props) $$invalidate(4, horizontal = $$props.horizontal);
    		if ('markerWidth' in $$props) $$invalidate(5, markerWidth = $$props.markerWidth);
    		if ('markerLength' in $$props) $$invalidate(6, markerLength = $$props.markerLength);
    		if ('round' in $$props) $$invalidate(7, round = $$props.round);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [domain, colors, line, comparison, horizontal, markerWidth, markerLength, round];
    }

    class Legend extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {
    			domain: 0,
    			colors: 1,
    			line: 2,
    			comparison: 3,
    			horizontal: 4,
    			markerWidth: 5,
    			markerLength: 6,
    			round: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Legend",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get domain() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set domain(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get line() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set line(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get comparison() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set comparison(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get horizontal() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set horizontal(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markerWidth() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markerWidth(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markerLength() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markerLength(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get round() {
    		throw new Error("<Legend>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set round(value) {
    		throw new Error("<Legend>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\Title.svelte generated by Svelte v3.44.1 */

    const file$g = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Title.svelte";

    function create_fragment$h(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "title svelte-b06b69");
    			add_location(div, file$g, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Title', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Title> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Title extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Title",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\Footer.svelte generated by Svelte v3.44.1 */

    const file$h = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Footer.svelte";

    function create_fragment$i(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "footer svelte-7jvwfp");
    			add_location(div, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\Labels.svelte generated by Svelte v3.44.1 */
    const file$i = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Labels.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (16:0) {#if $coords}
    function create_if_block$8(ctx) {
    	let defs;
    	let filter;
    	let feFlood;
    	let feMerge;
    	let feMergeNode0;
    	let feMergeNode1;
    	let t;
    	let g;

    	function select_block_type(ctx, dirty) {
    		if (/*$coords*/ ctx[2][0] && /*$coords*/ ctx[2][0].x) return create_if_block_1$4;
    		if (/*$coords*/ ctx[2][0] && /*$coords*/ ctx[2][0][0] && /*$coords*/ ctx[2][0][0].x) return create_if_block_3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			defs = svg_element("defs");
    			filter = svg_element("filter");
    			feFlood = svg_element("feFlood");
    			feMerge = svg_element("feMerge");
    			feMergeNode0 = svg_element("feMergeNode");
    			feMergeNode1 = svg_element("feMergeNode");
    			t = space();
    			g = svg_element("g");
    			if (if_block) if_block.c();
    			attr_dev(feFlood, "flood-color", "rgba(255,255,255,0.8)");
    			attr_dev(feFlood, "result", "bg");
    			add_location(feFlood, file$i, 18, 2, 506);
    			attr_dev(feMergeNode0, "in", "bg");
    			add_location(feMergeNode0, file$i, 20, 3, 581);
    			attr_dev(feMergeNode1, "in", "SourceGraphic");
    			add_location(feMergeNode1, file$i, 21, 3, 607);
    			add_location(feMerge, file$i, 19, 2, 568);
    			attr_dev(filter, "x", "0");
    			attr_dev(filter, "y", "0");
    			attr_dev(filter, "width", "1");
    			attr_dev(filter, "height", "1");
    			attr_dev(filter, "id", "bgfill");
    			add_location(filter, file$i, 17, 1, 450);
    			add_location(defs, file$i, 16, 0, 442);
    			attr_dev(g, "class", "label-group");
    			add_location(g, file$i, 25, 0, 673);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, defs, anchor);
    			append_dev(defs, filter);
    			append_dev(filter, feFlood);
    			append_dev(filter, feMerge);
    			append_dev(feMerge, feMergeNode0);
    			append_dev(feMerge, feMergeNode1);
    			insert_dev(target, t, anchor);
    			insert_dev(target, g, anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(g, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(defs);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(g);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(16:0) {#if $coords}",
    		ctx
    	});

    	return block;
    }

    // (41:58) 
    function create_if_block_3(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*$coords*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords, $yScale, $data, labelKey, hovered, selected, idKey*/ 6207) {
    				each_value_1 = /*$coords*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(41:58) ",
    		ctx
    	});

    	return block;
    }

    // (27:1) {#if $coords[0] && $coords[0].x}
    function create_if_block_1$4(ctx) {
    	let each_1_anchor;
    	let each_value = /*$coords*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords, $yScale, $data, labelKey, hovered, selected, idKey*/ 6207) {
    				each_value = /*$coords*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(27:1) {#if $coords[0] && $coords[0].x}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {#if [hovered, selected].includes($data[i][0][idKey])}
    function create_if_block_4(ctx) {
    	let text_1;
    	let t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][0][/*labelKey*/ ctx[12]] + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "class", "label svelte-1ijkebl");
    			attr_dev(text_1, "transform", "translate(2,3)");
    			attr_dev(text_1, "filter", "url(#bgfill)");
    			attr_dev(text_1, "fill", "#333");
    			attr_dev(text_1, "x", text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].x));
    			attr_dev(text_1, "y", text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].y));
    			add_location(text_1, file$i, 43, 2, 1142);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 8 && t_value !== (t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][0][/*labelKey*/ ctx[12]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*$xScale, $coords*/ 20 && text_1_x_value !== (text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].x))) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$yScale, $coords*/ 36 && text_1_y_value !== (text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14][/*d*/ ctx[14].length - 1].y))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(43:2) {#if [hovered, selected].includes($data[i][0][idKey])}",
    		ctx
    	});

    	return block;
    }

    // (42:1) {#each $coords as d, i}
    function create_each_block_1(ctx) {
    	let show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][0][/*idKey*/ ctx[11]]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hovered, selected, $data*/ 11) show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][0][/*idKey*/ ctx[11]]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_4(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(42:1) {#each $coords as d, i}",
    		ctx
    	});

    	return block;
    }

    // (29:2) {#if [hovered, selected].includes($data[i][idKey])}
    function create_if_block_2(ctx) {
    	let text_1;
    	let t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][/*labelKey*/ ctx[12]] + "";
    	let t;
    	let text_1_x_value;
    	let text_1_y_value;

    	const block = {
    		c: function create() {
    			text_1 = svg_element("text");
    			t = text(t_value);
    			attr_dev(text_1, "class", "label svelte-1ijkebl");
    			attr_dev(text_1, "transform", "translate(5,-5)");
    			attr_dev(text_1, "filter", "url(#bgfill)");
    			attr_dev(text_1, "fill", "#333");
    			attr_dev(text_1, "x", text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14].x));
    			attr_dev(text_1, "y", text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14].y));
    			add_location(text_1, file$i, 29, 2, 812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, text_1, anchor);
    			append_dev(text_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 8 && t_value !== (t_value = /*$data*/ ctx[3][/*i*/ ctx[16]][/*labelKey*/ ctx[12]] + "")) set_data_dev(t, t_value);

    			if (dirty & /*$xScale, $coords*/ 20 && text_1_x_value !== (text_1_x_value = /*$xScale*/ ctx[4](/*d*/ ctx[14].x))) {
    				attr_dev(text_1, "x", text_1_x_value);
    			}

    			if (dirty & /*$yScale, $coords*/ 36 && text_1_y_value !== (text_1_y_value = /*$yScale*/ ctx[5](/*d*/ ctx[14].y))) {
    				attr_dev(text_1, "y", text_1_y_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(text_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(29:2) {#if [hovered, selected].includes($data[i][idKey])}",
    		ctx
    	});

    	return block;
    }

    // (28:1) {#each $coords as d, i}
    function create_each_block$3(ctx) {
    	let show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][/*idKey*/ ctx[11]]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hovered, selected, $data*/ 11) show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1]].includes(/*$data*/ ctx[3][/*i*/ ctx[16]][/*idKey*/ ctx[11]]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(28:1) {#each $coords as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let if_block_anchor;
    	let if_block = /*$coords*/ ctx[2] && create_if_block$8(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$coords*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$8(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let $custom;
    	let $coords;
    	let $data;
    	let $xScale;
    	let $yScale;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Labels', slots, []);
    	const { data, xScale, yScale, custom } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(3, $data = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(4, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(5, $yScale = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(13, $custom = value));
    	let { hovered = null } = $$props;
    	let { selected = null } = $$props;
    	let coords = $custom.coords;
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(2, $coords = value));
    	let idKey = $custom.idKey;
    	let labelKey = $custom.labelKey;
    	const writable_props = ['hovered', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Labels> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		data,
    		xScale,
    		yScale,
    		custom,
    		hovered,
    		selected,
    		coords,
    		idKey,
    		labelKey,
    		$custom,
    		$coords,
    		$data,
    		$xScale,
    		$yScale
    	});

    	$$self.$inject_state = $$props => {
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('coords' in $$props) $$invalidate(10, coords = $$props.coords);
    		if ('idKey' in $$props) $$invalidate(11, idKey = $$props.idKey);
    		if ('labelKey' in $$props) $$invalidate(12, labelKey = $$props.labelKey);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hovered,
    		selected,
    		$coords,
    		$data,
    		$xScale,
    		$yScale,
    		data,
    		xScale,
    		yScale,
    		custom,
    		coords,
    		idKey,
    		labelKey
    	];
    }

    class Labels extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { hovered: 0, selected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Labels",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get hovered() {
    		throw new Error("<Labels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovered(value) {
    		throw new Error("<Labels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Labels>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Labels>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\Scatter.svg.svelte generated by Svelte v3.44.1 */
    const file$j = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Scatter.svg.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[25] = list[i];
    	child_ctx[27] = i;
    	return child_ctx;
    }

    // (20:0) {#if $coords}
    function create_if_block$9(ctx) {
    	let g;
    	let each_1_anchor;
    	let each_value_1 = /*$coords*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let if_block = /*idKey*/ ctx[19] && (/*hovered*/ ctx[0] || /*selected*/ ctx[1] || /*highlighted*/ ctx[2][0]) && create_if_block_1$5(ctx);

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			if (if_block) if_block.c();
    			attr_dev(g, "class", "scatter-group");
    			add_location(g, file$j, 20, 0, 621);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}

    			append_dev(g, each_1_anchor);
    			if (if_block) if_block.m(g, null);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords, $yScale, $z, $zGet, $data, $zRange*/ 2032) {
    				each_value_1 = /*$coords*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (/*idKey*/ ctx[19] && (/*hovered*/ ctx[0] || /*selected*/ ctx[1] || /*highlighted*/ ctx[2][0])) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$5(ctx);
    					if_block.c();
    					if_block.m(g, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(20:0) {#if $coords}",
    		ctx
    	});

    	return block;
    }

    // (22:1) {#each $coords as d, i}
    function create_each_block_1$1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;
    	let circle_fill_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "");
    			attr_dev(circle, "cx", circle_cx_value = /*$xScale*/ ctx[5](/*d*/ ctx[25].x));
    			attr_dev(circle, "cy", circle_cy_value = /*$yScale*/ ctx[6](/*d*/ ctx[25].y));
    			attr_dev(circle, "r", circle_r_value = /*d*/ ctx[25].r);

    			attr_dev(circle, "fill", circle_fill_value = /*$z*/ ctx[7]
    			? /*$zGet*/ ctx[8](/*$data*/ ctx[9][/*i*/ ctx[27]])
    			: /*$zRange*/ ctx[10][0]);

    			add_location(circle, file$j, 22, 2, 674);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords*/ 48 && circle_cx_value !== (circle_cx_value = /*$xScale*/ ctx[5](/*d*/ ctx[25].x))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*$yScale, $coords*/ 80 && circle_cy_value !== (circle_cy_value = /*$yScale*/ ctx[6](/*d*/ ctx[25].y))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*$coords*/ 16 && circle_r_value !== (circle_r_value = /*d*/ ctx[25].r)) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*$z, $zGet, $data, $zRange*/ 1920 && circle_fill_value !== (circle_fill_value = /*$z*/ ctx[7]
    			? /*$zGet*/ ctx[8](/*$data*/ ctx[9][/*i*/ ctx[27]])
    			: /*$zRange*/ ctx[10][0])) {
    				attr_dev(circle, "fill", circle_fill_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(22:1) {#each $coords as d, i}",
    		ctx
    	});

    	return block;
    }

    // (32:1) {#if idKey && (hovered || selected || highlighted[0])}
    function create_if_block_1$5(ctx) {
    	let each_1_anchor;
    	let each_value = /*$coords*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords, $yScale, overlayFill, $data, idKey, selected, colorSelect, highlighted, colorHighlight, hovered, colorHover, lineWidth*/ 16253567) {
    				each_value = /*$coords*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$5.name,
    		type: "if",
    		source: "(32:1) {#if idKey && (hovered || selected || highlighted[0])}",
    		ctx
    	});

    	return block;
    }

    // (34:2) {#if [hovered, selected, ...highlighted].includes($data[i][idKey])}
    function create_if_block_2$1(ctx) {
    	let circle;
    	let circle_cx_value;
    	let circle_cy_value;
    	let circle_r_value;
    	let circle_fill_value;
    	let circle_stroke_value;
    	let circle_stroke_width_value;

    	const block = {
    		c: function create() {
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "");
    			attr_dev(circle, "cx", circle_cx_value = /*$xScale*/ ctx[5](/*d*/ ctx[25].x));
    			attr_dev(circle, "cy", circle_cy_value = /*$yScale*/ ctx[6](/*d*/ ctx[25].y));
    			attr_dev(circle, "r", circle_r_value = /*d*/ ctx[25].r);

    			attr_dev(circle, "fill", circle_fill_value = /*overlayFill*/ ctx[3] && /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*selected*/ ctx[1]
    			? /*colorSelect*/ ctx[21]
    			: /*overlayFill*/ ctx[3] & /*highlighted*/ ctx[2].includes(/*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]])
    				? /*colorHighlight*/ ctx[22]
    				: 'none');

    			attr_dev(circle, "stroke", circle_stroke_value = /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*hovered*/ ctx[0]
    			? /*colorHover*/ ctx[20]
    			: /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*selected*/ ctx[1]
    				? /*colorSelect*/ ctx[21]
    				: /*colorHighlight*/ ctx[22]);

    			attr_dev(circle, "stroke-width", circle_stroke_width_value = /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*hovered*/ ctx[0] || /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*selected*/ ctx[1] || /*highlighted*/ ctx[2].includes(/*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]])
    			? /*lineWidth*/ ctx[23]
    			: 0);

    			add_location(circle, file$j, 34, 2, 961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, circle, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$xScale, $coords*/ 48 && circle_cx_value !== (circle_cx_value = /*$xScale*/ ctx[5](/*d*/ ctx[25].x))) {
    				attr_dev(circle, "cx", circle_cx_value);
    			}

    			if (dirty & /*$yScale, $coords*/ 80 && circle_cy_value !== (circle_cy_value = /*$yScale*/ ctx[6](/*d*/ ctx[25].y))) {
    				attr_dev(circle, "cy", circle_cy_value);
    			}

    			if (dirty & /*$coords*/ 16 && circle_r_value !== (circle_r_value = /*d*/ ctx[25].r)) {
    				attr_dev(circle, "r", circle_r_value);
    			}

    			if (dirty & /*overlayFill, $data, selected, highlighted*/ 526 && circle_fill_value !== (circle_fill_value = /*overlayFill*/ ctx[3] && /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*selected*/ ctx[1]
    			? /*colorSelect*/ ctx[21]
    			: /*overlayFill*/ ctx[3] & /*highlighted*/ ctx[2].includes(/*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]])
    				? /*colorHighlight*/ ctx[22]
    				: 'none')) {
    				attr_dev(circle, "fill", circle_fill_value);
    			}

    			if (dirty & /*$data, hovered, selected*/ 515 && circle_stroke_value !== (circle_stroke_value = /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*hovered*/ ctx[0]
    			? /*colorHover*/ ctx[20]
    			: /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*selected*/ ctx[1]
    				? /*colorSelect*/ ctx[21]
    				: /*colorHighlight*/ ctx[22])) {
    				attr_dev(circle, "stroke", circle_stroke_value);
    			}

    			if (dirty & /*$data, hovered, selected, highlighted*/ 519 && circle_stroke_width_value !== (circle_stroke_width_value = /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*hovered*/ ctx[0] || /*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]] == /*selected*/ ctx[1] || /*highlighted*/ ctx[2].includes(/*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]])
    			? /*lineWidth*/ ctx[23]
    			: 0)) {
    				attr_dev(circle, "stroke-width", circle_stroke_width_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(circle);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(34:2) {#if [hovered, selected, ...highlighted].includes($data[i][idKey])}",
    		ctx
    	});

    	return block;
    }

    // (33:1) {#each $coords as d, i}
    function create_each_block$4(ctx) {
    	let show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1], .../*highlighted*/ ctx[2]].includes(/*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]]);
    	let if_block_anchor;
    	let if_block = show_if && create_if_block_2$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hovered, selected, highlighted, $data*/ 519) show_if = [/*hovered*/ ctx[0], /*selected*/ ctx[1], .../*highlighted*/ ctx[2]].includes(/*$data*/ ctx[9][/*i*/ ctx[27]][/*idKey*/ ctx[19]]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_2$1(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(33:1) {#each $coords as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$k(ctx) {
    	let if_block_anchor;
    	let if_block = /*$coords*/ ctx[4] && create_if_block$9(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$coords*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$9(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let $custom;
    	let $coords;
    	let $xScale;
    	let $yScale;
    	let $z;
    	let $zGet;
    	let $data;
    	let $zRange;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Scatter_svg', slots, []);
    	const { data, z, xScale, yScale, zGet, zRange, custom } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(9, $data = value));
    	validate_store(z, 'z');
    	component_subscribe($$self, z, value => $$invalidate(7, $z = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(5, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(6, $yScale = value));
    	validate_store(zGet, 'zGet');
    	component_subscribe($$self, zGet, value => $$invalidate(8, $zGet = value));
    	validate_store(zRange, 'zRange');
    	component_subscribe($$self, zRange, value => $$invalidate(10, $zRange = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(24, $custom = value));
    	let { hovered = null } = $$props;
    	let { selected = null } = $$props;
    	let { highlighted = [] } = $$props;
    	let { overlayFill = false } = $$props;
    	let coords = $custom.coords;
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(4, $coords = value));
    	let idKey = $custom.idKey;
    	let colorHover = $custom.colorHover ? $custom.colorHover : 'orange';
    	let colorSelect = $custom.colorSelect ? $custom.colorSelect : 'black';

    	let colorHighlight = $custom.colorHighlight
    	? $custom.colorHighlight
    	: 'black';

    	let lineWidth = $custom.lineWidth ? $custom.lineWidth : 2;
    	const writable_props = ['hovered', 'selected', 'highlighted', 'overlayFill'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Scatter_svg> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('highlighted' in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ('overlayFill' in $$props) $$invalidate(3, overlayFill = $$props.overlayFill);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		data,
    		z,
    		xScale,
    		yScale,
    		zGet,
    		zRange,
    		custom,
    		hovered,
    		selected,
    		highlighted,
    		overlayFill,
    		coords,
    		idKey,
    		colorHover,
    		colorSelect,
    		colorHighlight,
    		lineWidth,
    		$custom,
    		$coords,
    		$xScale,
    		$yScale,
    		$z,
    		$zGet,
    		$data,
    		$zRange
    	});

    	$$self.$inject_state = $$props => {
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('highlighted' in $$props) $$invalidate(2, highlighted = $$props.highlighted);
    		if ('overlayFill' in $$props) $$invalidate(3, overlayFill = $$props.overlayFill);
    		if ('coords' in $$props) $$invalidate(18, coords = $$props.coords);
    		if ('idKey' in $$props) $$invalidate(19, idKey = $$props.idKey);
    		if ('colorHover' in $$props) $$invalidate(20, colorHover = $$props.colorHover);
    		if ('colorSelect' in $$props) $$invalidate(21, colorSelect = $$props.colorSelect);
    		if ('colorHighlight' in $$props) $$invalidate(22, colorHighlight = $$props.colorHighlight);
    		if ('lineWidth' in $$props) $$invalidate(23, lineWidth = $$props.lineWidth);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hovered,
    		selected,
    		highlighted,
    		overlayFill,
    		$coords,
    		$xScale,
    		$yScale,
    		$z,
    		$zGet,
    		$data,
    		$zRange,
    		data,
    		z,
    		xScale,
    		yScale,
    		zGet,
    		zRange,
    		custom,
    		coords,
    		idKey,
    		colorHover,
    		colorSelect,
    		colorHighlight,
    		lineWidth
    	];
    }

    class Scatter_svg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {
    			hovered: 0,
    			selected: 1,
    			highlighted: 2,
    			overlayFill: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scatter_svg",
    			options,
    			id: create_fragment$k.name
    		});
    	}

    	get hovered() {
    		throw new Error("<Scatter_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovered(value) {
    		throw new Error("<Scatter_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Scatter_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Scatter_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get highlighted() {
    		throw new Error("<Scatter_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set highlighted(value) {
    		throw new Error("<Scatter_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get overlayFill() {
    		throw new Error("<Scatter_svg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set overlayFill(value) {
    		throw new Error("<Scatter_svg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const epsilon = 1.1102230246251565e-16;
    const splitter = 134217729;
    const resulterrbound = (3 + 8 * epsilon) * epsilon;

    // fast_expansion_sum_zeroelim routine from oritinal code
    function sum(elen, e, flen, f, h) {
        let Q, Qnew, hh, bvirt;
        let enow = e[0];
        let fnow = f[0];
        let eindex = 0;
        let findex = 0;
        if ((fnow > enow) === (fnow > -enow)) {
            Q = enow;
            enow = e[++eindex];
        } else {
            Q = fnow;
            fnow = f[++findex];
        }
        let hindex = 0;
        if (eindex < elen && findex < flen) {
            if ((fnow > enow) === (fnow > -enow)) {
                Qnew = enow + Q;
                hh = Q - (Qnew - enow);
                enow = e[++eindex];
            } else {
                Qnew = fnow + Q;
                hh = Q - (Qnew - fnow);
                fnow = f[++findex];
            }
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
            while (eindex < elen && findex < flen) {
                if ((fnow > enow) === (fnow > -enow)) {
                    Qnew = Q + enow;
                    bvirt = Qnew - Q;
                    hh = Q - (Qnew - bvirt) + (enow - bvirt);
                    enow = e[++eindex];
                } else {
                    Qnew = Q + fnow;
                    bvirt = Qnew - Q;
                    hh = Q - (Qnew - bvirt) + (fnow - bvirt);
                    fnow = f[++findex];
                }
                Q = Qnew;
                if (hh !== 0) {
                    h[hindex++] = hh;
                }
            }
        }
        while (eindex < elen) {
            Qnew = Q + enow;
            bvirt = Qnew - Q;
            hh = Q - (Qnew - bvirt) + (enow - bvirt);
            enow = e[++eindex];
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
        }
        while (findex < flen) {
            Qnew = Q + fnow;
            bvirt = Qnew - Q;
            hh = Q - (Qnew - bvirt) + (fnow - bvirt);
            fnow = f[++findex];
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
        }
        if (Q !== 0 || hindex === 0) {
            h[hindex++] = Q;
        }
        return hindex;
    }

    function estimate(elen, e) {
        let Q = e[0];
        for (let i = 1; i < elen; i++) Q += e[i];
        return Q;
    }

    function vec(n) {
        return new Float64Array(n);
    }

    const ccwerrboundA = (3 + 16 * epsilon) * epsilon;
    const ccwerrboundB = (2 + 12 * epsilon) * epsilon;
    const ccwerrboundC = (9 + 64 * epsilon) * epsilon * epsilon;

    const B = vec(4);
    const C1 = vec(8);
    const C2 = vec(12);
    const D = vec(16);
    const u = vec(4);

    function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
        let acxtail, acytail, bcxtail, bcytail;
        let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

        const acx = ax - cx;
        const bcx = bx - cx;
        const acy = ay - cy;
        const bcy = by - cy;

        s1 = acx * bcy;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcx;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        B[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        B[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        B[2] = _j - (u3 - bvirt) + (_i - bvirt);
        B[3] = u3;

        let det = estimate(4, B);
        let errbound = ccwerrboundB * detsum;
        if (det >= errbound || -det >= errbound) {
            return det;
        }

        bvirt = ax - acx;
        acxtail = ax - (acx + bvirt) + (bvirt - cx);
        bvirt = bx - bcx;
        bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
        bvirt = ay - acy;
        acytail = ay - (acy + bvirt) + (bvirt - cy);
        bvirt = by - bcy;
        bcytail = by - (bcy + bvirt) + (bvirt - cy);

        if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
            return det;
        }

        errbound = ccwerrboundC * detsum + resulterrbound * Math.abs(det);
        det += (acx * bcytail + bcy * acxtail) - (acy * bcxtail + bcx * acytail);
        if (det >= errbound || -det >= errbound) return det;

        s1 = acxtail * bcy;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcy;
        bhi = c - (c - bcy);
        blo = bcy - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcx;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcx;
        bhi = c - (c - bcx);
        blo = bcx - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C1len = sum(4, B, 4, u, C1);

        s1 = acx * bcytail;
        c = splitter * acx;
        ahi = c - (c - acx);
        alo = acx - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acy * bcxtail;
        c = splitter * acy;
        ahi = c - (c - acy);
        alo = acy - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const C2len = sum(C1len, C1, 4, u, C2);

        s1 = acxtail * bcytail;
        c = splitter * acxtail;
        ahi = c - (c - acxtail);
        alo = acxtail - ahi;
        c = splitter * bcytail;
        bhi = c - (c - bcytail);
        blo = bcytail - bhi;
        s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
        t1 = acytail * bcxtail;
        c = splitter * acytail;
        ahi = c - (c - acytail);
        alo = acytail - ahi;
        c = splitter * bcxtail;
        bhi = c - (c - bcxtail);
        blo = bcxtail - bhi;
        t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
        _i = s0 - t0;
        bvirt = s0 - _i;
        u[0] = s0 - (_i + bvirt) + (bvirt - t0);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 - t1;
        bvirt = _0 - _i;
        u[1] = _0 - (_i + bvirt) + (bvirt - t1);
        u3 = _j + _i;
        bvirt = u3 - _j;
        u[2] = _j - (u3 - bvirt) + (_i - bvirt);
        u[3] = u3;
        const Dlen = sum(C2len, C2, 4, u, D);

        return D[Dlen - 1];
    }

    function orient2d(ax, ay, bx, by, cx, cy) {
        const detleft = (ay - cy) * (bx - cx);
        const detright = (ax - cx) * (by - cy);
        const det = detleft - detright;

        if (detleft === 0 || detright === 0 || (detleft > 0) !== (detright > 0)) return det;

        const detsum = Math.abs(detleft + detright);
        if (Math.abs(det) >= ccwerrboundA * detsum) return det;

        return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
    }

    const EPSILON = Math.pow(2, -52);
    const EDGE_STACK = new Uint32Array(512);

    class Delaunator {

        static from(points, getX = defaultGetX, getY = defaultGetY) {
            const n = points.length;
            const coords = new Float64Array(n * 2);

            for (let i = 0; i < n; i++) {
                const p = points[i];
                coords[2 * i] = getX(p);
                coords[2 * i + 1] = getY(p);
            }

            return new Delaunator(coords);
        }

        constructor(coords) {
            const n = coords.length >> 1;
            if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');

            this.coords = coords;

            // arrays that will store the triangulation graph
            const maxTriangles = Math.max(2 * n - 5, 0);
            this._triangles = new Uint32Array(maxTriangles * 3);
            this._halfedges = new Int32Array(maxTriangles * 3);

            // temporary arrays for tracking the edges of the advancing convex hull
            this._hashSize = Math.ceil(Math.sqrt(n));
            this._hullPrev = new Uint32Array(n); // edge to prev edge
            this._hullNext = new Uint32Array(n); // edge to next edge
            this._hullTri = new Uint32Array(n); // edge to adjacent triangle
            this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash

            // temporary arrays for sorting points
            this._ids = new Uint32Array(n);
            this._dists = new Float64Array(n);

            this.update();
        }

        update() {
            const {coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash} =  this;
            const n = coords.length >> 1;

            // populate an array of point indices; calculate input data bbox
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < n; i++) {
                const x = coords[2 * i];
                const y = coords[2 * i + 1];
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
                this._ids[i] = i;
            }
            const cx = (minX + maxX) / 2;
            const cy = (minY + maxY) / 2;

            let minDist = Infinity;
            let i0, i1, i2;

            // pick a seed point close to the center
            for (let i = 0; i < n; i++) {
                const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist) {
                    i0 = i;
                    minDist = d;
                }
            }
            const i0x = coords[2 * i0];
            const i0y = coords[2 * i0 + 1];

            minDist = Infinity;

            // find the point closest to the seed
            for (let i = 0; i < n; i++) {
                if (i === i0) continue;
                const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
                if (d < minDist && d > 0) {
                    i1 = i;
                    minDist = d;
                }
            }
            let i1x = coords[2 * i1];
            let i1y = coords[2 * i1 + 1];

            let minRadius = Infinity;

            // find the third point which forms the smallest circumcircle with the first two
            for (let i = 0; i < n; i++) {
                if (i === i0 || i === i1) continue;
                const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
                if (r < minRadius) {
                    i2 = i;
                    minRadius = r;
                }
            }
            let i2x = coords[2 * i2];
            let i2y = coords[2 * i2 + 1];

            if (minRadius === Infinity) {
                // order collinear points by dx (or dy if all x are identical)
                // and return the list as a hull
                for (let i = 0; i < n; i++) {
                    this._dists[i] = (coords[2 * i] - coords[0]) || (coords[2 * i + 1] - coords[1]);
                }
                quicksort(this._ids, this._dists, 0, n - 1);
                const hull = new Uint32Array(n);
                let j = 0;
                for (let i = 0, d0 = -Infinity; i < n; i++) {
                    const id = this._ids[i];
                    if (this._dists[id] > d0) {
                        hull[j++] = id;
                        d0 = this._dists[id];
                    }
                }
                this.hull = hull.subarray(0, j);
                this.triangles = new Uint32Array(0);
                this.halfedges = new Uint32Array(0);
                return;
            }

            // swap the order of the seed points for counter-clockwise orientation
            if (orient2d(i0x, i0y, i1x, i1y, i2x, i2y) < 0) {
                const i = i1;
                const x = i1x;
                const y = i1y;
                i1 = i2;
                i1x = i2x;
                i1y = i2y;
                i2 = i;
                i2x = x;
                i2y = y;
            }

            const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
            this._cx = center.x;
            this._cy = center.y;

            for (let i = 0; i < n; i++) {
                this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
            }

            // sort the points by distance from the seed triangle circumcenter
            quicksort(this._ids, this._dists, 0, n - 1);

            // set up the seed triangle as the starting hull
            this._hullStart = i0;
            let hullSize = 3;

            hullNext[i0] = hullPrev[i2] = i1;
            hullNext[i1] = hullPrev[i0] = i2;
            hullNext[i2] = hullPrev[i1] = i0;

            hullTri[i0] = 0;
            hullTri[i1] = 1;
            hullTri[i2] = 2;

            hullHash.fill(-1);
            hullHash[this._hashKey(i0x, i0y)] = i0;
            hullHash[this._hashKey(i1x, i1y)] = i1;
            hullHash[this._hashKey(i2x, i2y)] = i2;

            this.trianglesLen = 0;
            this._addTriangle(i0, i1, i2, -1, -1, -1);

            for (let k = 0, xp, yp; k < this._ids.length; k++) {
                const i = this._ids[k];
                const x = coords[2 * i];
                const y = coords[2 * i + 1];

                // skip near-duplicate points
                if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON) continue;
                xp = x;
                yp = y;

                // skip seed triangle points
                if (i === i0 || i === i1 || i === i2) continue;

                // find a visible edge on the convex hull using edge hash
                let start = 0;
                for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                    start = hullHash[(key + j) % this._hashSize];
                    if (start !== -1 && start !== hullNext[start]) break;
                }

                start = hullPrev[start];
                let e = start, q;
                while (q = hullNext[e], orient2d(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1]) >= 0) {
                    e = q;
                    if (e === start) {
                        e = -1;
                        break;
                    }
                }
                if (e === -1) continue; // likely a near-duplicate point; skip it

                // add the first triangle from the point
                let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

                // recursively flip triangles from the point until they satisfy the Delaunay condition
                hullTri[i] = this._legalize(t + 2);
                hullTri[e] = t; // keep track of boundary triangles on the hull
                hullSize++;

                // walk forward through the hull, adding more triangles and flipping recursively
                let n = hullNext[e];
                while (q = hullNext[n], orient2d(x, y, coords[2 * n], coords[2 * n + 1], coords[2 * q], coords[2 * q + 1]) < 0) {
                    t = this._addTriangle(n, i, q, hullTri[i], -1, hullTri[n]);
                    hullTri[i] = this._legalize(t + 2);
                    hullNext[n] = n; // mark as removed
                    hullSize--;
                    n = q;
                }

                // walk backward from the other side, adding more triangles and flipping
                if (e === start) {
                    while (q = hullPrev[e], orient2d(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1]) < 0) {
                        t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                        this._legalize(t + 2);
                        hullTri[q] = t;
                        hullNext[e] = e; // mark as removed
                        hullSize--;
                        e = q;
                    }
                }

                // update the hull indices
                this._hullStart = hullPrev[i] = e;
                hullNext[e] = hullPrev[n] = i;
                hullNext[i] = n;

                // save the two new edges in the hash table
                hullHash[this._hashKey(x, y)] = i;
                hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
            }

            this.hull = new Uint32Array(hullSize);
            for (let i = 0, e = this._hullStart; i < hullSize; i++) {
                this.hull[i] = e;
                e = hullNext[e];
            }

            // trim typed triangle mesh arrays
            this.triangles = this._triangles.subarray(0, this.trianglesLen);
            this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
        }

        _hashKey(x, y) {
            return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
        }

        _legalize(a) {
            const {_triangles: triangles, _halfedges: halfedges, coords} = this;

            let i = 0;
            let ar = 0;

            // recursion eliminated with a fixed-size stack
            while (true) {
                const b = halfedges[a];

                /* if the pair of triangles doesn't satisfy the Delaunay condition
                 * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
                 * then do the same check/flip recursively for the new pair of triangles
                 *
                 *           pl                    pl
                 *          /||\                  /  \
                 *       al/ || \bl            al/    \a
                 *        /  ||  \              /      \
                 *       /  a||b  \    flip    /___ar___\
                 *     p0\   ||   /p1   =>   p0\---bl---/p1
                 *        \  ||  /              \      /
                 *       ar\ || /br             b\    /br
                 *          \||/                  \  /
                 *           pr                    pr
                 */
                const a0 = a - a % 3;
                ar = a0 + (a + 2) % 3;

                if (b === -1) { // convex hull edge
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                    continue;
                }

                const b0 = b - b % 3;
                const al = a0 + (a + 1) % 3;
                const bl = b0 + (b + 2) % 3;

                const p0 = triangles[ar];
                const pr = triangles[a];
                const pl = triangles[al];
                const p1 = triangles[bl];

                const illegal = inCircle(
                    coords[2 * p0], coords[2 * p0 + 1],
                    coords[2 * pr], coords[2 * pr + 1],
                    coords[2 * pl], coords[2 * pl + 1],
                    coords[2 * p1], coords[2 * p1 + 1]);

                if (illegal) {
                    triangles[a] = p1;
                    triangles[b] = p0;

                    const hbl = halfedges[bl];

                    // edge swapped on the other side of the hull (rare); fix the halfedge reference
                    if (hbl === -1) {
                        let e = this._hullStart;
                        do {
                            if (this._hullTri[e] === bl) {
                                this._hullTri[e] = a;
                                break;
                            }
                            e = this._hullPrev[e];
                        } while (e !== this._hullStart);
                    }
                    this._link(a, hbl);
                    this._link(b, halfedges[ar]);
                    this._link(ar, bl);

                    const br = b0 + (b + 1) % 3;

                    // don't worry about hitting the cap: it can only happen on extremely degenerate input
                    if (i < EDGE_STACK.length) {
                        EDGE_STACK[i++] = br;
                    }
                } else {
                    if (i === 0) break;
                    a = EDGE_STACK[--i];
                }
            }

            return ar;
        }

        _link(a, b) {
            this._halfedges[a] = b;
            if (b !== -1) this._halfedges[b] = a;
        }

        // add a new triangle given vertex indices and adjacent half-edge ids
        _addTriangle(i0, i1, i2, a, b, c) {
            const t = this.trianglesLen;

            this._triangles[t] = i0;
            this._triangles[t + 1] = i1;
            this._triangles[t + 2] = i2;

            this._link(t, a);
            this._link(t + 1, b);
            this._link(t + 2, c);

            this.trianglesLen += 3;

            return t;
        }
    }

    // monotonically increases with real angle, but doesn't need expensive trigonometry
    function pseudoAngle(dx, dy) {
        const p = dx / (Math.abs(dx) + Math.abs(dy));
        return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
    }

    function dist(ax, ay, bx, by) {
        const dx = ax - bx;
        const dy = ay - by;
        return dx * dx + dy * dy;
    }

    function inCircle(ax, ay, bx, by, cx, cy, px, py) {
        const dx = ax - px;
        const dy = ay - py;
        const ex = bx - px;
        const ey = by - py;
        const fx = cx - px;
        const fy = cy - py;

        const ap = dx * dx + dy * dy;
        const bp = ex * ex + ey * ey;
        const cp = fx * fx + fy * fy;

        return dx * (ey * cp - bp * fy) -
               dy * (ex * cp - bp * fx) +
               ap * (ex * fy - ey * fx) < 0;
    }

    function circumradius(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = (ey * bl - dy * cl) * d;
        const y = (dx * cl - ex * bl) * d;

        return x * x + y * y;
    }

    function circumcenter(ax, ay, bx, by, cx, cy) {
        const dx = bx - ax;
        const dy = by - ay;
        const ex = cx - ax;
        const ey = cy - ay;

        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        const d = 0.5 / (dx * ey - dy * ex);

        const x = ax + (ey * bl - dy * cl) * d;
        const y = ay + (dx * cl - ex * bl) * d;

        return {x, y};
    }

    function quicksort(ids, dists, left, right) {
        if (right - left <= 20) {
            for (let i = left + 1; i <= right; i++) {
                const temp = ids[i];
                const tempDist = dists[temp];
                let j = i - 1;
                while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
                ids[j + 1] = temp;
            }
        } else {
            const median = (left + right) >> 1;
            let i = left + 1;
            let j = right;
            swap(ids, median, i);
            if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
            if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
            if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

            const temp = ids[i];
            const tempDist = dists[temp];
            while (true) {
                do i++; while (dists[ids[i]] < tempDist);
                do j--; while (dists[ids[j]] > tempDist);
                if (j < i) break;
                swap(ids, i, j);
            }
            ids[left + 1] = ids[j];
            ids[j] = temp;

            if (right - i + 1 >= j - left) {
                quicksort(ids, dists, i, right);
                quicksort(ids, dists, left, j - 1);
            } else {
                quicksort(ids, dists, left, j - 1);
                quicksort(ids, dists, i, right);
            }
        }
    }

    function swap(arr, i, j) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    function defaultGetX(p) {
        return p[0];
    }
    function defaultGetY(p) {
        return p[1];
    }

    const epsilon$1 = 1e-6;

    class Path {
      constructor() {
        this._x0 = this._y0 = // start of current subpath
        this._x1 = this._y1 = null; // end of current subpath
        this._ = "";
      }
      moveTo(x, y) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
      }
      closePath() {
        if (this._x1 !== null) {
          this._x1 = this._x0, this._y1 = this._y0;
          this._ += "Z";
        }
      }
      lineTo(x, y) {
        this._ += `L${this._x1 = +x},${this._y1 = +y}`;
      }
      arc(x, y, r) {
        x = +x, y = +y, r = +r;
        const x0 = x + r;
        const y0 = y;
        if (r < 0) throw new Error("negative radius");
        if (this._x1 === null) this._ += `M${x0},${y0}`;
        else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) this._ += "L" + x0 + "," + y0;
        if (!r) return;
        this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
      }
      rect(x, y, w, h) {
        this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`;
      }
      value() {
        return this._ || null;
      }
    }

    class Polygon {
      constructor() {
        this._ = [];
      }
      moveTo(x, y) {
        this._.push([x, y]);
      }
      closePath() {
        this._.push(this._[0].slice());
      }
      lineTo(x, y) {
        this._.push([x, y]);
      }
      value() {
        return this._.length ? this._ : null;
      }
    }

    class Voronoi {
      constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
        if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
        this.delaunay = delaunay;
        this._circumcenters = new Float64Array(delaunay.points.length * 2);
        this.vectors = new Float64Array(delaunay.points.length * 2);
        this.xmax = xmax, this.xmin = xmin;
        this.ymax = ymax, this.ymin = ymin;
        this._init();
      }
      update() {
        this.delaunay.update();
        this._init();
        return this;
      }
      _init() {
        const {delaunay: {points, hull, triangles}, vectors} = this;

        // Compute circumcenters.
        const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
        for (let i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
          const t1 = triangles[i] * 2;
          const t2 = triangles[i + 1] * 2;
          const t3 = triangles[i + 2] * 2;
          const x1 = points[t1];
          const y1 = points[t1 + 1];
          const x2 = points[t2];
          const y2 = points[t2 + 1];
          const x3 = points[t3];
          const y3 = points[t3 + 1];

          const dx = x2 - x1;
          const dy = y2 - y1;
          const ex = x3 - x1;
          const ey = y3 - y1;
          const ab = (dx * ey - dy * ex) * 2;

          if (Math.abs(ab) < 1e-9) {
            // degenerate case (collinear diagram)
            // almost equal points (degenerate triangle)
            // the circumcenter is at the infinity, in a
            // direction that is:
            // 1. orthogonal to the halfedge.
            let a = 1e9;
            // 2. points away from the center; since the list of triangles starts
            // in the center, the first point of the first triangle
            // will be our reference
            const r = triangles[0] * 2;
            a *= Math.sign((points[r] - x1) * ey - (points[r + 1] - y1) * ex);
            x = (x1 + x3) / 2 - a * ey;
            y = (y1 + y3) / 2 + a * ex;
          } else {
            const d = 1 / ab;
            const bl = dx * dx + dy * dy;
            const cl = ex * ex + ey * ey;
            x = x1 + (ey * bl - dy * cl) * d;
            y = y1 + (dx * cl - ex * bl) * d;
          }
          circumcenters[j] = x;
          circumcenters[j + 1] = y;
        }

        // Compute exterior cell rays.
        let h = hull[hull.length - 1];
        let p0, p1 = h * 4;
        let x0, x1 = points[2 * h];
        let y0, y1 = points[2 * h + 1];
        vectors.fill(0);
        for (let i = 0; i < hull.length; ++i) {
          h = hull[i];
          p0 = p1, x0 = x1, y0 = y1;
          p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
          vectors[p0 + 2] = vectors[p1] = y0 - y1;
          vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
        }
      }
      render(context) {
        const buffer = context == null ? context = new Path : undefined;
        const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = this;
        if (hull.length <= 1) return null;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = Math.floor(i / 3) * 2;
          const tj = Math.floor(j / 3) * 2;
          const xi = circumcenters[ti];
          const yi = circumcenters[ti + 1];
          const xj = circumcenters[tj];
          const yj = circumcenters[tj + 1];
          this._renderSegment(xi, yi, xj, yj, context);
        }
        let h0, h1 = hull[hull.length - 1];
        for (let i = 0; i < hull.length; ++i) {
          h0 = h1, h1 = hull[i];
          const t = Math.floor(inedges[h1] / 3) * 2;
          const x = circumcenters[t];
          const y = circumcenters[t + 1];
          const v = h0 * 4;
          const p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
          if (p) this._renderSegment(x, y, p[0], p[1], context);
        }
        return buffer && buffer.value();
      }
      renderBounds(context) {
        const buffer = context == null ? context = new Path : undefined;
        context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
        return buffer && buffer.value();
      }
      renderCell(i, context) {
        const buffer = context == null ? context = new Path : undefined;
        const points = this._clip(i);
        if (points === null || !points.length) return;
        context.moveTo(points[0], points[1]);
        let n = points.length;
        while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
        for (let i = 2; i < n; i += 2) {
          if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
            context.lineTo(points[i], points[i + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      *cellPolygons() {
        const {delaunay: {points}} = this;
        for (let i = 0, n = points.length / 2; i < n; ++i) {
          const cell = this.cellPolygon(i);
          if (cell) cell.index = i, yield cell;
        }
      }
      cellPolygon(i) {
        const polygon = new Polygon;
        this.renderCell(i, polygon);
        return polygon.value();
      }
      _renderSegment(x0, y0, x1, y1, context) {
        let S;
        const c0 = this._regioncode(x0, y0);
        const c1 = this._regioncode(x1, y1);
        if (c0 === 0 && c1 === 0) {
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
        } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
          context.moveTo(S[0], S[1]);
          context.lineTo(S[2], S[3]);
        }
      }
      contains(i, x, y) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
        return this.delaunay._step(i, x, y) === i;
      }
      *neighbors(i) {
        const ci = this._clip(i);
        if (ci) for (const j of this.delaunay.neighbors(i)) {
          const cj = this._clip(j);
          // find the common edge
          if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
            for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
              if (ci[ai] == cj[aj]
              && ci[ai + 1] == cj[aj + 1]
              && ci[(ai + 2) % li] == cj[(aj + lj - 2) % lj]
              && ci[(ai + 3) % li] == cj[(aj + lj - 1) % lj]
              ) {
                yield j;
                break loop;
              }
            }
          }
        }
      }
      _cell(i) {
        const {circumcenters, delaunay: {inedges, halfedges, triangles}} = this;
        const e0 = inedges[i];
        if (e0 === -1) return null; // coincident point
        const points = [];
        let e = e0;
        do {
          const t = Math.floor(e / 3);
          points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
        } while (e !== e0 && e !== -1);
        return points;
      }
      _clip(i) {
        // degenerate case (1 valid point: return the box)
        if (i === 0 && this.delaunay.hull.length === 1) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        const points = this._cell(i);
        if (points === null) return null;
        const {vectors: V} = this;
        const v = i * 4;
        return V[v] || V[v + 1]
            ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
            : this._clipFinite(i, points);
      }
      _clipFinite(i, points) {
        const n = points.length;
        let P = null;
        let x0, y0, x1 = points[n - 2], y1 = points[n - 1];
        let c0, c1 = this._regioncode(x1, y1);
        let e0, e1 = 0;
        for (let j = 0; j < n; j += 2) {
          x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
          c0 = c1, c1 = this._regioncode(x1, y1);
          if (c0 === 0 && c1 === 0) {
            e0 = e1, e1 = 0;
            if (P) P.push(x1, y1);
            else P = [x1, y1];
          } else {
            let S, sx0, sy0, sx1, sy1;
            if (c0 === 0) {
              if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
              [sx0, sy0, sx1, sy1] = S;
            } else {
              if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
              [sx1, sy1, sx0, sy0] = S;
              e0 = e1, e1 = this._edgecode(sx0, sy0);
              if (e0 && e1) this._edge(i, e0, e1, P, P.length);
              if (P) P.push(sx0, sy0);
              else P = [sx0, sy0];
            }
            e0 = e1, e1 = this._edgecode(sx1, sy1);
            if (e0 && e1) this._edge(i, e0, e1, P, P.length);
            if (P) P.push(sx1, sy1);
            else P = [sx1, sy1];
          }
        }
        if (P) {
          e0 = e1, e1 = this._edgecode(P[0], P[1]);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
        }
        return P;
      }
      _clipSegment(x0, y0, x1, y1, c0, c1) {
        while (true) {
          if (c0 === 0 && c1 === 0) return [x0, y0, x1, y1];
          if (c0 & c1) return null;
          let x, y, c = c0 || c1;
          if (c & 0b1000) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;
          else if (c & 0b0100) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;
          else if (c & 0b0010) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;
          else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
          if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);
          else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
        }
      }
      _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
        let P = Array.from(points), p;
        if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
        if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);
        if (P = this._clipFinite(i, P)) {
          for (let j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
            c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
            if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
          }
        } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
          P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
        }
        return P;
      }
      _edge(i, e0, e1, P, j) {
        while (e0 !== e1) {
          let x, y;
          switch (e0) {
            case 0b0101: e0 = 0b0100; continue; // top-left
            case 0b0100: e0 = 0b0110, x = this.xmax, y = this.ymin; break; // top
            case 0b0110: e0 = 0b0010; continue; // top-right
            case 0b0010: e0 = 0b1010, x = this.xmax, y = this.ymax; break; // right
            case 0b1010: e0 = 0b1000; continue; // bottom-right
            case 0b1000: e0 = 0b1001, x = this.xmin, y = this.ymax; break; // bottom
            case 0b1001: e0 = 0b0001; continue; // bottom-left
            case 0b0001: e0 = 0b0101, x = this.xmin, y = this.ymin; break; // left
          }
          // Note: this implicitly checks for out of bounds: if P[j] or P[j+1] are
          // undefined, the conditional statement will be executed.
          if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
            P.splice(j, 0, x, y), j += 2;
          }
        }
        if (P.length > 4) {
          for (let i = 0; i < P.length; i+= 2) {
            const j = (i + 2) % P.length, k = (i + 4) % P.length;
            if (P[i] === P[j] && P[j] === P[k]
            || P[i + 1] === P[j + 1] && P[j + 1] === P[k + 1])
              P.splice(j, 2), i -= 2;
          }
        }
        return j;
      }
      _project(x0, y0, vx, vy) {
        let t = Infinity, c, x, y;
        if (vy < 0) { // top
          if (y0 <= this.ymin) return null;
          if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
        } else if (vy > 0) { // bottom
          if (y0 >= this.ymax) return null;
          if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
        }
        if (vx > 0) { // right
          if (x0 >= this.xmax) return null;
          if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
        } else if (vx < 0) { // left
          if (x0 <= this.xmin) return null;
          if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
        }
        return [x, y];
      }
      _edgecode(x, y) {
        return (x === this.xmin ? 0b0001
            : x === this.xmax ? 0b0010 : 0b0000)
            | (y === this.ymin ? 0b0100
            : y === this.ymax ? 0b1000 : 0b0000);
      }
      _regioncode(x, y) {
        return (x < this.xmin ? 0b0001
            : x > this.xmax ? 0b0010 : 0b0000)
            | (y < this.ymin ? 0b0100
            : y > this.ymax ? 0b1000 : 0b0000);
      }
    }

    const tau = 2 * Math.PI, pow$2 = Math.pow;

    function pointX(p) {
      return p[0];
    }

    function pointY(p) {
      return p[1];
    }

    // A triangulation is collinear if all its triangles have a non-null area
    function collinear(d) {
      const {triangles, coords} = d;
      for (let i = 0; i < triangles.length; i += 3) {
        const a = 2 * triangles[i],
              b = 2 * triangles[i + 1],
              c = 2 * triangles[i + 2],
              cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1])
                    - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
        if (cross > 1e-10) return false;
      }
      return true;
    }

    function jitter(x, y, r) {
      return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
    }

    class Delaunay {
      static from(points, fx = pointX, fy = pointY, that) {
        return new Delaunay("length" in points
            ? flatArray(points, fx, fy, that)
            : Float64Array.from(flatIterable(points, fx, fy, that)));
      }
      constructor(points) {
        this._delaunator = new Delaunator(points);
        this.inedges = new Int32Array(points.length / 2);
        this._hullIndex = new Int32Array(points.length / 2);
        this.points = this._delaunator.coords;
        this._init();
      }
      update() {
        this._delaunator.update();
        this._init();
        return this;
      }
      _init() {
        const d = this._delaunator, points = this.points;

        // check for collinear
        if (d.hull && d.hull.length > 2 && collinear(d)) {
          this.collinear = Int32Array.from({length: points.length/2}, (_,i) => i)
            .sort((i, j) => points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]); // for exact neighbors
          const e = this.collinear[0], f = this.collinear[this.collinear.length - 1],
            bounds = [ points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1] ],
            r = 1e-8 * Math.hypot(bounds[3] - bounds[1], bounds[2] - bounds[0]);
          for (let i = 0, n = points.length / 2; i < n; ++i) {
            const p = jitter(points[2 * i], points[2 * i + 1], r);
            points[2 * i] = p[0];
            points[2 * i + 1] = p[1];
          }
          this._delaunator = new Delaunator(points);
        } else {
          delete this.collinear;
        }

        const halfedges = this.halfedges = this._delaunator.halfedges;
        const hull = this.hull = this._delaunator.hull;
        const triangles = this.triangles = this._delaunator.triangles;
        const inedges = this.inedges.fill(-1);
        const hullIndex = this._hullIndex.fill(-1);

        // Compute an index from each point to an (arbitrary) incoming halfedge
        // Used to give the first neighbor of each point; for this reason,
        // on the hull we give priority to exterior halfedges
        for (let e = 0, n = halfedges.length; e < n; ++e) {
          const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
          if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
        }
        for (let i = 0, n = hull.length; i < n; ++i) {
          hullIndex[hull[i]] = i;
        }

        // degenerate case: 1 or 2 (distinct) points
        if (hull.length <= 2 && hull.length > 0) {
          this.triangles = new Int32Array(3).fill(-1);
          this.halfedges = new Int32Array(3).fill(-1);
          this.triangles[0] = hull[0];
          inedges[hull[0]] = 1;
          if (hull.length === 2) {
            inedges[hull[1]] = 0;
            this.triangles[1] = hull[1];
            this.triangles[2] = hull[1];
          }
        }
      }
      voronoi(bounds) {
        return new Voronoi(this, bounds);
      }
      *neighbors(i) {
        const {inedges, hull, _hullIndex, halfedges, triangles, collinear} = this;

        // degenerate case with several collinear points
        if (collinear) {
          const l = collinear.indexOf(i);
          if (l > 0) yield collinear[l - 1];
          if (l < collinear.length - 1) yield collinear[l + 1];
          return;
        }

        const e0 = inedges[i];
        if (e0 === -1) return; // coincident point
        let e = e0, p0 = -1;
        do {
          yield p0 = triangles[e];
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) return; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            const p = hull[(_hullIndex[i] + 1) % hull.length];
            if (p !== p0) yield p;
            return;
          }
        } while (e !== e0);
      }
      find(x, y, i = 0) {
        if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
        const i0 = i;
        let c;
        while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) i = c;
        return c;
      }
      _step(i, x, y) {
        const {inedges, hull, _hullIndex, halfedges, triangles, points} = this;
        if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
        let c = i;
        let dc = pow$2(x - points[i * 2], 2) + pow$2(y - points[i * 2 + 1], 2);
        const e0 = inedges[i];
        let e = e0;
        do {
          let t = triangles[e];
          const dt = pow$2(x - points[t * 2], 2) + pow$2(y - points[t * 2 + 1], 2);
          if (dt < dc) dc = dt, c = t;
          e = e % 3 === 2 ? e - 2 : e + 1;
          if (triangles[e] !== i) break; // bad triangulation
          e = halfedges[e];
          if (e === -1) {
            e = hull[(_hullIndex[i] + 1) % hull.length];
            if (e !== t) {
              if (pow$2(x - points[e * 2], 2) + pow$2(y - points[e * 2 + 1], 2) < dc) return e;
            }
            break;
          }
        } while (e !== e0);
        return c;
      }
      render(context) {
        const buffer = context == null ? context = new Path : undefined;
        const {points, halfedges, triangles} = this;
        for (let i = 0, n = halfedges.length; i < n; ++i) {
          const j = halfedges[i];
          if (j < i) continue;
          const ti = triangles[i] * 2;
          const tj = triangles[j] * 2;
          context.moveTo(points[ti], points[ti + 1]);
          context.lineTo(points[tj], points[tj + 1]);
        }
        this.renderHull(context);
        return buffer && buffer.value();
      }
      renderPoints(context, r) {
        if (r === undefined && (!context || typeof context.moveTo !== "function")) r = context, context = null;
        r = r == undefined ? 2 : +r;
        const buffer = context == null ? context = new Path : undefined;
        const {points} = this;
        for (let i = 0, n = points.length; i < n; i += 2) {
          const x = points[i], y = points[i + 1];
          context.moveTo(x + r, y);
          context.arc(x, y, r, 0, tau);
        }
        return buffer && buffer.value();
      }
      renderHull(context) {
        const buffer = context == null ? context = new Path : undefined;
        const {hull, points} = this;
        const h = hull[0] * 2, n = hull.length;
        context.moveTo(points[h], points[h + 1]);
        for (let i = 1; i < n; ++i) {
          const h = 2 * hull[i];
          context.lineTo(points[h], points[h + 1]);
        }
        context.closePath();
        return buffer && buffer.value();
      }
      hullPolygon() {
        const polygon = new Polygon;
        this.renderHull(polygon);
        return polygon.value();
      }
      renderTriangle(i, context) {
        const buffer = context == null ? context = new Path : undefined;
        const {points, triangles} = this;
        const t0 = triangles[i *= 3] * 2;
        const t1 = triangles[i + 1] * 2;
        const t2 = triangles[i + 2] * 2;
        context.moveTo(points[t0], points[t0 + 1]);
        context.lineTo(points[t1], points[t1 + 1]);
        context.lineTo(points[t2], points[t2 + 1]);
        context.closePath();
        return buffer && buffer.value();
      }
      *trianglePolygons() {
        const {triangles} = this;
        for (let i = 0, n = triangles.length / 3; i < n; ++i) {
          yield this.trianglePolygon(i);
        }
      }
      trianglePolygon(i) {
        const polygon = new Polygon;
        this.renderTriangle(i, polygon);
        return polygon.value();
      }
    }

    function flatArray(points, fx, fy, that) {
      const n = points.length;
      const array = new Float64Array(n * 2);
      for (let i = 0; i < n; ++i) {
        const p = points[i];
        array[i * 2] = fx.call(that, p, i, points);
        array[i * 2 + 1] = fy.call(that, p, i, points);
      }
      return array;
    }

    function* flatIterable(points, fx, fy, that) {
      let i = 0;
      for (const p of points) {
        yield fx.call(that, p, i, points);
        yield fy.call(that, p, i, points);
        ++i;
      }
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\shared\Voronoi.svelte generated by Svelte v3.44.1 */
    const file$k = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\shared\\Voronoi.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    // (51:0) {#if voronoi}
    function create_if_block$a(ctx) {
    	let g;
    	let each_value = /*$data*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			g = svg_element("g");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(g, "class", "voronoi-group");
    			add_location(g, file$k, 51, 0, 1015);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, g, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(g, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*voronoi, doHover, $data, doSelect*/ 1539) {
    				each_value = /*$data*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(g, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(g);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(51:0) {#if voronoi}",
    		ctx
    	});

    	return block;
    }

    // (53:0) {#each $data as d, i}
    function create_each_block$5(ctx) {
    	let path;
    	let path_d_value;
    	let mounted;
    	let dispose;

    	function mouseover_handler(...args) {
    		return /*mouseover_handler*/ ctx[21](/*i*/ ctx[31], ...args);
    	}

    	function focus_handler(...args) {
    		return /*focus_handler*/ ctx[23](/*i*/ ctx[31], ...args);
    	}

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[25](/*i*/ ctx[31], ...args);
    	}

    	const block = {
    		c: function create() {
    			path = svg_element("path");
    			attr_dev(path, "class", "voronoi-cell svelte-169satm");
    			attr_dev(path, "d", path_d_value = /*voronoi*/ ctx[0].renderCell(/*i*/ ctx[31]));
    			add_location(path, file$k, 53, 1, 1064);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, path, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(path, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(path, "mouseleave", /*mouseleave_handler*/ ctx[22], false, false, false),
    					listen_dev(path, "focus", focus_handler, false, false, false),
    					listen_dev(path, "blur", /*blur_handler*/ ctx[24], false, false, false),
    					listen_dev(path, "click", click_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*voronoi*/ 1 && path_d_value !== (path_d_value = /*voronoi*/ ctx[0].renderCell(/*i*/ ctx[31]))) {
    				attr_dev(path, "d", path_d_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(path);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(53:0) {#each $data as d, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let if_block_anchor;
    	let if_block = /*voronoi*/ ctx[0] && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*voronoi*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$a(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let coordsArray;
    	let voronoi;
    	let $height;
    	let $width;
    	let $yScale;
    	let $xScale;
    	let $coords;
    	let $custom;
    	let $data;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Voronoi', slots, []);
    	const { data, width, height, custom, xScale, yScale } = getContext('LayerCake');
    	validate_store(data, 'data');
    	component_subscribe($$self, data, value => $$invalidate(1, $data = value));
    	validate_store(width, 'width');
    	component_subscribe($$self, width, value => $$invalidate(17, $width = value));
    	validate_store(height, 'height');
    	component_subscribe($$self, height, value => $$invalidate(16, $height = value));
    	validate_store(custom, 'custom');
    	component_subscribe($$self, custom, value => $$invalidate(26, $custom = value));
    	validate_store(xScale, 'xScale');
    	component_subscribe($$self, xScale, value => $$invalidate(19, $xScale = value));
    	validate_store(yScale, 'yScale');
    	component_subscribe($$self, yScale, value => $$invalidate(18, $yScale = value));
    	const dispatch = createEventDispatcher();
    	let { hover = false } = $$props;
    	let { hovered = null } = $$props;
    	let { select = false } = $$props;
    	let { selected = null } = $$props;
    	let coords = $custom.coords;
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(20, $coords = value));
    	let idKey = $custom.idKey;

    	function doHover(e, d) {
    		if (hover) {
    			$$invalidate(11, hovered = d ? d[idKey] : null);
    			dispatch('hover', { id: hovered, data: d, event: e });
    		}
    	}

    	function doSelect(e, d) {
    		if (select) {
    			$$invalidate(12, selected = d ? d[idKey] : null);
    			dispatch('select', { id: selected, data: d, event: e });
    		}
    	}

    	const writable_props = ['hover', 'hovered', 'select', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Voronoi> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = (i, e) => doHover(e, $data[i]);
    	const mouseleave_handler = e => doHover(e, null);
    	const focus_handler = (i, e) => doHover(e, $data[i]);
    	const blur_handler = e => doHover(e, null);
    	const click_handler = (i, e) => doSelect(e, $data[i]);

    	$$self.$$set = $$props => {
    		if ('hover' in $$props) $$invalidate(13, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(11, hovered = $$props.hovered);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(12, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({
    		Delaunay,
    		getContext,
    		createEventDispatcher,
    		data,
    		width,
    		height,
    		custom,
    		xScale,
    		yScale,
    		dispatch,
    		hover,
    		hovered,
    		select,
    		selected,
    		coords,
    		idKey,
    		doHover,
    		doSelect,
    		coordsArray,
    		voronoi,
    		$height,
    		$width,
    		$yScale,
    		$xScale,
    		$coords,
    		$custom,
    		$data
    	});

    	$$self.$inject_state = $$props => {
    		if ('hover' in $$props) $$invalidate(13, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(11, hovered = $$props.hovered);
    		if ('select' in $$props) $$invalidate(14, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(12, selected = $$props.selected);
    		if ('coords' in $$props) $$invalidate(8, coords = $$props.coords);
    		if ('idKey' in $$props) idKey = $$props.idKey;
    		if ('coordsArray' in $$props) $$invalidate(15, coordsArray = $$props.coordsArray);
    		if ('voronoi' in $$props) $$invalidate(0, voronoi = $$props.voronoi);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*$coords, $xScale, $yScale*/ 1835008) {
    			 $$invalidate(15, coordsArray = Array.isArray($coords)
    			? $coords.map(d => [$xScale(d.x), $yScale(d.y)])
    			: []);
    		}

    		if ($$self.$$.dirty[0] & /*coordsArray, $width, $height*/ 229376) {
    			 $$invalidate(0, voronoi = Delaunay.from(coordsArray).voronoi([0, 0, $width, $height]));
    		}
    	};

    	return [
    		voronoi,
    		$data,
    		data,
    		width,
    		height,
    		custom,
    		xScale,
    		yScale,
    		coords,
    		doHover,
    		doSelect,
    		hovered,
    		selected,
    		hover,
    		select,
    		coordsArray,
    		$height,
    		$width,
    		$yScale,
    		$xScale,
    		$coords,
    		mouseover_handler,
    		mouseleave_handler,
    		focus_handler,
    		blur_handler,
    		click_handler
    	];
    }

    class Voronoi$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$l,
    			create_fragment$l,
    			safe_not_equal,
    			{
    				hover: 13,
    				hovered: 11,
    				select: 14,
    				selected: 12
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Voronoi",
    			options,
    			id: create_fragment$l.name
    		});
    	}

    	get hover() {
    		throw new Error("<Voronoi>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hover(value) {
    		throw new Error("<Voronoi>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hovered() {
    		throw new Error("<Voronoi>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hovered(value) {
    		throw new Error("<Voronoi>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get select() {
    		throw new Error("<Voronoi>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set select(value) {
    		throw new Error("<Voronoi>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Voronoi>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Voronoi>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\@onsvisual\svelte-charts\src\charts\ScatterChart.svelte generated by Svelte v3.44.1 */
    const file$l = "node_modules\\@onsvisual\\svelte-charts\\src\\charts\\ScatterChart.svelte";
    const get_front_slot_changes = dirty => ({});
    const get_front_slot_context = ctx => ({});
    const get_svg_slot_changes = dirty => ({});
    const get_svg_slot_context = ctx => ({});
    const get_back_slot_changes = dirty => ({});
    const get_back_slot_context = ctx => ({});
    const get_options_slot_changes = dirty => ({});
    const get_options_slot_context = ctx => ({});

    // (105:0) {#if title}
    function create_if_block_7(ctx) {
    	let title_1;
    	let current;

    	title_1 = new Title({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(title_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(title_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const title_1_changes = {};

    			if (dirty[0] & /*title*/ 8388608 | dirty[1] & /*$$scope*/ 536870912) {
    				title_1_changes.$$scope = { dirty, ctx };
    			}

    			title_1.$set(title_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(title_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(title_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(title_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(105:0) {#if title}",
    		ctx
    	});

    	return block;
    }

    // (106:2) <Title>
    function create_default_slot_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*title*/ ctx[23]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*title*/ 8388608) set_data_dev(t, /*title*/ ctx[23]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(106:2) <Title>",
    		ctx
    	});

    	return block;
    }

    // (141:3) {#if width > 80}
    function create_if_block_2$2(ctx) {
    	let setcoords;
    	let t0;
    	let t1;
    	let svg;
    	let t2;
    	let current;
    	setcoords = new SetCoords({ $$inline: true });
    	const back_slot_template = /*#slots*/ ctx[55].back;
    	const back_slot = create_slot(back_slot_template, ctx, /*$$scope*/ ctx[60], get_back_slot_context);

    	svg = new Svg({
    			props: {
    				pointerEvents: /*interactive*/ ctx[32],
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const front_slot_template = /*#slots*/ ctx[55].front;
    	const front_slot = create_slot(front_slot_template, ctx, /*$$scope*/ ctx[60], get_front_slot_context);

    	const block = {
    		c: function create() {
    			create_component(setcoords.$$.fragment);
    			t0 = space();
    			if (back_slot) back_slot.c();
    			t1 = space();
    			create_component(svg.$$.fragment);
    			t2 = space();
    			if (front_slot) front_slot.c();
    		},
    		m: function mount(target, anchor) {
    			mount_component(setcoords, target, anchor);
    			insert_dev(target, t0, anchor);

    			if (back_slot) {
    				back_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(svg, target, anchor);
    			insert_dev(target, t2, anchor);

    			if (front_slot) {
    				front_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (back_slot) {
    				if (back_slot.p && (!current || dirty[1] & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						back_slot,
    						back_slot_template,
    						ctx,
    						/*$$scope*/ ctx[60],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[60])
    						: get_slot_changes(back_slot_template, /*$$scope*/ ctx[60], dirty, get_back_slot_changes),
    						get_back_slot_context
    					);
    				}
    			}

    			const svg_changes = {};
    			if (dirty[1] & /*interactive*/ 2) svg_changes.pointerEvents = /*interactive*/ ctx[32];

    			if (dirty[0] & /*hovered, selected, labels, yTicks, yFormatTick, textColor, tickColor, tickDashed, yAxis, yKey, xTicks, xFormatTick, snapTicks, xAxis*/ 209698947 | dirty[1] & /*$$scope, select, hover, highlighted, overlayFill, yPrefix, ySuffix, xPrefix, xSuffix*/ 536876412) {
    				svg_changes.$$scope = { dirty, ctx };
    			}

    			svg.$set(svg_changes);

    			if (front_slot) {
    				if (front_slot.p && (!current || dirty[1] & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						front_slot,
    						front_slot_template,
    						ctx,
    						/*$$scope*/ ctx[60],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[60])
    						: get_slot_changes(front_slot_template, /*$$scope*/ ctx[60], dirty, get_front_slot_changes),
    						get_front_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(setcoords.$$.fragment, local);
    			transition_in(back_slot, local);
    			transition_in(svg.$$.fragment, local);
    			transition_in(front_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(setcoords.$$.fragment, local);
    			transition_out(back_slot, local);
    			transition_out(svg.$$.fragment, local);
    			transition_out(front_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(setcoords, detaching);
    			if (detaching) detach_dev(t0);
    			if (back_slot) back_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(svg, detaching);
    			if (detaching) detach_dev(t2);
    			if (front_slot) front_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(141:3) {#if width > 80}",
    		ctx
    	});

    	return block;
    }

    // (145:6) {#if xAxis}
    function create_if_block_6(ctx) {
    	let axisx;
    	let current;

    	axisx = new AxisX({
    			props: {
    				ticks: /*xTicks*/ ctx[18],
    				formatTick: /*xFormatTick*/ ctx[14],
    				snapTicks: /*snapTicks*/ ctx[27],
    				prefix: /*xPrefix*/ ctx[33],
    				suffix: /*xSuffix*/ ctx[34],
    				textColor: /*textColor*/ ctx[20],
    				tickColor: /*tickColor*/ ctx[21],
    				tickDashed: /*tickDashed*/ ctx[22]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(axisx.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axisx, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const axisx_changes = {};
    			if (dirty[0] & /*xTicks*/ 262144) axisx_changes.ticks = /*xTicks*/ ctx[18];
    			if (dirty[0] & /*xFormatTick*/ 16384) axisx_changes.formatTick = /*xFormatTick*/ ctx[14];
    			if (dirty[0] & /*snapTicks*/ 134217728) axisx_changes.snapTicks = /*snapTicks*/ ctx[27];
    			if (dirty[1] & /*xPrefix*/ 4) axisx_changes.prefix = /*xPrefix*/ ctx[33];
    			if (dirty[1] & /*xSuffix*/ 8) axisx_changes.suffix = /*xSuffix*/ ctx[34];
    			if (dirty[0] & /*textColor*/ 1048576) axisx_changes.textColor = /*textColor*/ ctx[20];
    			if (dirty[0] & /*tickColor*/ 2097152) axisx_changes.tickColor = /*tickColor*/ ctx[21];
    			if (dirty[0] & /*tickDashed*/ 4194304) axisx_changes.tickDashed = /*tickDashed*/ ctx[22];
    			axisx.$set(axisx_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axisx.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axisx.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axisx, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(145:6) {#if xAxis}",
    		ctx
    	});

    	return block;
    }

    // (148:6) {#if yAxis && yKey}
    function create_if_block_5(ctx) {
    	let axisy;
    	let current;

    	axisy = new AxisY({
    			props: {
    				ticks: /*yTicks*/ ctx[19],
    				formatTick: /*yFormatTick*/ ctx[15],
    				prefix: /*yPrefix*/ ctx[35],
    				suffix: /*ySuffix*/ ctx[36],
    				textColor: /*textColor*/ ctx[20],
    				tickColor: /*tickColor*/ ctx[21],
    				tickDashed: /*tickDashed*/ ctx[22]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(axisy.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(axisy, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const axisy_changes = {};
    			if (dirty[0] & /*yTicks*/ 524288) axisy_changes.ticks = /*yTicks*/ ctx[19];
    			if (dirty[0] & /*yFormatTick*/ 32768) axisy_changes.formatTick = /*yFormatTick*/ ctx[15];
    			if (dirty[1] & /*yPrefix*/ 16) axisy_changes.prefix = /*yPrefix*/ ctx[35];
    			if (dirty[1] & /*ySuffix*/ 32) axisy_changes.suffix = /*ySuffix*/ ctx[36];
    			if (dirty[0] & /*textColor*/ 1048576) axisy_changes.textColor = /*textColor*/ ctx[20];
    			if (dirty[0] & /*tickColor*/ 2097152) axisy_changes.tickColor = /*tickColor*/ ctx[21];
    			if (dirty[0] & /*tickDashed*/ 4194304) axisy_changes.tickDashed = /*tickDashed*/ ctx[22];
    			axisy.$set(axisy_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(axisy.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(axisy.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(axisy, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(148:6) {#if yAxis && yKey}",
    		ctx
    	});

    	return block;
    }

    // (152:3) {#if select || hover}
    function create_if_block_4$1(ctx) {
    	let voronoi;
    	let updating_selected;
    	let updating_hovered;
    	let current;

    	function voronoi_selected_binding(value) {
    		/*voronoi_selected_binding*/ ctx[56](value);
    	}

    	function voronoi_hovered_binding(value) {
    		/*voronoi_hovered_binding*/ ctx[57](value);
    	}

    	let voronoi_props = {
    		select: /*select*/ ctx[39],
    		hover: /*hover*/ ctx[37],
    		highlighted: /*highlighted*/ ctx[41]
    	};

    	if (/*selected*/ ctx[1] !== void 0) {
    		voronoi_props.selected = /*selected*/ ctx[1];
    	}

    	if (/*hovered*/ ctx[0] !== void 0) {
    		voronoi_props.hovered = /*hovered*/ ctx[0];
    	}

    	voronoi = new Voronoi$1({ props: voronoi_props, $$inline: true });
    	binding_callbacks.push(() => bind(voronoi, 'selected', voronoi_selected_binding));
    	binding_callbacks.push(() => bind(voronoi, 'hovered', voronoi_hovered_binding));
    	voronoi.$on("hover", /*hover_handler*/ ctx[58]);
    	voronoi.$on("select", /*select_handler*/ ctx[59]);

    	const block = {
    		c: function create() {
    			create_component(voronoi.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(voronoi, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const voronoi_changes = {};
    			if (dirty[1] & /*select*/ 256) voronoi_changes.select = /*select*/ ctx[39];
    			if (dirty[1] & /*hover*/ 64) voronoi_changes.hover = /*hover*/ ctx[37];
    			if (dirty[1] & /*highlighted*/ 1024) voronoi_changes.highlighted = /*highlighted*/ ctx[41];

    			if (!updating_selected && dirty[0] & /*selected*/ 2) {
    				updating_selected = true;
    				voronoi_changes.selected = /*selected*/ ctx[1];
    				add_flush_callback(() => updating_selected = false);
    			}

    			if (!updating_hovered && dirty[0] & /*hovered*/ 1) {
    				updating_hovered = true;
    				voronoi_changes.hovered = /*hovered*/ ctx[0];
    				add_flush_callback(() => updating_hovered = false);
    			}

    			voronoi.$set(voronoi_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(voronoi.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(voronoi.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(voronoi, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(152:3) {#if select || hover}",
    		ctx
    	});

    	return block;
    }

    // (155:3) {#if labels}
    function create_if_block_3$1(ctx) {
    	let labels_1;
    	let current;

    	labels_1 = new Labels({
    			props: {
    				hovered: /*hovered*/ ctx[0],
    				selected: /*selected*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(labels_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(labels_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const labels_1_changes = {};
    			if (dirty[0] & /*hovered*/ 1) labels_1_changes.hovered = /*hovered*/ ctx[0];
    			if (dirty[0] & /*selected*/ 2) labels_1_changes.selected = /*selected*/ ctx[1];
    			labels_1.$set(labels_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labels_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labels_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(labels_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(155:3) {#if labels}",
    		ctx
    	});

    	return block;
    }

    // (144:2) <Svg pointerEvents={interactive}>
    function create_default_slot_2(ctx) {
    	let t0;
    	let t1;
    	let scatter;
    	let t2;
    	let t3;
    	let t4;
    	let current;
    	let if_block0 = /*xAxis*/ ctx[16] && create_if_block_6(ctx);
    	let if_block1 = /*yAxis*/ ctx[17] && /*yKey*/ ctx[7] && create_if_block_5(ctx);

    	scatter = new Scatter_svg({
    			props: {
    				selected: /*selected*/ ctx[1],
    				hovered: /*hovered*/ ctx[0],
    				highlighted: /*highlighted*/ ctx[41],
    				overlayFill: /*overlayFill*/ ctx[43]
    			},
    			$$inline: true
    		});

    	let if_block2 = (/*select*/ ctx[39] || /*hover*/ ctx[37]) && create_if_block_4$1(ctx);
    	let if_block3 = /*labels*/ ctx[26] && create_if_block_3$1(ctx);
    	const svg_slot_template = /*#slots*/ ctx[55].svg;
    	const svg_slot = create_slot(svg_slot_template, ctx, /*$$scope*/ ctx[60], get_svg_slot_context);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(scatter.$$.fragment);
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			t4 = space();
    			if (svg_slot) svg_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(scatter, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block3) if_block3.m(target, anchor);
    			insert_dev(target, t4, anchor);

    			if (svg_slot) {
    				svg_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*xAxis*/ ctx[16]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*xAxis*/ 65536) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_6(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*yAxis*/ ctx[17] && /*yKey*/ ctx[7]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*yAxis, yKey*/ 131200) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_5(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			const scatter_changes = {};
    			if (dirty[0] & /*selected*/ 2) scatter_changes.selected = /*selected*/ ctx[1];
    			if (dirty[0] & /*hovered*/ 1) scatter_changes.hovered = /*hovered*/ ctx[0];
    			if (dirty[1] & /*highlighted*/ 1024) scatter_changes.highlighted = /*highlighted*/ ctx[41];
    			if (dirty[1] & /*overlayFill*/ 4096) scatter_changes.overlayFill = /*overlayFill*/ ctx[43];
    			scatter.$set(scatter_changes);

    			if (/*select*/ ctx[39] || /*hover*/ ctx[37]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[1] & /*select, hover*/ 320) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_4$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t3.parentNode, t3);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*labels*/ ctx[26]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*labels*/ 67108864) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block_3$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(t4.parentNode, t4);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}

    			if (svg_slot) {
    				if (svg_slot.p && (!current || dirty[1] & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						svg_slot,
    						svg_slot_template,
    						ctx,
    						/*$$scope*/ ctx[60],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[60])
    						: get_slot_changes(svg_slot_template, /*$$scope*/ ctx[60], dirty, get_svg_slot_changes),
    						get_svg_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(scatter.$$.fragment, local);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			transition_in(svg_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(scatter.$$.fragment, local);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			transition_out(svg_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(scatter, detaching);
    			if (detaching) detach_dev(t2);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block3) if_block3.d(detaching);
    			if (detaching) detach_dev(t4);
    			if (svg_slot) svg_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(144:2) <Svg pointerEvents={interactive}>",
    		ctx
    	});

    	return block;
    }

    // (110:1) <LayerCake     {padding}   x={xKey}   y={yKey}     z={zKey}     r={rKey}   xScale={xScale == 'log' ? scaleSymlog() : scaleLinear()}   yScale={yScale == 'log' ? scaleSymlog() : scaleLinear()}     zScale={scaleOrdinal()}   xDomain={$xDomain}   yDomain={$yDomain}   {zDomain}   zRange={colors}     rRange={Array.isArray(r) ? r : [r, r]}   data={data}     xPadding={[buffer, buffer]}     yPadding={yKey ? [buffer, buffer] : null}     custom={{    type: 'scatter',    idKey,    labelKey,       coords,    colorSelect,    colorHover,    colorHighlight,    padding: 1,       animation,       duration     }}   let:width  >
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*width*/ ctx[67] > 80 && create_if_block_2$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*width*/ ctx[67] > 80) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[2] & /*width*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_2$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(110:1) <LayerCake     {padding}   x={xKey}   y={yKey}     z={zKey}     r={rKey}   xScale={xScale == 'log' ? scaleSymlog() : scaleLinear()}   yScale={yScale == 'log' ? scaleSymlog() : scaleLinear()}     zScale={scaleOrdinal()}   xDomain={$xDomain}   yDomain={$yDomain}   {zDomain}   zRange={colors}     rRange={Array.isArray(r) ? r : [r, r]}   data={data}     xPadding={[buffer, buffer]}     yPadding={yKey ? [buffer, buffer] : null}     custom={{    type: 'scatter',    idKey,    labelKey,       coords,    colorSelect,    colorHover,    colorHighlight,    padding: 1,       animation,       duration     }}   let:width  >",
    		ctx
    	});

    	return block;
    }

    // (164:0) {#if legend && zDomain}
    function create_if_block_1$6(ctx) {
    	let legend_1;
    	let current;

    	legend_1 = new Legend({
    			props: {
    				domain: /*zDomain*/ ctx[44],
    				colors: /*colors*/ ctx[30],
    				markerLength: Array.isArray(/*r*/ ctx[31])
    				? /*r*/ ctx[31][0] * 2
    				: /*r*/ ctx[31] * 2,
    				round: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(legend_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(legend_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const legend_1_changes = {};
    			if (dirty[1] & /*zDomain*/ 8192) legend_1_changes.domain = /*zDomain*/ ctx[44];
    			if (dirty[0] & /*colors*/ 1073741824) legend_1_changes.colors = /*colors*/ ctx[30];

    			if (dirty[1] & /*r*/ 1) legend_1_changes.markerLength = Array.isArray(/*r*/ ctx[31])
    			? /*r*/ ctx[31][0] * 2
    			: /*r*/ ctx[31] * 2;

    			legend_1.$set(legend_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(legend_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(legend_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(legend_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$6.name,
    		type: "if",
    		source: "(164:0) {#if legend && zDomain}",
    		ctx
    	});

    	return block;
    }

    // (167:0) {#if footer}
    function create_if_block$b(ctx) {
    	let footer_1;
    	let current;

    	footer_1 = new Footer({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(footer_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(footer_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const footer_1_changes = {};

    			if (dirty[0] & /*footer*/ 16777216 | dirty[1] & /*$$scope*/ 536870912) {
    				footer_1_changes.$$scope = { dirty, ctx };
    			}

    			footer_1.$set(footer_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(footer_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(footer_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(footer_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(167:0) {#if footer}",
    		ctx
    	});

    	return block;
    }

    // (168:2) <Footer>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(/*footer*/ ctx[24]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*footer*/ 16777216) set_data_dev(t, /*footer*/ ctx[24]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(168:2) <Footer>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$m(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let layercake;
    	let t2;
    	let t3;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*title*/ ctx[23] && create_if_block_7(ctx);
    	const options_slot_template = /*#slots*/ ctx[55].options;
    	const options_slot = create_slot(options_slot_template, ctx, /*$$scope*/ ctx[60], get_options_slot_context);

    	layercake = new LayerCake({
    			props: {
    				padding: /*padding*/ ctx[28],
    				x: /*xKey*/ ctx[6],
    				y: /*yKey*/ ctx[7],
    				z: /*zKey*/ ctx[8],
    				r: /*rKey*/ ctx[9],
    				xScale: /*xScale*/ ctx[12] == 'log'
    				? symlog$1()
    				: linear$2(),
    				yScale: /*yScale*/ ctx[13] == 'log'
    				? symlog$1()
    				: linear$2(),
    				zScale: ordinal(),
    				xDomain: /*$xDomain*/ ctx[45],
    				yDomain: /*$yDomain*/ ctx[46],
    				zDomain: /*zDomain*/ ctx[44],
    				zRange: /*colors*/ ctx[30],
    				rRange: Array.isArray(/*r*/ ctx[31])
    				? /*r*/ ctx[31]
    				: [/*r*/ ctx[31], /*r*/ ctx[31]],
    				data: /*data*/ ctx[2],
    				xPadding: [/*buffer*/ ctx[29], /*buffer*/ ctx[29]],
    				yPadding: /*yKey*/ ctx[7]
    				? [/*buffer*/ ctx[29], /*buffer*/ ctx[29]]
    				: null,
    				custom: {
    					type: 'scatter',
    					idKey: /*idKey*/ ctx[10],
    					labelKey: /*labelKey*/ ctx[11],
    					coords: /*coords*/ ctx[47],
    					colorSelect: /*colorSelect*/ ctx[40],
    					colorHover: /*colorHover*/ ctx[38],
    					colorHighlight: /*colorHighlight*/ ctx[42],
    					padding: 1,
    					animation: /*animation*/ ctx[4],
    					duration: /*duration*/ ctx[5]
    				},
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ width }) => ({ 67: width }),
    						({ width }) => [0, 0, width ? 32 : 0]
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	let if_block1 = /*legend*/ ctx[25] && /*zDomain*/ ctx[44] && create_if_block_1$6(ctx);
    	let if_block2 = /*footer*/ ctx[24] && create_if_block$b(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (options_slot) options_slot.c();
    			t1 = space();
    			div = element("div");
    			create_component(layercake.$$.fragment);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(div, "class", "chart-container svelte-1dnlmiu");

    			set_style(div, "height", typeof /*height*/ ctx[3] == 'number'
    			? /*height*/ ctx[3] + 'px'
    			: /*height*/ ctx[3]);

    			add_location(div, file$l, 108, 0, 3450);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);

    			if (options_slot) {
    				options_slot.m(target, anchor);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(layercake, div, null);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*title*/ ctx[23]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*title*/ 8388608) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (options_slot) {
    				if (options_slot.p && (!current || dirty[1] & /*$$scope*/ 536870912)) {
    					update_slot_base(
    						options_slot,
    						options_slot_template,
    						ctx,
    						/*$$scope*/ ctx[60],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[60])
    						: get_slot_changes(options_slot_template, /*$$scope*/ ctx[60], dirty, get_options_slot_changes),
    						get_options_slot_context
    					);
    				}
    			}

    			const layercake_changes = {};
    			if (dirty[0] & /*padding*/ 268435456) layercake_changes.padding = /*padding*/ ctx[28];
    			if (dirty[0] & /*xKey*/ 64) layercake_changes.x = /*xKey*/ ctx[6];
    			if (dirty[0] & /*yKey*/ 128) layercake_changes.y = /*yKey*/ ctx[7];
    			if (dirty[0] & /*zKey*/ 256) layercake_changes.z = /*zKey*/ ctx[8];
    			if (dirty[0] & /*rKey*/ 512) layercake_changes.r = /*rKey*/ ctx[9];

    			if (dirty[0] & /*xScale*/ 4096) layercake_changes.xScale = /*xScale*/ ctx[12] == 'log'
    			? symlog$1()
    			: linear$2();

    			if (dirty[0] & /*yScale*/ 8192) layercake_changes.yScale = /*yScale*/ ctx[13] == 'log'
    			? symlog$1()
    			: linear$2();

    			if (dirty[1] & /*$xDomain*/ 16384) layercake_changes.xDomain = /*$xDomain*/ ctx[45];
    			if (dirty[1] & /*$yDomain*/ 32768) layercake_changes.yDomain = /*$yDomain*/ ctx[46];
    			if (dirty[1] & /*zDomain*/ 8192) layercake_changes.zDomain = /*zDomain*/ ctx[44];
    			if (dirty[0] & /*colors*/ 1073741824) layercake_changes.zRange = /*colors*/ ctx[30];

    			if (dirty[1] & /*r*/ 1) layercake_changes.rRange = Array.isArray(/*r*/ ctx[31])
    			? /*r*/ ctx[31]
    			: [/*r*/ ctx[31], /*r*/ ctx[31]];

    			if (dirty[0] & /*data*/ 4) layercake_changes.data = /*data*/ ctx[2];
    			if (dirty[0] & /*buffer*/ 536870912) layercake_changes.xPadding = [/*buffer*/ ctx[29], /*buffer*/ ctx[29]];

    			if (dirty[0] & /*yKey, buffer*/ 536871040) layercake_changes.yPadding = /*yKey*/ ctx[7]
    			? [/*buffer*/ ctx[29], /*buffer*/ ctx[29]]
    			: null;

    			if (dirty[0] & /*idKey, labelKey, animation, duration*/ 3120 | dirty[1] & /*colorSelect, colorHover, colorHighlight*/ 2688) layercake_changes.custom = {
    				type: 'scatter',
    				idKey: /*idKey*/ ctx[10],
    				labelKey: /*labelKey*/ ctx[11],
    				coords: /*coords*/ ctx[47],
    				colorSelect: /*colorSelect*/ ctx[40],
    				colorHover: /*colorHover*/ ctx[38],
    				colorHighlight: /*colorHighlight*/ ctx[42],
    				padding: 1,
    				animation: /*animation*/ ctx[4],
    				duration: /*duration*/ ctx[5]
    			};

    			if (dirty[0] & /*hovered, selected, labels, yTicks, yFormatTick, textColor, tickColor, tickDashed, yAxis, yKey, xTicks, xFormatTick, snapTicks, xAxis*/ 209698947 | dirty[1] & /*$$scope, interactive, select, hover, highlighted, overlayFill, yPrefix, ySuffix, xPrefix, xSuffix*/ 536876414 | dirty[2] & /*width*/ 32) {
    				layercake_changes.$$scope = { dirty, ctx };
    			}

    			layercake.$set(layercake_changes);

    			if (!current || dirty[0] & /*height*/ 8) {
    				set_style(div, "height", typeof /*height*/ ctx[3] == 'number'
    				? /*height*/ ctx[3] + 'px'
    				: /*height*/ ctx[3]);
    			}

    			if (/*legend*/ ctx[25] && /*zDomain*/ ctx[44]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*legend*/ 33554432 | dirty[1] & /*zDomain*/ 8192) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$6(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*footer*/ ctx[24]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*footer*/ 16777216) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$b(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(options_slot, local);
    			transition_in(layercake.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(options_slot, local);
    			transition_out(layercake.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (options_slot) options_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    			destroy_component(layercake);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function domGet(data, key, min, max) {
    	let vals = data.map(d => d[key]);

    	return [
    		min ? min : vals[0] ? Math.min(...vals) : -1,
    		max ? max : vals[0] ? Math.max(...vals) : 1
    	];
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let zDomain;
    	let $xDomain;
    	let $yDomain;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ScatterChart', slots, ['options','back','svg','front']);
    	let { data } = $$props;
    	let { height = 250 } = $$props;
    	let { animation = true } = $$props;
    	let { duration = 800 } = $$props;
    	let { xKey = 'x' } = $$props;
    	let { yKey = null } = $$props;
    	let { zKey = null } = $$props;
    	let { rKey = null } = $$props;
    	let { idKey = xKey } = $$props;
    	let { labelKey = idKey } = $$props;
    	let { xScale = 'linear' } = $$props;
    	let { yScale = 'linear' } = $$props;
    	let { xFormatTick = d => d } = $$props;
    	let { yFormatTick = d => d } = $$props;
    	let { xMax = null } = $$props;
    	let { xMin = null } = $$props;
    	let { yMax = null } = $$props;
    	let { yMin = null } = $$props;
    	let { xAxis = true } = $$props;
    	let { yAxis = true } = $$props;
    	let { xTicks = 4 } = $$props;
    	let { yTicks = 4 } = $$props;
    	let { textColor = '#666' } = $$props;
    	let { tickColor = '#ccc' } = $$props;
    	let { tickDashed = false } = $$props;
    	let { title = null } = $$props;
    	let { footer = null } = $$props;
    	let { legend = false } = $$props;
    	let { labels = false } = $$props;
    	let { snapTicks = false } = $$props;
    	let { padding = { top: 0, bottom: 20, left: 35, right: 0 } } = $$props;
    	let { buffer = 5 } = $$props;
    	let { color = null } = $$props;

    	let { colors = color
    	? [color]
    	: [
    			'#206095',
    			'#A8BD3A',
    			'#003C57',
    			'#27A0CC',
    			'#118C7B',
    			'#F66068',
    			'#746CB1',
    			'#22D0B6',
    			'lightgrey'
    		] } = $$props;

    	let { r = 4 } = $$props;
    	let { interactive = true } = $$props;
    	let { xPrefix = "" } = $$props;
    	let { xSuffix = "" } = $$props;
    	let { yPrefix = "" } = $$props;
    	let { ySuffix = "" } = $$props;
    	let { hover = false } = $$props;
    	let { hovered = null } = $$props;
    	let { colorHover = 'orange' } = $$props;
    	let { select = false } = $$props;
    	let { selected = null } = $$props;
    	let { colorSelect = 'black' } = $$props;
    	let { highlighted = [] } = $$props;
    	let { colorHighlight = 'black' } = $$props;
    	let { overlayFill = false } = $$props;
    	const tweenOptions = { duration, easing: cubicInOut };
    	const coords = tweened(undefined, tweenOptions);
    	const distinct = (d, i, arr) => arr.indexOf(d) == i;

    	function xDomUpdate(data, key, min, max) {
    		let newDom = domGet(data, key, min, max);

    		if (newDom[0] != xDom[0] || newDom[1] != xDom[1]) {
    			xDomain.set(newDom);
    			xDom = newDom;
    		}
    	}

    	function yDomUpdate(data, key, min, max) {
    		let newDom = key ? domGet(data, key, min, max) : yDom;

    		if (newDom[0] != yDom[0] || newDom[1] != yDom[1]) {
    			yDomain.set(newDom, { duration: animation ? duration : 0 });
    			yDom = newDom;
    		}
    	}

    	let xDom = domGet(data, xKey, xMin, xMax);
    	const xDomain = tweened(xDom, tweenOptions);
    	validate_store(xDomain, 'xDomain');
    	component_subscribe($$self, xDomain, value => $$invalidate(45, $xDomain = value));
    	let yDom = domGet(data, yKey, yMin, yMax);
    	const yDomain = tweened(yDom, tweenOptions);
    	validate_store(yDomain, 'yDomain');
    	component_subscribe($$self, yDomain, value => $$invalidate(46, $yDomain = value));

    	const writable_props = [
    		'data',
    		'height',
    		'animation',
    		'duration',
    		'xKey',
    		'yKey',
    		'zKey',
    		'rKey',
    		'idKey',
    		'labelKey',
    		'xScale',
    		'yScale',
    		'xFormatTick',
    		'yFormatTick',
    		'xMax',
    		'xMin',
    		'yMax',
    		'yMin',
    		'xAxis',
    		'yAxis',
    		'xTicks',
    		'yTicks',
    		'textColor',
    		'tickColor',
    		'tickDashed',
    		'title',
    		'footer',
    		'legend',
    		'labels',
    		'snapTicks',
    		'padding',
    		'buffer',
    		'color',
    		'colors',
    		'r',
    		'interactive',
    		'xPrefix',
    		'xSuffix',
    		'yPrefix',
    		'ySuffix',
    		'hover',
    		'hovered',
    		'colorHover',
    		'select',
    		'selected',
    		'colorSelect',
    		'highlighted',
    		'colorHighlight',
    		'overlayFill'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ScatterChart> was created with unknown prop '${key}'`);
    	});

    	function voronoi_selected_binding(value) {
    		selected = value;
    		$$invalidate(1, selected);
    	}

    	function voronoi_hovered_binding(value) {
    		hovered = value;
    		$$invalidate(0, hovered);
    	}

    	function hover_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function select_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    		if ('animation' in $$props) $$invalidate(4, animation = $$props.animation);
    		if ('duration' in $$props) $$invalidate(5, duration = $$props.duration);
    		if ('xKey' in $$props) $$invalidate(6, xKey = $$props.xKey);
    		if ('yKey' in $$props) $$invalidate(7, yKey = $$props.yKey);
    		if ('zKey' in $$props) $$invalidate(8, zKey = $$props.zKey);
    		if ('rKey' in $$props) $$invalidate(9, rKey = $$props.rKey);
    		if ('idKey' in $$props) $$invalidate(10, idKey = $$props.idKey);
    		if ('labelKey' in $$props) $$invalidate(11, labelKey = $$props.labelKey);
    		if ('xScale' in $$props) $$invalidate(12, xScale = $$props.xScale);
    		if ('yScale' in $$props) $$invalidate(13, yScale = $$props.yScale);
    		if ('xFormatTick' in $$props) $$invalidate(14, xFormatTick = $$props.xFormatTick);
    		if ('yFormatTick' in $$props) $$invalidate(15, yFormatTick = $$props.yFormatTick);
    		if ('xMax' in $$props) $$invalidate(50, xMax = $$props.xMax);
    		if ('xMin' in $$props) $$invalidate(51, xMin = $$props.xMin);
    		if ('yMax' in $$props) $$invalidate(52, yMax = $$props.yMax);
    		if ('yMin' in $$props) $$invalidate(53, yMin = $$props.yMin);
    		if ('xAxis' in $$props) $$invalidate(16, xAxis = $$props.xAxis);
    		if ('yAxis' in $$props) $$invalidate(17, yAxis = $$props.yAxis);
    		if ('xTicks' in $$props) $$invalidate(18, xTicks = $$props.xTicks);
    		if ('yTicks' in $$props) $$invalidate(19, yTicks = $$props.yTicks);
    		if ('textColor' in $$props) $$invalidate(20, textColor = $$props.textColor);
    		if ('tickColor' in $$props) $$invalidate(21, tickColor = $$props.tickColor);
    		if ('tickDashed' in $$props) $$invalidate(22, tickDashed = $$props.tickDashed);
    		if ('title' in $$props) $$invalidate(23, title = $$props.title);
    		if ('footer' in $$props) $$invalidate(24, footer = $$props.footer);
    		if ('legend' in $$props) $$invalidate(25, legend = $$props.legend);
    		if ('labels' in $$props) $$invalidate(26, labels = $$props.labels);
    		if ('snapTicks' in $$props) $$invalidate(27, snapTicks = $$props.snapTicks);
    		if ('padding' in $$props) $$invalidate(28, padding = $$props.padding);
    		if ('buffer' in $$props) $$invalidate(29, buffer = $$props.buffer);
    		if ('color' in $$props) $$invalidate(54, color = $$props.color);
    		if ('colors' in $$props) $$invalidate(30, colors = $$props.colors);
    		if ('r' in $$props) $$invalidate(31, r = $$props.r);
    		if ('interactive' in $$props) $$invalidate(32, interactive = $$props.interactive);
    		if ('xPrefix' in $$props) $$invalidate(33, xPrefix = $$props.xPrefix);
    		if ('xSuffix' in $$props) $$invalidate(34, xSuffix = $$props.xSuffix);
    		if ('yPrefix' in $$props) $$invalidate(35, yPrefix = $$props.yPrefix);
    		if ('ySuffix' in $$props) $$invalidate(36, ySuffix = $$props.ySuffix);
    		if ('hover' in $$props) $$invalidate(37, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('colorHover' in $$props) $$invalidate(38, colorHover = $$props.colorHover);
    		if ('select' in $$props) $$invalidate(39, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('colorSelect' in $$props) $$invalidate(40, colorSelect = $$props.colorSelect);
    		if ('highlighted' in $$props) $$invalidate(41, highlighted = $$props.highlighted);
    		if ('colorHighlight' in $$props) $$invalidate(42, colorHighlight = $$props.colorHighlight);
    		if ('overlayFill' in $$props) $$invalidate(43, overlayFill = $$props.overlayFill);
    		if ('$$scope' in $$props) $$invalidate(60, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		LayerCake,
    		Svg,
    		scaleOrdinal: ordinal,
    		scaleLinear: linear$2,
    		scaleSymlog: symlog$1,
    		tweened,
    		cubicInOut,
    		SetCoords,
    		Scatter: Scatter_svg,
    		Voronoi: Voronoi$1,
    		AxisX,
    		AxisY,
    		Legend,
    		Title,
    		Footer,
    		Labels,
    		data,
    		height,
    		animation,
    		duration,
    		xKey,
    		yKey,
    		zKey,
    		rKey,
    		idKey,
    		labelKey,
    		xScale,
    		yScale,
    		xFormatTick,
    		yFormatTick,
    		xMax,
    		xMin,
    		yMax,
    		yMin,
    		xAxis,
    		yAxis,
    		xTicks,
    		yTicks,
    		textColor,
    		tickColor,
    		tickDashed,
    		title,
    		footer,
    		legend,
    		labels,
    		snapTicks,
    		padding,
    		buffer,
    		color,
    		colors,
    		r,
    		interactive,
    		xPrefix,
    		xSuffix,
    		yPrefix,
    		ySuffix,
    		hover,
    		hovered,
    		colorHover,
    		select,
    		selected,
    		colorSelect,
    		highlighted,
    		colorHighlight,
    		overlayFill,
    		tweenOptions,
    		coords,
    		distinct,
    		domGet,
    		xDomUpdate,
    		yDomUpdate,
    		xDom,
    		xDomain,
    		yDom,
    		yDomain,
    		zDomain,
    		$xDomain,
    		$yDomain
    	});

    	$$self.$inject_state = $$props => {
    		if ('data' in $$props) $$invalidate(2, data = $$props.data);
    		if ('height' in $$props) $$invalidate(3, height = $$props.height);
    		if ('animation' in $$props) $$invalidate(4, animation = $$props.animation);
    		if ('duration' in $$props) $$invalidate(5, duration = $$props.duration);
    		if ('xKey' in $$props) $$invalidate(6, xKey = $$props.xKey);
    		if ('yKey' in $$props) $$invalidate(7, yKey = $$props.yKey);
    		if ('zKey' in $$props) $$invalidate(8, zKey = $$props.zKey);
    		if ('rKey' in $$props) $$invalidate(9, rKey = $$props.rKey);
    		if ('idKey' in $$props) $$invalidate(10, idKey = $$props.idKey);
    		if ('labelKey' in $$props) $$invalidate(11, labelKey = $$props.labelKey);
    		if ('xScale' in $$props) $$invalidate(12, xScale = $$props.xScale);
    		if ('yScale' in $$props) $$invalidate(13, yScale = $$props.yScale);
    		if ('xFormatTick' in $$props) $$invalidate(14, xFormatTick = $$props.xFormatTick);
    		if ('yFormatTick' in $$props) $$invalidate(15, yFormatTick = $$props.yFormatTick);
    		if ('xMax' in $$props) $$invalidate(50, xMax = $$props.xMax);
    		if ('xMin' in $$props) $$invalidate(51, xMin = $$props.xMin);
    		if ('yMax' in $$props) $$invalidate(52, yMax = $$props.yMax);
    		if ('yMin' in $$props) $$invalidate(53, yMin = $$props.yMin);
    		if ('xAxis' in $$props) $$invalidate(16, xAxis = $$props.xAxis);
    		if ('yAxis' in $$props) $$invalidate(17, yAxis = $$props.yAxis);
    		if ('xTicks' in $$props) $$invalidate(18, xTicks = $$props.xTicks);
    		if ('yTicks' in $$props) $$invalidate(19, yTicks = $$props.yTicks);
    		if ('textColor' in $$props) $$invalidate(20, textColor = $$props.textColor);
    		if ('tickColor' in $$props) $$invalidate(21, tickColor = $$props.tickColor);
    		if ('tickDashed' in $$props) $$invalidate(22, tickDashed = $$props.tickDashed);
    		if ('title' in $$props) $$invalidate(23, title = $$props.title);
    		if ('footer' in $$props) $$invalidate(24, footer = $$props.footer);
    		if ('legend' in $$props) $$invalidate(25, legend = $$props.legend);
    		if ('labels' in $$props) $$invalidate(26, labels = $$props.labels);
    		if ('snapTicks' in $$props) $$invalidate(27, snapTicks = $$props.snapTicks);
    		if ('padding' in $$props) $$invalidate(28, padding = $$props.padding);
    		if ('buffer' in $$props) $$invalidate(29, buffer = $$props.buffer);
    		if ('color' in $$props) $$invalidate(54, color = $$props.color);
    		if ('colors' in $$props) $$invalidate(30, colors = $$props.colors);
    		if ('r' in $$props) $$invalidate(31, r = $$props.r);
    		if ('interactive' in $$props) $$invalidate(32, interactive = $$props.interactive);
    		if ('xPrefix' in $$props) $$invalidate(33, xPrefix = $$props.xPrefix);
    		if ('xSuffix' in $$props) $$invalidate(34, xSuffix = $$props.xSuffix);
    		if ('yPrefix' in $$props) $$invalidate(35, yPrefix = $$props.yPrefix);
    		if ('ySuffix' in $$props) $$invalidate(36, ySuffix = $$props.ySuffix);
    		if ('hover' in $$props) $$invalidate(37, hover = $$props.hover);
    		if ('hovered' in $$props) $$invalidate(0, hovered = $$props.hovered);
    		if ('colorHover' in $$props) $$invalidate(38, colorHover = $$props.colorHover);
    		if ('select' in $$props) $$invalidate(39, select = $$props.select);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('colorSelect' in $$props) $$invalidate(40, colorSelect = $$props.colorSelect);
    		if ('highlighted' in $$props) $$invalidate(41, highlighted = $$props.highlighted);
    		if ('colorHighlight' in $$props) $$invalidate(42, colorHighlight = $$props.colorHighlight);
    		if ('overlayFill' in $$props) $$invalidate(43, overlayFill = $$props.overlayFill);
    		if ('xDom' in $$props) xDom = $$props.xDom;
    		if ('yDom' in $$props) yDom = $$props.yDom;
    		if ('zDomain' in $$props) $$invalidate(44, zDomain = $$props.zDomain);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*data, xKey*/ 68 | $$self.$$.dirty[1] & /*xMin, xMax*/ 1572864) {
    			 xDomUpdate(data, xKey, xMin, xMax);
    		}

    		if ($$self.$$.dirty[0] & /*data, yKey*/ 132 | $$self.$$.dirty[1] & /*yMin, yMax*/ 6291456) {
    			 yDomUpdate(data, yKey, yMin, yMax);
    		}

    		if ($$self.$$.dirty[0] & /*zKey, data*/ 260) {
    			 $$invalidate(44, zDomain = zKey ? data.map(d => d[zKey]).filter(distinct) : null);
    		}
    	};

    	return [
    		hovered,
    		selected,
    		data,
    		height,
    		animation,
    		duration,
    		xKey,
    		yKey,
    		zKey,
    		rKey,
    		idKey,
    		labelKey,
    		xScale,
    		yScale,
    		xFormatTick,
    		yFormatTick,
    		xAxis,
    		yAxis,
    		xTicks,
    		yTicks,
    		textColor,
    		tickColor,
    		tickDashed,
    		title,
    		footer,
    		legend,
    		labels,
    		snapTicks,
    		padding,
    		buffer,
    		colors,
    		r,
    		interactive,
    		xPrefix,
    		xSuffix,
    		yPrefix,
    		ySuffix,
    		hover,
    		colorHover,
    		select,
    		colorSelect,
    		highlighted,
    		colorHighlight,
    		overlayFill,
    		zDomain,
    		$xDomain,
    		$yDomain,
    		coords,
    		xDomain,
    		yDomain,
    		xMax,
    		xMin,
    		yMax,
    		yMin,
    		color,
    		slots,
    		voronoi_selected_binding,
    		voronoi_hovered_binding,
    		hover_handler,
    		select_handler,
    		$$scope
    	];
    }

    class ScatterChart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$m,
    			create_fragment$m,
    			safe_not_equal,
    			{
    				data: 2,
    				height: 3,
    				animation: 4,
    				duration: 5,
    				xKey: 6,
    				yKey: 7,
    				zKey: 8,
    				rKey: 9,
    				idKey: 10,
    				labelKey: 11,
    				xScale: 12,
    				yScale: 13,
    				xFormatTick: 14,
    				yFormatTick: 15,
    				xMax: 50,
    				xMin: 51,
    				yMax: 52,
    				yMin: 53,
    				xAxis: 16,
    				yAxis: 17,
    				xTicks: 18,
    				yTicks: 19,
    				textColor: 20,
    				tickColor: 21,
    				tickDashed: 22,
    				title: 23,
    				footer: 24,
    				legend: 25,
    				labels: 26,
    				snapTicks: 27,
    				padding: 28,
    				buffer: 29,
    				color: 54,
    				colors: 30,
    				r: 31,
    				interactive: 32,
    				xPrefix: 33,
    				xSuffix: 34,
    				yPrefix: 35,
    				ySuffix: 36,
    				hover: 37,
    				hovered: 0,
    				colorHover: 38,
    				select: 39,
    				selected: 1,
    				colorSelect: 40,
    				highlighted: 41,
    				colorHighlight: 42,
    				overlayFill: 43
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ScatterChart",
    			options,
    			id: create_fragment$m.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*data*/ ctx[2] === undefined && !('data' in props)) {
    			console.warn("<ScatterChart> was created without expected prop 'data'");
    		}
    	}

    	get data() {
    		return this.$$.ctx[2];
    	}

    	set data(data) {
    		this.$$set({ data });
    		flush();
    	}

    	get height() {
    		return this.$$.ctx[3];
    	}

    	set height(height) {
    		this.$$set({ height });
    		flush();
    	}

    	get animation() {
    		return this.$$.ctx[4];
    	}

    	set animation(animation) {
    		this.$$set({ animation });
    		flush();
    	}

    	get duration() {
    		return this.$$.ctx[5];
    	}

    	set duration(duration) {
    		this.$$set({ duration });
    		flush();
    	}

    	get xKey() {
    		return this.$$.ctx[6];
    	}

    	set xKey(xKey) {
    		this.$$set({ xKey });
    		flush();
    	}

    	get yKey() {
    		return this.$$.ctx[7];
    	}

    	set yKey(yKey) {
    		this.$$set({ yKey });
    		flush();
    	}

    	get zKey() {
    		return this.$$.ctx[8];
    	}

    	set zKey(zKey) {
    		this.$$set({ zKey });
    		flush();
    	}

    	get rKey() {
    		return this.$$.ctx[9];
    	}

    	set rKey(rKey) {
    		this.$$set({ rKey });
    		flush();
    	}

    	get idKey() {
    		return this.$$.ctx[10];
    	}

    	set idKey(idKey) {
    		this.$$set({ idKey });
    		flush();
    	}

    	get labelKey() {
    		return this.$$.ctx[11];
    	}

    	set labelKey(labelKey) {
    		this.$$set({ labelKey });
    		flush();
    	}

    	get xScale() {
    		return this.$$.ctx[12];
    	}

    	set xScale(xScale) {
    		this.$$set({ xScale });
    		flush();
    	}

    	get yScale() {
    		return this.$$.ctx[13];
    	}

    	set yScale(yScale) {
    		this.$$set({ yScale });
    		flush();
    	}

    	get xFormatTick() {
    		return this.$$.ctx[14];
    	}

    	set xFormatTick(xFormatTick) {
    		this.$$set({ xFormatTick });
    		flush();
    	}

    	get yFormatTick() {
    		return this.$$.ctx[15];
    	}

    	set yFormatTick(yFormatTick) {
    		this.$$set({ yFormatTick });
    		flush();
    	}

    	get xMax() {
    		return this.$$.ctx[50];
    	}

    	set xMax(xMax) {
    		this.$$set({ xMax });
    		flush();
    	}

    	get xMin() {
    		return this.$$.ctx[51];
    	}

    	set xMin(xMin) {
    		this.$$set({ xMin });
    		flush();
    	}

    	get yMax() {
    		return this.$$.ctx[52];
    	}

    	set yMax(yMax) {
    		this.$$set({ yMax });
    		flush();
    	}

    	get yMin() {
    		return this.$$.ctx[53];
    	}

    	set yMin(yMin) {
    		this.$$set({ yMin });
    		flush();
    	}

    	get xAxis() {
    		return this.$$.ctx[16];
    	}

    	set xAxis(xAxis) {
    		this.$$set({ xAxis });
    		flush();
    	}

    	get yAxis() {
    		return this.$$.ctx[17];
    	}

    	set yAxis(yAxis) {
    		this.$$set({ yAxis });
    		flush();
    	}

    	get xTicks() {
    		return this.$$.ctx[18];
    	}

    	set xTicks(xTicks) {
    		this.$$set({ xTicks });
    		flush();
    	}

    	get yTicks() {
    		return this.$$.ctx[19];
    	}

    	set yTicks(yTicks) {
    		this.$$set({ yTicks });
    		flush();
    	}

    	get textColor() {
    		return this.$$.ctx[20];
    	}

    	set textColor(textColor) {
    		this.$$set({ textColor });
    		flush();
    	}

    	get tickColor() {
    		return this.$$.ctx[21];
    	}

    	set tickColor(tickColor) {
    		this.$$set({ tickColor });
    		flush();
    	}

    	get tickDashed() {
    		return this.$$.ctx[22];
    	}

    	set tickDashed(tickDashed) {
    		this.$$set({ tickDashed });
    		flush();
    	}

    	get title() {
    		return this.$$.ctx[23];
    	}

    	set title(title) {
    		this.$$set({ title });
    		flush();
    	}

    	get footer() {
    		return this.$$.ctx[24];
    	}

    	set footer(footer) {
    		this.$$set({ footer });
    		flush();
    	}

    	get legend() {
    		return this.$$.ctx[25];
    	}

    	set legend(legend) {
    		this.$$set({ legend });
    		flush();
    	}

    	get labels() {
    		return this.$$.ctx[26];
    	}

    	set labels(labels) {
    		this.$$set({ labels });
    		flush();
    	}

    	get snapTicks() {
    		return this.$$.ctx[27];
    	}

    	set snapTicks(snapTicks) {
    		this.$$set({ snapTicks });
    		flush();
    	}

    	get padding() {
    		return this.$$.ctx[28];
    	}

    	set padding(padding) {
    		this.$$set({ padding });
    		flush();
    	}

    	get buffer() {
    		return this.$$.ctx[29];
    	}

    	set buffer(buffer) {
    		this.$$set({ buffer });
    		flush();
    	}

    	get color() {
    		return this.$$.ctx[54];
    	}

    	set color(color) {
    		this.$$set({ color });
    		flush();
    	}

    	get colors() {
    		return this.$$.ctx[30];
    	}

    	set colors(colors) {
    		this.$$set({ colors });
    		flush();
    	}

    	get r() {
    		return this.$$.ctx[31];
    	}

    	set r(r) {
    		this.$$set({ r });
    		flush();
    	}

    	get interactive() {
    		return this.$$.ctx[32];
    	}

    	set interactive(interactive) {
    		this.$$set({ interactive });
    		flush();
    	}

    	get xPrefix() {
    		return this.$$.ctx[33];
    	}

    	set xPrefix(xPrefix) {
    		this.$$set({ xPrefix });
    		flush();
    	}

    	get xSuffix() {
    		return this.$$.ctx[34];
    	}

    	set xSuffix(xSuffix) {
    		this.$$set({ xSuffix });
    		flush();
    	}

    	get yPrefix() {
    		return this.$$.ctx[35];
    	}

    	set yPrefix(yPrefix) {
    		this.$$set({ yPrefix });
    		flush();
    	}

    	get ySuffix() {
    		return this.$$.ctx[36];
    	}

    	set ySuffix(ySuffix) {
    		this.$$set({ ySuffix });
    		flush();
    	}

    	get hover() {
    		return this.$$.ctx[37];
    	}

    	set hover(hover) {
    		this.$$set({ hover });
    		flush();
    	}

    	get hovered() {
    		return this.$$.ctx[0];
    	}

    	set hovered(hovered) {
    		this.$$set({ hovered });
    		flush();
    	}

    	get colorHover() {
    		return this.$$.ctx[38];
    	}

    	set colorHover(colorHover) {
    		this.$$set({ colorHover });
    		flush();
    	}

    	get select() {
    		return this.$$.ctx[39];
    	}

    	set select(select) {
    		this.$$set({ select });
    		flush();
    	}

    	get selected() {
    		return this.$$.ctx[1];
    	}

    	set selected(selected) {
    		this.$$set({ selected });
    		flush();
    	}

    	get colorSelect() {
    		return this.$$.ctx[40];
    	}

    	set colorSelect(colorSelect) {
    		this.$$set({ colorSelect });
    		flush();
    	}

    	get highlighted() {
    		return this.$$.ctx[41];
    	}

    	set highlighted(highlighted) {
    		this.$$set({ highlighted });
    		flush();
    	}

    	get colorHighlight() {
    		return this.$$.ctx[42];
    	}

    	set colorHighlight(colorHighlight) {
    		this.$$set({ colorHighlight });
    		flush();
    	}

    	get overlayFill() {
    		return this.$$.ctx[43];
    	}

    	set overlayFill(overlayFill) {
    		this.$$set({ overlayFill });
    		flush();
    	}
    }

    /* src\App.svelte generated by Svelte v3.44.1 */

    const { Object: Object_1$1 } = globals;
    const file$m = "src\\App.svelte";

    // (235:4) <Arrow color="white" {animation}>
    function create_default_slot_3$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Scroll to begin");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3$1.name,
    		type: "slot",
    		source: "(235:4) <Arrow color=\\\"white\\\" {animation}>",
    		ctx
    	});

    	return block;
    }

    // (213:0) <Header    bgcolor="#206095"    bgfixed={true}    theme="dark"    center={false}    short={true}  >
    function create_default_slot_2$1(ctx) {
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let toggle;
    	let updating_checked;
    	let t6;
    	let div;
    	let arrow;
    	let current;

    	function toggle_checked_binding(value) {
    		/*toggle_checked_binding*/ ctx[13](value);
    	}

    	let toggle_props = {
    		label: "Animation " + (/*animation*/ ctx[2] ? 'on' : 'off'),
    		mono: true
    	};

    	if (/*animation*/ ctx[2] !== void 0) {
    		toggle_props.checked = /*animation*/ ctx[2];
    	}

    	toggle = new Toggle({ props: toggle_props, $$inline: true });
    	binding_callbacks.push(() => bind(toggle, 'checked', toggle_checked_binding));

    	arrow = new Arrow({
    			props: {
    				color: "white",
    				animation: /*animation*/ ctx[2],
    				$$slots: { default: [create_default_slot_3$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "UHC Svelte Scrolly Template";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Epsom Lorem ipsum dolor, sit amet consectetur adipisicing elit. Sequi\r\n    voluptate sed quisquam inventore quia odio illo maiores cum enim, aspernatur\r\n    laboriosam amet ipsam, eligendi optio dolor doloribus minus! Dicta, laborum?";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "DD MMM YYYY";
    			t5 = space();
    			p2 = element("p");
    			create_component(toggle.$$.fragment);
    			t6 = space();
    			div = element("div");
    			create_component(arrow.$$.fragment);
    			add_location(h1, file$m, 219, 2, 6888);
    			attr_dev(p0, "class", "text-big");
    			set_style(p0, "margin-top", "5px");
    			add_location(p0, file$m, 220, 2, 6928);
    			set_style(p1, "margin-top", "20px");
    			add_location(p1, file$m, 225, 2, 7223);
    			add_location(p2, file$m, 226, 2, 7270);
    			set_style(div, "margin-top", "90px");
    			add_location(div, file$m, 233, 2, 7409);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, p1, anchor);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			mount_component(toggle, p2, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(arrow, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const toggle_changes = {};
    			if (dirty & /*animation*/ 4) toggle_changes.label = "Animation " + (/*animation*/ ctx[2] ? 'on' : 'off');

    			if (!updating_checked && dirty & /*animation*/ 4) {
    				updating_checked = true;
    				toggle_changes.checked = /*animation*/ ctx[2];
    				add_flush_callback(() => updating_checked = false);
    			}

    			toggle.$set(toggle_changes);
    			const arrow_changes = {};
    			if (dirty & /*animation*/ 4) arrow_changes.animation = /*animation*/ ctx[2];

    			if (dirty & /*$$scope*/ 4194304) {
    				arrow_changes.$$scope = { dirty, ctx };
    			}

    			arrow.$set(arrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(toggle.$$.fragment, local);
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(toggle.$$.fragment, local);
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			destroy_component(toggle);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div);
    			destroy_component(arrow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2$1.name,
    		type: "slot",
    		source: "(213:0) <Header    bgcolor=\\\"#206095\\\"    bgfixed={true}    theme=\\\"dark\\\"    center={false}    short={true}  >",
    		ctx
    	});

    	return block;
    }

    // (242:0) <Section>
    function create_default_slot_1$1(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let blockquote;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Introduction";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Epsom Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque\r\n    minima, quisquam autem fuga unde id vitae expedita iusto blanditiis.\r\n    Necessitatibus dignissimos labore non atque alias quasi. Quaerat quis cum\r\n    architecto.";
    			t3 = space();
    			blockquote = element("blockquote");
    			blockquote.textContent = "\"A quotation.\"—A. Person";
    			add_location(h2, file$m, 242, 2, 7646);
    			add_location(p, file$m, 243, 2, 7671);
    			attr_dev(blockquote, "class", "text-indent");
    			add_location(blockquote, file$m, 250, 2, 7933);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, blockquote, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(blockquote);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(242:0) <Section>",
    		ctx
    	});

    	return block;
    }

    // (265:8) {#if data.district.indicators && metadata.region.lookup}
    function create_if_block$c(ctx) {
    	let div;
    	let scatterchart;
    	let current;

    	scatterchart = new ScatterChart({
    			props: {
    				height: "calc(100vh - 150px)",
    				data: /*data*/ ctx[3].district.indicators.map(/*func*/ ctx[14]),
    				colors: /*explore*/ ctx[8] ? ['lightgrey'] : colors.cat,
    				xKey: /*xKey*/ ctx[4],
    				yKey: /*yKey*/ ctx[5],
    				zKey: /*zKey*/ ctx[6],
    				rKey: /*rKey*/ ctx[7],
    				idKey: "code",
    				labelKey: "name",
    				r: [3, 10],
    				xScale: "log",
    				xTicks: [10, 100, 1000, 10000],
    				xFormatTick: func_1,
    				xSuffix: " sq.km",
    				yFormatTick: func_2,
    				legend: /*zKey*/ ctx[6] != null,
    				labels: true,
    				select: /*explore*/ ctx[8],
    				selected: /*explore*/ ctx[8] ? /*selected*/ ctx[11] : null,
    				hover: true,
    				hovered: /*hovered*/ ctx[10],
    				highlighted: /*explore*/ ctx[8] ? /*chartHighlighted*/ ctx[9] : [],
    				colorSelect: "#206095",
    				colorHighlight: "#999",
    				overlayFill: true,
    				animation: /*animation*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(scatterchart.$$.fragment);
    			attr_dev(div, "class", "chart svelte-xshzp7");
    			add_location(div, file$m, 265, 10, 8377);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(scatterchart, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const scatterchart_changes = {};
    			if (dirty & /*data, metadata*/ 10) scatterchart_changes.data = /*data*/ ctx[3].district.indicators.map(/*func*/ ctx[14]);
    			if (dirty & /*explore*/ 256) scatterchart_changes.colors = /*explore*/ ctx[8] ? ['lightgrey'] : colors.cat;
    			if (dirty & /*xKey*/ 16) scatterchart_changes.xKey = /*xKey*/ ctx[4];
    			if (dirty & /*yKey*/ 32) scatterchart_changes.yKey = /*yKey*/ ctx[5];
    			if (dirty & /*zKey*/ 64) scatterchart_changes.zKey = /*zKey*/ ctx[6];
    			if (dirty & /*rKey*/ 128) scatterchart_changes.rKey = /*rKey*/ ctx[7];
    			if (dirty & /*zKey*/ 64) scatterchart_changes.legend = /*zKey*/ ctx[6] != null;
    			if (dirty & /*explore*/ 256) scatterchart_changes.select = /*explore*/ ctx[8];
    			if (dirty & /*explore*/ 256) scatterchart_changes.selected = /*explore*/ ctx[8] ? /*selected*/ ctx[11] : null;
    			if (dirty & /*explore, chartHighlighted*/ 768) scatterchart_changes.highlighted = /*explore*/ ctx[8] ? /*chartHighlighted*/ ctx[9] : [];
    			if (dirty & /*animation*/ 4) scatterchart_changes.animation = /*animation*/ ctx[2];
    			scatterchart.$set(scatterchart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(scatterchart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(scatterchart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(scatterchart);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(265:8) {#if data.district.indicators && metadata.region.lookup}",
    		ctx
    	});

    	return block;
    }

    // (262:2) 
    function create_background_slot(ctx) {
    	let div1;
    	let figure;
    	let div0;
    	let current;
    	let if_block = /*data*/ ctx[3].district.indicators && /*metadata*/ ctx[1].region.lookup && create_if_block$c(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			figure = element("figure");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "col-wide height-full");
    			add_location(div0, file$m, 263, 6, 8265);
    			add_location(figure, file$m, 262, 4, 8249);
    			attr_dev(div1, "slot", "background");
    			add_location(div1, file$m, 261, 2, 8220);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, figure);
    			append_dev(figure, div0);
    			if (if_block) if_block.m(div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*data*/ ctx[3].district.indicators && /*metadata*/ ctx[1].region.lookup) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*data, metadata*/ 10) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$c(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
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
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_background_slot.name,
    		type: "slot",
    		source: "(262:2) ",
    		ctx
    	});

    	return block;
    }

    // (304:2) 
    function create_foreground_slot(ctx) {
    	let div4;
    	let section0;
    	let div0;
    	let p0;
    	let t0;
    	let strong0;
    	let t2;
    	let t3;
    	let section1;
    	let div1;
    	let p1;
    	let t4;
    	let strong1;
    	let t6;
    	let t7;
    	let section2;
    	let div2;
    	let p2;
    	let t8;
    	let strong2;
    	let t10;
    	let t11;
    	let section3;
    	let div3;
    	let p3;
    	let t12;
    	let strong3;
    	let t14;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			section0 = element("section");
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text("This chart shows the ");
    			strong0 = element("strong");
    			strong0.textContent = "area in square miles";
    			t2 = text(" of each county\r\n          in the North East census region. Each circle represents one county. The\r\n          scale is logarithmic.");
    			t3 = space();
    			section1 = element("section");
    			div1 = element("div");
    			p1 = element("p");
    			t4 = text("The radius of each circle shows the ");
    			strong1 = element("strong");
    			strong1.textContent = "total population";
    			t6 = text(" of\r\n          the county.");
    			t7 = space();
    			section2 = element("section");
    			div2 = element("div");
    			p2 = element("p");
    			t8 = text("The vertical axis shows the ");
    			strong2 = element("strong");
    			strong2.textContent = "density";
    			t10 = text(" of the county in people\r\n          per square miles.");
    			t11 = space();
    			section3 = element("section");
    			div3 = element("div");
    			p3 = element("p");
    			t12 = text("The colour of each circle shows the ");
    			strong3 = element("strong");
    			strong3.textContent = "state";
    			t14 = text(" that the county\r\n          is within.");
    			add_location(strong0, file$m, 307, 31, 9697);
    			add_location(p0, file$m, 306, 8, 9661);
    			attr_dev(div0, "class", "col-medium");
    			add_location(div0, file$m, 305, 6, 9627);
    			attr_dev(section0, "data-id", "chart01");
    			add_location(section0, file$m, 304, 4, 9592);
    			add_location(strong1, file$m, 316, 46, 10035);
    			add_location(p1, file$m, 315, 8, 9984);
    			attr_dev(div1, "class", "col-medium");
    			add_location(div1, file$m, 314, 6, 9950);
    			attr_dev(section1, "data-id", "chart02");
    			add_location(section1, file$m, 313, 4, 9915);
    			add_location(strong2, file$m, 324, 38, 10256);
    			add_location(p2, file$m, 323, 8, 10213);
    			attr_dev(div2, "class", "col-medium");
    			add_location(div2, file$m, 322, 6, 10179);
    			attr_dev(section2, "data-id", "chart03");
    			add_location(section2, file$m, 321, 4, 10144);
    			add_location(strong3, file$m, 332, 46, 10503);
    			add_location(p3, file$m, 331, 8, 10452);
    			attr_dev(div3, "class", "col-medium");
    			add_location(div3, file$m, 330, 6, 10418);
    			attr_dev(section3, "data-id", "chart04");
    			add_location(section3, file$m, 329, 4, 10383);
    			attr_dev(div4, "slot", "foreground");
    			add_location(div4, file$m, 303, 2, 9563);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, section0);
    			append_dev(section0, div0);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(p0, strong0);
    			append_dev(p0, t2);
    			append_dev(div4, t3);
    			append_dev(div4, section1);
    			append_dev(section1, div1);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(p1, strong1);
    			append_dev(p1, t6);
    			append_dev(div4, t7);
    			append_dev(div4, section2);
    			append_dev(section2, div2);
    			append_dev(div2, p2);
    			append_dev(p2, t8);
    			append_dev(p2, strong2);
    			append_dev(p2, t10);
    			append_dev(div4, t11);
    			append_dev(div4, section3);
    			append_dev(section3, div3);
    			append_dev(div3, p3);
    			append_dev(p3, t12);
    			append_dev(p3, strong3);
    			append_dev(p3, t14);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_foreground_slot.name,
    		type: "slot",
    		source: "(304:2) ",
    		ctx
    	});

    	return block;
    }

    // (348:0) <Section>
    function create_default_slot$1(ctx) {
    	let h2;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			h2.textContent = "Conclusions";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Epsom Lorem ipsum dolor sit amet consectetur adipisicing elit. A magni\r\n    ducimus amet repellendus cupiditate? Ad optio saepe ducimus. At eveniet ad\r\n    delectus enim voluptatibus. Quaerat eligendi eaque corrupti possimus\r\n    molestiae?";
    			add_location(h2, file$m, 348, 2, 10777);
    			add_location(p, file$m, 349, 2, 10801);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(348:0) <Section>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$n(ctx) {
    	let uhcheader;
    	let t0;
    	let header;
    	let t1;
    	let section0;
    	let t2;
    	let divider0;
    	let t3;
    	let scroller;
    	let updating_id;
    	let t4;
    	let divider1;
    	let t5;
    	let section1;
    	let t6;
    	let uhcfooter;
    	let current;

    	uhcheader = new UHCHeader({
    			props: { filled: true, center: false },
    			$$inline: true
    		});

    	header = new Header({
    			props: {
    				bgcolor: "#206095",
    				bgfixed: true,
    				theme: "dark",
    				center: false,
    				short: true,
    				$$slots: { default: [create_default_slot_2$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	section0 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	divider0 = new Divider({ $$inline: true });

    	function scroller_id_binding(value) {
    		/*scroller_id_binding*/ ctx[15](value);
    	}

    	let scroller_props = {
    		threshold,
    		splitscreen: true,
    		$$slots: {
    			foreground: [create_foreground_slot],
    			background: [create_background_slot]
    		},
    		$$scope: { ctx }
    	};

    	if (/*id*/ ctx[0]['chart'] !== void 0) {
    		scroller_props.id = /*id*/ ctx[0]['chart'];
    	}

    	scroller = new Scroller({ props: scroller_props, $$inline: true });
    	binding_callbacks.push(() => bind(scroller, 'id', scroller_id_binding));
    	divider1 = new Divider({ $$inline: true });

    	section1 = new Section({
    			props: {
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	uhcfooter = new UHCFooter({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(uhcheader.$$.fragment);
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			create_component(section0.$$.fragment);
    			t2 = space();
    			create_component(divider0.$$.fragment);
    			t3 = space();
    			create_component(scroller.$$.fragment);
    			t4 = space();
    			create_component(divider1.$$.fragment);
    			t5 = space();
    			create_component(section1.$$.fragment);
    			t6 = space();
    			create_component(uhcfooter.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(uhcheader, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(header, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(section0, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(divider0, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(scroller, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(divider1, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(section1, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(uhcfooter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const header_changes = {};

    			if (dirty & /*$$scope, animation*/ 4194308) {
    				header_changes.$$scope = { dirty, ctx };
    			}

    			header.$set(header_changes);
    			const section0_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				section0_changes.$$scope = { dirty, ctx };
    			}

    			section0.$set(section0_changes);
    			const scroller_changes = {};

    			if (dirty & /*$$scope, data, metadata, explore, xKey, yKey, zKey, rKey, chartHighlighted, animation*/ 4195326) {
    				scroller_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_id && dirty & /*id*/ 1) {
    				updating_id = true;
    				scroller_changes.id = /*id*/ ctx[0]['chart'];
    				add_flush_callback(() => updating_id = false);
    			}

    			scroller.$set(scroller_changes);
    			const section1_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				section1_changes.$$scope = { dirty, ctx };
    			}

    			section1.$set(section1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(uhcheader.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			transition_in(section0.$$.fragment, local);
    			transition_in(divider0.$$.fragment, local);
    			transition_in(scroller.$$.fragment, local);
    			transition_in(divider1.$$.fragment, local);
    			transition_in(section1.$$.fragment, local);
    			transition_in(uhcfooter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(uhcheader.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(section0.$$.fragment, local);
    			transition_out(divider0.$$.fragment, local);
    			transition_out(scroller.$$.fragment, local);
    			transition_out(divider1.$$.fragment, local);
    			transition_out(section1.$$.fragment, local);
    			transition_out(uhcfooter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(uhcheader, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(section0, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(divider0, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(scroller, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(divider1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(section1, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(uhcfooter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$n.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const threshold = 0.65;
    const func_1 = d => d.toLocaleString();
    const func_2 = d => d.toLocaleString();

    function instance$n($$self, $$props, $$invalidate) {
    	let region;
    	let chartHighlighted;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let theme = 'light';
    	setContext('theme', theme);
    	setColors(themes, theme);

    	//// State
    	let animation = getMotion(); // Set animation preference depending on browser preference

    	let id = {}; // Object to hold visible section IDs of Scroller components
    	let idPrev = {}; // Object to keep track of previous IDs, to compare for changes

    	onMount(() => {
    		idPrev = { ...id };
    	});

    	//// Code to run Scroller actions when new caption IDs come into view
    	function runActions(codes = []) {
    		codes.forEach(code => {
    			if (id[code] != idPrev[code]) {
    				if (actions[code][id[code]]) {
    					actions[code][id[code]]();
    				}

    				idPrev[code] = id[code];
    			}
    		});
    	}

    	// # ============================================================================ #
    	// 5. Project Configs
    	// THese will change across projects
    	// # ============================================================================ #
    	//   5.1 Scrolly actions
    	let actions = {
    		chart: {
    			chart01: () => {
    				$$invalidate(4, xKey = 'area');
    				$$invalidate(5, yKey = null);
    				$$invalidate(6, zKey = null);
    				$$invalidate(7, rKey = null);
    				$$invalidate(8, explore = false);
    			},
    			chart02: () => {
    				$$invalidate(4, xKey = 'area');
    				$$invalidate(5, yKey = null);
    				$$invalidate(6, zKey = null);
    				$$invalidate(7, rKey = 'pop');
    				$$invalidate(8, explore = false);
    			},
    			chart03: () => {
    				$$invalidate(4, xKey = 'area');
    				$$invalidate(5, yKey = 'density');
    				$$invalidate(6, zKey = null);
    				$$invalidate(7, rKey = 'pop');
    				$$invalidate(8, explore = false);
    			},
    			chart04: () => {
    				$$invalidate(4, xKey = 'area');
    				$$invalidate(5, yKey = 'density');
    				$$invalidate(6, zKey = 'parent_name');
    				$$invalidate(7, rKey = 'pop');
    				$$invalidate(8, explore = false);
    			}
    		}
    	};

    	// # ============================================================================ #
    	//   5.2 Constants
    	const dataset_named = [
    		{ original: 'region', file: 'state' },
    		{ original: 'district', file: 'county' }
    	];

    	// # ============================================================================ #
    	//   5.3 Data
    	let data = { district: {}, region: {} };

    	let metadata = { district: {}, region: {} };
    	let geojson;

    	// # ============================================================================ #
    	// # ============================================================================ #
    	//   5.4 State
    	let hovered; // Hovered district (chart or map)

    	let selected; // Selected district (chart or map)
    	let xKey = 'area'; // xKey for scatter chart
    	let yKey = null; // yKey for scatter chart
    	let zKey = null; // zKey (color) for scatter chart
    	let rKey = null; // rKey (radius) for scatter chart
    	let explore = false; // Allows chart/map interactivity to be toggled on/off

    	// # ============================================================================ #
    	//   5.5 Initialisation code
    	dataset_named.forEach(dataset => {
    		const geo = dataset.original;
    		const uhc_geo = dataset.file;

    		getData(`./data/data_${uhc_geo}.csv`).then(arr => {
    			let meta = arr.map(d => ({
    				code: d.code,
    				name: d.name,
    				parent: d.parent ? d.parent : null
    			}));

    			let lookup = {};

    			meta.forEach(d => {
    				lookup[d.code] = d;
    			});

    			// bug here
    			$$invalidate(1, metadata[geo].array = meta, metadata);

    			$$invalidate(1, metadata[geo].lookup = lookup, metadata);

    			let indicators = arr.map((d, i) => ({
    				...meta[i],
    				area: d.area,
    				pop: d['2020'],
    				density: d.density,
    				age_med: d.age_med
    			}));

    			if (geo == 'district') {
    				['density', 'age_med'].forEach(key => {
    					let values = indicators.map(d => d[key]).sort((a, b) => a - b);
    					let breaks = getBreaks(values);
    					indicators.forEach((d, i) => indicators[i][key + '_color'] = getColor(d[key], breaks, colors.seq));
    				});
    			}

    			$$invalidate(3, data[geo].indicators = indicators, data);
    			let years = [2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
    			let timeseries = [];

    			arr.forEach(d => {
    				years.forEach(year => {
    					timeseries.push({
    						code: d.code,
    						name: d.name,
    						value: d[year],
    						year
    					});
    				});
    			});

    			$$invalidate(3, data[geo].timeseries = timeseries, data);
    		});
    	});

    	const writable_props = [];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function toggle_checked_binding(value) {
    		animation = value;
    		$$invalidate(2, animation);
    	}

    	const func = d => ({
    		...d,
    		parent_name: metadata.region.lookup[d.parent].name
    	});

    	function scroller_id_binding(value) {
    		if ($$self.$$.not_equal(id['chart'], value)) {
    			id['chart'] = value;
    			$$invalidate(0, id);
    		}
    	}

    	$$self.$capture_state = () => ({
    		setContext,
    		onMount,
    		getMotion,
    		themes,
    		UHCHeader,
    		UHCFooter,
    		Header,
    		Section,
    		Media,
    		Scroller,
    		Filler,
    		Divider,
    		Toggle,
    		Arrow,
    		getData,
    		setColors,
    		getBreaks,
    		getColor,
    		colors,
    		ScatterChart,
    		theme,
    		threshold,
    		animation,
    		id,
    		idPrev,
    		runActions,
    		actions,
    		dataset_named,
    		data,
    		metadata,
    		geojson,
    		hovered,
    		selected,
    		xKey,
    		yKey,
    		zKey,
    		rKey,
    		explore,
    		region,
    		chartHighlighted
    	});

    	$$self.$inject_state = $$props => {
    		if ('theme' in $$props) theme = $$props.theme;
    		if ('animation' in $$props) $$invalidate(2, animation = $$props.animation);
    		if ('id' in $$props) $$invalidate(0, id = $$props.id);
    		if ('idPrev' in $$props) idPrev = $$props.idPrev;
    		if ('actions' in $$props) $$invalidate(19, actions = $$props.actions);
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('metadata' in $$props) $$invalidate(1, metadata = $$props.metadata);
    		if ('geojson' in $$props) geojson = $$props.geojson;
    		if ('hovered' in $$props) $$invalidate(10, hovered = $$props.hovered);
    		if ('selected' in $$props) $$invalidate(11, selected = $$props.selected);
    		if ('xKey' in $$props) $$invalidate(4, xKey = $$props.xKey);
    		if ('yKey' in $$props) $$invalidate(5, yKey = $$props.yKey);
    		if ('zKey' in $$props) $$invalidate(6, zKey = $$props.zKey);
    		if ('rKey' in $$props) $$invalidate(7, rKey = $$props.rKey);
    		if ('explore' in $$props) $$invalidate(8, explore = $$props.explore);
    		if ('region' in $$props) $$invalidate(12, region = $$props.region);
    		if ('chartHighlighted' in $$props) $$invalidate(9, chartHighlighted = $$props.chartHighlighted);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*id*/ 1) {
    			 id && runActions(Object.keys(actions)); // Run above code when 'id' object changes
    		}

    		if ($$self.$$.dirty & /*metadata*/ 2) {
    			 $$invalidate(12, region = selected && metadata.district.lookup
    			? metadata.district.lookup[selected].parent
    			: null); // Gets region code for 'selected'
    		}

    		if ($$self.$$.dirty & /*metadata, region*/ 4098) {
    			 $$invalidate(9, chartHighlighted = metadata.district.array && region
    			? metadata.district.array.filter(d => d.parent == region).map(d => d.code)
    			: []); // Array of district codes in 'region'
    		}
    	};

    	return [
    		id,
    		metadata,
    		animation,
    		data,
    		xKey,
    		yKey,
    		zKey,
    		rKey,
    		explore,
    		chartHighlighted,
    		hovered,
    		selected,
    		region,
    		toggle_checked_binding,
    		func,
    		scroller_id_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$n.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
