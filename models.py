from pydantic import BaseModel
from typing import Optional

class CreateUser(BaseModel):
    user_id: str
    name: str
    bio: Optional[str] = None

class CreatePost(BaseModel):
    content: str
    tags: list[str] = []
    
class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None