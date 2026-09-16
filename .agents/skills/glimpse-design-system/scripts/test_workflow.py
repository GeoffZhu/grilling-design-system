"""Run with python3 -m unittest discover -s scripts -p 'test_*.py'."""
import copy
import tempfile
from pathlib import Path
import unittest
from studio import init, publish, decide, read, digest, reopen, write, validate_visual_review
from language import translated_copy

class WorkflowTest(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.root=Path(self.temp.name)/'session'
        image=Path(self.temp.name)/'image.png';image.write_bytes(b'test fixture')
        init(self.root,image,'Workflow test',True)
        (self.root/'preview.html').write_text('<h1>Fixture</h1>')
        (self.root/'intent.md').write_text('Fixture design intent')
        (self.root/'screenshot.png').write_bytes(b'test screenshot fixture')
    def tearDown(self): self.temp.cleanup()
    def publish(self,stage):
        option={'id':'a','title':'A','description':'Test option','preview':'preview.html'}
        if stage in ['direction','foundations']: option['tokens']={'revision':1}
        else:
            option['tokenHash']=digest(read(self.root/'session.json')['accepted']['foundations']['tokens'])
            option['visualReview']='visual-review.json'
            write(self.root/'visual-review.json',{'tokenHash':option['tokenHash'],'intent':'intent.md','screenshots':['screenshot.png'],
                  'observations':[{'area':area,'finding':'Fixture observation','action':'Fixture correction','verification':'Fixture reinspection'} for area in ['reference','typography','spacing','shape','icons','states','composition','copy']], 'unresolved':[]})
        options=[{**option,'id':i} for i in ['a','b']]
        spec={'stage':stage,'options':options,'title':stage,'description':'Test'}
        if stage=='foundations': spec['covers']=['color','typography','spacing','shape','icons','motion']
        if stage=='preview': spec['checks']={k:'fixture evidence' for k in ['build','desktop','mobile','keyboard','contrast']}
        return publish(self.root,spec)
    def choose(self,action='select',**extra):
        s=read(self.root/'session.json')
        return decide(self.root,dict(roundId=s['round']['id'],optionId='a',action=action,**extra))
    def advance(self):
        for stage in ['direction','foundations','components']:
            self.publish(stage);self.choose()
        self.publish('preview')
    def test_feedback_invalidates_downstream_and_requires_reapproval(self):
        self.advance()
        state=self.choose('revise',feedback='Increase icon stroke')
        self.assertEqual(state['nextStage'],'foundations')
        self.assertEqual(set(state['accepted']),{'direction'})
        self.assertIsNone(state['approval'])
        for stage in ['foundations','components']:
            self.publish(stage);self.choose()
        self.publish('preview');state=self.choose('approve')
        self.assertEqual(state['status'],'approved')
        self.assertTrue(state['approval']['simulation'])
        self.assertEqual(len(state['history']),7)
        reopen(self.root,'Change primary color')
        self.assertEqual(read(self.root/'session.json')['nextStage'],'foundations')
    def test_stale_and_duplicate_submission(self):
        s=self.publish('direction')
        with self.assertRaises(ValueError): decide(self.root,dict(roundId='old',action='select',optionId='a'))
        self.choose()
        with self.assertRaises(ValueError): decide(self.root,dict(roundId=s['round']['id'],action='select',optionId='a'))
    def test_cannot_skip_stage_or_approve_early(self):
        with self.assertRaises(ValueError): self.publish('foundations')
        self.publish('direction')
        with self.assertRaises(ValueError): self.choose('approve')
    def test_combined_preferences_need_new_preview(self):
        self.publish('direction')
        state=self.choose(combination='A colors with B icons')
        self.assertEqual(state['nextStage'],'direction')
        self.assertEqual(state['accepted'],{})
    def test_multiple_choices_are_saved_without_approval(self):
        s=self.publish('direction')
        state=decide(self.root,{'roundId':s['round']['id'],'optionIds':['a','b'],'action':'select','source':'ask-user-question'})
        self.assertEqual(state['nextStage'],'direction')
        self.assertEqual(state['accepted'],{})
        self.assertEqual(state['history'][-1]['optionIds'],['a','b'])
        self.assertEqual(state['history'][-1]['action'],'revise')
        self.assertEqual(state['history'][-1]['source'],'ask-user-question')
        self.assertIsNone(state['approval'])
    def test_final_multi_select_requires_revision(self):
        self.advance()
        s=read(self.root/'session.json')
        data={'roundId':s['round']['id'],'optionIds':['a','b'],'action':'approve'}
        with self.assertRaises(ValueError): decide(self.root,data)
        self.assertEqual(read(self.root/'session.json'),s)
        data['action']='revise'
        result=decide(self.root,data)
        self.assertEqual(result['nextStage'],'foundations')
        self.assertEqual(set(result['accepted']),{'direction'})
    def test_reject_invalid_selection_without_mutation(self):
        s=self.publish('direction')
        for ids in [[],['unknown'],['a','a'],'a',[{}]]:
            with self.subTest(ids=ids), self.assertRaises(ValueError):
                decide(self.root,{'roundId':s['round']['id'],'optionIds':ids,'action':'select'})
            self.assertEqual(read(self.root/'session.json'),s)
    def test_every_new_round_requires_two_options(self):
        option={'id':'a','title':'A','description':'Test','preview':'preview.html','tokens':{}}
        for ids in [['a'],['a','b','c']]:
            with self.assertRaises(ValueError):
                publish(self.root,{'stage':'direction','options':[{**option,'id':i} for i in ids]})
        self.assertEqual(read(self.root/'session.json')['revision'],0)
    def test_language_and_custom_translation(self):
        self.assertEqual(translated_copy('zh-CN')['desktop'],'电脑')
        self.assertEqual(translated_copy('en-GB')['desktop'],'Desktop')
        with self.assertRaises(ValueError): translated_copy('ja')
        labels={key:'翻訳' for key in translated_copy('en')}
        labels['desktop']='パソコン'
        self.assertEqual(translated_copy('ja',labels)['desktop'],'パソコン')
        del labels['desktop']
        with self.assertRaises(ValueError): translated_copy('ja',labels)
    def test_preview_approval_rejects_unprocessed_feedback(self):
        self.advance()
        before=read(self.root/'session.json')
        with self.assertRaises(ValueError): self.choose('approve',feedback='But fix the padding')
        self.assertEqual(read(self.root/'session.json'),before)
    def test_resume_and_stale_tokens(self):
        self.publish('direction');self.choose();self.publish('foundations');self.choose()
        before=read(self.root/'session.json')
        self.assertEqual(before['status'],'needs-agent')
        with self.assertRaises(ValueError): publish(self.root,{'stage':'components','options':[{'id':'a','title':'a','description':'x','preview':'preview.html','tokenHash':'stale'}]})
        self.assertEqual(read(self.root/'session.json'),before)
    def test_visual_review_rejects_absent_evidence_and_unresolved_issues(self):
        with self.assertRaises(ValueError): validate_visual_review(self.root,{},'hash')
        self.publish('direction');self.choose();self.publish('foundations');self.choose();self.publish('components')
        spec=read(self.root/'session.json')['round']['options'][0]
        review=read(self.root/'visual-review.json')
        review['unresolved']=['Overlapping labels on Mobile']
        write(self.root/'visual-review.json',review)
        with self.assertRaises(ValueError): validate_visual_review(self.root,spec,spec['tokenHash'])
        review['unresolved']=[];review['tokenHash']='old'
        write(self.root/'visual-review.json',review)
        with self.assertRaises(ValueError): validate_visual_review(self.root,spec,spec['tokenHash'])
        review['tokenHash']=spec['tokenHash'];review['screenshots']=['missing.png']
        write(self.root/'visual-review.json',review)
        with self.assertRaises(ValueError): validate_visual_review(self.root,spec,spec['tokenHash'])

if __name__=='__main__':unittest.main()
