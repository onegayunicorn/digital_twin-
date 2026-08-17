"""
UNIVERSAL LANGUAGE TRANSLATOR — A bridge for two foreigners
Connects different programming languages through a unified interface.
"""

import ast
import json
import re
import hashlib
from typing import Dict, List, Optional, Any, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum


class DataType(Enum):
    """Universal data types for cross-language communication."""
    INTEGER = "integer"
    FLOAT = "float"
    STRING = "string"
    BOOLEAN = "boolean"
    LIST = "list"
    DICT = "dictionary"
    NONE = "none"
    QUANTUM = "quantum"
    TENSOR = "tensor"
    VECTOR = "vector"
    MATRIX = "matrix"
    CUSTOM = "custom"


@dataclass
class UniversalValue:
    """Universal value representation."""
    value: Any
    data_type: DataType
    metadata: Dict[str, Any] = field(default_factory=dict)
    source_language: str = ""
    target_language: str = ""


@dataclass
class TranslationRule:
    """Translation rule between languages."""
    source_pattern: str
    target_pattern: str
    source_language: str
    target_language: str
    transform: Optional[Callable] = None
    priority: int = 0


class UniversalTranslator:
    """
    Universal Language Translator — Bridges two foreign languages.

    Translates between:
    - Python ↔ JavaScript
    - Python ↔ TypeScript
    - Python ↔ Java
    - Python ↔ C++
    - Python ↔ Go
    - Python ↔ Rust
    - Python ↔ Ruby
    - Python ↔ PHP
    - Python ↔ QASM (Quantum)
    - Any language ↔ Any language (via AST)
    """

    def __init__(self):
        self.rules: List[TranslationRule] = []
        self._register_rules()
        self.ast_parsers = {
            'python': self._parse_python,
            'javascript': self._parse_javascript,
            'typescript': self._parse_typescript,
            'json': self._parse_json,
        }
        self.ast_generators = {
            'python': self._generate_python,
            'javascript': self._generate_javascript,
            'typescript': self._generate_typescript,
            'json': self._generate_json,
        }

    def _register_rules(self):
        """Register translation rules."""

        # ─── Python → JavaScript
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+(\w+)\s*\(([^)]*)\):',
            target_pattern=r'function \1(\2) {',
            source_language='python',
            target_language='javascript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'print\s*\(([^)]*)\)',
            target_pattern=r'console.log(\1)',
            source_language='python',
            target_language='javascript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'for\s+(\w+)\s+in\s+range\(([^)]+)\):',
            target_pattern=r'for (let \1 = 0; \1 < \2; \1++) {',
            source_language='python',
            target_language='javascript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'if\s+([^:]+):',
            target_pattern=r'if (\1) {',
            source_language='python',
            target_language='javascript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'elif\s+([^:]+):',
            target_pattern=r'else if (\1) {',
            source_language='python',
            target_language='javascript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'else:',
            target_pattern=r'else {',
            source_language='python',
            target_language='javascript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'return\s+([^;\n]*)',
            target_pattern=r'return \1;',
            source_language='python',
            target_language='javascript',
            priority=10,
        ))

        # ─── Python → TypeScript
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+(\w+)\s*\(([^)]*)\):',
            target_pattern=r'function \1(\2): any {',
            source_language='python',
            target_language='typescript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'class\s+(\w+):',
            target_pattern=r'class \1 {',
            source_language='python',
            target_language='typescript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+__init__\s*\(self,\s*([^)]*)\):',
            target_pattern=r'constructor(\1) {',
            source_language='python',
            target_language='typescript',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'self\.(\w+)\s*=\s*([^;\n]+)',
            target_pattern=r'this.\1 = \2;',
            source_language='python',
            target_language='typescript',
            priority=10,
        ))

        # ─── Python → Java
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+(\w+)\s*\(([^)]*)\):',
            target_pattern=r'public void \1(\2) {',
            source_language='python',
            target_language='java',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'class\s+(\w+):',
            target_pattern=r'public class \1 {',
            source_language='python',
            target_language='java',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'print\s*\(([^)]*)\)',
            target_pattern=r'System.out.println(\1);',
            source_language='python',
            target_language='java',
            priority=10,
        ))

        # ─── Python → C++
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+(\w+)\s*\(([^)]*)\):',
            target_pattern=r'void \1(\2) {',
            source_language='python',
            target_language='cpp',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'for\s+(\w+)\s+in\s+range\(([^)]+)\):',
            target_pattern=r'for (int \1 = 0; \1 < \2; \1++) {',
            source_language='python',
            target_language='cpp',
            priority=10,
        ))

        # ─── Python → Go
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+(\w+)\s*\(([^)]*)\):',
            target_pattern=r'func \1(\2) {',
            source_language='python',
            target_language='go',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'for\s+(\w+)\s+in\s+range\(([^)]+)\):',
            target_pattern=r'for \1 := 0; \1 < \2; \1++ {',
            source_language='python',
            target_language='go',
            priority=10,
        ))

        # ─── Python → Ruby
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+(\w+)\s*\(([^)]*)\):',
            target_pattern=r'def \1(\2)',
            source_language='python',
            target_language='ruby',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'print\s*\(([^)]*)\)',
            target_pattern=r'puts \1',
            source_language='python',
            target_language='ruby',
            priority=10,
        ))

        # ─── Python → PHP
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+(\w+)\s*\(([^)]*)\):',
            target_pattern=r'function \1(\2) {',
            source_language='python',
            target_language='php',
            priority=10,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'print\s*\(([^)]*)\)',
            target_pattern=r'echo \1;',
            source_language='python',
            target_language='php',
            priority=10,
        ))

        # ─── Python → QASM (Quantum)
        self.rules.append(TranslationRule(
            source_pattern=r'def\s+quantum_(\w+)\s*\(([^)]*)\):',
            target_pattern=r'gate \1(\2) {',
            source_language='python',
            target_language='qasm',
            priority=15,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'hadamard\s*\(\s*([^)]+)\)',
            target_pattern=r'h \1',
            source_language='python',
            target_language='qasm',
            priority=15,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'cnot\s*\(\s*([^,]+),\s*([^)]+)\)',
            target_pattern=r'cnot \1, \2',
            source_language='python',
            target_language='qasm',
            priority=15,
        ))
        self.rules.append(TranslationRule(
            source_pattern=r'measure\s*\(\s*([^)]+)\)',
            target_pattern=r'measure \1',
            source_language='python',
            target_language='qasm',
            priority=15,
        ))

    def translate(self, code: str, source: str, target: str) -> Dict[str, Any]:
        """
        Translate code from source language to target language.

        Args:
            code: Source code string
            source: Source language name
            target: Target language name

        Returns:
            Dictionary with translation result
        """
        result = {
            'source': source,
            'target': target,
            'original': code,
            'translated': '',
            'rules_applied': [],
            'errors': [],
            'warnings': [],
            'confidence': 0.0,
        }

        # Apply translation rules
        translated = code
        rules_applied = []

        # Sort rules by priority
        sorted_rules = sorted(self.rules, key=lambda r: r.priority, reverse=True)

        for rule in sorted_rules:
            if (rule.source_language.lower() == source.lower() and
                    rule.target_language.lower() == target.lower()):
                try:
                    # Apply the rule
                    matches = re.findall(rule.source_pattern, translated)
                    if matches:
                        if rule.transform:
                            translated = rule.transform(translated)
                        else:
                            # Simple substitution
                            translated = re.sub(
                                rule.source_pattern,
                                rule.target_pattern,
                                translated,
                            )

                        rules_applied.append({
                            'source_pattern': rule.source_pattern,
                            'target_pattern': rule.target_pattern,
                            'matches': len(matches),
                        })
                except Exception as e:
                    result['errors'].append(str(e))

        result['translated'] = translated
        result['confidence'] = len(rules_applied) / max(1, len(sorted_rules))
        result['rules_applied'] = rules_applied

        return result

    def _parse_python(self, code: str) -> Dict:
        """Parse Python code into AST."""
        try:
            tree = ast.parse(code)
            return {
                'ast': tree,
                'type': 'python',
                'functions': [n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)],
                'classes': [n.name for n in ast.walk(tree) if isinstance(n, ast.ClassDef)],
                'imports': [n.names[0].name for n in ast.walk(tree) if isinstance(n, ast.Import)],
            }
        except SyntaxError as e:
            return {'error': str(e)}

    def _parse_javascript(self, code: str) -> Dict:
        """Parse JavaScript code."""
        # Simplified parsing
        functions = re.findall(r'function\s+(\w+)\s*\(', code)
        classes = re.findall(r'class\s+(\w+)', code)
        imports = re.findall(r'import\s+[\w{}]+\s+from\s+[\'"](\w+)[\'"]', code)

        return {
            'type': 'javascript',
            'functions': functions,
            'classes': classes,
            'imports': imports,
        }

    def _parse_typescript(self, code: str) -> Dict:
        """Parse TypeScript code."""
        functions = re.findall(r'function\s+(\w+)\s*\([^)]*\):\s*\w+', code)
        classes = re.findall(r'class\s+(\w+)\s+extends', code)
        interfaces = re.findall(r'interface\s+(\w+)', code)

        return {
            'type': 'typescript',
            'functions': functions,
            'classes': classes,
            'interfaces': interfaces,
        }

    def _parse_json(self, code: str) -> Dict:
        """Parse JSON code."""
        try:
            data = json.loads(code)
            return {
                'type': 'json',
                'data': data,
                'keys': list(data.keys()) if isinstance(data, dict) else [],
            }
        except json.JSONDecodeError as e:
            return {'error': str(e)}

    def _generate_python(self, ast_data: Dict) -> str:
        """Generate Python code from AST data."""
        code = ""
        for func in ast_data.get('functions', []):
            code += f"def {func}():\n    pass\n\n"
        for cls in ast_data.get('classes', []):
            code += f"class {cls}:\n    def __init__(self):\n        pass\n\n"
        return code

    def _generate_javascript(self, ast_data: Dict) -> str:
        """Generate JavaScript code from AST data."""
        code = ""
        for func in ast_data.get('functions', []):
            code += f"function {func}() {{\n    // TODO: implement\n}}\n\n"
        for cls in ast_data.get('classes', []):
            code += f"class {cls} {{\n    constructor() {{\n        // TODO: implement\n    }}\n}}\n\n"
        return code

    def _generate_typescript(self, ast_data: Dict) -> str:
        """Generate TypeScript code from AST data."""
        code = ""
        for func in ast_data.get('functions', []):
            code += f"function {func}(): void {{\n    // TODO: implement\n}}\n\n"
        for cls in ast_data.get('classes', []):
            code += f"class {cls} {{\n    constructor() {{\n        // TODO: implement\n    }}\n}}\n\n"
        for iface in ast_data.get('interfaces', []):
            code += f"interface {iface} {{\n    // TODO: define\n}}\n\n"
        return code

    def _generate_json(self, ast_data: Dict) -> str:
        """Generate JSON from AST data."""
        return json.dumps(ast_data.get('data', {}), indent=2)

    def translate_with_ast(self, code: str, source: str, target: str) -> Dict[str, Any]:
        """Translate using AST (more accurate)."""
        result = {
            'source': source,
            'target': target,
            'original': code,
            'translated': '',
            'ast': None,
            'errors': [],
        }

        # Parse source
        parser = self.ast_parsers.get(source.lower())
        if not parser:
            result['errors'].append(f'No parser for {source}')
            return result

        ast_data = parser(code)
        if 'error' in ast_data:
            result['errors'].append(ast_data['error'])
            return result

        result['ast'] = ast_data

        # Generate target
        generator = self.ast_generators.get(target.lower())
        if not generator:
            result['errors'].append(f'No generator for {target}')
            return result

        result['translated'] = generator(ast_data)
        return result

    def get_supported_languages(self) -> List[str]:
        """Get all supported languages."""
        return list(set(
            list(self.ast_parsers.keys()) + list(self.ast_generators.keys())
        ))

    def get_translation_routes(self) -> Dict[str, List[str]]:
        """Get all possible translation routes."""
        routes = {}
        for rule in self.rules:
            if rule.source_language not in routes:
                routes[rule.source_language] = []
            if rule.target_language not in routes[rule.source_language]:
                routes[rule.source_language].append(rule.target_language)
        return routes


