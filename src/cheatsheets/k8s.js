/**
 * Cheatsheet Kubernetes — sections triées par pertinence quotidienne.
 * { id, lang, sections: [{ id, title:{fr,en}, items:[{ id, title:{fr,en}, code, note:{fr,en} }] }] }
 */
export default {
  id: 'k8s',
  lang: 'bash',
  sections: [
    {
      id: 'read',
      title: { fr: 'Lire le cluster', en: 'Reading the cluster' },
      items: [
        {
          id: 'k8s-get',
          title: { fr: 'kubectl get — lister les ressources', en: 'kubectl get — list resources' },
          code: `kubectl get pods                  # pods du namespace courant
kubectl get pods -o wide          # + IP, nœud, image
kubectl get pods -A               # tous les namespaces
kubectl get pod mon-pod -o yaml   # le YAML complet vécu par l'API
kubectl get pods --watch          # suivre les changements en direct
kubectl get pods -o jsonpath='{.items[*].metadata.name}'`,
          note: {
            fr: `get est le réflexe de base. -o wide montre où tourne le pod, -o yaml révèle tout ce que l'API a ajouté (status, defaults), et jsonpath extrait un champ précis pour les scripts.`,
            en: `get is the basic reflex. -o wide shows where the pod runs, -o yaml reveals everything the API added (status, defaults), and jsonpath extracts a precise field for scripts.`,
          },
        },
        {
          id: 'k8s-describe',
          title: { fr: 'kubectl describe — la mine d\'or des Events', en: 'kubectl describe — the Events goldmine' },
          code: `kubectl describe pod mon-pod
# La section Events en bas raconte l'histoire :
#   Scheduled  → le pod a trouvé un nœud
#   Pulling    → téléchargement de l'image
#   Failed     → la raison exacte de l'échec`,
          note: {
            fr: `Premier réflexe quand un pod va mal : la section Events en bas du describe explique presque toujours pourquoi (image introuvable, pas assez de ressources, probe qui échoue…).`,
            en: `First reflex when a pod misbehaves: the Events section at the bottom of describe almost always explains why (image not found, not enough resources, failing probe…).`,
          },
        },
        {
          id: 'k8s-logs',
          title: { fr: 'kubectl logs — lire la sortie des conteneurs', en: 'kubectl logs — read container output' },
          code: `kubectl logs mon-pod                # stdout/stderr du conteneur
kubectl logs -f mon-pod             # suivre en direct (tail -f)
kubectl logs mon-pod --previous     # logs du conteneur AVANT le crash
kubectl logs mon-pod -c sidecar     # pod multi-conteneurs : préciser lequel
kubectl logs deploy/mon-app         # via le Deployment (un pod au hasard)`,
          note: {
            fr: `--previous est vital pour un CrashLoopBackOff : les logs du conteneur courant sont vides, ceux d'avant le redémarrage contiennent l'erreur fatale.`,
            en: `--previous is vital for a CrashLoopBackOff: the current container's logs are empty, the ones from before the restart contain the fatal error.`,
          },
        },
        {
          id: 'k8s-explain',
          title: { fr: 'kubectl explain — la doc intégrée', en: 'kubectl explain — built-in docs' },
          code: `kubectl explain pod.spec.containers          # doc d'un champ
kubectl explain deployment.spec.strategy     # quelles valeurs possibles ?
kubectl explain pod.spec --recursive         # tout l'arbre des champs`,
          note: {
            fr: `Plus besoin de chercher la doc en ligne : explain décrit chaque champ YAML, son type et ses valeurs possibles, directement depuis l'API du cluster (donc toujours la bonne version).`,
            en: `No need to search online docs: explain describes every YAML field, its type and possible values, straight from the cluster's API (so always the right version).`,
          },
        },
        {
          id: 'k8s-abbreviations',
          title: { fr: 'Les abréviations qui sauvent des frappes', en: 'Abbreviations that save keystrokes' },
          code: `kubectl get po      # pods
kubectl get deploy  # deployments
kubectl get svc     # services
kubectl get ns      # namespaces
kubectl get cm      # configmaps
kubectl api-resources   # la liste complète avec les SHORTNAMES`,
          note: {
            fr: `Chaque ressource a un raccourci officiel : po, deploy, svc, ns, cm, ing (ingress), pvc… kubectl api-resources les liste tous dans la colonne SHORTNAMES.`,
            en: `Every resource has an official shortcut: po, deploy, svc, ns, cm, ing (ingress), pvc… kubectl api-resources lists them all in the SHORTNAMES column.`,
          },
        },
        {
          id: 'k8s-contexts',
          title: { fr: 'Contexts & namespaces — où suis-je ?', en: 'Contexts & namespaces — where am I?' },
          code: `kubectl config current-context        # sur quel cluster suis-je ?
kubectl config get-contexts           # tous les clusters connus
kubectl config use-context prod       # changer de cluster (danger !)
kubectl config set-context --current --namespace=mon-app
kubectl get pods -n autre-ns          # ponctuel : -n sans changer le défaut`,
          note: {
            fr: `Un context = cluster + user + namespace par défaut. Vérifier current-context avant toute commande destructive. Les outils kubectx/kubens rendent le changement instantané.`,
            en: `A context = cluster + user + default namespace. Check current-context before any destructive command. The kubectx/kubens tools make switching instant.`,
          },
        },
      ],
    },
    {
      id: 'run-debug',
      title: { fr: 'Lancer & debugger', en: 'Run & debug' },
      items: [
        {
          id: 'k8s-exec',
          title: { fr: 'exec — un shell dans le conteneur', en: 'exec — a shell inside the container' },
          code: `kubectl exec -it mon-pod -- sh        # shell interactif
kubectl exec -it mon-pod -- bash      # si bash existe dans l'image
kubectl exec mon-pod -- env           # une commande sans shell
kubectl exec -it mon-pod -c sidecar -- sh   # choisir le conteneur`,
          note: {
            fr: `Le -- sépare les options kubectl de la commande exécutée. Les images minimales (distroless, scratch) n'ont souvent aucun shell : c'est là que kubectl debug prend le relais.`,
            en: `The -- separates kubectl options from the executed command. Minimal images (distroless, scratch) often have no shell at all: that's where kubectl debug takes over.`,
          },
        },
        {
          id: 'k8s-port-forward',
          title: { fr: 'port-forward — accéder sans exposer', en: 'port-forward — access without exposing' },
          code: `kubectl port-forward pod/mon-pod 8080:80     # localhost:8080 → pod:80
kubectl port-forward svc/mon-svc 5432:5432   # via le Service
kubectl port-forward deploy/mon-app 3000:3000
# Puis : curl http://localhost:8080`,
          note: {
            fr: `Crée un tunnel local vers un pod ou un service, parfait pour tester une API ou se connecter à une base sans créer d'Ingress. Le tunnel vit tant que la commande tourne.`,
            en: `Creates a local tunnel to a pod or service, perfect for testing an API or connecting to a database without creating an Ingress. The tunnel lives as long as the command runs.`,
          },
        },
        {
          id: 'k8s-run-throwaway',
          title: { fr: 'run --rm -it — le pod jetable de debug', en: 'run --rm -it — the throwaway debug pod' },
          code: `# Un pod temporaire avec les outils réseau, détruit à la sortie
kubectl run debug --rm -it --image=busybox -- sh
kubectl run debug --rm -it --image=nicolaka/netshoot -- bash
# Depuis l'intérieur : tester le DNS et les services
#   nslookup mon-svc
#   wget -qO- http://mon-svc:80`,
          note: {
            fr: `Le moyen le plus rapide de tester le réseau DEPUIS l'intérieur du cluster : DNS, joignabilité d'un service… --rm supprime le pod en sortant, rien à nettoyer.`,
            en: `The fastest way to test the network FROM inside the cluster: DNS, service reachability… --rm deletes the pod on exit, nothing to clean up.`,
          },
        },
        {
          id: 'k8s-debug',
          title: { fr: 'kubectl debug — conteneurs éphémères', en: 'kubectl debug — ephemeral containers' },
          code: `# Attacher un conteneur d'outils à un pod qui tourne (même distroless)
kubectl debug -it mon-pod --image=busybox --target=mon-conteneur
# Copier le pod planté avec une commande modifiée
kubectl debug mon-pod -it --copy-to=debug-copie -- sh
# Inspecter un NŒUD via un pod privilégié
kubectl debug node/mon-noeud -it --image=busybox`,
          note: {
            fr: `Injecte un conteneur éphémère dans un pod existant sans le redémarrer : indispensable pour les images sans shell. --target partage le namespace de processus du conteneur visé.`,
            en: `Injects an ephemeral container into an existing pod without restarting it: essential for shell-less images. --target shares the process namespace of the targeted container.`,
          },
        },
        {
          id: 'k8s-cp',
          title: { fr: 'cp — copier des fichiers pod ↔ machine', en: 'cp — copy files pod ↔ machine' },
          code: `kubectl cp mon-pod:/var/log/app.log ./app.log   # pod → local
kubectl cp ./config.json mon-pod:/tmp/config.json # local → pod
kubectl cp mon-ns/mon-pod:/data ./data -c sidecar # namespace + conteneur`,
          note: {
            fr: `Pratique pour récupérer un dump ou injecter un fichier de test. Sous le capot c'est un tar via exec : l'image doit contenir tar, et les liens symboliques peuvent surprendre.`,
            en: `Handy to grab a dump or inject a test file. Under the hood it is a tar through exec: the image must contain tar, and symlinks can be surprising.`,
          },
        },
        {
          id: 'k8s-top-events',
          title: { fr: 'top & events — conso et chronologie', en: 'top & events — usage and timeline' },
          code: `kubectl top pods                    # CPU/mémoire par pod
kubectl top pods --containers       # détail par conteneur
kubectl top nodes                   # charge des nœuds
# Tous les événements du namespace, du plus ancien au plus récent
kubectl get events --sort-by=.lastTimestamp`,
          note: {
            fr: `top exige metrics-server installé. events --sort-by donne la chronologie de tout le namespace : idéal pour voir ce qui s'est passé pendant un incident, pod par pod.`,
            en: `top requires metrics-server to be installed. events --sort-by gives the whole namespace timeline: ideal to see what happened during an incident, pod by pod.`,
          },
        },
      ],
    },
    {
      id: 'deploy',
      title: { fr: 'Déployer', en: 'Deploying' },
      items: [
        {
          id: 'k8s-apply',
          title: { fr: 'apply -f — l\'approche déclarative', en: 'apply -f — the declarative approach' },
          code: `kubectl apply -f deploy.yaml       # créer OU mettre à jour
kubectl apply -f ./manifests/      # tout un dossier
kubectl diff -f deploy.yaml        # voir ce qui changerait AVANT
kubectl delete -f deploy.yaml      # supprimer ce que le fichier décrit`,
          note: {
            fr: `apply est idempotent : on décrit l'état voulu, Kubernetes converge. kubectl diff avant apply montre le changement exact — le réflexe à prendre avant tout déploiement en prod.`,
            en: `apply is idempotent: you describe the desired state, Kubernetes converges. kubectl diff before apply shows the exact change — the habit to build before any prod deployment.`,
          },
        },
        {
          id: 'k8s-deployment-yaml',
          title: { fr: 'Le Deployment minimal', en: 'The minimal Deployment' },
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: mon-app
spec:
  replicas: 3                # combien de pods identiques
  selector:
    matchLabels:
      app: mon-app           # DOIT correspondre aux labels du template
  template:
    metadata:
      labels:
        app: mon-app         # les pods porteront ce label
    spec:
      containers:
        - name: web
          image: mon-app:1.2.0   # toujours un tag précis, jamais latest
          ports:
            - containerPort: 8080`,
          note: {
            fr: `Le selector relie le Deployment à ses pods : s'il ne matche pas les labels du template, l'API refuse. Un tag d'image précis (jamais latest) rend les rollbacks possibles.`,
            en: `The selector links the Deployment to its pods: if it doesn't match the template labels, the API rejects it. A precise image tag (never latest) makes rollbacks possible.`,
          },
        },
        {
          id: 'k8s-set-image-rollout',
          title: { fr: 'set image & rollout status — déployer une version', en: 'set image & rollout status — ship a version' },
          code: `# Changer l'image (déclenche un rolling update)
kubectl set image deploy/mon-app web=mon-app:1.3.0
# Suivre le déploiement jusqu'au bout (bloque, sort en erreur si échec)
kubectl rollout status deploy/mon-app
kubectl rollout restart deploy/mon-app   # redémarrage propre des pods`,
          note: {
            fr: `rollout status est le bon test en CI : il attend que tous les nouveaux pods soient prêts et échoue sinon. rollout restart recrée les pods sans changer l'image (recharger un secret…).`,
            en: `rollout status is the right CI check: it waits for all new pods to be ready and fails otherwise. rollout restart recreates pods without changing the image (reload a secret…).`,
          },
        },
        {
          id: 'k8s-rollout-undo',
          title: { fr: 'rollout undo & history — revenir en arrière', en: 'rollout undo & history — going back' },
          code: `kubectl rollout history deploy/mon-app          # les révisions
kubectl rollout history deploy/mon-app --revision=2  # le détail d'une
kubectl rollout undo deploy/mon-app             # retour à la précédente
kubectl rollout undo deploy/mon-app --to-revision=2  # ou à une précise`,
          note: {
            fr: `Chaque changement de template crée une révision (gardées via revisionHistoryLimit, 10 par défaut). undo redéploie l'ancien template en rolling update : rollback sans coupure.`,
            en: `Each template change creates a revision (kept via revisionHistoryLimit, 10 by default). undo redeploys the old template as a rolling update: rollback with no downtime.`,
          },
        },
        {
          id: 'k8s-scale-hpa',
          title: { fr: 'scale & autoscale — HPA en bref', en: 'scale & autoscale — HPA in short' },
          code: `kubectl scale deploy/mon-app --replicas=5     # manuel, immédiat
# HPA : ajuste les replicas selon la charge CPU
kubectl autoscale deploy/mon-app --min=2 --max=10 --cpu-percent=70
kubectl get hpa                               # cible vs actuel`,
          note: {
            fr: `Le HPA compare l'usage CPU réel aux requests déclarées : sans requests sur les conteneurs, il ne peut rien calculer. Ne pas fixer replicas dans le YAML si un HPA gère le scaling.`,
            en: `The HPA compares actual CPU usage against declared requests: without requests on containers it cannot compute anything. Don't pin replicas in the YAML if an HPA owns the scaling.`,
          },
        },
        {
          id: 'k8s-probes',
          title: { fr: 'Probes : liveness vs readiness vs startup', en: 'Probes: liveness vs readiness vs startup' },
          code: `containers:
  - name: web
    livenessProbe:           # échec → le conteneur est REDÉMARRÉ
      httpGet: { path: /healthz, port: 8080 }
      periodSeconds: 10
    readinessProbe:          # échec → plus de trafic (retiré du Service)
      httpGet: { path: /ready, port: 8080 }
    startupProbe:            # laisse du temps au démarrage lent
      httpGet: { path: /healthz, port: 8080 }
      failureThreshold: 30   # 30 essais avant d'abandonner`,
          note: {
            fr: `liveness redémarre, readiness coupe le trafic, startup protège le démarrage. Erreur classique : une liveness trop agressive qui tue une app saine mais lente → boucle de redémarrages.`,
            en: `liveness restarts, readiness cuts traffic, startup protects boot time. Classic mistake: an overly aggressive liveness killing a healthy-but-slow app → restart loop.`,
          },
        },
      ],
    },
    {
      id: 'network',
      title: { fr: 'Services & réseau', en: 'Services & networking' },
      items: [
        {
          id: 'k8s-service-types',
          title: { fr: 'Les 4 types de Service', en: 'The 4 Service types' },
          code: `# ClusterIP    : IP interne stable (défaut) — trafic intra-cluster
# NodePort     : ouvre un port (30000-32767) sur CHAQUE nœud
# LoadBalancer : demande un LB au cloud (IP publique)
# ExternalName : simple alias DNS vers un nom externe
kubectl expose deploy/mon-app --port=80 --target-port=8080 --type=ClusterIP   # type déjà par défaut si omis
kubectl get svc -o wide   # type, cluster-ip, external-ip, ports`,
          note: {
            fr: `ClusterIP suffit pour parler entre services. NodePort dépanne en local, LoadBalancer expose au monde via le cloud. Le port est celui du Service, targetPort celui du conteneur.`,
            en: `ClusterIP is enough for service-to-service talk. NodePort helps locally, LoadBalancer exposes to the world via the cloud. port belongs to the Service, targetPort to the container.`,
          },
        },
        {
          id: 'k8s-ingress',
          title: { fr: 'L\'Ingress minimal', en: 'The minimal Ingress' },
          code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mon-app
spec:
  ingressClassName: nginx        # quel contrôleur prend en charge
  rules:
    - host: app.exemple.com      # routage par nom de domaine
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: mon-svc    # le Service ClusterIP derrière
                port: { number: 80 }`,
          note: {
            fr: `Un Ingress route le HTTP(S) entrant vers des Services selon l'hôte et le chemin. Il ne fait rien seul : un Ingress Controller (nginx, traefik…) doit être installé dans le cluster.`,
            en: `An Ingress routes incoming HTTP(S) to Services by host and path. It does nothing on its own: an Ingress Controller (nginx, traefik…) must be installed in the cluster.`,
          },
        },
        {
          id: 'k8s-dns',
          title: { fr: 'Le DNS interne du cluster', en: 'The cluster\'s internal DNS' },
          code: `# Depuis un pod, un Service est joignable par son nom :
curl http://mon-svc                # même namespace
curl http://mon-svc.autre-ns       # autre namespace
curl http://mon-svc.autre-ns.svc.cluster.local   # nom complet (FQDN)
# Vérifier la résolution depuis un pod de debug
nslookup mon-svc.autre-ns`,
          note: {
            fr: `Schéma : <service>.<namespace>.svc.cluster.local. Dans son propre namespace le nom court suffit — c'est la base de la communication entre microservices, aucune IP en dur.`,
            en: `Pattern: <service>.<namespace>.svc.cluster.local. Within its own namespace the short name is enough — this is how microservices talk, no hardcoded IPs.`,
          },
        },
        {
          id: 'k8s-endpoints',
          title: { fr: 'Endpoints — qui est derrière le Service ?', en: 'Endpoints — who is behind the Service?' },
          code: `kubectl get endpoints mon-svc      # les IP:port réellement servies
kubectl get endpointslices         # la version moderne, même idée
# Endpoints vide ? Deux causes classiques :
#   1. le selector du Service ne matche aucun label de pod
#   2. les pods ne passent pas leur readinessProbe`,
          note: {
            fr: `Le Service n'est qu'une IP virtuelle ; les Endpoints listent les pods qui reçoivent vraiment le trafic. Une liste vide explique 90 % des « mon service ne répond pas ».`,
            en: `The Service is just a virtual IP; Endpoints list the pods that actually receive traffic. An empty list explains 90% of "my service doesn't answer" cases.`,
          },
        },
        {
          id: 'k8s-networkpolicy',
          title: { fr: 'NetworkPolicy en bref', en: 'NetworkPolicy in short' },
          code: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-depuis-front
spec:
  podSelector:               # à qui s'applique la règle
    matchLabels: { app: api }
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:       # seuls les pods front peuvent entrer
            matchLabels: { app: front }
      ports:
        - port: 8080`,
          note: {
            fr: `Par défaut tout pod parle à tout pod. Dès qu'une policy sélectionne un pod, tout le reste est refusé pour ce type de trafic (deny implicite). Exige un CNI qui les supporte (Calico, Cilium…).`,
            en: `By default every pod talks to every pod. As soon as a policy selects a pod, everything else is denied for that traffic type (implicit deny). Requires a CNI that supports them (Calico, Cilium…).`,
          },
        },
      ],
    },
    {
      id: 'config-storage',
      title: { fr: 'Config & données', en: 'Config & data' },
      items: [
        {
          id: 'k8s-configmap-secret',
          title: { fr: 'ConfigMap & Secret — créer', en: 'ConfigMap & Secret — creating' },
          code: `kubectl create configmap app-config \\
  --from-literal=LOG_LEVEL=debug \\
  --from-file=config.json            # un fichier devient une clé
kubectl create secret generic db-creds \\
  --from-literal=DB_PASSWORD=s3cret
kubectl get secret db-creds -o jsonpath='{.data.DB_PASSWORD}' | base64 -d`,
          note: {
            fr: `ConfigMap = config non sensible, Secret = la même chose encodée en base64 (PAS chiffrée par défaut !). Pour du vrai chiffrement : encryption at rest ou un gestionnaire externe (Vault…).`,
            en: `ConfigMap = non-sensitive config, Secret = the same thing base64-encoded (NOT encrypted by default!). For real encryption: encryption at rest or an external manager (Vault…).`,
          },
        },
        {
          id: 'k8s-mount-env-volume',
          title: { fr: 'Montage : env vs volume', en: 'Mounting: env vs volume' },
          code: `containers:
  - name: web
    envFrom:                       # toutes les clés en variables d'env
      - configMapRef: { name: app-config }
    env:
      - name: DB_PASSWORD          # une seule clé d'un Secret
        valueFrom:
          secretKeyRef: { name: db-creds, key: DB_PASSWORD }
    volumeMounts:
      - name: config               # ou en fichiers dans le conteneur
        mountPath: /etc/config
volumes:
  - name: config
    configMap: { name: app-config }`,
          note: {
            fr: `Différence clé : les variables d'env sont figées au démarrage du pod, alors qu'un volume monté est mis à jour à chaud quand la ConfigMap change (si l'app sait relire ses fichiers).`,
            en: `Key difference: env variables are frozen at pod startup, while a mounted volume is hot-updated when the ConfigMap changes (if the app knows how to re-read its files).`,
          },
        },
        {
          id: 'k8s-requests-limits',
          title: { fr: 'requests & limits — réserver et plafonner', en: 'requests & limits — reserve and cap' },
          code: `containers:
  - name: web
    resources:
      requests:            # garanti — sert au scheduler pour placer le pod
        cpu: 100m          # 0,1 cœur
        memory: 128Mi
      limits:              # plafond dur
        cpu: 500m          # au-delà : throttling CPU
        memory: 256Mi      # au-delà : OOMKilled (exit 137)`,
          note: {
            fr: `requests = ce que le scheduler réserve, limits = le plafond. Dépasser la limite mémoire tue le conteneur ; dépasser la limite CPU le ralentit seulement. Sans requests, pas de HPA fiable.`,
            en: `requests = what the scheduler reserves, limits = the ceiling. Exceeding the memory limit kills the container; exceeding the CPU limit only throttles it. Without requests, no reliable HPA.`,
          },
        },
        {
          id: 'k8s-pvc',
          title: { fr: 'Le PVC minimal — du stockage persistant', en: 'The minimal PVC — persistent storage' },
          code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: donnees-app
spec:
  accessModes: [ReadWriteOnce]   # un seul nœud peut monter en écriture
  resources:
    requests:
      storage: 5Gi
  storageClassName: standard     # quelle "gamme" de disque provisionner
# Côté pod :
#   volumes: [{ name: data, persistentVolumeClaim: { claimName: donnees-app } }]`,
          note: {
            fr: `Le PVC est une demande de disque ; la StorageClass le provisionne automatiquement (cloud). Les données survivent à la mort du pod — contrairement à un emptyDir, effacé avec lui.`,
            en: `The PVC is a request for disk; the StorageClass provisions it automatically (cloud). Data survives the pod's death — unlike an emptyDir, wiped along with it.`,
          },
        },
        {
          id: 'k8s-statefulset',
          title: { fr: 'StatefulSet vs Deployment', en: 'StatefulSet vs Deployment' },
          code: `# Deployment  : pods interchangeables, noms aléatoires (web-7d4f9-x2k8j)
# StatefulSet : identité stable (db-0, db-1…), un PVC dédié par pod,
#               démarrage et arrêt dans l'ordre
kubectl get statefulsets
kubectl get pods -l app=db   # db-0, db-1, db-2 — toujours les mêmes noms`,
          note: {
            fr: `En une phrase : Deployment pour le stateless (API, front), StatefulSet quand chaque pod a besoin d'une identité et d'un disque à lui (bases de données, Kafka, Elasticsearch).`,
            en: `In one sentence: Deployment for stateless workloads (APIs, frontends), StatefulSet when each pod needs its own identity and disk (databases, Kafka, Elasticsearch).`,
          },
        },
        {
          id: 'k8s-namespaces-quotas',
          title: { fr: 'Namespaces & quotas', en: 'Namespaces & quotas' },
          code: `kubectl create namespace equipe-a       # cloisonner par équipe/env
kubectl get resourcequota -n equipe-a   # les plafonds du namespace
kubectl describe quota -n equipe-a      # utilisé vs autorisé
# Un quota typique plafonne : pods, CPU/mémoire totaux, nb de PVC…`,
          note: {
            fr: `Les namespaces isolent logiquement (noms, RBAC, quotas) mais PAS le réseau (rôle des NetworkPolicies). Un ResourceQuota empêche une équipe de consommer tout le cluster.`,
            en: `Namespaces isolate logically (names, RBAC, quotas) but NOT the network (that's the NetworkPolicies' job). A ResourceQuota prevents one team from eating the whole cluster.`,
          },
        },
      ],
    },
    {
      id: 'troubleshoot',
      title: { fr: 'Pannes classiques', en: 'Classic failures' },
      items: [
        {
          id: 'k8s-crashloop',
          title: { fr: 'CrashLoopBackOff — ça démarre puis ça meurt', en: 'CrashLoopBackOff — starts then dies' },
          code: `kubectl get pods                       # STATUS: CrashLoopBackOff
kubectl logs mon-pod --previous        # L'ERREUR est dans les logs d'AVANT
kubectl describe pod mon-pod           # Exit Code + Events
# Causes fréquentes : config manquante, dépendance injoignable,
# commande erronée, liveness probe trop agressive`,
          note: {
            fr: `Le conteneur démarre, plante, et Kubernetes le relance avec un délai croissant (back-off). Le réflexe : logs --previous, car les logs du conteneur fraîchement relancé sont vides.`,
            en: `The container starts, crashes, and Kubernetes restarts it with growing delays (back-off). The reflex: logs --previous, because the freshly restarted container's logs are empty.`,
          },
        },
        {
          id: 'k8s-imagepull',
          title: { fr: 'ImagePullBackOff — l\'image ne vient pas', en: 'ImagePullBackOff — the image won\'t pull' },
          code: `kubectl describe pod mon-pod   # Events: "Failed to pull image…"
# Vérifier dans l'ordre :
#   1. faute de frappe dans le nom ou le tag de l'image ?
#   2. le tag existe-t-il vraiment dans le registre ?
#   3. registre privé → il faut un imagePullSecret :
kubectl create secret docker-registry regcred \\
  --docker-server=registry.exemple.com \\
  --docker-username=user --docker-password=pass
# puis dans le pod : imagePullSecrets: [{ name: regcred }]`,
          note: {
            fr: `Trois suspects dans l'ordre : le nom/tag (typo), l'existence du tag dans le registre, et l'authentification (imagePullSecret manquant ou expiré pour un registre privé).`,
            en: `Three suspects in order: the name/tag (typo), whether the tag exists in the registry, and authentication (missing or expired imagePullSecret for a private registry).`,
          },
        },
        {
          id: 'k8s-pending',
          title: { fr: 'Pending — le pod ne trouve pas de nœud', en: 'Pending — the pod can\'t find a node' },
          code: `kubectl describe pod mon-pod
# Events typiques :
#   "Insufficient cpu/memory"    → requests trop grosses ou cluster plein
#   "had untolerated taint"      → nœuds taintés, pas de toleration
#   "didn't match node selector" → nodeSelector/affinity impossible
kubectl top nodes                       # reste-t-il de la place ?
kubectl describe nodes | grep -A3 Taints`,
          note: {
            fr: `Pending = le scheduler ne trouve aucun nœud acceptable. Le describe dit toujours pourquoi : pas assez de CPU/mémoire libres, taints non tolérés, ou sélecteur de nœud insatisfiable.`,
            en: `Pending = the scheduler finds no acceptable node. describe always says why: not enough free CPU/memory, untolerated taints, or an unsatisfiable node selector.`,
          },
        },
        {
          id: 'k8s-oomkilled',
          title: { fr: 'OOMKilled — exit code 137', en: 'OOMKilled — exit code 137' },
          code: `kubectl describe pod mon-pod
#   Last State:  Terminated
#   Reason:      OOMKilled
#   Exit Code:   137          # 128 + 9 (SIGKILL)
kubectl top pod mon-pod --containers   # conso réelle vs limite
# Solution : monter resources.limits.memory… ou corriger la fuite`,
          note: {
            fr: `Le conteneur a dépassé sa limite mémoire et le noyau l'a tué (SIGKILL, code 137). Comparer la conso réelle (top) à la limite : soit la limite est trop basse, soit l'app fuit.`,
            en: `The container exceeded its memory limit and the kernel killed it (SIGKILL, code 137). Compare actual usage (top) with the limit: either the limit is too low, or the app leaks.`,
          },
        },
        {
          id: 'k8s-no-traffic',
          title: { fr: 'Le pod ne reçoit pas de trafic', en: 'The pod gets no traffic' },
          code: `# 1. Le Service a-t-il des endpoints ?
kubectl get endpoints mon-svc          # vide = personne derrière
# 2. Le selector du Service matche-t-il les labels des pods ?
kubectl get svc mon-svc -o jsonpath='{.spec.selector}'
kubectl get pods -l app=mon-app        # ces pods existent-ils ?
# 3. Les pods sont-ils Ready ? (readiness probe qui échoue)
kubectl get pods                       # READY 0/1 = retiré du Service
# 4. Test direct depuis l'intérieur
kubectl run test --rm -it --image=busybox -- wget -qO- http://mon-svc`,
          note: {
            fr: `Checklist dans l'ordre : endpoints vides → selector qui ne matche pas les labels, ou readiness probe en échec (READY 0/1). Le pod jetable confirme ensuite la joignabilité réelle.`,
            en: `Checklist in order: empty endpoints → selector not matching the labels, or failing readiness probe (READY 0/1). The throwaway pod then confirms actual reachability.`,
          },
        },
      ],
    },
    {
      id: 'k8s-bp',
      title: { fr: 'Bonnes pratiques', en: 'Best practices' },
      items: [
        {
          id: 'k8s-bp-security-context-hardening',
          title: { fr: 'securityContext : non-root, capacités réduites, rootfs figé', en: 'securityContext: non-root, dropped caps, immutable rootfs' },
          code: `securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities: { drop: [ALL] }`,
          note: {
            fr: `Ces quatre lignes ferment la majorité des scénarios d'évasion de conteneur : pas de root, pas d'écriture hors volumes déclarés, pas d'escalade de privilège, pas de capacités Linux superflues. Sans elles, une faille applicative se transforme facilement en compromission du nœud.`,
            en: `These four lines close most container-escape scenarios: no root, no writes outside declared volumes, no privilege escalation, no leftover Linux capabilities. Without them, an app vulnerability easily turns into node compromise.`,
          },
        },
        {
          id: 'k8s-bp-poddisruptionbudget',
          title: { fr: 'PodDisruptionBudget sur les workloads critiques', en: 'PodDisruptionBudget on critical workloads' },
          code: `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata: { name: mon-app-pdb }
spec:
  minAvailable: 2
  selector: { matchLabels: { app: mon-app } }`,
          note: {
            fr: `Sans PDB, un drain de nœud (upgrade cluster, scale-down) peut évincer TOUS les pods d'un Deployment en même temps s'ils sont sur le même nœud. minAvailable force Kubernetes à respecter un plancher de disponibilité pendant toute opération volontaire.`,
            en: `Without a PDB, a node drain (cluster upgrade, scale-down) can evict ALL of a Deployment's pods at once if they land on the same node. minAvailable forces Kubernetes to respect an availability floor during any voluntary disruption.`,
          },
        },
        {
          id: 'k8s-bp-mandatory-probes',
          title: { fr: 'Readiness probe sans dépendance externe, jamais optionnelle', en: 'Readiness probe with no external dependency, never optional' },
          code: `readinessProbe:
  httpGet: { path: /ready, port: 8080 }
  periodSeconds: 5
  failureThreshold: 3`,
          note: {
            fr: `Un pod sans readinessProbe est considéré prêt dès son démarrage, avant même d'avoir chargé sa config : il reçoit du trafic et répond en erreur. Faites répondre /ready seulement quand l'app peut réellement servir, sans sonder une dépendance externe (sinon une panne de BDD tue tout le service).`,
            en: `A pod with no readinessProbe is considered ready the moment it starts, before it even loaded config: it receives traffic and errors out. Make /ready answer only once the app can truly serve, without probing an external dependency (otherwise a DB outage takes down the whole service).`,
          },
        },
        {
          id: 'k8s-bp-resourcequota-limitrange',
          title: { fr: 'LimitRange + ResourceQuota par namespace, pas seulement par pod', en: 'LimitRange + ResourceQuota per namespace, not just per pod' },
          code: `apiVersion: v1
kind: LimitRange
metadata: { name: defaults }
spec:
  limits:
    - default: { cpu: 500m, memory: 256Mi }
      defaultRequest: { cpu: 100m, memory: 128Mi }
      type: Container`,
          note: {
            fr: `Compter sur chaque équipe pour toujours déclarer requests/limits est fragile ; un LimitRange applique des valeurs par défaut à tout conteneur qui les omet, et un ResourceQuota plafonne la consommation totale du namespace.`,
            en: `Relying on every team to always declare requests/limits is fragile; a LimitRange applies defaults to any container that omits them, and a ResourceQuota caps the namespace's total consumption.`,
          },
        },
        {
          id: 'k8s-bp-immutable-image-tags',
          title: { fr: 'Tags d\'image immuables (SHA ou version figée), jamais latest en prod', en: 'Immutable image tags (SHA or pinned version), never latest in prod' },
          code: `containers:
  - name: web
    image: registry.exemple.fr/mon-app@sha256:5f2c9e8a1b3d7c6e4f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e
    imagePullPolicy: IfNotPresent`,
          note: {
            fr: `Avec :latest, un rollout ou un redémarrage de pod peut tirer une image différente de celle testée, sans trace dans l'historique du Deployment — un rollback devient impossible à garantir. Un digest fige exactement ce qui tourne.`,
            en: `With :latest, a rollout or pod restart can pull a different image than the one tested, with no trace in the Deployment history — a rollback becomes impossible to guarantee. A digest pins exactly what runs.`,
          },
        },
      ],
    },
  ],
};
