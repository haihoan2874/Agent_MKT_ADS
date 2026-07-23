#!/usr/bin/env python3
import sys
import urllib.request
import urllib.error
import os

def fetch_agent(agent_path):
    # Base URL for the raw file on GitHub
    base_url = "https://raw.githubusercontent.com/msitarzewski/agency-agents/main/"
    
    # Strip leading slash if any
    agent_path = agent_path.strip("/")
    
    # Construct full URL
    url = base_url + agent_path
    
    # Extract filename from path
    filename = os.path.basename(agent_path)
    
    # Determine destination path (.agent/agents/filename)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    agents_dir = os.path.abspath(os.path.join(script_dir, "..", "agents"))
    
    if not os.path.exists(agents_dir):
        print(f"Error: Agents directory not found at {agents_dir}")
        sys.exit(1)
        
    dest_path = os.path.join(agents_dir, filename)
    
    print(f"Fetching agent from: {url}")
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            
        with open(dest_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"✅ Successfully downloaded agent to: {dest_path}")
        print("Note: You may need to review the downloaded agent and update its header to match your .agent framework conventions.")
        
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print(f"❌ Error 404: File not found at {url}")
            print("Please check the path in the repository (e.g., 'marketing/marketing-seo-specialist.md')")
        else:
            print(f"❌ HTTP Error: {e.code} - {e.reason}")
    except Exception as e:
        print(f"❌ An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fetch_agency_agent.py <path_in_repo>")
        print("Example: python fetch_agency_agent.py marketing/marketing-seo-specialist.md")
        sys.exit(1)
        
    fetch_agent(sys.argv[1])
