window.DEVOPS_DEEP = Object.assign(window.DEVOPS_DEEP || {}, {
  "cicd-concepts": {
    intro: "Every CI/CD system — GitHub Actions, GitLab CI, Jenkins, CircleCI — is built from the same parts. Learn the parts once and any tool becomes easy to pick up.",
    flow: ["A trigger (push, PR, tag, schedule) starts a pipeline.", "A runner picks up the job and checks out the code.", "Stages run in order: build, test, scan, package.", "The output artifact (image, binary) is stored with a version.", "Deploy stages promote that same artifact through environments.", "Results and notifications feed back to the developer."],
    parts: [
      { n: "Trigger", r: "What starts the pipeline", d: "Pushes, pull requests, tags, schedules (nightly), manual buttons, or webhooks from other systems. Different triggers usually run different jobs: PRs run tests; merges to main also deploy." },
      { n: "Pipeline, stages, jobs, steps", r: "The structure", d: "A pipeline is the whole run. Stages are phases (build → test → deploy). Jobs are units that run on a runner — jobs in the same stage can run in parallel. Steps are the individual commands inside a job." },
      { n: "Runner / agent", r: "Where jobs execute", d: "A machine or container that runs the job. Hosted runners are fresh and disposable; self-hosted runners give you custom hardware or network access to private systems but must be secured and maintained." },
      { n: "Artifacts & caching", r: "Outputs and speed", d: "Artifacts are outputs passed between jobs or kept for later (test reports, binaries, images). Caches store dependencies (node_modules, ~/.m2) between runs so builds are faster. Build the artifact once and deploy that exact artifact everywhere." },
      { n: "Environments & approvals", r: "Where code goes", d: "dev → staging → production, each with its own config and secrets. Protection rules can require approvals or only allow deploys from main. This is the difference between Continuous Delivery (approval) and Deployment (automatic)." },
      { n: "Deployment strategies", r: "How to release safely", d: "Rolling: replace instances gradually (Kubernetes default). Blue/green: run the new version beside the old, then switch traffic all at once — instant rollback. Canary: send 5–10% of traffic to the new version, watch metrics, then continue. Feature flags: deploy code turned off, enable it later without a deploy." },
      { n: "Secrets & feedback", r: "Safety and visibility", d: "Pipelines inject credentials from a secret store — never from the repo. Status checks on PRs, chat notifications, and dashboards close the loop so failures are seen in minutes." }
    ]
  },
  gha: {
    intro: "GitHub Actions is event-driven: something happens in your repository, GitHub matches it against workflow files, and runs jobs on runners. Here are its moving parts.",
    flow: ["An event happens (push to main, PR opened).", "GitHub finds workflows in .github/workflows whose on: matches.", "Each job is queued and assigned to a runner matching runs-on.", "The runner executes steps in order — shell commands or reusable actions.", "Job results show as checks on the commit/PR; needs: chains jobs together."],
    parts: [
      { n: "Workflow", r: "A YAML file in .github/workflows", d: "Defines when to run (on:), shared settings (env:, permissions:) and a set of jobs. A repo can have many workflows: ci.yml, release.yml, nightly.yml." },
      { n: "Events (on:)", r: "Triggers", d: "push, pull_request, workflow_dispatch (manual button with inputs), schedule (cron), release, and many more. Filters narrow them by branch, tag or changed paths.", x: "on:\n  push:\n    branches: [main]\n    paths: ['src/**']\n  workflow_dispatch:" },
      { n: "Jobs", r: "Parallel units of work", d: "Each job runs on a fresh runner, in parallel by default. needs: creates dependencies; if: makes a job conditional; strategy.matrix runs the same job across versions/OSes. Jobs share data only through artifacts or outputs." },
      { n: "Steps & actions", r: "What a job does", d: "A step is either run: (shell command) or uses: (a reusable action, e.g. actions/checkout@v4). Pin third-party actions to a version or commit SHA — they run with access to your code and tokens." },
      { n: "Runners", r: "Machines that run jobs", d: "GitHub-hosted (ubuntu-latest, windows-latest, macos-latest) are clean VMs per job. Self-hosted runners are your own machines — needed for special hardware or private networks, but never use them on public repos where anyone can open a PR." },
      { n: "Secrets, variables & permissions", r: "Security", d: "Secrets are encrypted and masked in logs (${{ secrets.NAME }}). GITHUB_TOKEN is created per run; restrict it with permissions:. For clouds, use OIDC (id-token: write) to get short-lived credentials instead of storing keys." },
      { n: "Reusable workflows & composite actions", r: "Don't repeat yourself", d: "workflow_call lets one workflow call another — shared pipelines across many repos. Composite actions bundle several steps into one uses: line." }
    ]
  },
  jenkins: {
    intro: "Jenkins is a Java server with a distributed build system. A controller coordinates work, agents execute it, and nearly every feature comes from a plugin.",
    flow: ["A webhook from Git (or polling) notifies the controller of a change.", "The controller reads the Jenkinsfile from the repository.", "It schedules each stage on an agent with a matching label.", "The agent checks out code and runs the steps, streaming logs back.", "Results, artifacts and test reports are stored on the controller; post actions notify the team."],
    parts: [
      { n: "Controller", r: "The brain", d: "Serves the web UI, stores job configs and build history, schedules builds, and manages plugins and credentials. Best practice: run zero builds on the controller itself — only on agents." },
      { n: "Agents (nodes)", r: "The workers", d: "Machines or containers that run builds, connected via SSH or JNLP. Labels (linux, docker, gpu) route stages to the right agent. With the Kubernetes plugin, agents are Pods created per build and destroyed after." },
      { n: "Jobs & pipelines", r: "What gets run", d: "Freestyle jobs are configured by clicking in the UI (avoid for new work). Pipeline jobs read a Jenkinsfile. Multibranch pipelines automatically create a pipeline for every branch and PR in a repo." },
      { n: "Jenkinsfile", r: "Pipeline as code", d: "Declarative syntax: pipeline { agent, stages { stage { steps } }, post }. Supports environment variables, when conditions, parallel stages, parameters and input (manual approval) steps. Stored and reviewed in Git." },
      { n: "Credentials", r: "Secret storage", d: "Stores passwords, SSH keys, tokens and files encrypted on the controller. withCredentials or credentials() inject them into steps and mask them in logs.", x: "environment { DOCKER = credentials('dockerhub') }" },
      { n: "Plugins", r: "Where features come from", d: "Git, Docker, Kubernetes, Slack, Blue Ocean… thousands exist. They're powerful but each is code to update and a potential vulnerability — keep the list small and patched." },
      { n: "Shared libraries", r: "Reuse across pipelines", d: "Groovy code stored in a separate repo and loaded with @Library — lets a platform team give every service the same standardized pipeline steps." }
    ]
  },
  gitops: {
    intro: "Argo CD is a Kubernetes controller that continuously compares two things: what Git says should be running and what is actually running. Its components each handle one part of that job.",
    flow: ["CI builds image myapp:3f9c2a1 and commits the new tag to the config repo.", "Argo CD's repo server fetches the repo and renders manifests (plain YAML, Helm or Kustomize).", "The application controller compares rendered manifests with live cluster state.", "It marks the app OutOfSync and, with auto-sync, applies the difference.", "It reports health (are Pods ready?) and keeps watching — any manual change is reverted."],
    parts: [
      { n: "Config repository", r: "The source of truth", d: "A Git repo holding the desired state for each environment (often apps/<name>/<env>/). Every change is a commit with an author and review — your audit log for free." },
      { n: "Application (CRD)", r: "What to sync, from where, to where", d: "A Kubernetes custom resource that says: source = repo + path + revision; destination = cluster + namespace; syncPolicy = manual or automated (prune, selfHeal). One Application per service per environment." },
      { n: "argocd-repo-server", r: "Renders manifests", d: "Clones repos and turns them into plain manifests by running Helm, Kustomize or reading YAML. Caches results for speed." },
      { n: "argocd-application-controller", r: "The reconciliation loop", d: "Compares desired (from repo-server) with live state (from the Kubernetes API). Computes sync status (Synced/OutOfSync) and health (Healthy/Progressing/Degraded), and applies changes when syncing." },
      { n: "argocd-server (UI & API)", r: "What you look at", d: "Web UI and CLI/API to view apps as a tree of resources, see diffs, trigger syncs and rollbacks. SSO and RBAC control who can do what.", x: "argocd app list\nargocd app diff api-prod\nargocd app sync api-prod" },
      { n: "Sync waves, hooks & app-of-apps", r: "Ordering and scale", d: "Sync waves order resources (namespaces before deployments). Hooks run Jobs before/after sync (migrations). App-of-apps: one parent Application that creates all the others — bootstrapping a whole cluster from one repo." },
      { n: "Image Updater / CI commit", r: "Closing the loop with CI", d: "Either CI commits the new image tag into the config repo, or Argo CD Image Updater watches the registry and does it. Either way, Git stays the single source of truth." }
    ]
  },
  terraform: {
    intro: "Terraform is a core engine plus plugins. The core reads your configuration and state, builds a dependency graph, and asks providers to make API calls to your cloud.",
    flow: ["terraform init downloads providers and configures the state backend.", "terraform plan reads your .tf files, refreshes real resources, and compares them with state.", "It shows a diff: + create, ~ update, - destroy, -/+ replace.", "terraform apply executes the plan in dependency order, in parallel where possible.", "The new state is written back to the backend and the lock is released."],
    parts: [
      { n: "Terraform core", r: "The engine", d: "Parses HCL, builds a graph of resources from their references (a subnet needs a VPC first), computes the plan, and walks the graph during apply. It knows nothing about AWS or Azure itself — that's what providers are for." },
      { n: "Providers", r: "Plugins that talk to APIs", d: "aws, azurerm, google, kubernetes, github, cloudflare… each translates resources into API calls. Pin provider versions in required_providers so upgrades don't surprise you.", x: "terraform providers\nterraform init -upgrade" },
      { n: "Resources & data sources", r: "Things you manage vs things you read", d: "resource creates and manages something (aws_instance, aws_s3_bucket). data reads something that exists elsewhere (latest AMI, an existing VPC) without managing it. References like aws_vpc.main.id create dependencies automatically." },
      { n: "State", r: "Terraform's memory", d: "terraform.tfstate maps your code to real resource IDs. Without it Terraform can't know what it created. Store it remotely (S3 + DynamoDB lock, Terraform Cloud, GCS) so teams share it and two applies can't run at once. It can contain secrets — encrypt and restrict it.", x: "terraform state list\nterraform state show aws_s3_bucket.assets" },
      { n: "Variables, locals & outputs", r: "Inputs, helpers, results", d: "variable = input (from tfvars, env TF_VAR_x, or CLI). locals = computed values to avoid repetition. output = values to print or pass to other configs (e.g. the load balancer DNS name).", x: "terraform apply -var-file=prod.tfvars\nterraform output bucket_name" },
      { n: "Modules", r: "Reusable building blocks", d: "A folder of .tf files with inputs and outputs. Call it many times with different values — a 'vpc' module for every environment. The public registry has well-tested modules (terraform-aws-modules)." },
      { n: "Workspaces & environments", r: "Separating dev/staging/prod", d: "Either separate state per environment via directories (envs/prod, envs/staging — most common and explicit) or terraform workspaces. Never share one state for all environments." }
    ]
  },
  ansible: {
    intro: "Ansible is agentless: nothing to install on servers. A control node reads your inventory and playbooks, connects over SSH, copies small modules to each host, runs them and reports what changed.",
    flow: ["You run ansible-playbook -i inventory playbook.yml.", "Ansible gathers facts about each host (OS, IPs, memory).", "For each task, it sends the module to the hosts in parallel and runs it.", "Modules check current state and only change what's different (idempotency).", "Changed tasks notify handlers, which run once at the end (e.g. restart nginx)."],
    parts: [
      { n: "Control node", r: "Where you run Ansible", d: "Your laptop or a CI runner with Ansible installed. Needs SSH access to the hosts (and Python on them). There's no central server or agent to maintain." },
      { n: "Inventory", r: "Which machines", d: "INI or YAML listing hosts in groups ([web], [db]) with variables per host or group. Dynamic inventories pull hosts straight from AWS/Azure by tags.", x: "[web]\nweb1.example.com\nweb2.example.com\n\n[db]\ndb1.example.com ansible_user=ubuntu" },
      { n: "Modules", r: "Units of work", d: "apt, yum, copy, template, file, service, user, git, docker_container… thousands available. Each one knows how to check the current state and change it only if needed. Prefer modules over shell: — shell isn't idempotent.", x: "ansible web -m ping\nansible web -m apt -a 'name=htop state=present' -b" },
      { n: "Playbooks, plays & tasks", r: "The automation script", d: "A playbook is a list of plays; each play targets hosts and runs tasks in order. Tasks call modules with arguments. become: true runs with sudo." },
      { n: "Variables, facts & templates", r: "Making it dynamic", d: "Variables come from inventory, group_vars/, host_vars/, or the command line. Facts are discovered automatically (ansible_os_family). Jinja2 templates (.j2) generate config files with those values." },
      { n: "Handlers", r: "Run only when something changed", d: "A task can notify a handler; handlers run once at the end of the play, and only if notified — so nginx restarts only when its config actually changed." },
      { n: "Roles & Vault", r: "Reuse and secrets", d: "Roles package tasks, handlers, templates and defaults in a standard folder layout — share them via Ansible Galaxy. ansible-vault encrypts files with secrets so they can live in Git.", x: "ansible-galaxy init nginx\nansible-vault encrypt group_vars/prod/secrets.yml" }
    ]
  },
  aws: {
    intro: "Most AWS architectures are built from the same handful of services arranged in layers: a global footprint, a private network, compute, storage and data, and managed platforms on top.",
    flow: ["You pick a Region (e.g. eu-west-1) made of several Availability Zones.", "You create a VPC with public and private subnets across 2–3 AZs.", "An Application Load Balancer in public subnets receives traffic.", "It forwards to app servers or containers (EC2, ECS, EKS) in private subnets.", "The app reads/writes RDS databases and S3 buckets; CloudWatch collects metrics and logs."],
    parts: [
      { n: "Regions & Availability Zones", r: "The physical layout", d: "A Region is a geographic area; each has 3+ AZs — separate data centers with independent power and networking. Spreading across AZs is how you survive a data-center failure." },
      { n: "VPC", r: "Your private network", d: "A VPC has a CIDR range split into subnets. Public subnets route to an Internet Gateway; private subnets reach out via a NAT Gateway but can't be reached from the internet. Security groups are stateful firewalls on each resource; NACLs are stateless subnet-level rules.", x: "aws ec2 describe-vpcs\naws ec2 describe-security-groups --group-ids sg-123" },
      { n: "EC2 & Auto Scaling", r: "Virtual machines", d: "Instances of a chosen type (CPU/RAM), booted from an AMI image. Auto Scaling Groups keep a desired count, replace unhealthy instances, and scale with load. Launch Templates define what each instance looks like." },
      { n: "Elastic Load Balancing", r: "Traffic distribution", d: "ALB (HTTP/HTTPS, path and host routing) and NLB (TCP/UDP, extreme performance). Health checks send traffic only to healthy targets; ACM provides free TLS certificates for them." },
      { n: "S3", r: "Object storage", d: "Store any file as an object in a bucket, with 11 nines of durability. Used for backups, static websites, logs, data lakes, Terraform state. Block public access by default; use versioning and lifecycle rules.", x: "aws s3 ls s3://myapp-assets\naws s3 sync ./dist s3://myapp-assets" },
      { n: "RDS & DynamoDB", r: "Managed databases", d: "RDS runs Postgres/MySQL with backups, patching and Multi-AZ failover handled for you. DynamoDB is a serverless key-value/NoSQL database that scales automatically." },
      { n: "ECS, EKS & Lambda", r: "Running containers and functions", d: "ECS is AWS's simpler container orchestrator (with Fargate = no servers to manage). EKS is managed Kubernetes. Lambda runs functions on events without servers, billed per millisecond." },
      { n: "CloudWatch & Route 53", r: "Monitoring and DNS", d: "CloudWatch collects metrics, logs and alarms for every service. Route 53 is AWS's DNS with health checks and routing policies (failover, latency-based, weighted)." }
    ]
  },
  iam: {
    intro: "Every AWS API call is checked by IAM: who is calling (identity), what they want to do (action), on what (resource) — and whether any policy allows it.",
    flow: ["A request arrives, signed with credentials (user keys or temporary role credentials).", "AWS identifies the principal.", "It gathers all applicable policies: identity, resource, permission boundaries, SCPs.", "An explicit Deny anywhere wins. Otherwise, at least one Allow is needed.", "No Allow found = implicit deny. Everything is denied by default."],
    parts: [
      { n: "Users", r: "Long-term identities for people", d: "Have passwords and/or access keys. Modern practice: humans log in through IAM Identity Center (SSO) instead of individual IAM users, and nobody uses the root account day to day." },
      { n: "Groups", r: "Collections of users", d: "Attach policies to groups (developers, admins) instead of individual users so permissions stay consistent and easy to audit." },
      { n: "Roles", r: "Identities you assume temporarily", d: "No permanent credentials — whoever assumes a role gets short-lived credentials via STS. Used by EC2 instances, Lambda functions, Kubernetes pods (IRSA), CI pipelines via OIDC, and other AWS accounts. Prefer roles everywhere.", x: "aws sts assume-role --role-arn arn:aws:iam::123:role/deploy --role-session-name me" },
      { n: "Policies", r: "JSON permission documents", d: "Statements with Effect (Allow/Deny), Action (s3:GetObject), Resource (an ARN), and optional Condition (only from this IP, only with MFA, only for tagged resources). Managed policies are reusable; inline policies are attached to one identity." },
      { n: "Trust policies", r: "Who may assume a role", d: "A role has two policies: the permission policy (what it can do) and the trust policy (who can become it). For GitHub OIDC, the trust policy says 'tokens from token.actions.githubusercontent.com for repo me/app on branch main'." },
      { n: "Resource policies & SCPs", r: "Guardrails from the other side", d: "Resource policies sit on the resource (S3 bucket policy, KMS key policy) and can grant cross-account access. Service Control Policies in AWS Organizations cap what any identity in an account can do — e.g. 'no one may disable CloudTrail'." },
      { n: "Auditing", r: "Prove least privilege", d: "CloudTrail logs every API call. IAM Access Analyzer finds resources shared externally and can generate least-privilege policies from actual usage. The policy simulator tests a policy before you deploy it." }
    ]
  },
  prometheus: {
    intro: "Prometheus is a small ecosystem: a server that scrapes and stores metrics, exporters that expose them, and Alertmanager that handles alerts. It pulls data rather than waiting for it to be pushed.",
    flow: ["Your app and exporters expose metrics as text at /metrics.", "Service discovery tells Prometheus which targets exist (e.g. all Kubernetes Pods with a label).", "Every 15–30s, Prometheus scrapes each target and stores samples in its time-series database.", "Recording and alerting rules are evaluated on a schedule.", "Firing alerts go to Alertmanager, which groups, silences and routes them to Slack/PagerDuty.", "Grafana queries Prometheus with PromQL to draw dashboards."],
    parts: [
      { n: "Prometheus server", r: "Scraper + database + query engine", d: "Pulls metrics from targets, stores them in a local time-series database (TSDB) on disk, evaluates rules, and answers PromQL queries via an HTTP API and a simple UI on port 9090." },
      { n: "Exporters", r: "Translate systems into metrics", d: "node_exporter (CPU, memory, disk of a machine), kube-state-metrics (Kubernetes objects), blackbox_exporter (probe URLs), postgres_exporter, and hundreds more. Each exposes a /metrics endpoint." },
      { n: "Client libraries & instrumentation", r: "Metrics from your own code", d: "Libraries for Go, Python, Java, Node let you define counters, gauges and histograms in your app — e.g. http_requests_total{method, status}. Keep label values bounded: never put user IDs in labels (cardinality explosion).", x: "# exposed at /metrics\nhttp_requests_total{method=\"GET\",status=\"200\"} 1027" },
      { n: "Service discovery", r: "Finding what to scrape", d: "Static lists, or automatic discovery from Kubernetes, EC2, Consul and others. In Kubernetes, the Prometheus Operator uses ServiceMonitor objects to declare what to scrape." },
      { n: "Metric types", r: "How to model data", d: "Counter: only goes up (requests, errors) — query with rate(). Gauge: goes up and down (memory, queue length). Histogram: buckets of observations (latency) — query percentiles with histogram_quantile. Summary: client-side percentiles." },
      { n: "PromQL", r: "The query language", d: "Select series by name and labels, apply functions over time ranges (rate, increase, avg_over_time), aggregate (sum by (service)). Most dashboards are a handful of rate() and histogram_quantile() queries." },
      { n: "Rules & Alertmanager", r: "From data to action", d: "Alerting rules define conditions (error ratio > 5% for 10m). Alertmanager deduplicates, groups related alerts, applies silences during maintenance, and routes to the right team. Alert on symptoms users feel, not every cause.", x: "- alert: HighErrorRate\n  expr: job:errors:ratio5m > 0.05\n  for: 10m\n  labels: { severity: page }" },
      { n: "Long-term storage", r: "Beyond local disk", d: "A single Prometheus keeps data for weeks. Thanos, Cortex/Mimir or VictoriaMetrics add long retention, high availability and a global view across clusters." }
    ]
  },
  grafana: {
    intro: "Grafana doesn't store your metrics or logs — it connects to data sources and visualizes them. Its parts are about connecting, querying, displaying and alerting.",
    flow: ["You add data sources (Prometheus, Loki, CloudWatch, Postgres…).", "A dashboard is made of panels; each panel runs a query against a data source.", "Variables at the top fill parts of every query (namespace, service).", "Grafana renders results as graphs, stats, tables, heatmaps.", "Alert rules evaluate queries on a schedule and send notifications via contact points."],
    parts: [
      { n: "Data sources", r: "Connections to your data", d: "Each data source has a type, URL and credentials. One dashboard can mix sources — metrics from Prometheus beside logs from Loki and traces from Tempo." },
      { n: "Dashboards", r: "A page of panels", d: "Organized in folders with permissions. Stored as JSON — export them and keep them in Git (or provision them from files) so they're versioned and reproducible." },
      { n: "Panels & visualizations", r: "One chart each", d: "Time series, stat, gauge, bar, table, heatmap, logs. Configure units (seconds, bytes, %), thresholds (green/amber/red), and legends. A good panel answers one question." },
      { n: "Variables (templating)", r: "One dashboard for every environment", d: "Dropdowns like $namespace or $service populated by a query; used inside panel queries. One dashboard then works for every service instead of copy-pasting.", x: "label_values(kube_pod_info, namespace)\nsum(rate(http_requests_total{namespace=\"$namespace\"}[5m]))" },
      { n: "Explore", r: "Ad-hoc investigation", d: "A query scratchpad for digging during incidents — jump from a spike in a metric to the logs of the same time window and labels." },
      { n: "Alerting", r: "Rules, contact points, policies", d: "Alert rules run queries and fire when conditions hold. Contact points are destinations (Slack, email, PagerDuty). Notification policies route alerts by labels and set timing." },
      { n: "Provisioning", r: "Grafana as code", d: "Data sources and dashboards can be defined in YAML/JSON files or managed with Terraform, so a fresh Grafana comes up fully configured." }
    ]
  },
  logging: {
    intro: "A logging pipeline has four stages: produce, collect, store/index, and query. ELK and Loki are two different answers to the storage stage.",
    flow: ["Your app writes structured logs to stdout (in containers) or files.", "An agent on each node (Fluent Bit, Promtail, Vector) tails them and adds metadata like pod, namespace, node.", "Logs are optionally parsed, filtered and enriched.", "They're shipped to storage: Elasticsearch (full-text index) or Loki (label index + compressed chunks).", "You search them in Kibana or Grafana, and alert on patterns."],
    parts: [
      { n: "Log producers", r: "Your apps", d: "Write one JSON object per line with consistent fields: timestamp, level, service, message, trace_id. In containers, log to stdout/stderr — the platform collects it. Never log secrets or personal data." },
      { n: "Collectors / shippers", r: "Agents on each node", d: "Fluent Bit (lightweight, very common in Kubernetes), Fluentd, Vector, Promtail/Grafana Alloy. Usually a DaemonSet — one per node — reading /var/log/containers and adding Kubernetes labels." },
      { n: "Processing (Logstash / pipelines)", r: "Parse and enrich", d: "Turn raw text into fields (grok patterns), drop noisy debug logs, mask sensitive data, add geo-IP. Logstash is ELK's processor; Fluent Bit and Vector can do much of this at the edge." },
      { n: "Elasticsearch", r: "ELK storage · full-text search", d: "Indexes every word of every log — very powerful search, but storage- and memory-hungry. Data is split into indices (often per day) with lifecycle policies to delete or archive old ones." },
      { n: "Kibana", r: "ELK UI", d: "Search with KQL (service:api and level:error), build visualizations and dashboards over log data." },
      { n: "Loki", r: "Grafana's log store · index labels only", d: "Indexes only labels (service, namespace, level), stores log text compressed in object storage like S3. Much cheaper at scale; you filter text at query time with LogQL. Pairs naturally with Prometheus labels.", x: "{namespace=\"prod\", app=\"api\"} |= \"timeout\"\nsum by (app) (rate({namespace=\"prod\"} | json | level=\"error\" [5m]))" },
      { n: "Correlation & tracing", r: "Follow one request everywhere", d: "Generate a trace_id at the edge and pass it through every service (OpenTelemetry does this). Then one ID connects logs, metrics exemplars and distributed traces (Jaeger/Tempo)." }
    ]
  },
  devsecops: {
    intro: "DevSecOps places an automated security check at each stage of the delivery pipeline — from the developer's editor to the running cluster — so issues are caught where they're cheapest to fix.",
    flow: ["Code: pre-commit hooks catch secrets; IDE plugins flag insecure code.", "Pull request: SAST scans code, SCA scans dependencies, IaC scanners check Terraform/K8s.", "Build: the container image is scanned and an SBOM is generated; the image is signed.", "Deploy: admission policies reject unsigned images or insecure Pod settings.", "Runtime: tools watch for suspicious behaviour; findings feed back to the backlog."],
    parts: [
      { n: "SAST — static analysis", r: "Scan your own source code", d: "Finds bugs like SQL injection, XSS, hard-coded credentials and unsafe functions without running the code. Tools: Semgrep, CodeQL, SonarQube. Run on every PR and report inline." },
      { n: "SCA — dependency scanning", r: "Scan the code you didn't write", d: "Most of your app is open-source libraries. SCA matches your lockfiles against vulnerability databases (CVE) and suggests upgrades. Tools: Dependabot, Renovate, Snyk, OWASP Dependency-Check.", x: "npm audit\npip-audit" },
      { n: "Container image scanning", r: "Check OS packages and libs in images", d: "Trivy or Grype scan image layers for vulnerable packages. Use minimal base images (distroless, alpine) — fewer packages, fewer CVEs. Fail builds only on fixable HIGH/CRITICAL to avoid alert fatigue.", x: "trivy image --severity HIGH,CRITICAL myapp:1.4.0" },
      { n: "IaC scanning", r: "Catch misconfigurations before they exist", d: "Checkov, tfsec/Trivy config and kube-score check Terraform and Kubernetes YAML for public S3 buckets, open security groups, containers running as root, missing resource limits.", x: "checkov -d ./terraform\ntrivy config ./k8s" },
      { n: "Supply-chain security", r: "Prove what you ship", d: "SBOMs (Syft) list every component in an image. Signing (Sigstore cosign) proves an image came from your pipeline. SLSA is a framework describing how trustworthy your build process is.", x: "syft myapp:1.4.0 -o spdx-json > sbom.json\ncosign sign ghcr.io/me/myapp@sha256:..." },
      { n: "Policy as code", r: "Enforce rules automatically", d: "OPA Gatekeeper or Kyverno run as Kubernetes admission controllers: reject Pods that run as root, use :latest, or come from untrusted registries. Conftest applies the same idea to files in CI." },
      { n: "DAST & runtime security", r: "Test and watch the running app", d: "DAST (OWASP ZAP) attacks your running staging app like a hacker would. Runtime tools (Falco) alert on suspicious behaviour like a shell spawning inside a production container." }
    ]
  },
  secrets: {
    intro: "Secrets management is a lifecycle: create, store, distribute, use, rotate and revoke. Each component below handles one part, so secrets never sit in plain text in Git, images or logs.",
    flow: ["A secret is created in a central store (Vault, AWS Secrets Manager).", "Access policies define which apps/roles may read it.", "At deploy or runtime, the app authenticates with its identity (IAM role, Kubernetes service account).", "It receives the secret — ideally short-lived — via env, file, or API.", "The secret is rotated automatically; old versions are revoked; every access is audited."],
    parts: [
      { n: "Secret stores", r: "The safe", d: "HashiCorp Vault (self-hosted, very flexible), AWS Secrets Manager / SSM Parameter Store, GCP Secret Manager, Azure Key Vault. They encrypt at rest, control access with policies, and log every read." },
      { n: "Identity-based access", r: "No secret to get the secret", d: "Apps authenticate with who they are — an IAM role, a Kubernetes service account, a GitHub OIDC token — instead of a stored password. This removes the 'secret zero' problem." },
      { n: "Dynamic secrets", r: "Credentials created on demand", d: "Vault can generate a unique database user or cloud credentials per request that expire in an hour. A leaked credential is useless soon after, and each one is traceable to a single app.", x: "vault read database/creds/api-readonly" },
      { n: "Kubernetes Secrets", r: "Built-in, but limited", d: "Stored base64-encoded (not encrypted) in etcd by default. Enable encryption at rest, restrict RBAC access, and prefer mounting as files over env vars. Never commit Secret YAML in plain form.", x: "kubectl create secret generic db --from-literal=password=s3cr3t\nkubectl get secret db -o yaml" },
      { n: "External Secrets & CSI driver", r: "Bridge the store into Kubernetes", d: "External Secrets Operator syncs values from Vault/AWS into Kubernetes Secrets automatically. The Secrets Store CSI driver mounts them directly as files into Pods." },
      { n: "Encrypted secrets in Git", r: "GitOps-friendly", d: "SOPS encrypts values inside YAML with KMS/age keys; Sealed Secrets encrypts with a key only the cluster controller holds. Git stores ciphertext; decryption happens in the cluster or pipeline.", x: "sops --encrypt --age <pubkey> secret.yaml > secret.enc.yaml" },
      { n: "Detection & rotation", r: "Assume leaks happen", d: "gitleaks/trufflehog in pre-commit and CI catch secrets before they're pushed; GitHub secret scanning catches the rest. If one leaks: revoke it first, rotate, then clean history. Automatic rotation keeps lifetimes short." }
    ]
  }
});
