"""
SOVEREIGN CODE MATRIX — Universal Code Classification System
Complete mapping of all file extensions, languages, and processing rules
"""

from enum import Enum
from typing import Dict, List, Set, Optional, Any
from dataclasses import dataclass, field


# ─── Language Categories
class LanguageCategory(Enum):
    """High-level language categories."""
    SCRIPTING = "scripting"
    COMPILED = "compiled"
    MARKUP = "markup"
    QUERY = "query"
    CONFIG = "configuration"
    DATA = "data"
    DOCUMENTATION = "documentation"
    SHELL = "shell"
    WEB = "web"
    MOBILE = "mobile"
    SYSTEM = "system"
    SCIENTIFIC = "scientific"
    QUANTUM = "quantum"
    AI = "ai"
    BLOCKCHAIN = "blockchain"
    UNKNOWN = "unknown"


class ExecutionEnvironment(Enum):
    """Execution environment classification."""
    INTERPRETED = "interpreted"
    COMPILED = "compiled"
    JIT = "jit"
    HYBRID = "hybrid"
    VIRTUAL_MACHINE = "virtual_machine"
    CONTAINER = "container"
    BROWSER = "browser"
    SERVER = "server"


class ProcessingPriority(Enum):
    """Processing priority levels."""
    CRITICAL = 5
    HIGH = 4
    MEDIUM = 3
    LOW = 2
    BACKGROUND = 1


# ─── File Extension Definition
@dataclass
class FileExtension:
    """Complete file extension definition."""
    extension: str
    language: str
    category: LanguageCategory
    environment: ExecutionEnvironment
    priority: ProcessingPriority
    requires_compilation: bool
    can_execute: bool
    main_processor: str
    alternative_processors: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    tools: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


