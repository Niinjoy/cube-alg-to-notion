import os, requests
from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

NOTION_KEY = os.environ.get("NOTION_KEY")
NOTION_DATABASE_ID = os.environ.get("NOTION_DATABASE_ID")

body = {
    "parent": {"type": "database_id", "database_id": NOTION_DATABASE_ID},
    "properties": {
        "name": {"title": [{"type": "text", "text": {"content": "PLL01"}}]},
        "algset": {"rich_text": [{"text": {"content": "PLL"}}]},
    },
}

requests.request(
    "POST",
    "https://api.notion.com/v1/pages",
    json=body,
    headers={"Authorization": "Bearer " + NOTION_KEY, "Notion-Version": "2021-05-13"},
)