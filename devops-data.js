window.DEVOPS_TREE = {
  root: {
    id: "devops", name: "What is DevOps",
    summary: "DevOps is a culture and set of practices that brings software development (Dev) and IT operations (Ops) together so teams can ship changes faster and more reliably. It is not a tool — the tools in this tree exist to support the practices.",
    analogy: "Think of a restaurant where the chefs (Dev) and waiters (Ops) used to blame each other. DevOps puts them in one team with a shared goal: happy customers, fast and without dropped plates.",
    why: "Every tool on this tree serves one loop: plan → code → build → test → release → deploy → operate → monitor → back to plan. When you learn a tool, ask: which part of the loop does this automate?",
    concepts: [
      "CALMS: Culture, Automation, Lean, Measurement, Sharing — the five pillars of DevOps.",
      "The infinite loop: the SDLC as a continuous cycle, not a one-way waterfall.",
      "DORA metrics: deployment frequency, lead time for changes, change failure rate, time to restore.",
      "Shift-left: catch bugs and security issues as early in the loop as possible.",
      "You build it, you run it: the team that writes the code also owns it in production."
    ],
    example: { title: "DORA metrics — two teams compared", lang: "text", code:
`                     Team A (manual)     Team B (DevOps)
Deploy frequency     once a month        many times a day
Lead time            3–4 weeks           < 1 day
Change failure rate  ~30%                ~5%
Time to restore      days                < 1 hour

Team B isn't "braver" — it has automated tests, CI/CD,
small changes, and good monitoring. That's this whole tree.` },
    practice: "Take a project you've worked on and map it onto the 8 stages of the loop. Which stage is the most manual or painful? That's where to start automating."
  },
  branches: [
    { id: "foundations", name: "Foundations", color: "#2f9e52", topics: [
      { id: "linux", name: "Linux",
        summary: "Almost every server, container and CI runner runs Linux. You need to be comfortable navigating the filesystem, reading logs, managing processes, permissions and services from the terminal.",
        analogy: "Linux is the ground the whole DevOps city is built on. You don't have to be a geologist, but you must know where the pipes and power lines run.",
        why: "When a deploy fails at 2am, you'll be SSH'd into a box or exec'd into a container. Linux skills are what let you actually look around and fix it.",
        concepts: [
          "Filesystem: /etc holds config, /var/log holds logs, /usr/bin holds programs, /home holds users.",
          "Permissions: read/write/execute for user, group, others — chmod 755 = rwxr-xr-x.",
          "Processes: ps, top, and signals — kill -15 asks nicely, kill -9 forces.",
          "systemd: systemctl starts/stops services, journalctl reads their logs.",
          "Package managers: apt (Debian/Ubuntu), dnf/yum (RHEL), apk (Alpine)."
        ],
        example: { title: "Everyday troubleshooting", lang: "bash", code:
`# Who's eating the CPU?
top -o %CPU

# Biggest files under /var
sudo du -ah /var | sort -rh | head -n 10

# Permissions: owner rwx, group r-x, others r-x
chmod 755 deploy.sh
ls -l deploy.sh    # -rwxr-xr-x

# Manage a service and read its logs
sudo systemctl status nginx
sudo systemctl restart nginx
journalctl -u nginx --since "10 min ago"` },
        practice: "Start an Ubuntu VM or container, install nginx, break its config on purpose, and use systemctl + journalctl to find the error." },
      { id: "bash", name: "Bash Scripting",
        summary: "Bash glues tools together. Automate repetitive work — backups, health checks, simple deploys — before reaching for anything heavier.",
        analogy: "Bash is duct tape: not pretty, but it connects anything to anything, and every toolbox has some.",
        why: "CI pipelines, Dockerfiles and cron jobs are full of shell. Reading and writing safe scripts is a daily skill.",
        concepts: [
          "Shebang & safety: #!/usr/bin/env bash and set -euo pipefail to fail fast.",
          "Variables & args: $1 is the first argument, \"$@\" is all of them — always quote.",
          "Exit codes: 0 means success, anything else is failure; check with $?.",
          "Control flow: if / for / while / case.",
          "Pipes & redirection: |, >, >>, and 2>&1 to merge errors into output."
        ],
        example: { title: "A retrying health check", lang: "bash", code:
`#!/usr/bin/env bash
set -euo pipefail   # stop on errors and unset variables

URL="\${1:-http://localhost:8080/health}"

for i in {1..5}; do
  if curl -fsS "$URL" > /dev/null; then
    echo "OK: healthy after $i tries"
    exit 0
  fi
  echo "waiting... ($i/5)"
  sleep 2
done

echo "FAIL: service unhealthy" >&2
exit 1` },
        practice: "Write a script that checks disk usage (df -h) and prints a warning for any mount above 80%." },
      { id: "networking", name: "Networking",
        summary: "A huge share of “it doesn't work” is networking: DNS, ports, firewalls, TLS. Know how a request travels from a browser to your server and back.",
        analogy: "DNS is the phone book, an IP is the street address, a port is the apartment number, and a firewall is the doorman.",
        why: "Containers, Kubernetes and clouds all add virtual networks on top. If you understand the basics, those layers stop being magic.",
        concepts: [
          "IP & CIDR: 10.0.0.0/16 is a range of 65,536 addresses; /24 is 256.",
          "TCP vs UDP: reliable connection vs fire-and-forget. Common ports: 22 SSH, 80 HTTP, 443 HTTPS, 5432 Postgres.",
          "DNS: A records point to IPs, CNAMEs point to other names, TTL controls caching.",
          "HTTP(S): methods, status codes (2xx ok, 4xx your fault, 5xx server's fault), TLS certificates.",
          "Load balancers & reverse proxies: spread traffic and terminate TLS (nginx, HAProxy, ALB)."
        ],
        example: { title: "Debugging a connection step by step", lang: "bash", code:
`dig +short api.example.com        # 1. does the name resolve?
nc -zv api.example.com 443        # 2. is the port reachable?
curl -v https://api.example.com   # 3. TLS handshake + HTTP response
ss -tulpn                         # on the server: what's listening?
traceroute api.example.com        # where do packets get lost?` },
        practice: "Explain, step by step, what happens when you type a URL and press Enter. Then prove each step with one of the commands above." },
      { id: "git", name: "Git",
        summary: "Git is the source of truth for code — and, in DevOps, for infrastructure and config too. Every pipeline starts with a commit.",
        analogy: "Git is a time machine with parallel universes: branches let you experiment, merges bring the good timelines back together.",
        why: "CI triggers on pushes, GitOps deploys from commits, and code review happens in pull requests. You'll use Git dozens of times a day.",
        concepts: [
          "Commits & branches: snapshots, and movable pointers to them.",
          "Merge vs rebase: merge keeps history as it happened, rebase replays your work on top for a linear history.",
          "Remotes: fetch downloads, pull = fetch + merge, push uploads.",
          "Branching strategy: trunk-based (short branches, merge daily) vs GitFlow (long-lived branches).",
          "Tags: mark releases like v1.4.0 so pipelines can build them."
        ],
        example: { title: "A clean feature workflow", lang: "bash", code:
`git switch -c feature/login
git add -p                    # stage changes hunk by hunk
git commit -m "feat: add login endpoint"

git fetch origin
git rebase origin/main        # replay my work on the latest main
git push -u origin feature/login
# → open a Pull Request, CI runs, teammate reviews

# Oops: undo last commit but keep the changes
git reset --soft HEAD~1` },
        practice: "Create a merge conflict on purpose between two branches, resolve it, and look at the result with git log --graph --oneline." },
      { id: "nginx", name: "Nginx",
        summary: "Nginx is a high-performance web server, reverse proxy and load balancer. It sits in front of your apps, serves static files, terminates HTTPS, and routes requests to backend services.",
        analogy: "Nginx is the hotel receptionist: every guest arrives at the front desk, and the receptionist sends them to the right room, checks their keycard (TLS), and turns away troublemakers (rate limits).",
        why: "Almost every stack has Nginx somewhere — as the web server on a VM, the ingress controller in Kubernetes, or the reverse proxy in Docker Compose. Reading and debugging its config is a core skill.",
        concepts: [
          "Server blocks: virtual hosts — one per domain, chosen by server_name and listen port.",
          "Location blocks: match URL paths and decide what to do — serve files, proxy, redirect.",
          "Reverse proxy: proxy_pass forwards requests to an upstream app and returns its response.",
          "Upstreams & load balancing: round-robin, least_conn or ip_hash across several backends.",
          "TLS termination: Nginx handles HTTPS certificates so apps can speak plain HTTP internally."
        ],
        example: { title: "Reverse proxy with HTTPS and load balancing", lang: "nginx", code:
`upstream api_backend {
    least_conn;
    server 10.0.1.10:3000;
    server 10.0.1.11:3000;
}

server {
    listen 80;
    server_name api.example.com;
    return 301 https://$host$request_uri;      # force HTTPS
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    ssl_certificate     /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location /static/ {
        root /var/www;                          # serve files directly
        expires 7d;
    }

    location / {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 30s;
    }
}

# sudo nginx -t && sudo systemctl reload nginx` },
        practice: "Run two copies of a small app on ports 3000 and 3001, put Nginx in front with an upstream block, and watch requests alternate in the logs." },
      { id: "python", name: "Python for DevOps",
        summary: "Python is the go-to language when a task outgrows Bash: calling APIs, parsing JSON/YAML, writing CLIs, automating clouds with SDKs like boto3, and building small internal tools.",
        analogy: "If Bash is duct tape, Python is a proper toolbox — still quick to grab, but you can build things that last.",
        why: "Ansible, many CLIs and most cloud SDKs are Python. Automation scripts, Lambda functions and glue services are very often written in it.",
        concepts: [
          "Virtual environments: python -m venv .venv isolates dependencies per project.",
          "pip & requirements.txt: install and pin packages so builds are repeatable.",
          "Standard library: subprocess, pathlib, json, os, argparse cover most scripting needs.",
          "requests & SDKs: talk to REST APIs and clouds (boto3 for AWS, azure-sdk, kubernetes client).",
          "Error handling & exit codes: try/except and sys.exit(1) so CI knows when you failed."
        ],
        example: { title: "Find and stop idle EC2 instances (boto3)", lang: "python", code:
`#!/usr/bin/env python3
import sys, boto3
from datetime import datetime, timedelta, timezone

ec2 = boto3.client("ec2", region_name="eu-west-1")
cw  = boto3.client("cloudwatch", region_name="eu-west-1")

def avg_cpu(instance_id, hours=24):
    end = datetime.now(timezone.utc)
    stats = cw.get_metric_statistics(
        Namespace="AWS/EC2", MetricName="CPUUtilization",
        Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
        StartTime=end - timedelta(hours=hours), EndTime=end,
        Period=3600, Statistics=["Average"])
    points = [p["Average"] for p in stats["Datapoints"]]
    return sum(points) / len(points) if points else 0.0

idle = []
for r in ec2.describe_instances(Filters=[{"Name": "tag:Env", "Values": ["dev"]},
                                         {"Name": "instance-state-name", "Values": ["running"]}])["Reservations"]:
    for i in r["Instances"]:
        cpu = avg_cpu(i["InstanceId"])
        print(f'{i["InstanceId"]}: {cpu:.1f}% avg CPU')
        if cpu < 2:
            idle.append(i["InstanceId"])

if "--apply" in sys.argv and idle:
    ec2.stop_instances(InstanceIds=idle)
    print("stopped:", idle)` },
        practice: "Write a Python CLI (argparse) that reads a YAML file of URLs, checks each one with requests, and exits 1 if any is down." }
    ]},
    { id: "containers", name: "Containers", color: "#2b7fd4", topics: [
      { id: "docker", name: "Docker",
        summary: "A container packages your app with everything it needs — runtime, libraries, config — so it runs the same on your laptop, in CI, and in production. An image is the blueprint; a container is a running instance of it.",
        analogy: "A shipping container: the ship doesn't care what's inside, it just knows the standard shape. Docker gives software that standard shape.",
        why: "Containers are the unit that CI builds, registries store and Kubernetes runs. Almost everything downstream assumes you have an image.",
        concepts: [
          "Image vs container: an image is read-only layers; a container is an image plus a running process.",
          "Layers & caching: each Dockerfile instruction is a layer — order them so rarely-changing steps come first.",
          "Volumes & ports: -v persists data outside the container, -p 8080:3000 maps host to container port.",
          "Multi-stage builds: build in a fat image, ship only the result in a small one.",
          "Security: don't run as root, use slim base images, pin versions."
        ],
        example: { title: "Multi-stage Dockerfile for a Node app", lang: "dockerfile", code:
`# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci                 # cached unless dependencies change
COPY . .
RUN npm run build

# --- runtime stage (small, no build tools) ---
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER node                  # don't run as root
EXPOSE 3000
CMD ["node", "dist/server.js"]

# docker build -t myapp:1.0 .
# docker run -p 3000:3000 myapp:1.0` },
        practice: "Containerize a small app. Compare the image size (docker images) with and without the multi-stage build." },
      { id: "compose", name: "Docker Compose",
        summary: "Define a multi-container app — API, database, cache — in one YAML file and start it with one command. Ideal for local development environments.",
        analogy: "If Docker is one musician, Compose is the sheet music for the whole band: who plays, when they start, how they hear each other.",
        why: "New teammates run docker compose up and have the full stack in a minute. It's also the easiest way to learn how services talk to each other.",
        concepts: [
          "Services: each container you want to run, built locally or pulled as an image.",
          "Networking: services reach each other by name — the API connects to host db.",
          "depends_on + healthcheck: start the API only after the DB is actually ready.",
          "Volumes: named volumes keep database data between restarts.",
          ".env files: keep configuration out of the YAML."
        ],
        example: { title: "API + Postgres", lang: "yaml", code:
`services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:secret@db:5432/app
    depends_on:
      db: { condition: service_healthy }

  db:
    image: postgres:16
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: secret
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "app"]
      interval: 5s

volumes:
  pgdata:` },
        practice: "Run docker compose up -d, then docker compose logs -f api. Notice the API reaches Postgres at the hostname “db”." },
      { id: "registry", name: "Container Registries",
        summary: "Registries store and distribute images — Docker Hub, GitHub Container Registry (GHCR), AWS ECR. CI pushes images in; servers and clusters pull them out.",
        analogy: "A registry is a warehouse for shipping containers. Tags are the labels on the boxes; digests are the tamper-proof serial numbers.",
        why: "The registry is the hand-off point between “build” and “deploy”. Getting tags right is what makes rollbacks easy.",
        concepts: [
          "Tags vs digests: myapp:1.4.0 can be moved; myapp@sha256:… never changes.",
          "Avoid :latest in production — you can't tell what's actually running.",
          "Tag images with the git SHA or version so every deploy is traceable.",
          "Private registries need login; CI uses tokens, clusters use pull secrets.",
          "Most registries can scan images for vulnerabilities on push."
        ],
        example: { title: "Push an image to GHCR", lang: "bash", code:
`docker build -t myapp .
docker tag myapp ghcr.io/me/myapp:1.4.0

echo "$GH_TOKEN" | docker login ghcr.io -u me --password-stdin
docker push ghcr.io/me/myapp:1.4.0

# on any other machine
docker pull ghcr.io/me/myapp:1.4.0` },
        practice: "Push an image to GHCR or Docker Hub and pull it on another machine (or a fresh VM)." }
    ]},
    { id: "orchestration", name: "Kubernetes", color: "#7a5ce0", topics: [
      { id: "kubernetes", name: "Kubernetes Core",
        summary: "Kubernetes runs containers across a cluster of machines and keeps them in the state you declared. You say “I want 3 copies of this app”, and it schedules, heals, scales and rolls out updates to make it true.",
        analogy: "Kubernetes is a thermostat for apps: you set the desired temperature (state), it constantly measures and adjusts until reality matches.",
        why: "It's the standard platform for running containers in production. Most modern DevOps jobs expect you to read and write manifests.",
        concepts: [
          "Pod: the smallest unit — one or more containers sharing network and storage.",
          "Deployment: manages a set of identical pods and rolls out new versions gradually.",
          "Desired vs actual state: controllers loop forever, fixing any difference.",
          "ConfigMap & Secret: inject configuration and credentials into pods.",
          "Probes & resources: readiness/liveness checks, CPU/memory requests and limits."
        ],
        example: { title: "A Deployment with 3 replicas", lang: "yaml", code:
`apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels: { app: api }
  template:
    metadata:
      labels: { app: api }
    spec:
      containers:
        - name: api
          image: ghcr.io/me/myapp:1.4.0
          ports: [{ containerPort: 3000 }]
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { memory: 256Mi }
          readinessProbe:
            httpGet: { path: /health, port: 3000 }

# kubectl apply -f deployment.yaml
# kubectl get pods -w` },
        practice: "Install kind or minikube, apply this Deployment, then delete a pod and watch Kubernetes recreate it with kubectl get pods -w." },
      { id: "services", name: "Services & Ingress",
        summary: "Pods come and go and their IPs change. A Service gives a group of pods one stable name and address; an Ingress routes outside HTTP traffic to Services by hostname or path.",
        analogy: "Pods are staff who change shifts; the Service is the front-desk phone number that always reaches whoever is on duty. Ingress is the building's reception directing visitors.",
        why: "Without Services nothing could find anything inside the cluster. Ingress is how real users reach your app.",
        concepts: [
          "ClusterIP: internal-only address (the default).",
          "NodePort / LoadBalancer: expose a Service outside the cluster.",
          "Label selectors: a Service finds its pods by labels like app: api.",
          "Ingress controller: the actual proxy (ingress-nginx, Traefik) that implements Ingress rules.",
          "TLS: usually terminated at the Ingress, often with cert-manager + Let's Encrypt."
        ],
        example: { title: "Service + Ingress for the API", lang: "yaml", code:
`apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }        # matches the Deployment's pods
  ports: [{ port: 80, targetPort: 3000 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: api }
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: { name: api, port: { number: 80 } }` },
        practice: "Run kubectl port-forward svc/api 8080:80 and curl localhost:8080. Then scale the Deployment and confirm the Service still works." },
      { id: "helm", name: "Helm",
        summary: "Helm is a package manager for Kubernetes. A chart is a templated bundle of manifests; different values files let you reuse it for dev, staging and prod.",
        analogy: "Helm is a cookie cutter: one chart (the cutter), different values (the dough) — same shape every time.",
        why: "Real apps need dozens of manifests per environment. Helm removes copy-paste and gives you versioned releases with one-command rollback.",
        concepts: [
          "Chart: the package (templates + default values.yaml).",
          "Release: one installed instance of a chart in a cluster.",
          "Templating: {{ .Values.replicaCount }} gets filled from values files.",
          "helm upgrade --install: idempotent — installs or upgrades as needed.",
          "Revisions & rollback: every upgrade is numbered; roll back to any of them."
        ],
        example: { title: "One chart, per-environment values", lang: "yaml", code:
`# values-prod.yaml
replicaCount: 5
image:
  tag: "1.4.0"

# templates/deployment.yaml (excerpt)
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    spec:
      containers:
        - image: "ghcr.io/me/myapp:{{ .Values.image.tag }}"

# shell
# helm upgrade --install api ./chart -f values-prod.yaml -n prod
# helm history api -n prod
# helm rollback api 2 -n prod` },
        practice: "Run helm create mychart, read the generated templates, and install it twice with different values files." },
      { id: "mesh", name: "Service Mesh (Istio)",
        summary: "A service mesh moves networking concerns — encryption, retries, timeouts, traffic splitting, telemetry — out of your app code and into a layer of proxies that sits beside every service.",
        analogy: "Instead of teaching every employee to drive safely and log their trips, you give each one a professional chauffeur who already does it — the sidecar proxy.",
        why: "With dozens of microservices, getting mTLS, retries and observability right in every codebase is impossible. A mesh gives it to all services uniformly.",
        concepts: [
          "Data plane: Envoy proxies (sidecars or per-node ambient proxies) that carry all traffic.",
          "Control plane: istiod pushes config, certificates and routing rules to every proxy.",
          "mTLS: every service-to-service call is encrypted and authenticated automatically.",
          "Traffic management: VirtualService and DestinationRule do canaries, retries, timeouts, fault injection.",
          "Observability: golden-signal metrics and traces for every call without code changes."
        ],
        example: { title: "Canary: send 10% of traffic to v2", lang: "yaml", code:
`apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata: { name: api }
spec:
  host: api
  subsets:
    - name: v1
      labels: { version: v1 }
    - name: v2
      labels: { version: v2 }
---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata: { name: api }
spec:
  hosts: [api]
  http:
    - route:
        - destination: { host: api, subset: v1 }
          weight: 90
        - destination: { host: api, subset: v2 }
          weight: 10
      retries: { attempts: 3, perTryTimeout: 2s }
      timeout: 5s` },
        practice: "Install Istio on kind, label a namespace for injection, deploy two versions of an app and shift traffic 90/10 → 50/50 → 0/100 while watching Kiali." }
    ]},
    { id: "cicd", name: "CI/CD", color: "#d9741f", topics: [
      { id: "cicd-concepts", name: "CI/CD Concepts",
        summary: "Continuous Integration: every push is automatically built and tested. Continuous Delivery: every passing build is ready to release with one click. Continuous Deployment: it goes to production automatically.",
        analogy: "CI/CD is a factory assembly line with quality checks at every station — a faulty part is rejected immediately, not discovered by the customer.",
        why: "This is the heart of DevOps. Small changes, tested automatically, deployed often — that's what moves the DORA metrics.",
        concepts: [
          "Pipeline stages: build → test → scan → package → deploy.",
          "Build once, promote everywhere: the same artifact goes to staging and then prod.",
          "Fast feedback: aim for CI under ~10 minutes so people don't stop waiting for it.",
          "Deployment strategies: rolling, blue/green (switch traffic), canary (small % first).",
          "Environments & approvals: gates between staging and production."
        ],
        example: { title: "A typical flow", lang: "text", code:
`push to feature branch
  └─ CI: lint → unit tests → build image        (minutes)

merge to main
  └─ CD: push image:<git-sha>
        → deploy to staging
        → smoke tests
        └─ approval (Delivery) or automatic (Deployment)
             └─ deploy prod: canary 10% → watch metrics → 100%` },
        practice: "Sketch the pipeline for a project you know. Mark where a bug, a vulnerable dependency, and a bad config would each be caught." },
      { id: "gha", name: "GitHub Actions",
        summary: "CI/CD built into GitHub. Workflows are YAML files in .github/workflows that run on events like push or pull_request.",
        analogy: "“When this happens in my repo, run these steps on a fresh machine.” That's all an Action workflow says.",
        why: "Zero setup if your code is on GitHub, a huge marketplace of reusable actions, and a great place to learn pipelines.",
        concepts: [
          "Workflow → jobs → steps: jobs run in parallel unless linked with needs.",
          "Runners: GitHub-hosted VMs or your own self-hosted machines.",
          "uses: pull in reusable actions like actions/checkout.",
          "Secrets & variables: ${{ secrets.NAME }}, never hard-code tokens.",
          "Matrix builds: test across several versions or OSes at once."
        ],
        example: { title: "Test on every PR, build an image on main", lang: "yaml", code:
`name: ci
on:
  push: { branches: [main] }
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test

  image:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions: { packages: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - run: echo "\${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u \${{ github.actor }} --password-stdin
      - run: docker build -t ghcr.io/\${{ github.repository }}:\${{ github.sha }} .
      - run: docker push ghcr.io/\${{ github.repository }}:\${{ github.sha }}` },
        practice: "Add a workflow to one of your repos that runs tests on every pull request, then break a test and watch the PR go red." },
      { id: "jenkins", name: "Jenkins",
        summary: "The veteran self-hosted automation server. Pipelines are defined in a Jenkinsfile (Groovy) and extended with a huge plugin ecosystem. Still very common in enterprises.",
        analogy: "Jenkins is a Swiss Army knife you have to sharpen yourself — it can do anything, but you maintain it.",
        why: "Many companies run Jenkins. Knowing it, and why teams migrate away from it, is useful in interviews and real jobs.",
        concepts: [
          "Controller & agents: the controller schedules, agents run the builds.",
          "Declarative pipeline: pipeline → stages → steps, plus post for cleanup/notifications.",
          "Credentials store: secrets injected into builds safely.",
          "Plugins: powerful, but each one is something to update and secure.",
          "Jenkinsfile in the repo = pipeline as code, reviewed like any other code."
        ],
        example: { title: "Declarative Jenkinsfile", lang: "groovy", code:
`pipeline {
  agent any
  stages {
    stage('Test')  { steps { sh 'npm ci && npm test' } }
    stage('Build') { steps { sh 'docker build -t myapp:$BUILD_NUMBER .' } }
    stage('Deploy') {
      when { branch 'main' }
      steps { sh './deploy.sh $BUILD_NUMBER' }
    }
  }
  post {
    failure { echo 'Build failed — notify the team' }
  }
}` },
        practice: "Run Jenkins in Docker (jenkins/jenkins:lts), create a Pipeline job pointing at a repo with this Jenkinsfile." },
      { id: "gitops", name: "GitOps & Argo CD",
        summary: "In GitOps, a Git repo holds the desired state of your cluster. An agent inside the cluster (Argo CD or Flux) continuously pulls that repo and syncs the cluster to match. Deploying = merging a pull request.",
        analogy: "Git is the recipe book; Argo CD is the chef who checks the book every few minutes and fixes any dish that doesn't match.",
        why: "Every change is reviewed, audited and reversible with git revert. Nobody needs kubectl access to production.",
        concepts: [
          "Pull vs push: the cluster pulls changes instead of CI pushing into it.",
          "Drift detection: manual changes in the cluster are detected and reverted.",
          "Rollback: git revert the commit and the cluster follows.",
          "Separate config repo: app code and deployment manifests often live apart.",
          "CI updates the image tag in Git; CD (Argo) does the rest."
        ],
        example: { title: "Argo CD Application", lang: "yaml", code:
`apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: api
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/me/k8s-config
    path: apps/api/prod
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: prod
  syncPolicy:
    automated:
      prune: true      # delete what was removed from Git
      selfHeal: true   # undo manual changes` },
        practice: "Install Argo CD on kind, point it at a repo, change replicas in Git, and watch it sync. Then kubectl scale manually and watch it heal." },
      { id: "gitlab", name: "GitLab CI",
        summary: "GitLab's built-in CI/CD. A single .gitlab-ci.yml at the repo root defines stages and jobs; GitLab Runners execute them, often inside Docker containers.",
        analogy: "Same idea as GitHub Actions, different dialect: a recipe in the repo that GitLab cooks every time you push.",
        why: "GitLab is very common in companies that self-host their code. Its stages, environments and built-in registry make complete pipelines easy.",
        concepts: [
          "Stages: ordered phases (build, test, deploy); jobs in the same stage run in parallel.",
          "Jobs: each has a script, an image to run in, and rules for when it runs.",
          "Runners: shared or project-specific agents using Docker, Kubernetes or shell executors.",
          "Artifacts & cache: pass build output between jobs; cache dependencies between pipelines.",
          "Environments: track deployments per environment with manual gates and rollbacks."
        ],
        example: { title: "Build, test, and deploy with a manual gate", lang: "yaml", code:
`stages: [test, build, deploy]

variables:
  IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

test:
  stage: test
  image: node:20
  cache: { paths: [node_modules/] }
  script:
    - npm ci
    - npm test

build:
  stage: build
  image: docker:24
  services: [docker:24-dind]
  script:
    - echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin $CI_REGISTRY
    - docker build -t $IMAGE .
    - docker push $IMAGE
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy_prod:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl set image deploy/api api=$IMAGE -n prod
  environment: { name: production, url: https://api.example.com }
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"` },
        practice: "Create a free GitLab project, add this pipeline, and register your own runner with Docker to execute it." }
    ]},
    { id: "iac", name: "Infrastructure as Code", color: "#16958a", topics: [
      { id: "terraform", name: "Terraform",
        summary: "Describe cloud infrastructure — networks, servers, databases, DNS — in code (HCL). Terraform compares that code with reality and works out what to create, change or destroy.",
        analogy: "Terraform is an architect's blueprint plus a builder: you edit the drawing, it shows you exactly what will be built or demolished, then does it.",
        why: "Infrastructure becomes reviewable, repeatable and versioned. You can rebuild an entire environment from a repo.",
        concepts: [
          "Providers & resources: aws, google, azurerm… each resource is one real thing.",
          "State: Terraform's record of what exists — store it remotely and lock it.",
          "plan → apply: always read the plan before applying.",
          "Variables & outputs: parameterize inputs, expose results.",
          "Modules: reusable bundles, like functions for infrastructure."
        ],
        example: { title: "An S3 bucket with remote state", lang: "hcl", code:
`terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "my-tf-state"
    key    = "prod/terraform.tfstate"
    region = "eu-west-1"
  }
}

variable "env" { default = "prod" }

resource "aws_s3_bucket" "assets" {
  bucket = "myapp-assets-\${var.env}"
  tags   = { Env = var.env, ManagedBy = "terraform" }
}

output "bucket_name" { value = aws_s3_bucket.assets.bucket }

# terraform init && terraform plan && terraform apply` },
        practice: "Create and destroy an S3 bucket with Terraform. Then change one tag and read how the plan describes the diff." },
      { id: "ansible", name: "Ansible",
        summary: "Agentless configuration management over SSH. You describe the state a server should be in — packages installed, files in place, services running — in YAML playbooks.",
        analogy: "Terraform builds the house; Ansible furnishes it and makes sure every room looks the same.",
        why: "Great for configuring VMs, patching fleets, and automating anything you'd otherwise do by SSH-ing into servers one by one.",
        concepts: [
          "Inventory: the list of hosts, grouped (web, db).",
          "Playbooks, tasks, modules: tasks call modules like apt, copy, service.",
          "Idempotency: running twice gives the same result — the second run changes nothing.",
          "Handlers: run only when notified, e.g. restart nginx after config changes.",
          "Roles: reusable, shareable bundles of tasks and templates."
        ],
        example: { title: "Install and configure nginx", lang: "yaml", code:
`# playbook.yml
- hosts: web
  become: true
  tasks:
    - name: Install nginx
      apt: { name: nginx, state: present, update_cache: true }

    - name: Deploy config
      template: { src: nginx.conf.j2, dest: /etc/nginx/nginx.conf }
      notify: restart nginx

  handlers:
    - name: restart nginx
      service: { name: nginx, state: restarted }

# ansible-playbook -i inventory.ini playbook.yml` },
        practice: "Run the playbook twice against a VM — the second run should report changed=0. That's idempotency." }
    ]},
    { id: "cloud", name: "Cloud", color: "#b08a0c", topics: [
      { id: "aws", name: "AWS Core Services",
        summary: "You don't need all 200+ services. A handful cover most DevOps work: compute, storage, networking, managed databases and container platforms.",
        analogy: "The cloud is renting instead of owning: you pay for computers, disks and networks by the hour, and can return them any time.",
        why: "Most companies run on a cloud. Knowing the core building blocks lets you design, cost and debug real systems.",
        concepts: [
          "EC2 & Auto Scaling: virtual machines that grow and shrink with load.",
          "S3: object storage for files, backups, static sites, Terraform state.",
          "VPC: your private network — public/private subnets, security groups, NAT gateways.",
          "RDS: managed databases; EKS/ECS: managed containers.",
          "Regions & AZs: spread across Availability Zones for high availability."
        ],
        example: { title: "AWS CLI essentials", lang: "bash", code:
`aws sts get-caller-identity            # who am I logged in as?

aws ec2 describe-instances \\
  --filters "Name=tag:Env,Values=prod" \\
  --query "Reservations[].Instances[].[InstanceId,State.Name]" \\
  --output table

aws s3 cp ./build s3://myapp-assets --recursive` },
        practice: "Design a VPC on paper: 2 AZs, public subnets for the load balancer, private subnets for app and DB. Then build it with Terraform." },
      { id: "iam", name: "IAM",
        summary: "Identity & Access Management decides who can do what on which resource. The golden rule is least privilege: grant only what's needed, nothing more.",
        analogy: "IAM is a hotel key-card system: each card opens specific doors, for a specific time, and can be revoked instantly.",
        why: "Most cloud breaches are misconfigured permissions or leaked keys. Good IAM is the cheapest security you'll ever buy.",
        concepts: [
          "Users, groups, roles: humans get users, machines and services assume roles.",
          "Policies: JSON documents with Effect, Action, Resource.",
          "Least privilege: start with nothing, add only what fails.",
          "OIDC for CI: GitHub Actions assumes a role — no long-lived keys stored anywhere.",
          "MFA on every human account, especially root."
        ],
        example: { title: "Policy: read/write one bucket only", lang: "json", code:
`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::myapp-assets/*"
  }]
}` },
        practice: "Create an IAM role that GitHub Actions can assume via OIDC, with access to a single S3 bucket — and nothing else." },
      { id: "azure", name: "Azure Core Services",
        summary: "Microsoft Azure is the second-largest cloud, especially strong in enterprises using Microsoft tools. Its building blocks map closely to AWS: compute, networking, storage, databases, containers and identity — organized into subscriptions and resource groups.",
        analogy: "Azure is the same city as AWS with different street names: a VPC is a VNet, EC2 is a Virtual Machine, S3 is Blob Storage, IAM is Entra ID + RBAC.",
        why: "Many companies are 'Microsoft shops' or multi-cloud. Knowing Azure's names and structure lets you transfer everything you know about AWS.",
        concepts: [
          "Hierarchy: Tenant (Entra ID) → Management groups → Subscriptions → Resource groups → Resources.",
          "Resource groups: a lifecycle container — delete the group, delete everything in it.",
          "Azure Resource Manager (ARM): the API every portal click, CLI call and Terraform plan goes through.",
          "Regions & availability zones, plus region pairs for disaster recovery.",
          "Entra ID & RBAC: identities, and role assignments at any scope (subscription, group, resource)."
        ],
        example: { title: "Azure CLI: a resource group, an AKS cluster, and a registry", lang: "bash", code:
`az login
az account set --subscription "My Subscription"

az group create --name rg-myapp-prod --location westeurope

az acr create -g rg-myapp-prod -n myappacr --sku Basic

az aks create -g rg-myapp-prod -n aks-myapp-prod \
  --node-count 3 --zones 1 2 3 \
  --enable-managed-identity \
  --attach-acr myappacr \
  --generate-ssh-keys

az aks get-credentials -g rg-myapp-prod -n aks-myapp-prod
kubectl get nodes

# clean up everything at once
az group delete -n rg-myapp-prod --yes --no-wait` },
        practice: "With a free Azure account, create a resource group containing a VNet, a Linux VM and a Storage Account using only az CLI — then delete the group." }
    ]},
    { id: "observability", name: "Observability", color: "#d4477f", topics: [
      { id: "prometheus", name: "Prometheus",
        summary: "A time-series database that scrapes metrics from your apps and infrastructure on an interval. You query it with PromQL and alert with Alertmanager.",
        analogy: "Prometheus is a nurse checking every patient's vital signs every 15 seconds and writing them on a chart.",
        why: "You can't fix what you can't see. Metrics tell you, in numbers, whether your system is healthy right now.",
        concepts: [
          "Pull model: Prometheus scrapes each target's /metrics endpoint.",
          "Metric types: counter (only goes up), gauge (up and down), histogram (distributions).",
          "Labels: dimensions like method, status, pod — slice metrics any way.",
          "Golden signals: latency, traffic, errors, saturation.",
          "Alerting: rules fire to Alertmanager, which routes to Slack, email, PagerDuty."
        ],
        example: { title: "PromQL you'll actually use", lang: "promql", code:
`# Requests per second, by status code (last 5 min)
sum by (status) (rate(http_requests_total[5m]))

# Error ratio (5xx / all)
sum(rate(http_requests_total{status=~"5.."}[5m]))
  /
sum(rate(http_requests_total[5m]))

# 95th percentile latency
histogram_quantile(0.95,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m])))` },
        practice: "Run Prometheus + node_exporter with Docker Compose and graph your machine's CPU usage." },
      { id: "grafana", name: "Grafana",
        summary: "Dashboards and alerting on top of your data sources — Prometheus, Loki, CloudWatch and many more. It turns raw numbers into something readable at 3am.",
        analogy: "If Prometheus writes the chart, Grafana is the monitor screen above the hospital bed.",
        why: "A good dashboard answers “is it broken, and where?” in seconds. It's the first thing you open during an incident.",
        concepts: [
          "Data sources: where Grafana reads from.",
          "Panels & dashboards: graphs, stats, tables grouped by purpose.",
          "Variables: dropdowns to switch environment, namespace or service.",
          "Alert rules & contact points: notify when a query crosses a threshold.",
          "Dashboards as code: export JSON and keep it in Git."
        ],
        example: { title: "Layout of a golden-signals dashboard", lang: "text", code:
`Dashboard: "API — Golden Signals"   [$namespace ▾] [$service ▾]
 ├─ Traffic     sum(rate(http_requests_total[5m]))
 ├─ Errors      error ratio %, red threshold line at 1%
 ├─ Latency     p50 / p95 / p99 on one graph
 └─ Saturation  CPU & memory per pod vs. limits

Variable: $namespace = label_values(kube_pod_info, namespace)` },
        practice: "Import community dashboard 1860 (Node Exporter Full), then build one panel of your own from scratch." },
      { id: "logging", name: "Logging (ELK / Loki)",
        summary: "Metrics tell you that something is wrong; logs tell you why. Centralize logs from every service so you can search them all in one place.",
        analogy: "Logs are the flight recorder: after something goes wrong, they tell the story second by second.",
        why: "With dozens of pods restarting, you can't SSH in to read files. Central logging is the only way to investigate.",
        concepts: [
          "Structured logs: JSON with fields beats free text — it's searchable.",
          "Collectors: Fluent Bit, Promtail, Vector ship logs from nodes.",
          "ELK: Elasticsearch stores, Logstash processes, Kibana searches.",
          "Loki: indexes only labels, much cheaper, pairs with Grafana.",
          "Correlation IDs: one trace_id across services follows a request end to end."
        ],
        example: { title: "Structured log + a Loki query", lang: "text", code:
`// one log line from your app (JSON)
{"ts":"2026-10-11T09:12:03Z","level":"error","service":"api",
 "trace_id":"a1b2c3","msg":"payment failed","status":502}

# LogQL: errors from the api in the selected time range
{service="api"} | json | level="error"

# follow a single request
{service=~"api|payments"} |= "a1b2c3"` },
        practice: "Make an app log JSON, ship it to Loki with Promtail, and find one request in Grafana by its trace_id." },
      { id: "sre", name: "SRE: SLIs, SLOs & Incidents",
        summary: "Site Reliability Engineering treats operations as an engineering problem. You define what 'reliable enough' means with SLIs and SLOs, spend an error budget on change, and respond to incidents with clear roles and blameless reviews.",
        analogy: "An SLO is a speed limit for unreliability: 99.9% means you may 'break' for about 43 minutes a month. Stay under it and you can ship fast; exceed it and you slow down to fix reliability.",
        why: "Without explicit targets, every outage becomes a debate and every alert is 'urgent'. SLOs align dev and ops on one number and make on-call sustainable.",
        concepts: [
          "SLI: a measured indicator of user happiness, e.g. % of requests faster than 300ms and not 5xx.",
          "SLO: the target for an SLI over a window, e.g. 99.9% over 30 days.",
          "Error budget: 100% − SLO. Burn it on releases and experiments; freeze risky change when it's gone.",
          "Burn-rate alerts: page when the budget is being consumed fast, not on every blip.",
          "Incident response & postmortems: incident commander, comms, timeline, blameless review, action items."
        ],
        example: { title: "SLO and a multi-window burn-rate alert", lang: "yaml", code:
`# SLO: 99.9% of requests succeed over 30 days  → error budget = 0.1%
# Burn rate 14.4 for 1h ≈ 2% of the monthly budget gone in an hour → page

groups:
  - name: api-slo
    rules:
      - record: api:error_ratio:rate1h
        expr: sum(rate(http_requests_total{job="api",status=~"5.."}[1h]))
              / sum(rate(http_requests_total{job="api"}[1h]))
      - record: api:error_ratio:rate5m
        expr: sum(rate(http_requests_total{job="api",status=~"5.."}[5m]))
              / sum(rate(http_requests_total{job="api"}[5m]))
      - alert: APIErrorBudgetBurn
        expr: api:error_ratio:rate1h > (14.4 * 0.001)
          and api:error_ratio:rate5m > (14.4 * 0.001)
        labels: { severity: page }
        annotations:
          summary: "API is burning its error budget 14x too fast"` },
        practice: "Pick a service you know, define one availability SLI and one latency SLI, set SLOs, and calculate the monthly error budget in minutes." },
      { id: "otel", name: "OpenTelemetry & Tracing",
        summary: "OpenTelemetry (OTel) is the open standard for generating and shipping telemetry — traces, metrics and logs — from your code. Distributed tracing follows a single request across every service it touches.",
        analogy: "A trace is a parcel tracking history: every depot (service) the parcel passes through adds a scan with a timestamp, so you can see exactly where it got stuck.",
        why: "In microservices, 'the checkout is slow' could be any of ten services. A trace shows the slow hop instantly — and OTel lets you switch backends without re-instrumenting.",
        concepts: [
          "Trace & span: a trace is the whole request; spans are timed operations inside it with parent/child links.",
          "Context propagation: trace IDs travel between services in headers (W3C traceparent).",
          "Instrumentation: auto-instrumentation for common libraries, plus manual spans for business logic.",
          "OTel Collector: receives, processes (batch, sample, redact) and exports telemetry to any backend.",
          "Backends: Jaeger, Grafana Tempo, Zipkin, Honeycomb, Datadog — pick one, change later."
        ],
        example: { title: "Collector config: receive OTLP, export traces and metrics", lang: "yaml", code:
`receivers:
  otlp:
    protocols:
      grpc: { endpoint: 0.0.0.0:4317 }
      http: { endpoint: 0.0.0.0:4318 }

processors:
  batch: {}
  memory_limiter: { check_interval: 1s, limit_mib: 512 }
  probabilistic_sampler: { sampling_percentage: 20 }

exporters:
  otlp/tempo:
    endpoint: tempo:4317
    tls: { insecure: true }
  prometheus:
    endpoint: 0.0.0.0:8889

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, probabilistic_sampler, batch]
      exporters: [otlp/tempo]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]

# app side (Node): OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
#   node --require @opentelemetry/auto-instrumentations-node/register app.js` },
        practice: "Run two small services that call each other, auto-instrument both with OTel, send traces to Jaeger, and find the slowest span." }
    ]},
    { id: "security", name: "Security", color: "#d64545", topics: [
      { id: "devsecops", name: "DevSecOps",
        summary: "Security built into every stage of the pipeline instead of being a gate at the end. Automate scanning so problems show up in the pull request, not in production.",
        analogy: "Instead of one inspector at the end of the assembly line, every station checks its own work.",
        why: "Fixing a vulnerable dependency in a PR takes minutes; fixing it after a breach takes months.",
        concepts: [
          "SAST: scan your source code (Semgrep, CodeQL).",
          "SCA: scan dependencies for known CVEs (Dependabot, Snyk).",
          "Image scanning: check container images (Trivy, Grype).",
          "IaC scanning: catch insecure Terraform/K8s config (Checkov, tfsec).",
          "Policy as code: enforce rules in the cluster (OPA Gatekeeper, Kyverno)."
        ],
        example: { title: "Fail the build on HIGH/CRITICAL vulns", lang: "yaml", code:
`- name: Scan image for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/me/myapp:\${{ github.sha }}
    severity: CRITICAL,HIGH
    exit-code: "1"        # non-zero = pipeline fails
    ignore-unfixed: true` },
        practice: "Run trivy image on one of your images. Count the HIGH vulnerabilities, then fix some by updating the base image." },
      { id: "secrets", name: "Secrets Management",
        summary: "Passwords, API tokens and keys must never live in Git. Store them in a dedicated secrets manager and inject them at runtime.",
        analogy: "Don't tape your house key to the front door. Keep it in a safe, and hand out copies that expire.",
        why: "Leaked secrets in repos are one of the most common causes of breaches — bots scan GitHub for them within minutes.",
        concepts: [
          "Never commit secrets: use gitleaks or pre-commit hooks to catch them.",
          "Secret stores: HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager.",
          "SOPS / Sealed Secrets: encrypt secrets so only the encrypted file lives in Git.",
          "Rotation: short-lived, automatically rotated credentials limit damage.",
          "Kubernetes Secrets are only base64-encoded, not encrypted — protect them."
        ],
        example: { title: "Detect, fetch, and a reality check", lang: "bash", code:
`# catch secrets before they're committed
gitleaks detect --source . -v

# read a secret at deploy time (AWS)
aws secretsmanager get-secret-value \\
  --secret-id prod/api/db \\
  --query SecretString --output text

# a K8s Secret is encoded, NOT encrypted:
echo 'c2VjcmV0' | base64 -d     # → secret` },
        practice: "Encrypt a Kubernetes Secret manifest with SOPS + age and commit only the encrypted version." }
    ]}
  ]
};