# ─── Complete Extension Registry
EXTENSION_REGISTRY: Dict[str, FileExtension] = {
    # ─── Python
    ".py": FileExtension(
        extension=".py",
        language="Python",
        category=LanguageCategory.SCRIPTING,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=True,
        main_processor="python_processor",
        alternative_processors=["pypy_processor", "cython_processor"],
        dependencies=["pip", "python"],
        tools=["pytest", "black", "flake8", "mypy"],
        metadata={
            "version": "3.11+",
            "package_manager": "pip",
            "framework_support": ["Django", "Flask", "FastAPI", "PyTorch", "TensorFlow"],
            "quantum_support": ["Qiskit", "Cirq", "PennyLane"],
        },
    ),

    # ─── TypeScript
    ".ts": FileExtension(
        extension=".ts",
        language="TypeScript",
        category=LanguageCategory.WEB,
        environment=ExecutionEnvironment.JIT,
        priority=ProcessingPriority.HIGH,
        requires_compilation=True,
        can_execute=False,
        main_processor="typescript_processor",
        alternative_processors=["babel_processor", "swc_processor"],
        dependencies=["node", "npm", "typescript"],
        tools=["tsc", "eslint", "prettier", "jest"],
        metadata={
            "version": "5.0+",
            "package_manager": "npm",
            "framework_support": ["React", "Angular", "Vue", "Next.js"],
            "compiles_to": ["JavaScript", "JavaScript/ES5"],
        },
    ),

    # ─── JavaScript
    ".js": FileExtension(
        extension=".js",
        language="JavaScript",
        category=LanguageCategory.WEB,
        environment=ExecutionEnvironment.JIT,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=True,
        main_processor="javascript_processor",
        alternative_processors=["node_processor", "deno_processor"],
        dependencies=["node", "npm"],
        tools=["eslint", "prettier", "jest"],
        metadata={
            "version": "ES2022+",
            "package_manager": "npm",
            "framework_support": ["React", "Vue", "Angular", "Express", "Node.js"],
            "runtime": ["Node.js", "Deno", "Bun"],
        },
    ),

    # ─── Go
    ".go": FileExtension(
        extension=".go",
        language="Go",
        category=LanguageCategory.SYSTEM,
        environment=ExecutionEnvironment.COMPILED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=True,
        can_execute=True,
        main_processor="go_processor",
        alternative_processors=["tinygo_processor"],
        dependencies=["go", "golang"],
        tools=["go test", "go fmt", "go vet", "golangci-lint"],
        metadata={
            "version": "1.21+",
            "package_manager": "go mod",
            "concurrency": "goroutines",
            "uses": ["microservices", "CLI tools", "networking"],
        },
    ),

    # ─── Rust
    ".rs": FileExtension(
        extension=".rs",
        language="Rust",
        category=LanguageCategory.SYSTEM,
        environment=ExecutionEnvironment.COMPILED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=True,
        can_execute=True,
        main_processor="rust_processor",
        alternative_processors=[],
        dependencies=["rustc", "cargo"],
        tools=["cargo", "rustfmt", "clippy"],
        metadata={
            "version": "1.70+",
            "package_manager": "cargo",
            "concurrency": "async/await",
            "uses": ["systems programming", "WebAssembly", "embedded"],
        },
    ),

    # ─── C
    ".c": FileExtension(
        extension=".c",
        language="C",
        category=LanguageCategory.SYSTEM,
        environment=ExecutionEnvironment.COMPILED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=True,
        can_execute=True,
        main_processor="c_processor",
        alternative_processors=["gcc_processor", "clang_processor"],
        dependencies=["gcc", "make", "cmake"],
        tools=["gdb", "valgrind", "clang-format"],
        metadata={
            "version": "C11+",
            "uses": ["systems programming", "embedded", "kernel"],
        },
    ),

    # ─── C++
    ".cpp": FileExtension(
        extension=".cpp",
        language="C++",
        category=LanguageCategory.SYSTEM,
        environment=ExecutionEnvironment.COMPILED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=True,
        can_execute=True,
        main_processor="cpp_processor",
        alternative_processors=["gpp_processor", "clangpp_processor"],
        dependencies=["g++", "make", "cmake"],
        tools=["gdb", "valgrind", "clang-format"],
        metadata={
            "version": "C++20+",
            "uses": ["systems programming", "game development", "high-performance"],
        },
    ),

    # ─── Java
    ".java": FileExtension(
        extension=".java",
        language="Java",
        category=LanguageCategory.SYSTEM,
        environment=ExecutionEnvironment.VIRTUAL_MACHINE,
        priority=ProcessingPriority.HIGH,
        requires_compilation=True,
        can_execute=True,
        main_processor="java_processor",
        alternative_processors=["javac_processor", "kotlin_processor"],
        dependencies=["java", "javac", "maven", "gradle"],
        tools=["maven", "gradle", "junit", "checkstyle"],
        metadata={
            "version": "17+",
            "package_manager": "maven/gradle",
            "uses": ["enterprise", "Android", "microservices"],
        },
    ),

    # ─── Kotlin
    ".kt": FileExtension(
        extension=".kt",
        language="Kotlin",
        category=LanguageCategory.MOBILE,
        environment=ExecutionEnvironment.VIRTUAL_MACHINE,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=True,
        can_execute=True,
        main_processor="kotlin_processor",
        alternative_processors=["kotlinc_processor"],
        dependencies=["kotlin", "gradle"],
        tools=["gradle", "ktlint", "junit"],
        metadata={
            "version": "1.9+",
            "package_manager": "gradle",
            "uses": ["Android", "backend", "multiplatform"],
        },
    ),

    # ─── Swift
    ".swift": FileExtension(
        extension=".swift",
        language="Swift",
        category=LanguageCategory.MOBILE,
        environment=ExecutionEnvironment.COMPILED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=True,
        can_execute=True,
        main_processor="swift_processor",
        alternative_processors=["swiftc_processor"],
        dependencies=["swift", "xcode"],
        tools=["swiftlint", "xcodebuild"],
        metadata={
            "version": "5.9+",
            "package_manager": "swiftpm",
            "uses": ["iOS", "macOS", "server"],
        },
    ),

    # ─── Ruby
    ".rb": FileExtension(
        extension=".rb",
        language="Ruby",
        category=LanguageCategory.SCRIPTING,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=True,
        main_processor="ruby_processor",
        alternative_processors=["jruby_processor"],
        dependencies=["ruby", "gem"],
        tools=["rspec", "rubocop", "ruby-lint"],
        metadata={
            "version": "3.0+",
            "package_manager": "gem",
            "framework_support": ["Rails", "Sinatra", "Hanami"],
        },
    ),

    # ─── PHP
    ".php": FileExtension(
        extension=".php",
        language="PHP",
        category=LanguageCategory.WEB,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=True,
        main_processor="php_processor",
        alternative_processors=["hhvm_processor"],
        dependencies=["php", "composer"],
        tools=["phpunit", "phpcs", "psalm"],
        metadata={
            "version": "8.2+",
            "package_manager": "composer",
            "framework_support": ["Laravel", "Symfony", "WordPress"],
        },
    ),

    # ─── Shell
    ".sh": FileExtension(
        extension=".sh",
        language="Shell",
        category=LanguageCategory.SHELL,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=True,
        main_processor="shell_processor",
        alternative_processors=["bash_processor", "zsh_processor"],
        dependencies=["bash", "sh"],
        tools=["shellcheck", "shfmt"],
        metadata={
            "version": "bash 4.0+",
            "uses": ["automation", "deployment", "system administration"],
        },
    ),

    ".bash": FileExtension(
        extension=".bash",
        language="Bash",
        category=LanguageCategory.SHELL,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=True,
        main_processor="bash_processor",
        alternative_processors=["shell_processor"],
        dependencies=["bash"],
        tools=["shellcheck", "shfmt"],
        metadata={
            "version": "bash 4.0+",
            "uses": ["automation", "deployment", "system administration"],
        },
    ),

    # ─── PowerShell
    ".ps1": FileExtension(
        extension=".ps1",
        language="PowerShell",
        category=LanguageCategory.SHELL,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=True,
        main_processor="powershell_processor",
        alternative_processors=[],
        dependencies=["powershell"],
        tools=["pester", "PSScriptAnalyzer"],
        metadata={
            "version": "7.0+",
            "uses": ["Windows automation", "system administration"],
        },
    ),

    # ─── HTML
    ".html": FileExtension(
        extension=".html",
        language="HTML",
        category=LanguageCategory.MARKUP,
        environment=ExecutionEnvironment.BROWSER,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="html_processor",
        alternative_processors=["pug_processor"],
        dependencies=[],
        tools=["prettier", "htmlhint"],
        metadata={
            "version": "HTML5",
            "uses": ["web pages", "email templates", "documentation"],
        },
    ),

    # ─── CSS
    ".css": FileExtension(
        extension=".css",
        language="CSS",
        category=LanguageCategory.WEB,
        environment=ExecutionEnvironment.BROWSER,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="css_processor",
        alternative_processors=["sass_processor", "less_processor"],
        dependencies=[],
        tools=["prettier", "stylelint"],
        metadata={
            "version": "CSS3+",
            "uses": ["web styling", "responsive design", "animations"],
        },
    ),

    # ─── JSON
    ".json": FileExtension(
        extension=".json",
        language="JSON",
        category=LanguageCategory.DATA,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="json_processor",
        alternative_processors=["json5_processor"],
        dependencies=[],
        tools=["jq", "jsonlint"],
        metadata={
            "uses": ["data serialization", "configuration", "API responses"],
        },
    ),

    # ─── YAML
    ".yaml": FileExtension(
        extension=".yaml",
        language="YAML",
        category=LanguageCategory.CONFIG,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="yaml_processor",
        alternative_processors=[],
        dependencies=[],
        tools=["yq", "yamllint"],
        metadata={
            "uses": ["configuration", "orchestration", "data serialization"],
        },
    ),

    ".yml": FileExtension(
        extension=".yml",
        language="YAML",
        category=LanguageCategory.CONFIG,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="yaml_processor",
        alternative_processors=[],
        dependencies=[],
        tools=["yq", "yamllint"],
        metadata={
            "uses": ["configuration", "orchestration", "data serialization"],
        },
    ),

    # ─── TOML
    ".toml": FileExtension(
        extension=".toml",
        language="TOML",
        category=LanguageCategory.CONFIG,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="toml_processor",
        alternative_processors=[],
        dependencies=[],
        tools=[],
        metadata={
            "uses": ["configuration", "package management"],
        },
    ),

    # ─── Markdown
    ".md": FileExtension(
        extension=".md",
        language="Markdown",
        category=LanguageCategory.DOCUMENTATION,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.LOW,
        requires_compilation=False,
        can_execute=False,
        main_processor="markdown_processor",
        alternative_processors=["commonmark_processor"],
        dependencies=[],
        tools=["prettier", "markdownlint"],
        metadata={
            "uses": ["documentation", "readmes", "technical writing"],
        },
    ),

    # ─── Text
    ".txt": FileExtension(
        extension=".txt",
        language="Text",
        category=LanguageCategory.DOCUMENTATION,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.LOW,
        requires_compilation=False,
        can_execute=False,
        main_processor="text_processor",
        alternative_processors=[],
        dependencies=[],
        tools=[],
        metadata={
            "uses": ["plain text", "logs", "notes"],
        },
    ),

    # ─── SQL
    ".sql": FileExtension(
        extension=".sql",
        language="SQL",
        category=LanguageCategory.QUERY,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="sql_processor",
        alternative_processors=[],
        dependencies=["database"],
        tools=["pgcli", "sqlfluff"],
        metadata={
            "versions": ["SQL:92", "SQL:99", "SQL:2003", "SQL:2011"],
            "databases": ["PostgreSQL", "MySQL", "SQLite", "Oracle"],
        },
    ),

    # ─── Quantum Computing
    ".qasm": FileExtension(
        extension=".qasm",
        language="QASM",
        category=LanguageCategory.QUANTUM,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=False,
        main_processor="qasm_processor",
        alternative_processors=["qiskit_processor"],
        dependencies=["qiskit", "qasm"],
        tools=["qiskit", "qasm3"],
        metadata={
            "version": "OpenQASM 3.0",
            "uses": ["quantum circuit description", "quantum hardware"],
        },
    ),

    ".quil": FileExtension(
        extension=".quil",
        language="Quil",
        category=LanguageCategory.QUANTUM,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=False,
        main_processor="quil_processor",
        alternative_processors=["pyquil_processor"],
        dependencies=["pyquil", "quil"],
        tools=["pyquil", "quil"],
        metadata={
            "version": "Quil 2.0",
            "uses": ["quantum instruction language", "Rigetti"],
        },
    ),

    ".qsharp": FileExtension(
        extension=".qsharp",
        language="Q#",
        category=LanguageCategory.QUANTUM,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=False,
        main_processor="qsharp_processor",
        alternative_processors=["azure_quantum_processor"],
        dependencies=["qsharp", "azure-quantum"],
        tools=["qsharp", "dotnet"],
        metadata={
            "version": "Q# 1.0",
            "uses": ["quantum programming", "Azure Quantum"],
        },
    ),

    ".qir": FileExtension(
        extension=".qir",
        language="QIR",
        category=LanguageCategory.QUANTUM,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=False,
        main_processor="qir_processor",
        alternative_processors=[],
        dependencies=["qir"],
        tools=["qir", "llvm"],
        metadata={
            "version": "QIR 1.0",
            "uses": ["quantum intermediate representation"],
        },
    ),

    # ─── AI/ML
    ".ipynb": FileExtension(
        extension=".ipynb",
        language="Jupyter Notebook",
        category=LanguageCategory.AI,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=True,
        main_processor="jupyter_processor",
        alternative_processors=["notebook_processor"],
        dependencies=["jupyter", "python"],
        tools=["jupyter", "nbconvert"],
        metadata={
            "uses": ["data science", "machine learning", "research", "visualization"],
        },
    ),

    ".pkl": FileExtension(
        extension=".pkl",
        language="Pickle",
        category=LanguageCategory.AI,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="pickle_processor",
        alternative_processors=[],
        dependencies=["python"],
        tools=[],
        metadata={
            "uses": ["model serialization", "object serialization", "python"],
        },
    ),

    ".h5": FileExtension(
        extension=".h5",
        language="HDF5",
        category=LanguageCategory.AI,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=False,
        can_execute=False,
        main_processor="hdf5_processor",
        alternative_processors=[],
        dependencies=["h5py", "tensorflow"],
        tools=["h5py", "h5dump"],
        metadata={
            "uses": ["model serialization", "large datasets", "Keras/TensorFlow"],
        },
    ),

    ".onnx": FileExtension(
        extension=".onnx",
        language="ONNX",
        category=LanguageCategory.AI,
        environment=ExecutionEnvironment.INTERPRETED,
        priority=ProcessingPriority.HIGH,
        requires_compilation=False,
        can_execute=False,
        main_processor="onnx_processor",
        alternative_processors=["onnxruntime_processor"],
        dependencies=["onnx", "onnxruntime"],
        tools=["onnx", "onnxruntime"],
        metadata={
            "uses": ["model exchange", "AI model serialization", "interoperability"],
        },
    ),

    # ─── Blockchain
    ".sol": FileExtension(
        extension=".sol",
        language="Solidity",
        category=LanguageCategory.BLOCKCHAIN,
        environment=ExecutionEnvironment.VIRTUAL_MACHINE,
        priority=ProcessingPriority.HIGH,
        requires_compilation=True,
        can_execute=False,
        main_processor="solidity_processor",
        alternative_processors=["solc_processor"],
        dependencies=["solc", "ethereum"],
        tools=["solc", "hardhat", "truffle"],
        metadata={
            "version": "0.8.0+",
            "uses": ["smart contracts", "Ethereum", "EVM"],
            "package_manager": "npm",
        },
    ),

    ".vy": FileExtension(
        extension=".vy",
        language="Vyper",
        category=LanguageCategory.BLOCKCHAIN,
        environment=ExecutionEnvironment.VIRTUAL_MACHINE,
        priority=ProcessingPriority.MEDIUM,
        requires_compilation=True,
        can_execute=False,
        main_processor="vyper_processor",
        alternative_processors=["vyper_compiler"],
        dependencies=["vyper", "ethereum"],
        tools=["vyper", "brownie"],
        metadata={
            "version": "0.3.0+",
            "uses": ["smart contracts", "Ethereum", "EVM"],
        },
    ),
}


