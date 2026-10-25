<div align="center">

# 🌳 Interactive 3D DevOps Tree

**A DevOps roadmap you can walk around in.**
Spin a 3D tree, click any leaf, and study that topic in a distraction‑free focus view: plain‑English summary, analogy, key concepts, a real code example and a hands‑on exercise.

![HTML](https://img.shields.io/badge/HTML-single_page-1a1d1b?style=flat-square)
![three.js](https://img.shields.io/badge/three.js-r147-2f9e52?style=flat-square)
![No build step](https://img.shields.io/badge/build-none-5f6661?style=flat-square)
![Topics](https://img.shields.io/badge/topics-30-2f9e52?style=flat-square)

[**Live demo →**](https://YOUR-USERNAME.github.io/YOUR-REPO/)

<!-- Add a screenshot or GIF: save it as docs/preview.png and uncomment -->
<!-- ![DevOps Tree preview](docs/preview.png) -->

</div>

---

## Why

Most DevOps roadmaps are flat lists or giant PNG charts. They're hard to navigate, and they don't explain *why* a tool matters. This project turns the roadmap into a living map:

- **Trunk:** what DevOps is (culture, the infinite loop, DORA metrics)
- **Branches:** the 8 major areas
- **Leaves:** individual tools and practices, each with a full study card

Every card answers the same question: **which part of the plan → code → build → test → release → deploy → operate → monitor loop does this automate?**

## Features

- **Explorable 3D tree:** orbit, zoom, hover to preview
- **Focus mode:** clicking a leaf fades everything else away so you can read and study one topic at a time
- **Structured study cards:** summary, analogy, why it matters, key concepts, code example, practice task
- **Keyboard navigation:** step through topics in order without touching the mouse
- **Zero build:** plain HTML + JS. Clone it and serve it.

## What's inside

| Branch | Topics |
|---|---|
| 🟢 **Foundations** | Linux · Bash Scripting · Networking · Git · Nginx · Python for DevOps |
| 📦 **Containers** | Docker · Docker Compose · Container Registries |
| ☸️ **Kubernetes** | Kubernetes Core · Services & Ingress · Helm · Service Mesh (Istio) |
| 🔁 **CI/CD** | CI/CD Concepts · GitHub Actions · Jenkins · GitOps & Argo CD · GitLab CI |
| 🏗️ **Infrastructure as Code** | Terraform · Ansible |
| ☁️ **Cloud** | AWS Core Services · IAM · Azure Core Services |
| 📈 **Observability** | Prometheus · Grafana · Logging (ELK / Loki) · SRE: SLIs, SLOs & Incidents · OpenTelemetry & Tracing |
| 🔒 **Security** | DevSecOps · Secrets Management |

## Controls

| Action | Input |
|---|---|
| Orbit the tree | Drag |
| Zoom | Scroll / pinch |
| Open a topic (focus mode) | Click a leaf |
| Next / previous topic | `→` / `←` |
| Back to full tree | `Esc` or `×` |

## Run locally

The page loads its data files over HTTP, so serve the folder with any static server. Opening the file straight from disk (`file://`) won't work.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO

# pick one
npx serve .
python3 -m http.server 8000
```

Then open <http://localhost:8000> (or the port your server prints).

## Deploy to GitHub Pages

1. Push this folder to the root of a repository.
2. Go to **Settings → Pages**.
3. Under **Source**, pick **Deploy from a branch**, then `main` and `/ (root)`.
4. After a minute, your tree is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

## Project structure

```
.
├── index.html          # The app: 3D scene, layout, focus mode, interactions
├── support.js          # Small runtime that renders index.html
├── devops-data.js      # Tree structure: root, branches, topics, study cards
├── devops-deep-*.js    # Extended deep-dive content per topic
├── devops-study-*.js   # Additional study material per topic
└── README.md
```

## Add or edit a topic

All content lives in plain JS objects in `devops-data.js`. To add a leaf, append a topic to a branch's `topics` array:

```js
{ id: "argo-rollouts", name: "Argo Rollouts",
  summary:  "Progressive delivery for Kubernetes: canary and blue-green releases.",
  analogy:  "Like opening a new restaurant dish to one table before the whole room.",
  why:      "Limits the blast radius of a bad release.",
  concepts: ["Canary steps", "Analysis templates", "Automatic rollback"],
  example:  { title: "Canary strategy", lang: "yaml", code: `strategy:\n  canary:\n    steps:\n      - setWeight: 20` },
  practice: "Roll out a new image to 20% of pods and watch metrics before promoting."
}
```

Reload the page and the new leaf grows on the tree automatically.

## Tech

- [three.js](https://threejs.org/) r147 + OrbitControls for the 3D scene (loaded from a CDN)
- [Geist](https://vercel.com/font) and Geist Mono for type (Google Fonts)
- No framework install, no bundler, no dependencies to manage

## Contributing

Corrections, new topics and better examples are welcome.

1. Fork the repo
2. Create a branch: `git checkout -b add-topic-xyz`
3. Commit your change and open a pull request

Please keep cards beginner‑friendly: one analogy, five concepts at most, and an example that actually runs.

## License

MIT. Use it, fork it, learn from it.
