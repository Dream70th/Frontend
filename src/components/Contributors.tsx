"use client";

import { Eyebrow, InfoSheet, SectionTitle } from "@/components/InfoSheet";

/**
 * Contributors, from the team's 팀빌딩 page in Notion.
 *
 * Role suffixes (PM / DE) and the internal [필수] / [선택] split are
 * deliberately dropped — this is a credits screen, not a staffing sheet.
 * Teams run in the trail's walking order so the list matches the map, and
 * names within a team are in Korean alphabetical order.
 */

const TEAMS = [
  {
    name: "운영팀",
    members: [
      "김유겸",
      "김하영",
      "배은하",
      "선명규",
      "송휘종",
      "엄지민",
      "이석형",
      "이소민",
      "이수연",
      "장진경",
    ],
  },
  { name: "굿즈팀", members: ["배은하", "손해연", "송휘종", "최예지", "최지민"] },
  { name: "교회팀", members: ["오연수", "윤관", "이소민", "이수민", "장진경"] },
  { name: "의류팀", members: ["김경민", "김예은", "김하영", "엄지민", "이수연"] },
  { name: "체험 · 데코팀", members: ["김유겸", "선명규", "심희찬", "이준규"] },
] as const;

const EXTRA = [
  { work: "70주년 앱 개발", people: "김유겸, 배은하" },
  { work: "로고 제작", people: "김예은" },
  { work: "현수막 제작", people: "배은하" },
  { work: "영상 제작", people: "송휘종" },
  { work: "팜플렛 제작", people: "이수연" },
  
] as const;

export function Contributors({ onClose }: { onClose: () => void }) {
  return (
    <InfoSheet title="Contributors" onClose={onClose}>
      <Eyebrow>WHO MADE THIS TRAIL</Eyebrow>
      <SectionTitle>팝업 플레이스를 함께 만든 사람들</SectionTitle>

      <div className="mt-6 flex flex-col gap-3">
        {TEAMS.map((team) => (
          <section key={team.name} className="rounded-2xl bg-white/6 px-5 py-4">
            <h4 className="text-[13px] font-bold tracking-wide text-[#FF5E00]">
              {team.name}
            </h4>
            <ul className="mt-2.5 flex flex-wrap gap-x-2 gap-y-2">
              {team.members.map((member) => (
                <li
                  key={member}
                  className="rounded-full bg-white/8 px-3 py-1 text-[13px] font-semibold text-white/80"
                >
                  {member}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-8 mb-2">
        <Eyebrow>ALSO</Eyebrow>
        <SectionTitle>함께 맡아준 일</SectionTitle>
        <dl className="mt-3 flex flex-col gap-2.5">
          {EXTRA.map(({ work, people }) => (
            <div
              key={work}
              className="flex items-baseline justify-between gap-4 border-b border-white/8 pb-2.5 last:border-0"
            >
              <dt className="text-[12.5px] font-medium text-white/45">{work}</dt>
              <dd className="text-right text-[13.5px] font-bold text-white/85">
                {people}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </InfoSheet>
  );
}
