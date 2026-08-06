<<<<<<< HEAD
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
=======
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
>>>>>>> 265882bf299e67546edea3b37a18165c6fa8a344
    user_id: Optional[str] = None