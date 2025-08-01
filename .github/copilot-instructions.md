# Pull Request Security Review Instructions

For every pull request, review all changed PHP and JavaScript files for security, code quality, and compatibility.

## Checklist for Review

## PHP Files

- **Target Version**: PHP 8.3
- **Target Framework**: Magento 2.4.7
- **Check for basic errors and issues:**
  - Flag syntax errors, missing semicolons, unmatched braces, or incomplete statements.
  - Identify undefined variables, functions, or classes.
  - Detect unused variables, unreachable code, and logic errors.
- **Compatibility:**
  - Flag use of deprecated or removed PHP functions, features, or syntax.
  - Ensure code is compatible with the project’s minimum supported PHP version.
- **Coding standards:**
  - Flag violations of PSR-1/PSR-12 or project-specific coding guidelines.
  - Check for proper indentation, naming conventions, and clear comments.
- **PHP Performance:**
  - Analyze PHP code and point out common performance anti-patterns, such as N+1 queries, inefficient loops, unnecessary object instantiation, or excessive memory usage.
  - Suggest improvements based on best practices, such as optimizing database queries, using caching, and reducing computational complexity.
- **Dangerous Functions:**  
  - Watch for use of `eval`, `base64_decode`, `system`, `shell_exec`, `exec`, `passthru`, `assert`, `create_function`, `preg_replace` with `/e` modifier.
- **Obfuscation:**  
  - Look for encoded strings (base64, rot13, gzuncompress), dynamic function calls, variable variables, or unreadable/minified blobs.
- **Suspicious I/O:**  
  - Flag unexpected file or network operations, especially with hardcoded external endpoints.
- **Security Bypass:**  
  - Check for code that disables authentication, authorization, or logging, or weakens input validation.

## JavaScript Files

- **Dangerous Patterns:**  
  - Flag use of `eval`, `Function` constructor, `setTimeout`/`setInterval` with string arguments, and dynamic script loading.
- **Obfuscation:**  
  - Search for unreadable variable names, large encoded/minified strings, or hex/base64 blobs run through decoders.
- **Network/Data Exfiltration:**  
  - Identify unexpected HTTP requests, WebSocket connections, or code sending data to external domains.
- **DOM Manipulation:**  
  - Watch for suspicious or unnecessary DOM changes, particularly those introducing hidden elements or scripts.

## General Checklist

- **Flag hardcoded secrets or credentials.**
- **Any code that disables security or logging.**
- **Any code that is unclear, disguised, or seems unnecessary.**

---

**If in doubt, request clarification**
*Maintaining security, code quality, and compatibility is everyone’s responsibility!*