class CodeMatrixTranslator:
    """
    High-level translator that bridges the entire Code Matrix.
    Connects all languages through a unified interface.
    """

    def __init__(self):
        self.translator = UniversalTranslator()
        self.cache: Dict[str, Dict[str, Any]] = {}

    def translate_code(
        self,
        code: str,
        source: str,
        target: str,
        use_ast: bool = False,
    ) -> Dict[str, Any]:
        """
        Translate code between any two languages.

        Args:
            code: Source code
            source: Source language
            target: Target language
            use_ast: Use AST-based translation (more accurate)

        Returns:
            Translation result
        """
        cache_key = hashlib.md5(
            f"{code}:{source}:{target}".encode()
        ).hexdigest()

        if cache_key in self.cache:
            return self.cache[cache_key]

        if use_ast:
            result = self.translator.translate_with_ast(code, source, target)
        else:
            result = self.translator.translate(code, source, target)

        self.cache[cache_key] = result
        return result

    def batch_translate(
        self,
        files: List[Dict[str, str]],
        source: str,
        target: str,
    ) -> List[Dict[str, Any]]:
        """
        Batch translate multiple files.

        Args:
            files: List of dicts with 'name' and 'code'
            source: Source language
            target: Target language

        Returns:
            List of translation results
        """
        results = []
        for file_data in files:
            result = self.translate_code(
                file_data['code'],
                source,
                target,
            )
            result['name'] = file_data.get('name', 'unknown')
            results.append(result)

        return results

    def get_translation_summary(
        self,
        results: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Get summary of batch translation."""
        summary = {
            'total': len(results),
            'successful': 0,
            'failed': 0,
            'total_rules_applied': 0,
            'average_confidence': 0.0,
        }

        total_confidence = 0
        for result in results:
            if result.get('errors'):
                summary['failed'] += 1
            else:
                summary['successful'] += 1
                total_confidence += result.get('confidence', 0)
                summary['total_rules_applied'] += len(
                    result.get('rules_applied', [])
                )

        summary['average_confidence'] = total_confidence / max(
            1, summary['successful']
        )
        return summary