# ─── Extension Set Convenience Functions ──────────────────────

def get_extensions_by_category(category: LanguageCategory) -> List[str]:
    """Get all file extensions for a category."""
    return [
        ext
        for ext, info in EXTENSION_REGISTRY.items()
        if info.category == category
    ]


def get_extensions_by_language(language: str) -> List[str]:
    """Get all file extensions for a language."""
    return [
        ext
        for ext, info in EXTENSION_REGISTRY.items()
        if info.language.lower() == language.lower()
    ]


def get_extension_info(extension: str) -> Optional[FileExtension]:
    """Get file extension information."""
    return EXTENSION_REGISTRY.get(extension.lower())


def get_all_extensions() -> List[str]:
    """Get all registered file extensions."""
    return list(EXTENSION_REGISTRY.keys())


def get_all_languages() -> List[str]:
    """Get all registered languages."""
    return sorted({info.language for info in EXTENSION_REGISTRY.values()})


def get_processor_for_extension(extension: str) -> Optional[str]:
    """Get the main processor for a file extension."""
    info = get_extension_info(extension)
    return info.main_processor if info else None


def get_dependencies_for_extension(extension: str) -> List[str]:
    """Get dependencies for a file extension."""
    info = get_extension_info(extension)
    return info.dependencies if info else []
