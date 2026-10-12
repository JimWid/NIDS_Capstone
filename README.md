# ML-Powered Network Intrusion Detection System (NIDS)

A capstone project that monitors network traffic, detects suspicious activity with machine learning and rule-based checks, and presents the results on a web dashboard.

**What it does**

- **Network monitoring:** captures traffic (live or from `.pcap` files) and tracks devices, IP addresses, protocols, ports, and active connections.
- **Feature extraction:** turns raw packets into flow features such as source/destination IPs and ports, protocol, packet size, and connection frequency.
- **Detection and risk assessment:** classifies traffic as benign or malicious with a scikit-learn model, and flags threats like unauthorized devices, port scans, repeated login attempts, and unusual connections. Every finding gets a risk level.
- **Dashboard:** shows devices, connections, and alerts with charts.
- **AI assistant:** an LLM explains alerts in plain language and answers questions about the network.

```
Traffic (live or .pcap) -> Scapy -> feature extraction -> ML model + rules -> risk level
        -> PostgreSQL -> FastAPI (+ LLM assistant) -> Dashboard
```

---

## 1. Install Docker 

Docker lets us all run the exact same environment with one command, so nobody has to install Python versions, databases, or libraries by hand.

### Windows
1. Download **Docker Desktop** from https://www.docker.com/products/docker-desktop/
2. Run the installer and keep **"Use WSL 2 instead of Hyper-V"** checked.
3. Restart your computer when asked.
4. Open Docker Desktop, accept the terms, and wait until it says **"Engine running"** (bottom-left).

### Mac
1. Download Docker Desktop from the same link. Pick **Apple Silicon** (M1/M2/M3/M4) or **Intel** depending on your Mac (Apple menu > About This Mac).
2. Open the `.dmg`, drag Docker into Applications, and launch it.
3. Accept the terms and wait until the whale icon in the menu bar stops animating.

### Linux
Install Docker Engine and the Compose plugin by following https://docs.docker.com/engine/install/ for your distro, then let your user run Docker without `sudo`:
```bash
sudo usermod -aG docker $USER    # log out and back in afterwards
```

### Check that it works
Docker Desktop must be **open and running** whenever you use Docker (whale icon in the menu bar or system tray). Then, in any terminal:
```bash
docker --version
docker compose version
docker run hello-world
```
If `hello-world` prints a welcome message, you are ready.

---

## 2. Run the project

```bash
git clone <REPO_URL>
cd nids-capstone
cp .env.example .env        # Windows PowerShell: copy .env.example .env
```
Open `.env` and set a database password (any value is fine locally). Then add the files that are not stored in Git:

- **Sample traffic:** download from `<LINK>` and place it at `data/sample.pcap`
- **Trained model:** download `model.joblib` from the latest GitHub Release and place it at `ml/models/model.joblib`

Start everything:
```bash
docker compose up --build
```
The first run takes a few minutes (images are downloaded and built). After that it starts in seconds.

| What | URL |
|------|-----|
| Dashboard | http://localhost:3000 |
| API + interactive docs | http://localhost:8000/docs |
| Postgres | `localhost:5432` (user/password from `.env`) |

### Docker in 30 seconds
- A **Dockerfile** is the recipe for one service (e.g. the backend).
- An **image** is the built result of that recipe.
- A **container** is a running copy of an image.
- **`docker-compose.yml`** lists all our services so one command starts them together.

### Everyday commands
```bash
docker compose up -d               # start everything in the background
docker compose down                # stop everything (data is kept)
docker compose down -v             # stop and DELETE the database (fresh start)
docker compose ps                  # what is running?
docker compose logs -f backend     # follow logs of one service
docker compose up --build backend  # rebuild + restart just one service
```
After changing code or a Dockerfile, rebuild that service with `docker compose up --build <service>`.

### Detection modes
- **replay** (default): reads `data/sample.pcap`. Works on Mac, Windows, and Linux. Use this for development and demos.
- **live**: sniffs a real network interface. Only works on a Linux host or Linux VM, because Docker Desktop on Mac/Windows runs containers in a hidden VM that cannot see your real network. See the commented lines in `docker-compose.yml`.

---

## 3. Working on Python code without Docker (optional)

We use [uv](https://docs.astral.sh/uv/), a fast replacement for pip + venv. Install it from https://docs.astral.sh/uv/getting-started/installation/ then:

```bash
cd machine_learning        # or backend, or detection
uv sync                    # creates the virtual environment and installs dependencies
uv run python train.py     # run something inside that environment
uv add pandas              # add a dependency (updates pyproject.toml + uv.lock)
```

If you prefer using pip: Run `uv export > requirements.txt` and use that instead! :)
Commit `pyproject.toml` and `uv.lock` whenever dependencies change.

