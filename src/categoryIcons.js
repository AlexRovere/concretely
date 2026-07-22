/**
 * Logos de marque (SVG monochromes, source simple-icons) pour les catégories
 * « techno ». Importés en brut (`?raw`) et rendus en `currentColor`, donc
 * theme-aware. Les catégories-concept (general, patterns, ml, os, web, sql,
 * cicd) n'ont pas de logo et retombent sur l'emoji de `categoryMeta.js`.
 */
import js from '@/assets/icons/js.svg?raw';
import ts from '@/assets/icons/ts.svg?raw';
import python from '@/assets/icons/python.svg?raw';
import vue from '@/assets/icons/vue.svg?raw';
import react from '@/assets/icons/react.svg?raw';
import swift from '@/assets/icons/swift.svg?raw';
import ruby from '@/assets/icons/ruby.svg?raw';
import kotlin from '@/assets/icons/kotlin.svg?raw';
import go from '@/assets/icons/go.svg?raw';
import rust from '@/assets/icons/rust.svg?raw';
import c from '@/assets/icons/c.svg?raw';
import git from '@/assets/icons/git.svg?raw';
import linux from '@/assets/icons/linux.svg?raw';
import docker from '@/assets/icons/docker.svg?raw';
import k8s from '@/assets/icons/k8s.svg?raw';
import java from '@/assets/icons/java.svg?raw';

export const CATEGORY_SVG = {
  js, ts, python, vue, react, swift, ruby, kotlin, go, rust, c, git, linux, docker, k8s, java,
};

/** Couleur officielle de marque appliquée directement au glyphe. */
export const CATEGORY_COLOR = {
  js: '#F7DF1E', ts: '#3178C6', python: '#3776AB', vue: '#42B883', react: '#61DAFB',
  swift: '#F05138', ruby: '#CC342D', kotlin: '#7F52FF', go: '#00ADD8', rust: '#DEA584',
  c: '#649AD2', git: '#F05032', linux: '#FCC624', docker: '#2496ED', k8s: '#326CE5', java: '#ED8B00',
};
