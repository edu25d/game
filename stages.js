/**
 * stages.js — 5스테이지 멜로디 시퀀스 및 OSMD 오선보 MusicXML 데이터
 *
 * 각 스테이지 구조:
 *   - meta: 곡 정보, 난이도, BPM
 *   - phrases: 사이먼 방식 프레이즈 배열 (각 프레이즈는 점차 길어지는 노트 배열)
 *   - musicXml: OSMD 렌더링용 MusicXML 문자열
 */

const STAGES = (() => {

  // ────────────────────────────────────────────────────────────────
  // 헬퍼: 노트 객체 생성 (midi, duration, gap)
  // ────────────────────────────────────────────────────────────────
  function n(midi, duration = 0.4, gap = 0.12) {
    return { midi, duration, gap };
  }

  // ────────────────────────────────────────────────────────────────
  // Stage 1: 허수아비 아저씨 (C4~C5, C Major, ★☆☆☆☆)
  // 프레이즈 1음→6음 점진적 확장
  // ────────────────────────────────────────────────────────────────
  const stage1Notes = [
    // 프레이즈 1 (1음): 도
    [n(60)],
    // 프레이즈 2 (2음): 도 도
    [n(60), n(60)],
    // 프레이즈 3 (3음): 도 도 레
    [n(60), n(60), n(62)],
    // 프레이즈 4 (4음): 도 도 레 레
    [n(60), n(60), n(62), n(62)],
    // 프레이즈 5 (5음): 도 도 레 레 도
    [n(60), n(60), n(62), n(62), n(60)],
    // 프레이즈 6 (6음): 도 도 레 레 도 미
    [n(60), n(60), n(62), n(62), n(60), n(64)],
    // 프레이즈 7 (7음): 도 도 레 레 도 미 솔
    [n(60), n(60), n(62), n(62), n(60), n(64), n(67)],
    // 프레이즈 8 (8음): 도 도 레 레 도 미 솔 라
    [n(60), n(60), n(62), n(62), n(60), n(64), n(67), n(69)],
  ];

  const stage1MusicXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
          <mode>major</mode>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

  // ────────────────────────────────────────────────────────────────
  // Stage 2: 친구 생각 (C4~A4, 붓점 리듬 & 도약, ★★☆☆☆)
  // 출발음: 3음부터 → 6음까지
  // ────────────────────────────────────────────────────────────────
  const stage2Notes = [
    // 프레이즈 1 (3음): 미 미 도
    [n(64), n(64), n(60)],
    // 프레이즈 2 (4음): 미 미 도 미
    [n(64), n(64), n(60), n(64)],
    // 프레이즈 3 (5음): 미 미 도 미 레
    [n(64), n(64), n(60), n(64), n(62)],
    // 프레이즈 4 (6음): 미 미 도 미 레 레
    [n(64), n(64), n(60), n(64), n(62), n(62)],
    // 프레이즈 5 (7음): 미 미 도 미 레 레 미
    [n(64), n(64), n(60), n(64), n(62), n(62), n(64)],
    // 프레이즈 6 (8음): 미 미 도 미 레 레 미 미
    [n(64), n(64), n(60), n(64), n(62), n(62), n(64), n(64)],
    // 프레이즈 7 (8음+dur): 미 미 도 미 레 레 미 라
    [n(64), n(64), n(60), n(64), n(62), n(62), n(64), n(69)],
    // 프레이즈 8 (8음): 미 미 도 미 레 레 미 라 솔
    [n(64), n(64), n(60), n(64), n(62), n(62), n(64), n(67)],
  ];

  const stage2MusicXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
          <mode>major</mode>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>E</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>half</type>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <octave>4</octave>
        </pitch>
        <duration>2</duration>
        <type>half</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

  // ────────────────────────────────────────────────────────────────
  // Stage 3: 환희의 송가 (베토벤) (D4~G4, 빠른 BPM, ★★★☆☆)
  // 출발음: 5음부터 → 전진. Stage 3 진입 시 라벨 숨김
  // ────────────────────────────────────────────────────────────────
  const stage3Notes = [
    // 프레이즈 1 (5음): 미 레 도 레 미 (D4~C4~C4~D4~E4)
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08)],
    // 프레이즈 2 (6음): 미 레 도 레 미 파
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08), n(65, 0.35, 0.08)],
    // 프레이즈 3 (7음): 미 레 도 레 미 파 솔
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08), n(65, 0.35, 0.08), n(67, 0.35, 0.08)],
    // 프레이즈 4 (8음): 미 레 도 레 미 파 솔 미
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08), n(65, 0.35, 0.08), n(67, 0.35, 0.08), n(64, 0.35, 0.08)],
    // 프레이즈 5 (8음): 미 레 도 레 미 파 솔 미 레
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08), n(65, 0.35, 0.08), n(67, 0.35, 0.08), n(64, 0.35, 0.08), n(62, 0.35, 0.08)],
    // 프레이즈 6 (8음): 미 레 도 레 미 파 솔 미 레 도
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08), n(65, 0.35, 0.08), n(67, 0.35, 0.08), n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08)],
    // 프레이즈 7 (8음): 미 레 도 레 미 파 솔 미 레 도 레
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08), n(65, 0.35, 0.08), n(67, 0.35, 0.08), n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08)],
    // 프레이즈 8 (8음): 미 레 도 레 미 파 솔 미 레 도 레 미
    [n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08), n(65, 0.35, 0.08), n(67, 0.35, 0.08), n(64, 0.35, 0.08), n(62, 0.35, 0.08), n(60, 0.35, 0.08), n(62, 0.35, 0.08), n(64, 0.35, 0.08)],
  ];

  const stage3MusicXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
          <mode>major</mode>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>E</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>C</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>E</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

  // ────────────────────────────────────────────────────────────────
  // Stage 4: 바다가 보이는 마을 (지브리) (B3~C5, 아르페지오, ★★★★☆)
  // 출발음: 5음부터
  // ────────────────────────────────────────────────────────────────
  const stage4Notes = [
    // 프레이즈 1 (5음): B3 D4 G4 B4 G4 (분산화음)
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1)],
    // 프레이즈 2 (6음): B3 D4 G4 B4 G4 E4
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1), n(64, 0.4, 0.1)],
    // 프레이즈 3 (7음): B3 D4 G4 B4 G4 E4 C5
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1), n(64, 0.4, 0.1), n(72, 0.4, 0.1)],
    // 프레이즈 4 (8음): B3 D4 G4 B4 G4 E4 C5 A4
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1), n(64, 0.4, 0.1), n(72, 0.4, 0.1), n(69, 0.4, 0.1)],
    // 프레이즈 5 (8음): B3 D4 G4 B4 G4 E4 C5 A4 F4
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1), n(64, 0.4, 0.1), n(72, 0.4, 0.1), n(69, 0.4, 0.1), n(65, 0.4, 0.1)],
    // 프레이즈 6 (8음): B3 D4 G4 B4 G4 E4 C5 A4 F4 D4
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1), n(64, 0.4, 0.1), n(72, 0.4, 0.1), n(69, 0.4, 0.1), n(65, 0.4, 0.1), n(62, 0.4, 0.1)],
    // 프레이즈 7 (8음): B3 D4 G4 B4 G4 E4 C5 A4 F4 D4 B3
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1), n(64, 0.4, 0.1), n(72, 0.4, 0.1), n(69, 0.4, 0.1), n(65, 0.4, 0.1), n(62, 0.4, 0.1), n(59, 0.4, 0.1)],
    // 프레이즈 8 (8음): B3 D4 G4 B4 G4 E4 C5 A4 F4 D4 B3 E4
    [n(59, 0.4, 0.1), n(62, 0.4, 0.1), n(67, 0.4, 0.1), n(71, 0.4, 0.1), n(67, 0.4, 0.1), n(64, 0.4, 0.1), n(72, 0.4, 0.1), n(69, 0.4, 0.1), n(65, 0.4, 0.1), n(62, 0.4, 0.1), n(59, 0.4, 0.1), n(64, 0.4, 0.1)],
  ];

  const stage4MusicXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
          <mode>major</mode>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>B</step>
          <octave>3</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>D</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch>
          <step>G</step>
          <octave>4</octave>
        </pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

  // ────────────────────────────────────────────────────────────────
  // Stage 5: 엘리제를 위하여 / 캐논 변주곡 (B3~E5, 반음계적 도약, ★★★★★)
  // 출발음: 5음부터. 최고 난이도 보스
  // ────────────────────────────────────────────────────────────────
  const stage5Notes = [
    // 프레이즈 1 (5음): E5 B4 E5 D5 B4 (반음계적 느낌)
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07)],
    // 프레이즈 2 (6음): E5 B4 E5 D5 B4 D5
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07), n(74, 0.3, 0.07)],
    // 프레이즈 3 (7음): E5 B4 E5 D5 B4 D5 C#5
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07), n(74, 0.3, 0.07), n(73, 0.3, 0.07)],
    // 프레이즈 4 (8음): E5 B4 E5 D5 B4 D5 C#5 B4
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07), n(74, 0.3, 0.07), n(73, 0.3, 0.07), n(71, 0.3, 0.07)],
    // 프레이즈 5 (8음): E5 B4 E5 D5 B4 D5 C#5 B4 A4
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07), n(74, 0.3, 0.07), n(73, 0.3, 0.07), n(71, 0.3, 0.07), n(69, 0.3, 0.07)],
    // 프레이즈 6 (8음): E5 B4 E5 D5 B4 D5 C#5 B4 A4 G#4
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07), n(74, 0.3, 0.07), n(73, 0.3, 0.07), n(71, 0.3, 0.07), n(69, 0.3, 0.07), n(68, 0.3, 0.07)],
    // 프레이즈 7 (8음): E5 B4 E5 D5 B4 D5 C#5 B4 A4 G#4 F#4
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07), n(74, 0.3, 0.07), n(73, 0.3, 0.07), n(71, 0.3, 0.07), n(69, 0.3, 0.07), n(68, 0.3, 0.07), n(66, 0.3, 0.07)],
    // 프레이즈 8 (8음): E5 B4 E5 D5 B4 D5 C#5 B4 A4 G#4 F#4 E4
    [n(76, 0.3, 0.07), n(71, 0.3, 0.07), n(76, 0.3, 0.07), n(74, 0.3, 0.07), n(71, 0.3, 0.07), n(74, 0.3, 0.07), n(73, 0.3, 0.07), n(71, 0.3, 0.07), n(69, 0.3, 0.07), n(68, 0.3, 0.07), n(66, 0.3, 0.07), n(64, 0.3, 0.07)],
  ];

  const stage5MusicXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>0</fifths>
          <mode>major</mode>
        </key>
        <time>
          <beats>4</beats>
          <beat-type>4</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>
      <note>
        <pitch>
          <step>E</step>
          <octave>5</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch>
          <step>B</step>
          <octave>4</octave>
        </pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
    </measure>
  </part>
