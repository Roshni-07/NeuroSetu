from fastapi import APIRouter
from app.services.game_service import catalog,get_game
router=APIRouter(prefix='/api/v1/games',tags=['Games'])
@router.get('')
def games(): return {'success':True,'data':catalog(),'error':None}
@router.get('/{game_id}')
def game(game_id):
    g=get_game(game_id)
    return {'success':bool(g),'data':g,'error':None if g else 'Game not found'}
