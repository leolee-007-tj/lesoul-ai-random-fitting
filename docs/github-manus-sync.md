# GitHub → Manus 동기화 및 배포 안내

이 프로젝트는 GitHub와 Manus WebDev가 자동으로 양방향 동기화되는 구조가 아닙니다. GitHub `main`에 새 커밋이 생기면 아래 절차로 Manus 작업 폴더에 가져옵니다.

## 1. GitHub 최신 코드 확인

```bash
cd /home/ubuntu/lesoul-ai-random-fitting
git status
git fetch github main
git rev-list --left-right --count HEAD...github/main
```

출력의 첫 번째 숫자는 Manus 작업 폴더가 앞선 커밋 수이고, 두 번째 숫자는 GitHub가 앞선 커밋 수입니다.

## 2. 로컬 변경사항이 없을 때

```bash
git switch github-clean
git pull --ff-only github main
pnpm install --frozen-lockfile
pnpm check
pnpm test -- --run
pnpm build
```

`--ff-only`는 양쪽 이력이 갈라져 있을 때 임의로 merge하지 않고 중단하므로, 충돌을 숨기지 않습니다.

## 3. 로컬 변경사항이 있을 때

먼저 상태를 확인합니다.

```bash
git status --short
```

미커밋 변경을 보존하려면 별도 브랜치와 임시 커밋을 만듭니다.

```bash
git switch -c manus-work-$(date +%Y%m%d-%H%M)
git add -A
git commit -m "WIP: preserve Manus changes before GitHub sync"
git fetch github main
git rebase github/main
```

충돌이 발생하면 파일의 충돌 표시를 해결한 뒤 다음을 실행합니다.

```bash
git add <해결한-파일>
git rebase --continue
```

충돌 해결을 취소하려면 다음을 사용합니다.

```bash
git rebase --abort
```

## 4. Manus 미리보기와 게시

동기화 후 Manus WebDev 프로젝트에서 개발 서버를 재시작하거나 최신 체크포인트를 불러옵니다. 그 다음 타입 검사·테스트·빌드를 통과한 것을 확인하고 Manus의 Publish/Deploy UI에서 게시합니다.

이 저장소의 프로젝트는 다음 Manus 사이트와 연결되어 있습니다.

- 사이트: `https://lesoulai-xabhv8qd.manus.space/`
- WebDev 프로젝트 ID: `XABHv8QdBoCpfYVqBJuXsY`

현재 세션에 Manus 배포 API 또는 배포 웹훅이 노출되어 있지 않으면 GitHub Actions가 코드를 검증할 수는 있지만 Manus 게시를 직접 완료할 수는 없습니다.

## 5. GitHub Actions

`.github/workflows/ci-and-manus-deploy.yml`은 `main` push와 Pull Request에서 다음을 실행합니다.

- `pnpm install --frozen-lockfile`
- `pnpm check`
- `pnpm test -- --run`
- `pnpm build`

`main` push 시 `MANUS_DEPLOY_HOOK_URL` GitHub Actions secret이 설정되어 있으면 해당 URL을 POST하여 Manus 배포를 요청합니다. 시크릿이 없으면 CI만 성공하고 배포 단계는 안전하게 건너뜁니다.

시크릿은 저장소의 **Settings → Secrets and variables → Actions → New repository secret**에서 추가합니다. 배포 훅 URL을 확보하기 전에는 임의의 URL을 입력하지 않습니다.

## 운영 원칙

- GitHub와 Manus 양쪽에서 같은 파일을 동시에 수정하지 않습니다.
- 항상 `fetch → 상태 확인 → 백업/브랜치 → fast-forward 또는 rebase → 검사 → 게시` 순서로 진행합니다.
- API 키, DB 접속 정보, 상품 이미지와 운영 DB는 GitHub 코드와 별도이므로 저장소에 커밋하지 않습니다.
- 데이터베이스 마이그레이션은 CI/CD 자동 배포 단계에 임의로 포함하지 않고, 스키마 변경을 확인한 뒤 별도로 승인·적용합니다.
