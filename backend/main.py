#  FastAPI-backend med endpoints för alla appfunktioner.


#  Starta servern:  uvicorn main:app --reload --port 8000


from fastapi import FastAPI, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, EmailStr

from typing import Optional

import bcrypt

from database import get_connection, get_cursor



app = FastAPI(title="Aspire API", version="1.0")



#Tillåt CORS från frontend (HTML-filerna på localhost)

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],   #byt till specifik URL i produktion

    allow_methods=["*"],

    allow_headers=["*"],

)


#  Pydandicmodeller (validering av request-body)



class RegistreraRequest(BaseModel):

    email: EmailStr

    losenord: str

    namn: Optional[str] = None



class LoggaInRequest(BaseModel):

    email: EmailStr

    losenord: str



class UppdateraProfil(BaseModel):

    namn:     Optional[str]   = None

    vikt_kg:  Optional[float] = None

    langd_cm: Optional[int]   = None



class KaloriRequest(BaseModel):

    anvandare_id: str

    maltidstyp:   str          # 'Frukost' | 'Lunch' | 'Middag' | 'Mellanmal'

    kcal:         int

    notering:     Optional[str] = None



class TraningspassRequest(BaseModel):

    anvandare_id: str

    anteckning:   Optional[str] = None



class OvningRequest(BaseModel):

    pass_id:     int

    ovning_namn: str

    set_antal:   Optional[int]   = None

    reps:        Optional[int]   = None