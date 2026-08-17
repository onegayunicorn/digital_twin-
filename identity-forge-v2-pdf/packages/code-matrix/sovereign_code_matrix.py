"""
SOVEREIGN CODE MATRIX — Complete Integration
Unified interface for the entire Code Matrix system.
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

from code_matrix import (
    EXTENSION_REGISTRY,
    FileExtension,
    LanguageCategory,
    get_all_extensions,
    get_all_languages,
    get_extension_info,
)
from language_classifier import LanguageClassifier
from processing_pipeline import FileProcessor
from universal_translator import UniversalTranslator, CodeMatrixTranslator


class SovereignCodeMatrix:
    """Complete Code Matrix system."""

    def __init__(self):
        self.classifier = LanguageClassifier()
        self.processor = FileProcessor()
        self.translator = CodeMatrixTranslator()
        self.results = {}

    def analyze_file(self, filepath: str) -> Dict[str, Any]:
        """Complete analysis of a single file."""
        classification = self.classifier.classify_file(filepath)
        processing = self.processor.process_file(filepath)

        return {
            'file': filepath,
            'classification': classification,
            'processing': {
                'success': processing.success,
                'output': processing.output,
                'errors': processing.errors,
                'warnings': processing.warnings,
                'duration': processing.duration,
            },
            'timestamp': datetime.now().isoformat(),
        }

    def analyze_directory(self, directory: str) -> Dict[str, Any]:
        """Complete analysis of a directory."""
        classifications = self.classifier.classify_directory(directory)
        processing = self.processor.process_directory(directory)

        return {
            'directory': directory,
            'classifications': classifications,
            'processing': {
                'successful': len(processing['success']),
                'failed': len(processing['failure']),
                'details': processing,
            },
            'statistics': self._compute_statistics(classifications, processing),
            'timestamp': datetime.now().isoformat(),
        }

    def _compute_statistics(
        self,
        classifications: Dict,
        processing: Dict,
    ) -> Dict[str, Any]:
        """Compute comprehensive statistics."""
        stats = {
            'total_files': classifications.get('total_files', 0),
            'languages': {},
            'categories': {},
            'extensions': {},
            'processing': {
                'success_rate': 0,
                'average_duration': 0,
            },
        }

        # Language stats
        for file in classifications.get('files', []):
            lang = file.get('language')
            if lang:
                stats['languages'][lang] = stats['languages'].get(lang, 0) + 1

            cat = file.get('category')
            if cat:
                stats['categories'][cat] = stats['categories'].get(cat, 0) + 1

            ext = file.get('extension')
            if ext:
                stats['extensions'][ext] = stats['extensions'].get(ext, 0) + 1

        # Processing stats
        total = len(processing.get('success', [])) + len(
            processing.get('failure', [])
        )
        if total > 0:
            stats['processing']['success_rate'] = (
                len(processing.get('success', [])) / total
            )

            durations = [p.duration for p in processing.get('success', [])]
            if durations:
                stats['processing']['average_duration'] = sum(
                    durations
                ) / len(durations)

        return stats

    def translate_between(
        self,
        code: str,
        source: str,
        target: str,
        use_ast: bool = False,
    ) -> Dict[str, Any]:
        """Translate code between two languages."""
        return self.translator.translate_code(code, source, target, use_ast)

    def get_extension_registry(self) -> Dict[str, FileExtension]:
        """Get the complete extension registry."""
        return EXTENSION_REGISTRY

    def get_extension_for_language(self, language: str) -> List[str]:
        """Get extensions for a language."""
        from code_matrix import get_extensions_by_language
        return get_extensions_by_language(language)

    def get_language_for_extension(self, extension: str) -> Optional[str]:
        """Get language for an extension."""
        info = get_extension_info(extension)
        return info.language if info else None

    def generate_report(self, analysis: Dict[str, Any]) -> str:
        """Generate a human-readable report."""
        lines = [
            "🌌 SOVEREIGN CODE MATRIX REPORT",
            "=" * 40,
        ]

        if 'directory' in analysis:
            lines.append(f"📁 Directory: {analysis['directory']}")
            lines.append(
                f"📊 Total Files: {analysis['statistics']['total_files']}"
            )
            lines.append("")

            lines.append("📈 LANGUAGE BREAKDOWN:")
            for lang, count in sorted(
                analysis['statistics']['languages'].items()
            ):
                lines.append(f"  {lang}: {count}")

            lines.append("")
            lines.append("📊 CATEGORY BREAKDOWN:")
            for cat, count in sorted(
                analysis['statistics']['categories'].items()
            ):
                lines.append(f"  {cat}: {count}")

            lines.append("")
            lines.append("🔧 PROCESSING RESULTS:")
            lines.append(
                f"  ✅ Successful: {analysis['processing']['successful']}"
            )
            lines.append(
                f"  ❌ Failed: {analysis['processing']['failed']}"
            )
            lines.append(
                f"  📈 Success Rate: "
                f"{analysis['statistics']['processing']['success_rate'] * 100:.1f}%"
            )

            if analysis['statistics']['processing']['average_duration']:
                lines.append(
                    f"  ⏱️ Avg Duration: "
                    f"{analysis['statistics']['processing']['average_duration'] * 1000:.1f}ms"
                )

        lines.append("")
        lines.append(f"🕐 Generated: {analysis.get('timestamp', 'unknown')}")
        lines.append("")
        lines.append("=" * 40)

        return "\n".join(lines)

    def save_report(self, analysis: Dict[str, Any], output_path: str) -> None:
        """Save analysis report to file."""
        report = self.generate_report(analysis)
        with open(output_path, 'w') as f:
            f.write(report)


# ─── Convenience Functions ──────────────────────────────────────

def analyze_project(directory: str) -> Dict[str, Any]:
    """Analyze an entire project directory."""
    matrix = SovereignCodeMatrix()
    return matrix.analyze_directory(directory)


def translate_code(code: str, source: str, target: str) -> Dict[str, Any]:
    """Translate code between languages."""
    matrix = SovereignCodeMatrix()
    return matrix.translate_between(code, source, target)


def get_supported_extensions() -> List[str]:
    """Get all supported extensions."""
    return get_all_extensions()


def get_supported_languages() -> List[str]:
    """Get all supported languages."""
    return get_all_languages()


def get_extension_info_by_ext(extension: str) -> Optional[FileExtension]:
    """Get extension information."""
    return get_extension_info(extension)


# ─── CLI Entry Point ────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description='Sovereign Code Matrix')
    parser.add_argument(
        'command',
        choices=['analyze', 'translate', 'extensions', 'languages'],
    )
    parser.add_argument('--path', help='Path to analyze')
    parser.add_argument('--source', help='Source language')
    parser.add_argument('--target', help='Target language')
    parser.add_argument('--code', help='Code to translate')
    parser.add_argument('--output', help='Output file')

    args = parser.parse_args()

    matrix = SovereignCodeMatrix()

    if args.command == 'analyze':
        if not args.path:
            print("❌ Please specify --path")
            sys.exit(1)

        result = matrix.analyze_directory(args.path)
        report = matrix.generate_report(result)
        print(report)

        if args.output:
            matrix.save_report(result, args.output)

    elif args.command == 'translate':
        if not args.code or not args.source or not args.target:
            print("❌ Please specify --code, --source, and --target")
            sys.exit(1)

        result = matrix.translate_between(
            args.code, args.source, args.target
        )
        print("🌌 Translation Result:")
        print(result.get('translated', 'No translation'))
        if result.get('errors'):
            print("⚠️ Errors:", result['errors'])

    elif args.command == 'extensions':
        print("📝 Supported Extensions:")
        for ext in get_supported_extensions():
            info = get_extension_info(ext)
            if info:
                print(f"  {ext}: {info.language} ({info.category.value})")

    elif args.command == 'languages':
        print("📝 Supported Languages:")
        for lang in get_supported_languages():
            print(f"  {lang}")
