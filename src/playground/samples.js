/**
 * Playground configuration per category — pure data.
 * engine: 'js' (sandboxed Worker) | 'vue' (iframe preview) | 'ruby'
 * (ruby.wasm) | 'kotlin' (JetBrains compiler API) | 'git' (gitdag model).
 * `lang` feeds the CodeMirror language; samples are French-commented and
 * never translated. Swift has NO playground (no in-browser compiler).
 */
export const PLAYGROUNDS = {
  general: {
    engine: 'js',
    lang: 'js',
    sample: `// Mémoïsation : compare les deux comptes d'appels
let calls = 0;
function fib(n) { calls++; return n < 2 ? n : fib(n - 1) + fib(n - 2); }
fib(20);
console.log('fib(20) naïf      :', calls, 'appels');

calls = 0;
const memo = new Map();
function fibM(n) {
  calls++;
  if (memo.has(n)) return memo.get(n);
  const v = n < 2 ? n : fibM(n - 1) + fibM(n - 2);
  memo.set(n, v);
  return v;
}
fibM(20);
console.log('fib(20) mémoïsé :', calls, 'appels');`,
  },
  js: {
    engine: 'js',
    lang: 'js',
    sample: `// Prédis l'ordre avant d'exécuter…
console.log('1 sync');

setTimeout(() => console.log('4 macrotâche'), 0);

Promise.resolve().then(() => console.log('3 microtâche'));

console.log('2 sync');`,
  },
  vue: {
    engine: 'vue',
    lang: 'js',
    sample: `// Un composant Vue complet — template compilé en live.
const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    const count = ref(0);
    const double = computed(() => count.value * 2);
    console.log('setup() exécuté une seule fois');
    return { count, double };
  },
  template: \`
    <button @click="count++">clics : {{ count }}</button>
    <p>le double (computed) : {{ double }}</p>
  \`,
}).mount('#app');`,
  },
  ruby: {
    engine: 'ruby',
    lang: 'ruby',
    sample: `# Du VRAI Ruby (ruby.wasm) dans ton navigateur.
puts RUBY_VERSION

# Seuls nil et false sont falsy :
puts "0 est truthy !" if 0

# Blocks + Enumerable :
total = (1..5).select(&:odd?).sum { |n| n * n }
puts "somme des carrés impairs : #{total}"

# Symbols internés, strings non :
puts "a".object_id == "a".object_id   # false
puts :a.object_id == :a.object_id     # true`,
  },
  kotlin: {
    engine: 'kotlin',
    lang: 'kotlin',
    sample: `// Compilé et exécuté sur les serveurs JetBrains.
data class User(val name: String, val age: Int)

fun main() {
    val users = listOf(User("Ada", 36), User("Alan", 41), User("Grace", 85))

    // Scope functions + collections :
    users.filter { it.age > 40 }
        .map { it.name.uppercase() }
        .also { println("seniors : $it") }

    // when exhaustif sur une expression :
    val n = 7
    val parite = when {
        n % 2 == 0 -> "pair"
        else -> "impair"
    }
    println("$n est $parite")
}`,
  },
  git: {
    engine: 'git',
    lang: 'shell',
    sample: `# Tape des commandes git : le DAG se dessine en dessous.
git commit -m "init"
git commit -m "feat A"
git switch -c feature
git commit -m "feat B"
git switch main
git commit -m "hotfix"
# essaie : merge → commit de merge ; rebase → C3'
git switch feature
git rebase main
git switch main
git merge feature`,
  },
};

export const playgroundFor = (cat) => PLAYGROUNDS[cat] ?? null;
