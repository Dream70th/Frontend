"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Department } from "@/lib/profile";

/**
 * Asked once, after the first Google sign-in.
 *
 * Google gives us an email and whatever the visitor called their account,
 * which is frequently a nickname. Neither finds a person at a church event, so
 * the prize draw needs a real name and a department.
 *
 * It can be skipped. Consent has to be freely given to count, so refusing it
 * cannot cost someone the trail and the games — it only leaves the raffle
 * closed, and the stamp board offers this form again when they want it.
 *
 * Age is not asked. The department already says roughly how old someone is,
 * and asking a child outright would pull the event under the rule requiring a
 * guardian's consent for anyone under 14.
 */
export function SignupForm({
  displayName,
  departments,
  onDone,
  onSkip,
  skipLabel,
}: {
  /** Name from the Google profile, offered as a starting point. */
  displayName: string | null;
  departments: readonly Department[];
  onDone: () => void;
  /** Always available: consent that cannot be refused is not consent. */
  onSkip: () => void;
  skipLabel: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName ?? "");
  const [department, setDepartment] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = name.trim().length > 0 && department !== null && consented;

  async function submit() {
    if (!ready || saving) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("complete_signup", {
      p_name: name.trim(),
      p_department: department,
    });

    if (rpcError) {
      setError("저장하지 못했어요. 잠시 후 다시 시도해주세요.");
      setSaving(false);
      return;
    }

    const result = data as { ok: boolean; status: string };
    if (!result?.ok) {
      setError(
        result?.status === "invalid_name"
          ? "이름을 다시 확인해주세요."
          : "부서를 다시 선택해주세요.",
      );
      setSaving(false);
      return;
    }

    router.refresh();
    onDone();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="참가자 정보"
      className="absolute inset-0 z-40 flex flex-col bg-[#171512] pt-[var(--safe-top)] pb-[var(--safe-bottom)]"
    >
      <div className="flex items-center justify-end px-4 py-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-full border-2 border-dotted border-white/25 bg-white/8 px-3.5 py-1.5 text-[12px] font-bold text-white/70 transition-colors active:bg-white/15"
        >
          {skipLabel}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-7 pb-6">
        <p className="text-[11px] font-bold tracking-[0.22em] text-[#FF5E00]">
          WELCOME
        </p>
        <h2 className="mt-1.5 text-xl leading-snug font-bold text-white">
          참가자 정보를 알려주세요
        </h2>
        <p className="mt-2.5 text-[13.5px] leading-[1.75] font-medium text-white/65">
          도장 4개를 모으면 경품에 응모할 수 있어요. 당첨되셨을 때 찾아뵙기 위해
          이름과 부서만 받습니다.
        </p>

        <label className="mt-7 block">
          <span className="text-[13px] font-bold text-white/80">이름</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            enterKeyHint="done"
            placeholder="실명을 입력해주세요"
            className="mt-2 w-full rounded-xl border-2 border-white/15 bg-white/8 px-4 py-3 text-[15px] font-semibold text-white placeholder:font-medium placeholder:text-white/30 focus:border-[#FF5E00] focus:outline-none"
          />
        </label>

        <fieldset className="mt-6">
          <legend className="text-[13px] font-bold text-white/80">부서</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {departments.map((entry) => {
              const picked = department === entry.slug;
              return (
                <button
                  key={entry.slug}
                  type="button"
                  aria-pressed={picked}
                  onClick={() => setDepartment(entry.slug)}
                  className={`rounded-xl border-2 py-2.5 text-[14px] font-bold transition-colors ${
                    picked
                      ? "border-[#FF5E00] bg-[#FF5E00] text-white"
                      : "border-white/15 bg-white/8 text-white/70"
                  }`}
                >
                  {entry.name}
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-7 flex gap-3 rounded-xl bg-white/8 px-4 py-3.5">
          <input
            type="checkbox"
            checked={consented}
            onChange={(event) => setConsented(event.target.checked)}
            className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-[#FF5E00]"
          />
          <span className="text-[12px] leading-relaxed font-medium text-white/60">
            경품 추첨과 전달을 위해 이름과 부서를 수집하는 데 동의합니다. 수집한
            정보는 <b className="font-bold text-white/80">행사 후 1개월 내</b>에
            파기하며, 다른 용도로는 쓰지 않습니다. 동의하지 않아도 도장판과
            미션은 그대로 이용하실 수 있어요.
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="mt-4 text-[13px] font-semibold text-[#FFB38A]"
          >
            {error}
          </p>
        )}
      </div>

      <div className="px-7 pb-4">
        <button
          type="button"
          onClick={() => void submit()}
          disabled={!ready || saving}
          className="w-full rounded-full border-[3px] border-dotted border-[#FF5E00] bg-[#FF5E00] py-3.5 text-base font-bold text-white shadow-[0_4px_0_0_#cc4b00] transition-all active:translate-y-1 active:shadow-[0_1px_0_0_#cc4b00] disabled:border-white/20 disabled:bg-white/10 disabled:text-white/35 disabled:shadow-none disabled:active:translate-y-0"
        >
          {saving ? "저장 중..." : "시작하기"}
        </button>
      </div>
    </div>
  );
}
