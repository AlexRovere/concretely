/**
 * Cheatsheet C — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'c',
  lang: 'js',
  sections: [
    {
      id: 'pointers',
      title: { fr: 'Pointeurs', en: 'Pointers' },
      items: [
        {
          id: 'c-pointer-basics',
          title: { fr: 'Déclarer & déréférencer', en: 'Declare & dereference' },
          code: `int x = 42;
int *p = &x;        // p contient l'adresse de x
printf("%d\\n", *p); // *p lit la valeur pointée : 42
*p = 7;             // modifie x à travers p`,
          note: {
            fr: `& donne l'adresse d'une variable, * suit l'adresse pour lire ou écrire la valeur. L'étoile colle au nom : int *a, b; déclare UN pointeur et UN int.`,
            en: `& takes a variable's address, * follows the address to read or write the value. The star binds to the name: int *a, b; declares ONE pointer and ONE int.`,
          },
        },
        {
          id: 'c-pointer-vs-array',
          title: { fr: 'Pointeur vs tableau', en: 'Pointer vs array' },
          code: `int t[4] = {1, 2, 3, 4};
int *p = t;                  // t "décroît" en pointeur
printf("%zu\\n", sizeof(t)); // 16 — taille du tableau
printf("%zu\\n", sizeof(p)); // 8  — taille d'un pointeur !`,
          note: {
            fr: `Un tableau n'est PAS un pointeur : il décroît en pointeur quand on le passe à une fonction, et sizeof y perd alors la taille réelle. Toujours passer la longueur en paramètre.`,
            en: `An array is NOT a pointer: it decays into one when passed to a function, and sizeof then loses the real size. Always pass the length as a separate parameter.`,
          },
        },
        {
          id: 'c-pointer-arith',
          title: { fr: 'Arithmétique de pointeurs', en: 'Pointer arithmetic' },
          code: `int t[3] = {10, 20, 30};
int *p = t;
printf("%d\\n", *(p + 1)); // 20 — avance d'UN int, pas d'un octet
printf("%d\\n", p[2]);     // 30 — p[i] == *(p + i)`,
          note: {
            fr: `p + 1 avance de sizeof(type) octets, pas de 1. Dépasser la fin du tableau (au-delà de "one past the end") est un comportement indéfini, même sans déréférencer.`,
            en: `p + 1 moves by sizeof(type) bytes, not by 1. Going past the array end (beyond "one past the end") is undefined behavior, even without dereferencing.`,
          },
        },
        {
          id: 'c-double-pointer',
          title: { fr: 'Double pointeur (T**)', en: 'Double pointer (T**)' },
          code: `void alloue(int **out) {
  *out = malloc(sizeof(**out)); // modifie le pointeur de l'appelant
}
int *p = NULL;
alloue(&p); // p pointe maintenant vers la mémoire allouée`,
          note: {
            fr: `Pour qu'une fonction modifie le pointeur de l'appelant (pas juste la valeur pointée), il faut passer son adresse : T**. Sinon la fonction modifie une copie locale.`,
            en: `For a function to modify the caller's pointer (not just the pointed value), pass its address: T**. Otherwise the function only changes a local copy.`,
          },
        },
        {
          id: 'c-function-pointer',
          title: { fr: 'Pointeurs de fonction', en: 'Function pointers' },
          code: `int carre(int x) { return x * x; }
int (*f)(int) = carre;     // f pointe vers carre
printf("%d\\n", f(5));     // 25 — appel via le pointeur
// usage type : qsort(t, n, sizeof(int), comparer);`,
          note: {
            fr: `Syntaxe à lire de l'intérieur : (*f)(int) = "f est un pointeur vers une fonction prenant un int". C'est le mécanisme des callbacks (qsort, signal...). Un typedef simplifie la lecture.`,
            en: `Read the syntax inside-out: (*f)(int) = "f is a pointer to a function taking an int". It's how C does callbacks (qsort, signal...). A typedef makes it readable.`,
          },
        },
        {
          id: 'c-const-correctness',
          title: { fr: 'const char* vs char* const', en: 'const char* vs char* const' },
          code: `const char *a = "abc"; // donnée constante, pointeur mobile
a = "xyz";             // OK
// *a = 'z';           // ERREUR : donnée en lecture seule
char buf[] = "abc";
char *const b = buf;   // pointeur figé, donnée modifiable
*b = 'z';              // OK`,
          note: {
            fr: `const s'applique à ce qui est à sa GAUCHE (ou à droite s'il n'y a rien). const char* protège la donnée, char* const fige le pointeur. Lire la déclaration de droite à gauche aide.`,
            en: `const applies to what's on its LEFT (or right if nothing is there). const char* protects the data, char* const freezes the pointer. Reading the declaration right-to-left helps.`,
          },
        },
        {
          id: 'c-null-check',
          title: { fr: 'NULL : toujours vérifier', en: 'NULL: always check' },
          code: `int *p = trouve_element(t, n, cible);
if (p == NULL) {        // ou simplement: if (!p)
  return -1;            // gérer l'absence AVANT d'utiliser p
}
printf("%d\\n", *p);    // sûr seulement après le test`,
          note: {
            fr: `Déréférencer NULL est un comportement indéfini — au mieux un crash (segfault), au pire une corruption silencieuse. Toute fonction qui peut renvoyer NULL doit être testée juste après l'appel.`,
            en: `Dereferencing NULL is undefined behavior — a crash (segfault) at best, silent corruption at worst. Any function that can return NULL must be checked right after the call.`,
          },
        },
      ],
    },
    {
      id: 'memory',
      title: { fr: 'Mémoire', en: 'Memory' },
      items: [
        {
          id: 'c-malloc-pattern',
          title: { fr: 'malloc : LE pattern', en: 'malloc: THE pattern' },
          code: `int *t = malloc(n * sizeof *t); // sizeof *t : suit le type tout seul
if (t == NULL) {
  perror("malloc");   // toujours gérer l'échec
  return 1;
}`,
          note: {
            fr: `malloc peut échouer et renvoyer NULL : l'ignorer mène à un crash plus loin, difficile à relier à la cause. Pas besoin de caster le retour en C (contrairement au C++).`,
            en: `malloc can fail and return NULL: ignoring it leads to a crash later, hard to trace back to the cause. No need to cast the return value in C (unlike C++).`,
          },
        },
        {
          id: 'c-calloc-realloc',
          title: { fr: 'calloc & realloc', en: 'calloc & realloc' },
          code: `int *t = calloc(n, sizeof *t); // alloué ET mis à zéro
int *tmp = realloc(t, 2 * n * sizeof *t);
if (tmp == NULL) { free(t); return 1; } // t encore valide !
t = tmp;  // n'écraser t qu'après le test`,
          note: {
            fr: `Piège classique : t = realloc(t, ...) perd le bloc d'origine si realloc échoue (fuite garantie). Toujours passer par une variable temporaire. calloc évite de lire de la mémoire non initialisée.`,
            en: `Classic trap: t = realloc(t, ...) leaks the original block if realloc fails. Always go through a temporary variable. calloc avoids reading uninitialized memory.`,
          },
        },
        {
          id: 'c-free-null',
          title: { fr: 'free puis p = NULL', en: 'free then p = NULL' },
          code: `free(p);
p = NULL;   // un free(NULL) ultérieur est sans effet
// free(p) une 2e fois sans ça => double free, corruption
free(p);    // OK : free(NULL) ne fait rien`,
          note: {
            fr: `Après free, p est un pointeur "pendant" : le lire ou le re-libérer est un comportement indéfini (use-after-free, double free). Le mettre à NULL transforme ces bugs en no-op ou en crash net.`,
            en: `After free, p is a dangling pointer: reading or re-freeing it is undefined behavior (use-after-free, double free). Setting it to NULL turns those bugs into a no-op or a clean crash.`,
          },
        },
        {
          id: 'c-sizeof-deref',
          title: { fr: "L'idiome sizeof(*p)", en: 'The sizeof(*p) idiom' },
          code: `struct point *p = malloc(sizeof *p);      // pas sizeof(struct point)
double *t = malloc(n * sizeof *t);
// si le type de p change, ces lignes restent justes`,
          note: {
            fr: `sizeof *p prend la taille du type pointé sans le nommer : si la déclaration change (int -> long, struct renommée), l'allocation reste correcte. Nommer le type crée une duplication qui peut diverger.`,
            en: `sizeof *p takes the pointed-to type's size without naming it: if the declaration changes (int -> long, renamed struct), the allocation stays correct. Naming the type duplicates information that can drift.`,
          },
        },
        {
          id: 'c-stack-vs-heap',
          title: { fr: 'Stack vs heap : quand quoi', en: 'Stack vs heap: when to use what' },
          code: `int local[64];               // stack : petit, durée de vie = la fonction
int *grand = malloc(1 << 20); // heap : gros, ou survit au return
// return local;  // ERREUR : pointeur vers une variable morte
return grand;     // OK : l'appelant devra free()`,
          note: {
            fr: `Stack : rapide, libérée automatiquement, mais limitée (~1-8 Mo) et morte au return — renvoyer l'adresse d'une locale est un bug classique. Heap : pour les grosses tailles, les tailles dynamiques, ou ce qui survit à la fonction.`,
            en: `Stack: fast, freed automatically, but small (~1-8 MB) and gone at return — returning a local's address is a classic bug. Heap: for big sizes, dynamic sizes, or data that outlives the function.`,
          },
        },
        {
          id: 'c-valgrind-asan',
          title: { fr: 'valgrind / ASan : non négociable', en: 'valgrind / ASan: non-negotiable' },
          code: `// gcc -g -fsanitize=address prog.c && ./a.out   (ASan, rapide)
// valgrind --leak-check=full ./prog               (sans recompiler)
// les deux pointent la LIGNE du use-after-free ou de la fuite`,
          note: {
            fr: `Les bugs mémoire en C sont souvent silencieux : le programme "marche" puis explose ailleurs. ASan et valgrind les attrapent à la ligne exacte. À lancer systématiquement, pas seulement quand ça plante.`,
            en: `Memory bugs in C are often silent: the program "works" then blows up elsewhere. ASan and valgrind catch them at the exact line. Run them systematically, not only when it crashes.`,
          },
        },
      ],
    },
    {
      id: 'strings',
      title: { fr: 'Chaînes de caractères', en: 'Strings' },
      items: [
        {
          id: 'c-null-terminator',
          title: { fr: 'Le \\0 final', en: 'The trailing \\0' },
          code: `char s[] = "abc";          // 4 octets : 'a','b','c','\\0'
char t[3] = {'a','b','c'}; // PAS une string : pas de \\0 !
// strlen(t) lirait la mémoire jusqu'à trouver un 0 par hasard`,
          note: {
            fr: `Une "string" C n'est qu'un tableau de char terminé par \\0. Toutes les fonctions str* en dépendent : sans lui, elles lisent au-delà du buffer. Prévoir toujours +1 octet pour le terminateur.`,
            en: `A C "string" is just a char array ended by \\0. Every str* function relies on it: without it they read past the buffer. Always budget +1 byte for the terminator.`,
          },
        },
        {
          id: 'c-strlen-strcmp',
          title: { fr: 'strlen & strcmp', en: 'strlen & strcmp' },
          code: `size_t n = strlen("abc");     // 3 — sans compter le \\0
if (strcmp(a, b) == 0) { }    // égalité : == 0, pas "true" !
// if (a == b) compare les ADRESSES, pas le contenu`,
          note: {
            fr: `strcmp renvoie 0 si égal (négatif/positif selon l'ordre) : if (strcmp(a,b)) teste donc la DIFFÉRENCE — piège fréquent. Et a == b compare des pointeurs, jamais le texte.`,
            en: `strcmp returns 0 when equal (negative/positive by order): if (strcmp(a,b)) therefore tests for DIFFERENCE — a frequent trap. And a == b compares pointers, never the text.`,
          },
        },
        {
          id: 'c-strcpy-danger',
          title: { fr: 'strcpy/strcat : les pièges', en: 'strcpy/strcat: the traps' },
          code: `char buf[8];
strcpy(buf, source);  // déborde si source > 7 chars + \\0
strncpy(buf, source, sizeof buf); // ne met PAS le \\0 si tronqué !
buf[sizeof buf - 1] = '\\0';      // correction obligatoire`,
          note: {
            fr: `strcpy ne connaît pas la taille du buffer : dépassement = corruption ou faille de sécurité. strncpy est un faux ami : il omet le \\0 en cas de troncature. Préférer snprintf.`,
            en: `strcpy doesn't know the buffer size: overflow = corruption or a security hole. strncpy is a false friend: it omits the \\0 on truncation. Prefer snprintf.`,
          },
        },
        {
          id: 'c-snprintf',
          title: { fr: 'snprintf : LE bon outil', en: 'snprintf: THE right tool' },
          code: `char buf[32];
int n = snprintf(buf, sizeof buf, "%s-%d", nom, id);
if (n < 0 || (size_t)n >= sizeof buf) {
  // erreur ou troncature — n = longueur qu'il AURAIT fallu
}`,
          note: {
            fr: `snprintf respecte toujours la taille et termine toujours par \\0 : c'est la copie/concaténation sûre par défaut. Sa valeur de retour dit si le résultat a été tronqué — la tester.`,
            en: `snprintf always honors the size and always \\0-terminates: it's the safe default for copy/concat. Its return value tells you whether the output was truncated — check it.`,
          },
        },
        {
          id: 'c-strtok',
          title: { fr: 'strtok et pourquoi il pique', en: 'strtok and why it bites' },
          code: `char ligne[] = "a,b,c";        // doit être MODIFIABLE
char *tok = strtok(ligne, ",");
while (tok) {
  printf("%s\\n", tok);
  tok = strtok(NULL, ",");     // NULL = continuer la même chaîne
}`,
          note: {
            fr: `strtok MODIFIE la chaîne (remplace les séparateurs par \\0) et garde un état global : interdit sur un littéral, et inutilisable sur deux chaînes à la fois ou en multithread. strtok_r corrige l'état caché.`,
            en: `strtok MUTATES the string (replaces separators with \\0) and keeps global state: forbidden on a literal, and unusable on two strings at once or across threads. strtok_r fixes the hidden state.`,
          },
        },
        {
          id: 'c-atoi-strtol',
          title: { fr: 'atoi vs strtol', en: 'atoi vs strtol' },
          code: `int a = atoi("abc");          // 0 — erreur ? vraie valeur 0 ? mystère
char *fin;
long v = strtol(s, &fin, 10); // base 10
if (fin == s) { /* rien de numérique lu */ }
if (errno == ERANGE) { /* dépassement détecté */ }`,
          note: {
            fr: `atoi renvoie 0 en cas d'erreur, indiscernable d'un vrai "0", et son comportement est indéfini en cas de dépassement. strtol signale où le parsing s'arrête (fin) et les dépassements (errno).`,
            en: `atoi returns 0 on error, indistinguishable from a real "0", and overflows are undefined behavior. strtol reports where parsing stopped (end pointer) and overflows (errno).`,
          },
        },
      ],
    },
    {
      id: 'structs',
      title: { fr: 'Structs & co', en: 'Structs & friends' },
      items: [
        {
          id: 'c-typedef-struct',
          title: { fr: 'typedef struct', en: 'typedef struct' },
          code: `typedef struct {
  double x, y;
} Point;             // plus besoin d'écrire "struct Point"
Point p = {1.0, 2.0};
printf("%f\\n", p.x); // accès par . (-> via un pointeur)`,
          note: {
            fr: `Sans typedef, il faut répéter le mot-clé struct à chaque usage. Une struct se copie par valeur à l'affectation et au passage en paramètre — passer un pointeur pour les grosses structs.`,
            en: `Without typedef you must repeat the struct keyword at every use. A struct is copied by value on assignment and as a parameter — pass a pointer for large structs.`,
          },
        },
        {
          id: 'c-designated-init',
          title: { fr: 'Initialisation désignée', en: 'Designated initializers' },
          code: `typedef struct { int x, y, largeur, hauteur; } Rect;
Rect r = { .x = 10, .hauteur = 50 };
// .y et .largeur valent 0 — le reste est mis à zéro
int t[5] = { [2] = 9 };  // marche aussi pour les tableaux`,
          note: {
            fr: `Depuis C99 : on nomme les champs initialisés, l'ordre n'importe plus et tout champ omis vaut 0. Bien plus robuste que l'initialisation positionnelle quand la struct évolue.`,
            en: `Since C99: name the initialized fields, order no longer matters and omitted fields are zeroed. Far more robust than positional init when the struct evolves.`,
          },
        },
        {
          id: 'c-struct-malloc',
          title: { fr: 'struct sur le tas', en: 'struct on the heap' },
          code: `Point *p = malloc(sizeof *p);
if (!p) return NULL;
p->x = 1.0;          // p->x équivaut à (*p).x
*p = (Point){ .x = 1.0, .y = 2.0 }; // ou tout d'un coup
free(p);`,
          note: {
            fr: `-> est le raccourci de (*p).champ pour les pointeurs de struct. Attention : malloc n'initialise rien, les champs contiennent des déchets tant qu'on n'écrit pas dedans (un littéral composé règle tout d'un coup).`,
            en: `-> is shorthand for (*p).field on struct pointers. Careful: malloc initializes nothing, fields hold garbage until written (a compound literal sets everything at once).`,
          },
        },
        {
          id: 'c-enum',
          title: { fr: 'enum', en: 'enum' },
          code: `typedef enum { ROUGE, VERT = 5, BLEU } Couleur;
// ROUGE = 0, VERT = 5, BLEU = 6 (suivant + 1)
Couleur c = VERT;
switch (c) { case ROUGE: break; case VERT: break; case BLEU: break; }`,
          note: {
            fr: `Des constantes entières nommées, qui s'auto-incrémentent. Bonus : dans un switch sans default, le compilateur (-Wall) prévient si un cas d'enum manque — un filet de sécurité quand on ajoute une valeur.`,
            en: `Named integer constants that auto-increment. Bonus: in a switch without default, the compiler (-Wall) warns when an enum case is missing — a safety net when adding a value.`,
          },
        },
        {
          id: 'c-union',
          title: { fr: 'union en bref', en: 'union in short' },
          code: `typedef struct {
  enum { ENTIER, REEL } type;  // le "tag" : qui est actif ?
  union { int i; double d; } val; // mêmes octets partagés
} Valeur;
Valeur v = { .type = REEL, .val.d = 3.14 };`,
          note: {
            fr: `Tous les membres d'une union partagent la même mémoire : un seul est valide à la fois. Lire le mauvais membre est un bug. L'idiome sûr : l'envelopper dans une struct avec un tag qui dit lequel est actif.`,
            en: `All union members share the same memory: only one is valid at a time. Reading the wrong member is a bug. The safe idiom: wrap it in a struct with a tag saying which one is active.`,
          },
        },
        {
          id: 'c-flexible-array',
          title: { fr: 'Flexible array member', en: 'Flexible array member' },
          code: `typedef struct {
  size_t n;
  double valeurs[];  // membre flexible : TOUJOURS en dernier
} Vecteur;
Vecteur *v = malloc(sizeof *v + n * sizeof v->valeurs[0]);
v->n = n;  // un seul malloc, un seul free`,
          note: {
            fr: `C99 : un tableau sans taille en dernier membre permet d'allouer l'en-tête et les données en UN seul bloc — un seul malloc/free, et meilleure localité qu'un pointeur vers un second bloc.`,
            en: `C99: an unsized array as the last member lets you allocate header and data in ONE block — a single malloc/free, and better locality than a pointer to a second block.`,
          },
        },
      ],
    },
    {
      id: 'build',
      title: { fr: 'Compilation & debug', en: 'Build & debug' },
      items: [
        {
          id: 'c-gcc-flags',
          title: { fr: 'gcc -Wall -Wextra -g', en: 'gcc -Wall -Wextra -g' },
          code: `// la ligne de base pour TOUT projet C :
// gcc -Wall -Wextra -g -std=c17 prog.c -o prog
// -Wall -Wextra : warnings utiles    -g : symboles de debug
// en option : -Werror pour transformer les warnings en erreurs`,
          note: {
            fr: `Par défaut gcc est presque muet et laisse passer des bugs évidents. -Wall -Wextra attrape variables non initialisées, comparaisons douteuses, etc. -g rend gdb et valgrind exploitables (lignes, noms).`,
            en: `By default gcc is nearly silent and lets obvious bugs through. -Wall -Wextra catches uninitialized variables, dubious comparisons, etc. -g makes gdb and valgrind usable (lines, names).`,
          },
        },
        {
          id: 'c-warnings-serious',
          title: { fr: 'Warnings à NE PAS ignorer', en: 'Warnings NOT to ignore' },
          code: `// "implicit declaration of function" => prototype manquant : UB possible
// "may be used uninitialized"          => valeur poubelle lue
// "comparison between signed/unsigned" => -1 < 0u est FAUX !
// "incompatible pointer type"          => quasi toujours un vrai bug`,
          note: {
            fr: `En C, un warning est souvent un comportement indéfini déguisé : le programme peut "marcher" aujourd'hui et casser à la prochaine compilation. Une base saine vise zéro warning, d'où l'intérêt de -Werror.`,
            en: `In C, a warning is often undefined behavior in disguise: the program may "work" today and break on the next build. A healthy codebase aims for zero warnings, hence -Werror.`,
          },
        },
        {
          id: 'c-gdb-basics',
          title: { fr: 'gdb : run / bt / print', en: 'gdb: run / bt / print' },
          code: `// gdb ./prog        puis dans gdb :
// run               lance (s'arrête au crash)
// bt                backtrace : la pile d'appels du crash
// print var         inspecte une variable
// break main.c:42   point d'arrêt, puis next / step / continue`,
          note: {
            fr: `Le réflexe segfault : compiler avec -g, lancer sous gdb, run, puis bt montre la ligne exacte du crash et la chaîne d'appels. Cinq commandes suffisent pour 90 % des sessions de debug.`,
            en: `The segfault reflex: build with -g, run under gdb, run, then bt shows the exact crash line and the call chain. Five commands cover 90% of debug sessions.`,
          },
        },
        {
          id: 'c-sanitizers',
          title: { fr: '-fsanitize=address,undefined', en: '-fsanitize=address,undefined' },
          code: `// gcc -g -fsanitize=address,undefined prog.c -o prog
// ./prog   => rapport détaillé au premier accès invalide :
//    heap-buffer-overflow, use-after-free, fuite, overflow signé...
// avec fichier, ligne et pile d'appels`,
          note: {
            fr: `Les sanitizers instrumentent le binaire et arrêtent le programme à la PREMIÈRE opération illégale, au lieu de laisser le bug se manifester plus loin. Coût modeste (~2x) : à activer par défaut en développement.`,
            en: `Sanitizers instrument the binary and stop the program at the FIRST illegal operation, instead of letting the bug surface far away. Modest cost (~2x): enable them by default in development.`,
          },
        },
        {
          id: 'c-include-guards',
          title: { fr: 'Include guards / #pragma once', en: 'Include guards / #pragma once' },
          code: `// point.h
#ifndef POINT_H
#define POINT_H
typedef struct { double x, y; } Point;
#endif
// ou, non standard mais quasi universel : #pragma once`,
          note: {
            fr: `Sans garde, un .h inclus deux fois (directement ou via un autre header) redéfinit ses types : erreur de compilation. Chaque header doit avoir sa garde — #pragma once est plus court mais hors norme.`,
            en: `Without a guard, a header included twice (directly or via another header) redefines its types: compile error. Every header needs its guard — #pragma once is shorter but non-standard.`,
          },
        },
        {
          id: 'c-makefile-minimal',
          title: { fr: 'Makefile en 5 lignes', en: 'Makefile in 5 lines' },
          code: `CFLAGS = -Wall -Wextra -g
prog: main.o util.o
	$(CC) $^ -o $@     # $^ = les prérequis, $@ = la cible
clean:
	rm -f prog *.o      # ATTENTION : tabulations, pas espaces !`,
          note: {
            fr: `make recompile seulement ce qui a changé, via la règle implicite .c -> .o qui utilise déjà CFLAGS. Piège historique : les recettes DOIVENT être indentées par une tabulation, jamais des espaces.`,
            en: `make rebuilds only what changed, via the implicit .c -> .o rule which already uses CFLAGS. Historic trap: recipes MUST be indented with a tab, never spaces.`,
          },
        },
      ],
    },
  ],
};
