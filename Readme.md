# 🎬 Secure 3-Tier Docker App: Movie Watchlist (Compose Edition)

A production-grade, containerized **Three-Tier Movie Watchlist application** automated with Docker Compose and deployed on an AWS EC2 instance.

This repository demonstrates the transition from an open public-mesh architecture to a secure **Reverse Proxy Pattern**. By locking down the application tier and database layer within an isolated internal virtual network, the system exposes only a single hardened entry point **(Port 80)** to the public internet.


![App Demo](ss\preview_live.gif)


---

## 🗺️ System Architecture & Secure Network Flow

The application workspace operates on a dual-pane layout: a dynamic movie management portal on the left, and an interactive structural infrastructure map on the right.

### The Secure Request Lifecycle

| Step | Description |
|------|-------------|
| **1 — Asset Delivery** | The user connects to the EC2 Public IP via HTTP. The Nginx gateway container (`watchlist-frontend`) intercepts the request on public **Port 80** and delivers the static bundle (`index.html`, `script.js`, and styling) directly to the client browser. |
| **2 — Local Client Execution** | The UI code executes entirely within the user's browser RAM on their local machine, operating detached from the cloud system's core kernel. |
| **3 — Proxy Entry Point** | When a user clicks **"Add Movie"**, the browser transmits an HTTP request to the relative path `/api/movies`. Because this path is relative, the traffic routes back directly to Nginx on public **Port 80**. |
| **4 — Internal Reverse Proxy Forwarding** | Nginx acts as a security guard — it traps incoming requests to `/api/` and routes them **internally** across the isolated virtual bridge network (`watchlist-net`) directly to `http://watchlist-backend:5000`. |
| **5 — Isolated Database Transaction** | The Node.js API container (`watchlist-backend`) handles the operation, sanitizes input parameters, and establishes a secure socket pipeline to the PostgreSQL database container (`postgres-db`) on private **Port 5432**. |

---



## ⚙️ Component Blueprint & Port Matrix

| Tier Component | Container Name | Host Port (EC2 Public) | Internal Network (`watchlist-net`) | Role |
|:---|:---|:---|:---|:---|
| **Frontend Gateway** | `watchlist-frontend` | `80` *(Open to Public)* | ✅ Connected | Delivers UI files & handles reverse proxy routing |
| **Backend API** | `watchlist-backend` | *None* — **Strictly Closed** | ✅ Connected | Captures internal Nginx proxy traffic and executes queries |
| **Database Vault** | `postgres-db` | *None* — **Strictly Closed** | ✅ Connected | Houses sensitive persistent application data records |

> 🔒 **Security Win:** `watchlist-backend` and `postgres-db` map **no host ports** — they are invisible to external internet port scanners and brute-force arrays.

---

## 🔗 Connectivity Map

The multi-tier bridge connectivity is established across three configuration files:

**`frontend/script.js` → Relative API Endpoint**
```js
const API_URL = '/api/movies';
```
Forces the client browser to pass all requests to Port 80, masking the backend engine completely.

**`frontend/nginx.conf` → Reverse Proxy Mapping**
```nginx
location /api/ {
    proxy_pass http://watchlist-backend:5000;
}
```
Houses the core routing rule that shifts traffic across the boundary layer.

**`docker-compose.yml` → Service Isolation & Sequencing**
- Connects all three containers via the `networks:` block.
- Shuts down external access to the backend by omitting `ports:` from the API layer.
- Uses `depends_on` to block the API from starting until the database finishes boot setup.

---

## 🛡️ AWS Firewall Configuration

Since Nginx handles all public interface tasks, minimize your EC2 Inbound Security Group Rules to the following:

| Port | Protocol | Source | Purpose |
|------|----------|--------|---------|
| `22` | SSH | Your IP only | Terminal administration |
| `80` | HTTP | `0.0.0.0/0` | Client access to the app |
| `5000` | Custom TCP | — | ❌ Can be completely deleted |
| `5432` | PostgreSQL | — | 🔒 Keep completely closed |

---

## 🚀 Deployment

### Step 1 — Clone and Navigate

```bash
git clone <your-repository-url>
cd movie-watchlist
```

### Step 2 — Set Up Database Credentials

Ensure your credentials file exists inside the `db/` folder before launching:

```bash
cat db/.env
```

Verify it lists valid `POSTGRES_USER` and `POSTGRES_PASSWORD` parameters.

### Step 3 — Launch the Cluster

Build images, create the network layer, and spin up all containers in the background:

```bash
docker compose up -d --build
```

---

![Docker Compose Build](ss\compose_build.png)


## 🔍 Verification & Diagnostics

**Check container status — confirm only Port 80 is mapped to the public host:**
```bash
docker compose ps
```
![Docker Compose PS](ss\compose_ps.png)

**Stream live backend logs through the reverse proxy:**
```bash
docker compose logs watchlist-backend
```