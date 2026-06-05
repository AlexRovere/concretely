/**
 * A model of SwiftUI state ownership and view updates — @State, @Binding,
 * @StateObject and @ObservedObject.
 *
 * The mental model:
 *  - State lives in exactly ONE view (its owner); @Binding is a read/write
 *    pipe to that storage, not a copy.
 *  - Changing state re-evaluates the bodies of the owner and of every view
 *    that reads it; views that don't read it are skipped by the diff.
 *  - When a parent's body re-runs, an `@ObservedObject` created inline
 *    (`Child(vm: VM())`) is a BRAND NEW object — its state resets. With
 *    `@StateObject` SwiftUI keeps the first instance alive. That difference
 *    is the classic "my counter resets" bug.
 *
 * A scenario is a view tree + a sequence of taps:
 *   tree:    { id, state?: {prop: value}, object?: {kind:'observed'|'stateobject',
 *              name, values}, binds?: [prop], reads?: [prop], children?: [...] }
 *   actions: { tap, set: {prop, by?|toggle?} } | { tap, objectSet: {prop, by} }
 *
 * Step shapes (for the visualizer):
 *   { type:'body', view, n }                      body evaluated (n-th render)
 *   { type:'skip', view }                         diff skipped this view
 *   { type:'tap',  view }
 *   { type:'set',  view, prop, value }            @State changed at its owner
 *   { type:'objectSet', view, name, prop, value, instance }
 *   { type:'recreate', view, name, instance }     @ObservedObject reset by parent body
 *   { type:'keep', view, name, instance }         @StateObject survived parent body
 * The generator returns { state, renders, objects }.
 */

function flatten(node, parent = null, out = []) {
  out.push({ node, parent });
  for (const c of node.children || []) flatten(c, node, out);
  return out;
}

/** Does this view read the given root-state prop (directly or via @Binding)? */
const readsProp = (node, prop) =>
  (node.reads || []).includes(prop) || (node.binds || []).includes(prop);

export function* simulate(scenario) {
  const all = flatten(scenario.tree);
  const root = scenario.tree;
  const state = { ...(root.state || {}) };
  const renders = {};
  // Live object storage per object-owning view: { name, kind, instance, values }
  const objects = {};
  for (const { node } of all) {
    if (node.object) {
      objects[node.id] = {
        name: node.object.name,
        kind: node.object.kind,
        instance: 1,
        values: { ...node.object.values },
      };
    }
  }

  function* renderView(node) {
    renders[node.id] = (renders[node.id] || 0) + 1;
    yield { type: 'body', view: node.id, n: renders[node.id] };
  }

  const isDescendantOf = (node, ancestor) => {
    let cur = all.find((e) => e.node === node);
    while (cur && cur.parent) {
      if (cur.parent === ancestor) return true;
      cur = all.find((e) => e.node === cur.parent);
    }
    return false;
  };

  // Initial render pass: every body runs once, top-down.
  for (const { node } of all) yield* renderView(node);

  for (const action of scenario.actions) {
    yield { type: 'tap', view: action.tap };

    if (action.set) {
      const { prop } = action.set;
      // Walk up from the tapped view to the state's owner.
      let cur = all.find((e) => e.node.id === action.tap);
      while (cur && !(cur.node.state && prop in cur.node.state)) {
        cur = all.find((e) => e.node === cur.parent);
      }
      const owner = cur ? cur.node : root;
      const next = action.set.toggle ? !state[prop] : state[prop] + (action.set.by ?? 1);
      state[prop] = next;
      yield { type: 'set', view: owner.id, prop, value: next };

      // The owner's body re-evaluates, then its descendants are diffed top-down.
      yield* renderView(owner);
      for (const { node } of all) {
        if (node === owner || !isDescendantOf(node, owner)) continue;
        const obj = objects[node.id];
        if (obj) {
          if (obj.kind === 'observed') {
            // `Child(vm: VM())` in the parent's body → fresh object, state lost.
            obj.instance += 1;
            obj.values = { ...node.object.values };
            yield { type: 'recreate', view: node.id, name: obj.name, instance: obj.instance };
          } else {
            yield { type: 'keep', view: node.id, name: obj.name, instance: obj.instance };
          }
          yield* renderView(node);
        } else if (readsProp(node, prop)) {
          yield* renderView(node);
        } else {
          // Inputs unchanged → SwiftUI's diff skips this body entirely.
          yield { type: 'skip', view: node.id };
        }
      }
    } else if (action.objectSet) {
      const obj = objects[action.tap];
      const { prop, by = 1 } = action.objectSet;
      obj.values[prop] += by;
      yield {
        type: 'objectSet', view: action.tap, name: obj.name,
        prop, value: obj.values[prop], instance: obj.instance,
      };
      // @Published change re-renders only the subscribed view, not the parent.
      yield* renderView(all.find((e) => e.node.id === action.tap).node);
    }
  }

  return { state, renders, objects };
}

