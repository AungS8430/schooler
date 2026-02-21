"""Resources routes."""
from typing import Optional
from fastapi import APIRouter
from app.domain.resources import load_resources

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("")
def get_resources(
    search: Optional[str] = None,
    category: Optional[str] = None,
):
    """Get available school resources."""
    resources = load_resources()
    if search is not None:
        resources = [
            resource
            for resource in resources
            if search.lower() in resource["title"].lower()
        ]
    if category is not None:
        resources = [resource for resource in resources if category in resource["categories"]]
    return {"resources": resources}

@router.get("/categories")
def get_resource_categories():
    """Get available resource categories."""
    resources = load_resources()
    categories = set(category for resource in resources for category in resource["categories"])
    return {"categories": list(categories)}