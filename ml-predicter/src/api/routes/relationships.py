from fastapi import APIRouter

router = APIRouter(prefix="/relationships", tags=["relationships"])

@router.get("/")
async def get_relationships():
    return {"message": "Relationships endpoint"}