/** Run a scenario to completion and return its final state. */
export function finalStateOf(scenario) {
  const gen = simulate(scenario);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

export const SWIFTSTATE_SCENARIOS = [
  {
    id: 'state-binding',
    code: `struct CounterView: View {
    @State private var count = 0          // l'état vit ICI

    var body: some View {
        VStack {
            TitleView()                    // ne lit pas count
            Text("count = \\(count)")
            IncrementButton(count: $count) // @Binding : un tuyau, pas une copie
        }
    }
}

struct IncrementButton: View {
    @Binding var count: Int
    var body: some View {
        Button("+1") { count += 1 }        // écrit dans le storage du parent
    }
}`,
    tree: {
      id: 'CounterView',
      state: { count: 0 },
      children: [
        { id: 'TitleView' },
        { id: 'IncrementButton', binds: ['count'] },
      ],
    },
    actions: [
      { tap: 'IncrementButton', set: { prop: 'count', by: 1 } },
      { tap: 'IncrementButton', set: { prop: 'count', by: 1 } },
    ],
  },
  {
    id: 'observed-reset',
    code: `final class CounterVM: ObservableObject {
    @Published var count = 0
}

struct ParentView: View {
    @State private var flag = false

    var body: some View {
        Toggle("Flag", isOn: $flag)
        CounterChild(vm: CounterVM())   // ⚠️ recréé à CHAQUE body !
    }
}

struct CounterChild: View {
    @ObservedObject var vm: CounterVM   // ne possède pas le cycle de vie
    var body: some View {
        Button("+1") { vm.count += 1 }
        Text("\\(vm.count)")
    }
}`,
    tree: {
      id: 'ParentView',
      state: { flag: false },
      children: [
        { id: 'CounterChild', object: { kind: 'observed', name: 'vm', values: { count: 0 } } },
      ],
    },
    actions: [
      { tap: 'CounterChild', objectSet: { prop: 'count', by: 1 } },
      { tap: 'CounterChild', objectSet: { prop: 'count', by: 1 } },
      { tap: 'ParentView', set: { prop: 'flag', toggle: true } }, // 💥 count repart à 0
    ],
  },
  {
    id: 'stateobject-fix',
    code: `final class CounterVM: ObservableObject {
    @Published var count = 0
}

struct ParentView: View {
    @State private var flag = false

    var body: some View {
        Toggle("Flag", isOn: $flag)
        CounterChild()
    }
}

struct CounterChild: View {
    @StateObject private var vm = CounterVM() // SwiftUI garde la 1ʳᵉ instance
    var body: some View {
        Button("+1") { vm.count += 1 }
        Text("\\(vm.count)")                   // survit aux re-renders du parent
    }
}`,
    tree: {
      id: 'ParentView',
      state: { flag: false },
      children: [
        { id: 'CounterChild', object: { kind: 'stateobject', name: 'vm', values: { count: 0 } } },
      ],
    },
    actions: [
      { tap: 'CounterChild', objectSet: { prop: 'count', by: 1 } },
      { tap: 'CounterChild', objectSet: { prop: 'count', by: 1 } },
      { tap: 'ParentView', set: { prop: 'flag', toggle: true } }, // ✅ count conservé
    ],
  },
];

export const swiftStateScenarioById = (id) =>
  SWIFTSTATE_SCENARIOS.find((s) => s.id === id);
