"""Resources routes."""
from fastapi import APIRouter

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("")
def get_resources():
    """Get available school resources."""
    return {
        "id": 1,
        "title": "Example Resource",
        "author": "Jeffery Doe",
        "url": "https://drive.google.com/drive/u",
        "categories": ["default", "default"],
    }