</score-partwise>`;

  // ────────────────────────────────────────────────────────────────
  // 스테이지 정의 배열
  // ────────────────────────────────────────────────────────────────
  const STAGES_ARRAY = [
    {
      id: 1,
      name: '허수아비 아저씨',
      title: '허수아비 아저씨',
      difficulty: '★☆☆☆☆',
      range: 'C4 ~ C5',
      description: '다장조 기본 온음계, 친숙한 동요 선율',
      bpm: 100,
      startPhraseIndex: 0,
      phraseCount: 8,
      notes: stage1Notes,
      musicXml: stage1MusicXml,
      tier: '🎶 초보 음악가',
      tierDesc: '소리의 세계에 첫 발을 내딛은 리스너',
    },
    {
      id: 2,
      name: '친구 생각',
      title: '친구 생각',
      difficulty: '★★☆☆☆',
      range: 'C4 ~ A4',
      description: '붓점 리듬과 도약 진행, 계이름 읽기 적용',
      bpm: 110,
      startPhraseIndex: 0,
      phraseCount: 8,
      notes: stage2Notes,
      musicXml: stage2MusicXml,
      tier: '🎵 청음 꿈나무',
      tierDesc: '계이름의 높낮이를 정확히 구분하기 시작한 단계',
    },
    {
      id: 3,
      name: '환희의 송가',
      title: '환희의 송가 (베토벤)',
      difficulty: '★★★☆☆',
      range: 'D4 ~ G4',
      description: '순차 진행이나 빠른 템포와 긴 호흡',
      bpm: 140,
      startPhraseIndex: 0,
      phraseCount: 8,
      notes: stage3Notes,
      musicXml: stage3MusicXml,
      tier: '🥉 노련한 연주자',
      tierDesc: '건반 라벨 없이도 소리만으로 건반을 찾아내는 실력자',
      hideLabels: true, // Stage 3: 라벨 숨김
    },
    {
      id: 4,
      name: '바다가 보이는 마을',
      title: '바다가 보이는 마을 (지브리)',
      difficulty: '★★★★☆',
      range: 'B3 ~ C5',
      description: '3도~4도 분산화음 아르페지오 진행',
      bpm: 120,
      startPhraseIndex: 0,
      phraseCount: 8,
      notes: stage4Notes,
      musicXml: stage4MusicXml,
      tier: '🥈 절대음감 마스터',
      tierDesc: '복잡한 아르페지오 선율도 척척 듣고 연주하는 달인',
    },
    {
      id: 5,
      name: '엘리제를 위하여',
      title: '엘리제를 위하여 / 캐논 변주곡',
      difficulty: '★★★★★',
      range: 'B3 ~ E5',
      description: '빠른 멜로디와 반음계적 도약의 최고 난이도 보스',
      bpm: 150,
      startPhraseIndex: 0,
      phraseCount: 8,
      notes: stage5Notes,
      musicXml: stage5MusicXml,
      tier: '👑 모차르트의 환생',
      tierDesc: '모든 명곡을 귀로 정복한 신급 절대음감',
    },
  ];

  // 각 스테이지의 phraseNotes 추출 함수
  // stage.notes[phraseIndex] → 노트 배열
  function getPhraseNotes(stageIndex, phraseIndex) {
    const notes = STAGES_ARRAY[stageIndex].notes[phraseIndex];
    return notes ?? [];
  }

  // 전체 스테이지 클리어 시 사용되는 전체 노트 시퀀스
  function getFullMelody(stageIndex) {
    const stage = STAGES_ARRAY[stageIndex];
    const allNotes = [];
    for (let i = 0; i < stage.phraseCount; i++) {
      const phrase = stage.notes[i];
      if (phrase) {
        phrase.forEach(n => allNotes.push({ ...n }));
      }
    }
    return allNotes;
  }

  // 현재 프레이즈의 정답 노트 MIDI 집합
  function getCorrectMidiSet(stageIndex, phraseIndex) {
    const phrase = STAGES_ARRAY[stageIndex].notes[phraseIndex];
    if (!phrase) return new Set();
    return new Set(phrase.map(n => n.midi));
  }

  // 스테이지 메타정보 조회
  function getStage(stageIndex) {
    return STAGES_ARRAY[stageIndex];
  }

  function getStageCount() {
    return STAGES_ARRAY.length;
  }

  return {
    STAGES_ARRAY,
    getPhraseNotes,
    getFullMelody,
    getCorrectMidiSet,
    getStage,
    getStageCount,
  };
})();

// export for production
if (typeof exportModules === 'function') {
  exportModules('stages', STAGES);
}
window.STAGES = STAGES;
