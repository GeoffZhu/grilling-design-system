"""Run with python3 -m unittest discover -s scripts -p 'test_*.py'."""
import copy
import tempfile
from pathlib import Path
import unittest
from studio import init, publish, decide, read, digest, reopen, write, validate_visual_review, finish
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
    def publish(self,stage,review_type=None):
        review_type=review_type or ('presentation' if stage=='preview' else 'choice')
        option={'id':'a','title':'A','description':'Test option','preview':'preview.html'}
        if stage in ['direction','foundations']: option['tokens']={'revision':1}
        else:
            option['tokenHash']=digest(read(self.root/'session.json')['accepted']['foundations']['tokens'])
            option['visualReview']='visual-review.json'
            write(self.root/'visual-review.json',{'tokenHash':option['tokenHash'],'intent':'intent.md','screenshots':['screenshot.png'],
                  'observations':[{'area':area,'finding':'Fixture observation','action':'Fixture correction','verification':'Fixture reinspection'} for area in ['reference','typography','spacing','shape','icons','states','composition','copy']], 'unresolved':[]})
        options=[{**option,'id':i} for i in (['a','b'] if review_type=='choice' else ['a'])]
        spec={'stage':stage,'reviewType':review_type,'options':options,'title':stage,'description':'Test'}
        if review_type=='derived': spec['derivation']='Derived from the reference and existing choices'
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
    def test_multiple_choices_are_rejected_without_mutation(self):
        s=self.publish('direction')
        with self.assertRaises(ValueError):
            decide(self.root,{'roundId':s['round']['id'],'optionIds':['a','b'],'action':'select','source':'ask-user-question'})
        self.assertEqual(read(self.root/'session.json'),s)
        state=decide(self.root,{'roundId':s['round']['id'],'optionIds':['b'],'action':'select','source':'ask-user-question'})
        self.assertEqual(state['accepted']['direction']['id'],'b')
        self.assertEqual(state['history'][-1]['source'],'ask-user-question')
    def test_presentation_has_one_design_and_accepts_freeform_revision(self):
        self.advance()
        s=read(self.root/'session.json')
        self.assertEqual(len(s['round']['options']),1)
        self.assertEqual(s['round']['reviewType'],'presentation')
        data={'roundId':s['round']['id'],'optionIds':['a','b'],'action':'approve'}
        with self.assertRaises(ValueError): decide(self.root,data)
        self.assertEqual(read(self.root/'session.json'),s)
        data.update(action='revise',optionIds=[],feedback='Increase the field spacing')
        result=decide(self.root,data)
        self.assertEqual(result['nextStage'],'foundations')
        self.assertEqual(set(result['accepted']),{'direction'})
    def test_reject_invalid_selection_without_mutation(self):
        s=self.publish('direction')
        for ids in [[],['unknown'],['a','a'],'a',[{}]]:
            with self.subTest(ids=ids), self.assertRaises(ValueError):
                decide(self.root,{'roundId':s['round']['id'],'optionIds':ids,'action':'select'})
            self.assertEqual(read(self.root/'session.json'),s)
    def test_choice_requires_two_options(self):
        option={'id':'a','title':'A','description':'Test','preview':'preview.html','tokens':{}}
        for ids in [['a'],['a','b','c']]:
            with self.assertRaises(ValueError):
                publish(self.root,{'stage':'direction','options':[{**option,'id':i} for i in ids]})
        self.assertEqual(read(self.root/'session.json')['revision'],0)
    def test_language_and_custom_translation(self):
        self.assertEqual(translated_copy('en-GB')['desktop'],'Desktop')
        with self.assertRaises(ValueError): translated_copy('zh-CN')
        with self.assertRaises(ValueError): translated_copy('ja')
        labels={key:'Translated fixture' for key in translated_copy('en')}
        labels['desktop']='Localized desktop fixture'
        self.assertEqual(translated_copy('ja',labels)['desktop'],'Localized desktop fixture')
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
        with self.assertRaisesRegex(ValueError,'tokenHash'):
            publish(self.root,{'stage':'components','reviewType':'derived','derivation':'Existing rules', 'options':[{'id':'a','title':'a','description':'x','preview':'preview.html','tokenHash':'stale'}]})
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
    def test_derived_checkpoints_advance_without_user_answers(self):
        for stage in ['direction','foundations','components']:
            state=self.publish(stage,'derived')
            self.assertEqual(state['status'],'needs-agent')
            self.assertEqual(state['history'][-1]['source'],'agent-derived')
            self.assertEqual(state['history'][-1]['action'],'derive')
        state=self.publish('preview')
        self.assertEqual(state['status'],'awaiting-user')
        self.assertIsNone(state['approval'])
        state=self.choose('approve',source='chat')
        self.assertEqual(state['status'],'approved')
    def test_cannot_derive_away_a_pending_question(self):
        before=self.publish('direction')
        with self.assertRaises(ValueError): self.publish('direction','derived')
        self.assertEqual(read(self.root/'session.json'),before)
    def test_planned_questions_can_share_a_stage(self):
        self.publish('direction','derived')
        option={'title':'Controls','description':'Test','preview':'preview.html','tokens':{'revision':1}}
        state=publish(self.root,{'stage':'foundations','continueStage':True,
            'covers':['color','typography','spacing','shape','icons','motion'],
            'options':[{**option,'id':i} for i in ['a','b']]})
        state=self.choose()
        self.assertEqual(state['nextStage'],'foundations')
        self.assertEqual(state['accepted']['foundations']['id'],'a')
        self.publish('foundations');state=self.choose()
        self.assertEqual(state['nextStage'],'components')
        self.assertEqual([h['stage'] for h in state['history']],['direction','foundations','foundations'])
    def test_presentation_rejects_choices_and_derived_mode(self):
        for stage in ['direction','foundations','components']:
            self.publish(stage,'derived')
        before=read(self.root/'session.json')
        for review_type in ['choice','derived']:
            with self.assertRaises(ValueError): self.publish('preview',review_type)
            self.assertEqual(read(self.root/'session.json'),before)
    def test_derived_rationale_and_specimen_viewport_validation(self):
        option={'id':'a','title':'A','description':'Test','preview':'preview.html','tokens':{},
                'viewports':[{'device':'specimen','width':800,'height':400}]}
        spec={'stage':'direction','reviewType':'derived','options':[option]}
        with self.assertRaises(ValueError): publish(self.root,spec)
        spec['derivation']='Use the supplied reference geometry'
        option['viewports'][0]['width']=0
        with self.assertRaises(ValueError): publish(self.root,spec)
        option['viewports'][0]['width']=800
        state=publish(self.root,spec)
        self.assertEqual(state['nextStage'],'foundations')
    def test_source_inspection_requires_disclosed_limitations(self):
        self.publish('direction','derived');self.publish('foundations','derived');self.publish('components','derived')
        spec=read(self.root/'session.json')['round']['options'][0]
        review=read(self.root/'visual-review.json')
        review.update(method='source-inspection',screenshots=[])
        write(self.root/'visual-review.json',review)
        with self.assertRaises(ValueError): validate_visual_review(self.root,spec,spec['tokenHash'])

        review['limitations']=['No browser capture available; layout and keyboard behavior remain unverified']
        write(self.root/'visual-review.json',review)
        self.assertTrue(validate_visual_review(self.root,spec,spec['tokenHash']))
        review['unresolved']=['Known overflow defect']
        write(self.root/'visual-review.json',review)
        with self.assertRaises(ValueError): validate_visual_review(self.root,spec,spec['tokenHash'])

    def test_native_delivery_checks_root_document_and_preserves_host(self):
        from test_design_document import DesignDocumentTest
        self.advance();self.choose('approve')
        host=Path(self.temp.name)/'web'
        module=host/'src/design-system';module.mkdir(parents=True)
        doc=host/'DESIGN.md';doc.write_text(DesignDocumentTest().completed_fixture())
        write(self.root.parent/'project-context.json',{'mode':'integrated','webRoot':str(host),
                                                       'output':str(module),'designDoc':str(doc)})
        state=read(self.root/'session.json')
        evidence={'path':str(module),'designDoc':str(doc),'tokenHash':state['approval']['tokenHash'],
                  'componentCount':2,'snapshotHash':'fixture','checks':{'build':'Fixture host build result'}}
        invalid={**evidence,'designDoc':str(module/'DESIGN.md')}
        with self.assertRaises(ValueError): finish(self.root,invalid)
        self.assertEqual(read(self.root/'session.json'),state)
        result=finish(self.root,evidence)
        self.assertEqual(result['status'],'delivered')
        self.assertEqual(result['delivery']['mode'],'integrated')

if __name__=='__main__':unittest.main()
