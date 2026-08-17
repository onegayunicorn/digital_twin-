"""
LANGUAGE CLASSIFICATION ENGINE — Detects and classifies code files
"""

import re
import os
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path

from code_matrix import (
    EXTENSION_REGISTRY,
    LanguageCategory,
    FileExtension,
    get_extension_info,
    get_all_extensions,
)


class LanguageClassifier:
    """Classifies files by extension, content, and metadata."""

    def __init__(self):
        self.extension_map = EXTENSION_REGISTRY
        self.shebang_patterns = {
            r'^#!.*python': 'Python',
            r'^#!.*node': 'JavaScript',
            r'^#!.*bash': 'Bash',
            r'^#!.*sh': 'Shell',
            r'^#!.*ruby': 'Ruby',
            r'^#!.*perl': 'Perl',
            r'^#!.*php': 'PHP',
            r'^#!.*go': 'Go',
            r'^#!.*rust': 'Rust',
            r'^#!.*python3': 'Python 3',
            r'^#!.*env python': 'Python',
            r'^#!.*zsh': 'Zsh',
            r'^#!.*fish': 'Fish',
            r'^#!.*ts-node': 'TypeScript',
        }

    def classify_by_extension(self, filepath: str) -> Optional[FileExtension]:
        """Classify file by extension."""
        ext = os.path.splitext(filepath)[1].lower()
        return get_extension_info(ext)

    def classify_by_content(self, filepath: str) -> Optional[FileExtension]:
        """Classify file by content (shebang, magic bytes, etc.)."""
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                first_line = f.readline().strip()

                # Check shebang
                for pattern, language in self.shebang_patterns.items():
                    if re.match(pattern, first_line):
                        # Find the matching extension
                        for ext, info in self.extension_map.items():
                            if info.language.lower() == language.lower():
                                return info

                content = first_line + f.read(1000)  # Read first 1000 chars

                # Check for Python-like content
                if 'import ' in content or ('from ' in content and 'def ' in content):
                    return get_extension_info('.py')

                # Check for JavaScript
                if 'function' in content or 'const ' in content or 'let ' in content:
                    return get_extension_info('.js')

        except Exception:
            pass

        return None

    def classify_file(self, filepath: str) -> Dict[str, Any]:
        """Complete file classification."""
        result = {
            'path': filepath,
            'filename': os.path.basename(filepath),
            'language': None,
            'extension': os.path.splitext(filepath)[1].lower(),
            'category': None,
            'environment': None,
            'priority': None,
            'requires_compilation': False,
            'can_execute': False,
            'processor': None,
            'tools': [],
            'metadata': {},
            'dependencies': [],
            'classification_method': 'unknown',
        }

        # Try extension first
        ext_info = self.classify_by_extension(filepath)
        if ext_info:
            result.update({
                'language': ext_info.language,
                'category': ext_info.category.value,
                'environment': ext_info.environment.value,
                'priority': ext_info.priority.value,
                'requires_compilation': ext_info.requires_compilation,
                'can_execute': ext_info.can_execute,
                'processor': ext_info.main_processor,
                'dependencies': ext_info.dependencies,
                'tools': ext_info.tools,
                'metadata': ext_info.metadata,
                'classification_method': 'extension',
            })
            return result

        # Try content
        content_info = self.classify_by_content(filepath)
        if content_info:
            result.update({
                'language': content_info.language,
                'category': content_info.category.value,
                'environment': content_info.environment.value,
                'priority': content_info.priority.value,
                'requires_compilation': content_info.requires_compilation,
                'can_execute': content_info.can_execute,
                'processor': content_info.main_processor,
                'dependencies': content_info.dependencies,
                'tools': content_info.tools,
                'metadata': content_info.metadata,
                'classification_method': 'content',
            })
            return result

        # Unknown
        result['language'] = 'Unknown'
        result['category'] = 'unknown'
        return result

    def classify_directory(self, directory: str) -> Dict[str, List[Dict[str, Any]]]:
        """Classify all files in a directory."""
        results = {
            'by_category': {},
            'by_language': {},
            'by_extension': {},
            'files': [],
        }

        for root, dirs, files in os.walk(directory):
            for file in files:
                filepath = os.path.join(root, file)
                classification = self.classify_file(filepath)

                results['files'].append(classification)

                # Group by category
                category = classification['category']
                if category not in results['by_category']:
                    results['by_category'][category] = []
                results['by_category'][category].append(classification)

                # Group by language
                language = classification['language']
                if language and language != 'Unknown':
                    if language not in results['by_language']:
                        results['by_language'][language] = []
                    results['by_language'][language].append(classification)

                # Group by extension
                ext = classification['extension']
                if ext:
                    if ext not in results['by_extension']:
                        results['by_extension'][ext] = []
                    results['by_extension'][ext].append(classification)

        return results

    def get_statistics(self, classification_results: Dict) -> Dict[str, Any]:
        """Get statistics from classification results."""
        stats = {
            'total_files': len(classification_results['files']),
            'languages': {},
            'categories': {},
            'extensions': {},
        }

        for file in classification_results['files']:
            lang = file['language']
            if lang and lang != 'Unknown':
                stats['languages'][lang] = stats['languages'].get(lang, 0) + 1

            cat = file['category']
            if cat:
                stats['categories'][cat] = stats['categories'].get(cat, 0) + 1

            ext = file['extension']
            if ext:
                stats['extensions'][ext] = stats['extensions'].get(ext, 0) + 1

        return stats
