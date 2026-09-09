from fastapi import APIRouter,UploadFile,File,HTTPException,Depends
from app.schemas.speech import SpeechTextRequest
from app.services.speech_service import bhashini
from app.core.dependencies import current_claims
router=APIRouter(prefix='/api/v1/speech',tags=['Voice Assistant'])
@router.post('/asr')
async def asr(audio:UploadFile=File(...),language:str='en',claims=Depends(current_claims)):
    data=await audio.read()
    if not data: raise HTTPException(400,'Empty audio file')
    payload={'pipelineTasks':[{'taskType':'asr','config':{'language':{'sourceLanguage':language},'serviceId':''}}],'inputData':{'audio':[{'audioContent':__import__('base64').b64encode(data).decode()}]}}
    return {'success':True,'data':await bhashini(payload),'error':None}
@router.post('/tts')
async def tts(req:SpeechTextRequest,claims=Depends(current_claims)):
    payload={'pipelineTasks':[{'taskType':'tts','config':{'language':{'sourceLanguage':req.language},'gender':req.gender,'samplingRate':16000}}],'inputData':{'input':[{'source':req.text}]}}
    return {'success':True,'data':await bhashini(payload),'error':None}
