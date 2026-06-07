/**
 * Kubernetes basics, as an evaluation trace (shared evaltrace engine):
 *  - self-healing: pods are cattle — delete one, the ReplicaSet recreates it
 *    (the controller loops, comparing actual state to desired state);
 *  - Services: pod IPs are ephemeral — a Service gives one stable virtual IP
 *    + a DNS name, load-balanced over the pods matched by its selector;
 *  - rollouts: `kubectl set image` does a rolling update (v2 pods come up one
 *    by one, v1 only goes down once v2 is Ready), `rollout undo` is instant;
 *  - resources: requests reserve for scheduling, limits are a hard ceiling —
 *    exceed the memory limit and the container is OOMKilled (exit 137),
 *    while CPU overuse is merely throttled.
 *
 * Everything here mirrors real Kubernetes behavior — only the wording is ours.
 */

import { simulateTrace, traceSummaryOf } from './evaltrace.js';

export const simulate = simulateTrace;
export const summaryOf = traceSummaryOf;

export const K8SBASICS_SCENARIOS = [
  {
    id: 'self-healing',
    code: `kubectl create deploy web --replicas=3   # état VOULU : 3 pods
kubectl delete pod web-7d4b9-x2k1f       # 💥 on "tue" un pod…
kubectl get pods                          # …3/3 Running — il est DÉJÀ revenu
# le ReplicaSet boucle : état réel ≠ état voulu → il corrige
# un nœud entier tombe ? même mécanisme : replanification ailleurs`,
    ops: [
      { eval: 'kubectl create deploy web --replicas=3', value: '3 pods', note: 'le Deployment déclare l\'état VOULU ; le ReplicaSet le maintient' },
      { crash: 'kubectl delete pod web-7d4b9-x2k1f', message: 'recréé en quelques secondes par le ReplicaSet — on ne tue pas un pod, on tue son propriétaire (le contrôleur compare état réel et état voulu, en boucle)' },
      { eval: 'kubectl get pods', value: '3/3 Running (un pod TOUT NEUF)', note: 'nouveau nom, nouvelle IP — d\'où les Services' },
      { branch: 'un nœud entier tombe ?', taken: true, then: 'les pods sont replanifiés sur les autres nœuds — même mécanisme' },
    ],
  },
  {
    id: 'services',
    code: `# les IPs de pods changent sans arrêt → il faut un nom STABLE
kubectl expose deploy web --name=api --port=80
curl http://api                  # 200 OK — DNS interne + load-balancing
kubectl get endpoints api        # les pods derrière (selector ↔ labels)
curl http://api-pod-x2k1f        # ❌ JAMAIS viser un pod par son nom
# ClusterIP / NodePort / LoadBalancer / Ingress : 4 portes d'entrée`,
    ops: [
      { eval: 'les IPs de pods changent sans arrêt', value: 'le Service donne UNE IP virtuelle stable + un nom DNS' },
      { eval: 'curl http://api', value: '200 OK', note: 'DNS interne du cluster : <service>.<namespace>.svc — et load-balancing entre les pods du selector' },
      { eval: 'kubectl get endpoints api', value: 'la liste des pods derrière (le selector matche les labels)' },
      { error: 'curl http://api-pod-x2k1f', message: 'ne JAMAIS viser un pod par son nom — il peut disparaître à tout instant' },
      { eval: 'ClusterIP', value: 'IP interne au cluster — le défaut, invisible de l\'extérieur' },
      { eval: 'NodePort', value: 'ouvre le même port (30000-32767) sur CHAQUE nœud' },
      { eval: 'LoadBalancer', value: 'demande un load-balancer externe au cloud provider' },
      { eval: 'Ingress', value: 'routage HTTP par host/path — un seul point d\'entrée pour N services' },
    ],
  },
  {
    id: 'rollout',
    code: `kubectl set image deploy/web app=web:v2   # rolling update
kubectl rollout status deploy/web         # suit la bascule v1 → v2
kubectl rollout undo deploy/web           # rollback instantané
# readinessProbe absente ? 💥 trafic vers des pods pas prêts → 502
# maxUnavailable: 0 + maxSurge: 1 → jamais moins de replicas que voulu`,
    ops: [
      { eval: 'kubectl set image deploy/web app=web:v2', value: 'rolling update', note: 'les pods v2 montent UN PAR UN, les v1 ne descendent que quand les v2 sont Ready — zéro downtime si les probes sont bonnes' },
      { eval: 'kubectl rollout status deploy/web', value: 'suit la bascule' },
      { eval: 'kubectl rollout undo deploy/web', value: 'retour à v1', note: 'chaque rollout garde son historique — le rollback est instantané' },
      { crash: 'readinessProbe absente', message: 'sans probe, k8s envoie du trafic à des pods pas prêts — le « zéro downtime » devient des 502' },
      { branch: 'maxUnavailable: 0 + maxSurge: 1 ?', taken: true, then: 'jamais moins de replicas que voulu — la bascule la plus prudente' },
    ],
  },
  {
    id: 'resources-oom',
    code: `resources:
  requests: { cpu: 100m, memory: 128Mi }   # réservé pour le SCHEDULING
  limits:   { cpu: 500m, memory: 256Mi }   # plafond dur
# memory limit dépassée → 💥 OOMKilled (exit 137) ; CPU → juste throttlé
kubectl describe pod    # Last State: OOMKilled, Restart Count: 4
# CrashLoopBackOff : kubectl logs --previous pour voir POURQUOI`,
    ops: [
      { eval: 'requests: cpu 100m, memory 128Mi', value: 'réserve pour le SCHEDULING', note: 'requests = ce que le scheduler garantit ; limits = le plafond dur' },
      { crash: 'memory limit dépassée', message: 'OOMKilled — le conteneur est tué net et redémarre (exit code 137) ; le CPU, lui, est juste THROTTLÉ, pas tué' },
      { eval: 'kubectl describe pod', value: 'Last State: OOMKilled, Restart Count: 4', note: 'le réflexe diagnostic' },
      { branch: 'requests sans limits ?', taken: true, then: 'possible — et souvent recommandé pour le CPU ; pour la mémoire, une limit évite qu\'un pod affame le nœud' },
      { log: 'CrashLoopBackOff = il crashe en boucle, k8s espace les redémarrages — kubectl logs --previous pour voir POURQUOI' },
    ],
  },
];

export const k8sBasicsScenarioById = (id) => K8SBASICS_SCENARIOS.find((s) => s.id === id);
