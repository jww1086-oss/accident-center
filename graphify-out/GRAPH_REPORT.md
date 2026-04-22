# Graph Report - C:\Users\UserPC\Desktop\안티그래비티\광역사고조사센터  (2026-04-20)

## Corpus Check
- 6 files · ~267,165 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 22 nodes · 19 edges · 6 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]

## God Nodes (most connected - your core abstractions)
1. `fetchAccidents()` - 2 edges
2. `renderAccidents()` - 2 edges
3. `fetchQuestions()` - 2 edges
4. `renderQnaList()` - 2 edges
5. `switchTab()` - 2 edges
6. `applyHash()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.5
Nodes (2): fetchAccidents(), renderAccidents()

### Community 1 - "Community 1"
Cohesion: 0.5
Nodes (2): applyHash(), switchTab()

### Community 2 - "Community 2"
Cohesion: 0.5
Nodes (0): 

### Community 3 - "Community 3"
Cohesion: 0.67
Nodes (2): fetchQuestions(), renderQnaList()

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 4`** (2 nodes): `check_data.js`, `checkData()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (2 nodes): `library.js`, `renderLibrary()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._