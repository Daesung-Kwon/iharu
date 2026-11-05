#!/usr/bin/env python3
"""Turn docs/device-week-w2/seed.json into an AsyncStorage 2.2.0 directory.

The on-disk format matches @react-native-async-storage/async-storage 2.2.0
(ios/RNCAsyncStorage.mm): manifest.json maps each key to a string. A value
longer than 1024 UTF-16 code units is JSON null in the manifest and the raw
string is a sibling file named MD5(utf-8 key).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

SEED_PATH = Path(__file__).with_name("seed.json")
KST = ZoneInfo("Asia/Seoul")
INLINE_MAX = 1024
WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

# Keys the tip reads. Anything else in the seed is a mistake.
KNOWN_KEYS = {
    "@app_version",
    "@user_id",
    "@daily_schedule_activities",
    "@daily_schedule_schedules",
    "@daily_schedule_deleted_defaults",
    "@daily_schedule_notifications",
    "@settings.notificationsEnabled",
    "@settings.notificationLeadMinutes",
    "@migrated",
    "@iharu.schemaVersion",
    "@iharu.weeklyPromise",
    "@iharu.weeklyPromises",
    "@iharu.weeklyResults",
    "@iharu.rewardExpansion",
    "@settings.weeklyResultNotification",
    "@iharu.weeklyResultNotificationState",
}


def utf16_len(value: str) -> int:
    return len(value.encode("utf-16-le")) // 2


def js_dumps(value: object) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def load_seed() -> dict:
    return json.loads(SEED_PATH.read_text(encoding="utf-8"))


def monday_of(day: date) -> date:
    return day - timedelta(days=day.weekday())


def iso(day: date) -> str:
    return day.isoformat()


def add_days(day: date, n: int) -> date:
    return day + timedelta(days=n)


def counted(pattern: list[dict]) -> tuple[int, int]:
    done = 0
    total = 0
    for row in pattern:
        items = row["items"]
        if not items:
            continue
        total += 1
        if all(piece.endswith(":completed") for piece in items):
            done += 1
    return done, total


def rate_of(done: int, total: int) -> int | float:
    if total == 0:
        return 0
    value = (done / total) * 100
    return int(value) if value == int(value) else value


def achieved(done: int, total: int, goal: int) -> bool:
    if total <= 0:
        return False
    return (done / total) * 100 + 1e-9 >= goal


def schedule_for(
    seed: dict,
    day: date,
    pieces: list[str],
) -> dict:
    items = []
    for index, piece in enumerate(pieces):
        key, status = piece.split(":")
        activity = seed["activities"][key]
        start, end = seed["itemTimes"][key]
        stamp = f"{iso(day)}T03:00:00.000Z"
        item = {
            "id": f"w2-{iso(day)}-{key}-{index}",
            "scheduleId": f"schedule-{iso(day)}",
            "activityId": activity["id"],
            "activity": activity,
            "startTime": start,
            "endTime": end,
            "status": status,
            "orderIndex": index,
            "createdAt": stamp,
            "updatedAt": stamp,
        }
        if status == "completed":
            item["completedAt"] = stamp
        items.append(item)
    stamp = f"{iso(day)}T03:00:00.000Z"
    return {
        "id": f"schedule-{iso(day)}",
        "userId": seed["userId"],
        "childProfileId": seed["childProfileId"],
        "date": iso(day),
        "dateKind": "local",
        "items": items,
        "createdAt": stamp,
        "updatedAt": stamp,
    }


def schedules_for(seed: dict, today: date) -> list[dict]:
    this_monday = monday_of(today)
    last_monday = add_days(this_monday, -7)
    rows: list[dict] = []
    for row in seed["lastWeekPattern"]:
        pieces = row["items"]
        if not pieces:
            continue
        rows.append(schedule_for(seed, add_days(last_monday, row["offset"]), pieces))
    for offset in range(7):
        day = add_days(this_monday, offset)
        if day >= today:
            break
        rows.append(schedule_for(seed, day, list(seed["thisWeekBeforeToday"])))
    rows.append(schedule_for(seed, today, list(seed["today"])))
    return rows


def promise_objects(seed: dict, profile: str, today: date) -> list[dict]:
    last_monday = iso(add_days(monday_of(today), -7))
    out = []
    for spec in seed["profiles"][profile]["promises"]:
        stamp = f"2026-01-01T00:00:0{spec['createdOrder']}.000Z"
        out.append({
            "id": spec["id"],
            "kind": "weekly",
            "terms": [{
                "reward": spec["reward"],
                "goalPercent": spec["goalPercent"],
                "effectiveFrom": last_monday,
            }],
            "endsFrom": None,
            "createdAt": stamp,
            "updatedAt": stamp,
        })
    return out


def result_objects(seed: dict, profile: str, today: date) -> list[dict]:
    this_monday = monday_of(today)
    last_monday = add_days(this_monday, -7)
    last_sunday = add_days(last_monday, 6)
    done, total = counted(seed["lastWeekPattern"])
    rate = rate_of(done, total)
    judged = f"{iso(last_sunday)}T15:00:00.000Z"
    out = []
    for spec in seed["profiles"][profile]["promises"]:
        out.append({
            "id": f"{spec['id']}:{iso(last_monday)}",
            "promiseId": spec["id"],
            "weekStart": iso(last_monday),
            "weekEnd": iso(last_sunday),
            "reward": spec["reward"],
            "goalPercent": spec["goalPercent"],
            "doneDays": done,
            "countedDays": total,
            "rate": rate,
            "achieved": achieved(done, total, spec["goalPercent"]),
            "judgedAt": judged,
            "seenAt": None,
        })
    return out


def expansion_object(seed: dict, profile: str) -> dict:
    raw = dict(seed["profiles"][profile]["rewardExpansion"])
    raw["unlockedAt"] = "2026-01-01T00:00:00.000Z" if raw["unlocked"] else None
    return raw


def entries_for(seed: dict, profile: str, today: date) -> dict[str, str]:
    if profile not in seed["profiles"]:
        raise SystemExit(f"Unknown profile {profile!r}. Use multi or single.")
    entries = dict(seed["strings"])
    entries["@daily_schedule_schedules"] = js_dumps(schedules_for(seed, today))
    entries["@iharu.weeklyPromises"] = js_dumps(promise_objects(seed, profile, today))
    entries["@iharu.weeklyResults"] = js_dumps(result_objects(seed, profile, today))
    entries["@iharu.rewardExpansion"] = js_dumps(expansion_object(seed, profile))
    entries["@iharu.weeklyResultNotificationState"] = js_dumps(seed["weeklyResultNotificationState"])
    unknown = set(entries) - KNOWN_KEYS
    if unknown:
        raise SystemExit(f"Seed uses keys the tip does not define: {sorted(unknown)}")
    if "@settings.pin" in entries or "@iharu.lastCelebratedDay" in entries:
        raise SystemExit("Seed must not set the PIN or lastCelebratedDay.")
    return entries


def write_directory(entries: dict[str, str], directory: Path) -> dict[str, str]:
    directory.mkdir(parents=True, exist_ok=True)
    for child in directory.iterdir():
        if child.is_file():
            child.unlink()
    manifest: dict[str, str | None] = {}
    layout: dict[str, str] = {}
    for key in sorted(entries):
        value = entries[key]
        if not isinstance(value, str):
            raise SystemExit(f"{key} must be a string value, got {type(value).__name__}")
        if utf16_len(value) <= INLINE_MAX:
            manifest[key] = value
            layout[key] = "inline"
        else:
            name = hashlib.md5(key.encode("utf-8")).hexdigest()
            (directory / name).write_bytes(value.encode("utf-8"))
            manifest[key] = None
            layout[key] = name
    text = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    (directory / "manifest.json").write_bytes(text.encode("utf-8"))
    return layout


def read_directory(directory: Path) -> dict[str, str]:
    manifest = json.loads((directory / "manifest.json").read_text(encoding="utf-8"))
    out: dict[str, str] = {}
    for key, value in manifest.items():
        if value is None:
            name = hashlib.md5(key.encode("utf-8")).hexdigest()
            out[key] = (directory / name).read_text(encoding="utf-8")
        elif isinstance(value, str):
            if utf16_len(value) > INLINE_MAX:
                raise SystemExit(f"{key} is inlined but longer than {INLINE_MAX} UTF-16 units")
            out[key] = value
        else:
            raise SystemExit(f"{key} manifest value must be a string or null, got {value!r}")
    return out


def days_line(done: int, total: int) -> str:
    return f"{total}일 중 {done}일 다 끝냈어요"


def this_week_progress(seed: dict, today: date) -> tuple[int, int]:
    """Fully-done days and counted days before today. Today is excluded until it is finished."""
    this_monday = monday_of(today)
    done = 0
    total = 0
    for offset in range(7):
        day = add_days(this_monday, offset)
        if day >= today:
            break
        pieces = list(seed["thisWeekBeforeToday"])
        if not pieces:
            continue
        total += 1
        if all(piece.endswith(":completed") for piece in pieces):
            done += 1
    return done, total


def summary(seed: dict, profile: str, today: date) -> dict:
    this_monday = monday_of(today)
    last_monday = add_days(this_monday, -7)
    done, total = counted(seed["lastWeekPattern"])
    week_done, week_total = this_week_progress(seed, today)
    promises = seed["profiles"][profile]["promises"]
    reached = sum(1 for spec in promises if achieved(week_done, week_total, spec["goalPercent"]))
    if len(promises) == 1:
        goal = promises[0]["goalPercent"]
        card_title = f"이번 주 약속: {promises[0]['reward']}"
        card_detail = (
            f"할 일을 다 끝낸 날을 모아 봐요 (목표 {goal}%)"
            if week_total == 0
            else f"{days_line(week_done, week_total)} (목표 {goal}%)"
        )
        settings_row = f"{promises[0]['reward']} (목표 {goal}%)"
    else:
        card_title = f"이번 주 약속 {len(promises)}개"
        card_detail = (
            "할 일을 다 끝낸 날을 모아 봐요"
            if week_total == 0
            else f"{days_line(week_done, week_total)} (목표 닿음 {reached}/{len(promises)})"
        )
        settings_row = f"약속 {len(promises)}개"
    won = [spec["reward"] for spec in promises if achieved(done, total, spec["goalPercent"])]
    if len(promises) == 1:
        spec = promises[0]
        if achieved(done, total, spec["goalPercent"]):
            modal = {
                "title": "지난주 약속을 지켰어요!",
                "body": f"{days_line(done, total)} ({int(rate_of(done, total))}%)",
                "footer": f"약속한 보상: {spec['reward']}",
            }
        else:
            modal = {
                "title": "지난주 결과예요",
                "body": f"{days_line(done, total)} ({int(rate_of(done, total))}%)",
                "footer": f"목표 {spec['goalPercent']}%에는 닿지 못했어요. 이번 주에 다시 해 봐요!",
            }
    elif won:
        modal = {
            "title": "지난주 약속을 지켰어요!",
            "body": f"{days_line(done, total)} ({int(rate_of(done, total))}%)",
            "footer": f"약속한 보상: {', '.join(won)}",
        }
    else:
        modal = {
            "title": "지난주 결과예요",
            "body": f"{days_line(done, total)} ({int(rate_of(done, total))}%)",
            "footer": "목표에는 닿지 못했어요. 이번 주에 다시 해 봐요!",
        }
    expansion = seed["profiles"][profile]["rewardExpansion"]
    expansion_line = (
        "보상 칸 3개까지 쓸 수 있어요 (테스트)"
        if expansion["unlocked"] and expansion["source"] == "test"
        else "주간 약속 1개 (무료)"
    )
    return {
        "profile": profile,
        "today": iso(today),
        "weekday": WEEKDAYS[today.weekday()],
        "thisWeek": f"{iso(this_monday)} .. {iso(add_days(this_monday, 6))}",
        "lastWeek": f"{iso(last_monday)} .. {iso(add_days(last_monday, 6))}",
        "cardTitle": card_title,
        "cardDetail": card_detail,
        "strip": "이번 주 아직이에요",
        "stripAfterFinishingToday": "이번 주 1일 지켰어요",
        "settingsRow": settings_row,
        "settingsNote": f"이번 주: {days_line(week_done, week_total)}",
        "expansion": expansion_line,
        "slots": f"약속 {len(promises)}개 / {3 if expansion['unlocked'] else 1}개",
        "modal": modal,
        "notificationIds": [
            f"weekly-result:{iso(last_monday)}",
            f"weekly-result:{iso(this_monday)}",
        ],
        "nextMonday0800": iso(add_days(this_monday, 7)),
        "todayProgress": "1/2 (50%)",
        "lastWeekRate": f"{done}/{total} = {rate_of(done, total)}%",
    }


def host_offset_is_kst() -> bool:
    offset = datetime.now().astimezone().utcoffset()
    return offset == timedelta(hours=9)


def assert_roundtrip(seed: dict, profile: str, today: date, directory: Path) -> None:
    original = entries_for(seed, profile, today)
    layout = write_directory(original, directory)
    restored = read_directory(directory)
    if restored != original:
        raise SystemExit(f"Round-trip mismatch for {profile} on {today}")
    for key, where in layout.items():
        value = original[key]
        if where == "inline" and utf16_len(value) > INLINE_MAX:
            raise SystemExit(f"{key} inlined over the threshold")
        if where != "inline" and utf16_len(value) <= INLINE_MAX:
            raise SystemExit(f"{key} spilled under the threshold")
    schedules = json.loads(restored["@daily_schedule_schedules"])
    dates = [row["date"] for row in schedules]
    if dates != sorted(dates) or len(dates) != len(set(dates)):
        raise SystemExit("Schedule dates are duplicated or unsorted")
    if any(row["date"] > iso(today) for row in schedules):
        raise SystemExit("Seed includes a day after today")
    if schedules[-1]["date"] != iso(today):
        raise SystemExit("Today is missing from schedules")
    today_items = schedules[-1]["items"]
    if [item["status"] for item in today_items] != ["completed", "planned"]:
        raise SystemExit(f"Today items must be completed then planned, got {today_items}")
    if any(item.get("activity", {}).get("name") in (None, "") for row in schedules for item in row["items"]):
        raise SystemExit("A schedule item is missing its embedded activity")
    promises = json.loads(restored["@iharu.weeklyPromises"])
    results = json.loads(restored["@iharu.weeklyResults"])
    if restored["@iharu.weeklyPromise"] != "null":
        raise SystemExit("Legacy weeklyPromise must be the string null")
    if restored["@iharu.schemaVersion"] != "5":
        raise SystemExit("schemaVersion must be the string 5")
    if json.loads(restored["@settings.weeklyResultNotification"]) is not True:
        raise SystemExit("weekly result notification must be the string true")
    last_monday = iso(add_days(monday_of(today), -7))
    for promise in promises:
        if promise["kind"] != "weekly" or promise["endsFrom"] is not None:
            raise SystemExit(f"Bad promise {promise['id']}")
        if promise["terms"][0]["effectiveFrom"] != last_monday:
            raise SystemExit("Promise terms must start last Monday so the stored result matches")
    for result in results:
        if result["id"] != f"{result['promiseId']}:{result['weekStart']}":
            raise SystemExit(f"Result id {result['id']} does not match promiseId:weekStart")
        if result["weekStart"] != last_monday or result["seenAt"] is not None:
            raise SystemExit("Result must be last week and unseen")
        if achieved(result["doneDays"], result["countedDays"], result["goalPercent"]) != result["achieved"]:
            raise SystemExit("achieved flag does not match the goal")
    info = summary(seed, profile, today)
    if info["notificationIds"][0] != f"weekly-result:{last_monday}":
        raise SystemExit("Notification id drifted")


def check(seed: dict) -> None:
    import tempfile

    fixtures = [date(2026, 11, 6), date(2026, 11, 2), date(2026, 11, 8), datetime.now(KST).date()]
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        for profile in ("multi", "single"):
            for today in fixtures:
                assert_roundtrip(seed, profile, today, root / profile / today.isoformat())
    friday = summary(seed, "multi", date(2026, 11, 6))
    expect = {
        "cardTitle": "이번 주 약속 3개",
        "cardDetail": "4일 중 0일 다 끝냈어요 (목표 닿음 0/3)",
        "strip": "이번 주 아직이에요",
        "settingsRow": "약속 3개",
        "settingsNote": "이번 주: 4일 중 0일 다 끝냈어요",
        "expansion": "보상 칸 3개까지 쓸 수 있어요 (테스트)",
        "slots": "약속 3개 / 3개",
        "notificationIds": ["weekly-result:2026-10-26", "weekly-result:2026-11-02"],
    }
    for key, value in expect.items():
        if friday[key] != value:
            raise SystemExit(f"Friday multi {key}: {friday[key]!r} != {value!r}")
    if friday["modal"] != {
        "title": "지난주 약속을 지켰어요!",
        "body": "5일 중 3일 다 끝냈어요 (60%)",
        "footer": "약속한 보상: 공원 가기",
    }:
        raise SystemExit(f"Friday modal drifted: {friday['modal']}")
    single = summary(seed, "single", date(2026, 11, 6))
    if single["cardTitle"] != "이번 주 약속: 아이스크림":
        raise SystemExit(single["cardTitle"])
    if single["cardDetail"] != "4일 중 0일 다 끝냈어요 (목표 80%)":
        raise SystemExit(single["cardDetail"])
    if single["modal"]["title"] != "지난주 결과예요":
        raise SystemExit(single["modal"])
    if single["slots"] != "약속 1개 / 1개":
        raise SystemExit(single["slots"])
    monday = summary(seed, "multi", date(2026, 11, 2))
    if monday["cardDetail"] != "할 일을 다 끝낸 날을 모아 봐요":
        raise SystemExit(monday["cardDetail"])
    print("check ok")
    print(json.dumps({"fridayMulti": friday, "fridaySingle": single}, ensure_ascii=False, indent=2))


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Materialize the W2 AsyncStorage seed")
    parser.add_argument("--profile", choices=("multi", "single"), default="multi")
    parser.add_argument("--today", help="YYYY-MM-DD. Default: today in Asia/Seoul when the host is UTC+9.")
    parser.add_argument("--allow-tz", action="store_true", help="Use the host local date even when it is not UTC+9.")
    parser.add_argument("--write-dir", type=Path, help="Replace this RCTAsyncLocalStorage_V1 directory.")
    parser.add_argument("--print", action="store_true", help="Print the pass-line summary as JSON.")
    parser.add_argument("--check", action="store_true", help="Round-trip both profiles. Does not touch a simulator.")
    parser.add_argument("--show", type=Path, help="Decode an existing storage directory and print the weekly keys.")
    args = parser.parse_args(argv)
    seed = load_seed()

    if args.check:
        check(seed)
        return 0

    if args.show:
        restored = read_directory(args.show)
        interesting = [
            "@iharu.schemaVersion",
            "@iharu.weeklyResultNotificationState",
            "@settings.weeklyResultNotification",
            "@iharu.lastCelebratedDay",
            "@iharu.rewardExpansion",
        ]
        payload = {key: restored.get(key) for key in interesting}
        print(json.dumps(payload, ensure_ascii=False, indent=2))
        return 0

    if args.today:
        today = date.fromisoformat(args.today)
        if not args.allow_tz and not host_offset_is_kst():
            print(
                "Warning: this Mac is not UTC+9. --today changes the seed calendar only; the simulator's today still follows the Mac.",
                file=sys.stderr,
            )
    elif args.allow_tz:
        today = date.today()
    else:
        if not host_offset_is_kst():
            print(
                "This Mac is not UTC+9. The simulator clock follows the Mac, so a KST seed would not land on the app's today.",
                file=sys.stderr,
            )
            print("Set the Mac timezone to Asia/Seoul, or re-run with --allow-tz to follow the Mac's local date.", file=sys.stderr)
            return 3
        today = datetime.now(KST).date()

    built = entries_for(seed, args.profile, today)
    info = summary(seed, args.profile, today)
    if args.write_dir:
        layout = write_directory(built, args.write_dir)
        info["wrote"] = str(args.write_dir)
        info["layout"] = layout
    if args.print or args.write_dir:
        print(json.dumps(info, ensure_ascii=False, indent=2))
    elif not args.write_dir:
        print(json.dumps(info, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
