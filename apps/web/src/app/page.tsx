import { APPEAL_SLA_HOURS, DAILY_QUEUE_SIZE } from "@jojo/shared";

const promises = [
  {
    title: "모두가 진짜 사람",
    body: "가입하는 모든 사람이 얼굴 인증을 거쳐요. 인증하지 않은 계정은 누구에게도 보이지 않아요.",
  },
  {
    title: "받은 좋아요는 무료",
    body: "나를 좋아한 사람을 돈 내고 확인할 필요가 없어요. 결제해도 추천 순위는 바뀌지 않아요.",
  },
  {
    title: `하루 ${DAILY_QUEUE_SIZE}명, 천천히`,
    body: "끝없는 스와이프 대신 매일 엄선한 사람만 보여드려요. 왜 추천됐는지도 함께 알려드려요.",
  },
  {
    title: "고스팅 대신 정중한 마감",
    body: "인연이 아니라고 느껴지면 버튼 하나로 정중하게 대화를 끝낼 수 있어요.",
  },
  {
    title: "스캠 실시간 경고",
    body: "외부 메신저 유도, 송금, 투자 권유 같은 메시지를 감지하면 바로 알려드려요.",
  },
  {
    title: "투명한 운영",
    body: `제재를 받으면 구체적인 사유를 알려드려요. 항소하면 사람이 ${APPEAL_SLA_HOURS}시간 안에 검토해요.`,
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16 sm:py-24">
      <header className="flex items-center justify-between">
        <span className="text-2xl font-bold tracking-tight text-brand">jojo</span>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
          곧 출시
        </span>
      </header>

      <section className="mt-20 max-w-2xl">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          진짜 사람만,
          <br />
          정직하게.
        </h1>
        <p className="mt-6 text-lg leading-8 opacity-75">
          가짜 프로필, 숨겨진 좋아요, 이유 없는 정지 없이. 데이팅 앱에서 지쳤던 순간들을 바꾸기
          위해 jojo를 만들고 있어요.
        </p>
      </section>

      <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promises.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-black/5 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5"
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 leading-7 opacity-70">{item.body}</p>
          </article>
        ))}
      </section>

      <footer className="mt-24 text-sm opacity-50">© jojo</footer>
    </main>
  );
}
