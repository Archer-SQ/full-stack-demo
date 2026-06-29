from __future__ import annotations

import time
from typing import Any

BUSINESS_TARGET_ROWS = [
    {
        "business_unit": "北京代表处",
        "year": 2026,
        "business_target": 7950,
        "solution_target": 1200,
    },
    {
        "business_unit": "上海代表处",
        "year": 2026,
        "business_target": 7070,
        "solution_target": 980,
    },
    {
        "business_unit": "浙江代表处",
        "year": 2026,
        "business_target": 6460,
        "solution_target": 860,
    },
    {
        "business_unit": "江苏代表处",
        "year": 2026,
        "business_target": 5560,
        "solution_target": 720,
    },
    {
        "business_unit": "山东代表处",
        "year": 2026,
        "business_target": 4090,
        "solution_target": 650,
    },
]


def _build_business_target_answer() -> dict[str, Any]:
    total = sum(row["business_target"] for row in BUSINESS_TARGET_ROWS)
    average = round(total / len(BUSINESS_TARGET_ROWS))
    max_row = max(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])
    min_row = min(BUSINESS_TARGET_ROWS, key=lambda row: row["business_target"])

    return {
        "title": "经营单元收入&完成率分析",
        "description": "2026年各经营单元商业目标与商解目标对比（单位：万元）",
        "table": {
            "columns": [
                {"key": "business_unit", "label": "经营单元"},
                {"key": "year", "label": "年度"},
                {"key": "business_target", "label": "商业目标(万)"},
                {"key": "solution_target", "label": "商解目标(万)"},
            ],
            "rows": BUSINESS_TARGET_ROWS,
        },
        "stats": [
            {"label": "总记录数", "value": f"{len(BUSINESS_TARGET_ROWS)} 条"},
            {"label": "平均值", "value": f"¥{average:,}万"},
            {
                "label": "最大值",
                "value": f"¥{max_row['business_target']:,}万（{max_row['business_unit']}）",
            },
            {
                "label": "最小值",
                "value": f"¥{min_row['business_target']:,}万（{min_row['business_unit']}）",
            },
        ],
        "chart": {
            "type": "bar",
            "title": "经营单元目标对比",
            "x_key": "business_unit",
            "series": [
                {"key": "business_target", "name": "商业目标", "color": "#2563eb"},
                {"key": "solution_target", "name": "商解目标", "color": "#10b981"},
            ],
        },
        "suggestions": ["目标差异是什么？", "目标如何设定？", "未来趋势如何？"],
    }


def generate_mock_answer(question: str) -> dict[str, Any]:
    started_at = time.perf_counter()
    answer_data = _build_business_target_answer()

    content = "已生成经营单元收入与完成率分析，包含数据表格、统计结果和目标对比图。"
    if "经营单元" not in question and "完成率" not in question:
        content = "我先按经营单元收入与完成率分析场景返回一份演示数据，后续可以继续扩展问题分类。"

    elapsed_ms = int((time.perf_counter() - started_at) * 1000)

    return {
        "content": content,
        "answer_data": answer_data,
        "elapsed_ms": max(elapsed_ms, 1),
        "token_count": len(question) + len(content),
    }
