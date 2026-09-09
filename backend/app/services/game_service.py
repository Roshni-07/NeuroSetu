GAMES = [
('care_for_your_companion','Care for Your Companion','executive','Choose the correct care action for a familiar companion.'),
('daily_routine_recall','Daily Routine Recall','memory','Recall the order and details of a daily routine.'),
('day_in_my_village','Day in My Village','memory','Recognize and recall familiar village scenes.'),
('festival_memory_match','Festival Memory Match','memory','Match culturally familiar festival items and memories.'),
('find_the_difference','Find the Difference','attention','Find visual differences between familiar scenes.'),
('finish_grandmas_weave','Finish Grandma’s Weave','executive','Complete a simple visual weaving pattern.'),
('grandmas_shopping_list','Grandma’s Shopping List','memory','Remember and select items from a shopping list.'),
('memory_map_home','Memory Map Home','memory','Navigate and recall locations in a familiar home.'),
('pack_village_basket','Pack Village Basket','executive','Select and organize items needed for a task.'),
('remember_the_story','Remember the Story','memory','Listen/read a short story and answer recall questions.'),
('shell_memory_trail','Shell Memory Trail','attention','Follow and remember a sequence of objects.'),
('tea_garden_detective','Tea Garden Detective','attention','Find clues and relevant objects in a tea garden.'),
('what_belongs_here','What Belongs Here','executive','Place familiar objects in their appropriate context.'),
('whose_emotion','Whose Emotion','social_cognition','Identify emotions from everyday situations.'),
('whose_morning_is_it','Whose Morning Is It','memory','Match a morning routine to the correct person.'),
]

def catalog():
    return [{'id':i,'name':n,'cognitive_domain':d,'description':x,'levels':10} for i,n,d,x in GAMES]

def get_game(game_id):
    return next((g for g in catalog() if g['id']==game_id), None)
