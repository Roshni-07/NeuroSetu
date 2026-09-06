from fastapi import FastAPI

app = FastAPI(
    title="NeuroSetu API",
    description="Backend API for the NeuroSetu cognitive assistance platform",
    version="1.0.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}