from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    text : str = None
    is_done : bool = False


items = []

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/items")
def create_item_query(item: Item = None):
    if item:
        items.append(item)
        return items
    return {"error": "No item provided"}


@app.get("/items", response_model=list[Item])
def list_items(limit: int = 10):
    return items[0:limit]


@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int) -> Item:
    if item_id < 0 or item_id >= len(items):
        raise HTTPException(status_code=404, detail=f"Item {item_id} not found")

    return items[item_id]



  