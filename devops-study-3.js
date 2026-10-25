window.DEVOPS_STUDY = Object.assign(window.DEVOPS_STUDY || {}, {
  azure: {
    cheat: [["az login / az account set -s SUB", "Log in & pick subscription"], ["az group create -n rg -l westeurope", "Resource group"], ["az group delete -n rg --yes", "Delete everything in it"], ["az vm create … / az vm list -o table", "VMs"], ["az aks get-credentials -g rg -n aks", "kubectl access to AKS"], ["az acr login -n reg", "Registry login"], ["az webapp deploy …", "Deploy to App Service"], ["az keyvault secret show --vault-name kv -n s", "Read a secret"], ["az role assignment create …", "Grant RBAC"], ["az deployment group create -f main.bicep", "Deploy Bicep"], ["az monitor log-analytics query …", "Query logs (KQL)"], ["-o table / --query", "Output formatting"]],
    quiz: [
      { q: "Azure's equivalent of an AWS VPC is a…", o: ["Resource group", "Virtual Network (VNet)", "Subscription", "Availability set"], a: 1, e: "VNets with subnets and NSGs ≈ VPCs with subnets and security groups." },
      { q: "Deleting a resource group…", o: ["Only deletes the group label", "Deletes every resource inside it", "Is impossible", "Moves resources to another group"], a: 1, e: "Resource groups are lifecycle containers — great for cleaning up environments." },
      { q: "Best way for an app on Azure to access Key Vault?", o: ["A password in app settings", "A managed identity with an RBAC role", "A shared admin account", "Public access"], a: 1, e: "Managed identities have no secrets to store or rotate." },
      { q: "Which service gives zero-downtime swaps between staging and production for web apps?", o: ["AKS node pools", "App Service deployment slots", "Front Door", "Blob tiers"], a: 1, e: "Deploy to a staging slot, warm it up, then swap." },
      { q: "Azure's global L7 entry point with CDN and WAF is…", o: ["Azure Load Balancer", "Application Gateway", "Front Door", "VPN Gateway"], a: 2, e: "Load Balancer is L4; Application Gateway is regional L7." }
    ],
    interview: [
      { q: "Explain Azure's resource hierarchy.", a: "Entra ID tenant → management groups (for policy/RBAC at scale) → subscriptions (billing and access boundary) → resource groups (lifecycle containers) → resources. RBAC role assignments and Azure Policy can be applied at any level and are inherited downward." },
      { q: "Map core AWS services to Azure.", a: "EC2 → Virtual Machines; Auto Scaling → VM Scale Sets; S3 → Blob Storage; EBS → Managed Disks; VPC → VNet; Security Groups → NSGs; ALB → Application Gateway; CloudFront → Front Door/CDN; Lambda → Functions; EKS → AKS; ECR → ACR; RDS → Azure SQL / Database for PostgreSQL; DynamoDB → Cosmos DB; SQS/SNS → Service Bus/Event Grid; CloudWatch → Azure Monitor; IAM → Entra ID + RBAC; KMS/Secrets Manager → Key Vault; CloudFormation → ARM/Bicep." },
      { q: "Service principal vs managed identity?", a: "A service principal is an app identity in Entra ID with credentials (secret or certificate) you must manage — or federated credentials for OIDC from CI. A managed identity is a service principal whose credentials Azure creates and rotates automatically, tied to a resource (VM, App Service, AKS workload)." }
    ],
    trouble: [
      { t: "AKS can't pull images from ACR", s: "Pods show ImagePullBackOff with '401 Unauthorized' for myacr.azurecr.io.", steps: ["kubectl describe pod — confirm the 401.", "az aks check-acr -g rg -n aks --acr myacr.azurecr.io", "Does the kubelet identity have the AcrPull role on the registry?"], cause: "The cluster's kubelet managed identity was never granted AcrPull on the registry.", fix: "az aks update -g rg -n aks --attach-acr myacr (grants AcrPull), then restart the pods." }
    ]
  },
  iam: {
    cheat: [["aws sts get-caller-identity", "Current identity"], ["aws iam list-attached-role-policies --role-name r", "Role's policies"], ["aws iam simulate-principal-policy …", "Test permissions"], ["aws sts assume-role --role-arn …", "Assume a role"], ["Effect / Action / Resource / Condition", "Policy statement parts"], ["Explicit Deny > Allow > implicit deny", "Evaluation order"], ["aws-actions/configure-aws-credentials (OIDC)", "Keyless CI auth"], ["IAM Access Analyzer", "Find over-sharing, generate policies"]],
    quiz: [
      { q: "If one policy allows an action and another explicitly denies it…", o: ["Allow wins", "Deny wins", "The newest wins", "Random"], a: 1, e: "An explicit deny always overrides any allow." },
      { q: "What should a CI pipeline use to access AWS?", o: ["Root keys", "An IAM user's long-lived access keys", "A role assumed via OIDC", "A shared password"], a: 2, e: "Short-lived credentials, nothing stored to leak." },
      { q: "With no policy attached, an identity can…", o: ["Do everything", "Read only", "Do nothing (implicit deny)", "Only use S3"], a: 2, e: "Everything is denied by default." },
      { q: "A role's trust policy defines…", o: ["What the role can do", "Who can assume the role", "Its password", "Its region"], a: 1, e: "The permission policy defines what it can do." }
    ],
    interview: [
      { q: "Explain least privilege and how you'd implement it.", a: "Grant only the actions and resources required. Start from nothing, scope actions and resource ARNs tightly, add conditions (tags, source VPC, MFA), use roles instead of users, review with Access Analyzer and CloudTrail usage data, and enforce guardrails with SCPs and permission boundaries." },
      { q: "IAM user vs role?", a: "A user is a long-term identity with permanent credentials. A role has no permanent credentials — it's assumed temporarily, returning short-lived STS credentials. Prefer roles for services, CI and cross-account access, and SSO for humans." },
      { q: "How do Pods in EKS get AWS permissions?", a: "IRSA (IAM Roles for Service Accounts) or EKS Pod Identity: a Kubernetes ServiceAccount is mapped to an IAM role, and Pods using it receive temporary credentials — no node-wide permissions or stored keys." }
    ],
    trouble: [
      { t: "GitHub Actions: Not authorized to perform sts:AssumeRoleWithWebIdentity", s: "The configure-aws-credentials step fails.", steps: ["Does the workflow have permissions: id-token: write?", "Does an OIDC identity provider for token.actions.githubusercontent.com exist?", "Does the role's trust policy sub condition match repo:owner/repo:ref:refs/heads/main?"], cause: "Missing id-token permission or a trust-policy condition that doesn't match the repo/branch/environment.", fix: "Add permissions: id-token: write and correct the sub/aud conditions in the role's trust policy." }
    ]
  },
  prometheus: {
    cheat: [["rate(x_total[5m])", "Per-second rate of a counter"], ["increase(x_total[1h])", "Total increase over 1h"], ["sum by (label) (…)", "Aggregate by label"], ["histogram_quantile(0.95, sum by (le) (rate(x_bucket[5m])))", "p95 latency"], ["up == 0", "Targets that are down"], ["topk(5, …)", "Top 5 series"], ["absent(x)", "Alert when a metric disappears"], ["/targets, /alerts, /graph", "Prometheus UI pages"], ["promtool check rules r.yml", "Validate rules"], ["for: 10m", "Condition must hold before firing"]],
    quiz: [
      { q: "Which function do you apply to a counter to graph requests per second?", o: ["avg()", "rate()", "max()", "count()"], a: 1, e: "Counters only increase; rate() gives per-second change and handles resets." },
      { q: "Prometheus collects metrics by…", o: ["Apps pushing to it", "Scraping /metrics endpoints", "Reading log files", "SNMP only"], a: 1, e: "Pull model; Pushgateway exists only for short-lived jobs." },
      { q: "Why not put user IDs as labels?", o: ["Labels must be numbers", "It creates huge cardinality and can crash Prometheus", "It's slower to type", "It's not allowed in PromQL"], a: 1, e: "Every unique label combination is a new time series." },
      { q: "Which metric type is right for memory usage?", o: ["Counter", "Gauge", "Histogram", "Summary"], a: 1, e: "Gauges can go up and down." }
    ],
    interview: [
      { q: "What are the four golden signals?", a: "Latency (how long requests take, separating errors), traffic (demand, e.g. requests/sec), errors (rate of failing requests) and saturation (how full the system is — CPU, memory, queue depth)." },
      { q: "How do you monitor Kubernetes with Prometheus?", a: "kube-prometheus-stack: Prometheus Operator, node-exporter, kube-state-metrics, cAdvisor metrics via kubelet, Alertmanager and Grafana dashboards; ServiceMonitors/PodMonitors declare app scrape targets." },
      { q: "How do you scale Prometheus or keep data long term?", a: "Shard by function/team, use federation or remote_write to Thanos, Mimir/Cortex or VictoriaMetrics for long retention, HA and a global query view; keep cardinality under control with recording rules and relabeling." }
    ],
    trouble: [
      { t: "Target shows DOWN on /targets", s: "Your app's target is red with 'context deadline exceeded' or 'connection refused'.", steps: ["curl the exact URL from the Prometheus pod/host.", "Check the port/path in the ServiceMonitor or scrape config.", "NetworkPolicy or security group blocking Prometheus?", "Is the /metrics endpoint slow (huge output)?"], cause: "Wrong port/path, network blocked, or the endpoint is too slow for scrape_timeout.", fix: "Fix the scrape config/port name, allow traffic from Prometheus, or reduce metric cardinality and raise scrape_timeout." }
    ]
  },
  grafana: {
    cheat: [["Data source", "Connection to Prometheus/Loki/…"], ["$variable", "Template variable in queries"], ["label_values(metric, label)", "Populate a dropdown"], ["$__rate_interval", "Safe interval for rate()"], ["Explore", "Ad-hoc querying"], ["Thresholds", "Color by value"], ["Dashboard JSON / provisioning", "Dashboards as code"], ["Alert rule → contact point → policy", "Alerting chain"], ["Import ID 1860", "Node Exporter Full dashboard"]],
    quiz: [
      { q: "Does Grafana store your metrics?", o: ["Yes, always", "No — it queries data sources", "Only logs", "Only alerts"], a: 1, e: "Grafana visualizes data from Prometheus, Loki, CloudWatch, etc." },
      { q: "How do you make one dashboard work for every namespace?", o: ["Copy it per namespace", "Use a template variable like $namespace", "Use a bigger panel", "Use annotations"], a: 1, e: "Variables substitute values into every query." },
      { q: "Best way to version dashboards?", o: ["Screenshots", "Export JSON / provision from files or Terraform in Git", "Email", "Don't"], a: 1, e: "Dashboards as code are reviewable and reproducible." },
      { q: "In Grafana alerting, where are notifications sent?", o: ["Panels", "Contact points", "Data sources", "Folders"], a: 1, e: "Notification policies route alerts to contact points." }
    ],
    interview: [
      { q: "What makes a good dashboard?", a: "It answers a specific question for a specific audience, shows golden signals at the top, uses consistent units and thresholds, links to drill-down dashboards and logs, uses variables instead of copies, and avoids clutter." },
      { q: "How do you correlate metrics, logs and traces in Grafana?", a: "Use consistent labels across Prometheus and Loki, configure data links and derived fields (trace_id → Tempo), and exemplars on metrics, so you can jump from a latency spike to traces and logs from the same time window." },
      { q: "How do you manage Grafana at scale?", a: "Provision data sources and dashboards from code (files, Terraform or Grafana Operator), use folders with team permissions, SSO, and review dashboard changes in Git." }
    ],
    trouble: [
      { t: "Panel shows 'No data'", s: "A dashboard panel is empty though the service is running.", steps: ["Open the query in Explore — does it return anything?", "Is the selected data source / variable value correct?", "Check the time range and timezone.", "Does the metric name or label exist in Prometheus (/graph)?"], cause: "Wrong variable value, renamed metric/label, wrong data source, or a time range with no data.", fix: "Fix the query/labels, update variables, and add a 'No data' state description to the panel." }
    ]
  },
  logging: {
    cheat: [["{app=\"api\"} |= \"error\"", "LogQL: lines containing error"], ["| json | level=\"error\"", "Parse JSON and filter"], ["rate({app=\"api\"}[5m])", "Log lines per second"], ["service:api and level:error", "Kibana KQL query"], ["kubectl logs -l app=api --tail=100", "Quick K8s logs"], ["stern api", "Tail many pods at once"], ["Fluent Bit DaemonSet", "Node log collector"], ["trace_id field", "Correlate across services"]],
    quiz: [
      { q: "Why log in structured JSON?", o: ["Smaller files", "Fields are searchable and parseable", "Required by Docker", "Faster CPUs"], a: 1, e: "You can filter by level, service, trace_id without regex." },
      { q: "Loki is cheaper than Elasticsearch mainly because…", o: ["It deletes logs", "It indexes only labels, not full text", "It's written in Go", "It has no UI"], a: 1, e: "Text is stored compressed in object storage and filtered at query time." },
      { q: "In Kubernetes, where should apps write logs?", o: ["A file in the container", "stdout/stderr", "A database", "/dev/null"], a: 1, e: "The runtime captures stdout/stderr; collectors ship them." },
      { q: "What connects logs from different services for one request?", o: ["Timestamps only", "A shared trace/correlation ID", "Hostname", "Log level"], a: 1, e: "Propagate it through every hop." }
    ],
    interview: [
      { q: "Design centralized logging for Kubernetes.", a: "Apps log structured JSON to stdout. A Fluent Bit (or Promtail/Alloy/Vector) DaemonSet tails container logs, adds Kubernetes metadata, filters and redacts, then ships to Loki or Elasticsearch with retention policies. Query in Grafana/Kibana, alert on error patterns, and correlate via trace_id." },
      { q: "ELK vs Loki?", a: "ELK indexes full text — powerful search and analytics but expensive in storage and memory. Loki indexes labels only and stores compressed chunks in object storage — far cheaper, pairs with Prometheus labels and Grafana, but queries rely on label selection plus filtering." },
      { q: "What should never be logged?", a: "Secrets, tokens, passwords, full credit card numbers and unnecessary personal data. Redact at the source and in the pipeline." }
    ],
    trouble: [
      { t: "Logs missing from some pods", s: "Some pods' logs never appear in Loki/Kibana.", steps: ["Is the collector DaemonSet running on that node? (kubectl get ds -n logging)", "Check collector logs for parse or backpressure errors.", "Are those pods writing to a file instead of stdout?", "Rate limits or ingestion limits rejecting lines?"], cause: "Collector not scheduled on some nodes (taints), app logging to files, or ingestion limits dropping data.", fix: "Add tolerations to the DaemonSet, log to stdout, and raise limits or reduce noisy logs." }
    ]
  },
  sre: {
    cheat: [["99.9%", "≈ 43.8 min downtime / 30 days"], ["99.95%", "≈ 21.9 min / 30 days"], ["99.99%", "≈ 4.4 min / 30 days"], ["Error budget = 1 − SLO", "Allowed unreliability"], ["SLI = good / valid events", "Measure user happiness"], ["Burn rate", "Budget consumption speed (1 = exactly on budget)"], ["Fast burn: 14.4× over 1h", "Page"], ["Slow burn: 6× over 6h", "Page/ticket"], ["SLA < SLO", "Contract looser than internal target"], ["IC / Ops / Comms", "Incident roles"]],
    quiz: [
      { q: "An SLO of 99.9% over 30 days allows about how much downtime?", o: ["4 minutes", "43 minutes", "7 hours", "1 day"], a: 1, e: "0.1% of 43,200 minutes ≈ 43.2 minutes." },
      { q: "What should happen when the error budget is exhausted?", o: ["Nothing", "Prioritize reliability work over risky feature launches", "Fire the on-call", "Lower the SLO immediately"], a: 1, e: "That's the agreement the error budget policy creates." },
      { q: "A good SLI is measured…", o: ["As CPU usage", "As close to the user experience as possible", "Once a month manually", "Only in staging"], a: 1, e: "E.g. at the load balancer: % of requests succeeding under 300ms." },
      { q: "The Incident Commander's main job is to…", o: ["Write the fix", "Coordinate the response and decisions", "Talk to the press", "Restart servers"], a: 1, e: "Debugging is delegated so someone keeps the big picture." }
    ],
    interview: [
      { q: "SLI vs SLO vs SLA?", a: "SLI is the measurement (e.g. % of successful requests). SLO is the internal target for it (99.9% over 30 days). SLA is an external contract with consequences (credits) if broken — set looser than the SLO." },
      { q: "How do you reduce alert fatigue?", a: "Alert on SLO burn rate (user-facing symptoms) instead of individual causes, require every page to be actionable with a runbook, turn non-urgent alerts into tickets, deduplicate and group in Alertmanager, and review noisy alerts after each on-call shift." },
      { q: "Walk through how you'd handle a major incident.", a: "Declare it and assign an incident commander, open a channel and status page, assess impact, mitigate first (rollback, failover, scale, feature flag off), communicate on a regular cadence, confirm recovery with metrics, then hold a blameless postmortem with timeline, contributing factors and owned action items." }
    ],
    trouble: [
      { t: "Paged every night for high CPU", s: "On-call is woken several times a week by 'CPU > 80%' alerts, but users never notice anything.", steps: ["Did any of those pages correlate with SLO impact?", "Is CPU high during expected batch jobs?", "Is autoscaling configured?"], cause: "Alerting on a cause (CPU) rather than a symptom users feel.", fix: "Replace with SLO burn-rate alerts; keep CPU as a dashboard signal or low-priority ticket; tune autoscaling." }
    ]
  },
  otel: {
    cheat: [["OTEL_SERVICE_NAME=api", "Name your service"], ["OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318", "Where to send"], ["OTEL_TRACES_SAMPLER=parentbased_traceidratio", "Sampling"], ["traceparent header", "W3C context propagation"], ["4317 gRPC / 4318 HTTP", "OTLP ports"], ["receivers → processors → exporters", "Collector pipeline"], ["tail_sampling processor", "Keep errors & slow traces"], ["span attributes", "http.route, db.system, …"]],
    quiz: [
      { q: "A trace is made of…", o: ["Log lines", "Spans with parent/child relationships", "Metrics", "Containers"], a: 1, e: "Each span is a timed operation; together they form the request tree." },
      { q: "What carries trace context between HTTP services?", o: ["Cookies", "The traceparent header", "DNS", "TLS certificates"], a: 1, e: "W3C Trace Context is the standard." },
      { q: "Why run an OTel Collector instead of exporting directly?", o: ["It's mandatory", "Central batching, sampling, redaction and vendor-neutral routing", "It's faster to code", "It stores data forever"], a: 1, e: "Change backends by changing Collector config only." },
      { q: "Tail sampling decides…", o: ["Before the request starts", "After the trace completes, e.g. keep all errors", "Never", "Based on CPU"], a: 1, e: "It needs the whole trace, so it runs in the Collector." }
    ],
    interview: [
      { q: "Metrics vs logs vs traces?", a: "Metrics are cheap numeric aggregates over time — great for alerting and trends. Logs are detailed discrete events — explain what happened. Traces follow one request across services with timing — show where time is spent and where errors originate. Together they form observability." },
      { q: "How would you add tracing to an existing microservice system?", a: "Deploy an OTel Collector, enable auto-instrumentation in each service via SDK/agent with standard env vars, make sure context propagates through HTTP, gRPC and message queues, add manual spans for key business operations, choose sampling, send to Tempo/Jaeger, and link trace_id into logs." },
      { q: "What is cardinality and why does it matter in telemetry?", a: "The number of unique label/attribute combinations. High-cardinality labels (user IDs, request IDs) on metrics explode storage and cost; put them on traces or logs instead." }
    ],
    trouble: [
      { t: "Traces are broken into separate pieces", s: "Each service shows its own trace instead of one end-to-end trace.", steps: ["Inspect outgoing request headers — is traceparent present?", "Is the HTTP client library instrumented?", "Is a proxy or gateway stripping headers?", "For queues: is context injected into message headers?"], cause: "Context propagation is missing somewhere along the chain.", fix: "Instrument the client libraries, configure propagators (tracecontext,baggage), and make proxies forward traceparent." }
    ]
  },
  devsecops: {
    cheat: [["semgrep --config auto .", "SAST scan"], ["trivy fs .", "Scan repo deps & config"], ["trivy image app:1.0", "Scan an image"], ["checkov -d terraform/", "Scan IaC"], ["gitleaks detect", "Find secrets"], ["syft app:1.0 -o spdx-json", "Generate SBOM"], ["cosign sign / verify", "Sign & verify images"], ["npm audit / pip-audit", "Dependency audit"], ["Dependabot / Renovate", "Automated updates"], ["Kyverno / Gatekeeper", "Policy enforcement"]],
    quiz: [
      { q: "SAST analyzes…", o: ["Your running app", "Your source code without running it", "Network traffic", "Cloud bills"], a: 1, e: "DAST tests the running app." },
      { q: "SCA tools like Dependabot find…", o: ["Typos", "Known vulnerabilities in third-party dependencies", "Slow queries", "Open ports"], a: 1, e: "They match lockfiles against CVE databases." },
      { q: "An SBOM is…", o: ["A firewall", "A list of all components in your software", "A backup", "A load balancer"], a: 1, e: "Software Bill of Materials — needed to answer 'are we affected by CVE-X?'." },
      { q: "Which tool can block Pods running as root at admission?", o: ["Trivy", "Kyverno", "Grafana", "Helm"], a: 1, e: "Policy engines (Kyverno, OPA Gatekeeper) enforce rules in the cluster." }
    ],
    interview: [
      { q: "How do you integrate security into a CI/CD pipeline?", a: "Pre-commit secret scanning; on PR: SAST, dependency (SCA) and IaC scanning with results inline; at build: image scanning, SBOM generation and image signing; at deploy: admission policies verifying signatures and secure Pod settings; at runtime: Falco/GuardDuty, plus DAST against staging. Fail builds on critical, fixable issues and route the rest to the backlog." },
      { q: "How do you avoid security tools blocking developers constantly?", a: "Tune rules to reduce false positives, fail only on high-severity fixable issues, show findings inline in PRs with fix guidance, auto-create update PRs (Renovate), and provide secure-by-default templates and base images." },
      { q: "What is a supply-chain attack and how do you defend against it?", a: "Compromising software you depend on or your build process (malicious packages, compromised CI). Defenses: pin and verify dependencies, SBOMs, signed artifacts with provenance (SLSA), least-privilege CI tokens, isolated ephemeral runners and review of third-party actions." }
    ],
    trouble: [
      { t: "Build fails on a CRITICAL CVE in the base image", s: "Trivy fails the pipeline: CRITICAL vulnerability in openssl from the base image.", steps: ["Is a fixed version available? (trivy shows Fixed Version)", "Is a newer base image tag published?", "Is the package even needed at runtime?"], cause: "An outdated or bloated base image contains a vulnerable package.", fix: "Bump the base image (or apk/apt upgrade the package), move to a slim/distroless base, and let Renovate keep base images updated. Use .trivyignore with an expiry only for accepted, documented risks." }
    ]
  },
  secrets: {
    cheat: [["gitleaks detect / protect", "Scan / pre-commit hook"], ["vault kv get secret/app", "Read from Vault"], ["vault read database/creds/role", "Dynamic DB credentials"], ["aws secretsmanager get-secret-value", "AWS secret"], ["az keyvault secret show", "Azure secret"], ["kubectl create secret generic …", "K8s Secret"], ["sops -e / sops -d file", "Encrypt / decrypt in Git"], ["kubeseal < s.yaml > sealed.yaml", "Sealed Secrets"], ["ExternalSecret CRD", "Sync from a store"], ["Rotate → revoke → clean history", "Leak response order"]],
    quiz: [
      { q: "Kubernetes Secrets are, by default…", o: ["Strongly encrypted", "Only base64-encoded in etcd", "Stored in Git", "Hashed"], a: 1, e: "Enable encryption at rest and tight RBAC." },
      { q: "You accidentally pushed an API key to GitHub. First step?", o: ["Delete the commit", "Revoke/rotate the key immediately", "Make the repo private", "Ignore it"], a: 1, e: "Assume it's already been scraped; cleaning history comes after." },
      { q: "What makes dynamic secrets safer?", o: ["They're longer", "Unique, short-lived credentials per consumer", "They're stored in Git", "They never change"], a: 1, e: "Leaks expire quickly and are traceable." },
      { q: "Which approach keeps only encrypted secrets in a GitOps repo?", o: ["Plain YAML", "SOPS or Sealed Secrets", "Base64", "Environment variables"], a: 1, e: "Only the cluster/pipeline can decrypt." }
    ],
    interview: [
      { q: "How do you manage secrets for apps in Kubernetes?", a: "Store them in Vault or a cloud secret manager, give Pods an identity (ServiceAccount → IRSA/Workload Identity), sync with External Secrets Operator or mount via the CSI driver, enable etcd encryption, restrict RBAC on Secrets, and rotate automatically." },
      { q: "What is the 'secret zero' problem?", a: "To fetch secrets you need a credential — where does that first one come from? Solve it with platform identity: cloud instance/task roles, Kubernetes service account tokens, or OIDC federation, so no initial secret is stored." },
      { q: "Env vars vs mounted files for secrets?", a: "Env vars are simple but can leak via process listings, crash dumps and child processes, and don't update without restart. Mounted files can be permission-restricted and refreshed in place. Prefer files for sensitive values." }
    ],
    trouble: [
      { t: "Secret leaked in a public repo", s: "GitHub secret scanning alerts that an AWS access key was pushed.", steps: ["Deactivate and delete the key in IAM now.", "Check CloudTrail for any use of that key.", "Rotate anything else in the same file.", "Remove from history (git filter-repo) and force-push; ask forks to re-clone."], cause: "A credential was hard-coded or a .env file was committed.", fix: "Revoke and rotate, investigate usage, add gitleaks pre-commit and CI checks, add .env to .gitignore, and move to role/OIDC-based credentials." }
    ]
  }
});