---

## 4. Roles and where they live in the repo

| Role | Works in | What it covers |
|------|----------|----------------|
| **Machine Learning** | `machine_learning/` and `detection/` | Training, experiments, and notebooks live in `machine_learning/`. The model's feature extraction and prediction code live in `detection/src/` (`features.py`, `predict.py`). |
| **Cyber Security / Detection** | `detection/` | Packet capture, flow building, device tracking, rule-based detections (port scan, unauthorized device, repeated logins), and risk levels. |
| **Backend** | `backend/` | FastAPI endpoints that serve alerts, devices, and stats to the dashboard. |
| **LLM / AI** | `backend/app/llm/` | Alert explanations and the chat assistant (calls an LLM API from the backend). |
| **Frontend** | `frontend/` | Dashboard pages, charts, and the chat panel. |
| **Database / DevOps / Docs** | `db/`, `docker-compose.yml`, `docs/` | Schema, Docker setup, README, diagrams, and report material. |

```
NIDS_Capstone/
│
├── docker-compose.yml          # Starts every service with one command
├── .env.example                # Template for local settings (copy to .env)
├── .gitignore                  # Keeps .env, datasets, and models out of Git
├── README.md                   # You are here
│
├── detection/                  # [container] Traffic in -> alerts out
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── src/
│       ├── main.py             #   Entry point, runs the pipeline loop
│       ├── capture.py          #   Packets in: live sniffing or .pcap replay
│       ├── flows.py            #   Groups packets into connections
│       ├── features.py         #   Flow -> numeric features (shared with training)
│       ├── devices.py          #   Tracks devices seen, flags unknown ones
│       ├── predict.py          #   Loads the model, classifies traffic
│       ├── rules/              #   Cyber Security part: port scan, repeated logins, unknown device
│       ├── risk.py             #   Assigns low / medium / high / critical
│       ├── alerts.py           #   Merges ML + rules, removes duplicates
│       └── db.py               #   Saves results to PostgreSQL
│
├── machine_learning/           # Offline work, not a running service
│   ├── pyproject.toml
│   ├── notebooks/              #   Data exploration and experiments
│   ├── train.py                #   Trains the model, saves model.joblib
│   ├── evaluate.py             #   Accuracy, precision/recall, confusion matrix
│   └── models/                 #   Saved models (gitignored, shared via Releases)
│
├── backend/                    # [container] FastAPI: serves data + AI assistant
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── app/
│       ├── main.py             #   App startup
│       ├── routes/             #   alerts.py, devices.py, connections.py, assistant.py
│       ├── llm/                #   client.py, prompts.py, tools.py (LLM explanations + chat)
│       └── db.py               #   Database connection
│
├── frontend/                   # [container] Dashboard
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── pages/              #   Overview, Devices, Connections, Alerts
│       └── components/         #   Charts, alert table, chat panel
│
└── database/                   #   (planned)
    └── init.sql                #   Tables: devices, flows, alerts
```

Important: `detection/src/features.py` is shared by training and live detection. If you change how features are computed, the model must be retrained, otherwise accuracy will collapse.

---

## 5. Note to the team

Everything in this repo is a **starting preview**, not a final design. Folder names, the architecture, and especially every **Dockerfile** will probably change as we build and learn. You are free to change them for whatever you want to try: add dependencies, switch libraries, restructure your folder, or add new services to `docker-compose.yml`. Just tell the team in the pull request or chat when a change affects others (ports, environment variables, shared code).

---

## 6. Git workflow

1. **Never push directly to `main`.** Always create a new branch: `git checkout -b feature/short-name`
2. Commit small and often, then push your branch and open a Pull Request.
3. At least one teammate reviews before merging.
4. Never commit `.env`, datasets, `.pcap` files, or model files.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to the Docker daemon` | Docker Desktop is not running. Open it and wait until it says it is running. |
| `port is already allocated` | Something else uses that port. Stop it, or change the left side of the port mapping in `docker-compose.yml` (e.g. `"3001:3000"`). |
| Backend cannot connect to the database | Run `docker compose logs db`. If you changed the password in `.env` after the first run, do `docker compose down -v` and start again. |
| Schema changes in `db/init.sql` not applied | `init.sql` only runs on a fresh database. Run `docker compose down -v`, then `up` again. |
| Detection says model not found | Check that `ml/models/model.joblib` exists. |
| Dashboard loads but shows no data | Check `docker compose logs detection` and confirm `data/sample.pcap` exists. |
| Changes to code do not show up | Rebuild: `docker compose up --build <service>`. |
