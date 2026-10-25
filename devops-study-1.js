window.DEVOPS_STUDY = Object.assign(window.DEVOPS_STUDY || {}, {
  devops: {
    cheat: [["Deployment frequency", "How often you ship to production"], ["Lead time for changes", "Commit → running in prod"], ["Change failure rate", "% of deploys causing incidents"], ["Time to restore (MTTR)", "How fast you recover"], ["CALMS", "Culture · Automation · Lean · Measurement · Sharing"], ["Shift-left", "Test & secure earlier in the loop"], ["Small batches", "Smaller changes = lower risk, easier rollback"], ["Blameless postmortem", "Fix the system, not the person"]],
    quiz: [
      { q: "Which of these is NOT one of the four DORA metrics?", o: ["Deployment frequency", "Lines of code per developer", "Change failure rate", "Time to restore service"], a: 1, e: "DORA measures delivery performance of the system — never individual output like lines of code." },
      { q: "What does 'shift-left' mean?", o: ["Move servers to another region", "Catch bugs and security issues earlier in the lifecycle", "Deploy only on Mondays", "Give Ops more approvals"], a: 1, e: "Earlier detection (in the PR, in CI) is far cheaper than finding problems in production." },
      { q: "Why do DevOps teams prefer small, frequent releases?", o: ["They look better on dashboards", "Each change is easier to test, review and roll back", "Cloud providers charge less", "It avoids writing tests"], a: 1, e: "Small batches reduce risk per change and speed up feedback." },
      { q: "In CALMS, the 'M' stands for…", o: ["Monitoring", "Microservices", "Measurement", "Management"], a: 2, e: "Measurement — you improve what you measure (DORA metrics, SLOs)." }
    ],
    interview: [
      { q: "What is DevOps, in your own words?", a: "A culture and set of practices where development and operations share ownership of delivering and running software. It relies on automation (CI/CD, IaC), fast feedback (monitoring, small batches) and collaboration, measured by outcomes like deployment frequency, lead time, change failure rate and time to restore." },
      { q: "How would you introduce DevOps to a team that deploys manually once a month?", a: "Start by measuring the current DORA baseline. Put everything in Git, add CI that builds and tests on every push, then automate the deployment for one service end to end. Shrink batch size gradually, add monitoring and a rollback path, and share wins. Change culture with small, visible improvements rather than a big-bang tool rollout." },
      { q: "What's the difference between Continuous Delivery and Continuous Deployment?", a: "In Continuous Delivery every change that passes the pipeline is ready to release, but a human approves the production deploy. In Continuous Deployment it goes to production automatically with no manual gate." }
    ],
    trouble: [
      { t: "Deploys keep breaking production", s: "Every monthly release causes incidents, and the team is afraid to deploy.", steps: ["Measure: how big are releases? how long since the last one?", "Check what tests run before release — are they automated?", "Look at how rollbacks are done — is there a fast path?", "Review recent incident postmortems for common causes."], cause: "Large, infrequent batches with manual testing and no fast rollback — each release carries weeks of untested changes.", fix: "Move to small, frequent releases through an automated pipeline with tests, deploy with canaries/feature flags, and make rollback a one-click action." }
    ]
  },
  linux: {
    cheat: [["ls -lah", "List files with permissions & sizes"], ["df -h / du -sh *", "Disk usage per mount / per folder"], ["free -h", "Memory usage"], ["top / htop", "Live processes by CPU/memory"], ["ps aux | grep name", "Find a process"], ["kill -15 PID / kill -9 PID", "Stop gracefully / force kill"], ["chmod 755 f / chown u:g f", "Change permissions / owner"], ["systemctl status|restart svc", "Manage a service"], ["journalctl -u svc -f", "Follow a service's logs"], ["tail -f /var/log/syslog", "Follow a log file"], ["find / -name '*.log' -size +100M", "Find big files"], ["lsof -i :8080", "Which process uses a port"]],
    quiz: [
      { q: "What does chmod 640 file.txt give the group?", o: ["read + write", "read only", "no access", "read + execute"], a: 1, e: "6 = rw- (owner), 4 = r-- (group), 0 = --- (others)." },
      { q: "Where are system logs and service logs usually found?", o: ["/etc", "/usr/bin", "/var/log and journalctl", "/home"], a: 2, e: "/var/log holds log files; systemd services log to the journal, read with journalctl." },
      { q: "Which signal should you try first to stop a process cleanly?", o: ["SIGKILL (9)", "SIGTERM (15)", "SIGSTOP (19)", "SIGHUP (1)"], a: 1, e: "SIGTERM lets the program clean up. SIGKILL can't be caught and may leave things in a bad state." },
      { q: "A disk is 100% full but `du` doesn't find large files. Most likely cause?", o: ["A broken disk", "A deleted file still held open by a running process", "Too many users", "Wrong permissions"], a: 1, e: "Space isn't freed until the process closes the file. Find it with lsof | grep deleted and restart the process." }
    ],
    interview: [
      { q: "A server is slow. How do you investigate?", a: "Check load and CPU with uptime/top, memory and swap with free -h, disk space with df -h and I/O with iostat or iotop, then network with ss and the logs (journalctl, /var/log). Identify the resource that is saturated and the process responsible before changing anything." },
      { q: "What is the difference between a process and a thread?", a: "A process has its own memory space and resources; threads run inside a process and share its memory. Processes are isolated from each other; threads are lighter but a bug in one can affect the others." },
      { q: "What happens during the Linux boot process?", a: "Firmware (BIOS/UEFI) runs the bootloader (GRUB), which loads the kernel and initramfs. The kernel initializes hardware, mounts the root filesystem and starts PID 1 (systemd), which starts services according to targets until the system reaches its default target." }
    ],
    trouble: [
      { t: "Disk full on a production server", s: "The app crashes with 'No space left on device'.", steps: ["df -h — which mount is full?", "sudo du -xh / --max-depth=2 | sort -rh | head — what's big?", "Check /var/log, /tmp, Docker (docker system df).", "sudo lsof | grep deleted — deleted files still open?"], cause: "Usually unrotated logs, old Docker images/volumes, or a deleted log file still held open by the process.", fix: "Clean up (journalctl --vacuum-size=500M, docker system prune), restart the process holding deleted files, and set up logrotate plus disk-usage alerts at 80%." }
    ]
  },
  bash: {
    cheat: [["set -euo pipefail", "Fail fast and safely"], ["\"$VAR\"", "Always quote variables"], ["${VAR:-default}", "Default value"], ["$(command)", "Command substitution"], ["$? / $# / $@", "Last exit code / arg count / all args"], ["[[ -f file ]] / [[ -z $s ]]", "File exists / string empty"], ["cmd > out 2>&1", "Redirect stdout and stderr"], ["cmd1 && cmd2 || cmd3", "Run on success / on failure"], ["trap cleanup EXIT", "Always run cleanup"], ["for f in *.log; do …; done", "Loop over files"], ["xargs -P4", "Run in parallel"], ["shellcheck script.sh", "Lint your script"]],
    quiz: [
      { q: "What does `set -e` do?", o: ["Enables debug output", "Exits the script when a command fails", "Exports all variables", "Ignores errors"], a: 1, e: "-e stops on errors; -u errors on unset variables; -o pipefail makes pipelines fail if any part fails." },
      { q: "Why should you write \"$FILE\" instead of $FILE?", o: ["It runs faster", "It prevents word-splitting on spaces and glob expansion", "It's required syntax", "It makes it read-only"], a: 1, e: "Unquoted variables split on spaces — a path like 'my file.txt' becomes two arguments." },
      { q: "What exit code means success?", o: ["1", "0", "-1", "255"], a: 1, e: "0 is success; any non-zero value signals failure." },
      { q: "What does `2>&1` do?", o: ["Runs two commands", "Sends stderr to the same place as stdout", "Doubles output", "Discards output"], a: 1, e: "File descriptor 2 (stderr) is redirected to wherever 1 (stdout) currently goes." }
    ],
    interview: [
      { q: "How do you make a Bash script safe to run in CI?", a: "Use #!/usr/bin/env bash and set -euo pipefail, quote all variables, validate inputs, use trap for cleanup, return non-zero exit codes on failure, avoid interactive prompts, and lint with shellcheck." },
      { q: "When would you switch from Bash to Python?", a: "When the script needs complex data structures, JSON/YAML parsing, API calls with retries, error handling beyond exit codes, tests, or grows past roughly 100 lines. Bash is great for gluing commands; Python is better for logic." },
      { q: "Explain the difference between $@ and $*.", a: "Quoted \"$@\" expands to each argument as a separate word, preserving spaces inside arguments. \"$*\" joins all arguments into one string. You almost always want \"$@\"." }
    ],
    trouble: [
      { t: "Script works locally but fails silently in CI", s: "The deploy step passes in CI, but nothing was deployed.", steps: ["Check whether the script has set -euo pipefail.", "Run it with bash -x to trace each command.", "Look for pipelines like `cmd | tee log` hiding failures.", "Check for missing env vars that are empty in CI."], cause: "Without -e and pipefail, a failing command in the middle was ignored and the script exited 0; an unset variable expanded to empty.", fix: "Add set -euo pipefail, check required variables at the top (: \"${TOKEN:?TOKEN is required}\"), and run shellcheck in CI." }
    ]
  },
  networking: {
    cheat: [["ip a / ip r", "Interfaces & routes"], ["ss -tulpn", "Listening ports & processes"], ["dig +short name", "DNS lookup"], ["nslookup name", "DNS lookup (alt)"], ["curl -v https://url", "Full HTTP + TLS details"], ["nc -zv host port", "Is a port reachable?"], ["traceroute / mtr host", "Path & packet loss"], ["ping host", "Basic reachability (ICMP)"], ["openssl s_client -connect h:443", "Inspect TLS certificate"], ["tcpdump -i any port 443", "Capture packets"], ["/etc/hosts, /etc/resolv.conf", "Local overrides & DNS servers"]],
    quiz: [
      { q: "How many IP addresses are in a /24 network?", o: ["24", "128", "256", "65,536"], a: 2, e: "32 − 24 = 8 host bits → 2^8 = 256 addresses." },
      { q: "'Connection refused' usually means…", o: ["A firewall dropped the packet", "The host is reachable but nothing listens on that port", "DNS failed", "TLS certificate expired"], a: 1, e: "Refused = the host actively rejected it (no listener). A firewall drop usually shows as a timeout." },
      { q: "Which DNS record makes one name an alias of another name?", o: ["A", "MX", "CNAME", "TXT"], a: 2, e: "CNAME points a name to another name; A points to an IPv4 address." },
      { q: "A 502 Bad Gateway from a load balancer means…", o: ["The client sent a bad request", "The proxy couldn't get a valid response from the backend", "Authentication failed", "The page moved"], a: 1, e: "5xx is server-side; 502 specifically means the upstream/backend failed or is unreachable." }
    ],
    interview: [
      { q: "What happens when you type a URL in the browser?", a: "The browser resolves the domain via DNS, opens a TCP connection to the IP on port 443, performs a TLS handshake to verify the certificate and agree on encryption, sends an HTTP request, the request may pass through a CDN/load balancer to a backend, which returns a response that the browser renders, fetching further assets the same way." },
      { q: "TCP vs UDP — when would you use each?", a: "TCP provides reliable, ordered delivery with connection setup and retransmission — HTTP, SSH, databases. UDP is connectionless and lower-latency without delivery guarantees — DNS, video/voice streaming, gaming, metrics (StatsD)." },
      { q: "How do you debug 'the service can't reach the database'?", a: "Walk the layers: does the DB hostname resolve (dig)? Is the port reachable (nc -zv host 5432)? If it times out, check security groups/firewalls/NACLs and routes; if refused, check the DB is listening on the right interface. Then check credentials, TLS settings and connection limits in the DB logs." }
    ],
    trouble: [
      { t: "Requests time out to a new server", s: "curl to the new VM on port 443 hangs and eventually times out.", steps: ["dig the name — does it resolve to the right IP?", "nc -zv ip 443 — timeout or refused?", "On the server: ss -tulpn | grep 443 — is anything listening, on 0.0.0.0?", "Check the cloud security group / NSG and host firewall (ufw, iptables)."], cause: "Timeout (not refused) means packets are being dropped — typically a security group without an inbound 443 rule, or the service bound to 127.0.0.1 only.", fix: "Open 443 in the security group/firewall and make the service listen on 0.0.0.0 (or the private IP)." }
    ]
  },
  git: {
    cheat: [["git status / git diff", "What changed"], ["git add -p", "Stage hunk by hunk"], ["git commit --amend", "Fix the last commit"], ["git switch -c name", "New branch"], ["git rebase -i HEAD~3", "Squash/reorder recent commits"], ["git log --oneline --graph --all", "Visual history"], ["git stash / git stash pop", "Park & restore changes"], ["git reset --soft HEAD~1", "Undo commit, keep changes"], ["git revert SHA", "Undo a pushed commit safely"], ["git reflog", "Find 'lost' commits"], ["git cherry-pick SHA", "Copy one commit here"], ["git blame file", "Who changed each line"]],
    quiz: [
      { q: "You pushed a bad commit to main that others have pulled. Safest way to undo it?", o: ["git reset --hard and force push", "git revert <sha>", "Delete the repo", "git commit --amend"], a: 1, e: "revert creates a new commit that undoes the change without rewriting shared history." },
      { q: "What does `git fetch` do?", o: ["Downloads remote commits without changing your branch", "Merges remote changes", "Pushes your commits", "Deletes remote branches"], a: 0, e: "fetch only updates remote-tracking refs. pull = fetch + merge/rebase." },
      { q: "When should you NOT rebase?", o: ["On your local feature branch", "On a branch others are working on", "Before opening a PR", "To squash commits"], a: 1, e: "Rebasing rewrites commit hashes; others' copies would diverge." },
      { q: "What is a branch in Git?", o: ["A full copy of the repo", "A movable pointer to a commit", "A separate remote", "A folder"], a: 1, e: "That's why creating branches is instant and cheap." }
    ],
    interview: [
      { q: "Merge vs rebase?", a: "Merge combines histories with a merge commit, preserving exactly what happened — safe for shared branches. Rebase replays your commits onto another base for a linear history, but rewrites commits, so use it only on branches that aren't shared." },
      { q: "Trunk-based development vs GitFlow?", a: "Trunk-based: short-lived branches merged into main at least daily, with feature flags for incomplete work — enables CI/CD. GitFlow: long-lived develop/release/hotfix branches — more ceremony, suited to versioned releases but slows integration." },
      { q: "How do you recover a commit you accidentally reset away?", a: "Use git reflog to find the commit hash HEAD pointed to before the reset, then git reset --hard <hash> or create a branch from it with git branch rescue <hash>." }
    ],
    trouble: [
      { t: "Push rejected: non-fast-forward", s: "git push fails with 'Updates were rejected because the tip of your current branch is behind'.", steps: ["git fetch origin", "git log --oneline HEAD..origin/main — what's new on the remote?", "Decide: rebase or merge."], cause: "Someone else pushed to the branch after you last pulled; your history doesn't include their commits.", fix: "git pull --rebase (or git rebase origin/main), resolve any conflicts, run tests, then push. Never force-push a shared branch." }
    ]
  },
  nginx: {
    cheat: [["nginx -t", "Test config syntax"], ["nginx -T", "Dump full merged config"], ["systemctl reload nginx", "Apply config, no downtime"], ["tail -f /var/log/nginx/error.log", "Watch errors"], ["proxy_pass http://upstream;", "Reverse proxy"], ["return 301 https://$host$request_uri;", "Redirect to HTTPS"], ["client_max_body_size 50m;", "Allow bigger uploads (fixes 413)"], ["proxy_read_timeout 60s;", "Wait longer for slow backends (504)"], ["certbot --nginx -d domain", "Free TLS certificate"], ["limit_req zone=api burst=20;", "Rate limiting"]],
    quiz: [
      { q: "Users get '413 Request Entity Too Large' when uploading. Fix?", o: ["Restart the app", "Increase client_max_body_size", "Add another worker", "Open port 413"], a: 1, e: "Nginx rejects bodies larger than client_max_body_size (default 1 MB)." },
      { q: "What's the safest way to apply a new Nginx config?", o: ["Kill all nginx processes", "nginx -t, then systemctl reload nginx", "Reboot the server", "Edit and wait"], a: 1, e: "-t validates syntax; reload swaps workers gracefully without dropping connections." },
      { q: "Nginx returns 502 Bad Gateway. Where's the problem most likely?", o: ["Client's browser", "The upstream app is down or refusing connections", "DNS", "Disk space"], a: 1, e: "502 = Nginx couldn't get a valid response from the backend. Check error.log and whether the app is running." },
      { q: "Which location wins for /health: `location /` or `location = /health`?", o: ["location /", "location = /health", "Whichever is first", "Both run"], a: 1, e: "Exact matches (=) have the highest priority." }
    ],
    interview: [
      { q: "Forward proxy vs reverse proxy?", a: "A forward proxy acts on behalf of clients reaching the internet (corporate proxies). A reverse proxy sits in front of servers and acts on their behalf: load balancing, TLS termination, caching, routing, and hiding backend details." },
      { q: "Why is Nginx so efficient?", a: "It uses an event-driven, non-blocking architecture: a few worker processes each handle thousands of connections with an event loop (epoll), instead of a thread or process per connection, keeping memory and context switching low." },
      { q: "How would you do zero-downtime deploys behind Nginx?", a: "Run the new version alongside the old, add it to the upstream, remove the old one (or switch upstream blocks) and run nginx -s reload, which starts new workers and drains old ones gracefully. Health checks and passive max_fails help avoid sending traffic to unready backends." }
    ],
    trouble: [
      { t: "504 Gateway Timeout on reports page", s: "Most pages work, but /reports returns 504 after exactly 60 seconds.", steps: ["Check error.log for 'upstream timed out (110: Connection timed out) while reading response header'.", "Time the request directly against the app (curl backend:3000/reports).", "Check proxy_read_timeout in the location."], cause: "The backend takes longer than proxy_read_timeout (default 60s) to respond for heavy reports.", fix: "Short term: raise proxy_read_timeout for that location only. Real fix: make the report asynchronous (queue + poll) or optimize the query." }
    ]
  },
  python: {
    cheat: [["python3 -m venv .venv", "Create virtual env"], ["source .venv/bin/activate", "Activate it"], ["pip install -r requirements.txt", "Install deps"], ["pip freeze > requirements.txt", "Pin deps"], ["subprocess.run([...], check=True)", "Run a command safely"], ["json.load(f) / yaml.safe_load(f)", "Parse config"], ["requests.get(url, timeout=5)", "HTTP call with timeout"], ["argparse.ArgumentParser()", "CLI flags"], ["logging.basicConfig(level=INFO)", "Logging"], ["sys.exit(1)", "Signal failure"], ["pathlib.Path('x').read_text()", "Read a file"]],
    quiz: [
      { q: "Why use a virtual environment?", o: ["It makes Python faster", "To isolate each project's dependencies", "It's required for scripts", "To run as root"], a: 1, e: "Different projects can need different versions of the same package." },
      { q: "Which is the safe way to load YAML from a file?", o: ["yaml.load(f)", "yaml.safe_load(f)", "eval(f.read())", "json.load(f)"], a: 1, e: "yaml.load can construct arbitrary objects; safe_load only builds basic types." },
      { q: "Why always pass timeout= to requests?", o: ["It's faster", "Without it a call can hang forever", "It enables HTTPS", "It retries automatically"], a: 1, e: "requests has no default timeout — a stuck server would hang your script or pipeline." },
      { q: "Your script hit an error. How should it tell CI it failed?", o: ["print('error')", "sys.exit(1)", "return None", "Write to a file"], a: 1, e: "CI checks exit codes; non-zero marks the step failed." }
    ],
    interview: [
      { q: "How do you call an AWS API from Python securely?", a: "Use boto3 and let it pick up credentials from the environment: an IAM role on EC2/ECS/Lambda, IRSA in Kubernetes, OIDC in CI, or a named SSO profile locally. Never hard-code keys in the script." },
      { q: "subprocess.run with shell=True — what's the risk?", a: "The command is passed to a shell, so unsanitized input can inject extra commands. Prefer a list of arguments with shell=False, use check=True to raise on failure, and capture_output when you need the output." },
      { q: "How would you structure a reusable internal CLI tool?", a: "A pyproject.toml package with a console entry point, argparse/click/typer subcommands, logging, config from env vars, a --dry-run default for destructive actions, unit tests with pytest, ruff for linting, and distribution as a pip package or small Docker image." }
    ],
    trouble: [
      { t: "ModuleNotFoundError in CI but works locally", s: "CI fails with ModuleNotFoundError: No module named 'yaml'.", steps: ["Check whether requirements.txt contains PyYAML.", "Locally: which python && pip list — are you in a venv with extra packages?", "Check the CI step installs requirements in the same interpreter it runs."], cause: "The package was installed globally on the laptop but never added to requirements.txt (or CI installs into a different Python).", fix: "pip install pyyaml in the venv, pip freeze > requirements.txt (or add it to pyproject), and use python -m pip in CI to ensure the same interpreter." }
    ]
  },
  docker: {
    cheat: [["docker build -t app:1.0 .", "Build an image"], ["docker run -d -p 8080:3000 --name app app:1.0", "Run detached with port"], ["docker ps -a", "List containers"], ["docker logs -f app", "Follow logs"], ["docker exec -it app sh", "Shell inside"], ["docker inspect app", "Full details (JSON)"], ["docker stats", "Live CPU/memory"], ["docker images / docker rmi", "List / remove images"], ["docker system df / prune", "Disk usage / clean up"], ["docker run -v vol:/data", "Mount a volume"], ["docker network create net", "User-defined network"], ["docker history app:1.0", "Layers & sizes"]],
    quiz: [
      { q: "Why copy package.json and run npm ci BEFORE copying the source code?", o: ["It's required syntax", "So the dependency layer is cached when only code changes", "To make the image smaller", "For security"], a: 1, e: "Layers after a changed instruction are rebuilt; dependencies change less often than code." },
      { q: "What's the main benefit of a multi-stage build?", o: ["Faster internet", "The final image contains only what's needed to run, not build tools", "It runs multiple containers", "It encrypts the image"], a: 1, e: "Smaller images = faster pulls and a smaller attack surface." },
      { q: "Data written inside a container (no volume) is…", o: ["Saved forever", "Lost when the container is removed", "Uploaded to the registry", "Shared with all containers"], a: 1, e: "It lives in the container's writable layer. Use volumes for persistent data." },
      { q: "Which kernel features make containers possible?", o: ["Swap and cron", "Namespaces and cgroups", "SELinux and SSH", "systemd and journald"], a: 1, e: "Namespaces isolate (PIDs, network, mounts); cgroups limit resources." }
    ],
    interview: [
      { q: "Container vs virtual machine?", a: "A VM virtualizes hardware and runs its own full OS kernel — strong isolation, heavier, slower to start. A container shares the host kernel and isolates processes with namespaces and cgroups — lightweight, starts in milliseconds, but weaker isolation." },
      { q: "How do you make Docker images small and secure?", a: "Use slim or distroless base images, multi-stage builds, combine and clean up package installs, use .dockerignore, run as a non-root USER, pin versions, avoid secrets in layers (use build secrets), and scan images with Trivy." },
      { q: "CMD vs ENTRYPOINT?", a: "ENTRYPOINT defines the executable that always runs; CMD provides default arguments (or a default command) that can be overridden at docker run. A common pattern is ENTRYPOINT [\"app\"] with CMD [\"--help\"]." }
    ],
    trouble: [
      { t: "Container exits immediately", s: "docker run -d myapp, then docker ps shows nothing; docker ps -a shows 'Exited (1)'.", steps: ["docker logs <container> — what did it print?", "docker inspect <c> --format '{{.State.ExitCode}}'", "Run interactively: docker run -it --entrypoint sh myapp and start the command by hand.", "Check required env vars and files exist."], cause: "The main process crashed (missing env var, wrong CMD path, missing file) or the command finished — containers live only as long as PID 1.", fix: "Fix the startup error shown in the logs; make sure the CMD runs a long-lived foreground process (not a daemon that backgrounds itself)." }
    ]
  },
  compose: {
    cheat: [["docker compose up -d", "Start everything"], ["docker compose down", "Stop & remove (keeps volumes)"], ["docker compose down -v", "Also delete volumes"], ["docker compose ps", "Service status"], ["docker compose logs -f api", "Follow one service"], ["docker compose exec db psql -U app", "Run a command in a service"], ["docker compose build --no-cache", "Rebuild images"], ["docker compose config", "Show merged config"], ["docker compose up --scale worker=3", "Scale a service"], ["docker compose restart api", "Restart a service"]],
    quiz: [
      { q: "Inside the api container, how do you reach the Postgres service named 'db'?", o: ["localhost:5432", "db:5432", "127.0.0.1:5432", "host.docker.internal"], a: 1, e: "Compose's network gives each service a DNS name equal to its service name." },
      { q: "depends_on without a healthcheck condition guarantees…", o: ["The DB is ready to accept connections", "Only that the DB container has started", "Nothing at all", "That data is migrated"], a: 1, e: "Use condition: service_healthy with a healthcheck to wait for readiness." },
      { q: "Which command deletes your database data in a named volume?", o: ["docker compose down", "docker compose stop", "docker compose down -v", "docker compose restart"], a: 2, e: "-v removes named volumes declared in the file." },
      { q: "Compose is best suited for…", o: ["Large production clusters", "Local development and simple single-host setups", "Managing DNS", "CI runners only"], a: 1, e: "For multi-node production, use Kubernetes/ECS." }
    ],
    interview: [
      { q: "Docker Compose vs Kubernetes?", a: "Compose defines multi-container apps on a single host — great for local dev and simple deployments. Kubernetes orchestrates containers across many nodes with self-healing, scaling, rolling updates, service discovery and declarative state — built for production at scale." },
      { q: "How do you handle environment-specific config in Compose?", a: "Use a base compose.yaml plus override files (compose.override.yaml for dev, -f compose.prod.yaml), env_file and .env for variables, and profiles for optional services. Keep secrets out of the committed files." },
      { q: "Why does my API fail at startup with 'connection refused' to the DB?", a: "The API starts before Postgres is ready. Add a healthcheck to the DB with depends_on condition: service_healthy, and also make the app retry connections — good practice in any environment." }
    ],
    trouble: [
      { t: "Code changes don't show up", s: "You edit source files, run docker compose up, but the old behaviour remains.", steps: ["Is the service using build: or image:?", "docker compose images — when was the image built?", "Is there a bind mount for the source directory?"], cause: "Compose reuses the existing image; it doesn't rebuild automatically when source files change.", fix: "Run docker compose up --build (or docker compose build api), or bind-mount the source in dev with a file-watcher (or use docker compose watch)." }
    ]
  },
  registry: {
    cheat: [["docker login registry", "Authenticate"], ["docker tag app reg/repo:tag", "Name an image for a registry"], ["docker push reg/repo:tag", "Upload"], ["docker pull reg/repo@sha256:…", "Pull by digest"], ["docker manifest inspect img", "See manifest/platforms"], ["crane ls reg/repo", "List tags (crane)"], ["aws ecr get-login-password | docker login …", "ECR login"], ["az acr login -n name", "ACR login"], ["imagePullSecrets", "K8s private registry auth"]],
    quiz: [
      { q: "Why avoid deploying :latest?", o: ["It's slower", "You can't tell which version is running or reliably roll back", "It's not allowed", "It costs more"], a: 1, e: "latest is just a moving tag; use immutable tags like the git SHA or semantic version." },
      { q: "What uniquely and immutably identifies an image's content?", o: ["Its tag", "Its digest (sha256)", "Its repository name", "Its size"], a: 1, e: "Digests are content hashes — the same digest always means the same bytes." },
      { q: "Pushing a new version with only a code change uploads…", o: ["The entire image", "Only the layers the registry doesn't have", "Nothing", "Only the manifest"], a: 1, e: "Layers are deduplicated by hash." },
      { q: "Kubernetes pods show ErrImagePull for a private image. First thing to check?", o: ["CPU limits", "imagePullSecrets / node registry permissions", "Service selector", "Ingress"], a: 1, e: "Nodes need credentials to pull private images." }
    ],
    interview: [
      { q: "What tagging strategy do you use for images?", a: "Tag every build with the immutable git SHA for traceability, add semantic version tags for releases, never deploy :latest, and optionally record the digest in deployment manifests for absolute certainty." },
      { q: "How do you secure a container registry?", a: "Private repositories, short-lived tokens or IAM/OIDC instead of static passwords, least-privilege push vs pull permissions, vulnerability scanning on push, image signing (cosign) with admission verification, and retention policies." },
      { q: "Tag vs digest?", a: "A tag is a human-readable, mutable pointer (myapp:1.4.0). A digest is the SHA-256 of the image manifest — immutable and content-addressed." }
    ],
    trouble: [
      { t: "ImagePullBackOff in Kubernetes", s: "New Pods stay in ImagePullBackOff.", steps: ["kubectl describe pod <pod> — read the Events.", "Check the image name and tag actually exist in the registry.", "Check imagePullSecrets on the Pod/ServiceAccount, or node IAM permissions (ECR/ACR).", "Check the node can reach the registry (egress, proxy)."], cause: "Usually a typo in the image tag, a tag that was never pushed, or missing pull credentials for a private registry.", fix: "Fix the tag or push the image; add an imagePullSecret or grant the node/identity pull permissions (e.g. az aks update --attach-acr, ECR read policy)." }
    ]
  },
  kubernetes: {
    cheat: [["kubectl get pods -A -o wide", "All pods with nodes/IPs"], ["kubectl describe pod p", "Events & details"], ["kubectl logs p -c c --previous", "Logs of crashed container"], ["kubectl exec -it p -- sh", "Shell inside a pod"], ["kubectl apply -f file.yaml", "Create/update"], ["kubectl rollout status deploy/api", "Watch a rollout"], ["kubectl rollout undo deploy/api", "Rollback"], ["kubectl scale deploy/api --replicas=5", "Scale"], ["kubectl top pods / nodes", "Resource usage"], ["kubectl get events --sort-by=.lastTimestamp", "Recent events"], ["kubectl config use-context ctx", "Switch cluster"], ["kubectl explain deployment.spec", "Built-in docs"]],
    quiz: [
      { q: "Which component stores the entire cluster state?", o: ["kubelet", "etcd", "kube-proxy", "scheduler"], a: 1, e: "etcd is the consistent key-value store behind the API server." },
      { q: "Which component decides which node a new Pod runs on?", o: ["kube-scheduler", "kubelet", "controller-manager", "etcd"], a: 0, e: "The scheduler filters and scores nodes, then binds the Pod. The kubelet then runs it." },
      { q: "A Pod is deleted manually. Who recreates it?", o: ["The kubelet", "The ReplicaSet controller (via the Deployment)", "etcd", "Nobody"], a: 1, e: "The ReplicaSet notices fewer Pods than desired and creates a new one." },
      { q: "What does a readiness probe failure do?", o: ["Restarts the container", "Removes the Pod from Service endpoints until it's ready", "Deletes the Deployment", "Nothing"], a: 1, e: "Liveness failures restart the container; readiness failures only stop traffic." }
    ],
    interview: [
      { q: "Walk me through what happens when you run kubectl apply on a Deployment.", a: "kubectl sends the manifest to the API server, which authenticates, authorizes (RBAC), runs admission controllers and stores it in etcd. The Deployment controller creates/updates a ReplicaSet, which creates Pod objects. The scheduler assigns each Pod to a node. The kubelet on that node pulls the image via the container runtime and starts containers, runs probes and reports status. kube-proxy/CNI update networking so Services route to the ready Pods." },
      { q: "Requests vs limits?", a: "Requests are what the scheduler reserves for a container and guarantee capacity; limits are the maximum it may use. Exceeding a memory limit gets the container OOM-killed; exceeding CPU limit causes throttling. Setting requests correctly is key for scheduling and autoscaling." },
      { q: "Deployment vs StatefulSet vs DaemonSet?", a: "Deployment: interchangeable stateless Pods with rolling updates. StatefulSet: Pods with stable names, ordered startup and their own persistent volumes — databases, Kafka. DaemonSet: exactly one Pod per (selected) node — log collectors, monitoring agents, CNI." }
    ],
    trouble: [
      { t: "Pod stuck in CrashLoopBackOff", s: "kubectl get pods shows api-xxx CrashLoopBackOff with many restarts.", steps: ["kubectl logs api-xxx --previous — why did the last run die?", "kubectl describe pod api-xxx — exit code, OOMKilled?, probe failures, events.", "Check env vars, ConfigMaps/Secrets mounted, and the command/args.", "If OOMKilled: compare memory usage with limits (kubectl top pod)."], cause: "The container starts and exits repeatedly: app error at startup (bad config, missing secret, can't reach DB), wrong command, OOMKilled due to a low memory limit, or a liveness probe that kills it too early.", fix: "Fix the root cause from the logs/exit code: correct config/secrets, raise the memory limit, or give the liveness probe an initialDelaySeconds / use a startupProbe. Then kubectl rollout restart." },
      { t: "Pod stuck in Pending", s: "A new Pod stays Pending forever.", steps: ["kubectl describe pod — read the scheduler's event message.", "Insufficient cpu/memory? Check node capacity and requests.", "Taints, nodeSelector or affinity not matching any node?", "PersistentVolumeClaim not bound?"], cause: "The scheduler can't find a node that satisfies the Pod's requirements.", fix: "Lower requests or add nodes (cluster autoscaler), fix selectors/tolerations, or fix the storage class/PVC." }
    ]
  }
});
