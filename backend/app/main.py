from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth,health,patients,games,sessions,adaptive,telemetry,sync,dashboard,alerts,family,reminders,speech,content
app=FastAPI(title=settings.app_name,description='Backend for NeuroSetu cognitive gaming, memory assistance, voice and caregiver/ASHA services',version='2.0.0')
app.add_middleware(CORSMiddleware,allow_origins=settings.cors_list,allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
app.include_router(health.router); app.include_router(auth.router); app.include_router(patients.router); app.include_router(games.router); app.include_router(sessions.router); app.include_router(adaptive.router); app.include_router(telemetry.router); app.include_router(sync.router); app.include_router(dashboard.router); app.include_router(alerts.router); app.include_router(family.router); app.include_router(reminders.router); app.include_router(speech.router); app.include_router(content.router)
