window.DEVOPS_STUDY = Object.assign(window.DEVOPS_STUDY || {}, {
  services: {
    cheat: [["kubectl get svc,ep -n ns", "Services & endpoints"], ["kubectl get endpointslices -l kubernetes.io/service-name=api", "Which pods back a service"], ["kubectl port-forward svc/api 8080:80", "Reach a service locally"], ["kubectl get ingress -A", "All ingresses"], ["kubectl describe ingress api", "Rules & backend status"], ["kubectl run tmp --rm -it --image=busybox -- sh", "Debug pod for DNS/curl"], ["nslookup api.prod.svc.cluster.local", "In-cluster DNS"], ["kubectl -n ingress-nginx logs deploy/ingress-nginx-controller", "Ingress controller logs"]],
    quiz: [
      { q: "A Service has no endpoints. Most likely cause?", o: ["Wrong port number", "Its selector doesn't match any ready Pod labels", "DNS is down", "Ingress is missing"], a: 1, e: "Endpoints come from Pods whose labels match the selector and pass readiness." },
      { q: "Which Service type is only reachable inside the cluster?", o: ["NodePort", "LoadBalancer", "ClusterIP", "ExternalName"], a: 2, e: "ClusterIP is the default internal virtual IP." },
      { q: "You created an Ingress but nothing happens. Why?", o: ["Ingress needs a ConfigMap", "No Ingress controller is installed", "Services can't be used with Ingress", "Ingress only works on port 22"], a: 1, e: "An Ingress is just rules; a controller (ingress-nginx, Traefik…) implements them." },
      { q: "Full DNS name of Service 'api' in namespace 'prod'?", o: ["api.prod", "api.prod.svc.cluster.local", "prod.api.local", "api.cluster"], a: 1, e: "<service>.<namespace>.svc.cluster.local — short 'api' works within the same namespace." }
    ],
    interview: [
      { q: "How does traffic reach a Pod from the internet?", a: "DNS points to a cloud load balancer, which forwards to the Ingress controller (exposed via a LoadBalancer Service). The controller matches host/path rules to a Service, which resolves to ready Pod IPs via EndpointSlices, and kube-proxy/CNI rules deliver the packets to a Pod." },
      { q: "ClusterIP vs NodePort vs LoadBalancer?", a: "ClusterIP: internal virtual IP only. NodePort: opens a port on every node forwarding to the Service. LoadBalancer: provisions an external cloud load balancer pointing at the nodes — builds on NodePort/ClusterIP." },
      { q: "What is a headless Service?", a: "A Service with clusterIP: None. DNS returns the individual Pod IPs instead of a virtual IP — used by StatefulSets so clients can address specific Pods like db-0.db." }
    ],
    trouble: [
      { t: "Service returns connection refused", s: "Other Pods get 'connection refused' calling http://api.", steps: ["kubectl get endpointslices for the service — any addresses?", "Compare the Service selector with Pod labels (kubectl get pods --show-labels).", "Check targetPort matches the containerPort the app listens on.", "kubectl exec into a Pod and curl localhost:<port>."], cause: "Typically targetPort mismatch (Service sends to 8080, app listens on 3000) or the app listens on 127.0.0.1 inside the container.", fix: "Set targetPort to the real container port and make the app bind 0.0.0.0." }
    ]
  },
  helm: {
    cheat: [["helm repo add name url && helm repo update", "Add a chart repo"], ["helm search repo nginx", "Find charts"], ["helm install rel chart -f values.yaml -n ns", "Install"], ["helm upgrade --install rel chart", "Install or upgrade"], ["helm list -A", "Releases everywhere"], ["helm history rel", "Revisions"], ["helm rollback rel 3", "Roll back to revision 3"], ["helm template rel chart", "Render locally"], ["helm show values chart", "Default values"], ["helm get values rel", "Values used by a release"], ["helm uninstall rel", "Remove"], ["helm lint ./chart", "Validate a chart"]],
    quiz: [
      { q: "Which command installs OR upgrades in one go?", o: ["helm install --force", "helm upgrade --install", "helm apply", "helm deploy"], a: 1, e: "Idempotent — ideal for CI pipelines." },
      { q: "Where does Helm 3 store release history?", o: ["On your laptop", "In Secrets in the release's namespace", "In etcd directly via Tiller", "In the chart repo"], a: 1, e: "Each revision is a Secret, enabling helm history and rollback." },
      { q: "How do you see the YAML a chart will produce without installing?", o: ["helm show", "helm template", "helm get", "helm status"], a: 1, e: "helm template renders manifests locally." },
      { q: "With -f a.yaml -f b.yaml --set x=1, which value wins for x?", o: ["a.yaml", "b.yaml", "--set", "values.yaml default"], a: 2, e: "Precedence: defaults < -f files in order < --set." }
    ],
    interview: [
      { q: "Helm vs Kustomize?", a: "Helm is a templating + packaging tool with releases, versioning, rollback and a chart ecosystem. Kustomize patches plain YAML with overlays and no templates — simpler, built into kubectl. Many teams use Helm for third-party apps and either for their own." },
      { q: "How do you manage a chart across dev, staging and prod?", a: "One chart with a values file per environment (values-dev.yaml, values-prod.yaml) for replicas, resources, image tags and hostnames; secrets from an external store; deployed with helm upgrade --install from CI or via Argo CD." },
      { q: "What are Helm hooks used for?", a: "Running resources at lifecycle points — e.g. a pre-upgrade Job for database migrations, or post-install smoke tests — with annotations controlling order and cleanup." }
    ],
    trouble: [
      { t: "UPGRADE FAILED: another operation is in progress", s: "helm upgrade fails with 'another operation (install/upgrade/rollback) is in progress'.", steps: ["helm history rel -n ns — last revision status 'pending-upgrade'?", "Check whether a previous pipeline was cancelled mid-upgrade."], cause: "A previous upgrade was interrupted, leaving the release stuck in a pending state.", fix: "helm rollback rel <last-good-revision> -n ns, then rerun the upgrade. Use --atomic --timeout in CI so failed upgrades roll back automatically." }
    ]
  },
  mesh: {
    cheat: [["istioctl install --set profile=demo", "Install Istio"], ["kubectl label ns prod istio-injection=enabled", "Enable sidecar injection"], ["istioctl analyze", "Find config problems"], ["istioctl proxy-status", "Are proxies in sync?"], ["istioctl proxy-config routes pod", "Inspect Envoy routes"], ["kubectl get vs,dr,gw -A", "Istio routing objects"], ["istioctl dashboard kiali", "Service graph UI"], ["PeerAuthentication mtls: STRICT", "Enforce mTLS"]],
    quiz: [
      { q: "In Istio, which component pushes config and certificates to proxies?", o: ["Envoy", "istiod", "kube-proxy", "CoreDNS"], a: 1, e: "istiod is the control plane; Envoy is the data plane." },
      { q: "Which resource defines traffic weights for a canary?", o: ["DestinationRule", "VirtualService", "Gateway", "PeerAuthentication"], a: 1, e: "VirtualService routes and weights; DestinationRule defines the subsets." },
      { q: "What does mTLS provide between services?", o: ["Compression", "Encryption plus mutual identity verification", "Caching", "Load balancing only"], a: 1, e: "Both sides present certificates, so each knows who it's talking to." },
      { q: "A main downside of a service mesh is…", o: ["No encryption", "Added complexity, latency and resource use", "It requires VMs", "No metrics"], a: 1, e: "Weigh it against your number of services and needs." }
    ],
    interview: [
      { q: "What problems does a service mesh solve?", a: "Uniform mTLS and service identity, traffic control (canaries, retries, timeouts, circuit breaking, fault injection) and consistent telemetry across all services — without changing application code." },
      { q: "Sidecar vs ambient mode?", a: "Sidecar mode injects an Envoy into every Pod — full L7 features per Pod but more resource use and restarts for upgrades. Ambient mode uses a per-node ztunnel for L4/mTLS and optional waypoint proxies for L7 — lighter and simpler to operate." },
      { q: "How would you do a canary with Istio?", a: "Deploy v2 with a version label, define subsets in a DestinationRule, then shift weights in a VirtualService (e.g. 95/5 → 50/50 → 0/100) while watching error rate and latency, ideally automated with Flagger or Argo Rollouts." }
    ],
    trouble: [
      { t: "503s after enabling STRICT mTLS", s: "Calls from one service suddenly fail with 503 'upstream connect error'.", steps: ["Is the calling Pod's namespace injected? Check for the istio-proxy container.", "istioctl analyze -n ns", "Check for DestinationRules with conflicting TLS settings."], cause: "A client without a sidecar sends plain text to a server that now requires mTLS.", fix: "Inject sidecars into the client namespace (or use PERMISSIVE during migration), then switch to STRICT once all workloads are in the mesh." }
    ]
  },
  "cicd-concepts": {
    cheat: [["CI", "Build + test every push"], ["Continuous Delivery", "Always releasable, manual prod gate"], ["Continuous Deployment", "Auto to prod"], ["Build once, deploy many", "Promote the same artifact"], ["Rolling", "Replace instances gradually"], ["Blue/green", "Switch traffic between two environments"], ["Canary", "Small % first, then all"], ["Feature flag", "Deploy dark, release by toggle"], ["Pipeline < 10 min", "Fast feedback target"], ["Fail fast", "Cheap checks (lint) first"]],
    quiz: [
      { q: "Which strategy lets you roll back instantly by switching traffic back?", o: ["Rolling", "Blue/green", "Recreate", "Big bang"], a: 1, e: "The old (blue) environment stays running until you're confident." },
      { q: "'Build once, deploy many' means…", o: ["Build separately for each environment", "The same artifact is promoted through all environments", "Deploy once a year", "Only one environment"], a: 1, e: "It guarantees prod runs exactly what was tested." },
      { q: "Canary deployment means…", o: ["Testing on birds", "Releasing to a small subset of traffic first", "Deploying at night", "Manual approval"], a: 1, e: "Watch metrics on a small slice before going to 100%." },
      { q: "Why order pipeline stages as lint → unit tests → integration → deploy?", o: ["Alphabetical", "Fast, cheap checks fail first, saving time", "Required by Git", "Random"], a: 1, e: "Fail fast — don't spend 20 minutes on integration tests for a typo." }
    ],
    interview: [
      { q: "Design a CI/CD pipeline for a containerized web service.", a: "On PR: lint, unit tests, SAST and dependency scan, build image, run integration tests. On merge to main: build and tag the image with the git SHA, scan it, push to the registry, deploy to staging (Helm/Argo), run smoke tests, then promote the same image to production with a canary or manual approval, monitoring SLOs and with automatic rollback." },
      { q: "How do you keep pipelines fast?", a: "Cache dependencies and Docker layers, run jobs in parallel, run only affected tests in monorepos, fail fast with cheap checks first, use appropriately sized runners, and move slow end-to-end suites to nightly or post-merge." },
      { q: "What are feature flags and why use them?", a: "Runtime toggles that enable code paths without a deploy. They decouple deploy from release, enable trunk-based development, gradual rollouts, A/B tests and instant kill switches." }
    ],
    trouble: [
      { t: "Flaky tests block every merge", s: "The pipeline fails randomly and people just hit 'retry'.", steps: ["Track failure rate per test over the last N runs.", "Check for timing dependencies, shared state, network calls, test order.", "Run the suspect test in a loop locally."], cause: "Non-deterministic tests (sleeps, shared databases, external services, order dependence) erode trust in CI.", fix: "Quarantine flaky tests, fix them with proper waits/mocks/isolated data, and track flakiness as a metric. Never normalize blind retries." }
    ]
  },
  gha: {
    cheat: [["on: [push, pull_request]", "Triggers"], ["workflow_dispatch:", "Manual run button"], ["runs-on: ubuntu-latest", "Runner"], ["uses: actions/checkout@v4", "Check out code"], ["needs: [test]", "Job dependency"], ["if: github.ref == 'refs/heads/main'", "Condition"], ["strategy: matrix: node: [18, 20]", "Matrix build"], ["${{ secrets.NAME }}", "Use a secret"], ["permissions: id-token: write", "Enable OIDC"], ["actions/cache@v4", "Cache dependencies"], ["actions/upload-artifact@v4", "Save outputs"], ["gh run watch / gh run rerun", "CLI control"]],
    quiz: [
      { q: "Where must workflow files live?", o: ["/workflows", ".github/workflows/", ".ci/", "root folder"], a: 1, e: "GitHub only reads YAML files in .github/workflows." },
      { q: "How do you make job B wait for job A?", o: ["after: A", "needs: A", "depends: A", "order: 2"], a: 1, e: "Jobs run in parallel unless linked with needs." },
      { q: "Best way to authenticate to AWS from Actions?", o: ["Store access keys as secrets", "OIDC with a role to assume", "Hard-code keys", "Use a personal password"], a: 1, e: "OIDC gives short-lived credentials — nothing long-lived to leak." },
      { q: "Why pin third-party actions to a version or SHA?", o: ["Faster runs", "Prevent unexpected or malicious changes", "Required syntax", "Lower cost"], a: 1, e: "Actions run with access to your code and tokens." }
    ],
    interview: [
      { q: "How do you secure GitHub Actions?", a: "Least-privilege permissions on GITHUB_TOKEN, OIDC instead of static cloud keys, pin actions to commit SHAs, use environments with required reviewers for prod, avoid running untrusted PR code with secrets (careful with pull_request_target), and don't use self-hosted runners on public repos." },
      { q: "How do you share pipeline logic across many repos?", a: "Reusable workflows (on: workflow_call) in a central repo, composite actions for shared step sequences, and organization-level templates and secrets." },
      { q: "Matrix builds — when?", a: "To test across multiple versions or platforms (Node 18/20/22, ubuntu/windows) in parallel with one job definition." }
    ],
    trouble: [
      { t: "Workflow doesn't run on push", s: "You pushed to a branch but no workflow appears in the Actions tab.", steps: ["Is the file under .github/workflows with .yml/.yaml?", "Check on: filters — branches/paths may exclude your push.", "Is the YAML valid? (Actions tab shows parse errors.)", "Are Actions enabled for the repo/org?"], cause: "Usually branch or path filters that don't match, or a YAML syntax error.", fix: "Fix the filters/YAML, add workflow_dispatch to trigger manually for testing." }
    ]
  },
  gitlab: {
    cheat: [["stages: [build, test, deploy]", "Order of stages"], ["image: node:20", "Job container"], ["script: [...]", "Commands to run"], ["rules: - if: $CI_COMMIT_BRANCH == 'main'", "When a job runs"], ["needs: [build]", "DAG — start early"], ["artifacts: paths: [dist/]", "Pass outputs"], ["cache: key: files: [package-lock.json]", "Cache by lockfile"], ["when: manual", "Manual gate"], ["environment: production", "Track deployments"], ["include: - template: …", "Reuse config"], ["$CI_COMMIT_SHORT_SHA / $CI_REGISTRY_IMAGE", "Useful built-in vars"]],
    quiz: [
      { q: "Jobs in the same stage…", o: ["Run one after another", "Run in parallel", "Never run", "Share a container"], a: 1, e: "Stages run in order; jobs inside a stage run in parallel." },
      { q: "What lets a job start before the whole previous stage finishes?", o: ["rules", "needs", "only", "cache"], a: 1, e: "needs builds a DAG of job dependencies." },
      { q: "artifacts vs cache?", o: ["Same thing", "Artifacts pass job outputs; cache speeds up dependency installs", "Cache is for secrets", "Artifacts are only for Docker"], a: 1, e: "Don't rely on cache for correctness — it may be missing." },
      { q: "Which executor runs each job as a Kubernetes Pod?", o: ["shell", "docker", "kubernetes", "ssh"], a: 2, e: "The kubernetes executor creates a Pod per job." }
    ],
    interview: [
      { q: "GitLab CI vs GitHub Actions?", a: "Both are YAML pipelines in the repo. GitLab uses one .gitlab-ci.yml with stages, has built-in registry, environments and security scanning, and is popular self-hosted. GitHub Actions uses many workflow files triggered by events and a large marketplace of reusable actions." },
      { q: "How do you protect production deploys in GitLab?", a: "Protected branches and protected environments, deploy jobs with when: manual and allowed approvers, protected and masked CI/CD variables available only on protected refs, and audit via the environment's deployment history." },
      { q: "How do you speed up GitLab pipelines?", a: "needs for DAG execution, caching keyed by lockfiles, smaller images, parallel/matrix jobs, rules:changes to skip unaffected jobs, and interruptible: true to cancel redundant pipelines." }
    ],
    trouble: [
      { t: "Job stuck: 'waiting for a runner'", s: "Pipeline jobs sit in pending with 'This job is stuck because you don't have any active runners that can run this job'.", steps: ["Check job tags vs runner tags.", "Settings → CI/CD → Runners: are any online for this project?", "Are shared runners enabled?", "Is the runner set to run untagged jobs?"], cause: "No available runner matches the job's tags (or no runner is registered/online).", fix: "Fix tags, enable shared runners, or register/restart a project runner." }
    ]
  },
  jenkins: {
    cheat: [["pipeline { agent any … }", "Declarative pipeline"], ["stage('X') { steps { sh '…' } }", "A stage"], ["when { branch 'main' }", "Conditional stage"], ["parallel { … }", "Parallel stages"], ["post { always/failure { … } }", "After actions"], ["environment { X = credentials('id') }", "Inject credentials"], ["input 'Deploy?'", "Manual approval"], ["parameters { string(name: 'ENV') }", "Build parameters"], ["@Library('shared') _", "Shared library"], ["docker run jenkins/jenkins:lts", "Run Jenkins locally"]],
    quiz: [
      { q: "Where should builds run in a healthy Jenkins setup?", o: ["On the controller", "On agents", "On developers' laptops", "In the browser"], a: 1, e: "Keep the controller for coordination; run builds on agents for security and scale." },
      { q: "A Jenkinsfile is…", o: ["A plugin", "Pipeline-as-code stored in the repo", "A log file", "A credentials store"], a: 1, e: "It's versioned and reviewed with your code." },
      { q: "Which pipeline creates jobs for every branch and PR automatically?", o: ["Freestyle", "Multibranch pipeline", "Matrix", "Folder"], a: 1, e: "It scans the repo and builds each branch/PR with its Jenkinsfile." },
      { q: "Biggest operational burden of Jenkins?", o: ["No UI", "Maintaining and securing the server and plugins", "No Git support", "No parallelism"], a: 1, e: "Self-hosting means patching Jenkins and all plugins regularly." }
    ],
    interview: [
      { q: "Declarative vs scripted pipeline?", a: "Declarative uses a structured, opinionated syntax (pipeline/stages/steps/post) that's easier to read and validate. Scripted is full Groovy code — more flexible, but harder to maintain. Prefer declarative, using script {} blocks only when needed." },
      { q: "How do you scale Jenkins?", a: "Use ephemeral agents (Kubernetes plugin or cloud agents) created per build, keep the controller lean, use shared libraries for reuse, configuration as code (JCasC) for reproducible setup, and back up JENKINS_HOME." },
      { q: "Why do teams migrate away from Jenkins?", a: "Server and plugin maintenance, security patching, Groovy complexity and scaling effort — hosted, YAML-based CI (GitHub Actions, GitLab CI) removes much of that operational load." }
    ],
    trouble: [
      { t: "Builds queued forever", s: "Jobs show 'Waiting for next available executor'.", steps: ["Manage Jenkins → Nodes: are agents online?", "Do the stage's agent labels match any node?", "Are all executors busy with hung builds?", "Check cloud/Kubernetes agent provisioning logs."], cause: "No online agent with the required label, or executors are occupied by stuck builds.", fix: "Bring agents online or fix labels, abort hung builds, add timeouts (options { timeout(time: 30, unit: 'MINUTES') }), and use ephemeral agents." }
    ]
  },
  gitops: {
    cheat: [["argocd login host", "Log in"], ["argocd app list", "All applications"], ["argocd app get api", "Sync & health status"], ["argocd app diff api", "Git vs live diff"], ["argocd app sync api", "Sync now"], ["argocd app history api", "Deployed revisions"], ["argocd app rollback api ID", "Roll back"], ["syncPolicy.automated: {prune, selfHeal}", "Auto-sync & heal"], ["argocd.argoproj.io/sync-wave: '1'", "Ordering annotation"], ["git revert <sha>", "The GitOps rollback"]],
    quiz: [
      { q: "In GitOps, how do you deploy a new version?", o: ["kubectl apply from a laptop", "Merge a change (e.g. image tag) into the config repo", "SSH into nodes", "Restart Argo CD"], a: 1, e: "Git is the source of truth; the agent syncs the cluster." },
      { q: "What does selfHeal: true do?", o: ["Restarts crashed pods", "Reverts manual changes made directly in the cluster", "Fixes bugs in code", "Scales nodes"], a: 1, e: "Drift from Git is detected and corrected automatically." },
      { q: "GitOps uses a ___ model for deployment.", o: ["Push from CI into the cluster", "Pull: an in-cluster agent pulls from Git", "Email", "FTP"], a: 1, e: "No cluster credentials need to live in CI." },
      { q: "OutOfSync in Argo CD means…", o: ["Pods are crashing", "Live state differs from Git", "Git is down", "The cluster is offline"], a: 1, e: "Health (Healthy/Degraded) and Sync (Synced/OutOfSync) are separate." }
    ],
    interview: [
      { q: "What are the principles of GitOps?", a: "Declarative desired state, stored versioned and immutable in Git, pulled automatically by software agents, and continuously reconciled so the live system converges to (and is corrected back to) what's in Git." },
      { q: "How does CI hand off to Argo CD?", a: "CI builds, tests and pushes an image, then updates the image tag in the config repo (commit or PR). Argo CD detects the change and syncs. Alternatively Argo CD Image Updater watches the registry and writes back to Git." },
      { q: "How do you handle secrets in GitOps?", a: "Never commit plain secrets: use Sealed Secrets or SOPS-encrypted files in Git, or External Secrets Operator to pull from Vault/AWS Secrets Manager/Key Vault at runtime." }
    ],
    trouble: [
      { t: "App always shows OutOfSync", s: "Argo CD keeps reporting OutOfSync right after a successful sync.", steps: ["argocd app diff — which fields differ?", "Is an HPA changing replicas, or a mutating webhook adding fields?", "Are defaults being added by the API server?"], cause: "Something else in the cluster legitimately mutates fields (HPA replicas, injected sidecars, defaulted values).", fix: "Remove replicas from Git when using an HPA, or configure ignoreDifferences for those fields." }
    ]
  },
  terraform: {
    cheat: [["terraform init", "Download providers, set backend"], ["terraform fmt -recursive", "Format code"], ["terraform validate", "Check syntax"], ["terraform plan -out tf.plan", "Preview & save plan"], ["terraform apply tf.plan", "Apply exactly that plan"], ["terraform destroy", "Delete everything"], ["terraform state list / show", "Inspect state"], ["terraform import addr id", "Adopt existing resource"], ["terraform state mv a b", "Rename without recreating"], ["terraform output", "Show outputs"], ["terraform apply -target=addr", "Limit scope (sparingly)"], ["terraform force-unlock ID", "Release a stuck lock"]],
    quiz: [
      { q: "What is the Terraform state file for?", o: ["Storing provider binaries", "Mapping your code to real resource IDs", "Logging", "Storing variables"], a: 1, e: "Without state Terraform can't know what it manages." },
      { q: "Why use a remote backend with locking?", o: ["Faster plans", "Teams share state and two applies can't run at once", "Free storage", "Required by AWS"], a: 1, e: "Concurrent applies on local or unlocked state can corrupt it." },
      { q: "-/+ in a plan means…", o: ["Update in place", "Destroy and recreate (replace)", "Import", "No change"], a: 1, e: "Watch for this on databases — it means data loss unless handled." },
      { q: "An S3 bucket was created by hand. How do you bring it under Terraform?", o: ["Delete and recreate", "terraform import (or an import block)", "terraform refresh", "Copy the state file"], a: 1, e: "Write the resource config, then import the existing ID." }
    ],
    interview: [
      { q: "How do you structure Terraform for multiple environments?", a: "Reusable modules for components (network, cluster, database) and a thin root configuration per environment (envs/dev, envs/prod) with its own remote state and tfvars. Pin provider and module versions, run plan in CI on PRs and apply after review." },
      { q: "What is drift and how do you handle it?", a: "Drift is when real infrastructure differs from code/state because of manual changes. Detect it with scheduled terraform plan runs, then either update the code to match or re-apply to revert, and restrict console write access." },
      { q: "count vs for_each?", a: "count creates N copies indexed by number — removing one in the middle shifts indexes and causes recreation. for_each keys instances by map/set values, so adding or removing one item doesn't affect others. Prefer for_each for collections." }
    ],
    trouble: [
      { t: "Error acquiring the state lock", s: "terraform plan fails: 'Error acquiring the state lock — ConditionalCheckFailedException'.", steps: ["Is another plan/apply actually running (teammate, CI)?", "Read the lock info: who and when.", "Check whether a previous CI job was cancelled."], cause: "A lock remains from a running or interrupted Terraform process.", fix: "Wait if it's running. If it's truly stale, terraform force-unlock <LOCK_ID>. Avoid cancelling applies mid-run; serialize applies in CI." }
    ]
  },
  ansible: {
    cheat: [["ansible all -m ping -i inventory", "Test connectivity"], ["ansible web -a 'uptime'", "Ad-hoc command"], ["ansible-playbook site.yml -i inv", "Run a playbook"], ["--check --diff", "Dry run with diffs"], ["--limit web1", "Run on some hosts"], ["--tags nginx", "Run tagged tasks only"], ["-b / become: true", "Use sudo"], ["ansible-inventory --graph", "Show inventory"], ["ansible-vault encrypt file", "Encrypt secrets"], ["ansible-galaxy init role", "Scaffold a role"], ["ansible-lint", "Lint playbooks"]],
    quiz: [
      { q: "What do you need on target servers for Ansible?", o: ["An Ansible agent", "SSH access and Python", "Docker", "Kubernetes"], a: 1, e: "Ansible is agentless." },
      { q: "Idempotent means…", o: ["Runs only once", "Running again produces the same state with no extra changes", "Runs in parallel", "Encrypted"], a: 1, e: "A second run should report changed=0." },
      { q: "Why prefer the apt module over `shell: apt-get install`?", o: ["It's shorter", "Modules are idempotent and report changes accurately", "shell is deprecated", "Faster SSH"], a: 1, e: "shell always reports 'changed' and doesn't check state." },
      { q: "Handlers run…", o: ["Before every task", "Once at the end, only if notified", "On failure only", "Never"], a: 1, e: "Perfect for restarting a service only when its config changed." }
    ],
    interview: [
      { q: "Ansible vs Terraform?", a: "Terraform is declarative provisioning of infrastructure with state (create the VMs, networks, databases). Ansible is mostly procedural configuration management over SSH without state (install and configure software on those machines). They're commonly used together." },
      { q: "How do you manage secrets in Ansible?", a: "Encrypt variable files with ansible-vault (password from a file or CI secret) or look secrets up at runtime from Vault/AWS Secrets Manager with lookup plugins; mark sensitive tasks with no_log: true." },
      { q: "How do you structure a larger Ansible project?", a: "Inventories per environment, group_vars/host_vars, reusable roles (tasks, handlers, templates, defaults), a site.yml that maps groups to roles, tags for partial runs, and ansible-lint plus Molecule tests in CI." }
    ],
    trouble: [
      { t: "UNREACHABLE! Failed to connect via ssh", s: "Playbook fails on some hosts with 'UNREACHABLE! … Permission denied (publickey)'.", steps: ["ssh -i key user@host by hand — does it work?", "Check ansible_user and ansible_ssh_private_key_file in inventory.", "Run with -vvv to see the exact SSH command.", "Check security groups / firewall for port 22."], cause: "Wrong user, key, or network access for those hosts.", fix: "Set the correct ansible_user/key per group, fix authorized_keys, or open SSH access (or use SSM/bastion connection plugins)." }
    ]
  },
  aws: {
    cheat: [["aws configure sso / aws sso login", "Log in via SSO"], ["aws sts get-caller-identity", "Who am I?"], ["aws ec2 describe-instances --query …", "List VMs"], ["aws s3 ls / cp / sync", "Work with buckets"], ["aws logs tail /group --follow", "Stream CloudWatch logs"], ["aws ecs update-service --force-new-deployment", "Redeploy ECS"], ["aws eks update-kubeconfig --name c", "kubectl access to EKS"], ["aws ecr get-login-password | docker login", "Registry login"], ["aws ssm start-session --target i-…", "Shell without SSH"], ["aws secretsmanager get-secret-value", "Read a secret"], ["aws cloudformation deploy", "Deploy a stack"], ["--profile / --region / --output table", "Common flags"]],
    quiz: [
      { q: "Which service is a message queue for decoupling producers and consumers?", o: ["SNS", "SQS", "S3", "Route 53"], a: 1, e: "SQS queues messages; SNS fans out pub/sub notifications." },
      { q: "Public vs private subnet — what makes a subnet public?", o: ["Its name", "A route to an Internet Gateway", "Having EC2 instances", "Being in us-east-1"], a: 1, e: "Private subnets reach out through a NAT Gateway instead." },
      { q: "Run containers without managing servers on AWS?", o: ["EC2", "ECS on Fargate", "EBS", "Glacier"], a: 1, e: "Fargate is serverless compute for ECS (and EKS)." },
      { q: "Which service records every API call for auditing?", o: ["CloudWatch Metrics", "CloudTrail", "X-Ray", "Config"], a: 1, e: "CloudTrail answers 'who did what, when'." },
      { q: "Highly available web app — minimum good practice?", o: ["One big EC2 instance", "Instances in 2+ AZs behind a load balancer", "Two instances in the same AZ", "Use only Lambda@Edge"], a: 1, e: "Multi-AZ survives a data-center failure." }
    ],
    interview: [
      { q: "Design a highly available 3-tier web app on AWS.", a: "Route 53 → CloudFront (+WAF) → ALB in public subnets across 2–3 AZs → app tier on ECS Fargate/EKS or an Auto Scaling Group in private subnets → RDS Multi-AZ (plus read replicas) and ElastiCache in private data subnets; S3 for static assets; NAT Gateways per AZ; Secrets Manager for credentials; CloudWatch alarms and dashboards; everything defined in Terraform/CDK." },
      { q: "Security group vs NACL?", a: "Security groups are stateful, attached to resources (ENIs), allow rules only — return traffic is automatically allowed. NACLs are stateless, attached to subnets, support allow and deny rules, and need explicit rules for return traffic." },
      { q: "How do you reduce AWS costs?", a: "Right-size instances, use Savings Plans/Reserved Instances for steady load and Spot for flexible workloads, autoscale and shut down dev at night, S3 lifecycle policies, delete unattached EBS volumes and idle load balancers, watch NAT Gateway data costs, and tag everything for cost allocation with budgets and alerts." }
    ],
    trouble: [
      { t: "Instances in a private subnet can't reach the internet", s: "yum/apt update times out on EC2 instances in private subnets.", steps: ["Check the subnet's route table: is there 0.0.0.0/0 → NAT Gateway?", "Is the NAT Gateway in a PUBLIC subnet with an Elastic IP?", "Security group outbound rules and NACLs allow 80/443 and ephemeral return ports?"], cause: "Missing or misplaced NAT Gateway route (or NACL blocking return traffic).", fix: "Place a NAT Gateway in a public subnet, add 0.0.0.0/0 → nat-xxx to the private route table, and allow ephemeral ports (1024–65535) in NACLs. Use VPC endpoints for S3/ECR to cut NAT costs." },
      { t: "AccessDenied from an application", s: "The app on ECS gets AccessDenied calling s3:PutObject.", steps: ["Which identity is it using? (task role vs execution role)", "Check the task role policy allows s3:PutObject on the bucket ARN + /*.", "Check the bucket policy and any SCPs or KMS key policy.", "Use CloudTrail to see the denied call and principal."], cause: "Wrong role (execution role instead of task role), resource ARN missing /*, or KMS key permissions missing.", fix: "Grant the task role least-privilege access to arn:aws:s3:::bucket/*, plus kms:GenerateDataKey if the bucket uses a customer key." }
    ]
  }
});
