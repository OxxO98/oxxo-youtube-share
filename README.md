# YouTube Translate Share Frontend

일본어 YouTube 학습/번역 데이터를 공유 링크로 전달받아, 영상과 이중 자막 타임라인을 동기화해 보여주는 React 기반 공유 뷰어입니다. 공유 데이터는 URL 파라미터에 압축된 형태로 포함되거나 짧은 링크를 통해 서버에서 복원되며, 사용자는 영상 재생 중 일본어 원문, 후리가나, 한국어 번역, 사전 검색, 자막 파일 저장 기능을 사용할 수 있습니다.

## 기술 스택

- **React 19 + TypeScript**: 컴포넌트 기반 UI와 전역 타입 선언을 활용한 타입 안정성 확보
- **React Router v7**: 공유 페이지와 Not Found 라우팅 구성
- **Redux Toolkit + React Redux**: 플레이어 마커, 텍스트 선택, 자막 표시 설정 상태 관리
- **Ant Design v6**: Layout, Splitter, Modal, Slider, FloatButton 등 복합 UI 구성
- **ReactPlayer**: YouTube 영상 재생 및 커스텀 컨트롤 연동
- **react-hotkeys-hook**: 재생, 이동, 전체화면 전환 등 키보드 단축키 처리
- **react-responsive**: 모바일, 짧은 화면, 가로 모드에 따른 레이아웃 분기
- **i18next + react-i18next**: 한국어/일본어 UI 다국어 처리
- **rc-virtual-list**: 긴 타임라인 목록의 가상 스크롤 렌더링
- **lz-string**: 공유 URL 데이터 압축 해제
- **file-saver**: 공유 자막 데이터를 `.srt` 파일로 저장
- **axios**: 짧은 링크 복원 API 호출

## 핵심 기능

### 1. 공유 링크 기반 데이터 로딩

`useSharedData`는 URL 쿼리 파라미터를 기준으로 공유 데이터를 로드합니다.

- `?a=` 파라미터가 있으면 LZ-string으로 압축된 데이터를 즉시 복원합니다.
- `?l=` 파라미터가 있으면 `/longUrl` API를 호출해 원본 공유 데이터를 받아옵니다.
- 유효한 공유 데이터가 없거나 서버 응답이 실패하면 Not Found 페이지로 이동합니다.

공유 데이터는 `decodeSharedData`에서 앱 내부 모델로 정규화됩니다.

```ts
interface SharedData {
  videoId: string;
  timeline: SharedTimeline[];
}

interface SharedTimeline {
  id: string;
  startTime: number;
  endTime: number;
  jaText: TextData[];
  koText: string;
}
```

압축 데이터의 원본 구조는 짧은 키를 사용합니다.

- `v`: YouTube videoId
- `t`: 타임라인 배열
- `s`, `e`: 시작/종료 시간
- `j`: 일본어 텍스트 또는 후리가나 포함 텍스트 배열
- `k`: 한국어 번역

### 2. YouTube 영상과 타임라인 동기화

`useReactPlayerHook`은 ReactPlayer의 재생 상태를 30fps 기준으로 추적합니다.

- `playedSeconds`, `duration`, `playing` 상태 관리
- `handleSeek`를 통한 특정 타임라인 구간 이동
- `setInterval` 기반 시간 업데이트로 현재 재생 위치 갱신
- `SharedTimelineCarousel`과 `SharedTimelineList`가 동일한 플레이어 상태를 공유

타임라인 항목을 클릭하면 해당 문장의 `startTime`으로 이동하며, 현재 재생 시간이 포함된 문장은 자동으로 활성화됩니다.

### 3. 이중 자막 렌더링과 후리가나 처리

일본어 자막은 단순 문자열이 아니라 `TextData[]`로 관리됩니다.

```ts
interface TextData {
  data: string;
  ruby: string | null;
  offset: number;
}
```

`SharedBun`과 `ComplexText`는 이 데이터를 `<ruby>`와 `<rt>` 구조로 렌더링해 한자 위에 후리가나를 표시합니다. `useHuri`는 일본어 표기와 읽기를 비교해 한자/오쿠리가나 단위로 텍스트를 분해하고, 각 조각에 offset을 유지합니다.

이 구조 덕분에 다음 기능이 가능합니다.

- 후리가나가 있는 일본어 자막 표시
- 텍스트 선택 시 원문 offset 추적
- 선택 범위 하이라이트/강조 처리를 위한 기반 데이터 제공
- 동일 문장 내 일부 텍스트만 사전 검색 대상으로 추출

