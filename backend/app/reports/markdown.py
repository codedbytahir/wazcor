"""
Purpose: Markdown report generator for WAZCOR cases.
Ownership: Jules
Safety: Formats case data into a professional report.
"""
from ..schemas.models import Case

class MarkdownReportGenerator:
    def generate(self, case: Case) -> str:
        report = f"""# WAZCOR Investigation Report: {case.id}

## Executive Summary
- **Verdict:** {case.verdict.verdict.replace('_', ' ').title()}
- **Confidence:** {case.verdict.confidence}%
- **Entities:** {case.verdict.entities}
- **Timestamp:** {case.created_at.isoformat()}

## Timeline
"""
        for event in case.timeline:
            report += f"- **[{event.timestamp.isoformat()}]** {event.type.upper()}: {event.description}\n"

        report += "\n## Evidence\n"
        for ev in case.evidence:
            report += f"### {ev.id} ({ev.type})\n"
            report += f"- **Source:** {ev.source}\n"
            report += f"- **Description:** {ev.description}\n"
            report += f"- **Data:** `{ev.data}`\n\n"

        report += "## Recommended Actions\n"
        for action in case.verdict.recommended_actions:
            report += f"- [ ] {action}\n"

        return report
