(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.immer = {}));
}(this, (function (exports) { 'use strict';

	var _ref;

	// Should be no imports here!
	// SOme things that should be evaluated before all else...
	var hasSymbol = typeof Symbol !== "undefined";
	var hasMap = typeof Map !== "undefined";
	var hasSet = typeof Set !== "undefined";
	var hasProxies = typeof Proxy !== "undefined" && typeof Proxy.revocable !== "undefined" && typeof Reflect !== "undefined";
	/**
	 * The sentinel value returned by producers to replace the draft with undefined.
	 */

	var NOTHING = hasSymbol ?
	/*#__PURE__*/
	Symbol("immer-nothing") : (_ref = {}, _ref["immer-nothing"] = true, _ref);
	/**
	 * To let Immer treat your class instances as plain immutable objects
	 * (albeit with a custom prototype), you must define either an instance property
	 * or a static property on each of your custom classes.
	 *
	 * Otherwise, your class instance will never be drafted, which means it won't be
	 * safe to mutate in a produce callback.
	 */

	var DRAFTABLE = hasSymbol ?
	/*#__PURE__*/
	Symbol("immer-draftable") : "__$immer_draftable";
	var DRAFT_STATE = hasSymbol ?
	/*#__PURE__*/
	Symbol("immer-state") : "__$immer_state";
	var iteratorSymbol = hasSymbol ? Symbol.iterator : "@@iterator";

	var errors = {
	  0: "Illegal state",
	  1: "Immer drafts cannot have computed properties",
	  2: "This object has been frozen and should not be mutated",
	  3: function _(data) {
	    return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
	  },
	  4: "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
	  5: "Immer forbids circular references",
	  6: "The first or second argument to `produce` must be a function",
	  7: "The third argument to `produce` must be a function or undefined",
	  8: "First argument to `createDraft` must be a plain object, an array, or an immerable object",
	  9: "First argument to `finishDraft` must be a draft returned by `createDraft`",
	  10: "The given draft is already finalized",
	  11: "Object.defineProperty() cannot be used on an Immer draft",
	  12: "Object.setPrototypeOf() cannot be used on an Immer draft",
	  13: "Immer only supports deleting array indices",
	  14: "Immer only supports setting array indices and the 'length' property",
	  15: function _(path) {
	    return "Cannot apply patch, path doesn't resolve: " + path;
	  },
	  16: 'Sets cannot have "replace" patches.',
	  17: function _(op) {
	    return "Unsupported patch operation: " + op;
	  },
	  18: function _(plugin) {
	    return "The plugin for '" + plugin + "' has not been loaded into Immer. To enable the plugin, import and call `enable" + plugin + "()` when initializing your application.";
	  },
	  19: "plugin not loaded",
	  20: "Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available"
	};
	function die(error) {
	  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  {
	    var e = errors[error];
	    var msg = !e ? "unknown error nr: " + error : typeof e === "function" ? e.apply(null, args) : e;
	    throw new Error("[Immer] " + msg);
	  }
	}

	var ArchtypeObject = 0;
	var ArchtypeArray = 1;
	var ArchtypeMap = 2;
	var ArchtypeSet = 3;
	var ProxyTypeProxyObject = 0;
	var ProxyTypeProxyArray = 1;
	var ProxyTypeES5Object = 4;
	var ProxyTypeES5Array = 5;
	var ProxyTypeMap = 2;
	var ProxyTypeSet = 3;

	/** Returns true if the given value is an Immer draft */

	/*#__PURE__*/

	function isDraft(value) {
	  return !!value && !!value[DRAFT_STATE];
	}
	/** Returns true if the given value can be drafted by Immer */

	/*#__PURE__*/

	function isDraftable(value) {
	  if (!value) return false;
	  return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor[DRAFTABLE] || isMap(value) || isSet(value);
	}
	/*#__PURE__*/

	function isPlainObject(value) {
	  if (!value || typeof value !== "object") return false;
	  var proto = Object.getPrototypeOf(value);
	  return !proto || proto === Object.prototype;
	}
	function original(value) {
	  if (value && value[DRAFT_STATE]) {
	    return value[DRAFT_STATE].base_;
	  } // otherwise return undefined

	}
	/*#__PURE__*/

	var ownKeys = typeof Reflect !== "undefined" && Reflect.ownKeys ? Reflect.ownKeys : typeof Object.getOwnPropertySymbols !== "undefined" ? function (obj) {
	  return Object.getOwnPropertyNames(obj).concat(Object.getOwnPropertySymbols(obj));
	} :
	/* istanbul ignore next */
	Object.getOwnPropertyNames;
	function each(obj, iter) {
	  if (getArchtype(obj) === ArchtypeObject) {
	    ownKeys(obj).forEach(function (key) {
	      return iter(key, obj[key], obj);
	    });
	  } else {
	    obj.forEach(function (entry, index) {
	      return iter(index, entry, obj);
	    });
	  }
	}
	/*#__PURE__*/

	function getArchtype(thing) {
	  /* istanbul ignore next */
	  var state = thing[DRAFT_STATE];
	  return state ? state.type_ > 3 ? state.type_ - 4 // cause Object and Array map back from 4 and 5
	  : state.type_ // others are the same
	  : Array.isArray(thing) ? ArchtypeArray : isMap(thing) ? ArchtypeMap : isSet(thing) ? ArchtypeSet : ArchtypeObject;
	}
	/*#__PURE__*/

	function has(thing, prop) {
	  return getArchtype(thing) === ArchtypeMap ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
	}
	/*#__PURE__*/

	function get(thing, prop) {
	  // @ts-ignore
	  return getArchtype(thing) === ArchtypeMap ? thing.get(prop) : thing[prop];
	}
	/*#__PURE__*/

	function set(thing, propOrOldValue, value) {
	  var t = getArchtype(thing);
	  if (t === ArchtypeMap) thing.set(propOrOldValue, value);else if (t === ArchtypeSet) {
	    thing.delete(propOrOldValue);
	    thing.add(value);
	  } else thing[propOrOldValue] = value;
	}
	/*#__PURE__*/

	function is(x, y) {
	  // From: https://github.com/facebook/fbjs/blob/c69904a511b900266935168223063dd8772dfc40/packages/fbjs/src/core/shallowEqual.js
	  if (x === y) {
	    return x !== 0 || 1 / x === 1 / y;
	  } else {
	    return x !== x && y !== y;
	  }
	}
	/*#__PURE__*/

	function isMap(target) {
	  return hasMap && target instanceof Map;
	}
	/*#__PURE__*/

	function isSet(target) {
	  return hasSet && target instanceof Set;
	}
	/*#__PURE__*/

	function latest(state) {
	  return state.copy_ || state.base_;
	}
	function shallowCopy(base, invokeGetters) {
	  if (invokeGetters === void 0) {
	    invokeGetters = false;
	  }

	  if (Array.isArray(base)) return base.slice();
	  var clone = Object.create(Object.getPrototypeOf(base));
	  each(base, function (key) {
	    if (key === DRAFT_STATE) {
	      return; // Never copy over draft state.
	    }

	    var desc = Object.getOwnPropertyDescriptor(base, key);
	    var value = desc.value;

	    if (desc.get) {
	      if (!invokeGetters) die(1);
	      value = desc.get.call(base);
	    }

	    if (desc.enumerable) {
	      clone[key] = value;
	    } else {
	      Object.defineProperty(clone, key, {
	        value: value,
	        writable: true,
	        configurable: true
	      });
	    }
	  });
	  return clone;
	}
	function freeze(obj, deep) {
	  if (isDraft(obj) || Object.isFrozen(obj) || !isDraftable(obj)) return;

	  if (getArchtype(obj) > 1
	  /* Map or Set */
	  ) {
	      obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
	    }

	  Object.freeze(obj);
	  if (deep) each(obj, function (_, value) {
	    return freeze(value, true);
	  });
	}

	function dontMutateFrozenCollections() {
	  die(2);
	}

	/** Plugin utilities */

	var plugins = {};
	function getPlugin(pluginKey) {
	  var plugin = plugins[pluginKey];

	  if (!plugin) {
	    die( 18 , pluginKey);
	  } // @ts-ignore


	  return plugin;
	}
	function loadPlugin(pluginKey, implementation) {
	  plugins[pluginKey] = implementation;
	}

	var currentScope;
	function getCurrentScope() {
	  if ( !currentScope) die(0);
	  return currentScope;
	}

	function createScope(parent_, immer_) {
	  return {
	    drafts_: [],
	    parent_: parent_,
	    immer_: immer_,
	    // Whenever the modified draft contains a draft from another scope, we
	    // need to prevent auto-freezing so the unowned draft can be finalized.
	    canAutoFreeze_: true,
	    unfinalizedDrafts_: 0
	  };
	}

	function usePatchesInScope(scope, patchListener) {
	  if (patchListener) {
	    getPlugin("Patches"); // assert we have the plugin

	    scope.patches_ = [];
	    scope.inversePatches_ = [];
	    scope.patchListener_ = patchListener;
	  }
	}
	function revokeScope(scope) {
	  leaveScope(scope);
	  scope.drafts_.forEach(revokeDraft); // @ts-ignore

	  scope.drafts_ = null;
	}
	function leaveScope(scope) {
	  if (scope === currentScope) {
	    currentScope = scope.parent_;
	  }
	}
	function enterScope(immer) {
	  return currentScope = createScope(currentScope, immer);
	}

	function revokeDraft(draft) {
	  var state = draft[DRAFT_STATE];
	  if (state.type_ === ProxyTypeProxyObject || state.type_ === ProxyTypeProxyArray) state.revoke_();else state.revoked_ = true;
	}

	function processResult(result, scope) {
	  scope.unfinalizedDrafts_ = scope.drafts_.length;
	  var baseDraft = scope.drafts_[0];
	  var isReplaced = result !== undefined && result !== baseDraft;
	  if (!scope.immer_.useProxies_) getPlugin("ES5").willFinalizeES5_(scope, result, isReplaced);

	  if (isReplaced) {
	    if (baseDraft[DRAFT_STATE].modified_) {
	      revokeScope(scope);
	      die(4);
	    }

	    if (isDraftable(result)) {
	      // Finalize the result in case it contains (or is) a subset of the draft.
	      result = finalize(scope, result);
	      if (!scope.parent_) maybeFreeze(scope, result);
	    }

	    if (scope.patches_) {
	      getPlugin("Patches").generateReplacementPatches_(baseDraft[DRAFT_STATE], result, scope.patches_, scope.inversePatches_);
	    }
	  } else {
	    // Finalize the base draft.
	    result = finalize(scope, baseDraft, []);
	  }

	  revokeScope(scope);

	  if (scope.patches_) {
	    scope.patchListener_(scope.patches_, scope.inversePatches_);
	  }

	  return result !== NOTHING ? result : undefined;
	}

	function finalize(rootScope, value, path) {
	  // Don't recurse in tho recursive data structures
	  if (Object.isFrozen(value)) return value;
	  var state = value[DRAFT_STATE]; // A plain object, might need freezing, might contain drafts

	  if (!state) {
	    each(value, function (key, childValue) {
	      return finalizeProperty(rootScope, state, value, key, childValue, path);
	    });
	    return value;
	  } // Never finalize drafts owned by another scope.


	  if (state.scope_ !== rootScope) return value; // Unmodified draft, return the (frozen) original

	  if (!state.modified_) {
	    maybeFreeze(rootScope, state.base_, true);
	    return state.base_;
	  } // Not finalized yet, let's do that now


	  if (!state.finalized_) {
	    state.finalized_ = true;
	    state.scope_.unfinalizedDrafts_--;
	    var result = // For ES5, create a good copy from the draft first, with added keys and without deleted keys.
	    state.type_ === ProxyTypeES5Object || state.type_ === ProxyTypeES5Array ? state.copy_ = shallowCopy(state.draft_, true) : state.copy_; // finalize all children of the copy

	    each(result, function (key, childValue) {
	      return finalizeProperty(rootScope, state, result, key, childValue, path);
	    }); // everything inside is frozen, we can freeze here

	    maybeFreeze(rootScope, result, false); // first time finalizing, let's create those patches

	    if (path && rootScope.patches_) {
	      getPlugin("Patches").generatePatches_(state, path, rootScope.patches_, rootScope.inversePatches_);
	    }
	  }

	  return state.copy_;
	}

	function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath) {
	  if ( childValue === targetObject) die(5);

	  if (isDraft(childValue)) {
	    var path = rootPath && parentState && parentState.type_ !== ProxyTypeSet && // Set objects are atomic since they have no keys.
	    !has(parentState.assigned_, prop) // Skip deep patches for assigned keys.
	    ? rootPath.concat(prop) : undefined; // Drafts owned by `scope` are finalized here.

	    var res = finalize(rootScope, childValue, path);
	    set(targetObject, prop, res); // Drafts from another scope must prevented to be frozen
	    // if we got a draft back from finalize, we're in a nested produce and shouldn't freeze

	    if (isDraft(res)) {
	      rootScope.canAutoFreeze_ = false;
	    } else return;
	  } // Unchanged draft properties are ignored.


	  if (parentState && is(childValue, get(parentState.base_, prop))) {
	    return;
	  } // Search new objects for unfinalized drafts. Frozen objects should never contain drafts.


	  if (isDraftable(childValue)) {
	    if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
	      // optimization: if an object is not a draft, and we don't have to
	      // deepfreeze everything, and we are sure that no drafts are left in the remaining object
	      // cause we saw and finalized all drafts already; we can stop visiting the rest of the tree.
	      // This benefits especially adding large data tree's without further processing.
	      // See add-data.js perf test
	      return;
	    }

	    finalize(rootScope, childValue); // immer deep freezes plain objects, so if there is no parent state, we freeze as well

	    if (!parentState || !parentState.scope_.parent_) maybeFreeze(rootScope, childValue);
	  }
	}

	function maybeFreeze(scope, value, deep) {
	  if (deep === void 0) {
	    deep = false;
	  }

	  if (scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
	    freeze(value, deep);
	  }
	}

	/**
	 * Returns a new draft of the `base` object.
	 *
	 * The second argument is the parent draft-state (used internally).
	 */

	function createProxyProxy(base, parent) {
	  var isArray = Array.isArray(base);
	  var state = {
	    type_: isArray ? ProxyTypeProxyArray : ProxyTypeProxyObject,
	    // Track which produce call this is associated with.
	    scope_: parent ? parent.scope_ : getCurrentScope(),
	    // True for both shallow and deep changes.
	    modified_: false,
	    // Used during finalization.
	    finalized_: false,
	    // Track which properties have been assigned (true) or deleted (false).
	    assigned_: {},
	    // The parent draft state.
	    parent_: parent,
	    // The base state.
	    base_: base,
	    // The base proxy.
	    draft_: null,
	    // Any property proxies.
	    drafts_: {},
	    // The base copy with any updated values.
	    copy_: null,
	    // Called by the `produce` function.
	    revoke_: null,
	    isManual_: false
	  }; // the traps must target something, a bit like the 'real' base.
	  // but also, we need to be able to determine from the target what the relevant state is
	  // (to avoid creating traps per instance to capture the state in closure,
	  // and to avoid creating weird hidden properties as well)
	  // So the trick is to use 'state' as the actual 'target'! (and make sure we intercept everything)
	  // Note that in the case of an array, we put the state in an array to have better Reflect defaults ootb

	  var target = state;
	  var traps = objectTraps;

	  if (isArray) {
	    target = [state];
	    traps = arrayTraps;
	  }

	  var _Proxy$revocable = Proxy.revocable(target, traps),
	      revoke = _Proxy$revocable.revoke,
	      proxy = _Proxy$revocable.proxy;

	  state.draft_ = proxy;
	  state.revoke_ = revoke;
	  return proxy;
	}
	/**
	 * Object drafts
	 */

	var objectTraps = {
	  get: function get(state, prop) {
	    if (prop === DRAFT_STATE) return state;
	    var drafts = state.drafts_; // Check for existing draft in unmodified state.

	    if (!state.modified_ && has(drafts, prop)) {
	      return drafts[prop];
	    }

	    var value = latest(state)[prop];

	    if (state.finalized_ || !isDraftable(value)) {
	      return value;
	    } // Check for existing draft in modified state.


	    if (state.modified_) {
	      // Assigned values are never drafted. This catches any drafts we created, too.
	      if (value !== peek(state.base_, prop)) return value; // Store drafts on the copy (when one exists).
	      // @ts-ignore

	      drafts = state.copy_;
	    }

	    return drafts[prop] = createProxy(state.scope_.immer_, value, state);
	  },
	  has: function has(state, prop) {
	    return prop in latest(state);
	  },
	  ownKeys: function ownKeys(state) {
	    return Reflect.ownKeys(latest(state));
	  },
	  set: function set(state, prop
	  /* strictly not, but helps TS */
	  , value) {
	    if (!state.modified_) {
	      var baseValue = peek(state.base_, prop); // Optimize based on value's truthiness. Truthy values are guaranteed to
	      // never be undefined, so we can avoid the `in` operator. Lastly, truthy
	      // values may be drafts, but falsy values are never drafts.

	      var isUnchanged = value ? is(baseValue, value) || value === state.drafts_[prop] : is(baseValue, value) && prop in state.base_;
	      if (isUnchanged) return true;
	      prepareCopy(state);
	      markChangedProxy(state);
	    }

	    state.assigned_[prop] = true; // @ts-ignore

	    state.copy_[prop] = value;
	    return true;
	  },
	  deleteProperty: function deleteProperty(state, prop) {
	    // The `undefined` check is a fast path for pre-existing keys.
	    if (peek(state.base_, prop) !== undefined || prop in state.base_) {
	      state.assigned_[prop] = false;
	      prepareCopy(state);
	      markChangedProxy(state);
	    } else if (state.assigned_[prop]) {
	      // if an originally not assigned property was deleted
	      delete state.assigned_[prop];
	    } // @ts-ignore


	    if (state.copy_) delete state.copy_[prop];
	    return true;
	  },
	  // Note: We never coerce `desc.value` into an Immer draft, because we can't make
	  // the same guarantee in ES5 mode.
	  getOwnPropertyDescriptor: function getOwnPropertyDescriptor(state, prop) {
	    var owner = latest(state);
	    var desc = Reflect.getOwnPropertyDescriptor(owner, prop);

	    if (desc) {
	      desc.writable = true;
	      desc.configurable = state.type_ !== ProxyTypeProxyArray || prop !== "length";
	    }

	    return desc;
	  },
	  defineProperty: function defineProperty() {
	    die(11);
	  },
	  getPrototypeOf: function getPrototypeOf(state) {
	    return Object.getPrototypeOf(state.base_);
	  },
	  setPrototypeOf: function setPrototypeOf() {
	    die(12);
	  }
	};
	/**
	 * Array drafts
	 */

	var arrayTraps = {};
	each(objectTraps, function (key, fn) {
	  // @ts-ignore
	  arrayTraps[key] = function () {
	    arguments[0] = arguments[0][0];
	    return fn.apply(this, arguments);
	  };
	});

	arrayTraps.deleteProperty = function (state, prop) {
	  if ( isNaN(parseInt(prop))) die(13);
	  return objectTraps.deleteProperty.call(this, state[0], prop);
	};

	arrayTraps.set = function (state, prop, value) {
	  if ( prop !== "length" && isNaN(parseInt(prop))) die(14);
	  return objectTraps.set.call(this, state[0], prop, value, state[0]);
	};
	/**
	 * Map drafts
	 */
	// Access a property without creating an Immer draft.


	function peek(draft, prop) {
	  var state = draft[DRAFT_STATE];
	  var desc = Reflect.getOwnPropertyDescriptor(state ? latest(state) : draft, prop);
	  return desc && desc.value;
	}

	function markChangedProxy(state) {
	  if (!state.modified_) {
	    state.modified_ = true;

	    if (state.type_ === ProxyTypeProxyObject || state.type_ === ProxyTypeProxyArray) {
	      var copy = state.copy_ = shallowCopy(state.base_);
	      each(state.drafts_, function (key, value) {
	        // @ts-ignore
	        copy[key] = value;
	      });
	      state.drafts_ = undefined;
	    }

	    if (state.parent_) {
	      markChangedProxy(state.parent_);
	    }
	  }
	}

	function prepareCopy(state) {
	  if (!state.copy_) {
	    state.copy_ = shallowCopy(state.base_);
	  }
	}

	var Immer =
	/*#__PURE__*/
	function () {
	  function Immer(config) {
	    this.useProxies_ = hasProxies;
	    this.autoFreeze_ =  true
	    /* istanbul ignore next */
	    ;
	    if (typeof (config === null || config === void 0 ? void 0 : config.useProxies) === "boolean") this.setUseProxies(config.useProxies);
	    if (typeof (config === null || config === void 0 ? void 0 : config.autoFreeze) === "boolean") this.setAutoFreeze(config.autoFreeze);
	    this.produce = this.produce.bind(this);
	    this.produceWithPatches = this.produceWithPatches.bind(this);
	  }
	  /**
	   * The `produce` function takes a value and a "recipe function" (whose
	   * return value often depends on the base state). The recipe function is
	   * free to mutate its first argument however it wants. All mutations are
	   * only ever applied to a __copy__ of the base state.
	   *
	   * Pass only a function to create a "curried producer" which relieves you
	   * from passing the recipe function every time.
	   *
	   * Only plain objects and arrays are made mutable. All other objects are
	   * considered uncopyable.
	   *
	   * Note: This function is __bound__ to its `Immer` instance.
	   *
	   * @param {any} base - the initial state
	   * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
	   * @param {Function} patchListener - optional function that will be called with all the patches produced here
	   * @returns {any} a new state, or the initial state if nothing was modified
	   */


	  var _proto = Immer.prototype;

	  _proto.produce = function produce(base, recipe, patchListener) {
	    // curried invocation
	    if (typeof base === "function" && typeof recipe !== "function") {
	      var defaultBase = recipe;
	      recipe = base;
	      var self = this;
	      return function curriedProduce(base) {
	        var _this = this;

	        if (base === void 0) {
	          base = defaultBase;
	        }

	        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }

	        return self.produce(base, function (draft) {
	          var _recipe;

	          return (_recipe = recipe).call.apply(_recipe, [_this, draft].concat(args));
	        }); // prettier-ignore
	      };
	    }

	    if (typeof recipe !== "function") die(6);
	    if (patchListener !== undefined && typeof patchListener !== "function") die(7);
	    var result; // Only plain objects, arrays, and "immerable classes" are drafted.

	    if (isDraftable(base)) {
	      var scope = enterScope(this);
	      var proxy = createProxy(this, base, undefined);
	      var hasError = true;

	      try {
	        result = recipe(proxy);
	        hasError = false;
	      } finally {
	        // finally instead of catch + rethrow better preserves original stack
	        if (hasError) revokeScope(scope);else leaveScope(scope);
	      }

	      if (typeof Promise !== "undefined" && result instanceof Promise) {
	        return result.then(function (result) {
	          usePatchesInScope(scope, patchListener);
	          return processResult(result, scope);
	        }, function (error) {
	          revokeScope(scope);
	          throw error;
	        });
	      }

	      usePatchesInScope(scope, patchListener);
	      return processResult(result, scope);
	    } else {
	      result = recipe(base);
	      if (result === NOTHING) return undefined;
	      if (result === undefined) result = base;
	      if (this.autoFreeze_) freeze(result, true);
	      return result;
	    }
	  };

	  _proto.produceWithPatches = function produceWithPatches(arg1, arg2, arg3) {
	    var _this2 = this;

	    if (typeof arg1 === "function") {
	      return function (state) {
	        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
	          args[_key2 - 1] = arguments[_key2];
	        }

	        return _this2.produceWithPatches(state, function (draft) {
	          return arg1.apply(void 0, [draft].concat(args));
	        });
	      };
	    }

	    var patches, inversePatches;
	    var nextState = this.produce(arg1, arg2, function (p, ip) {
	      patches = p;
	      inversePatches = ip;
	    });
	    return [nextState, patches, inversePatches];
	  };

	  _proto.createDraft = function createDraft(base) {
	    if (!isDraftable(base)) die(8);
	    var scope = enterScope(this);
	    var proxy = createProxy(this, base, undefined);
	    proxy[DRAFT_STATE].isManual_ = true;
	    leaveScope(scope);
	    return proxy;
	  };

	  _proto.finishDraft = function finishDraft(draft, patchListener) {
	    var state = draft && draft[DRAFT_STATE];

	    {
	      if (!state || !state.isManual_) die(9);
	      if (state.finalized_) die(10);
	    }

	    var scope = state.scope_;
	    usePatchesInScope(scope, patchListener);
	    return processResult(undefined, scope);
	  }
	  /**
	   * Pass true to automatically freeze all copies created by Immer.
	   *
	   * By default, auto-freezing is disabled in production.
	   */
	  ;

	  _proto.setAutoFreeze = function setAutoFreeze(value) {
	    this.autoFreeze_ = value;
	  }
	  /**
	   * Pass true to use the ES2015 `Proxy` class when creating drafts, which is
	   * always faster than using ES5 proxies.
	   *
	   * By default, feature detection is used, so calling this is rarely necessary.
	   */
	  ;

	  _proto.setUseProxies = function setUseProxies(value) {
	    if (!hasProxies) {
	      die(20);
	    }

	    this.useProxies_ = value;
	  };

	  _proto.applyPatches = function applyPatches(base, patches) {
	    // If a patch replaces the entire state, take that replacement as base
	    // before applying patches
	    var i;

	    for (i = patches.length - 1; i >= 0; i--) {
	      var patch = patches[i];

	      if (patch.path.length === 0 && patch.op === "replace") {
	        base = patch.value;
	        break;
	      }
	    }

	    var applyPatchesImpl = getPlugin("Patches").applyPatches_;

	    if (isDraft(base)) {
	      // N.B: never hits if some patch a replacement, patches are never drafts
	      return applyPatchesImpl(base, patches);
	    } // Otherwise, produce a copy of the base state.


	    return this.produce(base, function (draft) {
	      return applyPatchesImpl(draft, patches.slice(i + 1));
	    });
	  };

	  return Immer;
	}();
	function createProxy(immer, value, parent) {
	  // precondition: createProxy should be guarded by isDraftable, so we know we can safely draft
	  var draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : immer.useProxies_ ? createProxyProxy(value, parent) : getPlugin("ES5").createES5Proxy_(value, parent);
	  var scope = parent ? parent.scope_ : getCurrentScope();
	  scope.drafts_.push(draft);
	  return draft;
	}
	function markChanged(immer, state) {
	  if (immer.useProxies_) {
	    markChangedProxy(state);
	  } else {
	    getPlugin("ES5").markChangedES5_(state);
	  }
	}

	function enableES5() {
	  function willFinalizeES5_(scope, result, isReplaced) {
	    scope.drafts_.forEach(function (draft) {
	      draft[DRAFT_STATE].finalizing_ = true;
	    });

	    if (!isReplaced) {
	      if (scope.patches_) {
	        markChangesRecursively(scope.drafts_[0]);
	      } // This is faster when we don't care about which attributes changed.


	      markChangesSweep(scope.drafts_);
	    } // When a child draft is returned, look for changes.
	    else if (isDraft(result) && result[DRAFT_STATE].scope_ === scope) {
	        markChangesSweep(scope.drafts_);
	      }
	  }

	  function createES5Proxy_(base, parent) {
	    var isArray = Array.isArray(base);
	    var draft = clonePotentialDraft(base);
	    each(draft, function (prop) {
	      proxyProperty(draft, prop, isArray || isEnumerable(base, prop));
	    });
	    var state = {
	      type_: isArray ? ProxyTypeES5Array : ProxyTypeES5Object,
	      scope_: parent ? parent.scope_ : getCurrentScope(),
	      modified_: false,
	      finalizing_: false,
	      finalized_: false,
	      assigned_: {},
	      parent_: parent,
	      base_: base,
	      draft_: draft,
	      copy_: null,
	      revoked_: false,
	      isManual_: false
	    };
	    Object.defineProperty(draft, DRAFT_STATE, {
	      value: state,
	      // enumerable: false <- the default
	      writable: true
	    });
	    return draft;
	  } // Access a property without creating an Immer draft.


	  function peek(draft, prop) {
	    var state = draft[DRAFT_STATE];

	    if (state && !state.finalizing_) {
	      state.finalizing_ = true;
	      var value = draft[prop];
	      state.finalizing_ = false;
	      return value;
	    }

	    return draft[prop];
	  }

	  function _get(state, prop) {
	    assertUnrevoked(state);
	    var value = peek(latest(state), prop);
	    if (state.finalizing_) return value; // Create a draft if the value is unmodified.

	    if (value === peek(state.base_, prop) && isDraftable(value)) {
	      prepareCopy(state); // @ts-ignore

	      return state.copy_[prop] = createProxy(state.scope_.immer_, value, state);
	    }

	    return value;
	  }

	  function _set(state, prop, value) {
	    assertUnrevoked(state);
	    state.assigned_[prop] = true;

	    if (!state.modified_) {
	      if (is(value, peek(latest(state), prop))) return;
	      markChangedES5_(state);
	      prepareCopy(state);
	    } // @ts-ignore


	    state.copy_[prop] = value;
	  }

	  function markChangedES5_(state) {
	    if (!state.modified_) {
	      state.modified_ = true;
	      if (state.parent_) markChangedES5_(state.parent_);
	    }
	  }

	  function prepareCopy(state) {
	    if (!state.copy_) state.copy_ = clonePotentialDraft(state.base_);
	  }

	  function clonePotentialDraft(base) {
	    var state = base && base[DRAFT_STATE];

	    if (state) {
	      state.finalizing_ = true;
	      var draft = shallowCopy(state.draft_, true);
	      state.finalizing_ = false;
	      return draft;
	    }

	    return shallowCopy(base);
	  } // property descriptors are recycled to make sure we don't create a get and set closure per property,
	  // but share them all instead


	  var descriptors = {};

	  function proxyProperty(draft, prop, enumerable) {
	    var desc = descriptors[prop];

	    if (desc) {
	      desc.enumerable = enumerable;
	    } else {
	      descriptors[prop] = desc = {
	        // configurable: true,
	        enumerable: enumerable,
	        get: function get() {
	          return _get(this[DRAFT_STATE], prop);
	        },
	        set: function set(value) {
	          _set(this[DRAFT_STATE], prop, value);
	        }
	      };
	    }

	    Object.defineProperty(draft, prop, desc);
	  } // This looks expensive, but only proxies are visited, and only objects without known changes are scanned.


	  function markChangesSweep(drafts) {
	    // The natural order of drafts in the `scope` array is based on when they
	    // were accessed. By processing drafts in reverse natural order, we have a
	    // better chance of processing leaf nodes first. When a leaf node is known to
	    // have changed, we can avoid any traversal of its ancestor nodes.
	    for (var i = drafts.length - 1; i >= 0; i--) {
	      var state = drafts[i][DRAFT_STATE];

	      if (!state.modified_) {
	        switch (state.type_) {
	          case ProxyTypeES5Array:
	            if (hasArrayChanges(state)) markChangedES5_(state);
	            break;

	          case ProxyTypeES5Object:
	            if (hasObjectChanges(state)) markChangedES5_(state);
	            break;
	        }
	      }
	    }
	  }

	  function markChangesRecursively(object) {
	    if (!object || typeof object !== "object") return;
	    var state = object[DRAFT_STATE];
	    if (!state) return;
	    var base_ = state.base_,
	        draft_ = state.draft_,
	        assigned_ = state.assigned_,
	        type_ = state.type_;

	    if (type_ === ProxyTypeES5Object) {
	      // Look for added keys.
	      // TODO: looks quite duplicate to hasObjectChanges,
	      // probably there is a faster way to detect changes, as sweep + recurse seems to do some
	      // unnecessary work.
	      // also: probably we can store the information we detect here, to speed up tree finalization!
	      each(draft_, function (key) {
	        if (key === DRAFT_STATE) return; // The `undefined` check is a fast path for pre-existing keys.

	        if (base_[key] === undefined && !has(base_, key)) {
	          assigned_[key] = true;
	          markChangedES5_(state);
	        } else if (!assigned_[key]) {
	          // Only untouched properties trigger recursion.
	          markChangesRecursively(draft_[key]);
	        }
	      }); // Look for removed keys.

	      each(base_, function (key) {
	        // The `undefined` check is a fast path for pre-existing keys.
	        if (draft_[key] === undefined && !has(draft_, key)) {
	          assigned_[key] = false;
	          markChangedES5_(state);
	        }
	      });
	    } else if (type_ === ProxyTypeES5Array) {
	      if (hasArrayChanges(state)) {
	        markChangedES5_(state);
	        assigned_.length = true;
	      }

	      if (draft_.length < base_.length) {
	        for (var i = draft_.length; i < base_.length; i++) {
	          assigned_[i] = false;
	        }
	      } else {
	        for (var _i = base_.length; _i < draft_.length; _i++) {
	          assigned_[_i] = true;
	        }
	      } // Minimum count is enough, the other parts has been processed.


	      var min = Math.min(draft_.length, base_.length);

	      for (var _i2 = 0; _i2 < min; _i2++) {
	        // Only untouched indices trigger recursion.
	        if (assigned_[_i2] === undefined) markChangesRecursively(draft_[_i2]);
	      }
	    }
	  }

	  function hasObjectChanges(state) {
	    var base_ = state.base_,
	        draft_ = state.draft_; // Search for added keys and changed keys. Start at the back, because
	    // non-numeric keys are ordered by time of definition on the object.

	    var keys = Object.keys(draft_);

	    for (var i = keys.length - 1; i >= 0; i--) {
	      var key = keys[i];
	      var baseValue = base_[key]; // The `undefined` check is a fast path for pre-existing keys.

	      if (baseValue === undefined && !has(base_, key)) {
	        return true;
	      } // Once a base key is deleted, future changes go undetected, because its
	      // descriptor is erased. This branch detects any missed changes.
	      else {
	          var value = draft_[key];

	          var _state = value && value[DRAFT_STATE];

	          if (_state ? _state.base_ !== baseValue : !is(value, baseValue)) {
	            return true;
	          }
	        }
	    } // At this point, no keys were added or changed.
	    // Compare key count to determine if keys were deleted.


	    return keys.length !== Object.keys(base_).length;
	  }

	  function hasArrayChanges(state) {
	    var draft_ = state.draft_;
	    if (draft_.length !== state.base_.length) return true; // See #116
	    // If we first shorten the length, our array interceptors will be removed.
	    // If after that new items are added, result in the same original length,
	    // those last items will have no intercepting property.
	    // So if there is no own descriptor on the last position, we know that items were removed and added
	    // N.B.: splice, unshift, etc only shift values around, but not prop descriptors, so we only have to check
	    // the last one

	    var descriptor = Object.getOwnPropertyDescriptor(draft_, draft_.length - 1); // descriptor can be null, but only for newly created sparse arrays, eg. new Array(10)

	    if (descriptor && !descriptor.get) return true; // For all other cases, we don't have to compare, as they would have been picked up by the index setters

	    return false;
	  }
	  /*#__PURE__*/


	  function isEnumerable(base, prop) {
	    var desc = Object.getOwnPropertyDescriptor(base, prop);
	    return desc && desc.enumerable ? true : false;
	  }

	  function assertUnrevoked(state
	  /*ES5State | MapState | SetState*/
	  ) {
	    if (state.revoked_) die(3, JSON.stringify(latest(state)));
	  }

	  loadPlugin("ES5", {
	    createES5Proxy_: createES5Proxy_,
	    markChangedES5_: markChangedES5_,
	    willFinalizeES5_: willFinalizeES5_
	  });
	}

	function enablePatches() {
	  var REPLACE = "replace";
	  var ADD = "add";
	  var REMOVE = "remove";

	  function generatePatches_(state, basePath, patches, inversePatches) {
	    switch (state.type_) {
	      case ProxyTypeProxyObject:
	      case ProxyTypeES5Object:
	      case ProxyTypeMap:
	        return generatePatchesFromAssigned(state, basePath, patches, inversePatches);

	      case ProxyTypeES5Array:
	      case ProxyTypeProxyArray:
	        return generateArrayPatches(state, basePath, patches, inversePatches);

	      case ProxyTypeSet:
	        return generateSetPatches(state, basePath, patches, inversePatches);
	    }
	  }

	  function generateArrayPatches(state, basePath, patches, inversePatches) {
	    var base_ = state.base_,
	        assigned_ = state.assigned_;
	    var copy_ = state.copy_; // Reduce complexity by ensuring `base` is never longer.

	    if (copy_.length < base_.length) {
	      var _ref = [copy_, base_];
	      base_ = _ref[0];
	      copy_ = _ref[1];
	      var _ref2 = [inversePatches, patches];
	      patches = _ref2[0];
	      inversePatches = _ref2[1];
	    }

	    var delta = copy_.length - base_.length; // Find the first replaced index.

	    var start = 0;

	    while (base_[start] === copy_[start] && start < base_.length) {
	      ++start;
	    } // Find the last replaced index. Search from the end to optimize splice patches.


	    var end = base_.length;

	    while (end > start && base_[end - 1] === copy_[end + delta - 1]) {
	      --end;
	    } // Process replaced indices.


	    for (var i = start; i < end; ++i) {
	      if (assigned_[i] && copy_[i] !== base_[i]) {
	        var path = basePath.concat([i]);
	        patches.push({
	          op: REPLACE,
	          path: path,
	          value: copy_[i]
	        });
	        inversePatches.push({
	          op: REPLACE,
	          path: path,
	          value: base_[i]
	        });
	      }
	    }

	    var replaceCount = patches.length; // Process added indices.

	    for (var _i = end + delta - 1; _i >= end; --_i) {
	      var _path = basePath.concat([_i]);

	      patches[replaceCount + _i - end] = {
	        op: ADD,
	        path: _path,
	        value: copy_[_i]
	      };
	      inversePatches.push({
	        op: REMOVE,
	        path: _path
	      });
	    }
	  } // This is used for both Map objects and normal objects.


	  function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
	    var base_ = state.base_,
	        copy_ = state.copy_;
	    each(state.assigned_, function (key, assignedValue) {
	      var origValue = get(base_, key);
	      var value = get(copy_, key);
	      var op = !assignedValue ? REMOVE : has(base_, key) ? REPLACE : ADD;
	      if (origValue === value && op === REPLACE) return;
	      var path = basePath.concat(key);
	      patches.push(op === REMOVE ? {
	        op: op,
	        path: path
	      } : {
	        op: op,
	        path: path,
	        value: value
	      });
	      inversePatches.push(op === ADD ? {
	        op: REMOVE,
	        path: path
	      } : op === REMOVE ? {
	        op: ADD,
	        path: path,
	        value: origValue
	      } : {
	        op: REPLACE,
	        path: path,
	        value: origValue
	      });
	    });
	  }

	  function generateSetPatches(state, basePath, patches, inversePatches) {
	    var base_ = state.base_,
	        copy_ = state.copy_;
	    var i = 0;
	    base_.forEach(function (value) {
	      if (!copy_.has(value)) {
	        var path = basePath.concat([i]);
	        patches.push({
	          op: REMOVE,
	          path: path,
	          value: value
	        });
	        inversePatches.unshift({
	          op: ADD,
	          path: path,
	          value: value
	        });
	      }

	      i++;
	    });
	    i = 0;
	    copy_.forEach(function (value) {
	      if (!base_.has(value)) {
	        var path = basePath.concat([i]);
	        patches.push({
	          op: ADD,
	          path: path,
	          value: value
	        });
	        inversePatches.unshift({
	          op: REMOVE,
	          path: path,
	          value: value
	        });
	      }

	      i++;
	    });
	  }

	  function generateReplacementPatches_(rootState, replacement, patches, inversePatches) {
	    patches.push({
	      op: REPLACE,
	      path: [],
	      value: replacement
	    });
	    inversePatches.push({
	      op: REPLACE,
	      path: [],
	      value: rootState.base_
	    });
	  }

	  function applyPatches_(draft, patches) {
	    patches.forEach(function (patch) {
	      var path = patch.path,
	          op = patch.op;
	      var base = draft;

	      for (var i = 0; i < path.length - 1; i++) {
	        base = get(base, path[i]);
	        if (typeof base !== "object") die(15, path.join("/"));
	      }

	      var type = getArchtype(base);
	      var value = deepClonePatchValue(patch.value); // used to clone patch to ensure original patch is not modified, see #411

	      var key = path[path.length - 1];

	      switch (op) {
	        case REPLACE:
	          switch (type) {
	            case ArchtypeMap:
	              return base.set(key, value);

	            /* istanbul ignore next */

	            case ArchtypeSet:
	              die(16);

	            default:
	              // if value is an object, then it's assigned by reference
	              // in the following add or remove ops, the value field inside the patch will also be modifyed
	              // so we use value from the cloned patch
	              // @ts-ignore
	              return base[key] = value;
	          }

	        case ADD:
	          switch (type) {
	            case ArchtypeArray:
	              return base.splice(key, 0, value);

	            case ArchtypeMap:
	              return base.set(key, value);

	            case ArchtypeSet:
	              return base.add(value);

	            default:
	              return base[key] = value;
	          }

	        case REMOVE:
	          switch (type) {
	            case ArchtypeArray:
	              return base.splice(key, 1);

	            case ArchtypeMap:
	              return base.delete(key);

	            case ArchtypeSet:
	              return base.delete(patch.value);

	            default:
	              return delete base[key];
	          }

	        default:
	          die(17, op);
	      }
	    });
	    return draft;
	  }

	  function deepClonePatchValue(obj) {
	    if (!obj || typeof obj !== "object") return obj;
	    if (Array.isArray(obj)) return obj.map(deepClonePatchValue);
	    if (isMap(obj)) return new Map(Array.from(obj.entries()).map(function (_ref3) {
	      var k = _ref3[0],
	          v = _ref3[1];
	      return [k, deepClonePatchValue(v)];
	    }));
	    if (isSet(obj)) return new Set(Array.from(obj).map(deepClonePatchValue));
	    var cloned = Object.create(Object.getPrototypeOf(obj));

	    for (var key in obj) {
	      cloned[key] = deepClonePatchValue(obj[key]);
	    }

	    return cloned;
	  }

	  loadPlugin("Patches", {
	    applyPatches_: applyPatches_,
	    generatePatches_: generatePatches_,
	    generateReplacementPatches_: generateReplacementPatches_
	  });
	}

	// types only!
	function enableMapSet() {
	  /* istanbul ignore next */
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (b.hasOwnProperty(p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  }; // Ugly hack to resolve #502 and inherit built in Map / Set


	  function __extends(d, b) {
	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = ( // @ts-ignore
	    __.prototype = b.prototype, new __());
	  }

	  var DraftMap = function (_super) {
	    __extends(DraftMap, _super); // Create class manually, cause #502


	    function DraftMap(target, parent) {
	      this[DRAFT_STATE] = {
	        type_: ProxyTypeMap,
	        parent_: parent,
	        scope_: parent ? parent.scope_ : getCurrentScope(),
	        modified_: false,
	        finalized_: false,
	        copy_: undefined,
	        assigned_: undefined,
	        base_: target,
	        draft_: this,
	        isManual_: false,
	        revoked_: false
	      };
	      return this;
	    }

	    var p = DraftMap.prototype;
	    Object.defineProperty(p, "size", {
	      get: function get() {
	        return latest(this[DRAFT_STATE]).size;
	      } // enumerable: false,
	      // configurable: true

	    });

	    p.has = function (key) {
	      return latest(this[DRAFT_STATE]).has(key);
	    };

	    p.set = function (key, value) {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);

	      if (latest(state).get(key) !== value) {
	        prepareMapCopy(state);
	        markChanged(state.scope_.immer_, state);
	        state.assigned_.set(key, true);
	        state.copy_.set(key, value);
	        state.assigned_.set(key, true);
	      }

	      return this;
	    };

	    p.delete = function (key) {
	      if (!this.has(key)) {
	        return false;
	      }

	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);
	      prepareMapCopy(state);
	      markChanged(state.scope_.immer_, state);
	      state.assigned_.set(key, false);
	      state.copy_.delete(key);
	      return true;
	    };

	    p.clear = function () {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);
	      prepareMapCopy(state);
	      markChanged(state.scope_.immer_, state);
	      state.assigned_ = new Map();
	      return state.copy_.clear();
	    };

	    p.forEach = function (cb, thisArg) {
	      var _this = this;

	      var state = this[DRAFT_STATE];
	      latest(state).forEach(function (_value, key, _map) {
	        cb.call(thisArg, _this.get(key), key, _this);
	      });
	    };

	    p.get = function (key) {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);
	      var value = latest(state).get(key);

	      if (state.finalized_ || !isDraftable(value)) {
	        return value;
	      }

	      if (value !== state.base_.get(key)) {
	        return value; // either already drafted or reassigned
	      } // despite what it looks, this creates a draft only once, see above condition


	      var draft = createProxy(state.scope_.immer_, value, state);
	      prepareMapCopy(state);
	      state.copy_.set(key, draft);
	      return draft;
	    };

	    p.keys = function () {
	      return latest(this[DRAFT_STATE]).keys();
	    };

	    p.values = function () {
	      var _this2 = this,
	          _ref;

	      var iterator = this.keys();
	      return _ref = {}, _ref[iteratorSymbol] = function () {
	        return _this2.values();
	      }, _ref.next = function next() {
	        var r = iterator.next();
	        /* istanbul ignore next */

	        if (r.done) return r;

	        var value = _this2.get(r.value);

	        return {
	          done: false,
	          value: value
	        };
	      }, _ref;
	    };

	    p.entries = function () {
	      var _this3 = this,
	          _ref2;

	      var iterator = this.keys();
	      return _ref2 = {}, _ref2[iteratorSymbol] = function () {
	        return _this3.entries();
	      }, _ref2.next = function next() {
	        var r = iterator.next();
	        /* istanbul ignore next */

	        if (r.done) return r;

	        var value = _this3.get(r.value);

	        return {
	          done: false,
	          value: [r.value, value]
	        };
	      }, _ref2;
	    };

	    p[iteratorSymbol] = function () {
	      return this.entries();
	    };

	    return DraftMap;
	  }(Map);

	  function proxyMap_(target, parent) {
	    // @ts-ignore
	    return new DraftMap(target, parent);
	  }

	  function prepareMapCopy(state) {
	    if (!state.copy_) {
	      state.assigned_ = new Map();
	      state.copy_ = new Map(state.base_);
	    }
	  }

	  var DraftSet = function (_super) {
	    __extends(DraftSet, _super); // Create class manually, cause #502


	    function DraftSet(target, parent) {
	      this[DRAFT_STATE] = {
	        type_: ProxyTypeSet,
	        parent_: parent,
	        scope_: parent ? parent.scope_ : getCurrentScope(),
	        modified_: false,
	        finalized_: false,
	        copy_: undefined,
	        base_: target,
	        draft_: this,
	        drafts_: new Map(),
	        revoked_: false,
	        isManual_: false
	      };
	      return this;
	    }

	    var p = DraftSet.prototype;
	    Object.defineProperty(p, "size", {
	      get: function get() {
	        return latest(this[DRAFT_STATE]).size;
	      } // enumerable: true,

	    });

	    p.has = function (value) {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state); // bit of trickery here, to be able to recognize both the value, and the draft of its value

	      if (!state.copy_) {
	        return state.base_.has(value);
	      }

	      if (state.copy_.has(value)) return true;
	      if (state.drafts_.has(value) && state.copy_.has(state.drafts_.get(value))) return true;
	      return false;
	    };

	    p.add = function (value) {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);

	      if (state.copy_) {
	        state.copy_.add(value);
	      } else if (!state.base_.has(value)) {
	        prepareSetCopy(state);
	        markChanged(state.scope_.immer_, state);
	        state.copy_.add(value);
	      }

	      return this;
	    };

	    p.delete = function (value) {
	      if (!this.has(value)) {
	        return false;
	      }

	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);
	      prepareSetCopy(state);
	      markChanged(state.scope_.immer_, state);
	      return state.copy_.delete(value) || (state.drafts_.has(value) ? state.copy_.delete(state.drafts_.get(value)) :
	      /* istanbul ignore next */
	      false);
	    };

	    p.clear = function () {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);
	      prepareSetCopy(state);
	      markChanged(state.scope_.immer_, state);
	      return state.copy_.clear();
	    };

	    p.values = function () {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);
	      prepareSetCopy(state);
	      return state.copy_.values();
	    };

	    p.entries = function entries() {
	      var state = this[DRAFT_STATE];
	      assertUnrevoked(state);
	      prepareSetCopy(state);
	      return state.copy_.entries();
	    };

	    p.keys = function () {
	      return this.values();
	    };

	    p[iteratorSymbol] = function () {
	      return this.values();
	    };

	    p.forEach = function forEach(cb, thisArg) {
	      var iterator = this.values();
	      var result = iterator.next();

	      while (!result.done) {
	        cb.call(thisArg, result.value, result.value, this);
	        result = iterator.next();
	      }
	    };

	    return DraftSet;
	  }(Set);

	  function proxySet_(target, parent) {
	    // @ts-ignore
	    return new DraftSet(target, parent);
	  }

	  function prepareSetCopy(state) {
	    if (!state.copy_) {
	      // create drafts for all entries to preserve insertion order
	      state.copy_ = new Set();
	      state.base_.forEach(function (value) {
	        if (isDraftable(value)) {
	          var draft = createProxy(state.scope_.immer_, value, state);
	          state.drafts_.set(value, draft);
	          state.copy_.add(draft);
	        } else {
	          state.copy_.add(value);
	        }
	      });
	    }
	  }

	  function assertUnrevoked(state
	  /*ES5State | MapState | SetState*/
	  ) {
	    if (state.revoked_) die(3, JSON.stringify(latest(state)));
	  }

	  loadPlugin("MapSet", {
	    proxyMap_: proxyMap_,
	    proxySet_: proxySet_
	  });
	}

	function enableAllPlugins() {
	  enableES5();
	  enableMapSet();
	  enablePatches();
	}

	var immer =
	/*#__PURE__*/
	new Immer();
	/**
	 * The `produce` function takes a value and a "recipe function" (whose
	 * return value often depends on the base state). The recipe function is
	 * free to mutate its first argument however it wants. All mutations are
	 * only ever applied to a __copy__ of the base state.
	 *
	 * Pass only a function to create a "curried producer" which relieves you
	 * from passing the recipe function every time.
	 *
	 * Only plain objects and arrays are made mutable. All other objects are
	 * considered uncopyable.
	 *
	 * Note: This function is __bound__ to its `Immer` instance.
	 *
	 * @param {any} base - the initial state
	 * @param {Function} producer - function that receives a proxy of the base state as first argument and which can be freely modified
	 * @param {Function} patchListener - optional function that will be called with all the patches produced here
	 * @returns {any} a new state, or the initial state if nothing was modified
	 */

	var produce = immer.produce;
	/**
	 * Like `produce`, but `produceWithPatches` always returns a tuple
	 * [nextState, patches, inversePatches] (instead of just the next state)
	 */

	var produceWithPatches =
	/*#__PURE__*/
	immer.produceWithPatches.bind(immer);
	/**
	 * Pass true to automatically freeze all copies created by Immer.
	 *
	 * By default, auto-freezing is disabled in production.
	 */

	var setAutoFreeze =
	/*#__PURE__*/
	immer.setAutoFreeze.bind(immer);
	/**
	 * Pass true to use the ES2015 `Proxy` class when creating drafts, which is
	 * always faster than using ES5 proxies.
	 *
	 * By default, feature detection is used, so calling this is rarely necessary.
	 */

	var setUseProxies =
	/*#__PURE__*/
	immer.setUseProxies.bind(immer);
	/**
	 * Apply an array of Immer patches to the first argument.
	 *
	 * This function is a producer, which means copy-on-write is in effect.
	 */

	var applyPatches =
	/*#__PURE__*/
	immer.applyPatches.bind(immer);
	/**
	 * Create an Immer draft from the given base state, which may be a draft itself.
	 * The draft can be modified until you finalize it with the `finishDraft` function.
	 */

	var createDraft =
	/*#__PURE__*/
	immer.createDraft.bind(immer);
	/**
	 * Finalize an Immer draft from a `createDraft` call, returning the base state
	 * (if no changes were made) or a modified copy. The draft must *not* be
	 * mutated afterwards.
	 *
	 * Pass a function as the 2nd argument to generate Immer patches based on the
	 * changes that were made.
	 */

	var finishDraft =
	/*#__PURE__*/
	immer.finishDraft.bind(immer);
	/**
	 * This function is actually a no-op, but can be used to cast an immutable type
	 * to an draft type and make TypeScript happy
	 *
	 * @param value
	 */

	function castDraft(value) {
	  return value;
	}
	/**
	 * This function is actually a no-op, but can be used to cast a mutable type
	 * to an immutable type and make TypeScript happy
	 * @param value
	 */

	function castImmutable(value) {
	  return value;
	}

	exports.Immer = Immer;
	exports.applyPatches = applyPatches;
	exports.castDraft = castDraft;
	exports.castImmutable = castImmutable;
	exports.createDraft = createDraft;
	exports.default = produce;
	exports.enableAllPlugins = enableAllPlugins;
	exports.enableES5 = enableES5;
	exports.enableMapSet = enableMapSet;
	exports.enablePatches = enablePatches;
	exports.finishDraft = finishDraft;
	exports.immerable = DRAFTABLE;
	exports.isDraft = isDraft;
	exports.isDraftable = isDraftable;
	exports.nothing = NOTHING;
	exports.original = original;
	exports.produce = produce;
	exports.produceWithPatches = produceWithPatches;
	exports.setAutoFreeze = setAutoFreeze;
	exports.setUseProxies = setUseProxies;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=immer.umd.development.js.map
