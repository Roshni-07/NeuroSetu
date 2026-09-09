from app.core.supabase import get_supabase

def update_settings(pid,data): return get_supabase().table('patient_profiles').update(data).eq('id',pid).execute().data[0]

def daily_plan(patient):
    cap=int(patient.get('daily_cap') or 3); stage=(patient.get('dementia_stage') or 'mild').lower()
    domains=patient.get('active_cognitive_domains') or ['attention','memory','executive']
    from app.services.game_service import catalog
    eligible=[g for g in catalog() if g['cognitive_domain'] in domains]
    if not eligible: eligible=catalog()
    start={'mild':3,'early':3,'moderate':2,'middle':2,'severe':1,'late':1}.get(stage,3)
    plan=[]
    for i in range(cap): plan.append(eligible[(i+start)%len(eligible)])
    return {'count':len(plan),'games':plan,'stage':stage}
