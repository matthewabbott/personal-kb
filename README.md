# Personal Knowledge Base

A webapp for exploring and searching my GitHub repositories, hosted on my webpage.

## (Planned) System Architecture

```mermaid
flowchart TD
    subgraph GitHub
        GH[GitHub Repos]
    end

    subgraph "GitHub Action"
        GA[Scheduled Action] --> |Fetch Repo Data| P[Process & Cache]
        P --> |Save| C[Cached JSON]
    end

    subgraph "Web Application"
        FE[React Frontend] --> |Read| C
        FE --> |Lazy Load| GH
    end

    subgraph "Future Extensions"
        FE -.-> |Potential| OT[Other Sources]
    end
```

## Features

### Current
Uhhh, look we're still a bit early, alright...

### Planned
- GitHub repository explorer
  - Repository metadata display
  - Search functionality
  - Cached data updates via GitHub Actions
- Repository content exploration
  - README previews
  - File browser
  - Code snippet search
- Repository statistics
  - Language distribution
  - Commit activity
  - Contribution graphs

## Technical Stack

- **Frontend**: React + TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Deployment**: NGINX on VPS
- **Data Updates**: GitHub Actions

## Development

1. Clone the repository:
```bash
git clone https://github.com/matthewabbott/personal-kb.git
cd personal-kb
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

## Deployment

The application is deployed at [mbabbott.com/personal-kb](https://mbabbott.com/personal-kb)

```
# Clone the repo for development/building
cd /root
git clone https://github.com/matthewabbott/personal-kb.git
cd personal-kb

# Create the production directory
mkdir -p /var/www/html/personal-kb/data

# Build the project
npm install
npm run build

# Copy the built files to the web directory
cp -r dist/* /var/www/html/personal-kb/`

# Make data cache script executable
chmod +x /root/update-github-cache.sh