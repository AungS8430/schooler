from os import getenv
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi_nextauth_jwt import NextAuthJWT

# load .env
load_dotenv()

app = FastAPI()

# get secret env
JWT_secret = getenv("secret")
if JWT_secret is None:
    raise Exception("JWT secret does not exist.")

# load JWT
JWT = NextAuthJWT(secret=JWT_secret)


@app.get("/")
async def bounce_jwt(jwt: Annotated[dict, Depends(JWT)]):
    return jwt
