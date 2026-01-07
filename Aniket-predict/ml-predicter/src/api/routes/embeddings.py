from fastapi import APIRouter

router = APIRouter(prefix="/embeddings", tags=["embeddings"])

@router.get("/")
async def get_embeddings():
    return {"message": "Embeddings endpoint"}
