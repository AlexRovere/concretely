/**
 * Playground configuration per category — pure data.
 * engine: 'js' (sandboxed Worker) | 'vue' (iframe preview) | 'ruby'
 * (ruby.wasm) | 'kotlin' (JetBrains compiler API) | 'ts' (typescript
 * transpile → Worker) | 'go' (play.golang.org API) | 'rust'
 * (play.rust-lang.org API) | 'git' (gitdag model).
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
  ts: {
    engine: 'ts',
    lang: 'ts',
    sample: `// TypeScript transpilé dans ton navigateur, puis exécuté en Worker.
interface Utilisateur {
  nom: string;
  age: number;
}

// Générique contraint : T doit avoir un .age
function plusVieux<T extends { age: number }>(liste: T[]): T {
  return liste.reduce((a, b) => (b.age > a.age ? b : a));
}

const equipe: Utilisateur[] = [
  { nom: 'Ada', age: 36 },
  { nom: 'Grace', age: 85 },
  { nom: 'Alan', age: 41 },
];
console.log('doyenne :', plusVieux(equipe).nom);

// Narrowing : le type se précise branche par branche
function affiche(x: string | number) {
  if (typeof x === 'string') console.log(x.toUpperCase());
  else console.log(x.toFixed(2));
}
affiche('salut');
affiche(3.14159);`,
  },
  go: {
    engine: 'go',
    lang: 'go',
    sample: `// Compilé et exécuté sur les serveurs du Go Playground.
package main

import (
	"fmt"
	"sync"
)

func main() {
	// Les slices partagent leur backing array :
	a := []int{1, 2, 3}
	b := a[:2]
	b[0] = 99
	fmt.Println("a[0] vaut", a[0], "— b n'était pas une copie !")

	// Goroutines + WaitGroup :
	var wg sync.WaitGroup
	resultats := make(chan string, 3)
	for _, nom := range []string{"Ada", "Grace", "Alan"} {
		wg.Add(1)
		go func() {
			defer wg.Done()
			resultats <- "salut " + nom
		}()
	}
	wg.Wait()
	close(resultats)
	for msg := range resultats {
		fmt.Println(msg)
	}
}`,
  },
  rust: {
    engine: 'rust',
    lang: 'rust',
    sample: `// Compilé et exécuté sur les serveurs de play.rust-lang.org.
fn main() {
    // Itérateurs : paresseux jusqu'au collect
    let carres: Vec<i32> = (1..=5).map(|n| n * n).collect();
    println!("carrés : {:?}", carres);

    // Option<T> : pas de null — le compilateur force à décider
    let premier_pair = carres.iter().find(|n| *n % 2 == 0);
    match premier_pair {
        Some(n) => println!("premier carré pair : {n}"),
        None => println!("aucun carré pair"),
    }

    // Ownership : v est DÉPLACÉ dans la closure
    let v = vec![1, 2, 3];
    let somme = move || v.iter().sum::<i32>();
    println!("somme : {}", somme());
    // println!("{:?}", v);  // ← décommente : erreur, v a été déplacé
}`,
  },
  sql: {
    engine: 'sql',
    lang: 'sql',
    sample: `-- Du VRAI SQLite (sql.js / WebAssembly) dans ton navigateur.
CREATE TABLE users (id INTEGER PRIMARY KEY, nom TEXT);
CREATE TABLE orders (id INTEGER PRIMARY KEY, user_id INTEGER, produit TEXT, montant REAL);

INSERT INTO users VALUES (1, 'Ada'), (2, 'Alan'), (3, 'Grace');
INSERT INTO orders VALUES
  (10, 1, 'clavier', 89.0),
  (11, 1, 'écran', 249.0),
  (12, 2, 'souris', 25.0),
  (13, 9, 'webcam', 59.0);   -- user 9 n'existe pas (orphelin)

-- LEFT JOIN : Grace apparaît, rembourrée de NULL
SELECT u.nom, o.produit
FROM users u LEFT JOIN orders o ON o.user_id = u.id;

-- Agrégat + HAVING (filtre les GROUPES, pas les lignes)
SELECT u.nom, COUNT(o.id) AS commandes, SUM(o.montant) AS total
FROM users u LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.nom
HAVING COUNT(o.id) >= 1
ORDER BY total DESC;`,
  },
  linux: {
    engine: 'sh',
    lang: 'shell',
    sample: `# Un petit shell simulé : le système de fichiers se dessine en dessous.
mkdir -p projet/src
cd projet
echo "# Mon projet" > README.md
echo "TODO: écrire des tests" >> README.md
cat README.md

touch src/main.js src/utils.js src/notes.txt
ls src

# Pipes : compte les fichiers .js
ls src | grep .js | wc -l

# Le glob est développé par le SHELL (pas par la commande) :
echo src/*.js

# sort | uniq -c : le combo classique
echo "pomme" > fruits.txt
echo "poire" >> fruits.txt
echo "pomme" >> fruits.txt
cat fruits.txt | sort | uniq -c

# essaie aussi : rm -rf / 😈 (ici, c'est sans danger)`,
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