### 4. 선택 텍스트 기반 일본어 사전 연동

`useHandleSelection`은 특정 DOM 영역 안에서 발생한 텍스트 선택을 감지합니다. 선택된 텍스트는 Redux `selection` 상태에 저장되고, `SharedDictionary`가 이를 사용해 Naver 일본어 사전을 iframe으로 표시합니다.

사전 검색은 다음 조건을 만족할 때만 실행됩니다.

- 선택 텍스트가 비어 있지 않음
- 선택 길이가 10자 미만
- `useJaText().checkKatachi` 기준 일본어 문자로 판정됨

이를 통해 사용자는 영상 자막을 보다가 모르는 일본어 단어를 선택해 즉시 사전 검색을 할 수 있습니다.

### 5. 반응형 공유 뷰어 레이아웃

`SharedViewer`는 화면 조건에 따라 UI 구조를 다르게 구성합니다.

- 데스크톱: `antd`의 `Splitter`를 사용해 영상 영역, 사전 패널, 타임라인 패널을 분할
- 모바일/짧은 화면: 영상과 캐러셀 중심의 세로 레이아웃으로 전환
- 모바일 가로 모드: 영상 몰입형 레이아웃을 우선 적용
- Enter 키 또는 FloatButton으로 헤더/사이드 패널을 접는 집중 모드 제공

패널 크기는 `panelSize` 유틸과 상수값을 통해 최소/최대 폭을 제한해, 리사이즈 중에도 영상 영역과 타임라인 목록이 깨지지 않도록 설계되어 있습니다.

### 6. 자막 스타일 커스터마이징

`SharedBunSettingModal`은 자막 표시 설정을 Redux `shared` slice에 저장합니다.

지원 설정:

- 일본어/한국어 표시 순서
- 일본어/한국어 글꼴 프리셋
- 언어별 글꼴 크기
- 언어별 텍스트 색상
- 자막 배경색
- 텍스트 그림자 토글

설정값은 `SharedTimelineCarousel`에서 자막 preview와 실제 영상 오버레이 렌더링에 동시에 사용됩니다.

### 7. 자막 파일 저장

`createCaptionFile`은 공유 타임라인 데이터를 자막 텍스트로 변환하고 `file-saver`로 다운로드합니다.

- 일본어 자막 저장
- 한국어 자막 저장
- 파일명: `CAPTION_{videoId}.srt`
- 타임스탬프 변환은 `useTimeStamp().timeToTS`를 사용

## 애플리케이션 구조

```txt
src/
  App.tsx
  i18n.ts
  components/
    Bun.tsx
    SelectLocaleComp.tsx
  contexts/
    MediaQueryContext.tsx
    ServerContext.tsx
    UnicodeContext.tsx
    VideoContext.tsx
  entities/
    shared/
      lib/
        createCaptionFile.ts
        decodeSharedData.ts
      model/
        types.ts
  hooks/
    AxiosHook.tsx
    HuriHook.tsx
    JaTextHook.tsx
    ReactPlayerHook.tsx
    SelectionHook.tsx
    VideoPlayHook.tsx
  pages/
    shared/
      model/
        useSharedData.ts
      ui/
        SharedHeader.tsx
        SharedPage.tsx
  reducers/
    reactPlayerReducer.tsx
    selectionReducer.tsx
    sharedReducer.tsx
    store.tsx
  widgets/
    shared-viewer/
      config/
      lib/
      model/
      ui/
```

## 주요 모듈 책임

| 모듈                                        | 책임                                                         |
| ------------------------------------------- | ------------------------------------------------------------ |
| `App.tsx`                                   | 전역 Provider, Ant Design 테마, Router, HotkeysProvider 구성 |
| `pages/shared/model/useSharedData.ts`       | URL 파라미터 분석, 공유 데이터 복원, 짧은 링크 API 연동      |
| `entities/shared/lib/decodeSharedData.ts`   | 압축 공유 데이터의 내부 모델 변환                            |
| `entities/shared/lib/createCaptionFile.ts`  | 공유 타임라인의 자막 파일 변환 및 저장                       |
| `widgets/shared-viewer/ui/SharedViewer.tsx` | 반응형 레이아웃, 패널 분할, 영상/사전/타임라인 조립          |
| `SharedTimelineCarousel.tsx`                | 영상 위 자막 오버레이, 재생 컨트롤, 키보드 타임라인 이동     |
| `SharedTimelineList.tsx`                    | 가상 스크롤 기반 전체 타임라인 목록 및 현재 문장 자동 추적   |
| `SharedDictionary.tsx`                      | 선택된 일본어 텍스트를 사전 iframe으로 연결                  |
| `components/Bun.tsx`                        | 후리가나 포함 일본어 텍스트 렌더링                           |
| `hooks/VideoPlayHook.tsx`                   | 구간 이동, 프레임 이동, 루프, 단축키 재생 제어               |
| `reducers/sharedReducer.tsx`                | 자막 스타일 설정 상태 관리                                   |
| `reducers/selectionReducer.tsx`             | 텍스트 선택 및 offset 상태 관리                              |

