"""
FILE PROCESSING PIPELINE — Process code files through multiple stages
"""

import subprocess
import json
import os
from typing import Dict, List, Optional, Any, Callable
from pathlib import Path
from dataclasses import dataclass, field
from datetime import datetime

from code_matrix import FileExtension, get_extension_info
from language_classifier import LanguageClassifier


@dataclass
class ProcessingResult:
    """Result of processing a file."""
    filepath: str
    language: str
    success: bool
    output: str
    errors: List[str]
    warnings: List[str]
    metadata: Dict[str, Any]
    duration: float
    timestamp: str


@dataclass
class ProcessorConfig:
    """Configuration for a processor."""
    name: str
    language: str
    command: str
    args: List[str]
    environment: Dict[str, str]
    timeout: int
    enabled: bool


class FileProcessor:
    """Processes code files using language-specific tools."""

    def __init__(self):
        self.classifier = LanguageClassifier()
        self.processors: Dict[str, ProcessorConfig] = {}
        self._register_processors()

    def _register_processors(self):
        """Register built-in processors."""
        self.processors = {
            'python_processor': ProcessorConfig(
                name='python_processor',
                language='Python',
                command='python3',
                args=['-m', 'py_compile'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'typescript_processor': ProcessorConfig(
                name='typescript_processor',
                language='TypeScript',
                command='tsc',
                args=['--noEmit'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'javascript_processor': ProcessorConfig(
                name='javascript_processor',
                language='JavaScript',
                command='node',
                args=['--check'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'shell_processor': ProcessorConfig(
                name='shell_processor',
                language='Shell',
                command='bash',
                args=['-n'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'json_processor': ProcessorConfig(
                name='json_processor',
                language='JSON',
                command='python3',
                args=['-m', 'json.tool'],
                environment={},
                timeout=10,
                enabled=True,
            ),
            'yaml_processor': ProcessorConfig(
                name='yaml_processor',
                language='YAML',
                command='python3',
                args=['-c', 'import yaml, sys; yaml.safe_load(sys.stdin)'],
                environment={},
                timeout=10,
                enabled=True,
            ),
            'markdown_processor': ProcessorConfig(
                name='markdown_processor',
                language='Markdown',
                command='python3',
                args=['-c', 'import markdown; markdown.markdown(sys.stdin.read())'],
                environment={},
                timeout=10,
                enabled=True,
            ),
            'sql_processor': ProcessorConfig(
                name='sql_processor',
                language='SQL',
                command='python3',
                args=['-c', 'import sqlparse; sqlparse.parse(sys.stdin.read())'],
                environment={},
                timeout=10,
                enabled=True,
            ),
            'rust_processor': ProcessorConfig(
                name='rust_processor',
                language='Rust',
                command='cargo',
                args=['check'],
                environment={},
                timeout=60,
                enabled=True,
            ),
            'go_processor': ProcessorConfig(
                name='go_processor',
                language='Go',
                command='go',
                args=['vet'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'java_processor': ProcessorConfig(
                name='java_processor',
                language='Java',
                command='javac',
                args=['-d', '/dev/null'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'cpp_processor': ProcessorConfig(
                name='cpp_processor',
                language='C++',
                command='g++',
                args=['-fsyntax-only'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'c_processor': ProcessorConfig(
                name='c_processor',
                language='C',
                command='gcc',
                args=['-fsyntax-only'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'ruby_processor': ProcessorConfig(
                name='ruby_processor',
                language='Ruby',
                command='ruby',
                args=['-c'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'php_processor': ProcessorConfig(
                name='php_processor',
                language='PHP',
                command='php',
                args=['-l'],
                environment={},
                timeout=30,
                enabled=True,
            ),
            'qasm_processor': ProcessorConfig(
                name='qasm_processor',
                language='QASM',
                command='python3',
                args=['-c', 'from qiskit import QuantumCircuit; qasm.loads(sys.stdin.read())'],
                environment={},
                timeout=30,
                enabled=True,
            ),
        }

    def process_file(self, filepath: str) -> ProcessingResult:
        """Process a single file."""
        start_time = datetime.now()

        # Classify first
        classification = self.classifier.classify_file(filepath)
        language = classification['language']

        # Find matching processor
        processor = None
        for proc in self.processors.values():
            if proc.language.lower() == language.lower() and proc.enabled:
                processor = proc
                break

        if not processor:
            return ProcessingResult(
                filepath=filepath,
                language=language or 'Unknown',
                success=False,
                output='',
                errors=['No processor available for this language'],
                warnings=[],
                metadata={},
                duration=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now().isoformat(),
            )

        # Execute processor
        try:
            result = subprocess.run(
                [processor.command] + processor.args + [filepath],
                capture_output=True,
                text=True,
                timeout=processor.timeout,
                env=processor.environment,
            )

            success = result.returncode == 0
            errors = [line for line in result.stderr.split('\n') if line.strip()]
            warnings = [line for line in result.stdout.split('\n') if 'warning' in line.lower()]

            return ProcessingResult(
                filepath=filepath,
                language=language,
                success=success,
                output=result.stdout,
                errors=errors,
                warnings=warnings,
                metadata=classification['metadata'],
                duration=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now().isoformat(),
            )

        except subprocess.TimeoutExpired:
            return ProcessingResult(
                filepath=filepath,
                language=language,
                success=False,
                output='',
                errors=['Processing timed out'],
                warnings=[],
                metadata=classification['metadata'],
                duration=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now().isoformat(),
            )

        except Exception as e:
            return ProcessingResult(
                filepath=filepath,
                language=language,
                success=False,
                output='',
                errors=[str(e)],
                warnings=[],
                metadata=classification['metadata'],
                duration=(datetime.now() - start_time).total_seconds(),
                timestamp=datetime.now().isoformat(),
            )

    def process_directory(self, directory: str) -> Dict[str, List[ProcessingResult]]:
        """Process all files in a directory."""
        results = {'success': [], 'failure': []}

        for root, dirs, files in os.walk(directory):
            for file in files:
                filepath = os.path.join(root, file)
                result = self.process_file(filepath)
                if result.success:
                    results['success'].append(result)
                else:
                    results['failure'].append(result)

        return results

    def get_summary(self, results: Dict[str, List[ProcessingResult]]) -> Dict[str, Any]:
        """Get summary of processing results."""
        summary = {
            'total': 0,
            'successful': 0,
            'failed': 0,
            'by_language': {},
            'errors': [],
        }

        for result in results['success']:
            summary['total'] += 1
            summary['successful'] += 1
            lang = result.language
            summary['by_language'][lang] = summary['by_language'].get(lang, 0) + 1

        for result in results['failure']:
            summary['total'] += 1
            summary['failed'] += 1
            lang = result.language
            summary['by_language'][lang] = summary['by_language'].get(lang, 0) + 1
            summary['errors'].extend(result.errors)

        return summary
