/**
 * A tiny, faithful model of Ruby method lookup along the ancestors chain.
 *
 * A world describes classes and modules:
 *   classes: {
 *     ClassName: { superclass: 'Object'|null, include: ['Mod'], prepend: ['Mod'],
 *                  methods: { name: { output: '...', super?: true } } },
 *     ModName:   { module: true, methods: {...} },
 *   }
 *
 * The chain (Ruby's MRO, single inheritance + include/prepend): for each class
 * C from the receiver's class up the superclass chain —
 *   [...C.prepend (last prepended first), C, ...C.include (last included first)]
 * `prepend` therefore comes BEFORE the class, `include` AFTER it. `super`
 * continues the lookup from the NEXT ancestor. When nothing matches, Ruby
 * walks the chain AGAIN looking for `method_missing`.
 *
 * Step shapes (for the visualizer):
 *   { type:'lookup', method, chain: [...ancestors] }   once at start
 *   { type:'check', at, found }                        one per ancestor visited
 *   { type:'found', at }
 *   { type:'invoke', at, output }                      the method body's output
 *   { type:'methodMissing', method }                   lookup exhausted → 2nd pass
 * The generator returns { callOrder: [ancestors whose body ran], output: [...] }.
 */

/** Ruby's ancestors chain for a class: prepends, the class, includes, then up. */
export function ancestorsOf(world, className) {
  const chain = [];
  let name = className;
  while (name) {
    const cls = world.classes[name];
    if (!cls) break;
    for (const m of [...(cls.prepend ?? [])].reverse()) chain.push(m);
    chain.push(name);
    for (const m of [...(cls.include ?? [])].reverse()) chain.push(m);
    name = cls.superclass ?? null;
  }
  return chain;
}

export function* simulate(world, className, methodName) {
  const chain = ancestorsOf(world, className);
  const callOrder = [];
  const output = [];

  yield { type: 'lookup', method: methodName, chain: [...chain] };

  // Walk the chain from `startIndex` looking for `method`. On a hit, invoke
  // the body; if it calls `super`, resume from the NEXT ancestor. Returns
  // false when the chain is exhausted (initial miss, or a super with nothing
  // left above it).
  function* walk(method, startIndex, missingName) {
    let i = startIndex;
    while (i < chain.length) {
      const at = chain[i];
      const def = world.classes[at]?.methods?.[method];
      const found = Boolean(def);
      yield { type: 'check', at, found };
      if (!found) { i += 1; continue; }
      yield { type: 'found', at };
      const text = missingName ? def.output.replaceAll('%s', missingName) : def.output;
      callOrder.push(at);
      output.push(text);
      yield { type: 'invoke', at, output: text };
      if (def.super) { i += 1; continue; }
      return true;
    }
    return false;
  }

  const resolved = yield* walk(methodName, 0);
  if (!resolved) {
    yield { type: 'methodMissing', method: methodName };
    yield* walk('method_missing', 0, methodName);
  }

  return { callOrder, output };
}

/** Run a lookup to completion and return { callOrder, output }. */
export function summaryOf(world, className, methodName) {
  const gen = simulate(world, className, methodName);
  let res = gen.next();
  while (!res.done) res = gen.next();
  return res.value;
}

const BASE_CLASSES = {
  Object: { superclass: 'BasicObject', include: ['Kernel'], methods: {} },
  Kernel: { module: true, methods: {} },
  BasicObject: { superclass: null, methods: {} },
};

export const RUBYLOOKUP_SCENARIOS = [
  {
    id: 'prepend-include',
    code: `module Polite                       # include → APRÈS la classe
  def hello = "…et bonne journée"
end

module Loud                         # prepend → AVANT la classe
  def hello = "📢 " + super
end

class Greeter
  prepend Loud
  include Polite
  def hello = "Bonjour ! " + super
end

Greeter.new.hello
# Loud#hello → super → Greeter#hello → super → Polite#hello`,
    world: {
      classes: {
        Loud: { module: true, methods: { hello: { output: '📢 (Loud, prepend)', super: true } } },
        Polite: { module: true, methods: { hello: { output: '…et bonne journée (Polite, include)' } } },
        Greeter: {
          superclass: 'Object',
          prepend: ['Loud'],
          include: ['Polite'],
          methods: { hello: { output: 'Bonjour ! (Greeter)', super: true } },
        },
        ...BASE_CLASSES,
      },
    },
    className: 'Greeter',
    call: 'hello',
  },
  {
    id: 'method-missing',
    code: `class Greeter
  def method_missing(name, *args)
    "👻 méthode fantôme : #{name}"
  end
end

Greeter.new.fly
# fly ? → Greeter ✗ → Object ✗ → BasicObject ✗
# 2ᵉ passe : method_missing ? → Greeter ✓`,
    world: {
      classes: {
        Greeter: {
          superclass: 'Object',
          methods: { method_missing: { output: '👻 méthode fantôme : %s' } },
        },
        ...BASE_CLASSES,
      },
    },
    className: 'Greeter',
    call: 'fly',
  },
];

export const rubyLookupScenarioById = (id) =>
  RUBYLOOKUP_SCENARIOS.find((s) => s.id === id);