## 데이터 흐름

```txt
URL Query
  -> useSharedData
    -> decodeSharedData
      -> SharedData
        -> VideoContext(videoId)
        -> SharedViewer
          -> useReactPlayerHook
          -> SharedTimelineCarousel
          -> SharedTimelineList
          -> SharedDictionary
```

짧은 링크를 사용할 때는 다음 흐름이 추가됩니다.

```txt
?l={shortURL}
  -> useAxiosGet('/longUrl')
    -> ServerContext baseUrl
      -> encoded shared data
        -> decodeSharedData
```

## 상태 관리 설계

Redux store는 세 가지 slice로 구성됩니다.

- `reactPlayer`: 시작/종료 마커와 선택된 마커 상태
- `selection`: 현재 선택 텍스트, 후리가나, 텍스트 offset, 강조 정보
- `shared`: 공유 페이지 자막 스타일 설정

플레이어의 실시간 재생 상태는 Redux에 올리지 않고 `useReactPlayerHook`의 로컬 상태로 유지합니다. 반면 여러 컴포넌트가 참조해야 하는 사용자 설정과 선택 정보는 Redux에 저장해 사전 패널, 자막 렌더러, 설정 모달이 같은 상태를 공유합니다.

## 키보드 인터랙션

`useHandleKeyboard`와 `react-hotkeys-hook`을 통해 영상 학습에 필요한 단축키를 제공합니다.

- Space: 재생/일시정지
- `z` / `v`: 1초 이전/다음 이동
- `x` / `c`: 1프레임 이전/다음 이동
- `b` / `g`: 마커 재생/정지
- `r`: 구간 반복
- ArrowLeft / ArrowRight: 이전/다음 타임라인 문장 이동
- Enter: 공유 페이지 집중 모드 토글

## UI/UX 특징

- 어두운 테마와 붉은 포인트 컬러를 Ant Design theme token으로 통일
- 영상 위 자막은 viewport와 영상 비율을 고려해 동적으로 크기 제한
- `rc-virtual-list`를 사용해 긴 타임라인도 일정한 렌더링 비용으로 표시
- 모바일에서는 컨트롤을 FloatButton 그룹으로 축약해 영상 영역을 우선 확보
- 전체 스크롤바를 숨기고 패널 내부 레이아웃을 고정해 영상 감상 흐름을 유지

## 포트폴리오 관점의 구현 포인트

- 압축 공유 데이터, 짧은 링크 API, 내부 타임라인 모델을 분리해 공유 링크 확장성을 확보했습니다.
- ReactPlayer의 기본 컨트롤을 숨기고 직접 구현한 재생 상태/seek/단축키 컨트롤로 학습 도메인에 맞는 플레이어 경험을 만들었습니다.
- 일본어 후리가나 렌더링을 단순 문자열 처리로 끝내지 않고, ruby 구조와 offset 기반 선택 추적까지 연결했습니다.
- 선택 영역을 Redux 상태로 승격해 사전 iframe, 하이라이트, 텍스트 분석 기능이 같은 데이터를 바라보도록 설계했습니다.
- 데스크톱 Splitter 레이아웃과 모바일 집중 모드를 분기해 같은 데이터 모델을 다양한 화면 조건에서 재사용합니다.
- 자막 스타일 설정을 전역 상태로 관리해 preview와 실제 영상 오버레이의 표시 결과를 일관되게 유지합니다.

## 실행 스크립트

프로젝트 루트 기준으로 실행합니다.

```bash
npm start
npm run build
npm test
```

## 향후 개선 가능성

- 자막 저장에 한국어 발음을 추가하는 기능
- 자막 스타일도 함께 export 하는 방식 고려

# 편집 프로그램

[편집 프로그램 Github](https://github.com/OxxO98/oxxo-youtube)

# Demo

[demo](http://oxxo.ddns.net/?l=z8Yuez8RJCRUfTpp)
