import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mapping = JSON.parse(fs.readFileSync('characters/source/icons/icon-mapping.json', 'utf8'));
const expectedConcepts = ['analytics','approval','build','deploy','docs','error','evidence','graph','inspect','link-path','network-globe','node','progress','shield','success','sync','task-list','user','warning'];

test('Supporting Icons v1 diff covers the exact nineteen concepts', () => {
  assert.deepEqual(mapping.map((item) => item.concept), expectedConcepts);
});

test('reuse mappings resolve to an existing Brand OS semantic icon', () => {
  for (const item of mapping) {
    assert.ok(['reuse', 'new'].includes(item.action));
    if (item.action === 'reuse') {
      assert.equal(typeof item.existing_brandos_id, 'string');
      assert.ok(fs.existsSync(`semantics/icons/${item.existing_brandos_id}.svg`), `missing ${item.existing_brandos_id}`);
    } else {
      assert.equal(item.existing_brandos_id, null);
    }
  }
});

test('generic success is never collapsed into verified evidence state', () => {
  const success = mapping.find((item) => item.concept === 'success');
  assert.deepEqual(success, { concept: 'success', existing_brandos_id: null, action: 'new' });
});
