# Personal Knowledge Base

A React application for exploring and searching GitHub repositories, providing an organized view of repository metadata with README previews and language statistics.

## System Architecture

```mermaid
flowchart TD
    subgraph GitHub
        GH[GitHub API] --> |Fetch Repos| FE
        GH --> |Fetch READMEs| FE
    end

    subgraph "Browser"
        FE[React Frontend] --> |Store| LC[LocalStorage Cache]
        LC --> |Read| FE
    end

    subgraph "Components"
        FE --> |Renders| MD[Markdown]
        FE --> |Renders| LS[Language Stats]
    end
```

## Features

- GitHub repository explorer with search and metadata display
- Markdown rendering with code highlighting and diagram support
- Language statistics visualization
- Client-side caching
- Dark/light theme support

## Technical Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- react-markdown
- Mermaid.js

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

## Future Enhancements

- Server-side caching
- File browser functionality
- Code snippet search
- Extended repository statistics
- Integration with additional knowledge sources

## Directory Structure

```
personal-kb/
├── src/
│   ├── components/                     # React components
│   │   ├── GitHubExplorer/            # Main repository explorer component
│   │   │   ├── index.tsx              # Repository listing and search
│   │   │   └── LanguageStats.tsx      # Language distribution visualization
│   │   └── MarkdownRenderer/          # Repo README rendering component
│   │       └── index.tsx              # Markdown with code highlighting & diagrams
│   ├── styles/
│   │   └── index.css                  # Global styles and Tailwind configuration
│   ├── utils/
│   │   └── cache.ts                   # LocalStorage caching implementation
│   ├── App.tsx                        # Root application component
│   └── main.tsx                       # Application entry point
├── index.html                         # HTML entry point
├── tailwind.config.js                 # Tailwind CSS configuration
└── package.json                       # Project dependencies and scripts
```

## Production Deployment

The application is deployed at [mbabbott.com/personal-kb](https://mbabbott.com/personal-kb)

### Deployment Steps

1. Clone and build:
```bash
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
cp -r dist/* /var/www/html/personal-kb/
```

2. Set up data caching:
```bash
# Make data cache script executable
chmod +x /root/update-github-cache.sh

# Add to crontab to run hourly
crontab -e
# Add: 0 * * * * /root/personal-kb/update-github-cache.sh
```

3. Configure nginx:
```nginx
# Add to your nginx configuration
	location /personal-kb {
		alias /var/www/html/personal-kb;
		try_files $uri $uri/ /personal-kb/index.html;
		
		location ~* \.js$ {
			add_header Content-Type application/javascript;
		}
		
		location ~* \.css$ {
			add_header Content-Type text/css;
		}
	}

	location /personal-kb/data/ {
		alias /var/www/html/personal-kb/data/;
		add_header Cache-Control "no-cache";
		add_header Access-Control-Allow-Origin "*";
	}
```